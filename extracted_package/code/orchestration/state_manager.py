"""
Gestor de estado y persistencia
Maneja el almacenamiento y recuperación de datos del sistema de coordinación
"""

import asyncio
import json
import sqlite3
import pickle
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dataclasses import asdict
from pathlib import Path
import threading
from contextlib import contextmanager

from loguru import logger
import yaml

class StateManager:
    """Gestor de estado y persistencia del sistema"""
    
    def __init__(self, db_path: str = "data/orchestration_state.db", config_path: str = "config/state_config.yaml"):
        self.db_path = db_path
        self.config_path = config_path
        
        # Base de datos
        self.db_connection = None
        self.db_lock = threading.RLock()
        
        # Caché en memoria
        self.memory_cache: Dict[str, Any] = {}
        self.cache_ttl: Dict[str, datetime] = {}
        self.cache_enabled = True
        self.cache_ttl_seconds = 300  # 5 minutos
        
        # Configuración
        self.config = {}
        
        # Métricas
        self.stats = {
            "db_operations": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "saved_states": 0,
            "loaded_states": 0,
            "failed_operations": 0
        }

    async def initialize(self):
        """Inicializa el gestor de estado"""
        try:
            logger.info("Inicializando State Manager...")
            
            # Crear directorios necesarios
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            Path(self.config_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Cargar configuración
            await self._load_config()
            
            # Inicializar base de datos
            await self._initialize_database()
            
            # Iniciar tareas de mantenimiento
            asyncio.create_task(self._maintenance_loop())
            
            logger.info("State Manager inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando State Manager: {e}")
            raise

    async def _load_config(self):
        """Carga la configuración del gestor de estado"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f)
        except FileNotFoundError:
            logger.warning(f"Archivo de configuración no encontrado: {self.config_path}")
            self.config = self._get_default_config()
        except Exception as e:
            logger.error(f"Error cargando configuración: {e}")
            self.config = self._get_default_config()

    def _get_default_config(self) -> Dict:
        """Configuración por defecto"""
        return {
            "database": {
                "backup_enabled": True,
                "backup_interval_hours": 6,
                "max_backup_files": 10,
                "compression_enabled": False
            },
            "cache": {
                "enabled": True,
                "max_size_mb": 100,
                "ttl_seconds": 300,
                "cleanup_interval_minutes": 10
            },
            "persistence": {
                "auto_save_interval_seconds": 60,
                "batch_operations": True,
                "batch_size": 100
            }
        }

    @contextmanager
    def get_db_connection(self):
        """Context manager para conexiones a la base de datos"""
        with self.db_lock:
            if self.db_connection is None:
                self.db_connection = sqlite3.connect(
                    self.db_path,
                    check_same_thread=False,
                    timeout=30.0
                )
                # Habilitar foreign keys
                self.db_connection.execute("PRAGMA foreign_keys = ON")
            
            try:
                yield self.db_connection
            except Exception as e:
                self.db_connection.rollback()
                raise e

    async def _initialize_database(self):
        """Inicializa la estructura de la base de datos"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # Tabla de agentes
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS agents (
                        agent_id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        agent_type TEXT NOT NULL,
                        model TEXT NOT NULL,
                        status TEXT NOT NULL,
                        configuration TEXT,
                        metrics TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Tabla de workflows
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS workflows (
                        workflow_id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        workflow_type TEXT NOT NULL,
                        status TEXT NOT NULL,
                        current_step TEXT,
                        context TEXT,
                        results TEXT,
                        agents TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        completed_at TIMESTAMP
                    )
                """)
                
                # Tabla de tareas
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS tasks (
                        task_id TEXT PRIMARY KEY,
                        workflow_id TEXT,
                        agent_id TEXT,
                        task_type TEXT NOT NULL,
                        status TEXT NOT NULL,
                        payload TEXT,
                        result TEXT,
                        priority INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        started_at TIMESTAMP,
                        completed_at TIMESTAMP,
                        error TEXT,
                        FOREIGN KEY (workflow_id) REFERENCES workflows (workflow_id),
                        FOREIGN KEY (agent_id) REFERENCES agents (agent_id)
                    )
                """)
                
                # Tabla de mensajes/interacciones
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS messages (
                        message_id TEXT PRIMARY KEY,
                        source_agent TEXT,
                        target_agent TEXT,
                        workflow_id TEXT,
                        message_type TEXT NOT NULL,
                        content TEXT NOT NULL,
                        metadata TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (source_agent) REFERENCES agents (agent_id),
                        FOREIGN KEY (target_agent) REFERENCES agents (agent_id),
                        FOREIGN KEY (workflow_id) REFERENCES workflows (workflow_id)
                    )
                """)
                
                # Tabla de sistema (métricas, configuraciones globales)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS system_state (
                        key TEXT PRIMARY KEY,
                        value TEXT,
                        data_type TEXT DEFAULT 'json',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Índices para mejorar rendimiento
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_system_key ON system_state(key)")
                
                conn.commit()
                
            logger.info("Base de datos inicializada correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
            raise

    # Operaciones de agentes
    async def save_agent_state(self, agent_id: str, agent_state: Union[Dict, Any]):
        """Guarda el estado de un agente"""
        try:
            if isinstance(agent_state, dict):
                state_data = agent_state
            else:
                state_data = asdict(agent_state) if hasattr(agent_state, '__dict__') else str(agent_state)
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO agents 
                    (agent_id, name, agent_type, model, status, configuration, metrics, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    agent_id,
                    state_data.get('name', ''),
                    state_data.get('agent_type', ''),
                    state_data.get('model', ''),
                    state_data.get('status', ''),
                    json.dumps(state_data.get('config', {})),
                    json.dumps(state_data.get('metrics', {}))
                ))
                
                conn.commit()
            
            # Actualizar caché
            if self.cache_enabled:
                self.memory_cache[f"agent_{agent_id}"] = state_data
                self.cache_ttl[f"agent_{agent_id}"] = datetime.now() + timedelta(seconds=self.cache_ttl_seconds)
            
            self.stats["saved_states"] += 1
            self.stats["db_operations"] += 1
            
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error guardando estado del agente {agent_id}: {e}")
            raise

    async def load_agent_state(self, agent_id: str) -> Optional[Dict]:
        """Carga el estado de un agente"""
        # Verificar caché primero
        cache_key = f"agent_{agent_id}"
        if self.cache_enabled and cache_key in self.memory_cache:
            if cache_key not in self.cache_ttl or datetime.now() < self.cache_ttl[cache_key]:
                self.stats["cache_hits"] += 1
                return self.memory_cache[cache_key]
            else:
                self.stats["cache_misses"] += 1
        
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT agent_id, name, agent_type, model, status, configuration, metrics
                    FROM agents WHERE agent_id = ?
                """, (agent_id,))
                
                row = cursor.fetchone()
                
                if row:
                    agent_state = {
                        'agent_id': row[0],
                        'name': row[1],
                        'agent_type': row[2],
                        'model': row[3],
                        'status': row[4],
                        'config': json.loads(row[5]) if row[5] else {},
                        'metrics': json.loads(row[6]) if row[6] else {}
                    }
                    
                    # Actualizar caché
                    if self.cache_enabled:
                        self.memory_cache[cache_key] = agent_state
                        self.cache_ttl[cache_key] = datetime.now() + timedelta(seconds=self.cache_ttl_seconds)
                    
                    self.stats["loaded_states"] += 1
                    self.stats["db_operations"] += 1
                    
                    return agent_state
                    
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error cargando estado del agente {agent_id}: {e}")
        
        return None

    async def get_all_agents(self) -> List[Dict]:
        """Obtiene todos los agentes registrados"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT agent_id, name, agent_type, model, status, configuration, metrics
                    FROM agents ORDER BY created_at DESC
                """)
                
                agents = []
                for row in cursor.fetchall():
                    agent_state = {
                        'agent_id': row[0],
                        'name': row[1],
                        'agent_type': row[2],
                        'model': row[3],
                        'status': row[4],
                        'config': json.loads(row[5]) if row[5] else {},
                        'metrics': json.loads(row[6]) if row[6] else {}
                    }
                    agents.append(agent_state)
                
                return agents
                
        except Exception as e:
            logger.error(f"Error obteniendo todos los agentes: {e}")
            return []

    # Operaciones de workflows
    async def save_workflow_state(self, workflow_id: str, workflow_state: Union[Dict, Any]):
        """Guarda el estado de un workflow"""
        try:
            if isinstance(workflow_state, dict):
                state_data = workflow_state
            else:
                state_data = asdict(workflow_state) if hasattr(workflow_state, '__dict__') else str(workflow_state)
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO workflows 
                    (workflow_id, name, workflow_type, status, current_step, context, results, agents, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    workflow_id,
                    state_data.get('name', ''),
                    state_data.get('workflow_type', 'unknown'),
                    state_data.get('status', ''),
                    state_data.get('current_step', ''),
                    json.dumps(state_data.get('context', {})),
                    json.dumps(state_data.get('results', {})),
                    json.dumps(state_data.get('agents', []))
                ))
                
                conn.commit()
            
            # Actualizar caché
            if self.cache_enabled:
                self.memory_cache[f"workflow_{workflow_id}"] = state_data
                self.cache_ttl[f"workflow_{workflow_id}"] = datetime.now() + timedelta(seconds=self.cache_ttl_seconds)
            
            self.stats["saved_states"] += 1
            self.stats["db_operations"] += 1
            
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error guardando estado del workflow {workflow_id}: {e}")
            raise

    async def load_workflow_state(self, workflow_id: str) -> Optional[Dict]:
        """Carga el estado de un workflow"""
        # Verificar caché
        cache_key = f"workflow_{workflow_id}"
        if self.cache_enabled and cache_key in self.memory_cache:
            if cache_key not in self.cache_ttl or datetime.now() < self.cache_ttl[cache_key]:
                self.stats["cache_hits"] += 1
                return self.memory_cache[cache_key]
            else:
                self.stats["cache_misses"] += 1
        
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT workflow_id, name, workflow_type, status, current_step, context, results, agents
                    FROM workflows WHERE workflow_id = ?
                """, (workflow_id,))
                
                row = cursor.fetchone()
                
                if row:
                    workflow_state = {
                        'workflow_id': row[0],
                        'name': row[1],
                        'workflow_type': row[2],
                        'status': row[3],
                        'current_step': row[4],
                        'context': json.loads(row[5]) if row[5] else {},
                        'results': json.loads(row[6]) if row[6] else {},
                        'agents': json.loads(row[7]) if row[7] else []
                    }
                    
                    # Actualizar caché
                    if self.cache_enabled:
                        self.memory_cache[cache_key] = workflow_state
                        self.cache_ttl[cache_key] = datetime.now() + timedelta(seconds=self.cache_ttl_seconds)
                    
                    self.stats["loaded_states"] += 1
                    self.stats["db_operations"] += 1
                    
                    return workflow_state
                    
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error cargando estado del workflow {workflow_id}: {e}")
        
        return None

    async def get_workflows_by_status(self, status: str) -> List[Dict]:
        """Obtiene workflows por estado"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT workflow_id, name, workflow_type, status, current_step, context, results, agents
                    FROM workflows WHERE status = ? ORDER BY created_at DESC
                """, (status,))
                
                workflows = []
                for row in cursor.fetchall():
                    workflow_state = {
                        'workflow_id': row[0],
                        'name': row[1],
                        'workflow_type': row[2],
                        'status': row[3],
                        'current_step': row[4],
                        'context': json.loads(row[5]) if row[5] else {},
                        'results': json.loads(row[6]) if row[6] else {},
                        'agents': json.loads(row[7]) if row[7] else []
                    }
                    workflows.append(workflow_state)
                
                return workflows
                
        except Exception as e:
            logger.error(f"Error obteniendo workflows por estado {status}: {e}")
            return []

    # Operaciones de tareas
    async def save_task_state(self, task_id: str, task_state: Union[Dict, Any]):
        """Guarda el estado de una tarea"""
        try:
            if isinstance(task_state, dict):
                state_data = task_state
            else:
                state_data = asdict(task_state) if hasattr(task_state, '__dict__') else str(task_state)
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO tasks 
                    (task_id, workflow_id, agent_id, task_type, status, payload, result, priority, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    task_id,
                    state_data.get('workflow_id'),
                    state_data.get('agent_id'),
                    state_data.get('task_type', ''),
                    state_data.get('status', ''),
                    json.dumps(state_data.get('payload', {})),
                    json.dumps(state_data.get('result', {})),
                    state_data.get('priority', 0)
                ))
                
                conn.commit()
            
            self.stats["saved_states"] += 1
            self.stats["db_operations"] += 1
            
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error guardando estado de la tarea {task_id}: {e}")
            raise

    async def load_task_state(self, task_id: str) -> Optional[Dict]:
        """Carga el estado de una tarea"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT task_id, workflow_id, agent_id, task_type, status, payload, result, priority
                    FROM tasks WHERE task_id = ?
                """, (task_id,))
                
                row = cursor.fetchone()
                
                if row:
                    task_state = {
                        'task_id': row[0],
                        'workflow_id': row[1],
                        'agent_id': row[2],
                        'task_type': row[3],
                        'status': row[4],
                        'payload': json.loads(row[5]) if row[5] else {},
                        'result': json.loads(row[6]) if row[6] else {},
                        'priority': row[7]
                    }
                    
                    self.stats["loaded_states"] += 1
                    self.stats["db_operations"] += 1
                    
                    return task_state
                    
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error cargando estado de la tarea {task_id}: {e}")
        
        return None

    # Operaciones de mensajes
    async def save_message(self, source_agent: str, target_agent: str, message_type: str, 
                          content: str, workflow_id: str = None, metadata: Dict = None):
        """Guarda un mensaje entre agentes"""
        try:
            message_id = f"msg_{datetime.now().timestamp()}_{hash(content) % 10000}"
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT INTO messages 
                    (message_id, source_agent, target_agent, workflow_id, message_type, content, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    message_id,
                    source_agent,
                    target_agent,
                    workflow_id,
                    message_type,
                    content,
                    json.dumps(metadata or {})
                ))
                
                conn.commit()
            
            self.stats["db_operations"] += 1
            
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error guardando mensaje: {e}")
            raise

    async def get_messages_between_agents(self, source_agent: str, target_agent: str, 
                                        limit: int = 100) -> List[Dict]:
        """Obtiene mensajes entre dos agentes"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT message_id, source_agent, target_agent, workflow_id, message_type, content, metadata, timestamp
                    FROM messages 
                    WHERE source_agent = ? AND target_agent = ?
                    ORDER BY timestamp DESC LIMIT ?
                """, (source_agent, target_agent, limit))
                
                messages = []
                for row in cursor.fetchall():
                    message = {
                        'message_id': row[0],
                        'source_agent': row[1],
                        'target_agent': row[2],
                        'workflow_id': row[3],
                        'message_type': row[4],
                        'content': row[5],
                        'metadata': json.loads(row[6]) if row[6] else {},
                        'timestamp': row[7]
                    }
                    messages.append(message)
                
                return messages
                
        except Exception as e:
            logger.error(f"Error obteniendo mensajes entre {source_agent} y {target_agent}: {e}")
            return []

    # Operaciones del sistema
    async def save_system_state(self, key: str, value: Any, data_type: str = 'json'):
        """Guarda estado global del sistema"""
        try:
            if data_type == 'json':
                serialized_value = json.dumps(value) if not isinstance(value, str) else value
            else:
                serialized_value = str(value)
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO system_state (key, value, data_type, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                """, (key, serialized_value, data_type))
                
                conn.commit()
            
            # Actualizar caché
            if self.cache_enabled:
                self.memory_cache[f"system_{key}"] = value
                self.cache_ttl[f"system_{key}"] = datetime.now() + timedelta(seconds=self.cache_ttl_seconds)
            
            self.stats["db_operations"] += 1
            
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error guardando estado del sistema {key}: {e}")
            raise

    async def load_system_state(self, key: str, default: Any = None) -> Any:
        """Carga estado global del sistema"""
        # Verificar caché
        cache_key = f"system_{key}"
        if self.cache_enabled and cache_key in self.memory_cache:
            if cache_key not in self.cache_ttl or datetime.now() < self.cache_ttl[cache_key]:
                self.stats["cache_hits"] += 1
                return self.memory_cache[cache_key]
            else:
                self.stats["cache_misses"] += 1
        
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT value, data_type FROM system_state WHERE key = ?
                """, (key,))
                
                row = cursor.fetchone()
                
                if row:
                    value, data_type = row
                    
                    if data_type == 'json':
                        try:
                            result = json.loads(value)
                        except json.JSONDecodeError:
                            result = value
                    else:
                        result = value
                    
                    # Actualizar caché
                    if self.cache_enabled:
                        self.memory_cache[cache_key] = result
                        self.cache_ttl[cache_key] = datetime.now() + timedelta(seconds=self.cache_ttl_seconds)
                    
                    self.stats["db_operations"] += 1
                    
                    return result
                    
        except Exception as e:
            self.stats["failed_operations"] += 1
            logger.error(f"Error cargando estado del sistema {key}: {e}")
        
        return default

    async def save_system_metrics(self, metrics: Dict):
        """Guarda métricas del sistema"""
        await self.save_system_state("metrics", metrics)

    async def load_system_metrics(self) -> Dict:
        """Carga métricas del sistema"""
        return await self.load_system_state("metrics", {})

    # Operaciones de limpieza y mantenimiento
    async def _maintenance_loop(self):
        """Loop de mantenimiento del gestor de estado"""
        while True:
            try:
                await self._cleanup_cache()
                await self._cleanup_old_data()
                await self._backup_database()
                
                await asyncio.sleep(3600)  # Cada hora
                
            except Exception as e:
                logger.error(f"Error en loop de mantenimiento: {e}")
                await asyncio.sleep(1800)  # Esperar 30 minutos en caso de error

    async def _cleanup_cache(self):
        """Limpia entradas expiradas del caché"""
        if not self.cache_enabled:
            return
        
        current_time = datetime.now()
        expired_keys = [
            key for key, expiry in self.cache_ttl.items()
            if current_time >= expiry
        ]
        
        for key in expired_keys:
            self.memory_cache.pop(key, None)
            self.cache_ttl.pop(key, None)
        
        if expired_keys:
            logger.debug(f"Limpiadas {len(expired_keys)} entradas del caché")

    async def _cleanup_old_data(self):
        """Limpia datos antiguos (tareas completadas hace más de 7 días)"""
        try:
            cutoff_date = datetime.now() - timedelta(days=7)
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # Limpiar tareas completadas antiguas
                cursor.execute("""
                    DELETE FROM tasks 
                    WHERE status IN ('completed', 'failed', 'cancelled') 
                    AND completed_at < ?
                """, (cutoff_date,))
                
                deleted_tasks = cursor.rowcount
                
                # Limpiar workflows completados antiguos
                cursor.execute("""
                    DELETE FROM workflows 
                    WHERE status = 'completed' 
                    AND completed_at < ?
                """, (cutoff_date,))
                
                deleted_workflows = cursor.rowcount
                
                conn.commit()
            
            logger.info(f"Limpieza completada: {deleted_tasks} tareas y {deleted_workflows} workflows eliminados")
            
        except Exception as e:
            logger.error(f"Error en limpieza de datos antiguos: {e}")

    async def _backup_database(self):
        """Crea una copia de seguridad de la base de datos"""
        try:
            backup_enabled = self.config.get("database", {}).get("backup_enabled", True)
            
            if not backup_enabled:
                return
            
            backup_dir = Path(self.db_path).parent / "backups"
            backup_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = backup_dir / f"orchestration_backup_{timestamp}.db"
            
            with self.get_db_connection() as source:
                backup_conn = sqlite3.connect(str(backup_path))
                source.backup(backup_conn)
                backup_conn.close()
            
            # Limpiar backups antiguos
            await self._cleanup_old_backups(backup_dir)
            
            logger.info(f"Backup creado en {backup_path}")
            
        except Exception as e:
            logger.error(f"Error creando backup: {e}")

    async def _cleanup_old_backups(self, backup_dir: Path):
        """Limpia backups antiguos"""
        try:
            max_backups = self.config.get("database", {}).get("max_backup_files", 10)
            
            backup_files = list(backup_dir.glob("orchestration_backup_*.db"))
            backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            for backup_file in backup_files[max_backups:]:
                backup_file.unlink()
                logger.debug(f"Backup antiguo eliminado: {backup_file}")
                
        except Exception as e:
            logger.error(f"Error limpiando backups antiguos: {e}")

    # Consultas y reportes
    async def get_system_health(self) -> Dict:
        """Obtiene un reporte de salud del sistema"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # Contar registros por tabla
                cursor.execute("SELECT COUNT(*) FROM agents")
                agent_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM workflows")
                workflow_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM tasks")
                task_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM messages")
                message_count = cursor.fetchone()[0]
                
                # Obtener tamaño de la base de datos
                db_size = Path(self.db_path).stat().st_size if Path(self.db_path).exists() else 0
            
            return {
                "database_size_bytes": db_size,
                "record_counts": {
                    "agents": agent_count,
                    "workflows": workflow_count,
                    "tasks": task_count,
                    "messages": message_count
                },
                "cache_stats": {
                    "enabled": self.cache_enabled,
                    "entries": len(self.memory_cache),
                    "hits": self.stats["cache_hits"],
                    "misses": self.stats["cache_misses"]
                },
                "operation_stats": self.stats.copy(),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo salud del sistema: {e}")
            return {"error": str(e)}

    async def shutdown(self):
        """Cierra el gestor de estado"""
        logger.info("Cerrando State Manager...")
        
        # Cerrar conexión a la base de datos
        if self.db_connection:
            self.db_connection.close()
            self.db_connection = None
        
        # Limpiar caché
        self.memory_cache.clear()
        self.cache_ttl.clear()
        
        logger.info("State Manager cerrado")

    async def clear_all_data(self):
        """Limpia todos los datos (para testing o reset)"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("DELETE FROM messages")
                cursor.execute("DELETE FROM tasks")
                cursor.execute("DELETE FROM workflows")
                cursor.execute("DELETE FROM agents")
                cursor.execute("DELETE FROM system_state")
                
                conn.commit()
            
            # Limpiar caché
            self.memory_cache.clear()
            self.cache_ttl.clear()
            
            logger.warning("Todos los datos han sido eliminados")
            
        except Exception as e:
            logger.error(f"Error limpiando todos los datos: {e}")
            raise
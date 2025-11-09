"""
Gestor de agentes para el sistema de coordinación
Maneja la creación, configuración y ciclo de vida de agentes
"""

import asyncio
import json
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor

from loguru import logger
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from task_queue import TaskQueue, TaskPriority
from state_manager import StateManager

class AgentType(Enum):
    COORDINATOR = "coordinator"
    ANALYZER = "analyzer"
    GENERATOR = "generator"
    CODE_EXECUTOR = "code_executor"
    RESEARCHER = "researcher"
    CUSTOM = "custom"

class AgentStatus(Enum):
    IDLE = "idle"
    BUSY = "busy"
    TRAINING = "training"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

@dataclass
class AgentConfig:
    """Configuración de un agente"""
    agent_id: str
    name: str
    agent_type: AgentType
    model: str
    system_prompt: str
    skills: List[str]
    capabilities: List[str]
    max_concurrent_tasks: int = 3
    timeout: int = 300
    retry_attempts: int = 3
    memory_enabled: bool = True
    learning_enabled: bool = False
    custom_config: Dict[str, Any] = None

@dataclass
class AgentMetrics:
    """Métricas de rendimiento de un agente"""
    total_tasks: int = 0
    successful_tasks: int = 0
    failed_tasks: int = 0
    average_execution_time: float = 0.0
    total_execution_time: float = 0.0
    last_activity: Optional[datetime] = None
    uptime: float = 0.0
    memory_usage: float = 0.0
    cpu_usage: float = 0.0

@dataclass
class AgentMemory:
    """Memoria del agente para conversaciones y contexto"""
    conversation_history: List[Dict] = None
    learned_patterns: Dict[str, Any] = None
    context_cache: Dict[str, Any] = None
    last_updated: datetime = None

    def __post_init__(self):
        if self.conversation_history is None:
            self.conversation_history = []
        if self.learned_patterns is None:
            self.learned_patterns = {}
        if self.context_cache is None:
            self.context_cache = {}
        if self.last_updated is None:
            self.last_updated = datetime.now()

class Agent:
    """Representa un agente individual en el sistema"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.status = AgentStatus.IDLE
        self.metrics = AgentMetrics()
        self.memory = AgentMemory()
        
        # Modelo LLM
        self.llm_model = None
        self.current_tasks = []
        self.task_handlers = {}
        
        # Control de concurrencia
        self.active_tasks = 0
        self.task_semaphore = None
        
        # Callbacks
        self.on_task_start = None
        self.on_task_complete = None
        self.on_error = None
        
        # Inicialización
        self.start_time = datetime.now()

    async def initialize(self, ollama_manager):
        """Inicializa el agente"""
        try:
            # Configurar semaforo para control de concurrencia
            self.task_semaphore = asyncio.Semaphore(self.config.max_concurrent_tasks)
            
            # Inicializar modelo LLM
            await self._initialize_model(ollama_manager)
            
            # Registrar handlers de tareas
            self._register_task_handlers()
            
            # Configurar callbacks por defecto
            self._setup_default_callbacks()
            
            logger.info(f"Agente {self.config.agent_id} inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando agente {self.config.agent_id}: {e}")
            raise

    async def _initialize_model(self, ollama_manager):
        """Inicializa el modelo LLM del agente"""
        try:
            # Instalar modelo si es necesario
            await ollama_manager.install_model(self.config.model)
            
            # Crear instancia del modelo
            self.llm_model = ChatOllama(
                model=self.config.model,
                base_url=ollama_manager.base_url,
                temperature=0.7
            )
            
        except Exception as e:
            logger.error(f"Error inicializando modelo {self.config.model} para agente {self.config.agent_id}: {e}")
            raise

    def _register_task_handlers(self):
        """Registra handlers de tareas según el tipo de agente"""
        if self.config.agent_type == AgentType.COORDINATOR:
            self.task_handlers.update({
                "coordinate_workflow": self._handle_coordinate_workflow,
                "plan_task": self._handle_plan_task,
                "monitor_agents": self._handle_monitor_agents
            })
        elif self.config.agent_type == AgentType.ANALYZER:
            self.task_handlers.update({
                "analyze_data": self._handle_analyze_data,
                "extract_info": self._handle_extract_info,
                "generate_insights": self._handle_generate_insights
            })
        elif self.config.agent_type == AgentType.GENERATOR:
            self.task_handlers.update({
                "generate_content": self._handle_generate_content,
                "create_document": self._handle_create_document,
                "synthesize_info": self._handle_synthesize_info
            })
        elif self.config.agent_type == AgentType.CODE_EXECUTOR:
            self.task_handlers.update({
                "generate_code": self._handle_generate_code,
                "debug_code": self._handle_debug_code,
                "optimize_code": self._handle_optimize_code,
                "review_code": self._handle_review_code
            })
        elif self.config.agent_type == AgentType.RESEARCHER:
            self.task_handlers.update({
                "research_topic": self._handle_research_topic,
                "find_sources": self._handle_find_sources,
                "synthesize_research": self._handle_synthesize_research
            })

    def _setup_default_callbacks(self):
        """Configura callbacks por defecto"""
        self.on_task_start = lambda task_id, task_data: logger.info(
            f"Agente {self.config.agent_id} iniciando tarea {task_id}"
        )
        
        self.on_task_complete = lambda task_id, result: logger.info(
            f"Agente {self.config.agent_id} completó tarea {task_id}"
        )
        
        self.on_error = lambda task_id, error: logger.error(
            f"Error en agente {self.config.agent_id}, tarea {task_id}: {error}"
        )

    async def execute_task(self, task_id: str, task_type: str, task_data: Any) -> Dict:
        """Ejecuta una tarea específica"""
        async with self.task_semaphore:
            try:
                self.status = AgentStatus.BUSY
                self.active_tasks += 1
                
                # Actualizar métricas
                self.metrics.total_tasks += 1
                self.metrics.last_activity = datetime.now()
                
                # Notificar inicio de tarea
                if self.on_task_start:
                    await self._safe_callback(self.on_task_start, task_id, task_data)
                
                # Ejecutar tarea
                start_time = datetime.now()
                
                if task_type in self.task_handlers:
                    result = await self.task_handlers[task_type](task_data)
                else:
                    result = await self._handle_generic_task(task_type, task_data)
                
                # Actualizar métricas de tiempo
                execution_time = (datetime.now() - start_time).total_seconds()
                self._update_timing_metrics(execution_time)
                
                # Actualizar memoria
                self._update_memory(task_id, task_type, task_data, result)
                
                # Notificar finalización
                if self.on_task_complete:
                    await self._safe_callback(self.on_task_complete, task_id, result)
                
                self.metrics.successful_tasks += 1
                
                return {
                    "success": True,
                    "result": result,
                    "agent_id": self.config.agent_id,
                    "task_id": task_id,
                    "execution_time": execution_time,
                    "timestamp": datetime.now().isoformat()
                }
                
            except Exception as e:
                self.metrics.failed_tasks += 1
                error_msg = f"Error ejecutando tarea {task_type}: {str(e)}"
                logger.error(f"Agente {self.config.agent_id}: {error_msg}")
                
                if self.on_error:
                    await self._safe_callback(self.on_error, task_id, str(e))
                
                return {
                    "success": False,
                    "error": error_msg,
                    "agent_id": self.config.agent_id,
                    "task_id": task_id,
                    "timestamp": datetime.now().isoformat()
                }
                
            finally:
                self.status = AgentStatus.IDLE
                self.active_tasks -= 1

    async def _safe_callback(self, callback: Callable, *args):
        """Ejecuta un callback de forma segura"""
        try:
            if asyncio.iscoroutinefunction(callback):
                await callback(*args)
            else:
                callback(*args)
        except Exception as e:
            logger.error(f"Error ejecutando callback: {e}")

    def _update_timing_metrics(self, execution_time: float):
        """Actualiza métricas de tiempo"""
        self.metrics.total_execution_time += execution_time
        
        if self.metrics.total_tasks > 0:
            self.metrics.average_execution_time = (
                self.metrics.total_execution_time / self.metrics.total_tasks
            )

    def _update_memory(self, task_id: str, task_type: str, task_data: Any, result: Any):
        """Actualiza la memoria del agente"""
        try:
            # Agregar a historial de conversación
            conversation_entry = {
                "task_id": task_id,
                "task_type": task_type,
                "task_data": task_data,
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
            
            self.memory.conversation_history.append(conversation_entry)
            
            # Mantener solo los últimos 100 elementos
            if len(self.memory.conversation_history) > 100:
                self.memory.conversation_history.pop(0)
            
            self.memory.last_updated = datetime.now()
            
        except Exception as e:
            logger.error(f"Error actualizando memoria del agente {self.config.agent_id}: {e}")

    # Handlers específicos por tipo de agente
    async def _handle_coordinate_workflow(self, workflow_data: Dict) -> Dict:
        """Maneja coordinación de workflows"""
        system_msg = SystemMessage(content=self.config.system_prompt)
        user_msg = HumanMessage(content=f"Coordinar el siguiente workflow: {workflow_data}")
        
        response = await self.llm_model.ainvoke([system_msg, user_msg])
        
        return {
            "type": "workflow_coordination",
            "plan": response.content,
            "agents_assigned": workflow_data.get("agents", []),
            "estimated_duration": "30 minutos"
        }

    async def _handle_plan_task(self, task_data: Dict) -> Dict:
        """Maneja planificación de tareas"""
        return {
            "type": "task_planning",
            "steps": ["Análisis", "Ejecución", "Validación"],
            "estimated_time": "15 minutos",
            "resources_needed": ["CPU", "Memoria"]
        }

    async def _handle_monitor_agents(self, monitoring_data: Dict) -> Dict:
        """Maneja monitoreo de agentes"""
        return {
            "type": "agent_monitoring",
            "agents_status": "Todos los agentes operativos",
            "system_health": "Buen estado",
            "recommendations": ["Optimizar carga de trabajo"]
        }

    async def _handle_analyze_data(self, data: Dict) -> Dict:
        """Maneja análisis de datos"""
        system_msg = SystemMessage(content=self.config.system_prompt)
        user_msg = HumanMessage(content=f"Analizar los siguientes datos: {data}")
        
        response = await self.llm_model.ainvoke([system_msg, user_msg])
        
        return {
            "type": "data_analysis",
            "insights": response.content,
            "confidence": 0.85,
            "recommendations": ["Continuar monitoreo"]
        }

    async def _handle_extract_info(self, extraction_data: Dict) -> Dict:
        """Maneja extracción de información"""
        return {
            "type": "info_extraction",
            "extracted_info": ["Punto clave 1", "Punto clave 2"],
            "confidence": 0.90,
            "sources": extraction_data.get("sources", [])
        }

    async def _handle_generate_insights(self, insight_data: Dict) -> Dict:
        """Maneja generación de insights"""
        return {
            "type": "insights_generation",
            "insights": ["Insight importante 1", "Insight importante 2"],
            "action_items": ["Acción sugerida 1"],
            "priority": "Alta"
        }

    async def _handle_generate_content(self, content_data: Dict) -> Dict:
        """Maneja generación de contenido"""
        system_msg = SystemMessage(content=self.config.system_prompt)
        user_msg = HumanMessage(content=f"Generar contenido: {content_data}")
        
        response = await self.llm_model.ainvoke([system_msg, user_msg])
        
        return {
            "type": "content_generation",
            "content": response.content,
            "word_count": len(response.content.split()),
            "quality_score": 0.88
        }

    async def _handle_create_document(self, document_data: Dict) -> Dict:
        """Maneja creación de documentos"""
        return {
            "type": "document_creation",
            "document_type": document_data.get("type", "markdown"),
            "sections": ["Introducción", "Desarrollo", "Conclusión"],
            "estimated_pages": 5
        }

    async def _handle_synthesize_info(self, synthesis_data: Dict) -> Dict:
        """Maneja síntesis de información"""
        return {
            "type": "info_synthesis",
            "synthesis": "Resumen consolidado de la información",
            "key_points": ["Punto 1", "Punto 2"],
            "confidence": 0.92
        }

    async def _handle_generate_code(self, code_data: Dict) -> Dict:
        """Maneja generación de código"""
        system_msg = SystemMessage(content=self.config.system_prompt)
        user_msg = HumanMessage(content=f"Generar código: {code_data}")
        
        response = await self.llm_model.ainvoke([system_msg, user_msg])
        
        return {
            "type": "code_generation",
            "code": response.content,
            "language": code_data.get("language", "python"),
            "lines_of_code": len(response.content.split('\n')),
            "complexity": "Media"
        }

    async def _handle_debug_code(self, debug_data: Dict) -> Dict:
        """Maneja depuración de código"""
        return {
            "type": "code_debugging",
            "issues_found": 2,
            "suggestions": ["Corregir sintaxis en línea 15", "Optimizar función en línea 23"],
            "fixed_code": "# Código corregido aquí"
        }

    async def _handle_optimize_code(self, optimization_data: Dict) -> Dict:
        """Maneja optimización de código"""
        return {
            "type": "code_optimization",
            "performance_gain": "30%",
            "optimizations_applied": ["Eliminación de loops innecesarios", "Cache de resultados"],
            "optimized_code": "# Código optimizado aquí"
        }

    async def _handle_review_code(self, review_data: Dict) -> Dict:
        """Maneja revisión de código"""
        return {
            "type": "code_review",
            "quality_score": 7.5,
            "issues": ["Mejorar documentación"],
            "suggestions": ["Agregar tests unitarios"],
            "overall_rating": "Bueno"
        }

    async def _handle_research_topic(self, research_data: Dict) -> Dict:
        """Maneja investigación de temas"""
        return {
            "type": "topic_research",
            "findings": ["Hallazgo 1", "Hallazgo 2"],
            "confidence": 0.87,
            "sources": 5
        }

    async def _handle_find_sources(self, source_data: Dict) -> Dict:
        """Maneja búsqueda de fuentes"""
        return {
            "type": "source_finding",
            "sources_found": 8,
            "relevant_sources": 6,
            "quality_scores": [0.9, 0.8, 0.85]
        }

    async def _handle_synthesize_research(self, synthesis_data: Dict) -> Dict:
        """Maneja síntesis de investigación"""
        return {
            "type": "research_synthesis",
            "synthesis": "Resumen consolidado de la investigación",
            "key_findings": ["Hallazgo clave 1", "Hallazgo clave 2"],
            "gaps_identified": ["Área no cubierta 1"]
        }

    async def _handle_generic_task(self, task_type: str, task_data: Any) -> Dict:
        """Maneja tareas genéricas usando el modelo LLM"""
        system_msg = SystemMessage(content=self.config.system_prompt)
        user_msg = HumanMessage(content=f"Ejecutar tarea: {task_type}\nDatos: {task_data}")
        
        response = await self.llm_model.ainvoke([system_msg, user_msg])
        
        return {
            "type": "generic_task",
            "task_type": task_type,
            "result": response.content,
            "agent_capabilities": self.config.capabilities
        }

    def get_status(self) -> Dict:
        """Obtiene el estado actual del agente"""
        uptime = (datetime.now() - self.start_time).total_seconds()
        
        return {
            "agent_id": self.config.agent_id,
            "name": self.config.name,
            "type": self.config.agent_type.value,
            "status": self.status.value,
            "model": self.config.model,
            "active_tasks": self.active_tasks,
            "max_concurrent_tasks": self.config.max_concurrent_tasks,
            "uptime_seconds": uptime,
            "metrics": asdict(self.metrics),
            "last_activity": self.metrics.last_activity.isoformat() if self.metrics.last_activity else None
        }

    async def shutdown(self):
        """Cierra el agente de forma segura"""
        logger.info(f"Cerrando agente {self.config.agent_id}...")
        
        # Esperar a que terminen las tareas activas
        while self.active_tasks > 0:
            await asyncio.sleep(1)
        
        self.status = AgentStatus.OFFLINE
        
        # Limpiar recursos
        if hasattr(self, 'llm_model'):
            self.llm_model = None
        
        logger.info(f"Agente {self.config.agent_id} cerrado")

class AgentManager:
    """Gestor principal de agentes"""
    
    def __init__(self, coordinator, ollama_manager, task_queue: TaskQueue, state_manager: StateManager):
        self.coordinator = coordinator
        self.ollama_manager = ollama_manager
        self.task_queue = task_queue
        self.state_manager = state_manager
        
        # Registro de agentes
        self.agents: Dict[str, Agent] = {}
        self.agent_configs: Dict[str, AgentConfig] = {}
        
        # Plantillas de configuración
        self.agent_templates = self._load_agent_templates()
        
        # Métricas del sistema
        self.system_metrics = {
            "total_agents": 0,
            "active_agents": 0,
            "idle_agents": 0,
            "busy_agents": 0,
            "failed_agents": 0
        }
        
        # Control de ejecución
        self.running = False

    def _load_agent_templates(self) -> Dict[str, Dict]:
        """Carga plantillas de configuración de agentes"""
        return {
            "coordinator": {
                "name": "Coordinador Principal",
                "agent_type": AgentType.COORDINATOR,
                "model": "llama3.1:8b",
                "system_prompt": "Eres un coordinador inteligente que gestiona workflows y asigna tareas a otros agentes.",
                "skills": ["coordinacion", "planificacion", "monitorizacion", "decision_making"],
                "capabilities": ["workflow_planning", "agent_monitoring", "task_coordination"],
                "max_concurrent_tasks": 5
            },
            "analyzer": {
                "name": "Analizador de Datos",
                "agent_type": AgentType.ANALYZER,
                "model": "mistral:7b",
                "system_prompt": "Eres un especialista en análisis de datos y extracción de información.",
                "skills": ["analisis", "extraccion", "estadistica"],
                "capabilities": ["data_analysis", "pattern_recognition", "insight_generation"],
                "max_concurrent_tasks": 3
            },
            "generator": {
                "name": "Generador de Contenido",
                "agent_type": AgentType.GENERATOR,
                "model": "llama3.1:8b",
                "system_prompt": "Eres un especialista en generación de contenido y síntesis de información.",
                "skills": ["escritura", "creacion", "sintesis"],
                "capabilities": ["content_generation", "document_creation", "information_synthesis"],
                "max_concurrent_tasks": 3
            },
            "code_executor": {
                "name": "Ejecutor de Código",
                "agent_type": AgentType.CODE_EXECUTOR,
                "model": "codellama:7b",
                "system_prompt": "Eres un especialista en programación, generación y depuración de código.",
                "skills": ["programacion", "debugging", "optimizacion"],
                "capabilities": ["code_generation", "code_review", "debugging", "optimization"],
                "max_concurrent_tasks": 2
            },
            "researcher": {
                "name": "Investigador",
                "agent_type": AgentType.RESEARCHER,
                "model": "mistral:7b",
                "system_prompt": "Eres un investigador especializado en búsqueda y síntesis de información.",
                "skills": ["investigacion", "busqueda", "analisis"],
                "capabilities": ["topic_research", "source_finding", "research_synthesis"],
                "max_concurrent_tasks": 2
            }
        }

    async def initialize(self):
        """Inicializa el gestor de agentes"""
        try:
            logger.info("Inicializando Agent Manager...")
            
            # Crear agentes por defecto
            await self._create_default_agents()
            
            # Configurar listeners de tareas
            self._setup_task_listeners()
            
            # Iniciar monitoreo de agentes
            self.running = True
            asyncio.create_task(self._monitor_agents())
            
            logger.info("Agent Manager inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando Agent Manager: {e}")
            raise

    async def _create_default_agents(self):
        """Crea los agentes por defecto del sistema"""
        default_agents = ["coordinator", "analyzer", "generator", "code_executor", "researcher"]
        
        for agent_type in default_agents:
            await self.create_agent(agent_type, f"{agent_type}_001")

    async def create_agent(self, agent_type: str, agent_id: str = None, custom_config: Dict = None) -> str:
        """Crea un nuevo agente"""
        try:
            # Generar ID si no se proporciona
            if agent_id is None:
                agent_id = f"{agent_type}_{len(self.agents) + 1:03d}"
            
            # Obtener plantilla
            if agent_type not in self.agent_templates:
                raise ValueError(f"Tipo de agente no soportado: {agent_type}")
            
            template = self.agent_templates[agent_type].copy()
            
            # Aplicar configuración personalizada
            if custom_config:
                template.update(custom_config)
            
            # Crear configuración del agente
            config = AgentConfig(
                agent_id=agent_id,
                name=template["name"],
                agent_type=AgentType(template["agent_type"]),
                model=template["model"],
                system_prompt=template["system_prompt"],
                skills=template["skills"],
                capabilities=template["capabilities"],
                max_concurrent_tasks=template.get("max_concurrent_tasks", 3),
                custom_config=custom_config or {}
            )
            
            # Crear e inicializar agente
            agent = Agent(config)
            await agent.initialize(self.ollama_manager)
            
            # Registrar agente
            self.agents[agent_id] = agent
            self.agent_configs[agent_id] = config
            
            # Actualizar métricas del sistema
            self.system_metrics["total_agents"] += 1
            self.system_metrics["active_agents"] += 1
            
            logger.info(f"Agente {agent_id} creado exitosamente")
            return agent_id
            
        except Exception as e:
            logger.error(f"Error creando agente {agent_id}: {e}")
            raise

    def _setup_task_listeners(self):
        """Configura listeners para tareas de agentes"""
        self.task_queue.add_task_listener("agent_task", self._handle_agent_task)

    async def _handle_agent_task(self, task):
        """Maneja tareas dirigidas a agentes específicos"""
        try:
            agent_id = task.get("agent_id")
            task_type = task.get("task_type")
            task_data = task.get("task_data")
            task_id = task.get("task_id")
            
            if agent_id not in self.agents:
                logger.warning(f"Agente {agent_id} no encontrado")
                return
            
            agent = self.agents[agent_id]
            
            # Verificar si el agente puede aceptar más tareas
            if agent.active_tasks >= agent.config.max_concurrent_tasks:
                logger.warning(f"Agente {agent_id} sobrecargado, reintentando más tarde...")
                return
            
            # Ejecutar tarea
            result = await agent.execute_task(task_id, task_type, task_data)
            
            # Enviar resultado
            await self.task_queue.submit_result(task_id, result)
            
        except Exception as e:
            logger.error(f"Error manejando tarea de agente: {e}")

    async def _monitor_agents(self):
        """Monitorea el estado de los agentes"""
        while self.running:
            try:
                await self._update_agent_metrics()
                await self._check_agent_health()
                await self._cleanup_inactive_agents()
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error en monitoreo de agentes: {e}")
                await asyncio.sleep(60)

    async def _update_agent_metrics(self):
        """Actualiza métricas del sistema de agentes"""
        active = idle = busy = failed = 0
        
        for agent in self.agents.values():
            if agent.status == AgentStatus.IDLE:
                idle += 1
            elif agent.status == AgentStatus.BUSY:
                busy += 1
            elif agent.status == AgentStatus.OFFLINE:
                failed += 1
            else:
                active += 1
        
        self.system_metrics.update({
            "active_agents": active,
            "idle_agents": idle,
            "busy_agents": busy,
            "failed_agents": failed,
            "total_tasks": sum(agent.metrics.total_tasks for agent in self.agents.values())
        })

    async def _check_agent_health(self):
        """Verifica la salud de los agentes"""
        current_time = datetime.now()
        
        for agent_id, agent in list(self.agents.items()):
            # Verificar si un agente está inactivo por mucho tiempo
            if agent.metrics.last_activity:
                idle_time = (current_time - agent.metrics.last_activity).total_seconds()
                
                # Si un agente ha estado inactivo por más de 1 hora, marcarlo como offline
                if idle_time > 3600 and agent.status == AgentStatus.IDLE:
                    agent.status = AgentStatus.OFFLINE
                    logger.warning(f"Agente {agent_id} marcado como offline por inactividad")

    async def _cleanup_inactive_agents(self):
        """Limpia agentes inactivos (opcional)"""
        # Esta función puede implementarse para eliminar agentes que han estado
        # offline por mucho tiempo, según las políticas del sistema

    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Obtiene un agente por ID"""
        return self.agents.get(agent_id)

    async def get_agents_by_type(self, agent_type: AgentType) -> List[Agent]:
        """Obtiene todos los agentes de un tipo específico"""
        return [agent for agent in self.agents.values() if agent.config.agent_type == agent_type]

    async def get_system_status(self) -> Dict:
        """Obtiene el estado del sistema de agentes"""
        return {
            "system_metrics": self.system_metrics,
            "agents": {agent_id: agent.get_status() for agent_id, agent in self.agents.items()},
            "agent_types": {
                agent_type.value: len(await self.get_agents_by_type(agent_type))
                for agent_type in AgentType
            }
        }

    async def shutdown(self):
        """Cierra el gestor de agentes"""
        logger.info("Cerrando Agent Manager...")
        
        self.running = False
        
        # Cerrar todos los agentes
        for agent in self.agents.values():
            await agent.shutdown()
        
        self.agents.clear()
        self.agent_configs.clear()
        
        logger.info("Agent Manager cerrado")
"""
Sistema de colas de trabajo para coordinación de agentes
Maneja la distribución y ejecución de tareas entre agentes
"""

import asyncio
import json
import uuid
import time
from typing import Dict, List, Optional, Callable, Any, AsyncGenerator
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from concurrent.futures import ThreadPoolExecutor
import heapq
import threading

from loguru import logger

class TaskPriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(Enum):
    WORKFLOW_EXECUTION = "workflow_execution"
    AGENT_TASK = "agent_task"
    SYSTEM_MONITORING = "system_monitoring"
    MAINTENANCE = "maintenance"

@dataclass
class Task:
    """Representa una tarea en el sistema"""
    task_id: str
    task_type: TaskType
    priority: TaskPriority
    agent_id: Optional[str]
    workflow_id: Optional[str]
    payload: Dict[str, Any]
    status: TaskStatus
    created_at: datetime
    scheduled_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Dict] = None
    error: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    dependencies: List[str] = None
    metadata: Dict[str, Any] = None

@dataclass
class TaskResult:
    """Resultado de una tarea ejecutada"""
    task_id: str
    success: bool
    result: Optional[Dict] = None
    error: Optional[str] = None
    execution_time: float = 0.0
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class TaskQueue:
    def __init__(self, max_workers: int = 10, queue_size: int = 1000):
        self.max_workers = max_workers
        self.queue_size = queue_size
        self.active_tasks: Dict[str, Task] = {}
        self.task_heap: List[tuple] = []  # (priority, scheduled_time, task_id)
        self.completed_tasks: Dict[str, Task] = {}
        self.task_history: List[Task] = []
        
        # Workers y ejecutores
        self.workers: Dict[str, threading.Thread] = {}
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        
        # Callbacks y listeners
        self.task_listeners: Dict[str, List[Callable]] = {}
        self.task_callbacks: Dict[str, Callable] = {}
        
        # Estadísticas
        self.stats = {
            "total_tasks": 0,
            "completed_tasks": 0,
            "failed_tasks": 0,
            "average_execution_time": 0.0,
            "queue_depth": 0,
            "active_workers": 0
        }
        
        # Control de ejecución
        self.running = False
        self.task_processor_task = None
        self.monitoring_task = None
        
        # Lock para thread safety
        self.lock = threading.RLock()

    async def initialize(self):
        """Inicializa el sistema de colas"""
        try:
            logger.info("Inicializando Task Queue...")
            
            # Inicializar workers
            for i in range(self.max_workers):
                worker_id = f"worker_{i}"
                thread = threading.Thread(
                    target=self._worker_loop,
                    args=(worker_id,),
                    daemon=True
                )
                self.workers[worker_id] = thread
                thread.start()
            
            # Iniciar procesamiento de tareas
            self.running = True
            self.task_processor_task = asyncio.create_task(self._process_tasks())
            self.monitoring_task = asyncio.create_task(self._monitor_queue())
            
            logger.info(f"Task Queue inicializado con {self.max_workers} workers")
            
        except Exception as e:
            logger.error(f"Error inicializando Task Queue: {e}")
            raise

    def _worker_loop(self, worker_id: str):
        """Loop principal de un worker"""
        logger.info(f"Worker {worker_id} iniciado")
        
        while self.running:
            try:
                # Intentar obtener una tarea
                task = self._get_next_task()
                
                if task:
                    self._execute_task(worker_id, task)
                else:
                    time.sleep(0.1)  # Esperar un poco antes de revisar nuevamente
                    
            except Exception as e:
                logger.error(f"Error en worker {worker_id}: {e}")
                time.sleep(1)

    def _get_next_task(self) -> Optional[Task]:
        """Obtiene la siguiente tarea de la cola"""
        with self.lock:
            current_time = datetime.now()
            
            # Limpiar tareas completadas de la cola
            while self.task_heap and (self.task_heap[0][2] not in self.active_tasks or
                                    self.active_tasks[self.task_heap[0][2]].status != TaskStatus.PENDING):
                heapq.heappop(self.task_heap)
            
            # Verificar si hay tareas disponibles
            if not self.task_heap:
                return None
            
            # Obtener la tarea con mayor prioridad y tiempo
            _, _, task_id = self.task_heap[0]
            
            if task_id in self.active_tasks:
                task = self.active_tasks[task_id]
                
                # Verificar si es hora de ejecutar la tarea
                if task.scheduled_at <= current_time:
                    heapq.heappop(self.task_heap)
                    return task
            
            return None

    def _execute_task(self, worker_id: str, task: Task):
        """Ejecuta una tarea"""
        try:
            # Actualizar estado de la tarea
            task.status = TaskStatus.RUNNING
            task.started_at = datetime.now()
            
            with self.lock:
                self.stats["active_workers"] += 1
            
            logger.info(f"Worker {worker_id} ejecutando tarea {task.task_id}")
            
            # Ejecutar la tarea según su tipo
            result = asyncio.run(self._execute_task_by_type(task))
            
            # Actualizar estado y resultado
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now()
            task.result = result
            
            with self.lock:
                self.stats["completed_tasks"] += 1
                self._update_execution_stats(task)
            
            # Notificar listeners
            self._notify_task_listeners(task, "completed")
            
            logger.info(f"Tarea {task.task_id} completada exitosamente")
            
        except Exception as e:
            # Manejar errores
            self._handle_task_error(task, e)
            
        finally:
            # Limpiar y mover a historial
            with self.lock:
                self.stats["active_workers"] -= 1
                
                # Mover a historial
                self.task_history.append(task)
                if len(self.task_history) > 1000:  # Mantener solo los últimos 1000
                    self.task_history.pop(0)

    async def _execute_task_by_type(self, task: Task) -> Dict:
        """Ejecuta una tarea según su tipo"""
        try:
            if task.task_type == TaskType.WORKFLOW_EXECUTION:
                return await self._execute_workflow_task(task)
            elif task.task_type == TaskType.AGENT_TASK:
                return await self._execute_agent_task(task)
            elif task.task_type == TaskType.SYSTEM_MONITORING:
                return await self._execute_monitoring_task(task)
            elif task.task_type == TaskType.MAINTENANCE:
                return await self._execute_maintenance_task(task)
            else:
                raise ValueError(f"Tipo de tarea desconocido: {task.task_type}")
                
        except Exception as e:
            logger.error(f"Error ejecutando tarea {task.task_id}: {e}")
            raise

    async def _execute_workflow_task(self, task: Task) -> Dict:
        """Ejecuta una tarea de workflow"""
        workflow_config = task.payload
        
        return {
            "type": "workflow_result",
            "workflow_id": task.workflow_id,
            "task_id": task.task_id,
            "result": "Workflow execution completed",
            "timestamp": datetime.now().isoformat()
        }

    async def _execute_agent_task(self, task: Task) -> Dict:
        """Ejecuta una tarea de agente"""
        agent_config = task.payload
        
        return {
            "type": "agent_result",
            "agent_id": task.agent_id,
            "task_id": task.task_id,
            "result": "Agent task completed",
            "timestamp": datetime.now().isoformat()
        }

    async def _execute_monitoring_task(self, task: Task) -> Dict:
        """Ejecuta una tarea de monitoreo"""
        monitoring_config = task.payload
        
        return {
            "type": "monitoring_result",
            "task_id": task.task_id,
            "result": "Monitoring completed",
            "timestamp": datetime.now().isoformat()
        }

    async def _execute_maintenance_task(self, task: Task) -> Dict:
        """Ejecuta una tarea de mantenimiento"""
        maintenance_config = task.payload
        
        return {
            "type": "maintenance_result",
            "task_id": task.task_id,
            "result": "Maintenance completed",
            "timestamp": datetime.now().isoformat()
        }

    def _handle_task_error(self, task: Task, error: Exception):
        """Maneja errores en la ejecución de tareas"""
        task.retry_count += 1
        
        if task.retry_count <= task.max_retries:
            # Reintentar la tarea
            task.status = TaskStatus.PENDING
            task.scheduled_at = datetime.now() + timedelta(seconds=2 ** task.retry_count)
            
            with self.lock:
                heapq.heappush(self.task_heap, (
                    task.priority.value,
                    task.scheduled_at,
                    task.task_id
                ))
            
            logger.warning(f"Tarea {task.task_id} reintentada ({task.retry_count}/{task.max_retries})")
        else:
            # Marcar como fallida
            task.status = TaskStatus.FAILED
            task.error = str(error)
            
            with self.lock:
                self.stats["failed_tasks"] += 1
            
            logger.error(f"Tarea {task.task_id} falló después de {task.retry_count} intentos: {error}")
        
        # Notificar listeners
        self._notify_task_listeners(task, "failed")

    def _update_execution_stats(self, task: Task):
        """Actualiza estadísticas de ejecución"""
        if task.started_at and task.completed_at:
            execution_time = (task.completed_at - task.started_at).total_seconds()
            
            # Calcular promedio móvil
            total_completed = self.stats["completed_tasks"]
            if total_completed == 1:
                self.stats["average_execution_time"] = execution_time
            else:
                current_avg = self.stats["average_execution_time"]
                self.stats["average_execution_time"] = (
                    (current_avg * (total_completed - 1) + execution_time) / total_completed
                )

    async def _monitor_queue(self):
        """Monitorea el estado de la cola"""
        while self.running:
            try:
                with self.lock:
                    self.stats["queue_depth"] = len(self.task_heap)
                    self.stats["total_tasks"] = len(self.active_tasks) + len(self.completed_tasks)
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error en monitoreo de cola: {e}")
                await asyncio.sleep(30)

    async def _process_tasks(self):
        """Procesa tareas en modo asíncrono"""
        while self.running:
            try:
                # Procesar callbacks pendientes
                await self._process_callbacks()
                
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error en procesamiento de tareas: {e}")
                await asyncio.sleep(1)

    async def _process_callbacks(self):
        """Procesa callbacks pendientes"""
        callbacks_to_process = []
        
        with self.lock:
            for task_id, callback in list(self.task_callbacks.items()):
                if task_id in self.active_tasks:
                    task = self.active_tasks[task_id]
                    if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
                        callbacks_to_process.append((task_id, callback))
        
        for task_id, callback in callbacks_to_process:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(task_id, self.active_tasks.get(task_id))
                else:
                    callback(task_id, self.active_tasks.get(task_id))
            except Exception as e:
                logger.error(f"Error ejecutando callback para {task_id}: {e}")
            
            # Remover callback procesado
            with self.lock:
                self.task_callbacks.pop(task_id, None)

    async def submit_task(self, 
                         task_type: TaskType,
                         payload: Dict,
                         agent_id: str = None,
                         workflow_id: str = None,
                         priority: TaskPriority = TaskPriority.NORMAL,
                         scheduled_at: datetime = None,
                         max_retries: int = 3,
                         dependencies: List[str] = None,
                         metadata: Dict = None) -> str:
        """Envía una nueva tarea a la cola"""
        
        # Generar ID único
        task_id = str(uuid.uuid4())
        
        # Configurar tiempo de ejecución
        if scheduled_at is None:
            scheduled_at = datetime.now()
        
        # Crear tarea
        task = Task(
            task_id=task_id,
            task_type=task_type,
            priority=priority,
            agent_id=agent_id,
            workflow_id=workflow_id,
            payload=payload,
            status=TaskStatus.PENDING,
            created_at=datetime.now(),
            scheduled_at=scheduled_at,
            max_retries=max_retries,
            dependencies=dependencies or [],
            metadata=metadata or {}
        )
        
        # Agregar a cola activa
        with self.lock:
            self.active_tasks[task_id] = task
            
            # Agregar a heap de prioridades
            heapq.heappush(self.task_heap, (
                priority.value,
                scheduled_at,
                task_id
            ))
        
        logger.info(f"Tarea {task_id} agregada a la cola")
        return task_id

    async def submit_workflow(self, workflow_config: Dict, priority: TaskPriority = TaskPriority.NORMAL) -> str:
        """Envía un workflow a la cola"""
        return await self.submit_task(
            task_type=TaskType.WORKFLOW_EXECUTION,
            payload=workflow_config,
            workflow_id=workflow_config.get("workflow_id"),
            priority=priority
        )

    async def submit_agent_task(self, 
                               agent_id: str,
                               task_data: Dict,
                               priority: TaskPriority = TaskPriority.NORMAL) -> str:
        """Envía una tarea a un agente específico"""
        return await self.submit_task(
            task_type=TaskType.AGENT_TASK,
            payload=task_data,
            agent_id=agent_id,
            priority=priority
        )

    async def schedule_task(self, 
                           task_type: TaskType,
                           payload: Dict,
                           run_at: datetime,
                           **kwargs) -> str:
        """Programa una tarea para ejecutarse en un momento específico"""
        return await self.submit_task(
            task_type=task_type,
            payload=payload,
            scheduled_at=run_at,
            **kwargs
        )

    def add_task_listener(self, event: str, callback: Callable):
        """Agrega un listener para eventos de tareas"""
        if event not in self.task_listeners:
            self.task_listeners[event] = []
        
        self.task_listeners[event].append(callback)

    def _notify_task_listeners(self, task: Task, event: str):
        """Notifica a los listeners sobre eventos de tareas"""
        if event in self.task_listeners:
            for callback in self.task_listeners[event]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        asyncio.create_task(callback(task))
                    else:
                        callback(task)
                except Exception as e:
                    logger.error(f"Error notificando listener: {e}")

    async def get_task_status(self, task_id: str) -> Optional[Dict]:
        """Obtiene el estado de una tarea"""
        with self.lock:
            task = self.active_tasks.get(task_id) or self.completed_tasks.get(task_id)
            if task:
                return asdict(task)
        return None

    async def cancel_task(self, task_id: str) -> bool:
        """Cancela una tarea pendiente"""
        with self.lock:
            if task_id in self.active_tasks:
                task = self.active_tasks[task_id]
                if task.status == TaskStatus.PENDING:
                    task.status = TaskStatus.CANCELLED
                    
                    # Remover del heap
                    self.task_heap = [(p, t, tid) for p, t, tid in self.task_heap if tid != task_id]
                    heapq.heapify(self.task_heap)
                    
                    logger.info(f"Tarea {task_id} cancelada")
                    return True
                    
        return False

    async def get_queue_status(self) -> Dict:
        """Obtiene el estado de la cola"""
        with self.lock:
            return {
                "active_tasks": len(self.active_tasks),
                "queue_depth": len(self.task_heap),
                "completed_tasks": len(self.completed_tasks),
                "active_workers": len([t for t in self.workers.values() if t.is_alive()]),
                "stats": self.stats,
                "task_types": {
                    task_type.value: len([t for t in self.active_tasks.values() if t.task_type == task_type])
                    for task_type in TaskType
                }
            }

    async def clear_completed_tasks(self, older_than_hours: int = 24):
        """Limpia tareas completadas antiguas"""
        cutoff_time = datetime.now() - timedelta(hours=older_than_hours)
        
        with self.lock:
            tasks_to_remove = []
            
            for task_id, task in self.completed_tasks.items():
                if task.completed_at and task.completed_at < cutoff_time:
                    tasks_to_remove.append(task_id)
            
            for task_id in tasks_to_remove:
                del self.completed_tasks[task_id]
            
            logger.info(f"Limpiadas {len(tasks_to_remove)} tareas completadas")

    async def submit_result(self, task_id: str, result: Dict):
        """Envía el resultado de una tarea"""
        with self.lock:
            if task_id in self.active_tasks:
                task = self.active_tasks[task_id]
                task.result = result
                task.status = TaskStatus.COMPLETED
                task.completed_at = datetime.now()
                
                # Mover a completadas
                self.completed_tasks[task_id] = task
                del self.active_tasks[task_id]
                
                logger.info(f"Resultado enviado para tarea {task_id}")

    async def start_listener(self, callback: Callable):
        """Inicia un listener de tareas"""
        self.add_task_listener("completed", callback)
        self.add_task_listener("failed", callback)

    async def shutdown(self):
        """Cierra el sistema de colas"""
        logger.info("Cerrando Task Queue...")
        
        self.running = False
        
        # Cancelar tareas pendientes
        with self.lock:
            for task in self.active_tasks.values():
                if task.status == TaskStatus.PENDING:
                    task.status = TaskStatus.CANCELLED
        
        # Esperar a que terminen los workers
        for worker_thread in self.workers.values():
            worker_thread.join(timeout=5)
        
        # Cerrar executor
        self.executor.shutdown(wait=True)
        
        # Cancelar tareas de monitoreo
        if self.task_processor_task:
            self.task_processor_task.cancel()
        if self.monitoring_task:
            self.monitoring_task.cancel()
        
        logger.info("Task Queue cerrado")
"""
Integración del Agente Selector de Técnica 2D-3D con el Sistema de Orquestación
===============================================================================

Este módulo proporciona la integración completa entre el Agente Selector de Técnica
y el sistema de orquestación existente (AgentManager, TaskQueue, etc.).

Características:
- Registro automático en AgentManager
- Manejo de tareas desde TaskQueue
- Coordinación con otros agentes del sistema
- Monitoreo integrado con el sistema principal
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from pathlib import Path

from loguru import logger

# Importaciones del agente selector
from .selector_tecnica_agent import (
    SelectorTecnicaAgent,
    MetodoProcesamiento,
    FactoresEvaluacion,
    DecisionTecnica
)

# Importaciones del sistema de orquestación
try:
    from agent_manager import Agent, AgentConfig, AgentType
    from task_queue import TaskQueue, TaskPriority, TaskType
    ORCHESTRATION_AVAILABLE = True
except ImportError:
    logger.warning("Sistema de orquestación no disponible, usando implementación standalone")
    ORCHESTRATION_AVAILABLE = False


class IntegracionOrquestacion:
    """Maneja la integración con el sistema de orquestación"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path
        self.agente_selector = None
        self.agent_manager = None
        self.task_queue = None
        self.integrado = False
        
        # Configuración de integración
        self.config_integracion = {
            "agent_id": "selector_tecnica_003",
            "agent_name": "Selector de Técnica 2D-3D",
            "agent_type": "CUSTOM",
            "model": "llama3.1:8b",
            "max_concurrent_tasks": 3,
            "timeout": 300,
            "retry_attempts": 3,
            "skills": [
                "evaluacion_factores",
                "seleccion_tecnica",
                "monitoreo_recursos",
                "gestion_colas",
                "fallback_automatico"
            ],
            "capabilities": [
                "decision_automatica",
                "optimizacion_recursos",
                "procesamiento_2d_3d",
                "analisis_calidad",
                "gestion_costos"
            ],
            "specialization": "procesamiento_2d_3d",
            "priority_weight": 0.8
        }
    
    async def inicializar_integracion(self, 
                                    agent_manager, 
                                    task_queue: TaskQueue,
                                    custom_config: Optional[Dict] = None) -> bool:
        """
        Inicializa la integración completa con el sistema de orquestación
        
        Args:
            agent_manager: Instancia del AgentManager
            task_queue: Instancia del TaskQueue
            custom_config: Configuración personalizada
            
        Returns:
            bool: True si la integración fue exitosa
        """
        
        try:
            self.agent_manager = agent_manager
            self.task_queue = task_queue
            
            # Aplicar configuración personalizada
            if custom_config:
                self.config_integracion.update(custom_config)
            
            # 1. Crear y registrar agente selector
            await self._crear_agente_selector()
            
            # 2. Registrar en AgentManager
            await self._registrar_en_agent_manager()
            
            # 3. Configurar listeners de tareas
            self._configurar_listeners_tareas()
            
            # 4. Iniciar monitoreo de integración
            asyncio.create_task(self._monitoreo_integracion())
            
            self.integrado = True
            
            logger.info("Integración con sistema de orquestación completada exitosamente")
            return True
            
        except Exception as e:
            logger.error(f"Error inicializando integración: {e}")
            return False
    
    async def _crear_agente_selector(self):
        """Crea la instancia del agente selector"""
        
        config_agente = {
            "max_concurrencia": self.config_integracion["max_concurrent_tasks"],
            "timeout_default": self.config_integracion["timeout"],
            "reintentos_fallback": self.config_integracion["retry_attempts"],
            "config_path": self.config_path,
            "integracion_orquestacion": True,
            "agent_manager": self.agent_manager,
            "task_queue": self.task_queue
        }
        
        self.agente_selector = SelectorTecnicaAgent(config_agente)
        await self.agente_selector.inicializar(self.task_queue)
        
        logger.info("Agente Selector de Técnica creado e inicializado")
    
    async def _registrar_en_agent_manager(self):
        """Registra el agente en el AgentManager"""
        
        if not ORCHESTRATION_AVAILABLE:
            logger.warning("Sistema de orquestación no disponible, saltando registro")
            return
        
        # Crear configuración del agente para AgentManager
        agent_config = AgentConfig(
            agent_id=self.config_integracion["agent_id"],
            name=self.config_integracion["agent_name"],
            agent_type=AgentType.CUSTOM,
            model=self.config_integracion["model"],
            system_prompt=self._generar_system_prompt(),
            skills=self.config_integracion["skills"],
            capabilities=self.config_integracion["capabilities"],
            max_concurrent_tasks=self.config_integracion["max_concurrent_tasks"],
            timeout=self.config_integracion["timeout"],
            retry_attempts=self.config_integracion["retry_attempts"],
            custom_config={
                "specialization": self.config_integracion["specialization"],
                "priority_weight": self.config_integracion["priority_weight"]
            }
        )
        
        # Crear agente en AgentManager
        agent_id = await self.agent_manager.create_agent(
            agent_type="custom",
            agent_id=self.config_integracion["agent_id"],
            custom_config=agent_config.__dict__
        )
        
        logger.info(f"Agente registrado en AgentManager con ID: {agent_id}")
    
    def _generar_system_prompt(self) -> str:
        """Genera el system prompt para el agente selector"""
        
        return f"""
        Eres {self.config_integracion['agent_name']}, un agente especializado en selección inteligente de técnicas de procesamiento 2D a 3D.
        
        Tu función principal es:
        1. Evaluar factores técnicos, de recursos y de negocio
        2. Seleccionar automáticamente entre COLMAP local, OpenRouter API, o método híbrido
        3. Gestionar colas de procesamiento optimizadas
        4. Implementar fallback automático entre métodos
        5. Monitorear uso de recursos (CPU, RAM, tiempo)
        6. Optimizar para 4 vCPUs y 8GB RAM
        
        Factores de evaluación:
        - Número de imágenes y calidad
        - Complejidad del objeto 3D
        - Recursos disponibles del servidor (CPU, RAM, disco)
        - Presupuesto y limitaciones de tiempo
        - Prioridad del trabajo
        
        Métodos disponibles:
        1. COLMAP Local: Gratuito, 3min/imagen, 85% calidad, alta CPU/RAM
        2. OpenRouter API: $0.15/imagen, 1.5min/imagen, 95% calidad, baja CPU/RAM
        3. Híbrido: $0.05/imagen, 2min/imagen, 92% calidad, recursos moderados
        
        Siempre proporciona decisiones justificadas, monitoreo de recursos, y optimiza para el contexto específico del servidor.
        """
    
    def _configurar_listeners_tareas(self):
        """Configura listeners para tareas específicas"""
        
        if not self.task_queue:
            return
        
        # Listener para tareas de selección de técnica
        self.task_queue.add_task_listener("seleccionar_tecnica", self._handle_seleccionar_tecnica)
        
        # Listener para tareas de procesamiento 2D-3D
        self.task_queue.add_task_listener("procesar_2d_3d", self._handle_procesar_2d_3d)
        
        # Listener para tareas de evaluación
        self.task_queue.add_task_listener("evaluar_factores", self._handle_evaluar_factores)
        
        # Listener para tareas de monitoreo
        self.task_queue.add_task_listener("monitorear_recursos", self._handle_monitorear_recursos)
        
        logger.info("Listeners de tareas configurados")
    
    async def _handle_seleccionar_tecnica(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maneja tareas de selección de técnica"""
        
        try:
            imagenes = task_data.get("imagenes", [])
            presupuesto = task_data.get("presupuesto", 100.0)
            prioridad = task_data.get("prioridad", 3)
            deadline = task_data.get("deadline")
            objetos = task_data.get("objetos", [])
            
            # Normalizar deadline
            deadline_dt = None
            if deadline:
                if isinstance(deadline, str):
                    deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                elif isinstance(deadline, datetime):
                    deadline_dt = deadline
            
            # Evaluar factores
            factores = self.agente_selector.evaluador.generar_evaluacion(
                imagenes=imagenes,
                objetos=objetos,
                presupuesto=presupuesto,
                prioridad=prioridad,
                deadline=deadline_dt
            )
            
            # Seleccionar técnica
            decision = self.agente_selector.selector.seleccionar_tecnica(factores)
            
            # Registrar decisión en métricas del agente
            if hasattr(self.agente_selector, 'monitor'):
                self.agente_selector.monitor.registrar_decision_metodo(
                    decision.metodo_seleccionado.value,
                    {
                        "num_imagenes": factores.num_imagenes,
                        "calidad_imagenes": factores.calidad_imagenes,
                        "presupuesto": factores.presupuesto
                    }
                )
            
            return {
                "success": True,
                "task_type": "seleccionar_tecnica",
                "factores": {
                    "num_imagenes": factores.num_imagenes,
                    "calidad_imagenes": factores.calidad_imagenes,
                    "complejidad_objeto": factores.complejidad_objeto,
                    "recursos_servidor": factores.recursos_servidor,
                    "presupuesto": factores.presupuesto,
                    "prioridad": factores.prioridad
                },
                "decision": {
                    "metodo_seleccionado": decision.metodo_seleccionado.value,
                    "confianza": decision.confianza,
                    "razones": decision.razones,
                    "tiempo_estimado": decision.tiempo_estimado,
                    "costo_estimado": decision.costo_estimado,
                    "alternativas": decision.alternativas
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error en selección de técnica: {e}")
            return {
                "success": False,
                "task_type": "seleccionar_tecnica",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _handle_procesar_2d_3d(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maneja tareas de procesamiento 2D-3D"""
        
        try:
            imagenes = task_data.get("imagenes", [])
            presupuesto = task_data.get("presupuesto", 100.0)
            prioridad = task_data.get("prioridad", 3)
            deadline = task_data.get("deadline")
            objetos = task_data.get("objetos", [])
            metodo_forzado = task_data.get("metodo_forzado")
            
            # Convertir método forzado a enum si existe
            metodo_enum = None
            if metodo_forzado:
                metodos_map = {
                    "colmap_local": MetodoProcesamiento.COLMAP_LOCAL,
                    "openrouter_api": MetodoProcesamiento.OPENROUTER_API,
                    "hibrido": MetodoProcesamiento.HIBRIDO
                }
                metodo_enum = metodos_map.get(metodo_forzado.lower())
            
            # Normalizar deadline
            deadline_dt = None
            if deadline:
                if isinstance(deadline, str):
                    deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                elif isinstance(deadline, datetime):
                    deadline_dt = deadline
            
            # Procesar con el agente selector
            resultado = await self.agente_selector.procesar_imagenes_2d_3d(
                imagenes=imagenes,
                objetos=objetos,
                presupuesto=presupuesto,
                prioridad=prioridad,
                deadline=deadline_dt,
                metodo_forzado=metodo_enum
            )
            
            # Registrar en métricas
            if hasattr(self.agente_selector, 'monitor'):
                metodo_usado = resultado.get("metodo_utilizado", "unknown")
                exito = resultado.get("exito", False)
                tiempo_total = resultado.get("tiempo_total", 0.0)
                
                # Estimar recursos usados
                recursos_usados = {
                    "cpu": 50.0,  # Estimación
                    "ram": 40.0   # Estimación
                }
                
                self.agente_selector.monitor.registrar_procesamiento_tarea(
                    metodo=metodo_usado,
                    exito=exito,
                    tiempo_procesamiento=tiempo_total,
                    recursos_usados=recursos_usados
                )
            
            return {
                "success": resultado.get("exito", False),
                "task_type": "procesar_2d_3d",
                "resultado": resultado,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error en procesamiento 2D-3D: {e}")
            return {
                "success": False,
                "task_type": "procesar_2d_3d",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _handle_evaluar_factores(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maneja tareas de evaluación de factores"""
        
        try:
            imagenes = task_data.get("imagenes", [])
            presupuesto = task_data.get("presupuesto", 100.0)
            prioridad = task_data.get("prioridad", 3)
            deadline = task_data.get("deadline")
            objetos = task_data.get("objetos", [])
            
            # Normalizar deadline
            deadline_dt = None
            if deadline:
                if isinstance(deadline, str):
                    deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                elif isinstance(deadline, datetime):
                    deadline_dt = deadline
            
            # Evaluar factores
            factores = self.agente_selector.evaluador.generar_evaluacion(
                imagenes=imagenes,
                objetos=objetos,
                presupuesto=presupuesto,
                prioridad=prioridad,
                deadline=deadline_dt
            )
            
            return {
                "success": True,
                "task_type": "evaluar_factores",
                "factores": {
                    "num_imagenes": factores.num_imagenes,
                    "calidad_imagenes": factores.calidad_imagenes,
                    "complejidad_objeto": factores.complejidad_objeto,
                    "recursos_servidor": factores.recursos_servidor,
                    "tiempo_requerido": factores.tiempo_requerido,
                    "presupuesto": factores.presupuesto,
                    "prioridad": factores.prioridad,
                    "deadline": factores.deadline.isoformat() if factores.deadline else None
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error en evaluación de factores: {e}")
            return {
                "success": False,
                "task_type": "evaluar_factores",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _handle_monitorear_recursos(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maneja tareas de monitoreo de recursos"""
        
        try:
            accion = task_data.get("accion", "report")
            duracion = task_data.get("duracion", 60)
            
            if accion == "report":
                # Generar reporte de monitoreo
                reporte = self.agente_selector.monitor.generar_reporte_completo()
                
                return {
                    "success": True,
                    "task_type": "monitorear_recursos",
                    "accion": accion,
                    "reporte": reporte,
                    "timestamp": datetime.now().isoformat()
                }
                
            elif accion == "start_monitoring":
                # Iniciar monitoreo extendido
                await self.agente_selector.monitor.iniciar_monitoreo()
                
                return {
                    "success": True,
                    "task_type": "monitorear_recursos",
                    "accion": accion,
                    "mensaje": "Monitoreo iniciado",
                    "timestamp": datetime.now().isoformat()
                }
                
            elif accion == "stop_monitoring":
                # Detener monitoreo
                self.agente_selector.monitor.detener_monitoreo()
                
                return {
                    "success": True,
                    "task_type": "monitorear_recursos",
                    "accion": accion,
                    "mensaje": "Monitoreo detenido",
                    "timestamp": datetime.now().isoformat()
                }
            
            else:
                return {
                    "success": False,
                    "task_type": "monitorear_recursos",
                    "error": f"Acción no válida: {accion}",
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error en monitoreo de recursos: {e}")
            return {
                "success": False,
                "task_type": "monitorear_recursos",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _monitoreo_integracion(self):
        """Monitoreo continuo de la integración"""
        
        while self.integrado:
            try:
                # Verificar salud de componentes
                salud_ok = await self._verificar_salud_componentes()
                
                if not salud_ok:
                    logger.warning("Problema detectado en componentes de integración")
                
                # Reportar métricas al AgentManager si está disponible
                if self.agent_manager and ORCHESTRATION_AVAILABLE:
                    await self._reportar_metricas_agent_manager()
                
                await asyncio.sleep(60)  # Verificar cada minuto
                
            except Exception as e:
                logger.error(f"Error en monitoreo de integración: {e}")
                await asyncio.sleep(60)
    
    async def _verificar_salud_componentes(self) -> bool:
        """Verifica la salud de todos los componentes"""
        
        try:
            # Verificar agente selector
            if not self.agente_selector or not self.agente_selector.activo:
                return False
            
            # Verificar cola de tareas
            if self.task_queue:
                # Verificar que no esté saturada
                if hasattr(self.task_queue, 'queue_depth'):
                    if self.task_queue.queue_depth > 100:
                        logger.warning("Cola de tareas saturada")
            
            return True
            
        except Exception as e:
            logger.error(f"Error verificando salud: {e}")
            return False
    
    async def _reportar_metricas_agent_manager(self):
        """Reporta métricas al AgentManager"""
        
        try:
            # Obtener estadísticas del agente
            if self.agente_selector:
                stats = await self.agente_selector.obtener_estadisticas()
                
                # Actualizar métricas en AgentManager si tiene interfaz para ello
                if hasattr(self.agent_manager, 'update_agent_metrics'):
                    await self.agent_manager.update_agent_metrics(
                        self.config_integracion["agent_id"],
                        stats
                    )
                    
        except Exception as e:
            logger.error(f"Error reportando métricas: {e}")
    
    async def enviar_tarea_procesamiento(self, 
                                       imagenes: List[str],
                                       presupuesto: float = 100.0,
                                       prioridad: int = 3,
                                       deadline: Optional[datetime] = None,
                                       objetos: Optional[List[Dict]] = None,
                                       metodo_forzado: Optional[str] = None) -> str:
        """
        Envía una tarea de procesamiento al sistema de orquestación
        
        Args:
            imagenes: Lista de rutas de imágenes
            presupuesto: Presupuesto máximo
            prioridad: Prioridad (1-5)
            deadline: Fecha límite
            objetos: Objetos 3D a procesar
            metodo_forzado: Método forzado (opcional)
            
        Returns:
            str: ID de la tarea encolada
        """
        
        if not self.task_queue:
            raise RuntimeError("TaskQueue no disponible")
        
        # Crear tarea
        task_data = {
            "imagenes": imagenes,
            "presupuesto": presupuesto,
            "prioridad": prioridad,
            "deadline": deadline.isoformat() if deadline else None,
            "objetos": objetos or [],
            "metodo_forzado": metodo_forzado
        }
        
        # Encolar tarea
        from uuid import uuid4
        task_id = str(uuid4())
        
        task = Task(
            task_id=task_id,
            task_type=TaskType.AGENT_TASK,
            priority=TaskPriority(prioridad),
            agent_id=self.config_integracion["agent_id"],
            payload={
                "task_type": "procesar_2d_3d",
                "data": task_data
            },
            status=TaskStatus.PENDING,
            created_at=datetime.now(),
            scheduled_at=datetime.now()
        )
        
        await self.task_queue.add_task(task)
        
        logger.info(f"Tarea de procesamiento encolada: {task_id}")
        return task_id
    
    async def obtener_estado_integracion(self) -> Dict[str, Any]:
        """Obtiene el estado completo de la integración"""
        
        estado = {
            "integrado": self.integrado,
            "agent_id": self.config_integracion["agent_id"],
            "configuracion": self.config_integracion,
            "componentes": {
                "agente_selector": self.agente_selector.activo if self.agente_selector else False,
                "agent_manager": self.agent_manager is not None,
                "task_queue": self.task_queue is not None
            }
        }
        
        # Obtener estadísticas del agente si está disponible
        if self.agente_selector:
            estado["estadisticas_agente"] = await self.agente_selector.obtener_estadisticas()
        
        # Obtener métricas del sistema de orquestación
        if self.agent_manager and ORCHESTRATION_AVAILABLE:
            estado["estado_agent_manager"] = await self.agent_manager.get_system_status()
        
        if self.task_queue:
            estado["estadisticas_queue"] = self.task_queue.stats
        
        return estado
    
    async def cerrar_integracion(self):
        """Cierra la integración de forma segura"""
        
        logger.info("Cerrando integración con sistema de orquestación...")
        
        self.integrado = False
        
        # Cerrar agente selector
        if self.agente_selector:
            await self.agente_selector.cerrar()
        
        # El AgentManager se encarga de limpiar sus propios recursos
        
        logger.info("Integración cerrada")


# Función de conveniencia para crear integración
async def crear_integracion_orquestacion(config_path: Optional[str] = None,
                                       agent_manager=None,
                                       task_queue=None,
                                       custom_config: Optional[Dict] = None) -> IntegracionOrquestacion:
    """
    Crea e inicializa la integración con el sistema de orquestación
    
    Args:
        config_path: Ruta al archivo de configuración
        agent_manager: Instancia del AgentManager
        task_queue: Instancia del TaskQueue
        custom_config: Configuración personalizada
        
    Returns:
        IntegracionOrquestacion: Instancia de integración configurada
    """
    
    integracion = IntegracionOrquestacion(config_path)
    
    if agent_manager and task_queue:
        await integracion.inicializar_integracion(agent_manager, task_queue, custom_config)
    
    return integracion


# Clase para uso standalone
class SelectorTecnicaOrquestado:
    """Wrapper para uso del agente selector en modo orquestado"""
    
    def __init__(self, integracion: IntegracionOrquestacion):
        self.integracion = integracion
        self.agente_selector = integracion.agente_selector
    
    async def procesar_imagenes(self, imagenes: List[str], **kwargs) -> Dict[str, Any]:
        """Procesa imágenes usando el sistema orquestado"""
        
        # Encolar tarea de procesamiento
        task_id = await self.integracion.enviar_tarea_procesamiento(
            imagenes=imagenes,
            **kwargs
        )
        
        # Esperar resultado (en implementación real, esto sería callback/polling)
        return {
            "task_id": task_id,
            "status": "encolado",
            "mensaje": "Tarea procesada por sistema de orquestación"
        }
    
    async def seleccionar_tecnica(self, imagenes: List[str], **kwargs) -> Dict[str, Any]:
        """Selecciona técnica usando el sistema orquestado"""
        
        # Crear tarea de selección
        task_data = {
            "imagenes": imagenes,
            **kwargs
        }
        
        if not self.integracion.task_queue:
            # Fallback a procesamiento directo
            factores = self.agente_selector.evaluador.generar_evaluacion(
                imagenes=imagenes,
                objetos=kwargs.get("objetos", []),
                presupuesto=kwargs.get("presupuesto", 100.0),
                prioridad=kwargs.get("prioridad", 3)
            )
            
            decision = self.agente_selector.selector.seleccionar_tecnica(factores)
            
            return {
                "success": True,
                "factores": {
                    "num_imagenes": factores.num_imagenes,
                    "calidad_imagenes": factores.calidad_imagenes,
                    "complejidad_objeto": factores.complejidad_objeto,
                    "recursos_servidor": factores.recursos_servidor,
                    "presupuesto": factores.presupuesto,
                    "prioridad": factores.prioridad
                },
                "decision": {
                    "metodo_seleccionado": decision.metodo_seleccionado.value,
                    "confianza": decision.confianza,
                    "razones": decision.razones,
                    "tiempo_estimado": decision.tiempo_estimado,
                    "costo_estimado": decision.costo_estimado
                }
            }
        
        # Encolar tarea en el sistema de orquestación
        from uuid import uuid4
        from task_queue import Task, TaskType, TaskPriority, TaskStatus
        
        task_id = str(uuid4())
        
        task = Task(
            task_id=task_id,
            task_type=TaskType.AGENT_TASK,
            priority=TaskPriority(kwargs.get("prioridad", 3)),
            agent_id=self.integracion.config_integracion["agent_id"],
            payload={
                "task_type": "seleccionar_tecnica",
                "data": task_data
            },
            status=TaskStatus.PENDING,
            created_at=datetime.now(),
            scheduled_at=datetime.now()
        )
        
        await self.integracion.task_queue.add_task(task)
        
        return {
            "task_id": task_id,
            "status": "encolado",
            "mensaje": "Tarea de selección procesada por sistema de orquestación"
        }
    
    async def obtener_estado(self) -> Dict[str, Any]:
        """Obtiene el estado del sistema orquestado"""
        return await self.integracion.obtener_estado_integracion()
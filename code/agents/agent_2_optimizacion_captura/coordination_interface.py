#!/usr/bin/env python3
"""
Interfaz de Coordinación del Agente Optimizador de Captura
=========================================================

Esta interfaz permite al agente optimizador comunicarse con el sistema
de coordinación principal, recibiendo tareas y reportando resultados.

Autor: Sistema de Fotogrametría de Relojes
Versión: 2.0
Fecha: 2025-11-06
"""

import json
import logging
import threading
import time
from typing import Dict, List, Optional, Any, Callable
from dataclasses import asdict
from datetime import datetime
import queue

from capture_optimizer_agent import CaptureGuide, ComponentType
from agent_config import AgentConfiguration

logger = logging.getLogger(__name__)


class CoordinationMessage:
    """Clase para mensajes de coordinación"""
    
    def __init__(self, 
                 message_type: str,
                 sender: str,
                 recipient: str,
                 content: Dict[str, Any],
                 message_id: str = None,
                 timestamp: str = None):
        self.message_type = message_type
        self.sender = sender
        self.recipient = recipient
        self.content = content
        self.message_id = message_id or self._generate_id()
        self.timestamp = timestamp or datetime.now().isoformat()
    
    def _generate_id(self) -> str:
        """Generar ID único para el mensaje"""
        import uuid
        return str(uuid.uuid4())[:8]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir mensaje a diccionario"""
        return {
            "message_type": self.message_type,
            "sender": self.sender,
            "recipient": self.recipient,
            "content": self.content,
            "message_id": self.message_id,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CoordinationMessage':
        """Crear mensaje desde diccionario"""
        return cls(
            message_type=data["message_type"],
            sender=data["sender"],
            recipient=data["recipient"],
            content=data["content"],
            message_id=data.get("message_id"),
            timestamp=data.get("timestamp")
        )


class TaskStatus:
    """Estados de tareas"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class CoordinationInterface:
    """Interfaz principal de coordinación"""
    
    def __init__(self, agent_name: str = "optimizador_captura"):
        """
        Inicializar interfaz de coordinación
        
        Args:
            agent_name: Nombre del agente
        """
        self.agent_name = agent_name
        self.message_queue = queue.Queue()
        self.active_tasks = {}
        self.task_callbacks = {}
        self.running = False
        self.coordination_thread = None
        
        # Estado del agente
        self.agent_status = {
            "name": agent_name,
            "status": "idle",
            "current_task": None,
            "completed_tasks": 0,
            "last_heartbeat": datetime.now().isoformat(),
            "capabilities": [
                "generar_guias_captura",
                "calcular_angulos_optimos",
                "recomendar_configuraciones_camara",
                "sugerir_esquemas_iluminacion",
                "validar_cobertura_angular",
                "generar_checklists_visuales"
            ]
        }
    
    def start(self):
        """Iniciar la interfaz de coordinación"""
        if not self.running:
            self.running = True
            self.coordination_thread = threading.Thread(target=self._coordination_loop, daemon=True)
            self.coordination_thread.start()
            logger.info(f"Interfaz de coordinación iniciada para {self.agent_name}")
    
    def stop(self):
        """Detener la interfaz de coordinación"""
        self.running = False
        if self.coordination_thread:
            self.coordination_thread.join(timeout=5)
        logger.info(f"Interfaz de coordinación detenida para {self.agent_name}")
    
    def _coordination_loop(self):
        """Loop principal de coordinación"""
        while self.running:
            try:
                # Procesar mensajes pendientes
                self._process_messages()
                
                # Actualizar heartbeat
                self._update_heartbeat()
                
                # Limpiar tareas completadas
                self._cleanup_completed_tasks()
                
                time.sleep(1)  # Evitar consumo excesivo de CPU
                
            except Exception as e:
                logger.error(f"Error en loop de coordinación: {e}")
                time.sleep(5)
    
    def _process_messages(self):
        """Procesar mensajes en cola"""
        while not self.message_queue.empty():
            try:
                message = self.message_queue.get_nowait()
                self._handle_message(message)
            except queue.Empty:
                break
            except Exception as e:
                logger.error(f"Error procesando mensaje: {e}")
    
    def _handle_message(self, message: CoordinationMessage):
        """Manejar mensaje recibido"""
        try:
            if message.message_type == "task_request":
                self._handle_task_request(message)
            elif message.message_type == "task_status_query":
                self._handle_status_query(message)
            elif message.message_type == "capability_query":
                self._handle_capability_query(message)
            elif message.message_type == "shutdown":
                self._handle_shutdown(message)
            else:
                logger.warning(f"Tipo de mensaje desconocido: {message.message_type}")
                
        except Exception as e:
            logger.error(f"Error manejando mensaje: {e}")
            self._send_error_response(message, str(e))
    
    def _handle_task_request(self, message: CoordinationMessage):
        """Manejar solicitud de tarea"""
        task_content = message.content
        task_type = task_content.get("task_type")
        
        if task_type == "generate_capture_guide":
            self._handle_generate_guide_task(message, task_content)
        elif task_type == "validate_coverage":
            self._handle_validate_coverage_task(message, task_content)
        elif task_type == "optimize_existing_guide":
            self._handle_optimize_guide_task(message, task_content)
        else:
            self._send_error_response(message, f"Tipo de tarea no soportada: {task_type}")
    
    def _handle_generate_guide_task(self, message: CoordinationMessage, task_content: Dict[str, Any]):
        """Manejar tarea de generación de guía"""
        try:
            # Extraer parámetros
            component_type_str = task_content.get("component_type")
            component_id = task_content.get("component_id")
            custom_geometry = task_content.get("custom_geometry")
            
            if not component_type_str or not component_id:
                self._send_error_response(message, "Parámetros requeridos: component_type, component_id")
                return
            
            # Convertir tipo de componente
            try:
                component_type = ComponentType(component_type_str)
            except ValueError:
                self._send_error_response(message, f"Tipo de componente inválido: {component_type_str}")
                return
            
            # Crear tarea
            task_id = self._create_task(message, "generate_capture_guide")
            
            # Simular procesamiento asíncrono
            def process_guide():
                try:
                    self._update_task_status(task_id, TaskStatus.IN_PROGRESS)
                    
                    # Aquí se integraría con el agente real
                    # Por ahora simulamos la generación
                    guide_data = self._simulate_guide_generation(component_type, component_id, custom_geometry)
                    
                    self._update_task_status(task_id, TaskStatus.COMPLETED, result=guide_data)
                    
                except Exception as e:
                    self._update_task_status(task_id, TaskStatus.FAILED, error=str(e))
            
            # Ejecutar en thread separado
            thread = threading.Thread(target=process_guide, daemon=True)
            thread.start()
            
        except Exception as e:
            self._send_error_response(message, f"Error procesando tarea: {e}")
    
    def _handle_validate_coverage_task(self, message: CoordinationMessage, task_content: Dict[str, Any]):
        """Manejar tarea de validación de cobertura"""
        try:
            captured_angles = task_content.get("captured_angles", [])
            required_angles = task_content.get("required_angles", [])
            
            if not captured_angles or not required_angles:
                self._send_error_response(message, "Parámetros requeridos: captured_angles, required_angles")
                return
            
            task_id = self._create_task(message, "validate_coverage")
            
            def process_validation():
                try:
                    self._update_task_status(task_id, TaskStatus.IN_PROGRESS)
                    
                    # Simular validación
                    validation_result = self._simulate_coverage_validation(captured_angles, required_angles)
                    
                    self._update_task_status(task_id, TaskStatus.COMPLETED, result=validation_result)
                    
                except Exception as e:
                    self._update_task_status(task_id, TaskStatus.FAILED, error=str(e))
            
            thread = threading.Thread(target=process_validation, daemon=True)
            thread.start()
            
        except Exception as e:
            self._send_error_response(message, f"Error procesando validación: {e}")
    
    def _handle_optimize_guide_task(self, message: CoordinationMessage, task_content: Dict[str, Any]):
        """Manejar tarea de optimización de guía existente"""
        try:
            existing_guide = task_content.get("existing_guide")
            if not existing_guide:
                self._send_error_response(message, "Parámetro requerido: existing_guide")
                return
            
            task_id = self._create_task(message, "optimize_existing_guide")
            
            def process_optimization():
                try:
                    self._update_task_status(task_id, TaskStatus.IN_PROGRESS)
                    
                    # Simular optimización
                    optimized_guide = self._simulate_guide_optimization(existing_guide)
                    
                    self._update_task_status(task_id, TaskStatus.COMPLETED, result=optimized_guide)
                    
                except Exception as e:
                    self._update_task_status(task_id, TaskStatus.FAILED, error=str(e))
            
            thread = threading.Thread(target=process_optimization, daemon=True)
            thread.start()
            
        except Exception as e:
            self._send_error_response(message, f"Error procesando optimización: {e}")
    
    def _handle_status_query(self, message: CoordinationMessage):
        """Manejar consulta de estado"""
        response = CoordinationMessage(
            message_type="task_status_response",
            sender=self.agent_name,
            recipient=message.sender,
            content={
                "agent_status": self.agent_status,
                "active_tasks": len(self.active_tasks),
                "queue_size": self.message_queue.qsize()
            }
        )
        self._send_message(response)
    
    def _handle_capability_query(self, message: CoordinationMessage):
        """Manejar consulta de capacidades"""
        response = CoordinationMessage(
            message_type="capability_response",
            sender=self.agent_name,
            recipient=message.sender,
            content={
                "agent_name": self.agent_name,
                "capabilities": self.agent_status["capabilities"],
                "supported_components": [comp.value for comp in ComponentType],
                "version": "2.0"
            }
        )
        self._send_message(response)
    
    def _handle_shutdown(self, message: CoordinationMessage):
        """Manejar solicitud de apagado"""
        response = CoordinationMessage(
            message_type="shutdown_ack",
            sender=self.agent_name,
            recipient=message.sender,
            content={"message": "Apagando agente..."}
        )
        self._send_message(response)
        
        # Programar apagado
        threading.Timer(2.0, self.stop).start()
    
    def _create_task(self, message: CoordinationMessage, task_type: str) -> str:
        """Crear nueva tarea"""
        task_id = f"task_{len(self.active_tasks) + 1}_{int(time.time())}"
        
        self.active_tasks[task_id] = {
            "type": task_type,
            "status": TaskStatus.PENDING,
            "created_at": datetime.now().isoformat(),
            "request_message": message.to_dict(),
            "result": None,
            "error": None
        }
        
        self.agent_status["status"] = "busy"
        self.agent_status["current_task"] = task_id
        
        return task_id
    
    def _update_task_status(self, task_id: str, status: str, result: Any = None, error: str = None):
        """Actualizar estado de tarea"""
        if task_id in self.active_tasks:
            self.active_tasks[task_id]["status"] = status
            self.active_tasks[task_id]["updated_at"] = datetime.now().isoformat()
            
            if result is not None:
                self.active_tasks[task_id]["result"] = result
            if error is not None:
                self.active_tasks[task_id]["error"] = error
            
            # Notificar resultado si hay callback registrado
            if task_id in self.task_callbacks:
                callback = self.task_callbacks[task_id]
                callback(task_id, status, result, error)
            
            # Si la tarea está completa, limpiar
            if status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
                self.agent_status["completed_tasks"] += 1
                self.agent_status["status"] = "idle"
                self.agent_status["current_task"] = None
    
    def _cleanup_completed_tasks(self):
        """Limpiar tareas completadas antiguas"""
        current_time = datetime.now()
        tasks_to_remove = []
        
        for task_id, task_info in self.active_tasks.items():
            task_time = datetime.fromisoformat(task_info["updated_at"])
            if (current_time - task_time).seconds > 3600:  # 1 hora
                tasks_to_remove.append(task_id)
        
        for task_id in tasks_to_remove:
            del self.active_tasks[task_id]
            if task_id in self.task_callbacks:
                del self.task_callbacks[task_id]
    
    def _send_message(self, message: CoordinationMessage):
        """Enviar mensaje (simulado)"""
        # En implementación real, esto enviaría a través del sistema de coordinación
        logger.debug(f"Enviando mensaje: {message.message_type} a {message.recipient}")
    
    def _send_error_response(self, original_message: CoordinationMessage, error_message: str):
        """Enviar respuesta de error"""
        error_response = CoordinationMessage(
            message_type="error_response",
            sender=self.agent_name,
            recipient=original_message.sender,
            content={
                "error": error_message,
                "original_message_id": original_message.message_id
            }
        )
        self._send_message(error_response)
    
    def _update_heartbeat(self):
        """Actualizar heartbeat del agente"""
        self.agent_status["last_heartbeat"] = datetime.now().isoformat()
    
    # Métodos simulados para demostración
    def _simulate_guide_generation(self, component_type: ComponentType, component_id: str, custom_geometry: Dict = None) -> Dict[str, Any]:
        """Simular generación de guía (para demostración)"""
        import random
        
        # Simular tiempo de procesamiento
        time.sleep(random.uniform(1, 3))
        
        # Generar datos simulados
        angles = [0, 45, 90, 135, 180] if component_type != ComponentType.ESFERA else [0, 45, 90, 135, 180, 225, 270, 315]
        
        return {
            "component_type": component_type.value,
            "component_id": component_id,
            "optimal_angles": angles,
            "camera_settings": [
                {
                    "f_number": random.choice([5.6, 8.0, 11.0]),
                    "iso": random.choice([100, 200, 400]),
                    "shutter_speed": f"1/{random.choice([60, 125, 250])}",
                    "focal_length": random.choice([50, 85, 100]),
                    "white_balance": "daylight"
                }
            ],
            "lighting_configs": [
                {
                    "lighting_type": "studio",
                    "position": "superior",
                    "intensity": 0.8,
                    "color_temperature": 5600
                }
            ],
            "estimated_duration": len(angles) * 3 + 10,
            "difficulty_level": random.choice(["Fácil", "Medio", "Difícil"]),
            "checklist": [
                "Preparar superficie de trabajo",
                "Verificar limpieza del componente",
                "Configurar iluminación",
                "Establecer punto de enfoque"
            ]
        }
    
    def _simulate_coverage_validation(self, captured_angles: List[float], required_angles: List[float]) -> Dict[str, Any]:
        """Simular validación de cobertura"""
        missing = set(required_angles) - set(captured_angles)
        coverage = len(set(required_angles) & set(captured_angles)) / len(required_angles) * 100
        
        return {
            "coverage_percentage": coverage,
            "missing_angles": list(missing),
            "is_complete": len(missing) == 0,
            "recommendations": [f"Capturar ángulos faltantes: {sorted(missing)}"] if missing else ["Cobertura completa"]
        }
    
    def _simulate_guide_optimization(self, existing_guide: Dict[str, Any]) -> Dict[str, Any]:
        """Simular optimización de guía existente"""
        # Simular optimización
        optimized = existing_guide.copy()
        optimized["optimized"] = True
        optimized["optimization_notes"] = "Guía optimizada automáticamente"
        
        return optimized
    
    # Métodos públicos de la interfaz
    
    def register_guide(self, guide: CaptureGuide):
        """Registrar guía generada"""
        logger.info(f"Guía registrada: {guide.component_type.value}:{guide.component_id}")
    
    def submit_task(self, task_type: str, parameters: Dict[str, Any], callback: Callable = None) -> str:
        """
        Enviar tarea al agente
        
        Args:
            task_type: Tipo de tarea
            parameters: Parámetros de la tarea
            callback: Función callback cuando complete
            
        Returns:
            str: ID de la tarea
        """
        message = CoordinationMessage(
            message_type="task_request",
            sender="external",
            recipient=self.agent_name,
            content={
                "task_type": task_type,
                **parameters
            }
        )
        
        task_id = f"external_task_{int(time.time())}"
        
        if callback:
            self.task_callbacks[task_id] = callback
        
        self.message_queue.put(message)
        
        return task_id
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Obtener estado actual del agente"""
        return self.agent_status.copy()
    
    def get_active_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Obtener tareas activas"""
        return self.active_tasks.copy()
    
    def register_capability(self, capability: str):
        """Registrar nueva capacidad"""
        if capability not in self.agent_status["capabilities"]:
            self.agent_status["capabilities"].append(capability)


# Instancia global de coordinación
coordination = CoordinationInterface()


def get_coordination_interface() -> CoordinationInterface:
    """Obtener instancia de coordinación"""
    return coordination


if __name__ == "__main__":
    # Ejemplo de uso
    coord = CoordinationInterface()
    coord.start()
    
    # Enviar tarea de prueba
    def task_callback(task_id, status, result, error):
        print(f"Tarea {task_id}: {status}")
        if result:
            print(f"Resultado: {result}")
        if error:
            print(f"Error: {error}")
    
    task_id = coord.submit_task(
        "generate_capture_guide",
        {
            "component_type": "esfera",
            "component_id": "TEST001"
        },
        task_callback
    )
    
    print(f"Tarea enviada: {task_id}")
    
    # Mantener corriendo por un tiempo
    try:
        time.sleep(10)
    except KeyboardInterrupt:
        coord.stop()
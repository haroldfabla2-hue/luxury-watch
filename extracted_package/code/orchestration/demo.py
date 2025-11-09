#!/usr/bin/env python3
"""
Script de demostración del Sistema de Coordinación Local
Muestra las capacidades principales del sistema con ejemplos interactivos
"""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path

from loguru import logger
from start_system import OrchestrationSystem
from examples.workflow_examples import WorkflowExamples

class SystemDemo:
    """Demostración interactiva del sistema"""
    
    def __init__(self):
        self.system = None
        self.running = False
        
        # Configurar logging para la demo
        logger.remove()
        logger.add(
            "logs/demo.log",
            format="{time:HH:mm:ss} | {level} | {message}",
            level="INFO",
            rotation="1 day",
            retention="7 days"
        )
        logger.add(
            lambda msg: print(msg, end=""),
            format="{time:HH:mm:ss} | {level} | {message}",
            level="INFO"
        )
    
    async def initialize(self):
        """Inicializa el sistema para la demostración"""
        try:
            logger.info("=== INICIANDO DEMOSTRACIÓN DEL SISTEMA ===")
            logger.info("Inicializando componentes...")
            
            self.system = OrchestrationSystem()
            await self.system.initialize()
            
            logger.success("✓ Sistema inicializado correctamente")
            self.running = True
            
        except Exception as e:
            logger.error(f"Error inicializando sistema: {e}")
            raise
    
    async def demo_basic_operations(self):
        """Demuestra operaciones básicas del sistema"""
        logger.info("\n=== DEMO: OPERACIONES BÁSICAS ===")
        
        # 1. Verificar estado del sistema
        status = await self.system.coordinator.get_status()
        logger.info(f"Estado del sistema: {status}")
        
        # 2. Verificar agentes
        agent_status = await self.system.agent_manager.get_system_status()
        logger.info(f"Agentes activos: {agent_status['system_metrics']['active_agents']}")
        
        # 3. Verificar cola de tareas
        queue_status = await self.system.task_queue.get_queue_status()
        logger.info(f"Tareas en cola: {queue_status['queue_depth']}")
        
        logger.success("✓ Operaciones básicas verificadas")
    
    async def demo_model_management(self):
        """Demuestra gestión de modelos"""
        logger.info("\n=== DEMO: GESTIÓN DE MODELOS ===")
        
        try:
            # Listar modelos instalados
            models = await self.system.ollama_manager.list_installed_models()
            logger.info(f"Modelos instalados: {models}")
            
            # Verificar estado de Ollama
            ollama_available = await self.system.ollama_manager.is_ollama_available()
            if ollama_available:
                logger.info("✓ Ollama está disponible")
                
                # Probar generación básica
                try:
                    response = await self.system.ollama_manager.generate(
                        model="llama3.1:8b",
                        prompt="¿Qué es la inteligencia artificial?"
                    )
                    logger.info(f"Respuesta del modelo: {response.response[:100]}...")
                    logger.success("✓ Generación de texto funcionando")
                except Exception as e:
                    logger.warning(f"No se pudo probar generación: {e}")
            else:
                logger.warning("⚠ Ollama no está disponible - saltando prueba de generación")
                
        except Exception as e:
            logger.error(f"Error en gestión de modelos: {e}")
        
        logger.success("✓ Demo de gestión de modelos completada")
    
    async def demo_task_queue(self):
        """Demuestra el sistema de colas"""
        logger.info("\n=== DEMO: SISTEMA DE COLAS ===")
        
        try:
            # Enviar tarea simple
            task_id = await self.system.task_queue.submit_task(
                task_type="system_monitoring",
                payload={"action": "status_check"},
                priority=2
            )
            logger.info(f"Tarea enviada con ID: {task_id}")
            
            # Enviar múltiples tareas
            tasks = []
            for i in range(3):
                task_id = await self.system.task_queue.submit_task(
                    task_type="agent_task",
                    payload={"task": f"tarea_prueba_{i}", "data": f"datos_{i}"},
                    priority=1
                )
                tasks.append(task_id)
            
            logger.info(f"{len(tasks)} tareas adicionales enviadas")
            
            # Verificar estado de la cola
            await asyncio.sleep(2)  # Esperar procesamiento
            
            queue_status = await self.system.task_queue.get_queue_status()
            logger.info(f"Estado de cola: {queue_status}")
            
            logger.success("✓ Demo de sistema de colas completada")
            
        except Exception as e:
            logger.error(f"Error en demo de colas: {e}")
    
    async def demo_agent_interaction(self):
        """Demuestra interacción entre agentes"""
        logger.info("\n=== DEMO: INTERACCIÓN ENTRE AGENTES ===")
        
        try:
            # Simular comunicación entre agentes
            await self.system.state_manager.save_message(
                source_agent="coordinator",
                target_agent="analyzer",
                message_type="task_request",
                content="Analizar datos de ventas del último trimestre",
                workflow_id="demo_workflow_001"
            )
            
            await self.system.state_manager.save_message(
                source_agent="analyzer",
                target_agent="generator",
                message_type="analysis_result",
                content="Análisis completado: crecimiento del 15% en ventas",
                workflow_id="demo_workflow_001"
            )
            
            logger.info("✓ Mensajes entre agentes enviados")
            
            # Recuperar mensajes
            messages = await self.system.state_manager.get_messages_between_agents(
                "coordinator", "analyzer", limit=5
            )
            logger.info(f"Mensajes recuperados: {len(messages)}")
            
            logger.success("✓ Demo de interacción entre agentes completada")
            
        except Exception as e:
            logger.error(f"Error en demo de agentes: {e}")
    
    async def demo_workflows(self):
        """Demuestra workflows del sistema"""
        logger.info("\n=== DEMO: WORKFLOWS ===")
        
        workflows_to_demo = [
            ("analysis", "Análisis de Datos"),
            ("code_generation", "Generación de Código"),
            ("document_processing", "Procesamiento de Documentos")
        ]
        
        for workflow_type, description in workflows_to_demo:
            try:
                logger.info(f"Iniciando workflow: {description}")
                
                workflow_config = {
                    "workflow_id": f"demo_{workflow_type}_{int(time.time())}",
                    "name": description,
                    "type": workflow_type,
                    "data": {
                        "demo": True,
                        "description": f"Demostración de {description.lower()}"
                    }
                }
                
                await self.system.coordinator.task_queue.submit_workflow(workflow_config)
                
                logger.info(f"✓ Workflow {description} iniciado")
                
                # Esperar un poco entre workflows
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"Error iniciando workflow {description}: {e}")
        
        logger.success("✓ Demo de workflows completada")
    
    async def demo_state_persistence(self):
        """Demuestra persistencia de estado"""
        logger.info("\n=== DEMO: PERSISTENCIA DE ESTADO ===")
        
        try:
            # Guardar estado del sistema
            test_data = {
                "timestamp": datetime.now().isoformat(),
                "demo_data": "Esto es datos de prueba",
                "metrics": {"test_value": 42, "demo_counter": 1}
            }
            
            await self.system.state_manager.save_system_state("demo_key", test_data)
            logger.info("✓ Estado guardado en base de datos")
            
            # Recuperar estado
            recovered_data = await self.system.state_manager.load_system_state("demo_key")
            logger.info(f"Estado recuperado: {recovered_data}")
            
            # Verificar salud de la base de datos
            health = await self.system.state_manager.get_system_health()
            logger.info(f"Salud de BD: {health}")
            
            logger.success("✓ Demo de persistencia completada")
            
        except Exception as e:
            logger.error(f"Error en demo de persistencia: {e}")
    
    async def demo_monitoring(self):
        """Demuestra capacidades de monitoreo"""
        logger.info("\n=== DEMO: MONITOREO ===")
        
        try:
            # Recopilar métricas del sistema
            await self.system.coordinator._collect_system_metrics()
            
            # Guardar métricas
            metrics = await self.system.coordinator._collect_system_metrics()
            await self.system.state_manager.save_system_metrics(metrics)
            
            # Verificar logs recientes
            log_file = Path("logs/orchestration.log")
            if log_file.exists():
                recent_logs = list(log_file.read_text().split('\n'))[-10:]
                logger.info(f"Log recientes encontrados: {len(recent_logs)} líneas")
            else:
                logger.info("Archivo de log no encontrado (normal en demo)")
            
            logger.success("✓ Demo de monitoreo completado")
            
        except Exception as e:
            logger.error(f"Error en demo de monitoreo: {e}")
    
    async def run_complete_demo(self):
        """Ejecuta una demostración completa"""
        try:
            await self.initialize()
            
            logger.info("\n🚀 Iniciando demostración completa del sistema...")
            logger.info("Esta demostración mostrará todas las capacidades principales\n")
            
            demos = [
                ("Operaciones Básicas", self.demo_basic_operations),
                ("Gestión de Modelos", self.demo_model_management),
                ("Sistema de Colas", self.demo_task_queue),
                ("Interacción entre Agentes", self.demo_agent_interaction),
                ("Workflows", self.demo_workflows),
                ("Persistencia de Estado", self.demo_state_persistence),
                ("Monitoreo", self.demo_monitoring)
            ]
            
            for demo_name, demo_func in demos:
                try:
                    logger.info(f"\n--- {demo_name} ---")
                    await demo_func()
                    await asyncio.sleep(1)  # Pausa entre demos
                    
                except Exception as e:
                    logger.error(f"Error en demo {demo_name}: {e}")
                    continue
            
            logger.info("\n=== DEMOSTRACIÓN COMPLETADA ===")
            logger.success("✓ Todas las demostraciones ejecutadas")
            
            # Mostrar resumen final
            await self.show_demo_summary()
            
        except Exception as e:
            logger.error(f"Error en demostración completa: {e}")
        finally:
            await self.cleanup()
    
    async def show_demo_summary(self):
        """Muestra resumen de la demostración"""
        logger.info("\n=== RESUMEN DE DEMOSTRACIÓN ===")
        
        try:
            # Obtener estadísticas finales
            status = await self.system.coordinator.get_status()
            agent_status = await self.system.agent_manager.get_system_status()
            queue_status = await self.system.task_queue.get_queue_status()
            
            logger.info(f"• Workflows totales: {status['metrics']['total_workflows']}")
            logger.info(f"• Agentes registrados: {agent_status['system_metrics']['total_agents']}")
            logger.info(f"• Tareas procesadas: {queue_status['stats']['completed_tasks']}")
            
            # Verificar archivos creados
            log_dir = Path("logs")
            data_dir = Path("data")
            
            if log_dir.exists():
                log_files = list(log_dir.glob("*.log"))
                logger.info(f"• Archivos de log creados: {len(log_files)}")
            
            if data_dir.exists():
                db_files = list(data_dir.glob("*.db"))
                logger.info(f"• Base de datos: {len(db_files)} archivos")
            
        except Exception as e:
            logger.error(f"Error generando resumen: {e}")
    
    async def interactive_demo(self):
        """Ejecución interactiva de la demostración"""
        try:
            await self.initialize()
            
            while self.running:
                print("\n=== DEMO INTERACTIVA ===")
                print("1. Operaciones básicas")
                print("2. Gestión de modelos")
                print("3. Sistema de colas")
                print("4. Interacción entre agentes")
                print("5. Ejecutar workflows")
                print("6. Persistencia de estado")
                print("7. Monitoreo")
                print("8. Demo completa")
                print("9. Salir")
                
                try:
                    choice = input("\nSelecciona una opción (1-9): ").strip()
                    
                    if choice == "1":
                        await self.demo_basic_operations()
                    elif choice == "2":
                        await self.demo_model_management()
                    elif choice == "3":
                        await self.demo_task_queue()
                    elif choice == "4":
                        await self.demo_agent_interaction()
                    elif choice == "5":
                        await self.demo_workflows()
                    elif choice == "6":
                        await self.demo_state_persistence()
                    elif choice == "7":
                        await self.demo_monitoring()
                    elif choice == "8":
                        await self.run_complete_demo()
                    elif choice == "9":
                        logger.info("Saliendo de la demo...")
                        break
                    else:
                        logger.warning("Opción no válida")
                    
                except KeyboardInterrupt:
                    logger.info("\nDemo interrumpida por el usuario")
                    break
                except Exception as e:
                    logger.error(f"Error en demo interactiva: {e}")
                
        except Exception as e:
            logger.error(f"Error en demo interactiva: {e}")
        finally:
            await self.cleanup()
    
    async def cleanup(self):
        """Limpieza final"""
        if self.system and self.running:
            logger.info("Limpiando recursos...")
            await self.system.shutdown()
            self.running = False
        logger.info("Demo finalizada")

async def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Demostración del Sistema de Coordinación Local")
    parser.add_argument("--interactive", "-i", action="store_true", 
                       help="Ejecutar en modo interactivo")
    parser.add_argument("--complete", "-c", action="store_true",
                       help="Ejecutar demo completa")
    parser.add_argument("--quick", "-q", action="store_true",
                       help="Ejecutar demo rápida (operaciones básicas)")
    
    args = parser.parse_args()
    
    demo = SystemDemo()
    
    try:
        if args.interactive:
            await demo.interactive_demo()
        elif args.complete:
            await demo.run_complete_demo()
        elif args.quick:
            await demo.initialize()
            await demo.demo_basic_operations()
            await demo.demo_model_management()
            await demo.cleanup()
        else:
            # Ejecutar demo básica por defecto
            await demo.run_complete_demo()
            
    except KeyboardInterrupt:
        logger.info("\nDemo interrumpida por el usuario")
    except Exception as e:
        logger.error(f"Error en demo: {e}")

if __name__ == "__main__":
    asyncio.run(main())
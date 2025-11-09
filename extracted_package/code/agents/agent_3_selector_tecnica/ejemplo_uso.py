#!/usr/bin/env python3
"""
Ejemplo de Uso del Agente Selector de Técnica 2D-3D
===================================================

Este script demuestra el uso completo del Agente Selector de Técnica 2D-3D,
incluyendo diferentes modos de uso y escenarios de prueba.

Ejecutar con:
    python ejemplo_uso.py

O con configuraciones específicas:
    python ejemplo_uso.py --config config/config.json
    python ejemplo_uso.py --mode quick
    python ejemplo_uso.py --mode integration
"""

import asyncio
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any
import json
import tempfile
from datetime import datetime, timedelta

# Agregar el directorio src al path
sys.path.append(str(Path(__file__).parent / "src"))

# Importaciones del agente
from selector_tecnica_agent import (
    SelectorTecnicaAgent,
    MetodoProcesamiento,
    crear_agente_selector_tecnica
)
from interfaz_agente import (
    InterfazAgenteSelector,
    crear_interfaz_simple,
    procesar_rapido
)
from integracion_orquestacion import (
    IntegracionOrquestacion,
    SelectorTecnicaOrquestado,
    crear_integracion_orquestacion
)


class EjemploAgenteSelector:
    """Ejemplos completos de uso del Agente Selector de Técnica"""
    
    def __init__(self, config_path: str = None):
        self.config_path = config_path
        self.interfaz = None
        self.agente = None
        self.integracion = None
        
    async def inicializar(self):
        """Inicializa el agente para los ejemplos"""
        print("🚀 Inicializando Agente Selector de Técnica 2D-3D...")
        
        self.interfaz = InterfazAgenteSelector(self.config_path)
        await self.interfaz.inicializar()
        
        print("✅ Agente inicializado correctamente")
    
    async def ejemplo_evaluacion_simple(self):
        """Ejemplo 1: Evaluación simple de imágenes"""
        print("\n" + "="*60)
        print("📊 EJEMPLO 1: EVALUACIÓN SIMPLE")
        print("="*60)
        
        # Crear imágenes de prueba temporales
        imagenes_test = await self._crear_imagenes_test(5)
        
        print(f"Analizando {len(imagenes_test)} imágenes de prueba...")
        
        evaluacion = await self.interfaz.evaluar_sin_procesar(
            imagenes=imagenes_test,
            presupuesto=50.0,
            prioridad=3,
            deadline=datetime.now() + timedelta(hours=2)
        )
        
        print("\n🔍 RESULTADOS DE EVALUACIÓN:")
        print(f"   📷 Número de imágenes: {evaluacion['factores_evaluacion']['num_imagenes']}")
        print(f"   ⭐ Calidad promedio: {evaluacion['factores_evaluacion']['calidad_imagenes']:.2f}")
        print(f"   🎯 Complejidad objeto: {evaluacion['factores_evaluacion']['complejidad_objeto']:.2f}")
        print(f"   💰 Presupuesto: ${evaluacion['factores_evaluacion']['presupuesto']:.2f}")
        
        decision = evaluacion['decision_recomendada']
        print(f"\n🎯 TÉCNICA RECOMENDADA: {decision['metodo_seleccionado'].upper()}")
        print(f"   📈 Confianza: {decision['confianza']:.2f}")
        print(f"   ⏱️  Tiempo estimado: {decision['tiempo_estimado']:.1f} minutos")
        print(f"   💵 Costo estimado: ${decision['costo_estimado']:.2f}")
        
        print("\n📝 RAZONES DE LA DECISIÓN:")
        for razon in decision['razones']:
            print(f"   • {razon}")
        
        # Limpiar archivos temporales
        self._limpiar_archivos_temp(imagenes_test)
        
        return evaluacion
    
    async def ejemplo_comparacion_metodos(self):
        """Ejemplo 2: Comparación de métodos"""
        print("\n" + "="*60)
        print("⚖️  EJEMPLO 2: COMPARACIÓN DE MÉTODOS")
        print("="*60)
        
        # Crear más imágenes para comparar
        imagenes_test = await self._crear_imagenes_test(8)
        
        print(f"Comparando métodos para {len(imagenes_test)} imágenes...")
        
        comparacion = await self.interfaz.comparar_metodos(
            imagenes=imagenes_test,
            presupuesto=100.0
        )
        
        print("\n📋 COMPARACIÓN DETALLADA:")
        
        metodos = comparacion['comparacion_metodos']
        for metodo, datos in metodos.items():
            print(f"\n🔧 {metodo.replace('_', ' ').title()}:")
            print(f"   ✅ Disponible: {datos.get('disponible', False)}")
            print(f"   💰 Costo total: ${datos.get('costo_estimado', 0):.2f}")
            print(f"   ⏱️  Tiempo: {datos.get('tiempo_estimado', 0):.1f} min")
            print(f"   ⭐ Calidad: {datos.get('calidad_esperada', 0):.2f}")
            print(f"   🎯 Puntuación: {datos.get('puntuacion', 0):.2f}")
            print(f"   🏆 Recomendado: {datos.get('recomendado', False)}")
        
        print(f"\n🏆 MÉTODO RECOMENDADO: {comparacion['metodo_recomendado'].upper()}")
        
        # Limpiar archivos temporales
        self._limpiar_archivos_temp(imagenes_test)
        
        return comparacion
    
    async def ejemplo_procesamiento_completo(self):
        """Ejemplo 3: Procesamiento completo"""
        print("\n" + "="*60)
        print("🔄 EJEMPLO 3: PROCESAMIENTO COMPLETO")
        print("="*60)
        
        # Crear imágenes de prueba
        imagenes_test = await self._crear_imagenes_test(6)
        
        print(f"Procesando {len(imagenes_test)} imágenes...")
        print("⏳ Esto puede tomar unos minutos...")
        
        try:
            resultado = await self.interfaz.procesar_2d_a_3d(
                imagenes=imagenes_test,
                presupuesto=75.0,
                prioridad=4,
                deadline=datetime.now() + timedelta(hours=1)
            )
            
            print("\n✅ PROCESAMIENTO COMPLETADO:")
            print(f"   🎯 Éxito: {resultado['exito']}")
            print(f"   🔧 Método usado: {resultado['metodo_utilizado']}")
            print(f"   📈 Confianza: {resultado['confianza_seleccion']:.2f}")
            print(f"   ⏱️  Tiempo total: {resultado['tiempo_total']:.2f} segundos")
            
            if 'resultado' in resultado and resultado['resultado']:
                res = resultado['resultado']
                print(f"   📄 Archivos generados: {len(res.get('archivos_generados', []))}")
                print(f"   ⭐ Calidad alcanzada: {res.get('calidad', 'N/A')}")
            
            return resultado
            
        except Exception as e:
            print(f"\n❌ Error en procesamiento: {e}")
            return {"exito": False, "error": str(e)}
        
        finally:
            # Limpiar archivos temporales
            self._limpiar_archivos_temp(imagenes_test)
    
    async def ejemplo_simulacion_recursos(self):
        """Ejemplo 4: Simulación de recursos"""
        print("\n" + "="*60)
        print("📊 EJEMPLO 4: SIMULACIÓN DE RECURSOS")
        print("="*60)
        
        escenarios = [
            {"imagenes": 10, "calidad": 0.8, "metodo": "colmap_local"},
            {"imagenes": 20, "calidad": 0.9, "metodo": "openrouter_api"},
            {"imagenes": 15, "calidad": 0.85, "metodo": "hibrido"}
        ]
        
        print("Simulando diferentes escenarios de procesamiento...\n")
        
        for i, escenario in enumerate(escenarios, 1):
            print(f"📋 ESCENARIO {i}: {escenario['metodo'].replace('_', ' ').title()}")
            print(f"   📷 Imágenes: {escenario['imagenes']}")
            print(f"   ⭐ Calidad: {escenario['calidad']}")
            
            simulacion = await self.interfaz.simular_recursos(
                metodo=escenario['metodo'],
                num_imagenes=escenario['imagenes'],
                calidad_estimada=escenario['calidad']
            )
            
            recursos = simulacion['recursos_estimados']
            print(f"   🖥️  CPU promedio: {recursos['cpu_uso_promedio']:.1f}%")
            print(f"   💾 RAM promedio: {recursos['ram_uso_promedio']:.1f}%")
            print(f"   💽 Disco temp: {recursos['disco_temporal_estimado']:.1f} MB")
            print(f"   ⏱️  Tiempo: {recursos['tiempo_procesamiento_estimado']:.1f} min")
            print(f"   💰 Costo: ${recursos['costo_total_estimado']:.2f}")
            print(f"   🎯 Confiabilidad: {recursos['confiabilidad']:.2f}")
            print()
        
        return escenarios
    
    async def ejemplo_procesamiento_lote(self):
        """Ejemplo 5: Procesamiento en lote"""
        print("\n" + "="*60)
        print("📦 EJEMPLO 5: PROCESAMIENTO EN LOTE")
        print("="*60)
        
        # Crear múltiples conjuntos de imágenes
        lotes = []
        imagenes_base = await self._crear_imagenes_test(12)
        
        # Dividir en 3 lotes
        for i in range(3):
            inicio = i * 4
            fin = min((i + 1) * 4, len(imagenes_base))
            lote_imagenes = imagenes_base[inicio:fin]
            
            lotes.append({
                "imagenes": lote_imagenes,
                "presupuesto": 25.0 + i * 10,
                "prioridad": 2 + i
            })
        
        print(f"Procesando {len(lotes)} lotes con diferentes configuraciones...\n")
        
        resultados = await self.interfaz.procesar_lote(lotes, concurrencia=2)
        
        print("📊 RESULTADOS DEL LOTE:")
        for i, resultado in enumerate(resultados, 1):
            trabajo_id = resultado.get('trabajo_id', i)
            exito = resultado.get('exito', False)
            metodo = resultado.get('metodo_utilizado', 'N/A')
            tiempo = resultado.get('tiempo_total', 0)
            
            estado = "✅ ÉXITO" if exito else "❌ FALLO"
            print(f"   Lote {trabajo_id}: {estado}")
            print(f"      Método: {metodo}")
            print(f"      Tiempo: {tiempo:.2f}s")
        
        # Limpiar archivos temporales
        self._limpiar_archivos_temp(imagenes_base)
        
        return resultados
    
    async def ejemplo_monitoreo_recursos(self):
        """Ejemplo 6: Monitoreo de recursos"""
        print("\n" + "="*60)
        print("📈 EJEMPLO 6: MONITOREO DE RECURSOS")
        print("="*60)
        
        print("Iniciando monitoreo de recursos del sistema...\n")
        
        # Obtener estadísticas del agente
        stats = await self.interfaz.obtener_estadisticas()
        
        print("📊 ESTADÍSTICAS DEL AGENTE:")
        agente_stats = stats.get('agente', {})
        print(f"   🟢 Activo: {stats.get('agente_activo', False)}")
        print(f"   📋 Tareas activas: {stats.get('tareas_activas', 0)}")
        print(f"   📝 Total decisiones: {stats.get('total_decisiones', 0)}")
        
        # Estadísticas por método
        metodos_stats = stats.get('estadisticas_por_metodo', {})
        for metodo, datos in metodos_stats.items():
            exitos = datos.get('exitos', 0)
            fallos = datos.get('fallos', 0)
            total = exitos + fallos
            tasa_exito = (exitos / total * 100) if total > 0 else 0
            
            print(f"\n🔧 {metodo.replace('_', ' ').title()}:")
            print(f"   ✅ Exitosas: {exitos}")
            print(f"   ❌ Fallidas: {fallos}")
            print(f"   📊 Tasa éxito: {tasa_exito:.1f}%")
            print(f"   ⏱️  Tiempo promedio: {datos.get('tiempo_promedio', 0):.1f}s")
        
        return stats
    
    async def ejemplo_integracion_orquestacion(self):
        """Ejemplo 7: Integración con sistema de orquestación"""
        print("\n" + "="*60)
        print("🔗 EJEMPLO 7: INTEGRACIÓN CON ORQUESTACIÓN")
        print("="*60)
        
        print("Creando integración con sistema de orquestación...")
        
        # Crear mocks del sistema de orquestación
        mock_agent_manager = self._crear_mock_agent_manager()
        mock_task_queue = self._crear_mock_task_queue()
        
        try:
            # Crear integración
            self.integracion = await crear_integracion_orquestacion(
                self.config_path,
                mock_agent_manager,
                mock_task_queue
            )
            
            print("✅ Integración creada exitosamente")
            
            # Enviar tarea de procesamiento
            imagenes_test = await self._crear_imagenes_test(3)
            
            task_id = await self.integracion.enviar_tarea_procesamiento(
                imagenes=imagenes_test,
                presupuesto=40.0,
                prioridad=3
            )
            
            print(f"📤 Tarea enviada con ID: {task_id}")
            
            # Obtener estado de integración
            estado = await self.integracion.obtener_estado_integracion()
            
            print("\n📊 ESTADO DE INTEGRACIÓN:")
            print(f"   🔗 Integrado: {estado['integrado']}")
            print(f"   🆔 Agent ID: {estado['agent_id']}")
            
            componentes = estado['componentes']
            for componente, disponible in componentes.items():
                estado_comp = "✅" if disponible else "❌"
                print(f"   {estado_comp} {componente.replace('_', ' ').title()}")
            
            # Limpiar archivos temporales
            self._limpiar_archivos_temp(imagenes_test)
            
            return estado
            
        except Exception as e:
            print(f"❌ Error en integración: {e}")
            return {"error": str(e)}
    
    async def ejemplo_uso_completo(self):
        """Ejemplo completo que combina todos los casos de uso"""
        print("\n" + "="*60)
        print("🎯 EJEMPLO COMPLETO")
        print("="*60)
        print("Ejecutando flujo completo del agente...\n")
        
        try:
            # 1. Evaluación inicial
            evaluacion = await self.ejemplo_evaluacion_simple()
            
            # 2. Comparación de métodos
            comparacion = await self.ejemplo_comparacion_metodos()
            
            # 3. Simulación de recursos
            simulaciones = await self.ejemplo_simulacion_recursos()
            
            # 4. Monitoreo de recursos
            monitoreo = await self.ejemplo_monitoreo_recursos()
            
            print("\n🎉 FLUJO COMPLETO FINALIZADO EXITOSAMENTE")
            print("   Todos los ejemplos se ejecutaron correctamente")
            print("   El agente está listo para uso en producción")
            
            return {
                "evaluacion": evaluacion,
                "comparacion": comparacion,
                "simulaciones": simulaciones,
                "monitoreo": monitoreo,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"\n❌ Error en flujo completo: {e}")
            raise
    
    async def cerrar(self):
        """Cierra los recursos del agente"""
        print("\n🔒 Cerrando agente...")
        
        if self.interfaz:
            await self.interfaz.cerrar()
        
        if self.integracion:
            await self.integracion.cerrar_integracion()
        
        print("✅ Agente cerrado correctamente")
    
    # Métodos auxiliares
    async def _crear_imagenes_test(self, cantidad: int) -> List[str]:
        """Crea imágenes de prueba temporales"""
        from PIL import Image
        import tempfile
        
        imagenes = []
        temp_dir = Path(tempfile.mkdtemp())
        
        for i in range(cantidad):
            # Crear imagen con diferentes tamaños para simular variedad
            tamaño = (800 + i * 100, 600 + i * 50)
            img = Image.new('RGB', tamaño, color=f'#{i*40:02x}{i*20:02x}{i*60:02x}')
            
            img_path = temp_dir / f"test_image_{i+1}.jpg"
            img.save(img_path, "JPEG", quality=85)
            imagenes.append(str(img_path))
        
        return imagenes
    
    def _limpiar_archivos_temp(self, archivos: List[str]):
        """Limpia archivos temporales"""
        import os
        for archivo in archivos:
            try:
                if os.path.exists(archivo):
                    os.remove(archivo)
            except Exception:
                pass  # Ignorar errores de limpieza
    
    def _crear_mock_agent_manager(self):
        """Crea un mock del AgentManager"""
        class MockAgentManager:
            async def create_agent(self, agent_type, agent_id, custom_config):
                return agent_id
            
            async def get_system_status(self):
                return {"total_agents": 1, "system_health": "good"}
        
        return MockAgentManager()
    
    def _crear_mock_task_queue(self):
        """Crea un mock del TaskQueue"""
        class MockTaskQueue:
            def __init__(self):
                self.tasks = {}
                self.task_listeners = {}
                self.stats = {"total_tasks": 0, "queue_depth": 0}
            
            def add_task_listener(self, task_type, callback):
                self.task_listeners[task_type] = callback
            
            async def add_task(self, task):
                self.tasks[task.task_id] = task
                self.stats["total_tasks"] += 1
                self.stats["queue_depth"] += 1
                
                # Ejecutar listener si existe
                if task.payload.get("task_type") in self.task_listeners:
                    listener = self.task_listeners[task.payload["task_type"]]
                    await listener(task.payload["data"])
        
        return MockTaskQueue()


async def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Ejemplos del Agente Selector de Técnica 2D-3D")
    parser.add_argument("--config", help="Ruta al archivo de configuración")
    parser.add_argument("--mode", choices=[
        "quick", "evaluation", "comparison", "processing", 
        "simulation", "batch", "monitoring", "integration", "complete"
    ], default="complete", help="Modo de ejecución")
    parser.add_argument("--verbose", "-v", action="store_true", help="Salida detallada")
    
    args = parser.parse_args()
    
    print("🎭 AGENTE SELECTOR DE TÉCNICA 2D-3D - EJEMPLOS")
    print("=" * 60)
    print(f"Modo: {args.mode}")
    if args.config:
        print(f"Config: {args.config}")
    print("=" * 60)
    
    # Crear instancia del ejemplo
    ejemplo = EjemploAgenteSelector(args.config)
    
    try:
        # Inicializar agente
        await ejemplo.inicializar()
        
        # Ejecutar según el modo
        if args.mode == "quick":
            resultado = await procesar_rapido(
                imagenes=["demo1.jpg", "demo2.jpg"],
                presupuesto=30.0
            )
            print(f"\n✅ Procesamiento rápido completado: {resultado['exito']}")
            
        elif args.mode == "evaluation":
            await ejemplo.ejemplo_evaluacion_simple()
            
        elif args.mode == "comparison":
            await ejemplo.ejemplo_comparacion_metodos()
            
        elif args.mode == "processing":
            await ejemplo.ejemplo_procesamiento_completo()
            
        elif args.mode == "simulation":
            await ejemplo.ejemplo_simulacion_recursos()
            
        elif args.mode == "batch":
            await ejemplo.ejemplo_procesamiento_lote()
            
        elif args.mode == "monitoring":
            await ejemplo.ejemplo_monitoreo_recursos()
            
        elif args.mode == "integration":
            await ejemplo.ejemplo_integracion_orquestacion()
            
        elif args.mode == "complete":
            resultado_completo = await ejemplo.ejemplo_uso_completo()
            print(f"\n📄 Resultado completo guardado en ejemplo_resultado.json")
            
            # Guardar resultado
            with open("ejemplo_resultado.json", "w") as f:
                json.dump(resultado_completo, f, indent=2, default=str)
        
        print(f"\n🎊 Ejemplo '{args.mode}' completado exitosamente!")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Ejecución interrumpida por el usuario")
        
    except Exception as e:
        print(f"\n\n❌ Error ejecutando ejemplo: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)
        
    finally:
        # Cerrar recursos
        await ejemplo.cerrar()


if __name__ == "__main__":
    # Ejecutar ejemplos
    asyncio.run(main())
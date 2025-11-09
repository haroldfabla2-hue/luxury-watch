"""
Ejemplos de Uso - Agente 5: Optimizador de Performance
====================================================

Ejemplos prácticos y casos de uso reales para el sistema de optimización.
"""

import os
import sys
from pathlib import Path

# Importar el agente
from agent_5_optimizador_performance import AutoOptimizer, GLTFPerformanceOptimizer

def ejemplo_optimizacion_basica():
    """Ejemplo 1: Optimización básica con configuración por defecto"""
    print("\n" + "="*50)
    print("EJEMPLO 1: OPTIMIZACIÓN BÁSICA")
    print("="*50)
    
    # Crear optimizador automático
    optimizer = AutoOptimizer()
    
    # Archivos de ejemplo (reemplazar con rutas reales)
    input_file = "reloj_lujo.gltf"
    output_dir = "optimizado_basico"
    
    print(f"🔄 Optimizando: {input_file}")
    print(f"📁 Salida: {output_dir}")
    
    # Verificar que el archivo existe
    if not os.path.exists(input_file):
        print(f"⚠️ Archivo no encontrado: {input_file}")
        print("💡 Coloca un archivo .gltf en el directorio actual")
        return
    
    # Optimizar
    results = optimizer.auto_optimize(
        input_path=input_file,
        output_dir=output_dir,
        auto_detect_device=True
    )
    
    # Mostrar resultados
    print(f"\n✅ Optimización completada:")
    for device, stats in results['results_by_device'].items():
        reduction = stats.total_reduction_percent
        load_time = stats.estimated_load_mobile_ms if device == 'mobile' else \
                   stats.estimated_load_tablet_ms if device == 'tablet' else \
                   stats.estimated_load_desktop_ms
        
        print(f"  📱 {device.capitalize()}: {reduction:.1f}% reducción, {load_time}ms carga")
    
    print(f"\n📁 Archivos guardados en: {output_dir}/")

def ejemplo_optimizacion_personalizada():
    """Ejemplo 2: Optimización con configuración personalizada"""
    print("\n" + "="*50)
    print("EJEMPLO 2: OPTIMIZACIÓN PERSONALIZADA")
    print("="*50)
    
    # Crear optimizador con configuración personalizada
    config_path = "aggressive_config.json"
    optimizer = GLTFPerformanceOptimizer(config_path)
    
    input_file = "joyeria_compleja.gltf"
    output_dir = "optimizado_agresivo"
    
    print(f"🔄 Optimizando con configuración: {config_path}")
    print(f"📁 Entrada: {input_file}")
    print(f"📁 Salida: {output_dir}")
    
    # Optimizar para móvil (dispositivo más restrictivo)
    stats = optimizer.optimize_glTF(
        input_path=input_file,
        output_dir=output_dir,
        target_device="mobile"
    )
    
    print(f"\n📊 Resultados detallados:")
    print(f"  📏 Tamaño original: {stats.original_size_mb:.2f} MB")
    print(f"  📦 Tamaño optimizado: {stats.optimized_size_mb:.2f} MB")
    print(f"  📉 Reducción total: {stats.total_reduction_percent:.1f}%")
    print(f"  🏗️ Reducción geometría: {stats.geometry_reduction_percent:.1f}%")
    print(f"  🖼️ Reducción texturas: {stats.texture_reduction_percent:.1f}%")
    print(f"  ⏱️ Tiempo de procesamiento: {stats.processing_time_seconds:.2f}s")
    print(f"  📊 LODs generados: {stats.lod_levels_count}")
    print(f"  ⏱️ Tiempo de carga estimado: {stats.estimated_load_mobile_ms}ms")

def ejemplo_procesamiento_lotes():
    """Ejemplo 3: Procesamiento por lotes con monitoreo"""
    print("\n" + "="*50)
    print("EJEMPLO 3: PROCESAMIENTO POR LOTES")
    print("="*50)
    
    from concurrent.futures import ThreadPoolExecutor
    import time
    
    # Directorio con múltiples modelos
    input_dir = "modelos_entrada"
    output_dir = "modelos_optimizados"
    
    # Buscar archivos glTF
    input_path = Path(input_dir)
    if not input_path.exists():
        print(f"⚠️ Directorio no encontrado: {input_dir}")
        print("💡 Crea un directorio con archivos .gltf")
        return
    
    gltf_files = list(input_path.rglob("*.gltf")) + list(input_path.rglob("*.glb"))
    
    if not gltf_files:
        print(f"⚠️ No se encontraron archivos .gltf en: {input_dir}")
        return
    
    print(f"📦 Encontrados {len(gltf_files)} archivos para procesar")
    
    # Crear optimizador
    auto_optimizer = AutoOptimizer()
    
    # Procesamiento paralelo
    def process_file(gltf_file):
        """Procesa un solo archivo"""
        rel_path = gltf_file.relative_to(input_path)
        model_output_dir = Path(output_dir) / rel_path.parent / gltf_file.stem
        model_output_dir.mkdir(parents=True, exist_ok=True)
        
        start_time = time.time()
        results = auto_optimizer.auto_optimize(
            input_path=str(gltf_file),
            output_dir=str(model_output_dir),
            auto_detect_device=True
        )
        processing_time = time.time() - start_time
        
        # Calcular reducción promedio
        avg_reduction = sum(
            stats.total_reduction_percent 
            for stats in results['results_by_device'].values()
        ) / len(results['results_by_device'])
        
        return {
            'file': gltf_file.name,
            'reduction': avg_reduction,
            'time': processing_time,
            'success': True
        }
    
    # Procesar con barra de progreso
    print(f"\n🔄 Procesando {len(gltf_files)} archivos...")
    
    results = []
    start_total = time.time()
    
    # Procesar en paralelo (máximo 2 workers para evitar sobrecarga)
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {executor.submit(process_file, file): file for file in gltf_files}
        
        for future in futures:
            try:
                result = future.result()
                results.append(result)
                print(f"  ✅ {result['file']}: {result['reduction']:.1f}% reducción")
            except Exception as e:
                file_name = futures[future].name
                print(f"  ❌ {file_name}: Error - {e}")
                results.append({
                    'file': file_name,
                    'reduction': 0,
                    'time': 0,
                    'success': False
                })
    
    total_time = time.time() - start_total
    
    # Estadísticas finales
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    if successful:
        avg_reduction = sum(r['reduction'] for r in successful) / len(successful)
        max_reduction = max(r['reduction'] for r in successful)
        min_reduction = min(r['reduction'] for r in successful)
        
        print(f"\n📊 Estadísticas del procesamiento:")
        print(f"  ✅ Exitosos: {len(successful)}/{len(gltf_files)}")
        print(f"  📉 Reducción promedio: {avg_reduction:.1f}%")
        print(f"  📈 Reducción máxima: {max_reduction:.1f}%")
        print(f"  📉 Reducción mínima: {min_reduction:.1f}%")
        print(f"  ⏱️ Tiempo total: {total_time:.2f}s")
        print(f"  🚀 Tiempo promedio: {total_time/len(gltf_files):.2f}s por archivo")
    
    print(f"\n📁 Resultados guardados en: {output_dir}/")

def ejemplo_integracion_pipeline():
    """Ejemplo 4: Integración en pipeline de construcción"""
    print("\n" + "="*50)
    print("EJEMPLO 4: INTEGRACIÓN EN PIPELINE")
    print("="*50)
    
    def optimize_build_assets(source_dir="src/assets/3d", build_dir="dist/assets/3d"):
        """Función de ejemplo para integrar en pipeline de build"""
        print(f"🔄 Integrando optimización en pipeline de build...")
        print(f"📁 Origen: {source_dir}")
        print(f"📁 Destino: {build_dir}")
        
        # Verificar directorios
        source_path = Path(source_dir)
        if not source_path.exists():
            print(f"❌ Directorio fuente no encontrado: {source_dir}")
            return False
        
        # Crear directorio destino
        build_path = Path(build_dir)
        build_path.mkdir(parents=True, exist_ok=True)
        
        # Buscar archivos glTF
        gltf_files = list(source_path.rglob("*.gltf")) + list(source_path.rglob("*.glb"))
        
        if not gltf_files:
            print(f"ℹ️ No se encontraron archivos .gltf en: {source_dir}")
            return True
        
        print(f"📦 Optimizando {len(gltf_files)} archivos...")
        
        # Optimizar cada archivo
        auto_optimizer = AutoOptimizer()
        optimized_count = 0
        
        for gltf_file in gltf_files:
            try:
                # Crear estructura de directorios relativa
                rel_path = gltf_file.relative_to(source_path)
                model_output_dir = build_path / rel_path.parent / gltf_file.stem
                model_output_dir.mkdir(parents=True, exist_ok=True)
                
                # Optimizar
                results = auto_optimizer.auto_optimize(
                    input_path=str(gltf_file),
                    output_dir=str(model_output_dir),
                    auto_detect_device=True
                )
                
                # Mostrar resultado
                avg_reduction = sum(
                    stats.total_reduction_percent 
                    for stats in results['results_by_device'].values()
                ) / len(results['results_by_device'])
                
                print(f"  ✅ {rel_path}: {avg_reduction:.1f}% reducción")
                optimized_count += 1
                
            except Exception as e:
                print(f"  ❌ {rel_path}: Error - {e}")
        
        print(f"\n🎉 Pipeline completado:")
        print(f"  📦 Archivos procesados: {optimized_count}/{len(gltf_files)}")
        print(f"  📁 Build optimizado en: {build_dir}")
        
        return optimized_count == len(gltf_files)
    
    # Ejecutar ejemplo de integración
    success = optimize_build_assets()
    if success:
        print("✅ Integración en pipeline exitosa")
    else:
        print("⚠️ Hubo errores en la integración")

def ejemplo_analisis_avanzado():
    """Ejemplo 5: Análisis avanzado y optimización por complejidad"""
    print("\n" + "="*50)
    print("EJEMPLO 5: ANÁLISIS AVANZADO")
    print("="*50)
    
    def smart_optimize_model(input_path: str, output_dir: str):
        """Optimización inteligente basada en análisis de complejidad"""
        print(f"🔍 Análisis inteligente de: {input_path}")
        
        # Crear optimizador para análisis
        auto_optimizer = AutoOptimizer()
        
        # Analizar complejidad
        complexity = auto_optimizer._analyze_model_complexity(input_path)
        
        print(f"\n📊 Análisis de complejidad:")
        print(f"  📏 Score: {complexity['complexity_score']}/100")
        print(f"  🔢 Meshes: {complexity['mesh_count']}")
        print(f"  🖼️ Texturas: {complexity['texture_count']}")
        print(f"  💾 Tamaño texturas: {complexity['texture_size_mb']:.2f} MB")
        print(f"  🏗️ Vértices: {complexity['vertex_count']:,}")
        
        # Determinar estrategia óptima
        strategy = auto_optimizer._determine_optimization_strategy(complexity)
        device = auto_optimizer._detect_primary_device(complexity)
        
        print(f"\n🎯 Estrategia óptima:")
        print(f"  📋 Estrategia: {strategy['strategy']}")
        print(f"  📝 Descripción: {strategy['description']}")
        print(f"  📱 Dispositivo principal: {device}")
        print(f"  📊 LODs: {strategy['recommended_lod_levels']}")
        print(f"  🎨 Calidad texturas: {strategy['recommended_texture_quality']:.2f}")
        
        # Seleccionar configuración según complejidad
        if complexity['complexity_score'] < 30:
            config = "light_config.json"
            strategy_name = "light"
        elif complexity['complexity_score'] < 70:
            config = "balanced_config.json" 
            strategy_name = "balanced"
        else:
            config = "aggressive_config.json"
            strategy_name = "aggressive"
        
        print(f"\n🔧 Configuración seleccionada: {config}")
        
        # Optimizar con configuración seleccionada
        if not os.path.exists(config):
            print(f"⚠️ Configuración no encontrada, usando default")
            config = "config.json"
        
        optimizer = GLTFPerformanceOptimizer(config)
        
        start_time = time.time()
        stats = optimizer.optimize_glTF(
            input_path=input_path,
            output_dir=output_dir,
            target_device=device
        )
        processing_time = time.time() - start_time
        
        print(f"\n✅ Optimización {strategy_name} completada:")
        print(f"  📉 Reducción: {stats.total_reduction_percent:.1f}%")
        print(f"  🖼️ Reducción texturas: {stats.texture_reduction_percent:.1f}%")
        print(f"  🏗️ Reducción geometría: {stats.geometry_reduction_percent:.1f}%")
        print(f"  ⏱️ Tiempo: {processing_time:.2f}s")
        print(f"  📱 Optimizado para: {device}")
        
        return stats
    
    # Ejecutar análisis y optimización inteligente
    input_file = "modelo_complejo.gltf"
    
    if os.path.exists(input_file):
        stats = smart_optimize_model(input_file, "smart_optimized")
    else:
        print(f"⚠️ Archivo no encontrado: {input_file}")
        print("💡 Coloca un archivo .gltf en el directorio actual")

def ejemplo_monitoreo_performance():
    """Ejemplo 6: Monitoreo de performance en tiempo real"""
    print("\n" + "="*50)
    print("EJEMPLO 6: MONITOREO DE PERFORMANCE")
    print("="*50)
    
    import time
    import threading
    import psutil
    import os
    
    def monitor_system():
        """Monitor del sistema durante optimización"""
        process = psutil.Process(os.getpid())
        
        while monitor_system.running:
            cpu_percent = process.cpu_percent()
            memory_mb = process.memory_info().rss / 1024 / 1024
            
            print(f"📊 Sistema: CPU {cpu_percent:.1f}% | RAM {memory_mb:.1f}MB", end='\r')
            time.sleep(1)
    
    def optimize_with_monitoring(input_path: str, output_dir: str):
        """Optimización con monitoreo del sistema"""
        print(f"🔄 Optimizando con monitoreo: {input_path}")
        
        # Iniciar monitoreo
        monitor_system.running = True
        monitor_thread = threading.Thread(target=monitor_system)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        try:
            # Optimizar
            auto_optimizer = AutoOptimizer()
            results = auto_optimizer.auto_optimize(
                input_path=input_path,
                output_dir=output_dir,
                auto_detect_device=True
            )
            
            # Mostrar estadísticas finales
            total_time = results['total_processing_time']
            
            print(f"\n✅ Optimización completada en {total_time:.2f}s")
            
            for device, stats in results['results_by_device'].items():
                print(f"  📱 {device}: {stats.total_reduction_percent:.1f}% reducción")
                
        finally:
            # Detener monitoreo
            monitor_system.running = False
            print(f"\n📊 Monitoreo detenido")
    
    # Archivo de ejemplo
    input_file = "watch_premium.gltf"
    
    if os.path.exists(input_file):
        optimize_with_monitoring(input_file, "monitored_output")
    else:
        print(f"⚠️ Archivo no encontrado: {input_file}")
        print("💡 Coloca un archivo .gltf en el directorio actual")

def ejecutar_todos_los_ejemplos():
    """Ejecuta todos los ejemplos en secuencia"""
    print("🚀 EJECUTANDO TODOS LOS EJEMPLOS")
    print("=" * 60)
    
    ejemplos = [
        ("Optimización Básica", ejemplo_optimizacion_basica),
        ("Optimización Personalizada", ejemplo_optimizacion_personalizada),
        ("Procesamiento por Lotes", ejemplo_procesamiento_lotes),
        ("Integración en Pipeline", ejemplo_integracion_pipeline),
        ("Análisis Avanzado", ejemplo_analisis_avanzado),
        ("Monitoreo de Performance", ejemplo_monitoreo_performance)
    ]
    
    for nombre, funcion in ejemplos:
        try:
            print(f"\n🎬 Ejecutando: {nombre}")
            funcion()
            print(f"✅ {nombre} completado")
        except KeyboardInterrupt:
            print(f"\n⏹️ Ejemplos interrumpidos por el usuario")
            break
        except Exception as e:
            print(f"❌ Error en {nombre}: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n🎉 Todos los ejemplos completados")

if __name__ == "__main__":
    print("📚 EJEMPLOS DE USO - AGENTE 5: OPTIMIZADOR DE PERFORMANCE")
    print("=" * 70)
    
    # Mostrar menú de ejemplos
    ejemplos = {
        "1": ("Optimización Básica", ejemplo_optimizacion_basica),
        "2": ("Optimización Personalizada", ejemplo_optimizacion_personalizada),
        "3": ("Procesamiento por Lotes", ejemplo_procesamiento_lotes),
        "4": ("Integración en Pipeline", ejemplo_integracion_pipeline),
        "5": ("Análisis Avanzado", ejemplo_analisis_avanzado),
        "6": ("Monitoreo de Performance", ejemplo_monitoreo_performance),
        "0": ("Ejecutar Todos", ejecutar_todos_los_ejemplos)
    }
    
    print("\nEjemplos disponibles:")
    for key, (nombre, _) in ejemplos.items():
        print(f"  {key}. {nombre}")
    
    try:
        choice = input(f"\n🔢 Selecciona un ejemplo (0-{len(ejemplos)-1}): ").strip()
        
        if choice in ejemplos:
            nombre, funcion = ejemplos[choice]
            print(f"\n🎬 Ejecutando: {nombre}")
            funcion()
        else:
            print("❌ Opción inválida")
            
    except KeyboardInterrupt:
        print(f"\n👋 Ejemplos cancelados por el usuario")
    except Exception as e:
        print(f"\n❌ Error: {e}")
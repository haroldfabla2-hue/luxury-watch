#!/usr/bin/env python3
"""
Demo del Agente 5: Optimizador de Performance
=============================================

Script de demostración que muestra las capacidades del optimizador
con ejemplos de uso y casos de prueba automatizados.
"""

import os
import sys
import json
import time
import asyncio
from pathlib import Path

# Añadir el directorio actual al path para importar el agente
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from agent_5_optimizador_performance import (
        AutoOptimizer, 
        GLTFPerformanceOptimizer,
        OptimizationStats,
        DeviceOptimization
    )
except ImportError as e:
    print(f"❌ Error importando agente: {e}")
    print("💡 Ejecuta: pip install -r requirements.txt")
    sys.exit(1)

def create_sample_gltf(output_path: str):
    """Crea un archivo glTF de ejemplo para pruebas"""
    
    sample_gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Sample Model Generator"
        },
        "scenes": [
            {
                "nodes": [0]
            }
        ],
        "nodes": [
            {
                "name": "Sample Mesh",
                "mesh": 0
            }
        ],
        "meshes": [
            {
                "name": "SampleMesh",
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 0,
                            "NORMAL": 1,
                            "TEXCOORD_0": 2
                        },
                        "indices": 3,
                        "material": 0
                    }
                ]
            }
        ],
        "materials": [
            {
                "name": "SampleMaterial",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [1.0, 0.8, 0.6, 1.0],
                    "metallicFactor": 0.1,
                    "roughnessFactor": 0.8
                }
            }
        ],
        "buffers": [
            {
                "uri": "data:application/octet-stream;base64,",
                "byteLength": 0
            }
        ],
        "bufferViews": [
            {
                "buffer": 0,
                "byteOffset": 0,
                "byteLength": 0,
                "target": 34962
            }
        ],
        "accessors": []
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sample_gltf, f, indent=2)
    
    print(f"✅ Archivo de ejemplo creado: {output_path}")

def demo_basic_optimization():
    """Demostración básica de optimización"""
    print("\n🎯 DEMO 1: Optimización Básica")
    print("-" * 40)
    
    # Crear archivo de ejemplo
    sample_path = "sample_model.gltf"
    create_sample_gltf(sample_path)
    
    # Crear optimizador
    auto_optimizer = AutoOptimizer()
    
    # Optimizar automáticamente
    print(f"\n🔄 Optimizando: {sample_path}")
    start_time = time.time()
    
    results = auto_optimizer.auto_optimize(
        input_path=sample_path,
        output_dir="demo_output_basic",
        auto_detect_device=True
    )
    
    total_time = time.time() - start_time
    
    # Mostrar resultados
    print(f"\n📊 Resultados (completado en {total_time:.2f}s):")
    for device, stats in results['results_by_device'].items():
        print(f"  {device.capitalize()}: {stats.total_reduction_percent:.1f}% reducción")
    
    print(f"\n📁 Archivos guardados en: demo_output_basic/")
    
    # Limpiar archivo temporal
    os.remove(sample_path)

def demo_specific_device_optimization():
    """Demostración de optimización para dispositivo específico"""
    print("\n🎯 DEMO 2: Optimización por Dispositivo")
    print("-" * 40)
    
    # Crear archivo de ejemplo
    sample_path = "complex_model.gltf"
    create_sample_gltf(sample_path)
    
    # Crear optimizador con configuración personalizada
    optimizer = GLTFPerformanceOptimizer()
    
    devices = ['mobile', 'tablet', 'desktop']
    
    print(f"\n🔄 Optimizando para diferentes dispositivos:")
    
    for device in devices:
        print(f"\n  📱 Optimizando para {device}...")
        start_time = time.time()
        
        stats = optimizer.optimize_glTF(
            input_path=sample_path,
            output_dir=f"demo_output_{device}",
            target_device=device
        )
        
        processing_time = time.time() - start_time
        
        print(f"    ✅ Reducción: {stats.total_reduction_percent:.1f}%")
        print(f"    ⏱️ Tiempo: {processing_time:.2f}s")
        print(f"    📶 Tiempo carga estimado: {stats.estimated_load_mobile_ms if device == 'mobile' else stats.estimated_load_tablet_ms if device == 'tablet' else stats.estimated_load_desktop_ms}ms")
    
    print(f"\n📁 Archivos guardados en: demo_output_[dispositivo]/")
    
    # Limpiar archivo temporal
    os.remove(sample_path)

def demo_configuration_override():
    """Demostración de configuración personalizada"""
    print("\n🎯 DEMO 3: Configuración Personalizada")
    print("-" * 40)
    
    # Crear configuración personalizada
    custom_config = {
        "optimization": {
            "enable_draco": True,
            "draco_compression_level": 8,
            "enable_texture_compression": True,
            "texture_quality": 0.9,
            "remove_extras": True
        },
        "lod_generation": {
            "enabled": True,
            "levels": 3,
            "distance_based": True
        }
    }
    
    config_path = "custom_config.json"
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(custom_config, f, indent=2)
    
    print(f"✅ Configuración personalizada creada: {config_path}")
    
    # Crear archivo de ejemplo
    sample_path = "custom_model.gltf"
    create_sample_gltf(sample_path)
    
    # Crear optimizador con configuración personalizada
    optimizer = GLTFPerformanceOptimizer(config_path)
    
    print(f"\n🔄 Optimizando con configuración personalizada...")
    
    stats = optimizer.optimize_glTF(
        input_path=sample_path,
        output_dir="demo_output_custom",
        target_device="tablet"
    )
    
    print(f"\n📊 Resultados con configuración personalizada:")
    print(f"  🔧 Compresión Draco nivel: {stats.draco_compression_level if hasattr(stats, 'draco_compression_level') else 'N/A'}")
    print(f"  🖼️ Reducción de textura: {stats.texture_reduction_percent:.1f}%")
    print(f"  📐 Reducción de geometría: {stats.geometry_reduction_percent:.1f}%")
    print(f"  📊 Reducción total: {stats.total_reduction_percent:.1f}%")
    print(f"  ⏱️ Tiempo de procesamiento: {stats.processing_time_seconds:.2f}s")
    
    print(f"\n📁 Archivos guardados en: demo_output_custom/")
    
    # Limpiar archivos temporales
    os.remove(sample_path)
    os.remove(config_path)

def demo_batch_processing():
    """Demostración de procesamiento por lotes"""
    print("\n🎯 DEMO 4: Procesamiento por Lotes")
    print("-" * 40)
    
    # Crear múltiples archivos de ejemplo
    models = ["watch_model.gltf", "jewelry_model.gltf", "luxury_model.gltf"]
    
    print(f"\n📦 Creando {len(models)} archivos de ejemplo...")
    for model in models:
        create_sample_gltf(model)
    
    # Crear optimizador
    auto_optimizer = AutoOptimizer()
    
    print(f"\n🔄 Procesando {len(models)} modelos por lotes...")
    
    start_time = time.time()
    results_by_model = {}
    
    for model in models:
        print(f"  🔄 Procesando: {model}")
        model_start = time.time()
        
        results = auto_optimizer.auto_optimize(
            input_path=model,
            output_dir=f"batch_output_{model.replace('.gltf', '')}",
            auto_detect_device=True
        )
        
        model_time = time.time() - model_start
        results_by_model[model] = results
        
        print(f"    ✅ Completado en {model_time:.2f}s")
    
    total_time = time.time() - start_time
    
    print(f"\n📊 Resumen del procesamiento por lotes:")
    print(f"  📦 Total de modelos: {len(models)}")
    print(f"  ⏱️ Tiempo total: {total_time:.2f}s")
    print(f"  🚀 Tiempo promedio por modelo: {total_time/len(models):.2f}s")
    
    # Estadísticas generales
    total_reductions = []
    for model_results in results_by_model.values():
        for stats in model_results['results_by_device'].values():
            total_reductions.append(stats.total_reduction_percent)
    
    if total_reductions:
        avg_reduction = sum(total_reductions) / len(total_reductions)
        max_reduction = max(total_reductions)
        min_reduction = min(total_reductions)
        
        print(f"\n📈 Estadísticas de optimización:")
        print(f"  📊 Reducción promedio: {avg_reduction:.1f}%")
        print(f"  📈 Reducción máxima: {max_reduction:.1f}%")
        print(f"  📉 Reducción mínima: {min_reduction:.1f}%")
    
    print(f"\n📁 Archivos guardados en: batch_output_[modelo]/")
    
    # Limpiar archivos temporales
    for model in models:
        os.remove(model)

def demo_performance_analysis():
    """Demostración de análisis de performance detallado"""
    print("\n🎯 DEMO 5: Análisis de Performance Detallado")
    print("-" * 40)
    
    # Crear archivo de ejemplo
    sample_path = "performance_model.gltf"
    create_sample_gltf(sample_path)
    
    # Crear optimizador
    auto_optimizer = AutoOptimizer()
    
    print(f"\n🔍 Analizando complejidad del modelo...")
    
    # Análisis de complejidad
    complexity = auto_optimizer._analyze_model_complexity(sample_path)
    print(f"  📊 Score de complejidad: {complexity['complexity_score']}/100")
    print(f"  🔢 Número de meshes: {complexity['mesh_count']}")
    print(f"  🖼️ Número de texturas: {complexity['texture_count']}")
    print(f"  💾 Tamaño de texturas: {complexity['texture_size_mb']:.2f} MB")
    
    # Determinar estrategia
    strategy = auto_optimizer._determine_optimization_strategy(complexity)
    print(f"\n🎯 Estrategia recomendada:")
    print(f"  📋 Estrategia: {strategy['strategy']}")
    print(f"  📝 Descripción: {strategy['description']}")
    print(f"  🎚️ Niveles LOD recomendados: {strategy['recommended_lod_levels']}")
    print(f"  🎨 Calidad de textura recomendada: {strategy['recommended_texture_quality']:.2f}")
    
    # Detectar dispositivo principal
    primary_device = auto_optimizer._detect_primary_device(complexity)
    print(f"\n📱 Dispositivo principal detectado: {primary_device}")
    
    # Optimizar
    print(f"\n🔄 Ejecutando optimización...")
    results = auto_optimizer.auto_optimize(
        input_path=sample_path,
        output_dir="demo_output_performance",
        auto_detect_device=True
    )
    
    # Análisis detallado de resultados
    print(f"\n📊 Análisis detallado de resultados:")
    
    for device, stats in results['results_by_device'].items():
        print(f"\n  📱 {device.upper()}:")
        print(f"    📏 Tamaño original: {stats.original_size_mb:.2f} MB")
        print(f"    📦 Tamaño optimizado: {stats.optimized_size_mb:.2f} MB")
        print(f"    📉 Reducción: {stats.total_reduction_percent:.1f}%")
        print(f"    🏗️ Vértices originales: {stats.original_geometry_vertices:,}")
        print(f"    🏗️ Vértices optimizados: {stats.optimized_geometry_vertices:,}")
        print(f"    ⏱️ Tiempo de carga estimado: {stats.estimated_load_mobile_ms if device == 'mobile' else stats.estimated_load_tablet_ms if device == 'tablet' else stats.estimated_load_desktop_ms}ms")
        print(f"    📊 LODs generados: {stats.lod_levels_count}")
        print(f"    ⏱️ Tiempo de procesamiento: {stats.processing_time_seconds:.2f}s")
    
    print(f"\n📁 Archivos guardados en: demo_output_performance/")
    
    # Limpiar archivo temporal
    os.remove(sample_path)

def show_system_info():
    """Muestra información del sistema"""
    print("🔧 INFORMACIÓN DEL SISTEMA")
    print("=" * 50)
    
    # Versión de Python
    print(f"🐍 Python: {sys.version}")
    
    # Dependencias principales
    dependencies = [
        'gltf_transform',
        'numpy', 
        'PIL',
        'ujson',
        'scipy',
        'yaml'
    ]
    
    print(f"\n📦 Dependencias:")
    for dep in dependencies:
        try:
            module = __import__(dep)
            version = getattr(module, '__version__', 'N/A')
            print(f"  ✅ {dep}: {version}")
        except ImportError:
            print(f"  ❌ {dep}: No instalado")
    
    # Información de archivos
    print(f"\n📁 Archivos del agente:")
    files = [
        "agent_5_optimizador_performance.py",
        "config.json", 
        "requirements.txt",
        "setup.py",
        "README.md"
    ]
    
    for file in files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"  ✅ {file}: {size} bytes")
        else:
            print(f"  ❌ {file}: No encontrado")

def main():
    """Función principal de demostración"""
    print("🚀 DEMO DEL AGENTE 5: OPTIMIZADOR DE PERFORMANCE")
    print("=" * 60)
    print("Demostración completa de las capacidades del optimizador")
    print()
    
    # Mostrar información del sistema
    show_system_info()
    
    # Preguntar qué demos ejecutar
    print(f"\n🎯 DEMOS DISPONIBLES:")
    print("1. Optimización Básica")
    print("2. Optimización por Dispositivo") 
    print("3. Configuración Personalizada")
    print("4. Procesamiento por Lotes")
    print("5. Análisis de Performance Detallado")
    print("6. Ejecutar Todos los Demos")
    print("0. Salir")
    
    try:
        choice = input(f"\n🔢 Selecciona una opción (0-6): ").strip()
        
        if choice == "0":
            print("👋 ¡Hasta luego!")
            return
        elif choice == "1":
            demo_basic_optimization()
        elif choice == "2":
            demo_specific_device_optimization()
        elif choice == "3":
            demo_configuration_override()
        elif choice == "4":
            demo_batch_processing()
        elif choice == "5":
            demo_performance_analysis()
        elif choice == "6":
            print("\n🎬 EJECUTANDO TODOS LOS DEMOS...")
            demo_basic_optimization()
            demo_specific_device_optimization() 
            demo_configuration_override()
            demo_batch_processing()
            demo_performance_analysis()
        else:
            print("❌ Opción inválida")
            return
        
        print("\n" + "="*60)
        print("🎉 DEMO COMPLETADO")
        print("="*60)
        print("💡 Revisa los archivos generados en los directorios demo_output_*")
        print("📊 Para más información, consulta README.md")
        
    except KeyboardInterrupt:
        print("\n\n👋 Demo cancelado por el usuario")
    except Exception as e:
        print(f"\n❌ Error ejecutando demo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
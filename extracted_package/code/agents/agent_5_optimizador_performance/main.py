#!/usr/bin/env python3
"""
Script principal del Agente 5: Optimizador de Performance
========================================================

Interfaz de línea de comandos para el optimizador automático.
Permite optimización rápida desde terminal con diferentes opciones.
"""

import os
import sys
import argparse
import json
import time
from pathlib import Path

# Añadir el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from agent_5_optimizador_performance import AutoOptimizer, GLTFPerformanceOptimizer
except ImportError as e:
    print(f"❌ Error importando agente: {e}")
    print("💡 Asegúrate de que todas las dependencias estén instaladas:")
    print("   pip install -r requirements.txt")
    sys.exit(1)

def create_sample_if_needed(input_path: str):
    """Crea un archivo de ejemplo si el archivo no existe"""
    if not os.path.exists(input_path):
        print(f"⚠️ Archivo no encontrado: {input_path}")
        
        # Ofrecer crear archivo de ejemplo
        create_sample = input("¿Crear archivo de ejemplo? (s/n): ").lower().strip()
        
        if create_sample in ['s', 'si', 'y', 'yes']:
            sample_gltf = {
                "asset": {"version": "2.0", "generator": "CLI Sample"},
                "scenes": [{"nodes": [0]}],
                "nodes": [{"name": "Sample", "mesh": 0}],
                "meshes": [{
                    "name": "SampleMesh", 
                    "primitives": [{
                        "attributes": {"POSITION": 0},
                        "indices": 1
                    }]
                }],
                "materials": [{
                    "name": "SampleMaterial",
                    "pbrMetallicRoughness": {
                        "baseColorFactor": [1, 0.8, 0.6, 1]
                    }
                }],
                "buffers": [{"uri": "", "byteLength": 0}],
                "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 0}],
                "accessors": []
            }
            
            with open(input_path, 'w', encoding='utf-8') as f:
                json.dump(sample_gltf, f, indent=2)
            
            print(f"✅ Archivo de ejemplo creado: {input_path}")
            return True
        else:
            print("❌ Operación cancelada")
            return False
    
    return True

def validate_files(input_path: str, output_dir: str):
    """Valida archivos de entrada y salida"""
    # Verificar archivo de entrada
    if not os.path.exists(input_path):
        print(f"❌ Archivo no encontrado: {input_path}")
        return False
    
    if not input_path.lower().endswith(('.gltf', '.glb')):
        print(f"❌ Formato no soportado: {input_path}")
        print("💡 Solo se soportan archivos .gltf y .glb")
        return False
    
    # Crear directorio de salida
    try:
        os.makedirs(output_dir, exist_ok=True)
    except Exception as e:
        print(f"❌ Error creando directorio de salida: {e}")
        return False
    
    return True

def show_banner():
    """Muestra banner del agente"""
    print("🚀 AGENTE 5: OPTIMIZADOR DE PERFORMANCE")
    print("=" * 60)
    print("Sistema avanzado de optimización automática para modelos 3D")
    print("Compresión Draco + KTX2 + LODs automáticos")
    print("=" * 60)

def optimize_single_file(args):
    """Optimiza un solo archivo"""
    print(f"\n🔄 Optimizando: {args.input}")
    print(f"📁 Salida: {args.output}")
    print(f"🎯 Dispositivo: {args.device}")
    
    if args.device and args.device != 'auto':
        # Optimización para dispositivo específico
        optimizer = GLTFPerformanceOptimizer(args.config)
        stats = optimizer.optimize_glTF(
            input_path=args.input,
            output_dir=args.output,
            target_device=args.device
        )
        
        # Mostrar resultados
        print(f"\n✅ Optimización completada en {stats.processing_time_seconds:.2f}s")
        print(f"📊 Reducción lograda: {stats.total_reduction_percent:.1f}%")
        
        load_time = stats.estimated_load_mobile_ms if args.device == 'mobile' else \
                   stats.estimated_load_tablet_ms if args.device == 'tablet' else \
                   stats.estimated_load_desktop_ms
        
        print(f"⏱️ Tiempo de carga estimado: {load_time}ms")
        
        # Generar reporte
        if args.report:
            report_path = os.path.join(args.output, f"{args.device}_report.json")
            optimizer.generate_optimization_report(stats, report_path, args.device)
            print(f"📋 Reporte guardado: {report_path}")
    
    else:
        # Optimización automática para todos los dispositivos
        auto_optimizer = AutoOptimizer()
        results = auto_optimizer.auto_optimize(
            input_path=args.input,
            output_dir=args.output,
            auto_detect_device=True
        )
        
        # Mostrar resultados
        print(f"\n✅ Optimización completada en {results['total_processing_time']:.2f}s")
        
        print(f"\n📊 Resultados por dispositivo:")
        for device, stats in results['results_by_device'].items():
            reduction = stats.total_reduction_percent
            load_time = stats.estimated_load_mobile_ms if device == 'mobile' else \
                       stats.estimated_load_tablet_ms if device == 'tablet' else \
                       stats.estimated_load_desktop_ms
            
            print(f"  📱 {device.capitalize()}: {reduction:.1f}% reducción, {load_time}ms carga")
        
        # Generar reporte maestro
        if args.report:
            master_report_path = os.path.join(args.output, "master_optimization_report.json")
            with open(master_report_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"📋 Reporte maestro guardado: {master_report_path}")

def batch_optimize(args):
    """Procesamiento por lotes"""
    input_dir = Path(args.batch_input)
    output_dir = Path(args.output)
    
    if not input_dir.exists():
        print(f"❌ Directorio de entrada no encontrado: {input_dir}")
        return
    
    # Buscar archivos glTF
    gltf_files = list(input_dir.rglob("*.gltf")) + list(input_dir.rglob("*.glb"))
    
    if not gltf_files:
        print(f"❌ No se encontraron archivos .gltf o .glb en: {input_dir}")
        return
    
    print(f"📦 Encontrados {len(gltf_files)} archivos para procesar")
    
    auto_optimizer = AutoOptimizer()
    successful = 0
    failed = 0
    
    start_time = time.time()
    
    for i, gltf_file in enumerate(gltf_files, 1):
        print(f"\n[{i}/{len(gltf_files)}] Procesando: {gltf_file.name}")
        
        # Crear directorio de salida relativo
        rel_path = gltf_file.relative_to(input_dir)
        model_output_dir = output_dir / rel_path.parent / gltf_file.stem
        model_output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
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
            
            print(f"  ✅ Reducción promedio: {avg_reduction:.1f}%")
            successful += 1
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            failed += 1
    
    total_time = time.time() - start_time
    
    print(f"\n📊 Procesamiento por lotes completado:")
    print(f"  ✅ Exitosos: {successful}")
    print(f"  ❌ Fallidos: {failed}")
    print(f"  ⏱️ Tiempo total: {total_time:.2f}s")
    print(f"  🚀 Tiempo promedio: {total_time/len(gltf_files):.2f}s por archivo")

def analyze_model(args):
    """Análisis de modelo sin optimizar"""
    print(f"\n🔍 Analizando: {args.analyze}")
    
    auto_optimizer = AutoOptimizer()
    
    # Análisis de complejidad
    complexity = auto_optimizer._analyze_model_complexity(args.analyze)
    
    print(f"\n📊 Análisis de complejidad:")
    print(f"  📏 Score: {complexity['complexity_score']}/100")
    print(f"  🔢 Meshes: {complexity['mesh_count']}")
    print(f"  🖼️ Texturas: {complexity['texture_count']}")
    print(f"  💾 Tamaño texturas: {complexity['texture_size_mb']:.2f} MB")
    print(f"  🏗️ Vértices estimados: {complexity['vertex_count']:,}")
    
    # Estrategia recomendada
    strategy = auto_optimizer._determine_optimization_strategy(complexity)
    device = auto_optimizer._detect_primary_device(complexity)
    
    print(f"\n🎯 Recomendaciones:")
    print(f"  📋 Estrategia: {strategy['strategy']}")
    print(f"  📝 Descripción: {strategy['description']}")
    print(f"  📱 Dispositivo principal: {device}")
    print(f"  📊 LODs recomendados: {strategy['recommended_lod_levels']}")
    print(f"  🎨 Calidad texturas: {strategy['recommended_texture_quality']:.2f}")

def list_configs():
    """Lista configuraciones disponibles"""
    configs = {
        'light_config.json': 'Ligera (modelos simples)',
        'balanced_config.json': 'Balanceada (modelos medios)',
        'aggressive_config.json': 'Agresiva (modelos complejos)',
        'config.json': 'Por defecto'
    }
    
    print("📋 Configuraciones disponibles:")
    for config, description in configs.items():
        if os.path.exists(config):
            print(f"  ✅ {config}: {description}")
        else:
            print(f"  ❌ {config}: No encontrado")

def main():
    """Función principal del CLI"""
    parser = argparse.ArgumentParser(
        description="Agente 5: Optimizador de Performance para modelos 3D glTF",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:

  # Optimización básica automática
  python main.py input/model.gltf output/

  # Optimización específica para móvil
  python main.py input/model.gltf output/ --device mobile

  # Optimización con configuración personalizada
  python main.py input/model.gltf output/ --config aggressive_config.json

  # Procesamiento por lotes
  python main.py --batch input_models/ output_optimized/

  # Análisis de modelo
  python main.py --analyze input/model.gltf

  # Ver configuraciones disponibles
  python main.py --list-configs

  # Ejecutar demo interactivo
  python main.py --demo
        """
    )
    
    # Argumentos principales
    parser.add_argument('input', nargs='?', help='Archivo o directorio de entrada')
    parser.add_argument('output', nargs='?', help='Directorio de salida')
    
    # Opciones de optimización
    parser.add_argument('-d', '--device', choices=['mobile', 'tablet', 'desktop', 'auto'],
                       help='Dispositivo objetivo (default: auto)')
    parser.add_argument('-c', '--config', default='config.json',
                       help='Archivo de configuración (default: config.json)')
    parser.add_argument('-r', '--report', action='store_true',
                       help='Generar reporte detallado')
    
    # Modo batch
    parser.add_argument('-b', '--batch', dest='batch_input', metavar='DIR',
                       help='Procesar directorio completo por lotes')
    
    # Análisis
    parser.add_argument('-a', '--analyze', metavar='FILE',
                       help='Analizar modelo sin optimizar')
    
    # Utilidades
    parser.add_argument('--list-configs', action='store_true',
                       help='Listar configuraciones disponibles')
    parser.add_argument('--demo', action='store_true',
                       help='Ejecutar demo interactivo')
    parser.add_argument('--version', action='store_true',
                       help='Mostrar versión')
    
    args = parser.parse_args()
    
    # Mostrar banner
    if not any([args.list_configs, args.demo, args.version]):
        show_banner()
    
    # Mostrar versión
    if args.version:
        try:
            with open('VERSION.txt', 'r') as f:
                version = f.read().strip()
            print(f"Agente 5: Optimizador de Performance v{version}")
        except:
            print("Agente 5: Optimizador de Performance v1.0.0")
        return
    
    # Listar configuraciones
    if args.list_configs:
        list_configs()
        return
    
    # Ejecutar demo
    if args.demo:
        try:
            os.system("python demo.py")
        except Exception as e:
            print(f"❌ Error ejecutando demo: {e}")
        return
    
    # Análisis de modelo
    if args.analyze:
        if not validate_files(args.analyze, '.'):
            return
        analyze_model(args)
        return
    
    # Procesamiento por lotes
    if args.batch_input:
        batch_optimize(args)
        return
    
    # Validar argumentos principales
    if not args.input or not args.output:
        parser.print_help()
        return
    
    # Validar archivos
    if not create_sample_if_needed(args.input):
        return
    
    if not validate_files(args.input, args.output):
        return
    
    # Ejecutar optimización
    try:
        optimize_single_file(args)
        
        print(f"\n🎉 ¡Optimización completada!")
        print(f"📁 Revisa los resultados en: {args.output}")
        
    except KeyboardInterrupt:
        print(f"\n\n⏹️ Optimización cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error durante la optimización: {e}")
        import traceback
        if '--verbose' in sys.argv or '-v' in sys.argv:
            traceback.print_exc()

if __name__ == "__main__":
    main()
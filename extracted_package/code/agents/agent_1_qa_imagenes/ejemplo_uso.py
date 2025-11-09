"""
Ejemplo de uso del Agente 1: Analista de Calidad de Imágenes
Demuestra diferentes casos de uso e integraciones
"""

import asyncio
import sys
from pathlib import Path

# Agregar src al path
sys.path.append(str(Path(__file__).parent / "src"))
sys.path.append(str(Path(__file__).parent / "api"))

from config import AgentConfig, get_config
from src.image_quality_analyzer import ImageQualityAnalyzer, QualityAnalysisRequest
from src.queue_integration import handle_queue_task

async def ejemplo_analisis_individual():
    """Ejemplo 1: Análisis individual de imagen"""
    print("=== Ejemplo 1: Análisis Individual ===")
    
    # Configurar analyzer
    config = get_config("default")
    analyzer = ImageQualityAnalyzer(config)
    
    # Crear imagen de prueba si no existe
    test_image_path = "tests/test_images/demo_image.jpg"
    if not Path(test_image_path).exists():
        await crear_imagen_demo(test_image_path)
    
    # Crear request de análisis
    request = QualityAnalysisRequest(
        image_path=test_image_path,
        analysis_options={
            "include_detailed_metrics": True,
            "include_histogram": True,
            "include_recommendations": True
        }
    )
    
    # Ejecutar análisis
    print(f"Analizando imagen: {test_image_path}")
    result = await analyzer.analyze_image(request)
    
    # Mostrar resultados
    print(f"\n📊 RESULTADOS DEL ANÁLISIS")
    print(f"Imagen: {result.image_path}")
    print(f"Score General: {result.overall_score:.1f}/100 ({result.overall_level.value.upper()})")
    print(f"Tiempo: {result.processing_time:.2f}s")
    
    print(f"\n🔍 MÉTRICAS DETALLADAS:")
    print(f"  BRISQUE: {result.brisque_score:.1f} ({result.brisque_quality_level.value})")
    print(f"  Nitidez: {result.sharpness_variance:.1f} ({result.sharpness_level.value})")
    print(f"  Exposición: {result.exposure_balance_score:.1f} ({result.exposure_level.value})")
    print(f"  Resolución: {result.width}x{result.height} = {result.total_pixels/1000000:.1f}MP ({result.resolution_level.value})")
    print(f"  Aspect Ratio: {result.aspect_ratio:.2f} ({result.aspect_ratio_level.value})")
    
    if result.issues_detected:
        print(f"\n⚠️  PROBLEMAS DETECTADOS:")
        for issue in result.issues_detected:
            print(f"  • {issue}")
    
    if result.recommendations:
        print(f"\n💡 RECOMENDACIONES:")
        for rec in result.recommendations:
            print(f"  • {rec}")
    
    return result

async def ejemplo_analisis_lotes():
    """Ejemplo 2: Análisis por lotes"""
    print("\n=== Ejemplo 2: Análisis por Lotes ===")
    
    config = get_config("bulk")  # Usar configuración optimizada para lotes
    analyzer = ImageQualityAnalyzer(config)
    
    # Crear múltiples imágenes de prueba
    image_paths = []
    for i in range(3):
        image_path = f"tests/test_images/demo_batch_{i}.jpg"
        await crear_imagen_demo(image_path, variant=i)
        image_paths.append(image_path)
    
    # Crear requests
    requests = [
        QualityAnalysisRequest(image_path=path)
        for path in image_paths
    ]
    
    print(f"Analizando {len(requests)} imágenes en lote...")
    
    # Ejecutar análisis por lotes
    results = await analyzer.analyze_batch(requests)
    
    # Mostrar resumen
    print(f"\n📊 RESUMEN DEL ANÁLISIS POR LOTES")
    print(f"Total imágenes: {len(results)}")
    
    # Contar por nivel de calidad
    quality_counts = {}
    total_score = 0
    
    for result in results:
        level = result.overall_level.value
        quality_counts[level] = quality_counts.get(level, 0) + 1
        total_score += result.overall_score
    
    print(f"Distribución por calidad:")
    for level, count in quality_counts.items():
        print(f"  {level.upper()}: {count}")
    
    print(f"Score promedio: {total_score/len(results):.1f}/100")
    
    # Mostrar detalles de cada imagen
    print(f"\nDetalle por imagen:")
    for i, result in enumerate(results):
        print(f"  Imagen {i+1}: {Path(result.image_path).name} - {result.overall_score:.1f} ({result.overall_level.value})")
    
    return results

async def ejemplo_uso_api_analog():
    """Ejemplo 3: Simulación de uso API (sin servidor)"""
    print("\n=== Ejemplo 3: Simulación de API ===")
    
    # Simular diferentes tipos de solicitudes API
    api_requests = [
        {
            "name": "Análisis básico",
            "task_type": "analyze_image",
            "image_source": {"path": "tests/test_images/demo_api_basic.jpg"},
            "analysis_options": {"include_detailed_metrics": False}
        },
        {
            "name": "Análisis con detalles",
            "task_type": "analyze_image", 
            "image_source": {"path": "tests/test_images/demo_api_detailed.jpg"},
            "analysis_options": {
                "include_detailed_metrics": True,
                "include_recommendations": True
            }
        },
        {
            "name": "Análisis por lotes",
            "task_type": "analyze_batch",
            "image_sources": [
                {"path": "tests/test_images/demo_batch_0.jpg"},
                {"path": "tests/test_images/demo_batch_1.jpg"}
            ],
            "analysis_options": {}
        }
    ]
    
    # Crear imágenes de prueba
    for i, req in enumerate(api_requests):
        if "image_source" in req:
            image_path = req["image_source"]["path"]
            await crear_imagen_demo(image_path, variant=i+10)
        elif "image_sources" in req:
            for j, source in enumerate(req["image_sources"]):
                image_path = source["path"]
                await crear_imagen_demo(image_path, variant=i*10+j)
    
    # Procesar solicitudes como si vinieran de la API
    results = []
    for req in api_requests:
        print(f"\nProcesando: {req['name']}")
        
        if req["task_type"] == "analyze_image":
            result = await handle_queue_task(req)
            results.append(result)
            
            if result.get("success"):
                print(f"  ✓ Score: {result['result']['overall_score']:.1f}")
            else:
                print(f"  ✗ Error: {result.get('error', 'Unknown')}")
                
        elif req["task_type"] == "analyze_batch":
            result = await handle_queue_task(req)
            results.append(result)
            
            if result.get("success"):
                print(f"  ✓ {result['successful_analyses']}/{result['total_images']} imágenes analizadas")
            else:
                print(f"  ✗ Error: {result.get('error', 'Unknown')}")
    
    return results

async def ejemplo_comparacion_configuraciones():
    """Ejemplo 4: Comparar diferentes configuraciones"""
    print("\n=== Ejemplo 4: Comparación de Configuraciones ===")
    
    # Crear imagen de prueba
    test_image_path = "tests/test_images/demo_comparison.jpg"
    await crear_imagen_demo(test_image_path)
    
    # Probar diferentes configuraciones
    configs = [
        ("Default", get_config("default")),
        ("Premium", get_config("premium")),
        ("Bulk", get_config("bulk"))
    ]
    
    results = []
    
    for config_name, config in configs:
        print(f"\nProbando configuración: {config_name}")
        
        analyzer = ImageQualityAnalyzer(config)
        request = QualityAnalysisRequest(image_path=test_image_path)
        
        result = await analyzer.analyze_image(request)
        results.append((config_name, result))
        
        print(f"  Score: {result.overall_score:.1f}")
        print(f"  Tiempo: {result.processing_time:.2f}s")
        print(f"  Cache size: {len(analyzer.analysis_cache)}")
    
    print(f"\n📊 COMPARACIÓN FINAL:")
    print(f"{'Config':<12} {'Score':<8} {'Tiempo':<8} {'Cache':<8}")
    print("-" * 40)
    for config_name, result in results:
        print(f"{config_name:<12} {result.overall_score:<8.1f} {result.processing_time:<8.2f} {len(result.analysis_cache) if hasattr(result, 'analysis_cache') else 'N/A':<8}")
    
    return results

async def ejemplo_reporte_calidad():
    """Ejemplo 5: Generar reporte de calidad detallado"""
    print("\n=== Ejemplo 5: Reporte de Calidad Detallado ===")
    
    config = get_config("premium")
    analyzer = ImageQualityAnalyzer(config)
    
    # Crear imagen de prueba
    test_image_path = "tests/test_images/demo_report.jpg"
    await crear_imagen_demo(test_image_path)
    
    # Crear request con todas las opciones
    request = QualityAnalysisRequest(
        image_path=test_image_path,
        analysis_options={
            "include_detailed_metrics": True,
            "include_histogram": True,
            "include_recommendations": True
        }
    )
    
    result = await analyzer.analyze_image(request)
    
    # Generar reporte como JSON
    report = {
        "metadata": {
            "report_type": "detailed_quality_analysis",
            "timestamp": result.analysis_timestamp.isoformat(),
            "agent_version": "1.0.0",
            "analyzer_id": config.agent_id
        },
        "image_info": {
            "path": result.image_path,
            "file_size_bytes": result.file_size,
            "format": result.image_format,
            "dimensions": {
                "width": result.width,
                "height": result.height,
                "megapixels": result.total_pixels / 1000000
            }
        },
        "quality_assessment": {
            "overall_score": result.overall_score,
            "quality_level": result.overall_level.value,
            "grade": calcular_letra_grade(result.overall_score)
        },
        "detailed_metrics": {
            "brisque": {
                "score": result.brisque_score,
                "level": result.brisque_quality_level.value,
                "interpretation": interpretar_brisque(result.brisque_score)
            },
            "sharpness": {
                "variance": result.sharpness_variance,
                "score": result.sharpness_score,
                "level": result.sharpness_level.value,
                "interpretation": interpretar_nitidez(result.sharpness_variance)
            },
            "exposure": {
                "balance_score": result.exposure_balance_score,
                "level": result.exposure_level.value,
                "histogram": result.exposure_histogram,
                "interpretation": interpretar_exposicion(result.exposure_balance_score)
            },
            "resolution": {
                "score": result.resolution_score,
                "level": result.resolution_level.value,
                "adequate_for_print": result.total_pixels >= 2000000,
                "adequate_for_web": result.total_pixels >= 500000
            },
            "aspect_ratio": {
                "ratio": result.aspect_ratio,
                "score": result.aspect_ratio_score,
                "level": result.aspect_ratio_level.value
            }
        },
        "issues_and_recommendations": {
            "issues_detected": result.issues_detected,
            "recommendations": result.recommendations
        },
        "technical_details": {
            "processing_time_seconds": result.processing_time,
            "image_hash": result.image_hash
        }
    }
    
    # Guardar reporte
    report_path = "tests/reporte_calidad_demo.json"
    import json
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"Reporte detallado guardado en: {report_path}")
    print(f"Calificación general: {report['quality_assessment']['grade']}")
    print(f"Score: {report['quality_assessment']['overall_score']:.1f}/100")
    
    return report

# Funciones auxiliares
async def crear_imagen_demo(path: str, variant: int = 0):
    """Crear imagen de demostración para testing"""
    import numpy as np
    import cv2
    
    # Crear imagen base
    width, height = 1200, 800
    image = np.ones((height, width, 3), dtype=np.uint8)
    
    # Variar características según el variant
    if variant == 0:
        # Imagen estándar
        image[:, :] = [128, 128, 128]  # Gris medio
        cv2.rectangle(image, (100, 100), (400, 300), (255, 255, 255), -1)
        cv2.circle(image, (800, 400), 80, (0, 255, 0), -1)
        cv2.putText(image, "STANDARD IMAGE", (300, 600), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 0, 0), 3)
    
    elif variant == 1:
        # Imagen más brillante
        image[:, :] = [200, 200, 200]  # Más brillante
        cv2.rectangle(image, (200, 200), (500, 400), (255, 255, 255), -1)
        cv2.circle(image, (700, 350), 60, (0, 200, 100), -1)
        cv2.putText(image, "BRIGHT IMAGE", (350, 650), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (100, 0, 200), 2)
    
    elif variant == 2:
        # Imagen más oscura
        image[:, :] = [50, 50, 50]  # Más oscura
        cv2.rectangle(image, (150, 150), (450, 350), (200, 200, 200), -1)
        cv2.circle(image, (750, 300), 40, (100, 255, 100), -1)
        cv2.putText(image, "DARK IMAGE", (400, 600), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (200, 200, 200), 2)
    
    elif variant == 10:
        # Imagen con alta resolución simulada
        image[:, :] = [120, 120, 120]
        cv2.rectangle(image, (50, 50), (600, 400), (255, 255, 255), -1)
        for i in range(20):
            cv2.circle(image, (i*50 + 100, 100), 20, (0, i*12, 255-i*12), -1)
        cv2.putText(image, "HIGH RES", (400, 500), cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 255, 0), 4)
    
    elif variant == 11:
        # Imagen detallada
        image[:, :] = [100, 100, 150]
        # Agregar más detalles
        for i in range(10):
            cv2.rectangle(image, (i*100, i*50), (i*100+80, i*50+40), (255-i*20, i*25, i*15), -1)
        cv2.putText(image, "DETAILED", (400, 700), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 255), 3)
    
    else:
        # Imagen genérica
        image[:, :] = [80, 80, 80]
        cv2.rectangle(image, (100, 100), (500, 300), (200, 200, 200), -1)
        cv2.circle(image, (700, 400), 100, (150, 150, 150), -1)
        cv2.putText(image, f"VARIANT {variant}", (300, 600), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    # Crear directorio si no existe
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    
    # Guardar imagen
    cv2.imwrite(path, image)
    print(f"Imagen demo creada: {path}")

def calcular_letra_grade(score: float) -> str:
    """Convertir score numérico a letra"""
    if score >= 95: return 'A+'
    elif score >= 90: return 'A'
    elif score >= 85: return 'A-'
    elif score >= 80: return 'B+'
    elif score >= 75: return 'B'
    elif score >= 70: return 'B-'
    elif score >= 65: return 'C+'
    elif score >= 60: return 'C'
    elif score >= 55: return 'C-'
    elif score >= 50: return 'D+'
    elif score >= 45: return 'D'
    else: return 'F'

def interpretar_brisque(score: float) -> str:
    """Interpretar score BRISQUE"""
    if score < 20: return "Excelente calidad, prácticamente sin distorsiones"
    elif score < 35: return "Buena calidad con distorsiones menores"
    elif score < 50: return "Calidad moderada, algunas distorsiones visibles"
    else: return "Calidad deficiente, distorsiones significativas"

def interpretar_nitidez(variance: float) -> str:
    """Interpretar score de nitidez"""
    if variance >= 500: return "Excelente nitidez"
    elif variance >= 300: return "Buena nitidez"
    elif variance >= 100: return "Nitidez moderada"
    else: return "Nitidez deficiente, imagen desenfocada"

def interpretar_exposicion(balance_score: float) -> str:
    """Interpretar balance de exposición"""
    if balance_score >= 90: return "Exposición perfectamente balanceada"
    elif balance_score >= 75: return "Buena exposición general"
    elif balance_score >= 60: return "Exposición aceptable con ligeras desviaciones"
    else: return "Problemas de exposición evidentes"

async def main():
    """Función principal para ejecutar todos los ejemplos"""
    print("🎯 EJEMPLOS DEL AGENTE 1: ANALISTA DE CALIDAD DE IMÁGENES")
    print("=" * 60)
    
    try:
        # Ejecutar todos los ejemplos
        await ejemplo_analisis_individual()
        await ejemplo_analisis_lotes()
        await ejemplo_uso_api_analog()
        await ejemplo_comparacion_configuraciones()
        await ejemplo_reporte_calidad()
        
        print("\n✅ Todos los ejemplos ejecutados exitosamente!")
        print("\n📁 Archivos generados:")
        print("  - tests/test_images/ (imágenes de prueba)")
        print("  - tests/reporte_calidad_demo.json (reporte detallado)")
        
    except Exception as e:
        print(f"\n❌ Error ejecutando ejemplos: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
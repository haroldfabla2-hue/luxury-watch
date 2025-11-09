#!/usr/bin/env python3
"""
Ejemplo Básico de Uso del Validador 3D
=====================================

Ejemplo simple que demuestra cómo usar el Agente 4: Validador de Calidad 3D
para validar un modelo 3D y generar reportes.
"""

import os
import sys
from pathlib import Path

# Agregar el directorio padre al path para importar el validador
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from validador_3d_principal import Validador3DPrincipal
from config import cargar_configuracion, configurar_para_web

def ejemplo_basico():
    """Ejemplo básico de validación de un modelo 3D."""
    print("=== EJEMPLO BÁSICO: Validación de Modelo 3D ===\n")
    
    # Ruta del archivo de ejemplo (ajustar según tu caso)
    archivo_modelo = "ejemplo_modelo.gltf"  # Cambiar por tu archivo
    
    if not os.path.exists(archivo_modelo):
        print(f"⚠️  Archivo {archivo_modelo} no encontrado.")
        print("   Crea un archivo de ejemplo o ajusta la ruta en el script.")
        return
    
    try:
        # Crear validador con configuración por defecto
        validador = Validador3DPrincipal()
        
        print(f"📁 Validando archivo: {archivo_modelo}")
        
        # Realizar validación
        resultados = validador.validar_archivo(archivo_modelo)
        
        # Mostrar resumen
        resumen = validador.obtener_resumen()
        print(f"\n📊 RESUMEN DE VALIDACIÓN:")
        print(f"   • Archivo: {resumen['archivo']}")
        print(f"   • Puntuación: {resumen['puntuacion_calidad']:.1f}/10")
        print(f"   • Problemas detectados: {resumen['problemas_detectados']}")
        print(f"   • Corregible automáticamente: {'Sí' if resumen['corregible_automaticamente'] else 'No'}")
        
        # Mostrar problemas principales
        if resultados['problemas_detectados']:
            print(f"\n⚠️  PROBLEMAS PRINCIPALES:")
            for i, problema in enumerate(resultados['problemas_detectados'][:3], 1):
                print(f"   {i}. {problema['problema']}: {problema['descripcion']}")
        
        # Mostrar recomendaciones
        if resultados['recomendaciones']:
            print(f"\n💡 RECOMENDACIONES:")
            for i, rec in enumerate(resultados['recomendaciones'][:3], 1):
                print(f"   {i}. {rec}")
        
        # Generar reportes
        print(f"\n📝 GENERANDO REPORTES...")
        
        # Reporte HTML
        reporte_html = validador.generar_reporte_html("ejemplo_reporte.html")
        print(f"   ✅ Reporte HTML: {reporte_html}")
        
        # Reporte JSON
        reporte_json = validador.generar_reporte_json("ejemplo_reporte.json")
        print(f"   ✅ Reporte JSON: {reporte_json}")
        
        # Aplicar correcciones automáticas si es posible
        if resultados.get('corregible_automaticamente'):
            print(f"\n🔧 APLICANDO CORRECCIONES AUTOMÁTICAS...")
            correccion = validador.corregir_automaticamente(archivo_modelo, "./corregidos_ejemplo/")
            if correccion['exito']:
                print(f"   ✅ Corrección completada")
                print(f"   • Archivos modificados: {len(correccion.get('archivos_modificados', []))}")
            else:
                print(f"   ⚠️  Corrección no completada: {correccion.get('mensaje', 'Error desconocido')}")
        
        print(f"\n🎉 VALIDACIÓN COMPLETADA")
        
    except Exception as e:
        print(f"❌ Error durante la validación: {str(e)}")

def ejemplo_configuracion_personalizada():
    """Ejemplo con configuración personalizada para web."""
    print("\n=== EJEMPLO: Configuración Personalizada para Web ===\n")
    
    archivo_modelo = "ejemplo_modelo_web.gltf"
    
    if not os.path.exists(archivo_modelo):
        print(f"⚠️  Archivo {archivo_modelo} no encontrado.")
        return
    
    try:
        # Usar configuración optimizada para web
        config_web = configurar_para_web()
        
        # Personalizar algunos parámetros
        config_web['texturas']['resolucion_minima'] = 256
        config_web['corrector']['auto_correct'] = True
        
        print("🔧 Configuración aplicada:")
        print(f"   • Resolución mínima de texturas: {config_web['texturas']['resolucion_minima']}px")
        print(f"   • Corrección automática: {config_web['corrector']['auto_correct']}")
        
        # Crear validador con configuración personalizada
        validador = Validador3DPrincipal(config_web)
        
        print(f"\n📁 Validando con configuración web: {archivo_modelo}")
        resultados = validador.validar_archivo(archivo_modelo)
        
        # Mostrar puntuación específica
        if 'formato' in resultados.get('validadores', {}):
            fmt_score = resultados['validadores']['formato'].get('puntuacion', 0)
            print(f"   • Puntuación de formato: {fmt_score:.1f}/10")
        
        print(f"\n🎉 Validación web completada")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def ejemplo_validacion_rapida():
    """Ejemplo de validación rápida para CI/CD."""
    print("\n=== EJEMPLO: Validación Rápida para CI/CD ===\n")
    
    def validar_para_pipeline(archivo):
        """Función de validación para pipeline de CI/CD."""
        try:
            validador = Validador3DPrincipal()
            resultados = validador.validar_archivo(archivo)
            
            # Criterios de aprobación
            puntuacion_minima = 7.0
            max_problemas_criticos = 2
            
            problemas_criticos = [
                p for p in resultados['problemas_detectados'] 
                if p['severidad'] > 0.7
            ]
            
            if (resultados['puntuacion_calidad'] < puntuacion_minima or
                len(problemas_criticos) > max_problemas_criticos):
                
                print("❌ VALIDACIÓN FALLÓ")
                print(f"   • Puntuación: {resultados['puntuacion_calidad']:.1f} (mín: {puntuacion_minima})")
                print(f"   • Problemas críticos: {len(problemas_criticos)} (máx: {max_problemas_criticos})")
                
                # Generar reporte para debugging
                validador.generar_reporte_html('reporte_fallo.html')
                return False
            
            print("✅ VALIDACIÓN EXITOSA")
            print(f"   • Puntuación: {resultados['puntuacion_calidad']:.1f}")
            print(f"   • Problemas críticos: {len(problemas_criticos)}")
            return True
            
        except Exception as e:
            print(f"❌ ERROR EN VALIDACIÓN: {str(e)}")
            return False
    
    # Simular validación en pipeline
    archivo_test = "ejemplo_pipeline.gltf"
    
    if not os.path.exists(archivo_test):
        print(f"⚠️  Archivo {archivo_test} no encontrado.")
        print("   Simulando validación con archivo hypothetical...")
        # En un caso real, esto sería el archivo del pipeline
        archivo_test = "ejemplo_modelo.gltf"
    
    resultado = validar_para_pipeline(archivo_test)
    
    if resultado:
        print("\n🚀 MODELO APROBADO PARA PRODUCCIÓN")
    else:
        print("\n🛑 MODELO RECHAZADO - REVISIÓN REQUERIDA")

def ejemplo_analisis_profundo():
    """Ejemplo de análisis detallado."""
    print("\n=== EJEMPLO: Análisis Profundo ===\n")
    
    archivo_modelo = "ejemplo_modelo.gltf"
    
    if not os.path.exists(archivo_modelo):
        print(f"⚠️  Archivo {archivo_modelo} no encontrado.")
        return
    
    try:
        validador = Validador3DPrincipal()
        resultados = validador.validar_archivo(archivo_modelo)
        
        print("🔬 ANÁLISIS DETALLADO:")
        
        # Análisis geométrico detallado
        if 'geometrico' in resultados.get('validadores', {}):
            geo = resultados['validadores']['geometrico']
            stats = geo.get('estadisticas', {})
            
            print(f"\n📐 GEOMETRÍA:")
            print(f"   • Vértices: {stats.get('num_vertices', 'N/A'):,}")
            print(f"   • Triángulos: {stats.get('num_triangulos', 'N/A'):,}")
            print(f"   • Ratio triangulos/vértices: {stats.get('ratio_triangulos_vertices', 0):.2f}")
            print(f"   • Área superficie: {stats.get('area_superficie', 0):.2f}")
            print(f"   • Volumen aproximado: {stats.get('volumen_aproximado', 0):.2f}")
        
        # Análisis de texturas
        if 'texturas' in resultados.get('validadores', {}):
            tex = resultados['validadores']['texturas']
            stats = tex.get('estadisticas', {})
            
            print(f"\n🖼️  TEXTURAS:")
            print(f"   • Total texturas: {stats.get('total_texturas', 'N/A')}")
            print(f"   • Resolución promedio: {stats.get('resolucion_promedio', 0):,.0f} píxeles")
            print(f"   • Tamaño total: {stats.get('tamaño_total_archivos', 0) / (1024*1024):.1f} MB")
            print(f"   • Artifacts detectados: {len(tex.get('artifacts_detectados', []))}")
        
        # Análisis de métricas
        if 'metricas' in resultados.get('validadores', {}):
            met = resultados['validadores']['metricas']
            metricas = met.get('metricas', {})
            
            print(f"\n📊 MÉTRICAS DE CALIDAD:")
            for nombre, valores in metricas.items():
                if isinstance(valores, dict) and 'promedio' in valores:
                    promedio = valores['promedio']
                    if isinstance(promedio, (int, float)):
                        print(f"   • {nombre.upper()}: {promedio:.4f}")
        
        print(f"\n📋 DETALLES TÉCNICOS:")
        print(f"   • Timestamp: {resultados.get('timestamp', 'N/A')}")
        print(f"   • Tipo archivo: {resultados.get('tipo_archivo', 'N/A')}")
        print(f"   • Validadores ejecutados: {len(resultados.get('validadores', {}))}")
        
    except Exception as e:
        print(f"❌ Error en análisis profundo: {str(e)}")

def crear_archivo_ejemplo():
    """Crea un archivo de ejemplo simple para testing."""
    print("🛠️  Creando archivo de ejemplo...")
    
    # Crear directorio de ejemplos si no existe
    os.makedirs("ejemplos", exist_ok=True)
    
    # Crear un archivo GLTF simple de ejemplo
    ejemplo_gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Validador3D-Ejemplo"
        },
        "scene": 0,
        "scenes": [
            {
                "nodes": [0]
            }
        ],
        "nodes": [
            {
                "mesh": 0,
                "name": "EjemploMesh"
            }
        ],
        "meshes": [
            {
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 0
                        },
                        "indices": 1
                    }
                ],
                "name": "EjemploMalla"
            }
        ],
        "buffers": [
            {
                "byteLength": 100,
                "uri": "data:application/octet-stream;base64,AAAA"
            }
        ],
        "bufferViews": [
            {
                "buffer": 0,
                "byteOffset": 0,
                "byteLength": 72,
                "target": 34962
            },
            {
                "buffer": 0,
                "byteOffset": 72,
                "byteLength": 24,
                "target": 34963
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "componentType": 5126,
                "count": 8,
                "type": "VEC3",
                "min": [-1.0, -1.0, -1.0],
                "max": [1.0, 1.0, 1.0]
            },
            {
                "bufferView": 1,
                "componentType": 5123,
                "count": 12,
                "type": "SCALAR"
            }
        ]
    }
    
    import json
    
    with open("ejemplo_modelo.gltf", "w", encoding="utf-8") as f:
        json.dump(ejemplo_gltf, f, indent=2)
    
    print("✅ Archivo ejemplo creado: ejemplo_modelo.gltf")

def main():
    """Función principal que ejecuta todos los ejemplos."""
    print("🚀 AGENTE 4: VALIDADOR DE CALIDAD 3D - EJEMPLOS\n")
    
    # Crear archivo de ejemplo para testing
    crear_archivo_ejemplo()
    
    print("\n" + "="*50)
    
    # Ejecutar ejemplos
    try:
        ejemplo_basico()
        ejemplo_configuracion_personalizada()
        ejemplo_validacion_rapida()
        ejemplo_analisis_profundo()
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Ejemplos interrumpidos por el usuario")
    except Exception as e:
        print(f"\n❌ Error ejecutando ejemplos: {str(e)}")
    
    print(f"\n" + "="*50)
    print("🎯 EJEMPLOS COMPLETADOS")
    print("\n💡 Para más información, consulta:")
    print("   • README.md - Documentación completa")
    print("   • config.py - Configuración avanzada")
    print("   • validador_3d_principal.py - API principal")

if __name__ == "__main__":
    main()
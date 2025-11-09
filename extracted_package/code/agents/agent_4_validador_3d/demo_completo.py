#!/usr/bin/env python3
"""
Script de Demostración del Agente 4: Validador de Calidad 3D
===========================================================

Demostración completa de las capacidades del validador 3D,
incluyendo todos los tipos de validación, correcciones automáticas
y generación de reportes.
"""

import os
import sys
import json
import time
from pathlib import Path

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from validador_3d_principal import Validador3DPrincipal
from config import (
    cargar_configuracion, 
    configurar_para_web,
    configurar_para_alta_calidad,
    configurar_para_vr_ar
)

def print_header(title):
    """Imprime un header decorado."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_subsection(title):
    """Imprime un subheader."""
    print(f"\n{'-'*40}")
    print(f"  {title}")
    print(f"{'-'*40}")

def crear_modelo_con_problemas():
    """Crea un modelo de ejemplo con problemas intencionados para demostración."""
    print("🔧 Creando modelo de ejemplo con problemas...")
    
    # Crear un directorio temporal
    os.makedirs("demo_modelos", exist_ok=True)
    
    # Crear un archivo GLTF con algunos problemas potenciales
    modelo_problemas = {
        "asset": {
            "version": "1.0",  # Versión antigua
            "generator": "Demo-Agente4"
        },
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}],
        "meshes": [{
            "primitives": [{
                "attributes": {"POSITION": 0},
                "indices": 1
            }]
        }],
        "buffers": [{
            "byteLength": 100,
            "uri": "textura_faltante.png",  # Dependencia externa que no existe
            "name": "BufferExterno"
        }],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": 72, "target": 34962},
            {"buffer": 0, "byteOffset": 72, "byteLength": 24, "target": 34963}
        ],
        "accessors": [
            {
                "bufferView": 0,
                "componentType": 5126,
                "count": 6,
                "type": "VEC3",
                "name": "VerticesLimitados"
            },
            {
                "bufferView": 1,
                "componentType": 5123,
                "count": 8,
                "type": "SCALAR",
                "name": "PocosIndices"
            }
        ]
    }
    
    archivo_modelo = "demo_modelos/modelo_con_problemas.gltf"
    with open(archivo_modelo, 'w') as f:
        json.dump(modelo_problemas, f, indent=2)
    
    # Crear una textura pequeña de ejemplo (pixel 1x1)
    textura_pequeña = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0P\x0f\x00\x04\x85\x01\x80\x84\xa9\x8c!\x00\x00\x00\x00IEND\xaeB`\x82'
    
    with open("demo_modelos/textura_muy_pequeña.png", 'wb') as f:
        f.write(textura_pequeña)
    
    print(f"✅ Modelo creado: {archivo_modelo}")
    return archivo_modelo

def demo_validacion_basica():
    """Demostración de validación básica."""
    print_header("DEMO 1: Validación Básica")
    
    # Usar el archivo de ejemplo básico
    archivo_ejemplo = "ejemplo_modelo.gltf"
    
    if not os.path.exists(archivo_ejemplo):
        print(f"⚠️  Archivo {archivo_ejemplo} no encontrado")
        return
    
    print(f"📁 Validando: {archivo_ejemplo}")
    
    validador = Validador3DPrincipal()
    resultados = validador.validar_archivo(archivo_ejemplo)
    
    print(f"\n📊 RESULTADOS:")
    print(f"   • Puntuación general: {resultados['puntuacion_calidad']:.1f}/10")
    print(f"   • Tipo de archivo: {resultados['tipo_archivo']}")
    print(f"   • Validadores ejecutados: {list(resultados['validadores'].keys())}")
    
    if resultados['problemas_detectados']:
        print(f"\n⚠️  Problemas detectados: {len(resultados['problemas_detectados'])}")
        for i, problema in enumerate(resultados['problemas_detectados'][:3], 1):
            print(f"   {i}. {problema['problema']}: {problema['descripcion']}")
    else:
        print(f"\n✅ No se detectaron problemas")
    
    # Generar reportes
    print(f"\n📝 GENERANDO REPORTES...")
    reporte_html = validador.generar_reporte_html("demo_basico_reporte.html")
    print(f"   ✅ Reporte HTML: {reporte_html}")

def demo_validacion_personalizada():
    """Demostración con configuración personalizada."""
    print_header("DEMO 2: Configuración Personalizada para Web")
    
    archivo_ejemplo = "ejemplo_modelo.gltf"
    if not os.path.exists(archivo_ejemplo):
        print(f"⚠️  Archivo no encontrado")
        return
    
    # Usar configuración optimizada para web
    config_web = configurar_para_web()
    config_web['texturas']['resolucion_minima'] = 128  # Más permisivo
    config_web['corrector']['auto_correct'] = False
    
    print(f"🔧 Configuración aplicada:")
    print(f"   • Resolución mínima: {config_web['texturas']['resolucion_minima']}px")
    print(f"   • Formatos soportados: {config_web['formato']['formatos_soportados']}")
    print(f"   • Corrección automática: {config_web['corrector']['auto_correct']}")
    
    validador = Validador3DPrincipal(config_web)
    resultados = validador.validar_archivo(archivo_ejemplo)
    
    print(f"\n📊 RESULTADOS CON CONFIGURACIÓN WEB:")
    print(f"   • Puntuación: {resultados['puntuacion_calidad']:.1f}/10")
    
    # Mostrar diferencias con configuración por defecto
    validador_default = Validador3DPrincipal()
    resultados_default = validador_default.validar_archivo(archivo_ejemplo)
    
    print(f"\n📈 COMPARACIÓN:")
    print(f"   • Configuración web: {resultados['puntuacion_calidad']:.1f}/10")
    print(f"   • Configuración por defecto: {resultados_default['puntuacion_calidad']:.1f}/10")
    
    reporte_html = validador.generar_reporte_html("demo_web_reporte.html")
    print(f"\n   ✅ Reporte web: {reporte_html}")

def demo_deteccion_problemas():
    """Demostración de detección de problemas."""
    print_header("DEMO 3: Detección Detallada de Problemas")
    
    # Crear modelo con problemas
    archivo_problemas = crear_modelo_con_problemas()
    
    print(f"🔍 Analizando modelo con problemas...")
    
    validador = Validador3DPrincipal()
    resultados = validador.validar_archivo(archivo_problemas)
    
    print(f"\n📊 ANÁLISIS DE PROBLEMAS:")
    print(f"   • Puntuación: {resultados['puntuacion_calidad']:.1f}/10")
    print(f"   • Total problemas: {len(resultados['problemas_detectados'])}")
    
    # Clasificar problemas por tipo
    problemas_por_tipo = {}
    for problema in resultados['problemas_detectados']:
        tipo = problema.get('tipo', 'desconocido')
        if tipo not in problemas_por_tipo:
            problemas_por_tipo[tipo] = []
        problemas_por_tipo[tipo].append(problema)
    
    print(f"\n📋 PROBLEMAS POR TIPO:")
    for tipo, problemas in problemas_por_tipo.items():
        print(f"   • {tipo.title()}: {len(problemas)} problemas")
        for problema in problemas:
            severidad = problema.get('severidad', 0)
            severidad_texto = "Alta" if severidad > 0.7 else "Media" if severidad > 0.4 else "Baja"
            print(f"     - {problema['problema']}: {severidad_texto} severidad")
    
    # Mostrar recomendaciones
    if resultados['recomendaciones']:
        print(f"\n💡 RECOMENDACIONES:")
        for i, rec in enumerate(resultados['recomendaciones'], 1):
            print(f"   {i}. {rec}")
    
    reporte_html = validador.generar_reporte_html("demo_problemas_reporte.html")
    print(f"\n   ✅ Reporte de problemas: {reporte_html}")

def demo_correccion_automatica():
    """Demostración de corrección automática."""
    print_header("DEMO 4: Corrección Automática")
    
    archivo_ejemplo = "ejemplo_modelo.gltf"
    if not os.path.exists(archivo_ejemplo):
        print(f"⚠️  Archivo no encontrado")
        return
    
    print(f"🔧 Configurando validador con corrección automática...")
    
    config_con_correccion = {
        'corrector': {
            'auto_correct': True,
            'backup_original': True
        },
        'geometrico': {
            'tolerancia_agujeros': 0.05,  # Más permisivo
            'normal_threshold': 0.2
        }
    }
    
    validador = Validador3DPrincipal(config_con_correccion)
    resultados = validador.validar_archivo(archivo_ejemplo)
    
    print(f"\n📊 RESULTADOS INICIALES:")
    print(f"   • Puntuación original: {resultados['puntuacion_calidad']:.1f}/10")
    print(f"   • Corregible automáticamente: {resultados['corregible_automaticamente']}")
    
    if resultados['corregible_automaticamente']:
        print(f"\n🔄 APLICANDO CORRECCIONES AUTOMÁTICAS...")
        
        # Crear directorio para correcciones
        os.makedirs("demo_correcciones", exist_ok=True)
        
        correccion = validador.corregir_automaticamente(
            archivo_ejemplo, 
            "demo_correcciones"
        )
        
        print(f"\n📋 RESULTADOS DE CORRECCIÓN:")
        print(f"   • Éxito: {correccion['exito']}")
        
        if correccion['problemas_corregidos']:
            print(f"   • Problemas corregidos: {correccion['problemas_corregidos']}")
        
        if correccion['archivos_modificados']:
            print(f"   • Archivos modificados: {len(correccion['archivos_modificados'])}")
            for archivo in correccion['archivos_modificados']:
                print(f"     - {archivo}")
        
        if correccion['errores']:
            print(f"   • Errores: {correccion['errores']}")
    else:
        print(f"\n⚠️  No hay problemas corregibles automáticamente")
    
    reporte_correccion = validador.generar_reporte_html("demo_correccion_reporte.html")
    print(f"\n   ✅ Reporte de corrección: {reporte_correccion}")

def demo_metricas_calidad():
    """Demostración de métricas de calidad."""
    print_header("DEMO 5: Métricas de Calidad")
    
    archivo_ejemplo = "ejemplo_modelo.gltf"
    if not os.path.exists(archivo_ejemplo):
        print(f"⚠️  Archivo no encontrado")
        return
    
    print(f"📐 Calculando métricas de calidad...")
    
    validador = Validador3DPrincipal()
    resultados = validador.validar_archivo(archivo_ejemplo)
    
    # Mostrar métricas específicas
    if 'metricas' in resultados.get('validadores', {}):
        metricas_data = resultados['validadores']['metricas']
        print(f"\n📊 MÉTRICAS DE CALIDAD:")
        
        metricas = metricas_data.get('metricas', {})
        if metricas:
            for nombre, valores in metricas.items():
                if isinstance(valores, dict) and 'promedio' in valores:
                    promedio = valores['promedio']
                    if isinstance(promedio, (int, float)):
                        print(f"   • {nombre.upper()}: {promedio:.4f}")
                        print(f"     - Mínimo: {valores.get('minimo', 'N/A')}")
                        print(f"     - Máximo: {valores.get('maximo', 'N/A')}")
                        print(f"     - Desviación: {valores.get('desviacion_estandar', 'N/A')}")
        else:
            print(f"   • Métricas básicas disponibles (sin imágenes de referencia)")
            stats = metricas_data.get('estadisticas', {})
            if stats:
                print(f"     - Comparaciones: {stats.get('num_comparaciones', 0)}")
                print(f"     - Métricas disponibles: {stats.get('metricas_disponibles', [])}")
    else:
        print(f"   • No se ejecutó el validador de métricas")
    
    reporte_html = validador.generar_reporte_html("demo_metricas_reporte.html")
    print(f"\n   ✅ Reporte de métricas: {reporte_html}")

def demo_comparacion_presets():
    """Demostración comparando diferentes presets de configuración."""
    print_header("DEMO 6: Comparación de Presets")
    
    archivo_ejemplo = "ejemplo_modelo.gltf"
    if not os.path.exists(archivo_ejemplo):
        print(f"⚠️  Archivo no encontrado")
        return
    
    # Diferentes configuraciones
    configuraciones = {
        'Por Defecto': None,  # None usa la configuración por defecto
        'Web Optimizado': configurar_para_web(),
        'Alta Calidad': configurar_para_alta_calidad(),
        'VR/AR': configurar_para_vr_ar()
    }
    
    print(f"🔍 Comparando configuraciones...")
    
    resultados_comparacion = {}
    
    for nombre, config in configuraciones.items():
        print(f"\n📋 Probando: {nombre}")
        
        try:
            validador = Validador3DPrincipal(config)
            resultados = validador.validar_archivo(archivo_ejemplo)
            
            resultados_comparacion[nombre] = {
                'puntuacion': resultados['puntuacion_calidad'],
                'problemas': len(resultados['problemas_detectados']),
                'corregible': resultados['corregible_automaticamente']
            }
            
            print(f"   • Puntuación: {resultados['puntuacion_calidad']:.1f}/10")
            print(f"   • Problemas: {len(resultados['problemas_detectados'])}")
            
        except Exception as e:
            print(f"   • Error: {str(e)}")
            resultados_comparacion[nombre] = {'error': str(e)}
    
    # Mostrar comparación
    print(f"\n📊 COMPARACIÓN DE PRESETS:")
    print(f"{'Configuración':<20} {'Puntuación':<12} {'Problemas':<10} {'Corregible':<10}")
    print(f"{'-'*60}")
    
    for nombre, resultado in resultados_comparacion.items():
        if 'error' not in resultado:
            puntuacion = resultado['puntuacion']
            problemas = resultado['problemas']
            corregible = "Sí" if resultado['corregible'] else "No"
            print(f"{nombre:<20} {puntuacion:<12.1f} {problemas:<10} {corregible:<10}")
        else:
            print(f"{nombre:<20} {'ERROR':<12} {'-':<10} {'-':<10}")
    
    print(f"\n✅ Comparación completada")

def demo_reporte_completo():
    """Demostración de reporte completo con todas las funcionalidades."""
    print_header("DEMO 7: Reporte Completo")
    
    archivo_ejemplo = "ejemplo_modelo.gltf"
    if not os.path.exists(archivo_ejemplo):
        print(f"⚠️  Archivo no encontrado")
        return
    
    print(f"📝 Generando reporte completo con todas las funcionalidades...")
    
    # Configuración completa
    config_completo = {
        'reportes': {
            'incluir_visualizaciones': True,
            'incluir_estadisticas': True,
            'incluir_detalles_tecnicos': True,
            'dpi_visualizaciones': 150
        },
        'geometrico': {
            'exportar_estadisticas': True
        },
        'texturas': {
            'detectar_banding': True,
            'detectar_blocking': True,
            'analisis_entropia': True
        },
        'corrector': {
            'auto_correct': False  # Solo demo, no modificar archivos
        }
    }
    
    validador = Validador3DPrincipal(config_completo)
    resultados = validador.validar_archivo(archivo_ejemplo)
    
    # Generar todos los tipos de reportes
    print(f"\n📋 GENERANDO REPORTES...")
    
    # Reporte HTML completo
    reporte_html = validador.generar_reporte_html("demo_reporte_completo.html")
    print(f"   ✅ Reporte HTML completo: {reporte_html}")
    
    # Reporte JSON detallado
    reporte_json = validador.generar_reporte_json("demo_reporte_completo.json")
    print(f"   ✅ Reporte JSON: {reporte_json}")
    
    # Mostrar información del reporte
    resumen = validador.obtener_resumen()
    print(f"\n📊 RESUMEN FINAL:")
    print(f"   • Archivo: {resumen['archivo']}")
    print(f"   • Puntuación: {resumen['puntuacion_calidad']:.1f}/10")
    print(f"   • Validadores: {len(resultados['validadores'])}")
    print(f"   • Problemas: {resumen['problemas_detectados']}")
    print(f"   • Recomendaciones: {len(resultados['recomendaciones'])}")
    
    # Mostrar estadísticas finales
    print(f"\n📈 ESTADÍSTICAS DETALLADAS:")
    for validador_nombre, datos in resultados['validadores'].items():
        if isinstance(datos, dict) and 'puntuacion' in datos:
            print(f"   • {validador_nombre.title()}: {datos['puntuacion']:.1f}/10")

def main():
    """Función principal que ejecuta todas las demostraciones."""
    print("🚀 AGENTE 4: VALIDADOR DE CALIDAD 3D - DEMOSTRACIÓN COMPLETA")
    print("="*70)
    print()
    print("Esta demostración muestra todas las capacidades del validador:")
    print("  1. Validación básica de modelos 3D")
    print("  2. Configuración personalizada por caso de uso")
    print("  3. Detección detallada de problemas")
    print("  4. Corrección automática")
    print("  5. Métricas de calidad avanzadas")
    print("  6. Comparación de presets")
    print("  7. Reportes completos")
    print()
    
    try:
        # Ejecutar todas las demostraciones
        demo_validacion_basica()
        demo_validacion_personalizada()
        demo_deteccion_problemas()
        demo_correccion_automatica()
        demo_metricas_calidad()
        demo_comparacion_presets()
        demo_reporte_completo()
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Demostración interrumpida por el usuario")
        return
    except Exception as e:
        print(f"\n❌ Error durante la demostración: {str(e)}")
        return
    
    # Resumen final
    print(f"\n" + "="*70)
    print("🎉 DEMOSTRACIÓN COMPLETADA EXITOSAMENTE")
    print("="*70)
    print()
    print("📁 ARCHIVOS GENERADOS:")
    
    archivos_generados = [
        "demo_basico_reporte.html",
        "demo_web_reporte.html", 
        "demo_problemas_reporte.html",
        "demo_correccion_reporte.html",
        "demo_metricas_reporte.html",
        "demo_reporte_completo.html",
        "demo_reporte_completo.json"
    ]
    
    archivos_existentes = [f for f in archivos_generados if os.path.exists(f)]
    
    for archivo in archivos_existentes:
        print(f"   ✅ {archivo}")
    
    print()
    print("📚 PRÓXIMOS PASOS:")
    print("   1. Abre los reportes HTML en tu navegador")
    print("   2. Revisa los archivos JSON para datos técnicos")
    print("   3. Ejecuta: python examples/ejemplo_basico.py para más ejemplos")
    print("   4. Personaliza config.py según tus necesidades")
    print("   5. Integra el validador en tu pipeline de desarrollo")
    print()
    print("🆘 SOPORTE:")
    print("   • Documentación: README.md")
    print("   • Ejemplos: examples/")
    print("   • Configuración: config.py")

if __name__ == "__main__":
    main()
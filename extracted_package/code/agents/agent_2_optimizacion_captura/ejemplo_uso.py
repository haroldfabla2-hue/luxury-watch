#!/usr/bin/env python3
"""
Ejemplo de Uso del Agente Optimizador de Captura
===============================================

Este script demuestra el uso completo del Agente 2: Optimizador de Captura
para generar guías de fotografía inteligentes.

Autor: Sistema de Fotogrametría de Relojes
Versión: 2.0
Fecha: 2025-11-06
"""

import os
import sys
import json
import time
from pathlib import Path

# Agregar el directorio del agente al path
agent_dir = Path(__file__).parent
sys.path.insert(0, str(agent_dir))

# Importaciones del agente
from capture_optimizer_agent import (
    CaptureOptimizerAgent, 
    ComponentType, 
    ComponentGeometry
)
from coordination_interface import CoordinationInterface, get_coordination_interface
from agent_config import AgentConfiguration
from angle_calculator import AngleCalculator
# from templates.guide_interactions import CaptureGuideInterface  # Comentado para evitar problemas de importación


def ejemplo_basico():
    """Ejemplo básico de uso del agente"""
    print("=" * 60)
    print("EJEMPLO BÁSICO - Agente Optimizador de Captura")
    print("=" * 60)
    
    # Crear instancia del agente
    agent = CaptureOptimizerAgent()
    
    # Ejemplo 1: Generar guía para esfera
    print("\n1. Generando guía para esfera...")
    sphere_guide = agent.generate_capture_guide(
        component_type=ComponentType.ESFERA,
        component_id="SPH_LUX_001"
    )
    
    print(f"   ✓ Guía generada: {sphere_guide.required_views} vistas")
    print(f"   ✓ Duración estimada: {sphere_guide.estimated_duration} minutos")
    print(f"   ✓ Nivel de dificultad: {sphere_guide.difficulty_level}")
    print(f"   ✓ Ángulos requeridos: {sphere_guide.optimal_angles}")
    
    # Ejemplo 2: Generar guía con geometría personalizada
    print("\n2. Generando guía con geometría personalizada...")
    custom_geometry = ComponentGeometry(
        width=45.0,      # mm
        height=45.0,     # mm
        depth=12.0,      # mm
        curvature_radius=22.5,  # mm
        material_reflectivity=0.4
    )
    
    custom_guide = agent.generate_capture_guide(
        component_type=ComponentType.CAJA,
        component_id="CASE_PREMIUM_001",
        custom_geometry=custom_geometry
    )
    
    print(f"   ✓ Guía personalizada generada")
    print(f"   ✓ Ángulos optimizados: {custom_guide.optimal_angles}")
    print(f"   ✓ Configuraciones de cámara: {len(custom_guide.camera_settings)}")
    
    # Ejemplo 3: Validar cobertura angular
    print("\n3. Validando cobertura angular...")
    captured_angles = [0, 45, 90, 135, 180, 225, 270, 315]
    required_angles = [0, 45, 90, 135, 180, 225, 270, 315]
    
    validation = agent.validate_angular_coverage(captured_angles, required_angles)
    
    print(f"   ✓ Cobertura: {validation['coverage_percentage']:.1f}%")
    print(f"   ✓ Completa: {'Sí' if validation['is_complete'] else 'No'}")
    if validation['missing_angles']:
        print(f"   ⚠ Ángulos faltantes: {validation['missing_angles']}")
    if validation['recommendations']:
        print(f"   💡 Recomendaciones: {len(validation['recommendations'])}")
    
    return sphere_guide, custom_guide


def ejemplo_avanzado():
    """Ejemplo avanzado con coordinación"""
    print("\n" + "=" * 60)
    print("EJEMPLO AVANZADO - Con Sistema de Coordinación")
    print("=" * 60)
    
    # Crear instancia de coordinación
    coord = CoordinationInterface("ejemplo_optimizador")
    coord.start()
    
    # Simular envío de tarea asíncrona
    print("\n1. Enviando tarea de generación de guía...")
    
    def task_callback(task_id, status, result, error):
        if status == "completed":
            print(f"   ✓ Tarea completada: {task_id}")
            if result:
                print(f"   ✓ Guía generada para {result.get('component_type', 'desconocido')}")
        elif status == "failed":
            print(f"   ✗ Tarea falló: {error}")
        else:
            print(f"   ⏳ Estado: {status}")
    
    # Enviar tarea
    task_id = coord.submit_task(
        task_type="generate_capture_guide",
        parameters={
            "component_type": "bisel",
            "component_id": "BEZEL_ART_001"
        },
        callback=task_callback
    )
    
    print(f"   📋 Tarea enviada: {task_id}")
    
    # Esperar completación (simulado)
    print("\n2. Esperando procesamiento...")
    time.sleep(3)
    
    # Consultar estado del agente
    print("\n3. Consultando estado del agente...")
    status = coord.get_agent_status()
    print(f"   📊 Estado: {status['status']}")
    print(f"   📊 Tareas completadas: {status['completed_tasks']}")
    print(f"   📊 Capacidades: {len(status['capabilities'])}")
    
    coord.stop()
    
    return task_id


def ejemplo_configuracion():
    """Ejemplo de uso de configuraciones personalizadas"""
    print("\n" + "=" * 60)
    print("EJEMPLO DE CONFIGURACIÓN - Personalización del Agente")
    print("=" * 60)
    
    # Crear configuración personalizada
    print("\n1. Cargando configuraciones...")
    config = AgentConfiguration()
    
    # Mostrar perfiles de cámara disponibles
    print("\n   Perfiles de cámara disponibles:")
    for name, profile in config.camera_profiles.items():
        print(f"   - {name}: {profile.model} ({profile.sensor_size})")
    
    # Mostrar perfiles de iluminación
    print("\n   Perfiles de iluminación disponibles:")
    for name, profile in config.lighting_profiles.items():
        print(f"   - {name}: {profile.description}")
    
    # Obtener configuración para bisel
    print("\n2. Obteniendo configuración para bisel...")
    bisel_config = config.get_component_config("bisel")
    print(f"   ✓ Dimensiones máximas: {bisel_config['dimensiones_maximas']}")
    print(f"   ✓ Ángulos críticos: {bisel_config['angulos_criticos']}")
    print(f"   ✓ Focal recomendada: {bisel_config['focal_recomendada']}mm")
    
    # Configuración de optimización
    print("\n3. Configuraciones de optimización:")
    opt_settings = config.optimization_settings
    print(f"   ✓ Tiempo máximo: {opt_settings.max_processing_time}s")
    print(f"   ✓ Resolución angular: {opt_settings.min_angle_resolution}°")
    print(f"   ✓ Método de cálculo: {opt_settings.angle_calculation_method}")
    
    # Exportar configuración
    config_path = "/tmp/agent_config_export.json"
    config.export_config(config_path)
    print(f"\n   ✓ Configuración exportada a: {config_path}")
    
    return config


def ejemplo_exportacion_html():
    """Ejemplo de exportación a HTML"""
    print("\n" + "=" * 60)
    print("EJEMPLO DE EXPORTACIÓN - Guías HTML Interactivas")
    print("=" * 60)
    
    # Crear agente y generar guía
    print("\n1. Generando guía para exportación...")
    agent = CaptureOptimizerAgent()
    
    guide = agent.generate_capture_guide(
        component_type=ComponentType.CORREA,
        component_id="STRAP_LEATHER_001"
    )
    
    # Exportar a HTML
    print("\n2. Exportando guía a HTML...")
    output_path = "/tmp/capture_guide_ejemplo.html"
    
    try:
        html_path = agent.export_guide_to_html(guide, output_path)
        print(f"   ✓ Guía exportada exitosamente")
        print(f"   📁 Archivo: {html_path}")
        
        # Verificar archivo
        if os.path.exists(html_path):
            file_size = os.path.getsize(html_path)
            print(f"   📊 Tamaño del archivo: {file_size} bytes")
        else:
            print("   ⚠ Archivo no encontrado")
            
    except Exception as e:
        print(f"   ✗ Error exportando: {e}")
    
    return html_path if os.path.exists(output_path) else None


def ejemplo_calculadora_angulos():
    """Ejemplo de uso de la calculadora de ángulos"""
    print("\n" + "=" * 60)
    print("EJEMPLO DE CÁLCULO - Ángulos Óptimos Avanzados")
    print("=" * 60)
    
    # Crear calculadora
    calculator = AngleCalculator()
    
    # Calcular para diferentes componentes
    componentes = [
        (ComponentType.CAJA, "caja"),
        (ComponentType.BISEL, "bisel"), 
        (ComponentType.CORREA, "correa"),
        (ComponentType.ESFERA, "esfera")
    ]
    
    for component_type, nombre in componentes:
        print(f"\n{nombre.upper()}:")
        
        # Calcular ángulos
        angles = calculator.calculate_optimal_angles(component_type)
        
        print(f"   Ángulos calculados: {len(angles)}")
        for i, angle_result in enumerate(angles[:5]):  # Mostrar solo los primeros 5
            print(f"   {i+1}. {angle_result.angle}° - Score: {angle_result.optimization_score:.2f}")
            print(f"      Método: {angle_result.method.value}")
            print(f"      Confianza: {angle_result.confidence:.2f}")
            print(f"      Racional: {angle_result.rationale}")
    
    return calculator


def ejemplo_validacion_completa():
    """Ejemplo completo de validación de sistema"""
    print("\n" + "=" * 60)
    print("EJEMPLO COMPLETO - Validación Integral del Sistema")
    print("=" * 60)
    
    # Inicializar todos los componentes
    print("\n1. Inicializando sistema completo...")
    
    agent = CaptureOptimizerAgent()
    coord = CoordinationInterface()
    config = AgentConfiguration()
    calculator = AngleCalculator()
    
    print("   ✓ Agente optimizador inicializado")
    print("   ✓ Interfaz de coordinación inicializada")
    print("   ✓ Configuración cargada")
    print("   ✓ Calculadora de ángulos lista")
    
    # Test 1: Generar guía completa
    print("\n2. Generando guía completa para esfera...")
    sphere_geometry = ComponentGeometry(40, 40, 40, curvature_radius=20, material_reflectivity=0.6)
    guide = agent.generate_capture_guide(ComponentType.ESFERA, "TEST_SPHERE", sphere_geometry)
    
    print(f"   ✓ Guía generada: {guide.required_views} vistas")
    
    # Test 2: Validar con calculadora
    print("\n3. Validando con calculadora avanzada...")
    calc_angles = calculator.calculate_optimal_angles(ComponentType.ESFERA, sphere_geometry)
    
    print(f"   ✓ Ángulos calculados: {len(calc_angles)}")
    
    # Test 3: Validar cobertura
    print("\n4. Validando cobertura angular...")
    validation = agent.validate_angular_coverage(
        guide.optimal_angles,
        [a.angle for a in calc_angles[:8]]  # Usar primeros 8 ángulos calculados
    )
    
    print(f"   ✓ Cobertura: {validation['coverage_percentage']:.1f}%")
    
    # Test 4: Estado del sistema
    print("\n5. Estado del sistema:")
    status = agent.get_agent_status()
    print(f"   ✓ Estado: {status['status']}")
    print(f"   ✓ Versión: {status['version']}")
    print(f"   ✓ Componentes soportados: {status['supported_components']}")
    
    return {
        "guide": guide,
        "validation": validation,
        "status": status
    }


def main():
    """Función principal del ejemplo"""
    print("🚀 EJEMPLOS DE USO - Agente Optimizador de Captura v2.0")
    print("📅 Fecha: 2025-11-06")
    print("🏭 Sistema de Fotogrametría de Relojes de Lujo")
    
    try:
        # Ejecutar ejemplos
        ejemplo_basico()
        ejemplo_avanzado()
        ejemplo_configuracion()
        ejemplo_exportacion_html()
        ejemplo_calculadora_angulos()
        resultado_completo = ejemplo_validacion_completa()
        
        print("\n" + "=" * 60)
        print("✅ TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE")
        print("=" * 60)
        
        # Información adicional
        print("\n📚 INFORMACIÓN ADICIONAL:")
        print("   • El agente soporta 4 tipos de componentes")
        print("   • Genera guías HTML interactivas")
        print("   • Calcula ángulos usando geometría avanzada")
        print("   • Valida cobertura angular automáticamente")
        print("   • Se integra con sistema de coordinación")
        print("   • Exporta configuraciones personalizables")
        
        print("\n🔗 RECURSOS DISPONIBLES:")
        print("   • Templates HTML/CSS en templates/")
        print("   • Configuraciones en agent_config.py")
        print("   • Coordinación en coordination_interface.py")
        print("   • Calculadora en angle_calculator.py")
        
        print("\n📁 ARCHIVOS GENERADOS:")
        generated_files = []
        if os.path.exists("/tmp/capture_guide_ejemplo.html"):
            generated_files.append("/tmp/capture_guide_ejemplo.html")
        if os.path.exists("/tmp/agent_config_export.json"):
            generated_files.append("/tmp/agent_config_export.json")
        
        for file_path in generated_files:
            print(f"   📄 {file_path}")
        
        return resultado_completo
        
    except Exception as e:
        print(f"\n❌ ERROR EN EJEMPLO: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    resultado = main()
    
    if resultado:
        print("\n🎉 Ejecución completada exitosamente!")
        print("   Usa estos ejemplos como base para implementar")
        print("   el Agente Optimizador de Captura en tu sistema.")
    else:
        print("\n💥 La ejecución falló. Revisa los errores arriba.")
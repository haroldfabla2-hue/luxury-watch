#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Instalación y Verificación del Agente 6
Generador de Metadatos y SEO con Gemini 2.0

Este script verifica la instalación completa y permite ejecutar
ejemplos básicos del agente sin configuración compleja.

Autor: Sistema de IA Avanzado para LuxuryWatch
Fecha: 2025-11-06
Versión: 1.0.0
"""

import os
import sys
import subprocess
import json
from pathlib import Path

# Agregar directorio actual al path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def print_banner():
    """Muestra banner de bienvenida."""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     🚀 AGENTE 6: GENERADOR DE METADATOS Y SEO              ║
    ║                  con Gemini 2.0 via OpenRouter              ║
    ║                                                              ║
    ║           ✅ Implementación completa y funcional            ║
    ║           🎯 Optimizado para componentes de reloj           ║
    ║           🌟 Templates especializados por mercado           ║
    ║           ⚡ Procesamiento en lote eficiente                ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Verifica versión de Python."""
    print("🐍 Verificando versión de Python...")
    
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"   ✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True
    else:
        print(f"   ❌ Python {version.major}.{version.minor}.{version.micro} - Requiere Python 3.8+")
        return False

def check_dependencies():
    """Verifica dependencias instaladas."""
    print("\n📦 Verificando dependencias...")
    
    required_packages = [
        'asyncio',
        'json',
        'logging', 
        'typing',
        'dataclasses',
        'datetime',
        'pathlib',
        'collections'
    ]
    
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package}")
            missing.append(package)
    
    # Verificar dependencias opcionales (con mensajes más suaves)
    optional_packages = ['jsonschema', 'aiohttp', 'structlog']
    for package in optional_packages:
        try:
            __import__(package)
            print(f"   ✅ {package} (opcional)")
        except ImportError:
            print(f"   ⚠️  {package} (opcional - instalar con: pip install {package})")
    
    return len(missing) == 0

def check_environment():
    """Verifica variables de entorno."""
    print("\n🔑 Verificando configuración...")
    
    env_status = {}
    
    # Verificar API Key
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your-gemini-api-key":
        env_status["API_KEY"] = "✅ Configurada"
        print(f"   ✅ GEMINI_API_KEY configurada")
    else:
        env_status["API_KEY"] = "⚠️  No configurada"
        print(f"   ⚠️  GEMINI_API_KEY no configurada")
        print(f"      Para usar el agente, configure:")
        print(f"      export GEMINI_API_KEY='tu-api-key-openrouter'")
    
    # Verificar entorno
    env = os.getenv("AGENT_ENV", "development")
    env_status["ENVIRONMENT"] = env
    print(f"   📋 AGENT_ENV: {env}")
    
    return env_status

def verify_agent_files():
    """Verifica archivos del agente."""
    print("\n📁 Verificando archivos del agente...")
    
    required_files = [
        "agent.py",
        "config.py", 
        "agent_types.py",
        "gemini_client.py",
        "metadata_generator.py",
        "seo_optimizer.py",
        "material_normalizer.py",
        "content_templates.py",
        "templates_extension.py",
        "utils.py",
        "requirements.txt",
        "demo_completa.py",
        "ejemplo_uso.py",
        "test_simple.py",
        "RESUMEN_IMPLEMENTACION_COMPLETA.md"
    ]
    
    missing_files = []
    
    for file in required_files:
        file_path = current_dir / file
        if file_path.exists():
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file}")
            missing_files.append(file)
    
    return len(missing_files) == 0, missing_files

def test_basic_imports():
    """Prueba importaciones básicas."""
    print("\n🔧 Probando importaciones del agente...")
    
    try:
        # Importar módulos core
        from agent_types import ComponenteReloj, TipoComponente, MaterialBase
        print("   ✅ agent_types.py")
        
        from config import create_production_config, get_config_by_environment
        print("   ✅ config.py")
        
        from utils import Logger, ValidationUtils
        print("   ✅ utils.py")
        
        from material_normalizer import MaterialNormalizer
        print("   ✅ material_normalizer.py")
        
        from content_templates import ContentTemplates
        print("   ✅ content_templates.py")
        
        from templates_extension import TemplatesExtension
        print("   ✅ templates_extension.py")
        
        from seo_optimizer import SEOOptimizer
        print("   ✅ seo_optimizer.py")
        
        print("   🎉 Todas las importaciones exitosas")
        return True
        
    except Exception as e:
        print(f"   ❌ Error en importaciones: {e}")
        return False

def show_agent_capabilities():
    """Muestra capacidades del agente."""
    print("\n🎯 CAPACIDADES DEL AGENTE 6:")
    print("=" * 50)
    
    capabilities = [
        ("🔍 Análisis de Componentes", "Identificación automática de tipo, material y características"),
        ("📝 Generación de Contenido", "Descripciones naturales optimizadas para SEO"),
        ("🎯 SEO Avanzado", "Metadatos, keywords y JSON-LD estructurado"),
        ("👥 Multi-Audiencia", "Contenido específico para 6 tipos de audiencia"),
        ("🌍 Multi-Mercado", "Templates geográficos y culturalmente adaptados"),
        ("📱 Redes Sociales", "Contenido optimizado para Instagram, Twitter, LinkedIn"),
        ("🔗 Integración 3D", "Metadatos de modelos 3D y materiales PBR"),
        ("📦 Procesamiento Lote", "Eficiencia con múltiples componentes simultáneos"),
        ("🏥 Health Check", "Monitoreo completo del estado del sistema"),
        ("🎨 Templates Especializados", "Plantillas por temporada, audiencia y mercado")
    ]
    
    for capability, description in capabilities:
        print(f"   {capability}")
        print(f"      {description}")
        print()

def show_usage_examples():
    """Muestra ejemplos de uso."""
    print("\n💻 EJEMPLOS DE USO RÁPIDO:")
    print("=" * 50)
    
    examples = [
        ("Configuración Básica", """
# Configurar API key
export GEMINI_API_KEY="tu-api-key-openrouter"

# Usar el agente
from agent import AgenteMetadatosGemini
from config import create_production_config

config = create_production_config()
agente = AgenteMetadatosGemini(config)
"""),
        
        ("Análisis Completo", """
# Crear componente
componente = ComponenteReloj(
    id="bisel_001",
    tipo=TipoComponente.BISEL,
    nombre="Bisel Cerámica Negra",
    material_base=MaterialBase.CERAMICA
)

# Generar metadatos
metadatos = await agente.procesar_componente_completo(componente)
"""),
        
        ("SEO Optimizado", """
# SEO específico
seo_result = await agente.generar_seo_optimizado(
    componente=componente,
    keywords_objetivo=["reloj lujo", "ceramica", "swiss made"],
    audiencia=AudienciaTarget.LUJO
)
"""),
        
        ("Redes Sociales", """
# Contenido social
social = await agente.generar_contenido_redes_sociales(
    componente=componente,
    plataformas=["Instagram", "Twitter"]
)
""")
    ]
    
    for title, code in examples:
        print(f"📋 {title}:")
        print(code)

def show_file_locations():
    """Muestra ubicación de archivos importantes."""
    print("\n📂 ARCHIVOS IMPORTANTES:")
    print("=" * 50)
    
    files_info = [
        ("Código Principal", [
            "agent.py - Orquestador principal",
            "config.py - Configuraciones",
            "types.py - Definiciones de datos",
            "gemini_client.py - Cliente Gemini"
        ]),
        ("Generadores", [
            "metadata_generator.py - Generador principal",
            "seo_optimizer.py - Optimizador SEO",
            "material_normalizer.py - Normalizador",
            "content_templates.py - Templates base"
        ]),
        ("Templates Avanzados", [
            "templates_extension.py - Templates especializados",
            "demo_completa.py - Demostración completa",
            "ejemplo_uso.py - Ejemplos prácticos"
        ]),
        ("Documentación", [
            "RESUMEN_IMPLEMENTACION_COMPLETA.md - Resumen ejecutivo",
            "README.md - Documentación completa",
            "requirements.txt - Dependencias"
        ])
    ]
    
    for category, files in files_info:
        print(f"\n📁 {category}:")
        for file in files:
            print(f"   • {file}")

def run_demo_selection():
    """Permite al usuario ejecutar demos específicas."""
    print("\n🎮 DEMOS INTERACTIVAS:")
    print("=" * 50)
    
    demos = [
        ("1", "Demo Básica - Sin API Key", "test_simple.py"),
        ("2", "Ejemplos de Uso", "ejemplo_uso.py"),
        ("3", "Demo Completa (requiere API Key)", "demo_completa.py")
    ]
    
    print("Selecciona una demo para ejecutar:")
    for key, name, script in demos:
        print(f"   {key}. {name}")
    
    print("\n   0. Salir")
    print("\nNota: La Demo Completa requiere configurar GEMINI_API_KEY")
    
    try:
        choice = input("\n🔢 Ingresa tu opción (0-3): ").strip()
        
        if choice == "0":
            print("👋 ¡Hasta luego!")
            return
        
        elif choice == "1":
            print("\n🚀 Ejecutando Demo Básica...")
            print("-" * 30)
            subprocess.run([sys.executable, "test_simple.py"], cwd=current_dir)
        
        elif choice == "2":
            print("\n🚀 Ejecutando Ejemplos de Uso...")
            print("-" * 30)
            subprocess.run([sys.executable, "ejemplo_uso.py"], cwd=current_dir)
        
        elif choice == "3":
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "your-gemini-api-key":
                print("\n❌ Error: GEMINI_API_KEY no configurada")
                print("   Configura la variable de entorno:")
                print("   export GEMINI_API_KEY='tu-api-key-openrouter'")
                print("\n   Obtén tu API key en: https://openrouter.ai/")
            else:
                print("\n🚀 Ejecutando Demo Completa...")
                print("-" * 30)
                subprocess.run([sys.executable, "demo_completa.py"], cwd=current_dir)
        
        else:
            print("❌ Opción inválida")
    
    except KeyboardInterrupt:
        print("\n\n👋 Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error ejecutando demo: {e}")

def show_next_steps():
    """Muestra próximos pasos."""
    print("\n🚀 PRÓXIMOS PASOS:")
    print("=" * 50)
    
    steps = [
        ("1. Configurar API Key", [
            "Regístrate en OpenRouter.ai",
            "Obtén tu API key para Gemini 2.0",
            "Configura: export GEMINI_API_KEY='tu-api-key'"
        ]),
        ("2. Ejecutar Ejemplos", [
            "Prueba: python test_simple.py",
            "Ejecuta: python ejemplo_uso.py",
            "Explora: python demo_completa.py"
        ]),
        ("3. Integrar en tu Proyecto", [
            "from agent_6_metadatos_gemini import AgenteMetadatosGemini",
            "config = create_production_config()",
            "agente = AgenteMetadatosGemini(config)"
        ]),
        ("4. Personalizar Templates", [
            "Edita templates_extension.py",
            "Añade tus mercados específicos",
            "Crea campañas estacionales"
        ])
    ]
    
    for step, actions in steps:
        print(f"\n📋 {step}:")
        for action in actions:
            print(f"   • {action}")

def main():
    """Función principal del instalador."""
    print_banner()
    
    # Verificaciones básicas
    checks = []
    checks.append(check_python_version())
    checks.append(check_dependencies())
    
    env_status = check_environment()
    all_files_ok, missing_files = verify_agent_files()
    checks.append(all_files_ok)
    
    if not all_files_ok:
        print(f"\n❌ ARCHIVOS FALTANTES: {missing_files}")
    
    import_ok = test_basic_imports()
    checks.append(import_ok)
    
    # Resumen de verificación
    print("\n" + "="*60)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("="*60)
    
    if all(checks):
        print("✅ TODAS LAS VERIFICACIONES PASARON")
        print("🎉 El Agente 6 está listo para usar")
        
        # Mostrar capacidades
        show_agent_capabilities()
        
        # Mostrar ejemplos de uso
        show_usage_examples()
        
        # Mostrar archivos
        show_file_locations()
        
        # Menú de demos
        run_demo_selection()
        
        # Próximos pasos
        show_next_steps()
        
    else:
        print("❌ ALGUNAS VERIFICACIONES FALLARON")
        print("\n🔧 PARA SOLUCIONAR:")
        print("   1. Asegúrate de estar en el directorio correcto")
        print("   2. Instala dependencias: pip install -r requirements.txt")
        print("   3. Verifica que todos los archivos estén presentes")
        
        if not all_files_ok:
            print(f"   4. Archivos faltantes: {missing_files}")

if __name__ == "__main__":
    main()
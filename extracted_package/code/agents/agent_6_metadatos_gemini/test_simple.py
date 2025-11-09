#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prueba simple del Agente 6 sin dependencias externas
"""

import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, '/workspace/code/agents/agent_6_metadatos_gemini')

def test_imports():
    """Probar que los módulos se pueden importar"""
    try:
        print("🔧 Probando imports de módulos...")
        
        # Importar módulos del agente
        from types import ComponentAnalysis, SEOMetadata, MetadataOutput
        print("✅ types.py - Importado correctamente")
        
        from utils import CacheManager, Logger, ValidationUtils
        print("✅ utils.py - Importado correctamente")
        
        from material_normalizer import MaterialNormalizer
        print("✅ material_normalizer.py - Importado correctamente")
        
        from content_templates import ContentTemplateManager
        print("✅ content_templates.py - Importado correctamente")
        
        from seo_optimizer import SEOOptimizer
        print("✅ seo_optimizer.py - Importado correctamente")
        
        from metadata_generator import MetadataGenerator
        print("✅ metadata_generator.py - Importado correctamente")
        
        from gemini_client import GeminiClient
        print("✅ gemini_client.py - Importado correctamente")
        
        from agent import MetadataAgent
        print("✅ agent.py - Importado correctamente")
        
        from config import MetadataConfig
        print("✅ config.py - Importado correctamente")
        
        print("\n🎉 Todos los módulos importados correctamente!")
        return True
        
    except ImportError as e:
        print(f"❌ Error de import: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_basic_functionality():
    """Probar funcionalidad básica sin API externa"""
    try:
        print("\n🔍 Probando funcionalidad básica...")
        
        # Importar y probar normalizador de materiales
        from material_normalizer import MaterialNormalizer
        
        normalizer = MaterialNormalizer()
        
        # Probar análisis de material
        result = normalizer.analyze_material("acero inoxidable", "es")
        print(f"✅ Análisis de material: {result.get('material_type', 'N/A')}")
        
        # Importar y probar templates
        from content_templates import ContentTemplateManager
        
        templates = ContentTemplateManager()
        content = templates.get_template("comercial", "lunar")
        print(f"✅ Template encontrado: {len(content.get('sections', []))} secciones")
        
        print("\n✅ Funcionalidad básica operativa!")
        return True
        
    except Exception as e:
        print(f"❌ Error en funcionalidad básica: {e}")
        return False

def main():
    """Función principal de prueba"""
    print("🚀 Iniciando pruebas del Agente 6: Generador de Metadatos y SEO")
    print("=" * 60)
    
    # Probar imports
    if not test_imports():
        sys.exit(1)
    
    # Probar funcionalidad básica
    if not test_basic_functionality():
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 Todas las pruebas pasaron correctamente!")
    print("📝 El agente está listo para usar con credenciales de OpenRouter")
    
if __name__ == "__main__":
    main()
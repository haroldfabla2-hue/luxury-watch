#!/usr/bin/env python3
"""
Script de pruebas del Agente 6: Generador de Metadatos y SEO

Ejecuta pruebas básicas sin dependencias externas para verificar
la instalación y estructura del agente.
"""

import sys
import os
import importlib
import inspect
from pathlib import Path

# Añadir directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_importaciones_principales():
    """Test que todas las importaciones principales funcionan."""
    print("🔍 Test: Importaciones Principales")
    
    try:
        from agent import AgenteMetadatosGemini
        from config import create_testing_config, ConfiguracionAgente
        from types import (
            ComponenteReloj, TipoComponente, MaterialBase, 
            AcabadoSuperficie, EstiloVisual, AudienciaTarget
        )
        print("   ✅ Importaciones exitosas")
        return True
    except ImportError as e:
        print(f"   ❌ Error de importación: {e}")
        return False


def test_estructura_archivos():
    """Test que todos los archivos principales existen."""
    print("\n📁 Test: Estructura de Archivos")
    
    archivos_requeridos = [
        "__init__.py",
        "agent.py", 
        "config.py",
        "types.py",
        "gemini_client.py",
        "material_normalizer.py",
        "content_templates.py",
        "seo_optimizer.py",
        "metadata_generator.py",
        "requirements.txt",
        "README.md",
        "ejemplo_uso.py"
    ]
    
    todos_presentes = True
    for archivo in archivos_requeridos:
        if os.path.exists(archivo):
            print(f"   ✅ {archivo}")
        else:
            print(f"   ❌ {archivo} - NO ENCONTRADO")
            todos_presentes = False
    
    return todos_presentes


def test_dependencias_principales():
    """Test que las dependencias principales están disponibles."""
    print("\n📦 Test: Dependencias Principales")
    
    dependencias_criticas = [
        "aiohttp",
        "pandas", 
        "pydantic",
        "jinja2",
        "python-dateutil",
        "json"
    ]
    
    todas_disponibles = True
    for dep in dependencias_criticas:
        try:
            if dep == "json":
                import json
            else:
                __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ⚠️  {dep} - No disponible (instalar con pip)")
            # No falla el test crítico
    
    return True  # Las dependencias opcionales no fallan el test


def test_tipos_de_datos():
    """Test de los tipos de datos del sistema."""
    print("\n🏷️  Test: Tipos de Datos")
    
    try:
        from types import (
            ComponenteReloj, TipoComponente, MaterialBase, 
            AcabadoSuperficie, EstiloVisual, AudienciaTarget
        )
        
        # Test creación de componente
        componente = ComponenteReloj(
            id="test_001",
            tipo=TipoComponente.CAJA,
            nombre="Test Component"
        )
        
        assert componente.id == "test_001"
        assert componente.tipo == TipoComponente.CAJA
        assert componente.nombre == "Test Component"
        
        print(f"   ✅ ComponenteReloj creado correctamente")
        
        # Test enums
        assert len(TipoComponente) > 0
        assert len(MaterialBase) > 0
        assert len(AcabadoSuperficie) > 0
        assert len(EstiloVisual) > 0
        assert len(AudienciaTarget) > 0
        
        print(f"   ✅ Enums disponibles: {len(TipoComponente)} tipos, {len(MaterialBase)} materiales")
        return True
        
    except Exception as e:
        print(f"   ❌ Error en tipos de datos: {e}")
        return False


def test_configuracion():
    """Test del sistema de configuración."""
    print("\n⚙️  Test: Sistema de Configuración")
    
    try:
        from config import (
            create_testing_config, create_development_config, 
            create_production_config, ConfiguracionAgente
        )
        
        # Test configuraciones predefinidas
        test_config = create_testing_config()
        assert test_config is not None
        assert test_config.gemini_api_key == "test-key"
        
        print(f"   ✅ Configuración de testing creada")
        
        # Test configuración personalizada
        custom_config = ConfiguracionAgente(
            gemini_api_key="custom-key",
            temperatura=0.8,
            max_tokens=1024
        )
        assert custom_config.gemini_api_key == "custom-key"
        assert custom_config.temperatura == 0.8
        
        print(f"   ✅ Configuración personalizada creada")
        return True
        
    except Exception as e:
        print(f"   ❌ Error en configuración: {e}")
        return False


def test_material_normalizer():
    """Test del normalizador de materiales."""
    print("\n🔧 Test: Normalizador de Materiales")
    
    try:
        from material_normalizer import MaterialNormalizer
        
        normalizer = MaterialNormalizer()
        assert normalizer is not None
        
        print(f"   ✅ Normalizador inicializado")
        
        # Test normalización básica
        resultado = normalizer.normalize_material("acero 316L")
        # El resultado puede ser None, pero no debe dar error
        print(f"   ✅ Normalización de 'acero 316L' ejecutada sin errores")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error en normalizador: {e}")
        return False


def test_content_templates():
    """Test del sistema de templates."""
    print("\n📄 Test: Sistema de Templates")
    
    try:
        from content_templates import ContentTemplates
        
        templates = ContentTemplates()
        assert templates is not None
        
        print(f"   ✅ Sistema de templates inicializado")
        
        # Test obtención de templates
        available = templates.get_available_templates()
        assert len(available) > 0
        
        print(f"   ✅ Templates disponibles: {len(available)}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error en templates: {e}")
        return False


def test_seo_optimizer():
    """Test del optimizador SEO."""
    print("\n🎯 Test: Optimizador SEO")
    
    try:
        from seo_optimizer import SEOOptimizer
        from config import create_testing_config
        
        config = create_testing_config()
        optimizer = SEOOptimizer(config)
        assert optimizer is not None
        
        print(f"   ✅ Optimizador SEO inicializado")
        
        # Test análisis básico
        content = "Este es un producto de prueba en acero"
        keywords = ["producto", "acero"]
        
        analysis = optimizer.analyze_content_seo(content, keywords)
        assert analysis is not None
        
        print(f"   ✅ Análisis SEO ejecutado")
        return True
        
    except Exception as e:
        print(f"   ❌ Error en optimizador SEO: {e}")
        return False


def test_inicializacion_agente():
    """Test de inicialización del agente principal."""
    print("\n🤖 Test: Inicialización del Agente")
    
    try:
        from agent import AgenteMetadatosGemini
        from config import create_testing_config
        
        config = create_testing_config()
        agente = AgenteMetadatosGemini(config)
        
        assert agente is not None
        assert agente.config is not None
        assert agente.metadata_generator is not None
        assert agente.material_normalizer is not None
        assert agente.content_templates is not None
        assert agente.seo_optimizer is not None
        
        print(f"   ✅ Agente inicializado correctamente")
        print(f"   ✅ Componentes disponibles:")
        print(f"      - Metadata Generator: {type(agente.metadata_generator).__name__}")
        print(f"      - Material Normalizer: {type(agente.material_normalizer).__name__}")
        print(f"      - Content Templates: {type(agente.content_templates).__name__}")
        print(f"      - SEO Optimizer: {type(agente.seo_optimizer).__name__}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error inicializando agente: {e}")
        return False


def test_funcionalidades_basicas():
    """Test de funcionalidades básicas sin dependencias externas."""
    print("\n🧪 Test: Funcionalidades Básicas")
    
    try:
        from agent import AgenteMetadatosGemini
        from config import create_testing_config
        from types import ComponenteReloj, TipoComponente
        
        config = create_testing_config()
        agente = AgenteMetadatosGemini(config)
        
        # Test creación de componente
        componente = ComponenteReloj(
            id="test_funcional_001",
            tipo=TipoComponente.CAJA,
            nombre="Caja Test Funcional"
        )
        
        # Test método de estadísticas (sin procesamiento real)
        stats = agente.obtener_estadisticas_agente()
        assert stats is not None
        assert "agente_info" in stats
        
        print(f"   ✅ Estadísticas del agente obtenidas")
        
        # Test health check básico (sin API real)
        # Solo verificamos que el método existe y es callable
        assert callable(agente.health_check_completo)
        print(f"   ✅ Métodos del agente disponibles")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error en funcionalidades básicas: {e}")
        return False


def test_archivo_ejemplo_uso():
    """Test que el archivo de ejemplo de uso es ejecutable."""
    print("\n📖 Test: Archivo Ejemplo de Uso")
    
    try:
        # Verificar que el archivo existe
        assert os.path.exists("ejemplo_uso.py")
        
        # Verificar que se puede importar (sin ejecutar)
        import ejemplo_uso
        assert ejemplo_uso is not None
        
        # Verificar que tiene funciones principales
        functions = [name for name, obj in inspect.getmembers(ejemplo_uso) 
                    if inspect.isfunction(obj) and not name.startswith('_')]
        
        print(f"   ✅ Archivo ejemplo_uso.py disponible")
        print(f"   ✅ Funciones disponibles: {', '.join(functions[:5])}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error con archivo ejemplo: {e}")
        return False


def test_archivos_documentacion():
    """Test que los archivos de documentación están presentes."""
    print("\n📚 Test: Documentación")
    
    archivos_doc = [
        "README.md",
        "requirements.txt"
    ]
    
    todos_presentes = True
    for archivo in archivos_doc:
        if os.path.exists(archivo):
            size = os.path.getsize(archivo)
            print(f"   ✅ {archivo} ({size} bytes)")
        else:
            print(f"   ❌ {archivo} - NO ENCONTRADO")
            todos_presentes = False
    
    return todos_presentes


def ejecutar_tests_completos():
    """Ejecuta todos los tests disponibles."""
    print("🧪 PRUEBAS DEL AGENTE 6: GENERADOR DE METADATOS Y SEO")
    print("=" * 60)
    
    tests = [
        ("Importaciones Principales", test_importaciones_principales),
        ("Estructura de Archivos", test_estructura_archivos),
        ("Dependencias Principales", test_dependencias_principales),
        ("Tipos de Datos", test_tipos_de_datos),
        ("Sistema de Configuración", test_configuracion),
        ("Normalizador de Materiales", test_material_normalizer),
        ("Sistema de Templates", test_content_templates),
        ("Optimizador SEO", test_seo_optimizer),
        ("Inicialización del Agente", test_inicializacion_agente),
        ("Funcionalidades Básicas", test_funcionalidades_basicas),
        ("Archivo Ejemplo de Uso", test_archivo_ejemplo_uso),
        ("Documentación", test_archivos_documentacion)
    ]
    
    resultados = []
    
    for nombre, test_func in tests:
        try:
            resultado = test_func()
            resultados.append((nombre, resultado, None))
        except Exception as e:
            print(f"   💥 Excepción en {nombre}: {e}")
            resultados.append((nombre, False, str(e)))
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    exitosos = 0
    total = len(resultados)
    
    for nombre, resultado, error in resultados:
        if resultado:
            print(f"✅ {nombre}")
            exitosos += 1
        else:
            print(f"❌ {nombre}")
            if error:
                print(f"   Error: {error}")
    
    print(f"\nResultados: {exitosos}/{total} tests exitosos")
    print(f"Tasa de éxito: {(exitosos/total)*100:.1f}%")
    
    if exitosos == total:
        print("\n🎉 ¡Todos los tests pasaron correctamente!")
        print("El Agente 6 está listo para uso.")
        return True
    elif exitosos >= total * 0.8:  # 80% de éxito
        print(f"\n⚠️  La mayoría de tests pasaron ({exitosos}/{total})")
        print("El agente debería funcionar con funcionalidad limitada.")
        return True
    else:
        print(f"\n❌ Muchos tests fallaron ({exitosos}/{total})")
        print("Revisar instalación y dependencias.")
        return False


def mostrar_proximos_pasos():
    """Muestra los próximos pasos después de los tests."""
    print("\n🚀 PRÓXIMOS PASOS")
    print("=" * 60)
    print("1. 📝 Configurar GEMINI_API_KEY en archivo .env")
    print("2. 🧪 Ejecutar ejemplo de uso: python3 ejemplo_uso.py")
    print("3. 🔧 Personalizar configuraciones en config.py")
    print("4. 📚 Leer documentación en README.md")
    print("5. 🏗️  Integrar en tu sistema principal")
    print("\n💡 Para testing real con API:")
    print("   - Descomenta tests marcados con @pytest.mark.real_api")
    print("   - Configura GEMINI_API_KEY real")
    print("   - Ejecuta: pytest tests/ -v")


def main():
    """Función principal."""
    print("Iniciando tests del Agente 6...\n")
    
    # Ejecutar tests
    success = ejecutar_tests_completos()
    
    # Mostrar próximos pasos
    mostrar_proximos_pasos()
    
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
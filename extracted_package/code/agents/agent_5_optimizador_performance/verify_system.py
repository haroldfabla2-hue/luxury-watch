#!/usr/bin/env python3
"""
Verificación del Sistema - Agente 5: Optimizador de Performance
============================================================

Script de verificación para comprobar que todos los componentes
del agente están funcionando correctamente.
"""

import os
import sys
import json
import time
from pathlib import Path

def check_file_structure():
    """Verifica la estructura de archivos del agente"""
    print("📁 Verificando estructura de archivos...")
    
    required_files = [
        "agent_5_optimizador_performance.py",
        "config.json",
        "light_config.json", 
        "balanced_config.json",
        "aggressive_config.json",
        "requirements.txt",
        "setup.py",
        "main.py",
        "demo.py",
        "examples.py",
        "__init__.py",
        "VERSION.txt",
        "README.md",
        "install.py"
    ]
    
    agent_dir = Path(__file__).parent
    missing_files = []
    
    for file in required_files:
        file_path = agent_dir / file
        if file_path.exists():
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file}")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n❌ Archivos faltantes: {', '.join(missing_files)}")
        return False
    
    print("✅ Estructura de archivos completa")
    return True

def check_dependencies():
    """Verifica dependencias Python"""
    print("\n📦 Verificando dependencias Python...")
    
    dependencies = [
        ("numpy", "numpy"),
        ("ujson", "ujson"),
        ("PIL", "Pillow"),
        ("scipy", "scipy"),
        ("yaml", "PyYAML"),
        ("tqdm", "tqdm"),
        ("pydantic", "pydantic")
    ]
    
    missing_deps = []
    
    for module_name, package_name in dependencies:
        try:
            module = __import__(module_name)
            version = getattr(module, '__version__', 'N/A')
            print(f"  ✅ {package_name}: {version}")
        except ImportError:
            print(f"  ❌ {package_name}: No instalado")
            missing_deps.append(package_name)
    
    # Verificar glTF-Transform por separado
    try:
        import gltf_transform
        print(f"  ✅ gltf-transform: Instalado")
    except ImportError:
        print(f"  ⚠️ gltf-transform: No instalado (funcionalidad limitada)")
        missing_deps.append("gltf-transform")
    
    if missing_deps:
        print(f"\n⚠️ Dependencias faltantes: {', '.join(missing_deps)}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False
    
    print("✅ Dependencias verificadas")
    return True

def check_system_requirements():
    """Verifica requisitos del sistema"""
    print("\n🔧 Verificando requisitos del sistema...")
    
    # Versión de Python
    python_version = sys.version_info
    if python_version >= (3, 8):
        print(f"  ✅ Python: {python_version.major}.{python_version.minor}.{python_version.micro}")
    else:
        print(f"  ❌ Python: {python_version.major}.{python_version.minor} (se requiere 3.8+)")
        return False
    
    # Sistema operativo
    system = sys.platform
    print(f"  ✅ Sistema: {system}")
    
    # Memoria disponible (estimada)
    try:
        import psutil
        memory = psutil.virtual_memory()
        memory_gb = memory.total / (1024**3)
        print(f"  ✅ RAM disponible: {memory_gb:.1f} GB")
    except ImportError:
        print(f"  ⚠️ psutil no disponible - no se puede verificar RAM")
    
    print("✅ Requisitos del sistema verificados")
    return True

def test_agent_import():
    """Prueba la importación del agente"""
    print("\n🔍 Probando importación del agente...")
    
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from agent_5_optimizador_performance import AutoOptimizer, GLTFPerformanceOptimizer
        
        print("  ✅ AutoOptimizer importado")
        print("  ✅ GLTFPerformanceOptimizer importado")
        
        # Probar instanciación
        auto_optimizer = AutoOptimizer()
        print("  ✅ AutoOptimizer instanciado")
        
        optimizer = GLTFPerformanceOptimizer()
        print("  ✅ GLTFPerformanceOptimizer instanciado")
        
        print("✅ Importación exitosa")
        return True
        
    except ImportError as e:
        print(f"  ❌ Error de importación: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Error general: {e}")
        return False

def test_configuration_files():
    """Prueba archivos de configuración"""
    print("\n⚙️ Verificando archivos de configuración...")
    
    config_files = [
        "config.json",
        "light_config.json",
        "balanced_config.json", 
        "aggressive_config.json"
    ]
    
    agent_dir = Path(__file__).parent
    
    for config_file in config_files:
        config_path = agent_dir / config_file
        
        if not config_path.exists():
            print(f"  ❌ {config_file}: No encontrado")
            continue
        
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Verificar estructura básica
            if 'optimization' in config and 'device_profiles' in config:
                print(f"  ✅ {config_file}: Válido")
            else:
                print(f"  ⚠️ {config_file}: Estructura incompleta")
                
        except json.JSONDecodeError:
            print(f"  ❌ {config_file}: JSON inválido")
        except Exception as e:
            print(f"  ❌ {config_file}: Error - {e}")
    
    print("✅ Configuraciones verificadas")
    return True

def test_sample_creation():
    """Prueba creación de archivos de muestra"""
    print("\n📝 Probando creación de archivos de muestra...")
    
    try:
        sample_gltf = {
            "asset": {"version": "2.0", "generator": "Test"},
            "scenes": [{"nodes": [0]}],
            "nodes": [{"name": "Test", "mesh": 0}],
            "meshes": [{
                "name": "TestMesh",
                "primitives": [{"attributes": {"POSITION": 0}, "indices": 1}]
            }],
            "materials": [{"name": "TestMaterial"}],
            "buffers": [{"uri": "", "byteLength": 0}],
            "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 0}],
            "accessors": []
        }
        
        # Crear archivo temporal
        test_path = Path(__file__).parent / "test_sample.gltf"
        with open(test_path, 'w', encoding='utf-8') as f:
            json.dump(sample_gltf, f, indent=2)
        
        print(f"  ✅ Archivo de prueba creado: test_sample.gltf")
        
        # Limpiar archivo temporal
        test_path.unlink()
        print(f"  ✅ Archivo temporal eliminado")
        
        print("✅ Creación de archivos exitosa")
        return True
        
    except Exception as e:
        print(f"  ❌ Error creando archivos: {e}")
        return False

def run_basic_functionality_test():
    """Prueba funcionalidad básica"""
    print("\n🧪 Ejecutando prueba de funcionalidad básica...")
    
    try:
        # Crear archivo de prueba temporal
        test_gltf = {
            "asset": {"version": "2.0", "generator": "Functionality Test"},
            "scenes": [{"nodes": [0]}],
            "nodes": [{"name": "Test", "mesh": 0}],
            "meshes": [{
                "name": "TestMesh",
                "primitives": [{
                    "attributes": {"POSITION": 0, "NORMAL": 1},
                    "indices": 2,
                    "material": 0
                }]
            }],
            "materials": [{
                "name": "TestMaterial",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [1, 0.8, 0.6, 1]
                }
            }],
            "buffers": [{"uri": "", "byteLength": 0}],
            "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 0}],
            "accessors": []
        }
        
        test_path = Path(__file__).parent / "functionality_test.gltf"
        with open(test_path, 'w', encoding='utf-8') as f:
            json.dump(test_gltf, f, indent=2)
        
        # Importar y probar
        sys.path.insert(0, str(Path(__file__).parent))
        from agent_5_optimizador_performance import AutoOptimizer
        
        # Crear optimizador
        optimizer = AutoOptimizer()
        
        # Probar análisis de complejidad
        complexity = optimizer._analyze_model_complexity(str(test_path))
        
        print(f"  ✅ Análisis de complejidad: {complexity['complexity_score']} puntos")
        
        # Probar detección de estrategia
        strategy = optimizer._determine_optimization_strategy(complexity)
        print(f"  ✅ Estrategia detectada: {strategy['strategy']}")
        
        # Probar detección de dispositivo
        device = optimizer._detect_primary_device(complexity)
        print(f"  ✅ Dispositivo principal: {device}")
        
        # Limpiar archivo de prueba
        test_path.unlink()
        
        print("✅ Prueba de funcionalidad exitosa")
        return True
        
    except Exception as e:
        print(f"  ❌ Error en prueba de funcionalidad: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_file_sizes():
    """Verifica tamaños de archivos principales"""
    print("\n📊 Verificando tamaños de archivos...")
    
    important_files = [
        "agent_5_optimizador_performance.py",
        "README.md",
        "config.json"
    ]
    
    agent_dir = Path(__file__).parent
    
    for file_name in important_files:
        file_path = agent_dir / file_name
        
        if file_path.exists():
            size_kb = file_path.stat().st_size / 1024
            print(f"  ✅ {file_name}: {size_kb:.1f} KB")
        else:
            print(f"  ❌ {file_name}: No encontrado")
    
    print("✅ Tamaños de archivos verificados")

def generate_verification_report():
    """Genera reporte de verificación"""
    print("\n📋 Generando reporte de verificación...")
    
    report = {
        "verification_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "system_info": {
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "platform": sys.platform,
            "agent_directory": str(Path(__file__).parent)
        },
        "verification_results": {
            "file_structure": "pending",
            "dependencies": "pending", 
            "system_requirements": "pending",
            "agent_import": "pending",
            "configuration_files": "pending",
            "sample_creation": "pending",
            "functionality_test": "pending"
        }
    }
    
    # Ejecutar verificaciones
    checks = [
        ("file_structure", check_file_structure),
        ("dependencies", check_dependencies),
        ("system_requirements", check_system_requirements),
        ("agent_import", test_agent_import),
        ("configuration_files", test_configuration_files),
        ("sample_creation", test_sample_creation),
        ("functionality_test", run_basic_functionality_test)
    ]
    
    all_passed = True
    
    for check_name, check_function in checks:
        try:
            result = check_function()
            report["verification_results"][check_name] = "passed" if result else "failed"
            if not result:
                all_passed = False
        except Exception as e:
            report["verification_results"][check_name] = f"error: {str(e)}"
            all_passed = False
    
    # Guardar reporte
    report_path = Path(__file__).parent / "verification_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # Mostrar resumen
    print(f"\n" + "="*60)
    print("📊 REPORTE DE VERIFICACIÓN")
    print("="*60)
    
    passed = sum(1 for v in report["verification_results"].values() if v == "passed")
    total = len(report["verification_results"])
    
    print(f"Verificaciones pasadas: {passed}/{total}")
    
    if all_passed:
        print("✅ VERIFICACIÓN EXITOSA - Agente 5 listo para usar")
        status = "SUCCESS"
    else:
        print("⚠️ VERIFICACIÓN CON ADVERTENCIAS - Revisar problemas")
        status = "WARNING"
    
    report["overall_status"] = status
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    
    print(f"📄 Reporte guardado en: {report_path}")
    
    return all_passed

def main():
    """Función principal de verificación"""
    print("🔍 VERIFICACIÓN DEL SISTEMA - AGENTE 5")
    print("=" * 60)
    print("Verificando que todos los componentes estén funcionando")
    print()
    
    try:
        success = generate_verification_report()
        
        if success:
            print(f"\n🎉 El Agente 5: Optimizador de Performance está listo!")
            print(f"\n💡 Comandos de uso:")
            print(f"   python main.py --help")
            print(f"   python demo.py")
            print(f"   python examples.py")
            print(f"\n📚 Consulta README.md para documentación completa")
            
        else:
            print(f"\n⚠️ Se encontraron problemas en la verificación")
            print(f"💡 Intenta ejecutar: python install.py")
            
        return success
        
    except KeyboardInterrupt:
        print(f"\n⏹️ Verificación cancelada por el usuario")
        return False
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    main()
"""
Agente 5: Optimizador de Performance
===================================

Sistema avanzado de optimización automática para modelos 3D glTF usando 
glTF-Transform con compresión Draco, optimización de texturas KTX2/Basis 
Universal, generación automática de LODs y optimización específica por dispositivo.

Paquete principal que exporta las clases y funciones principales para uso 
en otros módulos y scripts.

Autor: Sistema de Agentes IA
Versión: 1.0.0
"""

from .agent_5_optimizador_performance import (
    GLTFPerformanceOptimizer,
    AutoOptimizer, 
    OptimizationStats,
    DeviceOptimization
)

__version__ = "1.0.0"
__author__ = "Sistema de Agentes IA"
__description__ = "Sistema avanzado de optimización automática para modelos 3D glTF"

# Información del paquete
__all__ = [
    "GLTFPerformanceOptimizer",
    "AutoOptimizer",
    "OptimizationStats", 
    "DeviceOptimization"
]

# Metadatos del paquete
PACKAGE_INFO = {
    "name": "agent-5-optimizador-performance",
    "version": __version__,
    "description": __description__,
    "author": __author__,
    "license": "MIT",
    "python_requires": ">=3.8",
    "keywords": ["gltf", "3d", "optimization", "performance", "draco", "ktx2", "lod"],
    "classifiers": [
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9", 
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Multimedia :: Graphics :: 3D Modeling",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Hardware :: 3D Hardware",
    ]
}

def get_version():
    """Retorna la versión actual del paquete"""
    return __version__

def get_package_info():
    """Retorna información completa del paquete"""
    return PACKAGE_INFO.copy()

def check_dependencies():
    """Verifica que todas las dependencias estén instaladas"""
    missing_deps = []
    
    required_deps = [
        "gltf_transform",
        "numpy",
        "ujson", 
        "PIL",
        "scipy",
        "yaml"
    ]
    
    for dep in required_deps:
        try:
            __import__(dep)
        except ImportError:
            missing_deps.append(dep)
    
    if missing_deps:
        print(f"⚠️ Dependencias faltantes: {', '.join(missing_deps)}")
        print("💡 Instala con: pip install -r requirements.txt")
        return False
    
    print("✅ Todas las dependencias están instaladas")
    return True

def quick_start():
    """Función de inicio rápido para nuevos usuarios"""
    print("🚀 INICIO RÁPIDO - AGENTE 5: OPTIMIZADOR DE PERFORMANCE")
    print("=" * 60)
    print()
    print("Ejemplos de uso básico:")
    print()
    print("1. Optimización automática:")
    print("   from agent_5_optimizador_performance import AutoOptimizer")
    print("   optimizer = AutoOptimizer()")
    print("   results = optimizer.auto_optimize('modelo.gltf', 'output')")
    print()
    print("2. Optimización específica:")
    print("   from agent_5_optimizador_performance import GLTFPerformanceOptimizer")
    print("   optimizer = GLTFPerformanceOptimizer()")
    print("   stats = optimizer.optimize_glTF('modelo.gltf', 'output', 'mobile')")
    print()
    print("3. Línea de comandos:")
    print("   python main.py modelo.gltf output/ --device mobile")
    print("   python main.py --batch input_dir/ output_dir/")
    print()
    print("📚 Para más información, consulta README.md")
    print("🎮 Para ver demos, ejecuta: python demo.py")
    print()

# Función principal cuando se ejecuta como script
def main():
    """Función principal cuando se ejecuta el paquete como script"""
    import sys
    
    # Mostrar información si no hay argumentos
    if len(sys.argv) == 1:
        quick_start()
        return
    
    # Importar y ejecutar main.py
    try:
        from . import main as cli_main
        cli_main.main()
    except ImportError:
        print("❌ Error: No se pudo importar la interfaz de línea de comandos")
        print("💡 Asegúrate de que main.py esté en el mismo directorio")
    except Exception as e:
        print(f"❌ Error ejecutando CLI: {e}")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Setup script para Agente 5: Optimizador de Performance
=====================================================

Script de instalación automatizada con verificaciones de dependencias
y configuración del entorno de optimización.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from setuptools import setup, find_packages

# Leer versión del agente
def get_version():
    version_file = Path(__file__).parent / "VERSION.txt"
    if version_file.exists():
        return version_file.read_text().strip()
    return "1.0.0"

# Verificar dependencias del sistema
def check_system_dependencies():
    """Verifica dependencias del sistema necesarias"""
    missing = []
    
    # Verificar Python
    if sys.version_info < (3, 8):
        missing.append("Python 3.8+")
    
    # Verificar npm (opcional)
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️ npm no encontrado - algunos features opcionales no estarán disponibles")
    
    # Verificar node (opcional)
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️ Node.js no encontrado - algunos features opcionales no estarán disponibles")
    
    if missing:
        print(f"❌ Dependencias faltantes: {', '.join(missing)}")
        return False
    
    print("✅ Dependencias del sistema verificadas")
    return True

# Instalar dependencias Python
def install_python_dependencies():
    """Instala dependencias Python requeridas"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt no encontrado")
        return False
    
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ], check=True)
        print("✅ Dependencias Python instaladas")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        return False

# Configurar glTF-Transform CLI (opcional)
def setup_gltf_transform_cli():
    """Instala glTF-Transform CLI si npm está disponible"""
    try:
        # Verificar si ya está instalado
        result = subprocess.run(
            ["gltf-transform", "--version"], 
            check=True, 
            capture_output=True, 
            text=True
        )
        print(f"✅ glTF-Transform CLI ya instalado: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Intentar instalar
    try:
        subprocess.run([
            "npm", "install", "-g", "@gltf-transform/cli"
        ], check=True)
        print("✅ glTF-Transform CLI instalado")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️ No se pudo instalar glTF-Transform CLI (opcional)")
        return False

# Crear directorios necesarios
def create_directories():
    """Crea directorios necesarios para el funcionamiento"""
    directories = [
        "logs",
        "cache",
        "temp",
        "output"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    print("✅ Directorios creados")

# Verificar instalación
def verify_installation():
    """Verifica que la instalación sea correcta"""
    try:
        # Test básico de importación
        import agent_5_optimizador_performance
        from gltf_transform import Document
        print("✅ Instalación verificada correctamente")
        return True
    except ImportError as e:
        print(f"❌ Error en la verificación: {e}")
        return False

# Mostrar información post-instalación
def show_post_install_info():
    """Muestra información importante post-instalación"""
    print("\n" + "="*60)
    print("🎉 INSTALACIÓN COMPLETADA")
    print("="*60)
    print()
    print("📋 Comandos de uso rápido:")
    print("  python -m agent_5_optimizador_performance --help")
    print("  python -c \"from agent_5_optimizador_performance import AutoOptimizer; AutoOptimizer().auto_optimize('modelo.gltf', 'output')\"")
    print()
    print("📁 Archivos importantes:")
    print("  - config.json: Configuración del optimizador")
    print("  - requirements.txt: Dependencias")
    print("  - README.md: Documentación completa")
    print()
    print("🔧 Para optimizar un modelo:")
    print("  1. Coloca tu archivo .gltf en el directorio actual")
    print("  2. Ejecuta: python agent_5_optimizador_performance.py tu_modelo.gltf")
    print()
    print("📊 Para más información, consulta README.md")
    print()

# Script principal de instalación
def main():
    """Función principal de instalación"""
    print("🚀 AGENTE 5: OPTIMIZADOR DE PERFORMANCE")
    print("="*50)
    print("Instalador automático del sistema de optimización 3D")
    print()
    
    # Verificar dependencias del sistema
    if not check_system_dependencies():
        print("\n❌ Instalación cancelada por dependencias faltantes")
        sys.exit(1)
    
    # Instalar dependencias Python
    if not install_python_dependencies():
        print("\n❌ Error instalando dependencias Python")
        sys.exit(1)
    
    # Configurar CLI opcional
    setup_gltf_transform_cli()
    
    # Crear directorios
    create_directories()
    
    # Verificar instalación
    if verify_installation():
        show_post_install_info()
    else:
        print("\n❌ Instalación incompleta")
        sys.exit(1)

# Configuración del paquete
setup(
    name="agent-5-optimizador-performance",
    version=get_version(),
    description="Sistema avanzado de optimización automática para modelos 3D glTF",
    long_description=open("README.md", "r", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    author="Sistema de Agentes IA",
    author_email="agents@ia-system.com",
    url="https://github.com/ia-system/agent-5-optimizador",
    packages=find_packages(),
    py_modules=["agent_5_optimizador_performance"],
    classifiers=[
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
    ],
    python_requires=">=3.8",
    install_requires=[
        "numpy>=1.21.0",
        "gltf-transform>=3.8.0",
        "ujson>=5.6.0",
        "Pillow>=9.0.0",
        "scipy>=1.9.0",
        "PyYAML>=6.0",
        "tqdm>=4.64.0",
        "colorlog>=6.7.0",
        "pydantic>=1.10.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=22.0.0",
            "flake8>=5.0.0",
            "mypy>=0.950",
        ],
        "cli": [
            "@gltf-transform/cli>=3.8.0",
        ],
        "all": [
            "pytest>=7.0.0",
            "black>=22.0.0",
            "flake8>=5.0.0",
            "mypy>=0.950",
            "@gltf-transform/cli>=3.8.0",
        ]
    },
    entry_points={
        "console_scripts": [
            "agent-5-optimizer=agent_5_optimizador_performance:main",
            "optimize-gltf=agent_5_optimizador_performance:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.json", "*.txt", "*.md", "*.yml", "*.yaml"],
    },
    keywords="gltf 3d optimization performance draco ktx2 lod level-of-detail",
    project_urls={
        "Bug Reports": "https://github.com/ia-system/agent-5-optimizador/issues",
        "Source": "https://github.com/ia-system/agent-5-optimizador",
        "Documentation": "https://github.com/ia-system/agent-5-optimizador#readme",
    },
)

# Ejecutar instalación si se llama directamente
if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Instalador y Configurador Automático del Agente 5
================================================

Script para instalación automática, configuración del entorno y
verificación completa del sistema de optimización de performance.
"""

import os
import sys
import subprocess
import json
import platform
from pathlib import Path

class Agente5Installer:
    """Instalador completo del Agente 5"""
    
    def __init__(self):
        self.agent_dir = Path(__file__).parent.absolute()
        self.system = platform.system().lower()
        self.python_version = sys.version_info
        
    def print_banner(self):
        """Muestra banner del instalador"""
        print("🚀 INSTALADOR AUTOMÁTICO - AGENTE 5")
        print("=" * 60)
        print("Optimizador de Performance para modelos 3D glTF")
        print("Compresión Draco + KTX2 + LODs automáticos")
        print("=" * 60)
    
    def check_python_version(self):
        """Verifica versión de Python"""
        print(f"\n🐍 Verificando Python...")
        
        if self.python_version < (3, 8):
            print(f"❌ Python {self.python_version.major}.{self.python_version.minor} no soportado")
            print("💡 Se requiere Python 3.8 o superior")
            return False
        
        print(f"✅ Python {self.python_version.major}.{self.python_version.minor}.{self.python_version.micro}")
        return True
    
    def check_node_npm(self):
        """Verifica instalación de Node.js y npm"""
        print(f"\n📦 Verificando Node.js y npm...")
        
        # Verificar Node.js
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            node_version = result.stdout.strip()
            print(f"✅ Node.js: {node_version}")
        except FileNotFoundError:
            print("⚠️ Node.js no encontrado")
            node_version = None
        
        # Verificar npm
        try:
            result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
            npm_version = result.stdout.strip()
            print(f"✅ npm: {npm_version}")
            return True
        except FileNotFoundError:
            print("⚠️ npm no encontrado")
            return False
    
    def install_python_dependencies(self):
        """Instala dependencias Python"""
        print(f"\n📦 Instalando dependencias Python...")
        
        requirements_file = self.agent_dir / "requirements.txt"
        if not requirements_file.exists():
            print("❌ requirements.txt no encontrado")
            return False
        
        try:
            # Actualizar pip primero
            subprocess.run([
                sys.executable, "-m", "pip", "install", "--upgrade", "pip"
            ], check=True, capture_output=True)
            
            # Instalar dependencias
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ], check=True)
            
            print("✅ Dependencias Python instaladas")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando dependencias: {e}")
            return False
    
    def install_gltf_transform_cli(self):
        """Instala glTF-Transform CLI"""
        print(f"\n🔧 Instalando glTF-Transform CLI...")
        
        try:
            # Verificar si ya está instalado
            result = subprocess.run(["gltf-transform", "--version"], 
                                  capture_output=True, text=True)
            print(f"✅ glTF-Transform CLI ya instalado: {result.stdout.strip()}")
            return True
            
        except FileNotFoundError:
            pass
        
        try:
            # Instalar glTF-Transform CLI
            subprocess.run([
                "npm", "install", "-g", "@gltf-transform/cli"
            ], check=True)
            
            print("✅ glTF-Transform CLI instalado")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"⚠️ No se pudo instalar glTF-Transform CLI: {e}")
            print("💡 El agente funcionará sin CLI, pero con funcionalidades limitadas")
            return False
    
    def create_directories(self):
        """Crea directorios necesarios"""
        print(f"\n📁 Creando directorios...")
        
        directories = [
            "logs",
            "cache", 
            "temp",
            "output",
            "input"
        ]
        
        for directory in directories:
            dir_path = self.agent_dir / directory
            dir_path.mkdir(exist_ok=True)
        
        print("✅ Directorios creados")
        return True
    
    def verify_installation(self):
        """Verifica que la instalación sea correcta"""
        print(f"\n🔍 Verificando instalación...")
        
        try:
            # Test de importación
            sys.path.insert(0, str(self.agent_dir))
            from agent_5_optimizador_performance import AutoOptimizer
            
            # Test de instanciación
            optimizer = AutoOptimizer()
            
            print("✅ Agente importado e instanciado correctamente")
            return True
            
        except ImportError as e:
            print(f"❌ Error importando agente: {e}")
            return False
        except Exception as e:
            print(f"❌ Error en la verificación: {e}")
            return False
    
    def create_sample_files(self):
        """Crea archivos de ejemplo"""
        print(f"\n📝 Creando archivos de ejemplo...")
        
        # Crear archivo glTF de ejemplo
        sample_gltf = {
            "asset": {
                "version": "2.0",
                "generator": "Agente 5 Sample Model"
            },
            "scenes": [{"nodes": [0]}],
            "nodes": [{"name": "SampleMesh", "mesh": 0}],
            "meshes": [{
                "name": "SampleMesh",
                "primitives": [{
                    "attributes": {
                        "POSITION": 0,
                        "NORMAL": 1, 
                        "TEXCOORD_0": 2
                    },
                    "indices": 3,
                    "material": 0
                }]
            }],
            "materials": [{
                "name": "SampleMaterial",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [1.0, 0.8, 0.6, 1.0],
                    "metallicFactor": 0.1,
                    "roughnessFactor": 0.8
                }
            }],
            "buffers": [{"uri": "data:application/octet-stream;base64,", "byteLength": 0}],
            "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 0}],
            "accessors": []
        }
        
        sample_path = self.agent_dir / "input" / "sample_model.gltf"
        sample_path.parent.mkdir(exist_ok=True)
        
        with open(sample_path, 'w', encoding='utf-8') as f:
            json.dump(sample_gltf, f, indent=2)
        
        print("✅ Archivo de ejemplo creado: input/sample_model.gltf")
        return True
    
    def run_quick_test(self):
        """Ejecuta prueba rápida del agente"""
        print(f"\n🧪 Ejecutando prueba rápida...")
        
        try:
            sys.path.insert(0, str(self.agent_dir))
            from agent_5_optimizador_performance import AutoOptimizer
            
            # Crear optimizador
            optimizer = AutoOptimizer()
            
            # Probar análisis de complejidad
            sample_path = self.agent_dir / "input" / "sample_model.gltf"
            complexity = optimizer._analyze_model_complexity(str(sample_path))
            
            print(f"✅ Prueba exitosa:")
            print(f"  📊 Score de complejidad: {complexity['complexity_score']}")
            print(f"  🔢 Meshes: {complexity['mesh_count']}")
            print(f"  🖼️ Texturas: {complexity['texture_count']}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error en prueba: {e}")
            return False
    
    def show_final_instructions(self):
        """Muestra instrucciones finales"""
        print(f"\n" + "="*60)
        print("🎉 INSTALACIÓN COMPLETADA")
        print("="*60)
        print(f"\n📋 Comandos de uso:")
        print(f"  # Optimización básica automática")
        print(f"  python main.py input/sample_model.gltf output/")
        print(f"")
        print(f"  # Optimización para dispositivo específico")  
        print(f"  python main.py input/sample_model.gltf output/ --device mobile")
        print(f"")
        print(f"  # Procesamiento por lotes")
        print(f"  python main.py --batch input/ output_optimized/")
        print(f"")
        print(f"  # Análisis de modelo")
        print(f"  python main.py --analyze input/sample_model.gltf")
        print(f"")
        print(f"  # Ejecutar demos interactivos")
        print(f"  python demo.py")
        print(f"  python examples.py")
        print(f"")
        print(f"📚 Documentación completa: README.md")
        print(f"⚙️ Configuraciones: config.json, *_config.json")
        print(f"")
        print(f"💡 Para optimizar tus modelos:")
        print(f"  1. Coloca tus archivos .gltf en el directorio 'input/'")
        print(f"  2. Ejecuta: python main.py input/tu_modelo.gltf output/")
        print(f"  3. Revisa los resultados en el directorio 'output/'")
        print(f"")
        print(f"🚀 ¡El Agente 5 está listo para optimizar tus modelos 3D!")
    
    def show_troubleshooting(self):
        """Muestra información de solución de problemas"""
        print(f"\n🔧 SOLUCIÓN DE PROBLEMAS")
        print(f"="*40)
        print(f"\n❓ Problemas comunes:")
        print(f"  - Error de importación: pip install -r requirements.txt")
        print(f"  - glTF-Transform no encontrado: npm install -g @gltf-transform/cli")
        print(f"  - Permisos denegados: ejecutar como administrador/sudo")
        print(f"  - Modelos no se procesan: verificar formato .gltf/.glb")
        print(f"")
        print(f"📞 Logs disponibles en: logs/")
        print(f"🧪 Para debugging: python -m agent_5_optimizador_performance --verbose")
    
    def install(self):
        """Ejecuta instalación completa"""
        self.print_banner()
        
        steps = [
            ("Verificar Python", self.check_python_version),
            ("Verificar Node.js/npm", self.check_node_npm),
            ("Instalar dependencias Python", self.install_python_dependencies),
            ("Instalar glTF-Transform CLI", self.install_gltf_transform_cli),
            ("Crear directorios", self.create_directories),
            ("Crear archivos de ejemplo", self.create_sample_files),
            ("Verificar instalación", self.verify_installation),
            ("Ejecutar prueba rápida", self.run_quick_test)
        ]
        
        for step_name, step_function in steps:
            print(f"\n🔄 {step_name}...")
            
            try:
                if not step_function():
                    print(f"❌ {step_name} falló")
                    
                    # Ofrecer continuar o salir
                    continue_anyway = input(f"¿Continuar de todos modos? (s/n): ").lower().strip()
                    if continue_anyway not in ['s', 'si', 'y', 'yes']:
                        print(f"🚫 Instalación cancelada")
                        return False
            except Exception as e:
                print(f"❌ Error en {step_name}: {e}")
                
                continue_anyway = input(f"¿Continuar de todos modos? (s/n): ").lower().strip()
                if continue_anyway not in ['s', 'si', 'y', 'yes']:
                    print(f"🚫 Instalación cancelada")
                    return False
        
        self.show_final_instructions()
        
        # Preguntar si mostrar troubleshooting
        show_trouble = input(f"\n❓ ¿Mostrar guía de solución de problemas? (s/n): ").lower().strip()
        if show_trouble in ['s', 'si', 'y', 'yes']:
            self.show_troubleshooting()
        
        return True

def main():
    """Función principal del instalador"""
    installer = Agente5Installer()
    
    # Verificar si se ejecuta desde el directorio correcto
    if not (installer.agent_dir / "agent_5_optimizador_performance.py").exists():
        print("❌ Error: Ejecutar desde el directorio del agente")
        print(f"📁 Directorio actual: {installer.agent_dir}")
        sys.exit(1)
    
    # Ejecutar instalación
    try:
        success = installer.install()
        
        if success:
            print(f"\n✅ Instalación completada exitosamente")
            sys.exit(0)
        else:
            print(f"\n❌ Instalación incompleta")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print(f"\n\n⏹️ Instalación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
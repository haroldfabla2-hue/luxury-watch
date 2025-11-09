#!/bin/bash
# Script de Instalación del Agente 4: Validador de Calidad 3D
# =========================================================

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para detectar el sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Función para verificar Python
check_python() {
    print_status "Verificando Python..."
    
    if ! command_exists python3; then
        print_error "Python 3 no está instalado."
        echo "Por favor instala Python 3.8 o superior:"
        echo "  - Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip"
        echo "  - CentOS/RHEL: sudo yum install python3 python3-pip"
        echo "  - macOS: brew install python3"
        echo "  - Windows: Descarga desde https://python.org"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python encontrado: $PYTHON_VERSION"
    
    # Verificar versión mínima
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
        print_error "Se requiere Python 3.8 o superior. Versión actual: $PYTHON_VERSION"
        exit 1
    fi
    
    print_success "Versión de Python compatible"
}

# Función para verificar pip
check_pip() {
    print_status "Verificando pip..."
    
    if ! command_exists pip3; then
        print_error "pip3 no está instalado."
        echo "Instala pip:"
        echo "  - Ubuntu/Debian: sudo apt install python3-pip"
        echo "  - CentOS/RHEL: sudo yum install python3-pip"
        echo "  - macOS: viene con Python"
        exit 1
    fi
    
    print_success "pip encontrado"
}

# Función para instalar dependencias del sistema (Ubuntu/Debian)
install_system_deps_ubuntu() {
    print_status "Instalando dependencias del sistema para Ubuntu/Debian..."
    
    sudo apt update
    sudo apt install -y \
        python3-dev \
        python3-pip \
        python3-venv \
        build-essential \
        cmake \
        pkg-config \
        libopencv-dev \
        python3-opencv \
        git \
        wget \
        curl
}

# Función para instalar dependencias del sistema (CentOS/RHEL)
install_system_deps_centos() {
    print_status "Instalando dependencias del sistema para CentOS/RHEL..."
    
    sudo yum groupinstall -y "Development Tools"
    sudo yum install -y \
        python3-devel \
        python3-pip \
        opencv-devel \
        cmake \
        gcc-c++ \
        git \
        wget \
        curl
}

# Función para instalar dependencias del sistema (macOS)
install_system_deps_macos() {
    print_status "Instalando dependencias del sistema para macOS..."
    
    if ! command_exists brew; then
        print_error "Homebrew no está instalado."
        echo "Instala Homebrew desde: https://brew.sh"
        exit 1
    fi
    
    brew install python@3.9 \
        opencv \
        cmake \
        pkg-config \
        git
}

# Función para crear entorno virtual
create_virtualenv() {
    print_status "Creando entorno virtual..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Entorno virtual creado"
    else
        print_warning "Entorno virtual ya existe"
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    print_success "Entorno virtual activado"
    
    # Actualizar pip
    pip install --upgrade pip
}

# Función para instalar dependencias de Python
install_python_deps() {
    print_status "Instalando dependencias de Python..."
    
    # Instalar dependencias básicas primero
    pip install numpy scipy
    
    # Instalar dependencias principales
    pip install open3d opencv-python Pillow matplotlib seaborn scikit-image
    
    # Instalar dependencias opcionales
    pip install jsonschema tqdm colorama requests
    
    print_success "Dependencias de Python instaladas"
}

# Función para instalar dependencias opcionales avanzadas
install_optional_deps() {
    print_status "¿Instalar dependencias opcionales avanzadas? (LPIPS, PyTorch)"
    read -p "Esto es opcional pero mejora las métricas de calidad. (y/N): " install_optional
    
    if [[ $install_optional =~ ^[Yy]$ ]]; then
        print_status "Instalando dependencias opcionales avanzadas..."
        
        # Instalar PyTorch
        pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
        
        # Instalar LPIPS
        pip install lpips
        
        print_success "Dependencias opcionales instaladas"
    else
        print_warning "Dependencias opcionales omitidas"
    fi
}

# Función para verificar instalación
verify_installation() {
    print_status "Verificando instalación..."
    
    # Crear script de prueba
    cat > test_installation.py << 'EOF'
#!/usr/bin/env python3
import sys
print("Python version:", sys.version)

try:
    import numpy as np
    print("✅ NumPy:", np.__version__)
except ImportError:
    print("❌ NumPy no disponible")

try:
    import open3d as o3d
    print("✅ Open3D:", o3d.__version__)
except ImportError:
    print("❌ Open3D no disponible")

try:
    import cv2
    print("✅ OpenCV:", cv2.__version__)
except ImportError:
    print("❌ OpenCV no disponible")

try:
    import PIL
    print("✅ Pillow:", PIL.__version__)
except ImportError:
    print("❌ Pillow no disponible")

try:
    import matplotlib
    print("✅ Matplotlib:", matplotlib.__version__)
except ImportError:
    print("❌ Matplotlib no disponible")

try:
    import skimage
    print("✅ scikit-image:", skimage.__version__)
except ImportError:
    print("❌ scikit-image no disponible")

try:
    import torch
    print("✅ PyTorch disponible")
except ImportError:
    print("⚠️  PyTorch no disponible (opcional)")

try:
    import lpips
    print("✅ LPIPS disponible")
except ImportError:
    print("⚠️  LPIPS no disponible (opcional)")

print("\n🎉 Verificación de instalación completada")
EOF
    
    # Ejecutar prueba
    python3 test_installation.py
}

# Función para crear archivo de ejemplo
create_example_file() {
    print_status "Creando archivo de ejemplo..."
    
    cat > ejemplo_modelo.gltf << 'EOF'
{
    "asset": {
        "version": "2.0",
        "generator": "Validador3D-Ejemplo"
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
        "uri": "data:application/octet-stream;base64,AAAA"
    }],
    "bufferViews": [
        {"buffer": 0, "byteOffset": 0, "byteLength": 72, "target": 34962},
        {"buffer": 0, "byteOffset": 72, "byteLength": 24, "target": 34963}
    ],
    "accessors": [
        {
            "bufferView": 0,
            "componentType": 5126,
            "count": 8,
            "type": "VEC3"
        },
        {
            "bufferView": 1,
            "componentType": 5123,
            "count": 12,
            "type": "SCALAR"
        }
    ]
}
EOF
    
    print_success "Archivo de ejemplo creado: ejemplo_modelo.gltf"
}

# Función para ejecutar prueba básica
run_basic_test() {
    print_status "¿Ejecutar prueba básica del validador?"
    read -p "Esto validará el archivo de ejemplo. (Y/n): " run_test
    
    if [[ ! $run_test =~ ^[Nn]$ ]]; then
        print_status "Ejecutando prueba básica..."
        
        cat > test_validador.py << 'EOF'
#!/usr/bin/env python3
import sys
import os
sys.path.append('.')

from validador_3d_principal import Validador3DPrincipal

print("🔍 Iniciando prueba básica del validador...")

try:
    validador = Validador3DPrincipal()
    resultados = validador.validar_archivo('ejemplo_modelo.gltf')
    
    print(f"✅ Validación completada")
    print(f"   Puntuación: {resultados.get('puntuacion_calidad', 0):.1f}/10")
    print(f"   Problemas: {len(resultados.get('problemas_detectados', []))}")
    
    # Generar reporte de prueba
    validador.generar_reporte_html('reporte_prueba.html')
    print(f"   Reporte generado: reporte_prueba.html")
    
except Exception as e:
    print(f"❌ Error en prueba: {e}")
    sys.exit(1)
EOF
        
        python3 test_validador.py
        print_success "Prueba básica completada"
    fi
}

# Función principal de instalación
main() {
    echo "🚀 INSTALADOR DEL AGENTE 4: VALIDADOR DE CALIDAD 3D"
    echo "=================================================="
    echo
    
    # Detectar sistema operativo
    OS=$(detect_os)
    print_status "Sistema operativo detectado: $OS"
    
    # Verificar Python
    check_python
    
    # Verificar pip
    check_pip
    
    # Instalar dependencias del sistema según el SO
    print_status "¿Instalar dependencias del sistema? (requiere sudo)"
    read -p "Esto instala librerías del sistema necesarias. (y/N): " install_system
    
    if [[ $install_system =~ ^[Yy]$ ]]; then
        case $OS in
            "ubuntu")
                install_system_deps_ubuntu
                ;;
            "centos")
                install_system_deps_centos
                ;;
            "macos")
                install_system_deps_macos
                ;;
            *)
                print_warning "Sistema operativo no reconocido. Instala las dependencias manualmente."
                ;;
        esac
    else
        print_warning "Dependencias del sistema omitidas"
    fi
    
    # Crear entorno virtual
    create_virtualenv
    
    # Instalar dependencias de Python
    install_python_deps
    
    # Instalar dependencias opcionales
    install_optional_deps
    
    # Verificar instalación
    verify_installation
    
    # Crear archivos de ejemplo
    create_example_file
    
    # Ejecutar prueba
    run_basic_test
    
    echo
    print_success "¡INSTALACIÓN COMPLETADA!"
    echo
    echo "📚 Próximos pasos:"
    echo "   1. Activar entorno virtual: source venv/bin/activate"
    echo "   2. Ejecutar ejemplos: python examples/ejemplo_basico.py"
    echo "   3. Validar tu modelo: python validador_3d_principal.py tu_modelo.gltf"
    echo "   4. Leer documentación: cat README.md"
    echo
    echo "💡 Configuración avanzada:"
    echo "   • Edita config.py para personalizar umbrales"
    echo "   • Usa presets: configurar_para_web(), configurar_para_alta_calidad()"
    echo "   • Integración CI/CD: ver ejemplos/ejemplo_basico.py"
    echo
    echo "🆘 Soporte:"
    echo "   • Issues: Reporta problemas en el repositorio"
    echo "   • Documentación: README.md"
    echo
}

# Verificar que estamos en el directorio correcto
if [ ! -f "validador_3d_principal.py" ]; then
    print_error "Ejecuta este script desde el directorio del agente validador."
    print_error "Asegúrate de estar en: agent_4_validador_3d/"
    exit 1
fi

# Ejecutar instalación
main "$@"
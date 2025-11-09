#!/bin/bash

# Script de instalación para Agente Selector de Técnica 2D-3D
# ==========================================================
#
# Este script instala y configura automáticamente el Agente Selector
# de Técnica 2D-3D junto con todas sus dependencias.
#
# Uso:
#   ./install.sh
#   ./install.sh --full    # Instalación completa con dependencias del sistema
#   ./install.sh --dev     # Instalación para desarrollo
#   ./install.sh --test    # Solo instala para testing

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo -e "${BLUE}"
    echo "==================================================================="
    echo "  🎭 Agente Selector de Técnica 2D-3D - Instalador"
    echo "==================================================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${YELLOW}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_step "Verificando prerrequisitos del sistema..."
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 no está instalado. Instala Python 3.8 o superior."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    print_success "Python $PYTHON_VERSION detectado"
    
    # Verificar pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 no está instalado. Instala pip para Python 3."
        exit 1
    fi
    
    print_success "pip3 detectado"
    
    # Verificar versión de Python
    if python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)"; then
        print_success "Versión de Python compatible (3.8+)"
    else
        print_error "Se requiere Python 3.8 o superior. Versión actual: $PYTHON_VERSION"
        exit 1
    fi
}

# Crear estructura de directorios
create_directories() {
    print_step "Creando estructura de directorios..."
    
    DIRECTORIES=(
        "config"
        "logs"
        "temp"
        "output"
        "cache"
        "docs"
        "tests"
    )
    
    for dir in "${DIRECTORIES[@]}"; do
        mkdir -p "$dir"
        print_success "Directorio creado: $dir"
    done
}

# Instalar dependencias de Python
install_python_dependencies() {
    print_step "Instalando dependencias de Python..."
    
    if [ "$INSTALL_MODE" = "dev" ] || [ "$INSTALL_MODE" = "full" ]; then
        # Instalar con dependencias de desarrollo
        pip3 install -r requirements.txt
        pip3 install pytest-cov black flake8 mypy sphinx
        print_success "Dependencias de desarrollo instaladas"
    else
        # Instalar solo dependencias básicas
        pip3 install numpy pandas Pillow psutil loguru aiofiles aiohttp
        pip3 install pydantic python-dotenv pyyaml requests httpx
        pip3 install pytest pytest-asyncio pytest-mock
        print_success "Dependencias básicas instaladas"
    fi
}

# Instalar dependencias del sistema
install_system_dependencies() {
    if [ "$INSTALL_MODE" != "full" ]; then
        return
    fi
    
    print_step "Instalando dependencias del sistema..."
    
    # Detectar sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt &> /dev/null; then
            # Debian/Ubuntu
            sudo apt update
            sudo apt install -y python3-dev python3-pip build-essential
            sudo apt install -y colmap  # Para COLMAP local
            sudo apt install -y git curl wget
            print_success "Dependencias del sistema instaladas (Debian/Ubuntu)"
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            sudo yum install -y python3-devel python3-pip gcc gcc-c++
            sudo yum install -y epel-release
            sudo yum install -y colmap  # Si está disponible
            print_success "Dependencias del sistema instaladas (CentOS/RHEL)"
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            sudo pacman -S --noconfirm python python-pip python-numpy python-pillow
            sudo pacman -S --noconfirm colmap base-devel
            print_success "Dependencias del sistema instaladas (Arch Linux)"
        else
            print_error "Gestor de paquetes no reconocido. Instala dependencias manualmente."
        fi
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install python3 colmap git
            print_success "Dependencias del sistema instaladas (macOS)"
        else
            print_error "Homebrew no está instalado. Instala Homebrew primero."
            print_info "Visita: https://brew.sh/"
        fi
        
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows con MSYS2/Cygwin
        print_error "Windows detectado. Instala COLMAP manualmente desde:"
        print_info "https://colmap.github.io/"
    else
        print_error "Sistema operativo no soportado automáticamente"
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_step "Configurando variables de entorno..."
    
    # Crear archivo .env si no existe
    if [ ! -f .env ]; then
        cat > .env << EOF
# Configuración del Agente Selector de Técnica 2D-3D
# =================================================

# API Keys (opcional)
# OPENROUTER_API_KEY=tu_api_key_aqui

# Configuración de logging
LOG_LEVEL=INFO
LOG_FILE=logs/selector_tecnica.log

# Configuración de directorios
TEMP_DIR=temp
OUTPUT_DIR=output
CACHE_DIR=cache

# Configuración de recursos
MAX_CONCURRENCIA=3
TIMEOUT_DEFAULT=300
REINTENTOS_FALLBACK=2

# Configuración de umbrales de monitoreo
UMBRAL_CPU=80.0
UMBRAL_RAM=85.0
UMBRAL_DISCO=90.0
EOF
        print_success "Archivo .env creado"
    else
        print_info "Archivo .env ya existe, no se sobrescribe"
    fi
    
    # Configurar variables de entorno para la sesión actual
    export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
    
    print_success "Variables de entorno configuradas"
}

# Crear configuración por defecto
create_default_config() {
    print_step "Creando configuración por defecto..."
    
    if [ ! -f config/config.json ]; then
        # Usar la configuración de ejemplo como base
        if [ -f config/config.json.backup ]; then
            cp config/config.json.backup config/config.json
        else
            # Crear configuración básica
            cat > config/config.json << EOF
{
  "agente_info": {
    "nombre": "Selector de Técnica 2D-3D",
    "version": "1.0.0",
    "descripcion": "Agente inteligente para selección automática de técnicas de procesamiento 2D-3D"
  },
  "configuracion_agente": {
    "max_concurrencia": 3,
    "timeout_default": 300,
    "reintentos_fallback": 2
  },
  "metodos_procesamiento": {
    "colmap_local": {
      "nombre": "COLMAP Local",
      "disponible": true,
      "costo_por_imagen": 0.0,
      "tiempo_por_imagen": 180.0,
      "calidad_base": 0.85
    },
    "openrouter_api": {
      "nombre": "OpenRouter API",
      "disponible": true,
      "costo_por_imagen": 0.15,
      "tiempo_por_imagen": 90.0,
      "calidad_base": 0.95
    },
    "hibrido": {
      "nombre": "Procesamiento Híbrido",
      "disponible": true,
      "costo_por_imagen": 0.05,
      "tiempo_por_imagen": 120.0,
      "calidad_base": 0.92
    }
  },
  "monitoreo_recursos": {
    "intervalo_monitoreo": 5.0,
    "umbrales_alerta": {
      "cpu": 80.0,
      "ram": 85.0,
      "disco": 90.0
    }
  }
}
EOF
        fi
        print_success "Configuración por defecto creada"
    else
        print_info "Configuración ya existe, no se sobrescribe"
    fi
}

# Ejecutar tests básicos
run_basic_tests() {
    if [ "$INSTALL_MODE" = "test" ]; then
        print_step "Ejecutando tests básicos..."
        
        # Test de importación
        if python3 -c "import sys; sys.path.append('src'); from selector_tecnica_agent import *; print('✅ Importación exitosa')" 2>/dev/null; then
            print_success "Tests básicos aprobados"
        else
            print_error "Tests básicos fallaron"
            return 1
        fi
    fi
}

# Verificar instalación
verify_installation() {
    print_step "Verificando instalación..."
    
    # Verificar que se puedan importar los módulos principales
    if python3 -c "
import sys
sys.path.append('src')
try:
    from selector_tecnica_agent import *
    from interfaz_agente import *
    print('✅ Módulos principales importados correctamente')
except ImportError as e:
    print(f'❌ Error de importación: {e}')
    sys.exit(1)
" 2>/dev/null; then
        print_success "Verificación de importación exitosa"
    else
        print_error "Error en la verificación de importación"
        return 1
    fi
}

# Mostrar información final
show_final_info() {
    echo
    print_header
    echo -e "${GREEN}🎉 ¡Instalación completada exitosamente!${NC}"
    echo
    echo -e "${BLUE}📋 Información de la instalación:${NC}"
    echo "   • Versión: 1.0.0"
    echo "   • Modo: $INSTALL_MODE"
    echo "   • Directorio: $(pwd)"
    echo "   • Python: $(python3 --version)"
    echo
    echo -e "${BLUE}🚀 Próximos pasos:${NC}"
    echo "   1. Configurar API keys en .env (opcional)"
    echo "   2. Editar config/config.json según necesidades"
    echo "   3. Ejecutar ejemplo: ${YELLOW}python3 ejemplo_uso.py --mode quick${NC}"
    echo "   4. Ver documentación: ${YELLOW}docs/README.md${NC}"
    echo
    echo -e "${BLUE}📚 Ejemplos de uso:${NC}"
    echo "   • Básico: ${YELLOW}python3 ejemplo_uso.py --mode quick${NC}"
    echo "   • Completo: ${YELLOW}python3 ejemplo_uso.py --mode complete${NC}"
    echo "   • Tests: ${YELLOW}python3 -m pytest tests/ -v${NC}"
    echo
    echo -e "${BLUE}🔧 Configuración:${NC}"
    echo "   • Archivo config: config/config.json"
    echo "   • Variables env: .env"
    echo "   • Logs: logs/"
    echo "   • Temp: temp/"
    echo "   • Output: output/"
    echo
    if [ "$INSTALL_MODE" = "full" ]; then
        echo -e "${BLUE}📦 Dependencias del sistema:${NC}"
        echo "   • COLMAP instalado (para procesamiento local)"
        echo "   • Build tools instaladas"
        echo "   • Git configurado"
    fi
    echo -e "${GREEN}✨ ¡El Agente Selector de Técnica 2D-3D está listo para usar!${NC}"
    echo
}

# Función de ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo
    echo "Opciones:"
    echo "  --full    Instalación completa con dependencias del sistema"
    echo "  --dev     Instalación para desarrollo (con herramientas de desarrollo)"
    echo "  --test    Solo instalación básica para testing"
    echo "  --help    Mostrar esta ayuda"
    echo
    echo "Ejemplos:"
    echo "  $0                    # Instalación básica"
    echo "  $0 --full             # Instalación completa"
    echo "  $0 --dev              # Instalación para desarrollo"
    echo "  $0 --test             # Solo para testing"
    echo
}

# Función principal
main() {
    # Parsear argumentos
    INSTALL_MODE="basic"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                INSTALL_MODE="full"
                shift
                ;;
            --dev)
                INSTALL_MODE="dev"
                shift
                ;;
            --test)
                INSTALL_MODE="test"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Opción desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header
    print_info "Modo de instalación: $INSTALL_MODE"
    echo
    
    # Ejecutar pasos de instalación
    check_prerequisites
    create_directories
    install_python_dependencies
    
    if [ "$INSTALL_MODE" = "full" ]; then
        install_system_dependencies
    fi
    
    setup_environment
    create_default_config
    verify_installation
    
    if [ "$INSTALL_MODE" = "test" ]; then
        run_basic_tests
    fi
    
    show_final_info
}

# Verificar que se está ejecutando desde el directorio correcto
if [ ! -f "src/selector_tecnica_agent.py" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del agente"
    print_info "Cambia al directorio: $(dirname "$0")"
    exit 1
fi

# Ejecutar función principal
main "$@"
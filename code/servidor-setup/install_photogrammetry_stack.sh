#!/bin/bash

# =============================================================================
# INSTALADOR AUTOMÁTICO DE STACK DE FOTOGRAMETRÍA GRATUITA
# =============================================================================
# Autor: Script automatizado para instalación de herramientas de fotogrametría
# Fecha: 2025-11-06
# Sistema: Linux (Ubuntu/Debian)
# =============================================================================

set -e  # Salir si hay errores
set -u  # Salir si hay variables no definidas

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Variables globales
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/photogrammetry_install.log"
CONDA_ENV_NAME="photogrammetry"

# Funciones de utilidad
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Verificar que se ejecuta como root o con sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        error "Este script debe ejecutarse como root o con sudo"
    fi
}

# Actualizar sistema
update_system() {
    log "🔄 Actualizando sistema..."
    apt update && apt upgrade -y
    apt install -y curl wget git build-essential cmake pkg-config
    log "✅ Sistema actualizado"
}

# Instalar dependencias del sistema
install_system_dependencies() {
    log "📦 Instalando dependencias del sistema..."
    
    # Dependencias para COLMAP
    apt install -y \
        libsuitesparse-dev \
        libeigen3-dev \
        libboost-all-dev \
        libopencv-dev \
        libgoogle-glog-dev \
        libgflags-dev \
        libx11-dev \
        libgtk-3-dev \
        libatlas-base-dev \
        gfortran
    
    # Dependencias para otras herramientas
    apt install -y \
        imagemagick \
        libmagickwand-dev \
        python3-pip \
        python3-venv \
        nodejs \
        npm \
        blender \
        sqlite3 \
        libsqlite3-dev \
        libhdf5-dev \
        libprotobuf-dev \
        protobuf-compiler \
        libjpeg-turbo8-dev \
        libpng-dev \
        libtiff-dev
    
    log "✅ Dependencias del sistema instaladas"
}

# Instalar Node.js y npm (versión LTS)
install_nodejs() {
    log "🔄 Instalando Node.js..."
    
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
        apt install -y nodejs
        log "✅ Node.js instalado: $(node --version)"
    else
        log "✅ Node.js ya instalado: $(node --version)"
    fi
}

# Compilar e instalar COLMAP desde código fuente
install_colmap() {
    log "🔄 Compilando e instalando COLMAP..."
    
    if command -v colmap &> /dev/null; then
        log "✅ COLMAP ya instalado: $(colmap --help | head -n1)"
        return
    fi
    
    # Crear directorio temporal para compilación
    TEMP_DIR="/tmp/colmap_build"
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Descargar COLMAP
    log "📥 Descargando COLMAP..."
    git clone https://github.com/colmap/colmap.git
    cd colmap
    
    # Compilar
    log "🔨 Compilando COLMAP (esto puede tardar varios minutos)..."
    mkdir build && cd build
    cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local ..
    make -j$(nproc)
    make install
    
    # Verificar instalación
    if command -v colmap &> /dev/null; then
        log "✅ COLMAP instalado correctamente: $(colmap --help | head -n1)"
    else
        error "❌ Falló la instalación de COLMAP"
    fi
    
    # Limpiar archivos temporales
    cd /workspace
    rm -rf "$TEMP_DIR"
}

# Instalar glTF-Transform
install_gltf_transform() {
    log "🔄 Instalando glTF-Transform..."
    
    # Instalar globalmente con npm
    npm install -g @gltf-transform/core @gltf-transform/cli
    
    # Verificar instalación
    if command -v gltf-transform &> /dev/null; then
        log "✅ glTF-Transform instalado: $(gltf-transform --version)"
    else
        warn "⚠️ glTF-Transform instalado pero comando no encontrado en PATH"
    fi
}

# Instalar herramientas de procesamiento de imágenes
install_image_tools() {
    log "🔄 Instalando herramientas de procesamiento de imágenes..."
    
    # Crear entorno virtual para Python
    python3 -m venv "/opt/photogrammetry_env"
    source "/opt/photogrammetry_env/bin/activate"
    
    # Actualizar pip
    pip install --upgrade pip
    
    # Instalar bibliotecas de Python
    pip install \
        Pillow \
        OpenCV-python \
        numpy \
        scipy \
        matplotlib \
        rembg \
        realesrgan \
        requests \
        tqdm
    
    # Verificar importaciones
    python3 -c "
import cv2
import PIL
import numpy
import rembg
print('✅ Bibliotecas de Python importadas correctamente')
"
    
    deactivate
    log "✅ Herramientas de procesamiento de imágenes instaladas"
}

# Instalar Rembg y Real-ESRGAN
install_ai_enhancement_tools() {
    log "🔄 Instalando herramientas de mejora con IA..."
    
    source "/opt/photogrammetry_env/bin/activate"
    
    # Instalar Real-ESRGAN
    git clone https://github.com/xinntao/Real-ESRGAN.git /tmp/Real-ESRGAN
    cd /tmp/Real-ESRGAN
    pip install -e .
    
    # Descargar modelo básico de Real-ESRGAN
    wget -O /tmp/Real-ESRGAN/RealESRGAN_x4plus.pth \
        https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
    
    # Verificar instalación de Rembg
    python3 -c "
import rembg
from rembg import remove
print('✅ Rembg funcionando correctamente')
"
    
    # Verificar Real-ESRGAN
    python3 -c "
from realesrgan import RealESRGANer
print('✅ Real-ESRGAN funcionando correctamente')
"
    
    deactivate
    rm -rf /tmp/Real-ESRGAN
    log "✅ Herramientas de mejora con IA instaladas"
}

# Instalar Material Maker
install_material_maker() {
    log "🔄 Instalando Material Maker..."
    
    # Descargar Material Maker precompilado
    MATERIAL_MAKER_URL="https://github.com/RodZill4/material-maker/releases/download/1.0.7/material-maker-1.0.7-linux.zip"
    TEMP_DIR="/tmp/material_maker"
    
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    wget "$MATERIAL_MAKER_URL" -O material-maker.zip
    unzip material-maker.zip
    
    # Mover a directorio de aplicaciones
    mkdir -p /opt/material-maker
    cp -r * /opt/material-maker/
    
    # Crear enlace simbólico
    ln -sf /opt/material-maker/material-maker /usr/local/bin/material-maker
    
    # Verificar instalación
    if command -v material-maker &> /dev/null; then
        log "✅ Material Maker instalado correctamente"
    else
        warn "⚠️ Material Maker instalado pero comando no disponible"
    fi
    
    # Limpiar
    cd /workspace
    rm -rf "$TEMP_DIR"
}

# Instalar MeshLab
install_meshlab() {
    log "🔄 Instalando MeshLab..."
    
    # MeshLab está en los repositorios de Ubuntu
    apt install -y meshlab
    
    # Verificar instalación
    if command -v meshlab &> /dev/null; then
        log "✅ MeshLab instalado correctamente"
    else
        warn "⚠️ MeshLab puede no estar disponible en repositorios, intentando instalación manual..."
        
        # Instalación manual como respaldo
        TEMP_DIR="/tmp/meshlab"
        mkdir -p "$TEMP_DIR"
        cd "$TEMP_DIR"
        
        # Intentar descargar AppImage de MeshLab
        MESHLAB_URL=$(curl -s https://api.github.com/repos/cnr-isti-vclab/meshlab/releases/latest | \
                      grep "browser_download_url.*AppImage" | cut -d '"' -f 4)
        
        if [[ -n "$MESHLAB_URL" ]]; then
            wget "$MESHLAB_URL" -O meshlab.AppImage
            chmod +x meshlab.AppImage
            mv meshlab.AppImage /usr/local/bin/meshlab
            log "✅ MeshLab instalado desde AppImage"
        else
            warn "⚠️ No se pudo instalar MeshLab automáticamente"
        fi
        
        cd /workspace
        rm -rf "$TEMP_DIR"
    fi
}

# Crear script de prueba
create_test_script() {
    log "🔄 Creando script de pruebas..."
    
    TEST_SCRIPT="${SCRIPT_DIR}/test_photogrammetry_stack.sh"
    cat > "$TEST_SCRIPT" << 'EOF'
#!/bin/bash

# Script de pruebas para el stack de fotogrametría
echo "🧪 Probando instalación del stack de fotogrametría..."

# Test COLMAP
echo "📷 Probando COLMAP..."
if command -v colmap &> /dev/null; then
    colmap --help | head -n1
    echo "✅ COLMAP: OK"
else
    echo "❌ COLMAP: No encontrado"
fi

# Test glTF-Transform
echo "🔄 Probando glTF-Transform..."
if command -v gltf-transform &> /dev/null; then
    gltf-transform --help | head -n1
    echo "✅ glTF-Transform: OK"
else
    echo "❌ glTF-Transform: No encontrado"
fi

# Test bibliotecas de Python
echo "🐍 Probando bibliotecas de Python..."
source /opt/photogrammetry_env/bin/activate
python3 -c "
import cv2
import PIL
import numpy
try:
    import rembg
    import rembg.remove
    print('Rembg: OK')
except ImportError:
    print('Rembg: Error')

try:
    from realesrgan import RealESRGANer
    print('Real-ESRGAN: OK')
except ImportError:
    print('Real-ESRGAN: Error')

print('OpenCV:', cv2.__version__)
print('PIL:', PIL.__version__)
print('NumPy:', numpy.__version__)
"
deactivate

# Test ImageMagick
echo "🎨 Probando ImageMagick..."
if command -v convert &> /dev/null; then
    convert --version | head -n1
    echo "✅ ImageMagick: OK"
else
    echo "❌ ImageMagick: No encontrado"
fi

# Test Blender (para Material Maker)
echo "🎭 Probando Blender..."
if command -v blender &> /dev/null; then
    blender --version | head -n1
    echo "✅ Blender: OK"
else
    echo "❌ Blender: No encontrado"
fi

echo "🏁 Pruebas completadas"
EOF
    
    chmod +x "$TEST_SCRIPT"
    log "✅ Script de pruebas creado en $TEST_SCRIPT"
}

# Función principal de instalación
main() {
    log "🚀 Iniciando instalación del Stack de Fotogrametría Gratuita"
    log "📋 Este proceso puede tardar entre 30-60 minutos dependiendo del hardware"
    
    # Verificaciones iniciales
    check_permissions
    
    # Crear directorio de logs
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    
    # Ejecutar pasos de instalación
    update_system
    install_system_dependencies
    install_nodejs
    install_colmap
    install_gltf_transform
    install_image_tools
    install_ai_enhancement_tools
    install_material_maker
    install_meshlab
    create_test_script
    
    log "🎉 ¡Instalación completada exitosamente!"
    log "📝 Log guardado en: $LOG_FILE"
    log "🧪 Ejecuta las pruebas con: ${SCRIPT_DIR}/test_photogrammetry_stack.sh"
    
    # Mostrar resumen
    echo
    echo "======================================================================"
    echo "                    RESUMEN DE INSTALACIÓN"
    echo "======================================================================"
    echo "✅ COLMAP: $(command -v colmap &> /dev/null && echo "Instalado" || echo "No encontrado")"
    echo "✅ glTF-Transform: $(command -v gltf-transform &> /dev/null && echo "Instalado" || echo "Disponible vía npm")"
    echo "✅ Bibliotecas Python: Instaladas en /opt/photogrammetry_env"
    echo "✅ Rembg y Real-ESRGAN: Instalados"
    echo "✅ Material Maker: $(command -v material-maker &> /dev/null && echo "Instalado" || echo "Disponible")"
    echo "✅ MeshLab: $(command -v meshlab &> /dev/null && echo "Instalado" || echo "Disponible")"
    echo "✅ ImageMagick: $(command -v convert &> /dev/null && echo "Instalado" || echo "No encontrado")"
    echo "======================================================================"
}

# Ejecutar instalación
main "$@"
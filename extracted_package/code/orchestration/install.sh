#!/bin/bash
# Script de instalación completa del Sistema de Coordinación Local
# Instala dependencias, configura el entorno y prepara el sistema

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[PASO $1]${NC} $2"
}

# Banner inicial
print_header "INSTALADOR DEL SISTEMA DE COORDINACIÓN LOCAL"
echo "Este script configurará completamente el sistema con Ollama y LangGraph"
echo

# Verificar que estamos en el directorio correcto
if [ ! -f "start_system.py" ] || [ ! -f "requirements.txt" ]; then
    print_error "Ejecuta este script desde el directorio raíz del sistema de coordinación"
    exit 1
fi

print_header "VERIFICACIÓN DEL SISTEMA"

# Verificar Python
print_step "1" "Verificando Python..."
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version | cut -d' ' -f2)
    print_success "Python detectado: $python_version"
    
    # Verificar versión mínima
    python_major=$(echo $python_version | cut -d'.' -f1)
    python_minor=$(echo $python_version | cut -d'.' -f2)
    
    if [ "$python_major" -lt 3 ] || ([ "$python_major" -eq 3 ] && [ "$python_minor" -lt 8 ]); then
        print_error "Se requiere Python 3.8 o superior"
        exit 1
    fi
else
    print_error "Python 3 no está instalado"
    exit 1
fi

# Verificar pip
print_step "2" "Verificando pip..."
if command -v pip3 &> /dev/null; then
    print_success "pip3 detectado"
else
    print_error "pip3 no está instalado"
    exit 1
fi

# Verificar curl
print_step "3" "Verificando curl..."
if command -v curl &> /dev/null; then
    print_success "curl detectado"
else
    print_error "curl no está instalado"
    exit 1
fi

print_header "CREACIÓN DEL ENTORNO VIRTUAL"

# Crear entorno virtual
print_step "4" "Creando entorno virtual..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Entorno virtual creado"
else
    print_warning "Entorno virtual ya existe"
fi

# Activar entorno virtual
print_step "5" "Activando entorno virtual..."
source venv/bin/activate
print_success "Entorno virtual activado"

# Actualizar pip
print_step "6" "Actualizando pip..."
pip install --upgrade pip
print_success "pip actualizado"

print_header "INSTALACIÓN DE DEPENDENCIAS"

# Instalar dependencias Python
print_step "7" "Instalando dependencias Python..."
pip install -r requirements.txt
print_success "Dependencias Python instaladas"

print_header "CONFIGURACIÓN DE DIRECTORIOS"

# Crear directorios necesarios
print_step "8" "Creando directorios..."
mkdir -p logs
mkdir -p data
mkdir -p data/backups
mkdir -p config
mkdir -p examples
print_success "Directorios creados"

# Crear archivo .env básico
print_step "9" "Creando archivo de configuración..."
cat > .env << EOF
# Configuración del Sistema de Coordinación Local
OLLAMA_HOST=localhost:11434
LOG_LEVEL=INFO
DB_PATH=data/orchestration_state.db
CACHE_ENABLED=true
EOF
print_success "Archivo .env creado"

print_header "INSTALACIÓN DE OLLAMA"

# Detectar sistema operativo
OS_TYPE=$(uname -s)
print_step "10" "Detectando sistema operativo: $OS_TYPE"

# Verificar si Ollama está instalado
if command -v ollama &> /dev/null; then
    print_success "Ollama ya está instalado"
    OLLAMA_INSTALLED=true
else
    print_warning "Ollama no está instalado"
    OLLAMA_INSTALLED=false
fi

# Instalar Ollama si no está instalado
if [ "$OLLAMA_INSTALLED" = false ]; then
    print_step "11" "Instalando Ollama..."
    
    if [[ "$OS_TYPE" == "Linux" ]]; then
        # Detectar distribución Linux
        if [ -f /etc/debian_version ]; then
            # Ubuntu/Debian
            print_status "Detectado Ubuntu/Debian"
            curl -fsSL https://ollama.com/ollama.gpg | sudo gpg --dearmor -o /usr/share/keyrings/ollama.gpg
            echo "deb [arch=amd64 signed-by=/usr/share/keyrings/ollama.gpg] https://ollama.com/repository ubuntu jammy" | sudo tee /etc/apt/sources.list.d/ollama.list > /dev/null
            sudo apt update
            sudo apt install -y ollama
        elif [ -f /etc/redhat-release ]; then
            # Red Hat/CentOS/Fedora
            print_status "Detectado Red Hat/CentOS/Fedora"
            curl -fsSL https://ollama.com/ollama.rpm | sudo rpm -ivh -
        else
            print_error "Distribución de Linux no soportada automáticamente"
            print_status "Por favor instala Ollama manualmente desde: https://ollama.com"
            exit 1
        fi
    elif [[ "$OS_TYPE" == "Darwin" ]]; then
        # macOS
        print_status "Detectado macOS"
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            print_error "Homebrew no está instalado"
            print_status "Por favor instala Homebrew desde: https://brew.sh"
            exit 1
        fi
    else
        print_error "Sistema operativo no soportado: $OS_TYPE"
        exit 1
    fi
    
    print_success "Ollama instalado"
else
    print_step "11" "Ollama ya está instalado, saltando..."
fi

# Configurar Ollama
print_step "12" "Configurando Ollama..."
mkdir -p ~/.config/ollama
cat > ~/.config/ollama/config.yaml << EOF
host: "localhost:11434"
models:
  default: "llama3.1:8b"
  cache_directory: "~/.ollama/models"
log_level: "info"
EOF
print_success "Ollama configurado"

# Intentar instalar modelos (solo si Ollama está disponible)
print_step "13" "Instalando modelos LLM..."
if command -v ollama &> /dev/null; then
    print_status "Instalando modelos recomendados..."
    
    models=("llama3.1:8b" "mistral:7b" "codellama:7b" "phi3:mini")
    
    for model in "${models[@]}"; do
        print_status "Descargando $model..."
        if timeout 300 ollama pull "$model" &> /dev/null; then
            print_success "$model descargado"
        else
            print_warning "No se pudo descargar $model (se puede hacer manualmente después)"
        fi
    done
else
    print_warning "Ollama no está disponible, saltando instalación de modelos"
fi

print_header "CREACIÓN DE SCRIPTS DE UTILIDAD"

# Crear script de inicio
print_step "14" "Creando script de inicio..."
cat > start_system.sh << 'EOF'
#!/bin/bash
# Script de inicio del Sistema de Coordinación Local

# Activar entorno virtual
source venv/bin/activate

# Configurar variables de entorno
export OLLAMA_HOST=${OLLAMA_HOST:-"localhost:11434"}
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

echo "=== Iniciando Sistema de Coordinación Local ==="
echo "Ollama Host: $OLLAMA_HOST"
echo "Python: $(which python)"
echo

# Verificar que Ollama esté ejecutándose
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠  Advertencia: Ollama no responde en $OLLAMA_HOST"
    echo "Inicia Ollama con: ollama serve"
    echo
fi

# Iniciar sistema
python start_system.py "$@"
EOF

chmod +x start_system.sh
print_success "Script de inicio creado: start_system.sh"

# Crear script de demo
print_step "15" "Creando script de demostración..."
cat > run_demo.sh << 'EOF'
#!/bin/bash
# Script de demostración del sistema

source venv/bin/activate
export OLLAMA_HOST=${OLLAMA_HOST:-"localhost:11434"}

echo "=== Demostración del Sistema de Coordinación Local ==="
echo

# Ejecutar demo
python demo.py --complete
EOF

chmod +x run_demo.sh
print_success "Script de demo creado: run_demo.sh"

# Crear script de instalación de modelos
print_step "16" "Creando script de instalación de modelos..."
cat > install_models.sh << 'EOF'
#!/bin/bash
# Script para instalar modelos LLM

source venv/bin/activate

echo "=== Instalador de Modelos LLM ==="
echo "Este script descargará los modelos recomendados"
echo

models=(
    "llama3.1:8b"
    "mistral:7b" 
    "codellama:7b"
    "phi3:mini"
)

for model in "${models[@]}"; do
    echo "Instalando $model..."
    if ollama pull "$model"; then
        echo "✓ $model instalado correctamente"
    else
        echo "✗ Error instalando $model"
    fi
    echo
done

echo "Verificando modelos instalados..."
ollama list
EOF

chmod +x install_models.sh
print_success "Script de instalación de modelos creado: install_models.sh"

print_header "CONFIGURACIÓN FINAL"

# Crear script de inicio de Ollama
print_step "17" "Creando script de inicio de Ollama..."
cat > start_ollama.sh << 'EOF'
#!/bin/bash
# Script para iniciar Ollama

echo "Iniciando servicio de Ollama..."

export OLLAMA_HOST=${OLLAMA_HOST:-"localhost:11434"}

# Verificar si ya está ejecutándose
if pgrep -x "ollama" > /dev/null; then
    echo "✓ Ollama ya está ejecutándose"
else
    echo "Iniciando Ollama en segundo plano..."
    nohup ollama serve > ollama.log 2>&1 &
    
    echo "Esperando a que Ollama esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags > /dev/null; then
            echo "✓ Ollama está listo en http://$OLLAMA_HOST"
            exit 0
        fi
        sleep 1
    done
    
    echo "⚠ No se pudo conectar con Ollama después de 30 segundos"
    echo "Verifica los logs en: ollama.log"
    exit 1
fi
EOF

chmod +x start_ollama.sh
print_success "Script de inicio de Ollama creado: start_ollama.sh"

# Verificar instalación
print_step "18" "Verificando instalación..."
print_status "Verificando archivos creados..."

required_files=(
    "start_system.py"
    "requirements.txt"
    "ollama_manager.py"
    "langgraph_coordinator.py"
    "task_queue.py"
    "agent_manager.py"
    "state_manager.py"
    "start_system.sh"
    "run_demo.sh"
    "install_models.sh"
    "start_ollama.sh"
    ".env"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file"
    else
        print_error "✗ $file (faltante)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    print_success "Todos los archivos están presentes"
else
    print_error "Algunos archivos están faltantes"
    exit 1
fi

print_header "INSTALACIÓN COMPLETADA"

echo
echo -e "${GREEN}🎉 ¡Instalación completada exitosamente!${NC}"
echo
echo "=== PRÓXIMOS PASOS ==="
echo
echo "1. Inicia Ollama:"
echo "   ./start_ollama.sh"
echo
echo "2. Activa el entorno y ejecuta el sistema:"
echo "   source venv/bin/activate"
echo "   ./start_system.sh --start"
echo
echo "3. O ejecuta la demostración:"
echo "   ./run_demo.sh"
echo
echo "=== COMANDOS ÚTILES ==="
echo
echo "• Iniciar sistema completo:"
echo "  ./start_system.sh --start"
echo
echo "• Instalar modelos adicionales:"
echo "  ./install_models.sh"
echo
echo "• Ejecutar demostración:"
echo "  ./run_demo.sh"
echo
echo "• Ver ayuda:"
echo "  ./start_system.sh --help"
echo
echo "=== DOCUMENTACIÓN ==="
echo
echo "• Guía de uso: docs/USAGE_GUIDE.md"
echo "• README principal: README.md"
echo
echo -e "${CYAN}¡El sistema está listo para usar!${NC}"
echo

# Verificación final opcional
read -p "¿Deseas ejecutar una verificación rápida del sistema? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_header "VERIFICACIÓN RÁPIDA"
    
    # Verificar Python
    print_status "Verificando Python..."
    python3 -c "import sys; print(f'Python {sys.version}')"
    
    # Verificar pip packages
    print_status "Verificando paquetes instalados..."
    pip list | grep -E "(ollama|langchain|sqlalchemy|loguru)" | head -5
    
    # Verificar Ollama
    print_status "Verificando Ollama..."
    if command -v ollama &> /dev/null; then
        print_success "Ollama instalado"
    else
        print_warning "Ollama no encontrado en PATH"
    fi
    
    print_success "Verificación completada"
fi

echo
print_success "¡Instalación finalizada! Disfruta usando el sistema de coordinación local."
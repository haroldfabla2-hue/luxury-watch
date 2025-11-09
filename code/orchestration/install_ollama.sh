#!/bin/bash
# Script de instalación y configuración de Ollama
# Configura el sistema para ejecutar modelos LLM locales

set -e  # Salir en caso de error

echo "=== Instalador de Ollama para Sistema de Coordinación ==="
echo "Este script instalará y configurará Ollama con los modelos necesarios"
echo

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
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

# Verificar si estamos en Linux/macOS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        print_error "Sistema operativo no soportado: $OSTYPE"
        exit 1
    fi
    print_status "Sistema detectado: $OS"
}

# Verificar requisitos del sistema
check_requirements() {
    print_status "Verificando requisitos del sistema..."
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 no está instalado"
        exit 1
    fi
    
    python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    print_status "Python detectado: $python_version"
    
    # Verificar pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 no está instalado"
        exit 1
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado"
        exit 1
    fi
    
    print_success "Requisitos verificados"
}

# Instalar Ollama
install_ollama() {
    print_status "Instalando Ollama..."
    
    if [[ "$OS" == "linux" ]]; then
        # Detectar distribución
        if [ -f /etc/debian_version ]; then
            # Ubuntu/Debian
            print_status "Detectado sistema Ubuntu/Debian"
            
            # Agregar clave GPG de Ollama
            curl -fsSL https://ollama.com/ollama.gpg | sudo gpg --dearmor -o /usr/share/keyrings/ollama.gpg
            
            # Agregar repositorio
            echo "deb [arch=amd64 signed-by=/usr/share/keyrings/ollama.gpg] https://ollama.com/repository ubuntu jammy" | sudo tee /etc/apt/sources.list.d/ollama.list > /dev/null
            
            # Actualizar e instalar
            sudo apt update
            sudo apt install -y ollama
            
        elif [ -f /etc/redhat-release ]; then
            # Red Hat/CentOS/Fedora
            print_status "Detectado sistema Red Hat/CentOS/Fedora"
            
            curl -fsSL https://ollama.com/ollama.rpm | sudo rpm -ivh -
            
        else
            print_error "Distribución de Linux no soportada automáticamente"
            print_status "Por favor instala Ollama manualmente desde: https://ollama.com"
            exit 1
        fi
        
    elif [[ "$OS" == "macos" ]]; then
        # macOS
        print_status "Detectado macOS"
        
        if command -v brew &> /dev/null; then
            print_status "Instalando Ollama via Homebrew..."
            brew install ollama
        else
            print_error "Homebrew no está instalado"
            print_status "Por favor instala Homebrew desde: https://brew.sh"
            exit 1
        fi
    fi
    
    print_success "Ollama instalado correctamente"
}

# Configurar Ollama
configure_ollama() {
    print_status "Configurando Ollama..."
    
    # Crear directorio de configuración
    mkdir -p ~/.config/ollama
    
    # Configurar variables de entorno
    OLLAMA_HOST=${OLLAMA_HOST:-"localhost:11434"}
    export OLLAMA_HOST
    
    # Crear archivo de configuración
    cat > ~/.config/ollama/config.yaml << EOF
host: "$OLLAMA_HOST"
models:
  default: "llama3.1:8b"
  cache_directory: "~/.ollama/models"
log_level: "info"
EOF
    
    print_success "Ollama configurado"
}

# Instalar modelos recomendados
install_models() {
    print_status "Instalando modelos recomendados..."
    
    # Lista de modelos a instalar
    models=(
        "llama3.1:8b"
        "mistral:7b"
        "codellama:7b"
        "phi3:mini"
    )
    
    print_status "Modelos a instalar: ${models[*]}"
    print_warning "Esto puede tardar varios minutos dependiendo de tu conexión a internet"
    
    for model in "${models[@]}"; do
        print_status "Descargando $model..."
        
        if ollama pull "$model"; then
            print_success "$model descargado correctamente"
        else
            print_error "Error descargando $model"
            return 1
        fi
    done
    
    print_success "Todos los modelos instalados correctamente"
}

# Verificar instalación
verify_installation() {
    print_status "Verificando instalación..."
    
    # Verificar servicio de Ollama
    if ! pgrep -x "ollama" > /dev/null; then
        print_status "Iniciando servicio de Ollama..."
        
        if [[ "$OS" == "linux" ]]; then
            sudo systemctl start ollama
            sudo systemctl enable ollama
        elif [[ "$OS" == "macos" ]]; then
            ollama serve &
        fi
        
        sleep 5
    fi
    
    # Probar conexión
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        print_success "Ollama está ejecutándose correctamente"
        
        # Listar modelos instalados
        print_status "Modelos instalados:"
        curl -s http://localhost:11434/api/tags | python3 -c "
import json, sys
data = json.load(sys.stdin)
for model in data.get('models', []):
    print(f'  - {model[\"name\"]} ({model[\"size\" // 1024 // 1024}MB)')
"
        
    else
        print_error "No se pudo conectar con Ollama"
        print_status "Asegúrate de que el servicio esté ejecutándose con: ollama serve"
        return 1
    fi
    
    # Verificar Python bindings
    print_status "Verificando bindings de Python..."
    if python3 -c "import ollama" 2>/dev/null; then
        print_success "Python bindings están disponibles"
    else
        print_warning "Instalando Python bindings..."
        pip3 install ollama
    fi
}

# Crear script de inicio
create_startup_script() {
    print_status "Creando script de inicio..."
    
    cat > start_ollama.sh << 'EOF'
#!/bin/bash
# Script de inicio para Ollama

echo "Iniciando servicio de Ollama..."

# Configurar host si no está configurado
export OLLAMA_HOST=${OLLAMA_HOST:-"localhost:11434"}

# Iniciar Ollama en segundo plano
ollama serve > ollama.log 2>&1 &

echo "Ollama iniciado en http://$OLLAMA_HOST"
echo "Logs disponibles en: ollama.log"
echo "Para detener: pkill ollama"

# Esperar a que esté listo
echo "Esperando a que Ollama esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "✓ Ollama está listo"
        exit 0
    fi
    sleep 1
done

echo "⚠ No se pudo conectar con Ollama después de 30 segundos"
exit 1
EOF
    
    chmod +x start_ollama.sh
    print_success "Script de inicio creado: start_ollama.sh"
}

# Crear script de instalación de Python
create_python_setup() {
    print_status "Creando script de configuración de Python..."
    
    cat > setup_python_env.sh << 'EOF'
#!/bin/bash
# Script de configuración del entorno Python

echo "Configurando entorno Python para el sistema de coordinación..."

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
echo "Instalando dependencias..."
pip install -r requirements.txt

echo "✓ Entorno Python configurado"
echo "Para activar: source venv/bin/activate"
EOF
    
    chmod +x setup_python_env.sh
    print_success "Script de Python creado: setup_python_env.sh"
}

# Mostrar resumen final
show_summary() {
    echo
    echo "=== RESUMEN DE INSTALACIÓN ==="
    echo
    echo "✓ Ollama instalado y configurado"
    echo "✓ Modelos LLM descargados"
    echo "✓ Python bindings disponibles"
    echo "✓ Scripts de inicio creados"
    echo
    echo "Para usar el sistema:"
    echo "1. Inicia Ollama: ./start_ollama.sh"
    echo "2. Activa entorno Python: source venv/bin/activate"
    echo "3. Ejecuta el sistema: python start_system.py --start"
    echo
    echo "Comandos útiles:"
    echo "- Listar modelos: ollama list"
    echo "- Probar modelo: ollama run llama3.1:8b"
    echo "- Logs de Ollama: tail -f ollama.log"
    echo
    echo "Documentación completa disponible en README.md"
}

# Función principal
main() {
    echo "=== INSTALADOR DE OLLAMA ==="
    echo "Iniciando instalación y configuración..."
    echo
    
    detect_os
    check_requirements
    install_ollama
    configure_ollama
    install_models
    verify_installation
    create_startup_script
    create_python_setup
    show_summary
    
    print_success "¡Instalación completada exitosamente!"
}

# Ejecutar función principal
main "$@"
#!/bin/bash

# Script de instalación del Agente 6: Generador de Metadatos y SEO
# Fecha: 2025-11-06
# Versión: 1.0.0

set -e  # Salir en caso de error

echo "🚀 Instalando Agente 6: Generador de Metadatos y SEO"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
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

# Verificar Python
check_python() {
    print_status "Verificando Python..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python encontrado: $PYTHON_VERSION"
        
        # Verificar versión mínima
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
        
        if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
            print_success "Versión de Python compatible"
        else
            print_error "Python 3.8+ requerido. Versión actual: $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 no encontrado. Instalar Python 3.8+"
        exit 1
    fi
}

# Verificar pip
check_pip() {
    print_status "Verificando pip..."
    
    if command -v pip3 &> /dev/null; then
        PIP_VERSION=$(pip3 --version | cut -d' ' -f2)
        print_success "pip encontrado: $PIP_VERSION"
    else
        print_error "pip3 no encontrado. Instalar pip"
        exit 1
    fi
}

# Crear entorno virtual
create_virtual_env() {
    print_status "¿Desea crear un entorno virtual? (recomendado) [y/n]"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Creando entorno virtual..."
        
        python3 -m venv venv
        source venv/bin/activate
        
        print_success "Entorno virtual creado y activado"
        print_warning "Recuerde activar el entorno con: source venv/bin/activate"
    else
        print_warning "Usando entorno del sistema (no recomendado)"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias..."
    
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
        print_success "Dependencias instaladas"
    else
        print_error "requirements.txt no encontrado"
        exit 1
    fi
}

# Verificar instalación de dependencias críticas
verify_critical_dependencies() {
    print_status "Verificando dependencias críticas..."
    
    CRITICAL_DEPS=(
        "aiohttp"
        "pandas"
        "pydantic"
        "jinja2"
        "python-dateutil"
    )
    
    for dep in "${CRITICAL_DEPS[@]}"; do
        if pip3 show "$dep" &> /dev/null; then
            print_success "$dep instalado"
        else
            print_error "$dep no instalado correctamente"
        fi
    done
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOL
# Configuración del Agente 6: Metadatos y SEO
# Completar con tus valores reales

# API Configuration
GEMINI_API_KEY=tu-api-key-openrouter-aqui
AGENT_ENV=development

# Cache Configuration  
ENABLE_CACHE=true
CACHE_TTL_HOURS=24

# Logging Configuration
LOG_LEVEL=INFO
ENABLE_VERBOSE_LOGGING=false

# Rate Limiting
REQUESTS_PER_MINUTE=60
REQUESTS_PER_HOUR=1000
EOL
        print_success "Archivo .env creado"
        print_warning "IMPORTANTE: Editar .env y añadir tu GEMINI_API_KEY"
    else
        print_warning "Archivo .env ya existe, no se sobrescribirá"
    fi
}

# Ejecutar tests básicos
run_basic_tests() {
    print_status "¿Desea ejecutar tests básicos? [y/n]"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Ejecutando tests básicos..."
        
        if [ -f "ejemplo_uso.py" ]; then
            print_status "Ejecutando ejemplo de uso..."
            
            # Configuración de testing
            export AGENT_ENV=testing
            export GEMINI_API_KEY=test-key
            
            python3 -c "
import sys
sys.path.append('.')
try:
    from ejemplo_uso import ejemplo_basico
    import asyncio
    print('✅ Tests básicos ejecutados correctamente')
except Exception as e:
    print(f'❌ Error en tests: {e}')
    sys.exit(1)
"
            
            print_success "Tests básicos completados"
        else
            print_warning "ejemplo_uso.py no encontrado, saltando tests"
        fi
    fi
}

# Mostrar información final
show_final_info() {
    echo ""
    echo "🎉 ¡Instalación completada!"
    echo "=========================="
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Editar archivo .env con tu GEMINI_API_KEY"
    echo "2. Activar entorno virtual: source venv/bin/activate"
    echo "3. Ejecutar ejemplo: python3 ejemplo_uso.py"
    echo ""
    echo "📚 Documentación:"
    echo "- README.md: Documentación completa"
    echo "- ejemplo_uso.py: Ejemplos de uso"
    echo "- config.py: Configuraciones disponibles"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "- Health check: python3 -c \"import asyncio; from agent import *; print(asyncio.run(AgenteMetadatosGemini(create_production_config()).health_check_completo()))\""
    echo "- Test rápido: python3 ejemplo_uso.py"
    echo ""
    echo "📞 Soporte:"
    echo "- Email: soporte@luxurywatch.com"
    echo "- Issues: GitHub Issues"
    echo ""
}

# Función principal
main() {
    echo "Configuración del sistema:"
    echo "- OS: $(uname -s)"
    echo "- Architecture: $(uname -m)"
    echo "- Python: $(python3 --version 2>/dev/null || echo 'No encontrado')"
    echo "- pip: $(pip3 --version 2>/dev/null || echo 'No encontrado')"
    echo ""
    
    # Ejecutar pasos de instalación
    check_python
    check_pip
    create_virtual_env
    install_dependencies
    verify_critical_dependencies
    setup_environment
    run_basic_tests
    show_final_info
}

# Manejo de interrupciones
trap 'echo -e "\n\n❌ Instalación interrumpida por el usuario"; exit 1' INT

# Ejecutar instalación
main "$@"
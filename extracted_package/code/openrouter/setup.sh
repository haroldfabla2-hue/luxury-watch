#!/bin/bash

# Script de instalación y verificación para OpenRouter Integration
# Uso: ./setup.sh

set -e

echo "🚀 INSTALACIÓN DEL SISTEMA OPENROUTER - GEMINI 2.0 EXPERIMENTAL"
echo "================================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones auxiliares
print_step() {
    echo -e "\n${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar prerequisites
check_prerequisites() {
    print_step "Verificando prerrequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 16+ desde https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Se requiere Node.js 16 o superior. Versión actual: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detectado"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_success "npm $(npm -v) detectado"
    
    # Verificar Git (opcional)
    if command -v git &> /dev/null; then
        print_success "Git $(git --version | cut -d' ' -f3) detectado"
    else
        print_warning "Git no detectado (opcional)"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_step "Instalando dependencias..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencias instaladas correctamente"
    else
        print_error "package.json no encontrado"
        exit 1
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_step "Configurando variables de entorno..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Archivo .env creado desde .env.example"
            print_warning "IMPORTANTE: Configura tu OPENROUTER_API_KEY en el archivo .env"
        else
            print_error ".env.example no encontrado"
            exit 1
        fi
    else
        print_info "Archivo .env ya existe"
    fi
    
    # Verificar configuración crítica
    source .env
    
    if [ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" == "your_openrouter_api_key_here" ]; then
        print_warning "OPENROUTER_API_KEY no configurada correctamente"
        print_info "1. Obtén tu API key desde https://openrouter.ai/keys"
        print_info "2. Edita el archivo .env y configura OPENROUTER_API_KEY"
        print_info "3. Ejecuta este script nuevamente"
    else
        print_success "OPENROUTER_API_KEY configurada"
    fi
}

# Crear directorios necesarios
create_directories() {
    print_step "Creando directorios necesarios..."
    
    # Crear directorio de logs
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_success "Directorio logs/ creado"
    else
        print_info "Directorio logs/ ya existe"
    fi
    
    # Crear directorio de docs si no existe
    if [ ! -d "docs" ]; then
        mkdir -p docs
        print_success "Directorio docs/ creado"
    else
        print_info "Directorio docs/ ya existe"
    fi
    
    # Crear directorio temporal
    if [ ! -d "tmp" ]; then
        mkdir -p tmp
        print_success "Directorio tmp/ creado"
    else
        print_info "Directorio tmp/ ya existe"
    fi
}

# Test de conexión
test_connection() {
    print_step "Probando conexión con OpenRouter..."
    
    source .env
    
    if [ -z "$OPENROUTER_API_KEY" ] || [ "$OPENROUTER_API_KEY" == "your_openrouter_api_key_here" ]; then
        print_warning "Saltando test de conexión - API key no configurada"
        return 0
    fi
    
    # Test básico con curl
    response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models)
    http_code="${response: -3}"
    
    if [ "$http_code" == "200" ]; then
        print_success "Conexión con OpenRouter exitosa"
    else
        print_warning "Problema de conexión con OpenRouter (código: $http_code)"
        print_info "Verifica tu API key y conexión a internet"
    fi
}

# Generar documentación
generate_docs() {
    print_step "Generando documentación..."
    
    if [ -f "scripts/generate-docs.js" ]; then
        node scripts/generate-docs.js
        print_success "Documentación generada en docs/"
    else
        print_warning "Script de documentación no encontrado"
    fi
}

# Ejecutar test básico
run_basic_test() {
    print_step "Ejecutando test básico..."
    
    if [ -f "src/examples/basic-example.js" ]; then
        print_info "Ejecutando ejemplo básico..."
        
        # Crear archivo temporal para ejecutar el test
        cat > tmp/test-basic.js << 'EOF'
const { createClient } = require('../src/index');

async function testBasic() {
    try {
        console.log('🧪 Probando conexión básica...');
        const client = await createClient();
        
        console.log('💓 Verificando salud...');
        const health = await client.healthCheck();
        console.log('✅ Estado:', health.status);
        
        console.log('🤖 Probando generación...');
        const response = await client.generateResponse('Hola, esto es un test', { max_tokens: 50 });
        console.log('✅ Respuesta generada exitosamente');
        
        console.log('🎉 Test básico completado');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en test:', error.message);
        process.exit(1);
    }
}

testBasic();
EOF
        
        # Ejecutar test
        node tmp/test-basic.js
        print_success "Test básico completado"
    else
        print_warning "Ejemplo básico no encontrado"
    fi
}

# Mostrar información final
show_final_info() {
    echo -e "\n${GREEN}🎉 INSTALACIÓN COMPLETADA${NC}"
    echo "================================"
    
    echo -e "\n${BLUE}📁 Estructura del proyecto:${NC}"
    echo "  ├── src/          # Código fuente"
    echo "  ├── docs/         # Documentación"
    echo "  ├── logs/         # Archivos de log"
    echo "  ├── examples/     # Ejemplos de uso"
    echo "  ├── package.json  # Dependencias"
    echo "  └── .env          # Configuración"
    
    echo -e "\n${BLUE}🚀 Próximos pasos:${NC}"
    echo "1. Configura tu OPENROUTER_API_KEY en .env"
    echo "2. Ejecuta ejemplos: npm run dev"
    echo "3. Inicia servidor: npm start"
    echo "4. Lee la documentación en README.md"
    
    echo -e "\n${BLUE}📚 Comandos útiles:${NC}"
    echo "  npm run dev              # Ejecutar ejemplos interactivos"
    echo "  npm start                # Iniciar servidor API"
    echo "  node src/examples/index.js  # Menú de ejemplos"
    echo "  npm test                 # Ejecutar tests"
    
    echo -e "\n${BLUE}🔗 URLs importantes:${NC}"
    echo "  API Key: https://openrouter.ai/keys"
    echo "  Documentación: https://openrouter.ai/docs"
    echo "  Gemini 2.0: https://ai.google.dev/gemini-api"
    
    echo -e "\n${BLUE}📊 Monitoreo:${NC}"
    echo "  Health check: http://localhost:3000/api/openrouter/health"
    echo "  API docs: http://localhost:3000/api/openrouter"
    
    echo -e "\n${YELLOW}💡 Consejos:${NC}"
    echo "  - Mantén tu API key segura y no la compartas"
    echo "  - Monitorea el uso en https://openrouter.ai/usage"
    echo "  - Configura alertas para detectar problemas"
    echo "  - Revisa los logs regularmente"
    
    echo -e "\n${GREEN}¡Listo para comenzar! 🎯${NC}"
}

# Función principal
main() {
    echo "Iniciando instalación del sistema OpenRouter Integration..."
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        print_error "Ejecuta este script desde el directorio raíz del proyecto (code/openrouter/)"
        exit 1
    fi
    
    check_prerequisites
    install_dependencies
    setup_environment
    create_directories
    generate_docs
    
    # Tests opcionales (solo si API key está configurada)
    source .env
    if [ -n "$OPENROUTER_API_KEY" ] && [ "$OPENROUTER_API_KEY" != "your_openrouter_api_key_here" ]; then
        test_connection
        run_basic_test
    else
        print_info "Configura OPENROUTER_API_KEY para ejecutar tests automáticos"
    fi
    
    show_final_info
}

# Manejar argumentos de línea de comandos
case "${1:-}" in
    "test")
        print_step "Ejecutando solo tests..."
        test_connection
        run_basic_test
        ;;
    "docs")
        print_step "Generando solo documentación..."
        generate_docs
        ;;
    "help"|"-h"|"--help")
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponibles:"
        echo "  (sin argumentos)  Instalación completa"
        echo "  test              Solo ejecutar tests"
        echo "  docs              Solo generar documentación"
        echo "  help              Mostrar esta ayuda"
        exit 0
        ;;
    *)
        main
        ;;
esac
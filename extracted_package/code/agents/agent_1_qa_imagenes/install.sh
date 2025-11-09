#!/bin/bash

# Script de instalación del Agente 1: Analista de Calidad de Imágenes
# Instala dependencias y configura el entorno

set -e

echo "=== Agente 1: Analista de Calidad de Imágenes - Instalación ==="

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 no está instalado"
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
echo "Python version: $PYTHON_VERSION"

if [[ $(echo "$PYTHON_VERSION < 3.8" | bc -l) -eq 1 ]]; then
    echo "Error: Se requiere Python 3.8 o superior"
    exit 1
fi

# Crear entorno virtual (opcional)
if [ "$1" = "--venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Entorno virtual activado"
fi

# Instalar dependencias
echo "Instalando dependencias..."
pip install --upgrade pip

# Dependencias principales
pip install opencv-python==4.8.1.78
pip install numpy==1.24.3
pip install pillow==10.0.1
pip install fastapi==0.103.1
pip install uvicorn[standard]==0.23.2
pip install python-multipart==0.0.6
pip install aiohttp==3.8.5
pip install loguru==0.7.2
pip install pydantic==2.3.0

# Dependencias de desarrollo (opcional)
if [ "$1" = "--dev" ] || [ "$2" = "--dev" ]; then
    echo "Instalando dependencias de desarrollo..."
    pip install pytest==7.4.2
    pip install pytest-asyncio==0.21.1
    pip install black==23.7.0
    pip install flake8==6.0.0
fi

# Crear directorios necesarios
echo "Creando directorios..."
mkdir -p logs
mkdir -p cache
mkdir -p reports
mkdir -p tests/test_images

# Crear archivo de configuración local
echo "Creando configuración local..."
cat > local_config.py << EOF
# Configuración local para el Agente 1: Analista de Calidad de Imágenes

from config import AgentConfig

# Configuración local por defecto
LOCAL_CONFIG = AgentConfig(
    agent_id="agent_1_qa_imagenes_local",
    api_host="127.0.0.1",
    api_port=8081,
    api_debug=True,
    log_level="DEBUG",
    enable_performance_logging=True
)

# Para desarrollo
DEV_CONFIG = AgentConfig(
    agent_id="agent_1_qa_imagenes_dev",
    max_concurrent_analyses=2,
    api_debug=True,
    log_level="DEBUG"
)

# Para producción
PROD_CONFIG = AgentConfig(
    agent_id="agent_1_qa_imagenes_prod",
    max_concurrent_analyses=8,
    api_debug=False,
    log_level="INFO",
    enable_performance_logging=True
)
EOF

# Verificar instalación de OpenCV
echo "Verificando instalación de OpenCV..."
python3 -c "
import cv2
print(f'OpenCV version: {cv2.__version__}')
print('OpenCV instalado correctamente ✓')
"

# Verificar dependencias principales
echo "Verificando dependencias..."
python3 -c "
import numpy as np
import fastapi
import aiohttp
import loguru
print('Dependencias verificadas ✓')
"

# Crear script de inicio rápido
echo "Creando script de inicio..."
cat > start_agent.sh << 'EOF'
#!/bin/bash
# Script de inicio rápido del Agente 1: Analista de Calidad de Imágenes

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo "Activando entorno virtual..."
    source venv/bin/activate
fi

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Iniciar servidor API
echo "Iniciando servidor API en http://localhost:8081"
python main.py --mode api --config default --host 0.0.0.0 --port 8081
EOF

chmod +x start_agent.sh

# Crear script de tests
echo "Creando script de tests..."
cat > run_tests.sh << 'EOF'
#!/bin/bash
# Script para ejecutar tests del Agente 1: Analista de Calidad de Imágenes

echo "Ejecutando tests del Agente 1: Analista de Calidad de Imágenes"

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Ejecutar tests
python -m pytest tests/ -v --tb=short

echo "Tests completados"
EOF

chmod +x run_tests.sh

# Crear imagen de prueba si no existe
echo "Creando imagen de prueba..."
python3 -c "
import numpy as np
import cv2

# Crear imagen de prueba simple
img = np.ones((800, 600, 3), dtype=np.uint8) * 128

# Agregar algunos elementos para hacer más interesante
cv2.rectangle(img, (100, 100), (300, 300), (255, 255, 255), -1)
cv2.circle(img, (450, 400), 100, (0, 255, 0), -1)
cv2.putText(img, 'TEST IMAGE', (200, 500), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 0, 0), 3)

# Guardar imagen
cv2.imwrite('tests/test_images/test_image.jpg', img)
print('Imagen de prueba creada: tests/test_images/test_image.jpg')
"

# Mostrar información final
echo ""
echo "=== Instalación completada exitosamente ==="
echo ""
echo "Uso:"
echo "  Iniciar servidor:    ./start_agent.sh"
echo "  Ejecutar tests:      ./run_tests.sh"
echo "  Modo API:           python main.py --mode api"
echo "  Modo standalone:    python main.py --mode standalone --image tests/test_images/test_image.jpg"
echo ""
echo "URLs:"
echo "  API Documentation:  http://localhost:8081/docs"
echo "  Health Check:       http://localhost:8081/health"
echo ""
echo "Archivos importantes:"
echo "  - config.py         Configuración principal"
echo "  - main.py           Script principal"
echo "  - logs/             Directorio de logs"
echo "  - local_config.py   Configuración local"
echo ""
echo "Para más información, consulte README.md"
echo ""

# Verificar integración con sistema de orquestación
if [ -d "../../orchestration" ]; then
    echo "Sistema de orquestación detectado."
    echo "Para integrar con el sistema de colas, ejecute:"
    echo "  python main.py --mode queue"
else
    echo "Sistema de orquestación no detectado."
    echo "El agente funcionará en modo standalone."
fi

echo ""
echo "¡Instalación completada! 🎉"
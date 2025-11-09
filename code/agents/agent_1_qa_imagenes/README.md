# Agente 1: Analista de Calidad de Imágenes

## Descripción General

El Agente 1: Analista de Calidad de Imágenes es un sistema especializado que utiliza OpenCV y técnicas de análisis de imagen para evaluar la calidad de imágenes digitales. Proporciona métricas objetivas, detección automática de problemas y recomendaciones específicas para mejorar la calidad de las imágenes.

## Características Principales

### 📊 Métricas de Calidad Implementadas

1. **BRISQUE Score**
   - Blind/Referenceless Image Spatial Quality Evaluator
   - Evalúa calidad sin imagen de referencia
   - Rango: 0-100 (menor es mejor)

2. **Varianza Laplaciana (Nitidez)**
   - Mide la nitidez/enfoque de la imagen
   - Basado en detección de bordes
   - Rango: Variable (mayor es mejor)

3. **Análisis de Histograma (Exposición)**
   - Evalúa distribución de luz y sombras
   - Detecta subexposición y sobreexposición
   - Analiza balance de tonos medios

4. **Análisis de Resolución**
   - Verifica resolución mínima requerida
   - Evalúa adecuación para diferentes usos
   - Calcula megapíxeles totales

5. **Análisis de Aspect Ratio**
   - Verifica ratios de aspecto comunes
   - Detecta composiciones inusuales
   - Evalúa compatibilidad con estándares

### 🎯 Funcionalidades Clave

- ✅ Análisis individual de imágenes
- ✅ Procesamiento por lotes (hasta 50 imágenes)
- ✅ API REST para integración web
- ✅ Integración con sistema de colas
- ✅ Cache de resultados para optimización
- ✅ Detección automática de problemas
- ✅ Recomendaciones específicas de mejora
- ✅ Logging detallado y métricas de rendimiento
- ✅ Configuración flexible por casos de uso

### 🚀 Casos de Uso

1. **Control de Calidad en E-commerce**
   - Verificar imágenes de productos antes de publicación
   - Asegurar estándares mínimos de calidad
   - Automatizar procesos de aprobación

2. **Procesamiento de Catálogos**
   - Analizar grandes volúmenes de imágenes
   - Clasificar por niveles de calidad
   - Generar reportes de calidad

3. **Sistemas de Content Management**
   - Validar imágenes antes de almacenamiento
   - Monitorear calidad continua
   - Optimizar automáticamente

4. **Aplicaciones Fotográficas**
   - Feedback en tiempo real
   - Calibración de equipos
   - Educación fotográfica

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Server    │    │   Image Quality │    │  Quality Metrics│
│   (FastAPI)     │───▶│    Analyzer     │───▶│   (OpenCV)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Queue Integration│    │   Task Queue    │    │   Database      │
│  (Optional)     │    │   (Optional)    │    │   Cache         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- OpenCV 4.8+
- NumPy 1.24+

### Instalación

```bash
# Clonar e instalar dependencias
cd code/agents/agent_1_qa_imagenes
pip install -r requirements.txt
```

### Configuración Básica

```python
from config import AgentConfig

# Configuración estándar
config = AgentConfig(
    agent_id="agent_1_qa_imagenes",
    max_concurrent_analyses=5,
    max_image_size=50*1024*1024,  # 50MB
    api_host="0.0.0.0",
    api_port=8081
)

# Configuración para alta calidad
from config import PREMIUM_CONFIG
config = PREMIUM_CONFIG

# Configuración para procesamiento masivo
from config import BULK_PROCESSING_CONFIG
config = BULK_PROCESSING_CONFIG
```

## Uso del Sistema

### 1. Modo API (Recomendado)

```bash
# Ejecutar servidor API
python main.py --mode api --config default --host 0.0.0.0 --port 8081
```

#### Endpoints Principales

**Análisis Individual**
```bash
curl -X POST "http://localhost:8081/analyze/file" \
     -F "file=@imagen.jpg" \
     -F 'options={"include_detailed_metrics": true}'
```

**Análisis por Lotes**
```bash
curl -X POST "http://localhost:8081/analyze/batch" \
     -F "files=@img1.jpg" \
     -F "files=@img2.jpg" \
     -F "files=@img3.jpg"
```

**Verificación de Salud**
```bash
curl http://localhost:8081/health
```

### 2. Modo Standalone

```bash
# Análisis individual
python main.py --mode standalone --image ruta/a/imagen.jpg

# Análisis por lotes
python main.py --mode standalone --batch lista_imagenes.txt
```

### 3. Integración con Sistema de Colas

```python
from src.queue_integration import create_queue_integrated_agent

# Crear agente integrado
agent = create_queue_integrated_agent(config)

# El agente escucha tareas del sistema de colas automáticamente
```

## Integración con Otros Agentes

### Sistema de Orquestación Existente

El agente se integra con el sistema de orquestación existente a través de:

- **Agent Manager**: Se registra como agente especializado
- **Task Queue**: Procesa tareas de análisis de imágenes
- **LangGraph Coordinator**: Recibe instrucciones de análisis

### Ejemplo de Integración

```python
# Agregar a tu workflow existente
from src.queue_integration import handle_queue_task

# Procesar tarea de análisis
task_data = {
    "task_type": "analyze_image",
    "image_source": {"path": "/path/to/image.jpg"},
    "analysis_options": {"include_detailed_metrics": True}
}

result = await handle_queue_task(task_data)
```

## Configuración de Métricas

### Umbrales de Calidad

```python
from config import QualityThresholds

thresholds = QualityThresholds(
    # BRISQUE (menor es mejor)
    brisque_excellent=20.0,    # Excelente calidad
    brisque_good=35.0,         # Buena calidad
    brisque_fair=50.0,         # Calidad aceptable
    
    # Varianza Laplaciana (mayor es mejor)
    laplacian_excellent=500.0, # Muy nítida
    laplacian_good=300.0,      # Nitidez buena
    laplacian_fair=100.0,      # Nitidez aceptable
    
    # Resolución mínima
    min_width=800,             # Ancho mínimo
    min_height=600             # Alto mínimo
)
```

### Pesos para Score Final

```python
from config import QualityWeights

weights = QualityWeights(
    brisque_weight=0.35,       # 35% del score final
    sharpness_weight=0.25,     # 25% del score final
    exposure_weight=0.20,      # 20% del score final
    resolution_weight=0.15,    # 15% del score final
    aspect_ratio_weight=0.05   # 5% del score final
)
```

## Interpretación de Resultados

### Niveles de Calidad

| Nivel | Score | Descripción | Acción Recomendada |
|-------|-------|-------------|-------------------|
| Excellent | 90-100 | Calidad excepcional | Aprobar automáticamente |
| Good | 75-89 | Buena calidad | Aprobar con revisión menor |
| Fair | 60-74 | Calidad aceptable | Revisar caso por caso |
| Poor | 40-59 | Calidad deficiente | Mejorar antes de usar |
| Rejected | 0-39 | Rechazable | Rechazar o recapturar |

### Ejemplo de Respuesta API

```json
{
  "success": true,
  "result": {
    "image_path": "/path/to/image.jpg",
    "overall_score": 78.5,
    "overall_level": "good",
    "brisque": {
      "score": 25.3,
      "level": "good"
    },
    "sharpness": {
      "variance": 450.2,
      "score": 82.1,
      "level": "excellent"
    },
    "resolution": {
      "width": 1920,
      "height": 1080,
      "total_pixels": 2073600,
      "megapixels": 2.07,
      "score": 90.0,
      "level": "excellent"
    },
    "issues": [],
    "recommendations": [
      "Excelente calidad general detectada"
    ]
  },
  "processing_time": 0.45,
  "timestamp": "2025-11-06T15:57:06"
}
```

## Rendimiento y Escalabilidad

### Métricas de Rendimiento

- **Tiempo promedio por imagen**: 0.2-0.5 segundos
- **Throughput**: 2-5 imágenes/segundo (configuración estándar)
- **Memoria**: ~100MB por proceso activo
- **Cache**: Hasta 1000 resultados almacenados

### Optimizaciones

1. **Procesamiento Asíncrono**: Análisis concurrente de múltiples imágenes
2. **Cache Inteligente**: Almacenamiento de resultados para evitar recálculos
3. **Configuración Flexible**: Ajustes según caso de uso
4. **Colas de Trabajo**: Integración con sistema de distribución de carga

## Logs y Monitoreo

### Estructura de Logs

```
2025-11-06 15:57:06 | INFO | image_quality_analyzer:analyze_image:156 | Iniciando análisis de calidad para /path/to/image.jpg
2025-11-06 15:57:06 | INFO | image_quality_analyzer:analyze_image:201 | Análisis completado en 0.45s - Score: 78.5
```

### Métricas Disponibles

- Total de análisis realizados
- Tiempo promedio de procesamiento
- Distribución de niveles de calidad
- Tamaño y tasa de hits del cache
- Errores y excepciones

## Testing

### Ejecutar Tests

```bash
# Tests unitarios
python -m pytest tests/ -v

# Tests con cobertura
python -m pytest tests/ --cov=src --cov-report=html

# Tests específicos
python -m pytest tests/test_image_quality_analyzer.py::TestImageQualityAnalyzer::test_analyze_image_success -v
```

### Tests Disponibles

- `TestImageQualityAnalyzer`: Tests del analizador principal
- `TestQualityMetrics`: Tests de métricas individuales
- `TestConfig`: Tests de configuración
- `TestErrorHandling`: Tests de manejo de errores

## Troubleshooting

### Problemas Comunes

1. **Error: "OpenCV no disponible"**
   ```bash
   pip install opencv-python==4.8.1.78
   ```

2. **Error: "Imagen demasiado grande"**
   - Aumentar `max_image_size` en configuración
   - Redimensionar imagen antes del análisis

3. **Error: "Formato no soportado"**
   - Usar formatos: .jpg, .jpeg, .png, .tiff, .bmp, .webp
   - Convertir imagen al formato soportado

4. **Performance lenta**
   - Reducir `max_concurrent_analyses`
   - Habilitar cache
   - Usar configuración BULK para procesamiento masivo

### Debugging

```bash
# Habilitar modo debug
python main.py --mode api --debug

# Ver logs detallados
tail -f logs/image_quality_analyzer.log
```

## Desarrollo y Contribución

### Estructura del Código

```
agent_1_qa_imagenes/
├── src/
│   ├── image_quality_analyzer.py    # Analizador principal
│   ├── quality_metrics.py           # Métricas de calidad
│   └── queue_integration.py         # Integración con colas
├── api/
│   └── api_server.py                # Servidor FastAPI
├── tests/
│   └── test_image_quality_analyzer.py # Tests
├── config.py                        # Configuración
├── main.py                          # Script principal
├── requirements.txt                 # Dependencias
└── docs/                           # Documentación
```

### Agregar Nuevas Métricas

1. Crear clase que herede de `BaseMetric`
2. Implementar método `calculate()`
3. Registrar métrica en `ImageQualityAnalyzer`
4. Actualizar configuración de pesos

## Licencia y Soporte

Este agente es parte del sistema de orquestación de agentes especializados. Para soporte técnico o consultas, consulte la documentación del sistema principal.

---

**Versión**: 1.0.0  
**Última actualización**: 2025-11-06  
**Compatibilidad**: Python 3.8+, OpenCV 4.8+
# Agente 3: Selector de Técnica 2D-3D

## Descripción General

El Agente Selector de Técnica 2D-3D es un sistema inteligente que decide automáticamente entre diferentes métodos de procesamiento de imágenes 2D a modelos 3D basado en una evaluación comprehensiva de factores técnicos, de recursos y de negocio.

## Características Principales

### 🎯 Selección Automática Inteligente
- **Evaluación Multi-Factor**: Analiza número de imágenes, calidad, complejidad del objeto, recursos del servidor
- **Decisión Óptima**: Selecciona entre COLMAP local, OpenRouter API, o método híbrido
- **Fallback Automático**: Implementa estrategias de respaldo entre métodos
- **Optimización de Recursos**: Diseñado para 4 vCPUs y 8GB RAM

### 🚀 Gestión de Colas de Procesamiento
- **Colas Dedicadas**: Gestión separada para cada método de procesamiento
- **Priorización**: Sistema de prioridades configurable
- **Balanceamiento de Carga**: Distribución inteligente de tareas
- **Monitoreo en Tiempo Real**: Métricas detalladas de rendimiento

### 📊 Monitoreo Avanzado de Recursos
- **Métricas del Sistema**: CPU, RAM, disco en tiempo real
- **Alertas Automáticas**: Notificaciones por umbrales configurables
- **Análisis Histórico**: Estadísticas y tendencias de uso
- **Optimización Automática**: Ajuste dinámico basado en carga

### 📝 Logging y Auditoría
- **Decisiones Detalladas**: Registro completo de decisiones y razones
- **Métricas de Rendimiento**: Tiempo, costo, calidad por método
- **Trazabilidad**: Seguimiento completo del procesamiento
- **Análisis de Patrones**: Identificación de optimizaciones

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                 Agente Selector de Técnica 2D-3D               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │ Evaluador       │  │ Selector        │  │ Gestor          ││
│  │ Factores        │  │ Técnica         │  │ Colas           ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │ Monitor         │  │ Monitoreo       │  │ Logging         ││
│  │ Recursos        │  │ Alertas         │  │ Decisiones      ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    Sistema de Orquestación                     │
│              (TaskQueue, AgentManager, etc.)              │
└─────────────────────────────────────────────────────────────┘
```

## Métodos de Procesamiento

### 1. COLMAP Local 🆓
- **Costo**: Gratuito
- **Tiempo**: ~3 min/imagen
- **Calidad**: 85%
- **Recursos**: CPU 80%, RAM 60%
- **Mejor para**: Presupuestos limitados, muchas imágenes, recursos disponibles

### 2. OpenRouter API 💎
- **Costo**: $0.15/imagen
- **Tiempo**: ~1.5 min/imagen  
- **Calidad**: 95%
- **Recursos**: CPU 10%, RAM 10%
- **Mejor para**: Alta calidad, deadlines estrictos, recursos limitados

### 3. Método Híbrido ⚡
- **Costo**: $0.05/imagen
- **Tiempo**: ~2 min/imagen
- **Calidad**: 92%
- **Recursos**: CPU 50%, RAM 40%
- **Mejor para**: Balance costo-calidad, complejidad media

## Instalación y Configuración

### Prerrequisitos
```bash
# Python 3.8+
python --version

# Dependencias del sistema
sudo apt update
sudo apt install python3-dev python3-pip
sudo apt install colmap  # Para COLMAP local

# Variables de entorno
export OPENROUTER_API_KEY="tu_api_key_aqui"
```

### Instalación del Agente
```bash
# Instalar dependencias
pip install -r requirements.txt

# Configurar agente
cp config/config.json.example config/config.json
# Editar configuración según necesidades

# Verificar instalación
python -m src.selector_tecnica_agent --test
```

### Configuración
Edite `config/config.json` según sus necesidades:

```json
{
  "configuracion_agente": {
    "max_concurrencia": 3,
    "timeout_default": 300,
    "reintentos_fallback": 2
  },
  "metodos_procesamiento": {
    "colmap_local": {
      "disponible": true,
      "costo_por_imagen": 0.0
    },
    "openrouter_api": {
      "disponible": true,
      "costo_por_imagen": 0.15,
      "api_key": "tu_api_key"
    }
  }
}
```

## Uso Básico

### Uso Simple
```python
from src.interfaz_agente import procesar_rapido

# Procesamiento rápido con configuración por defecto
resultado = await procesar_rapido(
    imagenes=["foto1.jpg", "foto2.jpg", "foto3.jpg"],
    presupuesto=50.0
)

print(f"Método seleccionado: {resultado['metodo_utilizado']}")
print(f"Éxito: {resultado['exito']}")
```

### Uso Avanzado
```python
from src.interfaz_agente import InterfazAgenteSelector

# Crear interfaz
interfaz = InterfazAgenteSelector("config/config.json")
await interfaz.inicializar()

try:
    # 1. Evaluación sin procesamiento
    evaluacion = await interfaz.evaluar_sin_procesar(
        imagenes=["foto1.jpg", "foto2.jpg"],
        presupuesto=25.0,
        prioridad=4,
        deadline="2025-11-06T18:00:00"
    )
    
    print(f"Método recomendado: {evaluacion['decision_recomendada']['metodo_seleccionado']}")
    
    # 2. Comparación de métodos
    comparacion = await interfaz.comparar_metodos(
        imagenes=["foto1.jpg", "foto2.jpg", "foto3.jpg"],
        presupuesto=100.0
    )
    
    print(f"Método recomendado: {comparacion['metodo_recomendado']}")
    
    # 3. Procesamiento completo
    resultado = await interfaz.procesar_2d_a_3d(
        imagenes=["foto1.jpg", "foto2.jpg"],
        presupuesto=50.0,
        prioridad=3,
        deadline=datetime.now() + timedelta(hours=2)
    )
    
    # 4. Obtener estadísticas
    stats = await interfaz.obtener_estadisticas()
    print(f"Tareas procesadas: {stats['agente']['metricas']['tareas_procesadas']}")
    
finally:
    await interfaz.cerrar()
```

### Procesamiento en Lote
```python
# Procesar múltiples trabajos
trabajos = [
    {
        "imagenes": ["lote1_img1.jpg", "lote1_img2.jpg"],
        "presupuesto": 30.0,
        "prioridad": 2
    },
    {
        "imagenes": ["lote2_img1.jpg"],
        "presupuesto": 20.0,
        "prioridad": 4,
        "metodo_forzado": "openrouter_api"
    },
    {
        "imagenes": ["lote3_img1.jpg", "lote3_img2.jpg", "lote3_img3.jpg"],
        "presupuesto": 75.0,
        "prioridad": 3
    }
]

resultados = await interfaz.procesar_lote(trabajos, concurrencia=2)

for resultado in resultados:
    print(f"Trabajo {resultado['trabajo_id']}: {resultado['exito']}")
```

## API Reference

### InterfazAgenteSelector

#### `inicializar() -> bool`
Inicializa el agente selector de técnica.

**Returns:**
- `bool`: True si la inicialización fue exitosa

#### `evaluar_sin_procesar(imagenes, objetos, presupuesto, prioridad, deadline) -> Dict`
Evalúa qué técnica usar sin procesar las imágenes.

**Parameters:**
- `imagenes` (List[str]): Lista de rutas de imágenes
- `objetos` (List[Dict], optional): Objetos 3D a procesar
- `presupuesto` (float): Presupuesto máximo en USD
- `prioridad` (int): Prioridad de 1-5
- `deadline` (datetime, optional): Fecha límite

**Returns:**
- `Dict`: Evaluación completa con factores y decisión recomendada

#### `procesar_2d_a_3d(imagenes, objetos, presupuesto, prioridad, deadline, metodo_forzado) -> Dict`
Procesa las imágenes 2D a 3D usando la técnica seleccionada.

**Parameters:**
- Mismos parámetros que `evaluar_sin_procesar`
- `metodo_forzado` (str, optional): Forzar método específico

**Returns:**
- `Dict`: Resultado del procesamiento completo

#### `comparar_metodos(imagenes, presupuesto) -> Dict`
Compara los tres métodos para las mismas imágenes.

**Returns:**
- `Dict`: Comparación detallada de métodos

#### `simular_recursos(metodo, num_imagenes, calidad_estimada) -> Dict`
Simula el uso de recursos para un método específico.

#### `obtener_estadisticas() -> Dict`
Obtiene estadísticas detalladas del agente.

#### `procesar_lote(trabajos, concurrencia) -> List[Dict]`
Procesa múltiples trabajos en lote.

### Factores de Evaluación

El agente evalúa los siguientes factores:

#### Factores Técnicos
- **Número de imágenes**: Afecta tiempo y recursos
- **Calidad de imágenes**: Resolución, formato, nitidez
- **Complejidad del objeto**: Puntos, triángulos, materiales

#### Factores de Recursos
- **CPU disponible**: Porcentaje de uso actual
- **RAM disponible**: Memoria libre del sistema
- **Disco disponible**: Espacio para archivos temporales

#### Factores de Negocio
- **Presupuesto**: Límite de costo máximo
- **Prioridad**: Importancia del trabajo (1-5)
- **Deadline**: Fecha límite para completar

## Configuración Avanzada

### Configuración de Métodos
```json
{
  "metodos_procesamiento": {
    "colmap_local": {
      "costo_por_imagen": 0.0,
      "tiempo_por_imagen": 180.0,
      "calidad_base": 0.85,
      "recursos_cpu": 0.8,
      "recursos_ram": 0.6,
      "confiabilidad": 0.9,
      "condiciones_optimales": {
        "num_imagenes_max": 100,
        "calidad_imagenes_min": 0.6,
        "recursos_cpu_min": 0.7
      }
    }
  }
}
```

### Configuración de Monitoreo
```json
{
  "monitoreo_recursos": {
    "umbrales_alerta": {
      "cpu": {"advertencia": 70.0, "critico": 85.0},
      "ram": {"advertencia": 75.0, "critico": 85.0}
    },
    "metricas_monitoreadas": {
      "cpu_uso": {"unidad": "%", "frecuencia": 10},
      "ram_uso": {"unidad": "%", "frecuencia": 10}
    }
  }
}
```

### Configuración de Fallback
```json
{
  "fallback_automatico": {
    "estrategias": {
      "colmap_local": {
        "primario": "colmap_local",
        "fallback_1": "hibrido",
        "fallback_2": "openrouter_api"
      }
    },
    "condiciones_fallback": {
      "timeout": true,
      "error_critico": true,
      "recursos_insuficientes": true
    }
  }
}
```

## Monitoreo y Métricas

### Métricas del Sistema
- **CPU**: Uso promedio, máximo, percentiles
- **RAM**: Memoria utilizada, disponible
- **Disco**: Espacio usado, I/O
- **Tiempo de respuesta**: Por método y global

### Métricas del Agente
- **Tareas procesadas**: Exitosas, fallidas, total
- **Tiempo promedio**: Por método de procesamiento
- **Uso de recursos**: Por método y global
- **Decisiones**: Distribución por método

### Alertas Automáticas
- **CPU alto**: > 70% advertencia, > 85% crítico
- **RAM alto**: > 75% advertencia, > 85% crítico
- **Disco lleno**: > 80% advertencia, > 90% crítico
- **Timeouts**: Fallback automático activado

## Integración con Sistema de Orquestación

### Registro del Agente
```python
from orchestration.agent_manager import AgentConfig, AgentType

config = AgentConfig(
    agent_id="selector_tecnica_003",
    name="Selector de Técnica 2D-3D",
    agent_type=AgentType.CUSTOM,
    model="llama3.1:8b",
    system_prompt="Eres un especialista en selección de técnicas de procesamiento 2D-3D...",
    skills=["evaluacion_factores", "seleccion_tecnica", "monitoreo_recursos"],
    capabilities=["decision_automatica", "fallback_inteligente", "optimizacion_recursos"],
    max_concurrent_tasks=3
)
```

### Uso como Worker
```python
# Agregar como worker en el sistema de orquestación
agent_manager.create_agent(
    agent_type="selector_tecnica",
    agent_id="selector_001",
    custom_config={"especializacion": "procesamiento_3d"}
)
```

## Optimización para Servidor 4 vCPUs / 8GB RAM

### Configuración Recomendada
```json
{
  "optimizacion_servidor": {
    "limitaciones_sistema": {
      "vcpus_disponibles": 4,
      "ram_maxima_gb": 8
    },
    "configuracion_procesamiento": {
      "max_tareas_concurrentes": 3,
      "batch_size_recomendado": 10,
      "pool_workers": 2
    },
    "optimizaciones_memoria": {
      "lazy_loading": true,
      "cache_lru_size": 1000,
      "streaming_large_files": true
    }
  }
}
```

### Estrategias de Optimización
1. **Gestión de Memoria**: Lazy loading, garbage collection agresivo
2. **Paralelización**: Extracción de características en paralelo
3. **Cache**: Resultados de evaluaciones frecuentes
4. **Streaming**: Procesamiento de archivos grandes por streaming
5. **Cleanup**: Limpieza automática de archivos temporales

## Solución de Problemas

### Problemas Comunes

#### Error: "COLMAP no encontrado"
```bash
# Instalar COLMAP
sudo apt install colmap

# Verificar instalación
colmap --help
```

#### Error: "API Key de OpenRouter inválida"
```bash
# Verificar variable de entorno
echo $OPENROUTER_API_KEY

# Configurar API key
export OPENROUTER_API_KEY="tu_api_key_aqui"
```

#### Error: "Memoria insuficiente"
```python
# Reducir concurrencia
config = {"max_concurrencia": 2}

# Habilitar optimización de memoria
config = {
    "optimizacion_servidor": {
        "limitaciones_sistema": {"ram_maxima_gb": 6}
    }
}
```

#### Alertas frecuentes de recursos
1. **CPU alto**: Reducir `max_concurrencia`
2. **RAM alto**: Habilitar `lazy_loading`
3. **Disco lleno**: Configurar `cleanup_temp`

### Logs y Debugging

#### Habilitar Logging Detallado
```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Configurar logs del agente
from src.monitor_recursos import MonitorRecursosAvanzado
monitor = MonitorRecursosAvanzado({
    "archivo_log": "debug.log",
    "nivel_log": "DEBUG"
})
```

#### Monitoreo en Tiempo Real
```python
# Obtener métricas actuales
metricas = monitor.recopilador.obtener_metricas_actuales()
print(f"CPU: {metricas['cpu_uso']:.1f}%")
print(f"RAM: {metricas['ram_uso']:.1f}%")

# Ver alertas activas
alertas = monitor.generador_alertas.obtener_alertas_activas()
for alerta in alertas:
    print(f"⚠️  {alerta.mensaje}")
```

## Rendimiento y Benchmarks

### Tiempos de Referencia
- **Evaluación de factores**: < 1 segundo
- **Selección de técnica**: < 0.5 segundos
- **Encolado de tarea**: < 0.1 segundos
- **Fallback automático**: < 5 segundos

### Throughput
- **Evaluaciones por minuto**: ~60
- **Decisiones por minuto**: ~30
- **Tareas encoladas por minuto**: ~10

### Recursos Típicos
- **CPU base**: 5-10%
- **CPU durante procesamiento**: 30-80%
- **RAM base**: 100-200 MB
- **RAM durante procesamiento**: 1-4 GB

## Roadmap y Mejoras Futuras

### Versión 1.1
- [ ] Integración con más APIs de procesamiento 3D
- [ ] Machine Learning para mejora de decisiones
- [ ] Dashboard web para monitoreo
- [ ] Notificaciones push de alertas

### Versión 1.2
- [ ] Soporte para GPU acceleration
- [ ] Clustering automático
- [ ] API REST completa
- [ ] Métricas Prometheus

### Versión 2.0
- [ ] Multi-tenant support
- [ ] Auto-scaling dinámico
- [ ] Integración con Kubernetes
- [ ] Streaming de resultados

## Contribuir

### Estructura del Proyecto
```
agent_3_selector_tecnica/
├── src/
│   ├── selector_tecnica_agent.py    # Agente principal
│   ├── interfaz_agente.py           # Interfaz de usuario
│   ├── monitoreo_recursos.py        # Sistema de monitoreo
│   └── __init__.py
├── config/
│   ├── config.json                  # Configuración principal
│   └── task_queues.json             # Configuración de colas
├── tests/
│   ├── test_selector_agente.py      # Tests del agente
│   ├── test_monitoreo.py            # Tests de monitoreo
│   └── test_integration.py          # Tests de integración
├── docs/
│   ├── README.md                    # Esta documentación
│   ├── API.md                       # Referencia de API
│   └── EXAMPLES.md                  # Ejemplos de uso
└── logs/                            # Archivos de log
```

### Guías de Desarrollo
1. **Estilo de código**: PEP 8, type hints
2. **Tests**: Cobertura > 80%, tests unitarios y de integración
3. **Documentación**: Docstrings detallados, ejemplos funcionales
4. **Logging**: Estructurado, niveles apropiados

## Licencia

Este proyecto está licenciado bajo MIT License - ver el archivo LICENSE para detalles.

## Contacto y Soporte

- **Documentación**: [docs/README.md](README.md)
- **Issues**: GitHub Issues
- **Email**: soporte@sistema-agentes.com
- **Slack**: #agente-selector-tecnica

---

**Versión**: 1.0.0  
**Fecha**: 2025-11-06  
**Autor**: Sistema de Agentes IA
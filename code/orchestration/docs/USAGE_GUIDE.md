# Guía de Uso - Sistema de Coordinación Local

Esta guía explica cómo usar el sistema de coordinación local con Ollama y LangGraph.

## Inicio Rápido

### 1. Instalación del Sistema

```bash
# Ejecutar script de instalación
bash install_ollama.sh

# Configurar entorno Python
bash setup_python_env.sh

# Activar entorno virtual
source venv/bin/activate
```

### 2. Iniciar el Sistema

```bash
# Iniciar Ollama
./start_ollama.sh

# Iniciar sistema de coordinación
python start_system.py --start
```

### 3. Ejecutar Ejemplos

```bash
# Ejecutar ejemplo de análisis de datos
python start_system.py --example analysis

# Ejecutar ejemplo de generación de código
python start_system.py --example code_generation

# Ejecutar ejemplo de procesamiento de documentos
python start_system.py --example document_processing
```

## Comandos Disponibles

### Script Principal (`start_system.py`)

```bash
# Iniciar el sistema completo
python start_system.py --start

# Instalar modelos
python start_system.py --install
python start_system.py --install --models llama3.1:70b mistral:8x7b

# Ejecutar ejemplos específicos
python start_system.py --example analysis
python start_system.py --example code_generation
python start_system.py --example document_processing
python start_system.py --example research
python start_system.py --example multi_agent

# Mostrar ayuda
python start_system.py --help
```

### Script de Instalación (`install_ollama.sh`)

```bash
# Instalación completa (recomendado)
bash install_ollama.sh

# Verificación de instalación
ollama list
ollama run llama3.1:8b
```

## Arquitectura del Sistema

### Componentes Principales

1. **OllamaManager** (`ollama_manager.py`)
   - Gestión de modelos LLM locales
   - Instalación y configuración de modelos
   - Comunicación con API de Ollama

2. **LangGraphCoordinator** (`langgraph_coordinator.py`)
   - Coordinación de workflows
   - Orquestación de agentes
   - Gestión de estados de ejecución

3. **TaskQueue** (`task_queue.py`)
   - Sistema de colas de trabajo
   - Distribución de tareas
   - Control de concurrencia

4. **AgentManager** (`agent_manager.py`)
   - Gestión de agentes especializados
   - Configuración de agentes
   - Monitoreo de rendimiento

5. **StateManager** (`state_manager.py`)
   - Persistencia de datos
   - Gestión de estado del sistema
   - Base de datos SQLite

### Tipos de Agentes

- **Coordinador**: Gestión de workflows y coordinación
- **Analizador**: Análisis de datos e información
- **Generador**: Creación de contenido y documentos
- **Ejecutor de Código**: Programación y desarrollo
- **Investigador**: Búsqueda y síntesis de información

## Configuración

### Archivos de Configuración

- `config/coordination_config.yaml`: Configuración del coordinador
- `config/state_config.yaml`: Configuración de persistencia

### Variables de Entorno

```bash
export OLLAMA_HOST="localhost:11434"
export LOG_LEVEL="INFO"
export DB_PATH="data/orchestration_state.db"
```

## Ejemplos de Uso

### Ejemplo 1: Análisis de Datos

```python
from langgraph_coordinator import LangGraphCoordinator
from task_queue import TaskPriority

# Crear configuración de workflow
workflow_config = {
    "workflow_id": "analysis_001",
    "name": "Análisis de Ventas",
    "type": "analysis",
    "data": {
        "input_data": "sales_data.csv",
        "analysis_type": "comprehensive",
        "output_format": "report"
    }
}

# Enviar workflow a la cola
await coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.HIGH)
```

### Ejemplo 2: Comunicación entre Agentes

```python
# Enviar mensaje entre agentes
await state_manager.save_message(
    source_agent="generator",
    target_agent="analyzer",
    message_type="data_request",
    content="Necesito análisis de mercado para producto tech",
    workflow_id="demo_001"
)
```

### Ejemplo 3: Crear Agente Personalizado

```python
from agent_manager import AgentManager, AgentType

# Crear agente personalizado
agent_id = await agent_manager.create_agent(
    agent_type="custom",
    agent_id="marketing_agent",
    custom_config={
        "name": "Agente de Marketing",
        "model": "llama3.1:8b",
        "skills": ["marketing", "branding", "social_media"],
        "system_prompt": "Eres un especialista en marketing digital..."
    }
)
```

## Monitoring y Métricas

### Obtener Estado del Sistema

```python
# Estado general del sistema
system_status = await coordinator.get_status()

# Estado de agentes
agent_status = await agent_manager.get_system_status()

# Métricas de la cola
queue_status = await task_queue.get_queue_status()

# Salud de la base de datos
health_report = await state_manager.get_system_health()
```

### Logs del Sistema

```bash
# Ver logs en tiempo real
tail -f logs/orchestration.log

# Filtrar logs por nivel
grep "ERROR" logs/orchestration.log
grep "SUCCESS" logs/orchestration.log
```

## Workflows Predefinidos

### 1. Análisis de Datos

```
Inicialización → Extracción de Datos → Análisis → Generación de Reporte → Finalización
```

**Casos de uso:**
- Análisis de ventas
- Reportes de negocio
- Análisis de tendencias

### 2. Generación de Código

```
Inicialización → Análisis de Requisitos → Generación → Testing → Optimización → Finalización
```

**Casos de uso:**
- Desarrollo de APIs
- Creación de scripts
- Generación de tests

### 3. Procesamiento de Documentos

```
Inicialización → Parseado → Análisis de Contenido → Transformación → Generación de Salida → Finalización
```

**Casos de uso:**
- Conversión de formatos
- Extracción de información
- Resúmenes automáticos

## Gestión de Modelos

### Instalar Modelos

```bash
# Instalar modelo específico
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull codellama:7b

# Ver modelos instalados
ollama list

# Probar modelo
ollama run llama3.1:8b
```

### Modelos Recomendados

| Modelo | Tamaño | Uso Recomendado |
|--------|--------|-----------------|
| llama3.1:8b | ~4.7GB | Propósito general |
| mistral:7b | ~4.1GB | Eficiente, multilingüe |
| codellama:7b | ~3.8GB | Programación |
| phi3:mini | ~2.3GB | Tareas ligeras |

## Resolución de Problemas

### Problemas Comunes

1. **Ollama no responde**
   ```bash
   # Verificar estado
   curl http://localhost:11434/api/tags
   
   # Reiniciar servicio
   pkill ollama
   ollama serve
   ```

2. **Modelos no cargan**
   ```bash
   # Verificar espacio en disco
   df -h
   
   # Limpiar modelos antiguos
   ollama rm modelo_antiguo
   ```

3. **Errores de base de datos**
   ```bash
   # Backup y reparación
   cp data/orchestration_state.db data/backup.db
   python -c "import sqlite3; conn = sqlite3.connect('data/orchestration_state.db'); conn.execute('PRAGMA integrity_check');"
   ```

### Logs de Depuración

```python
# Habilitar logging detallado
import logging
logging.getLogger('orchestration').setLevel(logging.DEBUG)

# Verificar configuración
print(coordinator.config)
print(agent_manager.system_metrics)
```

## API de Python

### Uso Básico

```python
import asyncio
from start_system import OrchestrationSystem

async def main():
    system = OrchestrationSystem()
    await system.initialize()
    
    # Ejecutar ejemplo
    await system.run_example("analysis")
    
    await system.shutdown()

asyncio.run(main())
```

### Métodos Principales

- `initialize()`: Inicializa todos los componentes
- `start()`: Inicia el sistema completo
- `install_models()`: Instala modelos específicos
- `run_example()`: Ejecuta ejemplos predefinidos
- `shutdown()`: Cierra el sistema de forma segura

## Extensibilidad

### Crear Workflow Personalizado

```python
from langgraph_coordinator import LangGraphCoordinator

# Crear workflow personalizado
def create_custom_workflow():
    graph = StateGraph(CustomState)
    
    # Agregar nodos
    graph.add_node("custom_step_1", custom_step_1_function)
    graph.add_node("custom_step_2", custom_step_2_function)
    
    # Definir flujo
    graph.set_entry_point("custom_step_1")
    graph.add_edge("custom_step_1", "custom_step_2")
    graph.add_edge("custom_step_2", END)
    
    return graph
```

### Crear Agente Especializado

```python
from agent_manager import Agent, AgentConfig, AgentType

# Configurar agente especializado
config = AgentConfig(
    agent_id="specialist_001",
    name="Especialista en ML",
    agent_type=AgentType.CUSTOM,
    model="llama3.1:8b",
    system_prompt="Eres un experto en machine learning...",
    skills=["ml", "deep_learning", "nlp"],
    capabilities=["model_training", "feature_engineering"]
)

agent = Agent(config)
```

## Rendimiento y Optimización

### Configuración de Rendimiento

```yaml
# coordination_config.yaml
performance:
  max_concurrent_agents: 10
  agent_timeout: 300
  memory_limit_mb: 2048
  cache_enabled: true
```

### Monitoreo de Recursos

```python
# Verificar uso de memoria
import psutil
memory_usage = psutil.virtual_memory()
print(f"Memoria usada: {memory_usage.percent}%")

# Verificar CPU
cpu_usage = psutil.cpu_percent()
print(f"CPU usado: {cpu_usage}%")
```

## Seguridad

### Configuración Segura

- Usar modelos verificados
- Validar entrada de usuarios
- Limitar acceso a archivos del sistema
- Monitorear uso de recursos

### Backup de Datos

```bash
# Crear backup manual
cp -r data/ backups/backup_$(date +%Y%m%d_%H%M%S)/

# Restaurar desde backup
cp -r backups/backup_20241206_120000/* data/
```

## Soporte y Contribuciones

### Reportar Problemas

1. Verificar logs del sistema
2. Reproducir el problema
3. Documentar pasos para reproducir
4. Incluir información del sistema

### Mejoras y Contribuciones

- Fork del repositorio
- Crear rama para feature
- Implementar cambios
- Agregar tests
- Enviar pull request

## Referencia de APIs

### OllamaManager

```python
await ollama_manager.install_model("llama3.1:8b")
response = await ollama_manager.generate(
    model="llama3.1:8b",
    prompt="¿Qué es la inteligencia artificial?",
    temperature=0.7
)
```

### TaskQueue

```python
task_id = await task_queue.submit_task(
    task_type=TaskType.AGENT_TASK,
    payload={"instruction": "analizar datos"},
    agent_id="analyzer_001"
)
```

### StateManager

```python
await state_manager.save_agent_state(agent_id, agent_data)
agent_data = await state_manager.load_agent_state(agent_id)
```

Para más información detallada, consulta los archivos de código fuente y la documentación de cada módulo.
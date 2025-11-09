# Sistema de Coordinación Local con Ollama y LangGraph

Este sistema implementa una arquitectura de orquestación local utilizando Ollama para ejecutar modelos LLM y LangGraph para la coordinación de agentes.

## Estructura del Sistema

- `ollama_manager.py`: Gestión de modelos Ollama
- `langgraph_coordinator.py`: Coordinador principal con LangGraph
- `task_queue.py`: Sistema de colas de trabajo
- `agent_manager.py`: Gestión de agentes
- `state_manager.py`: Manejo de estado y persistencia
- `start_system.py`: Script de inicio principal
- `requirements.txt`: Dependencias del sistema
- `config/`: Archivos de configuración
- `examples/`: Ejemplos de workflows
- `logs/`: Logs del sistema

## Instalación

1. Instalar dependencias: `pip install -r requirements.txt`
2. Ejecutar script de inicio: `python start_system.py`

## Modelos Soportados

- Llama 3.1 (8B, 70B)
- Mistral (7B, 8x7B)
- CodeLlama
- Phi-3

## Workflows de Ejemplo

- Agente de análisis de datos
- Agente de generación de código
- Agente de procesamiento de documentos
- Pipeline de análisis multi-agente
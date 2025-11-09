"""
Coordinador principal con LangGraph
Maneja la orquestación y coordinación de agentes
"""

import asyncio
import json
from typing import Dict, List, Optional, Any, AsyncGenerator
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, asdict

from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from loguru import logger
import yaml

from state_manager import StateManager
from task_queue import TaskQueue

class AgentStatus(Enum):
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    OFFLINE = "offline"

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class AgentState:
    """Estado de un agente"""
    agent_id: str
    name: str
    status: AgentStatus
    current_task: Optional[str]
    skills: List[str]
    model: str
    last_activity: datetime
    performance_metrics: Dict[str, float]
    config: Dict[str, Any]

@dataclass
class WorkflowState:
    """Estado del workflow en ejecución"""
    workflow_id: str
    name: str
    status: TaskStatus
    current_step: str
    agents: List[str]
    context: Dict[str, Any]
    results: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

@dataclass
class CoordinationContext:
    """Contexto de coordinación"""
    workflow_id: str
    task_id: str
    agent_id: str
    step: str
    data: Dict[str, Any]
    timestamp: datetime

class LangGraphCoordinator:
    def __init__(self, 
                 ollama_manager,
                 state_manager: StateManager,
                 task_queue: TaskQueue,
                 config_path: str = "config/coordination_config.yaml"):
        self.ollama_manager = ollama_manager
        self.state_manager = state_manager
        self.task_queue = task_queue
        self.config_path = config_path
        
        # Agentes activos
        self.active_agents: Dict[str, AgentState] = {}
        self.agent_models: Dict[str, ChatOllama] = {}
        
        # Workflows en ejecución
        self.active_workflows: Dict[str, WorkflowState] = {}
        
        # Gráfico de LangGraph
        self.graph = None
        self.workflow_graphs: Dict[str, StateGraph] = {}
        
        # Configuración
        self.config = {}
        
        # Métricas
        self.metrics = {
            "total_workflows": 0,
            "completed_workflows": 0,
            "failed_workflows": 0,
            "average_execution_time": 0.0,
            "active_agents": 0
        }

    async def initialize(self):
        """Inicializa el coordinador"""
        try:
            # Cargar configuración
            await self._load_config()
            
            # Crear modelo base
            base_model = self.config.get("default_model", "llama3.1:8b")
            await self._initialize_base_model(base_model)
            
            # Crear agente coordinador
            await self._create_coordinator_agent()
            
            # Configurar workflow graphs
            await self._initialize_workflow_graphs()
            
            logger.info("LangGraph Coordinator inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando coordinador: {e}")
            raise

    async def _load_config(self):
        """Carga la configuración del coordinador"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f)
        except FileNotFoundError:
            logger.warning(f"Archivo de configuración no encontrado: {self.config_path}")
            self.config = self._get_default_config()
        except Exception as e:
            logger.error(f"Error cargando configuración: {e}")
            self.config = self._get_default_config()

    def _get_default_config(self) -> Dict:
        """Configuración por defecto"""
        return {
            "default_model": "llama3.1:8b",
            "coordination": {
                "max_concurrent_workflows": 5,
                "agent_timeout": 300,
                "workflow_timeout": 1800
            },
            "agents": {
                "coordinator": {
                    "model": "llama3.1:8b",
                    "system_prompt": "Eres un coordinador inteligente que gestiona workflows de agentes."
                },
                "analyzer": {
                    "model": "mistral:7b",
                    "system_prompt": "Eres un agente especializado en análisis de datos y documentos."
                },
                "generator": {
                    "model": "llama3.1:8b",
                    "system_prompt": "Eres un agente especializado en generación de contenido."
                },
                "code_executor": {
                    "model": "codellama:7b",
                    "system_prompt": "Eres un agente especializado en programación y ejecución de código."
                }
            }
        }

    async def _initialize_base_model(self, model_name: str):
        """Inicializa el modelo base"""
        try:
            # Asegurar que el modelo esté disponible
            await self.ollama_manager.install_model(model_name)
            
            # Crear instancia de ChatOllama
            self.base_model = ChatOllama(
                model=model_name,
                base_url=self.ollama_manager.base_url,
                temperature=0.7
            )
            
            logger.info(f"Modelo base inicializado: {model_name}")
            
        except Exception as e:
            logger.error(f"Error inicializando modelo base: {e}")
            raise

    async def _create_coordinator_agent(self):
        """Crea el agente coordinador"""
        try:
            coordinator_config = self.config["agents"]["coordinator"]
            model_name = coordinator_config["model"]
            system_prompt = coordinator_config["system_prompt"]
            
            # Instalar modelo si es necesario
            await self.ollama_manager.install_model(model_name)
            
            # Crear modelo específico del coordinador
            coordinator_model = ChatOllama(
                model=model_name,
                base_url=self.ollama_manager.base_url,
                temperature=0.3
            )
            
            # Crear agente coordinador
            coordinator_state = AgentState(
                agent_id="coordinator",
                name="Coordinador Principal",
                status=AgentStatus.IDLE,
                current_task=None,
                skills=["coordinacion", "planificacion", "monitorizacion"],
                model=model_name,
                last_activity=datetime.now(),
                performance_metrics={},
                config={"system_prompt": system_prompt}
            )
            
            self.active_agents["coordinator"] = coordinator_state
            self.agent_models["coordinator"] = coordinator_model
            
            logger.info("Agente coordinador creado")
            
        except Exception as e:
            logger.error(f"Error creando agente coordinador: {e}")
            raise

    async def _initialize_workflow_graphs(self):
        """Inicializa los gráficos de workflow"""
        try:
            # Workflow básico de análisis
            analysis_graph = self._create_analysis_workflow()
            self.workflow_graphs["analysis"] = analysis_graph
            
            # Workflow de generación de código
            code_gen_graph = self._create_code_generation_workflow()
            self.workflow_graphs["code_generation"] = code_gen_graph
            
            # Workflow de procesamiento de documentos
            doc_process_graph = self._create_document_processing_workflow()
            self.workflow_graphs["document_processing"] = doc_process_graph
            
            logger.info("Gráficos de workflow inicializados")
            
        except Exception as e:
            logger.error(f"Error inicializando gráficos de workflow: {e}")
            raise

    def _create_analysis_workflow(self) -> StateGraph:
        """Crea el workflow de análisis"""
        graph = StateGraph(WorkflowState)
        
        # Nodos
        graph.add_node("initialize", self._analyze_initialize)
        graph.add_node("data_extraction", self._extract_data)
        graph.add_node("data_analysis", self._analyze_data)
        graph.add_node("generate_report", self._generate_report)
        graph.add_node("finalize", self._finalize_workflow)
        
        # Flujo
        graph.set_entry_point("initialize")
        graph.add_edge("initialize", "data_extraction")
        graph.add_edge("data_extraction", "data_analysis")
        graph.add_edge("data_analysis", "generate_report")
        graph.add_edge("generate_report", "finalize")
        graph.add_edge("finalize", END)
        
        return graph

    def _create_code_generation_workflow(self) -> StateGraph:
        """Crea el workflow de generación de código"""
        graph = StateGraph(WorkflowState)
        
        graph.add_node("initialize", self._code_initialize)
        graph.add_node("requirement_analysis", self._analyze_requirements)
        graph.add_node("code_generation", self._generate_code)
        graph.add_node("testing", self._test_code)
        graph.add_node("optimization", self._optimize_code)
        graph.add_node("finalize", self._finalize_workflow)
        
        graph.set_entry_point("initialize")
        graph.add_edge("initialize", "requirement_analysis")
        graph.add_edge("requirement_analysis", "code_generation")
        graph.add_edge("code_generation", "testing")
        graph.add_edge("testing", "optimization")
        graph.add_edge("optimization", "finalize")
        graph.add_edge("finalize", END)
        
        return graph

    def _create_document_processing_workflow(self) -> StateGraph:
        """Crea el workflow de procesamiento de documentos"""
        graph = StateGraph(WorkflowState)
        
        graph.add_node("initialize", self._doc_initialize)
        graph.add_node("document_parsing", self._parse_document)
        graph.add_node("content_analysis", self._analyze_content)
        graph.add_node("transformation", self._transform_content)
        graph.add_node("output_generation", self._generate_output)
        graph.add_node("finalize", self._finalize_workflow)
        
        graph.set_entry_point("initialize")
        graph.add_edge("initialize", "document_parsing")
        graph.add_edge("document_parsing", "content_analysis")
        graph.add_edge("content_analysis", "transformation")
        graph.add_edge("transformation", "output_generation")
        graph.add_edge("output_generation", "finalize")
        graph.add_edge("finalize", END)
        
        return graph

    async def start_coordination(self):
        """Inicia la coordinación de agentes"""
        logger.info("Iniciando coordinación de agentes...")
        
        # Iniciar listeners de colas de tareas
        await self.task_queue.start_listener(self._process_task_queue)
        
        # Iniciar monitor de workflows
        asyncio.create_task(self._monitor_workflows())
        
        logger.info("Coordinación de agentes iniciada")

    async def _process_task_queue(self, task: Dict):
        """Procesa tareas de la cola"""
        try:
            task_type = task.get("type")
            task_data = task.get("data", {})
            
            if task_type == "new_workflow":
                await self._start_workflow(task_data)
            elif task_type == "agent_task":
                await self._execute_agent_task(task_data)
            elif task_type == "system_monitoring":
                await self._system_monitoring(task_data)
                
        except Exception as e:
            logger.error(f"Error procesando tarea: {e}")

    async def _start_workflow(self, workflow_config: Dict):
        """Inicia un nuevo workflow"""
        try:
            workflow_id = workflow_config.get("workflow_id")
            workflow_type = workflow_config.get("type")
            workflow_data = workflow_config.get("data", {})
            
            if workflow_type not in self.workflow_graphs:
                raise ValueError(f"Tipo de workflow no soportado: {workflow_type}")
            
            # Crear estado del workflow
            workflow_state = WorkflowState(
                workflow_id=workflow_id,
                name=workflow_config.get("name", f"Workflow {workflow_id}"),
                status=TaskStatus.RUNNING,
                current_step="initialize",
                agents=[],  # Se asignarán dinámicamente
                context=workflow_data,
                results={},
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            self.active_workflows[workflow_id] = workflow_state
            
            # Ejecutar workflow
            graph = self.workflow_graphs[workflow_type]
            try:
                final_state = await graph.ainvoke(workflow_state)
                workflow_state.status = TaskStatus.COMPLETED
                logger.success(f"Workflow {workflow_id} completado")
                
            except Exception as e:
                workflow_state.status = TaskStatus.FAILED
                logger.error(f"Error ejecutando workflow {workflow_id}: {e}")
            
            # Actualizar métricas
            self.metrics["total_workflows"] += 1
            if workflow_state.status == TaskStatus.COMPLETED:
                self.metrics["completed_workflows"] += 1
            else:
                self.metrics["failed_workflows"] += 1
            
        except Exception as e:
            logger.error(f"Error iniciando workflow: {e}")

    async def _execute_agent_task(self, task_config: Dict):
        """Ejecuta una tarea específica de agente"""
        try:
            agent_id = task_config.get("agent_id")
            task = task_config.get("task")
            context = task_config.get("context", {})
            
            if agent_id not in self.active_agents:
                raise ValueError(f"Agente no encontrado: {agent_id}")
            
            agent = self.active_agents[agent_id]
            agent.status = AgentStatus.BUSY
            agent.current_task = task
            
            # Ejecutar tarea
            result = await self._run_agent_task(agent, task, context)
            
            # Actualizar estado del agente
            agent.status = AgentStatus.IDLE
            agent.current_task = None
            agent.last_activity = datetime.now()
            
            # Enviar resultado
            await self.task_queue.submit_result(task_config.get("task_id"), result)
            
        except Exception as e:
            logger.error(f"Error ejecutando tarea de agente: {e}")
            if agent_id in self.active_agents:
                self.active_agents[agent_id].status = AgentStatus.ERROR

    async def _run_agent_task(self, agent: AgentState, task: str, context: Dict) -> Dict:
        """Ejecuta una tarea específica en un agente"""
        try:
            # Obtener modelo del agente
            model = self.agent_models[agent.agent_id]
            
            # Crear prompt
            system_prompt = agent.config.get("system_prompt", "")
            full_prompt = f"{system_prompt}\n\nTarea: {task}\nContexto: {json.dumps(context, indent=2)}"
            
            # Ejecutar modelo
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=task)
            ]
            
            response = await model.ainvoke(messages)
            
            return {
                "agent_id": agent.agent_id,
                "task": task,
                "result": response.content,
                "success": True,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error ejecutando tarea: {e}")
            return {
                "agent_id": agent.agent_id,
                "task": task,
                "result": f"Error: {str(e)}",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }

    async def _monitor_workflows(self):
        """Monitorea workflows en ejecución"""
        while True:
            try:
                await self._check_workflow_health()
                await self._cleanup_completed_workflows()
                await self._update_metrics()
                await asyncio.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"Error en monitoreo de workflows: {e}")
                await asyncio.sleep(30)

    async def _check_workflow_health(self):
        """Verifica la salud de los workflows"""
        current_time = datetime.now()
        
        for workflow_id, workflow in list(self.active_workflows.items()):
            if workflow.status == TaskStatus.RUNNING:
                # Verificar timeout
                elapsed = (current_time - workflow.updated_at).total_seconds()
                timeout = self.config.get("coordination", {}).get("workflow_timeout", 1800)
                
                if elapsed > timeout:
                    workflow.status = TaskStatus.FAILED
                    logger.warning(f"Workflow {workflow_id} terminado por timeout")

    async def _cleanup_completed_workflows(self):
        """Limpia workflows completados"""
        completed_workflows = []
        
        for workflow_id, workflow in self.active_workflows.items():
            if workflow.status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
                completed_workflows.append(workflow_id)
        
        for workflow_id in completed_workflows:
            await self._persist_workflow_results(workflow_id)
            del self.active_workflows[workflow_id]
            logger.info(f"Workflow {workflow_id} limpiado")

    async def _persist_workflow_results(self, workflow_id: str):
        """Persiste los resultados del workflow"""
        try:
            workflow = self.active_workflows[workflow_id]
            await self.state_manager.save_workflow_state(workflow_id, asdict(workflow))
        except Exception as e:
            logger.error(f"Error persistiendo resultados del workflow: {e}")

    async def _update_metrics(self):
        """Actualiza métricas del sistema"""
        try:
            self.metrics["active_agents"] = len([
                agent for agent in self.active_agents.values()
                if agent.status == AgentStatus.BUSY
            ])
            
            # Calcular tiempo promedio de ejecución
            total_workflows = self.metrics["total_workflows"]
            if total_workflows > 0:
                completed = self.metrics["completed_workflows"]
                if completed > 0:
                    # Esta es una métrica simplificada
                    self.metrics["average_execution_time"] = 120.0  # Placeholder
                    
        except Exception as e:
            logger.error(f"Error actualizando métricas: {e}")

    # Métodos de nodos de workflow
    async def _analyze_initialize(self, state: WorkflowState) -> WorkflowState:
        """Nodo de inicialización del análisis"""
        logger.info(f"Iniciando análisis para workflow {state.workflow_id}")
        state.current_step = "data_extraction"
        state.updated_at = datetime.now()
        return state

    async def _extract_data(self, state: WorkflowState) -> WorkflowState:
        """Nodo de extracción de datos"""
        # Implementar extracción de datos
        state.current_step = "data_analysis"
        state.updated_at = datetime.now()
        return state

    async def _analyze_data(self, state: WorkflowState) -> WorkflowState:
        """Nodo de análisis de datos"""
        # Implementar análisis de datos
        state.current_step = "generate_report"
        state.updated_at = datetime.now()
        return state

    async def _generate_report(self, state: WorkflowState) -> WorkflowState:
        """Nodo de generación de reportes"""
        # Implementar generación de reportes
        state.current_step = "finalize"
        state.updated_at = datetime.now()
        return state

    async def _code_initialize(self, state: WorkflowState) -> WorkflowState:
        """Nodo de inicialización de generación de código"""
        logger.info(f"Iniciando generación de código para workflow {state.workflow_id}")
        state.current_step = "requirement_analysis"
        state.updated_at = datetime.now()
        return state

    async def _analyze_requirements(self, state: WorkflowState) -> WorkflowState:
        """Nodo de análisis de requisitos"""
        state.current_step = "code_generation"
        state.updated_at = datetime.now()
        return state

    async def _generate_code(self, state: WorkflowState) -> WorkflowState:
        """Nodo de generación de código"""
        state.current_step = "testing"
        state.updated_at = datetime.now()
        return state

    async def _test_code(self, state: WorkflowState) -> WorkflowState:
        """Nodo de testing de código"""
        state.current_step = "optimization"
        state.updated_at = datetime.now()
        return state

    async def _optimize_code(self, state: WorkflowState) -> WorkflowState:
        """Nodo de optimización de código"""
        state.current_step = "finalize"
        state.updated_at = datetime.now()
        return state

    async def _doc_initialize(self, state: WorkflowState) -> WorkflowState:
        """Nodo de inicialización de procesamiento de documentos"""
        logger.info(f"Iniciando procesamiento de documentos para workflow {state.workflow_id}")
        state.current_step = "document_parsing"
        state.updated_at = datetime.now()
        return state

    async def _parse_document(self, state: WorkflowState) -> WorkflowState:
        """Nodo de parsing de documentos"""
        state.current_step = "content_analysis"
        state.updated_at = datetime.now()
        return state

    async def _analyze_content(self, state: WorkflowState) -> WorkflowState:
        """Nodo de análisis de contenido"""
        state.current_step = "transformation"
        state.updated_at = datetime.now()
        return state

    async def _transform_content(self, state: WorkflowState) -> WorkflowState:
        """Nodo de transformación de contenido"""
        state.current_step = "output_generation"
        state.updated_at = datetime.now()
        return state

    async def _generate_output(self, state: WorkflowState) -> WorkflowState:
        """Nodo de generación de salida"""
        state.current_step = "finalize"
        state.updated_at = datetime.now()
        return state

    async def _finalize_workflow(self, state: WorkflowState) -> WorkflowState:
        """Nodo final del workflow"""
        logger.info(f"Finalizando workflow {state.workflow_id}")
        state.status = TaskStatus.COMPLETED
        state.updated_at = datetime.now()
        return state

    async def _system_monitoring(self, config: Dict):
        """Tarea de monitoreo del sistema"""
        try:
            # Recopilar métricas del sistema
            metrics = await self._collect_system_metrics()
            await self.state_manager.save_system_metrics(metrics)
            
        except Exception as e:
            logger.error(f"Error en monitoreo del sistema: {e}")

    async def _collect_system_metrics(self) -> Dict:
        """Recopila métricas del sistema"""
        return {
            "timestamp": datetime.now().isoformat(),
            "active_agents": len(self.active_agents),
            "active_workflows": len(self.active_workflows),
            "metrics": self.metrics
        }

    async def run_workflow_example(self, example_name: str):
        """Ejecuta un ejemplo de workflow"""
        try:
            if example_name == "analysis":
                await self._run_analysis_example()
            elif example_name == "code_generation":
                await self._run_code_generation_example()
            elif example_name == "document_processing":
                await self._run_document_processing_example()
            else:
                logger.error(f"Ejemplo desconocido: {example_name}")
                
        except Exception as e:
            logger.error(f"Error ejecutando ejemplo: {e}")

    async def _run_analysis_example(self):
        """Ejecuta ejemplo de análisis"""
        workflow_config = {
            "workflow_id": "example_analysis_001",
            "name": "Análisis de Datos de Ejemplo",
            "type": "analysis",
            "data": {
                "input_data": "Datos de muestra para análisis",
                "analysis_type": "descriptivo"
            }
        }
        
        await self._start_workflow(workflow_config)
        logger.info("Ejemplo de análisis iniciado")

    async def _run_code_generation_example(self):
        """Ejecuta ejemplo de generación de código"""
        workflow_config = {
            "workflow_id": "example_codegen_001",
            "name": "Generación de Código de Ejemplo",
            "type": "code_generation",
            "data": {
                "requirement": "Crear una función que calcule Fibonacci",
                "language": "python",
                "style": "functional"
            }
        }
        
        await self._start_workflow(workflow_config)
        logger.info("Ejemplo de generación de código iniciado")

    async def _run_document_processing_example(self):
        """Ejecuta ejemplo de procesamiento de documentos"""
        workflow_config = {
            "workflow_id": "example_doc_001",
            "name": "Procesamiento de Documento de Ejemplo",
            "type": "document_processing",
            "data": {
                "document_type": "markdown",
                "processing_tasks": ["resumir", "extraer_puntos_clave"],
                "output_format": "html"
            }
        }
        
        await self._start_workflow(workflow_config)
        logger.info("Ejemplo de procesamiento de documentos iniciado")

    async def shutdown(self):
        """Cierra el coordinador"""
        logger.info("Cerrando LangGraph Coordinator...")
        
        # Cerrar tareas activas
        for agent in self.active_agents.values():
            agent.status = AgentStatus.OFFLINE
        
        logger.info("LangGraph Coordinator cerrado")

    async def get_status(self) -> Dict:
        """Obtiene el estado del coordinador"""
        return {
            "active_agents": len(self.active_agents),
            "active_workflows": len(self.active_workflows),
            "metrics": self.metrics,
            "workflow_types": list(self.workflow_graphs.keys())
        }
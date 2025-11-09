"""
Ejemplos de workflows para el sistema de coordinación
Demuestra las capacidades del sistema con ejemplos prácticos
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path

from loguru import logger
from langgraph_coordinator import LangGraphCoordinator
from task_queue import TaskPriority

class WorkflowExamples:
    """Clase que contiene ejemplos de workflows"""
    
    def __init__(self, coordinator: LangGraphCoordinator):
        self.coordinator = coordinator
        
    async def run_data_analysis_workflow(self):
        """Ejecuta un workflow completo de análisis de datos"""
        logger.info("Iniciando workflow de análisis de datos...")
        
        workflow_config = {
            "workflow_id": "analysis_001",
            "name": "Análisis de Datos de Ventas",
            "type": "analysis",
            "data": {
                "input_source": "sales_data.csv",
                "analysis_type": "comprehensive",
                "output_format": "report",
                "requirements": [
                    "Análisis descriptivo",
                    "Identificación de tendencias",
                    "Predicciones de ventas",
                    "Recomendaciones estratégicas"
                ],
                "data_quality_check": True,
                "visualization": True
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.HIGH)
        logger.success("Workflow de análisis de datos iniciado")
    
    async def run_code_generation_workflow(self):
        """Ejecuta un workflow de generación de código"""
        logger.info("Iniciando workflow de generación de código...")
        
        workflow_config = {
            "workflow_id": "code_gen_001",
            "name": "Generador de API REST",
            "type": "code_generation",
            "data": {
                "requirement": "Crear una API REST completa para gestión de usuarios",
                "language": "python",
                "framework": "fastapi",
                "features": [
                    "CRUD de usuarios",
                    "Autenticación JWT",
                    "Validación de datos",
                    "Documentación automática",
                    "Tests unitarios"
                ],
                "style": "clean_code",
                "documentation": "detailed",
                "testing": "comprehensive"
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.NORMAL)
        logger.success("Workflow de generación de código iniciado")
    
    async def run_document_processing_workflow(self):
        """Ejecuta un workflow de procesamiento de documentos"""
        logger.info("Iniciando workflow de procesamiento de documentos...")
        
        workflow_config = {
            "workflow_id": "doc_proc_001",
            "name": "Procesador de Informes Técnicos",
            "type": "document_processing",
            "data": {
                "input_document": "technical_report.md",
                "processing_tasks": [
                    "Extracción de resumen ejecutivo",
                    "Identificación de puntos clave",
                    "Generación de conclusiones",
                    "Creación de presentación",
                    "Traducción a diferentes idiomas"
                ],
                "output_formats": ["html", "pdf", "pptx"],
                "language": "es",
                "target_audience": "ejecutivos",
                "tone": "profesional"
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.NORMAL)
        logger.success("Workflow de procesamiento de documentos iniciado")
    
    async def run_research_workflow(self):
        """Ejecuta un workflow de investigación"""
        logger.info("Iniciando workflow de investigación...")
        
        workflow_config = {
            "workflow_id": "research_001",
            "name": "Investigación sobre IA en Healthcare",
            "type": "custom",
            "data": {
                "topic": "Inteligencia Artificial en el sector salud",
                "research_questions": [
                    "¿Cuáles son las principales aplicaciones de IA en healthcare?",
                    "¿Qué beneficios ofrece la IA en diagnóstico médico?",
                    "¿Cuáles son los desafíos éticos y regulatorios?",
                    "¿Qué tendencias se esperan para los próximos 5 años?"
                ],
                "search_strategies": [
                    "búsqueda académica",
                    "análisis de patentes",
                    "estudio de casos",
                    "encuestas a expertos"
                ],
                "output_requirements": [
                    "revisión bibliográfica",
                    "análisis comparativo",
                    "recomendaciones",
                    "plan de implementación"
                ],
                "deadline": "2 semanas"
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.NORMAL)
        logger.success("Workflow de investigación iniciado")
    
    async def run_multi_agent_workflow(self):
        """Ejecuta un workflow que involucra múltiples agentes"""
        logger.info("Iniciando workflow multi-agente...")
        
        workflow_config = {
            "workflow_id": "multi_agent_001",
            "name": "Análisis y Generación de Contenido de Marketing",
            "type": "custom",
            "data": {
                "objective": "Crear campaña de marketing para producto tech",
                "product": {
                    "name": "SmartHome AI Assistant",
                    "category": "IoT/AI",
                    "target_market": "familias tech-savvy",
                    "price_range": "premium"
                },
                "workflow_steps": [
                    {
                        "step": "market_research",
                        "agent": "researcher",
                        "task": "Analizar competencia y tendencias del mercado"
                    },
                    {
                        "step": "content_strategy",
                        "agent": "coordinator",
                        "task": "Definir estrategia de contenido"
                    },
                    {
                        "step": "content_creation",
                        "agent": "generator",
                        "task": "Crear contenido para diferentes canales"
                    },
                    {
                        "step": "code_implementation",
                        "agent": "code_executor",
                        "task": "Desarrollar landing page y herramientas"
                    },
                    {
                        "step": "analysis",
                        "agent": "analyzer",
                        "task": "Analizar métricas y optimizar contenido"
                    }
                ],
                "deliverables": [
                    "análisis de mercado",
                    "estrategia de contenido",
                    "materiales de marketing",
                    "herramientas web",
                    "reporte de métricas"
                ]
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.HIGH)
        logger.success("Workflow multi-agente iniciado")
    
    async def run_automated_testing_workflow(self):
        """Ejecuta un workflow de testing automatizado"""
        logger.info("Iniciando workflow de testing automatizado...")
        
        workflow_config = {
            "workflow_id": "testing_001",
            "name": "Testing Completo de Aplicación Web",
            "type": "custom",
            "data": {
                "application": {
                    "url": "https://myapp.example.com",
                    "type": "web_app",
                    "technology": "react/nodejs"
                },
                "testing_scope": [
                    "functional_testing",
                    "performance_testing",
                    "security_testing",
                    "usability_testing",
                    "accessibility_testing"
                ],
                "test_cases": [
                    "user_registration",
                    "login_logout",
                    "data_manipulation",
                    "error_handling",
                    "responsive_design"
                ],
                "automation_tools": [
                    "selenium",
                    "playwright",
                    "lighthouse",
                    "owasp_zap"
                ],
                "reporting": {
                    "format": "comprehensive",
                    "include_screenshots": True,
                    "include_performance_metrics": True,
                    "suggestions": True
                }
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.NORMAL)
        logger.success("Workflow de testing automatizado iniciado")
    
    async def run_data_pipeline_workflow(self):
        """Ejecuta un workflow de pipeline de datos"""
        logger.info("Iniciando workflow de pipeline de datos...")
        
        workflow_config = {
            "workflow_id": "data_pipe_001",
            "name": "Pipeline de ETL para Analytics",
            "type": "custom",
            "data": {
                "data_sources": [
                    "customer_database",
                    "sales_system",
                    "web_analytics",
                    "social_media_api"
                ],
                "pipeline_stages": [
                    {
                        "stage": "extraction",
                        "task": "Extraer datos de múltiples fuentes"
                    },
                    {
                        "stage": "validation",
                        "task": "Validar calidad e integridad de datos"
                    },
                    {
                        "stage": "transformation",
                        "task": "Limpiar y transformar datos"
                    },
                    {
                        "stage": "enrichment",
                        "task": "Enriquecer datos con información adicional"
                    },
                    {
                        "stage": "load",
                        "task": "Cargar datos en warehouse"
                    },
                    {
                        "stage": "analysis",
                        "task": "Generar dashboards y reportes"
                    }
                ],
                "data_quality": {
                    "check_duplicates": True,
                    "validate_formats": True,
                    "check_completeness": True,
                    "outlier_detection": True
                },
                "output": {
                    "warehouse": "snowflake",
                    "dashboards": ["executive", "operational", "marketing"],
                    "reports": "automated_weekly"
                },
                "monitoring": {
                    "real_time_alerts": True,
                    "performance_tracking": True,
                    "data_lineage": True
                }
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.HIGH)
        logger.success("Workflow de pipeline de datos iniciado")
    
    async def demonstrate_communication_between_agents(self):
        """Demuestra la comunicación entre agentes"""
        logger.info("Demostrando comunicación entre agentes...")
        
        # Paso 1: Generador solicita análisis de datos
        await self.coordinator.state_manager.save_message(
            source_agent="generator",
            target_agent="analyzer",
            message_type="data_request",
            content="Necesito análisis de datos de ventas para crear contenido de marketing",
            workflow_id="demo_001",
            metadata={"priority": "high", "deadline": "2024-01-15"}
        )
        
        # Paso 2: Analizador responde con datos
        await self.coordinator.state_manager.save_message(
            source_agent="analyzer",
            target_agent="generator",
            message_type="data_response",
            content="Análisis completado. Datos muestran crecimiento del 25% en Q4",
            workflow_id="demo_001",
            metadata={"data_quality": "high", "insights_count": 5}
        )
        
        # Paso 3: Generador solicita código para visualización
        await self.coordinator.state_manager.save_message(
            source_agent="generator",
            target_agent="code_executor",
            message_type="code_request",
            content="Crear dashboard interactivo con los datos de análisis de ventas",
            workflow_id="demo_001",
            metadata={"library": "plotly", "framework": "dash"}
        )
        
        logger.success("Demostración de comunicación completada")
    
    async def run_complex_business_workflow(self):
        """Ejecuta un workflow empresarial complejo"""
        logger.info("Iniciando workflow empresarial complejo...")
        
        workflow_config = {
            "workflow_id": "business_001",
            "name": "Análisis de Competencia y Estrategia de Producto",
            "type": "custom",
            "data": {
                "company": {
                    "name": "TechCorp",
                    "industry": "Software",
                    "current_products": ["Product A", "Product B"],
                    "challenges": ["competencia", "innovación"]
                },
                "objectives": [
                    "analizar competencia",
                    "identificar oportunidades",
                    "definir estrategia de producto",
                    "crear roadmap de desarrollo"
                ],
                "workflow_phases": [
                    {
                        "phase": "market_research",
                        "agents": ["researcher", "analyzer"],
                        "deliverables": ["competitive_analysis", "market_trends"]
                    },
                    {
                        "phase": "product_strategy",
                        "agents": ["coordinator", "generator"],
                        "deliverables": ["strategy_document", "feature_prioritization"]
                    },
                    {
                        "phase": "implementation_plan",
                        "agents": ["code_executor", "generator"],
                        "deliverables": ["technical_roadmap", "prototypes"]
                    }
                ],
                "stakeholders": ["product_team", "engineering", "marketing", "sales"],
                "timeline": "3 meses",
                "success_criteria": [
                    "competitive_analysis_completed",
                    "product_roadmap_defined",
                    "prototypes_delivered",
                    "stakeholder_approval"
                ]
            }
        }
        
        await self.coordinator.task_queue.submit_workflow(workflow_config, TaskPriority.URGENT)
        logger.success("Workflow empresarial complejo iniciado")

async def run_all_examples():
    """Ejecuta todos los ejemplos de workflows"""
    logger.info("=== Iniciando todos los ejemplos de workflows ===")
    
    # Nota: En un escenario real, necesitaríamos pasar el coordinador aquí
    # examples = WorkflowExamples(coordinator)
    
    examples_list = [
        "data_analysis",
        "code_generation", 
        "document_processing",
        "research",
        "multi_agent",
        "automated_testing",
        "data_pipeline",
        "business_workflow"
    ]
    
    logger.info(f"Ejemplos disponibles: {', '.join(examples_list)}")
    logger.info("Usa --example <nombre_ejemplo> para ejecutar uno específico")

if __name__ == "__main__":
    asyncio.run(run_all_examples())
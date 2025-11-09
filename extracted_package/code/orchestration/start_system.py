#!/usr/bin/env python3
"""
Sistema de Coordinación Local con Ollama y LangGraph
Script de inicio principal
"""

import asyncio
import signal
import sys
import argparse
from pathlib import Path

# Agregar el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from ollama_manager import OllamaManager
from langgraph_coordinator import LangGraphCoordinator
from task_queue import TaskQueue
from agent_manager import AgentManager
from state_manager import StateManager
from loguru import logger

class OrchestrationSystem:
    def __init__(self, config_path: str = "config/system_config.yaml"):
        self.config_path = config_path
        self.ollama_manager = None
        self.coordinator = None
        self.task_queue = None
        self.agent_manager = None
        self.state_manager = None
        self.running = False

    async def initialize(self):
        """Inicializa todos los componentes del sistema"""
        try:
            logger.info("Iniciando Sistema de Coordinación Local...")
            
            # 1. Inicializar gestión de estado
            self.state_manager = StateManager()
            await self.state_manager.initialize()
            logger.info("✓ Gestor de estado inicializado")
            
            # 2. Inicializar Ollama
            self.ollama_manager = OllamaManager()
            await self.ollama_manager.initialize()
            logger.info("✓ Gestor Ollama inicializado")
            
            # 3. Inicializar sistema de colas
            self.task_queue = TaskQueue()
            await self.task_queue.initialize()
            logger.info("✓ Sistema de colas inicializado")
            
            # 4. Inicializar coordinador LangGraph
            self.coordinator = LangGraphCoordinator(
                ollama_manager=self.ollama_manager,
                state_manager=self.state_manager,
                task_queue=self.task_queue
            )
            await self.coordinator.initialize()
            logger.info("✓ Coordinador LangGraph inicializado")
            
            # 5. Inicializar gestión de agentes
            self.agent_manager = AgentManager(
                coordinator=self.coordinator,
                ollama_manager=self.ollama_manager,
                task_queue=self.task_queue,
                state_manager=self.state_manager
            )
            await self.agent_manager.initialize()
            logger.info("✓ Gestor de agentes inicializado")
            
            logger.success("Sistema de coordinación inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error durante la inicialización: {e}")
            raise

    async def start(self):
        """Inicia el sistema completo"""
        if not self.running:
            await self.initialize()
            self.running = True
            
            # Configurar handlers de señales
            signal.signal(signal.SIGINT, self._signal_handler)
            signal.signal(signal.SIGTERM, self._signal_handler)
            
            logger.info("Sistema iniciado. Presiona Ctrl+C para detener.")
            
            try:
                # Iniciar coordinación de agentes
                await self.coordinator.start_coordination()
                # Mantener el sistema ejecutándose
                while self.running:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                await self.shutdown()

    async def shutdown(self):
        """Cierra el sistema de forma segura"""
        logger.info("Cerrando sistema...")
        self.running = False
        
        if self.agent_manager:
            await self.agent_manager.shutdown()
        if self.coordinator:
            await self.coordinator.shutdown()
        if self.task_queue:
            await self.task_queue.shutdown()
        if self.ollama_manager:
            await self.ollama_manager.shutdown()
        if self.state_manager:
            await self.state_manager.shutdown()
            
        logger.success("Sistema cerrado correctamente")

    def _signal_handler(self, signum, frame):
        """Maneja señales del sistema"""
        logger.info(f"Señal {signum} recibida, cerrando sistema...")
        self.running = False

    async def install_models(self, models: list = None):
        """Instala modelos específicos"""
        if models is None:
            models = ["llama3.1:8b", "mistral:7b", "codellama:7b"]
            
        await self.initialize()
        
        for model in models:
            logger.info(f"Instalando modelo: {model}")
            success = await self.ollama_manager.install_model(model)
            if success:
                logger.success(f"Modelo {model} instalado correctamente")
            else:
                logger.error(f"Error instalando modelo {model}")

    async def run_example(self, example_name: str):
        """Ejecuta un ejemplo específico"""
        await self.initialize()
        await self.coordinator.run_workflow_example(example_name)

async def main():
    parser = argparse.ArgumentParser(description="Sistema de Coordinación Local")
    parser.add_argument("--start", action="store_true", help="Iniciar el sistema")
    parser.add_argument("--install", action="store_true", help="Instalar modelos")
    parser.add_argument("--models", nargs="+", default=[], help="Modelos a instalar")
    parser.add_argument("--example", type=str, help="Ejemplo a ejecutar")
    parser.add_argument("--config", type=str, default="config/system_config.yaml", 
                       help="Ruta del archivo de configuración")
    
    args = parser.parse_args()
    
    system = OrchestrationSystem(config_path=args.config)
    
    if args.start:
        await system.start()
    elif args.install:
        await system.install_models(args.models)
    elif args.example:
        await system.run_example(args.example)
    else:
        parser.print_help()

if __name__ == "__main__":
    asyncio.run(main())
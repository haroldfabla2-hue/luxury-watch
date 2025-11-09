"""
Gestor de Ollama para modelos LLM locales
Maneja instalación, configuración y comunicación con Ollama
"""

import asyncio
import subprocess
import json
import aiohttp
from typing import List, Dict, Optional, AsyncGenerator
from loguru import logger
from dataclasses import dataclass
import time

@dataclass
class ModelInfo:
    """Información sobre un modelo disponible"""
    name: str
    size: str
    family: str
    description: str
    quantization: str
    installed: bool = False

@dataclass
class ModelResponse:
    """Respuesta de un modelo"""
    model: str
    response: str
    tokens: int
    time: float
    context: Optional[str] = None

class OllamaManager:
    def __init__(self, host: str = "localhost", port: int = 11434):
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}"
        self.available_models = {}
        self.installed_models = set()
        self.session = None
        self.max_concurrent_requests = 3
        self.active_requests = 0
        
        # Lista de modelos recomendados
        self.recommended_models = {
            "llama3.1:8b": {
                "family": "llama",
                "size": "8B",
                "description": "Modelo Llama 3.1 de 8B parámetros",
                "use_case": "General purpose, conversación"
            },
            "llama3.1:70b": {
                "family": "llama",
                "size": "70B",
                "description": "Modelo Llama 3.1 de 70B parámetros",
                "use_case": "Tareas complejas, análisis profundo"
            },
            "mistral:7b": {
                "family": "mistral",
                "size": "7B",
                "description": "Modelo Mistral de 7B parámetros",
                "use_case": "Rápido, eficiente, multilingüe"
            },
            "mistral:8x7b": {
                "family": "mistral",
                "size": "8x7B",
                "description": "Modelo Mistral Mixture of Experts",
                "use_case": "Tareas complejas con mejor rendimiento"
            },
            "codellama:7b": {
                "family": "llama",
                "size": "7B",
                "description": "Modelo especializado en código",
                "use_case": "Generación y análisis de código"
            },
            "phi3:mini": {
                "family": "phi",
                "size": "3.8B",
                "description": "Microsoft Phi-3 mini",
                "use_case": "Eficiente, tareas ligeras"
            }
        }

    async def initialize(self):
        """Inicializa la conexión con Ollama"""
        try:
            # Crear sesión HTTP
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
            
            # Verificar conexión con Ollama
            await self._check_ollama_status()
            
            # Cargar modelos instalados
            await self._load_installed_models()
            
            logger.info(f"Ollama Manager inicializado en {self.base_url}")
            
        except Exception as e:
            logger.error(f"Error inicializando Ollama Manager: {e}")
            raise

    async def _check_ollama_status(self):
        """Verifica si Ollama está ejecutándose"""
        try:
            async with self.session.get(f"{self.base_url}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✓ Conexión con Ollama establecida")
                    return True
                else:
                    raise Exception(f"Estado de respuesta: {response.status}")
        except Exception as e:
            logger.error(f"Error conectando con Ollama: {e}")
            logger.error("Asegúrate de que Ollama esté ejecutándose con 'ollama serve'")
            raise

    async def _load_installed_models(self):
        """Carga la lista de modelos instalados"""
        try:
            async with self.session.get(f"{self.base_url}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    models = data.get('models', [])
                    for model in models:
                        self.installed_models.add(model['name'])
                    logger.info(f"Modelos instalados: {list(self.installed_models)}")
        except Exception as e:
            logger.error(f"Error cargando modelos instalados: {e}")

    async def is_ollama_available(self) -> bool:
        """Verifica si Ollama está disponible"""
        try:
            async with self.session.get(f"{self.base_url}/api/tags") as response:
                return response.status == 200
        except:
            return False

    async def install_model(self, model_name: str) -> bool:
        """Instala un modelo específico"""
        try:
            logger.info(f"Iniciando instalación de {model_name}...")
            
            # Verificar si ya está instalado
            if model_name in self.installed_models:
                logger.info(f"Modelo {model_name} ya está instalado")
                return True
            
            # Descargar modelo
            async with self.session.post(
                f"{self.base_url}/api/pull",
                json={"name": model_name, "stream": True}
            ) as response:
                if response.status == 200:
                    async for line in response.content:
                        if line:
                            try:
                                data = json.loads(line.decode().strip())
                                status = data.get('status', '')
                                
                                if status == 'pulling manifest':
                                    logger.info(f"Descargando {model_name}...")
                                elif status == 'pulling分层':
                                    logger.info(f"Descargando capas para {model_name}")
                                elif status == 'writing':
                                    logger.info(f"Escribiendo {model_name}")
                                elif status == 'verifying':
                                    logger.info(f"Verificando {model_name}")
                                elif status == 'success':
                                    logger.success(f"Modelo {model_name} instalado correctamente")
                                    self.installed_models.add(model_name)
                                    return True
                                    
                            except json.JSONDecodeError:
                                continue
                else:
                    logger.error(f"Error descargando modelo: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error instalando modelo {model_name}: {e}")
            return False

    async def install_multiple_models(self, models: List[str]) -> Dict[str, bool]:
        """Instala múltiples modelos en paralelo"""
        results = {}
        tasks = []
        
        for model in models:
            task = asyncio.create_task(self.install_model(model))
            tasks.append((model, task))
        
        # Esperar a que terminen las instalaciones
        for model, task in tasks:
            try:
                success = await task
                results[model] = success
            except Exception as e:
                logger.error(f"Error instalando {model}: {e}")
                results[model] = False
        
        return results

    async def generate(self, 
                      model: str, 
                      prompt: str, 
                      system_prompt: str = None,
                      context: str = None,
                      temperature: float = 0.7,
                      top_k: int = 40,
                      top_p: float = 0.9,
                      max_tokens: int = 512) -> ModelResponse:
        """Genera una respuesta usando un modelo específico"""
        
        # Controlar concurrencia
        while self.active_requests >= self.max_concurrent_requests:
            await asyncio.sleep(0.1)
        
        self.active_requests += 1
        start_time = time.time()
        
        try:
            # Verificar que el modelo esté instalado
            if model not in self.installed_models:
                logger.warning(f"Modelo {model} no está instalado. Intentando instalación...")
                await self.install_model(model)
            
            # Preparar payload
            payload = {
                "model": model,
                "prompt": prompt,
                "options": {
                    "temperature": temperature,
                    "top_k": top_k,
                    "top_p": top_p,
                    "num_predict": max_tokens
                },
                "stream": False
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            if context:
                payload["context"] = context
            
            # Enviar request
            async with self.session.post(
                f"{self.base_url}/api/generate",
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    elapsed_time = time.time() - start_time
                    
                    return ModelResponse(
                        model=model,
                        response=data.get('response', ''),
                        tokens=data.get('eval_count', 0),
                        time=elapsed_time,
                        context=context
                    )
                else:
                    raise Exception(f"Error en respuesta: {response.status}")
                    
        except Exception as e:
            logger.error(f"Error generando respuesta con {model}: {e}")
            raise
        finally:
            self.active_requests -= 1

    async def generate_stream(self, 
                            model: str, 
                            prompt: str,
                            system_prompt: str = None,
                            **kwargs) -> AsyncGenerator[str, None]:
        """Genera respuesta en modo stream"""
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            **kwargs
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/generate",
                json=payload
            ) as response:
                if response.status == 200:
                    async for line in response.content:
                        if line:
                            try:
                                data = json.loads(line.decode().strip())
                                chunk = data.get('response', '')
                                if chunk:
                                    yield chunk
                                    
                                if data.get('done', False):
                                    break
                                    
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            logger.error(f"Error en streaming de {model}: {e}")

    async def list_installed_models(self) -> List[str]:
        """Lista los modelos instalados"""
        return list(self.installed_models)

    async def get_model_info(self, model_name: str) -> Optional[ModelInfo]:
        """Obtiene información detallada de un modelo"""
        try:
            async with self.session.post(
                f"{self.base_url}/api/show",
                json={"name": model_name}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return ModelInfo(
                        name=data['name'],
                        size=data.get('size', 'Unknown'),
                        family=data.get('family', 'Unknown'),
                        description=data.get('description', ''),
                        quantization=data.get('quantization', 'Unknown'),
                        installed=True
                    )
        except Exception as e:
            logger.error(f"Error obteniendo info del modelo {model_name}: {e}")
        
        return None

    async def delete_model(self, model_name: str) -> bool:
        """Elimina un modelo instalado"""
        try:
            async with self.session.delete(
                f"{self.base_url}/api/delete",
                json={"name": model_name}
            ) as response:
                if response.status == 200:
                    self.installed_models.discard(model_name)
                    logger.success(f"Modelo {model_name} eliminado")
                    return True
                else:
                    logger.error(f"Error eliminando modelo: {response.status}")
                    return False
        except Exception as e:
            logger.error(f"Error eliminando modelo {model_name}: {e}")
            return False

    async def get_system_info(self) -> Dict:
        """Obtiene información del sistema Ollama"""
        try:
            async with self.session.get(f"{self.base_url}/api/version") as response:
                if response.status == 200:
                    return await response.json()
        except Exception as e:
            logger.error(f"Error obteniendo info del sistema: {e}")
        return {}

    async def shutdown(self):
        """Cierra la conexión con Ollama"""
        if self.session:
            await self.session.close()
        logger.info("Ollama Manager cerrado")

    async def cleanup_diskspace(self) -> bool:
        """Libera espacio en disco eliminando modelos no utilizados"""
        try:
            # Obtener lista de modelos instalados
            installed = await self.list_installed_models()
            
            # Lista de modelos recomendados para mantener
            keep_models = set(self.recommended_models.keys())
            
            # Eliminar modelos no recomendados
            to_delete = installed - keep_models
            
            success_count = 0
            for model in to_delete:
                if await self.delete_model(model):
                    success_count += 1
            
            logger.info(f"Espacio liberado: {success_count} modelos eliminados")
            return True
            
        except Exception as e:
            logger.error(f"Error limpiando espacio en disco: {e}")
            return False
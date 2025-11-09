"""
Cliente para integración con Gemini 2.0 via OpenRouter.

Maneja la comunicación con la API de Gemini 2.0 Experimental para generar
contenido de metadatos y SEO usando el modelo gemini-pro-exp.
"""

import aiohttp
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import hashlib
import time
from .types import ConfiguracionAgente


class GeminiError(Exception):
    """Excepción específica para errores de Gemini API."""
    pass


class RateLimitError(GeminiError):
    """Error por límite de rate de la API."""
    pass


class GeminiClient:
    """
    Cliente para interactuar con Gemini 2.0 via OpenRouter.
    
    Proporciona métodos para generar metadatos, descripciones SEO
    y contenido optimizado para marketing de componentes de reloj.
    """
    
    def __init__(self, config: ConfiguracionAgente):
        """
        Inicializa el cliente de Gemini.
        
        Args:
            config: Configuración del agente con API keys y parámetros
        """
        self.config = config
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {config.gemini_api_key}",
            "HTTP-Referer": "https://luxurywatch-configurator.com",
            "X-Title": "Agente 6 - Generador de Metadatos SEO",
            "Content-Type": "application/json"
        }
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 60.0 / config.requests_per_minute
        
        # Cache
        self._cache = {}
        self._cache_hits = 0
        self._cache_misses = 0
        
        # Logging
        self.logger = logging.getLogger(__name__)
        if config.enable_verbose_logging:
            self.logger.setLevel(logging.DEBUG)
    
    def _get_cache_key(self, prompt: str, params: Dict[str, Any]) -> str:
        """Genera clave única para cache basada en prompt y parámetros."""
        content = f"{prompt}_{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Verifica si una entrada de cache es válida."""
        if not self.config.enable_cache:
            return False
            
        cache_time = cache_entry.get('timestamp', 0)
        current_time = time.time()
        ttl_seconds = self.config.cache_ttl_hours * 3600
        
        return (current_time - cache_time) < ttl_seconds
    
    async def _make_request(
        self, 
        endpoint: str, 
        data: Dict[str, Any], 
        cache_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Realiza una petición HTTP a la API de OpenRouter.
        
        Args:
            endpoint: Endpoint de la API
            data: Datos para enviar
            cache_key: Clave de cache opcional
            
        Returns:
            Respuesta de la API
            
        Raises:
            GeminiError: Si hay error en la API
            RateLimitError: Si se excede el límite de rate
        """
        # Verificar cache
        if cache_key and cache_key in self._cache:
            if self._is_cache_valid(self._cache[cache_key]):
                self._cache_hits += 1
                self.logger.debug(f"Cache hit para {cache_key}")
                return self._cache[cache_key]['response']
            else:
                self.logger.debug(f"Cache expired para {cache_key}")
        
        self._cache_misses += 1
        
        # Rate limiting
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
        
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=self.headers, json=data) as response:
                    if response.status == 429:
                        raise RateLimitError("Rate limit exceeded")
                    
                    if response.status != 200:
                        error_text = await response.text()
                        self.logger.error(f"API Error {response.status}: {error_text}")
                        raise GeminiError(f"API returned {response.status}: {error_text}")
                    
                    result = await response.json()
                    
                    # Guardar en cache
                    if cache_key and self.config.enable_cache:
                        self._cache[cache_key] = {
                            'response': result,
                            'timestamp': current_time
                        }
                    
                    return result
                    
        except aiohttp.ClientError as e:
            self.logger.error(f"HTTP Error: {e}")
            raise GeminiError(f"HTTP request failed: {e}")
    
    def _build_prompt_metadata_generation(
        self, 
        componente: Dict[str, Any], 
        audiencia: str,
        tipo_descripcion: str
    ) -> str:
        """
        Construye prompt optimizado para generación de metadatos.
        
        Args:
            componente: Información del componente
            audiencia: Audiencia objetivo
            tipo_descripcion: Tipo de descripción a generar
            
        Returns:
            Prompt formateado para Gemini
        """
        return f"""
Eres un experto en marketing de relojes de lujo y SEO. Genera metadatos optimizados 
para el siguiente componente de reloj:

COMPONENTE:
- Tipo: {componente.get('tipo', 'N/A')}
- Nombre: {componente.get('nombre', 'N/A')}
- Material: {componente.get('material_base', 'N/A')}
- Acabado: {componente.get('acabado_superficie', 'N/A')}
- Color: {componente.get('color_principal', 'N/A')}
- Estilo: {', '.join(componente.get('estilo_visual', []))}
- Colección: {componente.get('coleccion', 'N/A')}

AUDIENCIA: {audiencia}
TIPO: {tipo_descripcion}

Genera un JSON con:
{{
  "titulo_seo": "Título optimizado para SEO (60 caracteres max)",
  "descripcion_seo": "Descripción para meta tags (155 caracteres max)",
  "keywords_primarias": ["keyword1", "keyword2"],
  "keywords_secundarias": ["keyword3", "keyword4"],
  "long_tail_keywords": ["frase keyword específica 1", "frase keyword específica 2"],
  "descripcion_{audiencia}": "Descripción atractiva para {audiencia} (200-300 palabras)",
  "puntos_clave": ["Característica 1", "Característica 2", "Característica 3"],
  "call_to_action": "Frase de llamada a la acción",
  "alt_text": "Texto alternativo para imagen 3D",
  "hashtags": ["#reloj", "#lujo", "#mecanismo"],
  "social_media_caption": "Caption para redes sociales"
}}

Enfócate en:
1. Palabras clave relevantes para relojes de lujo
2. Beneficios emocionales y técnicos
3. Atributos únicos del componente
4. Tono apropiado para la audiencia
5. Optimización para buscadores
6. Llamadas a la acción efectivas

Responde SOLO con el JSON, sin explicaciones adicionales.
"""
    
    def _build_prompt_json_ld_generation(
        self, 
        componente: Dict[str, Any]
    ) -> str:
        """
        Construye prompt para generación de JSON-LD.
        
        Args:
            componente: Información del componente
            
        Returns:
            Prompt formateado para JSON-LD
        """
        return f"""
Genera un JSON-LD estructurado para Schema.org para este componente de reloj:

COMPONENTE:
{json.dumps(componente, indent=2, ensure_ascii=False)}

Genera un JSON-LD completo que incluya:
- @context: "https://schema.org"
- @type: "Product" o "ProductCollection"
- name, description, image
- brand, category, color, material
- offers (precio si disponible)
- aggregateRating si relevante
- additionalProperty para características técnicas
- url canónica
- image (URLs de modelo 3D si disponibles)

Asegúrate de que:
1. Cumpla con Schema.org estándar
2. Sea válido JSON
3. Incluya todas las propiedades relevantes
4. Use terminología técnica correcta
5. Sea optimizado para rich snippets

Responde SOLO con el JSON-LD.
"""
    
    def _build_prompt_seo_optimization(
        self, 
        contenido: str, 
        target_keywords: List[str],
        audiencia: str
    ) -> str:
        """
        Construye prompt para optimización SEO de contenido existente.
        
        Args:
            contenido: Contenido a optimizar
            target_keywords: Keywords objetivo
            audiencia: Audiencia target
            
        Returns:
            Prompt formateado para optimización
        """
        return f"""
Optimiza el siguiente contenido para SEO dirigido a la audiencia {audiencia}:

CONTENIDO:
{contenido}

KEYWORDS OBJETIVO:
{', '.join(target_keywords)}

Proporciona:
1. Contenido optimizado manteniendo naturalidad
2. Distribución de keywords (densidad 2-3%)
3. Mejoras en títulos y subtítulos
4. Call-to-actions optimizados
5. Meta descripción mejorada
6. Alt text para imágenes

Responde en formato JSON:
{{
  "contenido_optimizado": "texto mejorado",
  "meta_description": "nueva descripción",
  "densidad_keywords": {{"keyword": porcentaje}},
  "mejoras_aplicadas": ["mejora1", "mejora2"],
  "score_seo_estimado": 85
}}
"""
    
    async def generar_metadatos_basicos(
        self, 
        componente: Dict[str, Any], 
        audiencia: str = "comercial",
        **kwargs
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Genera metadatos básicos para un componente.
        
        Args:
            componente: Datos del componente de reloj
            audiencia: Audiencia objetivo
            **kwargs: Parámetros adicionales
            
        Returns:
            Tuple con (metadatos, respuesta_gemini)
        """
        start_time = time.time()
        
        prompt = self._build_prompt_metadata_generation(
            componente, audiencia, "basico"
        )
        
        data = {
            "model": self.config.modelo_default,
            "messages": [
                {
                    "role": "system",
                    "content": "Eres un experto en SEO y marketing de relojes de lujo."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "temperature": self.config.temperatura,
            "max_tokens": self.config.max_tokens
        }
        
        cache_key = self._get_cache_key(prompt, {"audiencia": audiencia})
        
        try:
            response = await self._make_request("chat/completions", data, cache_key)
            
            # Parsear respuesta
            content = response["choices"][0]["message"]["content"]
            metadatos = json.loads(content)
            
            # Calcular métricas
            processing_time = time.time() - start_time
            
            metadata_respuesta = {
                "tokens_consumidos": response.get("usage", {}).get("total_tokens", 0),
                "tiempo_procesamiento": processing_time,
                "modelo_utilizado": self.config.modelo_default,
                "timestamp": datetime.now().isoformat(),
                "cache_used": cache_key in self._cache and self._is_cache_valid(self._cache.get(cache_key, {}))
            }
            
            return metadatos, metadata_respuesta
            
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parseando JSON: {e}")
            raise GeminiError(f"Invalid JSON response from API: {e}")
        except Exception as e:
            self.logger.error(f"Error generando metadatos: {e}")
            raise
    
    async def generar_json_ld(
        self, 
        componente: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Genera metadatos JSON-LD estructurados.
        
        Args:
            componente: Datos del componente
            
        Returns:
            JSON-LD estructurado según Schema.org
        """
        prompt = self._build_prompt_json_ld_generation(componente)
        
        data = {
            "model": self.config.modelo_default,
            "messages": [
                {
                    "role": "system",
                    "content": "Eres un experto en Schema.org y marcado estructurado para ecommerce."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,  # Más determinista para JSON-LD
            "max_tokens": self.config.max_tokens
        }
        
        cache_key = self._get_cache_key(prompt, {"tipo": "json_ld"})
        
        try:
            response = await self._make_request("chat/completions", data, cache_key)
            content = response["choices"][0]["message"]["content"]
            json_ld = json.loads(content)
            return json_ld
            
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parseando JSON-LD: {e}")
            raise GeminiError(f"Invalid JSON-LD response: {e}")
        except Exception as e:
            self.logger.error(f"Error generando JSON-LD: {e}")
            raise
    
    async def optimizar_contenido_seo(
        self, 
        contenido: str, 
        keywords: List[str],
        audiencia: str = "comercial"
    ) -> Dict[str, Any]:
        """
        Optimiza contenido existente para SEO.
        
        Args:
            contenido: Contenido a optimizar
            keywords: Keywords objetivo
            audiencia: Audiencia target
            
        Returns:
            Contenido optimizado con métricas
        """
        prompt = self._build_prompt_seo_optimization(contenido, keywords, audiencia)
        
        data = {
            "model": self.config.modelo_default,
            "messages": [
                {
                    "role": "system", 
                    "content": "Eres un especialista en optimización SEO para ecommerce de lujo."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.6,
            "max_tokens": self.config.max_tokens
        }
        
        try:
            response = await self._make_request("chat/completions", data)
            content = response["choices"][0]["message"]["content"]
            optimizacion = json.loads(content)
            return optimizacion
            
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parseando optimización SEO: {e}")
            raise GeminiError(f"Invalid SEO optimization response: {e}")
        except Exception as e:
            self.logger.error(f"Error optimizando contenido: {e}")
            raise
    
    async def generar_batch_metadatos(
        self, 
        componentes: List[Dict[str, Any]],
        audiencia_default: str = "comercial"
    ) -> List[Dict[str, Any]]:
        """
        Genera metadatos para múltiples componentes de forma batch.
        
        Args:
            componentes: Lista de componentes
            audiencia_default: Audiencia por defecto
            
        Returns:
            Lista de metadatos generados
        """
        resultados = []
        
        for i, componente in enumerate(componentes):
            try:
                self.logger.info(f"Procesando componente {i+1}/{len(componentes)}: {componente.get('nombre', 'N/A')}")
                
                metadatos, metadata_info = await self.generar_metadatos_basicos(
                    componente, audiencia_default
                )
                
                resultado = {
                    "componente_id": componente.get("id", f"comp_{i}"),
                    "metadatos": metadatos,
                    "metadata_info": metadata_info,
                    "status": "success"
                }
                
                resultados.append(resultado)
                
                # Delay entre requests para evitar rate limiting
                if i < len(componentes) - 1:
                    await asyncio.sleep(1)
                    
            except Exception as e:
                self.logger.error(f"Error procesando componente {i}: {e}")
                resultados.append({
                    "componente_id": componente.get("id", f"comp_{i}"),
                    "error": str(e),
                    "status": "error"
                })
        
        return resultados
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del cache."""
        total_requests = self._cache_hits + self._cache_misses
        hit_rate = (self._cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "hits": self._cache_hits,
            "misses": self._cache_misses,
            "hit_rate": f"{hit_rate:.2f}%",
            "total_requests": total_requests,
            "cache_size": len(self._cache),
            "cache_enabled": self.config.enable_cache
        }
    
    def clear_cache(self):
        """Limpia el cache manual."""
        self._cache.clear()
        self._cache_hits = 0
        self._cache_misses = 0
        self.logger.info("Cache limpiado manualmente")
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica el estado de la API de Gemini.
        
        Returns:
            Estado de la API
        """
        try:
            # Request simple para verificar conectividad
            test_data = {
                "model": self.config.modelo_default,
                "messages": [
                    {"role": "user", "content": "Responde con 'OK' si puedes ver este mensaje."}
                ],
                "max_tokens": 10
            }
            
            response = await self._make_request("chat/completions", test_data)
            
            return {
                "status": "healthy",
                "api_response_time": time.time() - self.last_request_time,
                "model": self.config.modelo_default,
                "rate_limit_remaining": "unknown"  # OpenRouter no expone esto
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        # Limpiar recursos si es necesario
        pass
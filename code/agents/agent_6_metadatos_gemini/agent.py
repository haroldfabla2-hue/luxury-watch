"""
Agente 6: Generador de Metadatos y SEO con Gemini 2.0

Agente especializado en generar metadatos, contenido SEO y descripciones
optimizadas para componentes de reloj de lujo usando inteligencia artificial.

Funcionalidades principales:
- Análisis de componentes de reloj
- Generación de metadatos SEO estructurados
- Creación de descripciones para diferentes audiencias
- Optimización para motores de búsqueda
- Integración con sistema de metadatos 3D
- Generación de contenido JSON-LD

Autor: Sistema de IA Avanzado para LuxuryWatch
Fecha: 2025-11-06
Versión: 1.0.0
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

from .agent_types import (
    ComponenteReloj,
    MetadatosGenerados,
    AudienciaTarget,
    TipoDescripcion,
    ConfiguracionAgente
)

from .metadata_generator import MetadataGenerator
from .gemini_client import GeminiClient
from .material_normalizer import MaterialNormalizer
from .content_templates import ContentTemplates
from .seo_optimizer import SEOOptimizer


class AgenteMetadatosGemini:
    """
    Agente 6: Generador de Metadatos y SEO usando Gemini 2.0
    
    Este agente procesa componentes de reloj para generar:
    - Descripciones atractivas en lenguaje natural
    - Tags SEO y metadatos estructurados (JSON-LD)  
    - Keywords para marketing y búsqueda
    - Descripciones para diferentes audiencias (técnica, comercial, lujo)
    - Integración con sistema de metadatos 3D
    - Optimización para motores de búsqueda
    """
    
    def __init__(self, config: ConfiguracionAgente):
        """
        Inicializa el Agente 6 de Metadatos y SEO.
        
        Args:
            config: Configuración del agente con API keys y parámetros
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Configurar logging
        self._setup_logging()
        
        # Inicializar componentes del agente
        self.metadata_generator = MetadataGenerator(config)
        self.gemini_client = GeminiClient(config)
        self.material_normalizer = MaterialNormalizer()
        self.content_templates = ContentTemplates()
        self.seo_optimizer = SEOOptimizer(config)
        
        # Estadísticas del agente
        self.stats = {
            "componentes_procesados": 0,
            "metadatos_generados": 0,
            "errores": 0,
            "tiempo_total_procesamiento": 0.0,
            "ultimo_procesamiento": None
        }
        
        self.logger.info("Agente 6 de Metadatos y SEO inicializado correctamente")
    
    def _setup_logging(self):
        """Configura el sistema de logging."""
        log_level = getattr(logging, self.config.log_level.upper(), logging.INFO)
        
        # Crear formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Configurar logger
        self.logger.setLevel(log_level)
        
        # Evitar duplicar handlers si ya existen
        if not self.logger.handlers:
            # Console handler
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
    
    async def procesar_componente_completo(
        self, 
        componente: ComponenteReloj,
        audiencias: List[AudienciaTarget] = None,
        forzar_regeneracion: bool = False
    ) -> MetadatosGenerados:
        """
        Procesa un componente completo generando todos los metadatos.
        
        Args:
            componente: Componente de reloj a procesar
            audiencias: Audiencias objetivo (por defecto: todas)
            forzar_regeneracion: Forzar regeneración ignorando cache
            
        Returns:
            MetadatosGenerados con toda la información SEO y contenido
        """
        start_time = datetime.now()
        
        try:
            self.logger.info(f"Iniciando procesamiento de {componente.nombre} ({componente.id})")
            
            # Validar componente
            await self._validar_componente(componente)
            
            # Generar metadatos completos
            metadatos = await self.metadata_generator.generar_metadatos_completos(
                componente=componente,
                audiencias=audiencias,
                force_regeneration=forzar_regeneracion
            )
            
            # Actualizar estadísticas
            self.stats["componentes_procesados"] += 1
            self.stats["metadatos_generados"] += 1
            self.stats["ultimo_procesamiento"] = start_time.isoformat()
            
            # Calcular tiempo de procesamiento
            tiempo_procesamiento = (datetime.now() - start_time).total_seconds()
            self.stats["tiempo_total_procesamiento"] += tiempo_procesamiento
            
            self.logger.info(
                f"Procesamiento completado en {tiempo_procesamiento:.2f}s "
                f"para {componente.nombre}"
            )
            
            return metadatos
            
        except Exception as e:
            self.stats["errores"] += 1
            self.logger.error(f"Error procesando componente {componente.id}: {e}")
            raise
    
    async def procesar_lote_componentes(
        self, 
        componentes: List[ComponenteReloj],
        audiencias: List[AudienciaTarget] = None,
        max_concurrencia: int = 5
    ) -> Dict[str, MetadatosGenerados]:
        """
        Procesa un lote de componentes de forma eficiente.
        
        Args:
            componentes: Lista de componentes a procesar
            audiencias: Audiencias objetivo
            max_concurrencia: Máximo de operaciones concurrentes
            
        Returns:
            Diccionario con resultados por componente_id
        """
        if not componentes:
            self.logger.warning("Lista de componentes vacía")
            return {}
        
        self.logger.info(f"Iniciando procesamiento de lote: {len(componentes)} componentes")
        
        # Procesar usando el generador de metadatos
        resultados = await self.metadata_generator.batch_generate_metadata(
            componentes=componentes,
            audiencias=audiencias,
            max_concurrent=max_concurrencia
        )
        
        # Actualizar estadísticas
        exitosos = len(resultados)
        self.stats["componentes_procesados"] += exitosos
        self.stats["metadatos_generados"] += exitosos
        
        self.logger.info(
            f"Lote completado: {exitosos}/{len(componentes)} componentes procesados exitosamente"
        )
        
        return resultados
    
    async def generar_seo_optimizado(
        self, 
        componente: ComponenteReloj,
        keywords_objetivo: List[str] = None,
        audiencia: AudienciaTarget = AudienciaTarget.COMERCIAL
    ) -> Dict[str, Any]:
        """
        Genera contenido específicamente optimizado para SEO.
        
        Args:
            componente: Componente a optimizar
            keywords_objetivo: Keywords específicas para SEO
            audiencia: Audiencia objetivo
            
        Returns:
            Contenido SEO optimizado
        """
        try:
            self.logger.info(f"Generando contenido SEO para {componente.nombre}")
            
            # Enriquecer componente
            componente_enriquecido = await self._enriquecer_para_seo(componente)
            
            # Generar metadatos SEO básicos
            metadatos_seo, metadata_info = await self.gemini_client.generar_metadatos_basicos(
                componente_enriquecido, audiencia.value
            )
            
            # Optimizar títulos y descripciones
            titulo_optimizado = self.seo_optimizer.optimize_title(
                metadatos_seo.get("titulo_seo", componente.nombre),
                metadatos_seo.get("keywords_primarias", keywords_objetivo or [])
            )
            
            descripcion_optimizada = self.seo_optimizer.optimize_description(
                metadatos_seo.get("descripcion_seo", ""),
                metadatos_seo.get("keywords_primarias", keywords_objetivo or [])
            )
            
            # Generar meta tags
            meta_tags = self.seo_optimizer.generate_meta_tags(
                title=titulo_optimizado,
                description=descripcion_optimizada,
                keywords=metadatos_seo.get("keywords_primarias", []),
                canonical_url=f"/productos/{componente.id}",
                og_image=componente.modelo_3d_url or ""
            )
            
            # Validar meta tags
            validacion = self.seo_optimizer.validate_meta_tags(meta_tags)
            
            # Analizar SEO
            analisis_seo = self.seo_optimizer.analyze_content_seo(
                content=f"{titulo_optimizado} {descripcion_optimizada}",
                keywords=metadatos_seo.get("keywords_primarias", []),
                title=titulo_optimizado,
                description=descripcion_optimizada
            )
            
            resultado = {
                "componente_id": componente.id,
                "titulo_optimizado": titulo_optimizado,
                "descripcion_optimizada": descripcion_optimizada,
                "meta_tags": meta_tags,
                "validacion_meta": {
                    "is_valid": validacion.is_valid,
                    "errors": validacion.errors,
                    "warnings": validacion.warnings,
                    "recommendations": validacion.recommendations
                },
                "analisis_seo": {
                    "score": analisis_seo.score,
                    "title_length": analisis_seo.title_length,
                    "description_length": analisis_seo.description_length,
                    "keyword_density": analisis_seo.keyword_density,
                    "readability_score": analisis_seo.readability_score,
                    "issues": analisis_seo.issues,
                    "recommendations": analisis_seo.recommendations
                },
                "metadata_info": metadata_info
            }
            
            self.logger.info(f"SEO optimizado completado para {componente.nombre}")
            return resultado
            
        except Exception as e:
            self.logger.error(f"Error generando SEO para {componente.id}: {e}")
            raise
    
    async def generar_descripciones_audiencia(
        self, 
        componente: ComponenteReloj,
        audiencias: List[AudienciaTarget] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Genera descripciones específicas para cada audiencia.
        
        Args:
            componente: Componente a procesar
            audiencias: Audiencias objetivo
            
        Returns:
            Descripciones por audiencia
        """
        if audiencias is None:
            audiencias = [
                AudienciaTarget.TECNICA,
                AudienciaTarget.COMERCIAL, 
                AudienciaTarget.LUJO,
                AudienciaTarget.JOVEN
            ]
        
        descripciones_audiencia = {}
        
        for audiencia in audiencias:
            try:
                self.logger.info(f"Generando descripción para audiencia {audiencia.value}")
                
                # Preparar datos específicos de la audiencia
                datos_audiencia = await self._preparar_datos_audiencia(componente, audiencia)
                
                # Seleccionar template apropiado
                template_name = self._obtener_template_audiencia(audiencia)
                
                # Generar contenido usando template
                contenido = self.content_templates.generate_content_from_template(
                    template_name=template_name,
                    data=datos_audiencia,
                    audience=audiencia
                )
                
                # Generar keywords específicas
                keywords_audiencia = await self._generar_keywords_audiencia(componente, audiencia)
                
                descripciones_audiencia[audiencia.value] = {
                    "audiencia": audiencia.value,
                    "titulo": contenido["content"][:100] + "..." if len(contenido["content"]) > 100 else contenido["content"],
                    "contenido_completo": contenido["content"],
                    "longitud": contenido["length"],
                    "tone": contenido["tone"],
                    "call_to_action": contenido.get("call_to_action"),
                    "keywords": keywords_audiencia,
                    "puntos_clave": datos_audiencia.get("puntos_clave", []),
                    "seo_score": self._calcular_seo_score_simple(contenido["content"], keywords_audiencia)
                }
                
            except Exception as e:
                self.logger.warning(f"Error generando descripción para {audiencia.value}: {e}")
                continue
        
        return descripciones_audiencia
    
    async def generar_json_ld_completo(
        self, 
        componente: ComponenteReloj,
        incluir_ofertas: bool = False,
        incluir_reviews: bool = False
    ) -> Dict[str, Any]:
        """
        Genera JSON-LD estructurado completo según Schema.org.
        
        Args:
            componente: Componente a procesar
            incluir_ofertas: Incluir información de ofertas
            incluir_reviews: Incluir información de reseñas
            
        Returns:
            JSON-LD estructurado
        """
        try:
            # Preparar datos del componente
            componente_data = await self._preparar_datos_json_ld(componente)
            
            # Seleccionar template apropiado
            if incluir_reviews:
                template_name = "product_with_reviews"
            elif incluir_ofertas:
                template_name = "product_with_offers"
            else:
                template_name = "product_basic"
            
            # Generar JSON-LD
            json_ld = self.content_templates.generate_json_ld(template_name, componente_data)
            
            # Añadir metadatos adicionales
            json_ld["@context"] = "https://schema.org/"
            json_ld["mainEntity"]["category"] = "Watch Component"
            json_ld["mainEntity"]["audience"] = "Watch Enthusiasts"
            json_ld["mainEntity"]["audience"]["audienceType"] = "Luxury Watch Collectors"
            
            # Añadir información de material específica
            if componente.material_base:
                material_info = self.material_normalizer.normalize_material(componente.material_base.value)
                if material_info:
                    json_ld["mainEntity"]["material"] = material_info.nombre_normalizado
                    json_ld["mainEntity"]["additionalProperty"] = [
                        {
                            "@type": "PropertyValue",
                            "name": "Durability Rating",
                            "value": f"{material_info.durabilidad}/10"
                        },
                        {
                            "@type": "PropertyValue", 
                            "name": "Scratch Resistance",
                            "value": f"{material_info.resistencia_rayado}/10"
                        }
                    ]
            
            self.logger.info(f"JSON-LD generado para {componente.nombre}")
            return json_ld
            
        except Exception as e:
            self.logger.error(f"Error generando JSON-LD para {componente.id}: {e}")
            raise
    
    async def generar_contenido_redes_sociales(
        self, 
        componente: ComponenteReloj,
        plataformas: List[str] = None
    ) -> Dict[str, Dict[str, str]]:
        """
        Genera contenido optimizado para redes sociales.
        
        Args:
            componente: Componente a promocionar
            plataformas: Plataformas objetivo (Instagram, Twitter, Facebook, etc.)
            
        Returns:
            Contenido por plataforma
        """
        if plataformas is None:
            plataformas = ["Instagram", "Twitter", "Facebook", "LinkedIn"]
        
        contenido_social = {}
        
        for plataforma in plataformas:
            try:
                self.logger.info(f"Generando contenido para {plataforma}")
                
                # Preparar datos específicos de la plataforma
                datos_platform = await self._preparar_datos_social_platform(componente, plataforma)
                
                # Generar contenido usando template
                template_name = "social_media"
                contenido = self.content_templates.generate_content_from_template(
                    template_name=template_name,
                    data=datos_platform,
                    audience=AudienciaTarget.JOVEN
                )
                
                # Añadir elementos específicos de cada plataforma
                if plataforma == "Instagram":
                    contenido_social["Instagram"] = {
                        "caption": contenido["content"],
                        "hashtags": self._generar_hashtags(componente),
                        "story_ideas": self._generar_ideas_story(componente),
                        "igtv_script": self._generar_script_video(componente)
                    }
                
                elif plataforma == "Twitter":
                    contenido_social["Twitter"] = {
                        "tweet": contenido["content"][:280],  # Límite de Twitter
                        "thread": self._generar_twitter_thread(componente),
                        "poll_ideas": self._generar_ideas_encuesta(componente)
                    }
                
                elif plataforma == "Facebook":
                    contenido_social["Facebook"] = {
                        "post": contenido["content"],
                        "call_to_action": "Descubre más sobre esta pieza exclusiva",
                        "targeting_suggestions": ["Watch enthusiasts", "Luxury goods", "Swiss made"]
                    }
                
                elif plataforma == "LinkedIn":
                    contenido_social["LinkedIn"] = {
                        "post": self._adapt_content_for_linkedin(contenido["content"]),
                        "professional_angle": "Precision engineering and Swiss craftsmanship",
                        "industry_hashtags": ["#Watchmaking", "#SwissEngineering", "#LuxuryGoods"]
                    }
                
            except Exception as e:
                self.logger.warning(f"Error generando contenido para {plataforma}: {e}")
                continue
        
        return contenido_social
    
    def obtener_estadisticas_agente(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas detalladas del agente.
        
        Returns:
            Estadísticas completas del agente
        """
        cache_stats = self.metadata_generator.get_cache_stats()
        
        return {
            "agente_info": {
                "nombre": "Agente 6 - Generador de Metadatos y SEO",
                "version": "1.0.0",
                "estado": "operativo",
                "fecha_inicio": datetime.now().isoformat()
            },
            "estadisticas_procesamiento": self.stats,
            "cache_stats": cache_stats,
            "configuracion": {
                "modelo_gemini": self.config.modelo_default,
                "temperatura": self.config.temperatura,
                "max_tokens": self.config.max_tokens,
                "cache_enabled": self.config.enable_cache,
                "rate_limit": f"{self.config.requests_per_minute}/min"
            },
            "capacidades": {
                "generacion_metadatos": True,
                "optimizacion_seo": True,
                "contenido_redes_sociales": True,
                "json_ld": True,
                "multi_audiencia": True,
                "batch_processing": True
            }
        }
    
    async def health_check_completo(self) -> Dict[str, Any]:
        """
        Verifica el estado completo del agente y sus dependencias.
        
        Returns:
            Estado completo del agente
        """
        health_status = await self.metadata_generator.health_check()
        
        # Verificar componentes individuales
        component_health = {}
        
        try:
            component_health["gemini_client"] = await self.gemini_client.health_check()
        except Exception as e:
            component_health["gemini_client"] = {"status": "unhealthy", "error": str(e)}
        
        component_health["material_normalizer"] = {"status": "healthy"}
        component_health["content_templates"] = {"status": "healthy"}
        component_health["seo_optimizer"] = {"status": "healthy"}
        
        # Estado general
        overall_status = "healthy"
        if any(comp.get("status") == "unhealthy" for comp in component_health.values()):
            overall_status = "degraded"
        elif health_status["status"] != "healthy":
            overall_status = "degraded"
        
        return {
            "agent_status": overall_status,
            "timestamp": datetime.now().isoformat(),
            "components": component_health,
            "metadata_generator": health_status,
            "statistics": self.obtener_estadisticas_agente()
        }
    
    # Métodos auxiliares privados
    
    async def _validar_componente(self, componente: ComponenteReloj):
        """Valida que el componente tenga la información mínima necesaria."""
        if not componente.id:
            raise ValueError("Componente debe tener un ID")
        
        if not componente.nombre:
            raise ValueError("Componente debe tener un nombre")
        
        if not componente.tipo:
            raise ValueError("Componente debe tener un tipo")
    
    async def _enriquecer_para_seo(self, componente: ComponenteReloj) -> Dict[str, Any]:
        """Enriquece componente con información adicional para SEO."""
        componente_dict = {
            "tipo": componente.tipo.value,
            "nombre": componente.nombre,
            "material_base": componente.material_base.value if componente.material_base else None,
            "acabado_superficie": componente.acabado_superficie.value if componente.acabado_superficie else None,
            "color_principal": componente.color_principal,
            "estilo_visual": [s.value for s in componente.estilo_visual],
            "coleccion": componente.coleccion,
            "referencia": componente.referencia
        }
        
        # Añadir información de material si existe
        if componente.material_base:
            material_info = self.material_normalizer.normalize_material(componente.material_base.value)
            if material_info:
                componente_dict["material_seo_keywords"] = self.material_normalizer.generate_seo_keywords(
                    material_info, componente.tipo
                )
        
        return componente_dict
    
    async def _preparar_datos_audiencia(
        self, 
        componente: ComponenteReloj, 
        audiencia: AudienciaTarget
    ) -> Dict[str, Any]:
        """Prepara datos específicos para una audiencia."""
        base_data = {
            "product_name": componente.nombre,
            "product_type": componente.tipo.value,
            "material": componente.material_base.value if componente.material_base else "",
            "color": componente.color_principal,
            "collection": componente.coleccion or "",
            "puntos_clave": self._extraer_puntos_clave(componente, audiencia)
        }
        
        # Personalizar según audiencia
        if audiencia == AudienciaTarget.TECNICA:
            base_data.update({
                "dimensions": f"{componente.dimensiones.get('largo', 'N/A')}x{componente.dimensiones.get('ancho', 'N/A')}mm",
                "weight": f"{componente.peso}g" if componente.peso else "N/A",
                "technical_focus": "precision y durabilidad",
                "certification": "Swiss Made"
            })
        
        elif audiencia == AudienciaTarget.LUJO:
            base_data.update({
                "luxury_focus": "exclusividad y herencia",
                "heritage": "tradición relojera suiza",
                "craftsmanship": "artesanía master",
                "limited_edition": "edición limitada"
            })
        
        elif audiencia == AudienciaTarget.COMERCIAL:
            base_data.update({
                "commercial_focus": "calidad y valor",
                "benefits": ["calidad premium", "diseño atemporal", "garantía de por vida"],
                "target_market": "entusiastas del reloj"
            })
        
        return base_data
    
    def _obtener_template_audiencia(self, audiencia: AudienciaTarget) -> str:
        """Obtiene el template apropiado para una audiencia."""
        mapping = {
            AudienciaTarget.TECNICA: "technical_specs",
            AudienciaTarget.COMERCIAL: "commercial_appeal", 
            AudienciaTarget.LUJO: "luxury_experience",
            AudienciaTarget.JOVEN: "social_media",
            AudienciaTarget.PROFESIONAL: "commercial_appeal",
            AudienciaTarget.ENTHUSIAST: "luxury_experience"
        }
        return mapping.get(audiencia, "commercial_appeal")
    
    async def _generar_keywords_audiencia(
        self, 
        componente: ComponenteReloj, 
        audiencia: AudienciaTarget
    ) -> List[str]:
        """Genera keywords específicas para una audiencia."""
        keywords_base = [componente.tipo.value, componente.nombre.lower()]
        
        if componente.material_base:
            material_info = self.material_normalizer.normalize_material(componente.material_base.value)
            if material_info:
                keywords_base.extend(material_info.keywords_seo)
        
        # Añadir keywords específicas por audiencia
        audiencia_keywords = {
            AudienciaTarget.TECNICA: ["precision", "swiss", "quality", "engineering"],
            AudienciaTarget.LUJO: ["luxury", "exclusive", "heritage", "prestigious"],
            AudienciaTarget.COMERCIAL: ["premium", "quality", "value", "style"],
            AudienciaTarget.JOVEN: ["modern", "trendy", "fashion", "style"],
            AudienciaTarget.PROFESIONAL: ["professional", "business", "elegant", "sophisticated"],
            AudienciaTarget.ENTHUSIAST: ["collector", "rare", "authentic", "swiss made"]
        }
        
        if audiencia in audiencia_keywords:
            keywords_base.extend(audiencia_keywords[audiencia])
        
        return list(set(keywords_base))  # Eliminar duplicados
    
    def _calcular_seo_score_simple(self, content: str, keywords: List[str]) -> float:
        """Calcula un score SEO simple basado en contenido y keywords."""
        if not content or not keywords:
            return 0.0
        
        words = content.lower().split()
        total_words = len(words)
        
        if total_words == 0:
            return 0.0
        
        score = 0.0
        
        # Evaluar presencia de keywords
        for keyword in keywords:
            keyword_count = content.lower().count(keyword.lower())
            if keyword_count > 0:
                density = (keyword_count / total_words) * 100
                if 1.0 <= density <= 3.0:  # Densidad óptima
                    score += 20
                elif density > 0:
                    score += 10
        
        # Evaluar longitud del contenido
        if 100 <= total_words <= 500:
            score += 20
        elif 50 <= total_words < 100:
            score += 10
        
        # Evaluar estructura (párrafos, etc.)
        paragraphs = content.split('\n\n')
        if len(paragraphs) >= 2:
            score += 10
        
        return min(100.0, score)
    
    async def _preparar_datos_json_ld(self, componente: ComponenteReloj) -> Dict[str, Any]:
        """Prepara datos para JSON-LD."""
        return {
            "product_name": componente.nombre,
            "product_description": componente.descripcion_tecnica or f"Componente de reloj {componente.tipo.value}",
            "brand_name": "LuxuryWatch",
            "material": componente.material_base.value if componente.material_base else "",
            "color": componente.color_principal,
            "image_url": componente.modelo_3d_url or "",
            "price": "Contact for pricing",
            "seller_name": "LuxuryWatch Official"
        }
    
    def _extraer_puntos_clave(
        self, 
        componente: ComponenteReloj, 
        audiencia: AudienciaTarget
    ) -> List[str]:
        """Extrae puntos clave relevantes para la audiencia."""
        puntos = []
        
        # Puntos técnicos generales
        if componente.material_base:
            puntos.append(f"Material premium: {componente.material_base.value}")
        
        if componente.acabado_superficie:
            puntos.append(f"Acabado superior: {componente.acabado_superficie.value}")
        
        if componente.resistencia_agua:
            puntos.append(f"Resistencia al agua: {componente.resistencia_agua}m")
        
        if componente.resistencia_rayado:
            puntos.append(f"Resistencia al rayado: {componente.resistencia_rayado}/10")
        
        # Puntos específicos por audiencia
        if audiencia == AudienciaTarget.LUJO:
            puntos.append("Edición limitada")
            puntos.append("Artesanía suiza")
            puntos.append("Garantía de por vida")
        
        elif audiencia == AudienciaTarget.TECNICA:
            if componente.dimensiones:
                puntos.append(f"Dimensiones precisas: {componente.dimensiones}")
            if componente.peso:
                puntos.append(f"Peso optimizado: {componente.peso}g")
        
        return puntos[:5]  # Máximo 5 puntos clave
    
    # Métodos para redes sociales (implementaciones simplificadas)
    
    async def _preparar_datos_social_platform(
        self, 
        componente: ComponenteReloj, 
        plataforma: str
    ) -> Dict[str, Any]:
        """Prepara datos para una plataforma social específica."""
        return {
            "product_name": componente.nombre,
            "visual_feature": f"diseño en {componente.material_base.value if componente.material_base else 'material premium'}",
            "lifestyle": "elegante y sofisticado",
            "lifestyle_description": "Perfecto para quienes aprecian la excelencia",
            "hashtags": " ".join(self._generar_hashtags(componente))
        }
    
    def _generar_hashtags(self, componente: ComponenteReloj) -> List[str]:
        """Genera hashtags relevantes."""
        hashtags = ["#LuxuryWatch", "#SwissMade", "#Timepiece"]
        
        if componente.material_base:
            hashtags.append(f"#{componente.material_base.value.replace(' ', '')}")
        
        hashtags.extend(["#Elegance", "#Craftsmanship", "#Premium"])
        
        return hashtags[:10]  # Máximo 10 hashtags
    
    def _generar_ideas_story(self, componente: ComponenteReloj) -> List[str]:
        """Genera ideas para Instagram Stories."""
        return [
            "Behind the scenes: crafting process",
            "Material spotlight: close-up shots", 
            "Lifestyle shots: wearing the watch",
            "Technical specs animation",
            "Customer testimonials"
        ]
    
    def _generar_script_video(self, componente: ComponenteReloj) -> str:
        """Genera script para video corto."""
        return f"""
        Hook (0-3s): "Ever wondered what makes {componente.nombre} so special?"
        Material showcase (3-8s): Close-up of {componente.material_base.value if componente.material_base else 'premium materials'}
        Features (8-12s): Key benefits and craftsmanship details
        Call to action (12-15s): "Discover the full collection"
        """
    
    def _generar_twitter_thread(self, componente: ComponenteReloj) -> List[str]:
        """Genera thread de Twitter."""
        return [
            f"🧵 Thread: What makes {componente.nombre} exceptional?",
            f"1/ The {componente.material_base.value if componente.material_base else 'premium materials'} used...",
            "2/ Swiss precision engineering ensures...",
            "3/ Every detail is carefully crafted...",
            f"4/ Ready to experience luxury? {componente.modelo_3d_url or '#'}"
        ]
    
    def _generar_ideas_encuesta(self, componente: ComponenteReloj) -> List[str]:
        """Genera ideas para encuestas de Twitter."""
        return [
            "What's more important: Material or Design?",
            "Swiss vs Japanese movement - your choice?",
            "Favorite watch complication?",
            "Dress watch vs Sports watch?"
        ]
    
    def _adapt_content_for_linkedin(self, content: str) -> str:
        """Adapta contenido para LinkedIn (más profesional)."""
        # Hacer el contenido más profesional y enfocado en business
        professional_focus = content.replace("fashion", "professional image")
        professional_focus = professional_focus.replace("trendy", "sophisticated")
        return professional_focus
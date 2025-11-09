"""
Generador de Metadatos para el Agente 6 - Sistema completo de generación
de metadatos SEO y contenido optimizado para componentes de reloj.

Integra:
- Cliente Gemini para generación de contenido
- Normalizador de materiales
- Templates de contenido  
- Optimizador SEO
- Generación de JSON-LD
"""

import asyncio
import json
import time
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime

from .types import (
    ComponenteReloj, 
    MetadatosGenerados, 
    AudienciaTarget, 
    TipoDescripcion,
    MetadatosSEO, 
    DescripcionAudiencia,
    KeywordsSEO,
    ConfiguracionAgente
)

from .gemini_client import GeminiClient
from .material_normalizer import MaterialNormalizer
from .content_templates import ContentTemplates
from .seo_optimizer import SEOOptimizer


class MetadataGenerationError(Exception):
    """Excepción específica para errores en generación de metadatos."""
    pass


class MetadataGenerator:
    """
    Generador principal de metadatos y SEO para componentes de reloj.
    
    Orquesta todo el proceso de generación:
    1. Normalización de materiales
    2. Generación de contenido con Gemini
    3. Optimización SEO
    4. Creación de metadatos estructurados
    5. Validación de calidad
    """
    
    def __init__(self, config: ConfiguracionAgente):
        """
        Inicializa el generador de metadatos.
        
        Args:
            config: Configuración del agente
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Inicializar componentes
        self.gemini_client = GeminiClient(config)
        self.material_normalizer = MaterialNormalizer()
        self.content_templates = ContentTemplates()
        self.seo_optimizer = SEOOptimizer(config)
        
        # Cache de resultados
        self._generation_cache = {}
        self._cache_stats = {"hits": 0, "misses": 0}
    
    async def generar_metadatos_completos(
        self, 
        componente: ComponenteReloj,
        audiencias: List[AudienciaTarget] = None,
        tipos_descripcion: List[TipoDescripcion] = None,
        force_regeneration: bool = False
    ) -> MetadatosGenerados:
        """
        Genera metadatos completos para un componente.
        
        Args:
            componente: Componente de reloj a procesar
            audiencias: Audiencias objetivo (por defecto: todas)
            tipos_descripcion: Tipos de descripción a generar
            force_regeneration: Forzar regeneración ignorando cache
            
        Returns:
            MetadatosGenerados con toda la información generada
        """
        start_time = time.time()
        componente_id = componente.id
        
        # Verificar cache
        if not force_regeneration and self._is_cached(componente_id):
            self._cache_stats["hits"] += 1
            return self._get_cached_result(componente_id)
        
        self._cache_stats["misses"] += 1
        
        # Valores por defecto
        if audiencias is None:
            audiencias = [AudienciaTarget.COMERCIAL, AudienciaTarget.LUJO, AudienciaTarget.TECNICA]
        
        if tipos_descripcion is None:
            tipos_descripcion = [TipoDescripcion.SEO, TipoDescripcion.COMERCIAL, TipoDescripcion.LUJO]
        
        try:
            # 1. Normalizar y enriquecer información del componente
            componente_enriquecido = await self._enriquecer_componente(componente)
            
            # 2. Generar metadatos SEO
            seo_metadata = await self._generar_metadatos_seo(componente_enriquecido)
            
            # 3. Generar descripciones para cada audiencia
            descripciones = await self._generar_descripciones_audiencias(
                componente_enriquecido, audiencias, tipos_descripcion
            )
            
            # 4. Generar JSON-LD
            json_ld = await self._generar_json_ld(componente_enriquecido)
            
            # 5. Generar metadatos 3D
            metadata_3d = await self._generar_metadata_3d(componente_enriquecido)
            
            # 6. Crear estructura final
            metadatos = MetadatosGenerados(
                componente_id=componente_id,
                seo_metadata=seo_metadata,
                descripciones=descripciones,
                json_ld=json_ld,
                metadata_3d=metadata_3d,
                taxonomias=await self._generar_taxonomias(componente_enriquecido),
                variantes_producto=await self._generar_variantes(componente_enriquecido),
                relacionados=await self._generar_relacionados(componente_enriquecido),
                tiempo_procesamiento=time.time() - start_time
            )
            
            # 7. Validar calidad
            await self._validar_calidad(metadatos)
            
            # 8. Guardar en cache
            self._cache_result(componente_id, metadatos)
            
            self.logger.info(f"Metadatos generados exitosamente para {componente_id}")
            return metadatos
            
        except Exception as e:
            self.logger.error(f"Error generando metadatos para {componente_id}: {e}")
            raise MetadataGenerationError(f"Generation failed: {e}")
    
    async def _enriquecer_componente(self, componente: ComponenteReloj) -> Dict[str, Any]:
        """Enriquece el componente con información normalizada."""
        componente_dict = {
            "id": componente.id,
            "tipo": componente.tipo.value,
            "nombre": componente.nombre,
            "descripcion_tecnica": componente.descripcion_tecnica,
            "dimensiones": componente.dimensiones,
            "peso": componente.peso,
            "color_principal": componente.color_principal,
            "colores_secundarios": componente.colores_secundarios,
            "textura": componente.textura,
            "patron": componente.patron,
            "resistencia_agua": componente.resistencia_agua,
            "resistencia_rayado": componente.resistencia_rayado,
            "facilidad_mantenimiento": componente.facilidad_mantenimiento,
            "coleccion": componente.coleccion,
            "referencia": componente.referencia,
            "modelo_3d_url": componente.modelo_3d_url,
            "texturas_alta_res": componente.texturas_alta_res,
            "materiales_pbr": componente.materiales_pbr,
            "estilo_visual": [s.value for s in componente.estilo_visual]
        }
        
        # Normalizar material si existe
        if componente.material_base:
            material_info = self.material_normalizer.normalize_material(
                componente.material_base.value
            )
            if material_info:
                componente_dict["material_info"] = self.material_normalizer.enrich_material_properties(
                    material_info, componente_dict
                )
                componente_dict["material_seo_keywords"] = self.material_normalizer.generate_seo_keywords(
                    material_info, componente.tipo
                )
        
        # Normalizar acabado si existe
        if componente.acabado_superficie:
            acabado_normalizado = self.material_normalizer.detect_finish(
                componente.acabado_superficie.value
            )
            componente_dict["acabado_info"] = {
                "original": componente.acabado_superficie.value,
                "normalizado": acabado_normalizado.value if acabado_normalizado else None
            }
        
        return componente_dict
    
    async def _generar_metadatos_seo(self, componente: Dict[str, Any]) -> MetadatosSEO:
        """Genera metadatos SEO completos."""
        # Preparar datos para Gemini
        gemini_data = {
            "tipo": componente["tipo"],
            "nombre": componente["nombre"],
            "material_base": componente.get("material_info", {}).get("material_base"),
            "acabado_superficie": componente.get("acabado_info", {}).get("original"),
            "color_principal": componente["color_principal"],
            "estilo_visual": componente["estilo_visual"],
            "coleccion": componente["coleccion"]
        }
        
        # Generar con Gemini
        metadatos_gemini, metadata_info = await self.gemini_client.generar_metadatos_basicos(
            gemini_data, "comercial"
        )
        
        # Crear estructura KeywordsSEO
        keywords_seo = KeywordsSEO(
            primarias=metadatos_gemini.get("keywords_primarias", []),
            secundarias=metadatos_gemini.get("keywords_secundarias", []),
            long_tail=metadatos_gemini.get("long_tail_keywords", []),
            marca_keywords=metadatos_gemini.get("brand_keywords", []),
            trending_keywords=metadatos_gemini.get("trending_keywords", [])
        )
        
        # Crear metadatos SEO
        seo_metadata = MetadatosSEO(
            titulo_seo=metadatos_gemini.get("titulo_seo", componente["nombre"]),
            descripcion_seo=metadatos_gemini.get("descripcion_seo", ""),
            keywords=keywords_seo,
            meta_tags={
                "title": metadatos_gemini.get("titulo_seo", ""),
                "description": metadatos_gemini.get("descripcion_seo", ""),
                "keywords": ", ".join(keywords_seo.primarias),
                "author": "LuxuryWatch Configurator",
                "robots": "index, follow"
            },
            open_graph_tags={
                "og:title": metadatos_gemini.get("titulo_seo", ""),
                "og:description": metadatos_gemini.get("descripcion_seo", ""),
                "og:type": "product",
                "og:image": componente.get("modelo_3d_url", ""),
                "og:site_name": "LuxuryWatch"
            },
            twitter_cards={
                "twitter:card": "summary_large_image",
                "twitter:title": metadatos_gemini.get("titulo_seo", ""),
                "twitter:description": metadatos_gemini.get("descripcion_seo", ""),
                "twitter:image": componente.get("modelo_3d_url", "")
            },
            alt_texts={
                "modelo_3d": metadatos_gemini.get("alt_text", f"Modelo 3D de {componente['nombre']}")
            }
        )
        
        return seo_metadata
    
    async def _generar_descripciones_audiencias(
        self, 
        componente: Dict[str, Any], 
        audiencias: List[AudienciaTarget],
        tipos_descripcion: List[TipoDescripcion]
    ) -> List[DescripcionAudiencia]:
        """Genera descripciones para diferentes audiencias."""
        descripciones = []
        
        for audiencia in audiencias:
            # Seleccionar tipos de descripción apropiados para la audiencia
            tipos_audiencia = self._seleccionar_tipos_por_audiencia(audiencia, tipos_descripcion)
            
            for tipo_desc in tipos_audiencia:
                try:
                    # Generar descripción usando template
                    descripcion_data = await self._preparar_datos_descripcion(componente, audiencia)
                    
                    # Usar template apropiado
                    template_name = self._obtener_template_name(audiencia, tipo_desc)
                    contenido_template = self.content_templates.generate_content_from_template(
                        template_name, descripcion_data, audiencia
                    )
                    
                    # Crear descripción estructurada
                    descripcion = DescripcionAudiencia(
                        audiencia=audiencia,
                        titulo=contenido_template["content"][:100] + "..." if len(contenido_template["content"]) > 100 else contenido_template["content"],
                        descripcion=contenido_template["content"],
                        puntos_clave=descripcion_data.get("puntos_clave", []),
                        call_to_action=contenido_template.get("call_to_action"),
                        tono=contenido_template.get("tone", "neutral"),
                        longitud_caracteres=contenido_template.get("length", 0)
                    )
                    
                    descripciones.append(descripcion)
                    
                except Exception as e:
                    self.logger.warning(f"Error generando descripción {audiencia.value}-{tipo_desc.value}: {e}")
                    continue
        
        return descripciones
    
    async def _generar_json_ld(self, componente: Dict[str, Any]) -> Dict[str, Any]:
        """Genera metadatos JSON-LD estructurados."""
        # Usar template básico de JSON-LD
        json_ld_data = {
            "product_name": componente["nombre"],
            "product_description": componente.get("descripcion_tecnica", f"Componente de reloj {componente['tipo']}"),
            "brand_name": "LuxuryWatch",
            "material": componente.get("material_info", {}).get("material_base", ""),
            "color": componente["color_principal"],
            "image_url": componente.get("modelo_3d_url", ""),
            "category": "Watch Component"
        }
        
        return self.content_templates.generate_json_ld("product_basic", json_ld_data)
    
    async def _generar_metadata_3d(self, componente: Dict[str, Any]) -> Dict[str, Any]:
        """Genera metadatos específicos para el modelo 3D."""
        metadata_3d = {
            "asset_info": {
                "format": "GLB",
                "version": "1.0",
                "compression": "Draco",
                "textures": {
                    "format": "KTX2",
                    "resolution": "1K-2K",
                    "color_space": "sRGB"
                }
            },
            "technical_specs": {
                "vertices": "optimized",
                "triangles": " LOD-based",
                "textures_maps": ["albedo", "normal", "roughness", "metallic", "ao"],
                "pbr_materials": True
            },
            "compatibility": {
                "webgl": True,
                "three_js": True,
                "babylon_js": True,
                "mobile_friendly": True
            },
            "performance": {
                "target_fps": 60,
                "loading_strategy": "progressive",
                "culling": "frustum",
                "lod_levels": 3
            }
        }
        
        # Añadir información específica del material
        if "material_info" in componente:
            metadata_3d["material_properties"] = componente["material_info"]
        
        return metadata_3d
    
    async def _generar_taxonomias(self, componente: Dict[str, Any]) -> Dict[str, List[str]]:
        """Genera taxonomías para categorización."""
        taxonomias = {
            "categoria_principal": ["Reloj", "Componentes"],
            "subcategoria": [componente["tipo"].title()],
            "materiales": [],
            "acabados": [],
            "estilos": componente.get("estilo_visual", []),
            "colecciones": [componente["coleccion"]] if componente.get("coleccion") else [],
            "uso_recomendado": self._determinar_uso_recomendado(componente),
            "mercado_objetivo": self._determinar_mercado_objetivo(componente)
        }
        
        # Añadir material a taxonomía
        if "material_info" in componente:
            taxonomias["materiales"] = [componente["material_info"]["material_base"]]
            if "acabados_compatibles" in componente["material_info"]:
                taxonomias["acabados"] = componente["material_info"]["acabados_compatibles"]
        
        return taxonomias
    
    async def _generar_variantes(self, componente: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Genera variantes del producto basadas en el componente."""
        variantes = []
        
        # Variantes de color
        if componente.get("colores_secundarios"):
            for color in componente["colores_secundarios"]:
                variantes.append({
                    "tipo": "color",
                    "valor": color,
                    "sku": f"{componente['id']}_color_{color.replace(' ', '_').lower()}",
                    "precio_multiplier": 1.0,
                    "disponible": True
                })
        
        # Variantes de acabado
        if "material_info" in componente:
            acabados = componente["material_info"].get("acabados_compatibles", [])
            for acabado in acabados:
                variantes.append({
                    "tipo": "acabado",
                    "valor": acabado,
                    "sku": f"{componente['id']}_finish_{acabado.replace(' ', '_').lower()}",
                    "precio_multiplier": 1.05,  # 5% más por acabado premium
                    "disponible": True
                })
        
        return variantes
    
    async def _generar_relacionados(self, componente: Dict[str, Any]) -> List[str]:
        """Genera lista de productos relacionados."""
        relacionados = []
        tipo = componente["tipo"]
        
        # Productos complementarios por tipo
        relaciones = {
            "caja": ["bisel", "esfera", "corona", "cristal"],
            "bisel": ["caja", "esfera"],
            "correa": ["hebilla", "caja"],
            "esfera": ["manecillas", "indices", "caja"]
        }
        
        if tipo in relaciones:
            relacionados.extend(relaciones[tipo])
        
        # Productos del mismo material
        if "material_info" in componente:
            relacionados.append(f"mismo_material_{componente['material_info']['material_base']}")
        
        # Productos de la misma colección
        if componente.get("coleccion"):
            relacionados.append(f"coleccion_{componente['coleccion']}")
        
        return list(set(relacionados))  # Eliminar duplicados
    
    def _seleccionar_tipos_por_audiencia(
        self, 
        audiencia: AudienciaTarget, 
        tipos_disponibles: List[TipoDescripcion]
    ) -> List[TipoDescripcion]:
        """Selecciona tipos de descripción apropiados para una audiencia."""
        mapping_audiencia_tipos = {
            AudienciaTarget.TECNICA: [TipoDescripcion.TECNICA, TipoDescripcion.SEO],
            AudienciaTarget.COMERCIAL: [TipoDescripcion.COMERCIAL, TipoDescripcion.SEO, TipoDescripcion.MARKETING],
            AudienciaTarget.LUJO: [TipoDescripcion.LUJO, TipoDescripcion.SEO, TipoDescripcion.MARKETING],
            AudienciaTarget.JOVEN: [TipoDescripcion.SOCIAL_MEDIA, TipoDescripcion.MARKETING],
            AudienciaTarget.PROFESIONAL: [TipoDescripcion.COMERCIAL, TipoDescripcion.TECNICA],
            AudienciaTarget.ENTHUSIAST: [TipoDescripcion.TECNICA, TipoDescripcion.LUJO]
        }
        
        tipos_audiencia = mapping_audiencia_tipos.get(audiencia, [TipoDescripcion.SEO])
        return [t for t in tipos_disponibles if t in tipos_audiencia]
    
    async def _preparar_datos_descripcion(
        self, 
        componente: Dict[str, Any], 
        audiencia: AudienciaTarget
    ) -> Dict[str, Any]:
        """Prepara datos para generar descripción según audiencia."""
        base_data = {
            "product_name": componente["nombre"],
            "product_type": componente["tipo"],
            "material": componente.get("material_info", {}).get("material_base", ""),
            "color": componente["color_principal"],
            "collection": componente.get("coleccion", ""),
            "key_benefit": self._extraer_beneficio_principal(componente, audiencia),
            "target_market": audiencia.value,
            "call_to_action": self._generar_call_to_action(componente, audiencia)
        }
        
        # Añadir datos específicos según audiencia
        if audiencia == AudienciaTarget.TECNICA:
            base_data.update({
                "dimensions": self._formatear_dimensiones(componente),
                "weight": self._formatear_peso(componente),
                "features": self._extraer_caracteristicas_tecnicas(componente),
                "certification": "Swiss Made",
                "standards": "ISO 764 (horology)"
            })
        
        elif audiencia == AudienciaTarget.LUJO:
            base_data.update({
                "heritage": "Swiss craftsmanship since 1950",
                "craftsmanship": "hand-finished details",
                "signature_element": "signature crown guards",
                "limited_edition_text": "Limited to 500 pieces worldwide."
            })
        
        elif audiencia == AudienciaTarget.COMERCIAL:
            base_data.update({
                "primary_benefit": base_data["key_benefit"],
                "benefit_1": "Premium materials",
                "benefit_2": "Swiss precision",
                "benefit_3": "Lifetime warranty",
                "origin_text": "Made in Switzerland with traditional craftsmanship.",
                "craftsmanship_text": "Each piece is meticulously assembled by master craftsmen."
            })
        
        return base_data
    
    def _obtener_template_name(self, audiencia: AudienciaTarget, tipo: TipoDescripcion) -> str:
        """Obtiene el nombre del template apropiado."""
        template_mapping = {
            (AudienciaTarget.TECNICA, TipoDescripcion.TECNICA): "technical_specs",
            (AudienciaTarget.COMERCIAL, TipoDescripcion.COMERCIAL): "commercial_appeal",
            (AudienciaTarget.LUJO, TipoDescripcion.LUJO): "luxury_experience",
            (AudienciaTarget.JOVEN, TipoDescripcion.SOCIAL_MEDIA): "social_media",
            (AudienciaTarget.COMERCIAL, TipoDescripcion.CATALOGO): "catalog_listing",
            (AudienciaTarget.COMERCIAL, TipoDescripcion.SEO): "seo_basic"
        }
        
        return template_mapping.get((audiencia, tipo), "commercial_appeal")
    
    async def _validar_calidad(self, metadatos: MetadatosGenerados) -> None:
        """Valida la calidad de los metadatos generados."""
        warnings = []
        errores = []
        
        # Validar metadatos SEO
        if metadatos.seo_metadata:
            if not metadatos.seo_metadata.titulo_seo:
                warnings.append("Título SEO vacío")
            
            if not metadatos.seo_metadata.descripcion_seo:
                warnings.append("Descripción SEO vacía")
            
            if len(metadatos.seo_metadata.titulo_seo) > 60:
                warnings.append("Título SEO excede 60 caracteres")
            
            if len(metadatos.seo_metadata.descripcion_seo) > 155:
                warnings.append("Descripción SEO excede 155 caracteres")
        
        # Validar descripciones
        if not metadatos.descripciones:
            errores.append("No se generaron descripciones")
        
        # Validar JSON-LD
        if not metadatos.json_ld:
            warnings.append("JSON-LD no generado")
        
        # Actualizar metadatos con resultados de validación
        metadatos.warnings.extend(warnings)
        metadatos.errores.extend(errores)
        
        if errores:
            raise MetadataGenerationError(f"Validation failed: {', '.join(errores)}")
    
    def _is_cached(self, componente_id: str) -> bool:
        """Verifica si el resultado está en cache."""
        return componente_id in self._generation_cache
    
    def _get_cached_result(self, componente_id: str) -> MetadatosGenerados:
        """Obtiene resultado del cache."""
        return self._generation_cache[componente_id]["result"]
    
    def _cache_result(self, componente_id: str, metadatos: MetadatosGenerados) -> None:
        """Guarda resultado en cache."""
        self._generation_cache[componente_id] = {
            "result": metadatos,
            "timestamp": datetime.now()
        }
    
    def _extraer_beneficio_principal(self, componente: Dict[str, Any], audiencia: AudienciaTarget) -> str:
        """Extrae el beneficio principal según la audiencia."""
        if "material_info" in componente:
            material_props = componente["material_info"]
            
            if audiencia == AudienciaTarget.TECNICA:
                return f"precision técnica y durabilidad {material_props.get('durabilidad_rating', 'superior')}/10"
            elif audiencia == AudienciaTarget.LUJO:
                return f"exclusividad y elegancia suprema"
            elif audiencia == AudienciaTarget.COMERCIAL:
                return f"calidad premium y estilo atemporal"
        
        return "calidad excepcional y diseño innovador"
    
    def _generar_call_to_action(self, componente: Dict[str, Any], audiencia: AudienciaTarget) -> str:
        """Genera call-to-action apropiado."""
        cta_mapping = {
            AudienciaTarget.TECNICA: "Descubre las especificaciones técnicas completas",
            AudienciaTarget.LUJO: "Reserva tu pieza exclusiva",
            AudienciaTarget.COMERCIAL: "Añade a tu colección",
            AudienciaTarget.JOVEN: "Explora en 3D",
            AudienciaTarget.PROFESIONAL: "Solicita información detallada",
            AudienciaTarget.ENTHUSIAST: "Descubre más detalles"
        }
        
        return cta_mapping.get(audiencia, "Descubre más")
    
    def _formatear_dimensiones(self, componente: Dict[str, Any]) -> str:
        """Formatea las dimensiones para presentación."""
        dims = componente.get("dimensiones", {})
        if not dims:
            return "No especificado"
        
        formatted = []
        for key, value in dims.items():
            formatted.append(f"{key}: {value}mm")
        
        return ", ".join(formatted)
    
    def _formatear_peso(self, componente: Dict[str, Any]) -> str:
        """Formatea el peso para presentación."""
        peso = componente.get("peso")
        if peso:
            return f"{peso}g"
        return "No especificado"
    
    def _extraer_caracteristicas_tecnicas(self, componente: Dict[str, Any]) -> List[str]:
        """Extrae características técnicas relevantes."""
        caracteristicas = []
        
        if componente.get("resistencia_agua"):
            caracteristicas.append(f"WR {componente['resistencia_agua']}m")
        
        if componente.get("resistencia_rayado"):
            caracteristicas.append(f"Resistencia rayado {componente['resistencia_rayado']}/10")
        
        if componente.get("material_info", {}).get("durabilidad_rating"):
            caracteristicas.append(f"Durabilidad {componente['material_info']['durabilidad_rating']}/10")
        
        return caracteristicas
    
    def _determinar_uso_recomendado(self, componente: Dict[str, Any]) -> List[str]:
        """Determina usos recomendados basados en características."""
        usos = []
        
        # Basado en resistencia al agua
        if componente.get("resistencia_agua", 0) >= 100:
            usos.append("deportivo")
        
        # Basado en estilo visual
        estilos = componente.get("estilo_visual", [])
        if "elegante" in estilos or "lujo" in estilos:
            usos.append("formal")
        
        if "deportivo" in estilos:
            usos.append("daily_wear")
        
        # Basado en material
        if "material_info" in componente:
            mercados = componente["material_info"].get("mercados_objetivo", [])
            usos.extend(mercados)
        
        return list(set(usos))
    
    def _determinar_mercado_objetivo(self, componente: Dict[str, Any]) -> List[str]:
        """Determina el mercado objetivo del componente."""
        mercados = []
        
        # Basado en precio relativo del material
        if "material_info" in componente:
            precio_rel = componente["material_info"].get("precio_segment", "medio")
            if precio_rel == "lujo":
                mercados.append("premium")
            elif precio_rel == "premium":
                mercados.append("mid_premium")
            else:
                mercados.append("mainstream")
        
        # Basado en estilo
        estilos = componente.get("estilo_visual", [])
        if "lujo" in estilos:
            mercados.append("luxury")
        
        if "deportivo" in estilos:
            mercados.append("sport")
        
        if "tecnico" in estilos:
            mercados.append("technical")
        
        return list(set(mercados))
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del cache."""
        total_requests = self._cache_stats["hits"] + self._cache_stats["misses"]
        hit_rate = (self._cache_stats["hits"] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "generation_cache": {
                "entries": len(self._generation_cache),
                "hits": self._cache_stats["hits"],
                "misses": self._cache_stats["misses"],
                "hit_rate": f"{hit_rate:.2f}%"
            },
            "component_stats": self.gemini_client.get_cache_stats()
        }
    
    async def batch_generate_metadata(
        self, 
        componentes: List[ComponenteReloj],
        audiencias: List[AudienciaTarget] = None,
        max_concurrent: int = 5
    ) -> Dict[str, MetadatosGenerados]:
        """
        Genera metadatos para múltiples componentes de forma batch.
        
        Args:
            componentes: Lista de componentes a procesar
            audiencias: Audiencias objetivo
            max_concurrent: Máximo de operaciones concurrentes
            
        Returns:
            Diccionario con resultados por componente_id
        """
        resultados = {}
        
        # Crear semaphore para controlar concurrencia
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_component(componente: ComponenteReloj):
            async with semaphore:
                try:
                    metadatos = await self.generar_metadatos_completos(
                        componente, audiencias
                    )
                    return componente.id, metadatos
                except Exception as e:
                    self.logger.error(f"Error procesando {componente.id}: {e}")
                    return componente.id, None
        
        # Procesar todos los componentes
        tasks = [process_component(comp) for comp in componentes]
        resultados_raw = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Compilar resultados
        for resultado in resultados_raw:
            if isinstance(resultado, Exception):
                self.logger.error(f"Error en batch processing: {resultado}")
                continue
            
            componente_id, metadatos = resultado
            if metadatos:
                resultados[componente_id] = metadatos
        
        self.logger.info(f"Procesados {len(resultados)}/{len(componentes)} componentes exitosamente")
        return resultados
    
    async def health_check(self) -> Dict[str, Any]:
        """Verifica el estado de todos los componentes."""
        gemini_health = await self.gemini_client.health_check()
        
        return {
            "status": "healthy" if gemini_health["status"] == "healthy" else "degraded",
            "components": {
                "gemini_client": gemini_health,
                "material_normalizer": {"status": "healthy"},
                "content_templates": {"status": "healthy"},
                "seo_optimizer": {"status": "healthy"}
            },
            "cache_stats": self.get_cache_stats(),
            "timestamp": datetime.now().isoformat()
        }
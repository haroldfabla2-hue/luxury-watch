"""
Templates de Contenido para el Agente 6 de Metadatos y SEO.

Proporciona plantillas predefinidas para diferentes tipos de contenido,
audiencias y formatos de salida, optimizadas para componentes de reloj.
"""

import json
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from .agent_types import AudienciaTarget, TipoDescripcion, TipoComponente


@dataclass
class TemplateStructure:
    """Estructura de una plantilla de contenido."""
    name: str
    description: str
    target_audience: AudienciaTarget
    content_type: TipoDescripcion
    max_length: int
    required_fields: List[str]
    optional_fields: List[str]
    template_text: str
    seo_keywords: List[str]
    call_to_action: Optional[str] = None
    tone: str = "neutral"
    language: str = "es"


class ContentTemplates:
    """
    Gestor de plantillas de contenido para diferentes audiencias y tipos.
    
    Proporciona plantillas optimizadas para:
    - Descripciones SEO
    - Contenido comercial
    - Información técnica
    - Marketing de lujo
    - Redes sociales
    - Catálogos
    """
    
    def __init__(self):
        """Inicializa las plantillas de contenido."""
        self.templates = self._initialize_templates()
        self.seo_formats = self._initialize_seo_formats()
        self.json_ld_templates = self._initialize_json_ld_templates()
    
    def _initialize_templates(self) -> Dict[str, TemplateStructure]:
        """Inicializa todas las plantillas disponibles."""
        templates = {}
        
        # Templates SEO
        templates["seo_basic"] = TemplateStructure(
            name="SEO Básico",
            description="Template básico para meta descriptions y títulos SEO",
            target_audience=AudienciaTarget.COMERCIAL,
            content_type=TipoDescripcion.SEO,
            max_length=160,
            required_fields=["product_name", "material", "key_feature"],
            optional_fields=["collection", "style", "color"],
            template_text="""
            <h1>{product_name}</h1>
            <p>Descubre {product_name} en {material}, {key_feature}. 
            {collection_text} {style_text}Perfecto para {target_market}.</p>
            """,
            seo_keywords=["{material}", "{product_type}", "reloj", "premium", "lujo"]
        )
        
        # Templates comerciales
        templates["commercial_appeal"] = TemplateStructure(
            name="Apelación Comercial",
            description="Template enfocado en beneficios y llamada a la acción",
            target_audience=AudienciaTarget.COMERCIAL,
            content_type=TipoDescripcion.COMERCIAL,
            max_length=300,
            required_fields=["product_name", "material", "primary_benefit"],
            optional_fields=["warranty", "origin", "craftsmanship"],
            template_text="""
            Experimenta la excelencia con {product_name}. Crafted in {material}, 
            este {product_type} ofrece {primary_benefit} que define la verdadera 
            sofisticación. {origin_text} {craftsmanship_text}
            
            ✓ {benefit_1}
            ✓ {benefit_2}
            ✓ {benefit_3}
            
            {call_to_action}
            """,
            seo_keywords=["calidad", "premium", "diseño", "elegancia", "exclusividad"]
        )
        
        # Templates técnicos
        templates["technical_specs"] = TemplateStructure(
            name="Especificaciones Técnicas",
            description="Template para audiencias técnicas y coleccionistas",
            target_audience=AudienciaTarget.TECNICA,
            content_type=TipoDescripcion.TECNICA,
            max_length=500,
            required_fields=["material", "dimensions", "weight", "features"],
            optional_fields=["certification", "testing", "standards"],
            template_text="""
            ESPECIFICACIONES TÉCNICAS
            
            Material: {material}
            Dimensiones: {dimensions}
            Peso: {weight}
            Acabado: {finish}
            
            CARACTERÍSTICAS TÉCNICAS:
            {features}
            
            {certification_text}
            {testing_text}
            
            Este componente cumple con {standards} y representa la cúspide 
            de la ingeniería relojera moderna.
            """,
            seo_keywords=["especificaciones", "technical", "engineering", "precision", "quality"]
        )
        
        # Templates de lujo
        templates["luxury_experience"] = TemplateStructure(
            name="Experiencia de Lujo",
            description="Template premium para mercado de lujo",
            target_audience=AudienciaTarget.LUJO,
            content_type=TipoDescripcion.LUJO,
            max_length=400,
            required_fields=["product_name", "material", "heritage", "craftsmanship"],
            optional_fields=["limited_edition", "signature", "collection_story"],
            template_text="""
            {product_name} representa la quintaesencia del arte relojero. 
            Elaborado en {material} por maestros artesanos, este tiempo-atemporal 
            piece cuenta una historia de {heritage}.
            
            {limited_edition_text} Cada detalle refleja décadas de 
            {craftsmanship}, desde {signature_element} hasta el acabado final 
            que define el lujo supremo.
            
            {collection_story_text}
            
            Una verdadera obra de arte wearable.
            """,
            seo_keywords=["lujo", "luxury", "heritage", "artisanal", "timeless", "exclusive"]
        )
        
        # Templates para redes sociales
        templates["social_media"] = TemplateStructure(
            name="Redes Sociales",
            description="Template optimizado para redes sociales",
            target_audience=AudienciaTarget.JOVEN,
            content_type=TipoDescripcion.SOCIAL_MEDIA,
            max_length=280,  # Twitter limit
            required_fields=["product_name", "visual_feature", "lifestyle"],
            optional_fields=["hashtags", "mention", "location"],
            template_text="""
            ✨ {product_name}
            
            {visual_feature} meets {lifestyle} ✨
            
            {lifestyle_description}
            
            {hashtags}
            """,
            seo_keywords=["style", "trend", "lifestyle", "fashion", "modern"],
            call_to_action="Discover more 👆"
        )
        
        # Templates de catálogo
        templates["catalog_listing"] = TemplateStructure(
            name="Listado Catálogo",
            description="Template para catálogos y listas de productos",
            target_audience=AudienciaTarget.COMERCIAL,
            content_type=TipoDescripcion.CATALOGO,
            max_length=200,
            required_fields=["product_name", "material", "key_spec"],
            optional_fields=["price_range", "availability", "collection"],
            template_text="""
            <div class="product-listing">
                <h3>{product_name}</h3>
                <p class="material">{material}</p>
                <p class="specs">{key_spec}</p>
                <p class="price">{price_range}</p>
                <p class="availability">{availability}</p>
            </div>
            """,
            seo_keywords=["catálogo", "producto", "disponible", "colección"]
        )
        
        return templates
    
    def _initialize_seo_formats(self) -> Dict[str, Dict[str, str]]:
        """Inicializa formatos SEO específicos."""
        return {
            "meta_title": {
                "template": "{product_name} - {material} Premium | {brand}",
                "max_length": 60,
                "description": "Título optimizado para SERP"
            },
            "meta_description": {
                "template": "Descubre {product_name} en {material}. {key_benefit}. {call_to_action} Envío gratuito.",
                "max_length": 155,
                "description": "Meta description para resultados de búsqueda"
            },
            "open_graph_title": {
                "template": "{product_name} - La Elección del Lujo",
                "max_length": 95,
                "description": "Título para Open Graph"
            },
            "open_graph_description": {
                "template": "Experimenta la perfección con {product_name}. Crafted in {material} para quienes appreciate la excelencia.",
                "max_length": 200,
                "description": "Descripción para Open Graph"
            },
            "twitter_card_title": {
                "template": "{product_name} | {brand}",
                "max_length": 70,
                "description": "Título para Twitter Cards"
            },
            "twitter_card_description": {
                "template": "Descubre {product_name}. {key_feature} en {material}.",
                "max_length": 200,
                "description": "Descripción para Twitter Cards"
            },
            "json_ld_title": {
                "template": "{product_name} - {material}",
                "max_length": 100,
                "description": "Título para Schema.org"
            },
            "json_ld_description": {
                "template": "{product_name} elaborado en {material}. {key_benefit} y {key_feature}.",
                "max_length": 160,
                "description": "Descripción para Schema.org"
            }
        }
    
    def _initialize_json_ld_templates(self) -> Dict[str, Dict[str, Any]]:
        """Inicializa plantillas JSON-LD para Schema.org."""
        return {
            "product_basic": {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": "{product_name}",
                "description": "{product_description}",
                "image": ["{image_url}"],
                "brand": {
                    "@type": "Brand",
                    "name": "{brand_name}"
                },
                "material": "{material}",
                "color": "{color}",
                "category": "Watch Component"
            },
            "product_with_offers": {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": "{product_name}",
                "description": "{product_description}",
                "image": ["{image_url}"],
                "brand": {
                    "@type": "Brand",
                    "name": "{brand_name}"
                },
                "material": "{material}",
                "color": "{color}",
                "category": "Watch Component",
                "offers": {
                    "@type": "Offer",
                    "price": "{price}",
                    "priceCurrency": "EUR",
                    "availability": "https://schema.org/InStock",
                    "seller": {
                        "@type": "Organization",
                        "name": "{seller_name}"
                    }
                }
            },
            "product_with_reviews": {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": "{product_name}",
                "description": "{product_description}",
                "image": ["{image_url}"],
                "brand": {
                    "@type": "Brand",
                    "name": "{brand_name}"
                },
                "material": "{material}",
                "color": "{color}",
                "category": "Watch Component",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "{rating}",
                    "reviewCount": "{review_count}"
                }
            }
        }
    
    def get_template(
        self, 
        template_name: str, 
        audience: Optional[AudienciaTarget] = None
    ) -> Optional[TemplateStructure]:
        """
        Obtiene una plantilla específica.
        
        Args:
            template_name: Nombre de la plantilla
            audience: Audiencia específica (opcional)
            
        Returns:
            TemplateStructure o None si no existe
        """
        template = self.templates.get(template_name)
        
        if template and audience and template.target_audience != audience:
            # Buscar plantilla equivalente para la audiencia
            alt_name = f"{template_name}_{audience.value}"
            template = self.templates.get(alt_name, template)
        
        return template
    
    def get_seo_format(self, format_name: str) -> Optional[Dict[str, str]]:
        """Obtiene un formato SEO específico."""
        return self.seo_formats.get(format_name)
    
    def get_json_ld_template(self, template_name: str) -> Optional[Dict[str, Any]]:
        """Obtiene una plantilla JSON-LD."""
        return self.json_ld_templates.get(template_name)
    
    def generate_seo_content(
        self, 
        template_name: str, 
        data: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Genera contenido SEO usando una plantilla.
        
        Args:
            template_name: Nombre de la plantilla SEO
            data: Datos para reemplazar en la plantilla
            
        Returns:
            Contenido SEO generado
        """
        format_template = self.get_seo_format(template_name)
        if not format_template:
            raise ValueError(f"Template SEO '{template_name}' not found")
        
        template = format_template["template"]
        max_length = format_template["max_length"]
        
        # Reemplazar placeholders
        content = template
        for key, value in data.items():
            placeholder = "{" + key + "}"
            if placeholder in content:
                content = content.replace(placeholder, str(value))
        
        # Truncar si excede longitud máxima
        if len(content) > max_length:
            content = content[:max_length-3] + "..."
        
        return {
            "content": content,
            "length": len(content),
            "max_length": max_length,
            "template_used": template_name
        }
    
    def generate_json_ld(
        self, 
        template_name: str, 
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Genera JSON-LD usando una plantilla.
        
        Args:
            template_name: Nombre de la plantilla JSON-LD
            data: Datos para la plantilla
            
        Returns:
            JSON-LD generado como diccionario
        """
        template = self.get_json_ld_template(template_name)
        if not template:
            raise ValueError(f"JSON-LD template '{template_name}' not found")
        
        # Función recursiva para reemplazar placeholders
        def replace_placeholders(obj):
            if isinstance(obj, dict):
                return {k: replace_placeholders(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [replace_placeholders(item) for item in obj]
            elif isinstance(obj, str):
                result = obj
                for key, value in data.items():
                    placeholder = "{" + key + "}"
                    if placeholder in result:
                        result = result.replace(placeholder, str(value))
                return result
            else:
                return obj
        
        return replace_placeholders(template)
    
    def generate_content_from_template(
        self, 
        template_name: str, 
        data: Dict[str, Any],
        audience: Optional[AudienciaTarget] = None
    ) -> Dict[str, Any]:
        """
        Genera contenido completo desde una plantilla.
        
        Args:
            template_name: Nombre de la plantilla
            data: Datos para la plantilla
            audience: Audiencia objetivo
            
        Returns:
            Contenido generado con metadatos
        """
        template = self.get_template(template_name, audience)
        if not template:
            raise ValueError(f"Template '{template_name}' not found")
        
        # Reemplazar placeholders en el template
        content = template.template_text
        for key, value in data.items():
            placeholder = "{" + key + "}"
            if placeholder in content:
                content = content.replace(placeholder, str(value))
        
        # Limpiar placeholders no reemplazados
        content = re.sub(r'\{[^}]+\}', '', content)
        content = re.sub(r'\n\s*\n', '\n\n', content)
        content = content.strip()
        
        # Truncar si excede longitud máxima
        if len(content) > template.max_length:
            content = content[:template.max_length-3] + "..."
        
        return {
            "content": content,
            "template_name": template_name,
            "audience": audience.value if audience else template.target_audience.value,
            "content_type": template.content_type.value,
            "length": len(content),
            "max_length": template.max_length,
            "tone": template.tone,
            "seo_keywords": template.seo_keywords,
            "call_to_action": template.call_to_action
        }
    
    def get_templates_by_audience(
        self, 
        audience: AudienciaTarget
    ) -> List[TemplateStructure]:
        """Obtiene todas las plantillas para una audiencia específica."""
        return [
            template for template in self.templates.values() 
            if template.target_audience == audience
        ]
    
    def get_templates_by_type(
        self, 
        content_type: TipoDescripcion
    ) -> List[TemplateStructure]:
        """Obtiene todas las plantillas de un tipo específico."""
        return [
            template for template in self.templates.values() 
            if template.content_type == content_type
        ]
    
    def get_available_templates(self) -> Dict[str, Dict[str, Any]]:
        """Obtiene lista de todas las plantillas disponibles."""
        return {
            name: {
                "description": template.description,
                "audience": template.target_audience.value,
                "type": template.content_type.value,
                "max_length": template.max_length,
                "required_fields": template.required_fields
            }
            for name, template in self.templates.items()
        }
    
    def create_custom_template(
        self,
        name: str,
        description: str,
        template_text: str,
        audience: AudienciaTarget,
        content_type: TipoDescripcion,
        max_length: int = 500,
        required_fields: Optional[List[str]] = None,
        optional_fields: Optional[List[str]] = None,
        seo_keywords: Optional[List[str]] = None,
        call_to_action: Optional[str] = None,
        tone: str = "neutral"
    ) -> TemplateStructure:
        """
        Crea una plantilla personalizada.
        
        Args:
            name: Nombre de la plantilla
            description: Descripción
            template_text: Texto de la plantilla
            audience: Audiencia objetivo
            content_type: Tipo de contenido
            max_length: Longitud máxima
            required_fields: Campos requeridos
            optional_fields: Campos opcionales
            seo_keywords: Keywords SEO
            call_to_action: Llamada a la acción
            tone: Tono del contenido
            
        Returns:
            TemplateStructure creada
        """
        template = TemplateStructure(
            name=name,
            description=description,
            target_audience=audience,
            content_type=content_type,
            max_length=max_length,
            required_fields=required_fields or [],
            optional_fields=optional_fields or [],
            template_text=template_text,
            seo_keywords=seo_keywords or [],
            call_to_action=call_to_action,
            tone=tone
        )
        
        self.templates[name] = template
        return template
    
    def export_templates(self) -> Dict[str, Any]:
        """Exporta todas las plantillas para configuración."""
        return {
            "templates": {
                name: {
                    "name": template.name,
                    "description": template.description,
                    "target_audience": template.target_audience.value,
                    "content_type": template.content_type.value,
                    "max_length": template.max_length,
                    "template_text": template.template_text,
                    "seo_keywords": template.seo_keywords,
                    "call_to_action": template.call_to_action,
                    "tone": template.tone,
                    "required_fields": template.required_fields,
                    "optional_fields": template.optional_fields
                }
                for name, template in self.templates.items()
            },
            "seo_formats": self.seo_formats,
            "json_ld_templates": self.json_ld_templates
        }
    
    def validate_template_data(
        self, 
        template_name: str, 
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Valida que los datos cumplan con los requisitos de una plantilla.
        
        Args:
            template_name: Nombre de la plantilla
            data: Datos a validar
            
        Returns:
            Resultado de la validación
        """
        template = self.get_template(template_name)
        if not template:
            return {
                "valid": False,
                "errors": [f"Template '{template_name}' not found"],
                "warnings": []
            }
        
        errors = []
        warnings = []
        
        # Verificar campos requeridos
        for field in template.required_fields:
            if field not in data or not data[field]:
                errors.append(f"Required field '{field}' is missing or empty")
        
        # Verificar campos con placeholders en el template
        placeholders = re.findall(r'\{([^}]+)\}', template.template_text)
        for placeholder in placeholders:
            if placeholder not in data:
                warnings.append(f"Placeholder '{placeholder}' not provided")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "missing_fields": [
                field for field in template.required_fields 
                if field not in data or not data[field]
            ]
        }
    
    def optimize_template_for_seo(
        self, 
        template_name: str, 
        target_keywords: List[str],
        audience: AudienciaTarget
    ) -> Dict[str, Any]:
        """
        Optimiza una plantilla para SEO con keywords específicas.
        
        Args:
            template_name: Nombre de la plantilla
            target_keywords: Keywords objetivo
            audience: Audiencia target
            
        Returns:
            Plantilla optimizada
        """
        template = self.get_template(template_name, audience)
        if not template:
            return {"error": f"Template '{template_name}' not found"}
        
        # Añadir keywords al template
        optimized_keywords = list(set(template.seo_keywords + target_keywords))
        
        # Análisis de densidad de keywords (simplificado)
        template_text = template.template_text
        keyword_density = {}
        
        for keyword in target_keywords:
            count = template_text.lower().count(keyword.lower())
            density = (count / len(template_text.split())) * 100 if template_text else 0
            keyword_density[keyword] = {
                "count": count,
                "density": round(density, 2)
            }
        
        return {
            "original_template": template_name,
            "optimized_keywords": optimized_keywords,
            "keyword_density_analysis": keyword_density,
            "seo_recommendations": self._generate_seo_recommendations(
                template, target_keywords
            ),
            "optimized_template": template._replace(
                seo_keywords=optimized_keywords
            )
        }
    
    def _generate_seo_recommendations(
        self, 
        template: TemplateStructure, 
        keywords: List[str]
    ) -> List[str]:
        """Genera recomendaciones de SEO para una plantilla."""
        recommendations = []
        
        # Análisis de longitud
        if template.max_length < 120:
            recommendations.append("Considera aumentar la longitud máxima para más palabras clave")
        elif template.max_length > 300:
            recommendations.append("Considera reducir la longitud máxima para mejor engagement")
        
        # Análisis de keywords
        if len(template.seo_keywords) < 5:
            recommendations.append("Añade más keywords relevantes al template")
        
        # Análisis de call-to-action
        if not template.call_to_action:
            recommendations.append("Añade una call-to-action para mejorar conversión")
        
        return recommendations


# Instancia global para uso fácil
content_templates = ContentTemplates()
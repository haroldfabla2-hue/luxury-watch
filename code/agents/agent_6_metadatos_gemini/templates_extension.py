"""
Extensión de Templates para el Agente 6 de Metadatos y SEO.

Templates adicionales especializados para diferentes casos de uso
y audiencias específicas en el mercado de relojes de lujo.

Funcionalidades incluidas:
- Templates para mercados específicos (Asia, Europa, América)
- Templates para plataformas de e-commerce
- Templates para contenido multimedia
- Templates para marketing estacional
- Templates para contenido educativo

Autor: Sistema de IA Avanzado para LuxuryWatch
Fecha: 2025-11-06
Versión: 1.0.0
"""

from typing import Dict, List, Any
from dataclasses import dataclass


@dataclass
class ExtendedTemplate:
    """Template extendido con funcionalidades avanzadas."""
    name: str
    category: str
    target_market: str
    content_structure: Dict[str, Any]
    seo_elements: Dict[str, List[str]]
    cultural_adaptations: Dict[str, str]
    multimedia_elements: Dict[str, str]
    seasonal_variants: Dict[str, str]


class TemplatesExtension:
    """
    Extensión avanzada de templates para casos de uso específicos.
    
    Proporciona templates optimizados para:
    - Mercados geográficos específicos
    - Plataformas de e-commerce especializadas
    - Contenido multimedia y audiovisual
    - Marketing estacional y eventos
    - Contenido educativo y tutoriales
    - Colaboraciones y partnerships
    """
    
    def __init__(self):
        """Inicializa la extensión de templates."""
        self.geo_templates = self._initialize_geo_templates()
        self.ecommerce_templates = self._initialize_ecommerce_templates()
        self.multimedia_templates = self._initialize_multimedia_templates()
        self.seasonal_templates = self._initialize_seasonal_templates()
        self.educational_templates = self._initialize_educational_templates()
        self.partnership_templates = self._initialize_partnership_templates()
    
    def _initialize_geo_templates(self) -> Dict[str, ExtendedTemplate]:
        """Inicializa templates específicos para mercados geográficos."""
        return {
            "asia_premium": ExtendedTemplate(
                name="Asia Premium Market",
                category="geographic",
                target_market="asia",
                content_structure={
                    "opening": " Harmonía entre tradición y innovación",
                    "heritage_focus": "Tradición relojera japonesa y suiza combinada",
                    "quality_emphasis": "Precisión milimétrica y calidad suprema",
                    "cultural_values": ["harmonía", "perfeción", "maestría"]
                },
                seo_elements={
                    "primary_keywords": ["reloj lujo", "precisión", "artesanía"],
                    "secondary_keywords": ["swiss made", "japanese precision", "harmonía"],
                    "local_terms": ["正確性", "伝統", "職人技"]
                },
                cultural_adaptations={
                    "tone": "respeta las tradiciones asiáticas de excelencia",
                    "visual_style": "minimalista con elementos tradicionales",
                    "color_schemes": "dorado, negro, blanco - colores de prestigio",
                    "language_notes": "Enfatizar precisión y armonía"
                },
                multimedia_elements={
                    "video_content": " close-ups de mecanismos en movimiento",
                    "image_style": "macrofotografía con iluminación suave",
                    "animation_style": "movimientos fluidos tipo origami digital"
                },
                seasonal_variants={
                    "chinese_new_year": "ediciones con elementos dorados especiales",
                    "golden_week": "colecciones de temporada limitadas",
                    "single_day": "ofertas exclusivas de día soltero"
                }
            ),
            
            "europe_luxury": ExtendedTemplate(
                name="European Luxury Market",
                category="geographic", 
                target_market="europe",
                content_structure={
                    "opening": "La sofisticación europea en cada detalle",
                    "heritage_focus": "Herencia relojera suiza y europea",
                    "quality_emphasis": "Artesanía tradicional y innovación moderna",
                    "cultural_values": ["elegancia", "tradición", "prestigio"]
                },
                seo_elements={
                    "primary_keywords": ["luxury watch", "swiss craftsmanship", "heritage"],
                    "secondary_keywords": ["horology", "timepiece", "prestige"],
                    "local_terms": ["savoir-faire", "haute horlogerie", "tradition"]
                },
                cultural_adaptations={
                    "tone": "elegante y refinado, con referencias históricas",
                    "visual_style": "clásico europeo con toques modernos",
                    "color_schemes": "azul marino, dorado, champán, burdeos",
                    "language_notes": "Uso de términos en francés/italiano cuando sea apropiado"
                },
                multimedia_elements={
                    "video_content": "storytelling sobre la historia de la marca",
                    "image_style": "fotografía lifestyle en ubicaciones icónicas",
                    "animation_style": "transiciones suaves estilo europeo"
                },
                seasonal_variants={
                    "fashion_week": "ediciones colaborativas con diseñadores",
                    "christmas": "colecciones festivas premium",
                    "graduation_season": "regalos de graduación de lujo"
                }
            ),
            
            "america_sport": ExtendedTemplate(
                name="American Sports Market",
                category="geographic",
                target_market="america",
                content_structure={
                    "opening": "Precisión americana meets Swiss excellence",
                    "heritage_focus": "Innovación americana y tradición suiza",
                    "quality_emphasis": "Performance y durabilidad",
                    "cultural_values": ["innovación", "performance", "authorship"]
                },
                seo_elements={
                    "primary_keywords": ["luxury sports watch", "performance", "american made"],
                    "secondary_keywords": ["durability", "innovation", "premium"],
                    "local_terms": ["game changer", "cutting edge", "top tier"]
                },
                cultural_adaptations={
                    "tone": "dinámico y directo, enfocado en beneficios",
                    "visual_style": "moderno y deportivo",
                    "color_schemes": "negro, azul, rojo, plata",
                    "language_notes": "Lenguaje directo y orientado a resultados"
                },
                multimedia_elements={
                    "video_content": "acción deportiva y lifestyle activo",
                    "image_style": "fotografía action y outdoor",
                    "animation_style": "dinámico con efectos gráficos"
                },
                seasonal_variants={
                    "super_bowl": "ediciones especiales deportivas",
                    "christmas": "gift guides y presentaciones premium",
                    "back_to_school": "regalos para jóvenes profesionales"
                }
            )
        }
    
    def _initialize_ecommerce_templates(self) -> Dict[str, ExtendedTemplate]:
        """Inicializa templates para plataformas de e-commerce."""
        return {
            "amazon_luxury": ExtendedTemplate(
                name="Amazon Luxury Template",
                category="ecommerce",
                target_market="amazon",
                content_structure={
                    "title": "{product_name} - Premium {material} Timepiece",
                    "bullets": [
                        "Swiss precision engineering",
                        "Premium {material} construction", 
                        "Elegant {style} design",
                        "Water resistant up to {water_resistance}m",
                        "Authentic warranty included"
                    ],
                    "description": "Experience luxury with this meticulously crafted timepiece..."
                },
                seo_elements={
                    "backend_keywords": "luxury watch, premium timepiece, swiss made, elegant design",
                    "a_content": "Detailed technical specifications and usage scenarios",
                    "title_optimization": "Include material, style, and key features"
                },
                cultural_adaptations={
                    "amazon_focus": "Optimizado para search ranking y conversion",
                    "competitive_analysis": "Benchmarking con productos similares",
                    "price_positioning": "Positioned in premium tier"
                },
                multimedia_elements={
                    "product_images": "Multiple angles, lifestyle shots, detail close-ups",
                    "video_content": "Unboxing experience y demonstration",
                    "360_view": "Interactive product rotation"
                },
                seasonal_variants={
                    "prime_day": "Special pricing y bundle offers",
                    "black_friday": "Deep discounts y limited editions",
                    "holiday_season": "Gift packaging y presentation"
                }
            ),
            
            "shopify_boutique": ExtendedTemplate(
                name="Shopify Boutique Template",
                category="ecommerce",
                target_market="shopify",
                content_structure={
                    "page_title": "{collection_name} - Luxury Timepieces",
                    "product_description": "Rich HTML description with storytelling",
                    "featured_story": "Behind the scenes crafting process",
                    "craftsmanship_details": "Detailed artisan information"
                },
                seo_elements={
                    "meta_description": "Artisanal luxury timepieces with Swiss heritage",
                    "structured_data": "Product schema with rich snippets",
                    "blog_integration": "Content marketing integration"
                },
                cultural_adaptations={
                    "brand_story": "Emphasis on heritage y authenticity",
                    "luxury_positioning": "Premium pricing y exclusive feel",
                    "customer_experience": "White-glove service emphasis"
                },
                multimedia_elements={
                    "hero_video": "Brand story y craftsmanship",
                    "product_gallery": "Curated photography y lifestyle",
                    "social_proof": "Customer reviews y testimonials"
                },
                seasonal_variants={
                    "collection_launches": "Seasonal collection introductions",
                    "limited_editions": "Exclusive numbered pieces",
                    "anniversary_editions": "Special milestone celebrations"
                }
            )
        }
    
    def _initialize_multimedia_templates(self) -> Dict[str, ExtendedTemplate]:
        """Inicializa templates para contenido multimedia."""
        return {
            "youtube_watch_review": ExtendedTemplate(
                name="YouTube Watch Review Template",
                category="multimedia",
                target_market="youtube",
                content_structure={
                    "hook": "First 15 seconds grab attention",
                    "intro": "Product introduction y key highlights",
                    "main_content": "Detailed review segments",
                    "conclusion": "Final thoughts y recommendation"
                },
                seo_elements={
                    "title_optimization": "Watch Review: {Brand} {Model} - [Year]",
                    "tags": "luxury watch, review, swiss made, timepiece",
                    "description": "Comprehensive review with timestamps"
                },
                cultural_adaptations={
                    "creator_tone": "Authentic y knowledgeable",
                    "engagement_focus": "Community interaction y comments",
                    "educational_value": "Teaching watch appreciation"
                },
                multimedia_elements={
                    "video_structure": "Multiple camera angles, macro shots",
                    "audio_quality": "Professional narration y sound",
                    "graphics": "Technical diagrams y specifications overlay"
                },
                seasonal_variants={
                    "watch_week": "Special themed review week",
                    "christmas_gifts": "Holiday gift guide segments",
                    "baselworld_coverage": "Watch show exclusive coverage"
                }
            ),
            
            "instagram_story_series": ExtendedTemplate(
                name="Instagram Story Series Template",
                category="multimedia",
                target_market="instagram",
                content_structure={
                    "story_1": "Behind the scenes crafting",
                    "story_2": "Material spotlight",
                    "story_3": "Design process",
                    "story_4": "Final reveal",
                    "story_5": "Lifestyle integration"
                },
                seo_elements={
                    "hashtag_strategy": "Mix of branded y trending hashtags",
                    "engagement_tactics": "Polls, questions, y swipe-ups",
                    "cross_platform": "Integration with main feed"
                },
                cultural_adaptations={
                    "visual_appeal": "Highly visual y shareable content",
                    "storytelling": "Narrative arc across series",
                    "authenticity": "Behind-the-scenes y raw moments"
                },
                multimedia_elements={
                    "story_templates": "Consistent visual branding",
                    "music_integration": "Trending audio y brand sounds",
                    "interactive_elements": "Polls, questions, y quizzes"
                },
                seasonal_variants={
                    "fashion_week": "Show coverage y backstage access",
                    "product_launch": "Launch sequence y anticipation building",
                    "customer_features": "User-generated content integration"
                }
            )
        }
    
    def _initialize_seasonal_templates(self) -> Dict[str, ExtendedTemplate]:
        """Inicializa templates para marketing estacional."""
        return {
            "christmas_luxury": ExtendedTemplate(
                name="Christmas Luxury Campaign",
                category="seasonal",
                target_market="christmas",
                content_structure={
                    "campaign_theme": "The Gift of Time",
                    "hero_message": "This Christmas, give the gift that lasts forever",
                    "product_focus": "Limited edition holiday pieces",
                    "call_to_action": "Exclusive pre-order y gift wrapping"
                },
                seo_elements={
                    "seasonal_keywords": "christmas gift, luxury present, holiday watch",
                    "long_tail": "best luxury watch christmas gift 2025",
                    "local_seo": "Christmas shopping [city name]"
                },
                cultural_adaptations={
                    "christmas_spirit": "Warm, magical, y generous tone",
                    "gift_positioning": "Ultimate luxury gift presentation",
                    "family_focus": "Generational y heirloom positioning"
                },
                multimedia_elements={
                    "holiday_visuals": "Warm lighting, festive settings",
                    "gift_staging": "Elegant gift presentation y packaging",
                    "seasonal_music": "Classic holiday melodies"
                },
                seasonal_variants={
                    "black_friday": "Early bird pricing y exclusive access",
                    "cyber_monday": "Digital-first campaign y online exclusives",
                    "last_minute": "Express shipping y gift cards"
                }
            ),
            
            "valentines_day": ExtendedTemplate(
                name="Valentine's Day Romance Campaign",
                category="seasonal",
                target_market="valentines",
                content_structure={
                    "campaign_theme": "Time for Love",
                    "hero_message": "Express your love with timeless elegance",
                    "product_focus": "Romantic designs y couple's pieces",
                    "call_to_action": "Personalized engraving y romantic packaging"
                },
                seo_elements={
                    "romantic_keywords": "valentines gift, romantic watch, couples timepiece",
                    "gift_keywords": "best valentines gift for him/her",
                    "luxury_keywords": "luxury valentines present"
                },
                cultural_adaptations={
                    "romantic_tone": "Passionate, intimate, y emotionally engaging",
                    "couple_focus": "Perfect for pairs y matching pieces",
                    "romantic_settings": "Intimate y elegant backdrops"
                },
                multimedia_elements={
                    "romantic_visuals": "Soft lighting, rose petals, candles",
                    "couple_photography": "Romantic lifestyle shots",
                    "love_themes": "Hearts, romantic colors, intimate settings"
                },
                seasonal_variants={
                    "galentines": "Celebrating female friendship",
                    "last_minute": "Express love y digital love letters",
                    "anniversary": "Commemorating special milestones"
                }
            )
        }
    
    def _initialize_educational_templates(self) -> Dict[str, ExtendedTemplate]:
        """Inicializa templates para contenido educativo."""
        return {
            "watch_making_101": ExtendedTemplate(
                name="Watch Making Basics Tutorial",
                category="educational",
                target_market="beginners",
                content_structure={
                    "introduction": "Welcome to the fascinating world of horology",
                    "lesson_1": "Understanding watch components",
                    "lesson_2": "Movement types explained",
                    "lesson_3": "Materials y their properties",
                    "conclusion": "Your journey in watch appreciation begins"
                },
                seo_elements={
                    "educational_keywords": "watch making tutorial, horology basics, watch education",
                    "how_to_keywords": "how to choose a watch, watch buying guide",
                    "expert_keywords": "watch expert advice, horology masterclass"
                },
                cultural_adaptations={
                    "learning_focus": "Accessible y beginner-friendly approach",
                    "knowledge_building": "Progressive learning structure",
                    "community_aspect": "Encouraging questions y interaction"
                },
                multimedia_elements={
                    "animated_diagrams": "Exploded views y component animations",
                    "macro_videos": "Close-up detail shots",
                    "interactive_elements": "Clickable components y info hotspots"
                },
                seasonal_variants={
                    "watch_week": "Daily lesson series",
                    "baselworld": "Educational coverage of watch fair",
                    "watch_collector_month": "Monthly educational series"
                }
            ),
            
            "luxury_watch_care": ExtendedTemplate(
                name="Luxury Watch Care Guide",
                category="educational",
                target_market="owners",
                content_structure={
                    "introduction": "Preserving your investment y treasure",
                    "daily_care": "Routine maintenance y handling",
                    "professional_service": "When y how to service",
                    "storage_solutions": "Proper storage y display",
                    "troubleshooting": "Common issues y solutions"
                },
                seo_elements={
                    "care_keywords": "watch care, luxury watch maintenance, watch servicing",
                    "investment_keywords": "watch investment, maintaining watch value",
                    "professional_keywords": "watch repair, professional servicing"
                },
                cultural_adaptations={
                    "expert_guidance": "Professional y authoritative tone",
                    "investment_focus": "Emphasizing value preservation",
                    "detailed_instructions": "Step-by-step guidance"
                },
                multimedia_elements={
                    "professional_photos": "High-quality instructional imagery",
                    "service_videos": "Behind-the-scenes servicing footage",
                    "maintenance_schedules": "Visual maintenance calendars"
                },
                seasonal_variants={
                    "spring_cleaning": "Seasonal maintenance reminders",
                    "holiday_travel": "Travel y watch protection tips",
                    "anniversary_service": "Milestone service recommendations"
                }
            )
        }
    
    def _initialize_partnership_templates(self) -> Dict[str, ExtendedTemplate]:
        """Inicializa templates para colaboraciones y partnerships."""
        return {
            "influencer_collaboration": ExtendedTemplate(
                name="Influencer Partnership Template",
                category="partnership",
                target_market="influencer",
                content_structure={
                    "collaboration_overview": "Mutual benefit y brand alignment",
                    "content_requirements": "Specific deliverables y guidelines",
                    "brand_guidelines": "Visual y messaging consistency",
                    "performance_metrics": "Engagement y conversion tracking"
                },
                seo_elements={
                    "collaboration_keywords": "watch collaboration, luxury partnership",
                    "influencer_keywords": "watch influencer, luxury influencer",
                    "brand_keywords": "luxury brand collaboration"
                },
                cultural_adaptations={
                    "authenticity": "Genuine product integration y use",
                    "brand_alignment": "Matching values y aesthetics",
                    "audience_match": "Targeting compatible demographics"
                },
                multimedia_elements={
                    "co_created_content": "Joint content creation y creative input",
                    "brand_integration": "Natural product placement",
                    "storytelling": "Authentic brand story integration"
                },
                seasonal_vemplates={
                    "fashion_week": "Show coverage y front-row access",
                    "product_launch": "Exclusive preview y first access",
                    "anniversary": "Milestone celebration collaborations"
                }
            ),
            
            "retailer_partnership": ExtendedTemplate(
                name="Retailer Partnership Template",
                category="partnership",
                target_market="retail",
                content_structure={
                    "partnership_benefits": "Exclusive products y support",
                    "training_program": "Product knowledge y sales training",
                    "marketing_support": "Co-op advertising y promotional materials",
                    "performance_incentives": "Volume discounts y bonus programs"
                },
                seo_elements={
                    "retail_keywords": "luxury watch retailer, authorized dealer",
                    "partnership_keywords": "luxury brand partnership, retail collaboration",
                    "dealer_keywords": "authorized dealer, exclusive dealer"
                },
                cultural_adaptations={
                    "business_focus": "Professional y mutually beneficial",
                    "exclusive_access": "Privileged product y information access",
                    "training_focus": "Knowledge transfer y skill development"
                },
                multimedia_elements={
                    "retail_displays": "Window displays y in-store presentations",
                    "training_materials": "Product education y sales tools",
                    "co_marketing": "Joint promotional campaigns"
                },
                seasonal_variants={
                    "trade_shows": "Show specials y exclusive launches",
                    "holiday_seasons": "Gift guides y promotional support",
                    "anniversary_events": "Special dealer appreciation programs"
                }
            )
        }
    
    def get_template_by_category(self, category: str, template_name: str = None) -> Dict[str, Any]:
        """
        Obtiene template por categoría.
        
        Args:
            category: Categoría del template
            template_name: Nombre específico del template
            
        Returns:
            Template solicitado o todos los templates de la categoría
        """
        template_map = {
            "geographic": self.geo_templates,
            "ecommerce": self.ecommerce_templates,
            "multimedia": self.multimedia_templates,
            "seasonal": self.seasonal_templates,
            "educational": self.educational_templates,
            "partnership": self.partnership_templates
        }
        
        if category not in template_map:
            raise ValueError(f"Categoría '{category}' no encontrada")
        
        templates = template_map[category]
        
        if template_name:
            if template_name not in templates:
                raise ValueError(f"Template '{template_name}' no encontrado en categoría '{category}'")
            return self._serialize_template(templates[template_name])
        
        return {name: self._serialize_template(template) for name, template in templates.items()}
    
    def get_seasonal_variants(self, season: str, market: str = "global") -> Dict[str, Any]:
        """
        Obtiene variantes estacionales para una temporada específica.
        
        Args:
            season: Temporada (christmas, valentines, summer, etc.)
            market: Mercado objetivo
            
        Returns:
            Variantes estacionales disponibles
        """
        seasonal_content = {}
        
        # Buscar en templates estacionales
        for template_name, template in self.seasonal_templates.items():
            if season.lower() in template.seasonal_variants:
                seasonal_content[f"{template_name}_{season}"] = {
                    "template": self._serialize_template(template),
                    "seasonal_variant": template.seasonal_variants[season.lower()]
                }
        
        return seasonal_content
    
    def get_cultural_adaptations(self, target_market: str) -> Dict[str, Any]:
        """
        Obtiene adaptaciones culturales para un mercado objetivo.
        
        Args:
            target_market: Mercado geográfico objetivo
            
        Returns:
            Adaptaciones culturales específicas
        """
        adaptations = {}
        
        # Buscar en templates geográficos
        for template_name, template in self.geo_templates.items():
            if target_market.lower() in template.target_market.lower():
                adaptations[template_name] = {
                    "template_info": {
                        "name": template.name,
                        "category": template.category,
                        "target_market": template.target_market
                    },
                    "cultural_adaptations": template.cultural_adaptations,
                    "content_structure": template.content_structure,
                    "seo_elements": template.seo_elements
                }
        
        return adaptations
    
    def _serialize_template(self, template: ExtendedTemplate) -> Dict[str, Any]:
        """Convierte template a diccionario serializable."""
        return {
            "name": template.name,
            "category": template.category,
            "target_market": template.target_market,
            "content_structure": template.content_structure,
            "seo_elements": template.seo_elements,
            "cultural_adaptations": template.cultural_adaptations,
            "multimedia_elements": template.multimedia_elements,
            "seasonal_variants": template.seasonal_variants
        }
    
    def list_all_categories(self) -> List[str]:
        """Lista todas las categorías disponibles."""
        return ["geographic", "ecommerce", "multimedia", "seasonal", "educational", "partnership"]
    
    def get_templates_by_audience(self, audience_type: str) -> Dict[str, Any]:
        """
        Obtiene templates filtrados por tipo de audiencia.
        
        Args:
            audience_type: Tipo de audiencia
            
        Returns:
            Templates apropiados para la audiencia
        """
        audience_mapping = {
            "luxury_buyer": ["europe_luxury", "asia_premium", "luxury_boutique"],
            "tech_enthusiast": ["america_sport", "youtube_watch_review"],
            "collector": ["watch_making_101", "luxury_watch_care"],
            "gift_buyer": ["christmas_luxury", "valentines_day"],
            "social_media_user": ["instagram_story_series", "influencer_collaboration"],
            "retail_professional": ["retailer_partnership", "shopify_boutique"]
        }
        
        if audience_type not in audience_mapping:
            return {}
        
        relevant_templates = {}
        target_template_names = audience_mapping[audience_type]
        
        # Buscar en todas las categorías
        for category in self.list_all_categories():
            category_templates = self.get_template_by_category(category)
            for name, template_data in category_templates.items():
                if any(target in name.lower() for target in target_template_names):
                    relevant_templates[f"{category}_{name}"] = template_data
        
        return relevant_templates


# Funciones de utilidad para uso rápido
def get_seasonal_template(season: str, region: str = "global") -> Dict[str, Any]:
    """Obtiene template estacional específico."""
    extension = TemplatesExtension()
    return extension.get_seasonal_variants(season, region)


def get_cultural_template(market: str) -> Dict[str, Any]:
    """Obtiene template cultural específico."""
    extension = TemplatesExtension()
    return extension.get_cultural_adaptations(market)


def get_audience_template(audience: str) -> Dict[str, Any]:
    """Obtiene templates para audiencia específica."""
    extension = TemplatesExtension()
    return extension.get_templates_by_audience(audience)


def list_available_templates() -> Dict[str, List[str]]:
    """Lista todos los templates disponibles por categoría."""
    extension = TemplatesExtension()
    return {
        category: list(extension.get_template_by_category(category).keys())
        for category in extension.list_all_categories()
    }
"""
Agente 6: Generador de Metadatos y SEO con Gemini 2.0

Este agente especializado procesa componentes de reloj para generar:
- Descripciones atractivas en lenguaje natural
- Tags SEO y metadatos estructurados (JSON-LD)
- Keywords para marketing y búsqueda
- Descripciones para diferentes audiencias (técnica, comercial, lujo)
- Integración con sistema de metadatos 3D
- Optimización para motores de búsqueda

Autor: Sistema de IA Avanzado
Fecha: 2025-11-06
Versión: 1.0.0
"""

from .agent import AgenteMetadatosGemini
from .gemini_client import GeminiClient
from .metadata_generator import MetadataGenerator
from .seo_optimizer import SEOOptimizer
from .content_templates import ContentTemplates
from .material_normalizer import MaterialNormalizer
from .types import (
    ComponenteReloj,
    AudienciaTarget,
    TipoDescripcion,
    MetadatosGenerados
)

__version__ = "1.0.0"
__all__ = [
    "AgenteMetadatosGemini",
    "GeminiClient", 
    "MetadataGenerator",
    "SEOOptimizer",
    "ContentTemplates",
    "MaterialNormalizer",
    "ComponenteReloj",
    "AudienciaTarget",
    "TipoDescripcion",
    "MetadatosGenerados"
]
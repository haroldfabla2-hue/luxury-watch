"""
Tipos de datos y estructuras para el Agente 6 de Metadatos y SEO.

Define todas las clases y enums necesarios para el procesamiento
de componentes de reloj y generación de metadatos.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Union
from enum import Enum
from datetime import datetime
import uuid


class TipoComponente(Enum):
    """Tipos de componentes de reloj disponibles."""
    CAJA = "caja"
    BISEL = "bisel" 
    ESFERA = "esfera"
    CORREA = "correa"
    CORONA = "corona"
    CRISTAL = "cristal"
    MANECILLAS = "manecillas"
    INDICES = "indices"
    MECHANISM = "mechanism"
    PLACA_BASE = "placa_base"
    RUBIES = "rubies"
    RESORTE = "resorte"
    ENGRANAJES = "engranajes"


class MaterialBase(Enum):
    """Materiales base para componentes de reloj."""
    ACERO_316L = "acero_316l"
    ACERO_904L = "acero_904l"
    ORO_18K = "oro_18k"
    ORO_ROJO = "oro_rojo"
    ORO_BLANCO = "oro_blanco"
    PLATINO = "platino"
    TITANIO = "titanio"
    CERAMICA = "ceramica"
    CARBONO = "carbono"
    CUERO = "cuero"
    CAUCHO = "caucho"
    ACERO_DLC = "acero_dlc"
    PVD = "pvd"
    ROSE_GOLD = "rose_gold"


class AcabadoSuperficie(Enum):
    """Tipos de acabados de superficie."""
    BRUSHED = "brushed"  # Cepillado
    POLISHED = "polished"  # Pulido
    MIRROR = "mirror"  # Espejo
    SANDWICH = "sandwich"  # Sándwich
    SANDBLASTED = "sandblasted"  # Granallado
    GUILLOCHE = "guilloché"  # Guilloché
    PERLAGE = "perlage"  # Perlage
    SUNBURST = "sunburst"  # Rayos de sol
    LASER_ETCHED = "laser_etched"  # Grabado láser


class EstiloVisual(Enum):
    """Estilos visuales para clasificación de productos."""
    CLASICO = "clasico"
    MODERNO = "moderno"
    VINTAGE = "vintage"
    DEPORTIVO = "deportivo"
    ELEGANTE = "elegante"
    AVANT_GARDE = "avant_garde"
    MINIMALISTA = "minimalista"
    LUXURY = "luxury"
    TECHNICAL = "technical"


class AudienciaTarget(Enum):
    """Audiencias objetivo para diferentes tipos de descripciones."""
    TECNICA = "tecnica"  # Coleccionistas y técnicos
    COMERCIAL = "comercial"  # Compradores generales
    LUJO = "lujo"  # Mercado premium
    JOVEN = "joven"  # Millennials/Gen Z
    PROFESIONAL = "profesional"  # Ejecutivos
    ENTHUSIAST = "enthusiast"  # Aficionados


class TipoDescripcion(Enum):
    """Tipos de descripciones que se pueden generar."""
    SEO = "seo"
    MARKETING = "marketing"
    TECNICA = "tecnica"
    COMERCIAL = "comercial"
    LUJO = "lujo"
    SOCIAL_MEDIA = "social_media"
    CATALOGO = "catalogo"


class FormatoSalida(Enum):
    """Formatos de salida para metadatos."""
    JSON_LD = "json_ld"
    META_TAGS = "meta_tags"
    MICRODATA = "microdata"
    RDFA = "rdfa"
    CSV = "csv"
    XML = "xml"


@dataclass
class ComponenteReloj:
    """
    Representa un componente individual de reloj con todas sus características.
    """
    id: str
    tipo: TipoComponente
    nombre: str
    descripcion_tecnica: Optional[str] = None
    
    # Características físicas
    dimensiones: Optional[Dict[str, float]] = field(default_factory=dict)
    peso: Optional[float] = None
    material_base: Optional[MaterialBase] = None
    acabado_superficie: Optional[AcabadoSuperficie] = None
    
    # Características visuales
    color_principal: Optional[str] = None
    colores_secundarios: List[str] = field(default_factory=list)
    textura: Optional[str] = None
    patron: Optional[str] = None
    
    # Características funcionales
    resistencia_agua: Optional[int] = None
    resistencia_rayado: Optional[int] = None
    facilidad_mantenimiento: Optional[str] = None
    
    # Estilo y categorización
    estilo_visual: List[EstiloVisual] = field(default_factory=list)
    coleccion: Optional[str] = None
    referencia: Optional[str] = None
    
    # Datos 3D
    modelo_3d_url: Optional[str] = None
    texturas_alta_res: List[str] = field(default_factory=list)
    materiales_pbr: Dict[str, Any] = field(default_factory=dict)
    
    # Metadatos adicionales
    fecha_creacion: datetime = field(default_factory=datetime.now)
    version: str = "1.0.0"
    estado: str = "activo"
    
    def get_properties_summary(self) -> Dict[str, Any]:
        """Obtiene un resumen de las propiedades del componente."""
        return {
            "tipo": self.tipo.value,
            "material": self.material_base.value if self.material_base else None,
            "acabado": self.acabado_superficie.value if self.acabado_superficie else None,
            "color": self.color_principal,
            "estilo": [s.value for s in self.estilo_visual],
            "dimensiones": self.dimensiones,
            "peso": self.peso
        }


@dataclass 
class KeywordsSEO:
    """Keywords optimizadas para SEO y marketing."""
    primarias: List[str] = field(default_factory=list)
    secundarias: List[str] = field(default_factory=list)
    long_tail: List[str] = field(default_factory=list)
    marca_keywords: List[str] = field(default_factory=list)
    competitor_keywords: List[str] = field(default_factory=list)
    trending_keywords: List[str] = field(default_factory=list)
    negativo_keywords: List[str] = field(default_factory=list)  # Para evitar


@dataclass
class MetadatosSEO:
    """Metadatos optimizados para motores de búsqueda."""
    titulo_seo: str
    descripcion_seo: str
    keywords: KeywordsSEO
    meta_tags: Dict[str, str] = field(default_factory=dict)
    open_graph_tags: Dict[str, str] = field(default_factory=dict)
    twitter_cards: Dict[str, str] = field(default_factory=dict)
    schema_org: Dict[str, Any] = field(default_factory=dict)
    alt_texts: Dict[str, str] = field(default_factory=dict)  # Por imagen/3D
    urls_canonicas: List[str] = field(default_factory=list)
    hreflang: Dict[str, str] = field(default_factory=dict)


@dataclass
class DescripcionAudiencia:
    """Descripción adaptada para una audiencia específica."""
    audiencia: AudienciaTarget
    titulo: str
    descripcion: str
    puntos_clave: List[str] = field(default_factory=list)
    call_to_action: Optional[str] = None
    tono: str = "profesional"
    longitud_caracteres: int = 0
    palabras_clave_densidad: Dict[str, float] = field(default_factory=dict)


@dataclass
class MetadatosGenerados:
    """
    Resultado completo de la generación de metadatos para un componente.
    """
    componente_id: str
    timestamp: datetime = field(default_factory=datetime.now)
    
    # Metadatos SEO
    seo_metadata: Optional[MetadatosSEO] = None
    
    # Descripciones por audiencia
    descripciones: List[DescripcionAudiencia] = field(default_factory=list)
    
    # Estructura JSON-LD
    json_ld: Dict[str, Any] = field(default_factory=dict)
    
    # Metadatos 3D
    metadata_3d: Dict[str, Any] = field(default_factory=dict)
    
    # Información adicional
    taxonomias: Dict[str, List[str]] = field(default_factory=dict)
    variantes_producto: List[Dict[str, Any]] = field(default_factory=list)
    relacionados: List[str] = field(default_factory=list)
    
    # Métricas y analytics
    palabras_clave_densidad: Dict[str, int] = field(default_factory=dict)
    legibilidad_score: Optional[float] = None
    seo_score: Optional[float] = None
    
    # Control de calidad
    version_gemini: str = "2.0"
    modelo_utilizado: str = "gemini-pro-exp"
    tokens_consumidos: int = 0
    tiempo_procesamiento: float = 0.0
    warnings: List[str] = field(default_factory=list)
    errores: List[str] = field(default_factory=list)


@dataclass
class TemplateConfig:
    """Configuración para templates de contenido."""
    audiencia_target: AudienciaTarget
    tipo_descripcion: TipoDescripcion
    longitud_minima: int = 50
    longitud_maxima: int = 500
    incluir_call_to_action: bool = True
    tono_marca: str = "elegante"
    incluir_tecnico: bool = False
    incluir_emocional: bool = True
    idioma: str = "es"
    region: str = "ES"
    incluir_trending: bool = False


@dataclass
class ConfiguracionAgente:
    """Configuración general del agente de metadatos."""
    # Configuración Gemini
    gemini_api_key: str
    modelo_default: str = "gemini-pro-exp"
    temperatura: float = 0.7
    max_tokens: int = 2048
    
    # Configuración SEO
    target_keywords_density: float = 2.5  # %
    min_descripcion_length: int = 120
    max_descripcion_length: int = 160
    
    # Configuración de calidad
    min_seo_score: float = 70.0
    min_legibilidad_score: float = 60.0
    
    # Templates y estilos
    estilos_disponibles: List[str] = field(default_factory=lambda: [
        "elegante", "técnico", "comercial", "lujo", "moderno", "vintage"
    ])
    
    # Rate limiting
    requests_per_minute: int = 60
    requests_per_hour: int = 1000
    
    # Cache
    enable_cache: bool = True
    cache_ttl_hours: int = 24
    
    # Logging
    log_level: str = "INFO"
    enable_verbose_logging: bool = False


# Tipos de utilidad para funciones
ComponenteInput = Union[ComponenteReloj, Dict[str, Any]]
AudienciaInput = Union[AudienciaTarget, str]
ConfiguracionInput = Union[ConfiguracionAgente, Dict[str, Any]]

# Constantes de negocio
MERCADOS_SOPORTADOS = ["ES", "US", "UK", "FR", "DE", "IT"]
IDIOMAS_SOPORTADOS = ["es", "en", "fr", "de", "it"]
TONOS_MARCA = ["elegante", "moderno", "clásico", "técnico", "emocional"]
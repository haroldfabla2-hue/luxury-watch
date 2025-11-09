"""
Tipos de Datos para el Agente 6 de Metadatos y SEO.

Definiciones completas de tipos, enums y estructuras de datos
para el sistema generador de metadatos y SEO.

Autor: Sistema de IA Avanzado para LuxuryWatch
Fecha: 2025-11-06
Versión: 1.0.0
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from datetime import datetime


# ===== ENUMS PRINCIPALES =====

class TipoComponente(Enum):
    """Tipos de componentes de reloj soportados."""
    CAJA = "caja"                   # Caja del reloj
    BISEL = "bisel"                 # Bisel
    ESFERA = "esfera"              # Esfera/Dial
    CORREA = "correa"              # Correa
    CORONA = "corona"              # Corona
    CRISTAL = "cristal"            # Cristal
    MANECILLAS = "manecillas"      # Manecillas
    INDICES = "indices"            # Índices
    MECHANISM = "mechanism"        # Mecanismo
    PLACA_BASE = "placa_base"      # Placa base
    RUBIES = "rubies"             # Rubíes
    RESORTE = "resorte"           # Resorte
    ENGRANAJES = "engranajes"     # Engranajes
    CAJA_ESFERA = "caja_esfera"   # Caja con esfera integrada
    BISEL_INSERCION = "bisel_insercion"  # Inserción de bisel
    CORONA_PUSHERS = "corona_pushers"  # Corona con pushers


class MaterialBase(Enum):
    """Materiales base soportados para componentes."""
    ACERO_316L = "acero_316l"                # Acero inoxidable 316L
    ACERO_904L = "acero_904l"                # Acero premium 904L
    ORO_18K = "oro_18k"                     # Oro 18 quilates
    ORO_ROJO = "oro_rojo"                   # Oro rojo
    ORO_BLANCO = "oro_blanco"               # Oro blanco
    PLATINO = "platino"                     # Platino
    TITANIO = "titanio"                     # Titanio
    CERAMICA = "ceramica"                   # Cerámica avanzada
    CARBONO = "carbono"                     # Fibra de carbono
    CUERO = "cuero"                         # Cuero natural
    CAUCHO = "caucho"                       # Caucho
    ACERO_DLC = "acero_dlc"                 # Acero DLC
    PVD = "pvd"                             # PVD
    ROSE_GOLD = "rose_gold"                 # Rose gold
    BRONCE = "bronce"                       # Bronce
    ZIRCONIO = "zirconio"                   # Zirconio
    ALUMINIO = "aluminio"                   # Aluminio
    COMPOSITE = "composite"                 # Material compuesto


class AcabadoSuperficie(Enum):
    """Tipos de acabado de superficie."""
    BRUSHED = "brushed"             # Cepillado
    POLISHED = "polished"           # Pulido
    MIRROR = "mirror"               # Espejo
    SANDBLASTED = "sandblasted"     # Granallado
    GUILLOCHE = "guilloché"         # Guilloché
    PERLAGE = "perlage"             # Perlage
    SUNBURST = "sunburst"           # Rayos de sol
    LASER_ETCHED = "laser_etched"   # Grabado láser
    ETCHED = "etched"               # Grabado
    EMBOSSED = "embossed"           # Relieve
    MATTED = "matted"               # Mate
    SATINED = "satinated"           # Satinado


class EstiloVisual(Enum):
    """Estilos visuales y estéticos."""
    CLASICO = "clasico"             # Clásico
    MODERNO = "moderno"             # Moderno
    VINTAGE = "vintage"             # Vintage
    DEPORTIVO = "deportivo"         # Deportivo
    ELEGANTE = "elegante"           # Elegante
    AVANT_GARDE = "avant_garde"     # Avant-garde
    MINIMALISTA = "minimalista"     # Minimalista
    LUXURY = "luxury"               # Lujo
    TECHNICAL = "technical"         # Técnico
    ARTISANAL = "artisan"           # Artesanal
    INDUSTRIAL = "industrial"       # Industrial
    RETRO = "retro"                 # Retro


class AudienciaTarget(Enum):
    """Audiencias objetivo para el contenido."""
    TECNICA = "tecnica"             # Coleccionistas y técnicos
    COMERCIAL = "comercial"         # Compradores generales
    LUJO = "lujo"                   # Mercado premium
    JOVEN = "joven"                 # Millennials/Gen Z
    PROFESIONAL = "profesional"     # Ejecutivos
    ENTHUSIAST = "enthusiast"       # Aficionados
    INVERSOR = "inversor"           # Inversores
    REGALO = "regalo"               # Compradores de regalos


class TipoDescripcion(Enum):
    """Tipos de descripción de contenido."""
    SEO = "seo"                     # Meta descriptions y títulos
    COMERCIAL = "comercial"         # Contenido persuasivo
    TECNICA = "tecnica"             # Especificaciones técnicas
    LUJO = "lujo"                   # Marketing de lujo
    SOCIAL_MEDIA = "social_media"   # Redes sociales
    CATALOGO = "catalogo"           # Listados de productos
    EDUCATIVA = "educativa"         # Contenido educativo
    BLOG = "blog"                   # Artículos de blog
    EMAIL = "email"                 # Campañas de email


class PlataformaSocial(Enum):
    """Plataformas de redes sociales."""
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    LINKEDIN = "linkedin"
    TIKTOK = "tiktok"
    YOUTUBE = "youtube"
    PINTEREST = "pinterest"
    SNAPCHAT = "snapchat"


class MercadoGeografico(Enum):
    """Mercados geográficos objetivo."""
    GLOBAL = "global"
    EUROPA = "europa"
    NORTE_AMERICA = "norte_america"
    ASIA_PACIFICO = "asia_pacifico"
    CHINA = "china"
    JAPON = "japon"
    REINO_UNIDO = "reino_unido"
    ALEMANIA = "alemania"
    FRANCIA = "francia"
    ITALIA = "italia"
    SUIZA = "suiza"
    USA = "usa"
    CANADA = "canada"


class Temporada(Enum):
    """Temporadas y eventos especiales."""
    NAVIDAD = "navidad"
    SAN_VALENTIN = "san_valentin"
    DIA_MADRE = "dia_madre"
    DIA_PADRE = "dia_padre"
    BLACK_FRIDAY = "black_friday"
    CYBER_MONDAY = "cyber_monday"
    FASHION_WEEK = "fashion_week"
    BASELWORLD = "baselworld"
    VERANO = "verano"
    INVIERNO = "invierno"
    PRIMAVERA = "primavera"
    OTOÑO = "otoño"
    GRADUACION = "graduacion"
    ANIVERSARIO = "aniversario"


# ===== ESTRUCTURAS DE DATOS PRINCIPALES =====

@dataclass
class ComponenteReloj:
    """Representa un componente de reloj con toda su información."""
    
    # Identificación básica
    id: str                                 # ID único del componente
    tipo: TipoComponente                     # Tipo de componente
    nombre: str                              # Nombre del componente
    descripcion_tecnica: str = None          # Descripción técnica detallada
    
    # Características físicas
    material_base: MaterialBase = None       # Material principal
    acabado_superficie: AcabadoSuperficie = None  # Acabado de superficie
    color_principal: str = None              # Color principal
    colores_secundarios: List[str] = field(default_factory=list)  # Colores secundarios
    dimensiones: Dict[str, float] = field(default_factory=dict)   # Dimensiones (largo, ancho, alto, etc.)
    peso: float = None                       # Peso en gramos
    
    # Características visuales
    textura: str = None                      # Textura del material
    patron: str = None                       # Patrón o diseño superficial
    
    # Características funcionales
    resistencia_agua: int = None             # Resistencia al agua en metros
    resistencia_rayado: int = None           # Resistencia al rayado (1-10)
    facilidad_mantenimiento: str = None      # Facilidad de mantenimiento
    
    # Estilo y categorización
    estilo_visual: List[EstiloVisual] = field(default_factory=list)  # Estilos aplicables
    coleccion: str = None                    # Colección a la que pertenece
    referencia: str = None                   # Número de referencia
    
    # Datos 3D y multimedia
    modelo_3d_url: str = None                # URL del modelo 3D
    texturas_alta_res: List[str] = field(default_factory=list)  # URLs de texturas
    materiales_pbr: Dict[str, Any] = field(default_factory=dict)  # Materiales PBR para renderizado
    imagenes_referencia: List[str] = field(default_factory=list)  # URLs de imágenes de referencia
    
    # Metadatos adicionales
    fecha_creacion: datetime = field(default_factory=datetime.now)
    fecha_actualizacion: datetime = field(default_factory=datetime.now)
    version: str = "1.0.0"
    tags: List[str] = field(default_factory=list)
    
    # Información comercial
    precio_referencia: float = None          # Precio de referencia
    disponibilidad: str = "disponible"       # Estado de disponibilidad
    certificaciones: List[str] = field(default_factory=list)  # Certificaciones (Swiss Made, etc.)
    
    def actualizar_timestamp(self):
        """Actualiza el timestamp de modificación."""
        self.fecha_actualizacion = datetime.now()


@dataclass
class MetadatosSEO:
    """Metadatos SEO para un componente."""
    
    titulo_seo: str                          # Título optimizado para SEO
    descripcion_seo: str                     # Meta description optimizada
    keywords_primarias: List[str] = field(default_factory=list)  # Keywords principales
    keywords_secundarias: List[str] = field(default_factory=list)  # Keywords secundarias
    keywords_long_tail: List[str] = field(default_factory=list)  # Keywords de cola larga
    url_canonica: str = None                 # URL canónica
    og_title: str = None                     # Open Graph title
    og_description: str = None               # Open Graph description
    og_image: str = None                     # Open Graph image
    twitter_card: str = "summary_large_image"  # Twitter Card type
    schema_type: str = "Product"             # Tipo de schema.org
    
    # Métricas de optimización
    longitud_titulo: int = 0                 # Longitud del título
    longitud_descripcion: int = 0            # Longitud de la descripción
    densidad_keywords: float = 0.0           # Densidad de keywords
    legibilidad_score: float = 0.0           # Score de legibilidad


@dataclass 
class DescripcionAudiencia:
    """Descripción específica para una audiencia."""
    
    audiencia: AudienciaTarget               # Audiencia objetivo
    tipo_descripcion: TipoDescripcion        # Tipo de descripción
    contenido: str                           # Contenido generado
    longitud: int = 0                        # Longitud del contenido
    tone: str = "neutral"                    # Tono del contenido
    call_to_action: str = None               # Llamada a la acción
    keywords: List[str] = field(default_factory=list)  # Keywords específicas
    puntos_clave: List[str] = field(default_factory=list)  # Puntos clave destacados
    seo_score: float = 0.0                   # Score SEO
    readability_score: float = 0.0           # Score de legibilidad
    
    # Metadatos de generación
    template_usado: str = None               # Template utilizado
    tokens_consumidos: int = 0               # Tokens de IA consumidos
    tiempo_generacion: float = 0.0           # Tiempo de generación
    fecha_generacion: datetime = field(default_factory=datetime.now)


@dataclass
class MetadatosGenerados:
    """Resultado completo de la generación de metadatos."""
    
    componente_id: str                       # ID del componente procesado
    timestamp: datetime = field(default_factory=datetime.now)
    
    # Metadatos SEO principales
    seo_metadata: Optional[MetadatosSEO] = None
    
    # Descripciones por audiencia
    descripciones: List[DescripcionAudiencia] = field(default_factory=list)
    
    # Estructura JSON-LD
    json_ld: Dict[str, Any] = field(default_factory=dict)
    
    # Metadatos 3D específicos
    metadata_3d: Dict[str, Any] = field(default_factory=dict)
    
    # Taxonomías y categorización
    taxonomias: Dict[str, List[str]] = field(default_factory=dict)
    variantes_producto: List[Dict[str, Any]] = field(default_factory=list)
    productos_relacionados: List[str] = field(default_factory=list)
    
    # Métricas y analytics
    palabras_clave_densidad: Dict[str, int] = field(default_factory=dict)
    legibilidad_score: Optional[float] = None
    seo_score: Optional[float] = None
    score_global: float = 0.0                # Score global de calidad
    
    # Información de generación
    version_gemini: str = "2.0-experimental"
    modelo_utilizado: str = "gemini-pro-exp"
    tokens_consumidos: int = 0
    tiempo_procesamiento: float = 0.0
    cache_hit: bool = False                  # Si se sirvió desde cache
    
    # Control de calidad y alertas
    warnings: List[str] = field(default_factory=list)
    errores: List[str] = field(default_factory=list)
    sugerencias: List[str] = field(default_factory=list)
    
    # Configuración utilizada
    configuracion_usada: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ConfiguracionAgente:
    """Configuración completa del agente."""
    
    # API Configuration
    gemini_api_key: str                      # API key para Gemini via OpenRouter
    modelo_default: str = "gemini-pro-exp"   # Modelo por defecto
    temperatura: float = 0.7                 # Temperatura de generación (0.0-2.0)
    max_tokens: int = 2048                   # Máximo de tokens por request
    
    # SEO Configuration
    target_keywords_density: float = 2.5     # Densidad objetivo de keywords (%)
    min_descripcion_length: int = 120        # Longitud mínima de descripción
    max_descripcion_length: int = 155        # Longitud máxima de descripción
    min_seo_score: float = 70.0              # Score SEO mínimo aceptable
    min_legibilidad_score: float = 60.0      # Score de legibilidad mínimo
    
    # Quality Control
    min_contenido_calidad: float = 75.0      # Score mínimo de calidad general
    enable_content_validation: bool = True   # Habilitar validación de contenido
    max_reintentos: int = 3                  # Máximo de reintentos por fallo
    
    # Cache Configuration
    enable_cache: bool = True                # Habilitar cache
    cache_ttl_hours: int = 24                # TTL del cache en horas
    cache_size_limit: int = 1000             # Límite de entradas en cache
    
    # Logging Configuration
    log_level: str = "INFO"                  # Nivel de logging
    enable_verbose_logging: bool = False     # Logging verboso
    log_to_file: bool = False                # Logging a archivo
    log_file_path: str = "logs/agent_6.log"  # Ruta del archivo de log
    
    # Rate Limiting
    requests_per_minute: int = 60            # Requests por minuto
    requests_per_hour: int = 1000            # Requests por hora
    requests_per_day: int = 10000            # Requests por día
    
    # Batch Processing
    batch_size_default: int = 5              # Tamaño de lote por defecto
    max_concurrent_requests: int = 5         # Máximo requests concurrentes
    request_timeout_seconds: int = 30        # Timeout por request
    
    # Output Configuration
    output_format: str = "json"              # Formato de salida (json, yaml)
    include_raw_responses: bool = False      # Incluir respuestas raw de IA
    save_intermediate_results: bool = True   # Guardar resultados intermedios
    
    # Development Options
    use_mock_responses: bool = False         # Usar respuestas mock para desarrollo
    mock_response_dir: str = "mock_responses"  # Directorio de respuestas mock
    development_mode: bool = False           # Modo desarrollo
    
    # Integration Settings
    webhook_url: str = None                  # URL para webhooks
    database_connection: str = None          # Conexión a base de datos
    external_apis: Dict[str, str] = field(default_factory=dict)  # APIs externas


# ===== TIPOS AUXILIARES =====

@dataclass
class KeywordAnalysis:
    """Análisis de keywords para un componente."""
    keyword: str                             # La keyword analizada
    density: float                           # Densidad en el contenido
    occurrences: int                         # Número de ocurrencias
    positions: List[int] = field(default_factory=list)  # Posiciones en el texto
    prominence: str = "medium"               # Prominencia (high, medium, low)
    context_relevance: float = 0.0           # Relevancia del contexto


@dataclass
class SEOScoreBreakdown:
    """Desglose detallado del score SEO."""
    overall_score: float                     # Score general
    title_score: float                       # Score del título
    description_score: float                 # Score de la descripción
    keyword_score: float                     # Score de keywords
    content_score: float                     # Score del contenido
    structure_score: float                   # Score de estructura
    readability_score: float                 # Score de legibilidad
    issues: List[str] = field(default_factory=list)  # Problemas identificados
    recommendations: List[str] = field(default_factory=list)  # Recomendaciones


@dataclass
class MaterialInfo:
    """Información detallada sobre un material."""
    nombre_normalizado: str                  # Nombre normalizado del material
    tipo: str                                # Tipo de material
    propiedades: Dict[str, Any] = field(default_factory=dict)  # Propiedades físicas
    durabilidad: int = 5                     # Durabilidad (1-10)
    resistencia_rayado: int = 5              # Resistencia al rayado (1-10)
    facilidad_mantenimiento: str = "medium"  # Facilidad de mantenimiento
    costo_relativo: str = "medium"           # Costo relativo
    keywords_seo: List[str] = field(default_factory=list)  # Keywords específicas


@dataclass
class SocialMediaContent:
    """Contenido específico para redes sociales."""
    plataforma: PlataformaSocial             # Plataforma específica
    contenido_principal: str                 # Contenido principal
    hashtags: List[str] = field(default_factory=list)  # Hashtags sugeridos
    call_to_action: str = None               # Llamada a la acción
    contenido_adicional: Dict[str, str] = field(default_factory=dict)  # Contenido adicional específico
    timing_recomendado: str = None           # Timing recomendado
    audiencia_objetivo: str = None           # Audiencia objetivo


@dataclass
class JSONLDObject:
    """Objeto JSON-LD estructurado."""
    context: str = "https://schema.org/"     # Contexto de schema.org
    type: str = "Product"                    # Tipo de schema
    data: Dict[str, Any] = field(default_factory=dict)  # Datos estructurados
    additional_properties: List[Dict[str, Any]] = field(default_factory=list)  # Propiedades adicionales


# ===== TIPOS DE RESPUESTA =====

@dataclass
class AgentResponse:
    """Respuesta estándar del agente."""
    success: bool                            # Si la operación fue exitosa
    data: Any = None                         # Datos de respuesta
    error: str = None                        # Mensaje de error si falla
    metadata: Dict[str, Any] = field(default_factory=dict)  # Metadatos adicionales
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class BatchProcessResult:
    """Resultado de procesamiento en lote."""
    total_items: int                         # Total de elementos
    successful_items: int                    # Elementos procesados exitosamente
    failed_items: int                        # Elementos que fallaron
    results: Dict[str, Any] = field(default_factory=dict)  # Resultados por ID
    errors: Dict[str, str] = field(default_factory=dict)  # Errores por ID
    processing_time: float = 0.0             # Tiempo total de procesamiento
    summary: Dict[str, Any] = field(default_factory=dict)  # Resumen de estadísticas


# ===== FUNCIONES DE UTILIDAD =====

def get_tipos_componente() -> List[TipoComponente]:
    """Obtiene lista de todos los tipos de componente."""
    return list(TipoComponente)


def get_materiales_disponibles() -> List[MaterialBase]:
    """Obtiene lista de todos los materiales disponibles."""
    return list(MaterialBase)


def get_audiencias_soportadas() -> List[AudienciaTarget]:
    """Obtiene lista de todas las audiencias soportadas."""
    return list(AudienciaTarget)


def validar_componente(componente: ComponenteReloj) -> List[str]:
    """Valida un componente y retorna lista de errores."""
    errores = []
    
    if not componente.id:
        errores.append("ID es requerido")
    
    if not componente.nombre:
        errores.append("Nombre es requerido")
    
    if not componente.tipo:
        errores.append("Tipo de componente es requerido")
    
    if componente.material_base and not isinstance(componente.material_base, MaterialBase):
        errores.append("Material base debe ser un MaterialBase válido")
    
    return errores


def normalizar_keywords(keywords: List[str]) -> List[str]:
    """Normaliza una lista de keywords."""
    return [kw.strip().lower() for kw in keywords if kw.strip()]


def calcular_seo_score_simple(contenido: str, keywords: List[str]) -> float:
    """Calcula un score SEO simple."""
    if not contenido or not keywords:
        return 0.0
    
    words = contenido.lower().split()
    total_words = len(words)
    
    if total_words == 0:
        return 0.0
    
    score = 0.0
    
    # Evaluar presencia de keywords
    for keyword in keywords:
        keyword_count = contenido.lower().count(keyword.lower())
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
    
    return min(100.0, score)


# ===== CONSTANTES GLOBALES =====

# Configuraciones por defecto
DEFAULT_CONFIG = ConfiguracionAgente(
    gemini_api_key="your-gemini-api-key",
    modelo_default="gemini-pro-exp",
    temperatura=0.7,
    max_tokens=2048,
    enable_cache=True,
    cache_ttl_hours=24,
    log_level="INFO"
)

# Límites y restricciones
LIMITS = {
    "max_component_name_length": 100,
    "max_description_length": 2000,
    "max_keywords_per_component": 20,
    "max_audiences_per_component": 6,
    "max_batch_size": 50,
    "max_concurrent_requests": 10
}

# Mapeos de compatibilidad
MATERIAL_COMPATIBILITY = {
    MaterialBase.ACERO_316L: [EstiloVisual.CLASICO, EstiloVisual.ELEGANTE, EstiloVisual.MODERNO],
    MaterialBase.ORO_18K: [EstiloVisual.LUXURY, EstiloVisual.ELEGANTE, EstiloVisual.VINTAGE],
    MaterialBase.TITANIO: [EstiloVisual.TECHNICAL, EstiloVisual.DEPORTIVO, EstiloVisual.MODERNO],
    MaterialBase.CARBONO: [EstiloVisual.DEPORTIVO, EstiloVisual.TECHNICAL, EstiloVisual.AVANT_GARDE],
    MaterialBase.CERAMICA: [EstiloVisual.MODERNO, EstiloVisual.ELEGANTE, EstiloVisual.LUXURY]
}

# Configuraciones por audiencia
AUDIENCE_CONFIGS = {
    AudienciaTarget.TECNICA: {
        "content_length": 400,
        "focus": "specifications",
        "tone": "technical",
        "keywords_style": "technical"
    },
    AudienciaTarget.COMERCIAL: {
        "content_length": 300,
        "focus": "benefits",
        "tone": "persuasive",
        "keywords_style": "commercial"
    },
    AudienciaTarget.LUJO: {
        "content_length": 350,
        "focus": "exclusivity",
        "tone": "sophisticated",
        "keywords_style": "luxury"
    }
}
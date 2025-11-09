"""
Configuración del Agente 6 de Metadatos y SEO.

Este archivo contiene configuraciones predefinidas para diferentes entornos
y casos de uso del agente generador de metadatos.
"""

import os
from typing import Dict, Any
from .agent_types import ConfiguracionAgente, AudienciaTarget


def create_development_config() -> ConfiguracionAgente:
    """Configuración para desarrollo y testing."""
    return ConfiguracionAgente(
        gemini_api_key=os.getenv("GEMINI_API_KEY", "your-gemini-api-key"),
        modelo_default="gemini-pro-exp",
        temperatura=0.8,  # Más creatividad para desarrollo
        max_tokens=1024,  # Tokens menores para pruebas
        
        # Configuración SEO relajada para desarrollo
        target_keywords_density=2.0,
        min_descripcion_length=100,
        max_descripcion_length=150,
        
        # Calidad mínima más baja para desarrollo
        min_seo_score=50.0,
        min_legibilidad_score=40.0,
        
        # Configuraciones de desarrollo
        enable_cache=False,  # Cache deshabilitado para desarrollo
        cache_ttl_hours=1,  # TTL corto para desarrollo
        log_level="DEBUG",
        enable_verbose_logging=True,
        
        # Rate limiting más permisivo para desarrollo
        requests_per_minute=30,
        requests_per_hour=500
    )


def create_production_config() -> ConfiguracionAgente:
    """Configuración para producción."""
    return ConfiguracionAgente(
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        modelo_default="gemini-pro-exp",
        temperatura=0.7,  # Balance entre creatividad y consistencia
        max_tokens=2048,
        
        # Configuración SEO estricta para producción
        target_keywords_density=2.5,
        min_descripcion_length=120,
        max_descripcion_length=155,
        
        # Calidad mínima alta para producción
        min_seo_score=70.0,
        min_legibilidad_score=60.0,
        
        # Configuraciones de producción
        enable_cache=True,
        cache_ttl_hours=24,
        log_level="INFO",
        enable_verbose_logging=False,
        
        # Rate limiting conservativo para producción
        requests_per_minute=60,
        requests_per_hour=1000
    )


def create_testing_config() -> ConfiguracionAgente:
    """Configuración para testing automatizado."""
    return ConfiguracionAgente(
        gemini_api_key="test-key",  # API key de prueba
        modelo_default="gemini-pro-exp",
        temperatura=0.1,  # Máxima consistencia para tests
        max_tokens=512,   # Tokens mínimos para tests
        
        # Configuración SEO básica
        target_keywords_density=2.0,
        min_descripcion_length=50,
        max_descripcion_length=100,
        
        # Calidad mínima muy baja para tests
        min_seo_score=30.0,
        min_legibilidad_score=30.0,
        
        # Configuraciones de testing
        enable_cache=False,
        cache_ttl_hours=0,  # No cache en tests
        log_level="WARNING",  # Mínimo logging en tests
        enable_verbose_logging=False,
        
        # Sin rate limiting para tests
        requests_per_minute=1000,
        requests_per_hour=10000
    )


def create_performance_config() -> ConfiguracionAgente:
    """Configuración optimizada para rendimiento y velocidad."""
    return ConfiguracionAgente(
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        modelo_default="gemini-pro-exp",
        temperatura=0.5,  # Menos creatividad, más velocidad
        max_tokens=1024,  # Tokens optimizados
        
        # Configuración SEO optimizada
        target_keywords_density=3.0,  # Más keywords para mejor SEO
        min_descripcion_length=120,
        max_descripcion_length=155,
        
        # Calidad estricta
        min_seo_score=75.0,
        min_legibilidad_score=65.0,
        
        # Configuración de rendimiento
        enable_cache=True,
        cache_ttl_hours=48,  # Cache más largo
        log_level="WARNING",
        enable_verbose_logging=False,
        
        # Rate limiting optimizado
        requests_per_minute=100,  # Más requests por minuto
        requests_per_hour=2000
    )


def get_config_by_environment(environment: str = "development") -> ConfiguracionAgente:
    """
    Obtiene configuración basada en el entorno.
    
    Args:
        environment: "development", "production", "testing", "performance"
        
    Returns:
        ConfiguracionAgente configurada
    """
    config_map = {
        "development": create_development_config,
        "production": create_production_config, 
        "testing": create_testing_config,
        "performance": create_performance_config
    }
    
    config_factory = config_map.get(environment, create_development_config)
    return config_factory()


# Configuraciones predefinidas por caso de uso
PREDEFINED_CONFIGS = {
    "default": create_development_config,
    "production": create_production_config,
    "testing": create_testing_config,
    "performance": create_performance_config
}


def get_predefined_config(config_name: str) -> ConfiguracionAgente:
    """
    Obtiene configuración predefinida por nombre.
    
    Args:
        config_name: Nombre de la configuración predefinida
        
    Returns:
        ConfiguracionAgente
    """
    if config_name not in PREDEFINED_CONFIGS:
        raise ValueError(f"Configuración '{config_name}' no encontrada. "
                        f"Configuraciones disponibles: {list(PREDEFINED_CONFIGS.keys())}")
    
    return PREDEFINED_CONFIGS[config_name]()


# Templates de configuración específicos
def create_luxury_config() -> ConfiguracionAgente:
    """Configuración específica para mercado de lujo."""
    config = create_production_config()
    config.temperatura = 0.6  # Menos creatividad, más consistencia de marca
    config.min_seo_score = 80.0  # Score SEO más alto para mercado premium
    config.min_legibilidad_score = 70.0
    return config


def create_mass_market_config() -> ConfiguracionAgente:
    """Configuración específica para mercado masivo."""
    config = create_production_config()
    config.temperatura = 0.8  # Más creatividad para variedad
    config.min_seo_score = 60.0  # Score SEO más relajado
    config.min_legibilidad_score = 55.0
    return config


def create_technical_config() -> ConfiguracionAgente:
    """Configuración específica para contenido técnico."""
    config = create_production_config()
    config.temperatura = 0.3  # Máxima consistencia para contenido técnico
    config.max_tokens = 3072  # Más tokens para contenido técnico extenso
    return config


# Configuraciones para diferentes audiencias
AUDIENCE_SPECIFIC_CONFIGS = {
    AudienciaTarget.TECNICA: create_technical_config,
    AudienciaTarget.LUJO: create_luxury_config,
    AudienciaTarget.COMERCIAL: create_mass_market_config,
    AudienciaTarget.JOVEN: create_mass_market_config,
    AudienciaTarget.PROFESIONAL: create_luxury_config,
    AudienciaTarget.ENTHUSIAST: create_luxury_config
}


def get_config_for_audience(audience: AudienciaTarget) -> ConfiguracionAgente:
    """
    Obtiene configuración específica para una audiencia.
    
    Args:
        audience: Audiencia objetivo
        
    Returns:
        ConfiguracionAgente optimizada para la audiencia
    """
    config_factory = AUDIENCE_SPECIFIC_CONFIGS.get(audience, create_production_config)
    return config_factory()


# Configuraciones para diferentes tipos de contenido
CONTENT_TYPE_CONFIGS = {
    "seo_optimized": create_performance_config,
    "social_media": create_development_config,
    "technical_specs": create_technical_config,
    "luxury_copy": create_luxury_config,
    "bulk_processing": create_performance_config
}


def get_config_for_content_type(content_type: str) -> ConfiguracionAgente:
    """
    Obtiene configuración específica para un tipo de contenido.
    
    Args:
        content_type: Tipo de contenido a generar
        
    Returns:
        ConfiguracionAgente optimizada para el tipo de contenido
    """
    if content_type not in CONTENT_TYPE_CONFIGS:
        return create_production_config()  # Fallback a configuración por defecto
    
    return CONTENT_TYPE_CONFIGS[content_type]()


# Validación de configuraciones
def validate_config(config: ConfiguracionAgente) -> Dict[str, Any]:
    """
    Valida una configuración y retorna información sobre su estado.
    
    Args:
        config: Configuración a validar
        
    Returns:
        Dict con resultado de la validación
    """
    validation_result = {
        "is_valid": True,
        "warnings": [],
        "errors": []
    }
    
    # Validar API key
    if not config.gemini_api_key or config.gemini_api_key == "your-gemini-api-key":
        validation_result["warnings"].append("API key no configurada correctamente")
    
    # Validar parámetros de modelo
    if not 0.0 <= config.temperatura <= 2.0:
        validation_result["errors"].append("Temperatura debe estar entre 0.0 y 2.0")
    
    if config.max_tokens <= 0:
        validation_result["errors"].append("Max tokens debe ser mayor que 0")
    
    # Validar SEO parameters
    if not 0.0 <= config.target_keywords_density <= 10.0:
        validation_result["warnings"].append("Target keywords density fuera de rango recomendado (0-10%)")
    
    # Validar lengths
    if config.min_descripcion_length >= config.max_descripcion_length:
        validation_result["errors"].append("Min descripción length debe ser menor que max")
    
    # Validar scores
    if not 0.0 <= config.min_seo_score <= 100.0:
        validation_result["errors"].append("Min SEO score debe estar entre 0 y 100")
    
    if not 0.0 <= config.min_legibilidad_score <= 100.0:
        validation_result["errors"].append("Min legibilidad score debe estar entre 0 y 100")
    
    # Validar rate limiting
    if config.requests_per_minute <= 0:
        validation_result["errors"].append("Requests per minute debe ser mayor que 0")
    
    if validation_result["errors"]:
        validation_result["is_valid"] = False
    
    return validation_result


def export_config_template() -> Dict[str, Any]:
    """Exporta template de configuración para referencia."""
    return {
        "gemini_api_key": "tu-api-key-aqui",
        "modelo_default": "gemini-pro-exp",
        "temperatura": 0.7,
        "max_tokens": 2048,
        "target_keywords_density": 2.5,
        "min_descripcion_length": 120,
        "max_descripcion_length": 155,
        "min_seo_score": 70.0,
        "min_legibilidad_score": 60.0,
        "enable_cache": True,
        "cache_ttl_hours": 24,
        "log_level": "INFO",
        "enable_verbose_logging": False,
        "requests_per_minute": 60,
        "requests_per_hour": 1000
    }


# Configuración dinámica basada en variables de entorno
def create_config_from_env() -> ConfiguracionAgente:
    """Crea configuración basada en variables de entorno."""
    env = os.getenv("AGENT_ENV", "development")
    return get_config_by_environment(env)


# Configuración por defecto para uso rápido
DEFAULT_CONFIG = create_config_from_env()
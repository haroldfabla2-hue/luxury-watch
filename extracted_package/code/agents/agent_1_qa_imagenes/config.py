"""
Configuración del Agente 1: Analista de Calidad de Imágenes
Parámetros de configuración para análisis de calidad de imágenes
"""

from dataclasses import dataclass
from typing import Dict, Any, List
from enum import Enum

class QualityLevel(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    REJECTED = "rejected"

@dataclass
class QualityThresholds:
    """Umbrales para clasificación de calidad"""
    # BRISQUE Score (menor es mejor)
    brisque_excellent: float = 20.0
    brisque_good: float = 35.0
    brisque_fair: float = 50.0
    
    # Varianza Laplaciana (mayor es mejor para nitidez)
    laplacian_excellent: float = 500.0
    laplacian_good: float = 300.0
    laplacian_fair: float = 100.0
    
    # Resolución mínima (píxeles)
    min_width: int = 800
    min_height: int = 600
    
    # Histograma de exposición (porcentajes)
    min_pixel_coverage: float = 0.01  # 1% mínimo de píxeles en cada rango
    max_pixel_coverage: float = 0.95  # 95% máximo en cualquier rango
    
    # Aspect ratio válido (tolerancia)
    aspect_ratio_tolerance: float = 0.1

@dataclass
class QualityWeights:
    """Ponderaciones para cálculo del score final"""
    brisque_weight: float = 0.35
    sharpness_weight: float = 0.25
    exposure_weight: float = 0.20
    resolution_weight: float = 0.15
    aspect_ratio_weight: float = 0.05

@dataclass
class AgentConfig:
    """Configuración principal del agente"""
    # Configuración del agente
    agent_id: str = "agent_1_qa_imagenes"
    agent_name: str = "Analista de Calidad de Imágenes"
    agent_type: str = "qa_specialist"
    
    # Configuración de análisis
    supported_formats: List[str] = None
    max_image_size: int = 50 * 1024 * 1024  # 50MB
    analysis_timeout: int = 30  # segundos
    
    # Configuración de umbrales y pesos
    quality_thresholds: QualityThresholds = None
    quality_weights: QualityWeights = None
    
    # Configuración de API
    api_host: str = "0.0.0.0"
    api_port: int = 8081
    api_debug: bool = False
    
    # Configuración de logging
    log_level: str = "INFO"
    log_file: str = "logs/image_quality_analyzer.log"
    enable_performance_logging: bool = True
    
    # Configuración de integración con sistema de colas
    enable_queue_integration: bool = True
    max_concurrent_analyses: int = 5
    queue_timeout: int = 60  # segundos
    
    def __post_init__(self):
        if self.supported_formats is None:
            self.supported_formats = [".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"]
        
        if self.quality_thresholds is None:
            self.quality_thresholds = QualityThresholds()
        
        if self.quality_weights is None:
            self.quality_weights = QualityWeights()

# Configuración por defecto
DEFAULT_CONFIG = AgentConfig()

# Configuraciones específicas por caso de uso
PREMIUM_CONFIG = AgentConfig(
    agent_id="agent_1_qa_imagenes_premium",
    quality_thresholds=QualityThresholds(
        brisque_excellent=15.0,
        brisque_good=25.0,
        brisque_fair=40.0,
        laplacian_excellent=700.0,
        laplacian_good=500.0,
        laplacian_fair=200.0,
        min_width=1200,
        min_height=900
    ),
    max_image_size=100 * 1024 * 1024  # 100MB
)

BULK_PROCESSING_CONFIG = AgentConfig(
    agent_id="agent_1_qa_imagenes_bulk",
    max_concurrent_analyses=10,
    analysis_timeout=15,  # Más rápido para procesamiento masivo
    api_debug=False,
    enable_performance_logging=False
)

def get_config(config_type: str = "default") -> AgentConfig:
    """Obtiene configuración según el tipo"""
    configs = {
        "default": DEFAULT_CONFIG,
        "premium": PREMIUM_CONFIG,
        "bulk": BULK_PROCESSING_CONFIG
    }
    return configs.get(config_type, DEFAULT_CONFIG)
#!/usr/bin/env python3
"""
Agente 2: Optimizador de Captura - Paquete Principal
===================================================

Paquete principal del Agente Optimizador de Captura para el Sistema
de Fotogrametría de Relojes de Lujo.

Este agente se encarga de:
- Generar guías específicas de captura por componente
- Calcular ángulos óptimos usando geometría avanzada
- Recomendar configuraciones de cámara profesionales
- Sugerir esquemas de iluminación especializados
- Validar cobertura angular de imágenes
- Generar checklists visuales interactivos
- Integrar con el sistema de coordinación

Autor: Sistema de Fotogrametría de Relojes
Versión: 2.0
Fecha: 2025-11-06
"""

# Importaciones principales
from .capture_optimizer_agent import (
    CaptureOptimizerAgent,
    CaptureGuide,
    ComponentType,
    LightingType,
    CaptureAngle,
    CameraSettings,
    LightingConfiguration,
    ComponentGeometry
)

from .coordination_interface import (
    CoordinationInterface,
    CoordinationMessage,
    TaskStatus,
    get_coordination_interface
)

from .agent_config import (
    AgentConfiguration,
    CameraProfile,
    LightingProfile,
    OptimizationSettings,
    get_config
)

from .guide_generator import GuideGenerator
from .angle_calculator import AngleCalculator
from .lighting_optimizer import LightingOptimizer
from .validation_engine import ValidationEngine

# Información del paquete
__version__ = "2.0.0"
__author__ = "Sistema de Fotogrametría de Relojes"
__email__ = "support@fotogrametria-relojes.com"
__license__ = "MIT"

# Versión y metadata
VERSION_INFO = {
    "major": 2,
    "minor": 0,
    "patch": 0,
    "release": "stable",
    "build": "2025.11.06"
}

# Capacidades del agente
CAPABILITIES = [
    "generar_guias_captura",
    "calcular_angulos_optimos", 
    "recomendar_configuraciones_camara",
    "sugerir_esquemas_iluminacion",
    "validar_cobertura_angular",
    "generar_checklists_visuales",
    "exportar_guias_html",
    "optimizar_guias_existentes",
    "calcular_geometria_componentes",
    "validar_calidad_imagen"
]

# Tipos de componentes soportados
SUPPORTED_COMPONENTS = [
    "caja",
    "bisel", 
    "correa",
    "esfera"
]

# Configuraciones por defecto
DEFAULT_SETTINGS = {
    "angle_resolution": 15.0,
    "max_processing_time": 300,
    "auto_optimization": True,
    "interactive_checklist": True,
    "html_export_enabled": True,
    "real_time_validation": False
}


def get_version_info():
    """Obtener información detallada de la versión"""
    return VERSION_INFO.copy()


def get_agent_info():
    """Obtener información completa del agente"""
    return {
        "name": "Agente Optimizador de Captura",
        "version": __version__,
        "version_info": VERSION_INFO,
        "author": __author__,
        "capabilities": CAPABILITIES,
        "supported_components": SUPPORTED_COMPONENTS,
        "default_settings": DEFAULT_SETTINGS,
        "description": "Agente especializado en optimización de captura fotográfica para componentes de relojes de lujo"
    }


def create_agent(config_path=None):
    """
    Crear instancia del agente optimizador
    
    Args:
        config_path: Ruta al archivo de configuración personalizado
        
    Returns:
        CaptureOptimizerAgent: Instancia del agente
    """
    from .capture_optimizer_agent import CaptureOptimizerAgent
    
    agent = CaptureOptimizerAgent(config_path)
    
    # Configurar interfaz de coordinación
    coord_interface = get_coordination_interface()
    agent.set_coordination_interface(coord_interface)
    
    return agent


def initialize_agent(config_path=None, start_coordination=True):
    """
    Inicializar agente completo con coordinación
    
    Args:
        config_path: Ruta al archivo de configuración
        start_coordination: Si iniciar la coordinación
        
    Returns:
        tuple: (agent, coordination_interface)
    """
    agent = create_agent(config_path)
    coord_interface = get_coordination_interface()
    
    if start_coordination:
        coord_interface.start()
    
    return agent, coord_interface


def get_supported_formats():
    """Obtener formatos de salida soportados"""
    return {
        "input": ["json", "yaml", "csv"],
        "output": ["html", "pdf", "json", "yaml"],
        "templates": ["basic", "professional", "detailed"]
    }


def get_geometry_calculator():
    """Obtener calculadora de geometría integrada"""
    from .angle_calculator import AngleCalculator
    return AngleCalculator()


def get_lighting_optimizer():
    """Obtener optimizador de iluminación integrado"""
    from .lighting_optimizer import LightingOptimizer
    return LightingOptimizer()


def get_validation_engine():
    """Obtener motor de validación integrado"""
    from .validation_engine import ValidationEngine
    return ValidationEngine()


# Funciones de utilidad
def validate_component_type(component_type):
    """Validar tipo de componente"""
    return component_type in [comp.value for comp in ComponentType]


def calculate_optimal_angles(component_type, dimensions=None):
    """Calcular ángulos óptimos para un componente (función rápida)"""
    calculator = get_geometry_calculator()
    return calculator.calculate_optimal_angles(component_type, dimensions)


def generate_quick_guide(component_type, component_id):
    """Generar guía rápida para un componente"""
    agent = create_agent()
    return agent.generate_capture_guide(
        component_type=ComponentType(component_type),
        component_id=component_id
    )


def validate_existing_coverage(captured_angles, required_angles):
    """Validar cobertura angular existente (función rápida)"""
    engine = get_validation_engine()
    return engine.validate_angular_coverage(captured_angles, required_angles)


def export_guide_to_html(guide, output_path):
    """Exportar guía a HTML (función rápida)"""
    agent = create_agent()
    return agent.export_guide_to_html(guide, output_path)


# Logging setup
import logging

# Configurar logger específico del agente
agent_logger = logging.getLogger("agent_optimizador_captura")
agent_logger.setLevel(logging.INFO)

# Handler por defecto si no existe
if not agent_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    agent_logger.addHandler(handler)


# Exponer funciones principales en el namespace del paquete
__all__ = [
    # Clases principales
    "CaptureOptimizerAgent",
    "CoordinationInterface", 
    "AgentConfiguration",
    "CaptureGuide",
    "ComponentType",
    "LightingType",
    "CameraSettings",
    "LightingConfiguration",
    "ComponentGeometry",
    
    # Funciones de creación
    "create_agent",
    "initialize_agent",
    "get_coordination_interface",
    "get_config",
    
    # Funciones de utilidad
    "validate_component_type",
    "calculate_optimal_angles",
    "generate_quick_guide",
    "validate_existing_coverage",
    "export_guide_to_html",
    
    # Utilidades
    "get_agent_info",
    "get_version_info",
    "get_supported_formats",
    "get_geometry_calculator",
    "get_lighting_optimizer",
    "get_validation_engine",
    
    # Constantes
    "CAPABILITIES",
    "SUPPORTED_COMPONENTS",
    "DEFAULT_SETTINGS"
]


# Información adicional para herramientas de desarrollo
try:
    import importlib.metadata as metadata
except ImportError:
    # Python < 3.8
    import importlib_metadata as metadata

try:
    __version__ = metadata.version("agent_optimizador_captura")
except metadata.PackageNotFoundError:
    # El paquete no está instalado, usar versión local
    pass
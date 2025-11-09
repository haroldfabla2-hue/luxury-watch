#!/usr/bin/env python3
"""
Configuración del Agente Optimizador de Captura
===============================================

Archivo de configuración que define parámetros específicos del agente,
incluyendo especificaciones de componentes, configuraciones de cámara
y esquemas de iluminación predefinidos.

Autor: Sistema de Fotogrametría de Relojes
Versión: 2.0
Fecha: 2025-11-06
"""

import os
from typing import Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class CameraBrand(Enum):
    """Marcas de cámara soportadas"""
    CANON = "canon"
    NIKON = "nikon"
    SONY = "sony"
    FUJIFILM = "fujifilm"
    PANASONIC = "panasonic"


@dataclass
class CameraProfile:
    """Perfil de cámara con configuraciones optimizadas"""
    brand: CameraBrand
    model: str
    sensor_size: str  # "full_frame", "aps_c", "m4_3", etc.
    base_iso: int = 100
    max_iso: int = 25600
    optimal_apertures: list = field(default_factory=lambda: [5.6, 8.0, 11.0, 16.0])
    stabilization: bool = True


@dataclass
class LightingProfile:
    """Perfil de iluminación por tipo de estudio"""
    name: str
    description: str
    equipment: list
    color_temperature: int
    cri: int = 95  # Color Rendering Index
    dimmable: bool = True


@dataclass
class OptimizationSettings:
    """Configuraciones de optimización del agente"""
    max_processing_time: int = 300  # segundos
    min_angle_resolution: float = 15.0  # grados
    angle_calculation_method: str = "geometric"  # "geometric", "ai_optimized"
    auto_exposure_compensation: bool = True
    depth_of_field_priority: str = "balanced"  # "sharp", "bokeh", "balanced"
    lighting_fallback_enabled: bool = True
    checklist_interactive: bool = True
    real_time_validation: bool = False


class AgentConfiguration:
    """Clase principal de configuración del agente"""
    
    def __init__(self, config_file: str = None):
        """
        Inicializar configuración
        
        Args:
            config_file: Ruta al archivo de configuración personalizado
        """
        self.config_file = config_file
        self.camera_profiles = self._init_camera_profiles()
        self.lighting_profiles = self._init_lighting_profiles()
        self.component_configs = self._init_component_configs()
        self.optimization_settings = self._init_optimization_settings()
        self.validation_rules = self._init_validation_rules()
        
        if config_file and os.path.exists(config_file):
            self._load_custom_config(config_file)
    
    def _init_camera_profiles(self) -> Dict[str, CameraProfile]:
        """Inicializar perfiles de cámara predefinidos"""
        return {
            "canon_eos_r5": CameraProfile(
                brand=CameraBrand.CANON,
                model="EOS R5",
                sensor_size="full_frame",
                base_iso=100,
                max_iso=51200,
                optimal_apertures=[4.0, 5.6, 8.0, 11.0, 16.0],
                stabilization=True
            ),
            "nikon_z9": CameraProfile(
                brand=CameraBrand.NIKON,
                model="Z9",
                sensor_size="full_frame",
                base_iso=64,
                max_iso=25600,
                optimal_apertures=[5.6, 8.0, 11.0, 16.0],
                stabilization=True
            ),
            "sony_a7r_v": CameraProfile(
                brand=CameraBrand.SONY,
                model="A7R V",
                sensor_size="full_frame",
                base_iso=100,
                max_iso=32000,
                optimal_apertures=[5.6, 8.0, 11.0, 16.0, 22.0],
                stabilization=True
            ),
            "fujifilm_gfx100s": CameraProfile(
                brand=CameraBrand.FUJIFILM,
                model="GFX100S",
                sensor_size="medium_format",
                base_iso=100,
                max_iso=12800,
                optimal_apertures=[8.0, 11.0, 16.0, 22.0],
                stabilization=True
            )
        }
    
    def _init_lighting_profiles(self) -> Dict[str, LightingProfile]:
        """Inicializar perfiles de iluminación"""
        return {
            "studio_pro": LightingProfile(
                name="Studio Profesional",
                description="Configuración de estudio con luz continua y flash",
                equipment=[
                    "Softbox 120x90cm",
                    "Flash de estudio 600Ws",
                    "Reflector 5-en-1",
                    "Fondo blanco infinito",
                    "Trípode profesional"
                ],
                color_temperature=5600,
                cri=98,
                dimmable=True
            ),
            "natural_light": LightingProfile(
                name="Luz Natural",
                description="Captura con luz natural filtrada",
                equipment=[
                    "Ventana norte",
                    "Diffusor 5-en-1",
                    "Reflector dorado/plateado",
                    "Trípode ligero"
                ],
                color_temperature=5500,
                cri=95,
                dimmable=False
            ),
            "led_setup": LightingProfile(
                name="Configuración LED",
                description="Iluminación LED continua de bajo consumo",
                equipment=[
                    "Panel LED bi-color 120W",
                    "Softbox LED 80x60cm",
                    "Ring light 18''",
                    "Dimmer LED"
                ],
                color_temperature=5600,
                cri=95,
                dimmable=True
            ),
            "macro_lighting": LightingProfile(
                name="Iluminación Macro",
                description="Configuración especializada para fotografía macro",
                equipment=[
                    "Ring light macro",
                    "LED puntuales x4",
                    "Fiber optic lighting",
                    "Diffusores micro"
                ],
                color_temperature=6500,
                cri=99,
                dimmable=True
            )
        }
    
    def _init_component_configs(self) -> Dict[str, Any]:
        """Inicializar configuraciones específicas por tipo de componente"""
        return {
            "caja": {
                "dimensiones_maximas": {"ancho": 50, "alto": 50, "profundidad": 15},
                "angulos_criticos": [0, 30, 45, 60, 90, 120, 135, 150, 180],
                "focal_recomendada": 85,
                "iluminacion_minima": 3,
                "reflectividad": 0.3,
                "materiales": ["acero_inoxidable", "oro_amarillo", "oro_rose", "titanio"],
                "configuraciones_especiales": {
                    "esquinas": {
                        "angulos_adicionales": [15, 75, 105, 165],
                        "iluminacion_lateral": True
                    },
                    "bordes": {
                        "profundidad_campo": "alta",
                        "evitar_reflejos": True
                    }
                }
            },
            "bisel": {
                "dimensiones_maximas": {"ancho": 45, "alto": 45, "profundidad": 8},
                "angulos_criticos": [0, 30, 45, 60, 90, 120, 150, 180],
                "focal_recomendada": 100,
                "iluminacion_minima": 4,
                "reflectividad": 0.4,
                "materiales": ["acero_inoxidable", "oro_amarillo", "ceramica", "carbon_fiber"],
                "texturas": ["pulido", "mate", "grabado", "con acabado"],
                "configuraciones_especiales": {
                    "texturas": {
                        "iluminacion_obliqua": True,
                        "contraste_alto": True
                    },
                    "grabados": {
                        "profundidad_campo": "media",
                        "iluminacion_lateral": True
                    }
                }
            },
            "correa": {
                "dimensiones_maximas": {"ancho": 30, "alto": 250, "profundidad": 5},
                "angulos_criticos": [0, 45, 90, 135, 180],
                "focal_recomendada": 50,
                "iluminacion_minima": 2,
                "reflectividad": 0.2,
                "materiales": ["cuero", "caucciu", "nylon", "metal"],
                "configuraciones_especiales": {
                    "longitud": {
                        "extender_completa": True,
                        "evitar_arrugas": True
                    },
                    "textura": {
                        "iluminacion_uniforme": True,
                        "evitar_puntos_calientes": True
                    }
                }
            },
            "esfera": {
                "dimensiones_maximas": {"ancho": 40, "alto": 40, "profundidad": 40},
                "angulos_criticos": [0, 45, 90, 135, 180, 225, 270, 315],
                "focal_recomendada": 105,
                "iluminacion_minima": 5,
                "reflectividad": 0.6,
                "materiales": ["acero_inoxidable", "oro_amarillo", "perla", "ceramica"],
                "configuraciones_especiales": {
                    "superficie": {
                        "evitar_huellas": True,
                        "iluminacion_uniforme": True
                    },
                    "反射": {
                        "control_reflejos": True,
                        "ángulos_evitados": [30, 60, 120, 150]
                    }
                }
            }
        }
    
    def _init_optimization_settings(self) -> OptimizationSettings:
        """Inicializar configuraciones de optimización"""
        return OptimizationSettings(
            max_processing_time=300,
            min_angle_resolution=15.0,
            angle_calculation_method="geometric",
            auto_exposure_compensation=True,
            depth_of_field_priority="balanced",
            lighting_fallback_enabled=True,
            checklist_interactive=True,
            real_time_validation=False
        )
    
    def _init_validation_rules(self) -> Dict[str, Any]:
        """Inicializar reglas de validación"""
        return {
            "cobertura_angular": {
                "minima_porcentaje": 80,
                "tolerancia_angulo": 10,  # grados
                "requiere_cobertura_completa": False
            },
            "calidad_imagen": {
                "minima_resolucion": "1920x1080",
                "formato_requerido": ["RAW", "JPEG"],
                "nitidez_minima": 0.8,
                "ruido_maximo": 0.3
            },
            "configuracion_camara": {
                "iso_maximo_aceptable": 1600,
                "velocidad_minima": 1/60,
                "profundidad_campo_minima": 0.5
            },
            "iluminacion": {
                "intensidad_minima": 0.3,
                "uniformidad_maxima": 0.8,
                "temperatura_color_rango": [5000, 6200]
            }
        }
    
    def _load_custom_config(self, config_file: str):
        """Cargar configuración personalizada desde archivo"""
        import json
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                custom_config = json.load(f)
            
            # Aplicar configuraciones personalizadas
            for key, value in custom_config.items():
                if hasattr(self, key):
                    if isinstance(value, dict) and hasattr(getattr(self, key), '__dict__'):
                        # Actualizar dataclass
                        obj = getattr(self, key)
                        for subkey, subvalue in value.items():
                            if hasattr(obj, subkey):
                                setattr(obj, subkey, subvalue)
                    else:
                        setattr(self, key, value)
                        
        except Exception as e:
            print(f"Error cargando configuración personalizada: {e}")
    
    def get_camera_profile(self, camera_identifier: str) -> CameraProfile:
        """Obtener perfil de cámara"""
        return self.camera_profiles.get(camera_identifier.lower())
    
    def get_lighting_profile(self, profile_name: str) -> LightingProfile:
        """Obtener perfil de iluminación"""
        return self.lighting_profiles.get(profile_name.lower())
    
    def get_component_config(self, component_type: str) -> Dict[str, Any]:
        """Obtener configuración de componente"""
        return self.component_configs.get(component_type.lower(), {})
    
    def export_config(self, output_file: str):
        """Exportar configuración a archivo"""
        import json
        config_data = {
            "camera_profiles": {
                name: {
                    "brand": profile.brand.value,
                    "model": profile.model,
                    "sensor_size": profile.sensor_size,
                    "base_iso": profile.base_iso,
                    "max_iso": profile.max_iso,
                    "optimal_apertures": profile.optimal_apertures,
                    "stabilization": profile.stabilization
                }
                for name, profile in self.camera_profiles.items()
            },
            "lighting_profiles": {
                name: {
                    "name": profile.name,
                    "description": profile.description,
                    "equipment": profile.equipment,
                    "color_temperature": profile.color_temperature,
                    "cri": profile.cri,
                    "dimmable": profile.dimmable
                }
                for name, profile in self.lighting_profiles.items()
            },
            "component_configs": self.component_configs,
            "optimization_settings": {
                "max_processing_time": self.optimization_settings.max_processing_time,
                "min_angle_resolution": self.optimization_settings.min_angle_resolution,
                "angle_calculation_method": self.optimization_settings.angle_calculation_method,
                "auto_exposure_compensation": self.optimization_settings.auto_exposure_compensation,
                "depth_of_field_priority": self.optimization_settings.depth_of_field_priority,
                "lighting_fallback_enabled": self.optimization_settings.lighting_fallback_enabled,
                "checklist_interactive": self.optimization_settings.checklist_interactive,
                "real_time_validation": self.optimization_settings.real_time_validation
            },
            "validation_rules": self.validation_rules
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
        
        print(f"Configuración exportada a: {output_file}")


# Instancia global de configuración
default_config = AgentConfiguration()


def get_config() -> AgentConfiguration:
    """Obtener instancia de configuración por defecto"""
    return default_config


if __name__ == "__main__":
    # Ejemplo de uso
    config = AgentConfiguration()
    
    # Exportar configuración
    config.export_config("/workspace/code/agents/agent_2_optimizacion_captura/default_config.json")
    
    # Mostrar información
    print("Configuración del Agente Optimizador de Captura")
    print("=" * 50)
    print(f"Cámaras soportadas: {list(config.camera_profiles.keys())}")
    print(f"Perfiles de iluminación: {list(config.lighting_profiles.keys())}")
    print(f"Componentes configurados: {list(config.component_configs.keys())}")
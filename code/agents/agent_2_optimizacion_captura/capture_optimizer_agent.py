#!/usr/bin/env python3
"""
Agente 2: Optimizador de Captura para Guías Inteligentes de Fotografía
========================================================================

Este agente se encarga de generar guías específicas de fotografía para componentes
de relojes de lujo, calcular ángulos óptimos y recomendar configuraciones de cámara.

Autor: Sistema de Fotogrametría de Relojes
Versión: 2.0
Fecha: 2025-11-06
"""

import math
import json
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
from datetime import datetime
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ComponentType(Enum):
    """Tipos de componentes de reloj"""
    CAJA = "caja"
    BISEL = "bisel" 
    CORREA = "correa"
    ESFERA = "esfera"


class LightingType(Enum):
    """Tipos de iluminación para fotografía"""
    NATURAL = "natural"
    STUDIO = "studio"
    LED = "led"
    FLASH = "flash"
    RING_LIGHT = "ring_light"


class CaptureAngle(Enum):
    """Ángulos de captura predefinidos"""
    FRONT = 0  # Frontal 0°
    THREE_QUARTER = 45  # 3/4 vista 45°
    SIDE = 90  # Lateral 90°
    TOP = 135  # Superior 135°
    DIAGONAL = 180  # Diagonal 180°


@dataclass
class CameraSettings:
    """Configuraciones de cámara recomendadas"""
    f_number: float  # Apertura (f-stop)
    iso: int  # Sensibilidad ISO
    shutter_speed: float  # Velocidad de obturación (segundos)
    focal_length: float  # Longitud focal (mm)
    white_balance: str  # Balance de blancos


@dataclass
class LightingConfiguration:
    """Configuración de iluminación"""
    lighting_type: LightingType
    position: str  # Posición de la luz
    intensity: float  # Intensidad (0-1)
    color_temperature: int  # Temperatura de color (K)
    direction: str  # Dirección de la luz


@dataclass
class ComponentGeometry:
    """Geometría del componente"""
    width: float  # Ancho (mm)
    height: float  # Alto (mm) 
    depth: float  # Profundidad (mm)
    curvature_radius: Optional[float]  # Radio de curvatura (mm)
    material_reflectivity: float  # Reflectividad del material (0-1)


@dataclass
class CaptureGuide:
    """Guía de captura completa"""
    component_type: ComponentType
    component_id: str
    optimal_angles: List[float]
    camera_settings: List[CameraSettings]
    lighting_configs: List[LightingConfiguration]
    required_views: int
    estimated_duration: int  # Duración estimada en minutos
    difficulty_level: str  # Fácil, Medio, Difícil
    checklist: List[str]
    notes: str


class CaptureOptimizerAgent:
    """Agente principal para optimización de captura fotográfica"""
    
    def __init__(self, config_path: str = None):
        """
        Inicializar el agente optimizador
        
        Args:
            config_path: Ruta al archivo de configuración
        """
        self.component_specs = self._load_component_specs()
        self.optimal_angles_cache = {}
        self.coordination_interface = None
        
    def set_coordination_interface(self, interface):
        """Establecer interfaz con el sistema de coordinación"""
        self.coordination_interface = interface
        
    def _load_component_specs(self) -> Dict[ComponentType, Dict]:
        """Cargar especificaciones de componentes"""
        specs = {
            ComponentType.CAJA: {
                "max_dimensions": {"width": 50, "height": 50, "depth": 15},
                "critical_angles": [0, 45, 90, 135, 180],
                "recommended_focal": 85,
                "minimum_lighting": 3,
                "reflectivity": 0.3
            },
            ComponentType.BISEL: {
                "max_dimensions": {"width": 45, "height": 45, "depth": 8},
                "critical_angles": [0, 30, 60, 90, 120, 150],
                "recommended_focal": 100,
                "minimum_lighting": 4,
                "reflectivity": 0.4
            },
            ComponentType.CORREA: {
                "max_dimensions": {"width": 30, "height": 250, "depth": 5},
                "critical_angles": [0, 45, 90, 135],
                "recommended_focal": 50,
                "minimum_lighting": 2,
                "reflectivity": 0.2
            },
            ComponentType.ESFERA: {
                "max_dimensions": {"width": 40, "height": 40, "depth": 40},
                "critical_angles": [0, 45, 90, 135, 180, 225, 270, 315],
                "recommended_focal": 105,
                "minimum_lighting": 5,
                "reflectivity": 0.6
            }
        }
        return specs
    
    def generate_capture_guide(self, 
                             component_type: ComponentType,
                             component_id: str,
                             custom_geometry: ComponentGeometry = None) -> CaptureGuide:
        """
        Generar guía completa de captura para un componente
        
        Args:
            component_type: Tipo del componente
            component_id: ID único del componente
            custom_geometry: Geometría personalizada (opcional)
            
        Returns:
            CaptureGuide: Guía completa de captura
        """
        logger.info(f"Generando guía de captura para {component_type.value}:{component_id}")
        
        # Obtener especificaciones del componente
        specs = self.component_specs[component_type]
        
        # Calcular ángulos óptimos
        optimal_angles = self._calculate_optimal_angles(component_type, specs, custom_geometry)
        
        # Generar configuraciones de cámara
        camera_settings = self._generate_camera_settings(component_type, specs)
        
        # Crear esquemas de iluminación
        lighting_configs = self._generate_lighting_scheme(component_type, specs)
        
        # Generar checklist visual
        checklist = self._generate_visual_checklist(component_type, optimal_angles)
        
        # Estimar duración y dificultad
        estimated_duration = self._estimate_capture_duration(len(optimal_angles), component_type)
        difficulty_level = self._assess_difficulty(component_type, specs)
        
        guide = CaptureGuide(
            component_type=component_type,
            component_id=component_id,
            optimal_angles=optimal_angles,
            camera_settings=camera_settings,
            lighting_configs=lighting_configs,
            required_views=len(optimal_angles),
            estimated_duration=estimated_duration,
            difficulty_level=difficulty_level,
            checklist=checklist,
            notes=self._generate_notes(component_type, custom_geometry)
        )
        
        # Integrar con sistema de coordinación si está disponible
        if self.coordination_interface:
            self.coordination_interface.register_guide(guide)
            
        return guide
    
    def _calculate_optimal_angles(self, 
                                component_type: ComponentType, 
                                specs: Dict, 
                                geometry: ComponentGeometry = None) -> List[float]:
        """Calcular ángulos óptimos de captura usando geometría"""
        
        # Ángulos críticos base según el tipo de componente
        base_angles = specs["critical_angles"]
        
        # Ajustar según la geometría si está disponible
        if geometry:
            # Considerar la relación aspecto para optimizar ángulos
            aspect_ratio = geometry.width / geometry.height if geometry.height > 0 else 1.0
            
            # Para elementos muy largos, agregar más ángulos laterales
            if aspect_ratio > 3 or aspect_ratio < 0.33:  # Correa muy larga o muy corta
                additional_angles = [30, 60, 120, 150] if component_type == ComponentType.CORREA else []
                base_angles.extend(additional_angles)
                
            # Para elementos curvos, agregar ángulos que capturen la curvatura
            if geometry.curvature_radius and geometry.curvature_radius < geometry.width / 2:
                curve_angles = [22.5, 67.5, 112.5, 157.5]
                base_angles.extend(curve_angles)
        
        # Eliminar duplicados y ordenar
        optimal_angles = sorted(list(set(base_angles)))
        
        # Cache el resultado
        cache_key = f"{component_type.value}_{geometry.width}x{geometry.height}x{geometry.depth}" if geometry else component_type.value
        self.optimal_angles_cache[cache_key] = optimal_angles
        
        return optimal_angles
    
    def _generate_camera_settings(self, component_type: ComponentType, specs: Dict) -> List[CameraSettings]:
        """Generar configuraciones de cámara recomendadas"""
        
        settings = []
        focal_length = specs["recommended_focal"]
        reflectivity = specs["reflectivity"]
        
        # Configuraciones base según el tipo de componente
        if component_type == ComponentType.ESFERA:
            # Las esferas requieren alta profundidad de campo y buena iluminación
            settings.extend([
                CameraSettings(f_number=8.0, iso=100, shutter_speed=1/125, 
                             focal_length=focal_length, white_balance="daylight"),
                CameraSettings(f_number=11.0, iso=200, shutter_speed=1/60,
                             focal_length=focal_length, white_balance="daylight"),
                CameraSettings(f_number=5.6, iso=400, shutter_speed=1/250,
                             focal_length=focal_length, white_balance="daylight")
            ])
        elif component_type == ComponentType.BISEL:
            # Los biseles requieren buena definición de bordes
            settings.extend([
                CameraSettings(f_number=11.0, iso=100, shutter_speed=1/125,
                             focal_length=focal_length, white_balance="daylight"),
                CameraSettings(f_number=16.0, iso=100, shutter_speed=1/60,
                             focal_length=focal_length, white_balance="daylight")
            ])
        elif component_type == ComponentType.CAJA:
            # Las cajas requieren equilibrio entre profundidad de campo y detalle
            settings.extend([
                CameraSettings(f_number=8.0, iso=200, shutter_speed=1/125,
                             focal_length=focal_length, white_balance="daylight"),
                CameraSettings(f_number=11.0, iso=200, shutter_speed=1/125,
                             focal_length=focal_length, white_balance="daylight")
            ])
        else:  # CORREA
            # Las correas requieren profundidad de campo para mantener nítida toda la superficie
            settings.extend([
                CameraSettings(f_number=16.0, iso=100, shutter_speed=1/125,
                             focal_length=focal_length, white_balance="daylight"),
                CameraSettings(f_number=22.0, iso=100, shutter_speed=1/60,
                             focal_length=focal_length, white_balance="daylight")
            ])
        
        return settings
    
    def _generate_lighting_scheme(self, component_type: ComponentType, specs: Dict) -> List[LightingConfiguration]:
        """Generar esquemas de iluminación recomendados"""
        
        lighting_configs = []
        min_lights = specs["minimum_lighting"]
        
        # Iluminación base según tipo de componente
        if component_type == ComponentType.ESFERA:
            # Las esferas necesitan iluminación uniforme desde múltiples ángulos
            lighting_configs = [
                LightingConfiguration(LightingType.STUDIO, "superior_frontal", 0.8, 5600, "downward"),
                LightingConfiguration(LightingType.LED, "lateral_izquierda", 0.6, 5600, "horizontal"),
                LightingConfiguration(LightingType.LED, "lateral_derecha", 0.6, 5600, "horizontal"),
                LightingConfiguration(LightingType.STUDIO, "inferior", 0.4, 5600, "upward"),
                LightingConfiguration(LightingType.RING_LIGHT, "frontal", 0.7, 5600, "forward")
            ]
        elif component_type == ComponentType.BISEL:
            # Los biseles necesitan luz lateral para resaltar texturas
            lighting_configs = [
                LightingConfiguration(LightingType.STUDIO, "superior", 0.9, 5600, "downward"),
                LightingConfiguration(LightingType.LED, "lateral_45", 0.7, 5600, "diagonal"),
                LightingConfiguration(LightingType.STUDIO, "posterior", 0.5, 5600, "backward"),
                LightingConfiguration(LightingType.LED, "lateral_-45", 0.7, 5600, "diagonal")
            ]
        else:
            # Configuración general para caja y correa
            lighting_configs = [
                LightingConfiguration(LightingType.STUDIO, "superior", 0.8, 5600, "downward"),
                LightingConfiguration(LightingType.LED, "lateral", 0.6, 5600, "horizontal"),
                LightingConfiguration(LightingType.STUDIO, "fill_light", 0.4, 5600, "soft")
            ]
        
        return lighting_configs[:min_lights]
    
    def _generate_visual_checklist(self, component_type: ComponentType, angles: List[float]) -> List[str]:
        """Generar checklist visual para el fotógrafo"""
        
        checklist = [
            "✓ Preparar superficie de trabajo limpia y estable",
            "✓ Verificar limpieza del componente",
            "✓ Configurar iluminación base",
            "✓ Establecer punto de enfoque",
            "✓ Calibrar balance de blancos"
        ]
        
        # Items específicos por tipo de componente
        if component_type == ComponentType.ESFERA:
            checklist.extend([
                "✓ Verificar que la esfera esté perfectamente centrada",
                "✓ Asegurar iluminación uniforme en toda la superficie",
                "✓ Evitar reflejos unwanted en la superficie pulida",
                "✓ Capturar desde 8 ángulos diferentes (cada 45°)"
            ])
        elif component_type == ComponentType.BISEL:
            checklist.extend([
                "✓ Verificar que todas las marcas del bisel sean legibles",
                "✓ Asegurar que la textura del bisel esté bien definida",
                "✓ Evitar sombras que oculten detalles importantes",
                "✓ Capturar desde 6 ángulos diferentes"
            ])
        elif component_type == ComponentType.CAJA:
            checklist.extend([
                "✓ Verificar que todos los elementos de la caja estén visibles",
                "✓ Asegurar que las esquinas estén bien iluminadas",
                "✓ Evitar reflejos en superficies metálicas",
                "✓ Capturar desde 5 ángulos diferentes"
            ])
        else:  # CORREA
            checklist.extend([
                "✓ Estirar la correa para evitar arrugas",
                "✓ Verificar que la textura del material sea visible",
                "✓ Asegurar iluminación uniforme a lo largo de toda la correa",
                "✓ Capturar desde 4 ángulos diferentes"
            ])
        
        # Items finales
        checklist.extend([
            f"✓ Verificar que se capturen todos los {len(angles)} ángulos requeridos",
            "✓ Revisar enfoque en todas las imágenes",
            "✓ Verificar exposición correcta",
            "✓ Hacer copia de respaldo de las imágenes"
        ])
        
        return checklist
    
    def _estimate_capture_duration(self, num_views: int, component_type: ComponentType) -> int:
        """Estimar duración de la sesión de captura"""
        
        # Tiempo base por vista según dificultad
        base_time_per_view = {
            ComponentType.CAJA: 3,      # 3 minutos por vista
            ComponentType.BISEL: 4,     # 4 minutos por vista
            ComponentType.CORREA: 2,    # 2 minutos por vista
            ComponentType.ESFERA: 5     # 5 minutos por vista
        }
        
        base_time = base_time_per_view[component_type]
        total_time = num_views * base_time
        
        # Agregar tiempo de preparación y setup
        setup_time = 10  # minutos
        
        return total_time + setup_time
    
    def _assess_difficulty(self, component_type: ComponentType, specs: Dict) -> str:
        """Evaluar nivel de dificultad de la captura"""
        
        difficulty_score = 0
        
        # Factor por tipo de componente
        difficulty_weights = {
            ComponentType.CAJA: 1,
            ComponentType.CORREA: 1,
            ComponentType.BISEL: 2,
            ComponentType.ESFERA: 3
        }
        
        difficulty_score += difficulty_weights[component_type]
        
        # Factor por reflectividad (materiales más reflectantes son más difíciles)
        if specs["reflectivity"] > 0.5:
            difficulty_score += 1
            
        # Factor por número de vistas requeridas
        num_views = len(specs["critical_angles"])
        if num_views > 6:
            difficulty_score += 1
            
        # Clasificar dificultad
        if difficulty_score <= 2:
            return "Fácil"
        elif difficulty_score <= 4:
            return "Medio"
        else:
            return "Difícil"
    
    def _generate_notes(self, component_type: ComponentType, geometry: ComponentGeometry = None) -> str:
        """Generar notas importantes para la captura"""
        
        notes = []
        
        # Notas generales
        notes.append("Mantener temperatura ambiente estable para evitar condensación.")
        
        # Notas específicas por tipo
        if component_type == ComponentType.ESFERA:
            notes.extend([
                "Usar trípode con rotación suave para captura circular.",
                "Verificar que no haya huellas dactilares en la superficie.",
                "Considerar usar guantes para manipulación."
            ])
        elif component_type == ComponentType.BISEL:
            notes.extend([
                "Asegurar buena iluminación para resaltar texturas y grabados.",
                "Evitar sobreexposición que pueda quemar detalles finos.",
                "Verificar que números y marcas sean legibles en todas las vistas."
            ])
        elif component_type == ComponentType.CAJA:
            notes.extend([
                "Prestar especial atención a las esquinas y bordes.",
                "Verificar que todas las funciones de la caja sean visibles.",
                "Evitar reflejos unwanted en superficies pulidas."
            ])
        else:  # CORREA
            notes.extend([
                "Asegurar que la correa esté completamente extendida.",
                "Verificar iluminación uniforme sin puntos calientes.",
                "Considerar usar soportes para mantener la forma natural."
            ])
        
        return " ".join(notes)
    
    def validate_angular_coverage(self, captured_angles: List[float], required_angles: List[float]) -> Dict[str, Any]:
        """
        Validar cobertura angular de imágenes existentes
        
        Args:
            captured_angles: Ángulos capturados realmente
            required_angles: Ángulos requeridos según la guía
            
        Returns:
            Dict: Reporte de validación
        """
        missing_angles = set(required_angles) - set(captured_angles)
        extra_angles = set(captured_angles) - set(required_angles)
        
        coverage_percentage = (len(set(required_angles) & set(captured_angles)) / len(required_angles)) * 100
        
        validation_result = {
            "coverage_percentage": coverage_percentage,
            "missing_angles": list(missing_angles),
            "extra_angles": list(extra_angles),
            "is_complete": len(missing_angles) == 0,
            "recommendations": []
        }
        
        # Generar recomendaciones
        if missing_angles:
            validation_result["recommendations"].append(
                f"Faltan {len(missing_angles)} ángulos: {sorted(missing_angles)}"
            )
        
        if extra_angles:
            validation_result["recommendations"].append(
                f"Se capturaron {len(extra_angles)} ángulos adicionales: {sorted(extra_angles)}"
            )
        
        if coverage_percentage < 80:
            validation_result["recommendations"].append(
                "Cobertura insuficiente. Se recomienda capturar los ángulos faltantes."
            )
        
        return validation_result
    
    def export_guide_to_html(self, guide: CaptureGuide, output_path: str) -> str:
        """
        Exportar guía a formato HTML para visualización
        
        Args:
            guide: Guía de captura
            output_path: Ruta donde guardar el archivo HTML
            
        Returns:
            str: Ruta del archivo generado
        """
        # Template HTML
        html_template = self._load_html_template()
        
        # Procesar el template con los datos de la guía
        processed_html = self._process_html_template(html_template, guide)
        
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Escribir archivo
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(processed_html)
        
        logger.info(f"Guía exportada a: {output_path}")
        return output_path
    
    def _load_html_template(self) -> str:
        """Cargar template HTML base"""
        template_path = os.path.join(os.path.dirname(__file__), "templates", "guide_template.html")
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            # Template por defecto si no se encuentra el archivo
            return """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guía de Captura - {{ component_type }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background: #f8f9fa; }
        .angles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
        .angle-card { background: white; padding: 10px; border-radius: 4px; text-align: center; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 5px 0; border-bottom: 1px solid #eee; }
        .difficulty-easy { color: #27ae60; }
        .difficulty-medium { color: #f39c12; }
        .difficulty-hard { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Guía de Captura Fotográfica</h1>
            <h2>{{ component_type }} - ID: {{ component_id }}</h2>
            <p class="difficulty-{{ difficulty_class }}">Nivel: {{ difficulty_level }}</p>
        </div>
        
        <div class="section">
            <h3>Ángulos Óptimos de Captura</h3>
            <div class="angles-grid">
                {{ angles_html }}
            </div>
        </div>
        
        <div class="section">
            <h3>Configuraciones de Cámara</h3>
            <p><strong>Duración estimada:</strong> {{ estimated_duration }} minutos</p>
            <p><strong>Vistas requeridas:</strong> {{ required_views }}</p>
            {{ camera_settings_html }}
        </div>
        
        <div class="section">
            <h3>Esquema de Iluminación</h3>
            {{ lighting_html }}
        </div>
        
        <div class="section">
            <h3>Checklist Visual</h3>
            <ul class="checklist">
                {{ checklist_html }}
            </ul>
        </div>
        
        <div class="section">
            <h3>Notas Importantes</h3>
            <p>{{ notes }}</p>
        </div>
    </div>
</body>
</html>
            """
    
    def _process_html_template(self, template: str, guide: CaptureGuide) -> str:
        """Procesar template HTML con datos de la guía"""
        
        # Generar HTML para ángulos
        angles_html = ""
        for angle in guide.optimal_angles:
            angle_card = f'<div class="angle-card"><strong>{angle}°</strong><br>Vista {angle}</div>'
            angles_html += angle_card
        
        # Generar HTML para configuraciones de cámara
        camera_settings_html = ""
        for i, settings in enumerate(guide.camera_settings, 1):
            settings_card = f"""
            <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 4px;">
                <strong>Configuración {i}:</strong><br>
                f/{settings.f_number} | ISO {settings.iso} | {settings.shutter_speed}s | {settings.focal_length}mm
            </div>
            """
            camera_settings_html += settings_card
        
        # Generar HTML para iluminación
        lighting_html = ""
        for light in guide.lighting_configs:
            light_card = f"""
            <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 4px;">
                <strong>{light.lighting_type.value.title()}</strong> - {light.position}<br>
                Intensidad: {light.intensity} | Temp: {light.color_temperature}K
            </div>
            """
            lighting_html += light_card
        
        # Generar HTML para checklist
        checklist_html = ""
        for item in guide.checklist:
            checklist_html += f'<li>{item}</li>'
        
        # Determinar clase de dificultad
        difficulty_class = {
            "Fácil": "easy",
            "Medio": "medium", 
            "Difícil": "hard"
        }.get(guide.difficulty_level, "medium")
        
        # Reemplazar placeholders
        replacements = {
            "{{ component_type }}": guide.component_type.value.title(),
            "{{ component_id }}": guide.component_id,
            "{{ difficulty_level }}": guide.difficulty_level,
            "{{ difficulty_class }}": difficulty_class,
            "{{ angles_html }}": angles_html,
            "{{ camera_settings_html }}": camera_settings_html,
            "{{ lighting_html }}": lighting_html,
            "{{ checklist_html }}": checklist_html,
            "{{ estimated_duration }}": str(guide.estimated_duration),
            "{{ required_views }}": str(guide.required_views),
            "{{ notes }}": guide.notes
        }
        
        processed_template = template
        for placeholder, value in replacements.items():
            processed_template = processed_template.replace(placeholder, value)
        
        return processed_template
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Obtener estado actual del agente"""
        return {
            "agent_name": "Optimizador de Captura",
            "version": "2.0",
            "status": "active",
            "cached_guides": len(self.optimal_angles_cache),
            "supported_components": [comp.value for comp in ComponentType],
            "coordination_connected": self.coordination_interface is not None,
            "last_update": datetime.now().isoformat()
        }


def main():
    """Función principal para testing"""
    agent = CaptureOptimizerAgent()
    
    # Ejemplo de uso
    guide = agent.generate_capture_guide(
        component_type=ComponentType.ESFERA,
        component_id="SPH001"
    )
    
    print(json.dumps(asdict(guide), indent=2, ensure_ascii=False))
    
    # Exportar a HTML
    html_path = "/workspace/code/agents/agent_2_optimizacion_captura/guide_example.html"
    agent.export_guide_to_html(guide, html_path)
    print(f"Guía exportada a: {html_path}")


if __name__ == "__main__":
    main()
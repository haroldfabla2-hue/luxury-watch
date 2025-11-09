#!/usr/bin/env python3
"""
Calculadora de Ángulos Óptimos
=============================

Módulo especializado en el cálculo de ángulos óptimos de captura
usando principios de geometría computacional y óptica fotográfica.

Autor: Sistema de Fotogrametría de Relojes
Versión: 2.0
Fecha: 2025-11-06
"""

import math
import numpy as np
from typing import List, Dict, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum

from capture_optimizer_agent import ComponentType, ComponentGeometry


class AngleMethod(Enum):
    """Métodos de cálculo de ángulos"""
    GEOMETRIC = "geometric"
    OPTICAL = "optical" 
    HYBRID = "hybrid"
    AI_OPTIMIZED = "ai_optimized"


@dataclass
class AngleResult:
    """Resultado de cálculo de ángulo"""
    angle: float
    method: AngleMethod
    confidence: float
    rationale: str
    optimization_score: float
    geometric_considerations: Dict[str, Any]
    optical_considerations: Dict[str, Any]


class AngleCalculator:
    """Calculadora principal de ángulos óptimos"""
    
    def __init__(self):
        self.angle_cache = {}
        self.geometric_formulas = self._init_geometric_formulas()
        self.optical_considerations = self._init_optical_considerations()
    
    def _init_geometric_formulas(self) -> Dict[str, Any]:
        """Inicializar fórmulas geométricas"""
        return {
            "golden_ratio": 137.5,  # Ángulo áureo para distribución óptima
            "fibonacci_angles": [0, 144, 288, 72, 216],  # Serie de Fibonacci
            "critical_reflection": 0,  # Ángulo de reflexión crítica
            "shadow_optimization": 45,  # Ángulo óptimo para evitar sombras
            "edge_highlight": 30  # Ángulo para resaltar bordes
        }
    
    def _init_optical_considerations(self) -> Dict[str, Any]:
        """Inicializar consideraciones ópticas"""
        return {
            "depth_of_field": {
                "macro_range": (1.2, 2.0),  # f-numbers para macro
                "portrait_range": (2.8, 5.6),  # f-numbers para retratos
                "landscape_range": (8.0, 16.0)  # f-numbers para paisajes
            },
            "diffraction_limit": 11.0,  # f-number donde comienza difracción significativa
            "sweet_spot": 8.0,  # f-number óptimo para mayoría de situaciones
            "bokeh_optimization": 2.8,  # f-number para máximo bokeh
            "sharpness_optimization": 8.0  # f-number para máxima nitidez
        }
    
    def calculate_optimal_angles(self, 
                                component_type: ComponentType,
                                geometry: Optional[ComponentGeometry] = None,
                                method: AngleMethod = AngleMethod.HYBRID) -> List[AngleResult]:
        """
        Calcular ángulos óptimos para un componente
        
        Args:
            component_type: Tipo de componente
            geometry: Geometría del componente
            method: Método de cálculo
            
        Returns:
            List[AngleResult]: Lista de resultados de ángulos
        """
        cache_key = f"{component_type.value}_{geometry.width if geometry else 'default'}_{method.value}"
        
        if cache_key in self.angle_cache:
            return self.angle_cache[cache_key]
        
        # Calcular ángulos según el método
        if method == AngleMethod.GEOMETRIC:
            results = self._calculate_geometric_angles(component_type, geometry)
        elif method == AngleMethod.OPTICAL:
            results = self._calculate_optical_angles(component_type, geometry)
        elif method == AngleMethod.HYBRID:
            results = self._calculate_hybrid_angles(component_type, geometry)
        else:  # AI_OPTIMIZED
            results = self._calculate_ai_optimized_angles(component_type, geometry)
        
        # Cache resultados
        self.angle_cache[cache_key] = results
        
        return results
    
    def _calculate_geometric_angles(self, 
                                  component_type: ComponentType, 
                                  geometry: Optional[ComponentGeometry]) -> List[AngleResult]:
        """Calcular ángulos usando principios geométricos puros"""
        results = []
        
        # Ángulos base según tipo de componente
        base_angles = self._get_base_angles(component_type)
        
        # Aplicar ajustes geométricos
        for base_angle in base_angles:
            # Calcular confianza y score de optimización
            confidence = self._calculate_geometric_confidence(base_angle, component_type, geometry)
            optimization_score = self._calculate_optimization_score(base_angle, geometry)
            
            result = AngleResult(
                angle=base_angle,
                method=AngleMethod.GEOMETRIC,
                confidence=confidence,
                rationale=self._generate_geometric_rationale(base_angle, component_type, geometry),
                optimization_score=optimization_score,
                geometric_considerations=self._get_geometric_considerations(base_angle, geometry),
                optical_considerations={}
            )
            
            results.append(result)
        
        return sorted(results, key=lambda x: x.optimization_score, reverse=True)
    
    def _calculate_optical_angles(self, 
                                component_type: ComponentType, 
                                geometry: Optional[ComponentGeometry]) -> List[AngleResult]:
        """Calcular ángulos optimizados para consideraciones ópticas"""
        results = []
        
        # Ángulos base con énfasis óptico
        optical_priorities = self._get_optical_priorities(component_type)
        
        for priority_angle, weight in optical_priorities:
            confidence = self._calculate_optical_confidence(priority_angle, component_type)
            optimization_score = weight * confidence
            
            result = AngleResult(
                angle=priority_angle,
                method=AngleMethod.OPTICAL,
                confidence=confidence,
                rationale=self._generate_optical_rationale(priority_angle, component_type),
                optimization_score=optimization_score,
                geometric_considerations={},
                optical_considerations=self._get_optical_considerations(priority_angle, component_type)
            )
            
            results.append(result)
        
        return sorted(results, key=lambda x: x.optimization_score, reverse=True)
    
    def _calculate_hybrid_angles(self, 
                               component_type: ComponentType, 
                               geometry: Optional[ComponentGeometry]) -> List[AngleResult]:
        """Calcular ángulos combinando criterios geométricos y ópticos"""
        geometric_results = self._calculate_geometric_angles(component_type, geometry)
        optical_results = self._calculate_optical_angles(component_type, geometry)
        
        # Combinar resultados
        all_angles = {}
        
        # Procesar resultados geométricos
        for result in geometric_results:
            angle_key = round(result.angle / 15) * 15  # Redondear a 15 grados
            if angle_key not in all_angles:
                all_angles[angle_key] = result
                all_angles[angle_key].optimization_score *= 0.6  # Peso geométrico
            else:
                # Promediar con resultado existente
                existing = all_angles[angle_key]
                existing.optimization_score = (existing.optimization_score + result.optimization_score) / 2
                existing.confidence = (existing.confidence + result.confidence) / 2
        
        # Procesar resultados ópticos
        for result in optical_results:
            angle_key = round(result.angle / 15) * 15
            if angle_key in all_angles:
                # Combinar con existente
                existing = all_angles[angle_key]
                existing.optimization_score = (existing.optimization_score + result.optimization_score) / 2
                existing.confidence = (existing.confidence + result.confidence) / 2
                
                # Combinar consideraciones
                existing.optical_considerations.update(result.optical_considerations)
                existing.rationale += f" + {result.rationale}"
            else:
                # Crear nuevo resultado
                result.optimization_score *= 0.4  # Peso óptico
                all_angles[angle_key] = result
        
        # Convertir de vuelta a lista y ordenar
        return sorted(all_angles.values(), key=lambda x: x.optimization_score, reverse=True)
    
    def _calculate_ai_optimized_angles(self, 
                                     component_type: ComponentType, 
                                     geometry: Optional[ComponentGeometry]) -> List[AngleResult]:
        """Simular cálculo con IA (en implementación real usaría ML)"""
        # Por ahora usar híbrido como aproximación
        base_results = self._calculate_hybrid_angles(component_type, geometry)
        
        # Aplicar "optimización IA" simulada
        for result in base_results:
            # Simular mejora con IA
            result.confidence *= 1.1  # Mejora de confianza
            result.optimization_score *= 1.05  # Mejora de score
            result.rationale += " [Optimizado con IA]"
            result.method = AngleMethod.AI_OPTIMIZED
        
        return sorted(base_results, key=lambda x: x.optimization_score, reverse=True)
    
    def _get_base_angles(self, component_type: ComponentType) -> List[float]:
        """Obtener ángulos base según tipo de componente"""
        angle_maps = {
            ComponentType.CAJA: [0, 30, 45, 60, 90, 120, 135, 150, 180],
            ComponentType.BISEL: [0, 30, 45, 60, 90, 120, 150, 180],
            ComponentType.CORREA: [0, 45, 90, 135, 180],
            ComponentType.ESFERA: [0, 45, 90, 135, 180, 225, 270, 315]
        }
        
        return angle_maps.get(component_type, [0, 45, 90, 135, 180])
    
    def _get_optical_priorities(self, component_type: ComponentType) -> List[Tuple[float, float]]:
        """Obtener prioridades ópticas con pesos"""
        priorities = {
            ComponentType.CAJA: [(0, 1.0), (45, 0.9), (90, 0.8), (135, 0.7), (180, 0.6)],
            ComponentType.BISEL: [(0, 1.0), (45, 0.95), (90, 0.85), (135, 0.75), (180, 0.65)],
            ComponentType.CORREA: [(90, 1.0), (0, 0.8), (45, 0.7), (135, 0.7), (180, 0.6)],
            ComponentType.ESFERA: [(0, 1.0), (45, 0.9), (90, 0.8), (135, 0.7), (180, 0.6)]
        }
        
        return priorities.get(component_type, [(0, 1.0), (90, 0.8)])
    
    def _calculate_geometric_confidence(self, 
                                      angle: float, 
                                      component_type: ComponentType, 
                                      geometry: Optional[ComponentGeometry]) -> float:
        """Calcular confianza geométrica"""
        confidence = 0.5  # Base
        
        # Ajustar según tipo de componente
        if component_type == ComponentType.ESFERA:
            # Esferas prefieren distribución uniforme
            if angle % 45 == 0:
                confidence += 0.3
            confidence += 0.2 * math.cos(math.radians(angle))
        elif component_type == ComponentType.BISEL:
            # Biseles necesitan mostrar texturas y grabados
            if angle in [0, 45, 90, 135]:
                confidence += 0.3
            confidence += 0.1 * math.sin(math.radians(angle * 2))
        elif component_type == ComponentType.CAJA:
            # Cajas necesitan mostrar profundidad y detalles
            if angle in [0, 45, 90]:
                confidence += 0.2
        else:  # CORREA
            # Correas necesitan mostrar longitud y textura
            if angle == 90:  # Vista lateral
                confidence += 0.4
            elif angle == 0:  # Vista frontal
                confidence += 0.2
        
        # Ajustar según geometría si está disponible
        if geometry:
            if geometry.curvature_radius:
                # Elementos curvos prefieren ciertos ángulos
                curvature_factor = min(geometry.curvature_radius / (geometry.width / 2), 1.0)
                confidence += curvature_factor * 0.1
            
            if geometry.material_reflectivity > 0.5:
                # Materiales reflectantes evitan ciertos ángulos
                if angle in [30, 60, 120, 150]:
                    confidence -= 0.1
        
        return max(0.0, min(1.0, confidence))
    
    def _calculate_optical_confidence(self, 
                                    angle: float, 
                                    component_type: ComponentType) -> float:
        """Calcular confianza óptica"""
        confidence = 0.6  # Base óptica
        
        # Considerar profundidad de campo
        if component_type == ComponentType.ESFERA:
            # Esferas necesitan buena profundidad de campo
            if angle in [0, 45, 90, 135, 180, 225, 270, 315]:
                confidence += 0.2
        elif component_type == ComponentType.BISEL:
            # Biseles necesitan nitidez en grabados
            if angle in [45, 90, 135]:
                confidence += 0.2
        
        return max(0.0, min(1.0, confidence))
    
    def _calculate_optimization_score(self, 
                                    angle: float, 
                                    geometry: Optional[ComponentGeometry]) -> float:
        """Calcular score de optimización general"""
        score = 0.5  # Base
        
        # Distancia del ángulo dorado
        golden_angle = self.geometric_formulas["golden_ratio"]
        golden_distance = abs(angle - golden_angle)
        golden_factor = math.exp(-golden_distance / 90)  # Factor de distancia
        score += golden_factor * 0.3
        
        # Diversidad angular (evitar ángulos muy cercanos)
        # Esta funcionalidad se aplicaría en un contexto de múltiples ángulos
        diversity_factor = 1.0  # Placeholder
        
        # Ajustes por geometría
        if geometry:
            aspect_ratio = max(geometry.width, geometry.height) / min(geometry.width, geometry.height)
            if aspect_ratio > 2:  # Elemento muy alargado
                if angle in [0, 90, 180]:  # Ejes principales
                    score += 0.2
        
        return min(1.0, score)
    
    def _generate_geometric_rationale(self, 
                                    angle: float, 
                                    component_type: ComponentType, 
                                    geometry: Optional[ComponentGeometry]) -> str:
        """Generar justificación geométrica"""
        rationales = []
        
        if angle == 0:
            rationales.append("Vista frontal óptima para mostrar la cara principal")
        elif angle == 45:
            rationales.append("Vista 3/4 proporciona profundidad y dimensión")
        elif angle == 90:
            rationales.append("Vista lateral ideal para mostrar grosor y perfiles")
        elif angle == 135:
            rationales.append("Vista posterior permite ver elementos traseros")
        elif angle == 180:
            rationales.append("Vista posterior completa captura la cara opuesta")
        
        if geometry and geometry.curvature_radius:
            rationales.append(f"Considerando radio de curvatura {geometry.curvature_radius}mm")
        
        return " | ".join(rationales) if rationales else "Ángulo geométricamente optimizado"
    
    def _generate_optical_rationale(self, angle: float, component_type: ComponentType) -> str:
        """Generar justificación óptica"""
        rationales = []
        
        if component_type == ComponentType.ESFERA:
            if angle % 45 == 0:
                rationales.append("Distribución uniforme óptima para superficie esférica")
        elif component_type == ComponentType.BISEL:
            if angle in [45, 90, 135]:
                rationales.append("Ángulos óptimos para resaltar texturas y grabados")
        
        rationales.append("Optimizado para consideraciones de profundidad de campo")
        
        return " | ".join(rationales)
    
    def _get_geometric_considerations(self, 
                                    angle: float, 
                                    geometry: Optional[ComponentGeometry]) -> Dict[str, Any]:
        """Obtener consideraciones geométricas"""
        considerations = {
            "visibility_factor": self._calculate_visibility_factor(angle),
            "shadow_considerations": self._analyze_shadow_behavior(angle),
            "edge_highlighting": self._evaluate_edge_highlighting(angle)
        }
        
        if geometry:
            considerations["aspect_ratio_impact"] = self._assess_aspect_ratio_impact(angle, geometry)
            considerations["curvature_considerations"] = self._analyze_curvature_impact(angle, geometry)
        
        return considerations
    
    def _get_optical_considerations(self, 
                                  angle: float, 
                                  component_type: ComponentType) -> Dict[str, Any]:
        """Obtener consideraciones ópticas"""
        return {
            "depth_of_field_impact": self._assess_dof_impact(angle, component_type),
            "bokeh_characteristics": self._analyze_bokeh_characteristics(angle, component_type),
            "diffraction_considerations": self._evaluate_diffraction_impact(angle),
            "optimal_aperture": self._suggest_optimal_aperture(angle, component_type)
        }
    
    # Métodos auxiliares para cálculos específicos
    
    def _calculate_visibility_factor(self, angle: float) -> float:
        """Calcular factor de visibilidad"""
        # Simulación de factor de visibilidad basado en ángulo
        return 0.8 + 0.2 * math.cos(math.radians(angle))
    
    def _analyze_shadow_behavior(self, angle: float) -> Dict[str, Any]:
        """Analizar comportamiento de sombras"""
        shadow_risk = "low" if angle not in [30, 60, 120, 150] else "medium"
        return {
            "shadow_risk": shadow_risk,
            "optimal_for_shadows": angle in [0, 45, 90, 135],
            "recommended_lighting": "lateral" if angle in [30, 60] else "superior"
        }
    
    def _evaluate_edge_highlighting(self, angle: float) -> Dict[str, Any]:
        """Evaluar resaltado de bordes"""
        edge_highlight_quality = "high" if angle in [30, 60, 120, 150] else "medium"
        return {
            "edge_highlight_quality": edge_highlight_quality,
            "highlight_intensity": 0.7 if edge_highlight_quality == "high" else 0.4
        }
    
    def _assess_aspect_ratio_impact(self, angle: float, geometry: ComponentGeometry) -> Dict[str, Any]:
        """Evaluar impacto de relación de aspecto"""
        aspect_ratio = max(geometry.width, geometry.height) / min(geometry.width, geometry.height)
        
        if aspect_ratio > 3:  # Elemento muy alargado
            optimal_axes = [0, 90] if geometry.width > geometry.height else [90, 0]
            impact = "high" if angle in optimal_axes else "low"
        else:
            impact = "medium"
        
        return {
            "aspect_ratio": aspect_ratio,
            "impact_level": impact,
            "recommended_views": "longitudinal" if aspect_ratio > 2 else "multiangular"
        }
    
    def _analyze_curvature_impact(self, angle: float, geometry: ComponentGeometry) -> Dict[str, Any]:
        """Analizar impacto de curvatura"""
        curvature_severity = "high" if geometry.curvature_radius < geometry.width / 4 else "low"
        
        return {
            "curvature_severity": curvature_severity,
            "optimal_angles": [0, 45, 90, 135] if curvature_severity == "high" else "all",
            "required_views": 8 if curvature_severity == "high" else 4
        }
    
    def _assess_dof_impact(self, angle: float, component_type: ComponentType) -> Dict[str, Any]:
        """Evaluar impacto en profundidad de campo"""
        dof_requirements = {
            ComponentType.ESFERA: "high",
            ComponentType.BISEL: "medium", 
            ComponentType.CAJA: "medium",
            ComponentType.CORREA: "low"
        }
        
        requirement = dof_requirements.get(component_type, "medium")
        
        return {
            "dof_requirement": requirement,
            "recommended_fnumber": self._get_recommended_fnumber(requirement),
            "focus_strategy": "precise" if requirement == "high" else "standard"
        }
    
    def _analyze_bokeh_characteristics(self, angle: float, component_type: ComponentType) -> Dict[str, Any]:
        """Analizar características de bokeh"""
        bokeh_importance = "high" if component_type == ComponentType.ESFERA else "low"
        
        return {
            "bokeh_importance": bokeh_importance,
            "optimal_fnumber": 2.8 if bokeh_importance == "high" else 8.0,
            "background_strategy": "isolated" if bokeh_importance == "high" else "sharp"
        }
    
    def _evaluate_diffraction_impact(self, angle: float) -> Dict[str, Any]:
        """Evaluar impacto de difracción"""
        diffraction_risk = "low" if angle % 45 != 0 else "medium"
        
        return {
            "diffraction_risk": diffraction_risk,
            "recommended_aperture": 8.0 if diffraction_risk == "medium" else 11.0,
            "sharpness_impact": "minimal" if diffraction_risk == "low" else "moderate"
        }
    
    def _suggest_optimal_aperture(self, angle: float, component_type: ComponentType) -> float:
        """Sugerir apertura óptima"""
        base_apertures = {
            ComponentType.ESFERA: 8.0,
            ComponentType.BISEL: 11.0,
            ComponentType.CAJA: 8.0,
            ComponentType.CORREA: 16.0
        }
        
        return base_apertures.get(component_type, 8.0)
    
    def _get_recommended_fnumber(self, requirement: str) -> float:
        """Obtener f-number recomendado según requisito"""
        fnumber_map = {
            "high": 5.6,
            "medium": 8.0,
            "low": 11.0
        }
        
        return fnumber_map.get(requirement, 8.0)
    
    def get_angle_analysis(self, angle: float, component_type: ComponentType) -> Dict[str, Any]:
        """Obtener análisis completo de un ángulo específico"""
        return {
            "angle": angle,
            "component_type": component_type.value,
            "geometric_score": self._calculate_geometric_confidence(angle, component_type, None),
            "optical_score": self._calculate_optical_confidence(angle, component_type),
            "overall_score": (self._calculate_geometric_confidence(angle, component_type, None) + 
                            self._calculate_optical_confidence(angle, component_type)) / 2,
            "considerations": {
                "geometric": self._get_geometric_considerations(angle, None),
                "optical": self._get_optical_considerations(angle, component_type)
            },
            "recommendations": self._generate_angle_recommendations(angle, component_type)
        }
    
    def _generate_angle_recommendations(self, angle: float, component_type: ComponentType) -> List[str]:
        """Generar recomendaciones para un ángulo específico"""
        recommendations = []
        
        if angle == 0:
            recommendations.append("Usar iluminación frontal suave")
            recommendations.append("Configurar exposición para destacar detalles centrales")
        elif angle == 45:
            recommendations.append("Iluminación lateral para crear profundidad")
            recommendations.append("Verificar que no se proyecten sombras indeseadas")
        elif angle == 90:
            recommendations.append("Enfocar en el plano lateral")
            recommendations.append("Usar mayor profundidad de campo")
        
        return recommendations


if __name__ == "__main__":
    # Ejemplo de uso
    calculator = AngleCalculator()
    
    # Calcular ángulos para esfera
    sphere_angles = calculator.calculate_optimal_angles(
        ComponentType.ESFERA,
        ComponentGeometry(40, 40, 40, curvature_radius=20, material_reflectivity=0.6)
    )
    
    print("Ángulos optimizados para esfera:")
    for result in sphere_angles:
        print(f"  {result.angle}° - Score: {result.optimization_score:.2f}, Confianza: {result.confidence:.2f}")
        print(f"    Racional: {result.rationale}")
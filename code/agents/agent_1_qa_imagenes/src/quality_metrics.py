"""
Métricas de Calidad de Imágenes
Implementación de métricas individuales para análisis de calidad
"""

import cv2
import numpy as np
from typing import Dict, Any, List, Tuple
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
import math

from config import QualityLevel, QualityThresholds

class MetricType(Enum):
    BRISQUE = "brisque"
    SHARPNESS = "sharpness"
    EXPOSURE = "exposure"
    RESOLUTION = "resolution"
    ASPECT_RATIO = "aspect_ratio"

@dataclass
class MetricResult:
    """Resultado de una métrica específica"""
    metric_name: str
    metric_type: MetricType
    value: float
    score: float  # 0-100
    level: QualityLevel
    issues: List[str]
    recommendations: List[str]
    metadata: Dict[str, Any]

class BaseMetric(ABC):
    """Clase base para métricas de calidad"""
    
    def __init__(self, thresholds: QualityThresholds):
        self.thresholds = thresholds
        self.name = self.__class__.__name__
    
    @abstractmethod
    async def calculate(self, *args) -> MetricResult:
        """Calcula la métrica"""
        pass
    
    def _determine_level(self, score: float) -> QualityLevel:
        """Determina nivel de calidad basado en score"""
        if score >= 90:
            return QualityLevel.EXCELLENT
        elif score >= 75:
            return QualityLevel.GOOD
        elif score >= 60:
            return QualityLevel.FAIR
        elif score >= 40:
            return QualityLevel.POOR
        else:
            return QualityLevel.REJECTED

class BRISQUEMetric(BaseMetric):
    """Métrica BRISQUE para evaluación de calidad sin referencia"""
    
    def __init__(self, thresholds: QualityThresholds):
        super().__init__(thresholds)
        self.metric_type = MetricType.BRISQUE
    
    async def calculate(self, image: np.ndarray) -> MetricResult:
        """Calcula score BRISQUE"""
        try:
            # Convertir a escala de grises si es necesario
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Calcular score BRISQUE (menor es mejor)
            # BRISQUE score típico: 0-100 (0 = mejor calidad)
            brisque_score = self._calculate_brisque_score(gray)
            
            # Convertir a score de calidad (mayor es mejor)
            quality_score = max(0, 100 - brisque_score)
            
            # Determinar nivel y problemas
            level = self._determine_level(quality_score)
            issues, recommendations = self._analyze_brisque_results(brisque_score)
            
            return MetricResult(
                metric_name="BRISQUE",
                metric_type=self.metric_type,
                value=brisque_score,
                score=quality_score,
                level=level,
                issues=issues,
                recommendations=recommendations,
                metadata={
                    "brisque_range": "0-100 (menor es mejor)",
                    "interpretation": "Blind/Referenceless Image Spatial Quality Evaluator"
                }
            )
            
        except Exception as e:
            return self._create_error_result(f"Error calculando BRISQUE: {str(e)}")
    
    def _calculate_brisque_score(self, gray_image: np.ndarray) -> float:
        """Calcula score BRISQUE aproximado usando NIQE"""
        try:
            # Usar NIQE como aproximación a BRISQUE
            # NIQE: Naturalness Image Quality Evaluator
            niqe_score = cv2.quality.QualityNIQE_create(gray_image).computeScore()
            return float(niqe_score) if not np.isnan(niqe_score) else 50.0
        except:
            # Fallback: calcular métricas alternativas
            return self._fallback_quality_score(gray_image)
    
    def _fallback_quality_score(self, gray_image: np.ndarray) -> float:
        """Score alternativo cuando BRISQUE no está disponible"""
        # Calcular métricas básicas de calidad
        variance = np.var(gray_image)
        mean_brightness = np.mean(gray_image)
        
        # Score basado en varianza y brillo
        # Imagen con buena calidad debe tener buena varianza y brillo equilibrado
        variance_score = min(100, variance / 100)
        brightness_score = 100 - abs(mean_brightness - 128) * 0.5
        
        return (variance_score + brightness_score) / 2
    
    def _analyze_brisque_results(self, brisque_score: float) -> Tuple[List[str], List[str]]:
        """Analiza resultados BRISQUE y genera recomendaciones"""
        issues = []
        recommendations = []
        
        if brisque_score > self.thresholds.brisque_fair:
            issues.append("Calidad de imagen deficiente según BRISQUE")
            recommendations.append("Recapturar la imagen con mejor iluminación y enfoque")
        elif brisque_score > self.thresholds.brisque_good:
            issues.append("Calidad de imagen moderada según BRISQUE")
            recommendations.append("Considerar ajustes menores en iluminación o enfoque")
        else:
            recommendations.append("Buena calidad general según métricas objetivas")
        
        return issues, recommendations
    
    def _create_error_result(self, error_msg: str) -> MetricResult:
        """Crea resultado de error"""
        return MetricResult(
            metric_name="BRISQUE",
            metric_type=self.metric_type,
            value=0.0,
            score=0.0,
            level=QualityLevel.POOR,
            issues=[error_msg],
            recommendations=["Verificar disponibilidad de métricas de OpenCV"],
            metadata={"error": error_msg}
        )

class SharpnessMetric(BaseMetric):
    """Métrica de nitidez basada en varianza Laplaciana"""
    
    def __init__(self, thresholds: QualityThresholds):
        super().__init__(thresholds)
        self.metric_type = MetricType.SHARPNESS
    
    async def calculate(self, image: np.ndarray) -> MetricResult:
        """Calcula score de nitidez usando varianza Laplaciana"""
        try:
            # Convertir a escala de grises si es necesario
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Calcular varianza Laplaciana
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            laplacian_variance = laplacian.var()
            
            # Convertir a score de calidad
            sharpness_score = self._calculate_sharpness_score(laplacian_variance)
            
            # Determinar nivel y problemas
            level = self._determine_level(sharpness_score)
            issues, recommendations = self._analyze_sharpness_results(laplacian_variance)
            
            return MetricResult(
                metric_name="Sharpness",
                metric_type=self.metric_type,
                value=laplacian_variance,
                score=sharpness_score,
                level=level,
                issues=issues,
                recommendations=recommendations,
                metadata={
                    "laplacian_variance": laplacian_variance,
                    "larger_values_better": True,
                    "threshold_excellent": self.thresholds.laplacian_excellent,
                    "threshold_good": self.thresholds.laplacian_good,
                    "threshold_fair": self.thresholds.laplacian_fair
                }
            )
            
        except Exception as e:
            return self._create_error_result(f"Error calculando nitidez: {str(e)}")
    
    def _calculate_sharpness_score(self, laplacian_variance: float) -> float:
        """Convierte varianza Laplaciana a score de calidad"""
        if laplacian_variance >= self.thresholds.laplacian_excellent:
            return 100.0
        elif laplacian_variance >= self.thresholds.laplacian_good:
            score = 75 + (laplacian_variance - self.thresholds.laplacian_good) * 25 / (self.thresholds.laplacian_excellent - self.thresholds.laplacian_good)
        elif laplacian_variance >= self.thresholds.laplacian_fair:
            score = 60 + (laplacian_variance - self.thresholds.laplacian_fair) * 15 / (self.thresholds.laplacian_good - self.thresholds.laplacian_fair)
        else:
            score = max(0, laplacian_variance * 60 / self.thresholds.laplacian_fair)
        
        return min(100, max(0, score))
    
    def _analyze_sharpness_results(self, laplacian_variance: float) -> Tuple[List[str], List[str]]:
        """Analiza resultados de nitidez"""
        issues = []
        recommendations = []
        
        if laplacian_variance < self.thresholds.laplacian_fair:
            issues.append("Imagen muy desenfocada")
            recommendations.extend([
                "Enfocar correctamente la cámara",
                "Usar trípode o estabilizador",
                "Aumentar velocidad de obturación",
                "Verificar que el lente esté limpio"
            ])
        elif laplacian_variance < self.thresholds.laplacian_good:
            issues.append("Nitidez moderada")
            recommendations.extend([
                "Mejorar enfoque ligeramente",
                "Verificar estabilidad durante captura"
            ])
        else:
            recommendations.append("Buena nitidez detectada")
        
        return issues, recommendations
    
    def _create_error_result(self, error_msg: str) -> MetricResult:
        return MetricResult(
            metric_name="Sharpness",
            metric_type=self.metric_type,
            value=0.0,
            score=0.0,
            level=QualityLevel.POOR,
            issues=[error_msg],
            recommendations=["Verificar procesamiento de imagen"],
            metadata={"error": error_msg}
        )

class ExposureMetric(BaseMetric):
    """Métrica de exposición basada en histograma"""
    
    def __init__(self, thresholds: QualityThresholds):
        super().__init__(thresholds)
        self.metric_type = MetricType.EXPOSURE
    
    async def calculate(self, image: np.ndarray) -> MetricResult:
        """Calcula score de exposición basado en histograma"""
        try:
            # Convertir a escala de grises si es necesario
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Calcular histograma
            histogram = cv2.calcHist([gray], [0], None, [256], [0, 256])
            histogram = histogram.flatten() / histogram.sum()  # Normalizar
            
            # Analizar distribución de exposición
            exposure_analysis = self._analyze_exposure_distribution(histogram)
            
            # Calcular score de exposición
            exposure_score = exposure_analysis['balance_score']
            
            # Determinar nivel y problemas
            level = self._determine_level(exposure_score)
            issues, recommendations = self._analyze_exposure_results(exposure_analysis)
            
            return MetricResult(
                metric_name="Exposure",
                metric_type=self.metric_type,
                value=exposure_analysis['balance_score'],
                score=exposure_score,
                level=level,
                issues=issues,
                recommendations=recommendations,
                metadata={
                    "histogram": exposure_analysis['histogram_dict'],
                    "underexposed_ratio": exposure_analysis['underexposed_ratio'],
                    "overexposed_ratio": exposure_analysis['overexposed_ratio'],
                    "mean_brightness": exposure_analysis['mean_brightness']
                }
            )
            
        except Exception as e:
            return self._create_error_result(f"Error calculando exposición: {str(e)}")
    
    def _analyze_exposure_distribution(self, histogram: np.ndarray) -> Dict[str, Any]:
        """Analiza distribución de exposición en histograma"""
        total_pixels = len(histogram)
        
        # Definir rangos de exposición
        shadows = histogram[0:64]    # 0-63: sombras
        midtones = histogram[64:192] # 64-191: tonos medios
        highlights = histogram[192:256] # 192-255: altas luces
        
        # Calcular proporciones
        shadows_ratio = shadows.sum()
        midtones_ratio = midtones.sum()
        highlights_ratio = highlights.sum()
        
        # Detectar problemas de exposición
        underexposed = shadows_ratio > 0.7  # 70% en sombras
        overexposed = highlights_ratio > 0.7  # 70% en altas luces
        
        # Calcular score de balance
        # Una buena exposición debe tener distribución equilibrada
        ideal_midtones = 0.5  # 50% en tonos medios es ideal
        midtones_deviation = abs(midtones_ratio - ideal_midtones)
        
        balance_score = max(0, 100 - midtones_deviation * 200)
        
        if underexposed:
            balance_score *= 0.5  # Penalizar subexposición severa
        if overexposed:
            balance_score *= 0.5  # Penalizar sobreexposición severa
        
        return {
            'histogram_dict': {
                'shadows': float(shadows_ratio),
                'midtones': float(midtones_ratio),
                'highlights': float(highlights_ratio)
            },
            'underexposed_ratio': float(shadows_ratio),
            'overexposed_ratio': float(highlights_ratio),
            'mean_brightness': float(np.average(np.arange(256), weights=histogram)),
            'balance_score': float(balance_score)
        }
    
    def _analyze_exposure_results(self, exposure_analysis: Dict[str, Any]) -> Tuple[List[str], List[str]]:
        """Analiza resultados de exposición"""
        issues = []
        recommendations = []
        
        shadows_ratio = exposure_analysis['underexposed_ratio']
        highlights_ratio = exposure_analysis['overexposed_ratio']
        
        if shadows_ratio > 0.7:
            issues.append("Imagen subexpuesta (demasiado oscura)")
            recommendations.extend([
                "Aumentar ISO o tiempo de exposición",
                "Usar apertura más amplia",
                "Mejorar iluminación ambiente"
            ])
        elif shadows_ratio > 0.5:
            issues.append("Tendencia a subexposición")
            recommendations.append("Ajustar exposición ligeramente hacia arriba")
        
        if highlights_ratio > 0.7:
            issues.append("Imagen sobreexpuesta (quemada)")
            recommendations.extend([
                "Reducir tiempo de exposición",
                "Usar apertura más pequeña",
                "Considerar filtros ND"
            ])
        elif highlights_ratio > 0.5:
            issues.append("Tendencia a sobreexposición")
            recommendations.append("Ajustar exposición ligeramente hacia abajo")
        
        if shadows_ratio <= 0.7 and highlights_ratio <= 0.5:
            recommendations.append("Exposición bien balanceada")
        
        return issues, recommendations
    
    def _create_error_result(self, error_msg: str) -> MetricResult:
        return MetricResult(
            metric_name="Exposure",
            metric_type=self.metric_type,
            value=0.0,
            score=0.0,
            level=QualityLevel.POOR,
            issues=[error_msg],
            recommendations=["Verificar análisis de histograma"],
            metadata={"error": error_msg}
        )

class ResolutionMetric(BaseMetric):
    """Métrica de resolución"""
    
    def __init__(self, thresholds: QualityThresholds):
        super().__init__(thresholds)
        self.metric_type = MetricType.RESOLUTION
    
    async def calculate(self, image_info: Dict[str, Any]) -> MetricResult:
        """Calcula score de resolución"""
        try:
            width = image_info['width']
            height = image_info['height']
            total_pixels = width * height
            
            # Calcular score basado en resolución mínima
            min_pixels = self.thresholds.min_width * self.thresholds.min_height
            
            if total_pixels >= min_pixels * 4:  # 4x la resolución mínima
                resolution_score = 100.0
            elif total_pixels >= min_pixels * 2:  # 2x la resolución mínima
                resolution_score = 90.0
            elif total_pixels >= min_pixels:  # Resolución mínima
                resolution_score = 75.0
            elif total_pixels >= min_pixels * 0.5:  # Mitad de resolución mínima
                resolution_score = 60.0
            else:
                resolution_score = 30.0
            
            # Determinar nivel y problemas
            level = self._determine_level(resolution_score)
            issues, recommendations = self._analyze_resolution_results(width, height, total_pixels)
            
            return MetricResult(
                metric_name="Resolution",
                metric_type=self.metric_type,
                value=total_pixels,
                score=resolution_score,
                level=level,
                issues=issues,
                recommendations=recommendations,
                metadata={
                    'width': width,
                    'height': height,
                    'total_pixels': total_pixels,
                    'megapixels': total_pixels / 1000000,
                    'required_min_pixels': min_pixels
                }
            )
            
        except Exception as e:
            return self._create_error_result(f"Error calculando resolución: {str(e)}")
    
    def _analyze_resolution_results(self, width: int, height: int, total_pixels: int) -> Tuple[List[str], List[str]]:
        """Analiza resultados de resolución"""
        issues = []
        recommendations = []
        
        megapixels = total_pixels / 1000000
        
        if total_pixels < self.thresholds.min_width * self.thresholds.min_height:
            issues.append(f"Resolución insuficiente: {width}x{height} ({megapixels:.1f}MP)")
            recommendations.extend([
                f"Capturar a mínimo {self.thresholds.min_width}x{self.thresholds.min_height}",
                "Usar cámara con mayor resolución",
                "Evitar recorte excesivo de la imagen"
            ])
        elif megapixels < 2.0:
            recommendations.append("Resolución baja pero utilizable para web")
        elif megapixels < 5.0:
            recommendations.append("Resolución moderada adecuada para большин casos")
        else:
            recommendations.append("Excelente resolución para impresión y web")
        
        return issues, recommendations
    
    def _create_error_result(self, error_msg: str) -> MetricResult:
        return MetricResult(
            metric_name="Resolution",
            metric_type=self.metric_type,
            value=0.0,
            score=0.0,
            level=QualityLevel.POOR,
            issues=[error_msg],
            recommendations=["Verificar información de imagen"],
            metadata={"error": error_msg}
        )

class AspectRatioMetric(BaseMetric):
    """Métrica de aspect ratio"""
    
    def __init__(self, thresholds: QualityThresholds):
        super().__init__(thresholds)
        self.metric_type = MetricType.ASPECT_RATIO
    
    async def calculate(self, image_info: Dict[str, Any]) -> MetricResult:
        """Calcula score de aspect ratio"""
        try:
            width = image_info['width']
            height = image_info['height']
            
            # Calcular aspect ratio
            aspect_ratio = width / height
            
            # Aspect ratios comunes
            common_ratios = {
                '1:1': 1.0,
                '4:3': 4/3,
                '3:2': 3/2,
                '16:9': 16/9,
                '21:9': 21/9
            }
            
            # Encontrar el ratio más cercano
            closest_ratio = min(common_ratios.values(), 
                              key=lambda x: abs(x - aspect_ratio))
            
            # Calcular score basado en proximidad a ratios comunes
            deviation = abs(aspect_ratio - closest_ratio)
            
            if deviation < 0.05:  # Muy cercano a ratio común
                aspect_ratio_score = 100.0
            elif deviation < 0.1:  #razonablemente cercano
                aspect_ratio_score = 90.0
            elif deviation < 0.2:  # aceptable
                aspect_ratio_score = 75.0
            else:  # Ratio inusual
                aspect_ratio_score = 60.0
            
            # Determinar nivel y problemas
            level = self._determine_level(aspect_ratio_score)
            issues, recommendations = self._analyze_aspect_ratio_results(
                aspect_ratio, closest_ratio, deviation
            )
            
            return MetricResult(
                metric_name="Aspect Ratio",
                metric_type=self.metric_type,
                value=aspect_ratio,
                score=aspect_ratio_score,
                level=level,
                issues=issues,
                recommendations=recommendations,
                metadata={
                    'aspect_ratio': aspect_ratio,
                    'closest_common_ratio': closest_ratio,
                    'deviation': deviation,
                    'width_height_ratio': f"{width}:{height}"
                }
            )
            
        except Exception as e:
            return self._create_error_result(f"Error calculando aspect ratio: {str(e)}")
    
    def _analyze_aspect_ratio_results(self, aspect_ratio: float, 
                                    closest_ratio: float, deviation: float) -> Tuple[List[str], List[str]]:
        """Analiza resultados de aspect ratio"""
        issues = []
        recommendations = []
        
        # Identificar el ratio común más cercano
        ratio_names = {
            1.0: '1:1 (cuadrado)',
            4/3: '4:3 (estándar)',
            3/2: '3:2 (fotografía)',
            16/9: '16:9 (panorámico)',
            21/9: '21:9 (ultra panorámico)'
        }
        
        closest_name = ratio_names.get(closest_ratio, f'{closest_ratio:.2f}:1')
        
        if deviation > 0.2:
            issues.append(f"Aspect ratio inusual: {aspect_ratio:.2f}:1")
            recommendations.append(f"Considerar usar ratios estándar como {closest_name}")
        elif deviation > 0.1:
            recommendations.append(f"Aspect ratio aceptable, similar a {closest_name}")
        else:
            recommendations.append(f"Excelente aspect ratio: {closest_name}")
        
        return issues, recommendations
    
    def _create_error_result(self, error_msg: str) -> MetricResult:
        return MetricResult(
            metric_name="Aspect Ratio",
            metric_type=self.metric_type,
            value=1.0,
            score=0.0,
            level=QualityLevel.POOR,
            issues=[error_msg],
            recommendations=["Verificar dimensiones de imagen"],
            metadata={"error": error_msg}
        )
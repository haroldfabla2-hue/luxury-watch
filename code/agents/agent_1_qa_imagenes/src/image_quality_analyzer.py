"""
Agente 1: Analista de Calidad de Imágenes
Implementación de métricas de calidad usando OpenCV
"""

import cv2
import numpy as np
import asyncio
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
from pathlib import Path
import hashlib
import json
from dataclasses import dataclass, asdict
from loguru import logger

from config import AgentConfig, QualityLevel, QualityThresholds, QualityWeights
from quality_metrics import (
    BRISQUEMetric, SharpnessMetric, ExposureMetric, 
    ResolutionMetric, AspectRatioMetric
)

@dataclass
class QualityAnalysisResult:
    """Resultado del análisis de calidad de imagen"""
    # Información básica
    image_path: str
    image_hash: str
    analysis_timestamp: datetime
    processing_time: float
    
    # Métricas individuales
    brisque_score: float
    brisque_quality_level: QualityLevel
    
    sharpness_variance: float
    sharpness_score: float
    sharpness_level: QualityLevel
    
    exposure_histogram: Dict[str, float]
    exposure_balance_score: float
    exposure_level: QualityLevel
    
    width: int
    height: int
    total_pixels: int
    resolution_score: float
    resolution_level: QualityLevel
    
    aspect_ratio: float
    aspect_ratio_score: float
    aspect_ratio_level: QualityLevel
    
    # Score final ponderado
    overall_score: float  # 0-100
    overall_level: QualityLevel
    
    # Problemas detectados
    issues_detected: List[str]
    recommendations: List[str]
    
    # Metadatos adicionales
    file_size: int
    image_format: str

@dataclass
class QualityAnalysisRequest:
    """Solicitud de análisis de calidad"""
    image_path: str = None
    image_data: bytes = None
    image_url: str = None
    analysis_options: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.analysis_options is None:
            self.analysis_options = {}

class ImageQualityAnalyzer:
    """Analizador principal de calidad de imágenes"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.thresholds = config.quality_thresholds
        self.weights = config.quality_weights
        
        # Inicializar métricas
        self.metrics = {
            'brisque': BRISQUEMetric(self.thresholds),
            'sharpness': SharpnessMetric(self.thresholds),
            'exposure': ExposureMetric(self.thresholds),
            'resolution': ResolutionMetric(self.thresholds),
            'aspect_ratio': AspectRatioMetric(self.thresholds)
        }
        
        # Cache de resultados
        self.analysis_cache: Dict[str, QualityAnalysisResult] = {}
        self.cache_max_size = 1000
        
        # Contadores de rendimiento
        self.analysis_count = 0
        self.total_processing_time = 0.0
        
        logger.info(f"ImageQualityAnalyzer inicializado con configuración: {config.agent_id}")

    async def analyze_image(self, request: QualityAnalysisRequest) -> QualityAnalysisResult:
        """Analiza la calidad de una imagen"""
        start_time = datetime.now()
        
        try:
            # Verificar parámetros
            if not any([request.image_path, request.image_data, request.image_url]):
                raise ValueError("Debe proporcionar al menos una fuente de imagen")
            
            # Cargar imagen
            image, image_info = await self._load_image(request)
            
            # Verificar cache
            cache_key = self._get_cache_key(image_info, request.analysis_options)
            if cache_key in self.analysis_cache:
                logger.debug(f"Usando resultado en cache para {image_info['path']}")
                return self.analysis_cache[cache_key]
            
            # Ejecutar análisis
            logger.info(f"Iniciando análisis de calidad para {image_info['path']}")
            
            # Análisis concurrente de métricas
            metrics_tasks = {
                'brisque': self.metrics['brisque'].calculate(image),
                'sharpness': self.metrics['sharpness'].calculate(image),
                'exposure': self.metrics['exposure'].calculate(image),
                'resolution': self.metrics['resolution'].calculate(image_info),
                'aspect_ratio': self.metrics['aspect_ratio'].calculate(image_info)
            }
            
            metrics_results = await asyncio.gather(*metrics_tasks.values())
            
            # Compilar resultados
            result = self._compile_results(
                image_info, metrics_results, request.analysis_options, start_time
            )
            
            # Actualizar cache
            self._update_cache(cache_key, result)
            
            # Actualizar estadísticas
            processing_time = (datetime.now() - start_time).total_seconds()
            self._update_performance_stats(processing_time)
            
            logger.info(f"Análisis completado en {processing_time:.2f}s - Score: {result.overall_score:.1f}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error durante análisis de imagen: {e}")
            raise

    async def analyze_batch(self, requests: List[QualityAnalysisRequest]) -> List[QualityAnalysisResult]:
        """Analiza múltiples imágenes en lote"""
        logger.info(f"Iniciando análisis por lotes de {len(requests)} imágenes")
        
        # Limitar concurrencia
        semaphore = asyncio.Semaphore(self.config.max_concurrent_analyses)
        
        async def analyze_with_semaphore(request):
            async with semaphore:
                return await self.analyze_image(request)
        
        # Ejecutar análisis con límite de concurrencia
        results = await asyncio.gather(*[
            analyze_with_semaphore(req) for req in requests
        ])
        
        logger.info(f"Análisis por lotes completado - {len(results)} imágenes procesadas")
        return results

    async def _load_image(self, request: QualityAnalysisRequest) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Carga imagen desde diferentes fuentes"""
        try:
            if request.image_path:
                return await self._load_image_from_path(request.image_path)
            elif request.image_data:
                return await self._load_image_from_data(request.image_data)
            elif request.image_url:
                return await self._load_image_from_url(request.image_url)
            else:
                raise ValueError("Fuente de imagen no soportada")
                
        except Exception as e:
            logger.error(f"Error cargando imagen: {e}")
            raise

    async def _load_image_from_path(self, image_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Carga imagen desde archivo"""
        path = Path(image_path)
        
        if not path.exists():
            raise FileNotFoundError(f"Archivo no encontrado: {image_path}")
        
        # Verificar tamaño
        file_size = path.stat().st_size
        if file_size > self.config.max_image_size:
            raise ValueError(f"Imagen demasiado grande: {file_size} bytes")
        
        # Cargar con OpenCV
        image = cv2.imread(str(path))
        if image is None:
            raise ValueError(f"No se pudo cargar la imagen: {image_path}")
        
        # Información de la imagen
        image_info = {
            'path': str(path),
            'filename': path.name,
            'width': image.shape[1],
            'height': image.shape[0],
            'channels': image.shape[2] if len(image.shape) > 2 else 1,
            'file_size': file_size,
            'format': path.suffix.lower()
        }
        
        return image, image_info

    async def _load_image_from_data(self, image_data: bytes) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Carga imagen desde datos en memoria"""
        # Verificar tamaño
        if len(image_data) > self.config.max_image_size:
            raise ValueError(f"Imagen demasiado grande: {len(image_data)} bytes")
        
        # Convertir bytes a numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("No se pudo decodificar la imagen")
        
        # Información básica
        image_info = {
            'path': '<memory>',
            'filename': 'image_data',
            'width': image.shape[1],
            'height': image.shape[0],
            'channels': image.shape[2] if len(image.shape) > 2 else 1,
            'file_size': len(image_data),
            'format': 'unknown'
        }
        
        return image, image_info

    async def _load_image_from_url(self, image_url: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Carga imagen desde URL"""
        try:
            import aiohttp
            
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status != 200:
                        raise ValueError(f"Error HTTP {response.status} al descargar imagen")
                    
                    image_data = await response.read()
                    return await self._load_image_from_data(image_data)
                    
        except ImportError:
            raise ImportError("aiohttp requerido para cargar imágenes desde URL")
        except Exception as e:
            logger.error(f"Error cargando imagen desde URL {image_url}: {e}")
            raise

    def _get_cache_key(self, image_info: Dict[str, Any], analysis_options: Dict[str, Any]) -> str:
        """Genera clave de cache basada en información de imagen y opciones"""
        # Usar path, tamaño y opciones de análisis para el cache
        cache_data = {
            'path': image_info.get('path', ''),
            'file_size': image_info.get('file_size', 0),
            'options': analysis_options
        }
        
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_string.encode()).hexdigest()

    def _update_cache(self, cache_key: str, result: QualityAnalysisResult):
        """Actualiza cache de resultados"""
        if len(self.analysis_cache) >= self.cache_max_size:
            # Eliminar entrada más antigua
            oldest_key = next(iter(self.analysis_cache))
            del self.analysis_cache[oldest_key]
        
        self.analysis_cache[cache_key] = result

    def _compile_results(self, 
                        image_info: Dict[str, Any], 
                        metrics_results: List[Any],
                        analysis_options: Dict[str, Any],
                        start_time: datetime) -> QualityAnalysisResult:
        """Compila resultados de métricas en resultado final"""
        
        # Extraer resultados de métricas
        brisque_result, sharpness_result, exposure_result, resolution_result, aspect_ratio_result = metrics_results
        
        # Calcular score final ponderado
        overall_score = (
            brisque_result['score'] * self.weights.brisque_weight +
            sharpness_result['score'] * self.weights.sharpness_weight +
            exposure_result['score'] * self.weights.exposure_weight +
            resolution_result['score'] * self.weights.resolution_weight +
            aspect_ratio_result['score'] * self.weights.aspect_ratio_weight
        )
        
        # Determinar nivel de calidad general
        overall_level = self._determine_quality_level(overall_score)
        
        # Recopilar problemas y recomendaciones
        issues, recommendations = self._collect_issues_and_recommendations([
            brisque_result, sharpness_result, exposure_result, 
            resolution_result, aspect_ratio_result
        ])
        
        # Crear resultado final
        result = QualityAnalysisResult(
            image_path=image_info['path'],
            image_hash=hashlib.md5(str(image_info).encode()).hexdigest(),
            analysis_timestamp=datetime.now(),
            processing_time=(datetime.now() - start_time).total_seconds(),
            
            # BRISQUE
            brisque_score=brisque_result['value'],
            brisque_quality_level=brisque_result['level'],
            
            # Sharpness
            sharpness_variance=sharpness_result['variance'],
            sharpness_score=sharpness_result['score'],
            sharpness_level=sharpness_result['level'],
            
            # Exposure
            exposure_histogram=exposure_result['histogram'],
            exposure_balance_score=exposure_result['balance_score'],
            exposure_level=exposure_result['level'],
            
            # Resolution
            width=image_info['width'],
            height=image_info['height'],
            total_pixels=image_info['width'] * image_info['height'],
            resolution_score=resolution_result['score'],
            resolution_level=resolution_result['level'],
            
            # Aspect Ratio
            aspect_ratio=aspect_ratio_result['aspect_ratio'],
            aspect_ratio_score=aspect_ratio_result['score'],
            aspect_ratio_level=aspect_ratio_result['level'],
            
            # Score final
            overall_score=overall_score,
            overall_level=overall_level,
            
            # Issues y recomendaciones
            issues_detected=issues,
            recommendations=recommendations,
            
            # Metadatos
            file_size=image_info['file_size'],
            image_format=image_info['format']
        )
        
        return result

    def _determine_quality_level(self, score: float) -> QualityLevel:
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

    def _collect_issues_and_recommendations(self, metrics_results: List[Dict[str, Any]]) -> Tuple[List[str], List[str]]:
        """Recopila problemas detectados y recomendaciones"""
        issues = []
        recommendations = []
        
        for metric_result in metrics_results:
            metric_name = metric_result.get('metric_name', 'unknown')
            
            # Recopilar problemas
            for issue in metric_result.get('issues', []):
                issues.append(f"{metric_name}: {issue}")
            
            # Recopilar recomendaciones
            for recommendation in metric_result.get('recommendations', []):
                recommendations.append(recommendation)
        
        # Recomendaciones generales basadas en problemas
        if any('desenfoque' in issue.lower() for issue in issues):
            recommendations.append("Considerar usar un trípode o estabilizador para reducir el desenfoque")
        
        if any('exposición' in issue.lower() for issue in issues):
            recommendations.append("Ajustar la configuración de exposición o usar filtros HDR")
        
        if any('resolución' in issue.lower() for issue in issues):
            recommendations.append("Capturar la imagen a mayor resolución o redimensionar la imagen original")
        
        return issues, recommendations

    def _update_performance_stats(self, processing_time: float):
        """Actualiza estadísticas de rendimiento"""
        self.analysis_count += 1
        self.total_processing_time += processing_time

    def get_performance_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de rendimiento"""
        avg_time = self.total_processing_time / max(self.analysis_count, 1)
        
        return {
            'total_analyses': self.analysis_count,
            'average_processing_time': avg_time,
            'total_processing_time': self.total_processing_time,
            'cache_size': len(self.analysis_cache),
            'cache_hit_rate': 0.0  # Se podría implementar tracking de hits
        }

    def clear_cache(self):
        """Limpia el cache de análisis"""
        self.analysis_cache.clear()
        logger.info("Cache de análisis limpiado")

    async def health_check(self) -> Dict[str, Any]:
        """Verificación de salud del agente"""
        return {
            'status': 'healthy',
            'agent_id': self.config.agent_id,
            'version': '1.0.0',
            'metrics_available': list(self.metrics.keys()),
            'performance_stats': self.get_performance_stats(),
            'cache_size': len(self.analysis_cache),
            'configuration': {
                'max_concurrent_analyses': self.config.max_concurrent_analyses,
                'supported_formats': self.config.supported_formats,
                'max_image_size': self.config.max_image_size
            }
        }
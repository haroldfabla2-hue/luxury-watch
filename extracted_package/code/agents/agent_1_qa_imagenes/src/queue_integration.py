"""
Integración con Sistema de Colas
Implementa interfaz para Agent Manager y Task Queue
"""

import asyncio
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import asdict
from loguru import logger

from src.image_quality_analyzer import ImageQualityAnalyzer, QualityAnalysisRequest, QualityAnalysisResult
from config import AgentConfig
from quality_metrics import MetricResult

# Imports del sistema de orquestación existente
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../orchestration'))

try:
    from task_queue import TaskQueue, TaskPriority, TaskType
    from agent_manager import Agent, AgentConfig as BaseAgentConfig, AgentType
    ORCHESTRATION_AVAILABLE = True
except ImportError:
    logger.warning("Sistema de orquestación no disponible - ejecutando en modo standalone")
    ORCHESTRATION_AVAILABLE = False

class ImageQAQueueIntegration:
    """Integración con sistema de colas para análisis de imágenes"""
    
    def __init__(self, analyzer: ImageQualityAnalyzer):
        self.analyzer = analyzer
        self.task_handlers = {
            'analyze_image': self._handle_analyze_image,
            'analyze_batch': self._handle_analyze_batch,
            'get_quality_report': self._handle_get_quality_report,
            'calibrate_thresholds': self._handle_calibrate_thresholds,
            'bulk_quality_check': self._handle_bulk_quality_check
        }
        
        logger.info("ImageQAQueueIntegration inicializado")

    async def handle_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maneja tareas desde el sistema de colas"""
        try:
            task_type = task_data.get('task_type')
            task_id = task_data.get('task_id', str(uuid.uuid4()))
            
            if task_type not in self.task_handlers:
                raise ValueError(f"Tipo de tarea no soportado: {task_type}")
            
            logger.info(f"Procesando tarea {task_type} (ID: {task_id})")
            
            start_time = datetime.now()
            result = await self.task_handlers[task_type](task_data)
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Agregar metadatos de ejecución
            result.update({
                'task_id': task_id,
                'task_type': task_type,
                'processing_time': processing_time,
                'timestamp': datetime.now().isoformat(),
                'agent_id': self.analyzer.config.agent_id
            })
            
            logger.info(f"Tarea {task_id} completada en {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Error procesando tarea {task_data}: {e}")
            return {
                'success': False,
                'error': str(e),
                'task_id': task_data.get('task_id'),
                'task_type': task_data.get('task_type'),
                'timestamp': datetime.now().isoformat()
            }

    async def _handle_analyze_image(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maneja análisis de imagen individual"""
        image_source = task_data.get('image_source')
        analysis_options = task_data.get('analysis_options', {})
        
        if not image_source:
            raise ValueError("Se requiere fuente de imagen")
        
        # Crear request según tipo de fuente
        if 'path' in image_source:
            request = QualityAnalysisRequest(
                image_path=image_source['path'],
                analysis_options=analysis_options
            )
        elif 'data' in image_source:
            request = QualityAnalysisRequest(
                image_data=image_source['data'],
                analysis_options=analysis_options
            )
        elif 'url' in image_source:
            request = QualityAnalysisRequest(
                image_url=image_source['url'],
                analysis_options=analysis_options
            )
        else:
            raise ValueError("Tipo de fuente de imagen no válido")
        
        # Ejecutar análisis
        result = await self.analyzer.analyze_image(request)
        
        # Formatear resultado para cola
        return self._format_queue_result(result)

    async def _handle_analyze_batch(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Maneja análisis por lotes"""
        image_sources = task_data.get('image_sources', [])
        analysis_options = task_data.get('analysis_options', {})
        
        if not image_sources:
            raise ValueError("Se requiere lista de fuentes de imagen")
        
        # Crear requests
        requests = []
        for source in image_sources:
            if 'path' in source:
                requests.append(QualityAnalysisRequest(
                    image_path=source['path'],
                    analysis_options=analysis_options
                ))
            elif 'data' in source:
                requests.append(QualityAnalysisRequest(
                    image_data=source['data'],
                    analysis_options=analysis_options
                ))
            elif 'url' in source:
                requests.append(QualityAnalysisRequest(
                    image_url=source['url'],
                    analysis_options=analysis_options
                ))
        
        # Ejecutar análisis en lote
        results = await self.analyzer.analyze_batch(requests)
        
        # Formatear resultados
        formatted_results = [self._format_queue_result(result) for result in results]
        
        return {
            'success': True,
            'total_images': len(image_sources),
            'successful_analyses': len(formatted_results),
            'failed_analyses': len(image_sources) - len(formatted_results),
            'results': formatted_results
        }

    async def _handle_get_quality_report(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Genera reporte de calidad detallado"""
        image_path = task_data.get('image_path')
        include_recommendations = task_data.get('include_recommendations', True)
        include_detailed_metrics = task_data.get('include_detailed_metrics', True)
        
        if not image_path:
            raise ValueError("Se requiere ruta de imagen")
        
        # Análisis con opciones completas
        request = QualityAnalysisRequest(
            image_path=image_path,
            analysis_options={
                'include_detailed_metrics': include_detailed_metrics,
                'include_recommendations': include_recommendations,
                'include_histogram': True
            }
        )
        
        result = await self.analyzer.analyze_image(request)
        
        # Generar reporte detallado
        return {
            'success': True,
            'report': {
                'image_info': {
                    'path': result.image_path,
                    'file_size': result.file_size,
                    'format': result.image_format,
                    'dimensions': f"{result.width}x{result.height}",
                    'megapixels': result.total_pixels / 1000000
                },
                'quality_summary': {
                    'overall_score': result.overall_score,
                    'overall_level': result.overall_level.value,
                    'quality_grade': self._get_quality_grade(result.overall_score)
                },
                'metrics_breakdown': {
                    'brisque': {
                        'score': result.brisque_score,
                        'level': result.brisque_quality_level.value,
                        'interpretation': self._interpret_brisque(result.brisque_score)
                    },
                    'sharpness': {
                        'variance': result.sharpness_variance,
                        'score': result.sharpness_score,
                        'level': result.sharpness_level.value,
                        'interpretation': self._interpret_sharpness(result.sharpness_variance)
                    },
                    'exposure': {
                        'balance_score': result.exposure_balance_score,
                        'level': result.exposure_level.value,
                        'histogram': result.exposure_histogram,
                        'interpretation': self._interpret_exposure(result.exposure_balance_score)
                    },
                    'resolution': {
                        'score': result.resolution_score,
                        'level': result.resolution_level.value,
                        'adequate_for_print': result.total_pixels >= 2000000,
                        'adequate_for_web': result.total_pixels >= 500000
                    },
                    'aspect_ratio': {
                        'ratio': result.aspect_ratio,
                        'score': result.aspect_ratio_score,
                        'level': result.aspect_ratio_level.value
                    }
                },
                'issues_and_recommendations': {
                    'issues_detected': result.issues_detected,
                    'recommendations': result.recommendations
                },
                'technical_details': {
                    'processing_time': result.processing_time,
                    'image_hash': result.image_hash,
                    'analysis_timestamp': result.analysis_timestamp.isoformat()
                }
            }
        }

    async def _handle_calibrate_thresholds(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calibra umbrales basado en conjunto de imágenes de referencia"""
        reference_images = task_data.get('reference_images', [])
        quality_profiles = task_data.get('quality_profiles', {})
        
        if not reference_images:
            raise ValueError("Se requiere conjunto de imágenes de referencia")
        
        # Analizar imágenes de referencia
        requests = [QualityAnalysisRequest(image_path=img) for img in reference_images]
        results = await self.analyzer.analyze_batch(requests)
        
        # Calcular estadísticas
        brisque_scores = [r.brisque_score for r in results]
        sharpness_scores = [r.sharpness_score for r in results]
        resolution_scores = [r.resolution_score for r in results]
        
        # Calcular nuevos umbrales
        new_thresholds = {
            'brisque_excellent': max(15, min(30, min(brisque_scores))),
            'brisque_good': max(25, min(45, max(brisque_scores))),
            'brisque_fair': max(35, min(60, max(brisque_scores))),
            'laplacian_excellent': max(400, min(800, max([r.sharpness_variance for r in results if r.sharpness_variance > 0]))),
            'laplacian_good': max(200, min(500, min([r.sharpness_variance for r in results if r.sharpness_variance > 100]))),
            'min_width': max(800, min(1200, min([r.width for r in results]))),
            'min_height': max(600, min(900, min([r.height for r in results])))
        }
        
        return {
            'success': True,
            'calibrated_thresholds': new_thresholds,
            'reference_analysis': {
                'total_images': len(results),
                'average_brisque': sum(brisque_scores) / len(brisque_scores),
                'average_sharpness': sum(sharpness_scores) / len(sharpness_scores),
                'average_resolution': sum(resolution_scores) / len(resolution_scores)
            },
            'recommendation': "Umbrales calibrados basado en imágenes de referencia. Validar con casos de uso específicos."
        }

    async def _handle_bulk_quality_check(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verificación masiva de calidad para procesamiento de catálogos"""
        image_directory = task_data.get('image_directory')
        output_report_path = task_data.get('output_report_path')
        quality_threshold = task_data.get('quality_threshold', 70.0)
        recursive_search = task_data.get('recursive_search', True)
        
        if not image_directory:
            raise ValueError("Se requiere directorio de imágenes")
        
        import os
        from pathlib import Path
        
        # Buscar imágenes
        image_dir = Path(image_directory)
        if not image_dir.exists():
            raise ValueError(f"Directorio no encontrado: {image_directory}")
        
        # Patrones de búsqueda
        patterns = ['*.jpg', '*.jpeg', '*.png', '*.tiff', '*.bmp']
        image_paths = []
        
        for pattern in patterns:
            if recursive_search:
                image_paths.extend(image_dir.rglob(pattern))
            else:
                image_paths.extend(image_dir.glob(pattern))
        
        if not image_paths:
            raise ValueError(f"No se encontraron imágenes en {image_directory}")
        
        logger.info(f"Encontradas {len(image_paths)} imágenes para análisis masivo")
        
        # Crear requests
        requests = [QualityAnalysisRequest(image_path=str(path)) for path in image_paths]
        
        # Analizar en lotes para optimizar memoria
        batch_size = 10
        all_results = []
        
        for i in range(0, len(requests), batch_size):
            batch = requests[i:i+batch_size]
            batch_results = await self.analyzer.analyze_batch(batch)
            all_results.extend(batch_results)
        
        # Clasificar resultados
        high_quality = [r for r in all_results if r.overall_score >= quality_threshold]
        medium_quality = [r for r in all_results if 50 <= r.overall_score < quality_threshold]
        low_quality = [r for r in all_results if r.overall_score < 50]
        
        # Generar reporte
        report = {
            'summary': {
                'total_images': len(all_results),
                'high_quality': len(high_quality),
                'medium_quality': len(medium_quality),
                'low_quality': len(low_quality),
                'quality_threshold': quality_threshold,
                'average_score': sum(r.overall_score for r in all_results) / len(all_results)
            },
            'high_quality_images': [str(Path(r.image_path).name) for r in high_quality],
            'medium_quality_images': [str(Path(r.image_path).name) for r in medium_quality],
            'low_quality_images': [str(Path(r.image_path).name) for r in low_quality],
            'detailed_results': [self._format_queue_result(r) for r in all_results]
        }
        
        # Guardar reporte si se especifica ruta
        if output_report_path:
            try:
                with open(output_report_path, 'w') as f:
                    json.dump(report, f, indent=2, default=str)
                logger.info(f"Reporte guardado en: {output_report_path}")
            except Exception as e:
                logger.error(f"Error guardando reporte: {e}")
        
        return {
            'success': True,
            'bulk_check_summary': report['summary'],
            'output_report_path': output_report_path,
            'recommendations': self._generate_bulk_recommendations(low_quality, medium_quality)
        }

    def _format_queue_result(self, result: QualityAnalysisResult) -> Dict[str, Any]:
        """Formatea resultado para sistema de colas"""
        return {
            'success': True,
            'image_path': result.image_path,
            'overall_score': result.overall_score,
            'overall_level': result.overall_level.value,
            'metrics': {
                'brisque': {'score': result.brisque_score, 'level': result.brisque_quality_level.value},
                'sharpness': {'score': result.sharpness_score, 'level': result.sharpness_level.value},
                'exposure': {'score': result.exposure_balance_score, 'level': result.exposure_level.value},
                'resolution': {'score': result.resolution_score, 'level': result.resolution_level.value},
                'aspect_ratio': {'score': result.aspect_ratio_score, 'level': result.aspect_ratio_level.value}
            },
            'issues': result.issues_detected,
            'recommendations': result.recommendations,
            'file_info': {
                'file_size': result.file_size,
                'format': result.image_format,
                'dimensions': f"{result.width}x{result.height}"
            }
        }

    def _get_quality_grade(self, score: float) -> str:
        """Convierte score numérico a letra"""
        if score >= 95: return 'A+'
        elif score >= 90: return 'A'
        elif score >= 85: return 'A-'
        elif score >= 80: return 'B+'
        elif score >= 75: return 'B'
        elif score >= 70: return 'B-'
        elif score >= 65: return 'C+'
        elif score >= 60: return 'C'
        elif score >= 55: return 'C-'
        elif score >= 50: return 'D+'
        elif score >= 45: return 'D'
        else: return 'F'

    def _interpret_brisque(self, score: float) -> str:
        """Interpreta score BRISQUE"""
        if score < 20: return "Excelente calidad, prácticamente sin distorsiones"
        elif score < 35: return "Buena calidad con distorsiones menores"
        elif score < 50: return "Calidad moderada, algunas distorsiones visibles"
        else: return "Calidad deficiente, distorsiones significativas"

    def _interpret_sharpness(self, variance: float) -> str:
        """Interpreta score de nitidez"""
        if variance >= 500: return "Excelente nitidez"
        elif variance >= 300: return "Buena nitidez"
        elif variance >= 100: return "Nitidez moderada"
        else: return "Nitidez deficiente, imagen desenfocada"

    def _interpret_exposure(self, balance_score: float) -> str:
        """Interpreta balance de exposición"""
        if balance_score >= 90: return "Exposición perfectamente balanceada"
        elif balance_score >= 75: return "Buena exposición general"
        elif balance_score >= 60: return "Exposición aceptable con ligeras desviaciones"
        else: return "Problemas de exposición evidentes"

    def _generate_bulk_recommendations(self, low_quality: List, medium_quality: List) -> List[str]:
        """Genera recomendaciones para procesamiento masivo"""
        recommendations = []
        
        if len(low_quality) > 0:
            recommendations.append(f"{len(low_quality)} imágenes requieren recaptura o reemplazo")
        
        if len(medium_quality) > 0:
            recommendations.append(f"{len(medium_quality)} imágenes podrían beneficiarse de post-procesamiento")
        
        if len(low_quality) / (len(low_quality) + len(medium_quality)) > 0.3:
            recommendations.append("Alta proporción de imágenes de baja calidad - revisar proceso de captura")
        
        recommendations.append(f"Considerar establecer estándares de calidad más estrictos")
        
        return recommendations

class ImageQAAgentWrapper:
    """Wrapper para integrar con Agent Manager existente"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.analyzer = ImageQualityAnalyzer(config)
        self.queue_integration = ImageQAQueueIntegration(self.analyzer)
        
        if ORCHESTRATION_AVAILABLE:
            self._setup_agent_interface()
    
    def _setup_agent_interface(self):
        """Configura interfaz con Agent Manager"""
        # Esta función se integra con el sistema de agentes existente
        # que vimos en agent_manager.py
        pass

# Función para crear agente integrado
def create_queue_integrated_agent(config: AgentConfig = None) -> ImageQAAgentWrapper:
    """Crea agente integrado con sistema de colas"""
    config = config or AgentConfig()
    return ImageQAAgentWrapper(config)

# Función para manejar tareas de cola
async def handle_queue_task(task_data: Dict[str, Any]) -> Dict[str, Any]:
    """Función standalone para manejar tareas"""
    config = AgentConfig()
    analyzer = ImageQualityAnalyzer(config)
    integration = ImageQAQueueIntegration(analyzer)
    
    return await integration.handle_task(task_data)
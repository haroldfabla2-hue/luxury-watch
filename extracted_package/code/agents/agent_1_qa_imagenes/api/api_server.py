"""
API Server para el Agente de Análisis de Calidad de Imágenes
Servidor FastAPI para integración web
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import asyncio
import uvicorn
import json
import os
import tempfile
from datetime import datetime
from pathlib import Path

from src.image_quality_analyzer import ImageQualityAnalyzer, QualityAnalysisRequest
from config import AgentConfig, get_config

# Modelos Pydantic para la API
class AnalysisResponse(BaseModel):
    """Respuesta de análisis de calidad"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: float
    timestamp: str

class BatchAnalysisResponse(BaseModel):
    """Respuesta de análisis por lotes"""
    success: bool
    total_images: int
    successful_analyses: int
    failed_analyses: int
    results: List[AnalysisResponse]
    total_processing_time: float
    timestamp: str

class HealthCheckResponse(BaseModel):
    """Respuesta de verificación de salud"""
    status: str
    agent_id: str
    version: str
    uptime_seconds: float
    metrics_available: List[str]
    performance_stats: Dict[str, Any]

class AnalysisOptions(BaseModel):
    """Opciones de análisis"""
    include_detailed_metrics: bool = True
    include_histogram: bool = True
    include_recommendations: bool = True
    cache_result: bool = True
    quality_threshold: str = "default"  # default, premium, bulk

class ImageQAAPIServer:
    """Servidor API principal"""
    
    def __init__(self, config: AgentConfig = None):
        self.config = config or get_config()
        self.analyzer = ImageQualityAnalyzer(self.config)
        self.start_time = datetime.now()
        
        # Crear aplicación FastAPI
        self.app = FastAPI(
            title="Image Quality Analyzer API",
            description="API para análisis de calidad de imágenes con OpenCV",
            version="1.0.0"
        )
        
        # Configurar CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Configurar rutas
        self._setup_routes()
        
        logger.info(f"ImageQAAPIServer inicializado en {self.config.api_host}:{self.config.api_port}")

    def _setup_routes(self):
        """Configura las rutas de la API"""
        
        @self.app.get("/", response_model=dict)
        async def root():
            """Endpoint raíz con información de la API"""
            return {
                "service": "Image Quality Analyzer API",
                "version": "1.0.0",
                "status": "running",
                "timestamp": datetime.now().isoformat(),
                "endpoints": {
                    "health": "/health",
                    "analyze_single": "/analyze",
                    "analyze_batch": "/analyze/batch",
                    "analyze_file": "/analyze/file",
                    "analyze_url": "/analyze/url",
                    "performance": "/performance",
                    "cache": "/cache"
                }
            }
        
        @self.app.get("/health", response_model=HealthCheckResponse)
        async def health_check():
            """Verificación de salud del servicio"""
            health_data = await self.analyzer.health_check()
            
            uptime = (datetime.now() - self.start_time).total_seconds()
            
            return HealthCheckResponse(
                status=health_data['status'],
                agent_id=health_data['agent_id'],
                version=health_data.get('version', '1.0.0'),
                uptime_seconds=uptime,
                metrics_available=health_data['metrics_available'],
                performance_stats=health_data['performance_stats']
            )
        
        @self.app.post("/analyze", response_model=AnalysisResponse)
        async def analyze_image_base64(
            image_data: str = Form(..., description="Imagen codificada en base64"),
            options: str = Form("{}", description="Opciones de análisis en JSON")
        ):
            """Analiza imagen desde datos base64"""
            try:
                start_time = datetime.now()
                
                # Parsear opciones
                analysis_options = json.loads(options) if options else {}
                
                # Decodificar imagen
                import base64
                image_bytes = base64.b64decode(image_data)
                
                # Crear request
                request = QualityAnalysisRequest(
                    image_data=image_bytes,
                    analysis_options=analysis_options
                )
                
                # Analizar
                result = await self.analyzer.analyze_image(request)
                
                # Preparar respuesta
                response_data = self._format_analysis_result(result, analysis_options)
                
                processing_time = (datetime.now() - start_time).total_seconds()
                
                return AnalysisResponse(
                    success=True,
                    result=response_data,
                    processing_time=processing_time,
                    timestamp=datetime.now().isoformat()
                )
                
            except Exception as e:
                logger.error(f"Error en análisis base64: {e}")
                return AnalysisResponse(
                    success=False,
                    error=str(e),
                    processing_time=0.0,
                    timestamp=datetime.now().isoformat()
                )
        
        @self.app.post("/analyze/file", response_model=AnalysisResponse)
        async def analyze_uploaded_file(
            background_tasks: BackgroundTasks,
            file: UploadFile = File(..., description="Archivo de imagen"),
            options: str = Form("{}", description="Opciones de análisis en JSON")
        ):
            """Analiza imagen subida por archivo"""
            try:
                start_time = datetime.now()
                
                # Validar tipo de archivo
                if not file.filename.lower().endswith(tuple(self.config.supported_formats)):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Formato no soportado. Use: {self.config.supported_formats}"
                    )
                
                # Leer datos del archivo
                image_data = await file.read()
                
                # Verificar tamaño
                if len(image_data) > self.config.max_image_size:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Archivo demasiado grande. Máximo: {self.config.max_image_size} bytes"
                    )
                
                # Parsear opciones
                analysis_options = json.loads(options) if options else {}
                
                # Crear request
                request = QualityAnalysisRequest(
                    image_data=image_data,
                    analysis_options=analysis_options
                )
                
                # Analizar
                result = await self.analyzer.analyze_image(request)
                
                # Preparar respuesta
                response_data = self._format_analysis_result(result, analysis_options)
                
                processing_time = (datetime.now() - start_time).total_seconds()
                
                return AnalysisResponse(
                    success=True,
                    result=response_data,
                    processing_time=processing_time,
                    timestamp=datetime.now().isoformat()
                )
                
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error en análisis de archivo: {e}")
                return AnalysisResponse(
                    success=False,
                    error=str(e),
                    processing_time=0.0,
                    timestamp=datetime.now().isoformat()
                )
        
        @self.app.post("/analyze/url", response_model=AnalysisResponse)
        async def analyze_image_url(
            image_url: str = Form(..., description="URL de la imagen"),
            options: str = Form("{}", description="Opciones de análisis en JSON")
        ):
            """Analiza imagen desde URL"""
            try:
                start_time = datetime.now()
                
                # Parsear opciones
                analysis_options = json.loads(options) if options else {}
                
                # Crear request
                request = QualityAnalysisRequest(
                    image_url=image_url,
                    analysis_options=analysis_options
                )
                
                # Analizar
                result = await self.analyzer.analyze_image(request)
                
                # Preparar respuesta
                response_data = self._format_analysis_result(result, analysis_options)
                
                processing_time = (datetime.now() - start_time).total_seconds()
                
                return AnalysisResponse(
                    success=True,
                    result=response_data,
                    processing_time=processing_time,
                    timestamp=datetime.now().isoformat()
                )
                
            except Exception as e:
                logger.error(f"Error en análisis de URL: {e}")
                return AnalysisResponse(
                    success=False,
                    error=str(e),
                    processing_time=0.0,
                    timestamp=datetime.now().isoformat()
                )
        
        @self.app.post("/analyze/batch", response_model=BatchAnalysisResponse)
        async def analyze_batch(
            background_tasks: BackgroundTasks,
            files: List[UploadFile] = File(..., description="Lista de archivos de imagen"),
            options: str = Form("{}", description="Opciones de análisis en JSON")
        ):
            """Analiza múltiples imágenes en lote"""
            try:
                start_time = datetime.now()
                
                # Validar cantidad de archivos
                if len(files) > 50:  # Límite razonable para lotes
                    raise HTTPException(
                        status_code=400,
                        detail="Máximo 50 imágenes por lote"
                    )
                
                # Parsear opciones
                analysis_options = json.loads(options) if options else {}
                
                # Preparar requests
                requests = []
                for file in files:
                    if not file.filename.lower().endswith(tuple(self.config.supported_formats)):
                        logger.warning(f"Archivo ignorado por formato no soportado: {file.filename}")
                        continue
                    
                    # Leer datos del archivo
                    image_data = await file.read()
                    
                    # Verificar tamaño
                    if len(image_data) > self.config.max_image_size:
                        logger.warning(f"Archivo ignorado por tamaño: {file.filename}")
                        continue
                    
                    requests.append(QualityAnalysisRequest(
                        image_data=image_data,
                        analysis_options=analysis_options
                    ))
                
                if not requests:
                    raise HTTPException(
                        status_code=400,
                        detail="No se proporcionaron imágenes válidas"
                    )
                
                # Analizar en lote
                results = await self.analyzer.analyze_batch(requests)
                
                # Preparar respuestas
                responses = []
                successful = 0
                failed = 0
                
                for result in results:
                    response_data = self._format_analysis_result(result, analysis_options)
                    
                    responses.append(AnalysisResponse(
                        success=True,
                        result=response_data,
                        processing_time=result.processing_time,
                        timestamp=result.analysis_timestamp.isoformat()
                    ))
                    successful += 1
                
                total_processing_time = (datetime.now() - start_time).total_seconds()
                
                return BatchAnalysisResponse(
                    success=True,
                    total_images=len(files),
                    successful_analyses=successful,
                    failed_analyses=failed,
                    results=responses,
                    total_processing_time=total_processing_time,
                    timestamp=datetime.now().isoformat()
                )
                
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error en análisis por lotes: {e}")
                return BatchAnalysisResponse(
                    success=False,
                    total_images=len(files) if files else 0,
                    successful_analyses=0,
                    failed_analyses=len(files) if files else 0,
                    results=[],
                    total_processing_time=0.0,
                    timestamp=datetime.now().isoformat()
                )
        
        @self.app.get("/performance", response_model=Dict[str, Any])
        async def get_performance_stats():
            """Obtiene estadísticas de rendimiento"""
            try:
                stats = self.analyzer.get_performance_stats()
                stats['uptime_seconds'] = (datetime.now() - self.start_time).total_seconds()
                return stats
            except Exception as e:
                logger.error(f"Error obteniendo estadísticas: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.delete("/cache")
        async def clear_cache():
            """Limpia el cache de análisis"""
            try:
                self.analyzer.clear_cache()
                return {"message": "Cache limpiado exitosamente"}
            except Exception as e:
                logger.error(f"Error limpiando cache: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/config")
        async def get_configuration():
            """Obtiene configuración actual"""
            try:
                return {
                    "agent_id": self.config.agent_id,
                    "supported_formats": self.config.supported_formats,
                    "max_image_size": self.config.max_image_size,
                    "max_concurrent_analyses": self.config.max_concurrent_analyses,
                    "api_host": self.config.api_host,
                    "api_port": self.config.api_port,
                    "quality_thresholds": {
                        "min_width": self.config.quality_thresholds.min_width,
                        "min_height": self.config.quality_thresholds.min_height,
                        "brisque_excellent": self.config.quality_thresholds.brisque_excellent,
                        "laplacian_excellent": self.config.quality_thresholds.laplacian_excellent
                    }
                }
            except Exception as e:
                logger.error(f"Error obteniendo configuración: {e}")
                raise HTTPException(status_code=500, detail=str(e))

    def _format_analysis_result(self, result, analysis_options: Dict[str, Any]) -> Dict[str, Any]:
        """Formatea resultado de análisis para respuesta API"""
        # Incluir métricas detalladas según opciones
        include_detailed = analysis_options.get('include_detailed_metrics', True)
        include_histogram = analysis_options.get('include_histogram', True)
        include_recommendations = analysis_options.get('include_recommendations', True)
        
        response = {
            # Información básica
            "image_path": result.image_path,
            "overall_score": result.overall_score,
            "overall_level": result.overall_level.value,
            "processing_time": result.processing_time,
            
            # Métricas principales
            "brisque": {
                "score": result.brisque_score,
                "level": result.brisque_quality_level.value
            },
            "sharpness": {
                "variance": result.sharpness_variance,
                "score": result.sharpness_score,
                "level": result.sharpness_level.value
            },
            "resolution": {
                "width": result.width,
                "height": result.height,
                "total_pixels": result.total_pixels,
                "megapixels": result.total_pixels / 1000000,
                "score": result.resolution_score,
                "level": result.resolution_level.value
            },
            "aspect_ratio": {
                "ratio": result.aspect_ratio,
                "score": result.aspect_ratio_score,
                "level": result.aspect_ratio_level.value
            }
        }
        
        # Incluir métricas detalladas si se solicita
        if include_detailed:
            response["detailed_metrics"] = {
                "exposure": {
                    "histogram": result.exposure_histogram if include_histogram else None,
                    "balance_score": result.exposure_balance_score,
                    "level": result.exposure_level.value
                },
                "file_info": {
                    "file_size": result.file_size,
                    "format": result.image_format,
                    "image_hash": result.image_hash
                }
            }
        
        # Incluir problemas y recomendaciones
        if include_recommendations:
            response["issues"] = result.issues_detected
            response["recommendations"] = result.recommendations
        
        return response

    def run(self, host: str = None, port: int = None):
        """Ejecuta el servidor"""
        host = host or self.config.api_host
        port = port or self.config.api_port
        
        logger.info(f"Iniciando servidor en {host}:{port}")
        
        uvicorn.run(
            self.app,
            host=host,
            port=port,
            log_level=self.config.log_level.lower(),
            access_log=self.config.enable_performance_logging
        )

# Instancia global del servidor
_server_instance = None

def create_server(config: AgentConfig = None) -> ImageQAAPIServer:
    """Crea instancia del servidor"""
    global _server_instance
    _server_instance = ImageQAAPIServer(config)
    return _server_instance

def run_server(config: AgentConfig = None, host: str = None, port: int = None):
    """Ejecuta el servidor"""
    global _server_instance
    _server_instance = ImageQAAPIServer(config)
    _server_instance.run(host, port)

# Logging
import logging
from loguru import logger

# Configurar logging
logger.remove()
logger.add(
    "logs/api_server.log",
    rotation="1 day",
    retention="30 days",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}"
)

if __name__ == "__main__":
    # Ejecutar servidor standalone
    config = get_config()
    run_server(config)
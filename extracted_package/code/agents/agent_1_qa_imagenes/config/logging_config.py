"""
Configuración de Logging para el Agente 1: Analista de Calidad de Imágenes
"""

import sys
from pathlib import Path
from loguru import logger
from datetime import datetime

# Configurar directorio de logs
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Remover handler por defecto
logger.remove()

# Handler para consola (solo en modo debug)
logger.add(
    sys.stdout,
    level="DEBUG" if "--debug" in sys.argv else "INFO",
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
    colorize=True
)

# Handler para archivo principal
logger.add(
    LOG_DIR / "image_quality_analyzer.log",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
    rotation="1 day",
    retention="30 days",
    compression="zip",
    enqueue=True
)

# Handler para errores específicos
logger.add(
    LOG_DIR / "errors.log",
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
    rotation="1 day",
    retention="90 days",
    compression="zip",
    enqueue=True
)

# Handler para métricas de rendimiento
logger.add(
    LOG_DIR / "performance.log",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | PERFORMANCE | {message}",
    rotation="1 day",
    retention="7 days",
    enqueue=True
)

# Configurar niveles específicos
logger.disable("PIL")  # Deshabilitar logs de Pillow
logger.disable("urllib3")  # Deshabilitar logs de urllib3

def get_logger(name: str = None):
    """Obtener logger con nombre específico"""
    if name:
        return logger.bind(name=name)
    return logger

# Configuración para diferentes entornos
def configure_logging(environment: str = "development"):
    """Configura logging según el entorno"""
    if environment == "production":
        # En producción, menos verboso
        logger.remove()
        logger.add(
            LOG_DIR / "production.log",
            level="WARNING",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {message}",
            rotation="1 day",
            retention="7 days"
        )
    elif environment == "testing":
        # En testing, solo errores
        logger.remove()
        logger.add(
            LOG_DIR / "testing.log",
            level="ERROR",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {message}",
            rotation="never",
            retention="1 day"
        )

# Funciones de utilidad para logging
def log_analysis_start(image_path: str):
    """Log inicio de análisis"""
    logger.info(f"Starting image quality analysis for: {image_path}")

def log_analysis_complete(image_path: str, score: float, processing_time: float):
    """Log finalización de análisis"""
    logger.info(f"Analysis completed for {image_path} - Score: {score:.1f}, Time: {processing_time:.2f}s")

def log_performance_metric(metric_name: str, value: float):
    """Log métrica de rendimiento"""
    logger.bind(performance=True).info(f"{metric_name}: {value}")

def log_batch_analysis_start(batch_size: int):
    """Log inicio de análisis por lotes"""
    logger.info(f"Starting batch analysis of {batch_size} images")

def log_batch_analysis_complete(successful: int, failed: int, total_time: float):
    """Log finalización de análisis por lotes"""
    logger.info(f"Batch analysis completed - Successful: {successful}, Failed: {failed}, Total time: {total_time:.2f}s")

def log_quality_issue(image_path: str, issue_type: str, description: str):
    """Log problema de calidad detectado"""
    logger.warning(f"Quality issue in {image_path} [{issue_type}]: {description}")

def log_recommendation(image_path: str, recommendation: str):
    """Log recomendación generada"""
    logger.info(f"Recommendation for {image_path}: {recommendation}")

# Configuración de logging para diferentes componentes
class ComponentLogger:
    """Logger especializado por componente"""
    
    def __init__(self, component_name: str):
        self.component_name = component_name
        self.logger = logger.bind(component=component_name)
    
    def info(self, message: str, **kwargs):
        self.logger.info(f"[{self.component_name}] {message}", **kwargs)
    
    def error(self, message: str, **kwargs):
        self.logger.error(f"[{self.component_name}] {message}", **kwargs)
    
    def warning(self, message: str, **kwargs):
        self.logger.warning(f"[{self.component_name}] {message}", **kwargs)
    
    def debug(self, message: str, **kwargs):
        self.logger.debug(f"[{self.component_name}] {message}", **kwargs)

# Instancias de loggers especializados
API_LOGGER = ComponentLogger("API_SERVER")
ANALYZER_LOGGER = ComponentLogger("IMAGE_ANALYZER")
METRICS_LOGGER = ComponentLogger("QUALITY_METRICS")
QUEUE_LOGGER = ComponentLogger("QUEUE_INTEGRATION")

# Logging context manager para operaciones críticas
from contextlib import contextmanager
import time

@contextmanager
def log_operation(operation_name: str, logger_instance: ComponentLogger = None):
    """Context manager para logging de operaciones críticas"""
    if logger_instance is None:
        logger_instance = logger
    
    logger_instance.info(f"Starting operation: {operation_name}")
    start_time = time.time()
    
    try:
        yield
        duration = time.time() - start_time
        logger_instance.info(f"Operation completed: {operation_name} (duration: {duration:.2f}s)")
    except Exception as e:
        duration = time.time() - start_time
        logger_instance.error(f"Operation failed: {operation_name} (duration: {duration:.2f}s, error: {e})")
        raise

# Formatter personalizado para JSON logs
import json
from datetime import datetime

class JSONFormatter:
    """Formatter para logs en formato JSON"""
    
    @staticmethod
    def format(record):
        """Formatea log como JSON"""
        log_entry = {
            "timestamp": datetime.fromtimestamp(record["time"]).isoformat(),
            "level": record["level"].name,
            "component": record["extra"].get("component", "UNKNOWN"),
            "message": record["message"],
            "module": record["module"],
            "function": record["function"],
            "line": record["line"]
        }
        
        # Agregar datos adicionales si existen
        if "performance" in record["extra"]:
            log_entry["performance"] = record["extra"]["performance"]
        
        if "error" in record["extra"]:
            log_entry["error"] = record["extra"]["error"]
        
        return json.dumps(log_entry, ensure_ascii=False)

# Configurar handler JSON para analytics
logger.add(
    LOG_DIR / "analytics.json",
    level="INFO",
    format=JSONFormatter.format,
    rotation="1 hour",
    retention="7 days",
    enqueue=True
)
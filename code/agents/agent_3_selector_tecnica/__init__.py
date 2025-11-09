"""
Agente 3: Selector de Técnica 2D-3D
====================================

Sistema inteligente para selección automática de técnicas de procesamiento 2D a 3D.

Este paquete proporciona un agente especializado que decide automáticamente entre
COLMAP local, OpenRouter API, o método híbrido basado en evaluación de factores
técnicos, de recursos y de negocio.

Instalación rápida:
-------------------
```bash
pip install -r requirements.txt
python ejemplo_uso.py --mode quick
```

Uso básico:
-----------
```python
from agent_3_selector_tecnica import procesar_rapido

resultado = await procesar_rapido(
    imagenes=["foto1.jpg", "foto2.jpg"],
    presupuesto=50.0
)
```

Uso avanzado:
-------------
```python
from agent_3_selector_tecnica import InterfazAgenteSelector

interfaz = InterfazAgenteSelector()
await interfaz.inicializar()

evaluacion = await interfaz.evaluar_sin_procesar(
    imagenes=["foto1.jpg"],
    presupuesto=25.0,
    prioridad=4
)

resultado = await interfaz.procesar_2d_a_3d(
    imagenes=["foto1.jpg", "foto2.jpg"],
    presupuesto=75.0
)

await interfaz.cerrar()
```

Documentación completa:
----------------------
- docs/README.md - Documentación principal
- docs/API.md - Referencia de API
- docs/EXAMPLES.md - Ejemplos detallados

Autor: Sistema de Agentes IA
Versión: 1.0.0
Fecha: 2025-11-06
"""

# Importaciones principales desde src
from .src import (
    # Clases principales
    SelectorTecnica3DAgent,
    SelectorTecnicaAgent,
    InterfazAgenteSelector,
    MonitorRecursosAvanzado,
    
    # Enums y tipos
    MetodoProcesamiento,
    TipoMetrica,
    NivelAlerta,
    
    # Funciones de conveniencia
    crear_agente_selector_tecnica,
    crear_interfaz_simple,
    procesar_rapido,
    crear_monitor_recursos,
    
    # Utilidades
    setup_logging,
    validate_environment,
    get_version,
    get_info,
    requires_environment,
    
    # Constantes
    VERSION,
    AUTHOR,
    DESCRIPTION,
    DEFAULT_CONFIG,
    METODOS_DISPONIBLES
)

# Importaciones de integración
try:
    from .src.integracion_orquestacion import (
        IntegracionOrquestacion,
        SelectorTecnicaOrquestado,
        crear_integracion_orquestacion
    )
    
    INTEGRATION_AVAILABLE = True
except ImportError:
    INTEGRATION_AVAILABLE = False
    logger = __import__('logging').getLogger(__name__)
    logger.warning("Sistema de orquestación no disponible")

# Metadatos del paquete
__version__ = "1.0.0"
__author__ = "Sistema de Agentes IA"
__email__ = "agentes@sistema-ia.com"
__description__ = "Agente inteligente para selección de técnicas de procesamiento 2D-3D"
__license__ = "MIT"
__url__ = "https://github.com/sistema-agentes/selector-tecnica-3d"

# Configuración de logging por defecto
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
        "detailed": {
            "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s"
        }
    },
    "handlers": {
        "default": {
            "level": "INFO",
            "formatter": "standard",
            "class": "logging.StreamHandler"
        },
        "file": {
            "level": "DEBUG",
            "formatter": "detailed",
            "class": "logging.FileHandler",
            "filename": "logs/selector_tecnica.log",
            "mode": "a"
        }
    },
    "loggers": {
        "": {
            "handlers": ["default", "file"],
            "level": "DEBUG",
            "propagate": False
        }
    }
}

# Métodos disponibles
METODOS_DISPONIBLES = [
    "colmap_local",
    "openrouter_api", 
    "hibrido"
]

# Configuración por defecto
DEFAULT_CONFIG = {
    "configuracion_agente": {
        "max_concurrencia": 3,
        "timeout_default": 300,
        "reintentos_fallback": 2
    },
    "metodos_procesamiento": {
        "colmap_local": {
            "disponible": True,
            "costo_por_imagen": 0.0,
            "calidad_base": 0.85
        },
        "openrouter_api": {
            "disponible": True,
            "costo_por_imagen": 0.15,
            "calidad_base": 0.95
        },
        "hibrido": {
            "disponible": True,
            "costo_por_imagen": 0.05,
            "calidad_base": 0.92
        }
    },
    "monitoreo_recursos": {
        "intervalo_monitoreo": 5.0,
        "umbrales": {
            "cpu": 80.0,
            "ram": 85.0,
            "disco": 90.0
        }
    }
}

# Funciones de conveniencia para inicialización rápida
def setup_logging(config=None):
    """Configura el sistema de logging"""
    import logging
    import json
    from pathlib import Path
    
    if config is None:
        config = LOGGING_CONFIG
    
    # Crear directorio de logs si no existe
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configurar logging
    logging.config.dictConfig(config)

def validate_environment():
    """Valida que el entorno esté correctamente configurado"""
    import sys
    import os
    from pathlib import Path
    
    # Verificar versión de Python
    if sys.version_info < (3, 8):
        raise RuntimeError("Se requiere Python 3.8 o superior")
    
    # Verificar dependencias críticas
    try:
        import numpy
        import psutil
        import Pillow
        import loguru
    except ImportError as e:
        raise RuntimeError(f"Dependencia crítica faltante: {e}")
    
    # Verificar configuración de directorios
    required_dirs = ["config", "logs", "temp", "output"]
    for dir_name in required_dirs:
        Path(dir_name).mkdir(exist_ok=True)
    
    return True

def get_version():
    """Obtiene la versión del agente"""
    return __version__

def get_info():
    """Obtiene información completa del agente"""
    info = {
        "nombre": "Agente Selector de Técnica 2D-3D",
        "version": __version__,
        "autor": __author__,
        "descripcion": __description__,
        "url": __url__,
        "licencia": __license__,
        "metodos_soportados": METODOS_DISPONIBLES,
        "dependencias_principales": [
            "numpy", "psutil", "Pillow", "loguru", "asyncio"
        ],
        "optimizado_para": "4 vCPUs, 8GB RAM",
        "integracion_orquestacion": INTEGRATION_AVAILABLE
    }
    
    if INTEGRATION_AVAILABLE:
        info["funciones_integration"] = [
            "IntegracionOrquestacion",
            "SelectorTecnicaOrquestado", 
            "crear_integracion_orquestacion"
        ]
    
    return info

# Decorador para validación automática de entorno
def requires_environment(func):
    """Decorador que valida el entorno antes de ejecutar funciones"""
    import functools
    
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        validate_environment()
        return await func(*args, **kwargs)
    
    return wrapper

# Clase principal para acceso fácil
class SelectorTecnica3DAgent:
    """
    Clase principal para el Agente Selector de Técnica 2D-3D
    
    Proporciona una interfaz unificada y simplificada para todas las
    funcionalidades del agente.
    """
    
    def __init__(self, config_path=None):
        self.config_path = config_path
        self.interfaz = None
        self.monitor = None
        self._inicializado = False
    
    async def __aenter__(self):
        """Context manager entry"""
        await self.inicializar()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        await self.cerrar()
    
    async def inicializar(self):
        """Inicializa el agente y todos sus componentes"""
        if self._inicializado:
            return
        
        # Validar entorno
        validate_environment()
        
        # Configurar logging
        setup_logging()
        
        # Crear interfaz
        self.interfaz = InterfazAgenteSelector(self.config_path)
        await self.interfaz.inicializar()
        
        # Crear monitor de recursos
        self.monitor = create_monitor_recursos()
        self.monitor.iniciar_monitoreo()
        
        self._inicializado = True
    
    async def procesar_imagenes(self, imagenes, **kwargs):
        """Procesa imágenes usando la técnica seleccionada"""
        if not self._inicializado:
            await self.inicializar()
        
        return await self.interfaz.procesar_2d_a_3d(imagenes, **kwargs)
    
    async def evaluar_tecnica(self, imagenes, **kwargs):
        """Evalúa qué técnica usar sin procesar"""
        if not self._inicializado:
            await self.inicializar()
        
        return await self.interfaz.evaluar_sin_procesar(imagenes, **kwargs)
    
    async def obtener_estadisticas(self):
        """Obtiene estadísticas del agente"""
        if not self._inicializado:
            return {}
        
        stats = await self.interfaz.obtener_estadisticas()
        if self.monitor:
            reporte_monitor = self.monitor.generar_reporte_completo()
            stats["monitoreo"] = reporte_monitor
        
        return stats
    
    async def cerrar(self):
        """Cierra el agente y libera recursos"""
        if self.interfaz:
            await self.interfaz.cerrar()
        
        if self.monitor:
            self.monitor.detener_monitoreo()
        
        self._inicializado = False
    
    @property
    def activo(self):
        """Verifica si el agente está activo"""
        return self._inicializado

# Alias para facilitar el uso
SelectorAgente = SelectorTecnica3DAgent
AgenteSelectorTecnica = SelectorTecnica3DAgent

# Exportaciones principales
__all__ = [
    # Clases principales
    "SelectorTecnica3DAgent",
    "SelectorAgente",
    "AgenteSelectorTecnica",
    "SelectorTecnicaAgent",
    "InterfazAgenteSelector",
    "MonitorRecursosAvanzado",
    
    # Enums y tipos
    "MetodoProcesamiento",
    "TipoMetrica", 
    "NivelAlerta",
    
    # Funciones de conveniencia
    "crear_agente_selector_tecnica",
    "crear_interfaz_simple",
    "procesar_rapido",
    "crear_monitor_recursos",
    
    # Utilidades
    "setup_logging",
    "validate_environment",
    "get_version",
    "get_info",
    "requires_environment",
    
    # Constantes
    "VERSION",
    "AUTHOR", 
    "DESCRIPTION",
    "DEFAULT_CONFIG",
    "METODOS_DISPONIBLES"
]

# Agregar integraciones si están disponibles
if INTEGRATION_AVAILABLE:
    __all__.extend([
        "IntegracionOrquestacion",
        "SelectorTecnicaOrquestado",
        "crear_integracion_orquestacion"
    ])

# Información adicional
__all__.extend([
    "__version__",
    "__author__",
    "__email__",
    "__description__",
    "__license__",
    "__url__"
])

# Inicialización del módulo
def _init_module():
    """Inicialización automática del módulo"""
    try:
        validate_environment()
    except Exception as e:
        # Solo warn en inicialización, no fallar
        import warnings
        warnings.warn(f"Advertencia en inicialización del módulo: {e}")

# Funciones de ejemplo rápido
def ejemplo_basico():
    """Ejemplo básico de uso"""
    print("""
🎯 Ejemplo Básico - Agente Selector de Técnica 2D-3D
===================================================

from agent_3_selector_tecnica import procesar_rapido

# Procesamiento rápido con configuración por defecto
resultado = await procesar_rapido(
    imagenes=["foto1.jpg", "foto2.jpg"],
    presupuesto=50.0
)

print(f"Método: {resultado['metodo_utilizado']}")
print(f"Éxito: {resultado['exito']}")
""")

def ejemplo_avanzado():
    """Ejemplo avanzado de uso"""
    print("""
🚀 Ejemplo Avanzado - Agente Selector de Técnica 2D-3D
=====================================================

from agent_3_selector_tecnica import InterfazAgenteSelector

# Crear interfaz personalizada
interfaz = InterfazAgenteSelector("config/config.json")
await interfaz.inicializar()

try:
    # 1. Evaluación sin procesamiento
    evaluacion = await interfaz.evaluar_sin_procesar(
        imagenes=["foto1.jpg"],
        presupuesto=25.0,
        prioridad=4
    )
    
    # 2. Comparación de métodos
    comparacion = await interfaz.comparar_metodos(
        imagenes=["foto1.jpg", "foto2.jpg"],
        presupuesto=100.0
    )
    
    # 3. Procesamiento completo
    resultado = await interfaz.procesar_2d_a_3d(
        imagenes=["foto1.jpg", "foto2.jpg"],
        presupuesto=75.0
    )
    
finally:
    await interfaz.cerrar()
""")

def ejemplo_integracion():
    """Ejemplo de integración con orquestación"""
    print("""
🔗 Ejemplo de Integración - Agente Selector de Técnica 2D-3D
===========================================================

from agent_3_selector_tecnica import crear_integracion_orquestacion

# Crear integración con sistema de orquestación
integracion = await crear_integracion_orquestacion(
    config_path="config/config.json",
    agent_manager=agent_manager,
    task_queue=task_queue
)

# Usar el agente orquestado
agente_orquestado = SelectorTecnicaOrquestado(integracion)

# Procesar imágenes
resultado = await agente_orquestado.procesar_imagenes(
    imagenes=["foto1.jpg", "foto2.jpg"],
    presupuesto=50.0
)

# Obtener estado
estado = await agente_orquestado.obtener_estado()
""")

# Mostrar información del paquete al importar
def _show_package_info():
    """Muestra información del paquete al importar"""
    info = get_info()
    
    print(f"""
🎭 Agente Selector de Técnica 2D-3D v{info['version']}
{'='*50}
📧 Autor: {info['autor']}
📝 Descripción: {info['descripcion']}
🔗 URL: {info['url']}
⚖️  Licencia: {info['licencia']}

🚀 Métodos soportados:
   • {info['metodos_soportados'][0].replace('_', ' ').title()} (Gratuito)
   • {info['metodos_soportados'][1].replace('_', ' ').title()} (Premium)
   • {info['metodos_soportados'][2].replace('_', ' ').title()} (Híbrido)

💾 Optimizado para: {info['optimizado_para']}

📚 Documentación:
   • docs/README.md - Guía completa
   • docs/API.md - Referencia de API
   • ejemplo_uso.py - Ejemplos prácticos

🔧 Uso rápido:
   from agent_3_selector_tecnica import procesar_rapido
   resultado = await procesar_rapido(["foto.jpg"], presupuesto=50.0)
""")
    
    if info['integracion_orquestacion']:
        print(f"""
🔗 Sistema de Orquestación: Disponible
   • Integración completa con AgentManager
   • Soporte para TaskQueue
   • Coordinación con otros agentes
""")
    else:
        print(f"""
⚠️  Sistema de Orquestación: No disponible
   • Instalación standalone
   • Funcionalidades básicas únicamente
""")
    
    print("🎯 ¡Listo para usar! Ejecuta 'python ejemplo_uso.py' para ver ejemplos.\n")

# Ejecutar inicialización
_init_module()

# Mostrar información del paquete (solo en modo interactivo)
import sys
if sys.flags.interactive and not sys.argv[0].endswith('__init__.py'):
    _show_package_info()
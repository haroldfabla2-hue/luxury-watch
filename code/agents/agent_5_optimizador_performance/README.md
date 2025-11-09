# Agente 5: Optimizador de Performance

Sistema avanzado de optimización automática usando glTF-Transform para optimización de modelos 3D con reducción de tamaño del 70-90% y optimización específica por dispositivo.

## 🚀 Características Principales

### Compresión Avanzada
- **Compresión Draco**: Reduce geometría 70-90%
- **KTX2/Basis Universal**: Optimización GPU de texturas
- **Progressive LODs**: Niveles de detalle automáticos
- **Limpieza automática**: Elimina datos redundantes

### Optimización por Dispositivo
- **Móvil**: Optimizado para 30fps y 512MB RAM
- **Tablet**: Balanceado para 45fps y 1GB RAM  
- **Desktop**: Calidad máxima para 60fps y 2GB RAM

### Análisis Inteligente
- **Detección automática**: Análisis de complejidad del modelo
- **Estrategia adaptativa**: Optimización inteligente según complejidad
- **Estadísticas detalladas**: Tamaño, tiempos de carga, FPS estimado
- **Reportes completos**: HTML y JSON con métricas detalladas

## 📦 Instalación

### Requisitos
- Python 3.8+
- Node.js (para glTF-Transform CLI)

### Instalación Rápida
```bash
cd code/agents/agent_5_optimizador_performance
pip install -r requirements.txt
python setup.py install
```

### Instalación Manual
```bash
# Instalar dependencias Python
pip install numpy gltf-transform ujson Pillow scipy PyYAML tqdm colorlog pydantic

# Instalar glTF-Transform CLI (opcional)
npm install -g @gltf-transform/cli
```

## 🎯 Uso Básico

### Optimización Automática
```python
from agent_5_optimizador_performance import AutoOptimizer

# Crear optimizador
auto_optimizer = AutoOptimizer()

# Optimizar modelo para todos los dispositivos
results = auto_optimizer.auto_optimize(
    input_path="modelo.gltf",
    output_dir="optimized_output",
    auto_detect_device=True
)

print(f"Reducción promedio: {results['optimization_summary']['avg_reduction']}")
```

### Optimización Específica
```python
from agent_5_optimizador_performance import GLTFPerformanceOptimizer

# Crear optimizador con configuración personalizada
optimizer = GLTFPerformanceOptimizer("config.json")

# Optimizar para móvil
stats = optimizer.optimize_glTF(
    input_path="modelo.gltf",
    output_dir="mobile_output",
    target_device="mobile"
)

print(f"Reducción lograda: {stats.total_reduction_percent}%")
print(f"Tiempo estimado de carga: {stats.estimated_load_mobile_ms}ms")
```

### Batch Processing
```python
import os
from pathlib import Path

# Procesar múltiples archivos
input_dir = "modelos_entrada"
output_dir = "modelos_optimizados"

for gltf_file in Path(input_dir).glob("*.gltf"):
    results = auto_optimizer.auto_optimize(
        input_path=str(gltf_file),
        output_dir=str(Path(output_dir) / gltf_file.stem)
    )
    print(f"✅ {gltf_file.name} procesado")
```

## ⚙️ Configuración

### Configuración por Dispositivo
```json
{
  "device_profiles": {
    "mobile": {
      "max_texture_size": 1024,
      "texture_quality": 0.6,
      "geometry_simplification": 0.8,
      "draco_compression_level": 7,
      "target_fps": 30
    }
  }
}
```

### Configuración de LODs
```json
{
  "lod_generation": {
    "enabled": true,
    "levels": 4,
    "distance_based": true,
    "quality_threshold": 0.1
  }
}
```

### Configuración de Compresión
```json
{
  "optimization": {
    "enable_draco": true,
    "draco_compression_level": 6,
    "geometry_precision": 14,
    "normal_precision": 10,
    "texcoord_precision": 12
  }
}
```

## 📊 Reportes y Estadísticas

### Salida del Optimizador
```
🚀 Agente 5: Optimizador de Performance
==================================================

🔄 Optimizando automáticamente: watch_model.gltf

🔧 Aplicando optimizaciones...
🗜️ Aplicando compresión Draco...
🖼️ Optimizando texturas...
🔺 Simplificando geometría...
🧹 Limpiando datos redundantes...
📊 Generando LODs...

✅ Optimización completada en 15.23s
📊 Resultados de optimización:
  Mobile: 78.5% reducción
  Tablet: 72.3% reducción  
  Desktop: 68.1% reducción
📁 Archivos guardados en: optimized_output
```

### Archivo de Reporte JSON
```json
{
  "master_optimization_report": {
    "timestamp": "2025-11-06 15:57:08",
    "input_model": "watch_model.gltf",
    "complexity_analysis": {
      "complexity_score": 85,
      "mesh_count": 15,
      "texture_count": 24,
      "texture_size_mb": 45.2
    },
    "device_optimizations": {
      "mobile": {
        "file_size_reduction": "78.5%",
        "estimated_load_time": "1250ms"
      },
      "tablet": {
        "file_size_reduction": "72.3%", 
        "estimated_load_time": "890ms"
      },
      "desktop": {
        "file_size_reduction": "68.1%",
        "estimated_load_time": "650ms"
      }
    },
    "summary": {
      "total_processing_time": "15.23s",
      "avg_reduction": "73.0%",
      "best_device": "mobile"
    }
  }
}
```

## 🔧 API Completa

### GLTFPerformanceOptimizer

#### Métodos Principales
```python
# Optimizar para dispositivo específico
stats = optimizer.optimize_glTF(
    input_path: str,      # Ruta archivo glTF
    output_dir: str,      # Directorio salida
    target_device: str    # "mobile", "tablet", "desktop"
) -> OptimizationStats

# Optimizar para todos los dispositivos
all_stats = optimizer.optimize_all_devices(
    input_path: str,      # Archivo entrada
    output_dir: str       # Directorio salida
) -> Dict[str, OptimizationStats]

# Generar reporte
optimizer.generate_optimization_report(
    stats: OptimizationStats,
    output_path: str,
    target_device: str
)
```

### AutoOptimizer

#### Optimización Inteligente
```python
results = auto_optimizer.auto_optimize(
    input_path: str,              # Archivo glTF
    output_dir: str,              # Directorio salida  
    auto_detect_device: bool = True  # Detección automática
) -> Dict

# Análisis de complejidad
complexity = auto_optimizer._analyze_model_complexity(input_path)
print(f"Score de complejidad: {complexity['complexity_score']}")

# Detección de dispositivo principal
primary_device = auto_optimizer._detect_primary_device(complexity)
print(f"Dispositivo recomendado: {primary_device}")
```

### Clases de Datos

#### OptimizationStats
```python
@dataclass
class OptimizationStats:
    # Archivo original
    original_size_mb: float
    original_geometry_vertices: int
    original_texture_count: int
    original_texture_size_mb: float
    
    # Archivo optimizado
    optimized_size_mb: float
    optimized_geometry_vertices: int
    optimized_texture_count: int
    optimized_texture_size_mb: float
    
    # Reducciones
    total_reduction_percent: float
    geometry_reduction_percent: float
    texture_reduction_percent: float
    
    # LODs y performance
    lod_levels_count: int
    processing_time_seconds: float
    estimated_load_mobile_ms: int
    estimated_load_tablet_ms: int
    estimated_load_desktop_ms: int
```

#### DeviceOptimization
```python
@dataclass
class DeviceOptimization:
    name: str
    max_texture_size: int
    texture_quality: float          # 0.0-1.0
    geometry_simplification: float  # 0.0-1.0
    draco_compression_level: int
    generate_lods: bool
    lod_distance_divisor: float
```

## 🎛️ Casos de Uso Avanzados

### Optimización por Lotes con Monitoreo
```python
import time
from concurrent.futures import ThreadPoolExecutor

def optimize_with_progress(input_files, output_dir):
    results = {}
    
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {}
        
        for i, input_file in enumerate(input_files):
            future = executor.submit(
                auto_optimizer.auto_optimize,
                input_file,
                f"{output_dir}/model_{i}",
                True
            )
            futures[input_file] = future
        
        for input_file, future in futures.items():
            result = future.result()
            results[input_file] = result
            print(f"✅ {input_file} completado")
    
    return results
```

### Optimización Personalizada por Complejidad
```python
def smart_optimization(input_path, output_dir):
    # Analizar complejidad
    complexity = auto_optimizer._analyze_model_complexity(input_path)
    score = complexity['complexity_score']
    
    # Seleccionar estrategia
    if score < 30:
        config = "light_config.json"
    elif score < 70:
        config = "balanced_config.json"
    else:
        config = "aggressive_config.json"
    
    # Optimizar con configuración seleccionada
    optimizer = GLTFPerformanceOptimizer(config)
    return optimizer.optimize_glTF(input_path, output_dir, "auto")
```

### Integración con Pipeline de Construcción
```python
import subprocess
import os

def integrate_build_pipeline(source_dir, build_dir):
    """Integra optimización en pipeline de build"""
    
    # Buscar archivos glTF
    gltf_files = []
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if file.endswith('.gltf'):
                gltf_files.append(os.path.join(root, file))
    
    print(f"🔍 Encontrados {len(gltf_files)} archivos glTF")
    
    # Optimizar cada archivo
    for gltf_file in gltf_files:
        relative_path = os.path.relpath(gltf_file, source_dir)
        output_path = os.path.join(build_dir, relative_path)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        print(f"🔄 Optimizando: {relative_path}")
        
        results = auto_optimizer.auto_optimize(gltf_file, output_path)
        print(f"  📊 Reducción: {results['summary']['avg_reduction']}")
    
    print("✅ Optimización de build completada")

# Uso
integrate_build_pipeline("src/assets/3d", "dist/assets/3d")
```

## 🔍 Solución de Problemas

### Errores Comunes

#### Error de Importación glTF-Transform
```bash
# Solución: Reinstalar con versiones compatibles
pip uninstall gltf-transform
pip install gltf-transform==3.8.0
```

#### Error de Memoria con Modelos Grandes
```python
# Solución: Procesar por lotes y limitar workers
optimizer = GLTFPerformanceOptimizer()
optimizer.max_workers = 1  # Reducir paralelismo
optimizer.memory_limit_gb = 4  # Limitar uso de memoria
```

#### Error de Texturas No Encontradas
```bash
# Verificar que las texturas estén en el mismo directorio
# o usar rutas relativas correctas en el archivo glTF
```

### Logs Detallados
```python
import logging

# Habilitar logging detallado
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('GLTFPerformanceOptimizer')
logger.setLevel(logging.DEBUG)

# Ejecutar optimización
results = auto_optimizer.auto_optimize("modelo.gltf", "output")
```

## 📈 Benchmarks Esperados

### Reducción Típica por Tipo de Modelo
- **Modelos simples** (< 30 complejidad): 40-60% reducción
- **Modelos medios** (30-70 complejidad): 60-80% reducción  
- **Modelos complejos** (> 70 complejidad): 70-90% reducción

### Tiempos de Procesamiento Típicos
- **Modelo móvil** (1-5MB): 5-15 segundos
- **Modelo tablet** (5-20MB): 15-45 segundos
- **Modelo desktop** (20-100MB): 45-180 segundos

### Mejora en Performance
- **Tiempo de carga**: 2-5x más rápido
- **FPS en móvil**: +50-100% mejora
- **Uso de memoria**: -60-80% reducción

## 🤝 Contribución

Para contribuir al desarrollo:

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-caracteristica`
3. Commit cambios: `git commit -am 'Agregar nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Crear Pull Request

### Desarrollo Local
```bash
# Clonar repositorio
git clone <repo-url>
cd code/agents/agent_5_optimizador_performance

# Instalar dependencias desarrollo
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Ejecutar tests
python -m pytest tests/

# Ejecutar linting
black --check .
flake8 .
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **glTF-Transform**: Biblioteca de optimización principal
- **Khronos Group**: Especificación glTF
- **Draco**: Algoritmo de compresión de geometría
- **Basis Universal**: Compresión de texturas universal

---

**Desarrollado por el Sistema de Agentes IA para optimización avanzada de modelos 3D**
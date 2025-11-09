# Agente 4: Validador de Calidad 3D

Sistema avanzado de validación automática de calidad para modelos 3D que utiliza Open3D y métricas de imagen avanzadas para evaluar la integridad geométrica, calidad de texturas, compatibilidad de formato y rendimiento.

## 🎯 Características Principales

### ✅ Verificación de Integridad Geométrica
- **Detección de agujeros**: Identifica huecos en la superficie de la malla
- **Validación de normales**: Verifica orientación correcta de normales de vértices
- **Análisis topológico**: Detecta problemas estructurales en la geometría
- **Triángulos degenerados**: Identifica caras con área muy pequeña
- **Vértices duplicados**: Encuentra vértices coincidentes
- **Componentes desconectadas**: Detecta partes separadas de la malla

### 🖼️ Análisis de Calidad de Texturas
- **Resolución óptima**: Verifica dimensiones mínimas recomendadas
- **Formato y compresión**: Analiza artifacts de compresión JPEG/PNG
- **Mapeado UV**: Evalúa calidad del unwrapping y cobertura
- **Consistencia**: Verifica uniformidad entre múltiples texturas
- **Detección de artifacts**: Identifica banding, blocking y otros problemas
- **Análisis de entropía**: Mide contenido de información de las texturas

### 📊 Métricas de Calidad Avanzadas
- **SSIM** (Structural Similarity Index): Similitud estructural
- **PSNR** (Peak Signal-to-Noise Ratio): Relación señal-ruido
- **LPIPS** (Learned Perceptual Image Patch Similarity): Similitud perceptual
- **Correlación de Pearson**: Relaciones estadísticas entre imágenes
- **Análisis de histograma**: Distribución de valores de píxel
- **Métricas intrínsecas**: Contraste, nitidez, saturación cuando no hay referencias

### 🔧 Validación de Formato y Compatibilidad
- **Soporte multiplataforma**: GLTF, GLB, OBJ, PLY, STL, DAE
- **Análisis de versiones**: Verifica compatibilidad de versiones
- **Dependencias externas**: Identifica archivos relacionados faltantes
- **Optimizaciones**: Sugiere mejoras de formato
- **Compatibilidad web**: Evaluación para uso en navegadores
- **Tamaño y rendimiento**: Análisis de impacto en el rendimiento

### 🤖 Detección Inteligente de Problemas
- **Clasificación automática**: Categoriza problemas por tipo y severidad
- **Análisis cross-validator**: Identifica inconsistencias entre validadores
- **Umbrales adaptativos**: Configuración según el contexto de uso
- **Recomendaciones específicas**: Sugiere soluciones para cada problema
- **Evaluación de impacto**: Prioriza problemas por criticidad

### 🔄 Corrección Automática
- **Sello de agujeros**: Reparación automática de huecos
- **Recalculo de normales**: Orientación correcta automática
- **Optimización de geometría**: Eliminación de elementos problemáticos
- **Embeber recursos**: Consolidación de archivos externos
- **Conversión de formatos**: Optimización automática de formatos
- **Backup automático**: Preservación de archivos originales

### 📈 Reportes Visuales HTML
- **Dashboard interactivo**: Interfaz web moderna y responsive
- **Visualizaciones en tiempo real**: Gráficos dinámicos con matplotlib
- **Métricas detalladas**: Análisis profundo con datos técnicos
- **Recomendaciones accionables**: Guías paso a paso para mejoras
- **Exportación múltiple**: HTML, JSON, PDF (próximamente)
- **Diseño responsive**: Optimizado para móvil y desktop

## 🚀 Instalación

### Requisitos Previos

```bash
# Python 3.8 o superior
python --version

# Dependencias del sistema (Ubuntu/Debian)
sudo apt update
sudo apt install python3-dev python3-pip

# Para procesamiento de imágenes
sudo apt install libopencv-dev python3-opencv
```

### Instalación de Dependencias

```bash
# Clonar o descargar el agente
cd agent_4_validador_3d

# Instalar dependencias básicas
pip install -r requirements.txt

# Instalar dependencias opcionales para métricas avanzadas
pip install torch torchvision
pip install lpips  # Para métricas LPIPS
pip install seaborn  # Para visualizaciones mejoradas
```

### Verificación de Instalación

```bash
python -c "import open3d; print('Open3D:', open3d.__version__)"
python -c "import cv2; print('OpenCV:', cv2.__version__)"
python -c "import numpy; print('NumPy:', numpy.__version__)"
```

## 📖 Uso Básico

### Uso desde Línea de Comandos

```bash
# Validación básica
python validador_3d_principal.py modelo3d.gltf

# Con correcciones automáticas
python validador_3d_principal.py modelo3d.gltf --auto-correct

# Con directorio de salida específico
python validador_3d_principal.py modelo3d.gltf --output ./reportes/

# Modo verbose con reporte JSON
python validador_3d_principal.py modelo3d.gltf --verbose --json
```

### Uso Programático

```python
from validador_3d_principal import Validador3DPrincipal

# Crear validador con configuración personalizada
config = {
    'geometrico': {
        'tolerancia_agujeros': 0.005,
        'normal_threshold': 0.05
    },
    'corrector': {
        'auto_correct': True,
        'backup_original': True
    }
}

validador = Validador3DPrincipal(config)

# Validar archivo
resultados = validador.validar_archivo('modelo3d.gltf')

# Generar reportes
reporte_html = validador.generar_reporte_html('reporte_calidad.html')
reporte_json = validador.generar_reporte_json('reporte_calidad.json')

# Aplicar correcciones automáticas
if resultados.get('corregible_automaticamente'):
    correccion = validador.corregir_automaticamente('modelo3d.gltf', './corregidos/')

# Mostrar resumen
resumen = validador.obtener_resumen()
print(f"Puntuación: {resumen['puntuacion_calidad']}/10")
print(f"Problemas: {resumen['problemas_detectados']}")
```

## ⚙️ Configuración Avanzada

### Configuración Predefinida

El agente incluye configuraciones optimizadas para diferentes casos de uso:

```python
from config import configurar_para_web, configurar_para_alta_calidad

# Para aplicaciones web (optimizado para tamaño)
config_web = configurar_para_web()

# Para máxima calidad (científico, arquitectura)
config_alta = configurar_para_alta_calidad()

# Para VR/AR (rendimiento en tiempo real)
config_vr = configurar_para_vr_ar()

# Para juegos móviles (equilibrio calidad/tamaño)
config_juegos = configurar_para_juegos()
```

### Configuración Personalizada

```python
from config import cargar_configuracion

# Configuración personalizada
config_personalizada = {
    'geometrico': {
        'tolerancia_agujeros': 0.01,
        'min_triangulos': 1000
    },
    'texturas': {
        'resolucion_minima': 1024,
        'tamaño_archivo_max': 5 * 1024 * 1024
    },
    'metricas': {
        'ssim_threshold': 0.9,
        'psnr_threshold': 25.0
    },
    'corrector': {
        'auto_correct': True,
        'backup_original': True
    }
}

config = cargar_configuracion(config_personalizado=config_personalizada)
```

### Umbrales de Calidad

| Parámetro | Valor por Defecto | Descripción |
|-----------|-------------------|-------------|
| `ssim_threshold` | 0.8 | Umbral mínimo para SSIM |
| `psnr_threshold` | 20.0 | Umbral mínimo para PSNR |
| `lpips_threshold` | 0.3 | Umbral máximo para LPIPS |
| `resolucion_minima` | 512x512 | Resolución mínima de texturas |
| `tolerancia_agujeros` | 0.01 | Tolerancia para detección de agujeros |
| `severidad_minima` | 0.3 | Severidad mínima para reportar problemas |

## 🔍 Casos de Uso

### 1. Validación Pre-Publicación Web

```python
# Configuración optimizada para web
config_web = {
    'formato': {
        'formatos_soportados': ['.gltf', '.glb'],
        'embeber_recursos': True
    },
    'texturas': {
        'resolucion_minima': 256,
        'tamaño_archivo_max': 2 * 1024 * 1024
    },
    'problemas': {
        'umbral_poligonos': 50000
    }
}

validador = Validador3DPrincipal(config_web)
resultados = validador.validar_archivo('modelo_web.gltf')
```

### 2. Control de Calidad en Pipeline 3D

```python
# Validación automática en CI/CD
import sys
from validador_3d_principal import Validador3DPrincipal

def validar_para_pipeline(ruta_archivo):
    validador = Validador3DPrincipal()
    resultados = validador.validar_archivo(ruta_archivo)
    
    # Criterios de aprobación
    puntuacion_minima = 7.0
    max_problemas_criticos = 2
    
    if (resultados['puntuacion_calidad'] < puntuacion_minima or
        len([p for p in resultados['problemas_detectados'] if p['severidad'] > 0.7]) > max_problemas_criticos):
        
        print("❌ Validación falló")
        validador.generar_reporte_html('reporte_fallo.html')
        sys.exit(1)
    
    print("✅ Validación exitosa")

# Uso en pipeline
validar_para_pipeline('modelo_pipeline.gltf')
```

### 3. Análisis Científico de Modelos

```python
# Configuración para análisis científico
config_cientifico = {
    'metricas': {
        'ssim_threshold': 0.95,
        'psnr_threshold': 30.0,
        'lpips_threshold': 0.1
    },
    'texturas': {
        'formatos_sin_perdida': ['.png', '.tiff'],
        'formatos_con_perdida': []  # Sin compresión
    },
    'problemas': {
        'severidad_minima': 0.1  # Más sensible
    }
}

validador = Validador3DPrincipal(config_cientifico)
```

## 📊 Interpretación de Resultados

### Puntuación General

- **9.0-10.0**: Excelente calidad, listo para producción
- **7.0-8.9**: Buena calidad, menores ajustes recomendados
- **5.0-6.9**: Calidad aceptable, mejoras importantes necesarias
- **3.0-4.9**: Calidad deficiente, problemas significativos
- **0.0-2.9**: Calidad crítica, no recomendado para uso

### Tipos de Problemas

| Tipo | Severidad | Impacto | Auto-corregible |
|------|-----------|---------|-----------------|
| Geométrico | Variable | Medio-Alto | Parcial |
| Texturas | Variable | Bajo-Medio | Parcial |
| Materiales | Media | Medio | No |
| Rendimiento | Alta | Alto | Limitado |
| Compatibilidad | Alta | Alto | Limitado |

### Códigos de Error Comunes

- `AGUJEROS_DETECTADOS`: Huecos en la superficie de la malla
- `NORMALES_INVERTIDAS`: Normales mal orientadas
- `RESOLUCION_BAJA`: Texturas de resolución insuficiente
- `COMPRESION_EXCESIVA`: Artifacts por compresión excesiva
- `FORMATO_OBSOLETO`: Formato no recomendado para uso actual
- `TROPOS_POLIGONOS`: Exceso de geometría para el caso de uso

## 🛠️ Extensión y Personalización

### Agregar Nuevo Validador

```python
class MiValidadorPersonalizado:
    def __init__(self, config):
        self.config = config
    
    def validar(self, ruta_archivo):
        # Lógica de validación personalizada
        return {
            'puntuacion': 8.5,
            'problema_detectado': 'detalle_específico',
            'recomendacion': 'solución_específica'
        }
```

### Integración con Sistemas Existentes

```python
# Hook para sistemas de CI/CD
def hook_validacion_completada(resultados):
    if resultados['puntuacion_calidad'] < 7.0:
        enviar_notificacion_slack("Modelo requiere atención")
        crear_ticket_jira("Revisar calidad modelo 3D")
```

### Plugin de Métricas Personalizadas

```python
def mi_metrica_personalizada(imagen1, imagen2):
    # Implementar métrica específica
    return valor_metric
```

## 📝 Logs y Depuración

### Niveles de Log

```python
import logging

# Configurar logging detallado
logging.basicConfig(level=logging.DEBUG)

# Solo errores críticos
logging.basicConfig(level=logging.ERROR)
```

### Ubicación de Logs

- **Directorio por defecto**: `./logs/`
- **Archivo principal**: `validador_3d.log`
- **Archivos rotativos**: `validador_3d.log.1`, `validador_3d.log.2`

### Debugging Avanzado

```python
# Habilitar modo debug
config = {
    'avanzado': {
        'debug_mode': True,
        'profiling_enabled': True,
        'save_intermediate_results': True
    }
}
```

## 🤝 Contribución

### Estructura del Proyecto

```
agent_4_validador_3d/
├── validador_3d_principal.py     # Clase principal
├── validador_geometrico.py       # Validación geométrica
├── validador_texturas.py         # Validación de texturas
├── validador_formato.py          # Validación de formato
├── metricas_calidad.py           # Métricas de imagen
├── detector_problemas.py         # Detección de problemas
├── corrector_automatico.py       # Corrección automática
├── generador_reportes.py         # Generación de reportes HTML
├── config.py                     # Configuración
├── requirements.txt              # Dependencias
└── README.md                     # Este archivo
```

### Estándares de Código

- **PEP 8** para estilo de código Python
- **Type hints** para documentación de tipos
- **Docstrings** detallados para todas las funciones
- **Tests unitarios** para componentes críticos
- **Validación de entrada** en todas las funciones públicas

### Proceso de Contribución

1. Fork del repositorio
2. Crear branch para nueva funcionalidad
3. Implementar con tests correspondientes
4. Verificar que pasa todos los tests
5. Crear Pull Request con descripción detallada

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para detalles.

## 🆘 Soporte y FAQ

### Problemas Comunes

**P: Error "Open3D no encontrado"**
```bash
pip install open3d
```

**P: "LPIPS no disponible"**
```bash
pip install torch torchvision
pip install lpips
```

**P: "Memoria insuficiente"**
```python
# Reducir configuración de procesamiento
config = {
    'rendimiento': {
        'optimizacion_memoria': True,
        'chunk_size': 500
    }
}
```

**P: "Tiempo de validación muy largo"**
```python
# Ajustar umbrales para validación más rápida
config = {
    'problemas': {
        'severidad_minima': 0.5,  # Ignorar problemas menores
    }
}
```

### Contacto

- **Issues**: Reportar problemas en el repositorio
- **Documentación**: Consultar este README y docstrings
- **Ejemplos**: Ver directorio `examples/`

---

**Desarrollado por el Agente 4: Validador de Calidad 3D**  
*Validación automática avanzada para modelos 3D*
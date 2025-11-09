# Agente 2: Optimizador de Captura

## 📋 Descripción

El **Agente Optimizador de Captura** es un componente especializado del Sistema de Fotogrametría de Relojes de Lujo que se encarga de generar guías inteligentes de fotografía para componentes de relojes de alta gama.

### 🎯 Funcionalidades Principales

- ✅ **Generación de Guías Específicas**: Crea guías personalizadas según el tipo de componente (caja, bisel, correa, esfera)
- ✅ **Cálculo de Ángulos Óptimos**: Utiliza geometría computacional avanzada para determinar ángulos de captura ideales
- ✅ **Recomendaciones de Cámara**: Sugiere configuraciones óptimas de f-number, ISO, velocidad de obturación
- ✅ **Esquemas de Iluminación**: Propone configuraciones de luz especializadas por componente
- ✅ **Validación de Cobertura**: Verifica la completitud angular de imágenes existentes
- ✅ **Checklists Visuales**: Genera listas interactivas para fotógrafos
- ✅ **Integración de Sistema**: Se conecta con el sistema de coordinación central

## 🏗️ Arquitectura

```
agent_2_optimizacion_captura/
├── capture_optimizer_agent.py     # Agente principal
├── coordination_interface.py      # Interfaz de coordinación
├── agent_config.py               # Configuraciones del agente
├── angle_calculator.py           # Calculadora de ángulos
├── guide_generator.py            # Generador de guías
├── templates/                    # Templates HTML/CSS/JS
│   ├── guide_template.html       # Template principal
│   ├── guide_styles.css         # Estilos CSS
│   └── guide_interactions.js    # Interacciones JavaScript
├── __init__.py                   # Paquete principal
├── ejemplo_uso.py               # Ejemplos de uso
└── README.md                    # Esta documentación
```

## 🚀 Instalación y Uso Rápido

### Instalación

```bash
# El agente está incluido en el sistema, no requiere instalación adicional
# Asegúrate de que el directorio esté en el PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/agent_2_optimizacion_captura"
```

### Uso Básico

```python
from agent_2_optimizacion_captura import create_agent, ComponentType

# Crear agente
agent = create_agent()

# Generar guía para esfera
guide = agent.generate_capture_guide(
    component_type=ComponentType.ESFERA,
    component_id="SPH_LUX_001"
)

print(f"Vistas requeridas: {guide.required_views}")
print(f"Duración estimada: {guide.estimated_duration} minutos")
print(f"Ángulos: {guide.optimal_angles}")
```

### Exportar Guía HTML

```python
# Exportar guía a HTML interactivo
html_path = agent.export_guide_to_html(guide, "/path/to/guide.html")
print(f"Guía exportada a: {html_path}")
```

## 🔧 Configuración

### Configuración por Defecto

```python
from agent_2_optimizacion_captura import get_config

config = get_config()

# Perfiles de cámara disponibles
print("Cámaras:", list(config.camera_profiles.keys()))

# Perfiles de iluminación
print("Iluminación:", list(config.lighting_profiles.keys()))

# Configuraciones por componente
bisel_config = config.get_component_config("bisel")
```

### Configuración Personalizada

```python
from agent_2_optimizacion_captura import AgentConfiguration

# Crear configuración personalizada
config = AgentConfiguration("mi_config.json")

# Modificar configuraciones
config.optimization_settings.max_processing_time = 600
config.optimization_settings.angle_calculation_method = "hybrid"

# Exportar configuración
config.export_config("mi_config_export.json")
```

## 📐 Tipos de Componentes Soportados

### 1. **Caja** (CAJA)
- **Dimensiones típicas**: 50×50×15mm
- **Ángulos críticos**: 0°, 30°, 45°, 60°, 90°, 120°, 135°, 150°, 180°
- **Focal recomendada**: 85mm
- **Consideraciones**: Mostrar profundidad y detalles de las esquinas

### 2. **Bisel** (BISEL)
- **Dimensiones típicas**: 45×45×8mm
- **Ángulos críticos**: 0°, 30°, 45°, 60°, 90°, 120°, 150°, 180°
- **Focal recomendada**: 100mm
- **Consideraciones**: Resaltar texturas y grabados

### 3. **Correa** (CORREA)
- **Dimensiones típicas**: 30×250×5mm
- **Ángulos críticos**: 0°, 45°, 90°, 135°, 180°
- **Focal recomendada**: 50mm
- **Consideraciones**: Evitar arrugas y mostrar textura completa

### 4. **Esfera** (ESFERA)
- **Dimensiones típicas**: 40×40×40mm
- **Ángulos críticos**: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
- **Focal recomendada**: 105mm
- **Consideraciones**: Iluminación uniforme y evitar huellas

## 🧮 Cálculo de Ángulos Óptimos

El agente utiliza múltiples métodos para calcular ángulos óptimos:

### Métodos Disponibles

1. **Geométrico**: Basado en principios de geometría pura
2. **Óptico**: Optimizado para consideraciones fotográficas
3. **Híbrido**: Combina criterios geométricos y ópticos
4. **IA Optimizado**: Simulación de optimización con inteligencia artificial

### Ejemplo de Uso

```python
from agent_2_optimizacion_captura import get_geometry_calculator
from agent_2_optimizacion_captura import ComponentType, ComponentGeometry

calculator = get_geometry_calculator()

geometry = ComponentGeometry(
    width=40, height=40, depth=40,
    curvature_radius=20, material_reflectivity=0.6
)

# Calcular ángulos óptimos
angles = calculator.calculate_optimal_angles(
    ComponentType.ESFERA, 
    geometry,
    method=AngleMethod.HYBRID
)

for angle_result in angles:
    print(f"Ángulo: {angle_result.angle}°")
    print(f"Score: {angle_result.optimization_score:.2f}")
    print(f"Confianza: {angle_result.confidence:.2f}")
    print(f"Racional: {angle_result.rationale}")
```

## 💡 Esquemas de Iluminación

### Perfiles Predefinidos

1. **Studio Profesional**: Configuración con softbox y flash de estudio
2. **Luz Natural**: Utilizando luz natural filtrada
3. **Configuración LED**: Iluminación LED continua
4. **Iluminación Macro**: Especializada para fotografía macro

### Configuración por Componente

```python
# El agente sugiere automáticamente la configuración óptima
# según el tipo de componente y material

guide = agent.generate_capture_guide(ComponentType.BISEL, "BEZEL_001")

for light_config in guide.lighting_configs:
    print(f"Tipo: {light_config.lighting_type.value}")
    print(f"Posición: {light_config.position}")
    print(f"Intensidad: {light_config.intensity}")
    print(f"Temperatura: {light_config.color_temperature}K")
```

## 📊 Validación de Cobertura

### Validación Angular

```python
from agent_2_optimizacion_captura import validate_existing_coverage

# Verificar si las imágenes capturadas cubren los ángulos requeridos
validation = validate_existing_coverage(
    captured_angles=[0, 45, 90, 135, 180],
    required_angles=[0, 45, 90, 135, 180, 225, 270, 315]
)

print(f"Cobertura: {validation['coverage_percentage']:.1f}%")
print(f"Completa: {validation['is_complete']}")
if validation['missing_angles']:
    print(f"Faltantes: {validation['missing_angles']}")
```

## 🎨 Generación de Guías HTML

### Template Interactivo

El agente genera guías HTML completas con:

- **Grid de Ángulos**: Visualización interactiva de ángulos requeridos
- **Configuraciones de Cámara**: Tarjetas con configuraciones detalladas
- **Esquema de Iluminación**: Diagrama visual de posiciones de luz
- **Checklist Interactivo**: Lista verificable con progreso
- **Notas Importantes**: Recordatorios específicos por componente

### Características del HTML

- 📱 **Responsive**: Funciona en desktop, tablet y móvil
- 🖨️ **Imprimible**: Optimizado para impresión
- ♿ **Accesible**: Cumple estándares WCAG
- 🌐 **Internacionalizado**: Soporte multiidioma

## 🔄 Integración con Sistema de Coordinación

### Envío de Tareas Asíncronas

```python
from agent_2_optimizacion_captura import get_coordination_interface

coord = get_coordination_interface()
coord.start()

def task_callback(task_id, status, result, error):
    if status == "completed":
        print(f"Guía generada: {result['component_id']}")
    elif status == "failed":
        print(f"Error: {error}")

# Enviar tarea de generación
task_id = coord.submit_task(
    task_type="generate_capture_guide",
    parameters={
        "component_type": "esfera",
        "component_id": "SPH_001"
    },
    callback=task_callback
)
```

### Consulta de Estado

```python
# Obtener estado del agente
status = coord.get_agent_status()
print(f"Estado: {status['status']}")
print(f"Capacidades: {status['capabilities']}")

# Obtener tareas activas
active_tasks = coord.get_active_tasks()
print(f"Tareas activas: {len(active_tasks)}")
```

## 📋 Checklist Visual

### Generación Automática

El agente genera checklists específicos por componente:

#### Para Esferas:
- ✅ Verificar que la esfera esté perfectamente centrada
- ✅ Asegurar iluminación uniforme en toda la superficie
- ✅ Evitar reflejos unwanted en la superficie pulida
- ✅ Capturar desde 8 ángulos diferentes (cada 45°)

#### Para Biseles:
- ✅ Verificar que todas las marcas del bisel sean legibles
- ✅ Asegurar que la textura del bisel esté bien definida
- ✅ Evitar sombras que oculten detalles importantes
- ✅ Capturar desde 6 ángulos diferentes

#### Para Cajas:
- ✅ Verificar que todos los elementos de la caja estén visibles
- ✅ Asegurar que las esquinas estén bien iluminadas
- ✅ Evitar reflejos en superficies metálicas
- ✅ Capturar desde 5 ángulos diferentes

#### Para Correas:
- ✅ Estirar la correa para evitar arrugas
- ✅ Verificar que la textura del material sea visible
- ✅ Asegurar iluminación uniforme a lo largo de toda la correa
- ✅ Capturar desde 4 ángulos diferentes

## 🔧 API Avanzada

### Métodos Principales

```python
# Crear agente completo
agent, coord = initialize_agent(config_path="config.json")

# Generar guía con geometría personalizada
guide = agent.generate_capture_guide(
    component_type=ComponentType.ESFERA,
    component_id="SPH_001",
    custom_geometry=ComponentGeometry(40, 40, 40)
)

# Validar cobertura angular
validation = agent.validate_angular_coverage(
    captured_angles=[0, 45, 90],
    required_angles=[0, 45, 90, 135, 180]
)

# Exportar guía a diferentes formatos
html_path = agent.export_guide_to_html(guide, "/path/to/guide.html")
```

### Utilidades Rápidas

```python
# Funciones de conveniencia
from agent_2_optimizacion_captura import (
    generate_quick_guide,
    calculate_optimal_angles,
    validate_existing_coverage,
    export_guide_to_html
)

# Guía rápida
guide = generate_quick_guide("esfera", "SPH_001")

# Cálculo rápido de ángulos
angles = calculate_optimal_angles("caja", {"width": 45, "height": 45})

# Validación rápida
validation = validate_existing_coverage([0, 45, 90], [0, 45, 90, 135])
```

## 🧪 Ejemplos de Uso

### Ejemplo 1: Uso Básico

```python
#!/usr/bin/env python3
from capture_optimizer_agent import CaptureOptimizerAgent, ComponentType

# Crear agente
agent = CaptureOptimizerAgent()

# Generar guía para bisel
guide = agent.generate_capture_guide(
    component_type=ComponentType.BISEL,
    component_id="BEZEL_LUXURY_001"
)

print(f"Guía generada: {guide.required_views} vistas")
print(f"Ángulos: {guide.optimal_angles}")
print(f"Duración: {guide.estimated_duration} minutos")
```

### Ejemplo 2: Configuración Avanzada

```python
#!/usr/bin/env python3
from agent_config import AgentConfiguration
from capture_optimizer_agent import ComponentType, ComponentGeometry

# Configuración personalizada
config = AgentConfiguration("mi_config.json")
config.optimization_settings.max_processing_time = 600

# Generar guía con configuración personalizada
agent = CaptureOptimizerAgent()
geometry = ComponentGeometry(45, 45, 12, material_reflectivity=0.4)

guide = agent.generate_capture_guide(
    component_type=ComponentType.CAJA,
    component_id="CASE_PREMIUM",
    custom_geometry=geometry
)

# Exportar a HTML
agent.export_guide_to_html(guide, "/tmp/guide.html")
```

### Ejemplo 3: Integración con Coordinación

```python
#!/usr/bin/env python3
from coordination_interface import CoordinationInterface

# Inicializar coordinación
coord = CoordinationInterface("mi_agente")
coord.start()

# Enviar tarea asíncrona
def on_complete(task_id, status, result, error):
    if status == "completed":
        print(f"Guía completada: {result}")

task_id = coord.submit_task(
    task_type="generate_capture_guide",
    parameters={
        "component_type": "correa",
        "component_id": "STRAP_001"
    },
    callback=on_complete
)

print(f"Tarea enviada: {task_id}")
```

## 📊 Rendimiento

### Métricas de Rendimiento

- **Tiempo de generación de guía**: 2-5 segundos
- **Cálculo de ángulos**: <1 segundo
- **Validación de cobertura**: <0.5 segundos
- **Exportación HTML**: 1-2 segundos

### Optimizaciones

- **Cache de ángulos**: Resultados cached para componentes similares
- **Cálculo paralelo**: Procesamiento asíncrono de múltiples componentes
- **Memoria optimizada**: Gestión eficiente de memoria para guías grandes

## 🛠️ Solución de Problemas

### Problemas Comunes

#### Error: "Component type not supported"
```python
# Verificar tipo de componente válido
from capture_optimizer_agent import ComponentType

component_types = [comp.value for comp in ComponentType]
print("Tipos válidos:", component_types)
```

#### Error: "Invalid geometry parameters"
```python
# Validar geometría antes de usar
geometry = ComponentGeometry(
    width=45.0, height=45.0, depth=12.0,
    curvature_radius=22.5, material_reflectivity=0.4
)
```

#### Error: "HTML export failed"
```python
# Verificar permisos de escritura
import os
output_dir = "/path/to/output"
if not os.path.exists(output_dir):
    os.makedirs(output_dir, exist_ok=True)
```

### Logging y Debugging

```python
import logging

# Habilitar logging detallado
logging.basicConfig(level=logging.DEBUG)

# El agente registrará información detallada
agent = CaptureOptimizerAgent()
guide = agent.generate_capture_guide(ComponentType.ESFERA, "SPH_001")
```

## 🔄 Actualizaciones y Mantenimiento

### Control de Versiones

- **v2.0**: Implementación inicial completa
- **v2.1**: Mejoras en cálculo de ángulos
- **v2.2**: Optimización de rendimiento
- **v2.3**: Nuevos templates HTML

### Backward Compatibility

El agente mantiene compatibilidad hacia atrás:
- Configuraciones v1.x siguen funcionando
- API principal sin cambios romper
- Templates HTML actualizados automáticamente

## 📞 Soporte

### Documentación Adicional

- **API Reference**: Documentación completa de API
- **Tutoriales**: Guías paso a paso
- **Ejemplos**: Código de ejemplo completo

### Contacto

- **Email**: support@fotogrametria-relojes.com
- **GitHub**: [Repositorio del proyecto]
- **Issues**: Reportar errores y solicitudes de características

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**Sistema de Fotogrametría de Relojes de Lujo**  
*Agente Optimizador de Captura v2.0*  
*Fecha: 2025-11-06*
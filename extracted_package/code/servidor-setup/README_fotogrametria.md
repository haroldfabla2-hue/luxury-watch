# Stack de Fotogrametría Gratuita - Instalador Automático

Este repositorio contiene scripts automatizados para instalar un stack completo de herramientas de fotogrametría gratuita en servidores Linux.

## Herramientas Incluidas

### 1. **COLMAP**
- **Función**: Software de Structure from Motion (SfM) y Multi-View Stereo (MVS)
- **Instalación**: Compilación desde código fuente para máximo rendimiento
- **Uso**: Reconstrucción 3D a partir de fotografías

### 2. **glTF-Transform**
- **Función**: Procesamiento y optimización de modelos 3D en formato glTF
- **Instalación**: Via npm (Node.js)
- **Uso**: Optimización, compresión y manipulación de modelos 3D

### 3. **Herramientas de Procesamiento de Imágenes**
- **ImageMagick**: Conversión y procesamiento de imágenes
- **OpenCV**: Visión por computadora avanzada
- **PIL (Pillow)**: Procesamiento básico de imágenes en Python

### 4. **Rembg y Real-ESRGAN**
- **Rembg**: Eliminación automática de fondos
- **Real-ESRGAN**: Mejora y upscaling de imágenes con IA
- **Función**: Preparación y mejora de imágenes para fotogrametría

### 5. **Material Maker**
- **Función**: Generación de materiales PBR procedimentales
- **Instalación**: Aplicación precompilada
- **Uso**: Creación de texturas y materiales para modelos 3D

### 6. **MeshLab**
- **Función**: Edición y procesamiento de malla 3D
- **Instalación**: Via repositorios del sistema
- **Uso**: Limpieza y optimización de modelos 3D

## Instalación

### Requisitos del Sistema
- **Sistema Operativo**: Ubuntu 18.04+ / Debian 9+ o derivados
- **RAM**: Mínimo 8GB (recomendado 16GB+)
- **Almacenamiento**: Al menos 10GB libres
- **Privilegios**: Acceso root o sudo

### Pasos de Instalación

1. **Clonar o descargar el script**:
```bash
# Si tienes el script localmente
sudo bash code/servidor-setup/install_photogrammetry_stack.sh
```

2. **Ejecutar el instalador**:
```bash
sudo chmod +x code/servidor-setup/install_photogrammetry_stack.sh
sudo ./code/servidor-setup/install_photogrammetry_stack.sh
```

3. **Verificar la instalación**:
```bash
sudo bash code/servidor-setup/test_photogrammetry_stack.sh
```

### Proceso de Instalación

El script ejecuta automáticamente los siguientes pasos:

1. **Actualización del sistema** (5-10 minutos)
2. **Instalación de dependencias** (10-15 minutos)
3. **Compilación de COLMAP** (15-30 minutos)
4. **Instalación de herramientas Node.js** (2-5 minutos)
5. **Configuración del entorno Python** (5-10 minutos)
6. **Instalación de herramientas de IA** (5-10 minutos)
7. **Instalación de aplicaciones GUI** (2-5 minutos)

**Tiempo total estimado**: 45-85 minutos

## Estructura de Archivos Generados

```
/opt/
├── photogrammetry_env/          # Entorno virtual Python
└── material-maker/              # Aplicación Material Maker

/usr/local/bin/
├── colmap                       # Ejecutable COLMAP
├── material-maker               # Enlace a Material Maker
└── meshlab                      # Ejecutable MeshLab

/tmp/
├── colmap_build/                # Archivos temporales de compilación
└── [otras carpetas temporales]

/workspace/code/servidor-setup/
├── install_photogrammetry_stack.sh  # Script principal
├── test_photogrammetry_stack.sh     # Script de pruebas
└── photogrammetry_install.log       # Log de instalación
```

## Uso Básico de las Herramientas

### COLMAP
```bash
# Reconstrucción automática desde carpeta de imágenes
colmap automatic_reconstructor \
    --images_path /ruta/imagenes \
    --workspace_path /ruta/salida
```

### glTF-Transform
```bash
# Optimizar modelo glTF
gltf-transform optimize modelo_entrada.glb modelo_salida.glb

# Comprimir texturas
gltf-transform draco modelo.glb modelo_comprimido.glb
```

### Rembg (Python)
```python
from rembg import remove
from PIL import Image

# Eliminar fondo
with open('imagen_entrada.png', 'rb') as f:
    input_data = f.read()

output_data = remove(input_data)
with open('imagen_sin_fondo.png', 'wb') as f:
    f.write(output_data)
```

### Real-ESRGAN (Python)
```python
from realesrgan import RealESRGANer
from PIL import Image

# Configurar el upscaler
upsampler = RealESRGANer(
    scale=4,
    model_path='RealESRGAN_x4plus.pth',
    dni_weight=None,
    model=None,
    tile=0,
    tile_pad=10,
    pre_pad=0,
    half=False
)

# Aplicar upscaling
input_image = Image.open('imagen_baja_resolucion.png')
output_image, _ = upsampler.enhance(input_image, outscale=4)
output_image.save('imagen_mejorada.png')
```

### ImageMagick
```bash
# Redimensionar imágenes
convert imagen_original.jpg -resize 1920x1080 imagen_redimensionada.jpg

# Convertir formato
convert imagen_entrada.png imagen_salida.jpg

# Crear mosaico de imágenes
montage imagen1.jpg imagen2.jpg imagen3.jpg -tile 3x1 mosaico.jpg
```

## Verificación y Pruebas

### Script de Pruebas Automáticas
```bash
sudo bash code/servidor-setup/test_photogrammetry_stack.sh
```

### Pruebas Manuales

1. **COLMAP**:
```bash
colmap --help
```

2. **glTF-Transform**:
```bash
gltf-transform --help
```

3. **Python**:
```bash
source /opt/photogrammetry_env/bin/activate
python3 -c "import cv2, PIL, rembg; print('Librerías OK')"
deactivate
```

4. **ImageMagick**:
```bash
convert --version
```

## Resolución de Problemas

### Error: "No se puede compilar COLMAP"
- Verificar que todas las dependencias están instaladas
- Asegurar que hay al menos 4GB de RAM disponibles durante la compilación
- Revisar el log en `/workspace/code/servidor-setup/photogrammetry_install.log`

### Error: "Comando no encontrado" para herramientas instaladas
- Verificar que las rutas estén en el PATH del sistema
- Reiniciar la sesión o ejecutar `source ~/.bashrc`

### Problemas con dependencias Python
```bash
# Recrear entorno virtual
sudo rm -rf /opt/photogrammetry_env
# Reiniciar instalación desde el paso de Python
```

## Desinstalación

Para desinstalar el stack completo:

```bash
# Remover entorno virtual Python
sudo rm -rf /opt/photogrammetry_env

# Remover aplicaciones
sudo rm -rf /opt/material-maker
sudo rm /usr/local/bin/colmap
sudo rm /usr/local/bin/material-maker
sudo rm /usr/local/bin/meshlab

# Remover paquetes del sistema (opcional)
sudo apt remove --purge imagemagick meshlab
sudo apt autoremove
```

## Rendimiento y Optimización

### Para Servidores con Recursos Limitados
- Reducir el número de núcleos de compilación: cambiar `-j$(nproc)` por `-j2` en el script
- Compilar COLMAP sin optimizaciones: cambiar `CMAKE_BUILD_TYPE=Release` por `CMAKE_BUILD_TYPE=Debug`

### Para Máquinas de Alto Rendimiento
- Aumentar núcleos de compilación: usar `-j$(nproc)` (ya configurado)
- Habilitar optimizaciones adicionales en COLMAP

## Contribuciones y Mejoras

Para mejorar este script:
1. Probar en diferentes distribuciones Linux
2. Optimizar tiempos de instalación
3. Añadir más herramientas de fotogrametría
4. Mejorar el manejo de errores
5. Añadir configuración automática para GPU

## Licencia

Este script instala software de código abierto con sus respectivas licencias:
- COLMAP: BSD License
- glTF-Transform: MIT License
- OpenCV: BSD License
- ImageMagick: ImageMagick License
- Rembg: Apache License 2.0
- Real-ESRGAN: GPL v3 License
- Material Maker: MIT License
- MeshLab: CPL License

## Soporte

Para reportar problemas o solicitar mejoras:
1. Revisar los logs en `/workspace/code/servidor-setup/photogrammetry_install.log`
2. Verificar compatibilidad del sistema
3. Consultar documentación oficial de cada herramienta

---

**Nota**: Este script está diseñado para instalaciones en servidores Linux. Para uso en estaciones de trabajo con GUI, algunas herramientas pueden requerir configuración adicional para el entorno gráfico.
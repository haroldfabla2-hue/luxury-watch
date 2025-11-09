# Estrategias avanzadas de IA para un pipeline 2D→3D inteligente y eficiente (2025)

## Resumen ejecutivo y objetivos

La fotogrametría moderna ha alcanzado una madurez que la convierte en el pilar de la creación de activos 3D para retail de lujo, product visualization y configuradores web. Sin embargo, la mayor parte de los pipelines aún operan con heurísticas fijas, evaluación post‑proceso y parámetros estáticos, lo que limita su eficiencia, consistencia de calidad y capacidad de escalar sin intervención manual. En 2025, un pipeline 2D→3D verdaderamente inteligente debe anticipar la calidad de la reconstrucción antes de procesar, seleccionar automáticamente las mejores imágenes, sintetizar vistas faltantes cuando convenga, normalizar iluminación y sombras, recomendar configuraciones de captura personalizadas por categoría de producto, auto‑ajustar parámetros del motor de reconstrucción y validar la calidad en tiempo real, todo ello con observabilidad y trazabilidad.

Este informe técnico analítico propone una arquitectura modular de extremo a extremo que orquesta estas capacidades con cinco capas: (1) inteligencia de decisión previa al procesamiento; (2) interpolación de vistas con Neural Radiance Fields (NeRF) y Gaussian Splatting 3D (3DGS); (3) normalización de iluminación ambiental (ALN) y eliminación de sombras; (4) reconstrucción Structure‑from‑Motion y Multi‑View Stereo (SfM/MVS) con COLMAP y fallback a Autodesk Platform Services (APS) Reality Capture; (5) validación automática y optimización de activos glTF/GLB para visualización web. El objetivo es reducir costes de GPU/API, elevar la tasa de aprobación en QA, acelerar el time‑to‑content y mejorar la consistencia entre categorías y sesiones de captura, manteniendo el nivel de fidelidad visual que demandan las marcas de lujo.[^1][^2][^3][^5][^6][^7][^8]

Para contextualizar la ambición del sistema, la Figura 1 ilustra un configurador 3D de referencia de alto nivel visual, cuyo estándar de experiencia de usuario sirve como benchmark para nuestro pipeline de generación de contenido y su publicación en la web.[^13][^14]

![Interfaz de un configurador 3D de referencia (benchmark UX/visualización).](configuradores_3d_4.jpg)

Resultados esperados y KPIs:
- Reducción del tiempo de ciclo de reconstrucción y post‑proceso gracias a la preselección inteligente de imágenes y al tuning automático de COLMAP.
- Disminución de fallos de QA (geometría, textura, artefactos) con validación automática en tiempo real y políticas de re‑captura guiada por IA.
- Ahorro en costos de GPU y créditos de API mediante decisiones previas (descartes tempranos) y fallback selectivo a APS según umbrales de coste/latencia.
- Mejora de la consistencia visual inter‑categorías con normalización de iluminación y plantillas de captura por SKU.

Este documento expone la arquitectura propuesta, el mapa de técnicas y evidencias, los módulos con ejemplos de código y APIs, los experimentos A/B necesarios para validar las mejoras y un roadmap de implementación.

---

## Estado del arte (2025): 2D→3D con IA

La evolución reciente del 2D→3D con IA se resume en tres líneas convergentes: (i) integración de aprendizaje profundo en reconstrucción clásica (SfM/MVS); (ii) interpolación de vistas con campos de radiancia neuronales (NeRF) y representación explícita de gaussianas (3DGS); (iii) automatización integral del pipeline, incluyendo normalización de iluminación y validación de calidad.

En SfM/MVS, los avances combinan geometría clásica con componentes neuronales. Deep Bundle Adjustment (DeepSFM) propone una arquitectura física‑dirigida que aproxima volúmenes de coste y refina iterativamente poses y geometría; Visual Geometry Grounded SfM (VGGSfM) refuerza la robustez mediante grounded features y ajustes feature‑métrico; y los trabajos sobre aprendizaje de correspondencias con Graph Attention Networks (GAT) introducen mayor resiliencia a escenarios adversos. Estos enfoques buscan mejorar la precisión y la estabilidad del bundle adjustment (BA) cuando hay ruido, cambios de iluminación o texturas débiles.[^15][^16][^17][^18]

En interpolación de vistas, NeRF sigue siendo el marco conceptual dominante: modela la escena como una función de radiancia que, junto a técnicas como codificación posicional, muestreo volumétrico y regularizaciones específicas (por ejemplo, supervisión de profundidad con COLMAP), permite sintetizar nuevas vistas fotorrealistas. El estado del arte incorpora aceleraciones drásticas (PlenOctree, Instant‑NGP) y extensiones para pocas vistas (DS‑NeRF, pixelNeRF, DietNeRF), así como modelado de materiales (Ref‑NeRF) y escenas ilimitadas (mip‑NeRF 360). En paralelo, 3D Gaussian Splatting (3DGS) ha emergido como una representación explícita de alta eficiencia y calidad visual que renderiza en tiempo real, con mejoras en consistencia multi‑vista, materiales y calidad en condiciones difíciles.[^8][^9][^10][^11][^12]

La Tabla 1 sintetiza una comparativa cualitativa de tecnologías de interpolación de vistas relevantes.

Tabla 1. Comparativa cualitativa de técnicas de interpolación de vistas

| Técnica                 | Requisitos mínimos de entrada               | Calidad visual           | Velocidad (entrenamiento/inferencia) | Madurez en producción | Dependencia de COLMAP |
|------------------------|---------------------------------------------|--------------------------|--------------------------------------|-----------------------|-----------------------|
| NeRF (base)            | Imágenes multi‑vista con poses roughly okay | Fotorrealista            | Lento/Lento                           | Media (research→prod) | Frecuente             |
| DS‑NeRF                | Idem + profundidad escasa de COLMAP         | Superior en pocas vistas | Medio/Medio                           | Media                 | Alta                  |
| Instant‑NGP (NeRF)     | Idem + hardware moderno                     | Alta                      | Rápido/Rápido                          | Creciente             | Baja‑Media            |
| 3DGS                   | Imágenes multi‑vista (poses colapsadas)     | Muy alta (tiempo real)   | Medio/Tiempo real                      | Alta (2025)           | Opcional              |
| 3DGS + Refinamiento    | Idem + estrategias de consistencia          | Alta                      | Medio/ Tiempo real                     | Alta                  | Opcional              |

Notas: “Dependencia de COLMAP” se refiere al uso de poses/profundidad de COLMAP para acelerar o estabilizar el entrenamiento. Las calidades y velocidades son cualitativas según la literatura y repositorios públicos.[^8][^9][^10][^11][^12]

En los apartados siguientes se desarrolla cómo estas tecnologías se integran en un pipeline industrial orientado a retail de lujo, con especial atención a la consistencia material, la estabilidad temporal y la reproducibilidad.

---

## Arquitectura del pipeline inteligente 2D→3D

La arquitectura propuesta se organiza en módulos acoplados débilmente, intercambiables y con telemetría exhaustiva, para habilitar decisiones IA previas al procesamiento, generación sintética de vistas, normalización de iluminación, reconstrucción híbrida COLMAP/APS, optimización de activos y validación automática.

![Componentes principales del sistema (analogía con componentes de reloj).](componentes_relojes_9.jpg)

Módulos y flujo
- Ingesta y QC inicial. Validación técnica de imágenes (resolución, exposición, desenfoque, ruido), metadatos de cámara, guía de captura cumplimentada y checksum de duplicados.
- IA de decisión previa. Predictor de calidad de reconstrucción y ranking/selección de imágenes; recomendación de pasos de captura adicionales.
- Interpolación de vistas. Entrenamiento selectivo de NeRF/3DGS para ángulos faltantes críticos (con poses de COLMAP), con políticas para activación condicional.
- Normalización de iluminación (ALN) y eliminación de sombras. Preprocesamiento de imágenes para reducir variabilidad lumínica, con técnicas sin máscara (IFBlend) y devignetting según categoría.[^5][^6][^7][^24]
- Reconstrucción 2D→3D. COLMAP (SfM + MVS) como pipeline por defecto con parámetros auto‑optimizados; fallback a APS Reality Capture para picos de carga, SLAs o fallos sistémicos.[^1][^2][^25]
- Optimización y publicación. Transformaciones glTF/GLB con compresión Draco, texturas KTX2, y ajustes PBR; publicación en CDN y versionado semántico.[^3][^13][^14]
- Validación automática y feedback. Métricas 3D (completitud, reproyección, consistencia multi‑vista), reglas de aceptación, re‑captura guiada y logs reproducibles.

Escalado híbrido COLMAP/APS
- Planificador de colas decide la ruta: COLMAP por defecto; APS para:
  - Trabajos con SLA estrictos o ventanas de mantenimiento.
  - Backlog superior a umbrales.
  - Escenas “difíciles” (reflejos complejos,vidrios, metales) donde APS puede ofrecer consistencia a cambio de coste por crédito.
- Orquestación con límites de coste y telemetría por Job (GFLOPs, duración, memoria, créditos).

Trazabilidad
- Cada ejecución registra: configuración, parámetros, dataset, seeds, checkpoints y artefactos; hashes para auditoría y re‑ejecución determinista; panel de observabilidad con métricas clave (KPIs).

La Tabla 2 resume la responsabilidad y contratos de cada módulo.

Tabla 2. Mapa de módulos, responsabilidades, APIs e interfaces

| Módulo                         | Responsabilidad principal                                    | API/Interface                           | Notas de operación                         |
|-------------------------------|---------------------------------------------------------------|-----------------------------------------|--------------------------------------------|
| Ingesta y QC                  | Validar imágenes y metadatos                                  | REST/CLI                                | Reporta BRISQUE, exposición, blur           |
| IA de decisión previa         | Score de reconstrucción y selección de imágenes               | Python/gRPC                             | Modelos de ranking IQA + cobertura          |
| Interpolación de vistas       | Sintetizar vistas faltantes (NeRF/3DGS)                       | Python (training/infer)                 | Activación condicional                      |
| ALN y eliminación de sombras  | Normalizar iluminación y sombras                              | Python (preprocess)                     | IFBlend/devignetting                        |
| Reconstrucción 2D→3D          | COLMAP/APS para SfM+MVS                                       | CLI/REST (APS)                          | Tuning automático + fallback                |
| Optimización y publicación    | glTF/GLB, Draco, KTX2; CDN                                    | CLI (gltf‑transform), SDK               | Versionado semántico                        |
| Validación automática         | Métricas 3D, reglas de aceptación, feedback                   | REST/CLI                                | Generación de informe QA                    |

Referencias técnicas clave: COLMAP (SfM/MVS), APS Reality Capture (API), glTF‑Transform (optimización), Three.js/Babylon.js (visualización web).[^1][^2][^3][^13][^14][^25]

---

## Módulo 1: Predicción de calidad de reconstrucción antes del procesamiento

Objetivo
- Estimar, antes de lanzar una reconstrucción costosa, si un conjunto de imágenes conducirá a una reconstrucción de calidad suficiente. Si la predicción es negativa, se disparan acciones de mejora: capturar más ángulos, ajustar iluminación, re‑tomar tomas con desenfoque/ruido, o saltar temporalmente la reconstrucción.

Señales predictivas y diseño del dataset
- Métricas no‑referencia de calidad de imagen (IQA). BRISQUE (Blind/Referenceless Image Spatial Quality Evaluator) es un estándar sin referencia que utiliza estadísticas de escenas naturales (NSS) y ajustes GGD/AGGD para caracterizar distorsiones. BRISQUE es inverso: menor puntuación implica mejor calidad percibida.[^4][^20][^21][^22]
- Metadatos y histogramas. Exposición, ISO, balance de blancos, rango dinámico; histograma de luminancia y saturación.
- Cobertura angular y diversidad. Entropía de poses, solapamiento estimado, baseline mínimo/máximo, diversidad de puntos de vista.
- Señales SfM tempranas. Resultado de un “mini‑SfM” con pocas imágenes (por ejemplo, 12–20), ratio de inliers, dispersión de puntos clave y consistencia de epipolar.
- Variabilidad lumínica. Desviación estándar de luminancia entre imágenes, evidencia de sombras duras, hotspots o viñeteo (devignetting necesario).

Modelo y entrenamiento
- Etiquetado proxy. Usar métricas posteriores a la reconstrucción como proxy de “ground truth”: completitud de la malla, densidad normalizada de puntos, reproyección media, SSIM/LPIPS entre renders sintéticos y fotos, y una evaluación visual curada (1–5).
- Arquitectura. Clasificador/regresor (XGBoost, LightGBM o una red tabular) que fusiona:
  - Agregados por imagen (BRISQUE, blur, exposición) → estadísticas por conjunto.
  - Features de cobertura angular (entropía/azimut, baseline).
  - Señales mini‑SfM (inliers, error epipolar).
- Curva de decisión. Threshold calibrado sobre el score de calidad para balancear falsos positivos/negativos, con costes asimétricos (coste de re‑captura vs coste de reconstrucción fallida).

Ejemplo de cálculo BRISQUE en Python (OpenCV)
```python
import cv2
import numpy as np
from pathlib import Path

def brisque_score(image_bgr: np.ndarray) -> float:
    # BRISQUE en OpenCV: menor score => mejor calidad
    q = cv2.quality.QualityBRISQUE.create(cv2.quality.QualityBRISQUE.
                                          PRETRAINED_MODEL_RETHINKS)
    try:
        score = q.score(image_bgr)  # float
    finally:
        q.clear()
    return score

# Uso
img = cv2.imread("frame_0042.jpg")
score = brisque_score(img)
print("BRISQUE:", score)
```

Política operativa
- Si la media/mediana de BRISQUE en el set supera el umbral, o la variabilidad lumínica es alta, se recomienda recollect o aplicar ALN; si la cobertura angular es insuficiente, se propone un patrón de captura compensatorio (ver Módulo 5).

Tabla 3. Señales predictivas, extracción y herramientas

| Señal                           | Extracción                                         | Herramienta/Referencia     |
|--------------------------------|----------------------------------------------------|----------------------------|
| BRISQUE por imagen             | NSS + GGD/AGGD                                     | OpenCV QualityBRISQUE [^20][^21][^22] |
| Exposición/ISO/WB              | EXIF/histograma                                    | Librerías EXIF             |
| Cobertura angular              | Entropía de poses, baseline                        | Mini‑SfM con COLMAP [^1]   |
| Mini‑SfM inliers/ratio         | Feature matching y estimación esencial             | COLMAP (mini) [^1]         |
| Variabilidad lumínica          | Desv. estándar luminancia, hotspots, sombras       | ALN/Shadow tools [^5][^7]  |

Tabla 4. Ejemplo de esquema de etiquetado proxy

| Métrica post‑reconstrucción                   | Definición breve                              | Uso en label |
|----------------------------------------------|-----------------------------------------------|--------------|
| Completitud de malla                         | % de área/ voxels cubiertos vs参考            | Binaria/Reg. |
| Densidad de puntos normalizada               | Puntos/mm² ajustado por escala                | Regresión    |
| Reproyección media                           | Error medio en píxeles                        | Regresión    |
| SSIM/LPIPS en renders sintéticos             | Similaridad perceptual                        | Regresión    |
| QA visual curada (1–5)                       | Revisor humano                                | Clasificación|

Referencia nuclear: tutorial y API de BRISQUE en OpenCV para implementación robusta.[^4][^20][^21][^22]

---

## Módulo 2: Selección automática de mejores imágenes

Criterios de calidad y diversidad
- Criterios individuales: desenfoque (varianza del Laplaciano), ruido (estimación de sigma), sobreexposición/ subexposición (porcentaje de píxeles quemados/clipped), uniformidad de fondo (textura de fondo), BRISQUE global, reflejos especulares (categorías metálicas/vidrio).
- Criterios de conjunto: redundancia y solapamiento, cobertura angular balanceada, baseline suficiente para la stereo, evitar seriales casi duplicadas.

Pipeline práctico
1. Scoring individual. Calcular BRISQUE, blur y exposición por imagen; generar score compuesto.
2. Clustering de puntos de vista. Agrupar por proximidad angular (azimut/elevación) para evitar múltiples tomas redundantes.
3. Selección por mezcla. Maximizar una función objetivo que combine calidad individual y diversidad angular hasta alcanzar un presupuesto (por ejemplo, 36–60 imágenes).
4. Sanidad. Excluir frames con artefactos (rolling shutter, motion blur), y penalizar reflejos especulares en metales.

Ejemplo: cálculo de desenfoque con OpenCV
```python
import cv2
import numpy as np

def laplacian_blur_score(gray: np.ndarray) -> float:
    # Varianza del Laplaciano: valores bajos => más desenfocado
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())

img = cv2.imread("frame_0042.jpg", cv2.IMREAD_GRAYSCALE)
blur_score = laplacian_blur_score(img)
print("Blur score:", blur_score)
```

Ejemplo: ranking simple por calidad y exposición
```python
import numpy as np

def composite_score(brisque, blur, overexp):
    # Normalizaciones simples y pesos (ajustar por categoría)
    s = (-brisque / 100.0) + (np.clip(blur, 0, 500) / 500.0) - (overexp / 100.0)
    return s

overexp = 3.4  # % de píxeles sobreexpuestos
score = composite_score(brisque=30.0, blur=240.0, overexp=overexp)
print("Composite score:", score)
```

Tabla 5. Métricas y umbrales recomendados

| Métrica                 | Criterio operacional                                     | Acción si falla               |
|------------------------|-----------------------------------------------------------|-------------------------------|
| BRISQUE                | ≤ 30 (ajustar por categoría/material)                     | Recollect o ALN               |
| Varianza del Laplaciano| ≥ umbral por lente/objeto (p.ej. ≥ 120)                   | Recollect o estabilizar       |
| % sobreexposición      | ≤ 5%                                                     | Ajustar luz/diapragma         |
| Cobertura angular      | Entropía/azimut ≥ umbral                                 | Añadir vistas faltantes       |

Tabla 6. Esquema de selección

| Entrada                         | Salida                       | Criterios                           | Pesos (ej.) |
|---------------------------------|------------------------------|-------------------------------------|-------------|
| Imágenes + poses aproximadas    | Subconjunto seleccionado     | Calidad (BRISQUE/blur/exp) + diversidad angular | 0.5/0.3/0.2 |
| Presupuesto (N imágenes)        |                              | Penalización de seriales similares  |             |

Las prácticas de automatización de fotogrametría apoyan estos criterios de evaluación y preselección, minimizando intervención manual.[^27]

---

## Módulo 3: Interpolación de vistas (generación sintética de ángulos faltantes)

Cuándo sintetizar vistas
- Sparsidad angular crítica con riesgo de holes en la malla o geometría inestable.
- Texturas de alta frecuencia con aliasing o surfaces parcialmente occlusas.
- Catálogos con restricciones de captura (tiempo/espacio) donde sintetizar vistas reduce costes vs. capturar más fotos.

Opciones tecnológicas y criterios de elección
- NeRF y variantes: mayor integración con poses/profundidad de COLMAP, excelente calidad cuando el entrenamiento converge; aceleración con Instant‑NGP o representación PlenOctree.
- 3DGS: render en tiempo real, alta calidad visual y consistencia; desarrollos recientes mejoran consistencia de materiales y robustez en escenas reflectantes. 3DGS es especialmente atractivo para vistas de marketing y para previsualizaciones interactivas de alta calidad.[^8][^9][^10][^11][^12]

Política de activación condicional
- Entrenar NeRF/3DGS solo si:
  - La predicción pre‑proceso indica alto riesgo de holes (ver Módulo 1) y el presupuesto de cómputo lo permite, o
  - El mini‑SfM detecta zonas poco observadas y el coste de re‑captura supera el coste de síntesis.
- Integrar en COLMAP: usar poses/profundidad inicial de COLMAP para acelerar el entrenamiento (DS‑NeRF) y reducir ambigüedad de vistas escasas.[^8]

Exportación y fusionado
- Renders de alta calidad desde nuevas cámaras sintéticas.
- Generación de mapas de textura y normales coherentes.
- Validación de consistencia multi‑vista antes de fusionar con la malla SfM/MVS.

Ejemplo: entrenamiento rápido con Instant‑NGP (pseudo‑código)
```python
# El código real depende del framework (Nvida/DVGO/PlenOctree, etc.)
# Se ilustra el flujo de alto nivel.

trainer.fit(
    images=paths,  # rutas a imágenes
    poses=poses_from_colmap,  # poses de COLMAP
    intrinsics=K,  # matriz de intrínsecos
    render_res=(1024, 1024),
    epochs=...,
    use_hash=True,       # Instant‑NGP
    use_depth_prior=True # DS‑NeRF con profundidad COLMAP
)
```

Tabla 7. Comparativa técnica de métodos de interpolación

| Método                 | Calidad visual | Entrenamiento | Renderizado | Integración COLMAP | Casos de uso preferentes           |
|-----------------------|----------------|---------------|------------|--------------------|-----------------------------------|
| NeRF (base)           | Alta           | Lento         | Lento      | Alta               | Integración con priors de profundidad |
| Instant‑NGP           | Alta           | Rápido        | Rápido     | Media              | Prototipado y producción acelerada |
| 3DGS                  | Muy alta       | Medio         | Tiempo real| Opcional           | Vistas marketing, retail interactivo |
| 3DGS refinado         | Muy alta       | Medio         | Tiempo real| Opcional           | Materiales reflectantes, consistencia |

Referencias: survey NeRF, repo 3DGS, avances en consistencia multi‑vista y materiales.[^8][^9][^10][^11][^12]

---

## Módulo 4: Mejora automática de iluminación y sombras

Motivación
- La fotogrametría de productos de lujo involucra metales y vidrios con altos reflejos, donde variaciones de iluminación y sombras degradan la consistencia de textura y color, afectando la reconstrucción. Normalizar la iluminación ambiental (ALN) y reducir sombras sin máscaras explícitas permite un pipeline más robusto y reduce la dependencia de estrictos estudios de iluminación en captura.[^5][^6][^24]

ALN e IFBlend
- La tarea de Ambient Lighting Normalization (ALN) unifica eliminación de sombras y restauración de imagen, integrando dominios espacial y de frecuencia. IFBlend es un baseline SOTA que no requiere máscaras y mejora PSNR/LPIPS en el dataset Ambient6K.[^5][^6]
- IFBlend descompone características en baja y alta frecuencia, las refina con bloques específicos (LFB/HFB) y fusión con atención (WA‑SAM), optimizando L1+SSIM.

Eliminación de sombras sin máscara
- Métodos recientes de eliminación de sombras single‑image basados en aprendizaje profundo ofrecen alternativas sin máscara, con resultados competitivos en benchmarks; técnicas como RASM mejoran la calidad con atención regional.[^7][^23]

Devignetting y ecualización de fondo
- Para categorías con iluminación no uniforme (ej. sectores del producto más cercanos a focos), un transformador de iluminación con selección automática de parámetros puede corregir el viñeteo del fondo o la distribución de intensidad antes de la reconstrucción.[^24]

Integración en el pipeline
- Preprocesamiento opcional o condicional:
  - Activar ALN si la variabilidad lumínica excede umbral.
  - Aplicar eliminación de sombras en sets con sombras duras visibles.
  - Devignetting en imágenes con gradientes sistemáticos del fondo.

Ejemplo: flujo IFBlend (pseudo‑código)
```python
# Dependencias y modelo IFBlend según implementación de referencia
from albumentations import Compose
from model_ifblend import IFBlend

preprocess = Compose([...])  # normalizaciones
model = IFBlend(pretrained=True)

def normalize_lighting(image_bgr):
    # conversión BGR<->RGB si necesario
    x = preprocess(image_bgr)
    y = model(x)  # imagen normalizada sin sombras
    return y
```

Tabla 8. Rendimiento de IFBlend en Ambient6K (extracto)

| Método      | PSNR (↑) | SSIM (↑) | LPIPS (↓) |
|-------------|----------|----------|-----------|
| IFBlend     | 20.714   | 0.810    | 0.122     |
| Restormer   | 20.446   | 0.808    | 0.124     |
| SwinIR      | 20.246   | 0.814    | 0.123     |

Notas: Resultados SOTA en Ambient6K; valores indican margen de mejora respecto a tareas de restauración clásicas.[^5][^6]

Tabla 9. Comparativa de eliminación de sombras (SRD/ISTD/ISTD+; extracto)

| Método           | Requiere máscara | PSNR (↑) | SSIM (↑) | LPIPS (↓) |
|------------------|------------------|----------|----------|-----------|
| IFBlend          | No               | 31.95    | 0.950    | 0.072     |
| ShadowFormer     | No               | 32.38    | 0.955    | –         |
| DCShadowNet      | Sí               | 30.85    | 0.913    | 0.066     |

Valores ilustrativos del resumen del paper ALN; la elección depende de si se dispone de máscara y del tipo de material.[^5][^6][^7][^23]

---

## Módulo 5: Recomendación inteligente de configuraciones de captura

Problema
- Cada categoría de producto (caja de reloj, esfera, correa metálica, cristal de zafiro) requiere patrones de iluminación, distancias, lentes y número de tomas distintos. La IA debe recomendar parámetros de captura y patrones de recorrido para maximizar cobertura y minimizar reflejos especulares.

Características del sistema de recomendación
- Entrada: categoría de producto, tamaño aproximado, reflectividad, entorno (fondo, iluminación disponible), restricciones operativas (tiempo, equipo).
- Salida: plantilla de captura con parámetros (focal, apertura, ISO, tiempo de exposición, patrón de iluminación) y esquema angular sugerido (azimut, elevación, baseline).
- Aprendizaje: a partir de resultados históricos (KPIs de QA 3D y tiempos), refinar recomendaciones por categoría.

Paralelelo con predicción de cobertura
- En fabricación inteligente, redes como 3DSCP‑Net predicen a priori la cobertura de escaneo 3D considerando condiciones reales (inter‑reflexiones, sobreexposición). Este paradigma se traslada a fotogrammetry como “cobertura visual” de imágenes, con predicciones de zonas sub‑observadas y sugerencias automáticas para robustecer el set antes de capturar.[^25]

Plantillas operativas
- Plantilla SKU con:
  - Número mínimo/máximo de imágenes (p.ej., 36–64).
  - Ángulos azimutales uniformemente espaciados y elevations recomendadas (ej., 0°, ±30°).
  - Posición de luces y difusores; evitar hotspots en metales.
  - Consideraciones de lente (p.ej., 50mm en fotogrametría general por su relación escala/distorsión).

Tabla 10. Plantillas recomendadas por categoría (ejemplo)

| Categoría            | Lente          | Iluminación             | N° imágenes | Ángulos clave                         |
|----------------------|----------------|-------------------------|-------------|---------------------------------------|
| Caja metálica        | 50mm prime     | Difusa +fill light      | 48–64       | Azimut 0–330°, elev. 0°, ±30°         |
| Esfera con textura   | 35mm prime     | Suave, sin hotspots     | 36–48       | Azimut 0–315°, elev. 0°, ±20°         |
| Correa metálica      | 50–85mm prime  | Iluminación lateral     | 48–64       | Azimut 0–330°, elev. 0°, ±25°, ±45°   |
| Cristal de zafiro    | 35–50mm        | Luz polarizada opcional | 48–72       | Azimut 0–330°, elev. 0°, ±30°, evitar reflejos |

Referencias: prácticas de fotogrametría, referencia de lente 50mm, y analogía con predicción de cobertura en escaneo 3D.[^19][^25]

---

## Módulo 6: Optimización automática de parámetros de COLMAP con redes neuronales

Mapa de parámetros relevantes
- SfM: detecciones/Descriptores (SIFT, RootSIFT, DSP‑SIFT), normalización de descriptores (L2, RootSIFT), ratio de Lowe, window de matching, verificación geométrica, criterio de triangulación, tipo de BA y tolerancias.
- MVS: opciones de densidad, filtros de profundidad, cost volume, confidencia,修剪 y suavizado.
- BA (Ceres Solver): trust region, dampings, tolerances, max iterations, linear solver (CGNR/DenseSchur).[^1][^25]

Estrategia de tuning automático
- Espacio de búsqueda. Sampling bayesiano (p.ej., TPE) con objetivos compuestos: densidad de puntos, reproyección media, reproducibilidad, tiempo total. Restringir por hardware (memoria GPU).
- Señales tempranas. Inliers de matching, dispersión de claves, ratio de trackeables y estabilidad inicial del BA para prune agresivo de configuraciones sub‑óptimas.
- Bandit/ensembles. Ensembles de configuraciones por categoría (metal, vidrio, textiles) con asignación online basada en early metrics.
- Reproducibilidad. Fijar seeds, registrar parámetros y versions; re‑ejecutar en validación con los mismos flags.

Ejemplo: invocación básica de COLMAP y control de opciones
```bash
# Feature extraction
colmap feature_extractor \
  --database_path=database.db \
  --image_path=./images \
  --ImageReader.camera_model=PINHOLE \
  --SIFT.estimate_scale=true \
  --SIFT.estimate_orientation=true \
  --SIFT.max_num_features=8192

# Feature matching (exhaustivo para sets pequeños/medios)
colmap exhaustive_matcher \
  --database_path=database.db \
  --ExhaustiveMatcher.match_ratio=0.8

# Mapper (SfM incremental)
mkdir -p sparse
colmap mapper \
  --database_path=database.db \
  --image_path=./images \
  --output_path=./sparse \
  --Mapper.ba_global_cycles=4 \
  --Mapper.ba_local_max_iterations=10

# Dense reconstruction (si procede)
mkdir -p dense
colmap image_undistorter \
  --image_path=./images \
  --input_path=./sparse/0 \
  --output_path=dense \
  --output_type= COLMAP
colmap patch_match_stereo \
  --workspace_path=dense \
  --workspace_format=COLMAP
colmap stereo_fusion \
  --workspace_path=dense \
  --output_path=dense/fused.ply
```
Consultar el inventario de parámetros y su impacto en el repositorio de referencia “colmap‑parameters”.[^25]

Tabla 11. Parámetros clave y su impacto (extracto)

| Parámetro                      | Etapa | Impacto esperado                                  | Riesgo/Trade‑off                   |
|--------------------------------|-------|---------------------------------------------------|------------------------------------|
| SIFT.max_num_features          | SfM   | Mejora matching en baja textura                   | Más tiempo de extracción           |
| ExhaustiveMatcher.match_ratio  | SfM   | Control de falsos positivos                       | Menos matches si muy estricto      |
| Mapper.ba_*                    | SfM   | Convergencia y precisión del BA                   | Tiempo y riesgo de sobreajuste     |
| PatchMatch options             | MVS   | Densidad/coherencia de profundidad                | Memoria GPU                        |
| Ceres linear solver            | BA    | Estabilidad y velocidad                           | Memoria y numerics                 |

Referencia técnica de parámetros y opciones de Ceres Solver en BA.[^25]

---

## Módulo 7: Validación de calidad en tiempo real

Métricas 2D/3D automatizadas
- 2D: BRISQUE, SSIM/LPIPS entre renders sintéticos y fotos, conteo de outliers de exposición.
- 3D: completitud (cobertura de superficie), consistencia multi‑vista (proyección de texturas), reproyección media, uniformidad de malla, artefactos (holes, floaters), rough/sharpness textura estimado.
- Señales tempranas del mapper: tracking ratio, inlier ratio, estabilidad del BA.

Dashboards y criterios de aceptación
- Umbrales por categoría. Metales: penalización alta de artefactos especulares; vidrios: control de holes y distorsión; textiles: preservación de microtextura.
- Criterios binarios por métrica con hysteresis para evitar rebotes.

Feedback a captura
- Si QA falla por cobertura angular → sugerir vistas faltantes específicas (azimut/elevación).
- Si QA falla por iluminación → sugerir ajuste de luz/difusores y activar ALN.

Ejemplo: validación SSIM/LPIPS entre render y foto
```python
import torch
from torchmetrics.image import SSIM, LPIPS

def metrics_2d(render_bgr, photo_bgr):
    x = torch.from_numpy(render_bgr).permute(2,0,1).float()[None]/255.0
    y = torch.from_numpy(photo_bgr).permute(2,0,1).float()[None]/255.0
    ssim = SSIM(data_range=1.0)(x, y)
    lpips = LPIPS()(x, y)
    return float(ssim), float(lpips)

# Umbrales típicos (ajustar por categoría)
# SSIM >= 0.85; LPIPS <= 0.12 (ejemplo)
```

Tabla 12. Métricas y umbrales de aceptación (ejemplo)

| Métrica                  | Categoría metálica | Categoría vidrio | Textiles |
|--------------------------|--------------------|------------------|----------|
| BRISQUE (media set)      | ≤ 28               | ≤ 30             | ≤ 30     |
| SSIM (render vs foto)    | ≥ 0.86             | ≥ 0.84           | ≥ 0.85   |
| LPIPS                    | ≤ 0.12             | ≤ 0.14           | ≤ 0.12   |
| Reproyección media (px)  | ≤ 1.2              | ≤ 1.4            | ≤ 1.2    |
| Holes en malla           | 0容忍              | ≤ 0.2% área      | ≤ 0.1%   |

Tabla 13. Mapa de acciones correctivas

| Fallo detectado                 | Acción sugerida                                  |
|---------------------------------|--------------------------------------------------|
| Cobertura angular insuficiente  | Añadir vistas en azimut/elevación específicos    |
| Iluminación no uniforme         | Reposicionar luces/activar ALN                   |
| Desenfoque/espigo               | Recollect con trípode/estabilización             |
| Artefactos especulares          | Usar polarización/luz difusa; ALN                |

La normalización de iluminación y la eliminación de sombras impactan directamente estas métricas; una evaluación conjunta con ALN y renderizado de alta fidelidad mejora la fiabilidad de la validación.[^5][^7]

---

## APIs y ejemplos de integración

- APS Reality Capture (Autodesk). Envía imágenes y parámetros de captura; recibe modelo 3D procesado; soporta colas y webhooks para eventos. Utilizarlo como fallback cuando el backlog o SLAs lo exijan.[^2]
- OpenCV IQA (BRISQUE). Calcular BRISQUE por imagen; integrar en QC inicial y pre‑selección. Documentación y API oficial disponible.[^20][^21][^22]
- glTF‑Transform. Optimizar GLB: compresión Draco, normalización de texturas, KTX2; automatizable desde CLI o API Python.[^3]
- Visualización web. Carga eficiente de GLB optimizados en Three.js o Babylon.js; considerar PBR e iluminación HDRI para realism en retail de lujo.[^13][^14]

Ejemplo: optimización de GLB con glTF‑Transform (CLI)
```bash
gltf-transform copy input.glb output.glb
gltf-transform draco output.glb output_draco.glb --optLevel 8
gltf-transform texture-transform output_draco.glb output_final.glb \
  --texture allocator --resize 4096
```

Ejemplo: carga en Three.js (ESM)
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
camera.position.set(0, 0, 3);

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('/decoders/'); // ruta a decoders Draco
loader.setDRACOLoader(draco);

loader.load('/assets/modelo_draco.glb', (gltf) => {
  scene.add(gltf.scene);
  renderer.setSize(w, h);
  document.body.appendChild(renderer.domElement);
  renderer.render(scene, camera);
});
```

Tabla 14. Matriz de integración de APIs

| Servicio                | Endpoint/Interface         | Input                               | Output                         | Costes/Límites            |
|-------------------------|----------------------------|-------------------------------------|--------------------------------|---------------------------|
| APS Reality Capture     | REST (webhooks)            | Imágenes + metadatos                | Modelo 3D + logs               | Por crédito               |
| OpenCV QualityBRISQUE   | Python/C++ API             | Imagen BGR                          | Score BRISQUE                  | OSS                       |
| glTF‑Transform          | CLI/Python SDK             | GLB/gltf                            | GLB optimizado                 | OSS                       |
| Three.js/Babylon.js     | JS API                     | GLB/GLTF                            | Render interactivo             | OSS                       |

---

## Roadmap de implementación y validación

Fase 1 (POC, 4–6 semanas)
- Objetivos: validar predicción de calidad pre‑proceso y preselección de imágenes; benchmark de NeRF/3DGS para interpolación condicional; baseline COLMAP con tuning mínimo; validación de ALN en sets problemáticos.
- Experimentos:
  - A/B: pipeline sin/ con predicción de calidad y preselección; medir ahorro de GPU/time y tasa de fallos.
  - Interpolación: comparativa Instant‑NGP vs 3DGS en una categoría reflectante.
  - ALN: evaluar mejora en SSIM/LPIPS y tasas de aprobación QA.
- Entregables: reporte de métricas, panel de observabilidad básico, scripts de integración.

Fase 2 (MVP, 8–12 semanas)
- Objetivos: orquestación de colas con fallback APS; plantillas de captura por SKU; validación automática 3D y feedback a captura; optimización de publicación GLB/Draco/KTX2 en CDN.
- Experimentos:
  - Costo/latencia: COLMAP vs APS bajo carga; calibración de umbrales de fallback.
  - QA en tiempo real: calibración de umbrales por categoría (metales/vidrios/textiles).
- Entregables: API de orquestación, dashboards, documentación de guías de captura, CDN configurada.

Fase 3 (Escalado, continuo)
- Objetivos: tuning automático avanzado de COLMAP por categoría; ensembles de configuraciones con bandit; extensiones 3DGS con materiales (consistencia multi‑vista); gobierno de costos.
- Experimentos:
  - Multivariado: densidad de puntos vs tiempo vs reproducibilidad; sensibilidad a parámetros MVS.
  - Robustez: reproducción de resultados con seeds y versionado.
- Entregables: catálogo expandido, gobierno de costos y SLOs.

Tabla 15. Plan de experimentos A/B (extracto)

| Hipótesis                                         | Variante A            | Variante B                           | KPI principal                 | Tamaño efecto esperado | Criterio de éxito              |
|---------------------------------------------------|-----------------------|--------------------------------------|-------------------------------|------------------------|---------------------------------|
| Preselección reduce tiempo sin pérdida de calidad | Sin preselección      | Con preselección (BRISQUE+diversidad)| Tiempo total reconstrucción   | −20%                   | ΔQA ≤ 1% y ahorro ≥ 15%        |
| ALN mejora aprobación QA                          | Sin ALN               | ALN en imágenes con variabilidad     | Tasa de aprobación QA         | +5–10 pp               | p‑value < 0.05                  |
| Tuning COLMAP mejora densidad puntos              | Default params        | Tuning bayesiano                     | Densidad puntos normalizada   | +10–15%                | Δreproyección ≤ 0.2 px          |
| 3DGS acelera marketing views vs NeRF             | Instant‑NGP           | 3DGS refinado                        | Tiempo a vista interactiva    | −30–50%                | QA visual igual o superior      |

Gobernanza
- Auditoría de datasets y reproducibilidad: hashing, versionado, semillas.
- Control de costes: límites de cómputo por Job, alertas por créditos APS, budget por categoría.

Referencias para planificación técnica: COLMAP para POC/MVP, APS como fallback, glTF‑Transform para publicación, interpolación NeRF/3DGS como capacidades diferenciales.[^1][^2][^3][^8]

---

## Anexos: datasets, métricas y telemetría

Datasets internos
- Capturas curadas por SKU con etiquetas de QA post‑reconstrucción (completitud, reproyección, SSIM/LPIPS).
- Metadatos: cámara, lente, exposición, iluminación, poses estimadas, tiempos de procesamiento.
- Versionado: semántico por categoría (v1.2, v1.3…).

Métricas
- 2D: BRISQUE (sin referencia), SSIM/LPIPS en renders.
- 3D: densidad de puntos, cobertura, reproyección, consistencia multi‑vista, conteo de holes y artefactos.
- Operativas: tiempo, GFLOPs, memoria, créditos APS.

Dashboard y telemetría
- Tiempo por etapa, colas, ratio de fallback, tasas de aprobación.
- Alertas por variabilidad de calidad por lote/sesión.

Tabla 16. Diccionario de métricas (extracto)

| Nombre             | Definición                                | Rango | Frecuencia | Fuente           | Uso en decisiones              |
|--------------------|--------------------------------------------|-------|------------|------------------|-------------------------------|
| BRISQUE.mean       | Media de BRISQUE por set                   | 0–100 | Cada set   | OpenCV           | Descartes/ALN                 |
| SSIM.render_photo  | SSIM entre render sintético y foto         | 0–1   | Cada set   | PyTorch metrics  | QA visual                     |
| Reproj.mean        | Error medio de reproyección (px)           | ≥0    | Cada reconstrucción | COLMAP     | Aceptación QA                 |
| Densidad puntos    | Puntos normalizados por área/volumen       | ≥0    | Cada reconstrucción | COLMAP/Post | Tuning COLMAP                |
| Tiempo total       | Ingesta→publicación (min)                  | ≥0    | Cada Job   | Orquestador      | Coste y SLA                   |

Referencias: BRISQUE en OpenCV, survey NeRF, prácticas de evaluación fotogramétrica.[^22][^8]

---

## Gaps de información y próximos pasos

- Métricas cuantitativas de predicción de calidad específicas para fotogrametría (antes de procesar) con datasets públicos: se requieren experimentos internos y curado de etiquetas proxy.
- Código abierto listo para producción de ALN (Ambient Lighting Normalization) e IFBlend: integrar librerías de referencia y validar tiempos de inferencia y efectos en QA.
- Dataset propio de relojes para entrenar modelos de recomendación de captura y validación continua: recopilación y etiquetado por categoría.
- Guías de tuning automático de COLMAP con redes neuronales: investigar abordajes híbridos y ensembles por categoría; consolidar listas de parámetros y espacios de búsqueda con evidencia experimental.
- Definición de umbrales por categoría (metales, vidrios, textiles) para validación automática: calibración por A/B y paneles de observabilidad.

---

## Referencias

[^1]: COLMAP - Structure-from-Motion and Multi-View Stereo. https://github.com/colmap/colmap  
[^2]: Autodesk Platform Services (APS) - Reality Capture API. https://aps.autodesk.com/en/docs/reality-capture/v1/overview/introduction/  
[^3]: glTF-Transform - Documentation. https://gltf-transform.dev/  
[^4]: Image Quality Assessment: BRISQUE - LearnOpenCV. https://learnopencv.com/image-quality-assessment-brisque/  
[^5]: Towards Image Ambient Lighting Normalization (ALN) - arXiv (2024). https://arxiv.org/html/2403.18730v1  
[^6]: Towards Image Ambient Lighting Normalization (ECCV 2024) - PDF. https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/08915.pdf  
[^7]: Single-Image Shadow Removal Using Deep Learning - arXiv (2024). https://arxiv.org/html/2407.08865v1  
[^8]: NeRF: Neural Radiance Field in 3D Vision - Comprehensive Review (2025). https://arxiv.org/html/2210.00379v7  
[^9]: 3D Gaussian Splatting - graphdeco-inria. https://github.com/graphdeco-inria/gaussian-splatting  
[^10]: Enhancing Unbounded 3D Gaussian Splatting with View-consistent Reflections - NeurIPS 2024. https://proceedings.neurips.cc/paper_files/paper/2024/file/f0b42291ddab77dcb2ef8a3488301b62-Paper-Conference.pdf  
[^11]: Self-Ensembling Gaussian Splatting for Few-Shot Novel View Synthesis - ICCV 2025. https://openaccess.thecvf.com/content/ICCV2025/papers/Zhao_Self-Ensembling_Gaussian_Splatting_for_Few-Shot_Novel_View_Synthesis_ICCV_2025_paper.pdf  
[^12]: Awesome 3D Gaussian Splatting - Paper List. https://mrnerf.github.io/awesome-3D-gaussian-splatting/  
[^13]: Three.js - JavaScript 3D Library. https://threejs.org/  
[^14]: Babylon.js - Web-based 3D. https://www.babylonjs.com/  
[^15]: DeepSFM: Structure From Motion Via Deep Bundle Adjustment (ECCV 2020). https://www.ecva.net/papers/eccv_2020/papers_ECCV/papers/123460222.pdf  
[^16]: VGGSfM: Visual Geometry Grounded Deep Structure From Motion (CVPR 2024). https://openaccess.thecvf.com/content/CVPR2024/papers/Wang_VGGSfM_Visual_Geometry_Grounded_Deep_Structure_From_Motion_CVPR_2024_paper.pdf  
[^17]: Learning Structure-from-Motion with Graph Attention Networks (CVPR 2024). https://openaccess.thecvf.com/content/CVPR2024/papers/Brynte_Learning_Structure-from-Motion_with_Graph_Attention_Networks_CVPR_2024_paper.pdf  
[^18]: Robust Incremental Structure-from-Motion with Hybrid Features (2024). https://demuc.de/papers/liu2024hybrid.pdf  
[^19]: Best photogrammetry camera 2024? - Reddit (nota sobre 50mm prime). https://www.reddit.com/r/photogrammetry/comments/1ggphlp/best_photogrammetry_camera_2024/  
[^20]: OpenCV: cv::quality::QualityBRISQUE Class Reference. https://docs.opencv.org/4.x/d8/d99/classcv_1_1quality_1_1QualityBRISQUE.html  
[^21]: BRISQUE (PyPI) - brisque-opencv. https://pypi.org/project/brisque-opencv/  
[^22]: BRISQUE: Blind/Referenceless Image Spatial Quality Evaluator. https://quality.nfdi4ing.de/en/latest/image_quality/BRISQUE.html  
[^23]: RASM: Regional Attention For Shadow Removal (ACM MM'24) - GitHub. https://github.com/CalcuLuUus/RASM  
[^24]: A deep learning-based illumination transform for devignetting (Image and Vision Computing, 2024). https://www.sciencedirect.com/science/article/abs/pii/S026288562400012X  
[^25]: COLMAP Parameters and Options - GitHub. https://github.com/mwtarnowski/colmap-parameters  
[^26]: Automation Strategies for the Photogrammetric Reconstruction of ... (2023). https://link.springer.com/article/10.1007/s41064-023-00244-0  
[^27]: Machine learning-based optimization of photogrammetric JRC ... (Nature, 2024). https://www.nature.com/articles/s41598-024-77054-w  
[^28]: Machine learning-based 3D scan coverage prediction for smart manufacturing (2024). https://www.sciencedirect.com/science/article/abs/pii/S0010448524001027  
[^29]: Ceres Solver: Non-linear Least Squares Solver Options. http://ceres-solver.org/nnls_solving.html#_CPPv4N5ceres6Solver7OptionsE
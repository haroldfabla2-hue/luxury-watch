# Blueprint estratégico del informe
Estrategias avanzadas de IA para un pipeline 2D→3D inteligente y eficiente (2025)

## Resumen ejecutivo y narrativa estratégica

La fotogrametría industrial y de producto ha madurado hasta el punto de poder transformar colecciones extensas de imágenes en activos 3D listos para web con alta fidelidad visual. Sin embargo, el coste y la calidad siguen condicionados por la heterogeneidad de las capturas, la sensibilidad a la iluminación y la naturaleza iterativa de los flujos de trabajo. El objetivo de este blueprint es construir un pipeline 2D→3D inteligente y eficiente, capaz de predecir la calidad antes de procesar, seleccionar imágenes de forma automática, sintetizar vistas faltantes con campos de radiancia neuronales o Gaussian Splatting 3D, normalizar la iluminación ambiental, recomendar configuraciones de captura por categoría, auto‑ajustar parámetros del motor de reconstrucción y validar la calidad en tiempo real. Todo ello debe orquestarse con un diseño pragmático que combine control local (COLMAP) y escalado bajo demanda (APS), y que culmine en activos glTF/GLB optimizados para web con renderizado PBR en Three.js o Babylon.js.[^1][^2][^3][^13][^14]

Para enmarcar el estándar de experiencia visual al que aspiramos, conviene observar los configuradores 3D de referencia en retail. Aunque su fortaleza radica en la interacción y la calidad de render, suelen operar con catálogos cerrados y activos predefinidos. Nuestra ventaja es metodológica: automatizamos la generación de esos activos desde fotografía, lo que nos permite ampliar la personalización de forma dinámica y acelerar la rotación de producto. El reto es técnico: que la automatización no sacrifique el detalle en metales, vidrios y texturas finas que demandan los clientes de lujo. Por ello, la normalización de iluminación, la interpolación de vistas con consistencia multi‑vista y el tuning automático de parámetros del reconstructor (COLMAP) son palancas centrales.

![Configurador 3D de referencia: calidad de render y experiencia de usuario.](configuradores_3d_4.jpg)

Tres hallazgos guían la estrategia:
- La calidad en fotogrametría depende tanto de las imágenes de entrada como de la robustez del motor y de la optimización de activos. Un predictor de calidad pre‑proceso puede reducir costes evitando reconstrucciones destined to fail, mientras que un módulo de selección inteligente elimina el ruido y maximiza la diversidad angular.
- La interpolación de vistas con NeRF/3DGS acelera el cierre de cobertura y ayuda a estabilizar geometrías difíciles; 3DGS, con avances en consistencia y materiales, se posiciona como el motor idóneo para vistas de marketing y previews interactivos de alta fidelidad.[^8][^9][^10][^11][^12]
- La normalización de iluminación ambiental (ALN) y la eliminación de sombras sin máscara mejoran la consistencia de textura y color, reforzando la robustez del reconstructor y la calidad perceptual del activo final.[^5][^6][^7][^24]

El impacto esperado es triple: reducción de tiempos y costes, mejora de la tasa de aprobación en QA y escalabilidad del catálogo con consistencia visual por categoría. El roadmap por fases (POC→MVP→Escalado) mitiga riesgos y facilita evidencias cuantitativas antes de industrializar.

## Estado del arte 2D→3D con IA: qué hay y por qué importa

El panorama técnico relevante se articula en tres bloques.

Primero, la integración de aprendizaje profundo en SfM/MVS. DeepSFM inspira su arquitectura en el ajuste de haces tradicional, pero introduce volúmenes de coste y refinamiento iterativo jointly sobre profundidad y poses; VGGSfM refuerza la geometría explícita con estrategias de aprendizaje que mejoran la robustez; y enfoques con Graph Attention Networks (GAT) buscan correspondencias más consistentes en escenas con baja textura. Esta línea de trabajo apunta a pipelines más robustos y precisos en presencia de iluminación no trivial y materiales reflectantes.[^15][^16][^17][^18]

Segundo, los avances en interpolación de vistas. NeRF modela la escena como un campo de radiancia aprendizaje‑inducido y, con variantes que incorporan supervisión de profundidad (DS‑NeRF), anti‑aliasing (mip‑NeRF), modelado de materiales (Ref‑NeRF) y aceleración extrema (Instant‑NGP, PlenOctree), cubre desde prototipado hasta producción. La evolución más reciente, 3D Gaussian Splatting (3DGS), ha demostrado capacidad de renderizado en tiempo real con calidad visual sobresaliente; refinamientos en consistencia multi‑vista y materiales permiten su uso en escenarios reflectantes y en vistas de marketing donde la interacción exige latencias muy bajas.[^8][^9][^10][^11][^12]

Tercero, la normalización de iluminación y eliminación de sombras como preprocesamiento de propósito general. Ambient Lighting Normalization (ALN) unifica restauración y eliminación de sombras, proponiendo un benchmark (Ambient6K) y un baseline (IFBlend) sin necesidad de máscaras. Métodos como RASM complementan con atención regional. En paralelo, técnicas de devignetting ajustado con deep learning abordan la iluminación desigual del fondo. Estas capacidades mejoran la estabilidad del matching y la consistencia del color en materiales críticos.[^5][^6][^7][^23][^24]

Para ilustrar el rendimiento relativo, la Tabla 1 compara cualitativamente NeRF y 3DGS, y destaca el rol de COLMAP en la preparación de poses/profundidad.

Tabla 1. Comparativa cualitativa de técnicas de interpolación de vistas

| Técnica           | Requisitos de entrada          | Calidad visual         | Velocidad                 | Observaciones clave                           |
|-------------------|--------------------------------|------------------------|---------------------------|-----------------------------------------------|
| NeRF (base)       | Imágenes multi‑vista + poses    | Muy alta               | Lento a medio            | Requiere buenas poses; training por escena    |
| Instant‑NGP       | Idem                           | Alta                   | Rápido (segundos/minutos)| Acelera entrenamiento e inferencia            |
| DS‑NeRF           | Idem + profundidad COLMAP      | Alta en pocas vistas   | Medio                    | Menor dependencia de vistas densas            |
| 3DGS              | Imágenes multi‑vista           | Muy alta               | Tiempo real              | Calidad visual, interacción fluida            |
| 3DGS (refinado)   | Idem                           | Muy alta               | Tiempo real              | Consistencia multi‑vista y materiales         |

Las técnicas anteriores deben integrarse de forma modular con COLMAP, que sigue siendo el estándar para estimación de poses y reconstrucción densa.[^1][^8][^9][^10][^11][^12]

## Arquitectura del pipeline inteligente 2D→3D: cómo encajan las piezas

La arquitectura se organiza en módulos acoplados por interfaces claras y telemetría exhaustiva, con decisiones basadas en datos antes de iniciar procesos costosos. La Figura 2 muestra los componentes principales, que abarcan desde la ingesta y predicción de calidad hasta la optimización y publicación del activo.

![Componentes del sistema: analogía con componentes de reloj (modularidad y precisión).](componentes_relojes_9.jpg)

Módulos y responsabilidades
- Ingesta y QC inicial. Verifica resolución, exposición, desenfoque y ruido. Calcula BRISQUE y otros indicadores técnicos. Valida metadatos de cámara y aplica sanity checks (duplicados, outliers).
- IA de decisión previa. Combina métricas 2D (BRISQUE), señales SfM tempranas (mini‑SfM), cobertura angular y diversidad para estimar el score de reconstrucción. Si el score cae por debajo del umbral, se dispara un bucle de mejora (más capturas, ALN, recollect).
- Interpolación de vistas. Activa NeRF/3DGS condicionalmente cuando el set adolece de vistas clave. Emplea poses/profundidad de COLMAP (DS‑NeRF) para acelerar y estabilizar el entrenamiento; selecciona 3DGS cuando la latencia de previsualización es crítica.
- ALN y eliminación de sombras. Aplica IFBlend u otros métodos sin máscara cuando detecta variabilidad lumínica; corrige devignetting en fondos. El objetivo es reducir artefactos en matching y mejorar la consistencia perceptual.
- Reconstrucción 2D→3D. Usa COLMAP por defecto con tuning automático; en picos de carga o requerimientos SLA, deriva a APS Reality Capture. La ruta se decide en el planificador de colas con telemetría de costes y latencia.
- Optimización y publicación. Convierte a glTF/GLB, aplica compresión Draco y texturas KTX2, ajusta PBR y publica en CDN. Three.js/Babylon.js aseguran renderizado de alta calidad en la web.[^1][^2][^3][^13][^14]
- Validación y observabilidad. Calcula métricas 2D/3D en tiempo real, aplica reglas de aceptación por categoría y genera feedback operativo (ajustes de iluminación, capturas adicionales).

Tabla 2. Mapa de módulos, responsabilidades, APIs e interfaces

| Módulo                         | Responsabilidad                             | API/Interface                     |
|-------------------------------|---------------------------------------------|-----------------------------------|
| Ingesta y QC                  | Validación técnica y metadatos               | REST/CLI                          |
| IA de decisión previa         | Score y preselección de imágenes            | Python/gRPC                       |
| Interpolación de vistas       | Síntesis de vistas faltantes (NeRF/3DGS)    | Python (entrenamiento/inferencia) |
| ALN y eliminación de sombras  | Normalización de iluminación y sombras      | Python (preproceso)               |
| Reconstrucción 2D→3D          | SfM/MVS con COLMAP/APS                      | CLI/REST                          |
| Optimización y publicación    | glTF/GLB, Draco, KTX2, CDN                  | CLI/SDK                           |
| Validación y observabilidad   | Métricas 2D/3D y feedback                   | REST/CLI                          |

Esta arquitectura aprovecha el carácter general de COLMAP (SfM/MVS), la escalabilidad de APS cuando se necesita, la flexibilidad de glTF‑Transform y la madurez de los motores web para visualización.[^1][^2][^3][^13][^14]

## Predicción de calidad antes del procesamiento: señales, modelos, umbralización

Anticipar si un set de imágenes producirá una buena reconstrucción reduce costes, acorta tiempos y evita frustración operativa. El diseño del módulo combina tres familias de señales:

- Calidad 2D. BRISQUE como métrica sin referencia consolidada; medidas de desenfoque (varianza del Laplaciano), ruido, sobreexposición/subexposición, uniformidad de fondo y reflejos especulares.[^4][^20][^21][^22]
- Cobertura y diversidad. Entropía de poses, baseline, solapamiento estimado y dispersión angular; señales tempranas de un mini‑SfM con un subconjunto representativo.
- Variabilidad lumínica. Desviación estándar de luminancia entre imágenes, hotspots y sombras duras; evidencia de viñeteo o patrones de iluminación inconsistentes.

Modelo y entrenamiento
- Usar un regresor/ clasificador (XGBoost/LightGBM o red tabular) entrenado con un etiquetado proxy basado en métricas post‑reconstrucción (densidad de puntos normalizada, reproyección media, QA visual curada 1–5).
- Curva de decisión con umbral calibrado por categoría, evaluando costes asimétricos (p. ej., coste de re‑captura vs coste de re‑procesar).
- Emisión de recomendaciones: capturar más ángulos, aplicar ALN, recollect en condiciones de iluminación distintas.

Tabla 3. Señales predictivas vs herramienta de extracción

| Señal                    | Herramienta/Referencia                         |
|--------------------------|-------------------------------------------------|
| BRISQUE                  | OpenCV QualityBRISQUE / brisque‑opencv [^20][^21][^22] |
| Desenfoque               | Varianza del Laplaciano (OpenCV)                |
| Ruido                    | Estimación sigma (OpenCV)                       |
| Exposición               | Histograma y EXIF                               |
| Mini‑SfM                 | COLMAP (subconjunto) [^1]                       |
| Variabilidad lumínica    | ALN / Shadow tools [^5][^7]                     |

La métrica BRISQUE es adecuada como indicador perceptual inverso (menor es mejor) y tiene implementación en OpenCV con soporte oficial.[^20][^22] La guía y ejemplos de LearnOpenCV facilitan la adopción con código en Python/C++.[^4]

## Selección automática de mejores imágenes: ranking y cobertura

No todas las imágenes contribuyen por igual a una reconstrucción de alta calidad. Un módulo de selección debe equilibrar calidad técnica y diversidad angular:

Pipeline propuesto
1. Scoring individual. Calcular BRISQUE, desenfoque y exposición por imagen; componer un score.
2. Clustering angular. Agrupar por proximidad azimut/elevación para penalizar redundancias.
3. Selección por diversidad. Aplicar un algoritmo tipo maximin para cubrir el espacio de vistas; garantizar baseline suficiente.
4. Sanidades. Descartar frames con motion blur, rolling shutter o artefactos (reflejos especulares).

Tabla 4. Criterios de calidad e impacto en reconstrucción

| Criterio               | Descripción                               | Impacto principal                   |
|------------------------|-------------------------------------------|-------------------------------------|
| BRISQUE                | Calidad perceptual sin referencia         | Matching estable, menos outliers    |
| Desenfoque             | Varianza del Laplaciano                   | Texturas finas, keypoints robustos  |
| Exposición             | % píxeles quemados/clipped                | Detalles en altas luces/sombras     |
| Uniformidad de fondo   | Textura del fondo                         | Segmentación y limpieza de bordes   |
| Reflejos especulares   | Detección en materiales reflectantes      | Reducción de artefactos especulares |

La automatización de la evaluación y selección es coherente con las prácticas de fotogrametría industrial orientadas a minimizar intervención manual y estandarizar la calidad.[^27]

## Interpolación de vistas: cuándo y cómo sintetizar ángulos faltantes

La síntesis de vistas es útil cuando el conjunto adolece de sparsity angular o cuando la geometría presenta oclusiones parciales. Dos familias tecnológicas destacan:

- NeRF (Neural Radiance Fields). Marco que modela la escena como una función que devuelve color y densidad a partir de coordenadas 3D y dirección de vista; se entrena con pérdidas fotométricas y, con variantes, con supervisión de profundidad (DS‑NeRF) y aceleración (Instant‑NGP). Es ideal cuando se dispone de poses/profundidad de COLMAP y se busca calidad visual y una integración relativamente directa.[^8]
- 3D Gaussian Splatting (3DGS). Representación explícita de gaussianas 3D con renderizado diferenciable en tiempo real; avances recientes mejoran la consistencia de materiales y reducen artefactos en escenas ilimitadas. 3DGS se adapta especialmente bien a vistas de marketing y previews donde latencia y fluidez son críticas.[^9][^10][^11][^12]

Política de activación
- Entrenar NeRF/3DGS cuando el score pre‑proceso identifique riesgo de holes o cuando el coste de nuevas capturas sea mayor que el de síntesis; asegurar consistencia multi‑vista antes de fusionar.

Ejemplo (pseudo‑código) de flujo NeRF con poses COLMAP
```python
trainer.fit(
    images=paths,
    poses=colmap_poses,
    intrinsics=camera_matrix,
    use_depth_prior=True,   # DS‑NeRF: profundidad COLMAP
    render_res=(1024, 1024)
)
```

Tabla 5. Técnicas de interpolación vs requisitos

| Técnica       | Calidad | Entrenamiento | Renderizado | Casos de uso preferentes        |
|---------------|---------|---------------|------------|----------------------------------|
| NeRF          | Alta    | Medio‑lento   | Medio      | Integración con COLMAP, detalle |
| Instant‑NGP   | Alta    | Rápido        | Rápido     | Prototipado acelerado           |
| 3DGS          | Muy alta| Medio         | Tiempo real| Marketing, interacción web       |
| 3DGS (mat.)   | Muy alta| Medio         | Tiempo real| Metales/vidrios reflectantes     |

[^8][^9][^10][^11][^12]

## Mejora automática de iluminación y sombras: ALN y eliminación sin máscara

La iluminación irregular y las sombras degrada el matching y la coherencia de textura, sobre todo en metales y vidrios. Un bloque de ALN (Ambient Lighting Normalization) aborda estas condiciones de forma holística.

Ambient Lighting Normalization (ALN)
- Propone unificar restauración de imagen y eliminación de sombras, integrando representaciones espaciales y de frecuencia. IFBlend es un baseline SOTA que no requiere máscaras y emplea descomposición y fusión de frecuencias, con resultados competitivos en Ambient6K (PSNR≈20.7, SSIM≈0.81, LPIPS≈0.122).[^5][^6]

Eliminación de sombras sin máscara
- Métodos recientes demuestran capacidad de eliminar sombras sin máscaras explícitas, con rendimiento competitivo en datasets como ISTD/ISTD+ y SRD. En particular, IFBlend reporta PSNR 31.95 y SSIM 0.95 en SRD; ShadowFormer alcanza PSNR≈32.38 en SRD.[^5][^7]

Devignetting y normalización de fondo
- Un transformador de iluminación con selección automática de parámetros puede ecualizar fondos y corregir viñeteo, reduciendo gradientes espurios antes del matching.[^24]

Integración en el pipeline
- Activación condicional cuando la variabilidad lumínica supera umbrales o se detectan sombras duras; el bloque ALN opera como preprocesamiento opcional.

Tabla 6. Rendimiento IFBlend vs métodos (extracto)

| Dataset       | Método      | PSNR | SSIM | LPIPS | Requiere máscara |
|---------------|-------------|------|------|-------|------------------|
| Ambient6K     | IFBlend     | 20.714|0.810|0.122  | No               |
| SRD           | IFBlend     | 31.95|0.950|0.072  | No               |
| SRD           | ShadowFormer| 32.38|0.955| –     | No               |

[^5][^6][^7][^24]

## Recomendación inteligente de configuraciones de captura

Para acelerar y estandarizar la captura, un sistema de recomendación aprende plantillas por categoría (caja, bisel, correa metálica, cristal) a partir de resultados históricos y KPIs de QA 3D. Las variables incluyen focal, apertura, ISO, patrón de iluminación y esquema angular, y se alimentan con un paralelismo conceptualmente similar a 3DSCP‑Net, que predice cobertura de escaneo a priori y optimiza la planificación de vistas considerando inter‑reflexiones y sobreexposición.[^25]

Tabla 7. Plantillas de captura por categoría (ejemplo)

| Categoría        | Lente   | Iluminación             | Imágenes | Ángulos sugeridos                          |
|------------------|---------|-------------------------|----------|--------------------------------------------|
| Caja metálica    | 50mm    | Difusa + fill light     | 48–64    | Azimut 0–330°, elev. 0°, ±30°             |
| Esfera texturizada| 35mm   | Suave, sin hotspots     | 36–48    | Azimut 0–315°, elev. 0°, ±20°             |
| Correa metálica  | 50–85mm | Lateral para relieve    | 48–64    | Azimut 0–330°, elev. 0°, ±25°, ±45°       |
| Cristal zafiro   | 35–50mm | Polarizada opcional     | 48–72    | Azimut 0–330°, elev. 0°, ±30° (evitar reflejos) |

Para relojes, la recomendación de lentes de focal fija (p. ej., 50mm) es frecuente por su equilibrio entre escala y distorsión, especialmente en entornos controlados de fotogrametría.[^19][^25]

## Optimización automática de parámetros de COLMAP

El ajuste automático de COLMAP debe enfocarse en las etapas con mayor impacto: extracción de características, matching, verificación geométrica, BA y opciones MVS. Ceres Solver, que subyace al BA, ofrece parámetros para trust region, damping, tolerancias y solucionadores lineales (DenseSchur/CGNR), cuyo tuning incide en la convergencia y reproducibilidad.[^1][^25][^26]

Estrategias recomendadas
- Búsqueda bayesiana guiada por objetivos: densidad de puntos, reproyección media, tiempo total.
- Prune agresivo basado en señales tempranas (inliers, ratio de tracking, estabilidad del BA).
- Bandit/ensembles por categoría (metales, vidrios, textiles).

Ejemplo (CLI) de invocación con opciones ajustables
```bash
colmap feature_extractor \
  --database_path=db.sqlite \
  --image_path=./images \
  --ImageReader.camera_model=PINHOLE \
  --SIFT.max_num_features=8192

colmap exhaustive_matcher \
  --database_path=db.sqlite \
  --ExhaustiveMatcher.match_ratio=0.8

colmap mapper \
  --database_path=db.sqlite \
  --image_path=./images \
  --output_path=./sparse \
  --Mapper.ba_local_max_iterations=10
```
Ver el inventario de parámetros en “COLMAP parameters” para explorar opciones y sus impactos (SIFT, matchers, BA, dense options).[^25]

Tabla 8. Parámetros clave y efecto (extracto)

| Etapa | Parámetro                       | Impacto                 | Trade‑off                       |
|-------|----------------------------------|-------------------------|----------------------------------|
| SfM   | SIFT.max_num_features           | Matching en baja textura| Tiempo de extracción             |
| SfM   | match_ratio                     | Falsos positivos        | Menos matches si demasiado alto  |
| BA    | max_iterations / trust_region   | Convergencia            | Riesgo de sobreajuste            |
| MVS   | dense options                   | Densidad/coherencia     | Memoria GPU                      |

[^1][^25][^26]

## Validación de calidad en tiempo real

El bucle de validación compara métricas 2D (BRISQUE, SSIM/LPIPS) y 3D (cobertura, reproyección, consistencia multi‑vista) y aplica reglas de aceptación por categoría. ALN y eliminación de sombras tienen impacto directo en estas métricas, y su aplicación debe evaluarse con experimentos controlados.

Tabla 9. Métricas y umbrales (ejemplo)

| Métrica             | Metales | Vidrios | Textiles |
|---------------------|---------|---------|----------|
| BRISQUE (media set) | ≤ 28    | ≤ 30    | ≤ 30     |
| SSIM (render/foto)  | ≥ 0.86  | ≥ 0.84  | ≥ 0.85   |
| LPIPS               | ≤ 0.12  | ≤ 0.14  | ≤ 0.12   |
| Reproyección (px)   | ≤ 1.2   | ≤ 1.4   | ≤ 1.2    |

Tabla 10. Acciones correctivas

| Fallo detectado                 | Acción sugerida                         |
|---------------------------------|-----------------------------------------|
| Cobertura angular insuficiente  | Añadir vistas específicas                |
| Iluminación no uniforme         | Reposicionar luces o aplicar ALN        |
| Desenfoque/rolling shutter      | Recollect con estabilización            |
| Artefactos especulares          | Polarización/luz difusa; ALN            |

La validación perceptual se apoya en métricas como SSIM y LPIPS; BRISQUE sigue siendo el estándar sin referencia para preprocesamiento y QA inicial.[^4][^5][^7]

## APIs e integraciones: APS Reality Capture, OpenCV IQA, glTF‑Transform, Three.js/Babylon.js

El flujo debe integrar servicios y librerías probadas:

- APS Reality Capture. API para enviar imágenes y recibir el modelo 3D reconstruido; útil como fallback escalable o para cumplir SLAs. Integración por REST con colas y webhooks.[^2]
- OpenCV IQA (BRISQUE). API oficial para calcular BRISQUE en Python/C++; disponible también el paquete brisque‑opencv en PyPI.[^20][^21][^22]
- glTF‑Transform. CLI y SDK para optimizar GLB: compresión Draco, normalización de texturas, KTX2, y ajustes PBR. Automatizable en pipelines de publicación.[^3]
- Three.js/Babylon.js. Motores web para cargar GLB con Draco y renderizar escenas PBR con HDRI; base para experiencias fluidas en retail.[^13][^14]

Ejemplo (CLI) de optimización con glTF‑Transform
```bash
gltf-transform copy input.glb tmp.glb
gltf-transform draco tmp.glb out_draco.glb --optLevel 8
gltf-transform texture-transform out_draco.glb final.glb \
  --resize 4096
```

Ejemplo (Three.js) de carga GLB optimizado
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('/decoders/');
loader.setDRACOLoader(draco);
loader.load('/assets/modelo.glb', (gltf) => {
  scene.add(gltf.scene);
  renderer.render(scene, camera);
});
```

Tabla 11. Matriz de integración

| Servicio            | Input         | Output        | Notas               |
|---------------------|---------------|---------------|---------------------|
| APS Reality Capture | Imágenes+meta | Modelo 3D     | REST, créditos      |
| OpenCV BRISQUE      | Imagen BGR    | Score BRISQUE | API OSS             |
| glTF‑Transform      | GLB           | GLB optimizado| Draco, KTX2         |
| Three.js/Babylon.js | GLB           | Render web    | PBR, HDRI           |

[^2][^3][^13][^14][^20][^22]

## Roadmap y validación experimental

Un despliegue pragmático requiere validar hipótesis con métricas claras y un plan por fases:

Fase 1 (POC)
- Demostrar predictor de calidad y preselección; probar ALN en sets problemáticos; benchmark NeRF/3DGS para interpolación condicional; baseline COLMAP con tuning mínimo.

Fase 2 (MVP)
- Orquestación de colas con fallback APS; validación automática 3D y feedback; optimización GLB y publicación en CDN; plantillas de captura por SKU.

Fase 3 (Escalado)
- Tuning automático avanzado de COLMAP por categoría; ensembles con bandit; extensiones 3DGS con materiales; gobierno de costes.

Tabla 12. Plan de experimentos A/B (extracto)

| Hipótesis                                   | Variante A     | Variante B              | KPI principal                  | Criterio de éxito               |
|---------------------------------------------|----------------|-------------------------|--------------------------------|---------------------------------|
| Preselección reduce tiempo sin perder calidad| Sin preselección| Con preselección        | Tiempo total reconstrucción    | ΔQA ≤ 1% y ahorro ≥ 15%         |
| ALN mejora aprobación QA                    | Sin ALN        | ALN en sets variables   | Tasa de aprobación QA          | +5–10 pp, p‑valor < 0.05        |
| Tuning mejora densidad puntos               | Default        | Tuning bayesiano        | Densidad puntos normalizada    | +10–15%, Δreproyección ≤ 0.2 px |
| 3DGS acelera marketing views                | Instant‑NGP    | 3DGS refinado           | Tiempo a vista interactiva     | −30–50%, QA visual ≥ baseline   |

[^1][^2][^3][^8]

## Gaps de información y próximos pasos

- Predicción de calidad pre‑proceso con datasets fotogramétricos específicos: faltan métricas públicas; se requiere curación interna y etiquetado proxy.
- Implementación de ALN/IFBlend lista para producción: explorar repositorios y convertir a microservicio con métricas de latencia y calidad.
- Dataset propio de relojes: crear repositorio con metadatos de captura y etiquetas de QA 3D; etiquetado proxy basado en métricas post‑reconstrucción.
- Guías de tuning automático de COLMAP con redes neuronales: desarrollar ensembles por categoría y rutinas de prune temprano.
- Umbrales por categoría para validación automática: calibrar mediante A/B y dashboards.

Estos gaps delimitan el plan de experimentación y las inversiones en datos, modelos y servicios necesarios para alcanzar el nivel de automatización objetivo.

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
[^26]: Ceres Solver: Non-linear Least Squares Solver Options. http://ceres-solver.org/nnls_solving.html#_CPPv4N5ceres6Solver7OptionsE  
[^27]: Automation Strategies for the Photogrammetric Reconstruction of ... (2023). https://link.springer.com/article/10.1007/s41064-023-00244-0  
[^28]: Machine learning-based optimization of photogrammetric JRC ... (Nature, 2024). https://www.nature.com/articles/s41598-024-77054-w  
[^29]: Machine learning-based 3D scan coverage prediction for smart manufacturing (2024). https://www.sciencedirect.com/science/article/abs/pii/S0010448524001027
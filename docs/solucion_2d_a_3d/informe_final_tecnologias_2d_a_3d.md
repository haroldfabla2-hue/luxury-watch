# De imágenes 2D a modelos 3D navegables: evaluación técnica, costos y plan de implementación para configuradores web

## Resumen ejecutivo

Este informe evalúa de manera técnica y estratégica cómo convertir colecciones de imágenes 2D de productos en modelos 3D navegables para su uso en configuradores web. El objetivo es determinar qué camino de reconstrucción 3D produce mallas o activos compatibles con la web, qué calidad se puede esperar, cuáles son los requisitos de infraestructura y cuál es el coste total de propiedad (TCO) para distintos volúmenes de carga. Las conclusiones se dirigen a CTOs, arquitectos de software, PMs técnicos y líderes de I+D.

Existen cuatro familias tecnológicas principales que pueden satisfacer el requerimiento de “imágenes a 3D navegable”: (i) fotogrametría clásica mediante Structure-from-Motion (SfM) y Multi-View Stereo (MVS), (ii) servicios cloud de fotogrametría con API, (iii) técnicas de campos de radiación, en particular 3D Gaussian Splatting (3DGS), que habilitan visuales de alta fidelidad y navegación en tiempo real, y (iv) soluciones comerciales con captura móvil y embebido web. La fotogrametría clásica está madura, es replicable y produce mallas texturizadas estándar (OBJ/PLY/FBX y texturas PBR) listas para su uso en la web con formatos como glTF/GLB. 3DGS, por su parte, ofrece navegación en tiempo real con más de 30 fps a 1080p a partir de entrenamiento sobre salidas SfM, pero requiere una canalización específica y hosting GPU para la inferencia. En el terreno de servicios, Reality Capture API de Autodesk (APS) proporciona un endpoint de fotogrametría en la nube y Luma AI permite generar “escenas interactivas” embebibles optimizadas para web, iOS y Android. Para la entrega web, tres.js (<model-viewer>) y el formato glTF/GLB siguen siendo el estándar de facto.

Recomendaciones rápidas por escenario:
- POC (2–4 semanas): SfM+MVS con COLMAP/OpenMVG para obtener una malla base y textures PBR; viewer en Three.js con GLTFLoader. Complementar con una ruta experimental 3DGS en un subconjunto de productos para evaluar el valor en navegación interactiva.[^2][^5][^15][^18][^20]
- Beta (4–8 semanas): Incorporar APS Reality Capture API como pipeline alternativo con SLA y escalado gestionado; mantener pipeline open-source on-prem GPU. Establecer criterios de aceptación de calidad y publicación (meshcheck).[^12][^13][^14]
- Producción (8–20 semanas): Operación híbrida con “compare-and-select” entre APS y pipeline self-hosted (COLMAP/OpenMVG/OpenMVS, o AliceVision/Meshroom). Añadir Luma AI para productos complejos o con requisitos de marketing/AR. Optimizar entrega (CDN, niveles de detalle).[^21][^23][^25]

Ruta tecnológica en una frase: usar fotogrametría clásica para producir mallas y texturas aptas para web; considerar 3DGS donde la interacción y el realismo visual aporten diferenciación; y aprovechar servicios cloud con API cuando se requiera SLA, escalabilidad y time-to-market.

## Metodología y criterios de evaluación

La evaluación se basa en documentación pública y repositorios oficiales de proyectos OSS de referencia (COLMAP, OpenMVG, AliceVision/Meshroom), especificaciones del formato glTF/GLB, guías de motores 3D para web (three.js y <model-viewer>), especificaciones de APIs comerciales (Autodesk APS Reality Capture, Polycam) y materiales técnicos y académicos sobre 3D Gaussian Splatting (3DGS) y Neural Radiance Fields (NeRF). Se priorizan fuentes verificables y se señalan explícitamente las lagunas de información cuando no existen detalles oficiales.

Para comparar soluciones de reconstrucción se emplean criterios homogéneos: coste (licencias/suscripciones, hosting GPU y storage/CDN), calidad esperada (geometría, texturas, completeness), tiempos de procesamiento y rendimiento, facilidad de integración (formato y entrega web), escalabilidad (concurrencia y cola), lock-in (dependencia de un proveedor) y estado de soporte/API.

Para visualizar el enfoque de evaluación, se propone la siguiente matriz de criterios y pesos por categoría. Estos pesos son orientativos y se han definido para favorecer decisiones prácticas en un contexto de producto.

Tabla 1. Matriz de criterios y pesos

| Criterio                      | Definición breve                                                   | Peso |
|------------------------------|--------------------------------------------------------------------|-----:|
| Coste total (TCO)            | Licencias + GPU + storage/CDN + operación                          | 25%  |
| Calidad geométrica/textural  | Fidelidad del modelo, Artejas, agujeros, texturas                  | 25%  |
| Performance web              | FPS y tiempos de carga en Three.js/<model-viewer>                  | 15%  |
| Facilidad de integración     | Formatos (glTF/GLB), pipeline, tooling                             | 15%  |
| Escalabilidad/SLA            | Capacidad de procesar en lote, APIs y contrato de servicio         | 10%  |
| Lock-in                      | Dependencia de vendor, portabilidad                                | 10%  |

La matriz se apoya en la definición del pipeline SfM/MVS y las propiedades del formato glTF/GLB para web.[^18][^19]

## Panorama tecnológico: de 2D a 3D navegable

Las rutas principales para convertir imágenes 2D en activos 3D navegables son cuatro:

- Fotogrametría clásica (SfM + MVS): reconstruye cámara y geometría a partir de múltiples vistas, produce mallas y texturas, y está soportada por herramientas robustas y reproducibles (COLMAP, OpenMVG, AliceVision).[^2][^5][^20]
- APIs/servicios comerciales: endpoints cloud con coste por operación y SLAs, con mayor control de escalabilidad y gobernanza (APS Reality Capture API).[^13][^14]
- Captura y embebido: aplicaciones móviles para escaneo y servicios que generan escenas interactivas ligeras embebibles (Polycam, Luma AI).[^21][^25]
- Campos de radiación (NeRF/3DGS): representaciones de escena para navegación en tiempo real y síntesis de nuevas vistas, con entrenamiento a partir de datos SfM y despliegue en viewers específicos; excelente calidad visual a costa de requisitos GPU y una canalización distinta a la de mallas PBR.[^29][^30][^31]

A continuación, se presenta un mapa de decisión resumido.

Tabla 2. Mapa de decisión por categoría

| Categoría                         | Coste estimado           | Calidad geométrica | Performance web                 | Integración web              | Escalabilidad/SLA            | Riesgo lock-in |
|----------------------------------|--------------------------|--------------------|---------------------------------|------------------------------|------------------------------|----------------|
| SfM+MVS (OSS)                    | Bajo–Medio (GPU on-prem) | Alta               | Alta (GLB glTF, optimizado)     | Excelente (Three.js/<model-viewer>) | Medio–Alto (queue + autoscaling) | Bajo           |
| SfM+MVS (servicio APS)           | Medio (créditos/GP)      | Alta               | Alta (GLB glTF, optimizado)     | Excelente (Three.js/<model-viewer>) | Alto (API + SLA)             | Medio          |
| Captura/embebido (Polycam/Luma)  | Bajo–Medio               | Variable           | Alta (Luma: ~30 fps, archivos ligeros) | Muy rápida (embebidos)       | Alto (servicio gestionado)   | Alto           |
| 3DGS/NeRF                        | Medio–Alto (GPU training)| Muy alta (visual)  | Muy alta (≥30 fps a 1080p en viewers dedicados) | Requiere pipeline específico | Medio–Alto (entrenamiento batch) | Bajo–Medio     |

Notas: APS Reality Capture API factura por cloud credit y se anunció 1 cloud credit por gigapíxel.[^14] Luma AI publica métricas de rendimiento web y tamaño de archivo para escenas interactivas embebibles.[^25]

### Formatos y estándares de entrega web

La entrega de modelos 3D en web se apoya en glTF/GLB como formato estándar y en viewers como three.js (GLTFLoader) y <model-viewer>. El flujo recomendado en un configurador web es: (1) postprocesar el modelo (decimar, unwrap y bake de texturas PBR), (2) exportar a GLB, (3) cargar con GLTFLoader o <model-viewer>, (4) optimizar (niveles de detalle, compresión, lazy-loading), y (5) entregar vía CDN.[^18][^19][^34][^35]

Tabla 3. Mapa de formatos de salida a destinos web

| Salida/Formato | Compatibilidad nativa web | Ruta típica en viewer             | Observaciones |
|----------------|---------------------------|-----------------------------------|---------------|
| OBJ/PLY/FBX    | Requiere conversión       | Convertir a glTF/GLB              | Usar como intermedio; texturizado posterior |
| GLB/glTF       | Nativa                    | GLTFLoader o <model-viewer>       | Recomendado para PBR y carga eficiente |
| NeRF/3DGS      | No mesh                   | Viewer propio/servicio (p. ej., Luma para escenas) | Realismo y tiempo real; canalización distinta |

## APIs/servicios comerciales con niveles gratuitos o freemium

Existen soluciones consolidadas que permiten acelerar la adopción mediante APIs o embebidos. En esta sección se cubren RealityCapture/RealityScan (tras la transición a un modelo más accesible), Polycam (embebido de capturas) y APS Reality Capture API (endpoint de fotogrametría). Luma AI ofrece escenas interactivas con API para generación en masa y mejores métricas web.

Tabla 4. Comparativa de servicios

| Servicio                 | API/SDK | Nivel gratuito/freemium          | Integración web                    | Calidad percibida | Notas |
|--------------------------|---------|----------------------------------|------------------------------------|-------------------|-------|
| RealityCapture/RealityScan | No API pública unificada | Acceso “Free” bajo umbral de ingresos; suscripción de pago | Exporta mallas/texturas para web (conversión) | Alta              | PPI descontinuado; suscripción o free según ingresos[^15] |
| APS Reality Capture API  | Sí      | No especificado                  | Procesa a mallas texturizadas      | Alta              | Precio por cloud credit; announced 1 credit/GP[^13][^14] |
| Polycam                  | No pública | Freemium en app                  | Embed de capturas en web           | Variable          | Buenas prácticas de captura y embebido[^21][^22][^23] |
| Luma AI                  | Sí (generación en masa) | Acceso web para empezar           | Escenas interactivas (8MB/20MB, ~30 fps) | Muy alta (visual) | Privado por defecto; uso comercial[^25] |
| Skanect                  | No API  | Versión gratuita y Pro           | Exporta modelos a apps/web (vía conversión) | Variable          | Hardware Structure Sensor/Core; no API pública[^26][^27] |

### RealityCapture / RealityScan

Tras el cambio de pricing en 2024, Epic Games hizo más accesible RealityCapture: existe un nivel gratuito para usuarios con ingresos anuales inferiores a 1 millón de dólares y suscripciones para empresas por encima de ese umbral; el modelo “pay-per-input” (PPI) se descontinuó. RealityCapture produce mallas trianguladas estancas y texturas PBR; RealityScan es la aplicación orientada a crear modelos desde imágenes y escáneres láser. La integración web se realiza mediante exportación a formatos estándar y conversión a glTF/GLB.[^15][^16][^17]

Tabla 5. Pricing y elegibilidad (resumen)

| Plan                       | Elegibilidad                          | Precio orientativo | Notas clave |
|---------------------------|---------------------------------------|-------------------|-------------|
| Acceso gratuito           | Ingresos anuales < $1M                | Gratis            | Funcionalidad completa; gobernado por umbral[^15] |
| Suscripción estándar      | Ingresos anuales ≥ $1M                | ~$1,250/asiento/año | Sustituye licencias perpetuas[^15] |
| Bundle Unreal             | Ingresos anuales ≥ $1M                | ~$1,850/asiento/año | Incluye Unreal + Twinmotion[^15] |
| Prueba                    | —                                     | 30 días           | Para evaluar flujos[^15] |

### Polycam (API, embebido)

Polycam ofrece captura multiplataforma (iOS/Android/Web) y capacidades de fotogrametría y LiDAR. Aunque no publica una API general de reconstrucción, sus capturas pueden embeberse en web con una experiencia interactiva inmediata, útil para marketing y validación de experiencia de usuario. Las notas de versión muestran mejoras continuas en su plataforma.[^21][^22][^23][^24]

### Luma AI (escenas interactivas y API)

Luma AI ofrece escenas interactivas embebibles en web, iOS y Android con archivos muy optimizados y rendimiento cercano a 30 fps en navegadores. Por defecto las escenas son privadas y su uso comercial no requiere licencias adicionales; también dispone de API para generación en masa. Para productos donde la experiencia inmersiva es diferencial (por ejemplo, piezas con acabados complejos), Luma puede complementar o reemplazar el pipeline de mallas PBR en páginas clave.[^25]

### Autodesk Platform Services (APS) Reality Capture API

APS proporciona un endpoint de fotogrametría que procesa imágenes y devuelve mallas texturizadas y nubes de puntos densas. El precio se define por cloud credits y hubo un anuncio de 1 cloud credit por gigapíxel, lo que facilita estimaciones unitarias por volumen de imágenes. La integración requiere autenticación y manejo de jobs asíncronos, y ofrece un SLA apropiado para producción.[^13][^14]

Tabla 6. Estimación de coste por job (orientativa)

| Job (ejemplo) | Imágenes | MP por imagen | Total MP (GP) | Cloud credits estimados | Precio por credit | Coste estimado |
|---------------|----------|---------------|---------------|-------------------------|-------------------|----------------|
| Producto A    | 30       | 12            | 360           | 360                     | Variable          | 360 × coste_unitario |
| Producto B    | 60       | 12            | 720           | 720                     | Variable          | 720 × coste_unitario |

Nota: el coste unitario por credit depende del plan y contrato; debe confirmarse en la consola de APS.[^14]

### Skanect (escaneo con Structure Sensor/Core)

Skanect convierte sensores Structure Sensor/Core en escáneres 3D de bajo coste. No se dispone de una API pública; su uso se orienta a captura con exportación a formatos estándar para integración web. Es útil para prototipos o catálogos de objetos pequeños.[^26][^27]

## Soluciones de código abierto (OSS): COLMAP, OpenMVG, AliceVision/Meshroom

El stack OSS permite un control total del pipeline y un TCO atractivo. COLMAP y OpenMVG resuelven el problema de SfM; OpenMVS completa el MVS para obtener mallas densas. Meshroom, construido sobre AliceVision, ofrece un pipeline visual guiado.

Tabla 7. Comparativa OSS

| Pipeline           | Componentes principales             | Requisitos GPU/CPU                 | Calidad esperada         | Integración web                 |
|--------------------|-------------------------------------|------------------------------------|--------------------------|---------------------------------|
| COLMAP + OpenMVS   | SfM (COLMAP) + MVS (OpenMVS)        | CUDA 7.0+ recomendado para COLMAP | Alta; reproducible       | Exportar a glTF/GLB[^1][^2][^8][^18] |
| OpenMVG + OpenMVS  | SfM (OpenMVG) + MVS (OpenMVS)       | CPU; soporte CUDA limitado         | Alta; robusto            | Exportar a glTF/GLB[^5][^7][^8][^18] |
| AliceVision/Meshroom | Pipeline visual AliceVision       | GPU NVIDIA con CUDA; sin macOS oficial | Alta; práctica y guiada | Exportar a glTF/GLB[^9][^10]    |

### COLMAP

COLMAP es un pipeline general de SfM y MVS con GUI y CLI, además de bindings Python (PyCOLMAP). Soporta reconstrucciones automáticas “de un clic” y es ampliamente usado en investigación e industria. Puede usar GPU (CUDA 7.0+) para acelerarMatching y MVS. La integración típica implica ejecutar el pipeline, exportar a formatos estándar y convertir a glTF/GLB para web.[^1][^2][^3][^4]

Tabla 8. Requisitos técnicos (resumen)

| Componente      | Requisito orientativo                |
|-----------------|--------------------------------------|
| GPU             | NVIDIA con CUDA (compute capability 7.0+ recomendado) |
| Drivers/CUDA    | CUDA Toolkit 11.x (compatibilidad con compilador) |
| CPU             | Multinúcleo; memoria 32–64 GB según dataset |
| Almacenamiento  | NVMe SSD para I/O intensivo          |

### OpenMVG

OpenMVG (Open Multiple View Geometry) es una librería C++ que resuelve SfM mediante pipelines modulares y exporta a MVS. Su filosofía es “mantenerlo simple y mantenible” y está diseñada para facilitar investigación reproducible.[^5][^7]

### AliceVision/Meshroom

Meshroom es un software de reconstrucción 3D OSS basado en AliceVision, con un pipeline visual nodal. Recomienda GPU NVIDIA con CUDA; no hay binario oficial para macOS. Funciona bien como “caja negra” con parámetros por defecto, y exporta mallas/texturas para conversión a glTF/GLB.[^9][^10]

### OpenMVS (complemento MVS)

OpenMVS es una librería MVS que densifica la nube de puntos y genera la malla texturizada. Se integra como complemento a SfM (COLMAP u OpenMVG) y mejora la completitud y calidad superficial en objetos con textura rica y geometría compleja.[^8]

## Servicios de terceros: captura y embebido (Polycam, Luma AI)

Polycam permite escaneo 3D multiplataforma y embebido web directo de las capturas, muy útil para validar hipótesis de experiencia con mínima fricción. Luma AI, por su parte, genera escenas interactivas optimizadas para web que logran ~30 fps y tamaños de archivo reducidos, habilitando una navegación de alta calidad sin preparar un pipeline de mallas PBR. En ambos casos, la relación señal/ruido de las capturas (iluminación controlada, fondo neutro, cobertura de vistas) determina el resultado final.[^21][^22][^25]

## Técnicas de NeRF y Gaussian Splatting (3DGS)

3D Gaussian Splatting representa la escena con Gaussianas 3D y renderiza en tiempo real con calidad de vanguardia. El entrenamiento parte de datos SfM (estructura COLMAP) y puede optimizarse con mejoras recientes (regularización de profundidad, compensación de exposición, antialiasing) que aceleran el entrenamiento y elevan la calidad visual. En la práctica, 3DGS se integra como una segunda vía de activos: escenas 3D navegables en tiempo real donde el realismo visual aporta conversión, mientras que la fotogrametría clásica continúa aportando mallas PBR para configuradores con materialidad precisa.[^29][^30][^31][^33]

Tabla 9. 3DGS vs NeRF vs SfM+MVS

| Dimensión        | 3DGS                              | NeRF                               | SfM+MVS                           |
|------------------|-----------------------------------|-------------------------------------|-----------------------------------|
| Calidad visual   | Muy alta; antialiasing/depth reg  | Alta; dependiente de captura        | Alta; geometría y texturas PBR    |
| Tiempo de entrenamiento | Horas (según dataset y GPU)   | Horas–días (dependiendo del setup)  | Minutos–horas (según pipeline)    |
| Rendering        | ≥30 fps a 1080p (viewer propio)   | Interactivo con aceleración         | Inmediato (mesh PBR en web)       |
| Dependencias     | GPU CUDA 7.0+; dataset SfM        | GPU robusta; dataset denso          | GPU/CPU; OSS robusto              |
| Uso en web       | Viewer/embebido específico        | Viewer/embebido específico          | Three.js/<model-viewer> estándar  |

Tabla 10. Requisitos de hardware para 3DGS

| Etapa             | Hardware recomendado                          |
|-------------------|-----------------------------------------------|
| Optimización (training) | NVIDIA GPU CUDA 7.0+; 24 GB VRAM para calidad del paper (ajustable) |
| Visor tiempo real | OpenGL 4.5+; GPU dedicada; 4–8 GB VRAM        |
| Software          | PyTorch 2.x; CUDA Toolkit 11.x; CMake 3.24+   |

[^29][^30][^31]

## Algoritmos de síntesis de vistas múltiples (SfM/MVS) aplicados a productos

El pipeline SfM/MVS para productos consiste en: (1) ingesta y preprocesamiento de imágenes, (2) extracción de features y matching, (3) estimación de cámaras y estructura 3D (SfM), (4) densificación (MVS), (5) reconstrucción de malla y texturizado, (6) limpieza y generación de LODs, y (7) exportación a glTF/GLB. Buenas prácticas de captura son críticas: iluminación difusa y homogénea, cobertura esférica de vistas, control de exposición y uso de marcadores o dianas si se busca precisión milimétrica. La literatura de referencia y tutoriales de COLMAP describen en detalle cada etapa, incluyendo estrategias robustas para colecciones no ordenadas.[^3][^36][^37][^38][^39]

Tabla 11. Checklist de captura para productos

| Aspecto                 | Recomendación práctica                                   |
|-------------------------|-----------------------------------------------------------|
| Número de imágenes      | 30–80 según tamaño y complejidad                         |
| Cobertura angular       | Esférica completa; evitar “zonas ciegas”                 |
| Iluminación             | Difusa, sin reflejos especulares; exposición constante   |
| Enfoque y nitidez       | Evitar desenfoque;固定 foco y apertura                   |
| Control de movimiento   | Trípode o rig; rotación por pasos iguales                |
| Fondeo                  | Neutro y mate; alto contraste con el producto            |
| Calibración (opcional)  | Patrones (dianas) para precisión geométrica              |

## Arquitectura de referencia para una app web de configuradores

La arquitectura recomendada combina un pipeline OSS para control de coste y portabilidad, con la opción de “burst” hacia un servicio API (APS) en picos de demanda o cuando se requiera un SLA. El proceso end-to-end: (1) ingestion (upload), (2) cola de reconstrucción, (3) motor SfM/MVS (COLMAP/OpenMVG + OpenMVS o APS), (4) postproceso (retopología ligera, UVs, bake PBR, LODs), (5) almacenamiento (objeto + CDN), (6) viewer web con Three.js o <model-viewer>. Observabilidad, caching y control de costes (autoscaling y spot instances) son pilares operativos.[^18][^32][^13][^34][^35]

Tabla 12. Catálogo de componentes y responsabilidades

| Componente         | Responsabilidad principal                                 |
|--------------------|------------------------------------------------------------|
| Ingestion API      | Subida de imágenes, metadatos y validaciones               |
| Orchestrator/Cola  | Gestión de jobs, reintentos, prioridades                   |
| Reconstruction     | SfM/MVS (OSS) o envío a APS; tracking de estado           |
| Post-proceso       | Decimate, UV, bake, LOD, glTF/GLB packaging               |
| Storage/CDN        | Persistencia, versionado, distribución global             |
| Viewer             | Carga y render interactivo (Three.js/<model-viewer>)       |
| Observabilidad     | Métricas, logs, trazas, coste por job                     |

Tabla 13. Presupuesto de latencia (estimado)

| Etapa             | Latencia típica           |
|-------------------|---------------------------|
| Upload            | Minutos (según conexión)  |
| SfM               | Minutos–1 h (según dataset) |
| MVS               | Minutos–1 h               |
| Post-proceso      | Minutos                   |
| Web delivery      | Segundos (CDN + GLB)      |

Nota: Las cifras son orientativas; requieren benchmarking en la infraestructura objetivo.

## Requisitos técnicos de infraestructura y hosting

Los requisitos varían según el pipeline. Para SfM/MVS OSS, una estación o servidor con GPU NVIDIA (CUDA 7.0+) y 32–64 GB de RAM es adecuado; el almacenamiento NVMe y la memoria influyen en los tiempos de MVS. Para 3DGS, la optimización necesita GPU con 24 GB de VRAM (para calidad del paper), aunque puede reducirse con ajustes; el visor en tiempo real requiere OpenGL 4.5+ y 4–8 GB de VRAM.[^1][^29][^30] El autoscaling y las estrategias de coste deben considerar GPU on-demand/spot y colas de prioridad. La entrega por CDN con glTF/GLB y LODs es esencial para la performance web.[^34][^35][^40]

Tabla 14. Matriz de requisitos de infraestructura

| Pipeline     | CPU/GPU                  | RAM       | VRAM       | Almacenamiento     | Software clave           |
|--------------|--------------------------|-----------|------------|--------------------|--------------------------|
| SfM+MVS OSS  | GPU NVIDIA (CUDA 7.0+)   | 32–64 GB  | 8–12 GB    | NVMe SSD           | COLMAP/OpenMVG, OpenMVS[^1][^8] |
| 3DGS         | GPU NVIDIA (CUDA 7.0+)   | 32–64 GB  | 24 GB (ideal, ajustable) | NVMe SSD           | PyTorch 2.x, CUDA 11.x[^29][^30] |
| APS (cloud)  | —                        | —         | —          | —                  | APS SDK/CLI[^13]         |

Tabla 15. Estimación de TCO por pipeline (orientativa)

| Pipeline     | Infra (GPU mes) | Storage/CDN | Operación | Total mensual (ejemplo) |
|--------------|------------------|-------------|-----------|-------------------------|
| OSS          | Variable (spot)  | Bajo–Medio  | Medio     | Variable (depende de volumen) |
| APS          | —                | Bajo–Medio  | Bajo      | credits × coste_unitario[^14] |
| 3DGS         | Alto (GPU + entrenamiento) | Medio      | Medio     | Superior a SfM (training) |

## Calidad de resultados y evaluación

Para productos, las métricas clave incluyen: precisión geométrica (error frente a referencias), completitud (porcentaje de superficie reconstruida), ruido (artejas), calidad de texturizado (resolución, UVs, seamlessness), y tamaño/performance en web (FPS y tiempo de carga). El benchmark debe incluir productos simples (superficies lisas) y complejos (texturas ricas, detalles finos), con reporting por lotes y umbrales de aceptación. La literatura de MVS provee el marco teórico para interpretar trade-offs entre métodos, y casos recientes muestran mejores pipelines de reconstrucción para elevar calidad final.[^39][^41]

Tabla 16. Métricas y umbrales de aceptación

| Métrica                 | Definición                               | Objetivo/Umbral orientativo     |
|-------------------------|-------------------------------------------|----------------------------------|
| Precisión geométrica    | Error medio vs. referencia                 | ≤ 1–2 mm (objetos pequeños)      |
| Completitud             | % superficie cubierta                      | ≥ 95%                            |
| Textura                 | Resolución efectiva; seams; colour const. | Sin seams visibles; 1K–2K PBR    |
| Performance web         | FPS y tiempo de carga                      | ≥ 30 fps; < 3 s carga inicial    |
| Tamaño modelo           | GLB descomprimido/comprimido               | 5–20 MB (objeto), según LOD      |

## Análisis de costos y ROI

El modelo de costes se reparte en: (i) licencias/suscripciones (RealityCapture/RealityScan, Pix4D si aplica), (ii) créditos de APS (1 credit/GP anunciado) para fotogrametría cloud, (iii) GPU para entrenamiento (3DGS) o reconstrucción (SfM/MVS), (iv) almacenamiento/CDN, y (v) operación. La evaluación de ROI debe sopesar rapidez y SLA de servicios cloud frente a control y menor lock-in del OSS.

Tabla 17. Escenarios de coste por volumen (orientativo)

| Volumen (productos/mes) | OSS (SfM+MVS)          | APS (Reality Capture)   | 3DGS (experimental)     |
|-------------------------|------------------------|-------------------------|-------------------------|
| 10                      | Bajo–Medio (GPU spot)  | Medio (credits × GP)    | Medio–Alto              |
| 100                     | Medio (autoscaling)    | Medio–Alto              | Alto                    |
| 1,000                   | Alto (operación)       | Alto                    | Muy alto                |

Tabla 18. Sensibilidad de precios (assumptions)

| Parámetro               | Impacto en coste           |
|-------------------------|----------------------------|
| Nº imágenes por producto | +GP → +credits (APS)       |
| MP/imagen               | +GP → +credits (APS)       |
| GPU/CPU                 | +coste mensual (spot)      |
| Storage/CDN             | +coste mensual ( egress )  |

## Riesgos, lock-in y mitigaciones

- Lock-in de API: si se depende de endpoints propietarios, la portabilidad puede verse afectada. Mitigar definiendo adaptadores, formatos intermedios (glTF/GLB) y estrategias de fallback OSS. APS ofrece control de costes por credit, pero requiere gobernanza de consumo.[^13][^14]
- Disponibilidad y latencia: servicios cloud externos introducen dependencia de red y SLAs externos; mitigar con colas, reintentos y caching agresivo en CDN.
- Variabilidad de calidad por captura: la señal de entrada condiciona el resultado; mitigar con checklists y validación automática (cobertura, exposición).
- Privacidad/IP: flujos cloud implican transferencia de activos; mitigar con acuerdos y políticas de cifrado, y favorecer pipelines on-prem para productos sensibles.

Tabla 19. Matriz de riesgos

| Riesgo                  | Probabilidad | Impacto | Mitigación                                 |
|-------------------------|-------------:|--------:|--------------------------------------------|
| Lock-in API             | Media        | Alta    | Adaptadores, formatos estándar, fallback OSS |
| SLA externo             | Media        | Media   | Colas, caching, multi-proveedor            |
| Calidad inconsistente   | Alta         | Media   | Checklist captura, validación automática   |
| Coste impredecible      | Media        | Alta    | Presupuesto por job, alertas, cuotas       |
| Seguridad/IP            | Baja–Media   | Alta    | On-prem, cifrado, contratos                |

## Roadmap de implementación y pruebas

Se propone un despliegue por fases con hitos claros y criterios de salida.

- Fase POC (2–4 semanas): implementar pipeline OSS (COLMAP/OpenMVG + OpenMVS) y viewer en Three.js; definir checklist de captura; establecer métricas y umbrales; ejecutar 10–20 productos piloto.[^2][^18]
- Fase Beta (4–8 semanas): integrar APS Reality Capture API para comparar calidad y TCO; añadir Luma AI en 1–2 productos donde el realismo sea clave; habilitar observabilidad y colas.[^13][^25]
- Fase Producción (8–20 semanas): consolidar operación híbrida; optimizar CDN y LODs; automatizar QA; definir SLOs y playbooks de incidentes.

Tabla 20. Plan por fase

| Fase       | Duración | Entregables                                  | Criterios de aceptación                   |
|------------|----------|-----------------------------------------------|-------------------------------------------|
| POC        | 2–4 sem. | Pipeline OSS + viewer; 10–20 modelos          | ≥95% completitud; ≥30 fps; <3 s carga     |
| Beta       | 4–8 sem. | APS + Luma integrados; comparación A/B        | Coste por job bajo presupuesto; SLA básico |
| Producción | 8–20 sem.| Operación híbrida; QA automatizado; CDN/LODs  | SLOs cumplidos; coste estable; 0 incidentes críticos |

## Conclusiones y selección recomendada

- Ruta principal: fotogrametría clásica (SfM+MVS) con OSS (COLMAP/OpenMVG/OpenMVS) para generar mallas texturizadas y formatos GLB/glTF listos para web. Esta ruta optimiza coste y control, con excelente compatibilidad en viewers estándar.[^2][^5][^8][^18]
- Ruta alternativa/servicio: APS Reality Capture API cuando se necesite elasticidad, SLA y menor complejidad operativa; Luma AI para escenas interactivas embebibles con alto impacto visual y API de generación en masa.[^13][^14][^25]
- Rutas emergentes: 3DGS aporta navegación en tiempo real y calidad visual sobresaliente; viable como capa premium de interacción en productos estratégicos, manteniendo SfM+MVS para modelos PBR estándar.[^29][^31]

Estrategia de adopción: ejecutar un POC con OSS y un piloto con APS; añadir Luma en productos seleccionados; y preparar un track 3DGS para evaluación con KPIs específicos (tiempo de entrenamiento, FPS, satisfacción de usuario). El énfasis operativo debe incluir observabilidad de calidad y coste, y procesos de QA y publicación estandarizados.

## Información faltante (gaps a validar)

- Polycam: ausencia de documentación pública de API de reconstrucción para automatización server-side.
- Luma AI: detalles de pricing por volumen y condiciones de API (rate limits).
- APS Reality Capture: cálculo exacto de cloud credits por job (depende de megapíxeles, plan y negociación).
- Skanect: no hay evidencia de API pública, solo capacidades de escaneo y exportación.
- Métricas comparativas reproducibles (IoU, Chamfer, PSNR/SSIM) entre COLMAP/OpenMVG/AliceVision y servicios comerciales.
- Benchmarks estandarizados de tiempos y calidad para meshes vs 3DGS/NeRF en e-commerce.

---

## Referencias

[^1]: COLMAP - Structure-from-Motion and Multi-View Stereo - GitHub.  
[^2]: Documentación oficial de COLMAP.  
[^3]: Tutorial — COLMAP.  
[^4]: Rerun: ejemplo de Structure-from-Motion con COLMAP.  
[^5]: openMVG/openMVG - GitHub.  
[^7]: OpenMVG: Open Multiple View Geometry (paper).  
[^8]: openMVS: Open Multi-View Stereo - GitHub.  
[^9]: Meshroom - AliceVision.  
[^10]: alicevision/Meshroom - GitHub.  
[^11]: Reality Capture API - Autodesk Platform Services.  
[^12]: Pricing changes for Reality Capture API - APS.  
[^13]: Reality Capture API (documentación) - Autodesk Platform Services.  
[^14]: Pricing changes for Reality Capture API (1 cloud credit/GP) - APS.  
[^15]: RealityCapture Pricing: Everything You Need to Know - FlyPix AI.  
[^16]: RealityScan | 3D models from images and laser scans.  
[^17]: RealityCapture es ahora RealityScan, gratuito con nuevas funciones de IA - All3DP.  
[^18]: GLTFLoader – three.js docs.  
[^19]: Load 3D Models in glTF Format - Discover three.js.  
[^20]: <model-viewer> Examples and Documentation.  
[^21]: Polycam: Cross-Platform 3D Scanning.  
[^22]: Polycam - Release notes.  
[^23]: Cómo embeber capturas de Polycam en tu página web.  
[^24]: Polycam Vision 25: The Future of 3D Reality Capture.  
[^25]: Interactive Scenes - Luma AI.  
[^26]: Microsoft 3D Scan vs. Skanect - SourceForge.  
[^27]: Best professional 3D scanning software - Artec 3D.  
[^28]: Radiance Fields (Gaussian Splatting and NeRFs).  
[^29]: 3D Gaussian Splatting for Real-Time Radiance Field Rendering - GitHub.  
[^30]: 3D Gaussian Splatting - Proyecto (Kerbl et al.).  
[^31]: 3D Gaussian Splatting Methods for Real-World Scenarios (ISPRS 2025).  
[^32]: 3D Gaussian Splatting: Performant 3D Scene Reconstruction at Scale - AWS Blog.  
[^33]: Comparative Assessment of Neural Radiance Fields and 3D Gaussian Splatting (MDPI Sensors).  
[^34]: three.js manual.  
[^35]: Discover three.js (Guía completa).  
[^36]: Structure from Motion from Multiple Views - MATLAB & Simulink.  
[^37]: Structure from Motion (SfM) — CMSC426.  
[^38]: Towards Internet-scale Multi-view Stereo (Furukawa et al.).  
[^39]: Multi-View Stereo: A Tutorial (Now Publishers).  
[^40]: Sculteo: Guía de fotogrametría y software.  
[^41]: Improved 3D reconstruction pipeline for enhancing quality (Scientific Reports 2025).
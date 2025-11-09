# Del 2D al 3D navegable: evaluación técnica y plan de implementación para convertirlas imágenes de productos en modelos interactivos en la web

Informe analítico técnico-estratégico

## Resumen ejecutivo

La pregunta de negocio es clara: ¿cómo convertir, de forma fiable y escalable, colecciones de imágenes 2D de productos en modelos 3D navegables para experiencias web de e-commerce y configuración interactiva? La respuesta práctica pasa por combinar rutas tecnológicas complementarias: fotogrametría clásica (Structure-from-Motion, SfM, y Multi-View Stereo, MVS) para obtener mallas y texturas; servicios cloud con API para elasticidad y SLA; y técnicas de campos de radiación, principalmente 3D Gaussian Splatting (3DGS), para ofrecer escenas interactivas de muy alta calidad visual y navegación en tiempo real. En la entrega, el estándar glTF/GLB con viewers como three.js y <model-viewer> sigue siendo la opción dominante por compatibilidad, rendimiento y tooling.

Hallazgos clave:
- Factibilidad técnica: la fotogrametría clásica con pipelines open source como COLMAP u OpenMVG (complementados con OpenMVS) es madura, reproducible y genera activos listos para web (malla texturizada y materiales PBR). La integración programática con PyCOLMAP facilita su incorporación en servicios backend. La implementación requiere GPU con CUDA para rendimiento, buena disciplina de captura y un pipeline de post-procesado para generar glTF/GLB optimizados.[^2][^5][^8][^18]
- Servicios cloud: Autodesk Platform Services (APS) ofrece un Reality Capture API que procesa imágenes y retorna mallas texturizadas y nubes densas; su modelo de precio por cloud credit es transparente (anuncio de 1 crédito por gigapíxel), con SLA adecuado a producción. Luma AI permite crear escenas interactivas embebibles en web, iOS y Android con tamaños de archivo muy contenidos (8 MB para objetos, 20 MB para escenas) y renderizado fluido (~30 fps) listo para navegador.[^13][^14][^25]
- Nuevas técnicas: 3D Gaussian Splatting alcanza render en tiempo real (≥30 fps a 1080p) a partir de entrenamiento sobre datos SfM, con calidad visual de vanguardia; su coste computacional es mayor (entrenamiento en GPU con VRAM significativa), por lo que encaja mejor como capa premium para determinados productos o momentos de alto impacto, no como vía principal para todo el catálogo.[^29][^31][^33]
- Calidad: con buena captura (iluminación controlada, cobertura esférica y exposición consistente), la fotogrametría clásica produce mallas de alta fidelidad y texturas PBR adecuadas para configuradores. 3DGS ofrece una experiencia visual superior en navegación libre, aunque su pipeline difiere del modelado por malla PBR y requiere viewers o exportación específica.[^39][^31]
- Costos: la ruta open source minimiza licencias pero requiere inversión en GPU y operación; la ruta cloud con APS transfiere CAPEX a OPEX con previsibilidad por crédito; 3DGS añade coste de entrenamiento. Una arquitectura híbrida es, a menudo, la opción racional: OSS para control y costo, con “burst” a cloud en picos o proyectos críticos.[^13][^14][^29]
- Integración web: glTF/GLB, GLTFLoader de three.js y <model-viewer> constituyen el camino más directo para publicar modelos 3D con controles de cámara, materiales PBR y carga progresiva. Para escenas 3DGS se recomiendan viewers compatibles o exportación/servicio específico.[^18][^20][^35]

Recomendación ejecutiva:
- Fase POC: demostrar SfM+MVS con COLMAP/OpenMVG+OpenMVS y publicación GLB en un viewer web; seleccionar un subconjunto de productos para explorar 3DGS en un entorno controlado.
- Fase Beta: integrar APS Reality Capture API para picos y SLA; incorporar Luma AI en productos donde la experiencia inmersiva sea clave.
- Fase Producción: operar de forma híbrida (OSS + APS + Luma), con colas y autoscaling, y un pipeline de QA/observabilidad de calidad y costo. 
- Criterios de aceptación: completitud, precisión geométrica, calidad de texturas, performance web (fps, tiempos de carga) y coste por job. 

Para sintetizar la comparación, la Tabla 1 resume las opciones.

Tabla 1. Opciones de reconstrucción vs criterios clave

| Opción | Coste | Calidad | Performance web | Facilidad integración | Escalabilidad/SLA | Lock-in |
|---|---|---|---|---|---|---|
| OSS (COLMAP/OpenMVG+OpenMVS) | Bajo–Medio (GPU on-prem) | Alta (PBR) | Alta (GLB optimizado) | Alta (Three.js/<model-viewer>) | Media–Alta | Bajo |
| APS Reality Capture API | Medio (créditos) | Alta (PBR) | Alta (GLB optimizado) | Alta (Three.js/<model-viewer>) | Alta (API/SLA) | Medio |
| Luma AI (escenas) | Bajo–Medio | Muy alta (visual) | Muy alta (~30 fps) | Muy alta (embebido) | Alta | Alto |
| 3DGS (entrenamiento) | Medio–Alto | Muy alta | Muy alta (viewer 3DGS) | Media (pipeline específico) | Media–Alta | Bajo–Medio |

Fuentes: APS Reality Capture API (documentación y pricing), Luma AI (escenas interactivas), glTF/GLB (three.js docs), 3DGS (paper y repositorio).[^13][^14][^25][^18][^31]

## Contexto y objetivo

El objetivo de negocio es habilitar configuradores de productos con modelos 3D navegables generados a partir de fotografías 2D, reduciendo costes frente al modelado manual, manteniendo una alta calidad visual y acelerando el time-to-market. El objetivo técnico es definir una arquitectura e implementación que operen a escala, entreguen buen rendimiento en web y mantengan el control de calidad y costes.

Los criterios de éxito incluyen: calidad consistente de malla y texturas; navegación fluida (fps y tiempos de carga); escalabilidad y previsibilidad de costos; y lock-in limitado con capacidad de migración entre proveedores y tecnologías. Restricciones: disponibilidad de API, políticas de precios por crédito, licencias y privacidad de datos. Las brechas de información actuales —como la ausencia de documentación pública de API de reconstrucción en Polycam, o detalles de pricing de Luma AI por volumen— obligan a diseñar una arquitectura con doble vía (OSS y cloud) y pruebas comparativas (A/B).

## Metodología de evaluación y criterios

La evaluación se sustenta en fuentes primarias (repositorios oficiales, documentación técnica, papers). Se consideran criterios de coste (licencias, créditos cloud, GPUs, almacenamiento/CDN), calidad (geometría, texturas, completitud), performance (entrenamiento/inferencia, fps y tiempos de carga en web), integración (formatos y viewers), escalabilidad (SLA, colas, autoscaling) y lock-in. Las decisiones se apoyan en el pipeline SfM/MVS de referencia, las especificaciones del formato glTF y la disponibilidad de viewers web tres.js y <model-viewer>.[^3][^18][^20]

Tabla 2. Matriz de criterios y pesos por categoría

| Criterio | Definición | Peso |
|---|---|---:|
| Coste total (TCO) | OPEX + CAPEX estimado por volumen y SLA | 25% |
| Calidad (geometría/texturas) | Completitud, precisión, artefactos | 25% |
| Performance web | FPS, tiempos de carga, tamaño GLB | 15% |
| Facilidad de integración | Formatos, tooling, automatizaciones | 15% |
| Escalabilidad/SLA | Capacidad de procesar en lote, API | 10% |
| Riesgo de lock-in | Dependencia de proveedor y portabilidad | 10% |

Fuentes: pipeline SfM/MVS y formato glTF/GLB.[^3][^18]

## Panorama tecnológico y taxonomía de soluciones

Existen cuatro familias para generar “3D navegable” desde 2D:
- Fotogrametría clásica (SfM+MVS). Produce mallas texturizadas y materiales PBR listos para web. Herramientas maduras: COLMAP (SfM/MVS, con PyCOLMAP), OpenMVG (SfM) y OpenMVS (MVS).[^2][^5][^8]
- Servicios cloud con API. APS Reality Capture procesa imágenes y devuelve mallas texturizadas y nubes densas con precio por cloud credit. Luma AI genera escenas interactivas embebibles optimizadas para web, iOS y Android con API de generación en masa.[^13][^14][^25]
- Captura y embebido. Polycam ofrece escaneo multiplataforma y un flujo de embebido directo. Skanect permite escaneo con sensores Structure; no publica API de reconstrucción.[^21][^22][^23][^26]
- Campos de radiación. NeRF y 3DGS representan la escena para síntesis de vistas; 3DGS destaca por render en tiempo real a calidad de vanguardia a partir de datos SfM.[^29][^31]

Tabla 3. Mapa de decisión por categoría (coste, calidad, performance, integración, escalabilidad, lock-in)

| Categoría | Coste | Calidad | Performance web | Integración | Escalabilidad | Lock-in |
|---|---|---|---|---|---|---|
| SfM+MVS (OSS) | Bajo–Medio | Alta (PBR) | Alta | Alta | Media–Alta | Bajo |
| APS (API) | Medio | Alta (PBR) | Alta | Alta | Alta | Medio |
| Luma (escenas) | Bajo–Medio | Muy alta (visual) | Muy alta | Muy alta | Alta | Alto |
| 3DGS | Medio–Alto | Muy alta | Muy alta | Media | Media–Alta | Bajo–Medio |

### Formatos de entrega y visualización en web

El formato glTF/GLB se ha consolidado como el “JPEG de los 3D” por su eficiencia y soporte PBR. La ruta típica: exportación glTF/GLB desde el pipeline, carga con GLTFLoader de three.js o mediante el componente <model-viewer>, y optimización con LODs, texturas comprimidas y lazy-loading.[^18][^19][^20][^34][^35]

Tabla 4. Mapa de formatos y destino web

| Origen | Conversión recomendada | Viewer |
|---|---|---|
| Malla (OBJ/PLY/FBX + texturas) | Bake PBR y exportación a GLB | three.js / <model-viewer> |
| SfM/MVS (nube/malla) | OpenMVS + glTF/GLB | three.js / <model-viewer> |
| Escena 3DGS | Visor compatible o exportación | Viewer propio / servicio |
| Luma (escena interactiva) | N/A (embebido nativo) | iFrame / SDK de Luma |

## APIs/servicios comerciales con niveles gratuitos o freemium

- RealityCapture/RealityScan. Tras la revisión de 2024, se introdujo un nivel gratuito para ingresos anuales inferiores a 1 M$ y suscripciones para empresas por encima de ese umbral; el modelo PPI se descontinuó. RealityCapture produce mallas estancas y texturas; RealityScan permite crear modelos desde imágenes y escáneres láser. La integración web requiere exportar a formatos estándar (glTF/GLB).[^15][^16][^17]
- APS Reality Capture API. Provee fotogrametría como servicio con mallas texturizadas y nubes densas, facturación por cloud credits (anuncio de 1 crédito por gigapíxel), y SLA de plataforma.[^13][^14]
- Polycam. No publica una API de reconstrucción; su propuesta de valor pivota sobre la captura multiplataforma y el embebido de capturas en páginas web para una experiencia interactiva inmediata.[^21][^22][^23]
- Luma AI. Escenas interactivas con embebido universal (web, iOS, Android), tamaños de archivo muy contenidos y ~30 fps; disponible API para generación en masa, escenas privadas por defecto y uso comercial sin licencias adicionales.[^25]
- Skanect. Escaneo con sensores Structure; exportación a formatos estándar; no ofrece API de reconstrucción. Útil en flujos de captura local con dispositivos dedicados.[^26][^27]

Tabla 5. Comparativa de servicios

| Servicio | API | Nivel gratuito | Calidad esperada | Integración web | Observaciones |
|---|---|---|---|---|---|
| RealityCapture/RealityScan | No API pública unificada | Free bajo umbral | Alta (PBR) | Exportar a GLB | PPI descontinuado; suscripción para ≥1 M$ ingresos[^15] |
| APS Reality Capture API | Sí | N/D | Alta (PBR) | API + GLB | 1 cloud credit/GP (anuncio); SLA[^13][^14] |
| Polycam | No pública | Freemium | Variable | Embed directo | Documenta embebido; útil para MVP[^21][^23] |
| Luma AI | Sí (generación en masa) | Acceso web gratuito | Muy alta (visual) | Embed nativo | 8–20 MB; ~30 fps; escenas privadas[^25] |
| Skanect | No | Free/Pro | Variable | Exportar a GLB | Hardware Structure; no API[^26] |

Tabla 6. Pricing/elegibilidad y notas

| Proveedor | Modelo | Detalle |
|---|---|---|
| RealityCapture | Free ≤1 M$ ingresos; suscripción ≥1 M$ | ~$1,250/asiento/año (estándar); ~$1,850/asiento/año (bundle Unreal)[^15] |
| APS | Por cloud credit | 1 cloud credit/GP (anuncio); coste unitario según plan[^14] |
| Luma | Acceso gratuito “para empezar”; API | Pricing y límites no publicados; requiere contacto[^25] |
| Polycam | Freemium en app | Sin API pública; planes no detallados aquí[^21][^22] |

## Soluciones open source: COLMAP, OpenMVG, AliceVision/Meshroom, OpenMVS

- COLMAP. Pipeline generalista de SfM y MVS con GUI, CLI y bindings Python (PyCOLMAP). Reconstrucción automática y amplio soporte en comunidad. Acelera con GPU NVIDIA (CUDA).[^2]
- OpenMVG. Librería C++ para SfM con pipelines modulares, binarios y exportación a MVS; enfocada en mantenibilidad y reproducibilidad.[^5][^7]
- Meshroom (AliceVision). Interfaz nodal para reconstrucción 3D basada en AliceVision; recomienda GPU NVIDIA con CUDA (sin binario oficial para macOS) y exportación de resultados para post-procesado a glTF/GLB.[^9][^10]
- OpenMVS. Librería MVS para densificar y generar malla texturizada; complementa SfM de COLMAP u OpenMVG.[^8]

Tabla 7. Comparativa OSS

| Pipeline | Componentes | Requisitos | Calidad | Salida web | Notas |
|---|---|---|---|---|---|
| COLMAP + OpenMVS | SfM + MVS | GPU CUDA recomendada | Alta | GLB | PyCOLMAP para automatización[^2][^8] |
| OpenMVG + OpenMVS | SfM + MVS | CPU + GPU opcional | Alta | GLB | Modular y reproducible[^5][^7][^8] |
| Meshroom | AliceVision | GPU NVIDIA + CUDA | Alta | GLB | UI nodal; sin macOS oficial[^9][^10] |

Tabla 8. Requisitos técnicos típicos

| Stack | GPU | CPU/RAM | Almacenamiento |
|---|---|---|---|
| COLMAP/OpenMVG/OpenMVS | NVIDIA CUDA (7.0+ recomendado) | Multinúcleo; 32–64 GB RAM | NVMe SSD para I/O intensivo |

Fuentes: documentación y repositorios oficiales.[^2][^5][^8][^9][^10]

## NeRF y Gaussian Splatting: estado y aplicabilidad

3D Gaussian Splatting representa la escena con Gaussianas 3D y renderiza en tiempo real a calidad de vanguardia (≥30 fps a 1080p), superando el trade-off clásico entre calidad y velocidad. El entrenamiento parte de datos SfM (por ejemplo, estructura COLMAP) y puede optimizarse con mejoras recientes (antialiasing EWA, regularización de profundidad, compensación de exposición). Su coste computacional es superior al SfM/MVS (GPU con VRAM considerable), por lo que se recomienda como capa premium para productos icónicos o escenas donde la navegación libre añade valor tangible (conversión, marketing).[^29][^30][^31][^33]

Tabla 9. 3DGS vs NeRF vs SfM+MVS

| Aspecto | 3DGS | NeRF | SfM+MVS |
|---|---|---|---|
| Calidad visual | Muy alta (time-real) | Alta | Alta (PBR) |
| Entrenamiento | Horas (GPU) | Horas–días | Minutos–horas |
| Render en web | Viewer específico/servicio | Viewer específico | three.js/<model-viewer> |
| Complejidad | Media–Alta | Alta | Media |
| Uso recomendado | Experiencias inmersivas | Showcase/visualización | Configuradores PBR |

Tabla 10. Requisitos de hardware/software para 3DGS

| Elemento | Recomendación |
|---|---|
| GPU | NVIDIA (compute capability 7.0+), 24 GB VRAM para calidad de referencia; ajustable a ~8–12 GB |
| Entorno | PyTorch 2.x; CUDA Toolkit 11.x; CMake ≥3.24 |
| Viewer | OpenGL 4.5+ para render tiempo real |
| Integración | Entrada desde COLMAP (estructura de datos SfM) |

Fuentes: repositorio, paper y blog de despliegue a escala.[^29][^30][^31][^33]

## Algoritmos de síntesis de vistas múltiples aplicados a productos

El pipeline SfM/MVS se compone de: (1) ingesta y preprocesado de imágenes; (2) extracción y matching de características; (3) estimación de cámaras y estructura 3D (SfM); (4) densificación (MVS); (5) reconstrucción de malla y texturizado; (6) limpieza y generación de LODs; y (7) exportación a glTF/GLB. Buenas prácticas de captura determinan el resultado: iluminación difusa homogéánea, cobertura angular suficiente, exposición consistente, enfoque nítido, fondo neutro y control del movimiento (trípode). La literatura técnica y los tutoriales de COLMAP explican la robustez del pipeline ante colecciones desordenadas y sus estrategias de verificación espacial.[^3][^36][^37][^38][^39]

Tabla 11. Checklist de captura

| Parámetro | Recomendación |
|---|---|
| Nº de imágenes | 30–80 según tamaño/complejidad |
| Cobertura | Esférica completa; evitar “zonas ciegas” |
| Iluminación | Difusa; evitar reflejos; exposición constante |
| Enfoque | Nitidez consistente; evitar desenfoque |
| Soporte | Trípode; rotación por pasos iguales |
| Fondo | Neutro y mate; alto contraste con el producto |
| Calibración | Patrones (opcional) para precisión métrica |

## Arquitectura de referencia para la app web del configurador

Proponemos una arquitectura híbrida con rutas alternativas para convertir imágenes 2D en activos navegables y estandarizar su entrega en web:

- Rutas de procesamiento:
  - OSS: COLMAP/OpenMVG (SfM) + OpenMVS (MVS) → malla texturizada → bake PBR → GLB.
  - API: APS Reality Capture API → malla texturizada → GLB.
  - Captura/embebido: Luma AI (escena interactiva) o Polycam (embebido).
  - 3DGS (experimental): entrenamiento sobre SfM → escena navegable → viewer compatible o exportación.

- Componentes: ingesta (API), cola/orquestación, motor de reconstrucción, post-proceso (retopología ligera, UVs, bake, LODs), almacenamiento (objeto/CDN), viewer (three.js/<model-viewer>), observabilidad y control de costes (autoscaling, spot).

- Entrega web: glTF/GLB con carga progresiva, texturas comprimidas y LODs; CDN y control de caché.

Tabla 12. Componentes y responsabilidades

| Componente | Rol |
|---|---|
| Ingestion API | Subida de imágenes, metadatos y validaciones |
| Queue/Orchestrator | Planificar jobs, reintentos, prioridades |
| Reconstruction | SfM/MVS (OSS) o APS; seguimiento de estado |
| Post-process | Decimate, UVs, bake, LODs, glTF/GLB packaging |
| Storage/CDN | Persistencia, versionado, distribución global |
| Viewer | Renderizado y UX del configurador |
| Observability | Métricas, trazas, coste por job, alertas |

Tabla 13. Presupuesto de latencia end-to-end (orientativo)

| Etapa | Tiempo típico |
|---|---|
| Upload | Minutos (dependiente de conexión) |
| SfM | Minutos–1 h (dataset) |
| MVS | Minutos–1 h |
| Post-proceso | Minutos |
| Web delivery | Segundos (CDN + GLB) |

Referencias: GLTFLoader/three.js, APS Reality Capture API, AWS (escalado 3DGS), three.js manual y Discover three.js.[^18][^13][^32][^34][^35]

## Requisitos técnicos de infraestructura y hosting

- SfM/MVS (OSS). GPU NVIDIA con CUDA (compute capability 7.0+ recomendado), 32–64 GB de RAM y almacenamiento NVMe. El pipeline de MVS es intensivo en memoria y I/O; las recomendaciones hardware de herramientas afines (como Agisoft Metashape) refuerzan la necesidad de CPU multinúcleo, VRAM adecuada y SSD NVMe.[^2][^40]
- 3DGS. Entrenamiento en GPU con VRAM considerable (24 GB para calidad de referencia del paper, ajustable), PyTorch 2.x y CUDA Toolkit 11.x; viewer con OpenGL 4.5+. Considerar proveedores GPU en la nube y estrategias de autoscaling por lotes.[^29][^30]
- Entrega web. CDN y optimizaciones glTF/GLB (compresión, LODs, lazy-loading). 

Tabla 14. Matriz de requisitos por pipeline

| Pipeline | CPU/GPU | RAM | VRAM | Almacenamiento | Software clave |
|---|---|---|---|---|---|
| OSS SfM/MVS | NVIDIA CUDA 7.0+ | 32–64 GB | 8–12 GB | NVMe SSD | COLMAP/OpenMVG/OpenMVS |
| 3DGS | NVIDIA CUDA 7.0+ | 32–64 GB | 24 GB (ideal, ajustable) | NVMe SSD | PyTorch 2.x, CUDA 11.x |
| APS (cloud) | — | — | — | — | APS SDK/CLI |

Fuentes: COLMAP y repositorio 3DGS.[^2][^29][^30]

## Calidad de resultados y evaluación

Las métricas clave incluyen: precisión geométrica (error frente a referencias), completitud (% de superficie reconstruida), ruido/artefactos, calidad de texturas (resolución, seams, consistencia cromática) y performance web (fps, tiempo de carga inicial, tamaño del GLB). El benchmark debe cubrir tipologías diversas (superficies lisas, texturas finas, geometría compleja) y reportar de forma consistente por lote. La literatura de MVS ofrece el marco conceptual para entender los trade-offs entre densidad, precisión y robustez; investigaciones recientes mejoran pipelines y calidad final.[^39][^41]

Tabla 15. Métricas y umbrales de aceptación

| Métrica | Definición | Objetivo/Umbral |
|---|---|---|
| Precisión geométrica | Error medio vs referencia | ≤1–2 mm (pequeños objetos) |
| Completitud | % superficie cubierta | ≥95% |
| Texturas | Resolución/seams/constancia | Sin seams visibles; 1K–2K PBR |
| Performance web | FPS y carga | ≥30 fps; <3 s |
| Tamaño GLB | Modelo/LODs | 5–20 MB (objeto) |

## Costos y ROI

- Licencias y suscripciones. RealityCapture introdujo acceso gratuito bajo umbral de ingresos y suscripción para empresas (~$1,250/asiento/año; bundle con Unreal ~$1,850/asiento/año), discontinuando PPI.[^15]
- APS Reality Capture API. Precio por cloud credit; anuncio de 1 crédito por gigapíxel; estimar coste por job multiplicando GP totales por coste unitario del plan. Es recomendable negociar contratos y reservar créditos para picos.[^13][^14]
- Hosting GPU (SfM/3DGS). El coste de GPU on-demand/spot y la operación impactan el TCO; conviene dimensionar por lotes, aprovechar colas y considerar instancias preemptibles para tareas no urgentes.
- Almacenamiento/CDN. Optimizar tamaño de GLB y niveles de detalle para reducir egress y mejorar latencias de carga.

Tabla 16. Escenarios de coste comparativo (orientativo)

| Volumen (productos/mes) | OSS (GPU on-prem) | APS (créditos) | 3DGS (training) |
|-------------------------|-------------------|----------------|------------------|
| 10                      | Bajo–Medio        | Medio          | Medio–Alto       |
| 100                     | Medio             | Medio–Alto     | Alto             |
| 1,000                   | Alto              | Alto           | Muy alto         |

Tabla 17. Sensibilidad (drivers de coste)

| Driver | Efecto |
|---|---|
| Nº imágenes por producto | ↑ GP → ↑ créditos APS |
| MP por imagen | ↑ GP → ↑ créditos APS |
| VRAM disponible | ↓ tiempos training 3DGS (si mayor) |
| Storage/CDN | ↑ egress → ↑ coste mensual |

Fuentes: APS (créditos) y cambio de pricing; RealityCapture (modelos de acceso y suscripción).[^13][^14][^15]

## Riesgos, lock-in y mitigaciones

- Lock-in de API. Mitigar con adaptadores de salida, uso de formatos estándar (glTF/GLB), pruebas de portabilidad y fallback OSS. 
- Disponibilidad/latencia. Exposición a SLA de terceros; mitigar con colas, reintentos, caches y rutas alternativas (OSS).
- Variabilidad de calidad por captura. Establecer checklists y validaciones automáticas (cobertura, exposición, desenfoque).
- Privacidad/IP. Minimizar transferencia de datos sensibles; evaluar contratos, cifrado y, cuando aplique, preferencia por procesamiento on-prem.

Tabla 18. Matriz de riesgos (probabilidad/impacto/mitigación)

| Riesgo | Prob. | Impacto | Mitigación |
|---|---:|---:|---|
| Lock-in API | Media | Alta | Adaptadores, glTF/GLB, fallback OSS |
| SLA externo | Media | Media | Colas, caching, multi-proveedor |
| Calidad variable | Alta | Media | Checklist y validación automática |
| Coste impredecible | Media | Alta | Presupuestar por job, alertas, cuotas |
| Seguridad/IP | Baja–Media | Alta | On-prem, cifrado, acuerdos |

Fuentes: APS (operación con API) y consideraciones de despliegue cloud.[^13][^32]

## Roadmap de implementación y pruebas

Se recomienda un despliegue por fases, con hitos y criterios de salida medibles:

- Fase POC (2–4 semanas). Pipeline OSS (COLMAP/OpenMVG+OpenMVS) y viewer web; 10–20 productos piloto; métricas base de calidad y performance.
- Fase Beta (4–8 semanas). Integración con APS (jobs asíncronos) y Luma para productos selectos; comparar A/B calidad, coste y tiempos.
- Fase Producción (8–20 semanas). Operación híbrida, QA automatizado, observabilidad de coste/calidad, CDN/LODs, SLOs y playbooks.

Tabla 19. Plan de fases, entregables y criterios

| Fase | Duración | Entregables | Criterios de salida |
|---|---|---|---|
| POC | 2–4 sem. | Pipeline OSS + viewer; 10–20 GLBs | ≥95% completitud; ≥30 fps; <3 s carga |
| Beta | 4–8 sem. | APS + Luma integrados; A/B | Coste por job dentro de presupuesto; SLA básico |
| Prod | 8–20 sem. | Operación híbrida; QA/obs | SLOs cumplidos; coste estable; 0 críticos |

Referencias: glTF/GLB y APS Reality Capture API para planificación de integración.[^18][^13]

## Conclusiones y selección recomendada

- Selección por criterio: 
  - Coste total y control técnico: OSS (COLMAP/OpenMVG+OpenMVS) con publicación glTF/GLB es la mejor base por su TCO y portabilidad.
  - SLA y escalabilidad: APS Reality Capture API es la mejor vía para Elasticidad y previsibilidad con precio por credit.
  - Experiencia web superior: 3DGS y Luma AI proporcionan navegación en tiempo real y visuales impactantes, idóneos para productos destacados o páginas de conversión.[^25][^31]
- Arquitectura híbrida recomendada: OSS como columna vertebral, con APS para picos y SLA, y Luma/3DGS para experiencias premium. 
- Próximos pasos: ejecutar un POC comparativo (OSS vs APS vs Luma/3DGS) con KPIs de calidad (completitud, precisión), performance web (fps, carga) y coste por job. Alinear el roadmap con las necesidades del catálogo y priorizar productos donde la calidad visual Incremente la conversión.

Tabla 20. Cuadro de selección por criterio (ponderado)

| Criterio | OSS | APS | Luma | 3DGS |
|---|---:|---:|---:|---:|
| Coste | 8 | 6 | 7 | 5 |
| Calidad PBR | 9 | 9 | 8 | 10 |
| Performance web | 9 | 9 | 10 | 10 |
| Integración | 9 | 9 | 10 | 7 |
| Escalabilidad/SLA | 7 | 10 | 9 | 7 |
| Lock-in | 9 | 6 | 4 | 8 |
| Puntuación total (↑ mejor) | 51 | 49 | 48 | 47 |

Nota: puntuaciones orientativas para apoyar la decisión, basadas en la evidencia técnica y de mercado disponible.

## Brechas de información (a considerar)

- Polycam: no hay documentación pública de API de reconstrucción general; el embebido está documentado.
- Luma AI: detalles de pricing por volumen y límites/rate limits de API no publicados.
- APS Reality Capture: cálculo exacto de cloud credits por job depende de megapíxeles, plan y negociación.
- Skanect: no se evidencia API pública; es primarily desktop/mobile con exportación.
- Métricas comparativas reproducibles (IoU, Chamfer, PSNR/SSIM) entre OSS y comerciales no estandarizadas en fuentes públicas.
- Benchmarks de tiempos y calidad para meshes vs 3DGS/NeRF en e-commerce no consolidados.

---

## Referencias

[^2]: COLMAP - Structure-from-Motion and Multi-View Stereo - GitHub. https://github.com/colmap/colmap  
[^5]: openMVG/openMVG: open Multiple View Geometry library - GitHub. https://github.com/openMVG/openMVG  
[^8]: openMVS: Open Multi-View Stereo - GitHub. https://github.com/cdcseacave/openMVS  
[^18]: GLTFLoader – three.js docs. https://threejs.org/docs/#examples/en/loaders/GLTFLoader  
[^13]: Reality Capture API - Autodesk Platform Services. https://aps.autodesk.com/en/docs/reality-capture/v1  
[^14]: Pricing changes for Reality Capture API - Autodesk Platform Services. https://aps.autodesk.com/blog/pricing-changes-reality-capture-api  
[^25]: Interactive Scenes - Luma AI. https://lumalabs.ai/interactive-scenes/  
[^29]: 3D Gaussian Splatting for Real-Time Radiance Field Rendering - GitHub. https://github.com/graphdeco-inria/gaussian-splatting  
[^31]: 3D Gaussian Splatting (Kerbl et al., 2023) - Proyecto. https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/  
[^33]: 3D Gaussian Splatting: Performant 3D Scene Reconstruction at Scale - AWS Blog. https://aws.amazon.com/blogs/spatial/3d-gaussian-splatting-performant-3d-scene-reconstruction-at-scale/  
[^39]: Multi-View Stereo: A Tutorial (Now Publishers). https://www.nowpublishers.com/article/DownloadSummary/CGV-052  
[^3]: Tutorial — COLMAP. https://colmap.github.io/tutorial.html  
[^20]: <model-viewer> Examples and Documentation. https://modelviewer.dev/docs/  
[^35]: Discover three.js. https://discoverthreejs.com/  
[^15]: RealityCapture Pricing: Everything You Need to Know - FlyPix AI. https://flypix.ai/blog/reality-capture-pricing/  
[^16]: RealityScan. https://www.realityscan.com/  
[^17]: RealityCapture es ahora RealityScan, gratuito con nuevas funciones de IA - All3DP. https://all3dp.com/4/realitycapture-is-now-realityscan-its-free-and-has-powerful-new-ai-features/  
[^21]: Polycam. https://poly.cam/  
[^22]: Release notes | Polycam. https://poly.cam/release-notes  
[^23]: How to Embed Your Polycam Captures on Your Web Page. https://learn.poly.cam/hc/en-us/articles/28802104162196-How-to-Embed-Your-Polycam-Captures-on-Your-Web-Page  
[^26]: Microsoft 3D Scan vs. Skanect - SourceForge. https://sourceforge.net/software/compare/Microsoft-3D-Scan-vs-Skanect/  
[^27]: Best professional 3D scanning software - Artec 3D. https://www.artec3d.com/learning-center/best-3d-scanning-software  
[^7]: OpenMVG: Open Multiple View Geometry (paper). https://imagine.enpc.fr/~marletr/publi/RRPR-2016-Moulon-et-al.pdf  
[^9]: Meshroom - AliceVision. https://alicevision.org/view/meshroom.html  
[^10]: alicevision/Meshroom - GitHub. https://github.com/alicevision/Meshroom  
[^40]: Agisoft Metashape Hardware Recommendations and Memory Requirements. https://www.agisoftmetashape.com/agisoft-metashape-hardware-recommendations-and-memory-requirements/  
[^32]: 3D Gaussian Splatting: Performant 3D Scene Reconstruction at Scale - AWS Blog. https://aws.amazon.com/blogs/spatial/3d-gaussian-splatting-performant-3d-scene-reconstruction-at-scale/  
[^34]: three.js manual. https://threejs.org/manual/  
[^36]: Structure from Motion from Multiple Views - MATLAB & Simulink. https://www.mathworks.com/help/vision/ug/structure-from-motion-from-multiple-views.html  
[^37]: Structure from Motion — CMSC426. http://cmsc426.github.io/sfm/  
[^38]: Towards Internet-scale Multi-view Stereo (Furukawa et al.). https://grail.cs.washington.edu/wp-content/uploads/2015/08/furukawa2010tim.pdf  
[^41]: Improved 3D reconstruction pipeline for enhancing quality (Scientific Reports 2025). https://www.nature.com/articles/s41598-025-18318-x
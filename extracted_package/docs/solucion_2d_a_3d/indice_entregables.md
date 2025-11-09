# Tecnologías y APIs para convertir imágenes 2D de productos en modelos 3D navegables

Informe analítico y plan de implementación para CTOs, arquitectos de software, PM técnicos y líderes de I+D

## Resumen ejecutivo

Este informe evalúa el estado del arte y la viabilidad de convertir imágenes 2D en modelos 3D navegables en la web para configuradores de producto. Las conclusiones se basan en documentación y repositorios oficiales, y se enfocan en tres ejes complementarios: (1) fotogrametría clásica (Structure-from-Motion y Multi-View Stereo, SfM/MVS) con pipelines open source y servicios comerciales, (2) técnicas emergentes de campos de radiación (3D Gaussian Splatting, 3DGS, y Neural Radiance Fields, NeRF), y (3) integración web con formatos y viewers estándar.

Conclusiones principales:
- Fotogrametría clásica (SfM/MVS) es la ruta más madura y replicable para obtener mallas texturizadas compatibles con la web. COLMAP, OpenMVG y AliceVision/Meshroom ofrecen pipelines robustos y de alta calidad; su salida puede transformarse a glTF/GLB para su uso con three.js y <model-viewer>.[^2][^5][^9][^18][^20]
- Servicios comerciales con API aportan elasticidad y SLA. APS (Autodesk Platform Services) expone un Reality Capture API con precio por cloud credit (anuncio de 1 crédito por gigapíxel) y salida de mallas texturizadas. Luma AI habilita escenas interactivas embebibles con archivos muy optimizados (~30 fps en navegadores) y API para generación en masa.[^13][^14][^25]
- 3D Gaussian Splatting aporta navegación en tiempo real con calidad de vanguardia, entrenando sobre datos SfM y renderizando en viewers compatibles. Requiere GPUs modernas y VRAM considerable, por lo que es recomendable como complemento premium para productos clave, no como canal principal de todo el catálogo.[^29][^31][^33]

Arquitectura de referencia y recomendación:
- Adoptar una arquitectura híbrida: pipeline OSS para control de coste y portabilidad; APS en picos y/o cuando se requiera SLA; y Luma AI para escenas interactivas en productos de alto impacto. Complementar con una ruta 3DGS limitada a casos de uso donde la experiencia inmersiva aporte un retorno claro. Publicar modelos en glTF/GLB optimizados (LOD, compresión) y servirlos vía CDN.[^18][^13][^25][^32]

Roadmap resumido:
- POC (2–4 semanas): demostrar pipeline SfM/MVS con COLMAP/OpenMVG y publicación GLB en web; pruebas puntuales con 3DGS.
- Beta (4–8 semanas): integrar APS para comparar calidad, coste y latencia; incluir Luma para embebidos interactivos.
- Producción (8–20 semanas): operación híbrida con colas, autoscaling, QA automatizado y observabilidad de coste/calidad.

Tabla 1. Comparativa de opciones

| Opción | Calidad esperada | Coste | Performance web | Integración | Escalabilidad | Riesgo de lock-in |
|---|---|---|---|---|---|---|
| OSS (COLMAP/OpenMVG + OpenMVS) | Alta (malla PBR) | Bajo–Medio (GPU on-prem) | Alta (GLB optimizado) | Alta (Three.js/<model-viewer>) | Media–Alta | Bajo |
| APS Reality Capture API | Alta (malla PBR) | Medio (créditos) | Alta (GLB optimizado) | Alta (Three.js/<model-viewer>) | Alta (API/SLA) | Medio |
| Luma AI (escenas interactivas) | Muy alta (visual) | Bajo–Medio | Muy alta (~30 fps) | Muy alta (embebido) | Alta | Alto |
| 3DGS | Muy alta (time-real) | Medio–Alto (entrenamiento) | Muy alta (viewer específico) | Media (pipeline dedicado) | Media–Alta | Bajo–Medio |

Fuente: APS Reality Capture API, anuncio de pricing por credit; Luma AI (escenas interactivas); repositorio y paper de 3DGS; glTF/GLB en three.js.[^13][^14][^25][^29][^31][^18]

Brechas de información: pricing exacto y límites de API de Luma AI; ausencia de API pública de Polycam; detalle de créditos por job en APS más allá del anuncio; falta de métricas reproducibles comparativas entre OSS y comerciales; benchmarks estandarizados para meshes vs 3DGS/NeRF en e‑commerce.

## Alcance y criterios de evaluación

El objetivo funcional es publicar modelos 3D navegables en web a partir de colecciones de imágenes 2D de productos. Los criterios de evaluación incluyen: (1) calidad geométrica y de texturizado, (2) desempeño web (fps y tiempos de carga), (3) facilidad de integración (formatos y viewers), (4) escalabilidad y SLA, (5) TCO, y (6) riesgo de lock-in. El pipeline SfM/MVS y el formato glTF/GLB son los referentes técnicos base para la evaluación.[^3][^18]

Tabla 2. Matriz de criterios y pesos

| Criterio | Definición | Peso |
|---|---|---:|
| Calidad | Precisión geométrica, completitud, texturas | 25% |
| Performance web | FPS y tiempos de carga | 15% |
| Integración | Formatos, tooling, automatizaciones | 15% |
| Escalabilidad/SLA | Capacidad de procesamiento en lote y SLA | 10% |
| TCO | OPEX + CAPEX por volumen | 25% |
| Lock-in | Dependencia de proveedor/portabilidad | 10% |

## Fotogrametría clásica (SfM/MVS) con OSS

Cuándo usar. SfM/MVS es preferible cuando se requieren mallas y materiales PBR compatibles con el stack web estándar y el control de coste y portabilidad es clave. Produce salidas robustas y auditables en tiempos moderados, con una calidad consistente dependiente principalmente de la calidad de la captura.[^2][^5][^8][^39]

Tabla 3. Comparativa OSS

| Stack | Componentes | Requisitos | Calidad | Integración web | Observaciones |
|---|---|---|---|---|---|
| COLMAP + OpenMVS | SfM + MVS | GPU NVIDIA (CUDA 7.0+) | Alta | GLB (Three.js/<model-viewer>) | PyCOLMAP para automatización[^2][^8] |
| OpenMVG + OpenMVS | SfM + MVS | CPU + GPU opcional | Alta | GLB | Modular y reproducible[^5][^7][^8] |
| Meshroom (AliceVision) | Pipeline nodal | GPU NVIDIA + CUDA | Alta | GLB | Sin binario oficial macOS[^9][^10] |

Tabla 4. Checklist de captura para productos

| Aspecto | Recomendación |
|---|---|
| Cobertura | Esférica completa, evitar zonas ciegas |
| Iluminación | Difusa, homogénea, sin reflejos |
| Exposición | Constante entre imágenes |
| Nitidez | Enfoque fijo y estable |
| Soporte | Trípode y rotación por pasos |
| Fondo | Neutro y mate |
| Calibración | Patrones (opcional) para precisión |

Fuente: tutorial COLMAP y fundamentos de SfM/MVS.[^3][^36][^37][^38][^39]

### COLMAP

COLMAP es un pipeline general de SfM/MVS con GUI/CLI y bindings Python (PyCOLMAP). Soporta reconstrucción automática, recuperación de cámaras y estructura, y densificación para producir nubes densas y mallas texturizadas. Para web, exporta a formatos estándar y se convierte a glTF/GLB con post-proceso. La aceleración con GPU NVIDIA (compute capability 7.0+) mejora sustancialmente los tiempos de MVS y matching.[^2]

### OpenMVG + OpenMVS

OpenMVG implementa SfM modular con librerías, binarios y pipelines; su diseño “keep it simple, keep it maintainable” facilita reproducibilidad. OpenMVS complementa con MVS para obtener malla densa texturizada. La salida final se integra en la web mediante conversión a GLB y publicación con GLTFLoader o <model-viewer>.[^5][^7][^8][^18][^20]

## Servicios comerciales con API

- APS Reality Capture API. Proceso asíncrono que, a partir de imágenes, devuelve mallas texturizadas y nubes de puntos densas. El precio por cloud credit, con el anuncio de 1 crédito por gigapíxel, facilita estimaciones por job. Adecuado para picos, SLAs y equipos sin infraestructura GPU.[^13][^14]
- Luma AI. Escenas interactivas embebibles con archivos ligeros (8 MB para objetos, 20 MB para escenas) y ~30 fps en navegadores; uso comercial sin licencias adicionales y API para generación en masa. En productos complejos (acabados, volúmenes), puede ofrecer una experiencia superior y más rápida de integrar que una malla tradicional.[^25]

Tabla 5. Comparativa de servicios

| Servicio | API/SDK | Nivel gratuito | Integración web | Calidad | Notas |
|---|---|---|---|---|---|
| APS Reality Capture API | Sí | N/D | GLB + API | Alta | 1 cloud credit/GP (anuncio)[^13][^14] |
| Luma AI | Sí (generación en masa) | Acceso web para empezar | Embebido nativo | Muy alta (visual) | Archivos ligeros; escenas privadas[^25] |
| Polycam | No pública | Freemium | Embed de capturas | Variable | Integración por embebido[^21][^23] |
| Skanect | No | Free/Pro | Exportar GLB | Variable | Requiere Structure Sensor[^26][^27] |

Tabla 6. Estimación de coste APS por job

| Job | Imágenes | MP/img | GP totales | Créditos estimados |
|---|---:|---:|---:|---:|
| Producto A | 30 | 12 | 360 | 360 |
| Producto B | 60 | 12 | 720 | 720 |

Nota: multiplicar por el coste unitario vigente por crédito (dependiente de plan).[^14]

## Técnicas NeRF y 3D Gaussian Splatting

Cuándo usar. 3DGS es idóneo para escenas donde el realismo y la navegación libre aportan conversión o diferenciación (productos icónicos, páginas de campaña). Requiere entrenamiento en GPU (VRAM considerable), viewer compatible o exportación y no produce una malla PBR tradicional. Supone un complemento a la fotogrametría clásica, no un sustituto universal.[^29][^31]

Tabla 7. Comparativa NeRF vs 3DGS vs SfM+MVS

| Criterio | 3DGS | NeRF | SfM+MVS |
|---|---|---|---|
| Calidad visual | Muy alta, tiempo real | Alta | Alta (PBR) |
| Training | Horas (GPU) | Horas–días | Minutos–horas |
| Render en web | Viewer específico/servicio | Viewer específico | Three.js/<model-viewer> |
| Complejidad | Media–Alta | Alta | Media |
| Uso recomendado | Showcase inmersivo | Visualización | Configuradores PBR |

Fuente: repositorio oficial y paper de 3DGS, evaluaciones comparativas y tutoriales (Taming-3DGS, Mip Splatting, Depth Anything v2).[^29][^30][^31][^44][^45][^46]

## Integración web del 3D (visualización y experiencia de usuario)

Publicar activos 3D en web exige formatos eficientes y viewers maduros. El estándar glTF/GLB, junto con GLTFLoader de three.js o el componente <model-viewer>, permite cargar modelos PBR con controles de cámara, iluminación y materiales. El tamaño de archivo, LOD y lazy-loading afectan de forma directa a los tiempos de carga. Para escenas 3DGS se recomiendan viewers compatibles o servicios de embebido específicos.[^18][^19][^20][^34][^35]

Tabla 8. Mapa de formatos y viewers

| Origen | Conversión | Viewer |
|---|---|---|
| Malla (OBJ/PLY/FBX) | Bake PBR → GLB | three.js/<model-viewer> |
| SfM/MVS (nube/malla) | MVS → GLB | three.js/<model-viewer> |
| Escena 3DGS | Viewer/exporter 3DGS | Viewer 3DGS |
| Luma (escena) | N/A | Embebido (web/iOS/Android) |

## Arquitectura de referencia para la aplicación del configurador

Proponemos una arquitectura híbrida y modular:
- Rutas de procesamiento: OSS (SfM/MVS) para control y coste; APS en picos o proyectos con SLA; Luma/3DGS para escenas interactivas de alto valor.
- Componentes: Ingestion API, Queue/Orchestrator, Reconstruction (OSS/API), Post-proceso (decimate, UVs, bake, LODs), Storage/CDN, Viewer (three.js/<model-viewer>), Observability (métricas, coste por job).
- Flujo: imágenes → SfM/MVS/API → GLB → CDN → Viewer. Autoscaling y spot instances en clusters GPU; colas para resiliencia.

Tabla 9. Latencia estimada por etapa

| Etapa | Latencia típica |
|---|---|
| Upload | Minutos |
| SfM/MVS | Minutos–horas |
| Post-proceso | Minutos |
| Web delivery | Segundos (CDN) |

Referencias: GLTFLoader, APS API y escalado de 3DGS en cloud.[^18][^13][^32][^34][^35]

## Requisitos de infraestructura y hosting

- SfM/MVS. GPU NVIDIA (CUDA 7.0+), 32–64 GB de RAM y NVMe SSD; utilidades afines recomiendan VRAM significativa y CPU multinúcleo para eficiencia.[^2][^40]
- 3DGS. GPU con VRAM considerable (24 GB de referencia), PyTorch y CUDA 11.x; viewer con OpenGL 4.5+; posibilidad de usar CPU como dispositivo de datos (más lento) para reducir VRAM.[^29][^30]

Tabla 10. Requisitos por pipeline

| Pipeline | GPU/CPU | RAM | VRAM | Almacenamiento |
|---|---|---|---|---|
| OSS SfM/MVS | NVIDIA CUDA 7.0+ | 32–64 GB | 8–12 GB | NVMe SSD |
| 3DGS | NVIDIA CUDA 7.0+ | 32–64 GB | 24 GB (ideal) | NVMe SSD |
| APS (cloud) | — | — | — | — |

Fuentes: COLMAP, repositorio 3DGS y recomendaciones hardware (Metashape).[^2][^29][^40]

## Calidad de resultados y evaluación

Métricas para productos:
- Geométricas: precisión frente a referencia (si existe), completitud y artefactos.
- Texturas: resolución efectiva, seams y constancia de exposición.
- Performance: fps y tiempo de carga en condiciones de red reales.

Buenas prácticas de captura (iluminación, cobertura, enfoque) tienen mayor impacto que la elección del software en sí. La literatura de MVS describe cómo mejoras de pipeline impactan la calidad final; experiencias recientes en 3DGS demuestran que regularizaciones (profundidad, exposición) y antialiasing elevan el realismo.[^39][^33][^29]

Tabla 11. Métricas y umbrales sugeridos

| Métrica | Objetivo |
|---|---|
| Completitud | ≥95% |
| Precisión geométrica | ≤1–2 mm (pequeños objetos) |
| Texturas | Sin seams visibles; 1K–2K PBR |
| FPS | ≥30 |
| Tamaño GLB | 5–20 MB (según LOD) |

## Costos y ROI

- Licencias/suscripciones. RealityCapture ofrece acceso gratuito bajo umbral de ingresos y suscripción para empresas (~$1,250/asiento/año; bundle Unreal ~$1,850/asiento/año); PPI descontinuado.[^15]
- APS. Precio por cloud credit; anuncio de 1 crédito por GP. Estimar coste por job multiplicando GP por coste unitario del plan.[^14]
- Infraestructura GPU. Costes de on-demand/spot y operación afectan TCO; colas y autoscaling optimizan el uso. 
- Almacenamiento/CDN. Optimización de GLB (LOD, compresión) reduce egress y latencia de carga.

Tabla 12. Comparativa TCO por pipeline (orientativo)

| Volumen mensual | OSS | APS | 3DGS |
|---|---:|---:|---:|
| 10 productos | Bajo–Medio | Medio | Medio–Alto |
| 100 productos | Medio | Medio–Alto | Alto |
| 1,000 productos | Alto | Alto | Muy alto |

Tabla 13. Sensibilidad de precios

| Driver | Efecto |
|---|---|
| Nº de imágenes | ↑ GP → ↑ créditos APS |
| MP por imagen | ↑ GP → ↑ créditos APS |
| VRAM disponible | ↓ tiempo de training (si ↑ VRAM) |
| Storage/CDN | ↑ egress → ↑ coste mensual |

Fuentes: APS (pricing), RealityCapture (modelo de precios).[^14][^15]

## Riesgos, lock-in y mitigaciones

- Lock-in. Mitigar con estándares (glTF/GLB), fallback OSS y abstracciones de API.
- SLA/latencia. Exposición a servicios externos; mitigar con colas, reintentos y rutas alternativas.
- Privacidad. Minimizar transferencia de datos sensibles; acuerdos y cifrado; procesamiento on‑prem cuando aplique.
- Calidad. Control estricto de captura y validaciones automáticas (cobertura, exposición).

Tabla 14. Matriz de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---:|---:|---|
| Lock-in de API | Media | Alta | glTF/GLB, adaptadores, OSS |
| SLA externo | Media | Media | Colas, caching, multi-ruta |
| Calidad variable | Alta | Media | Checklist, validación |
| Coste impredecible | Media | Alta | Presupuestar por job |
| Seguridad/IP | Baja–Media | Alta | On-prem, cifrado, acuerdos |

Fuentes: APS (API/SLA) y despliegues 3DGS a escala (operación y lock-in práctico).[^13][^32]

## Roadmap de implementación y pruebas

Fase POC (2–4 semanas):
- Implementar pipeline OSS (COLMAP/OpenMVG+OpenMVS), post-proceso a GLB y viewer con three.js/<model-viewer>. 
- Entrenar un modelo 3DGS en un subconjunto pequeño para comparar experiencia visual y tiempos.
- Criterios: completitud ≥95%, ≥30 fps en viewer, tiempos de carga <3 s.

Fase Beta (4–8 semanas):
- Integrar APS Reality Capture API (jobs asíncronos, colas), comparar A/B calidad y coste.
- Añadir Luma AI para embebidos en productos clave; validar UX y performance.
- Criterios: SLA básico, coste por job dentro de presupuesto.

Fase Producción (8–20 semanas):
- Operación híbrida; QA automatizado; observabilidad (métricas, coste por job); CDN/LODs.
- Criterios: SLOs cumplidos, coste estable, 0 incidentes críticos.

Tabla 15. Plan por fases (entregables y criterios)

| Fase | Duración | Entregables | Criterios |
|---|---|---|---|
| POC | 2–4 sem. | OSS + viewer; 10–20 GLBs | Calidad y UX base |
| Beta | 4–8 sem. | APS + Luma integrados | SLA y coste objetivo |
| Prod | 8–20 sem. | Operación híbrida; QA | SLOs y estabilidad |

## Conclusiones y recomendación

- Selección por criterio. OSS para control y coste; APS para elasticidad y SLA; 3DGS/Luma para experiencias interactivas y de alto impacto visual.[^2][^13][^31][^25]
- Arquitectura híbrida. OSS como base, APS para picos y Luma/3DGS para productos de marketing/configuración avanzada; publicar en glTF/GLB optimizados y servir por CDN.
- Próximos pasos. Ejecutar un POC con A/B entre OSS, APS y Luma/3DGS, midiendo calidad, fps, tiempos de carga y coste por job; priorizar productos donde la experiencia 3D impacte la conversión.

Brechas de información. Pricing y límites de API de Luma AI; API de Polycam; cálculo exacto de créditos APS por job más allá del anuncio; métricas comparativas reproducibles; benchmarks estandarizados para meshes vs 3DGS/NeRF en e‑commerce.

---

## Referencias

[^2]: COLMAP - GitHub.  
[^5]: OpenMVG - GitHub.  
[^9]: Meshroom - AliceVision.  
[^18]: GLTFLoader – three.js docs.  
[^20]: <model-viewer> Documentation.  
[^13]: Reality Capture API - APS.  
[^14]: Pricing changes for Reality Capture API - APS.  
[^25]: Interactive Scenes - Luma AI.  
[^29]: 3D Gaussian Splatting - GitHub.  
[^31]: 3D Gaussian Splatting (Proyecto).  
[^3]: Tutorial — COLMAP.  
[^39]: Multi-View Stereo: A Tutorial.  
[^8]: OpenMVS - GitHub.  
[^7]: OpenMVG: Open Multiple View Geometry (paper).  
[^23]: How to Embed Your Polycam Captures.  
[^26]: Microsoft 3D Scan vs. Skanect - SourceForge.  
[^27]: Best 3D scanning software - Artec 3D.  
[^44]: Taming-3DGS - GitHub.  
[^45]: Mip Splatting - Project page.  
[^46]: Depth Anything v2 - GitHub.  
[^19]: Discover three.js - Load glTF models.  
[^34]: three.js manual.  
[^35]: Discover three.js (site).  
[^40]: Agisoft Metashape Hardware Recommendations.  
[^32]: AWS Blog: 3D Gaussian Splatting at Scale.  
[^33]: Comparative Assessment of NeRF and 3DGS (MDPI Sensors).  
[^36]: Structure from Motion from Multiple Views - MATLAB.  
[^37]: Structure from Motion — CMSC426.  
[^38]: Towards Internet-scale Multi-view Stereo (Furukawa et al.).  
[^41]: Improved 3D reconstruction pipeline (Scientific Reports 2025).
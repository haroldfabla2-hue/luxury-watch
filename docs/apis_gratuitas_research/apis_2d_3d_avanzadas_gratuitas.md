# APIs y servicios gratuitos avanzados (2024–2025) para generación 2D→3D: evaluación comparativa y guía de integración

## 1. Contexto y alcance: del 2D al 3D con APIs gratuitas

Este informe persigue un objetivo práctico: identificar, evaluar y operacionalizar APIs y servicios gratuitos o de código abierto lanzados o consolidables en 2024–2025 que eleven la calidad y el rendimiento del pipeline 2D→3D para un configurador de producto de lujo, sin introducir fricciones de licenciamiento o costos desproporcionados. El pipeline de referencia contempla: limpieza y mejora de imágenes, reconstrucción fotogramétrica, generación de materiales físico‑realistas (PBR), optimización y compresión de activos 3D, validación automática de calidad y entrega en web con latencia mínima.

El contexto competitivo actual está definido por configuradores que, aun siendo visualmente impresionantes, permanecen cerrados a la creación dinámica de activos. El caso Nike “By You” ilustra esta realidad: experiencias brillantes sobre catálogos predefinidos, pero sin ingestión de nuevas vistas ni materiales a partir de fotografías, lo que limita la personalización abierta y la agilidad de catálogo[^1]. Nuestra propuesta, por el contrario, se basa en una arquitectura abierta y modular que combina herramientas open‑source maduras —como COLMAP para Structure‑from‑Motion/Multi‑View Stereo (SfM/MVS)— con servicios en la nube cuando conviene (Autodesk Platform Services, APS), todo empaquetado en el formato glTF/GLB para web y visualización con librerías como Three.js[^2][^3][^5].

Criterios de evaluación aplicados de forma uniforme:
- Límites gratuitos efectivos: cuota mensual, créditos, límites por minuto en función de resolución.
- Calidad de salida: fidelidad geométrica y de textura, métricas visibles en el navegador ( FPS, tiempo a primer render).
- Escalabilidad: batch, automatización (CLI/SDK), colas, tiling para datasets grandes.
- Integración: APIs REST, SDKs JS/Python, CLI, formatos soportados.
- Formatos 3D: glTF/GLB como estándar web; compresiones Draco, Meshopt y texturas KTX2/Basis.

El resto del documento mapea categorías funcionales a herramientas viables, propone una arquitectura de referencia gratuita/low‑cost, detalla una comparativa por categorías y cierra con un plan de adopción por fases y una matriz de riesgos/mitigaciones.

---

## 2. Metodología de investigación y criterios de evaluación

La investigación se ha basado en documentación oficial y repositorios de proyectos open‑source, priorizando fuentes primarias con detalles técnicos y de licenciamiento. Para cada herramienta se han extraído capacidades, límites gratuitos y modos de integración (REST, CLI, SDK), con foco en su impacto operativo en un pipeline 2D→3D para e‑commerce de lujo.

La evaluación compara:
- Límites gratuitos (requests/mes; imágenes/min según megapíxeles; créditos por imagen).
- Calidad visual y geométrica de reconstrucciones/texturas en activos glTF.
- Escalabilidad (procesamiento por lotes; tiling para escenas extensas; colas).
- Integración (endpoints, SDKs, CLI).
- Formatos: glTF/GLB, Draco, Meshopt, KTX2/Basis.

Se adopta glTF/GLB como formato destino por su compatibilidad con la web y con Three.js; la optimización se articula con glTF Transform (SDK/CLI) y apoyos complementarios como KTX2 (Khronos) y meshoptimizer para reducir tamaño y acelerar render[^5][^11][^12][^29].

Limitaciones y mitigaciones:
- Algunas APIs no publican límites exactos del plan gratuito (p. ej., ciertas funciones de Polycam o Meshy). Se señala como brecha y se recomiendan validaciones con pruebas controladas antes de escalar.
- No existen métricas estandarizadas y universally accepted de “calidad 3D” aplicables de forma automatizada en CI/CD; se proponen proxies de calidad combinando checklist geométrico/textural con evaluación heurística sobre render en navegador.

---

## 3. Panorama por categorías (2024–2025): estado del arte y mejores opciones gratuitas

### 3.1 Fotogrametría gratuita 2024–2025: APIs/servicios y pipelines OSS

La fotogrametría ha avanzado en dos frentes: herramientas open‑source estables, capaces de ejecutar pipelines completos de SfM/MVS localmente, y servicios cloud que simplifican la operación con licencias gratuitas acotadas. En el plano OSS, COLMAP y su front‑end visual Meshroom (AliceVision) siguen siendo pilares para equipos con GPUs y necesidades de control y trazabilidad[^2][^26]. En cloud, APS (Autodesk Platform Services) ofrece Reality Capture como servicio administrado con alta escalabilidad y SLA[^3]. Polycam, por su parte, habilita un flujo práctico “objeto” con límites gratuitos que cubren prototipos y pequeños lotes[^4]. En mobile, RealityScan 2.0 rebrandea y amplía capacidades de RealityCapture con licencias gratuitas para individuos/pequeñas empresas y educadores, junto a una herramienta de Quality Analysis para diagnósticos de malla y dependencias de cámara[^24][^25][^32].

Para escenarios con meshes muy grandes o ciudades/escenarios extensos, el tiling de fotogrametría en 3D Tiles de Cesium ion permite distribuir la carga de visualización y datos sin simplificación agresiva, manteniendo cobertura completa y accesibilidad web[^6].

Para ilustrar las diferencias operativas, la Tabla 1 sintetiza capacidades y límites.

Tabla 1. Comparativa de fotogrametría (2024–2025): tipo, límites gratuitos, outputs y automatización

| Herramienta | Tipo | Límites gratuitos (resumen) | Calidad/Outputs (resumen) | Automatización | Formatos clave |
|---|---|---|---|---|---|
| COLMAP (OSS) | Local (SfM/MVS) | Sin licencias; coste: infraestructura GPU | Mesh denso; nube de puntos; control total del pipeline | CLI; scripts propios | PLY/OBJ; integração posterior a glTF |
| Meshroom (OSS) | Local (nodal) | Sin licencias; coste: infraestructura GPU | Reconstrucción nodal; buen equilibrio calidad/operabilidad | Nodal; pipelines reproducibles | PLY/OBJ; integración a glTF |
| APS Reality Capture (cloud) | Cloud/API | Pago por uso (créditos/gigapíxel); sin plan gratuito ilimitado | Reconstrucciones de alta calidad; escalabilidad y SLA | REST API; colas administradas | glTF/OBJ y otros; optimizable a GLB |
| Polycam “Objeto” | Cloud/app | Hasta 150 fotos o 3 min de vídeo por “objeto”; 10 modelos gratis (exportación completa requiere Pro) | Modelos fotorrealistas con buenas prácticas de captura | App/web; procesamiento en la nube | Exportaciones limitadas en plan gratuito |
| RealityScan 2.0 | App/Desktop | Licencia gratuita para individuos, PYMEs (<$1M) y educadores | Flujo simplificado; calidad orientada a activos móviles/web | CLI disponible | Exporta a plataformas y formatos comunes; QA tool |

Fuentes: documentación y páginas oficiales de cada proyecto[^2][^3][^4][^24][^25][^26][^32].

Recomendación: usar OSS para control de costos y trazabilidad (COLMAP/Meshroom), APS para picos o plazos estrictos, Polycam para prototipos y RealityScan 2.0 para adquisición móvil guiada con diagnóstico de calidad integrado. Para entornos urbanos/grandes volúmenes, considerar 3D Tiles.

Brecha: límites exactos de exportaciones “gratuitas” en Polycam pueden variar con el tiempo; validar in situ antes de planificar lotes medianos.

### 3.2 IA para mejora de imágenes: super‑resolución, limpieza y removal

La calidad de la reconstrucción depende de la calidad de entrada. Tres líneas son determinantes: eliminación de fondo, super‑resolución y ajustes de color/ruido.

- Eliminación de fondo: la API de remove.bg expone límites por resolución y por minuto. El plan gratuito ofrece 50 llamadas/mes y un throughput que se degrada con la megapíxelización de la imagen (p. ej., ~500 imágenes/min a 1 MP; ~10 imágenes/min a 50 MP), además de salidas alternativas como ZIP con capa alfa separada para integrar con compositing y reducir tamaño[^13]. Alternativas como Removal.ai o Picsart ofrecen APIs con niveles gratuitos o freemium, útiles como respaldo o para casos específicos[^14][^15].
- Super‑resolución: Upscayl (desktop, OSS) es gratuito y soporta escalas hasta 16x, ideal para pipelines offline y procesamiento por lotes de material de marketing o texturas derivadas; Real‑ESRGAN en Replicate es una vía programática para integrar SR en cloud con costes por uso[^16][^17][^18].
- Mejora complementaria: Picsart ofrece endpoints de remove background y enhancement que pueden simplificar el número de proveedores en algunos flujos[^15].

Tabla 2. Límites de remove.bg por megapíxel (indicativo) y cuotas gratuitas

| Resolución (aprox.) | Imágenes por minuto (máx.) | Notas de plan gratuito |
|---|---:|---|
| ~1 MP (p. ej., 1200×800) | 500 | Plan gratuito: 50 llamadas/mes |
| ~4 MP (p. ej., 2500×1600) | 125 | Tamaño máx. archivo: 12 MB |
| ~10 MP (p. ej., 4000×2500) | 50 | Salida ZIP: color.jpg + alpha.png (hasta 50 MP) |
| ~25 MP (p. ej., 6250×4000) | 20 | Parámetros avanzados: roi, crop, shadow_type |
| ~50 MP (p. ej., 8000×6250) | 10 | RateLimit headers y Retry‑After para backoff |

Fuente: documentación de API de remove.bg[^13].

Tabla 3. Comparativa de APIs de background removal (síntesis)

| Proveedor | Plan gratuito | Límite clave | Formatos de salida | Notas de uso |
|---|---|---|---|---|
| remove.bg | 50 llamadas/mes | Throughput por MP (hasta 500 img/min @1MP) | PNG/JPG/WebP/ZIP; hasta 50 MP | ZIP optimiza tamaño y composición; controles de roi/crop |
| Removal.ai | 10 créditos preview/mes | Créditos | Imagen | Útil como evaluación/backup[^14] |
| Picsart (remove background) | Freemium | Rate limit por plan | Imagen | Alternativa integrada para enhancement adicional[^15] |

Fuentes: páginas y documentación de API de los proveedores[^13][^14][^15].

Conclusión: remove.bg es la opción más documentada y predecible; combinar super‑resolución (Upscayl/Real‑ESRGAN) con background removal eleva la tasa de reconstrucciones limpias, especialmente en objetos con bordes complejos y reflejos.

### 3.3 Generación de texturas PBR gratuitas

Una vez obtenida la malla, el realismo depende de los materiales PBR. Existen servicios que generan mapas (base color, normal, metallic, roughness) directamente desde texto o imagen, a resoluciones de 1K a 4K.

- Meshy AI: genera mapas PBR completos (Color, Metallic, Roughness, Normal), con opciones 1K/2K/4K, estilos artísticos y exportación compatible con DCC (Blender, Unreal, Unity). Admite mantener UV originales y fijar “seed” para reproducibilidad[^19].
- Toggle3D: crea materiales PBR a partir de texto e imagen, con texturas 4K y previsualización en tiempo real; útil para materiales hiperrealistas de producto o packaging[^20].
- Meshy 3: amplía capacidades combinando pipelines text‑to‑3D e image‑to‑3D, con PBR “baked” para modelos listos para render y engines[^21].

Tabla 4. Comparativa de generación PBR con IA

| Proveedor | Mapas PBR | Resoluciones | Entradas | Control/Reproducibilidad | Exportación/DCC |
|---|---|---|---|---|---|
| Meshy AI | Color, Metallic, Roughness, Normal | 1K/2K/4K | Texto, Imagen, modelo con UV | Seed fija; preservar UV | Plugins/formatos para Blender, Unity, Unreal |
| Toggle3D | PBR completo (4K) | Hasta 4K | Texto, Imagen | Previsualización en tiempo real | Materiales listos para render de producto |
| Meshy 3 (blog) | PBR “baked” | 1K–4K (típico) | Texto/Imagen→3D | Pipeline combinado | Exporta modelos texturizados a DCC |

Fuentes: páginas y blog oficial de Meshy; página de Toggle3D[^19][^20][^21].

Brecha: los límites gratuitos por volumen y resolución no están plenamente publicados; se recomienda validar en staging con 10–20 materiales críticos para evitar sorpresas en producción.

### 3.4 Optimización 3D gratuita (limpieza, decimado, LOD)

La preparación para web exige mallas limpias y texturas eficientes. Dos pilares OSS y una vía programática cubren la mayor parte de necesidades:

- MeshLab (OSS): filtros de limpieza (vértices duplicados, caras degeneradas, componentes flotantes), decimado controlado, remeshing y reconstrucción (Poisson, Marching Cubes). Además, ofrece PyMeshLab para automatizar por lotes[^22].
- glTF Transform (OSS): cuantización de vértices/índices, deduplicación de datos, eliminación de nodos no usados, weld/unweld, simplificación, y compresión de texturas a WebP/KTX2 (UASTC/ETC1S), con API JS/TS y CLI para pipelines reproducibles[^5].
- meshoptimizer (OSS): reindexación y optimizaciones orientadas a render en GPU, que reducen tamaño y aceleran el draw‑call pipeline en web[^29].
- Tripo AI: guías prácticas de reducción de polígonos y buenas prácticas de decimado para acelerar visualización sin perder detalles percibidos en miniatura[^35].
- RapidPipeline: artículo de referencia sobre tres estrategias de simplificación de mallas que sirve de guía para parametrizar decimados según target (móvil, web)[^36].

Tabla 5. Mapa de funciones de optimización (open‑source/CLI/SDK)

| Herramienta | Limpieza | Decimado/Remesh | Deduplicación/Prune | Texturas | Automatización |
|---|---|---|---|---|---|
| MeshLab | Sí (filtros completos) | Sí | Parcial (vía filtros) | Conversión básica | PyMeshLab (Python) |
| glTF Transform | Parcial (edición glTF) | Sí (simplify) | Sí (dedup/prune) | WebP/KTX2 (UASTC/ETC1S) | CLI y SDK JS/TS |
| meshoptimizer | — | — | Reindexación | — | Librería (integración propia) |
| RapidPipeline (guía) | — | Estrategias | — | — | Referencia metodológica |

Fuentes: documentación y repositorios oficiales[^22][^5][^29][^35][^36].

Conclusión: MeshLab se encarga de la “higiene” geométrica previa; glTF Transform optimiza el paquete glTF para web (geometría + texturas) y lo deja listo para Draco/Meshopt y KTX2.

### 3.5 Compresión y formatos 3D (glTF, Draco, Meshopt, KTX2)

La entrega web eficiente descansa en una secuencia bien elegida de compresiones y conversiones. El estándar glTF/GLB es el “molde” final; Draco comprime geometría; Meshopt acelera el render; KTX2/Basis comprime texturas con buena relación calidad/tamaño.

- Draco (Google): librería OSS para comprimir mallas y nubes de puntos; reducción típica de tamaño significativa; ampliamente adoptada en glTF y 3D Tiles[^7][^8][^30].
- glTF Transform: CLI/SDK para aplicar Draco/Meshopt, cuantización, deduplicación y compresión de texturas (WebP, KTX2) de forma reproducible[^5].
- KTX2 (Khronos): el compresor oficial de glTF para texturas soporta UASTC (alta calidad) y ETC1S (mayor compresión), con herramientas para ajustar calidad y tamaño por textura[^11].
- Cesium 3D Tiles: tiling para datasets muy grandes; integrable con Draco; ideal cuando el tamaño del asset o su distribución geográfica exige streaming progresivo y LOD estructurado[^6][^30].
- meshoptimizer: optimiza vértices/índices y animaciones, reduciendo overhead de render en cliente[^12].

Herramientas GUI complementarias (no APIs, pero útiles):
- Compress‑GLB (web) y ZenCompress (GUI): interfaces prácticas para configurar KTX2/Basis con per‑texture tuning, útiles para equipos de contenido[^40][^41].

Tabla 6. Comparativa de compresiones (geometría y texturas)

| Tecnología | Qué comprime | Ventajas | Compatibilidad | Uso típico |
|---|---|---|---|---|
| Draco | Geometría (mallas, point clouds) | Reducción sustancial de tamaño; integración con glTF y 3D Tiles | Amplia en motores y web | Malla base del modelo |
| Meshopt | Geometría/índices/animación | Render más rápido, menor overhead GPU | Buenas integraciones en viewers | Escenas con animaciones o many meshes |
| KTX2 (UASTC) | Texturas (sin pérdida perceptible) | Alta calidad, soporte de canales (normal/occlusion) | Excelente en glTF/WebGL | Texturas de alta calidad (metal, leather) |
| KTX2 (ETC1S) | Texturas (con pérdida controlada) | Tamaños muy reducidos; rápido en GPU | Excelente en glTF/WebGL | Móvil y conexiones lentas |

Fuentes: documentación y blogs técnicos[^7][^8][^5][^11][^12][^30][^6][^40][^41].

Conversión de formatos y streaming:
- Convert3D: convertidor en línea gratuito (glTF a PLY/OBJ/STL/USDZ y otros), útil para pruebas o conversiones ad‑hoc[^38].
- Cesium: tiling 3D para fotogrametría y LiDAR, escalando datasets a experiencias web sin simplificar la malla original[^6].
- RapidPipeline: guías prácticas de conversión (p. ej., USD→glTF) y optimizaciones complementarias a escala[^39].

### 3.6 Clustering de imágenes para análisis multivista

La cobertura angular y la diversidad de viewpoints determinan la calidad de la reconstrucción. Un pipeline robusto debe organizar y curar las capturas.

- Framework: scikit‑learn ofrece algoritmos de clustering (KMeans, DBSCAN, Ward) para agrupar frames por viewpoint y eliminar redundancias;可以作为第一层筛选[^31].
- mvlearn: enfoques multivista (multi‑view spectral) útiles cuando se dispone de descriptores complementarios por imagen (SIFT, embeddings CNN) para robustez[^34].
- FiftyOne (blog): flujo práctico para generar embeddings y clustering, con visualización y herramientas para entender la cobertura del dataset antes de disparar SfM[^33].

Tabla 7. Enfoques de clustering para datasets multivista

| Enfoque | Entradas | Ventajas | Herramientas |
|---|---|---|---|
| KMeans/DBSCAN (2D imagen) | Embeddings de color/PCA | Simple, rápido, suficiente para curatear | scikit‑learn |
| Ward/Agglomerative | Embeddings + distancia | Mejora cohesión intra‑grupo | scikit‑learn |
| Multiview spectral | Múltiples vistas (features heterogéneos) | Integra fuentes de evidencia | mvlearn |
| Embeddings + visualización | Features CNN + tooling | Curación interactiva y QC | Blog de Voxel51 |

Fuentes: documentación y tutoriales[^31][^34][^33].

Conclusión: comenzar con KMeans/DBSCAN sobre embeddings de frames y, cuando existan fuentes múltiples de descriptores, escalar a enfoques multivista.

### 3.7 Validación de calidad 3D automática

La calidad debe verificarse antes de publicar. RealityScan 2.0 integra una herramienta de Quality Analysis que evalúa tie points, calidad de malla y dependencias de cámara; se puede usar como referencia de checklist operativo[^32]. A nivel de mallas, MeshLab ofrece métricas y filtros de higiene; a nivel de material, glTF Transform permite comprobar consistencias y aplicar correcciones programáticas[^22][^5].

Tabla 8. Checklist de validación (operativo)

| Área | Métrica/Prueba | Herramienta | Criterio de aceptación |
|---|---|---|---|
| Geometría | Componentes flotantes, caras degeneradas, normales | MeshLab | 0 errores críticos; sin componentes <0.5% del volumen |
| Cobertura | Tie points y dependencia de cámara | RealityScan QA | Cobertura uniforme; sin “holes” relevantes |
| Texturas |Slots vacíos, canales no utilizados, resolución | glTF Transform | Texturas sin alphaPremultiplied erróneo; KTX2 válido |
| Materiales | PBR básico (albedo/metal/roughness/normal) | Inspección en viewer | Mapas presentes y coherentes con el SKU |
| Rendimiento | Tamaño GLB y tiempo a primer render | Pipeline/observabilidad | < umbral por dispositivo (p. ej., <2.5 MB GLB; <2 s TTFR en desktop) |

Fuentes: documentación y guías[^32][^22][^5].

---

## 4. Arquitecturas de referencia gratuitas y comparativas de escalabilidad

Se proponen dos arquitecturas de referencia, ambas convergentes en glTF/GLB optimizado para web y consumo por Three.js.

Arquitectura A (100% OSS)
- Captura:set de imágenes curado por clustering.
- Mejora: background removal (remove.bg o alternativas) y SR (Upscayl local o Real‑ESRGAN en Replicate como híbrido).
- Reconstrucción: COLMAP/Meshroom en GPUs locales; colas para lotes.
- PBR: generación con Meshy/Toggle3D (staging) o materiales derivados por摄影师.
- Optimización: MeshLab (limpieza) + glTF Transform (quantize, draco, meshopt, KTX2).
- Entrega: GLB en CDN; Three.js para renderizado y HDRI PBR[^2][^5][^9][^13][^16].

Arquitectura B (híbrida, cloud para picos)
- Igual que A, pero con reconstrucción en APS Reality Capture para plazos ajustados o volúmenes impredecibles; tilings en 3D Tiles si el asset es masivo o georreferenciado; se preserva glTF/GLB como formato de distribución final[^3][^6].

Tabla 9. Matriz comparativa A vs B (operación y escalabilidad)

| Criterio | Arquitectura A (OSS) | Arquitectura B (Híbrida) |
|---|---|---|
| Costo directo | Bajo (sólo infraestructura) | Variable (pago por uso APS) |
| SLA | Depende de colas internas | SLA de APS en reconstrucción |
| Complejidad | Mayor (operación GPU, tuning) | Menor en reconstrucción; mayor en integración |
| Latencia | Controlable en on‑prem | Potencialmente menor para picos |
| Escalabilidad | Limitada por capacidad GPU | Alta, bajo demanda |
| Control/Tuning | Total | Parcial (params cloud) |

Fuentes: documentación y guías de cada componente[^2][^3][^5][^6][^9][^13][^16].

Criterios de elección:
- SLA y plazos: si la entrega depende de ventanas rígidas, B con APS es más predecible.
- Coste: si el volumen es estable y presupuestable, A optimiza TCO.
- Flexibilidad y control: A facilita tuning fino de reconstrucción y QA.

---

## 5. Pipeline recomendado 2D→3D (paso a paso, mínimo costo)

1) Ingesta y curado de imágenes
- Capturar 20–80 vistas por componente con iluminación difusa y solapamiento ≥30–50%.
- Aplicar clustering con KMeans/DBSCAN para eliminar redundancias y garantizar cobertura multivista[^31][^34].

2) Mejora de imágenes
- Background removal con remove.bg (cuidando límites por MP y 50 llamadas/mes), o alternativas (Removal.ai, Picsart) para backups o casos específicos[^13][^14][^15].
- Super‑resolución con Upscayl (desktop, OSS) o Real‑ESRGAN en Replicate para escalar imágenes clave (marcas, serifas, detalles metálicos)[^16][^17][^18].

3) Reconstrucción 3D
- OSS (COLMAP/Meshroom) como base; ejecutar SfM/MVS con parámetros consistentes y registrar métricas (tie points, cobertura).
- Para picos o deadlines, desviar a APS Reality Capture y evaluar el trade‑off coste/tiempo[^2][^3][^26].

4) Generación PBR
- Con Meshy AI o Toggle3D, generar mapas PBR (1K–4K) y validar en viewer que los parámetros de metallic/roughness reproducen el material real del componente (acabados, leather, metal brushed)[^19][^20][^21].

5) Optimización y compresión
- Limpiar geometría con MeshLab (errores topológicos, componentes pequeños).
- Empaquetar a glTF y aplicar con glTF Transform: quantize, draco, meshopt, KTX2 (UASTC/ETC1S) según dispositivo objetivo[^22][^5][^11][^7][^12].

6) Validación automática
- Checklist geométrico en MeshLab; QA de malla y cámara con RealityScan QA; validación de texturas/materiales con glTF Transform; test visual en Three.js (FPS, TTFR)[^32][^22][^5][^9].

7) Publicación y CDN
- versionado semántico de GLB; headers de cache; pruebas A/B de compresión (UASTC vs ETC1S; Draco vs Meshopt) para cohortes de dispositivos[^5][^11][^12].

Tabla 10. Checklist de QA por etapa

| Etapa | Control | Criterio |
|---|---|---|
| Captura | Cobertura angular | ≥20 vistas; solapamiento ≥30–50% |
| Mejora | Bordes y alpha | Sin halos; alpha correcto en ZIP (remove.bg) |
| Reconstrucción | Tie points/errores | Sin huecos relevantes; reproyección baja |
| PBR | Mapas presentes | Albedo/metal/roughness/normal coherentes |
| Optimización | Tamaños/formatos | GLB < objetivo; KTX2 válido; Draco/Meshopt aplicados |
| Publicación | Rendimiento | TTFR y FPS dentro de umbral por dispositivo |

Fuentes: documentación técnica mencionada en cada etapa[^31][^13][^2][^3][^19][^22][^5][^32][^9].

---

## 6. Riesgos, brechas y plan de mitigación

Riesgos técnicos
- Calidad variable por reconstrucción: iluminaciones difíciles, reflejos espejo, translucidez. Mitigación: guía de captura con iluminación difusa y backgrounds limpios; doble pasada de background removal; QA con RealityScan y validación visual en viewer[^32].
- Over‑compression de texturas: pérdida de microdetalles en metálicos y grabados. Mitigación: seleccionar UASTC para flagships; ETC1S solo para cohortes móviles de baja red; usar guías Khronos para tuning fino[^11].

Riesgos operativos
- Rate limits en APIs (p. ej., remove.bg): saturación en lotes grandes. Mitigación: colas con backoff exponencial; distribuir horas valle; fallback a alternativas (Removal.ai/Picsart) para previews[^13][^14][^15].
- Ausencia de métricas estandarizadas de “calidad 3D”: dificultad para CI/CD. Mitigación: proxies (checklist geométrico/textural, TTFR, FPS, tasa de error de visualización) y evaluación muestral por SKU.

Licenciamiento y compliance
- RealityScan 2.0: licencia gratuita para individuos, PYMEs (<$1M) y educadores; fuera de esos casos, se requiere licencia comercial. Asegurar elegibilidad antes de escalar y establecer gobernanza documental[^25].

Plan de pruebas y gobernanza
- Piloto con 3–5 componentes (caja, bisel, correa) y 2 proveedores por categoría (p. ej., remove.bg + Removal.ai; Meshy + Toggle3D). 
- Tablero de métricas (TTFR, FPS, tamaño GLB, tasa de rechazo por QA) con umbrales por tipo de dispositivo.
- Revisión mensual de límites/pricing de APIs; pruebas de estrés trimestrales con datasets sintéticos para validar escalabilidad.

Tabla 11. Matriz de riesgo (probabilidad/impacto/mitigación)

| Riesgo | Prob. | Impacto | Mitigación |
|---|---:|---:|---|
| Reconstrucción deficiente | Media | Alta | Guía de captura; QA tool; doble limpieza |
| Texturas sobre‑comprimidas | Media | Media | UASTC para alta gama; pruebas A/B por dispositivo |
| Rate limit en removal | Alta | Media | Colas + backoff; proveedor secundario |
| Cambios de límites/pricing | Media | Media | Monitoreo trimestral; contratos/cupos |
| No elegibilidad de licencia | Baja | Alta | Validar elegibilidad RealityScan; docs al día |

Fuentes: documentación de licencias y herramientas[^25][^32][^13][^11].

---

## 7. Conclusiones y roadmap de adopción

Conclusiones ejecutivas
- El ecosistema 2024–2025 permite construir un pipeline 2D→3D de alta calidad con un núcleo OSS robusto y una “capa cloud” opcional para picos y SLA. OSS controla costos y tuning; cloud aporta elasticidad y velocidad. La clave está en integrar compresión nativa de glTF y texturas KTX2 para garantizar tiempos de carga y FPS competitivos en web[^5].
- Para un configurador de lujo, la cadena de valor se reparte así: (i) captura y limpieza de imágenes determinan el techo de calidad; (ii) la reconstrucción OSS (COLMAP/Meshroom) o cloud (APS) entrega la base; (iii) la generación PBR con IA acerca el material al acabado real; (iv) glTF Transform + Draco/Meshopt/KTX2 aseguran la entrega en web con calidad y rendimiento.
- La validación automática no debe ser un “NO GO” ciego; debe operar como un checklist operacional con muestreo sistemático y revisión por dispositivo. RealityScan QA y glTF Transform ofrecen, respectively, diagnósticos de reconstrucción y correcciones a nivel de paquete.

Roadmap propuesto
- Fase 1 (4–6 semanas): POC con Arquitectura A en un componente (p. ej., caja). Objetivo: GLB optimizado <2.5 MB con texturas KTX2 UASTC y FPS≥60 en desktop. Entregables: guía de captura, script de optimización (glTF Transform CLI), QA checklist y viewer de prueba[^5][^9].
- Fase 2 (8–12 semanas): MVP con 3–5 componentes, ingestión batch y doble proveedor de background removal. Objetivo: pipeline reproducible, 10+ activos/semana, SLA interno de 24–48 h. Añadir pruebas A/B de compresión (UASTC vs ETC1S; Draco vs Meshopt) por cohortes de dispositivos[^5][^11][^12].
- Fase 3 (continuo): escalada del catálogo; tiling 3D Tiles para colecciones o escenas grandes; integración de RealityScan QA como control de calidad; gobernanza de métricas (TTFR, FPS, tamaño GLB, tasa de rechazo)[^6][^32].

KPIs sugeridos
- Rendimiento web: TTFR (p50/p95) por dispositivo; FPS en interacción; tamaño medio de GLB.
- Calidad: tasa de aprobación de QA sin retrabajo; número de iteraciones de captura por SKU.
- Operación: tiempo de ciclo por componente; costo por activo (incluyendo GPU/h); adherence a SLA.
- Observabilidad: panel con métricas por etapa (captura, mejora, reconstrucción, optimización, publicación).

En síntesis, la combinación de OSS maduro y servicios gratuitos/freemium bien orquestados permite superar la rigidez de los configuradores cerrados y habilitar una personalización verdaderamente dinámica, sin comprometer calidad ni costos.

---

## Referencias

[^1]: Nike: Custom Nike Air Max 90 Shoes “By You”. https://www.nike.com/es/u/custom-nike-air-max-90-shoes-by-you-10002041/2667687259#Builder  
[^2]: COLMAP: Structure‑from‑Motion and Multi‑View Stereo (GitHub). https://github.com/colmap/colmap  
[^3]: Autodesk Platform Services (APS): Reality Capture API. https://aps.autodesk.com/reality-capture-api  
[^4]: Polycam: Photogrammetry – Free Tool. https://poly.cam/tools/photogrammetry  
[^5]: glTF Transform – Documentation. https://gltf-transform.dev/  
[^6]: Cesium ion: 3D Tiling for Photogrammetry. https://cesium.com/learn/3d-tiling/ion-tile-photogrammetry/  
[^7]: Draco 3D Graphics Compression (GitHub). https://github.com/google/draco  
[^8]: Draco: GitHub.io. https://google.github.io/draco/  
[^9]: Three.js – JavaScript 3D Library. https://threejs.org/  
[^10]: Babylon.js – Web‑based 3D. https://www.babylonjs.com/  
[^11]: Khronos: glTF Compressor Tool (KTX2/Basis). https://www.khronos.org/blog/optimize-3d-assets-with-khronos-new-gltf-compressor-tool  
[^12]: meshoptimizer (Site). https://meshoptimizer.org/  
[^13]: Remove.bg: API Documentation. https://www.remove.bg/api  
[^14]: Removal.ai: API Documentation. https://removal.ai/api-documentation/  
[^15]: Picsart: Remove Background API. https://picsart.io/remove-background/  
[^16]: Upscayl – AI Image Upscaler (Site). https://upscayl.org/  
[^17]: Upscayl – GitHub. https://github.com/upscayl/upscayl  
[^18]: Real‑ESRGAN on Replicate. https://replicate.com/nightmareai/real-esrgan  
[^19]: Meshy AI: Generate Texture Maps (PBR). https://www.meshy.ai/features/ai-texture-generator  
[^20]: Toggle3D: Generate PBR Material with AI. https://toggle3d.com/ai  
[^21]: Meshy 3: Sculptures, PBR, and Image to 3D. https://www.meshy.ai/blog/meshy3-sculptures-pbr-and-image-to-3d  
[^22]: MeshLab – Open‑Source 3D Mesh Processing. https://www.meshlab.net/  
[^23]: RealityScan: 3D models from images and laser scans. https://www.realityscan.com/  
[^24]: RealityScan 2.0: News Release. https://www.realityscan.com/en-US/news/realityscan-20-new-release-brings-powerful-new-features-to-a-rebranded-realitycapture  
[^25]: RealityScan License (Free/Commercial). https://www.realityscan.com/en-US/license  
[^26]: Meshroom: AliceVision – Node‑based Photogrammetry. https://github.com/alicevision/Meshroom  
[^27]: Adobe open‑sources USD conversion plugins (CG Channel). https://www.cgchannel.com/2024/03/adobe-open-sources-its-usd-conversion-plugins/  
[^28]: RapidPipeline: USD→glTF Conversion Guide. https://rapidpipeline.com/en/a/conversions-usd-to-gltf/  
[^29]: meshoptimizer (Site). https://meshoptimizer.org/  
[^30]: Cesium: Draco Compressed Meshes with glTF and 3D Tiles. https://cesium.com/blog/2018/04/09/draco-compression/  
[^31]: scikit‑learn: Machine Learning in Python. https://scikit-learn.org/  
[^32]: RealityScan Help: Quality Analysis Tool. https://rshelp.capturingreality.com/en-US/tools/qualityanalysis.htm  
[^33]: Voxel51 Blog: How to Cluster Images. https://voxel51.com/blog/how-to-cluster-images  
[^34]: mvlearn: Multiview Spectral Clustering Tutorial. https://mvlearn.github.io/auto_examples/cluster/plot_mv_spectral_tutorial.html  
[^35]: Tripo AI: How to Reduce Polygon Count on Your 3D Mesh. https://www.tripo3d.ai/blog/collect/how-to-reduce-polygon-count-on-your--d-mesh-grd71-wxria  
[^36]: RapidPipeline: Mesh Simplification – 3 Ways. https://rapidpipeline.com/en/a/mesh-simplification-3-ways-to-optimize/  
[^37]: Convert3D: Online 3D Converter. https://convert3d.org/  
[^38]: Convert3D: GLTF Converter. https://convert3d.org/convert/gltf  
[^39]: RapidPipeline: USD→glTF Conversion Guide. https://rapidpipeline.com/en/a/conversions-usd-to-gltf/  
[^40]: Compress‑GLB (web app). https://sourceforge.net/software/compare/Compress-GLB-vs-F3D/  
[^41]: Paradowski: Introducing ZenCompress for glTF. https://paradowski.com/stories/introducing-zencompress-for-gltf

---

Nota sobre brechas de información:
- Algunos servicios (p. ej., Polycam y Meshy) no publican de forma exhaustiva y estable los límites del plan gratuito para todas las funciones; se recomienda validar mediante pruebas controladas antes de escalar a producción. Además, las métricas objetivas de “calidad 3D” aún no están estandarizadas para evaluación automática plena; este informe propone proxies operativos basados en QA de reconstrucción y pruebas de rendimiento web.
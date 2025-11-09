# Arquitectura de Equipo de Agentes Especializados para Optimizar el Pipeline 2D→3D

## Resumen ejecutivo y objetivos del pipeline 2D→3D

Este documento define una arquitectura de agentes especializados que automatizan el pipeline de transformación de imágenes 2D en activos 3D listos para web, con foco en componentes de relojes de lujo. La propuesta parte de la propuesta técnica existente y la lleva a producción mediante una orquestación inteligente, modular y escalable: desde la captura y análisis de calidad de las imágenes, hasta la optimización de rendimiento, la validación de calidad del modelo 3D y la generación de metadatos para SEO y catálogo.

El enfoque combina control de costos y rendimiento con un esquema híbrido: uso de COLMAP como pipeline por defecto y desvío a Autodesk Platform Services (APS) en picos de demanda o cuando se requieran garantías de SLA. Los activos se publican en formatos glTF/GLB con compresión Draco y texturas KTX2, entregando una experiencia fluida en configuradores web basados en Three.js o Babylon.js, y con distribución global vía CDN.

Resultados esperados:
- Tiempo de ciclo: menos de 24 horas desde la subida de imágenes hasta la publicación de un componente en el configurador.
- Calidad visual: fidelidad geométrica y material consistente, sustentada por métricas automáticas y controles de QA.
- Rendimiento web: modelos optimizados para 60 FPS en dispositivos modernos con carga progresiva y LODs.
- Escalabilidad: procesamiento híbrido COLMAP/APS con colas inteligentes y política de costos.

Figura 1. Configurador 3D de referencia: estándar de calidad visual a igualar o superar.  
![Configurador 3D de referencia: estándar de calidad visual a igualar o superar.](configuradores_3d_4.jpg)

La elección de Three.js o Babylon.js como motor de render se apoya en su madurez, soporte PBR y amplia adopción en web[^4][^5]. La optimización de activos con glTF-Transform (Draco, texturas) asegura tiempos de carga reducidos y calidad consistente[^6].

---

## Visión general de la arquitectura de agentes y flujo E2E

La arquitectura se organiza como una cadena de agentes especializados, conectados por un bus de eventos y orquestados por un coordinador que gestiona estados, colas y contratos de calidad. El flujo end-to-end (E2E) es:

Captura/Upload → Análisis de Calidad → Optimización de Captura → Selección de Técnica 2D→3D → Reconstrucción → Validación/QA → Optimización de Performance → Generación de Metadatos → Publicación → CDN → Visualizador.

Cada agente:
- Consume eventos estructurados con payloads de metadatos (Calidad, Técnica, Reconstrucción, Performance, Publicación).
- Produce artefactos y registros auditables, actualizando el estado de cada “job” (proceso).
- Expone KPIs por etapa (por ejemplo, porcentaje de imágenes aptas, tiempo de reconstrucción, tamaño de GLB, latencias en percentiles).

La orquestación se realiza por un coordinador que:
- Decide la técnica de reconstrucción (COLMAP, APS o híbrido) en función de calidad, costos y SLA.
- Gestiona colas y prioridades, y activa reroute automático si se violan umbrales de calidad o tiempo.
- Publica eventos para los agentes posteriores y para auditoría.

Figura 2. Componentes del reloj a considerar en el flujo de agentes.  
![Componentes del reloj a considerar en el flujo de agentes.](componentes_relojes_9.jpg)

El diseño está alineado con el pipeline descrito en la propuesta técnica: procesamiento de imágenes, reconstrucción 2D→3D, optimización de activos y visualización web[^4][^5][^6]. COLMAP aporta la base open-source para SfM/MVS, mientras que APS se integra como escalón elástico con SLA cuando el backlog supera umbrales o cuando la calidad requerida lo aconseja[^2][^3].

---

## Agente 1: Análisis de Calidad de Imágenes

Función. Evalúa automáticamente nitidez, exposición, resolución efectiva, uniformidad de fondo y cobertura angular, generando una puntuación compuesta y un ranking de mejores ángulos. Este diagnóstico es la base para decidir si se puede reconstruir con garantías o si se requieren nuevas capturas.

Inputs/outputs. El agente recibe imágenes y metadatos EXIF (focal, apertura, tiempo de exposición, ISO, modelo de cámara). Produce un informe por set con indicadores por imagen, una puntuación global y recomendaciones operativas (por ejemplo, “añadir 10 imágenes a 30°–45°”).

Tecnologías sugeridas. Métricas de nitidez (varianza del Laplaciano), histograma y exposición, estimación de fondo neutro y consistencia de iluminación, conteo de puntosSfM/MVS y coverage estimado mediante descriptores. Se apoya en heurísticas robustas inspiradas por la lógica de COLMAP para estimar la utilidad de cada vista en la reconstrucción[^2].

Integración con Gemini 2.0. El agente genera un resumen textual en lenguaje natural del diagnóstico, explicando los riesgos de reconstrucción y las acciones sugeridas. Este resumen se adjunta al evento de salida para consumo del coordinador y del panel de control.

Para operacionalizar los criterios, se propone la siguiente escala de evaluación:

Tabla 1. Escala de calidad de imagen y umbrales de aceptación/rechazo
| Criterio                          | Métrica operativa                            | Umbral recomendado                 |
|-----------------------------------|----------------------------------------------|------------------------------------|
| Nitidez                           | Varianza del Laplaciano                      | ≥ 110 por imagen                   |
| Exposición                        | Porcentaje de píxeles saturados              | ≤ 1% en luces, ≤ 3% en sombras     |
| Resolución efectiva               | Ancho/Alto en píxeles                        | ≥ 2000 px en lado mayor            |
| Fondo neutro                      | Desviación estándar en áreas de fondo        | ≤ 15 niveles en canal dominante    |
| Cobertura angular                 | Conteo y distribución de orientaciones       | 30–80 imágenes, gaps ≤ 30°         |
| Iluminación                       | Consistencia inter-vista (histogramas)       | ΔE medio ≤ 5 entre vistas          |

Interpretación. Estos umbrales minimizan fallos de correspondencias y facilitan una reconstrucción densa confiable. La cobertura angular reduce holes y mejora la completitud del modelo. Con umbrales estrictos en pre-captura se снижает el retrabajo en QA.

A continuación, se propone un ranking de ángulos que maximiza la diversidad de viewpoints y la robustez de matching:

Tabla 2. Ranking de ángulos recomendados
| Ángulo de cámara (respecto al objeto) | Prioridad | Justificación técnica                            |
|---------------------------------------|-----------|--------------------------------------------------|
| Frontal (0°)                          | Alta      | Semilla de correspondencias y calibración        |
| 30°                                   | Alta      | Profundidad y textura visible                    |
| 45°                                   | Alta      | Compleción de superficies oblicuas               |
| 60°                                   | Media     | Mejora de reconstrucción lateral                 |
| 90° (perfil)                          | Media     | Definición de cantos y límites                   |
| 120°                                  | Media     | Cobertura posterior parcial                      |
| 135°                                  | Media     | Continuidad y robustez de matching               |
| 180° (posterior)                      | Baja      | Útil si hay patrones o texturas distintivas      |

Interpretación. Este ranking prioriza vistas que contribuyen a correspondencias robustas y a una malla completa. No es exhaustivo; el agente puede ajustar prioridades según el componente (por ejemplo, bisel con relief fino).

---

## Agente 2: Optimización de Captura (guías inteligentes y tiempo real)

Función. Convierte el diagnóstico del Agente 1 en guías accionables: disposición de luces, posiciones de cámara, número de fotos, corrección de pose y sugerencias de reapertura si la cobertura es insuficiente. Opera como asistente en tiempo real durante sesiones de estudio o capture-at-home.

Inputs/outputs. Recibe el informe de calidad y contexto del componente. Produce checklists interactivos por toma y rutas de captura con checkpoints de calidad.

Tecnologías sugeridas. Asistentes visuales y reglas de fotogrametría aplicadas a piezas reflectantes, con generación de prompts de iluminación y posicionamiento. El agente puede sugerir iluminaciones difusas, ángulos de luz y acciones específicas (por ejemplo, “usar luz lateral a 30° para resaltar grabado del bisel”).

Integración con Gemini 2.0. Convierte las reglas técnicas en prompts operativos comprensibles: “Iluminación: dos softboxes a 45°, cámara a 0.6 m, apertura f/8, ISO 100”. Estos prompts se entregan al operador junto con la razón técnica detrás de cada recomendación.

Para estandarizar la captura por componente, se define un catálogo de guías:

Tabla 3. Plantilla de guía de captura por componente
| Componente | Ángulos recomendados                         | Iluminación                      | Notas de pose                                      |
|------------|----------------------------------------------|----------------------------------|----------------------------------------------------|
| Caja       | 0°, 30°, 45°, 60°, 90°, 120°, 135°           | Difusa, sin reflejos especulares | Mantener corona y asas visibles en 45° y 90°      |
| Bisel      | 0°, 30°, 45°, 60°, 90°                       | Luz lateral a 30° para grabado   | Evitar huellas; usar glove y soporte antideslizante|
| Esfera     | 0°, 15°, 30°, 45°, 60°, 90°                  | Luz frontal difusa               | Evitar reflejos en cristal; ajustar altura de cámara|
| Correa     | 0°, 45°, 90°, 135° (top y lateral)           | Luz uniforme                     | Mantener tensión uniforme; evitar pliegues         |

Interpretación. La plantilla reduce variabilidad entre sesiones y acorta la curva de aprendizaje. El agente verifica si la sesión cumple cada checkpoint y bloquea la reconstrucción hasta alcanzar mínimos aceptables.

---

## Agente 3: Selección de Técnica 2D→3D (COLMAP, APIs comerciales o híbrido)

Función. Decide la técnica de reconstrucción según calidad de entrada, costo por gigapíxel, latencia requerida y criticidad del SLA. Prioriza COLMAP por defecto y activa APS en casos de alto volumen, picos o requisitos de tiempo.

Inputs/outputs. Recibe indicadores de calidad de las imágenes, tamaño del dataset (número de imágenes, resolución total), presupuesto y SLA. Produce el plan de ejecución (técnica, recursos, ventanas de tiempo, política de reroute).

Tecnologías sugeridas. COLMAP para SfM/MVS; APS Reality Capture para escalado con SLA. El agente usa umbrales y ranking de alternativas con trackeo de colas para minimizar tiempos y costos[^2][^3].

Integración con Gemini 2.0. Genera un resumen del criterio de elección, explicando por qué se选择了 COLMAP, APS o un esquema híbrido, en lenguaje claro para auditoría.

Para guiar la decisión, se propone la siguiente matriz:

Tabla 4. Matriz de decisión de técnicas
| Criterio                      | COLMAP (OSS)                         | APS (API comercial)                    |
|------------------------------|--------------------------------------|----------------------------------------|
| Calidad esperada             | Alta si set cumple umbrales          | Alta y consistente                     |
| Costo                        | Capex/Opex de GPU; sin licencia      | Por uso (créditos por gigapíxel)       |
| Latencia                     | Depende de GPU y cola interna        | SLA definido                           |
| SLA                          | Interno, sin contrato                 | Comercial                              |
| Flexibilidad                 | Total (tuning, control de pasos)     | Menor; encapsulado por API             |
| Operación                    | Requiere orquestación propia         | Descompresión operativa                |

Interpretación. El esquema híbrido permite optimizar costos en operaciones normales sin renunciar a elasticidad y garantías en picos o campañas. La política de desvío puede dispararse por backlog, por thresholds de calidad o por ventanas de mantenimiento.

Una política operativa tipo podría ser:

Tabla 5. Política de desvío a APS
| Condición                            | Acción                          |
|--------------------------------------|---------------------------------|
| Backlog > 10 jobs o TPT > 12 h       | Desviar jobs no críticos a APS  |
| Gigapíxel total > X en 24 h          | Activar lote APS escalonado     |
| SLA breached o cerca                 | Priorizar APS para jobs críticos|
| Fallo de reconstrucción en COLMAP    | Reintento en APS si viable      |

Interpretación. La política prioriza cumplimiento de SLA sin renunciar al control de costos. El agente monitorea el backlog y ajusta el desvío dinámicamente.

---

## Agente 4: Validación y QA del modelo 3D

Función. Ejecuta validación automática y semi-automatizada del modelo 3D generado: cobertura geométrica, artefactos, colorimetría y consistencia de materiales. Aplica thresholds y, cuando se requiere, habilita revisión manual en un panel con comparativas lado a lado y herramientas de medición.

Inputs/outputs. Recibe malla y texturas (y/o Gaussian Splat si se usa para marketing), y produce un informe de QA con evidencia visual, métricas y recomendación de aceptación/rechazo.

Tecnologías sugeridas. Métricas de completitud de malla,偏差 geométrica estimada por comparación con proxies, análisis de UVs y consistencia PBR (albedo, roughness, metallic). Se apoya en la estructura y herramientas propias del pipeline para inspeccionar resultados antes de optimización[^2].

Integración con Gemini 2.0. Genera explicaciones de fallos y recomendaciones de corrección (por ejemplo, “añadir vistas a 30°–45° en el lado izquierdo para reducir hole en tapa de corona”).

Para estandarizar decisiones, se definen KPIs de QA:

Tabla 6. KPIs de QA y umbrales
| KPI                                | Definición                                      | Umbral mínimo             |
|------------------------------------|--------------------------------------------------|---------------------------|
| Completitud de malla               | % de superficie sin holes                        | ≥ 98%                     |
| Ruido geométrico                   | Desviación media respecto a proxy local          | ≤ 0.2 mm (componentes < 40 mm) |
| Consistencia de color              | ΔE medio entre vistas mapeadas                   | ≤ 5                       |
| Consistencia PBR                   | Coherencia de mapas (albedo, roughness, metallic)| Sin artefactos visibles   |
| Topología                          | Triángulos por unidad de área, normales consistentes | Sin flipped normals  |

Interpretación. Estos KPIs separan la aceptación técnica de la publicación. Modelos por debajo de thresholds se rechazan con recomendaciones específicas para nuevas capturas o para reroute a APS si el problema es de cobertura.

---

## Agente 5: Optimización de Performance

Función. Transforma el modelo validado en un activo web optimizado: decimación de malla, compresión Draco, texturas en KTX2/Basis, generación de LODs y empaquetado GLB. Se enfoca en equilibrar fidelidad visual y rendimiento (FPS, peso de descarga).

Inputs/outputs. Recibe la malla y texturas originales; produce GLB optimizado, variantes LOD y un informe de rendimiento (tamaños, perfiles de carga, tiempo de decodificación estimado).

Tecnologías sugeridas. glTF-Transform para compresión y empaquetado, flujos automatizados con políticas LOD. Considera caché en CDN y carga diferida por escena[^6].

Integración con Gemini 2.0. Genera resúmenes de decisiones de optimización (por ejemplo, “se aplicó decimación 40% en LOD1 para保持在 móviles 60 FPS con textura 1K”).

Las políticas de LOD se articulan por dispositivo y complejidad:

Tabla 7. Políticas LOD por dispositivo y complejidad
| Dispositivo         | Complejidad malla original | LOD0 (descarga) | LOD1 (transición) | LOD2 (lejos) | Texturas |
|---------------------|----------------------------|------------------|-------------------|--------------|----------|
| Desktop (GPU alta)  | Alta                       | 100%             | 60%               | 30%          | 2K KTX2  |
| Desktop (GPU media) | Media                      | 80%              | 50%               | 25%          | 1K KTX2  |
| Móvil               | Alta                       | 60%              | 40%               | 20%          | 1K KTX2  |
| Móvil               | Media/Baja                 | 50%              | 30%               | 20%          | 1K/512   |

Interpretación. Estas reglas aseguran una experiencia fluida sin sacrificar fidelidad donde es perceptible (primer plano). El agente puede ajustar decimación y texturas según escena y material.

Para visualizar impacto, se propone el siguiente cuadro comparativo:

Tabla 8. Impacto de optimizaciones en tiempo y tamaño
| Configuración          | Tamaño GLB | Tiempo de decodificación | FPS objetivo | Nota                         |
|------------------------|------------|---------------------------|--------------|------------------------------|
| Sin Draco/KTX2         | 100%       | 100%                      | 45–55        | Referencia                   |
| Draco ON, KTX2 2K      | 40–50%     | 80–90%                    | 55–60        | Desktop GPU media/alta       |
| Draco ON, KTX2 1K      | 30–40%     | 70–80%                    | 58–60        | Móvil y desktop GPU baja     |
| LOD1+LOD2 + KTX2 1K    | 20–30%     | 60–70%                    | 60           | Escenas con múltiples piezas |

Interpretación. La compresión Draco y texturas KTX2 reducen significativamente el tamaño; los LODs recortan complejidad geométrica en vistas lejanas. El agente selecciona automáticamente la combinación según dispositivo y escena.

---

## Agente 6: Generación de Metadatos (descripciones y SEO)

Función. Produce descripciones legibles y etiquetas (tags) para catálogo, SEO y búsquedas internas: título SEO, alt text, etiquetas de material y estilo, variantes de color y estructura semántica del catálogo.

Inputs/outputs. Recibe componentes, materiales, acabado y variantes. Produce textos y metadatos listos para CMS, API de catálogo y CDN.

Tecnologías sugeridas. NLP de alto nivel, normalización de materiales y taxonomía propia (acabados, colores, estilos), con control de marca y consistencia.

Integración con Gemini 2.0. Genera descripciones ricas y llamadas a la acción en lenguaje natural, ajustadas al tono de marca, y produce resúmenes explicativos de las decisiones de etiquetado.

Tabla 9. Esquema de metadatos SEO y catálogo
| Campo          | Descripción                                   | Ejemplo                                    |
|----------------|-----------------------------------------------|--------------------------------------------|
| título_SEO     | Título optimizado para búsqueda                | “Bisel pulido de acero 40 mm — Acabado Mirror” |
| alt_text       | Texto alternativo accesible                    | “Bisel de caja de acero con grabado日内瓦波纹” |
| tags_material  | Etiquetas normalizadas                         | [“acero 316L”, “pulido”, “mirror”]          |
| estilo         | Estilo visual                                  | [“moderno”, “elegante”]                     |
| color_variante | Variantes cromáticas                           | [“negro DLC”, “plateado”]                   |
| taxonomía      | Estructura jerárquica                          | Reloj → Caja → Bisel → Acabados             |

Interpretación. Este esquema habilita búsqueda facetada, consistencia editorial y accesibilidad. Los tags normalizados mejoran la recuperación semántica y el SEO técnico.

---

## Orquestación, orquestador y Gemini 2.0 como capa de inteligencia

El coordinador es el núcleo operativo de la arquitectura. Expone endpoints internos y procesa eventos con payloads estandarizados (Calidad, Captura, Técnica, Reconstrucción, Performance, Publicación). Gestiona:
- Decisiones automatizadas (técnica, desvío APS, LODs).
- Reroute por calidad o por SLA (por ejemplo, reintentos en APS si COLMAP falla o excede tiempos).
- Auditoría: trazas de decisiones, versiones de modelos y transformaciones aplicadas.

Gemini 2.0 se integra en dos niveles:
- En cada agente, genera resúmenes explicativos de decisiones técnicas y recomendaciones operativas.
- En el coordinador, compone “diarios de decisiones” que ayudan a PMs, QAs y marketing a entender qué se hizo y por qué, con lenguaje claro y evidencia.

El estado del job fluye con transiciones explícitas y puntos de control de calidad:

Tabla 10. Máquina de estados del job
| Estado              | Transición principal                       | Punto de control QA                   |
|---------------------|--------------------------------------------|---------------------------------------|
| Capturado           | → Análisis de Calidad                      | —                                     |
| Calidad OK          | → Selección de Técnica                      | Umbrales de calidad                   |
| Técnica Elegida     | → Reconstrucción                            | Validación técnica                    |
| Reconstruido        | → QA                                        | KPIs de QA                            |
| QA Aprobado         | → Optimización de Performance               | Checklist QA final                    |
| Optimizado          | → Publicación                               | —                                     |
| Publicado           | → CDN / Visualizador                        | Smoke tests en escena                 |
| Rechazado           | → Optimización de Captura / Recaptura       | Registro de motivo                    |

Interpretación. La máquina de estados formaliza el flujo y habilita reintentos selectivos. Cada transición se condiciona a umbrales verificables y a la evidencia del agente correspondiente.

---

## Datos, almacenamiento y formatos (glTF/GLB, Draco, KTX2, CDN)

- Formato base. glTF/GLB como estándar de intercambio y entrega.
- Compresión de geometría. Draco para reducir significativamente el tamaño de la malla.
- Texturas. Basis Universal en contenedores KTX2 para compatibilidad y eficiencia en GPU.
- Entrega. CDN para baja latencia global; versionado semántico; invalidación y cachés por región.

Tabla 11. Esquema de almacenamiento y estrategia de caché/CDN
| Ruta lógica             | Política de versión          | TTL     | Invalidación                     | Notas                           |
|-------------------------|------------------------------|---------|----------------------------------|----------------------------------|
| /models/{sku}/{ver}/    | semver (Mayor.Menor.Patch)   | 30 días | Cambio de hash o semver          | GLB con Draco, LODs              |
| /textures/{sku}/{ver}/  | semver + hash de contenido   | 60 días | Reprocesamiento de texturas      | KTX2 1K/2K                       |
| /metadata/{sku}.json    | semver                       | 7 días  | Al publicar nuevo GLB             | Consistencia con CMS             |
| /logs/{date}/           | fecha                         | 90 días | —                                | Auditoría y trazabilidad         |

Interpretación. La estrategia equilibra frescura y consistencia. Los assets versionados facilitan rollbacks y comparativas A/B en el visualizador, mientras los TTLs evitan acumulación innecesaria en caché.

---

## Seguridad, gobernanza y cumplimiento

- Accesos. Control por roles (RBAC): administradores de contenido, operadores de captura, equipo de QA, responsables de publicación y viewers de auditoría.
- Auditoría. Trazabilidad de decisiones y transformaciones; retención de logs para reproducibilidad y soporte.
- Privacidad. Gestión de imágenes de producto y metadatos; alineación con normativa aplicable (GDPR/CCPA) mediante políticas de minimización, retención y anonimización cuando proceda.

Tabla 12. Matriz de roles y permisos
| Rol                    | Subir | Validar QA | Publicar | Aprobar metadatos | Ver auditoría |
|------------------------|-------|------------|----------|-------------------|---------------|
| Admin de contenido     | Sí    | No         | No       | Sí                | Sí            |
| Operador de captura    | Sí    | No         | No       | No                | Sí            |
| QA                     | No    | Sí         | No       | No                | Sí            |
| Responsable publicación| No    | Sí         | Sí       | Sí                | Sí            |
| Marketing              | No    | No         | No       | Sí                | Sí            |
| Auditor (compliance)   | No    | No         | No       | No                | Sí            |

Interpretación. La segregación de funciones reduce riesgos operativos y garantiza que la publicación solo ocurra tras QA y validación de metadatos.

---

## Plan de validación, KPIs y roadmap de implementación

Plan de validación. Se propone ejecutar pruebas con al menos tres componentes: caja, bisel y correa. En cada ciclo se registran métricas de calidad, tiempo y rendimiento web para calibrar umbrales y políticas.

KPIs. Tiempo total de procesamiento, tamaño y FPS por dispositivo, tasa de éxito de reconstrucción, costo por modelo, porcentaje de reutilización de captura, rechazos de QA y causas.

Roadmap. En línea con la propuesta: POC (4–6 semanas), MVP (8–12 semanas) y producción continua, con evaluación de 3D Gaussian Splatting para piezas de marketing que requieran vistas fotorrealistas no interactivas[^7].

Tabla 13. Tablero de KPIs por etapa y por agente
| Etapa                    | KPI principal                         | Objetivo inicial            |
|--------------------------|---------------------------------------|-----------------------------|
| Captura/Análisis         | % imágenes aptas                      | ≥ 90%                       |
| Técnica 2D→3D            | Tiempo de reconstrucción (p95)        | ≤ 6 h (COLMAP), SLA APS     |
| QA                       | Tasa de aceptación                    | ≥ 85% en primera pasada     |
| Performance              | Tamaño GLB promedio                   | ≤ 8 MB (caja + bisel)       |
| Publicación/CDN          | TtFB (p95)                            | ≤ 1.5 s en regiones clave   |
| Visualizador             | FPS (p50/p95)                         | 60/55 FPS en desktop moderno|
| Metadatos                | Cobertura de tags normalizados        | ≥ 95%                       |

Interpretación. Estos objetivos son puntos de partida que se ajustan tras los primeros ciclos de validación. La combinación de KPIs técnicos y de experiencia asegura que calidad y rendimiento no se descarten mutuamente.

---

## Información faltante (gaps) y supuestos de trabajo

Para alcanzar los objetivos del sistema, se deben resolver los siguientes gaps con decisiones de producto e ingeniería:
- Requisitos de infraestructura exactos: disponibilidad de GPUs, configuración de colas y SLAs internos por etapa.
- Umbrales definitivos de aceptación de calidad: окончательные thresholds de nitidez, exposición y cobertura angular por tipo de componente.
- Presupuesto permitido para uso de APS y política de límites de costo mensual.
- Disponibilidad y formato de datasets de entrenamiento para generadores PBR y mejora de texturas.
- Lineamientos de SEO y naming taxonomy oficiales para metadatos (estilo de marca y keywords prioritarias).
- Política de retención de datos y cumplimiento (GDPR/CCPA) para imágenes y modelos.
- Criterios de LOD por dispositivo y material para el configurador final (resoluciones de texturas, ratios de decimación).
- Estrategia CDN (proveedor, invalidación, versionado) y reglas de cache regional.

Estos gaps no impiden el diseño, pero condicionan la calibración fina de umbrales, políticas de desvío y configuraciones de rendimiento.

---

## Riesgos y mitigaciones principales

- Calidad de reconstrucción variable. Mitigación: guías de captura estrictas, QA automático y manual, reintentos selectivos con APS cuando COLMAP falla por cobertura.
- Costos de GPU/API elevados. Mitigación: usar instancias spot para COLMAP, monitorear consumo de APS y activar desvío solo bajo condiciones definidas; consolidar lotes y optimizar texturas para reducir transferencia.
- Rendimiento web en móviles. Mitigación: compresión Draco, KTX2, LODs agresivos, lazy loading y pruebas de performance por dispositivo.
- Complejidad técnica. Mitigación: enfoque por fases (POC, MVP), agentes con responsabilidades claras, auditoría integral y roadmap incremental.

---

## Conclusión

La arquitectura de agentes propuesta convierte la visión de personalización 3D en una plataforma operativa con decisiones automatizadas, calidad medible y entrega optimizada. El uso disciplinado de estándares (glTF/GLB, Draco, KTX2), motores web maduros (Three.js/Babylon.js) y un esquema híbrido de reconstrucción (COLMAP/APS) ofrece una base robusta para escalar el catálogo y sostener la experiencia premium de la marca. Con KPIs claros y una gobernanza eficaz, el sistema podrá absorber picos de demanda, controlar costos y sostener la calidad visual que define la percepción de lujo.

---

## Referencias

[^1]: Análisis del Sistema de Personalización de Nike. https://www.nike.com/es/u/custom-nike-air-max-90-shoes-by-you-10002041/2667687259#Builder  
[^2]: COLMAP - Structure-from-Motion and Multi-View Stereo. https://github.com/colmap/colmap  
[^3]: Autodesk Platform Services (APS) - Reality Capture API. https://aps.autodesk.com/en/docs/reality-capture/v1/overview/introduction/  
[^4]: Three.js - JavaScript 3D Library. https://threejs.org/  
[^5]: Babylon.js - Web-based 3D. https://www.babylonjs.com/  
[^6]: glTF-Transform - Documentation. https://gltf-transform.dev/  
[^7]: 3D Gaussian Splatting for Real-Time Radiance Field Rendering. https://github.com/graphdeco-inria/gaussian-splatting
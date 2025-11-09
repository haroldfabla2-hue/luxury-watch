# Sistema 100% gratuito para fotogrametría 2D→3D en 2025: APIs, nube y bibliotecas open‑source

Informe analítico técnico‑estratégico con hoja de ruta de implementación

## Resumen ejecutivo y alcance

Este informe establece, con rigor y de forma accionable, qué se puede reconstruir hoy de manera completamente gratuita en fotogrametría 2D→3D, con calidad comparable a COLMAP, y bajo qué límites de uso, compatibilidad de licencias y riesgos operativos. La conclusión central es doble. Primero, existe un núcleo de bibliotecas open‑source (OSS) —COLMAP, OpenMVG/OpenMVS, AliceVision/Meshroom— que proporciona una calidad de referencia sin coste de licencia, deployable en entornos de cómputo gratuitos y notebooks académicos. Segundo, las APIs de hiperescala con niveles gratuitos (Google Cloud Vision AI, Azure AI Vision, IBM Cloud Lite, Oracle Always Free, AWS Rekognition) son útiles para apoyo auxiliar —preprocesamiento, control de calidad (QA), metadatos y orquestación— pero no sustituyen a un motor SfM/MVS en pipelines de reconstrucción.

Hallazgos clave:

- En 2025, no hay evidencia verificable de una API REST de fotogrametría SfM/MVS “completamente gratuita e ilimitada” en producción. Los niveles gratuitos de nube son generosos para visión por computador general, no para reconstrucción 3D densa. Por ejemplo, Google Cloud Vision ofrece 1,000 unidades/mes en su capa gratuita y créditos iniciales para nuevos clientes[^5][^6]; Azure AI Vision (F0) limita a 5,000 transacciones/mes y 20 TPM[^9][^10]; IBM Cloud Lite proporciona >40 servicios always‑free, incluyendo APIs Watson, sin coste dentro de cuotas mensuales[^21]; Oracle Always Free ofrece compute, almacenamiento y transferencia con recursos continuos y $300 de crédito por 30 días[^22][^23]; AWS Rekognition tiene 12 meses de free tier con un volumen inicial gratuito por grupo de APIs[^13][^14]. Ninguno de estos servicios declara endpoints de fotogrametría SfM/MVS; deben emplearse como apoyo.
- La base OSS —COLMAP (BSD), OpenMVG (MPL‑2.0), OpenMVS, AliceVision/Meshroom y Regard3D— cubre el pipeline SfM→MVS→texturizado y es deployable en entornos gratuitos como Google Colab (con límites de sesión) y Binder (entornos reproducibles sin garantías de recursos), además deOCI Always Free (VMs Arm) y Google Cloud Free (compute y almacenamiento dentro de límites)[^1][^18][^16][^15][^24][^19][^20][^22][^6].
- La calidad alcanzable con OSS es comparable a COLMAP cuando se respetan buenas prácticas de captura y se parametrizan correctamente los pipelines SfM/MVS. Stack OSS y servicios en la nube deben articularse de forma híbrida: OSS para reconstrucción; nube para pre/post‑proceso, QA y orquestación. 
- Existen áreas sin “API gratuita directa”: reconstrucción 3D densa en la nube sin coste; batch verdaderamente ilimitado en plataformas serverless; o REST accesible de organismos académicos para SfM/MVS. Aquí, Hugging Face Inference Providers ofrece acceso serverless a modelos con un free tier generoso (límites no especificados en el extracto), útil para modelos image‑to‑3D experimentales y tareas auxiliares; suemployment comercial depende de la licencia del modelo[^3][^4][^26][^27].
- Riesgos principales: cuotas y variabilidad de recursos en plataformas gratuitas (p. ej., Colab), límites por TPS y ventanas temporales, licencias OSS y restricciones en ediciones gratuitas (p. ej., 3DF Zephyr Free, no comercial, 50 fotos)[^19][^10][^25][^24]. 

Alcance temporal y normativo: los hallazgos reflejan el estado a 2025‑11‑06. Las políticas y límites de proveedores cambian con frecuencia; se recomienda verificación previa a implementación productiva.

Para ilustrar el contexto técnico del objetivo —detalles mecánicos con alta fidelidad geométrica y textural— se presenta la siguiente imagen de referencia, que orienta los requisitos de captura y calidad del pipeline propuesto:

![Contexto técnico: reconstrucción 3D de detalles mecánicos con fidelidad alta.](/workspace/PROPUESTA_SISTEMA_3D_OPTIMIZADA_CON_AGENTES_IA.md/movement_textures_7.jpg)

El resto del informe detalla el mapa de opciones gratuitas, el marco comparativo de calidad, la arquitectura “100% gratuita” recomendada y la hoja de ruta de implementación.

---

## Marco de evaluación: ¿Qué significa “100% gratuito” y “calidad comparable a COLMAP”?

“100% gratuito” en este informe se aplica al conjunto de servicios y software que pueden ejecutarse sin gasto de licencia, dentro de límites razonables y claramente documentados. No implica “ilimitado” en el sentido de ausencia total de restricciones; por el contrario, la práctica profesional en 2025 requiere navegar cuotas, ventanas temporales y variabilidad de recursos.

Definición operativa:

- Coste de licencia: cero (OSS o free tier).
- Uso permitido: comercial o no comercial, según licencia/política. 
- Límites: explícitos y con soporte documental (cuotas mensuales, TPS, horas de cómputo, disponibilidad de GPU/TPU).
- Escalabilidad “gratuita”: viable dentro de dichas cuotas; lotes mayores requieren particionado o combinación de cuentas/entornos.

“Calidad comparable a COLMAP” se fundamenta en métricas estándar de reconstrucción:

- Precisión geométrica: error de reproyección y densidad de nube de puntos.
- Completitud: cobertura de superficie (holes, geometría no reconstructible).
- Textura: consistencia de color, ausencia de ghosting y alineación de seams.
- Robustez: sensibilidad a brillo, textura repetitiva y condiciones de baja iluminación.

Fuentes de evaluación:
- Tutorial oficial de COLMAP para el pipeline SfM/MVS y mejores prácticas de parametrización[^2].
- Experiencias comparativas públicas (p. ej., pruebas de OpenMVG+OpenMVS y commentary técnico), que ayudan a entender trade‑offs y calibración de etapas[^28].

Restricciones de licencia y uso:
- COLMAP (BSD) permite uso comercial y modificación[^1][^18].
- OpenMVG (MPL‑2.0) es copyleft débil; compatibilidad comercial requiere revisión de obligaciones de publicación modificada[^16].
- 3DF Zephyr Free está limitado a uso no comercial y 50 fotos; útil para aprendizaje y casos triviales, no para producción[^24][^25].
- Regard3D es OSS y viable para objetos simples[^31].
- Hugging Face Inference Providers: free tier generoso sin límites especificados en el extracto; el uso comercial depende de cada modelo y su licencia[^3][^4].

Para contextualizar estas diferencias, la siguiente matriz resume licencias y usos permitidos:

Tabla 1. Matriz de licencias y usos permitidos (OSS y servicios con free tier)

| Proyecto/Servicio | Tipo | Licencia | Uso comercial | Restricciones relevantes |
|---|---|---|---|---|
| COLMAP | OSS (SfM/MVS) | BSD | Sí | Requiere compilación/dependencias; sin coste de licencia[^1][^18] |
| OpenMVG | OSS (SfM) | MPL‑2.0 | Sí (con obligaciones) | Copyleft débil; revisar obligaciones de modificación/publicación[^16] |
| OpenMVS | OSS (MVS) | No especificado aquí | Sí (revisar licencia) | Integración con OpenMVG; detalles de licencia no capturados aquí[^17] |
| AliceVision/Meshroom | OSS (pipeline nodal) | No especificado aquí | Sí (revisar licencia) | Editor nodal, caché, escalable; licencia específica no detallada aquí[^15][^29] |
| Regard3D | OSS (SfM) | No especificado aquí | Sí (revisar licencia) | GUI multiplataforma; apto para objetos simples[^31] |
| 3DF Zephyr Free | Free edition | Propietaria, no comercial | No | 50 fotos por proyecto; 1 GPU; exportación limitada[^24][^25] |
| Hugging Face Inference Providers | API (serverless) | Varias por modelo | Depende del modelo | Free tier generoso; límites no especificados en el extracto[^3][^4] |

Interpretación: el stack OSS cumple el criterio “100% gratuito” para reconstrucción, siempre que se respeten licencias y se gestione la variabilidad de recursos. Para uso comercial, OpenMVG requiere atención a MPL‑2.0; Meshroom/AliceVision y OpenMVS necesitan verificación de licencias específicas antes de su adopción en productos. 3DF Zephyr Free queda descartado para producción comercial.

---

## Taxonomía de opciones gratuitas (2025)

Las opciones se agrupan en cuatro categorías que, combinadas, permiten un pipeline E2E sin coste de licencia:

1) APIs de fotogrametríaSfM/MVS directas con free tier generoso: no hay evidencia verificable de servicios REST de reconstrucción 3D densa “gratuitos e ilimitados”. Hugging Face provee acceso serverless a modelos image‑to‑3D y otros, con free tier y créditos PRO/Enterprise, útil para pruebas y tareas auxiliares; su uso depende de la licencia del modelo[^3][^26][^27].

2) Servicios en la nube con niveles gratuitos (visión general): Google Cloud Vision, Azure AI Vision, IBM Cloud Lite, Oracle Always Free y AWS Rekognition. Son adecuados para pre/post‑proceso (detección de features, OCR, etiquetas, QA visual, orquestación) y para cómputo base (VMs y almacenamiento), pero no ofrecen endpoints de fotogrametría SfM/MVS en sus niveles gratuitos[^5][^6][^9][^10][^21][^22][^23][^13][^14][^7].

3) Bibliotecas OSS ejecutables en servidores/notebooks gratuitos: COLMAP, OpenMVG/OpenMVS, AliceVision/Meshroom y Regard3D. Desplegables en Colab y Binder, y en cómputo de Oracle Always Free y Google Cloud Free, constituyen el motor de reconstrucción[^1][^16][^17][^15][^29][^31][^19][^20][^22][^6].

4) Ecosistema académico/datos abiertos para pre/post‑proceso: NASA Open APIs (GIBS, EPIC, EONET, Trek WMTS) y ETH CVLAB datasets son valiosos para metadatos, validación, enriquecimiento y pruebas, no para reconstrucción densa directa[^32][^33][^34][^35][^30].

Tabla 2. Catálogo comparativo por categoría

| Categoría | Ejemplos | Tipo de tarea 2D→3D cubierta | Observaciones |
|---|---|---|---|
| APIs con free tier (visión general) | Google Cloud Vision, Azure AI Vision, IBM Watson Lite, Oracle AI, AWS Rekognition | Pre/Post‑proceso (QA, metadatos, OCR, colas) | Sin endpoints SfM/MVS; útiles para soporte y orquestación[^5][^9][^21][^22][^13] |
| Nube con compute gratuito | Oracle Always Free (Arm), Google Cloud Free (Compute/Storage), Colab/Binder | Ejecución de pipelines OSS (CPU/GPU según disponibilidad) | Recursos variables y con ventanas temporales; adecuados para lotes pequeños/medios[^22][^6][^19][^20] |
| OSS (SfM/MVS) | COLMAP, OpenMVG/OpenMVS, AliceVision/Meshroom, Regard3D | Reconstrucción SfM/MVS, texturizado | Calidad comparable a COLMAP con buenas prácticas; licencias OSS[^1][^16][^17][^15][^31] |
| Académico/datos abiertos | NASA APIs, ETH CVLAB datasets | Metadatos, validación, pruebas | Complementos para QA y enriquecimiento del pipeline[^32][^30] |

Interpretación: la gratuidad total en 2025 se logra principalmente con OSS y cómputo en nube dentro de free tiers; las APIs visuales ayudan a automatizar precondiciones y QA, pero no realizan la reconstrucción densa.

---

## Evaluación de APIs con free tier: ¿qué pueden y qué no pueden hacer por la fotogrametría?

Capacidades:

- Google Cloud Vision: 1,000 unidades/mes en free tier y $300 de créditos para nuevos clientes; API lista para etiquetado de imágenes, OCR, detección de landmarks y moderación. Útil para QA automatizada, normalización de metadatos y colas de trabajo; no es un motor SfM/MVS[^5][^6].
- Azure AI Vision (F0): 5,000 transacciones/mes y 20 TPM; adecuado para preprocesamiento y validación ligera; límites de TPS que exigen colas y chunking en batch[^9][^10].
- IBM Cloud Lite: >40 productos always‑free, incluyendo Watson APIs; útil para orquestación, almacenamiento y servicios de datos dentro de cuotas; sin reconstrucción 3D[^21].
- Oracle Always Free: compute Arm (Ampere A1), almacenamiento y transferencia, más $300 por 30 días; plataforma viable para ejecutar pipelines OSS con límites razonables; servicios AI con precios escalonados[^22][^23].
- AWS Rekognition: free tier 12 meses; análisis de imágenes y video para etiquetado/detección; útil como apoyo de QA y metadatos; sin reconstrucción 3D[^13][^14].

Limitaciones estructurales:

- Ausencia de endpoints SfM/MVS declarados en estas APIs; no hay, por tanto, reconstrucción 3D densa “como servicio” gratuita.
- Dependencia de cuotas (unidades/mes, TPM) y ventanas de ejecución (p. ej., Colab), lo que obliga a particionar lotes y diseñar colas resilientes.
- Acoplamiento a licencia y modelo de cada plataforma; el uso comercial de modelos en Hugging Face depende de la licencia específica del modelo[^3][^4].

Casos de uso recomendados:

- QA automatizada de texturas y consistencia visual (p. ej., etiquetado y OCR辅助 para validación de metadatos).
- Preprocesamiento: normalización de iluminación, eliminación de fondos (cuando proceda), generación de metadatos de captura.
- Orquestación y colas: control de jobs, serialización y reintentos ante límites de TPS.

Tabla 3. Matriz comparativa de APIs con free tier (visión general)

| Proveedor | Límite gratuito | TPS/TPM | GPU | Fotogrametría SfM/MVS | Uso comercial |
|---|---|---|---|---|---|
| Google Cloud Vision | 1,000 unidades/mes + $300 créditos | No especificado aquí | No | No | Sí (consultar ToS y precios)[^5][^6] |
| Azure AI Vision (F0) | 5,000 transacciones/mes | 20 TPM | No | No | Sí (consultar ToS y precios)[^9][^10] |
| IBM Cloud Lite | >40 servicios always‑free | Cuotas por servicio | N/A | No | Sí (Lite dentro de cuotas)[^21] |
| Oracle Always Free | Compute Arm, almacenamiento, transferencia + $300/30 días | N/A | Compute genérico (no orientado a reconstrucción 3D directa) | N/A | Sí (siempre que se respeten límites Always Free)[^22][^23] |
| AWS Rekognition | Free tier 12 meses | Por API (ver docs) | No | No | Sí (según documentación)[^13][^14] |

Interpretación: las APIs con free tier son idóneas como “capa de apoyo” en el pipeline; la reconstrucción debe residir en OSS ejecutada en compute gratuito.

---

## Bibliotecas open‑source deployables en servidores/notebooks gratuitos

El corazón de un sistema “100% gratuito” es el stack OSS. La combinación COLMAP (SfM/MVS), OpenMVG/OpenMVS y AliceVision/Meshroom ofrece cobertura completa del pipeline y alternativas en caso de incidencias o preferencias de flujo.

- COLMAP (BSD): pipeline SfM/MVS maduro, con interfaz gráfica y CLI, y tutorial detallado para reconstrucción desde imágenes. Licencia permisiva y amplia adopción; deployable en Linux/Windows/macOS[^1][^2][^18].
- OpenMVG (MPL‑2.0): framework C++ de visión múltiple que ofrece librerías, binarios y pipelines para SfM; exportación hacia OpenMVS para reconstrucción densa. La licencia copyleft débil requiere atención en productos comerciales[^16].
- OpenMVS: integra con escenas OpenMVG para obtener nubes densas, superficies y superficies texturizadas. Flujo probado en experiencias comparativas y tutoriales de integración[^17][^28].
- AliceVision/Meshroom: pipeline nodal con editor gráfico y caché; escalabilidad demostrable más allá de 1,000 imágenes; soporte GPU; capacidad de pipelines personalizados y retexturizado avanzado[^15][^29].
- Regard3D: opción OSS simple y multiplataforma para objetos con geometría sencilla, útil como fallback o en entornos sin GPU[^31].

Tabla 4. Comparativa técnica OSS vs. referencia

| Motor | Licencia | SfM | MVS | GPU | Escalabilidad | CLI/GUI | Integración cloud |
|---|---|---|---|---|---|---|---|
| COLMAP | BSD | Sí | Sí | Sí (CUDA) | Alta | CLI + GUI | Sí (tutoriales y builds) [^1][^2][^18] |
| OpenMVG | MPL‑2.0 | Sí | No (requiere OpenMVS) | CPU principalmente | Alta | Binarios + librerías | Sí (Docker/Build) [^16][^17] |
| OpenMVS | No especificado aquí | No | Sí | Sí (según build) | Alta | Binarios | Sí (consumo de escenas OpenMVG) [^17] |
| Meshroom/AliceVision | No especificado aquí | Sí | Sí | Sí | Muy alta (nodal, caché) | GUI nodal | Sí (render farms) [^15][^29] |
| Regard3D | No especificado aquí | Sí | Limitado | CPU/GPU según entorno | Media | GUI | Sí (multiplataforma) [^31] |

Interpretación: COLMAP y Meshroom son los motores más “plug‑and‑play” para alta calidad y escalabilidad; OpenMVG/OpenMVS ofrece flexibilidad de pipeline con control fino. Regard3D es adecuado para casos simples o como herramienta de emergencia.

---

## Compute y batch gratuito en la nube (notebooks y VMs)

El cómputo gratuito permite ejecutar estos motores con límites claros. Tres bloques destacan: Google Colab, Binder y Oracle Always Free (además del compute/storage de Google Cloud Free).

- Google Colab: acceso gratuito a GPUs/TPUs con entornos Jupyter, ideal para experimentación y ejecución de pipelines OSS. Limitaciones: recursos no garantizados, variabilidad de tipos de GPU y tiempos de ejecución (generalmente ≤12 horas en la capa gratuita, mayores en planes de pago). “Pro for Education” (EE. UU.) ofrece beneficios de Pro por 1 año[^19].
- Binder: transforma repos Git en entornos ejecutables reproducibles. Excelente para empaquetar y compartir pipelines OSS, pero sin especificaciones de recursos garantizados (CPU/RAM/GPU); idoneidad limitada para cargas intensivas prolongadas[^20].
- Oracle Always Free: compute Arm Ampere A1, almacenamiento y transferencia dentro de cuotas mensuales continuas; útil parajobs largos en CPU y para orquestación/colas; servicios AI con precios escalonados[^22][^23].
- Google Cloud Free: compute y almacenamiento con free tier; combinado con Colab y almacenamiento, habilita ciclos de experimentación y despliegue de pipelines OSS dentro de cuotas[^6].

Buenas prácticas para lotes:

- Particionado de sets de imágenes por lotes y serialización de jobs.
- Checkpoints y reanudación ante expiración de sesiones (p. ej., Colab).
- Orquestación por colas con control de TPS en APIs auxiliares y reintentos.
- Uso de caché y pipelines incrementales (Meshroom) para evitar recomputación.

Tabla 5. Comparativa de compute gratuito

| Plataforma | GPU/TPU | Límite de tiempo | Persistencia | Idoneidad batch |
|---|---|---|---|---|
| Google Colab | GPU/TPU (varía) | Free: típicamente ≤12 h; planes de pago con ejecuciones más largas | Session‑based; Drive para datos | Buena para lotes medianos con particionado y checkpoints[^19] |
| Binder | No especificado | No garantizado | Imagen Docker del repo | Limitada para cargas intensivas; ideal para reproducibilidad y demos[^20] |
| Oracle Always Free | CPU (Arm A1) | Siempre Free (recursos continuos) | Persistent VM/volúmenes | Adecuada para jobs largos en CPU y colas, dentro de cuotas[^22][^23] |
| Google Cloud Free | CPU/GPU (según servicio) | Free tier mensual | Storage y compute | Complementaria para pipelines OSS con cuotas[^6] |

Interpretación: Colab es óptimo para prototipos con GPU; Oracle Always Free y Google Cloud Free aportan continuidad en CPU y almacenamiento; Binder facilita reproducibilidad y empaquetado, pero no está orientado a cargas prolongadas intensivas.

---

## APIs académicas y datasets abiertos (apoyo a fotogrametría)

Los recursos académicos no suelen ofrecer APIs REST de fotogrametría listas para producción, pero sí datasets y servicios que enriquecen y validan pipelines:

- ETH CVLAB: datasets para segmentación, clasificación y condiciones adversas (ACDC, DAVIS, MUSES, IMDB‑WIKI, etc.). Útiles para entrenar/validar componentes de QA y metadatos; no son APIs de reconstrucción 3D[^30].
- NASA Open APIs: GIBS (WMTS/WMS/TWMS), EPIC (imágenes de disco completo con metadatos), EONET (eventos naturales) y Trek WMTS (planetario). Proporcionan metadatos, tiles y datos auxiliares para validación y enriquecimiento de modelos; adecuados para tareas de control geoespacial y comparativas, no para SfM/MVS directo[^32][^33][^34][^35].

Tabla 6. Inventario resumido de recursos académicos

| Recurso | Tipo de datos | Uso permitido | Relevancia 2D→3D |
|---|---|---|---|
| ETH CVLAB datasets | Imágenes, video, multimodal | Investigación (citando autores) | Validación/QA de pipeline y componentes auxiliares[^30] |
| NASA GIBS | WMTS/WMS/Tiles | Público, con clave API | Metadatos y validación geoespacial[^33][^32] |
| NASA EPIC | Imágenes + metadatos | Público, con clave API | Auxiliar para orientación y validación[^34][^32] |
| NASA EONET | Metadatos de eventos | Público, con clave API | Orquestación y filtrado de fuentes[^32] |
| NASA Trek WMTS | Tiles planetarios/DEMs | Público, con clave API | Referencia topográfica y validación[^35][^32] |

Interpretación: estos recursos son “multiplicadores de calidad” en pre/post‑proceso y validación, particularmente para pipelines que incorporan QA visual y metadatos.

---

## Soluciones híbridas: arquitectura 100% gratuita E2E

Arquitectura propuesta (E2E):

- Captura: estandarización de ángulos, iluminación y resolución.
- Preprocesamiento (API visión con free tier): eliminación de fondos, normalización, generación de metadatos y QA ligera (Google Cloud Vision, Azure, IBM Lite).
- Reconstrucción (OSS en compute gratuito): COLMAP/Meshroom/OpenMVG+OpenMVS ejecutados en Colab (sesiones), Binder (reproducibilidad) y Oracle Always Free (VMs Arm).
- QA (OSS + APIs): verificación geométrica (densidad de nube), textural (SSIM/LPIPS si se implementa), y metadatos (OCR, etiquetas).
- Exportación/Publicación: GLB/OBJ, texturas comprimidas, documentación técnica.

Estrategia de lotes:

- Segmentación de sets en “mini‑reconstrucciones” para respetar ventanas de tiempo (p. ej., Colab).
- Pipelining con caché (Meshroom) y reanudación por checkpoints.
- Fallback a CPU (Oracle Always Free) enjobs prolongados.

Combinaciones recomendadas:

- COLMAP en Colab + Google Cloud Vision para QA y metadatos + almacenamiento en Google Cloud Free.
- OpenMVG+OpenMVS en Oracle Always Free (CPU) + IBM Cloud Lite para colas y notificaciones.
- Meshroom en Binder para reproducibilidad y demostraciones; deploy reproducible en compute de Oracle.

Tabla 7. Matriz de decisión por categoría de objeto

| Objeto | Motor OSS | Compute | API de apoyo | Motivo |
|---|---|---|---|---|
| Objeto pequeño (≤50 fotos) | Meshroom | Colab (GPU) | Vision (etiquetas/OCR) | Rapidez y caché; QA ligera para control de calidad[^15][^5] |
| Objeto mediano (50–200 fotos) | COLMAP | Oracle Always Free (CPU) | Vision (metadatos) | Robustez SfM/MVS y continuidad de VM[^1][^22] |
| Escena grande (>200 fotos) | OpenMVG+OpenMVS o Meshroom | Oracle Always Free (CPU) + Colab (partes) | Vision (colas) | Escalabilidad nodal y particionado[^16][^17][^15] |
| Piezas metálicas brillantes | COLMAP/OpenMVG+OpenMVS | Colab (GPU) + Oracle (CPU fallback) | Vision (normalización) | Control de iluminación y parámetros de emparejamiento[^2][^16] |

Interpretación: la combinación OSS+compute gratuito permite cobertura integral; las APIs visuales añaden capas de QA y metadatos que incrementan la robustez del pipeline.

---

## Políticas de límites gratuitos y mapeo de cumplimiento

El diseño operativo debe respetar límites y políticas. La siguiente tabla consolida las cuotas y restricciones relevantes:

Tabla 8. Cuotas y límites gratuitos (visión general)

| Servicio | Límite gratuito | Notas |
|---|---|---|
| Google Cloud Vision | 1,000 unidades/mes + $300 créditos | Cada “feature” aplicada a una imagen es una unidad[^5][^6] |
| Azure AI Vision (F0) | 5,000 transacciones/mes; 20 TPM | Límite por suscripción; útil para preprocesamiento ligero[^9][^10] |
| IBM Cloud Lite | >40 servicios always‑free | Cuotas por servicio; suspensión al alcanzar límite mensual[^21] |
| Oracle Always Free | Compute Arm, almacenamiento, transferencia + $300/30 días | Recursos continuos; verificación de identidad requerida[^22][^23] |
| AWS Rekognition | Free tier 12 meses | Límites por grupo de APIs; ver documentación específica[^13][^14] |
| Google Colab | GPU/TPU no garantizados; ≤12 h (free) | Variabilidad de GPU y sesión; Pro/Education para mayores límites[^19] |
| Binder | Sin garantías de recursos | Orientado a reproducibilidad; no adecuado para cargas intensivas[^20] |

Consideraciones de cumplimiento:

- Uso comercial: permitido en la mayoría de los servicios dentro de los free tiers; revisar ToS de cada proveedor. En OSS, COLMAP (BSD) es permisivo; OpenMVG (MPL‑2.0) exige revisar obligaciones de publicación si se modifican y distribuyen derivados.
- Restricciones geográficas: Colab Pro for Education está limitado a instituciones con sede en EE. UU. y verificación en EE. UU.[^19].
- Variabilidad operativa: no se deben diseñar pipelines críticos que dependan de GPU específicas o sesiones prolongadas sin persistencia; incorporar checkpoints y fallbacks CPU/GPU.

Brecha de información (a 2025‑11‑06): no se dispone de confirmación verificable de APIs REST SfM/MVS gratuitas e ilimitadas; Hugging Face Inference Providers no especifica límites exactos en su free tier; Binder no detalla recursos garantizados; los límites concretos de GPU/TPU y sesiones en Colab varían; OpenMVS no expone detalles de licencia en el extracto; Oracle Always Free no declara endpoints de reconstrucción 3D directa.

---

## Plan de implementación (MVP) y casos de uso

Fase 1 — POC (4 semanas): prueba de preprocesamiento y QA con APIs gratuitas, y reconstrucción OSS en Colab.

- Entregables:
  - Pipeline Colab con COLMAP para un set de 50–100 fotos.
  - Módulo de preprocesamiento con Google Cloud Vision (etiquetas, OCR) y/o Azure Vision (F0) para QA ligera.
  - Exportación GLB/OBJ con texturas; documentación básica de métricas de reproyección y densidad de nube.
- Criterios de éxito: reconstrucción estable y repeatable en Colab; QA automatizada con etiquetas y metadatos; exportación consistente.

Fase 2 — MVP (8 semanas): integración E2E con OSS y compute gratuito.

- Entregables:
  - Orquestación de jobs con colas y reintentos.
  - Integración de OpenMVG+OpenMVS en Oracle Always Free (CPU) para pipelines alternativos.
  - Módulo de QA textural y geométrica (comparación con imágenes) y reporting.
  - Interfaz mínima para carga de imágenes y descarga de modelos 3D.
- Criterios de éxito: ejecución E2E para 2–3 categorías de objetos; tiempos de ciclo predecibles; documentación de parámetros y métricas.

Fase 3 — Escalado: optimización, heterogeneidad de compute y robustez.

- Entregables:
  - Pipelines en Meshroom con caché para escalabilidad >1,000 imágenes.
  - Mejora de parámetros OSS (auto‑tuning básico) y fallback a CPU/GPU según disponibilidad.
  - Orquestación cross‑cloud (Colab+Oracle Always Free+Google Cloud Storage).
- Criterios de éxito: robustez operativa ante variaciones de recursos; reproducibilidad y trazabilidad de experimentos.

Tabla 9. Plan por fases y métricas

| Fase | Duración | Entregables | Métricas de calidad | Entorno compute |
|---|---|---|---|---|
| POC | 4 semanas | COLMAP en Colab; preprocesamiento Vision | Densidad de nube; error de reproyección | Colab (GPU) + APIs Vision[^5][^9][^1] |
| MVP | 8 semanas | E2E OSS + QA + exportación | Cobertura de malla; consistencia de textura | Oracle Always Free (CPU) + Colab[^22][^19] |
| Escalado | Continuo | Meshroom/AliceVision; auto‑tuning | Robustez; escalabilidad >1,000 imágenes | Colab + Oracle Always Free[^15][^22] |

Interpretación: el MVP se apoya en OSS y compute gratuito con APIs auxiliares. El escalado requiere incorporar pipelines nodales con caché y estrategias de fallback ante límites de sesión.

---

## Riesgos, cumplimiento y sostenibilidad operativa

Riesgos operativos:

- Variabilidad de recursos y expiración de sesiones en Colab; cambios dinámicos de GPU/TPU y memoria disponible[^19].
- Límites de TPS (Azure F0) que afectan colas y throughput[^10].
- Cuotas mensuales (Google Vision, IBM Lite, Oracle Always Free) que requieren control de consumo y monitorización[^5][^21][^22].

Riesgos de licencia:

- OpenMVG MPL‑2.0: obligación de publicar modificaciones en algunos escenarios de distribución; requiere revisión legal antes de integrar en productos comerciales[^16].
- 3DF Zephyr Free: uso no comercial y 50 fotos; no aplicable a producción comercial[^24][^25].
- Modelos en Hugging Face: el uso comercial depende de la licencia específica del modelo[^3][^4].

Mitigaciones:

- Diseño multi‑cloud/gratuito: combinar Colab, Binder, Oracle Always Free y Google Cloud Free para resiliencia.
- Fallback a CPU: parametrizar pipelines para ejecución en CPU cuando GPU no esté disponible (p. ej., Oracle Always Free).
- Cacheado y reanudación: usar Meshroom y checkpoints en COLMAP para reducir recomputación ante interrupciones.
- Monitorización de cuotas y alertas: instrumentar dashboards de consumo en IBM Lite y Google Cloud Free; alertas por umbral (80/90/100%)[^21][^6].
- Verificación previa de licencia: revisar obligaciones de MPL‑2.0 y licencias OSS antes de empaquetado comercial.

Tabla 10. Mapa de riesgos y mitigaciones

| Riesgo | Causa | Impacto | Mitigación |
|---|---|---|---|
| Sesión expira (Colab) | Límite de tiempo y variabilidad | Interrupción de jobs | Checkpoints; particionado; fallback CPU[^19] |
| Límite TPS (Azure F0) | 20 TPM en F0 | Throughput bajo | Colas; chunking; escalado a S1 si necesario[^10] |
| Cuotas mensuales | Un API/mes | Suspensión del servicio | Monitorización; distribución cross‑cloud[^5][^21][^22] |
| Licencia MPL‑2.0 | Copyleft débil | Obligaciones de publicación | Revisión legal; separación de módulos[^16] |
| Edición gratuita no comercial | 3DF Zephyr Free | Restricción de uso | Evitar en producción; usar OSS con licencia clara[^24][^25] |

Interpretación: la sostenibilidad del “100% gratuito” depende de una ingeniería de confiabilidad que anticipate variabilidad y límites, sin sacrificar la calidad de reconstrucción.

---

## Conclusiones y hoja de ruta estratégica

Síntesis: en 2025, un sistema “100% gratuito” para fotogrametría 2D→3D es viable combinando OSS de reconstrucción (COLMAP, OpenMVG+OpenMVS, AliceVision/Meshroom) con compute en nube gratuito (Colab, Binder, Oracle Always Free, Google Cloud Free) y APIs visuales de apoyo (Google Cloud Vision, Azure AI Vision, IBM Cloud Lite). Esta arquitectura logra calidad comparable a COLMAP con buenas prácticas de captura y parametrización, y permite cubrir un rango de objetos desde piezas pequeñas hasta escenas grandes mediante particionado y caché.

Recomendaciones:

- Priorizar COLMAP/Meshroom para la reconstrucción, con OpenMVG+OpenMVS como alternativa modular.
- Emplear APIs de visión para preprocesamiento y QA, no para reconstruir.
- Adoptar un plan por fases (POC→MVP→Escalado) con métricas de densidad de nube, error de reproyección y cobertura de malla.
- Establecer una gobernanza de licencias (MPL‑2.0) y un marco de monitorización de cuotas.

Próximos pasos:

- Validar límites y disponibilidad en notebooks y VMs antes de producción.
- Desarrollar dashboards de uso de cuotas y alertas (IBM Lite, Google Cloud Free).
- Robustecer QA automatizada y trazabilidad de experimentos.
- Escalar a pipelines nodales (Meshroom) con caché y auto‑tuning.

Líneas futuras:

- Explorar modelos image‑to‑3D en Hugging Face (Zero123++/TRELLIS) como complemento experimental, cuidando licencias por modelo[^26][^27].
- Formalizar acuerdos de uso académico para datasets (ETH CVLAB) y recursos NASA para validación y enriquecimiento[^30][^32].

Tabla 11. Roadmap de implementación y KPIs

| Horizonte | Iniciativas | KPIs técnicos |
|---|---|---|
| POC (4 semanas) | COLMAP en Colab; QA con Vision | Densidad de nube; error de reproyección |
| MVP (8 semanas) | E2E OSS + orquestación | Cobertura de malla; consistencia de textura |
| Escalado (continuo) | Meshroom + auto‑tuning | Tiempo de ciclo; robustez ante expiraciones |

Interpretación: el roadmap alinea calidad técnica con sostenibilidad operativa; la combinación de OSS y cómputo gratuito permite un sistema de reconstrucción competitivo y adaptable.

---

## Referencias

[^1]: COLMAP — Structure‑from‑Motion and Multi‑View Stereo. https://colmap.github.io/  
[^2]: Tutorial — COLMAP 3.13.0.dev0. https://colmap.github.io/tutorial.html  
[^3]: Inference Providers — Hugging Face. https://huggingface.co/docs/inference-providers/en/index  
[^4]: Pricing and Billing — Inference Providers. https://huggingface.co/docs/inference-providers/en/pricing  
[^5]: Vision AI: Image and visual AI tools — Google Cloud. https://cloud.google.com/vision  
[^6]: Free Trial and Free Tier — Google Cloud. https://cloud.google.com/free  
[^7]: Photogrammetry reconstruction with 3Dflow — AWS Blog. https://aws.amazon.com/blogs/media/photogrammetry-reconstruction-with-3dflow-on-aws/  
[^8]: Photogrammetry pipeline on GPU Droplet — DigitalOcean. https://www.digitalocean.com/community/tutorials/photogrammetry-pipeline-on-gpu-droplet  
[^9]: Azure AI Vision pricing. https://azure.microsoft.com/en-us/pricing/details/cognitive-services/computer-vision/  
[^10]: Azure AI Vision — FAQ. https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/faq  
[^11]: Azure Custom Vision Service — Limits and quotas. https://learn.microsoft.com/en-us/azure/ai-services/custom-vision-service/limits-and-quotas  
[^12]: Explore Free Azure Services. https://azure.microsoft.com/en-us/pricing/free-services  
[^13]: Amazon Rekognition — Pricing. https://aws.amazon.com/rekognition/pricing/  
[^14]: What is Amazon Rekognition? https://docs.aws.amazon.com/rekognition/latest/dg/what-is.html  
[^15]: AliceVision | Photogrammetric Computer Vision Framework. https://alicevision.org/  
[^16]: openMVG — open Multiple View Geometry (GitHub). https://github.com/openMVG/openMVG  
[^17]: OpenMVS — Open Multiple View Stereovision. http://openmvg.readthedocs.io/en/latest/software/MVS/OpenMVS/  
[^18]: COLMAP — GitHub repository. https://github.com/colmap/colmap  
[^19]: Google Colab — FAQ. https://research.google.com/colaboratory/faq.html  
[^20]: Binder — Turn repositories into interactive environments. https://mybinder.org/  
[^21]: IBM Cloud Free Tier. https://www.ibm.com/products/cloud/free  
[^22]: Oracle Cloud Free Tier. https://www.oracle.com/cloud/free/  
[^23]: OCI Vision — AI Image Recognition. https://www.oracle.com/artificial-intelligence/vision/  
[^24]: 3DF Zephyr Free — a complete and free photogrammetry software. https://www.3dflow.net/3df-zephyr-free/  
[^25]: 3DF Zephyr Free Software License. https://www.3dflow.net/eula/3DF%20Zephyr%20Free%20Software%20License.txt  
[^26]: Image‑to‑3D task — Hugging Face. https://huggingface.co/tasks/image-to-3d  
[^27]: Models — Hugging Face. https://huggingface.co/models  
[^28]: Photogrammetry Testing 12: Revisiting OpenMVG (with OpenMVS). https://peterfalkingham.com/2018/05/22/photogrammetry-testing-12-revisiting-openmvg-with-openmvs/  
[^29]: Meshroom — 3D Reconstruction Software (GitHub). https://github.com/alicevision/Meshroom  
[^30]: Datasets — ETH CVLAB. https://vision.ee.ethz.ch/datsets.html  
[^31]: Regard3D Home. https://www.regard3d.org/  
[^32]: NASA Open APIs. https://api.nasa.gov/  
[^33]: NASA GIBS API Documentation. https://nasa-gibs.github.io/gibs-api-docs/  
[^34]: NASA EPIC API. http://epic.gsfc.nasa.gov  
[^35]: NASA Trek WMTS API. https://trek.nasa.gov/tiles/apidoc/trekAPI.html

---

## Anexo: Brechas de información reconocidas

- No hay evidencia verificable, a 2025‑11‑06, de una API REST de fotogrametría SfM/MVS “completamente gratuita e ilimitada” en producción.
- Hugging Face Inference Providers no especifica límites exactos del free tier en el extracto consultado; se requiere verificación adicional.
- Binder no documenta recursos computacionales garantizados (CPU/RAM/GPU), por lo que su idoneidad para cargas intensivas es incierta.
- Los límites concretos de GPU/TPU y tiempo de sesión en Google Colab free/pro/pro+ cambian dinámicamente; se recomienda validación empírica previa a producción.
- OpenMVS: el extracto no detalla la licencia; debe revisarse antes de uso comercial.
- Oracle Always Free: no declara endpoints de reconstrucción 3D; su utilidad reside en compute general.
- NASA APIs: útiles para datos y metadatos; no ofrecen reconstrucción 3D directa.
- AWS Rekognition: útil para análisis de imágenes; no para SfM/MVS.
- Modelos image‑to‑3D en Hugging Face/Replicate: dependen de licencia específica por modelo para uso comercial; revisar caso a caso.

Estas brechas han sido consideradas en el diseño de la arquitectura y en la hoja de ruta de implementación, con énfasis en verificaciones previas y mecanismos de mitigación.
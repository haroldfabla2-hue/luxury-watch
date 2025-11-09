# Gemini 2.0 Experimental Free: capacidades multimodales avanzadas y estrategia de integración en un pipeline 2D→3D

## Resumen ejecutivo y contexto estratégico

Gemini 2.0 Experimental Free es una variante del modelo Gemini 2.0 Flash pensada para experimentación rápida con capacidades multimodales en la API de Gemini. Su mayor atractivo no radica en “hacer todo” a la perfección, sino en habilitar prototipados ágiles con funcionalidades que, hasta hace poco, exigían orquestar múltiples servicios especializados: análisis de imágenes, detección y segmentación, edición conversacional, y contenido multimodal de apoyo. Como “puente cognitivo”, Gemini 2.0 Flash exp puede enriquecer un pipeline 2D→3D previo al paso de reconstrucción (p. ej., fotogrametría) sin incurrir en costos durante la fase de exploración. Esta utilidad es especialmente relevante en verticales de lujo, donde la fotografía de producto y la segmentación precisa por materiales (metal, correas, cristales) condicionan la calidad final del renderizado y la experiencia en el configurador.

El posicionamiento de Gemini 2.0 dentro de la familia Flash subraya velocidad, uso nativo de herramientas y una ventana de contexto amplia de hasta un millón de tokens, lo que facilita procesar gran cantidad de imágenes o documentos en un solo prompt cuando el volumen de datos lo exige[^5][^6]. Aunque los modelos experimentales no son aptos para producción y vienen con límites más estrictos, constituyen una base sólida para MVPs, pruebas de concepto (POCs) y exploración de requisitos de negocio, siempre que la ingeniería contemple reintentos, backoff y un “fallback” a variantes estables o a un motor de reconstrucción robusto.

Conclusión clave: Gemini 2.0 Experimental Free aporta un acelerador de orquestación y enriquecimiento multimodal antes de la reconstrucción 3D (detección de piezas, limpieza de fondos, etiquetado, normalización de reflectancias). Sin embargo, no reemplaza motores de fotogrametría como COLMAP o servicios de captura de realidad (Autodesk Platform Services, APS), que siguen siendo la base técnica para generar geometría y texturas aptas para web[^2][^3].

## Qué APIs gratuitas están disponibles y sus límites

La API de Gemini expone tres superficies relevantes para experimentar sin costo en proyectos elegibles: Gemini Developer API (AI Studio), Vertex AI para Gemini 2.0 Flash, y la Batch API para procesamientos por lotes. A ello se suma el acceso a “Preview”/“Experimental” para capacidades emergentes (p. ej., generación de imágenes) con límites más restrictivos.

- Gemini Developer API (AI Studio): acceso rápido con un nivel gratuito (free tier) que incluye varios modelos de texto/multimodal con límites por minuto (RPM), por día (RPD) y por tokens (TPM). Los límites dependen del modelo y del tier del proyecto[^1]. 
- Vertex AI: modelos Gemini (incluido 2.0 Flash) disponibles para pruebas en entornos gestionados; los límites de servicio y cuotas están documentados en Google Cloud y pueden diferir de los del Developer API[^5].
- Batch API: útil para procesar colecciones de imágenes grandes sin bloquear el front-end; la documentación de rate limits describe límites concurrentes y de tokens encolados[^1].
- Preview/Experimental: las variantes experimentales tienen límites más estrictos y no deben usarse en producción[^1][^6].

Para un POC/MVP centrado en visión por computador con varias decenas o cientos de imágenes, conviene comenzar con modelos “Latest/Stable” y reservar las variantes “Experimental” para validar hipótesis específicas (por ejemplo, edición de imágenes o pruebas de segmentación).

Para ilustrar la diferencia por modelos en el nivel gratuito, la Tabla 1 sintetiza los límites clave citados para Gemini 2.0/2.5. Estos valores son representativos del free tier y pueden cambiar; la ingeniería debe consultar AI Studio para los límites activos del proyecto.

Tabla 1. Resumen de límites gratuitos (Free Tier) por modelo y API (valores indicativos)

| Modelo Gemini                     | API (superficie) | RPM | TPM (entrada) | RPD | Comentario breve                                        | Fuente |
|----------------------------------|------------------|-----|---------------|-----|---------------------------------------------------------|--------|
| Gemini 2.0 Flash                 | Developer API    | 15  | 1,000,000     | 200 | Rápido y multimodal; contexto amplio                    | [^1]   |
| Gemini 2.0 Flash-Lite            | Developer API    | 30  | 1,000,000     | 200 | Optimizado en costo/latencia                            | [^1]   |
| Gemini 2.5 Flash                 | Developer API    | 10  | 250,000       | 250 | Nuevo en la serie 2.5; mayor razonamiento               | [^1]   |
| Gemini 2.5 Flash-Lite            | Developer API    | 15  | 250,000       | 1000| “Caballo de batalla” para escalabilidad de texto        | [^1]   |
| Gemini 2.0 Flash Preview (Imagen)| Developer API    | 10  | 200,000       | 100 | Generación nativa de imágenes (preview)                 | [^1]   |
| Gemini 2.0 Flash                 | Vertex AI        | —   | —             | —   | Disponible para pruebas; cuotas GCP aplican             | [^5]   |

Como guía operativa, el Batch API permite encolar trabajos con hasta 100 solicitudes concurrentes y límites por tokens encolados según modelo/tier, útiles para procesar cientos de imágenes sin golpear límites RPD del modo interactivo[^1].

Notas de disponibilidad regional y elegibilidad. El nivel gratuito aplica a proyectos en países elegibles; Vertex AI y algunas capacidades “Preview” pueden estar sujetas a restricciones regionales (por ejemplo, generación de imágenes en ciertos países de EMEA)[^5][^6]. La elegibilidad del free tier y el acceso a AI Studio deben validarse por proyecto.

Límites prácticos y diseño de colas. En el free tier, la combinación de RPD y RPM obliga a diseñar colas y lotes para evitar 429s. Las estrategias más efectivas son: 
- Batching de imágenes homogéneas (misma iluminación, mismo componente).
- Backoff exponencial y reintentos idempotentes.
- Fraccionamiento por SKU o variante de producto para distribuir carga a lo largo del día.
- Uso alterno entre Developer API y Vertex AI en función de disponibilidad y límites del proyecto[^1][^5].

### Disponibilidad de modelos relevantes

- gemini-2.0-flash-exp: variante experimental de 2.0 Flash; adecuada para pruebas con límites más estrictos[^6].
- gemini-2.0-flash: la versión estable para producción progresiva; mejor opción si se prioriza estabilidad y throughput[^6].
- gemini-2.0-flash-preview-image-generation: modelo “Preview” para generación de imágenes con disponibilidad regional limitada (varias regiones EMEA no soportadas)[^6].

Recomendación: usar “Stable/Latest” para tareas de análisis y VQA (visual question answering) en POC; reservar “Experimental/Preview” para edición y generación de imágenes en entornos controlados.

## Capacidades avanzadas para análisis de imágenes

Gemini 2.0 Flash integra comprensión multimodal desde sus cimientos, lo que simplifica el flujo de trabajo para tareas típicas de e-commerce y personalización 3D: subtitulado, clasificación, respuesta visual a preguntas (VQA), detección de objetos y segmentación. Un aspecto central es cómo gestiona la entrada de imágenes: se pueden enviar en línea (ideal para archivos pequeños, con un límite agregado de ~20 MB por solicitud) o cargarlas mediante la API de Archivos para reutilización y control de costos en solicitudes repetidas[^4].

Para conjuntos grandes, la API admite hasta 3,600 imágenes por prompt en modelos Gemini 2.x seleccionados, lo que resulta útil para auditoría masiva de catálogos o validaciones sistemáticas de materiales y acabados[^4]. La precisión en detección y segmentación ha mejorado en las últimas versiones, y la documentación oficial incluye guías y notebooks con ejemplos prácticos para interpretar coordenadas, normalizar máscaras y combinar múltiples imágenes en un solo llamado[^7][^8][^10].

Tabla 2. Formatos y límites de imagen en prompts (visión general)

| Aspecto                                  | Valor/Guía                                                                 | Fuente |
|------------------------------------------|-----------------------------------------------------------------------------|--------|
| Formatos soportados                      | PNG, JPEG, WEBP, HEIC, HEIF                                                | [^4]   |
| Datos en línea (inline)                  | Recomendado para archivos pequeños; límite agregado ~20 MB por solicitud   | [^4]   |
| API de Archivos                          | Recomendada para archivos grandes o reutilización multi-solicitud          | [^4]   |
| Imágenes por prompt (2.x)                | Hasta ~3,600 (mezcla inline y referencias a archivos)                      | [^4]   |
| Tokenización de imágenes                 | Imágenes ≤384 px: 258 tokens; >384 px: mosaicos 768×768 px, cada uno 258   | [^4]   |
| Cálculo aproximado de mosaicos           | unidad = floor(min(ancho, alto)/1.5); mosaicos ≈ (ancho/unidad)×(alto/unidad) | [^4]   |

Tabla 3. Esquema de salidas para detección y segmentación

| Tarea               | Salida (formato)                                                                                               | Interpretación de coordenadas                                      | Notas prácticas                                                                                   | Fuente |
|---------------------|------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|--------|
| Detección de objetos| Caja delimitadora normalizada                                                                                   | [ymin, xmin, ymax, xmax] escaladas a 0–1000                         | Desescalar a píxeles según dimensiones reales; soporta etiquetas personalizadas                   | [^4]   |
| Segmentación        | Lista JSON con: box_2d, label, mask (PNG base64 dentro del cuadro)                                               | box_2d normalizado [y0, x0, y1, x1]; mask es mapa de probabilidad   | Redimensionar mask al cuadro; binarizar con umbral 127; mejor con “thinking_budget=0” en 2.5      | [^4][^7] |

Límites de tokenización y coste. En prompts masivos, el coste en tokens puede crecer por mosaicos. La Tabla 4 ofrece una guía de estimación basada en la documentación.

Tabla 4. Estimación de tokens por imagen y por mosaico (ejemplos)

| Dimensiones de imagen | Tokens (≤384 px) | Mosaicos (≈ 768 px c/u) | Tokens totales (estim.) | Ejemplo de cálculo                                                                | Fuente |
|-----------------------|------------------|--------------------------|-------------------------|------------------------------------------------------------------------------------|--------|
| 512 × 512             | —                | 1                        | 258                     | >384 px → 1 mosaico de 768×768 (re escalado) → 258 tokens                         | [^4]   |
| 1024 × 1024           | —                | 4                        | 1,032                   | 2×2 mosaicos → 4×258 = 1,032                                                      | [^4]   |
| 2048 × 1536           | —                | 6                        | 1,548                   | unidad≈1024; (2048/1024)×(1536/1024)≈2×1.5=3→re escalado yielding ~6 mosaicos      | [^4]   |
| 960 × 540             | —                | 6                        | 1,548                   | unidad≈360; (960/360)×(540/360)=3×2=6 mosaicos                                    | [^4]   |

Esta estructura de coste obliga a priorizar la calidad y relevancia de las vistas (p. ej., angles que maximizan cobertura sin redundancia), y a utilizar la API de Archivos para evitar re-subir repetidamente las mismas imágenes en prompts múltiples.

### Aplicación práctica a componentes de relojes

Para un configurador 3D de relojes, la detección y segmentación por materiales y componentes (caja, bisel, esfera, correa) reduce trabajo manual y mejora la limpieza de datos previa a fotogrametría. Las cajas y biseles metálicos requieren especiales cuidados: reflejos especulares pueden confundir segmentadores; las correas текстуриadas con patrones repetitivos también challengean la generalización. La recomendación operativa es:

- Capturar con iluminación difusa y fondos neutros para minimizar brillos especulares y artefactos.
- Solicitar masks de segmentación específicas por material (metal pulido, mate, zafiro, leather) y normalizarlas antes del paso de fotogrametría para no introducir ruido geométrico.
- Combinar vistas con y sin flash para “ensanchar” el espectro de reflectancias de manera controlada, incrementando la robustez de la reconstrucción[^4].

## Capacidades de generación de contenido

Gemini 2.0 Flash introduce generación y edición nativa de imágenes dentro del mismo flujo multimodal, con la capacidad de mantener consistencia de estilo, corregir iterativamente y renderizar texto dentro de las imágenes de forma más robusta que alternativas probadas en algunos escenarios[^11][^12]. Para activos de lujo, esto habilita tareas como:

- Variaciones de estilo y composición: explorar paletas, fondos y ritmos visuales sin abandonar la conversación multimodal.
- Mockups y acabados: generar vistas coherentes de componentes con tratamientos específicos (p. ej., diferentes pulidos del bisel) manteniendo consistencia de escena.
- Edición conversacional de alto nivel: corregir imperfecciones en materiales o iluminaciones con prompts de lenguaje natural y revisar diferencias en pocos turnos.

Sin embargo, la generación de mapas PBR (Physically Based Rendering) —albedo, roughness, metallic, normal— no es una capacidad documentada de forma oficial. Aunque existe un “preview” de generación de imágenes y mejoras en edición, no se especifica control determinista de canales PBR ni parámetros físicos de materiales. Por ello, las salidas generadas deben entenderse como texturas 2D orientadas a marketing o previsualización, no como mapas PBR de producción[^6][^12].

Tabla 5. Modelos de generación y edición (gemini-2.0-flash-preview-image-generation)

| Modelo (Preview)                                     | Estado           | Soporte de Live | Disponibilidad regional (indicativa)         | Notas de límites | Fuente |
|------------------------------------------------------|------------------|-----------------|----------------------------------------------|------------------|--------|
| gemini-2.0-flash-preview-image-generation            | Preview/Experimental | No             | No soportado actualmente en varios países EMEA | Límites RPM/RPD más restrictivos | [^6]   |

En la práctica, la generación nativa acelera iteración creativa; la calidad y control físico de materiales deben validarse por pruebas A/B y criterios de aceptación de marca antes de aplicar a experiencias PBR.

## Reconstrucción 3D con Gemini: qué puede y qué no puede hacer

Gemini procesa múltiples imágenes y puede devolver información espacial avanzada, incluyendo detección de objetos y segmentación con máscaras y coordenadas normalizadas. Existen notebooks y ejemplos (p. ej., “spatial understanding”, “experimental 3D pointing”) que ilustran señales espaciales y de apuntamiento en 2D, pero no constituyen reconstrucción SfM/MVS ni salidas de malla 3D[^7][^8]. En consecuencia:

- Gemini no reemplaza COLMAP ni APS Reality Capture.
- Su rol es el de “cerebro” previo: limpiar datos, segmentar componentes, etiquetar y normalizar entradas para que el motor de reconstrucción trabaje con menos ruido y mayor consistencia, aumentando la robustez de la nube de puntos y la malla resultante[^2][^3].
- Una recomendación de arquitectura híbrida es usar Gemini como orquestador y anotador; COLMAP para lotes controlados; y APS para picos o SLAs empresariales[^2][^3].

## Ventajas frente a otros modelos multimodales gratuitos

Comparado con alternativas populares, Gemini 2.0 Experimental Free destaca por una combinación poco frecuente en una sola API: detección/segmentación con máscaras, edición y generación de imágenes en el mismo flujo, ventanas de contexto muy amplias y la posibilidad de operar en tiempo real con superficies Live en modelos afines[^5][^6]. Esto reduce la fragmentación de servicios en POCs: una sola API puede alimentar análisis, anotación y variantes visuales, acelerando la iteración.

La contracara es que los modelos experimentales vienen con límites más estrictos y disponibilidad regional dispar, sobre todo en generación de imágenes. Para producción, conviene planificar el paso a variantes estables o a tiers de pago, manteniendo rutas de fallback a motores de reconstrucción y librerías de renderizado 3D ampliamente adoptadas (Three.js, Babylon.js)[^16][^17].

Tabla 6. Comparativa cualitativa: Gemini 2.0 vs alternativas (texto/multimodal)

| Capacidad                               | Gemini 2.0 Experimental Free | Alternativas típicas |
|-----------------------------------------|-------------------------------|----------------------|
| Ventana de contexto                     | Hasta 1M tokens (2.0 Flash)   | Variable             |
| Detección con cuadros delimitadores     | Sí (2.0+)                     | Frecuente            |
| Segmentación con máscaras               | Sí (2.5+)                     | No siempre           |
| Generación/edición de imágenes          | Sí (Preview)                  | Variable             |
| Tiempo real (Live)                      | Sí (modelos Live afines)      | No siempre           |
| Cobertura de casos multimodales         | Amplia                        | Variable             |
| Límites en Experimental                 | Más estrictos                 | Similar              |

Nota: la tabla es cualitativa y basada en documentación pública; los detalles dependen de modelo/tier y región.

## Integración de Gemini 2.0 en un pipeline 2D→3D

Una integración pragmática maximiza el valor de Gemini antes del motor de reconstrucción y minimiza sorpresas en producción. Proponemos el siguiente flujo:

1) Ingesta y prefiltrado. Subir conjuntos de imágenes por componente (SKU) vía interfaz administrativa. Usar la API de Archivos para evitar límites inline y preparar lotes.

2) QC y anotación con Gemini. Solicitar subtitulado, VQA, detección y segmentación. Exportar máscaras normalizadas y etiquetas para revisión humana en bucle cerrado.

3) Limpieza y normalización. Binarizar máscaras, desescalar coordenadas, consolidar por SKU y uniformar iluminación/reflectancias cuando sea posible.

4) Reconstrucción. Usar COLMAP como base y APS para picos o SLAs; almacenar metadatos de calidad para trazabilidad.

5) Optimización y publicación. Convertir a glTF/GLB, aplicar Draco y texturas KTX2, servir vía CDN y renderizar en Three.js/Babylon.js con materiales PBR[^15][^16][^17][^18].

![Componentes técnicos de un reloj: candidatos para segmentación y anotación previa con Gemini.](componentes_relojes_9.jpg)

![Referencia de configurador 3D: objetivos de calidad visual y UX para contrastar con salidas 2D->3D.](configuradores_3d_4.jpg)

Tabla 7. Mapa de integración: módulo del pipeline y APIs implicadas

| Módulo del pipeline                  | Gemini (API)                                     | Otras tecnologías                      | Salida esperada                                  | Fuente |
|--------------------------------------|--------------------------------------------------|----------------------------------------|--------------------------------------------------|--------|
| Ingesta y prefiltrado                | Files API (imágenes repetidas)                   | Almacenamiento temporal                | Lotes homogéneos por SKU                         | [^4]   |
| QC y anotación (detección/segmentación)| Gemini 2.0/2.5 (image understanding)            | Cuadernos Cookbook                     | Cuadros, masks, etiquetas por componente         | [^7][^8][^10] |
| Limpieza/normalización               | Prompt engineering + post-procesado               | Scripts de binarización/desescala      | Máscaras limpias, metadatos de calidad           | [^4]   |
| Reconstrucción 3D                    | —                                                | COLMAP; APS Reality Capture            | Malla/texturas (pre glTF)                        | [^2][^3] |
| Optimización web                     | —                                                | glTF-Transform; Draco; KTX2            | GLB con geometría/texturas optimizadas           | [^15]  |
| Renderizado y experiencia            | —                                                | Three.js/Babylon.js                    | Visualización PBR en web                         | [^16][^17] |

### Orquestación y límites: manejo de rate limits

Un diseño cuidadoso de colas y lotes permite operar con libertad razonable dentro del free tier:

- Diseñar colas por SKU, componente y turno del día para no concentrar llamadas en ventanas críticas.
- Aplicar backoff exponencial y reintentos idempotentes ante 429; llevar un contador de “tokens consumidos por mosaico” para prever TPM.
- En tareas por lotes, usar el Batch API para “aplanar” picos y aprovechar límites de tokens encolados; reservar el modo interactivo para validación y QA[^1].

## Límites de uso gratuito y consideraciones de escalado

En el free tier, los límites de RPM/TPM/RPD varían por modelo; como regla, los modelos experimentales/preview presentan restricciones más severas y disponibilidad regional más acotada. Es aconsejable monitorear el consumo en AI Studio, y planificar un escalado a tiers de pago cuando el POC/MVP lo justifique: el upgrade a Tier 1/2/3 mejora RPM, TPM y RPD, y abre capacidad de Batch con tokens encolados significativamente mayores[^1][^14].

Tabla 8. Comparativa Free vs Tier 1 (indicativa) para 2.0 Flash

| Tier    | RPM     | TPM (entrada) | RPD | Batch (tokens encolados) | Fuente |
|---------|---------|---------------|-----|---------------------------|--------|
| Free    | 15      | 1,000,000     | 200 | —                         | [^1]   |
| Tier 1  | 2,000   | 4,000,000     | *   | 10,000,000                | [^1]   |

Buenas prácticas:
- Monitorear consumo en AI Studio (pestaña de rate limit) y ajustar “ventanas de proceso” en consecuencia[^1].
- Segmentar el catálogo y las validaciones por lotes para distribuir carga a lo largo del día.
- Al pasar a tiers de pago, solicitar aumentos de límite cuando corresponda; documentar SLOs y reintentos para evitar sorpresas.

## Resultados esperados, riesgos y recomendaciones

Resultados esperados. En un POC de 4–6 semanas, Gemini acting como orquestador multimodal debería:
- Reducir tiempos de QC y anotación mediante detección/segmentación y VQA automatizados.
- Aumentar la consistencia de las entradas a reconstrucción (máscaras limpias, etiquetas por componente), reduciendo retrabajos en malla/texturas.
- Acelerar iteraciones de mockups visuales y opciones de marketing sin depender de múltiples servicios.

Riesgos principales:
- Calidad variable en segmentación para materiales especulares o patrones complejos; mitigación: guías de captura, iluminación difusa y revisión humana en bucle.
- Límites del free tier (RPD/RPM) que ralenticen el desarrollo; mitigación: batch y colas distribuidas, alternancia de superficies (Developer/Vertex).
- Restricciones regionales en generación de imágenes; mitigación: tests tempranos de disponibilidad y fallback a variantes estables.
- Modelos experimentales no aptos para producción; mitigación: plan de upgrade a tiers de pago y ruta de fallback a COLMAP/APS[^1][^2][^3].

Recomendaciones de inmediato:
- Aprobar un POC con dos componentes (caja y correa) para medir mejoras en tiempo y calidad.
- Establecer guías de captura fotográfica (iluminación, fondo, ángulos).
- Instrumentar métricas de calidad: precisión de segmentación, consistencia de materiales, tiempos por lote, tasa de retrabajo.
- Preparar arquitectura híbrida con COLMAP como base y APS para picos; mantener Gemini como capa de enriquecimiento multimodal[^2][^3].

## Apéndice técnico: parámetros y estructuras

Para acelerar la implementación, conviene fijar patrones de llamada y estructuras de salida.

Tabla 9. Parámetros clave y límites por modelo (orientativo)

| Modelo                      | Contexto (tokens) | Formatos imagen | Imágenes por prompt | Live API | Notas de uso                     | Fuente |
|----------------------------|-------------------|-----------------|--------------------|----------|----------------------------------|--------|
| gemini-2.0-flash           | Hasta 1,048,576   | PNG/JPEG/WEBP/HEIC/HEIF | Hasta ~3,600      | Sí       | “Stable/Latest”; gran contexto   | [^4][^6] |
| gemini-2.0-flash-lite      | Hasta 1,048,576   | Ídem            | —                  | No       | Eficiente en costo/latencia      | [^6]   |
| gemini-2.0-flash-exp       | —                 | Ídem            | —                  | —        | Experimental; límites estrictos  | [^6]   |

Tabla 10. Esquema JSON de segmentación: campos y normalización

| Campo    | Tipo/Descripción                                 | Normalización/Interpretación                        | Fuente |
|----------|---------------------------------------------------|-----------------------------------------------------|--------|
| box_2d   | [y0, x0, y1, x1] normalizado (0–1000)            | Desescalar a píxeles según tamaño original          | [^4]   |
| label    | Texto (etiqueta del objeto)                      | Personalizable por dominio                          | [^4]   |
| mask     | PNG base64 dentro del cuadro (mapa de probabilidad 0–255) | Redimensionar al cuadro; binarizar (umbral 127) | [^4][^7] |

Ejemplos y notebooks de referencia:
- Comprensión espacial 2D: cuadernos del Cookbook con detección y segmentación; útiles para estandarizar salidas y validar interpretaciones[^7][^10].
- “Experimental 3D pointing”: demostración de señales espaciales que inspiran a diseñar prompts con indicios de profundidad, aunque no reemplazan SfM/MVS[^8].

---

## Gaps de información (para seguimiento)

- No existe documentación oficial de que Gemini genere mapas PBR (albedo/roughness/metallic/normal) de forma nativa y controlable.
- No hay evidencia de que Gemini produzca geometría 3D o reconstruya mallas; COLMAP/APS siguen siendo necesarios para SfM/MVS.
- Disponibilidad regional y restricciones exactas del free tier pueden variar; conviene verificar elegibilidad del proyecto y de modelos “Preview” por país.
- Límites precisos para gemini-2.0-flash-exp no se listan por separado en las tablas de rate limits; la API lo trata como Experimental con límites más estrictos.

---

## Referencias

[^1]: Rate limits | Gemini API - Google AI for Developers. https://ai.google.dev/gemini-api/docs/rate-limits  
[^2]: COLMAP - Structure-from-Motion and Multi-View Stereo. https://github.com/colmap/colmap  
[^3]: Autodesk Platform Services (APS) - Reality Capture API. https://aps.autodesk.com/en/docs/reality-capture/v1/overview/introduction/  
[^4]: Image understanding | Gemini API | Google AI for Developers. https://ai.google.dev/gemini-api/docs/image-understanding  
[^5]: Gemini 2.0 Flash | Generative AI on Vertex AI. https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-0-flash  
[^6]: Gemini Models | Gemini API - Google AI for Developers. https://ai.google.dev/gemini-api/docs/models  
[^7]: Gemini Cookbook - Spatial understanding (2D) notebook. https://github.com/google-gemini/cookbook/blob/main/quickstarts/Spatial_understanding.ipynb  
[^8]: Gemini Cookbook - Experimental 3D pointing notebook. https://github.com/google-gemini/cookbook/blob/main/examples/Spatial_understanding_3d.ipynb  
[^9]: Gemini API - Files API. https://ai.google.dev/gemini-api/docs/files  
[^10]: Imagen de referencia de configurador 3D (Nike By You). https://www.nike.com/es/u/custom-nike-air-max-90-shoes-by-you-10002041/2667687259#Builder  
[^11]: Experiment with Gemini 2.0 Flash native image generation - Google Developers Blog. https://developers.googleblog.com/experiment-with-gemini-20-flash-native-image-generation/  
[^12]: Image generation with Gemini (Gemini API). https://ai.google.dev/gemini-api/docs/image-generation  
[^13]: Rate limits and quotas | Firebase AI Logic. https://firebase.google.com/docs/ai-logic/quotas  
[^14]: Quotas and limits | Gemini for Google Cloud. https://docs.cloud.google.com/gemini/docs/quotas  
[^15]: glTF-Transform - Documentation. https://gltf-transform.dev/  
[^16]: Three.js - JavaScript 3D Library. https://threejs.org/  
[^17]: Babylon.js - Web-based 3D. https://www.babylonjs.com/  
[^18]: 3D Gaussian Splatting for Real-Time Radiance Field Rendering. https://github.com/graphdeco-inria/gaussian-splatting
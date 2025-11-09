# Optimización 3D avanzada en 2025: compresión moderna, shaders PBR, LOD automático, culling, streaming e instancing

## Resumen ejecutivo y mapa de decisiones 2025

El rendimiento en tiempo real en 2025 depende menos de una sola “ bala mágica ” y más de la orquestación coherente de técnicas complementarias. La experiencia reciente en motores y proyectos comerciales muestra que la combinación de compresión de texturas y mallas, materiales PBR eficientes, sistemas de LOD automático, culling avanzado (hardware y software), streaming de texturas y draw calls agresivo mediante instancing, produce ganancias multiplicativas cuando se integra en un pipeline único y medido de forma continua. Con APIs modernas como DirectX 12, Vulkan y Metal, y con WebGPU emergiendo en la web, la disciplina de ingeniería gráfica debe pivotar hacia arquitecturas “ GPU-driven ”, buffers de indirectos y programación de compute para visibilidad y streaming, reduciendo viajes CPU↔GPU y alineando la carga de trabajo con el hardware contemporáneo.[^1][^2][^3][^4]

Las prioridades cambian de forma significativa según plataforma:

- Móvil (Android/iOS): el coste energético del filtrado de texturas, la presión sobre el ancho de banda de memoria y la necesidad de paquetes pequeños exigen un pipeline de texturas basado en transcodificación (Basis/KTX2) a formatos nativos (ETC2/ASTC), mipmapping y atlases. PBR debe minimizar samplers y operaciones costosas, favoreciendo instancias de materiales y, cuando la densidad geométrica lo requiera, instancing agresivo.[^5][^6][^7]
- PC/Consola: las escenas “ GPU-driven ” con culling en compute y pirámide de profundidad (depth pyramid), listas de dibujo indirectas, instancing por lotes y LOD automático dirigido por métricas de performance reducen cuellos de botella de CPU y aumentan la escalabilidad. Las innovaciones en DirectX (p. ej., Advanced Shader Delivery, Shader Execution Reordering, Opacity Micromaps) ofrecen ventajas adicionales cuando se integran con trayectorias de rayos y pipelines gráficos tradicionales.[^1][^2]
- Web: WebGPU habilita compute y pipelines explícitos, y, junto con KTX2/Basis y texturas transcodificadas, permite experiencias 3D con cargas rápidas y memoria contenida. El streaming de mipmaps y la gestión cuidadosa de memory footprints son claves para estabilidad y latencias previsibles.[^3][^4]

Para facilitar decisiones rápidas, el siguiente mapa sintetiza la técnica principal, su objetivo y los trade-offs típicos.

Tabla 1. Mapa de decisiones rápidas: técnica principal vs objetivo vs cuándo usarla y trade-offs
| Técnica principal                     | Objetivo principal                       | Cuándo usarla                                               | Trade-offs clave                                                                                 |
|--------------------------------------|------------------------------------------|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Basis/KTX2 (ETC1S/UASTC)             | Reducir tamaño y ancho de banda de texturas; portabilidad multiplataforma | Móvil, web y multiplataforma con pocas variantes de build   | Transcodificación en runtime/carga; memoria temporal; tuning fino por contenido                  |
| Draco (mallas y point clouds)        | Reducir tamaño de geometría y tiempo de transmisión | Escenas con mallas densas, streaming de meshes              | Tiempo de decodificación; tuning de cuantización; no orientado a píxeles                         |
| Shaders PBR optimizados              | Menor coste por píxel y ancho de banda; menos draw calls | Materiales repetidos, UI en 3D, normal maps                 | Riesgo de aplanar look si se sobre-optimiza; cuidado con sRGB y packing de canales               |
| LOD automático                       | Reducir vértices/triángulos y coste de shading distantemente | Mundos abiertos, escenas con densidad variable              | Pops si no hay transición suave; costes de generación/validación de niveles                      |
| Occlusion culling (HW + depth pyramid) | Eliminar invisibles, reducir draw calls y overdraw      | Escenas urbanas/densas, oclusión significativa              | Latencia de 1 frame en depth pyramid; tuning de umbrales; complejidad de integración             |
| Texture streaming + feedback GPU     | Ajustar mipmaps a la demanda visual; memory footprint dinámico | Mundos abiertos, picos de memoria, carga progresiva         | Necesita threading, sincronización y APIs de minLOD/tiled resources; complejidad de implementación |
| Geometry instancing (variaciones)    | Reducir draw calls y memoria; mantener diversidad | Vegetación, props, assemble parts                           | Gestión de per-instance data; sorting de transparencia; coherencia de material                    |

Este informe profundiza en el cómo: estándares y codecs (Basis/Draco), reglas prácticas para PBR, patrones de LOD automático y métricas de calidad, técnicas de culling y su latencia, streaming con retroalimentación GPU, y arquitectura de instancing. Además, se presentan ejemplos de implementación y KPIs recomendados para medir el éxito.

Adicionalmente, apuntamos varias lagunas de información que requieren validación en proyecto: benchmarks comparativos entre Draco y Basis/ETC1S/UASTC en tiempo de carga y calidad percibida; impacto de instancing con materiales variables bajo diferentes APIs; métricas estandarizadas de LOD automático; y datos de consumo energético de filtrado anisotrópico por GPU móvil específica. Estas brechas se señalan de forma explícita donde afectan decisiones.

## Metodología, alcance y fuentes

La metodología se basa en documentación oficial de APIs y proveedores de hardware, guías de motores y ejemplos open-source, junto con blogs técnicos y artículos de referencia ampliamente citados en la industria. En particular, se han utilizado como pilares la guía de texturas de Android, el repositorio y wiki de Basis Universal, la documentación oficial de Draco, las especificaciones de WebGPU/WGSL, el blog de DirectX con innovaciones recientes, y el tutorial de Vulkan sobre culling en compute.[^5][^6][^1][^3][^4]

El alcance cubre PCs, móviles (Android/iOS) y web. La selección de fuentes privilegia URLs verificables y contenidos técnicos que permiten traslación directa a prácticas de implementación. La narrativa técnica avanza desde los fundamentos de compresión de texturas/mallas, hacia patrones de integración en motores y APIs modernas, culminando en una arquitectura de pipeline integrada y una hoja de ruta por plataforma.

## Fundamentos de compresión moderna para 3D: Basis Universal y Draco

La compresión moderna en 2025 se divide claramente por dominio: Basis Universal (texturas) y Draco (geometría/point clouds). Ambos persiguen reducir almacenamiento y ancho de banda, pero sus mecanismos y productos finales difieren.

Basis Universal propone un modelo de “ supercompresión ” y transcodificación runtime a formatos nativos de GPU (ETC1/2, ASTC, BCn, PVRTC), simplificando pipelines multiplataforma. Los archivos .basis/.KTX2 se transcodifican a LDR/HDR según necesidades del dispositivo, con modos ETC1S (máxima compresión) y UASTC (alta calidad).[^6][^10][^11][^12][^13][^14][^16][^17]

Draco, por su parte, comprime mallas y point clouds para mejorar almacenamiento/transmisión. Su integración en glTF y 3D Tiles ha sido ampliamente utilizada en pipelines de visualización geoespacial y visualizaciones web, con decodificación en el cliente y ejemplos en JavaScript/three.js.[^7][^8][^9]

Tabla 2. Comparativa Basis (ETC1S vs UASTC) vs Draco: propósito, tasas, calidad y casos de uso
| Codec / Modo     | Dominio                    | Tasa/bitrate típica                 | Calidad esperada                         | Transcodificación/decodificación             | Casos de uso recomendados                                                   |
|------------------|----------------------------|-------------------------------------|------------------------------------------|----------------------------------------------|------------------------------------------------------------------------------|
| Basis ETC1S      | Texturas LDR (sRGB/lineal) | ~0.3–3 bpp (muy comprimido)         | Buena para difusas/UI; aceptable para muchos assets | Rápida a ETC2/ASTC/BC7                       | Móvil y web con fuerte presión de tamaño; paquetes mínimos; runtime pipelines |
| Basis UASTC LDR  | Texturas LDR HDR           | ~8 bpp (4×4); 3–4:1 típico          | Alta; competitiva con BC7/ASTC           | Muy rápida a ASTC/BC7; sugerencias aceleran | Normales y detalles “ hero ”, PC/consola; calidad prioritaria                 |
| UASTC HDR 4×4/6×6| Texturas HDR               | 8 bpp (4×4), ~3.56 bpp (6×6)        | Alta fidelidad HDR; BC6H/ASTC HDR        | Rápida a BC6H; ASTC HDR nativo en algunos HW | Skyboxes HDR, materiales emisivos high-end, entornos con iluminación física   |
| Draco            | Mallas y point clouds      | Variable según cuantización         | Depende de configuración de malla        | Decodificación en CPU/GPU; ejemplos JS       | Reducción de tamaño de meshes, streaming 3D; integración con glTF y 3D Tiles  |

El punto crítico es reconocer que Basis ataca el problema de “ píxeles en la GPU ” (formato comprimido en VRAM), mientras que Draco comprime “ geometría y colores por punto ” para transporte/almacenamiento. En el render, las texturas Basis transcodificadas se muestrean nativamente en la GPU; las mallas Draco deben decodificarse antes de generar vértices y draw calls.

### Basis Universal (ETC1S vs UASTC): pipeline y transcodificación

El pipeline típico comprime las fuentes a .basis/.KTX2 durante el build, y transcodifica en runtime al formato nativo del dispositivo (ETC2/ASTC/BC7). El modo ETC1S maximiza compresión y es idóneo para difusas y UI; UASTC LDR/HDR prioriza calidad para normales y activos “ hero ”, con bitrates más altos pero transcodificación especialmente eficiente a ASTC/BC7.[^6][^10][^11][^12][^13][^16][^17]

Las ganancias en almacenamiento/ancho de banda son sustanciales. Publicaciones y guías técnicas mencionan reducciones del 50–80% en almacenamiento de texturas y 50–90% en ancho de banda frente a enfoques tradicionales (según contenido y configuración).[^11] Estas cifras son indicativas y requieren validación por proyecto.

### Draco para mallas y point clouds

Draco se integra en glTF y 3D Tiles, y su decodificación puede hacerse en el navegador, con ejemplos públicos y artículos técnicos. Es útil cuando la geometría es densa o el transporte es el cuello de botella; se debe considerar la latencia de decodificación y la calidad resultante tras la cuantización. La configuración de parámetros de compresión debe alinearse con el tipo de escena y la tolerancia a pérdidas geométricas.[^7][^8][^9]

## Shaders optimizados para materiales PBR

El renderizado físico basado en elementos (Physically Based Rendering, PBR) se estandariza en glTF con parámetros como baseColor, metallic, roughness, normal, occlusion y emissive.[^18] La optimización eficaz en tiempo real comienza con prácticas de texturas: elegir el espacio de color correcto (sRGB para color, lineal para datos físicos), generar mipmaps (con un aumento de memoria del ~33%), evitar detalles imperceptibles, y empaquetar canales (p. ej., combinar AO/roughness/metalness en una sola textura) para reducir el número de samplers.[^5]

El coste del filtrado puede ser considerable. La guía de Android señala que el filtrado de texturas puede representar hasta la mitad del consumo energético de la GPU; por tanto, elegir bilinear como base, considerar trilinear con cautela y limitar anisotropy a valores modestos (p. ej., 2×) es recomendable salvo casos específicos.[^5] El atlas de texturas reduce draw calls al agrupar materiales; sin embargo, debe evitar el sangrado de texturas (bleeding) con unwraps cuidadosos.

A nivel de shader, minimizar ramas y operaciones costosas por píxel, aprovechar precomputaciones en texturas y usar material instancing (parametrización por instancia) reduce draw calls y sobrecoste de cambios de estado. En web, WGSL y WebGPU demandan explícita gestión de recursos y cómputo; la disciplina de PBR debe alinearse con estos modelos.[^4]

Tabla 3. Checklist de optimización PBR: decisiones clave y su impacto
| Decisión                       | Impacto esperado                                   | Nota clave                                                                 |
|-------------------------------|-----------------------------------------------------|-----------------------------------------------------------------------------|
| sRGB en baseColor; lineal en datos físicos | Evitar colores incorrectos; conserve energía | GLTF define espacios; validar en importador del motor[^18]                 |
| Mipmaps activados             | Menos aliasing; mejor caché; +33% memoria           | Ajustar tamaños de textura por distancia y plataforma[^5]                  |
| Filtrado bilinear como base   | Menor coste energético                              | Trilinear costoso; anisotropy >2× muy costoso[^5]                           |
| Empaquetado de canales        | Menos samplers y operaciones                        | Asignar más bits al verde donde aplique; AO/roughness/metalness en un mapa  |
| Atlases de texturas           | Reducción de draw calls                             | Controlar UVs y sangrado; batching coherente                                |
| Material instancing           | Menos draw calls; coherencia de estado              | Parametrización per-instance y variantes controladas                        |
| Evitar detalles imperceptibles| Reducción de ancho de banda y memoria               | Simplificar texturas secundarias y remotas                                  |
| Baking de detalles            | Menos cálculos en tiempo real                       | AO, specular highlights cocinados cuando sea viable                         |

### Material instancing y reducción de draw calls

La instanciación de materiales permite compartir la geometría y el shader base, variando parámetros por instancia (color, normal, roughness) sin duplicar draw calls. La combinación con atlases y empaquetado de canales reduce cambios de estado y solicitudes de muestreo. Estas técnicas mejoran el throughput de CPU y GPU cuando se gestionan bajo una política clara de “ materiales compartidos primero, variaciones justificadas después ”.

## Level of Detail (LOD) automático

El LOD automático se centra en reducir vértices y coste de shading de forma proporcional a la distancia o importancia perceptual. Las transiciones suaves (p. ej., alpha blending o morphing) evitan “ pops ”, y el LOD dinámico puede ajustarse a métricas de performance en tiempo real para sostener FPS objetivo.[^19]

La automatización con herramientas como Simplygon y enfoques de IA reduce coste de producción y genera niveles consistentes. En 2025, investigaciones en generación automática de modelos de edificios muestran pipelines ML que reconstruyen LOD2/LOD3 con precisión alta, tiempos de proceso competitivos y métricas de IoU/mAP robustas en detección de elementos (ventanas/puertas), señalando el potencial de la automatización más allá de entornos de juego.[^20]

Tabla 4. LOD por tipo de asset: técnica, costes y riesgos
| Tipo de asset      | Técnica principal            | Coste/beneficio principal                          | Riesgo de popping                | Nota práctica                                          |
|--------------------|------------------------------|-----------------------------------------------------|----------------------------------|--------------------------------------------------------|
| Arquitectura       | Decimación + fusión de bordes| Gran ahorro en vértices distantes                  | Medio si sin morphing            | Planificar UVs compartidas y atlas por planta          |
| Vegetación         | Impostors + alpha blending   | Menos geom./shading; fotorealismo aparente         | Bajo si blending bien tuneado    | Usar billboards para distancias medias-lejanas         |
| Props repetidos    | LOD por categoría y material | Reducción significativa de draw calls               | Bajo                              | Instancing + LOD por distancia y relevancia            |
| Objetos “ hero ”   | LOD conservador + morphing   | Preserva la forma; transiciones imperceptibles     | Muy bajo                          | Validar normal maps y microdetalles por nivel          |

Tabla 5. Precisión y tiempos de generación LOD (datos de reconstrucción automática en edificios)
| Métrica                                         | Valor observado                       | Contexto/Notas                                       |
|-------------------------------------------------|---------------------------------------|------------------------------------------------------|
| IoU en detección de edificios (SSN preentrenado)| ~79%                                  | Dataset CamVid; máscaras de edificios[^20]           |
| mAP50 (YOLOv4 CSP, ventanas/puertas)            | Ventanas ~0.83; Puertas ~0.61         | Entrenamiento ~18h; mAP general ~0.76[^20]          |
| mAP50 (R-CNN atrous, iterado)                   | ~0.70                                 | Entrenamiento ~12h[^20]                              |
| Precisión clasificación de techos (CNN atrous)  | ~0.79                                  | Entrenamiento ~3h[^20]                               |
| Tiempo generación por edificio                  | ~63.2 s                                | Incluye extracción SVI y LOD1–3[^20]                 |
| Tiempo total 7 edificios (LOD1/2/3)             | ~458/462/466 s                         | Comparado a 14,400 s de medición manual[^20]         |

La calidad visual en transiciones debe validarse con métricas de error geométrico y normal maps consistentes. El LOD dinámico, conectado a un sistema de feedback de performance, mantiene la estabilidad del FPS objetivo sin sacrificar la identidad de los objetos cercanos.

## Occlusion culling avanzado

La eliminación de objetos invisibles (occlusion culling) se presenta en dos familias complementarias:

1) Hardware occlusion queries: emiten pruebas de visibilidad con aproximaciones (bounding boxes) y contabilizan fragmentos. El algoritmo jerárquico coherente reduce latencias y sobrecarga, empleando colas de consultas y coherencia temporal para emitir menos pruebas y evitar esperas innecesarias.[^21][^22]  
2) Software/driver-driven (depth pyramid): construyen pirámides de profundidad mínima en la GPU y determinan oclusión mediante samplers con reducción MIN; integradas con draw indirect, permiten pipelines “ GPU-driven ” sin viajes CPU↔GPU.[^23]

La elección depende del hardware y la escena: en escenas urbanas o con oclusión significativa, ambas técnicas aportan ganancias; en escenas “ abiertas ” con poca oclusión, el coste de las consultas puede superar el beneficio.

Tabla 6. Comparativa de técnicas de culling: pros, contras, latencia y requisitos
| Técnica                        | Pros                                         | Contras                                        | Latencia característica         | Requisitos/API                                 |
|--------------------------------|----------------------------------------------|------------------------------------------------|----------------------------------|------------------------------------------------|
| HW occlusion queries           | Precisión; integra bien con CPU/GPU          | Sobrecarga por emisión; latencia si mal usado  | Baja si cola y coherencia usadas | Extensiones occlusion query; jerarquía visible[^21][^22] |
| Depth pyramid (GPU-driven)     | Elimina roundtrips; escala a grandes escenas | 1 frame de latencia; tuning de mip y umbrales  | ~1 frame                         | Sampler MIN; compute; draw indirect[^23]       |
| Frustum culling (compute)      | Rápido; paralelo; sin CPU                    | No cubre oclusión                              | N/A                              | Buffers de parámetros; shaders de cómputo[^23] |

### Pirámide de profundidad y culling en Vulkan/D3D (GPU-driven)

La generación de la pirámide de profundidad (downsampling con reducción MIN) se realiza en compute. En Vulkan, la configuración de sampler con VK_EXT_sampler_filter_minmax habilita la reducción de mínima profundidad, y los shaders de culling proyectan esferas/AABB a espacio de pantalla, muestreando el nivel de mip adecuado para decidir visibilidad.[^23][^24] Este método introduce una latencia de un frame, mitigable con ampliación de esferas o reproyección de profundidad (prácticas empleadas en motores y títulos de referencia). Integrar draw indirect permite construir listas de dibujo en la GPU con incrementos atómicos por instancia visible.[^23]

## Texture streaming y streaming de assets

El streaming de texturas en motores modernos gestiona la carga/descarga de mipmaps según la demanda visual y la memoria disponible, leyendo archivos de forma eficiente (p. ej., DDS), actualizando recursos en el hilo principal, y ejecutando en segundo plano las tareas de IO y decodificación.[^25] Las transiciones suaves de mip se controlan con parámetros de minLOD fraccionarios y filtrado trilinear/anisotrópico moderado; la API de Vulkan expone VK_EXT_image_view_min_lod para este propósito, y DirectX 12 documenta cálculos LOD y soporte de tiled resources para escenarios de memoria segmentada.[^26][^27][^28]

Un elemento diferenciador es el feedback desde GPU: los shaders escriben solicitudes de resolución por material (basadas en derivadas UV) en un buffer de lectura para la CPU, que actualiza atómicamente la demanda de mipmaps por textura. Esta técnica, combinada con wave intrinsics, reduce la presión de atómicas y mejora la convergencia del sistema hacia el estado visual óptimo con menor consumo.[^25]

Tabla 7. Resoluciones mínimas de mip por formato (bloques 4KB vs 64KB)
| Formato                     | Bloque 4KB: min mip | Bloque 64KB: min mip |
|----------------------------|---------------------|----------------------|
| R8G8B8A8 (unorm)           | 16×16               | 64×64                |
| BC2/BC3/BC5/BC6H/BC7       | 32×32               | 128×128              |
| BC1/BC4                    | 64×64               | 256×256              |

Tabla 8. Componentes del sistema de streaming y sus riesgos
| Componente              | Descripción técnica                                               | Riesgo principal                          |
|-------------------------|-------------------------------------------------------------------|-------------------------------------------|
| Hilo de fondo           | IO y carga parcial de archivos (p. ej., DDS)                      | Contención y latencia si mal sincronizado |
| Reemplazo de recurso    | Swap seguro en hilo principal con mutex                           | Artefactos si la sincronización falla     |
| Parámetro minLOD        | Control fraccionario de transición de mip                         | Popping si el tuning es agresivo          |
| Feedback GPU            | Escritura de solicitudes por píxel; lectura en CPU                | Congestión de atómicas; bandwidth extra   |
| Tiled resources         | Gestión de memoria segmentada en D3D12                            | Complejidad de gestión y configuración    |

### Pipeline de streaming con feedback GPU

El pipeline combina: a) generación del feedback desde shader (derivadas UV, solicitud de resolución), b) lectura de resultados en CPU (heap de readback y mapeos persistentes), c) actualización atómica de solicitudes por textura y prioridad, d) carga/descarga de mipmaps en el hilo de fondo y reemplazo seguro de recursos. Wave intrinsics reducen el número de operaciones atómicas efectivas, y los samplers MIN en depth pyramid inspiran configuraciones similares para reducir variabilidad en la señal.[^25]

## Geometry instancing para múltiples variaciones

La instancing de geometría reutiliza una malla para múltiples objetos (instancias), añadiendo datos por instancia para color, transformación, parámetros de material y pequeñas variaciones. Cuando se combina con atlases y empaquetado de canales, se minimizan draw calls y cambios de estado, manteniendo diversidad visual.[^29]

Las “ GPU-driven pipelines ” usan draw indirect y culling en compute para construir listas de dibujo exclusivamente en la GPU; esto elimina viajes a CPU y permite escalar a escenas con decenas de miles de instancias visibles.[^23] La gestión de transparencias requiere cuidado: el ordenamiento estable en GPU con atómicos puede ser complejo, y algunas arquitecturas optan por un comando por objeto con instanceCount = 0 para invisibles, a costa de generar comandos de tamaño cero (que tienen un coste). OIT (order-independent transparency) es una alternativa más costosa pero elimina dependencias de orden.[^23]

Tabla 9. Patrones de instancing vs escenario
| Escenario                 | Patrón recomendado                           | Coste de draw calls | Memoria | Riesgo/consideración                         |
|---------------------------|----------------------------------------------|---------------------|---------|----------------------------------------------|
| Vegetación densa          | Instancing + impostors                       | Muy bajo            | Bajo    | Sorting transparente; viento por instancia   |
| Props repetidos           | Instancing con atlas                         | Bajo                | Bajo    | Variaciones de material y UV controladas     |
| Assemble parts (modular)  | Instancing + per-instance params             | Bajo                | Medio   | Gestión de colisiones/occlusión por batch    |
| Escasas variaciones       | Variantes de shader/material shared          | Muy bajo            | Muy bajo| Evitar explosión de variantes                 |

## Optimización de texturas para móviles (Android/iOS)

Las recomendaciones oficiales para Android posicionan ASTC como formato preferente en hardware moderno, con ETC2 ampliamente soportado (más del 90% de dispositivos activos) y ETC1 legado (sin alpha directo). La creación de atlas para reducir draw calls, la generación de mipmaps (con +33% de memoria), y el uso apropiado de filtros (bilinear base; anisotropic moderado) son prácticas de referencia.[^5] Las guías de Arm y NVIDIA amplían los detalles de ASTC y su equilibrio calidad/tasa de bits, y Google Play Asset Delivery ayuda a entregar el formato correcto a cada dispositivo.[^30][^31][^32]

Tabla 10. ETC2 vs ASTC en Android: soporte y trade-offs
| Formato | Soporte estimado | Alpha | Calidad/rendimiento típica                    | Uso recomendado                       |
|---------|-------------------|-------|-----------------------------------------------|---------------------------------------|
| ETC2    | >90% dispositivos | Sí    | Buena calidad; menor eficiencia que ASTC       | Amplia compatibilidad; fallback sólido|
| ASTC    | >75% dispositivos | Sí    | Calidad superior al mismo tamaño; configurable | Dispositivos modernos; ASTC como primario|

Tabla 11. Estrategias de filtrado y coste energético
| Filtro          | Coste relativo | Cuándo usar                                 | Nota clave                                   |
|-----------------|----------------|---------------------------------------------|----------------------------------------------|
| Nearest         | Muy bajo       | UI, pixel art, datos sin interpolación      | Pixelado; sin mipmaps                         |
| Bilinear        | Bajo           | Base para la mayoría de materiales          | Buen equilibrio calidad/energía[^5]          |
| Trilinear       | Medio/Alto     | Transiciones suaves entre mipmaps           | Costoso; usar con moderación                 |
| Anisotropic 2×  | Medio          | Superficies con ángulo extremo              | >2× muy costoso; mejor que trilinear 1×[^5]  |

### Especificidades iOS y consideraciones multiplataforma

En iOS, ASTC es el formato preferente por su equilibrio calidad/tamaño y su soporte de bitrates variables. La selección de bitrate por asset debe alinearse con la densidad visual: materiales “ hero ” (normales, detalles) justifican bitrates mayores; difusas y UI pueden comprimirse más agresivamente. Basis/KTX2 unifica pipelines, evitando múltiples variantes por plataforma.

## Arquitecturas modernas y 2025: DirectX, Vulkan, Metal, WebGPU

En 2025, varias innovaciones de DirectX aceleran la optimización de render: Advanced Shader Delivery elimina parones por compilación de shaders en el juego; Shader Execution Reordering (SER) mejora el paralelismo de rayos al reordenar ejecución; y Opacity Micromaps (OMMs) tratan geometría alpha-tested con eficiencia superior en trayectorias de rayos.[^1] En paralelo, Work Graphs en D3D12 llevan el GPU-driven rendering a nuevas cotas al encadenar trabajo en la GPU con feedback programable.[^2]

Vulkan y el culling en compute con depth pyramid ejemplifican el enfoque “ GPU-first ”, y el ecosistema Android adopta prácticas de batching, atlases y filtrado eficiente.[^23][^5] En Apple, Metal proporciona APIs de bajo overhead para rendimiento y eficiencia, alineándose con estos principios; en web, WebGPU y WGSL abren compute y pipelines explícitos con control del GPU.[^33][^3][^4]

Tabla 12. Matriz de soporte 2025 (categorías y ejemplos)
| Plataforma | Feature clave                       | Soporte conceptual           | Referencia principal         |
|------------|-------------------------------------|------------------------------|------------------------------|
| DirectX 12 | Advanced Shader Delivery, SER, OMMs | Disponible en ecosistema DX  | Blog DirectX[^1], Work Graphs[^2] |
| Vulkan     | Depth pyramid + compute culling     | Práctica documentada         | Vulkan Guide[^23]            |
| Metal      | Render loop y APIs low-overhead     | Disponible en Apple silicon  | Metal Overview[^33]          |
| WebGPU     | Pipelines explícitos, compute (WGSL)| Estándar emergente multiplataforma | MDN WebGPU, W3C[^3][^4]      |

## Ejemplos de implementación y métricas de performance

La traslación a práctica requiere ejemplos concretos:

- Basis/KTX2: pipeline de compresión (ETC1S para difusas/UI; UASTC para normales/details), transcodificación runtime a ETC2/ASTC/BC7, y verificación visual por plataforma. Buenas prácticas: caché de texturas transcodificadas y carga progresiva para evitar picos.[^6][^10][^11]
- Web (WebGPU): creación de buffers, autoría de shaders WGSL, y tareas de compute. Se pueden offloadar tareas de compresión/transcodificación en hilos WASM, y minimizar la presión de ancho de banda con KTX2.[^3][^4][^34]
- Wicked Engine: streaming de texturas con feedback GPU, control de minLOD, y downsampling/actualización de mipmaps en segundo plano.[^25]
- Draco: decodificación de meshes glTF con carga progresiva y pruebas de rendimiento en navegador.[^7][^8]

KPIs recomendados: tamaño de paquete (texturas y mallas), tiempo de carga total y por asset, memoria GPU (picos y media), FPS y estabilidad, draw calls (reducción %), overdraw, latencias de streaming y de culling, y coste energético (cuando sea medible en móvil). Integrar estos KPIs en dashboards y automatizar sampleos por escena es clave para decisiones informadas.

Tabla 13. KPIs antes/después por técnica (plantilla de reporte)
| Técnica                 | Paquete (MB) | Carga (s) | Memoria GPU (MB) | FPS medio | FPS p95  | Draw calls | Overdraw | Latencia streaming (ms) | Energía (móvil) |
|-------------------------|--------------|-----------|------------------|-----------|----------|------------|----------|-------------------------|-----------------|
| Basis ETC1S/UASTC       |              |           |                  |           |          |            |          |                         |                 |
| Draco (mallas)          |              |           |                  |           |          |            |          |                         |                 |
| LOD automático          |              |           |                  |           |          |            |          |                         |                 |
| Occlusion culling       |              |           |                  |           |          |            |          |                         |                 |
| Streaming + feedback    |              |           |                  |           |          |            |          |                         |                 |
| Instancing              |              |           |                  |           |          |            |          |                         |                 |

Tabla 14. Tiempos de transcodificación y consumo de memoria (observaciones)
| Conversión               | Tiempo típico              | Memoria temporal           | Nota                                                   |
|--------------------------|----------------------------|----------------------------|--------------------------------------------------------|
| Basis ETC1S a ETC2/ASTC  | Milisegundos por textura   | Requiere buffers temporales| Transcodificación rápida; caché recomendada[^6][^11]   |
| Basis UASTC a BC7/ASTC   | Muy rápida                 | Baja                       | Sugerencias de formato aceleran transcodificación[^6]  |
| Basis HDR a BC6H/ASTC HDR| Rápida                     | Moderada                   | HDR 4×4/6×6 con paths dedicados[^6]                    |
| Draco decodificación     | Dependiente del tamaño     | Baja/Media                 | Ajuste de cuantización; pruebas en web[^7][^8]         |

Nota sobre lagunas: faltan benchmarks públicos comparativos y estandarizados entre Draco y Basis/ETC1S/UASTC en tiempo de carga y calidad percibida por tipo de escena; también escasean métricas de consumo energético del filtrado por GPU móvil concreta y comparativas de instancing con variaciones de material por API. Recomendamos diseñar baterías de pruebas internas que cubran estos aspectos.

## Arquitectura integrada y hoja de ruta por plataforma

La ganancia real proviene de la integración: un pipeline único que reduzca draw calls (instancing/atlases), controle visibilidad (culling avanzado), ajuste demanda de mipmaps (streaming con feedback), y mantenga texturas/mallas comprimidas (Basis/Draco), con LOD automático que preserve la identidad visual.

Tabla 15. Hoja de ruta por plataforma: fases, métricas y responsables
| Plataforma | Fase                           | Acción clave                                              | Métrica objetivo                | Responsable                |
|------------|--------------------------------|-----------------------------------------------------------|----------------------------------|----------------------------|
| Móvil      | Texture pipeline               | KTX2/Basis (ETC1S/UASTC) + transcodificación              | -50–80% tamaño texturas[^11]     | Tech Art + Engineering     |
|            | Materiales y filtrado          | Bilinear base; anisotropy ≤2×; atlases                    | -30% coste filtrado[^5]          | Graphics Programming       |
|            | LOD + instancing               | LOD por categoría; instancing vegetation/props            | -40% draw calls                  | Tools + Engineering        |
|            | Culling                        | Frustum culling básico (compute si aplica)               | -20% overdraw                    | Engine                     |
| PC/Consola | GPU-driven                     | Depth pyramid + draw indirect                            | +20–40% escalabilidad[^23]       | Rendering Lead             |
|            | LOD automático                 | Morphing y métricas de performance                       | Pops < 1% frames                 | Tools                      |
|            | Shaders PBR                    | Material instancing; packing AO/R/M                       | -25% coste shader                | Graphics Programming       |
|            | Streaming + feedback           | minLOD fracc.; actualización atómica CPU                  | Latencia < 2 frames              | Engine                     |
| Web        | WebGPU + KTX2                  | Pipelines explícitos; transcodificación en WASM          | Carga -50% vs JPEG en GPU[^11]   | WebGL Engineer             |
|            | LOD + instancing               | LOD dinámico; instancing con atlases                      | -30% draw calls                  | Web Graphics               |
|            | Culling                        | Frustum culling en compute                                | -15% overdraw                    | Web Engine                 |

## Apéndices: herramientas, checklists y glossario

Checklist PBR:
- Validar espacios de color (sRGB para baseColor, lineal para normales/roughness/metalness/occlusion).  
- Generar mipmaps y ajustar filtrado (bilinear base, trilinear/anisotropic moderado).  
- Empaquetar canales (AO/roughness/metalness) y usar atlases para reducir draw calls.  
- Hornear detalles (AO, specular) donde aplique; evitar detalles imperceptibles.[^5][^18]

Checklist de streaming:
- Hilo de fondo para IO y carga parcial; reemplazo de recursos con sincronización robusta.  
- Usar minLOD fraccionario; trilinear/anisotropic moderado; sampler MIN para depth pyramid.  
- Feedback GPU con wave intrinsics; lectura en CPU y actualización atómica por textura.  
- Tiled resources (D3D12) para escenarios de memoria segmentada.[^25][^26][^27][^28]

Herramientas:
- Basisu (línea de comandos), transcodificadores KTX2; AMD Compressonator; DirectXTex; PVRTexTool.[^6][^36][^37][^38][^39]

Glosario:
- bpp: bits por píxel;  
- sRGB: espacio de color estándar para representación de color;  
- LOD: nivel de detalle;  
- HZB: hierarchical Z-buffer;  
- OMM: Opacity Micromaps;  
- SER: Shader Execution Reordering.

## Referencias

[^1]: DirectX Developer Blog (2025). Novedades en DirectX: Advanced Shader Delivery, SER, OMMs, Cooperative Vector, DirectStorage 1.3. https://devblogs.microsoft.com/directx/  
[^2]: NVIDIA. Advancing GPU-Driven Rendering with Work Graphs in Direct3D 12. https://developer.nvidia.com/blog/advancing-gpu-driven-rendering-with-work-graphs-in-direct3d-12/  
[^3]: MDN Web Docs. WebGPU API. https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API  
[^4]: W3C. WebGPU. https://www.w3.org/TR/webgpu/  
[^5]: Android Developers. Textures | Android game development. https://developer.android.com/games/optimize/textures  
[^6]: Binomial LLC. basis_universal (GitHub). https://github.com/BinomialLLC/basis_universal  
[^7]: Google. Draco 3D Graphics Compression. https://google.github.io/draco/  
[^8]: Cesium Blog. Draco Compressed Meshes with glTF and 3D Tiles. https://cesium.com/blog/2018/04/09/draco-compression/  
[^9]: Google Open Source Blog. Introducing Draco: compression for 3D graphics. https://opensource.googleblog.com/2017/01/introducing-draco-compression-for-3d.html  
[^10]: Basis Universal Documentation (Wiki). https://github.com/BinomialLLC/basis_universal/wiki  
[^11]: Basis Universal: The Complete Guide to … (Texture Compression). https://texturecompression.com/blog/basis-format-guide  
[^12]: Basis Universal Ratification and <model-viewer>. https://opensource.googleblog.com/2021/02/basis-universal-textures.html  
[^13]: Khronos. KTX specification v2.0. https://registry.khronos.org/KTX/specs/2.0/ktxspec.v2.html  
[^14]: web.dev. Guide: WebGL/WebGPU Texture Compression. https://web.dev/articles/textures  
[^15]: Don McCurdy. Choosing texture formats for WebGL and WebGPU. https://www.donmccurdy.com/2024/02/11/web-texture-formats/  
[^16]: UNC Gamma Lab. Basis Universal Technical Paper. https://gamma.cs.unc.edu/BASIS/  
[^17]: KhronosGroup. Basis Universal Transcoders. https://github.com/KhronosGroup/Basis-Universal-Transcoders  
[^18]: Khronos. PBR in glTF. https://www.khronos.org/gltf/pbr  
[^19]: 3DAI Studio. Mastering Level of Detail (LOD): Optimize Your Game Performance. https://www.3daistudio.com/blog/mastering-level-of-detail-lod-optimize-your-game-performance-without-sacrificing-quality  
[^20]: ScienceDirect (2025). Harnessing Machine Learning for Rapid and Cost-Efficient 3D Building Models. https://www.sciencedirect.com/science/article/pii/S2590123025036527  
[^21]: GPU Gems 2, Cap. 6. Hardware Occlusion Queries Made Useful. https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-6-hardware-occlusion-queries-made-useful  
[^22]: GPU Gems, Cap. 29. Efficient Occlusion Culling. https://developer.nvidia.com/gpugems/gpugems/part-v-performance-and-practicalities/chapter-29-efficient-occlusion-culling  
[^23]: Vulkan Guide. Compute-based Culling (GPU-driven rendering). https://www.vkguide.dev/docs/gpudiven/compute_culling/  
[^24]: Khronos. VK_EXT_sampler_filter_minmax (Vulkan 1.2). https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VK_EXT_sampler_filter_minmax.html  
[^25]: Wicked Engine (2024). Texture Streaming. https://wickedengine.net/2024/06/texture-streaming/  
[^26]: Vulkan. VK_EXT_image_view_min_lod. https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VK_EXT_image_view_min_lod.html  
[^27]: Microsoft. D3D12 Tiled Resources Tier. https://learn.microsoft.com/en-us/windows/win32/api/d3d12/ne-d3d12-d3d12_tiled_resources_tier  
[^28]: Microsoft. DirectX 11 Functional Spec: LOD Calculations. https://microsoft.github.io/DirectX-Specs/d3d/archive/D3D11_3_FunctionalSpec.htm#7.18.11%20LOD%20Calculations  
[^29]: Ikarus3D (Medium, 2024). The Ultimate Guide to Optimising 3D Assets. https://medium.com/@Ikarus_3D/the-ultimate-guide-to-optimising-3d-assets-304a9bf66fb3  
[^30]: Arm. Adaptive Scalable Texture Compression (ASTC) Developer Guide. https://developer.arm.com/documentation/102162/latest/Overview  
[^31]: NVIDIA. Using ASTC Texture Compression for Game Assets. https://developer.nvidia.com/astc-texture-compression-for-game-assets  
[^32]: Android Developers. Target texture compression formats in Android App Bundles. https://developer.android.com/guide/playcore/asset-delivery/texture-compression  
[^33]: Apple Developer. Metal Overview. https://developer.apple.com/metal/  
[^34]: DEV Community (2025). WebGPU in 2025: The Complete Developer's Guide. https://dev.to/amaresh_adak/webgpu-in-2025-the-complete-developers-guide-3foh  
[^35]: A23D. Optimizing PBR Textures for Real-Time Rendering. https://www.a23d.co/blog/optimizing-pbr-textures-for-real-time-rendering  
[^36]: GPUOpen. AMD Compressonator. https://gpuopen.com/gaming-product/compressonator/  
[^37]: Microsoft. DirectXTex (GitHub). https://github.com/microsoft/DirectXTex  
[^38]: Imagination Technologies. PVRTexTool. https://www.imgtec.com/developers/powervr-sdk-tools/pvrtextool/  
[^39]: Wicked Engine (GitHub). https://github.com/turanszkij/WickedEngine  
[^40]: GitHub. dds.h utility. https://github.com/turanszkij/dds/blob/main/dds.h

Información faltante y validaciones recomendadas:
- Benchmarks comparativos recientes (2024–2025) entre Draco y Basis/ETC1S/UASTC en tiempo de carga y calidad percibida por tipo de escena.  
- Métricas de consumo energético del filtrado de texturas por GPU móvil específica y su impacto en duración de batería.  
- Mediciones reproducibles de latencia y throughput de texture streaming con feedback GPU bajo APIs concretas (DX12/Vulkan/Metal/WebGPU).  
- Casos de estudio de LOD automático con redes neuronales en videojuegos (más allá de reconstrucciones de edificios).  
- Lineamientos oficiales y ejemplos estandarizados de geometry instancing con variaciones de material en motores comerciales (Unity/Unreal/Godot) con métricas públicas.
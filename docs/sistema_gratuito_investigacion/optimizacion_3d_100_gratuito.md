# Stack 3D 100% gratuito e ilimitado (2025): APIs, librerías y servicios sin costo para optimización, conversión, LOD, QA, metadatos y streaming

## Resumen ejecutivo y alcance

Este informe técnico presenta un stack integral para optimización 3D con costo $0, cubriendo las diez categorías clave: APIs/librerías de optimización de glTF, compresión Draco, optimización de texturas, conversión de formatos, generación de niveles de detalle (LOD), validación de calidad (QA), limpieza de malla, metadatos, streaming/visualización web y ejecución en entornos sin costo. La propuesta se fundamenta en herramientas open-source, servicios con uso gratuito viable y pipelines reproducibles en navegadores, entornos locales y la nube, manteniendo calidad de producción.

La tesis central es que, en 2025, es posible construir un flujo de trabajo E2E sin gasto en licencias utilizando: glTF-Transform para optimización, Draco para compresión de geometría, Basis Universal/KTX2 para texturas, servicios de conversión 3D locales al navegador, generación de LOD con OGRE o addons de Blender, QA automatizado con Open3D y pygltflib, metadatos embebidos en glTF y streaming 3D con CesiumJS y visores web. La clave operativa está en priorizar la ejecución local (WASM/Web) y parametrizar los codecs y las transformaciones para balancear calidad, tamaño y tiempo de carga.

La narrativa avanza desde el panorama y la metodología de selección, hacia el stack recomendado por categoría, culmina en un pipeline E2E con checklist de calidad y KPIs, y cierra con riesgos, brechas y próximos pasos para cerrar huecos operativos.

![Ecosistema de optimización 3D: de modelos pesados a activos runtime listos para web.](/workspace/movement_textures_7.jpg)

## Metodología y criterios de evaluación

La selección priorizó criterios de costo $0 (gratuito/open-source), licencias permisivas, ausencia de límites de uso o capacidad de auto-hosting sin restricciones, rendimiento y calidad de producción, interoperabilidad (formatos abiertos), facilidad de automatización (CLI/SDKs) y madurez comunitaria.

Se evaluaron tanto herramientas de auto-uso (SDK/CLI) como servicios en línea. En los servicios, se distinguió entre uso gratuito sin límites (procesamiento en el navegador, sin subida de archivos) y free-tier con límites (créditos, conversión máxima). La comprobación se basó en documentación oficial, repositorios públicos y especificaciones de formato.

Para formalizar la evaluación, la siguiente matriz resume los criterios y su aplicación.

Para ilustrar el proceso de priorización, la siguiente tabla sintetiza los criterios clave, su ponderación y ejemplos representativos.

| Criterio                           | Descripción                                                                 | Ponderación | Ejemplos de herramientas                                    |
|------------------------------------|------------------------------------------------------------------------------|-------------|-------------------------------------------------------------|
| Costo $0                            | Uso gratuito real sin límites operativas significativas                      | Alta        | glTF-Transform (MIT), Draco (Apache-2.0), Basis Universal   |
| Licencia                            | Permisiva y abierta (Apache/MIT/GPL)                                         | Alta        | MeshLab (GPL), CesiumJS (Apache-2.0)                        |
| Límites de uso                      | Sin límites o auto-hosting viable                                            | Alta        | Convert3D (en navegador), glTF-Transform CLI                |
| Rendimiento y calidad               | Optimización sin pérdida y compresión adecuada                               | Alta        | glTF-Transform (draco, meshopt, quantize, textureCompress)  |
| Interoperabilidad                   | Soporte de formatos abiertos (glTF, KTX2, Basis)                             | Alta        | Khronos KTX, Basis Universal                                |
| Automatización                      | CLI/SDK para pipelines reproducibles                                         | Media       | glTF-Transform CLI, Draco encoders/decoders                 |
| Madurez y comunidad                 | Proyecto activo y documentación                                              | Media       | Open3D, pygltflib, CesiumJS                                 |

Esta matriz guía las decisiones por categoría y fundamenta el pipeline E2E.

## Panorama 2025 del ecosistema 3D gratuito

Tres tendencias consolidan la viabilidad de un stack sin costo: primero, la madurez del formato glTF 2.0 como estándar de activos runtime para web, con un ecosistema de herramientas que permiten transformaciones controladas, reproducibles y sin pérdida; segundo, la compresión de geometría con Draco y de texturas con Basis Universal/KTX2, que reducen sustancialmente tamaño y tiempos de carga manteniendo fidelidad visual; tercero, el auge de pipelines ejecutables en navegador y WASM, con servicios que procesan localmente evitando cargas de servidor y problemas de privacidad.

La interoperabilidad está asegurada por las extensiones de glTF y contenedores de texturas abiertos. El uso de estándares abiertos, como las extensiones KHR para compresión de malla y texturas, y el contenedor KTX2, facilita la distribución multiplataforma y la transcodificación eficiente en destino. La estrategia es clara: optimizar geometría y materiales con glTF-Transform, comprimir texturas con Basis/KTX2, y servir visualizaciones con motores que integran glTF y 3D Tiles según el caso de uso[^24][^12].

## Stack por categorías (10 áreas clave)

La arquitectura por categoría combina librerías open-source, servicios con uso gratuito viable y pipelines reproducibles. La selección privilegia herramientas sin límites de uso, licencias abiertas y facilidad de integración en pipelines automatizados.

Para dar una vista consolidada, la siguiente tabla resume “qué usar” por categoría, con foco en costo $0 y viabilidad de producción.

| Categoría                          | Herramienta principal                 | Licencia           | Tipo (API/SDK/CLI/Servicio) | Evaluación de límites (gratis/ilimitado)                     |
|------------------------------------|---------------------------------------|--------------------|------------------------------|--------------------------------------------------------------|
| Optimización glTF                  | glTF-Transform                        | MIT                | SDK/CLI                      | Sin límites; auto-hosting viable                             |
| Compresión Draco                   | Draco (Google)                        | Apache-2.0         | SDK/CLI/WASM                 | Sin límites; auto-hosting viable                             |
| Optimización de texturas           | Basis Universal / KTX2                | Apache-2.0 / Estándar | CLI/WASM/SDK                 | Sin límites; auto-hosting viable                             |
| Conversión de formatos             | Convert3D                             | —                  | Servicio (en navegador)      | Sin límites; procesamiento local                             |
| Conversión formatos (alternativa)  | Model Converter                        | —                  | Servicio (en navegador)      | Gratuito; API plan de pago (opcional)                        |
| Generación LOD                     | OGRE Mesh LOD                         | —                  | CLI/API                      | Auto-uso open-source                                         |
| Generación LOD (Blender)           | LODGen / EasyLOD                      | GPLv3+ / OSS       | Addon (Blender)              | Gratuitas; revisar licencias                                 |
| Limpieza de malla                  | MeshLab / Open3D                      | GPL / MIT          | GUI/SDK                      | Gratuitas; robustas                                          |
| QA 3D                              | Open3D / pygltflib                    | MIT                | SDK                          | Gratuitas; validación estructural y de especificación        |
| Metadatos                          | glTF + EXT_structural_metadata / XMP  | Estándar/glTF      | SDK                          | Embebido en glTF; sin costo                                  |
| Streaming 3D                       | CesiumJS / 3D Viewer / LightTracer    | Apache-2.0 / OSS   | Librería/Servicio            | Librerías gratuitas; visores sin especificación de costos    |
| Ejecución en entornos sin costo    | glTF-Transform, Basis, Draco, pygltflib | —                | SDK/WASM/CLI                 | Ejecutables localmente; Codespaces/Colab/Replit               |

### 1) APIs de optimización glTF sin límites

glTF-Transform es el eje del pipeline de optimización. Como SDK en JavaScript/TypeScript para glTF 2.0, ofrece un control detallado de la estructura del modelo (mallas, materiales, animaciones, texturas) y funciones reproducibles para transformaciones sin pérdida o controladas: draco, meshopt, quantize, prune, deduplicate, reorder, resize y textureCompress, entre otras. Su CLI facilita batch y automatización en CI/CD, y su licencia MIT permite uso comercial sin restricciones[^1].

Existen alternativas complementarias, como gltf-optimizer (Node), útiles en ciertos flujos, pero el núcleo de optimización reproducible en $0 se sostiene con glTF-Transform[^23].

Para guiar el uso práctico, la tabla siguiente mapea funciones clave y casos de uso:

| Función glTF-Transform         | Caso de uso principal                                     | Notas operativas                                          |
|--------------------------------|-----------------------------------------------------------|-----------------------------------------------------------|
| draco                          | Compresión de geometría                                   | Extensión KHR_draco_mesh_compression                      |
| meshopt                        | Compresión y reordenamiento de índices/vertices           | Extensión EXT_meshopt_compression                         |
| quantize                       | Cuantización de atributos (posición, normales, UV)         | Reduce tamaño con impacto visual controlable              |
| prune                          | Elimina nodos/primitivas no referenciados                 | Limpieza estructural                                      |
| dedup                          | Deduplica materiales/texturas/accesores                   | Reduce redundancia                                        |
| reorder                        | Optimiza el orden de vértices/índices para caching        | Mejora rendimiento en render                              |
| resize                         | Redimensiona texturas (p. ej., POT)                       | Ajusta resolución por canal/textura                       |
| textureCompress                | Compresión de texturas (WebP/KTX2 según slots)            | Selectiva por tipo de textura                             |

La recomendación es parametrizar la cuantización y la compresión de geometría según el dispositivo objetivo y mantener una política de texturas por canal (baseColor, normal, metallicRoughness, occlusion) con criterios de resolución y codec.

### 2) Compresión Draco gratuita e ilimitada

Draco es la biblioteca open-source de compresión de mallas geométricas y nubes de puntos, con codecs y herramientas de línea de comandos para codificar, decodificar y transcodificar glTF. Su licencia Apache-2.0 habilita uso libre en productos comerciales. Los decodificadores WASM y JavaScript están disponibles y pueden hospedarse estáticamente, lo que simplifica la distribución y garantiza caché optimizada[^2][^3][^4][^5].

La elección de parámetros determina el equilibrio entre tamaño y calidad. A nivel operativo, la cuantización por atributo y el nivel de compresión modifican speeds y ratios.

Para acelerar el tuning, la siguiente tabla resume parámetros frecuentes:

| Atributo       | Bits de cuantización sugeridos | Efecto en calidad/tamaño                                   |
|----------------|--------------------------------|-------------------------------------------------------------|
| Posiciones     | 11–14                          | 11 suele ser indistinguible; 14 mejora detalle a mayor tamaño |
| Normales       | 7–8                            | 7 balancea calidad visual y tamaño                          |
| UVs            | 10–12                          | 10–12 evita artifacts en mapeo de texturas                  |
| Colores        | 8                               | Suficiente para materiales PBR                              |
| Genéricos      | 8                               | Validar caso a caso                                         |

| Nivel de compresión (cl) | Velocidad de descompresión | Ratio de compresión |
|--------------------------|----------------------------|---------------------|
| 0                        | Más alta                   | Menor               |
| 7 (default)              | Balanceado                 | Balanceado          |
| 10                       | Más baja                   | Mayor               |

La práctica recomendada es iniciar con cuantización de posiciones en 11–12 y normales en 7, evaluar visualmente y ajustar según la sensibilidad del modelo. La integración con glTF se realiza mediante la extensión KHR_draco_mesh_compression y decodificadores disponibles en CDN estáticos[^4].

### 3) Optimización de texturas sin costo (KTX2/Basis, WebP)

Basis Universal es el codec de transcodificación de texturas GPU (LDR/HDR) que opera sobre el contenedor KTX2, estándar del Grupo Khronos. Permite transcodificar rápidamente a formatos nativos de GPU (ASTC, BC7, ETC1/2, PVRTC) a partir de un intermedio .basis/.KTX2, tanto en código nativo como en WebAssembly. Es open-source con licencia Apache-2.0, por lo que su uso es libre y adecuado para pipelines en navegador y servidores[^11][^12][^13][^14].

Para seleccionar el modo de compresión, se recomienda evaluar el destino (perfil de dispositivo) y los requisitos de calidad.

| Modo Basis        | Calidad esperada           | Bpp aprox. | Uso recomendado                                     |
|-------------------|----------------------------|------------|-----------------------------------------------------|
| ETC1S             | Baja–media (supercomprimido) | 0.3–3     | Modelos con muchas texturas, donde prima el tamaño |
| UASTC LDR 4x4     | Alta (8 bpp)               | 8          | Calidad alta en LDR; transcodificación rápida       |
| UASTC HDR 4x4     | Alta en HDR (8 bpp)        | 8          | Contenidos HDR; buena compatibilidad BC6H           |
| UASTC HDR 6x6     | Alta a 3.56 bpp            | ~3.56      | HDR comprimido con excelente balance calidad/tamaño |

Las herramientas de línea de comandos basisu y la integración con glTF-Transform permiten aplicar compresión selectiva por ranuras (slots) y controlar mipmaps, arrays y cubemaps. KTX2 se integra ampliamente en motores y frameworks; su contenedor y extensiones (p. ej., KHR_texture_basisu) garantizan interoperabilidad[^12][^14][^21].

### 4) Conversión de formatos 3D gratuita

Convert3D es un servicio en línea que ejecuta la conversión completamente en el navegador, sin subir archivos a servidores, con más de 1000 combinaciones de formatos y sin límites de cantidad de archivos. Este enfoque preserva la privacidad y elimina costos de infraestructura[^8]. Model Converter complementa como alternativa gratuita para convertir OBJ, FBX y COLLADA a glTF 2.0 desde la web[^9]. Para validación y manejo estructural del formato, pygltflib ofrece lectura/escritura en Python con licencia MIT[^10].

El cuadro comparativo resume casos de uso y características:

| Servicio/Librería | Entrada/Salida                                  | Límites de uso                   | Privacidad                      | Licencia |
|-------------------|--------------------------------------------------|----------------------------------|----------------------------------|----------|
| Convert3D         | Múltiples formatos (1000+ combinaciones)         | Sin límites; en navegador        | No sube archivos (local)         | —        |
| Model Converter   | OBJ, FBX, DAE → glTF 2.0                         | Gratuito; API opcional de pago   | Procesamiento en la web          | —        |
| pygltflib         | Lectura/escritura glTF/GLB (Python)              | Sin límites (local)              | Ejecución local                  | MIT      |

En privacidad y cumplimiento, los flujos “local-only” son preferibles cuando la sensibilidad de activos es alta; la ejecución en navegador de Convert3D reduce exposición y costos.

### 5) Generación de LOD gratuita

OGRE Automatic Mesh LOD Generator ofrece generación automática de niveles de detalle a partir de mallas, con CLI (OgreMeshUpgrader) y API programática. Su algoritmo se basa en una mejora del método de reducción de polígonos de Stan Melax y soporta generación autoconfigurada y por niveles de distancia[^15]. En Blender, LODGen (GPLv3+) y EasyLOD permiten crear LODs de manera interactiva y scriptable dentro del editor, preservando la malla original y gestionando colecciones por objeto[^16][^17].

La comparativa siguiente orienta la elección por flujo:

| Herramienta       | Tipo                      | Automatización                  | Integración                          | Licencia      |
|-------------------|---------------------------|----------------------------------|--------------------------------------|---------------|
| OGRE LOD          | CLI/API                   | Autoconfigurado y por distancias | Exportable a mallas con LOD          | —             |
| LODGen (Blender)  | Addon (Blender)           | Interactivo y scriptable         | Integrado en vista 3D (N-panel)      | GPLv3+        |
| EasyLOD (Blender) | Addon (Blender)           | Interactivo                      | Exportación FBX con grupos LOD       | OSS (sin detalle) |

Para modelos repetitivos y pipelines por lotes, OGRE CLI es eficiente; para activos manejados en DCC (Digital Content Creation), los addons de Blender integran mejor el flujo artístico.

### 6) Validación de calidad 3D (QA) gratuita

La validación se aborda en dos niveles: estructural y de especificación. Open3D proporciona estructuras de mallas y funciones para detectar problemas topológicos (manifold, auto-intersecciones), colorear vértices por curvatura y medir propiedades geométricas. pygltflib valida reglas de la especificación glTF (p. ej., tipos de componentes, min/max de accessors, objetivos de bufferViews), ayudando a evitar fallos en render o motores de juego[^18][^19][^10].

La tabla siguiente sintetiza tipos de chequeos y herramientas:

| Chequeo                               | Herramienta          | Automatización                   | Comentarios                                       |
|---------------------------------------|----------------------|----------------------------------|---------------------------------------------------|
| Manifold / auto-intersecciones        | Open3D (TriangleMesh)| Alta (Python/C++)                | Métricas y visualización                          |
| Densidad de vértices / curvatura      | Open3D               | Alta                              | Útil para comparar LODs                           |
| Reglas glTF (accessor, bufferView)    | pygltflib            | Alta (Python)                     | Validación experimental, útil en CI               |

El pipeline de QA debe ejecutarse post-optimización y post-LOD, con umbrales por tipo de activo (p. ej., precisión mínima de posiciones, número máximo de triángulos por LOD).

### 7) Limpieza de malla open-source

MeshLab es el sistema de referencia para limpieza y reparación de mallas triangulares: elimina vértices duplicados, caras degeneradas, componentes pequeñas; realiza remallado, simplificación y texturizado, con amplio soporte de formatos y scripts. Open3D aporta APIs modernas para reparación y análisis, en C++ y Python, con aceleraciones por GPU y estructuras eficientes[^7][^18][^19].

Comparativa de filtros y capacidades:

| Herramienta | Capacidades principales                                             | Licencia | Automatización          |
|-------------|----------------------------------------------------------------------|----------|-------------------------|
| MeshLab     | Limpieza, reparación, simplificación, remallado, texturizado, conversión | GPL      | Scripts y pipeline CLI  |
| Open3D      | Estructuras 3D, análisis topológico, alineación, reconstrucción     | MIT      | SDK Python/C++          |

Se recomienda aplicar limpieza antes de optimización y compresión, y verificar integridad de UVs y normales tras procesos de decimación.

### 8) APIs de metadatos 3D gratuitas

Los metadatos embebidos en glTF se gestionan mediante extensiones como EXT_structural_metadata (procedente del ecosistema 3D Tiles) y KHR_XMP. Estas permiten añadir pares clave-valor, esquemas y paquetes de metadatos en el propio activo, sin necesidad de servicios externos. El contenido se integra en el JSON/glTF y/o BIN, y se serializa con las herramientas del pipeline[^22][^1].

Esquema sugerido de metadatos por activo:

| Campo                      | Descripción                                       |
|---------------------------|---------------------------------------------------|
| id                        | Identificador único del activo                    |
| categoria                 | Taxonomía (p. ej., reloj: caja, correa, hebilla)  |
| material                  | Materiales principales (metal, cuero, etc.)       |
| proceso                   | Pipeline (reconstrucción, limpieza, optimización) |
| color                     | Paleta dominante o mapeo PBR                      |
| fechas                    | Fechas de adquisición y procesamiento             |
| hash                      | Integridad del archivo                            |

La gestión sin costo se logra embebiendo metadatos en glTF; servicios como Box AI Extract son de pago y no necesarios para el stack $0[^22].

### 9) Streaming/servicio y visualización 3D sin costo

CesiumJS es una librería JavaScript open-source (Apache-2.0) para visualización geoespacial 3D, con soporte de transmisión y estilización de 3D Tiles, modelos glTF y capas de terreno/imágenes. Permite crear visores web de alto rendimiento y precisión, y es adecuada para distribuir grandes conjuntos de datos[^6]. Como alternativas, Online 3D Viewer y LightTracer ofrecen visualización en navegador; su uso es gratuito, si bien la documentación consultada no especifica límites o costos en detalle[^20][^26].

Comparativa de streaming/visualización:

| Librería/Servicio | Formatos clave             | Capacidades                         | Coste | Embedding                   |
|-------------------|----------------------------|-------------------------------------|-------|-----------------------------|
| CesiumJS          | glTF, 3D Tiles             | Streaming, estilización, tiempo     | $0    | Integración web (JS)        |
| Online 3D Viewer  | Múltiples (gltf, obj, etc.)| Visualización en navegador          | —     | Visor web                   |
| LightTracer       | —                          | Render físico-correcto, embed       | —     | Componente web embebible    |

Cesium ion (SDK extendido) puede tener costos, pero CesiumJS es gratuito. La elección depende de si el contenido es geoespacial (3D Tiles) o no.

### 10) Librerías para ejecución en entornos gratuitos

El stack recomendado es ejecutable en entornos locales y sin costo: glTF-Transform (Node/WASM), Basis Universal (CLI/WASM), Draco (CLI/WASM), pygltflib (Python), Open3D (Python/C++). En entornos como GitHub Codespaces, Google Colab y Replit, se puede empaquetar pipelines y scripts, aunque hay matices de CPU/WASM y cuotas que deben validarse caso a caso[^1][^11][^3][^10][^18].

Matriz de compatibilidad:

| Entorno           | Librerías principales                        | Notas de instalación/rendimiento                        |
|-------------------|----------------------------------------------|----------------------------------------------------------|
| Local (CLI/SDK)   | glTF-Transform, Basis, Draco, pygltflib      | WASM opcional; binarios según plataforma                 |
| GitHub Codespaces | glTF-Transform, Basis, Draco, Open3D         | Validar paquetes; CI-friendly                           |
| Google Colab      | pygltflib, Open3D                            | GPU limitada; CPU/WASM suficiente para QA y limpieza     |
| Replit            | glTF-Transform, pygltflib                    | Ejecución de scripts y batch básico                     |

Aunque estas plataformas ofrecen niveles gratuitos, las cuotas y restricciones de uso deben revisarse (brecha identificada).

## Pipeline E2E recomendado con costo $0

El pipeline end-to-end sin costo se articula en fases, con herramientas y automaciones reproducibles, y controles de calidad en cada etapa.

![Del escaneo/reconstrucción a la distribución optimizada: pipeline E2E sin costo.](/workspace/movement_textures_7.jpg)

Flujo propuesto:

1) Conversión a glTF/GLB.  
2) Limpieza y reparación de malla (si procede).  
3) Compresión de geometría con Draco.  
4) Optimización de texturas (Basis/KTX2; WebP donde corresponda).  
5) Transformaciones de optimización (quantize, dedup, prune, reorder).  
6) Generación de LODs (OGRE o Blender addons).  
7) QA estructural y de especificación.  
8) Empaquetado y publicación.  
9) Streaming/visualización (CesiumJS o visores web).

La tabla siguiente resume el mapa E2E:

| Etapa                          | Herramienta principal           | Entrada                  | Salida                     | Automatización                   | Indicadores clave                     |
|--------------------------------|---------------------------------|--------------------------|----------------------------|----------------------------------|---------------------------------------|
| Conversión                     | Convert3D / Model Converter     | OBJ/FBX/DAE/otros        | glTF/GLB                   | Servicio web / scripts           | Tiempo de conversión, integridad      |
| Limpieza                       | MeshLab / Open3D                | glTF/mesh crudo          | Malla limpia               | Scripts (MeshLab) / SDK (Open3D) | Manifold, auto-intersecciones         |
| Compresión geometría           | glTF-Transform (Draco)          | glTF/GLB                 | glTF/GLB (con Draco)       | CLI/Node                          | Tamaño, velocidad de decodificación   |
| Texturas                       | Basis/KTX2 + glTF-Transform     | PNG/JPG/EXR/HDR          | KTX2 (transcodificado)     | CLI/WASM                          | VRAM, bpp, artefactos visibles        |
| Optimización                   | glTF-Transform (resto funciones)| glTF/GLB                 | glTF/GLB optimizado        | CLI/Node                          | Vertices, índices, redundancias       |
| LOD                            | OGRE / Blender LODGen/EasyLOD   | Malla                    | Malla con niveles LOD      | CLI / Addon                      | Triángulos por LOD, distancias        |
| QA                             | Open3D / pygltflib              | glTF/GLB                 | Informe QA                 | Python scripts                   | Reglas de glTF, topología             |
| Publicación                    | Empaquetado glTF/GLB            | Activos optimizados      | Catálogo                   | CI/CD                            | Tamaño total, FPS inicial             |
| Streaming/visualización        | CesiumJS / visores web          | glTF/3D Tiles            | Visor embebido             | JS y HTML                        | TTI, tiempo de carga, UX              |

Sub-secciones del pipeline:

- Sub-pipeline de optimización glTF. Aplicar en orden: prune y dedup para limpieza estructural; draco o meshopt para compresión de geometría; quantize para reducir precisión de atributos con impacto visual controlado; reorder para optimizar el caching; resize y textureCompress para ajuste de texturas por canal y compresión final[^1].

- Sub-pipeline de compresión de texturas. Seleccionar modo Basis (ETC1S vs UASTC) según destino y calidad; generar mipmaps; considerar el espacio de color (sRGB para LDR, lineal para HDR) y evaluar RDO cuando aplique. Validar transcodificación a formatos GPU de destino y verificar artefactos (bloques, ringing) en materiales críticos[^11][^12].

- Sub-pipeline de LOD. Usar OGRE CLI para generación automática por distancias y niveles; en Blender, utilizar LODGen/EasyLOD para flujos editoriales, manteniendo LOD0 limpio y colecciones por objeto. Validar coherencia de materiales y UVs entre niveles[^15][^16][^17].

## Checklist de calidad y KPIs

Los KPIs deben correlacionarse con la percepción visual y el rendimiento runtime. La evaluación se realiza con modelos de muestra, comparando original y optimizado, y aplicando umbrales por tipo de activo.

Checklist de validación:

| Tipo de chequeo         | Descripción                                        | Herramienta              | Umbrales recomendados                   |
|-------------------------|----------------------------------------------------|--------------------------|-----------------------------------------|
| Geometría               | Manifold, auto-intersecciones                      | Open3D                   | Sin auto-intersecciones; manifold cierra|
| Materiales              | Presencia de slots (baseColor, normal, etc.)       | glTF-Transform inspect   | Todos los slots requeridos presentes    |
| Texturas                | Mipmaps, codec, bpp                                | Basis/KTX2 CLI           | Mipmaps completos; bpp según destino    |
| Compresión              | Cuantización y ratio de compresión                 | glTF-Transform/Draco CLI | 11–14 bits posiciones; ratio > objetivo |
| Rendimiento             | FPS inicial, tiempo de carga                       | Visor web                | Carga < objetivo; FPS estable           |

KPIs:

- Reducción de tamaño total (%).  
- Triángulos por LOD (orden de magnitud y ratios entre niveles).  
- Bits por píxel (bpp) por textura y modo Basis.  
- FPS inicial en visor web y tiempo hasta interacción (TTI).

Las métricas deben interpretarse junto a pruebas visuales A/B, verificando materiales PBR, normales y mapeo de texturas, y coherencia de niveles LOD en cámara.

## Riesgos, limitaciones y plan de cierre de brechas

Persisten brechas específicas que requieren validación operativa:

- OptimizeGLB ofrece free-tier limitado (hasta 10 conversiones; requiere cuenta), con API en plan de negocios; no es $0 ilimitado[^25].  
- Model Converter: el servicio en línea es gratuito, pero su “API en la nube” es de pago; el alcance de uso programático sin costo no está claro[^9].  
- Convert3D API tiene planes de pago; se debe confirmar si existe algún nivel gratuito para uso programático[^8].  
- Visores y plataformas como Sketchfab, Online 3D Viewer y LightTracer no especifican de forma inequívoca límites de uso o costos en la documentación consultada; se requiere verificación de términos[^20][^26].  
- Servicios de validación 3D “lista para producción” completamente gratuitos no presentan APIs públicas gratuitas evidentes; se recurre a herramientas open-source (Open3D, pygltflib).  
- Metadatos 3D gratuitos: los servicios de metadatos avanzados suelen ser de pago; se propone usar extensiones glTF embebidas.  
- Ejecución en Codespaces/Replit/Colab: paquetes y cuotas de entornos gratuitos deben revisarse para garantizar compatibilidad y rendimiento.

Riesgos legales y de licenciamiento:

- Uso de addons en Blender (LODGen: GPLv3+); revisar implicaciones en distribución.  
- Dependencia de servicios “free-tier” con límites y posibles cambios de política.

Plan de mitigación:

- Auto-hosting de APIs (glTF-Transform, Basis, Draco) para eliminar límites y proteger privacidad.  
- Política de ejecución local/WASM por defecto; evaluar servicios solo cuando no comprometan el costo $0.  
- Validación sistemática de licencias y TOS antes de integraciones productivas.

## Conclusiones y próximos pasos

El stack 100% gratuito e ilimitado es viable para producción con calidad y rendimiento adecuados cuando se aplica un enfoque disciplinado de optimización y QA. La columna vertebral técnica—glTF-Transform, Draco y Basis/KTX2—permite reducir significativamente tamaño de activos y tiempos de carga sin degradación perceptible si se parametrizan correctamente la cuantización y los codecs. La disponibilidad de pipelines en navegador y SDKs sin costo habilita automatización y ejecución en entornos gratuitos, con control total sobre el flujo.

Próximos pasos:

1) Validar el pipeline E2E con un conjunto de modelos de prueba, midiendo KPIs y ajustando parámetros de Draco y Basis.  
2) Formalizar el checklist de QA y automatizarlo en CI con pygltflib y Open3D.  
3) Documentar recetas por categoría de activo (p. ej., componentes metálicos vs. correas) y establecer umbrales por dispositivo.  
4) Cerrar brechas de APIs “gratuitas” con auto-hosting y confirmar términos de visores/servicios alternativos.  
5) Ejecutar pilotos en GitHub Codespaces/Colab/Replit y registrar compatibilidades y limitaciones.

El resultado esperado es un flujo de trabajo robusto y replicable que alcance calidad de producción con costo $0, asegurando interoperabilidad, control de calidad y un rendimiento consistente en entornos web.

---

## Referencias

[^1]: glTF Transform — Documentación oficial. https://gltf-transform.dev/  
[^2]: Draco 3D Graphics Compression — Google. https://google.github.io/draco/  
[^3]: google/draco — GitHub. https://github.com/google/draco  
[^4]: Draco Decoders (WASM/JS) — gstatic. https://www.gstatic.com/draco/v1/decoders/  
[^5]: Draco Compressed Meshes with glTF and 3D Tiles — Cesium. https://cesium.com/blog/2018/04/09/draco-compression/  
[^6]: CesiumJS — Plataforma y librería JS (Apache-2.0). https://cesium.com/platform/cesiumjs/  
[^7]: MeshLab — Procesamiento y edición de mallas (GPL). https://www.meshlab.net/  
[^8]: Convert3D — Convertidor 3D online (sin subida, procesamiento en navegador). https://convert3d.org/  
[^9]: Model Converter — Convertir a glTF 2.0 online (gratis). https://modelconverter.com/  
[^10]: pygltflib — Librería Python glTF 2.0 (MIT). https://pypi.org/project/pygltflib/  
[^11]: Basis Universal — Codec de texturas GPU (Apache-2.0). https://github.com/BinomialLLC/basis_universal  
[^12]: KTX — Formato de contenedor de texturas GPU (Khronos). https://www.khronos.org/ktx/  
[^13]: KTX2 Texture Compression — Evergine. https://evergine.com/ktx2-texture-compression/  
[^14]: KTX2 Compressed Textures — Babylon.js Documentation. https://doc.babylonjs.com/features/featuresDeepDive/materials/using/ktx2Compression  
[^15]: OGRE — Automatic Mesh LOD Generator. https://ogrecave.github.io/ogre/api/1.12/meshlod-generator.html  
[^16]: LODGen — Blender Addon (GPLv3+). https://extensions.blender.org/add-ons/lod-gen/  
[^17]: EasyLOD — Blender Addon (GitHub). https://github.com/alonrubintec/EasyLOD/  
[^18]: Open3D — Librería de procesamiento de datos 3D (MIT). https://www.open3d.org/  
[^19]: Open3D: TriangleMesh — Python API. https://www.open3d.org/docs/latest/python_api/open3d.geometry.TriangleMesh.html  
[^20]: Online 3D Viewer — Visor 3D en navegador (multi-formato). https://3dviewer.net/  
[^21]: Optimize 3D Assets with Khronos' New glTF-Compressor Tool — Khronos Blog. https://www.khronos.org/blog/optimize-3d-assets-with-khronos-new-gltf-compressor-tool  
[^22]: glTF EXT_structural_metadata — Documentación. https://github.com/CesiumGS/glTF/tree/3d-tiles-next/extensions/2.0/Vendor/EXT_structural_metadata  
[^23]: juunini/gltf-optimizer — Releases (compresión Draco, WebP). https://github.com/juunini/gltf-optimizer/releases  
[^24]: glTF — Ecosistema y estándar (Khronos). https://www.khronos.org/gltf/  
[^25]: OptimizeGLB — Compresión GLB/GLTF (free-tier limitado). https://optimizeglb.com/  
[^26]: LightTracer Web — Visor y render 3D embebible. https://lighttracer.org/web.html
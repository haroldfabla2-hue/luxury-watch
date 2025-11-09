# Materiales PBR para Relojes de Lujo en Three.js: Metales, Cristal/Zafiro, Correas, HDRI y Postprocesado

## 1. Introducción: realismo PBR aplicado a relojes de lujo

En el ámbito del producto de lujo, la credibilidad visual es un activo comercial. Un reloj de alta gama exige una representación que respete la física de la luz y los materiales: reflejos limpios en el acero pulido, chispas doradas sutiles en el oro, refracción verosímil en el cristal y textura convincente en correas de caucho o cuero. El renderizado basado en físicamente (Physically Based Rendering, PBR) proporciona el marco para lograr esa consistencia, al vincular los parámetros de material con la respuesta de la superficie en el mundo real, bajo una iluminación cualquiera y con independencia del dispositivo o la implementación[^1].

Este documento técnico-analítico se enfoca en construir, paso a paso, un flujo de trabajo PBR orientado a relojes de lujo en Three.js. Partimos de los fundamentos (materiales, mapas e iluminación basada en imágenes de alto rango dinámico, HDRI), avanzamos hacia configuraciones específicas para metales, cristales y correas, incorporamos HDRIs para un “estudio virtual” convincente y culminamos con postprocesado, optimización y un pipeline de calidad para asegurar la fidelidad material. El objetivo es doble: establecer criterios técnicos sólidos y ofrecer pautas implementables con código, para obtener imágenes y experiencias web de alto impacto sin sacrificar rendimiento.

### 1.1. Por qué PBR para relojes

El PBR reduce la variabilidad de resultados al anclar la apariencia en parámetros física y topológicamente coherentes: base color, metalness, roughness, normal y oclusión ambiental (AO). Esta coherencia permite que el mismo modelo y materiales se vean consistentes bajo diferentes iluminaciones y motores, una característica especialmente valiosa al migrar de herramientas CAD/DCC a WebGL. Además, la interoperabilidad del flujo metalness/roughness con glTF y los materiales de Three.js simplifica el intercambio con equipos y clientes, y facilita la importación/exportación entre plataformas de forma fiable[^2]. En términos prácticos, PBR “移植” el lenguaje fotográfico de estudio al dominio digital, donde el control de reflejos, microfacetas y transparencia deja de ser un arte oscuro para convertirse en un proceso reproducibles.

## 2. Fundamentos técnicos: materiales y mapas PBR en Three.js

La base del flujo PBR en Three.js descansa en dos materiales: MeshStandardMaterial, que implementa el workflow metalness/roughness, y MeshPhysicalMaterial, que extiende dicho modelo con propiedades avanzadas (transmisión, recubrimientos, reflectividad más flexible). La elección entre ambos depende de la necesidad de efectos de transmisión y capas de acabado: si el objeto requiere vidrio o plástico transparente, MeshPhysicalMaterial es la opción adecuada; para metales y dieléctricos opacos, MeshStandardMaterial suele ser suficiente[^3][^4][^2].

En la práctica, el material por sí solo no define el realismo. La calidad de las texturas y su mapeo correcto a los canales adecuados，决定 el micro-relieve y la percepción de pulido o mate. Los mapas principales son:

- Base Color (Albedo): color sin iluminación directa.
- Normal: perturbación de normales para detal les superficiales sin geometry adicional.
- Roughness: distribución de microfacetas; controla la nitidez de reflejos.
- Metalness: distingue dieléctrico (0) de conductor (1).
- Ambient Occlusion (AO): oclusión ambiental para “hundir” cavidades y mejorar el contacto visual.

Para optimizar memoria y rendimiento, es recomendable empaquetar AO, Roughness y Metalness en un único mapa ORM (RGB), donde AO suele ir en R, Roughness en G y Metalness en B, lo que Three.js consume de forma nativa[^5].

Para ilustrar la relación entre cada mapa y su efecto visual, se presenta la siguiente tabla.

Tabla 1. Mapa PBR → Canal → Propiedades de Three.js → Impacto visual

| Mapa PBR       | Canal/Propiedad Three.js                         | Efecto visual principal                                         |
|----------------|--------------------------------------------------|-----------------------------------------------------------------|
| Base Color     | map                                              | Color sin iluminación; define tono y saturación material        |
| Normal         | normalMap                                        | Micro-relieve aparente; detalla grabados y brushes sin geometría |
| Roughness      | roughnessMap (G del ORM) + roughness             | Nitidez de reflejos; 0 = espejo, 1 = difuso                     |
| Metalness      | metalnessMap (B del ORM) + metalness             | Conductor vs dieléctrico; comportamiento de F0                  |
| AO             | aoMap (R del ORM) + aoMapIntensity               | Profundadad perceptual; sombras suaves en cavidades             |

El mapa normal se aplica a través de normalMap, con orientaciones de espacio tangente y consideraciones de escala de normales (normalScale) que conviene ajustar con prudencia para evitar “overdrive” de detalle. AO requiere un segundo conjunto de UVs (uv2) para resultados consistentes, un detalle operativo que evita resultados apagados o planos[^5][^3].

#### 2.1. Canalización ORM en Three.js

El empaquetado ORM reduce llamadas de textura y consumo de memoria. En Three.js, el canal rojo se usa para AO (aoMap), el verde para Roughness (roughnessMap) y el azul para Metalness (metalnessMap). Además, las propiedades escalares roughness y metalness actúan como multiplicadores globales; por ejemplo, combinar un roughnessMap con un roughness global moderado evita extremos “demasiado espejo” o “demasiado mate”. Este patrón, documentado en guías prácticas, simplifica la carga y asegura que los motores de sombreado reciban señales coherentes con el estándar metalness/roughness[^5].

#### 2.2. glTF y PBR

El formato glTF 2.0 adopta el workflow metalness/roughness como norma, lo que facilita la consistencia entre herramientas DCC/CAD y motores en tiempo real. En el contexto web, esta estandarización reduce surprises al importar activos, siempre que la canalización de texturas se respete y que las escalas de normales y las conversiones de espacio de color se manejen con cuidado. La interoperabilidad con materiales de Three.js se vuelve directa: un material glTF con ORM se mapea de forma natural a las propiedades correspondientes de MeshStandardMaterial y, cuando hay transmisión, a las extensiones representadas por MeshPhysicalMaterial[^2].

## 3. Materiales metálicos de alta gama: acero, oro y titanio

La percepción de un metal depende de su entorno y del acabado superficial. Un acero pulido a espejo refleja el entorno de forma nítida, mientras un acabado cepillado difumina los reflejos en una dirección preferente, y una superficie磨损 introduce micro-escotillas que amortiguan los specular highlights. PBR articula estas diferencias mediante el mapa de roughness y un normal map con patrón direccional (cepillado) o aleatorio (磨损), además de un base color físicamente plausible.

Los metales puros se representan con metalness=1; las aleaciones y recubrimientos pueden presentar conductividad parcial o capas dieléctricas (pinturas, PVD), lo que hace útil combinar metalnessMap con valores base metálicos más conservadores. En cualquier caso, la iluminación basada en imágenes (Image-Based Lighting, IBL) es crítica: sin un entorno rico, los metales pierden “chispas” y profundidad, y el material luce plano[^3][^5].

En cuanto a texturas HD, se recomienda construir una biblioteca propia con variación de acabados: cepillado, martillado,磨损, granallado y acabado pulido. Para activos iniciales, fuentes gratuitas como FreePBR (categoría “Base Metals”) ofrecen sets PBR a 2K y 4K listos para workflows metalness/roughness; recursos premium como Poliigon complementan con variantes de brushed, polished y rusted; y bibliotecas CC0 como ambientCG permiten escalar volúmenes de texturas sin fricciones de licencia[^6][^7][^8].

Tabla 2. Recurso de texturas metálicas → licencia → resolución → componentes → notas de uso

| Recurso           | Licencia        | Resoluciones típicas | Componentes incluidos             | Notas de uso recomendado                      |
|-------------------|------------------|----------------------|-----------------------------------|-----------------------------------------------|
| FreePBR (Metals)  | Gratuito         | 2K–4K                | Base Color, Normal, Roughness, etc.| Ideal para acero y aleaciones base            |
| Poliigon (Metals) | Premium          | 2K–4K                | Variantes brushed/polished/rusted | Excelente para acabados direccional cepillado |
| ambientCG         | CC0              | 2K–4K                | PBR, HDRIs, modelos               | Uso libre, sin atribución, escalable          |

Más allá de las bibliotecas, conviene definir una escala de roughness por familia de acabados. La tabla siguiente sirve como guía inicial, siempre sujeta al entorno y a la textura seleccionada.

Tabla 3. Acabado → roughness sugerido → uso típico

| Acabado           | Roughness sugerido | Uso típico                                    |
|-------------------|--------------------|-----------------------------------------------|
| Pulido a espejo   | 0.02–0.08          | Esfera de inmediato, índices pulidos, biseles |
| Satinado/cepillado| 0.15–0.35          | Carrura, puentes, cajas con acabado cepillado |
| Martillado        | 0.25–0.45          | Caras de caja, hebillas con patrón hammering  |
|磨损/granallado    | 0.45–0.75          | Tornillería, espalda de la caja, superficies técnicas |

#### 3.1. Steel (Acero)

El acero es un conductor con metalness=1 y base color neutro. Para acabados cepillados, introduzca un normal map con patrón direccional y un roughness medio-bajo; para磨损, un roughness más alto y normal con ruido fino. Es crítico asignar un envMap adecuado: los reflejos viven del entorno, y sin un HDRI de calidad los metales pierden verosimilitud[^3]. En sets gratuitos, FreePBR incluye metales base que permiten construir rápidamente variantes de acero; la elección del HDRI y su rotación determinan el carácter final del material[^6].

#### 3.2. Gold (Oro)

En el oro, el color base del material debe ser dorado, evitando saturaciones excesivas. Las superficies martilladas introducen microfacetas que aumentan el roughness de forma heterogénea; conviene modular roughness con un roughnessMap y limitar clearcoat o sheen para no introducir capas que “lacquen” el metal en exceso. Un HDRI de estudio controlado ayuda a evitar hotspots que quemen el tono dorado y a mantener reflejos limpios[^6][^9].

#### 3.3. Titanium (Titanio)

El titanio suele presentar un acabado gris frío con leve tono azulado. Su representación visual depende del roughness (del pulido al mate) y del normal map. Fuentes gratuitas como LotPixel ofrecen texturas de titanio aptas para pruebas y prototipos; se recomienda ajustar metalness a 1 y evitar introducir color dieléctrico en base color para mantener su apariencia metálica[^10].

## 4. Cristal y zafiro: transmisión, refracción y coatings

El vidrio de un reloj y el zafiro de cristal requieren un material que combine transmisión con refracción, preservando reflejos de superficie y un micro-rugosidad coherente. MeshPhysicalMaterial aporta propiedades específicas: transmission (transmisión física), thickness (espesor efectivo), ior (índice de refracción), roughness (esmerilado), reflectivity (ajuste de reflectividad), y una capa adicional clearcoat con su roughness para simular recubrimientos duros o lacas protectoras. La diferencia frente a transparencia por opacity es crucial: transmission mantiene las interacciones de luz en el volumen, permitiendo que la luz se doble y disperse de forma creíble[^4][^11].

El índice de refracción (IOR) del cristal típico ronda ~1.5; el zafiro puede elevarse alrededor de ~1.77. La elección del IOR cambia el grado de doblado de la luz y, por tanto, la apariencia de objetos detrás del cristal. El thickness, usado junto a transmission, añade una “masa” virtual al objeto: valores mayores aumentan la refracción percibida, lo que resulta especialmente útil cuando el cristal tiene une sección transversal apreciable o biselado. El roughness controlling el “esmerilado” debe elegirse con cuidado: valores muy bajos mantienen reflejos nítidos, valores intermedios pueden pixelar el contenido transmitido, y valores altos difuminan en exceso. Ajustes en el rango 0.05–0.15 de roughness tienden a suavizar el aliasing sin perder pulido[^11][^12].

El normal map cumple una doble función: dota de micro-relieve a la superficie (grabados, texturas finas) y, en cristales, reduce la pixelación visible al “romper” la continuidad del contenido transmitido. Al combinar clearcoat con normalMap, se potencia la sensación de recubrimiento duro: un cristal con leve roughness en clearcoat y un normal map fino sugiere un acabados premium, mientras que un clearcoatRoughness mayor devuelve un aspecto más esmerilado. El envMap es esencial para lograr reflejos realistas y evitar artefactos; la iluminación IBL aporta equilibrio entre reflejos y refracción[^11][^4].

Para facilitar el arranque, se propone la siguiente tabla de propiedades clave para vidrio/zafiro.

Tabla 4. Propiedades de MeshPhysicalMaterial para cristal/zafiro

| Propiedad          | Función visual                                 | Notas de uso para reloj                          |
|-------------------|-----------------------------------------------|--------------------------------------------------|
| transmission      | Transmisión física del volumen                | Activar para vidrio; false con opacity no simula refracción |
| thickness         | Espesor virtual; aumenta refracción percibida | Ajustar según sección del cristal                |
| ior               | Índice de refracción                          | Cristal ~1.5; Zafiro ~1.77                       |
| roughness         | Esmerilado; nitidez de transmisión y reflejos | 0.05–0.15 evita pixelación; >0.65 difumina       |
| reflectivity      | Ajuste de reflectividad de Fresnel            | Modula intensidad de reflejos de superficie      |
| clearcoat         | Capa reflectante delgada                      | Simula recubrimientos duros o laca               |
| clearcoatRoughness| Rugosidad de la capa                          | Pulido vs esmerilado del recubrimiento           |
| envMap            | Iluminación y reflejos por HDRI               | Crítico para realismo y reducción de artefactos  |
| normalMap         | Micro-relieve y reducción de pixelación       | Útil en grabados y acabados finos                |

#### 4.1. Coatings y tratamientos de superficie

Los recubrimientos duros y tratamientos anti-reflejo modifican la respuesta de Fresnel. En términos prácticos, clearcoat aumenta la reflectividad de la capa superficial, mientras reducir su roughness devuelve un brillo más pulido. El tratamiento anti-reflejo suele implicar una reducción de reflectividad global y un roughness muy bajo, para mantener la nitidez del “paso” de luz. Ajustar reflectivity junto a ior permite modular cómo se “pega” el reflejo al contorno de la forma[^4][^11].

## 5. Correas: caucho y cuero

Las correas deben comunicar elasticidad, tacto y una superficie con micro-poros o grain convincente. En PBR, los dieléctricos van con metalness=0, y su apariencia depende principalmente del base color y del roughness. El normal map aporta el grano del cuero, la suavidad del caucho y la presencia de costuras. Un AO sutil incrementa la profundidad en surcos y zonas de contacto, reforzando el “encaje” de la correa en la caja.

Para сбор материалов, ambientCG ofrece bibliotecas CC0 de PBR que incluyen tejidos y cuero; la ausencia de restricciones de licencia permite escalar el catálogo y experimentar con variantes sin fricciones. Texturas.com y FreePBR complementan con materiales en metalness/roughness a 4K, útiles para elevar el detalle de hebillas y partes metálicas de las correas[^8][^13][^6].

Tabla 5. Recurso → tipo (cuero/caucho) → resolución → mapas → licencia

| Recurso         | Tipo        | Resolución típica | Mapas incluidos               | Licencia         |
|-----------------|-------------|-------------------|-------------------------------|------------------|
| ambientCG       | Cuero/Caucho| 2K–4K             | PBR completos, HDRIs          | CC0              |
| Textures.com    | Cuero       | 4K                | PBR metalness/roughness       | Comercial        |
| FreePBR         | Cuero/Metales| 2K–4K            | PBR metalness/roughness       | Gratuito         |

#### 5.1. Cuero

El cuero presenta grain, micro-rugosidad y, a veces, scratches o envejecido. Un normalMap con patrón de grain, combinado con un AO sutil, restituye la percepción de elasticidad y acabado. El roughness controla el brillo: correas de entrada tienden a un roughness medio (mate), mientras acabados más brillantes requieren roughness más bajo. La elección del color base en sRGB debe evitar saturaciones artificiosas; el ajuste de tone mapping y exposición en postprocesado se encargará de la profundidad final[^13].

#### 5.2. Caucho

El caucho dieléctrico se beneficia de un normal map con leve porosidad y un roughness medio, evitando reflejos metálicos. En plantillas de caucho natural o sintético, introducir variación en roughnessMap evita monotonía y simulatea el tacto gomoso. El base color debe ser sobrio y creíble, con ajustes finos en exposición para evitar “lavados” o quemados en highlights[^8].

## 6. Iluminación HDRI para producto de lujo

La iluminación de estudio se traslada a la web mediante HDRI: una imagen de alto rango dinámico que alimenta reflejos y luz ambiente de manera coherente. En Three.js, se pueden usar HDR equirectangulares (cargados con RGBELoader) y convertirlos en envMaps con mapeo de reflexión equirectangular; o trabajar con CubeMaps, ya sea generados offline o convertidos desde HDRI con herramientas como HDRI-to-CubeMap. En escenarios de producto, el uso de scene.environment (IBL) y scene.background (fondo) se decide según el objetivo: para jewelry/watch, suele preferirse un fondo neutro y un entorno controlado que no “robe” protagonismo al objeto[^14][^15][^16].

Poly Haven es un recurso clave: HDRIs gratuitos en licencia abierta, clasificados por interior, exterior, estudio y cielo, lo que permite seleccionar entornos limpios sin artefactos de iluminación. La conversión a CubeMap es recomendable cuando se busca rendimiento y consistencia de muestreo, manteniendo el mismo HDRI como fondo y como fuente de reflejos[^9][^16][^14].

Tabla 6. Fuentes HDRI → tipo → uso recomendado

| Fuente          | Tipo             | Uso recomendado                                      |
|-----------------|------------------|------------------------------------------------------|
| Poly Haven      | Interior/Estudio | Producto; control de hotspots y fondo neutro         |
| Poly Haven      | Exterior/Cielo   | Escenas contextuales; reflejos más amplios           |
| HDRI-to-CubeMap | Conversión       | Optimización y consistencia IBL en WebGL             |

#### 6.1. Escenarios de estudio

Para un reloj, la preferencia es un estudio con luces suaves y sin hotspots agresivos. Los HDRI de “Empty Warehouse” u otros interiores industriales limpios funcionan bien, siempre que se controle la exposición para evitar quemados en especulares. Ajustar el tone mapping y la exposición del renderer ayuda a “asentar” el contraste y el brillo sin perder detalle en reflejos metálicos o cristal[^11][^9].

## 7. Mapas de normales, roughness y AO: captura, generación y uso

El normal map es el “actor” del micro-relieve: transforma la iluminación sin deformar la geometría. En Three.js se aplica con normalMap, y su intensidad y dirección se modulan con normalScale. Las fuentes de normal maps pueden ser sets PBR dedicados o conversores desde imágenes de altura. Herramientas como Texture Gen permiten derivar un conjunto completo de mapas PBR (incluido normal) a partir de una sola imagen, acelerando la prototipación; en producción, la calidad de un normal map depende del origen y del contenido: un brushed metal requiere un normal con dirección preferente, mientras un martillado demanda patrones más orgánicos[^5][^17][^8].

El roughnessMap gobierna la nitidez de reflejos y debe complementar el acabado: incluso dentro de un mismo material, variar el roughness evita monotonía y simula desgaste. El aoMap, asignado al canal rojo y aplicado con uv2, aporta profundidad perceptual; su uso en cavidades y zonas de contacto incrementa el realismo sin “ensuciar” la iluminación directa.

Tabla 7. Tipo de mapa → propósito → canal → propiedades Three.js

| Tipo de mapa   | Propósito visual                    | Canal/Propiedad Three.js                  |
|----------------|-------------------------------------|-------------------------------------------|
| Normal         | Micro-relieve aparente              | normalMap; normalScale                    |
| Roughness      | Nitidez de reflejos                 | roughnessMap (G) + roughness              |
| Metalness      | Conductor vs dieléctrico            | metalnessMap (B) + metalness              |
| AO             | Profundadad por oclusión ambiental  | aoMap (R) + aoMapIntensity; requiere uv2  |

#### 7.1. Canalización y empaquetado ORM

Asignar R→AO, G→Roughness, B→Metalness y aplicar el mapa a las propiedades correspondientes de MeshStandardMaterial garantiza compatibilidad con el estándar glTF y reduce el número de texturas. Las propiedades escalares actúan como multiplicadores: si el roughnessMap introduce variaciones finas, el roughness global puede mantenerse en valores moderados para evitar extremos; si el material es predominantemente metálico, un metalness global cercano a 1 junto a un metalnessMap con variación local asegura conductores plausibles sin “pérdida” de reflectividad[^5][^2].

## 8. Post-procesado: tone mapping, bloom y gradación de color

El postprocesado en Three.js se orquesta con EffectComposer, que encadena pases como RenderPass y OutputPass, siendo este último el responsable de la conversión a sRGB y del tone mapping. El orden es crítico: LUTs y ajustes de color deben ir después del tone mapping, mientras efectos como bloom deben preceder la conversión final para mantener coherencia en el brillo. En productos de lujo, un bloom sutil añade atractivo en highlights de metales y cristal; la clave es evitar quemados que pierdan detalle en especulares[^18].

La elección del tone mapping incide en el contraste y la saturación. En el renderer, toneMapping y toneMappingExposure determinan cómo se comprimen los valores HDR a LDR. La biblioteca postprocessing de pmndrs expone passes adicionales y da control fino sobre la cadena; por ejemplo, aplicar un BloomPass suave con threshold y radius moderados puede mejorar la percepción de pulido sin introducir halos artificiales. En el contexto de PBR, se recomienda aplicar bloom antes del OutputPass y ubicar LUTs y grading después del mapeo de tonos para evitar desplazamientos cromáticos indeseados[^19][^18].

Tabla 8. Efecto → función → ubicación recomendada → notas

| Efecto           | Función                                   | Ubicación en la cadena         | Notas clave                                     |
|------------------|--------------------------------------------|---------------------------------|-------------------------------------------------|
| RenderPass       | Render base de la escena                   | Inicio                          | Alimenta los efectos posteriores                |
| Bloom            | Resplandor en zonas brillantes             | Antes del OutputPass            | Threshold y radius moderados; evitar halos      |
| Tone Mapping     | Compresión HDR→LDR                         | OutputPass                      | renderer.toneMapping + exposure                 |
| LUT/Color Grading| Ajuste fino de tono/saturación/curvas      | Tras OutputPass                 | Evitar desplazamiento cromático                 |
| OutputPass       | Conversión sRGB y salida                   | Final                           | Siempre al final; asegura color correcto        |

#### 8.1. Parámetros iniciales sugeridos

Como punto de partida, configurar renderer.toneMapping y toneMappingExposure para “asentar” el contraste del producto; añadir UnrealBloomPass con strength bajo (p. ej., 0.2–0.4), radius contenido (p. ej., 0.6–1.0) y threshold en torno a 0.8–0.9, para afectar únicamente los pixels realmente brillantes. Estas guías deben ajustarse por entorno y material, con especial cuidado en metales y cristales donde los reflejos son delicados[^18].

## 9. Implementación en Three.js: pipeline y ejemplos

El pipeline práctico para un reloj PBR en Three.js sigue una secuencia clara: preparar texturas (base color, normal, ORM), cargar el HDRI y asignarlo a scene.environment (y opcionalmente a scene.background), crear materiales (MeshStandardMaterial para metales y correas; MeshPhysicalMaterial para cristales) y ensamblar la escena con cámara y controles. La canalización ORM se aplica con aoMap, roughnessMap y metalnessMap, y se ajustan las propiedades globales roughness y metalness según el material. La carga de HDRI se realiza con RGBELoader y mapeo equirectangular, o mediante CubeMaps cuando se busca optimizar el muestreo[^5][^14][^16][^20].

En晶体, transmission, thickness, ior y roughness se configuran para lograr refracción verosímil; clearcoat y su roughness añaden la sensación de recubrimiento. La normalMap actúa sobre transmisión y reflejos, y el envMap estabiliza el resultado visual. Finalmente, el postprocesado se añade con EffectComposer, asegurando OutputPass al final y Bloom antes del mapeo de tonos.

#### 9.1. Ejemplo base (metal: acero cepillado)

1) Cargar texturas: base color, normal y ORM; 2) Crear MeshStandardMaterial con map, normalMap y ORM asignado a aoMap (R), roughnessMap (G), metalnessMap (B); 3) Ajustar roughness y metalness: metalness=1 para acero, roughness en 0.2–0.35 para satinato; 4) Asignar envMap cargado desde HDRI y habilitar sombras si la escena lo requiere; 5) Validar que uv2 existe para aoMap. Esta secuencia reproduce un acero cepillado con reflejos direccionales y profundidad controlada[^3][^5].

#### 9.2. Ejemplo cristal (vidrio con transmission)

1) Usar MeshPhysicalMaterial; 2) Activar transmission, definir thickness (según sección del cristal) y ior (≈1.5 para vidrio); 3) Ajustar roughness bajo (0.05–0.15) para evitar pixelación en transmisión; 4) Añadir clearcoat y normalMap fino para simular recubrimiento y micro-relieve; 5) Asignar envMap para reflejos de Fresnel consistentes y reducir artefactos. El resultado es un vidrio creíble, con refracción sutil y reflejos limpios[^4][^11].

## 10. Rendimiento y optimización: calidad sin comprometer FPS

Los materiales PBR con transmisión y el postprocesado tienen un coste por píxel superior al de materiales básicos. En dispositivos móviles o escenarios con múltiples objetos transparentes, la degradación de FPS puede ser notable. Un conjunto de prácticas ayuda a mantener calidad visual sin sacrificar rendimiento: limitar el devicePixelRatio (DPR) de forma dinámica, desactivar antialias cuando sea necesario, reducir draw calls mediante instancing, y suspender el renderizado cuando la pestaña no está visible. Además, el baking de luces para objetos estáticos y la compresión de texturas GLTF/GLB (Draco) reducen significativamente la carga de GPU/CPU[^21][^22].

El monitoreo es esencial: stats.js ofrece métricas básicas del frame; spector.js detalla draw calls y estado de WebGL; y herramientas como r3f-perf (en el ecosistema React) aportan visibilidad sobre shaders y texturas. La optimización comienza en el contenido: preferir modelos low-poly, exportar a GLB/GLTF con texturas en resoluciones de múltiplos de 2 (128, 256, 512, 1024, 2048), y comprimir assets (gltfjsx, Draco) sin perder la legibilidad del detalle crítico[^22].

La relación entre transmisión y rendimiento ha sido señalada por la comunidad: activar transmission puede duplicar el coste por píxel en determinadas configuraciones, lo que exige un ajuste fino de thickness y roughness, y un uso comedido de normal maps y clearcoat en escenas con múltiples cristales. Las buenas prácticas de postprocesado también aplican: Bloom y passes volumétricos deben escalarse o deshabilitarse bajo presión de rendimiento[^21][^18].

Tabla 9. Checklist de optimización → impacto esperado

| Acción                                      | Impacto esperado                                 |
|--------------------------------------------|--------------------------------------------------|
| Limitar DPR dinámicamente                   | Menor carga de fragment shader; FPS más estable  |
| Desactivar antialias                        | Reducción de costo de MSAA; mejora de FPS        |
| Instancing                                  | Menos draw calls; mejor throughput               |
| Baking de luces                             | Sin shading dinámico; carga reducida             |
| Compresión (Draco, gltfjsx)                 | Menor tamaño de assets; carga más rápida         |
| Reducir objetos transparentes               | Disminuye costo por píxel (transmission)         |
| Suspensión de render (tab hidden)           | Ahorro de CPU/GPU; eficiencia energética         |

#### 10.1. Dinamismo controlado

En producción web, la adaptación dinámica de parámetros es una herramienta poderosa. Reducir automáticamente el DPR o deshabilitar postprocesado cuando el rendimiento fluctúa mantiene la experiencia fluida sin decisiones manuales. Plataformas y bibliotecas como PerformanceMonitor (en el ecosistema pmndrs/drei) permiten supervisar métricas y ajustar el frameloop y los efectos en tiempo real. Esta aproximación “reactiva” es especialmente útil en catálogos interactivos con variación de modelos y materiales[^22].

## 11. Validación y control de calidad

La calidad se valida con un protocolo claro:

- Revisión de canalización ORM: confirmar que AO está en el canal rojo, Roughness en verde y Metalness en azul; y que las propiedades escalares se multiplican correctamente.
- Verificación de uv2 para AO: sin uv2, el aoMap no producirá oclusión y la escena se verá plana en cavidades.
- Inspección de espacios de color: base color y HDRI deben estar en espacios coherentes (sRGB para color; lineal para datos) para evitar tonalidades incorrectas.
- Ajustes finos de tone mapping y exposición: asegurar que los highlights metálicos y de cristal no se “quemen”; revisar saturación y contraste.

Tabla 10. Checklist QA → verificación → herramienta

| Verificación                                     | Herramienta/medio                            |
|--------------------------------------------------|----------------------------------------------|
| Canalización ORM (R/G/B)                         | Inspección de mapas y material en Three.js   |
| AO con uv2                                       | Revisión de geometría (segundo UVs)          |
| Espacios de color                                | Configuración de texturas y renderer         |
| Tone mapping/exposure                            | Render de prueba y ajuste iterativo          |

Los criterios de aceptación deben ser consistentes con las recomendaciones de la documentación de Three.js y las guías de postprocesado: OutputPass al final del composer y una cadena ordenada que evite desplazamientos cromáticos o halos inesperados[^3][^18].

## 12. Apéndices: recursos y anexos

Para cerrar el ciclo, se presenta un compendio de recursos útiles, algunos con licencias específicas que conviene revisar antes de su uso comercial. Además, se anotan brechas de información conocidas.

Tabla 11. Recursos (texturas/HDRI) → licencia → uso permitido → notas

| Recurso        | Licencia     | Uso permitido                | Notas                                    |
|----------------|--------------|------------------------------|------------------------------------------|
| Poly Haven     | CC0 (HDRIs)  | Libre, sin atribución        | Amplio catálogo de entornos              |
| ambientCG      | CC0          | Libre, sin atribución        | Texturas PBR y modelos; gran variedad    |
| FreePBR        | Gratuito     | Uso personal/comercial       | Sets PBR; revisar página de licencia     |
| Textures.com   | Comercial    | Uso comercial con licencia   | PBR 4K; consultar términos               |
| Poliigon       | Premium      | Uso comercial (suscripción)  | Variantes de metales premium             |

Brechas de información relevantes:
- Valores IOR exactos por variedad de cristal y zafiro sintético específicos para relojes; la literatura general provee rangos, pero faltan referencias estandarizadas por marca/modelo.
- Valores precisos de reflectancia (F0) por aleación de oro y titanio; se dispone de guías genéricas, pero no protocolos de medición por aleación comercial.
- Conjuntos HDRI “estudio de reloj” dedicados; se puede construir con HDRI genéricos, pero no hay bibliotecas curadas específicamente para watch photography.
- Texturas PBR 4K–8K gratuitas y Comerciales con metadatos estandarizados (resolución, bit-depth, canalización) para cuero/caucho; se requiere selección manual y validación.
- Parámetros finos (sheen, clearcoat, dispersión) para recubrimientos funcionales (anti-reflejo, super-hydrophobic) en tiempo real; existen propiedades, pero no datos medidos por coating.

---

## Referencias

[^1]: Discover three.js – Physically Based Rendering. https://discoverthreejs.com/book/first-steps/physically-based-rendering/
[^2]: Khronos Group – PBR en glTF. https://www.khronos.org/gltf/pbr
[^3]: Three.js docs – MeshStandardMaterial. https://threejs.org/docs/#api/en/materials/MeshStandardMaterial
[^4]: Three.js docs – MeshPhysicalMaterial. https://threejs.org/docs/api/en/materials/MeshPhysicalMaterial.html
[^5]: Medium – Experimentando con texturas PBR en Three.js. https://medium.com/@Makoto_29712/experimenting-with-pbr-textures-usingthree-js-a25aad28ed65
[^6]: FreePBR – Metales (categoría). https://freepbr.com/c/base-metals/
[^7]: Poliigon – Texturas de metal. https://www.poliigon.com/textures/metal
[^8]: ambientCG – Texturas PBR, HDRIs y modelos (CC0). https://ambientcg.com/
[^9]: Poly Haven – HDRIs. https://polyhaven.com/hdris/
[^10]: LotPixel – Textura gratuita de Titanio. https://www.lotpixel.com/texture/free-titanium-metal-texture-439
[^11]: Codrops – Efectos de vidrio/plástico transparente en Three.js. https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/
[^12]: Wikipedia – Índice de refracción. https://en.wikipedia.org/wiki/Refractive_index
[^13]: Textures.com – Biblioteca PBR (metalness/roughness). https://www.textures.com/browse/pbr-materials/114558
[^14]: Three.js Journey – Environment map. https://threejs-journey.com/lessons/environment-map
[^15]: SBCode – Environment Maps (Three.js Tutorials). https://sbcode.net/threejs/environment-maps/
[^16]: HDRI-to-CubeMap – Conversor. https://matheowis.github.io/HDRI-to-CubeMap/
[^17]: Three.js Resources – Texture Gen V3. https://threejsresources.com/tool/texture-gen-v3
[^18]: Post-Processing con Three.js – Wael Yasmina. https://waelyasmina.net/articles/post-processing-with-three-js-the-what-and-how/
[^19]: pmndrs – Biblioteca postprocessing. https://github.com/pmndrs/postprocessing
[^20]: Three.js Forum – Cómo añadir fondo HDRI. https://discourse.threejs.org/t/how-to-add-hdri-background/53675
[^21]: Three.js Forum – Transmisión: rendimiento. https://discourse.threejs.org/t/transmission-effect-pbr-material-performance/59274
[^22]: Codrops – Optimización de escenas Three.js (2025). https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/
# Animación realista de relojes 3D en WebGL/Three.js: técnicas, fuentes y guía aplicada

## Resumen ejecutivo y objetivos

El objetivo de este informe es recopilar, estructurar y traducir a prácticas implementables las mejores técnicas para animar relojes 3D con apariencia realista en navegadores usando Three.js y WebGL. Se abordan los componentes clave de un reloj —manecillas, corona y pulsadores, bisel, esfera y marcadores, correas— y los factores de calidad que决定n el realismo: temporizado estable, interacciones fluidas, iluminaciones y sombras físico-plausibles, materiales y postprocesado.

El alcance cubre:
- Manecillas con rotación continua y salto de segundo coherente (mecánico vs cuarzo).
- Corona giratoria y botones con interacción mediante raycasting, arrastre y animaciones temporales.
- Bisel con rotación suave, límites y “click-stop” discreto.
- Esfera y marcadores con materiales físicos, texturas y efectos de luminiscencia.
- Correas y cadenas con física ligera basada en restricciones.
- Profundidad y realismo mediante iluminación, sombras, reflejos y postprocesado.
- El estado del arte en configuradores premium (p. ej., TAG Heuer) y estudios especializados (p. ej., London Dynamics), y su traducción a stacks web.

La metodología consiste en una revisión aplicada de documentación y ejemplos oficiales de Three.js, tutoriales técnicos, discusiones verificadas de la comunidad y casos de uso de lujo. Se prioriza la evidencia con demos reproducibles y parámetros iniciales sugeridos para acelerar la implementación en proyectos reales. La biblioteca de ejemplos de Three.js actúa como catálogo transversal de patrones reutilizables, mientras que los materiales físicos, sondas de luz (lightprobe) y mapas de entorno HDR proporcionan el soporte visual para el realismo de acabados metálicos y cristal[^1].

Finalmente, se señalan explícitamente algunas lagunas de información: detalles técnicos internos no públicos de configuradores de lujo, ausencia de guías específicas sobre “click-stop” del bisel, guías completas sobre materiales PBR de relojes y parámetros de audio/feedback háptico en web para corona y pulsadores. Estas carencias se suplen con aproximaciones prácticas y referencias adyacentes.

---

## Fundamentos y pipeline de animación en Three.js

La base de cualquier animación convincente es un pipeline robusto de tiempo y actualización. En Three.js, el control del tiempo puede realizarse con THREE.Clock (API clásica) o con Timer (API alternativa), ambos diseñados para obtener deltas estables y sincronizar la lógica de animación con el render. THREE.Clock ofrece métodos start/stop/getDelta y es ampliamente utilizado en ejemplos y tutoriales; Timer proporciona una alternativa con un diseño distinto y conexión explícita al loop, útil cuando se necesita un control diferente del calendario de actualizaciones[^2][^3][^4].

Más allá del tiempo, la animación eficiente se apoya en la organización de la escena (grupos, jerarquías) y en la separación entre lógica y representación. Ejemplos como el reloj básico de Dustin Pfister separan la lógica temporal (módulo clock) de la integración Three.js (main), lo que facilita la mantenibilidad, pruebas y evolución hacia animaciones más complejas[^5][^6]. Esta modularidad es especialmente valiosa en relojes con múltiples elementos móviles: manecillas, subdiales, corona y bisel deben actualizarse con una cadencia estable, evitando que el jitter o desincronización rompan la ilusión de precisión mecánica.

El sistema de animación de Three.js permite animar prácticamente cualquier propiedad de un objeto (posición, rotación, escala, materiales), con capacidades para keyframes, mezcla de animaciones y retargeting. El capítulo sobre el sistema de animación en DiscoverThreeJS detalla cómo estructurar clips y mezclar pistas, una base sólida para coordinar eventos como el “salto de segundo” o la interacción de la corona con la interfaz de un reloj conectado[^7].

Para ilustrar la decisión de tiempo, la siguiente tabla compara Clock y Timer en términos de API y uso típico.

Para contextualizar el control de tiempo, la Tabla 1 resume la elección de Clock frente a Timer.

Tabla 1. Comparativa de temporizadores: Clock vs Timer

| Criterio                           | THREE.Clock                                  | Timer (examples)                                       |
|------------------------------------|----------------------------------------------|--------------------------------------------------------|
| API esencial                      | start(), stop(), getDelta()                  | connect(), update() (diseño alternativo)               |
| Autoarranque                      | Sí (con autoStart)                           | Requiere conexión explícita al loop                    |
| Uso típico                        | Deltas por frame y animaciones generales     | Control alternativo, integración con loop personalizado|
| Casos de aplicación               | Manecillas, rotación continua, bucles        | Cronometraje especializado, sincronización con datos   |
| Compatibilidad con ejemplos       | Amplia en docs y demos                       | Presente en documentación de examples                  |
| Observaciones                     | Sencillo y robusto                           | Flexible; exige entender su ciclo de actualización     |

En la práctica, la elección depende de si se necesita un control más explícito del ciclo de actualización (Timer) o la simplicidad y compatibilidad amplia de Clock. Para la mayoría de configuradores de relojes, Clock será suficiente y más directo[^2][^3][^4][^7].

---

## Animación de manecillas fluida y realista

La animación de manecillas combina la exactitud temporal con la percepción de mecaneidad. Dos enfoques temporales predominan:

1) Actualización continua con delta de reloj (THREE.Clock/Timer), actualizando ángulos con una cadencia de 60 FPS. Este enfoque produce movimientos suaves, adecuados para visualización y para relojes de cuarzo sin salto visible.

2) Evento de salto por segundo, típico de relojes mecánicos. Aquí se busca que, cada vez que el segundo cambia, la manecilla salte discretamente al siguiente tick, con una micro-animación (easing corto) que mantenga la credibilidad.

En implementaciones reales, el ejemplo “webgl/watch” en la colección oficial y el tutorial de Script Tutorials muestran la creación de manecillas y su rotación basada en la hora del sistema, con formulas de conversión de tiempo a ángulos sobre el eje Z (ajustadas a la orientación de la esfera)[^1][^8]. El ejemplo básico de reloj en Three.js por Dustin Pfister desglosa la lógica y la integración, y sirve como base para introducir el salto de segundo con mínima complejidad[^5].

La coordinación de horas, minutos y segundos exige relaciones angulares correctas: la manecilla de segundos suele completar una vuelta por minuto (360°/60 s), la de minutos por hora (360°/60 min), y la de horas por 12 horas (360°/12 h). En términos de implementación, se mapean porcentajes del ciclo a ángulos y se ajusta el signo y offset para la orientación de la escena. Los ejemplos de Script Tutorials formulan explícitamente estos ángulos, que luego se aplican a las rotaciones de las mallas correspondientes[^8].

Para visualizar el mapeo, la Tabla 2 recoge las fórmulas base.

Tabla 2. Mapeo tiempo → ángulo de rotación por manecilla

| Manecilla | Fórmula base (ejemplo)                           | Observaciones de orientación                      |
|-----------|--------------------------------------------------|---------------------------------------------------|
| Segundos  | rotSec = timeSec · 2π / 60 − π/2                 | Ajuste −π/2 para alinear con la orientación       |
| Minutos   | rotMin = timeMin · 2π / 60 − π/2                 | Igual estructura que segundos                     |
| Horas     | rotHr  = timeHr  · 2π / 12 − π/2                 | Ciclo de 12 horas                                 |

Estas fórmulas se integran en el bucle de animación: cada frame se obtiene la hora actual, se calculan los ángulos y se aplican a las manecillas. Para simular el “ticking” mecánico, puede intercalarse un salto discreto cuando cambia el segundo, combinado con un easing breve que evite la sensación deParpadeo.

La gestión de la micro-animación del salto se apoya en curvas de easing. GSAP (GreenSock Animation Platform) es una opción consolidada para secuenciar y suavizar transiciones con control temporal fino; su integración con Three.js aparece en múltiples demostraciones y casos prácticos, y es especialmente útil para sincronizar eventos (p. ej., cambio de pantalla de un smartwatch mientras gira la corona)[^9][^10][^11]. Con una duración de 80–120 ms y una curva ease-out, el salto de segundo mantiene la credibilidad sin percibirse tardío.

Para elegir el método de tiempo en este contexto, la Tabla 3 sintetiza las implicaciones.

Tabla 3. Métodos de tiempo: Clock vs Timer para manecillas

| Método         | Pros                                             | Contras                                          | Escenarios recomendados                           |
|----------------|--------------------------------------------------|--------------------------------------------------|---------------------------------------------------|
| THREE.Clock    | Sencillo;广泛usado; getDelta estable             | Menos control fino sobre el ciclo                | Rotación continua; sincronización visual estándar |
| Timer          | Control alternativo del ciclo                    | Requiere conexión explícita y comprensión de API | Coordinación precisa con eventos; cronogramas especiales |
| GSAP (timeline)| Easing y control de transiciones avanzados       | Capa adicional; no reemplaza el render loop      | Micro-animaciones; salto de segundo; sincronización de UI |

En la implementación, Clock proporciona el delta y cadence; GSAP adiciona la capa de easing en el salto de segundo. La combinación produce una experiencia convincente con mínima complejidad[^2][^3][^4][^7][^9][^11].

### Micro-animaciones y sincronización

El salto de segundo debe ocurrir en el instante en que el valor del segundo cambia. Si se usa actualización continua, puede verificarse el cambio de segundo y aplicar una transición de 80–120 ms con ease-out, haciendo que la manecilla se desplace desde el ángulo previo al nuevo, sin tartamudeo. GSAP permite encapsular estos saltos como eventos discretos y mantener la coherencia con animaciones paralelas (p. ej., cambiar texturas de pantalla en un smartwatch, o sincronizar una transición de subdiales). En discusiones del foro de Three.js, se sugiere el uso de GSAP para sincronizar la rotación de la corona con transiciones de UI, reforzando la percepción de un dispositivo conectado vivo[^10][^9].

---

## Animaciones de corona giratoria y botones (interacción y feedback)

La corona y los pulsadores son puntos de interacción centrales en un reloj, especialmente en ediciones conectadas. Para detectarlos y responder a gestos, el raycasting es la técnica estándar: se proyecta un rayo desde la cámara hacia el plano de interacción y se detectan hits sobre la corona o los botones, habilitando acciones como rotación o pulsación[^1]. OrbitControls sirve como base para navegación, pero la interacción con la corona debe resolverse con eventos de puntero (pointerdown, pointermove, pointerup) y estados de arrastre.

La rotación de la corona puede mapearse al delta horizontal (o vertical) del puntero y traducirse a un ángulo de rotación sobre el eje apropiado del modelo. En discusiones de la comunidad sobre animaciones de pantalla y corona en smartwatches, se recomienda animar tanto la corona como la UI (p. ej., transiciones entre pantallas) con una capa temporal coherente; de nuevo GSAP resulta útil para modular la velocidad y el easing del giro[^10][^9].

El feedback visual durante la interacción incluye:
- Easing de entrada/salida al iniciar/detener el arrastre.
- Efectos de brillo local en el金属de la corona (shader de glow por objeto).
- Micro-desplazamientos del botón (escala breve, color emission) para indicar pulsación.

Para ayudar a seleccionar el patrón de interacción, la Tabla 4 resume las opciones más frecuentes.

Tabla 4. Técnicas de interacción para corona/botones

| Técnica                 | Uso típico                                     | Ventajas                                        | Consideraciones                             |
|-------------------------|------------------------------------------------|-------------------------------------------------|---------------------------------------------|
| Raycasting              | Detección de hits sobre corona/botón           | Preciso; independiente de controles de cámara   | Requiere manejar orden de objetos y capas   |
| Arrastre (drag)         | Rotación de corona con puntero                 | Intuitivo; continuo                             | Mapear delta → ángulo; aplicar easing       |
| Keyframes (AnimationMixer)| Eventos discretos (pulsación con snap)        | Reproducibles; mezclables                       | Definir clips; sincronizar con UI           |
| GSAP timelines          | Sincronización con UI y micro-animaciones      | Control fino de easing y tiempos                | No sustituye el render loop                 |

El objetivo es ofrecer un “feel” premium: respuesta inmediata, aceleración suave al comenzar, deceleración al soltar. En relojes conectados, la corona no solo gira: también puede navegar capas de UI. Los ejemplos del foro sugieren GSAP para coordinar estas transiciones, con la lógica de raycasting determinando cuándo iniciar/pausar las animaciones[^10][^1][^9].

---

## Rotación de bisel (suave y con click-stop)

La rotación del bisel exige límites de ángulo y un comportamiento que combine suavidad y discreción. En muchos relojes de buceo, el bisel tiene topes mecánicos y un “click-stop” que lo hace avanzar en incrementos discretos. En web, esta conducta puede emularse con:

- Rotación suave respondiendo al arrastre.
- Cuantización a pasos (p. ej., 1°, 5° o 10°) cuando se suelta, con un micro-snap y easing breve.

Los controles de cámara (Orbit/Arcball) facilitan la inspección del bisel, pero la rotación del propio objeto debe independizarse de los controles de vista. La integración con AnimationMixer permite retargeting de clips que, por ejemplo, reproduzcan el “click” y un micro-impulso visual[^1][^7].

La Tabla 5 compara los modos de rotación del bisel.

Tabla 5. Modos de rotación del bisel

| Modo                      | Descripción                                     | Ventajas                         | Contras                            | Escenarios                            |
|---------------------------|-------------------------------------------------|----------------------------------|-------------------------------------|---------------------------------------|
| Suave (continuo)          | Respuesta directa al arrastre                   | Cómodo; sin pasos                | Menos “mecánico”                   | Inspección libre; biseles sin tope    |
| Discreto (cuantizado)     | Snap a incrementos al soltar                    | Percepción mecánica              | Puede percibirse “a saltos”         | Buceo con click-stop; cronógrafos     |
| Híbrido (suave + snap)    | Suave durante arrastre; snap al soltar          | Balance realism/fluidez          | Requiere tuning fino                | UX premium; bisel多功能               |

La clave está en la transición al soltar: aplicar un easing breve que lleve el ángulo al múltiplo más cercano del paso, simulando el encaje de los dientes del tope. Un micro-bounce puede reforzar la mecánica sin sobrecargar el rendimiento[^1][^7].

---

## Animaciones de esfera y marcadores

La esfera concentra gran parte de la lectura visual del reloj. Los marcadores pueden crearse como geometrías extruidas (Shapes y ExtrudeGeometry) o mediante texturas rotadas. El tutorial de Script Tutorials muestra marcadores horarioess extruidos y la fusión de geometrías para mejorar el rendimiento, técnica relevante cuando se utilizan 12 o 60 marcadores finos y se aspira a mantener una cadencia de 60 FPS[^8].

Las texturas pueden rotarse para alinear numerales o patrones, y el ejemplo oficial de rotación de texturas en Three.js ilustra cómo aplicar este enfoque de manera eficiente. El mapeo de orientación y las transformaciones se apoyan en las utilidades matemáticas y de orientación disponibles en la colección de ejemplos[^1].

Para los marcadores luminosos, hay dos rutas:
- Shader de glow por objeto, que simula un halo en base al ángulo entre la normal y el vector de vista. Es eficiente y permite resaltar índices sin usar postprocesado de toda la escena.
- Postprocesado tipo bloom, que aplica un desenfoque y bright-pass a la imagen completa, creando un resplandor global. Es más costoso y puede requerir una máscara para delimitar el efecto.

El shader de glow por objeto documentado por Kade Keith ofrece un control preciso por malla y evita el costo de una pass completa de bloom, aunque el efecto no es físicamente equivalente a un bloom fotográfico; el artículo incluye código GLSL y explicación del cálculo de intensidad con `viewVector` y normales transformadas[^12]. Para un “bloom” más realista, la pass `unreal_bloom` en postprocesado de Three.js es un punto de partida útil, configurable en intensidad y umbral[^1].

La Tabla 6 compara ambas técnicas.

Tabla 6. Glow por shader vs Bloom postprocesado

| Técnica                 | Costo computacional | Control por objeto | Realismo | Observaciones                                   |
|-------------------------|---------------------|--------------------|----------|-------------------------------------------------|
| Shader de glow          | Bajo–medio          | Alto               | Medio    | Eficiente; no es un bloom físico               |
| Postprocesado bloom     | Medio–alto          | Bajo (global)      | Alto     | Requiere tuning; mejor para escenas complejas  |

En un reloj, combinar un shader de glow selectivo en índices con una capa ligera de bloom puede lograr luminiscencia creíble sin degradar el rendimiento[^12][^1][^8].

---

## Movimientos de correas (física ligera para credibilidad)

Las correas aportan vida al reloj, especialmente durante cambios de orientación o al inspeccionar el modelo. El objetivo no es una simulación exhaustiva de tela o cuero, sino añadir pequeñas oscilaciones y flexiones que Incrementen la credibilidad.

Un enfoque práctico es usar un motor de física (Rapier) con cuerpos rígidos y restricciones (joints) que conecten segmentos de correa o cadena. El tutorial de SBCode y la documentación de Rapier detallan la inicialización en JavaScript/WebAssembly, la creación de cuerpos rígidos y la aplicación de fuerzas y restricciones. La integración con Three.js se realiza mediante mapeos entre objetos de física y mallas, actualizando posiciones y rotaciones cada frame[^13][^14][^15].

Para correas de cuero o silicona, basta con unos pocos segmentos articulados con restricciones de ángulo y amortiguación, evitando-colisiones entre segmentos para mantener la estabilidad y el rendimiento. En cadenas metálicas, las restricciones limitan la rotación relativa y el swings con amortiguación produce un balance convincente sin explosiones de física.

La Tabla 7 resume opciones de implementación.

Tabla 7. Implementaciones de correas

| Enfoque                 | Complejidad | Control | Costo | Comentarios                                      |
|-------------------------|-------------|---------|-------|--------------------------------------------------|
| keyframes + spline      | Baja        | Medio   | Bajo  | Útil para poses; poca dinámica                   |
| constraints + joints    | Media       | Alto    | Medio | Rapier; credibilidad con amortiguación           |
| full cloth (PBD/XPBD)   | Alta        | Alto    | Alto  | Reservar para casos premium; tuning exigente     |

La física ligera es clave para no comprometer la cadencia de 60 FPS en dispositivos móviles. Con Rapier, la estabilidad y velocidad permiten introducir inercia y oscilaciones sutiles, suficientes para percibir el material y la flexibilidad sin caer en artefactos visuales[^13][^14][^15][^1].

---

## Efectos de profundidad y sombras (realismo fotográfico)

El realismo en un reloj depende en gran medida de cómo la luz y las sombras modelan sus superficies. Para lograr esto en Three.js, se recomienda una configuración que combine:

- Iluminación basada en mapas de entorno HDR y sondas de luz (lightprobe), para un relleno coherente que reproduzca la iluminación ambiental de un estudio o interior. Los ejemplos oficiales muestran cómo cargar entornos HDR y prefiltrarlos con PMREM, generando reflejos plausibles sin requerir un mapa de cubo dinámico por objeto[^16][^1].
- Sombras suaves (shadow maps) con luces puntuales o rectangulares, ajustando bias y tamaño para evitar acne y obtener penumbras naturales. Las luces rectangulares (rectarea light) son ideales para superficies amplias y suaves, habituales en esferas y cajas de reloj[^1].
- Materiales físicos con clearcoat y transmission para metales pulidos y cristales. El modelo físico de Three.js permite ajustar intensidad de recubrimiento, rugosidad y transmisión, mejorando la apariencia de lacados y vidrios. Los ejemplos oficiales de `physical/clearcoat` y `physical/transmission` son referencia directa[^17][^18].

Para superficies metálicas y pulidas:
- Cubemaps prefiltrados (PMREM) ofrecen reflejos consistentes y eficientes. 
- Reflexiones en espacio de pantalla (SSR) y efectos de espejo pueden usarse puntualmente, sabiendo su costo y limitaciones en consistencia. SSR es útil para superficies planas y reflexiones de proximidad; bloom y tonemapping contribuyen a la finalización visual[^1].

La Tabla 8 compara técnicas de iluminación y sus escenarios ideales.

Tabla 8. Técnicas de iluminación y efectos

| Técnica                      | Caso ideal                         | Pros                                     | Contras                               |
|-----------------------------|------------------------------------|------------------------------------------|----------------------------------------|
| HDR + Lightprobe            | Interior/estudio coherente         | Relleno global; reflejos plausibles      | No resuelve reflejos locales específicos|
| Rectarea light + sombras    | Superficies suaves                 | Penumbras naturales; difusión agradable  | Tuning de shadow maps necesario        |
| PMREM + cubemaps            | Metales y lacados                  | Reflejos prefiltrados; rendimiento       | Menos precisos que SSR                 |
| SSR                         | Superficies planas cercanas        | Reflejos detallados locales              | Costo; inconsistencias con cámara      |
| Tonemapping + bloom         | Finalización visual                | Rango dinámico equilibrado               | Requiere tuning para evitar halos      |

Con una combinación prudente de estos elementos, es posible alcanzar un realismo fotográfico en navegadores, equilibrando costo y calidad[^16][^17][^18][^1][^19].

---

## Configuradores premium y benchmarks del sector

Los configuradores de lujo establecen el listón de calidad y fluidez al que aspiran los proyectos web. El configurador de TAG Heuer Carrera es un caso emblemático: combina personalización de materiales y acabados con navegación 3D fluida en WebGL, ofreciendo una experiencia购物adora premium que ayuda a la toma de decisiones y a la conversión[^20]. Proyectos de experiencia digital de TAG Heuer, desarrollados por estudios como Bonhomme, muestran el uso de WebGL para sorprender al usuario y aumentar el desirability del producto, con equipos multidisciplinares (3D, dirección de arte, desarrollo Three.js) que optimizan el render y la navegación[^21][^22].

El trabajo de London Dynamics en visualización 3D y AR para relojes aporta lecciones importantes: la creación de modelos hiper-realistas con atención al detalle en materiales y acabados, integraciones con plataformas de eCommerce y un SDK que facilita la adopción en sitios existentes. Estos casos subrayan la importancia de pipelines de contenido consistentes, materiales PBR bien definidos y un rendimiento optimizado[^23][^24].

Para sintetizar estas lecciones, la Tabla 9 contrasta tecnologías y estrategias en ejemplos relevantes.

Tabla 9. Comparativa de configuradores y estudios

| Entidad                        | Web tech destacada    | Enfoque visual/interacción           | Lecciones aplicables                     |
|--------------------------------|-----------------------|--------------------------------------|-------------------------------------------|
| TAG Heuer Carrera Configurator | WebGL + 3D interactivo| Navegación fluida; personalización   | Fluidez; UI coherente; rendimiento móvil  |
| Bonhomme (TAG Heuer projects)  | WebGL                 | Narrativa interactiva; 3D moralizado | Producción 3D disciplinada; UX premium    |
| London Dynamics (watches)      | Web/AR SDK            | Modelos hiper-realistas; AR          | Materiales y acabados; integración eCommerce |

Estas prácticas se traducen a stacks web con Three.js y control de tiempo/animación como pilares, materiales físicos bien calibrados y un pipeline de contenido que asegure consistencia entre variantes del reloj[^20][^21][^22][^23][^24].

---

## Plan de implementación y checklist de calidad

Una secuencia eficiente de implementación ayuda a evitar regresiones y asegurar calidad desde el primer prototipo:

1) Modelado y materiales: construir la geometría del reloj (esfera, bisel, corona, pulsadores, correas) y asignar materiales físicos (clearcoat, transmission, rugosidad metal). 
2) Iluminación y sombras: configurar HDR, lightprobe, rectarea lights y shadow maps con bias y tamaño ajustados.
3) Animación de manecillas: integrar Clock/Timer y mapeo de tiempo a ángulos; añadir salto de segundo con GSAP.
4) Interacciones: raycasting para corona/botones; mapeo de arrastre a rotación; feedback visual (glow, micro-escala).
5) Bisel: implementar rotación suave con límites y snap; opcionalmente un micro-bounce.
6) Postprocesado: aplicar tonemapping y bloom selectivo para finalizar la imagen.
7) Física ligera de correas: Rapier con segmentos y restricciones para oscilaciones sutiles.
8) QA y optimización: pruebas de fluidez y estabilidad en móviles; tuning de shadow maps y passes de postprocesado.

Para facilitar el control de calidad, la Tabla 10 propone un checklist.

Tabla 10. Checklist de QA para animación de relojes 3D

| Área                    | Criterio                                       | Métrica/Prueba                                 |
|------------------------|--------------------------------------------------|------------------------------------------------|
| Fluidez                | 60 FPS sostenidos en desktop/móvil              | Perfilador; medidas de frame time              |
| Sincronización         | Manecillas y UI coordinadas                     | Visual; logs de eventos                        |
| Interacción            | Raycasting preciso; arrastre sin jitter         | Test de puntero; límites de rotación           |
| Materiales             | Metales y cristal plausibles                    | Revisión HDR; PMREM; ajustes clearcoat/transmission |
| Sombras                | Penumbras suaves; sin acne                      | Shadow map tuning; bias                        |
| Postprocesado          | Bloom y tonemapping equilibrados                | Pruebas A/B de intensidad y umbral             |
| Físicas                | Correas con oscilaciones sutiles; estabilidad   | Escenarios de interacción; tuning Rapier       |
| Rendimiento            | Sin picos; consumo controlado                   | Flame charts; medidas de GPU/CPU               |

Como referencia de estructura y código base, el reloj básico de Dustin Pfister y la biblioteca de ejemplos de Three.js ofrecen puntos de partida sólidos para cada etapa[^5][^1].

---

## Riesgos, trade-offs y optimización

El principal riesgo al buscar realismo es el costo de renderizado: sombras de alta calidad, bloom y SSR pueden degradar la fluidez en móviles. Existen trade-offs claros:

- Sombras progresivas mejoran la suavidad pero aumentan el tiempo de cómputo; conviene usarlas puntualmente en escenas estáticas o cinematicas, no en interacciones intensas[^1].
- SSR es caro y puede producir inconsistencias; se reserva a superficies específicas donde su aporte sea visible y útil[^1].
- CubeCamera para reflejos dinámicos por objeto puede ser costoso si se actualiza con frecuencia; una alternativa es usar entornos HDR y PMREM con actualizaciones menos frecuentes, o limitarlo a objetos críticos[^25].

El uso de Rapier introduce costos de CPU/WebAssembly, pero con tuning correcto (disminuir el número de objetos, limitar articulaciones, amortiguar) puede mantenerse estable. En móviles, es preferible simplificar física y postprocesado, priorizando iluminación HDR, sombras de calidad media y materiales físicos.

La Tabla 11 resume los costos relativos de técnicas de reflejos.

Tabla 11. Costos y trade-offs en reflejos

| Técnica            | Costo relativo | Beneficio principal                     | Recomendación de uso                      |
|--------------------|----------------|-----------------------------------------|-------------------------------------------|
| CubeCamera         | Medio–alto     | Reflejos dinámicos locales              | Usar con moderación; limitar frecuencia   |
| SSR                | Alto           | Detalle local; precisión de superficie  | Casos puntuales; superficie plana         |
| PMREM + HDR        | Bajo–medio     | Reflejos plausibles y consistentes      | Base recomendada para metales y lacados   |

El equilibrio se logra midiendo y ajustando: perfiles de tiempo por frame, reducción de resolución en passes pesados y selección cuidadosa de efectos según el dispositivo objetivo[^1][^25][^13].

---

## Conclusiones y siguientes pasos

La animación realista de relojes 3D en la web se construye sobre pilares bien establecidos: control de tiempo (Clock/Timer), organización modular de la escena, materiales físicos calibrados, iluminación HDR coherente y un set de interacciones que respondan con fluidez. La evidencia y demos oficiales de Three.js permiten abordar cada componente con patrones reutilizables y parámetros iniciales seguros[^1][^2][^3].

Recomendaciones:
- Priorizar materiales PBR (clearcoat, transmission) y entornos HDR con PMREM; calibrar sombras con rectarea lights y lightprobe.
- Usar THREE.Clock para la cadencia base y GSAP para micro-animaciones (salto de segundo, feedback de corona/botones).
- Implementar bisel con rotación híbrida: suave al arrastrar, snap al soltar, con micro-easing.
- Añadir física ligera con Rapier para correas, restringiendo articulaciones y amortiguando para estabilidad.
- Aplicar bloom selectivo y tonemapping con moderación para finalizar la imagen sin comprometer móviles.

Trabajo futuro:
- Integrar audio/feedback háptico en web para coronas y pulsadores.
- Profundizar en simulaciones de click-stop mecánicos con cuantización y micro-snap.
- Refinar materiales PBR con mediciones y perfiles de luz específicos para acero, aluminio, cerámica y cristal.

El plan es iterativo: construir un prototipo funcional, medir rendimiento, y afinar materiales y efectos para alcanzar el estándar premium observado en configuradores de lujo[^23].

---

## Referencias

[^1]: three.js examples. https://threejs.org/examples/
[^2]: Clock – three.js docs. https://threejs.org/docs/#api/en/core/Clock
[^3]: Timer – three.js docs. https://threejs.org/docs/#examples/en/misc/Timer
[^4]: Three.js animate in real time - Stack Overflow. https://stackoverflow.com/questions/45343673/three-js-animate-in-real-time
[^5]: A Three js example of a basic clock - Dustin Pfister. https://dustinpfister.github.io/2019/12/16/threejs-examples-clock-basic/
[^6]: threejs-examples-clock-basic - GitHub. https://github.com/dustinpfister/test_threejs/tree/master/views/forpost/threejs-examples-clock-basic
[^7]: The three.js Animation System - DiscoverThreeJS. https://discoverthreejs.com/book/first-steps/animation-system/
[^8]: Interactive 3D watch using three.js - Script Tutorials. https://script-tutorials.com/tutorials/interactive-3d-watch-using-three-js/
[^9]: GSAP + Three.js Showcase. https://gsap.com/showcase/?page=1&tags=Three.js
[^10]: Best approach for a smartwatch screen slide animation - three.js forum. https://discourse.threejs.org/t/best-approach-for-a-smartwatch-screen-slide-animation/67659
[^11]: GSAP. https://gsap.com/
[^12]: three.js glow shader - Kade Keith. https://kadekeith.me/2017/09/12/three-glow.html
[^13]: Physics with Rapier - Three.js Tutorials (SBCode). https://sbcode.net/threejs/physics-rapier/
[^14]: Getting started - Rapier physics engine. https://rapier.rs/docs/user_guides/javascript/getting_started_js/
[^15]: RapierPhysics - Three.js Docs. https://threejs.org/docs/pages/RapierPhysics.html
[^16]: webgl / materials / envmaps / hdr. https://threejs.org/examples/#webgl_materials_envmaps_hdr
[^17]: webgl / materials / physical / clearcoat. https://threejs.org/examples/#webgl_materials_physical_clearcoat
[^18]: webgl / materials / physical / transmission. https://threejs.org/examples/#webgl_materials_physical_transmission
[^19]: webgl / postprocessing / unreal / bloom. https://threejs.org/examples/#webgl_postprocessing_unreal_bloom
[^20]: Configure Your TAG Heuer Carrera Watch. https://www.tagheuer.com/us/en/configure-your-tag-heuer-carrera-watch/carrera-configurator.html
[^21]: TAG Heuer Eyewear • Digital - Bonhomme Paris. https://bonhommeparis.com/en/projects/th-eyewear
[^22]: TAG Heuer • Digital - Bonhomme (TH CALIBRE E4). https://bonhommeparis.com/en/projects/th-super-mario
[^23]: 3D & AR Visualization for Watches - London Dynamics. https://londondynamics.com/industries/watches/
[^24]: Luxury 3D Product Visualization Demos - London Dynamics. https://londondynamics.com/luxury/
[^25]: How to achieve realistic reflection with threejs - Stack Overflow. https://stackoverflow.com/questions/26724659/how-to-achieve-realistic-reflection-with-threejs

---

### Nota sobre lagunas de información

- No se dispone de documentación técnica pública detallada de los pipelines internos de configuradores de lujo (TAG Heuer, Tissot). Se ha recurrido a casos públicos y experiencia de estudios.
- Falta una guía oficial de Three.js específica sobre “click-stop” del bisel; se proponen aproximaciones con cuantización y easing.
- Los parámetros PBR completos (rugosidad, clearcoat, transmission) para materiales de relojes no están estandarizados en las fuentes; se sugieren calibraciones basadas en ejemplos.
- La sincronización de audio y feedback háptico en web para coronas y pulsadores carece de guías específicas en las fuentes utilizadas.
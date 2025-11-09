# Blueprint del informe: APIs y proveedores de componentes relojeros (Miyota, Seiko, Ronda) con precios, disponibilidad y términos

## Resumen ejecutivo y alcance

Este informe identifica y evalúa APIs y proveedores de componentes relojeros —con foco en movimientos (Miyota, Seiko, Ronda), cristales de zafiro, cajas, esferas, manecillas y correas— y examina plataformas B2B y middleware de integración capaces de soportar inventarios y catálogos en tiempo real. El objetivo es ofrecer a los equipos de Desarrollo/Integración, Compras/Abastecimiento y eCommerce/B2B una guía práctica y accionable para acelerar la integración de sistemas, la sincronización de datos y la compra inteligente, con base en evidencia pública y verificable.

Principales hallazgos:

- APIs aplicables al ecosistema relojero. Existen soluciones de inventario y catálogo pensadas para distribuidores, así como plataformas B2B específicas del sector joyero/relojero con integración ERP e imágenes 360°, y middleware que unifica el comercio B2B con más de 60 plataformas eCommerce. Entre ellas: la API de WatchDealerInventory (gestión de inventario y ofertas B2B), la plataforma Brandscope (B2B relojero/joyero con ERP y 360°), el middleware API2Cart (sincronización de catálogos, inventario y pedidos) y SparkLayer (capa B2B que habilita precios por cliente, reglas de pedido y APIs), además de la API “Watch Database” en Apify para especificaciones e imágenes de relojes (en mantenimiento). [^4] [^5] [^11] [^12] [^2] [^3]
- Panorama de proveedores y precios. En cristales de zafiro, Cas-Ker publica una matriz de precios por tipo (plano/abovedado), grosor y diámetro, con surtidos y recargas disponibles. En correas, Joyawatch muestra precios unitarios de referencia para cuir y opciones OEM con métodos de pago多样化 (PayPal, Alipay, transferencia, Western Union). En movimientos, S.T. Supply publica listados y precios de múltiples calibres Ronda; Perrin ofrece cuentas mayoristas con catálogos personalizados de precios (acceso requiere registro). [^7] [^10] [^6] [^8] [^1] [^18]
- Integración y disponibilidad en tiempo real. Brandscope declara integración nativa con ERPs y visibilidad de inventario en tiempo real, apoyada en infraestructura AWS con certificaciones de seguridad. API2Cart centraliza la sincronización de catálogos, inventario y pedidos, con opciones de bridge y webhooks para conexiones directas. SparkLayer habilita una capa B2B encima del eCommerce existente y expone API para experiencias personalizadas. [^5] [^11] [^12]
- Gaps críticos a gestionar. Hay ausencia de APIs públicas oficiales para fabricantes como Miyota y Seiko en las fuentes consultadas; los MOQs de componentes suelen no estar publicados y requieren contacto comercial; los términos completos de uso de la API de WatchDealerInventory no están disponibles en el contenido extraído; la API de “Watch Database” en Apify figura en mantenimiento; no se hallaron APIs públicas para cristales de zafiro, diales, manos y cajas en proveedores como Cas-Ker, GoTop y Sollier Lemarchand. [^15] [^16] [^2] [^4]

Alcance y límites: este documento cubre las categorías de componentes señaladas y las APIs/plataformas con evidencia pública en las referencias. No cubre en detalle regulaciones específicas por país ni acuerdos de licencia de imágenes más allá de los términos generales disponibles.

Cómo leer el informe: la narrativa avanza del “qué” (ecosistema y proveedores) al “cómo” (APIs e integración) y al “so what” (recomendaciones, comparativas y plan de acción), incorporando tablas que sintetizan hallazgos y decisiones.

## Metodología y criterios de evaluación

Se han utilizado fuentes públicas y verificables, priorizando documentación oficial de plataformas y páginas de proveedores con listados de producto y precios. La evaluación de APIs y proveedores se ha realizado con base en:

- Catálogo y cobertura: amplitud del portafolio por categoría y profundidad de atributos técnicos.
- Precios y transparencia: disponibilidad de precios públicos, referencias unitarias y/o mayoristas.
- Disponibilidad y stock: señales de tiempo real, surtidos y recargas.
- Términos de API: autenticación, límites de tarifa (rate limits), planes, SDKs y soporte.
- Integración ERP/eCommerce: integración nativa, CSV/API, imágenes 360°, pagos B2B.
- Pagos y MOQs: diversidad de métodos de pago y evidencia de MOQs.

Para enmarcar el valor de las integraciones API en distribución mayorista, se ha considerado el enfoque “API-first” recomendado en el sector, que habilita casos de uso como onboarding rápido, order-to-cash digital, visibilidad extremo a extremo y omnicanalidad. [^14]

Limitaciones: en varios proveedores no hay APIs públicas o los precios y MOQs son bajo solicitud; se sugiere iniciar contacto comercial y/o técnico con那些 proveedores para confirmar condiciones de integración.

## Panorama del ecosistema relojero: fabricantes y distribución

Los fabricantes de movimientos mantienen un rol central, pero rarely publican APIs o precios mayoristas de libre acceso. Miyota (Citizen) presenta su portafolio oficial de movimientos y especificaciones, sin evidencia de una API pública para catálogos o inventarios. Ronda, por su parte, detalla su gama de movimientos de cuarzo; su distribución se apoya en mayoristas y distribuidores como Perrin y S.T. Supply. [^15] [^16] [^18] [^6] [^8]

El grueso del soporte digital y la disponibilidad en tiempo real se apoya en plataformas B2B específicas del sector y en middleware de integración con ERPs y eCommerce:

- Plataformas B2B sectoriales. Brandscope es un SaaS B2B para joyería/relojería que se integra con ERPs, ofrece inventario en tiempo real, gestión de pedidos y recursos de marketing, con soporte multiidioma/moneda y seguridad AWS; integra imágenes 360° vía ORDRE (ORB360). [^5]
- ERP vertical. SUN FACET, de Suntech, cubre retail y wholesale de relojes con módulos de inventario, personalización y seguimiento por RFID, además de integraciones con terceros. [^9]
- Middleware y capas B2B. API2Cart conecta plataformas B2B con más de 60 sistemas eCommerce para sincronizar catálogos, precios escalonados, inventario y pedidos; SparkLayer añade una capa B2B con precios por cliente, reglas de pedido y APIs sobre tiendas Shopify, Wix, BigCommerce y WooCommerce; WatchDealerInventory expone una API operativa para inventario y ofertas B2B. [^11] [^12] [^4]

Para ilustrar la diversidad de actores y roles, el siguiente mapa sintetiza fabricantes, distribuidores, plataformas B2B y middleware de integración.

Tabla 1. Mapa de actores del ecosistema

| Categoría                     | Actor                      | Rol principal                                                                 | Observaciones clave                                                                 |
|------------------------------|----------------------------|-------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| Fabricante de movimientos    | Miyota (Citizen)           | Portafolio oficial de movimientos                                            | Sin API pública identificada en fuentes consultadas. [^15]                           |
| Fabricante de movimientos    | Ronda                      | Gama de movimientos de cuarzo                                                | Distribución vía mayoristas; sitio oficial sin API pública. [^16]                   |
| Distribuidor mayorista       | Perrin                     | Cuentas B2B, catálogos personalizados de precios                             | Acceso a precios mayoristas tras registro. [^8] [^1]                                |
| Distribuidor mayorista       | S.T. Supply                | Listados y precios públicos de movimientos Ronda                             | Catálogo en línea; sin mención de API pública. [^6]                                 |
| Plataforma B2B relojera      | Brandscope                 | SaaS B2B, integración ERP, inventario en tiempo real, imágenes 360°          | Seguridad AWS; soporte multiidioma/moneda. [^5]                                     |
| ERP vertical relojero        | SUN FACET (Suntech)        | Módulos retail/wholesale, RFID, integraciones                                | Atributos específicos de relojes (esfera, correa, material). [^9]                   |
| Middleware de integración    | API2Cart                   | API unificada a 60+ eCommerce, sincronización catálogo/inventario/pedidos    | Webhooks y opción Bridge; precios no públicos en la página de caso de uso. [^11]   |
| Capa B2B sobre eCommerce     | SparkLayer                 | Listas de precios por cliente, reglas de pedido, API                         | Planes desde $49/mes; prueba 14 días; API documentada. [^12] [^13]                 |
| API operativa de inventario  | WatchDealerInventory       | Inventario y ofertas B2B, autenticación API Key/OAuth, rate limits           | Documentación de endpoints; términos completos no visibles en extraído. [^4]       |

Implicaciones: mientras los fabricantes no expongan APIs, la integración operacional dependerá de distribuidores con B2B y de plataformas middleware. La combinación Brandscope + API2Cart + SparkLayer ofrece una ruta robusta para sincronización y experiencia B2B sobre tiendas existentes.

## APIs y servicios digitales aplicables

La integración de datos relojeros en sistemas operativos requiere evaluar capacidades de autenticación, endpoints, límites de tarifa y modos de integración (CSV/API/híbrido). A continuación se comparan cuatro soluciones con evidencia pública.

Tabla 2. Comparativa de APIs y plataformas

| Solución                 | Capacidades clave                                                                                  | Autenticación                | Rate limits (si aplica)                       | Integración ERP/eCommerce                         | Soporte/SDKs                        |
|--------------------------|-----------------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------|---------------------------------------------------|-------------------------------------|
| WatchDealerInventory     | Inventario (GET/POST), ofertas B2B (GET/POST), enlaces públicos                                    | API Key, OAuth 2.0           | Free: 100/h; Pro: 1.000/h; Ent.: 10.000/h     | No especificado                                   | SDKs JS/Python; Postman; soporte   |
| Brandscope               | Producto (API), inventario en tiempo real, 360° vía ORB360, pagos B2B (Stripe)                     | No especificado              | No publicado                                  | ERP nativo (API/CSV/híbrido), multi-moneda/idioma | Ingeniería de integración; seguridad AWS |
| API2Cart                 | Catálogo, precios escalonados, inventario, pedidos; webhooks; Bridge                               | No especificado              | No publicado                                  | Conecta con 60+ plataformas eCommerce             | Documentación y TCO calculator      |
| SparkLayer               | Capa B2B con listas por cliente, reglas de pedido, analytics; API para experiencias personalizadas | No especificado              | No publicado                                  | Sobre Shopify, Wix, BigCommerce, WooCommerce      | API docs; onboarding gratuito       |

Fuentes: [^4] [^5] [^11] [^12] [^13]

La lectura de la tabla sugiere una estrategia combinada: usar WatchDealerInventory para operaciones de inventario y ofertas; Brandscope cuando se requiera B2B sectorial con ERP y activos 360°; API2Cart para unificar conexiones con marketplaces y tiendas; SparkLayer para habilitar rápidamente reglas B2B y pagos por términos netos sobre una tienda existente.

### WatchDealerInventory API

La API de WatchDealerInventory documenta una base URL y métodos de autenticación (API Key y OAuth 2.0), con endpoints para gestionar inventario y ofertas B2B, además de generar enlaces públicos de compartición. Se publican límites de tarifa por plan (Free 100 req/h; Professional 1.000 req/h; Enterprise 10.000 req/h). La documentación menciona términos de servicio, aunque el contenido íntegro no está presente en lo extraído. [^4]

Tabla 3. Endpoints y parámetros principales

| Método | Ruta              | Descripción                              | Parámetros principales                                                  |
|--------|-------------------|------------------------------------------|-------------------------------------------------------------------------|
| GET    | /api/inventory    | Recuperar ítems de inventario            | page, limit, status                                                     |
| POST   | /api/inventory    | Crear un nuevo ítem de inventario        | make, model, reference, price, condition                                |
| GET    | /api/deals        | Recuperar ofertas y transacciones B2B    | status, dealer_id                                                       |
| POST   | /api/deals        | Crear una nueva oferta B2B               | buyer_id, seller_id, items, offer_price                                 |
| GET    | /api/public-links | Generar enlaces públicos para inventario | item_id, expires_in                                                     |

Uso sugerido: estandarizar la gestión de stock y las ofertas B2B en un solo punto, consumiendo endpoints con autenticación bearer. La creación y lectura de inventario permite alimentar tiendas y marketplaces con consistencia y evitar ventas fuera de stock.

### Brandscope (B2B relojero/joyero)

Brandscope es una plataforma B2B especializada que declara integración con ERPs mediante API/CSV/híbrido, inventario en tiempo real y una API de producto que incluye el envío de imágenes asociadas. Destaca su colaboración con ORDRE para integrar contenido visual 360° (ORB360) y su enfoque de seguridad (AWS), con soporte multi-moneda e idioma y pasarela de pagos B2B impulsada por Stripe. [^5]

Tabla 4. Módulos y capacidades de Brandscope

| Módulo/Capacidad          | Descripción                                                                                 |
|---------------------------|---------------------------------------------------------------------------------------------|
| Integración ERP           | Flujo automatizado de pedidos, inventario y productos (API/CSV/híbrido).                   |
| Inventario en tiempo real | Señales de stock actuales para reabastecimiento y control del ciclo de vida del producto.  |
| API de producto           | Envío de productos e imágenes vía API.                                                     |
| Imágenes 360°             | Integración ORDRE (ORB360) para visualización de alta calidad.                             |
| Pagos B2B                 | Pasarela con Stripe para tarjeta, domiciliación bancaria y PayPal.                         |
| Marketing/Assets          | Automatización de marketing y gestor digital de activos dinámicos.                         |
| Seguridad                 | Operación en AWS con estándares de protección de datos.                                    |

Interpretación: para distribuidores relojeros que requieren experiencia visual avanzada y sincronización ERP, Brandscope aporta una solución verticalizada con activos digitales que reducen la necesidad de muestras físicas y catálogos impresos.

### API2Cart (middleware B2B eCommerce)

API2Cart ofrece una API unificada para integrar plataformas mayoristas con más de 60 sistemas eCommerce y marketplaces, automatizando catálogos, precios escalonados, sincronización de inventario y pedidos en tiempo real. Dispone de webhooks donde está soportado y una opción Bridge para conexiones directas, además de una calculadora de TCO y páginas de precio para evaluar la inversión. [^11]

Tabla 5. Funciones clave y soporte

| Función                      | Detalle                                                                                   |
|-----------------------------|-------------------------------------------------------------------------------------------|
| Catálogo                    | Importación/exportación masiva de productos, variantes, atributos e imágenes.             |
| Precios escalonados         | Descuentos por volumen, listas de precios por cliente, promociones.                       |
| Inventario                  | Sincronización en tiempo real, prevención de overselling y backorders.                   |
| Pedidos                     | Importación, validación de términos, confirmaciones y sincronización de estados.         |
| Conectividad                | 60+ plataformas soportadas; webhooks; opción Bridge para acceso directo.                 |
| Costos                      | Página de precios y calculadora TCO; prueba y demo disponibles.                           |

Conclusión: API2Cart reduce el costo y la complejidad de conectar múltiples tiendas y marketplaces con una sola integración, permitiendo a equipos técnicos concentrar esfuerzos en capacidades diferenciadoras.

### SparkLayer (capa B2B para eCommerce)

SparkLayer transforma el sitio eCommerce existente en una solución B2B, con listas de precios por cliente, reglas de pedido mínimo/máximo, pagos por términos netos, analítica y agentes de ventas, y expone una API para construir experiencias personalizadas. Es compatible con Shopify, Wix, BigCommerce y WooCommerce, y ofrece planes desde $49/mes con prueba de 14 días e onboarding gratuito. [^12] [^13]

Tabla 6. Funciones B2B y conectividad de SparkLayer

| Categoría              | Funciones principales                                                                                          |
|------------------------|---------------------------------------------------------------------------------------------------------------|
| Frontend B2B           | Área “Mi Cuenta”, pedidos y pagos rápidos, listas de compras, cotizaciones, pre-pedidos, pedidos pendientes. |
| Motor de precios       | Listas por cliente, descuentos, reglas de mínimo/máximo, tamaño de paquete, precios por volumen.             |
| Pagos y crédito        | Tarjeta en línea, términos netos, límites de crédito y saldos de cuenta.                                     |
| Ventas y agentes       | Gestión de pedidos por teléfono, reordenamiento rápido, informes de actividad.                               |
| Analytics              | Métricas de clientes B2B, rendimiento por producto, comisiones.                                              |
| Conectividad           | Integraciones con herramientas de back-office; API para experiencias personalizadas.                         |
| Implementación         | Planes desde $49/mes; prueba 14 días; onboarding gratuito; soporte enterprise con SLA 24/7.                  |

Interpretación: SparkLayer es idóneo para habilitar rápidamente una capa B2B con reglas y pagos complejos sobre un eCommerce existente, evitando migraciones y manteniendo la tienda base.

### Apify Watch Database (especificaciones e imágenes)

La API “Watch Database” en Apify proporciona especificaciones detalladas de relojes, imágenes de alta calidad, movimiento y calibre; está en mantenimiento y el uso requiere cuenta y token de Apify. Su modelo de precio indica un costo por resultados. [^2] [^3]

Tabla 7. Endpoints y parámetros de la API Watch Database (Apify)

| Método/Endpoint                                                | Descripción                                              | Parámetros de entrada (ejemplos)                              |
|----------------------------------------------------------------|----------------------------------------------------------|---------------------------------------------------------------|
| POST/GET: Ejecutar Actor                                       | Lanza la ejecución del actor “watch-database”            | watchId, makeId, modelId, familyId, page, limit, reference    |
| POST/GET: Ejecutar y obtener items del dataset (sync)          | Ejecuta y devuelve elementos del dataset                 | Igual que arriba (POST permite pasar datos de entrada)        |
| GET: Obtener Actor                                             | Consulta metadatos del actor                             | token                                                         |

Utilidad: aunque la API esté en mantenimiento, su enfoque de datos estructurados de relojes puede enriquecer catálogos técnicos y visualizar especificaciones e imágenes en experiencias B2B.

## Proveedores y precios de componentes

La disponibilidad de precios públicos y atributos técnicos facilita la toma de decisiones y el diseño de catálogos. A continuación, se sintetizan referencias para cristales de zafiro, correas y movimientos, con especificaciones relevantes y evidencias de disponibilidad.

### Movimientos (Ronda, Miyota, Seiko)

Ronda dispone de múltiples calibres de cuarzo ampliamente distribuidos. S.T. Supply publica listados con SKUs y precios unitarios para numerosos calibres; Perrin ofrece cuentas mayoristas con catálogos personalizados de precios; el sitio oficial de Ronda describe su gama de cuarzo; Miyota presenta su portafolio oficial; y Perrin también lista movimientos Seiko (cuarzo y mecánicos). [^6] [^8] [^16] [^15] [^17]

Tabla 8. Precios y SKUs representativos de movimientos Ronda (S.T. Supply)

| Calibre/Modelo               | SKU             | Precio unitario |
|-----------------------------|-----------------|-----------------|
| 1004                        | RON-1004-SM     | $45.25          |
| 1005 Date at 3              | RON-1005-3-SM   | $69.50          |
| 1006 Date at 3              | RON-1006-3-SM   | $39.50          |
| 1009 Date at 3              | RON-1009-3-SM   | $63.50          |
| 1012                        | RON-1012-SM     | $46.95          |
| 1013                        | RON-1013-SM     | $42.95          |
| 1014                        | RON-1014-SM     | $43.95          |
| 1015 Date at 3              | RON-1015-3-SM   | $35.50          |
| 1016 Date at 3              | RON-1016-3-SM   | $52.95          |
| 1019 Date at 3              | RON-1019-3-SM   | $75.00          |
| 1032                        | RON-1032        | $20.95          |
| 1032 AIG2                   | RON-1032-H2     | $21.50          |
| 1032 AIG3                   | RON-1032-H3     | $22.95          |
| 1042                        | RON-1042        | $35.50          |
| 1062                        | RON-1062        | $15.95          |
| 1062 GILT (Swiss Made)      | RON-1062-SM     | $27.95          |
| 1063                        | RON-1063        | $11.50          |
| 1064                        | RON-1064        | $15.25          |
| 1064 GILT                   | RON-1064-SM     | $30.95          |
| 1069                        | RON-1069        | $14.50          |
| 1069 AIG2                   | RON-1069-H2     | $15.95          |
| 1069 GILT (Swiss Made)      | RON-1069-SM     | $29.00          |
| 3520D Date at 3             | RON-3520D-3     | $42.95          |
| 3520D Date at 3 GILT (Swiss)| RON-3520D-3-SM  | $68.00          |

Lectura de la tabla: el rango de precios refleja diversidad de calibres y funcionalidades (fecha, Swiss Made, variantes GILT). Los SKUs permiten normalización de catálogo y mapeo en sistemas ERP/eCommerce. [^6]

Tabla 9. Fuentes para movimientos (Miyota, Seiko, Ronda)

| Marca   | Fuente principal        | Disponibilidad de precios/API pública                      | Observaciones                                   |
|---------|-------------------------|------------------------------------------------------------|-------------------------------------------------|
| Miyota  | Sitio oficial [^15]     | Sin API pública identificada                               | Portafolio y especificaciones disponibles       |
| Seiko   | Perrin (movimientos) [^17] | Precios mayoristas bajo cuenta B2B                         | Catálogo Seiko (cuarzo y mecánico)              |
| Ronda   | Sitio oficial [^16]     | Sin API pública identificada                               | Gama de cuarzo detallada                        |
| Ronda   | S.T. Supply [^6]        | Precios públicos en listados                                | Amplio catálogo de calibres y SKUs              |
| Ronda   | Perrin (B2B) [^8] [^1]  | Precios mayoristas con catálogos personalizados            | Acceso tras registro y verificación             |

### Cristales de zafiro (planos, abovedados)

Cas-Ker publica una guía de cristales de zafiro con tipos (planos/abovedados), grosores (0,80/0,95/1,00/1,50/2,0 mm) y rangos de diámetro por modelo, además de surtidos y recargas. Esta estructura facilita la configuración de atributos de producto y la planificación de compras. [^7]

Tabla 10. Matriz de cristales de zafiro (precios por variantes representativas)

| Producto/Variante                                  | Tipo/Forma           | Grosor  | Diámetro (ejemplos)        | SKU         | Precio   |
|----------------------------------------------------|----------------------|---------|----------------------------|-------------|----------|
| CKES 1.00 Planos                                   | Plano                | 1.00 mm | 13.0–25.5 mm               | CKES.13.0   | $11.00   |
| CKES 1.00 Planos                                   | Plano                | 1.00 mm | 26.0–31.5 mm               | CKES.26.0   | $14.00   |
| CKES 1.00 Planos                                   | Plano                | 1.00 mm | 32.0–33.5 mm               | CKES.32.0   | $17.00   |
| CKES 1.00 Planos                                   | Plano                | 1.00 mm | 34.0–35.0 mm               | CKES.34.0   | $20.00   |
| DSAPH Abovedados Redondos                          | Abovedado redondo    | —       | 24.0–25.0 mm               | DSAPH.24.0  | $34.00   |
| DSAPH Abovedados Redondos                          | Abovedado redondo    | —       | 27–28.5 mm                 | DSAPH.27.0  | $37.00   |
| DSAPH Abovedados Redondos                          | Abovedado redondo    | —       | 32.5–34.5 mm               | DSAPH.32.5  | $44.50   |
| SAPH 0.80 Planos                                   | Plano                | 0.80 mm | 15.0–18.9 mm               | SAPH.15.0   | $16.00   |
| SAPH 0.80 Planos                                   | Plano                | 0.80 mm | 19.0–21.5 mm               | SAPH.19.0   | $17.00   |
| SAPH 0.80 Planos                                   | Plano                | 0.80 mm | 21.6–23.9 mm               | SAPH.21.6   | $18.00   |
| SAPH 0.80 Planos                                   | Plano                | 0.80 mm | 24.0–32.0 mm               | SAPH.24.0   | $19.00   |
| SAPHM 1.50 Planos Redondos                         | Plano redondo        | 1.50 mm | 16.0–28.0 mm               | SAPHM.16.0  | $19.00   |
| SAPHM 1.50 Planos Redondos                         | Plano redondo        | 1.50 mm | 28.5–31.0 mm               | SAPHM.28.5  | $20.00   |
| SAPHM 1.50 Planos Redondos                         | Plano redondo        | 1.50 mm | 31.5–34.0 mm               | SAPHM.31.5  | $23.00   |
| SAPHM 1.50 Planos Redondos                         | Plano redondo        | 1.50 mm | 34.5–35.0 mm               | SAPHM.34.5  | $23.00   |
| SAPHM 1.50 Planos Redondos                         | Plano redondo        | 1.50 mm | 35.5–36.0 mm               | SAPHM.35.5  | $30.00   |
| SAPHM 1.50 Planos Redondos                         | Plano redondo        | 1.50 mm | 36.5–37.0 mm               | SAPHM.36.5  | $30.00   |
| SAPHM 1.50 Planos Redondos                         | Plano redondo        | 1.50 mm | 37.5–38.0 mm               | SAPHM.37.5  | $35.00   |
| SSAPH 0.95 Planos con borde plateado               | Plano                | 0.95 mm | —                          | SSAPH.35.0  | $40.00   |
| TKSAPH (variantes)                                 | Plano (inferido)     | 2.0 mm  | 18.0–28.5 mm               | TKSAPH.18.0 | $20.00   |
| TKSAPH (variantes)                                 | Plano (inferido)     | 2.0 mm  | 29.0–31.5 mm               | TKSAPH.29.0 | $25.00   |
| TKSAPH (variantes)                                 | Plano (inferido)     | 2.0 mm  | 32.0–34.5 mm               | TKSAPH.32.0 | $30.00   |
| TKSAPH (variantes)                                 | Plano (inferido)     | 2.0 mm  | 35.0–35.5 mm               | TKSAPH.35.0 | $35.00   |
| TKSAPH (variantes)                                 | Plano (inferido)     | 2.0 mm  | 36.0–37.0 mm               | TKSAPH.36.0 | $40.00   |
| Surtido CKES 1.00mm (hasta 200 cristales)         | Surtido              | 1.00 mm | —                          | 900.049     | $65.95   |

Observaciones: la disponibilidad “en línea y en almacén” y la opción de recargas sugieren capacidad de respuesta frente a demanda variable; la granularidad de grosores y diámetros es esencial para asegurar compatibilidad con cajas y calibres. [^7]

### Cajas, esferas, manecillas y otros componentes

GoTop opera como proveedor mayorista de componentes y piezas, con oferta de movimientos, cajas en 316L, esferas, coronas, biseles, cristales (zafiro y mineral) y correas en múltiples acabados; no publica precios, por lo que requiere contacto para condiciones mayoristas. Sollier Lemarchand se posiciona como proveedor de diales de alta calidad, con opciones de impresión gruesa y curvada; no se publican precios ni APIs públicas. [^10] [^19]

Tabla 11. Ficha técnica resumida de cajas y cristales (GoTop)

| Categoría | Atributos destacados                                                                                            |
|-----------|------------------------------------------------------------------------------------------------------------------|
| Cajas     | Materiales: acero 316L; estilos: bisel pulido/cepillado, corona arenada, válvula de helio, 10 ATM; formas: redondas, rectangulares; acabados: pulido/cepillado, bicolor. |
| Cristales | Zafiro curvado; cristal mineral plano; compatibilidad con cajas modernas.                                       |
| Esferas   | Colores: oro, negro mate; acabados: dos capas, prensado al aceite.                                              |
| Correas   | Anchuras: 12–26 mm; materiales: acero (Oyster, Jubilee, milanés), cuero (grano completo, patrón cocodrilo), silicona; cierres: seguridad, liberación rápida.              |
| Movimientos | Miyota (JS/0S/6P); Seiko (VD cronógrafos; 0S cronógrafos).                                                      |

Interpretación: el detalle de atributos (materiales, resistencias, acabados) permite establecer atributos normalizados para ERP/PIM y controlar la estética y compatibilidad técnica en ensamblaje. [^10]

### Correas y pulseras (cuero, silicona, acero)

Joyawatch publica precios de referencia para correas de cuero con variaciones de materiales y cierres, además de opciones OEM y métodos de pago (PayPal, Alipay, transferencia, Western Union). [^10]

Tabla 12. Precios de referencia de correas de cuero (Joyawatch)

| Producto (SKU)                            | Precio unitario | Notas                                 |
|-------------------------------------------|-----------------|----------------------------------------|
| JY93010 – Cuero de vaca                   | $2.89           | Personalizable (estilo/color/hebilla)  |
| JY93013 – Cuero de vaca suave             | $2.98           | —                                      |
| JY93006 – Varios colores brillante        | $2.69           | —                                      |
| JY93033 – Piel de vacuno, cierre mariposa | $5.36           | —                                      |
| JY93036 – Piel de vacuno, cierre mariposa | $5.39           | —                                      |
| JY93035 – Cuero genuino, cierre mariposa  | $5.38           | —                                      |
| JY93037 – Cuero genuino, cierre mariposa  | $5.29           | —                                      |
| JY93028 – Cuero de vaca grano completo    | $3.89           | —                                      |
| JY93025 – Cuero de vaca genuino           | $3.79           | —                                      |
| JY93027 – Cuero de vaca genuino           | $3.79           | —                                      |
| JY93021 – Grano completo genuino          | $3.79           | —                                      |
| JY93007 – Varios colores                  | $2.69           | —                                      |

Lectura: los precios unitarios indican una banda accesible para cadenas de suministro orientadas a volumen y personalización. Métodos de pago多样化 facilitan la operativa internacional. [^10]

## Integraciones ERP/eCommerce y modelos operativos

Las plataformas y el middleware citados cubren tres necesidades esenciales: integración ERP, sincronización de catálogo/inventario/pedidos y habilitación de experiencias B2B. Brandscope se integra con ERPs y expone inventario en tiempo real; SUN FACET ofrece módulos específicos de reloj (retail, wholesale, RFID); API2Cart unifica la conectividad con eCommerce y marketplaces; SparkLayer habilita una capa B2B con reglas y pagos complejos; WatchDealerInventory provee una API operativa para inventario y ofertas B2B; y la API de Watch Database en Apify aporta especificaciones e imágenes para enriquecer fichas técnicas. [^5] [^9] [^11] [^12] [^4] [^2]

Tabla 13. Matriz de capacidades de integración

| Solución/Plataforma     | ERP/Catálogo                    | Inventario en tiempo real | Pedidos                      | Imágenes 360° | Pagos B2B     | Observaciones                                    |
|-------------------------|---------------------------------|----------------------------|------------------------------|---------------|---------------|--------------------------------------------------|
| Brandscope              | API/CSV/híbrido con ERP         | Sí                         | Pre-reserva y reabastecimiento | Sí (ORB360)   | Sí (Stripe)   | Multi-moneda/idioma; seguridad AWS. [^5]         |
| SUN FACET (ERP)         | Módulos reloj (retail/wholesale)| Sí (RFID/códigos de barras)| Gestión a granel, consignación| —             | —             | Atributos específicos de relojes. [^9]           |
| API2Cart                | Catálogo e imágenes             | Sí                         | Sí (automatización)          | —             | —             | 60+ plataformas; webhooks; Bridge. [^11]         |
| SparkLayer              | Conecta con back-office/ERP     | Soporte de pre-pedidos     | Sí (reglas y agentes)        | —             | Sí (net terms)| Capa B2B sobre eCommerce; API. [^12] [^13]       |
| WatchDealerInventory    | —                               | —                          | Ofertas B2B (GET/POST)       | —             | —             | API con rate limits; SDKs. [^4]                  |
| Apify Watch Database    | Especificaciones/imágenes       | —                          | —                            | —             | —             | API en mantenimiento; precio por resultados. [^2] [^3] |

Conclusión: un modelo operativo combinado puede usar Brandscope como portal B2B con ERP e imágenes 360°, API2Cart para sincronizar con eCommerce y marketplaces, y SparkLayer para reglas B2B avanzadas sobre la tienda; WatchDealerInventory provee un núcleo operativo para inventario y ofertas.

## Disponibilidad, MOQs y condiciones de pago

La evidencia pública ofrece señales de disponibilidad y algunos métodos de pago, pero no MOQs ni listas de precios por volumen para la mayoría de proveedores. Cas-Ker declara cristales disponibles en línea y en almacén, con recargas de surtidos. Joyawatch muestra métodos de pago多样化 (PayPal, Alipay, transferencia, Western Union). Perrin indica proceso de verificación B2B y catálogos con precios personalizados. [^7] [^10] [^8]

Tabla 14. Condiciones comerciales observadas

| Proveedor        | Disponibilidad/Señal            | MOQs publicados | Métodos de pago (evidencia)                    | Notas                                           |
|------------------|---------------------------------|-----------------|-----------------------------------------------|------------------------------------------------|
| Cas-Ker          | En línea y en almacén; recargas | No              | No especificado                                 | Surtidos de hasta 200 cristales; rechazos disponibles. [^7] |
| Joyawatch        | —                               | No              | PayPal, Alipay, transferencia, Western Union   | Precios unitarios de referencia en cuero. [^10] |
| Perrin (B2B)     | Catálogos personalizados        | No              | No especificado                                 | Registro B2B; seguridad de login con código. [^8] |

Recomendación: contactar a proveedores (Esslinger, GoTop, Sollier Lemarchand, entre otros) para confirmar MOQs, precios por volumen y términos de pago; solicitar acceso B2B donde aplique (Perrin) y alinear reglas de pedido y pagos en la capa B2B (SparkLayer).

## Imágenes y especificaciones técnicas de productos

Para enriquecer el catálogo, Brandscope integra imágenes 360° vía ORDRE (ORB360) y expone una API de producto para envío de imágenes. La API “Watch Database” en Apify ofrece especificaciones detalladas e imágenes de relojes, útil para calibres, movimientos y atributos técnicos. [^5] [^2] [^3]

Tabla 15. Fuentes de contenido visual y técnico

| Fuente                         | Tipo de contenido                 | Licencia/uso (resumen)         | Observaciones                              |
|--------------------------------|-----------------------------------|---------------------------------|--------------------------------------------|
| Brandscope (API de producto)   | Imágenes producto (incluye 360°)  | No especificado                 | Integración con ORB360; API de producto. [^5] |
| Apify – Watch Database         | Especificaciones, imágenes reloj  | Términos generales Apify        | API en mantenimiento; precio por resultados. [^2] [^3] |

Riesgos/licencias: es necesario revisar términos de uso de imágenes y derechos de reproducción en cada plataforma, especialmente al combinar activos de diferentes fuentes en tiendas y marketplaces.

## Análisis comparativo y selección de proveedores/APIs

El análisis cruza criterios de catálogo, precios, disponibilidad, integración, soporte y costos/términos. Las conclusiones priorizan rutas de integración que minimicen fricción y maximicen visibilidad.

Tabla 16. Scorecard comparativo (evaluación relativa con base en evidencia pública)

| Solución/Proveedor     | Catálogo/Componentes | Precios públicos | Disponibilidad/Stock | Integración (ERP/eCommerce) | Soporte/SDKs | Términos/Costos (visibilidad) |
|------------------------|----------------------|------------------|----------------------|-----------------------------|-------------|-------------------------------|
| Brandscope             | Alto (sectorial)     | No               | Alto (tiempo real)   | Alto (ERP nativo, 360°)     | Alto        | Medio (planes no publicados)  |
| API2Cart               | Medio (middleware)   | N/A              | Alto (tiempo real)   | Alto (60+ plataformas)      | Alto        | Medio (precio/TCO externos)   |
| SparkLayer             | Medio (capa B2B)     | N/A              | Medio/Alto (pre-pedidos) | Alto (sobre eCommerce)   | Alto        | Alto (desde $49; prueba)      |
| WatchDealerInventory   | Medio (operativa)    | N/A              | —                    | Medio (API operativa)       | Alto        | Medio (rate limits publicados)|
| S.T. Supply (Ronda)    | Alto (movimientos)   | Alto             | Medio (listados)     | Bajo (sin API)              | —           | Alto (precios visibles)       |
| Cas-Ker (zafiro)       | Alto (cristales)     | Alto             | Alto (en almacén)    | Bajo (sin API)              | —           | Alto (precios visibles)       |
| Joyawatch (correas)    | Alto (correas)       | Alto             | —                    | Bajo (sin API)              | —           | Alto (precios visibles)       |

Lectura: para operación integral B2B con activos visuales y sincronización ERP, Brandscope es el núcleo; API2Cart y SparkLayer completan la conectividad con tiendas y reglas comerciales; para componentes con precios públicos, S.T. Supply y Cas-Ker aportan referencia y disponibilidad inmediata. [^5] [^11] [^12] [^4] [^6] [^7] [^10]

Criterios de decisión:

- Necesidades API-first: disponibilidad de endpoints operativos y límites de tarifa para automatizar inventarios y ofertas.
- Inventario en tiempo real: integración ERP y sincronización con eCommerce y marketplaces.
- Cobertura de categorías: amplitud de movimientos, cristales y correas, y profundidad de atributos técnicos.
- Costos/planes: visibilidad de precios y TCO; pruebas y onboarding.
- Soporte y SDKs: facilidad de integración y mantenimiento.

## Riesgos, cumplimiento y seguridad

Las integraciones sobre plataformas SaaS requieren atención a seguridad y cumplimiento. Brandscope opera sobre AWS con estándares y programas de cumplimiento; API2Cart ofrece acceso cifrado y opciones Bridge para conexiones directas; SparkLayer habilita pagos B2B y reglas de crédito con soporte enterprise; WatchDealerInventory publica rate limits, pero los términos completos no están presentes en lo extraído. [^5] [^11] [^12] [^4]

Tabla 17. Checklist de seguridad y cumplimiento

| Aspecto                         | Evidencia (fuente)                   | Acción recomendada                                       |
|---------------------------------|--------------------------------------|----------------------------------------------------------|
| Seguridad cloud (AWS)           | Programas de cumplimiento AWS [^5]   | Validar certificaciones vigentes; pedir reporte SOC/ISO. |
| Autenticación API               | API Key/OAuth (WatchDealerInventory) [^4] | Usar OAuth donde sea posible; rotar claves; scopes mínimos. |
| Cifrado y conexiones            | Acceso cifrado y Bridge (API2Cart) [^11]  | Evaluar necesidad de Bridge; revisar cifrado en tránsito.  |
| Pagos B2B                       | Stripe (Brandscape); net terms (SparkLayer) [^5] [^12] | Cumplir PCI-DSS; segregar datos de pago; gestionar fraude. |
| Términos de uso de datos/imágenes | Términos generales Apify [^3]       | Revisar derechos de uso de activos; registrar licencias.  |

## Recomendaciones y plan de acción

Secuencia de integración sugerida:

1) Núcleo B2B sectorial. Adoptar Brandscope para integrar ERP, disponer de inventario en tiempo real y habilitar imágenes 360° (ORB360), con pagos B2B (Stripe). [^5]  
2) Unificación eCommerce/marketplaces. Integrar API2Cart para sincronizar catálogo, inventario y pedidos con 60+ plataformas, con webhooks y opción Bridge cuando se requiera conexión directa. [^11]  
3) Capa B2B sobre la tienda. Desplegar SparkLayer sobre el eCommerce existente para reglas de precios por cliente, pagos por términos netos, límites de crédito y soporte de agentes de ventas; usar la API para personalización. [^12] [^13]  
4) Operación de inventario y ofertas. Complementar con WatchDealerInventory para gestión de inventario y ofertas B2B, utilizando autenticación OAuth y planes con rate limits adecuados. [^4]  
5) Enriquecimiento técnico. Emplear Apify Watch Database (cuando esté disponible) para especificaciones e imágenes de calibres y modelos. [^2] [^3]

Hoja de ruta de pruebas:

- Piloto con una categoría (ej. cristales de zafiro): definir atributos normalizados (tipo, grosor, diámetro), sincronizar stock con API2Cart, habilitar reglas B2B en SparkLayer y activar compra de reabastecimiento en Brandscope.  
- Validación de imágenes 360°: integrar ORB360 vía Brandscope, verificar rendimiento visual y tiempos de carga. [^5]  
- Gestión de pagos B2B: habilitar Stripe en Brandscape y términos netos en SparkLayer; ejecutar pruebas de cobro y conciliación. [^5] [^12]

Gobernanza de datos y monitoreo:

- Normalización de atributos: materiales, grosores, diámetros, resistencias, acabados, tipos de cierre.  
- Métricas: exactitud de stock, latencia de sincronización, pedidos procesados por hora, tasa de error de endpoints.  
- Auditoría de accesos: rotación de claves OAuth/API, revisión de scopes y logs de integraciones.

Tabla 18. Roadmap de implementación

| Fase                     | Entregables clave                                           | Responsables           | KPIs principales                         |
|--------------------------|-------------------------------------------------------------|------------------------|------------------------------------------|
| Piloto (Brandscope)      | Integración ERP; inventario en tiempo real; 360°            | Integraciones/TI       | Latencia de stock; % pedidos autofill    |
| Middleware (API2Cart)    | Conectores eCommerce; sincronización catálogo/inventario/pedidos | Integraciones/TI       | % tiendas conectadas; overselling=0      |
| Capa B2B (SparkLayer)    | Listas por cliente; reglas de pedido; pagos netos           | eCommerce/Comercial    | Tasa de conversión B2B; AOV B2B          |
| Operaciones (WDI API)    | Endpoints inventario; ofertas B2B                           | Operaciones/TI         | Solicitudes/hora; errores por millón     |
| Contenido (Apify)        | Especificaciones e imágenes de relojes                      | Producto/Contenido     | % fichas con spec completa               |

## Anexos: endpoints y referencias

Tabla 19. Endpoints y parámetros – WatchDealerInventory

| Método | Ruta              | Parámetros (ejemplos)                                         |
|--------|-------------------|----------------------------------------------------------------|
| GET    | /api/inventory    | page, limit, status                                           |
| POST   | /api/inventory    | make, model, reference, price, condition                      |
| GET    | /api/deals        | status, dealer_id                                             |
| POST   | /api/deals        | buyer_id, seller_id, items, offer_price                       |
| GET    | /api/public-links | item_id, expires_in                                           |

Autenticación: API Key y OAuth 2.0; rate limits: Free (100/h), Pro (1.000/h), Enterprise (10.000/h). [^4]

Tabla 20. Endpoints y parámetros – Apify Watch Database

| Método/Endpoint                                                | Parámetros (ejemplos)                              |
|----------------------------------------------------------------|----------------------------------------------------|
| POST/GET: Ejecutar Actor                                       | watchId, makeId, modelId, familyId, page, limit   |
| POST/GET: Ejecutar y obtener dataset (sync)                    | Igual que arriba (POST con payload de entrada)     |
| GET: Obtener Actor                                             | token                                              |

Modelo de costo: precio por resultados; estado: en mantenimiento; requiere token Apify. [^2] [^3]

Tabla 21. Tablas de precios de componentes

- Movimientos Ronda (S.T. Supply): ver Tabla 8. [^6]  
- Cristales de zafiro (Cas-Ker): ver Tabla 10. [^7]  
- Correas de cuero (Joyawatch): ver Tabla 12. [^10]

## Referencias

[^1]: Perrin Supply Ltd – Wholesale. https://perrinwatchparts.com/en-us/pages/wholesale  
[^2]: Apify – Watch Database API. https://apify.com/making-data-meaningful/watch-database/api  
[^3]: Apify – Términos generales. https://docs.apify.com/legal/general-terms-and-conditions  
[^4]: WatchDealerInventory – API Documentation. https://watchdealerinventory.com/api  
[^5]: Brandscope – B2B para la industria relojera y joyera. https://brandscope.com/watch-and-jewellery-industry/  
[^6]: S.T. Supply – Movimientos Ronda (catálogo y precios). https://www.stsupply.com/watch-parts/movements/ronda-movements.html  
[^7]: Cas-Ker – Cristales de zafiro (precios y especificaciones). https://www.jewelerssupplies.com/SapphireCrystals.html  
[^8]: Perrin – Inicio. https://perrinwatchparts.com/en-us  
[^9]: SUN FACET ERP para relojería (Suntech). https://www.suntech-global.com/watches/  
[^10]: Joyawatch – Correas de cuero al por mayor y OEM (precios y pagos). https://www.joyawatch.com/product-category/watch-bands-by-material/wholesale-oem-leather-watch-straps-bands/  
[^11]: API2Cart – Integración API para plataformas B2B. https://api2cart.com/use-cases/b2b-wholesale-platform-api-integration/  
[^12]: SparkLayer – Plataforma B2B para eCommerce. https://www.sparklayer.io/  
[^13]: SparkLayer – Documentación de la API. https://docs.sparklayer.io/sparklayer-api  
[^14]: Cleo – Integración API para distribución mayorista. https://www.cleo.com/blog/api-integration-wholesale-distribution  
[^15]: Miyota – Sitio oficial de movimientos. https://miyotamovement.com/  
[^16]: Ronda – Movimientos de cuarzo (sitio oficial). https://www.ronda.ch/en/quartz-movements  
[^17]: Perrin – Movimientos Seiko. https://perrinwatchparts.com/en-us/collections/seiko-watch-movements  
[^18]: Perrin – Movimientos Ronda. https://perrinwatchparts.com/en-us/collections/rond-quartz-watch-movements  
[^19]: Sollier Lemarchand – Proveedor de esferas. https://www.sollierlemarchand.com/en/watch-parts-supplier/watch-dials-supplier/
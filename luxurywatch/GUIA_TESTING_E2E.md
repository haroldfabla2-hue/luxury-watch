# Guía de Testing E2E - LuxuryWatch

**URL de Prueba:** https://ap5y2066a1jl.space.minimax.io  
**Duración Estimada:** 45 minutos  
**Requisitos:** Navegador moderno (Chrome/Firefox/Safari)

---

## Objetivo

Verificar que todo el flujo de usuario funciona correctamente de principio a fin:
Landing → Configurador → Autenticación → Carrito → Checkout → Pago → Confirmación

---

## Pre-requisitos

**Antes de empezar:**
- [ ] Stripe debe estar configurado (claves API proporcionadas)
- [ ] Abrir DevTools (F12) en pestaña Console para monitorear errores
- [ ] Tener a mano tarjeta de prueba: `4242 4242 4242 4242`

---

## Test 1: Landing Page (5 minutos)

### Objetivo
Verificar que la landing page carga correctamente y todas las secciones son funcionales.

### Pasos:

1. **Abrir Landing**
   - URL: https://ap5y2066a1jl.space.minimax.io
   - Verificar que carga sin errores
   - Consola (F12) debe estar limpia

2. **Verificar Navegación**
   - [ ] Logo "LuxuryWatch" es visible
   - [ ] Menú de navegación funciona
   - [ ] Botones CTA son clicables

3. **Scroll por Secciones**
   - [ ] Hero section con título y CTA
   - [ ] Value Proposition (4 features)
   - [ ] Materials Showcase (3 materiales)
   - [ ] Customization Process (timeline)
   - [ ] Technology Showcase (3D + AR + ROI)
   - [ ] Trends Inspiration
   - [ ] Competitive Edge (tabla)
   - [ ] CTA Final
   - [ ] Footer completo

4. **Probar CTA Principal**
   - Clic en "Diseña Tu Reloj" o similar
   - Debe redirigir a: /configurador

**Resultado Esperado:**
- ✓ Todas las secciones cargadas
- ✓ Imágenes visibles
- ✓ Textos legibles
- ✓ CTAs funcionando
- ✓ Redirección correcta a configurador

---

## Test 2: Configurador 3D (10 minutos)

### Objetivo
Verificar que el configurador 3D funciona correctamente con todas sus opciones.

### Pasos:

1. **Cargar Configurador**
   - URL: https://ap5y2066a1jl.space.minimax.io/configurador
   - Verificar que modelo 3D carga (NO pantalla en blanco)
   - Modelo de reloj debe ser completamente visible

2. **Verificar Consola**
   - [ ] NO debe aparecer: "Multiple instances of Three.js"
   - [ ] NO debe aparecer: "model-viewer has already been used"
   - [ ] Sin errores críticos en rojo

3. **Probar Controles 3D**
   - **Rotación:** Clic + arrastrar sobre modelo
     - [ ] Reloj rota suavemente en todas direcciones
   - **Zoom:** Scroll del mouse
     - [ ] Modelo se acerca/aleja correctamente
   - **Pan:** Clic derecho + arrastrar (opcional)
     - [ ] Modelo se mueve horizontal/verticalmente

4. **Personalizar Reloj - Material**
   - Seleccionar "Oro 18k"
     - [ ] Modelo cambia a color dorado instantáneamente
     - [ ] Precio se actualiza
   - Seleccionar "Titanio Grado 5"
     - [ ] Modelo cambia a color gris metálico
     - [ ] Precio se actualiza

5. **Personalizar Reloj - Esfera**
   - Seleccionar "Azul Océano"
     - [ ] Dial cambia a azul
   - Seleccionar "Negra Sunburst"
     - [ ] Dial cambia a negro con efecto sunburst

6. **Personalizar Reloj - Correa**
   - Seleccionar "Cuero Marrón"
     - [ ] Correa cambia a textura de cuero marrón
   - Seleccionar "Metal Acero"
     - [ ] Correa cambia a eslabones metálicos

7. **Verificar Resumen de Configuración**
   - Panel lateral debe mostrar:
     - [ ] Material seleccionado
     - [ ] Esfera seleccionada
     - [ ] Correa seleccionada
     - [ ] Precio total actualizado

8. **Probar Botón AR (Opcional)**
   - Clic en "Ver AR"
     - [ ] Modal AR se abre
     - [ ] Mensaje de instrucciones visible
     - (Testing completo de AR en Test 7)

9. **Añadir al Carrito**
   - Clic en "Añadir al Carrito - €X,XXX"
     - [ ] Sidebar del carrito se abre desde la derecha
     - [ ] Configuración aparece en el carrito
     - [ ] Cantidad: 1
     - [ ] Precio correcto

**Resultado Esperado:**
- ✓ Modelo 3D visible y funcional
- ✓ Controles responden correctamente
- ✓ Personalización actualiza en tiempo real
- ✓ Precio se calcula correctamente
- ✓ Carrito recibe el item

---

## Test 3: Carrito de Compras (5 minutos)

### Objetivo
Verificar que el carrito gestiona correctamente los items.

### Pasos:

1. **Abrir Carrito**
   - Clic en icono de carrito (esquina superior derecha)
   - [ ] Sidebar se abre con animación

2. **Verificar Item Agregado**
   - [ ] Reloj personalizado aparece en la lista
   - [ ] Imagen/icono del reloj
   - [ ] Descripción: Material, Esfera, Correa
   - [ ] Precio unitario correcto
   - [ ] Cantidad: 1

3. **Modificar Cantidad**
   - Clic en botón "+" para aumentar cantidad
     - [ ] Cantidad aumenta a 2
     - [ ] Subtotal se duplica
   - Clic en botón "-" para reducir cantidad
     - [ ] Cantidad vuelve a 1
     - [ ] Subtotal vuelve al original

4. **Añadir Segundo Item**
   - Cerrar carrito
   - Volver al configurador
   - Cambiar configuración (ej: cambiar a Cerámica)
   - Añadir al carrito
     - [ ] Carrito ahora tiene 2 items diferentes

5. **Eliminar Item**
   - Clic en icono de basura/eliminar en un item
     - [ ] Item se elimina del carrito
     - [ ] Total se recalcula

6. **Verificar Total**
   - [ ] Subtotal correcto
   - [ ] IVA (21%) calculado correctamente
   - [ ] Total = Subtotal + IVA

7. **Proceder a Checkout**
   - Clic en "Proceder al Pago" o similar
     - [ ] Redirección a página de checkout

**Resultado Esperado:**
- ✓ Carrito gestiona múltiples items
- ✓ Cantidades se actualizan correctamente
- ✓ Totales se calculan bien
- ✓ Eliminar items funciona
- ✓ Redirección a checkout exitosa

---

## Test 4: Autenticación (10 minutos)

### Objetivo
Verificar que el sistema de autenticación funciona correctamente.

### Pasos:

1. **Registro de Usuario Nuevo**
   - En checkout (o clic en "Login" en menú)
   - Clic en "Registrarse" o "Crear cuenta"
   - Rellenar formulario:
     - Email: `test_luxurywatch_$(fecha)@example.com` (usar email temporal)
     - Contraseña: `Test123456!`
     - Confirmar contraseña: `Test123456!`
   - Clic en "Registrarse"
   - [ ] Se crea cuenta exitosamente
   - [ ] Mensaje de confirmación (puede pedir verificar email)
   - [ ] Usuario queda logueado automáticamente

2. **Verificar Estado Logueado**
   - [ ] Menú muestra email del usuario o nombre
   - [ ] Botón "Login" cambia a "Perfil" o email

3. **Cerrar Sesión**
   - Clic en menú de usuario
   - Clic en "Cerrar Sesión" o "Logout"
   - [ ] Sesión se cierra
   - [ ] Redirección a home o se muestra "Login"

4. **Iniciar Sesión con Usuario Existente**
   - Clic en "Iniciar Sesión" o "Login"
   - Rellenar:
     - Email: `test_luxurywatch_...@example.com`
     - Contraseña: `Test123456!`
   - Clic en "Iniciar Sesión"
   - [ ] Login exitoso
   - [ ] Usuario logueado
   - [ ] Redirección correcta

5. **Probar Login Incorrecto**
   - Intentar login con contraseña incorrecta
   - [ ] Mensaje de error: "Credenciales incorrectas" o similar
   - [ ] No se inicia sesión

6. **Persistencia de Sesión**
   - Con sesión iniciada, recargar página (F5)
   - [ ] Usuario sigue logueado
   - [ ] No pide login de nuevo

**Resultado Esperado:**
- ✓ Registro funciona correctamente
- ✓ Login funciona con credenciales correctas
- ✓ Logout funciona
- ✓ Sesión persiste tras recargar
- ✓ Errores se manejan correctamente

---

## Test 5: Checkout (5 minutos)

### Objetivo
Verificar que el formulario de checkout funciona correctamente.

### Pasos:

1. **Acceder a Checkout**
   - Con items en el carrito, clic en "Proceder al Pago"
   - URL debe ser: /checkout
   - [ ] Página de checkout carga correctamente

2. **Verificar Resumen del Pedido**
   - [ ] Lista de items del carrito visible
   - [ ] Cantidades correctas
   - [ ] Precios correctos
   - [ ] Subtotal correcto
   - [ ] IVA (21%) correcto
   - [ ] Total correcto

3. **Rellenar Datos de Envío**
   - Nombre completo: `Juan Pérez Test`
   - Email: (debe estar pre-llenado si está logueado)
   - Teléfono: `+34 600 123 456`
   - Dirección: `Calle Mayor 123`
   - Ciudad: `Madrid`
   - Código Postal: `28013`
   - País: `España` (puede estar pre-seleccionado)
   - [ ] Todos los campos aceptan datos
   - [ ] Validación muestra errores si falta algo

4. **Verificar Stripe Elements Carga**
   - [ ] Formulario de tarjeta de Stripe aparece
   - [ ] Tiene campos: Número de tarjeta, Fecha, CVV
   - [ ] Diseño coincide con tema de LuxuryWatch (dorado)

**Resultado Esperado:**
- ✓ Checkout carga correctamente
- ✓ Resumen del pedido es correcto
- ✓ Formulario acepta datos
- ✓ Stripe Elements carga

---

## Test 6: Pago con Stripe (10 minutos)

### Objetivo
Verificar que el flujo de pago funciona de principio a fin.

### Pre-requisito
**CRÍTICO:** Stripe debe estar configurado con claves API válidas.

### Pasos:

1. **Preparar Datos de Pago**
   - Tarjeta de prueba Stripe:
     - Número: `4242 4242 4242 4242`
     - Fecha: Cualquier futura (ej: `12/26`)
     - CVV: Cualquier 3 dígitos (ej: `123`)
     - Código postal: `28013`

2. **Rellenar Stripe Payment Element**
   - Introducir número de tarjeta: `4242 4242 4242 4242`
   - Introducir fecha: `12/26`
   - Introducir CVV: `123`
   - [ ] Campos aceptan datos
   - [ ] No hay errores de validación

3. **Confirmar Pago**
   - Clic en "Pagar Ahora" o "Confirmar Pedido"
   - [ ] Botón muestra loading (spinner)
   - [ ] Botón se deshabilita para evitar doble clic
   - Esperar respuesta (puede tardar 2-5 segundos)

4. **Verificar Pago Exitoso**
   - [ ] Redirección a página de confirmación/éxito
   - [ ] Mensaje: "Pago exitoso" o similar
   - [ ] Número de pedido visible
   - [ ] Resumen del pedido visible

5. **Verificar en Stripe Dashboard**
   - Ir a: https://dashboard.stripe.com/test/payments
   - [ ] Nuevo pago aparece en la lista
   - [ ] Monto correcto
   - [ ] Estado: "Succeeded" o "Completado"
   - [ ] Metadata incluye: customer_email, user_id, cart_items_count

6. **Verificar en Base de Datos**
   - Ir a: Supabase Dashboard → Table Editor → `orders`
   - [ ] Nuevo pedido creado
   - [ ] user_id correcto
   - [ ] total_amount correcto
   - [ ] stripe_payment_intent_id presente
   - [ ] status: "pending" o "completed"
   - Ir a tabla `order_items`
   - [ ] Items del pedido creados
   - [ ] Cada item tiene: order_id, product_id, quantity, price_at_time

7. **Verificar Carrito Limpiado**
   - Abrir carrito
   - [ ] Carrito debe estar vacío
   - [ ] Mensaje: "Tu carrito está vacío"

**Resultado Esperado:**
- ✓ Pago se procesa correctamente
- ✓ Redirección a página de éxito
- ✓ Pago aparece en Stripe Dashboard
- ✓ Pedido guardado en base de datos
- ✓ Items del pedido guardados
- ✓ Carrito se limpia tras pago exitoso

---

## Test 7: Realidad Aumentada (AR) - Preparación (5 minutos Desktop)

### Objetivo
Verificar que la funcionalidad AR carga en desktop (testing completo requiere móvil).

### Pasos (Desktop):

1. **Acceder a Configurador**
   - URL: https://ap5y2066a1jl.space.minimax.io/configurador

2. **Localizar Botón AR**
   - [ ] Botón "Ver AR" es visible
   - [ ] Está habilitado (no deshabilitado)

3. **Abrir Modal AR**
   - Clic en "Ver AR"
   - [ ] Modal AR se abre con animación
   - [ ] Fondo oscuro (overlay)
   - [ ] Título: "Vista de Realidad Aumentada"

4. **Verificar Contenido del Modal**
   - [ ] Área de visualización 3D visible
   - [ ] Instrucciones de uso visibles
   - [ ] Botón "X" para cerrar modal

5. **Verificar model-viewer**
   - Inspeccionar consola (F12)
   - [ ] NO debe aparecer: "model-viewer has already been used"
   - [ ] Model-viewer carga desde CDN correctamente

6. **Cerrar Modal**
   - Clic en "X" o fuera del modal
   - [ ] Modal se cierra
   - [ ] Vuelve al configurador normal

**Nota:** El testing completo de AR (colocar modelo en entorno real) requiere dispositivo móvil con iOS 12+ o Android con ARCore. Ver sección siguiente.

**Resultado Esperado:**
- ✓ Botón AR visible y funcional
- ✓ Modal AR se abre/cierra correctamente
- ✓ Model-viewer carga sin errores
- ✓ Instrucciones visibles

---

## Test 8: Responsive Design (5 minutos)

### Objetivo
Verificar que el sitio funciona en diferentes tamaños de pantalla.

### Pasos:

1. **Abrir DevTools**
   - Presionar F12
   - Clic en icono de "Device Mode" (📱) o Ctrl+Shift+M

2. **Probar Viewport Móvil (375px)**
   - Seleccionar "iPhone SE" o similar
   - [ ] Landing page se ve correctamente
   - [ ] Texto es legible
   - [ ] Botones son accesibles
   - [ ] No hay scroll horizontal
   - [ ] Configurador 3D funciona
   - [ ] Menú hamburguesa funciona

3. **Probar Viewport Tablet (768px)**
   - Seleccionar "iPad" o similar
   - [ ] Layout se adapta correctamente
   - [ ] Configurador ocupa buen espacio
   - [ ] Navegación funciona

4. **Probar Viewport Desktop (1920px)**
   - Cambiar a vista desktop amplia
   - [ ] Layout aprovecha el espacio
   - [ ] No hay elementos demasiado anchos
   - [ ] Diseño se ve profesional

**Resultado Esperado:**
- ✓ Sitio funciona en móvil, tablet, desktop
- ✓ Sin scroll horizontal
- ✓ Textos legibles en todos los tamaños
- ✓ Controles accesibles

---

## Checklist Final

### Funcionalidades Core
- [ ] Landing page carga correctamente
- [ ] Navegación funciona
- [ ] Configurador 3D renderiza modelo
- [ ] Controles 3D (rotación, zoom) funcionan
- [ ] Personalización actualiza en tiempo real
- [ ] Precios se calculan correctamente

### Autenticación
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Sesión persiste

### Carrito y Checkout
- [ ] Añadir items al carrito funciona
- [ ] Modificar cantidades funciona
- [ ] Eliminar items funciona
- [ ] Totales se calculan correctamente
- [ ] Checkout carga correctamente
- [ ] Formulario acepta datos

### Pagos
- [ ] Stripe Elements carga
- [ ] Pago con tarjeta de prueba funciona
- [ ] Redirección a página de éxito
- [ ] Pago aparece en Stripe Dashboard
- [ ] Pedido guardado en base de datos
- [ ] Carrito se limpia tras pago

### Realidad Aumentada
- [ ] Botón AR visible
- [ ] Modal AR se abre
- [ ] Model-viewer carga sin errores
- (Testing completo en móvil requiere dispositivo real)

### Responsive
- [ ] Funciona en móvil
- [ ] Funciona en tablet
- [ ] Funciona en desktop

---

## Errores Comunes y Soluciones

### Error 1: Configurador 3D muestra pantalla en blanco
**Solución:** Verificar consola (F12). Si aparece "Multiple instances of Three.js", reportar inmediatamente.

### Error 2: Stripe Elements no carga
**Solución:** Verificar que las claves API de Stripe están configuradas correctamente.

### Error 3: Pago falla con error
**Solución:** 
- Verificar que usas tarjeta de prueba: `4242 4242 4242 4242`
- Revisar consola para mensajes de error
- Verificar en Supabase Edge Functions logs

### Error 4: Pedido no se guarda en base de datos
**Solución:**
- Verificar que edge function `create-payment-intent` está desplegado
- Revisar logs de edge function en Supabase Dashboard

---

## Resultado Esperado

**Si todos los tests pasan:**
- ✓ Sitio 100% funcional
- ✓ Listo para producción
- ✓ Todos los módulos funcionan juntos sin fisuras

**Si hay fallos:**
- Documentar exactamente qué test falló
- Capturar screenshot de consola (F12)
- Reportar paso específico que causó el error

---

## Tiempo Total Estimado

- Test 1 (Landing): 5 min
- Test 2 (Configurador): 10 min
- Test 3 (Carrito): 5 min
- Test 4 (Autenticación): 10 min
- Test 5 (Checkout): 5 min
- Test 6 (Pago): 10 min
- Test 7 (AR Desktop): 5 min
- Test 8 (Responsive): 5 min

**Total: 55 minutos**

---

**Creado por:** MiniMax Agent  
**Fecha:** 2025-11-05 05:00:57  
**Versión:** 1.0 - Guía E2E Completa

# 🔐 Guía de Configuración de Stripe para LuxuryWatch

## ⚠️ CRÍTICO: Claves API Requeridas

Para que el sistema de pagos funcione completamente, necesitas obtener y configurar las siguientes claves de Stripe:

### 📋 Claves Necesarias

#### 1. **STRIPE_PUBLISHABLE_KEY** (Cliente - Frontend)
- **Formato**: `pk_test_...` (modo test) o `pk_live_...` (modo producción)
- **Ubicación**: Frontend (variable de entorno)
- **Uso**: Inicializar Stripe.js en el navegador
- **Seguridad**: ✅ Segura para exponer públicamente

#### 2. **STRIPE_SECRET_KEY** (Servidor - Backend)
- **Formato**: `sk_test_...` (modo test) o `sk_live_...` (modo producción)
- **Ubicación**: Backend (Supabase Edge Function)
- **Uso**: Crear Payment Intents, procesar pagos
- **Seguridad**: 🔒 **NUNCA** exponer en frontend

---

## 📝 Cómo Obtener las Claves

### Paso 1: Crear Cuenta en Stripe
1. Ir a https://dashboard.stripe.com/register
2. Completar el formulario de registro
3. Verificar email

### Paso 2: Obtener Claves de Test
1. Ir a https://dashboard.stripe.com/test/apikeys
2. **Publishable Key**: Copiar el valor que empieza con `pk_test_...`
3. **Secret Key**: Click en "Reveal test key" y copiar el valor `sk_test_...`

**⚠️ IMPORTANTE**: Usa las claves de TEST primero para pruebas. Las claves LIVE solo se deben usar en producción.

### Paso 3: Configurar en LuxuryWatch

#### Frontend (STRIPE_PUBLISHABLE_KEY)

**Opción A: Variable de Entorno (.env)**
```bash
# Crear archivo .env en la raíz del proyecto
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
```

**Opción B: Hardcode Temporal (solo para testing)**
```typescript
// src/lib/stripeConfig.ts
const stripePublishableKey = 'pk_test_TU_CLAVE_AQUI'
```

#### Backend (STRIPE_SECRET_KEY)

**Configurar en Supabase Secrets**
```bash
# Desde la terminal o dashboard de Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_test_TU_CLAVE_AQUI
```

O desde el Dashboard:
1. Ir a https://supabase.com/dashboard/project/flxzobqtrdpnbiqpmjlc/settings/vault
2. Click "New Secret"
3. Name: `STRIPE_SECRET_KEY`
4. Value: `sk_test_TU_CLAVE_AQUI`
5. Click "Add Secret"

---

## 🧪 Testing de Pagos con Stripe

### Tarjetas de Prueba de Stripe

Una vez configuradas las claves, puedes probar el flujo de pago con estas tarjetas de test:

#### ✅ Tarjetas de Éxito

| Número | Tipo | Resultado |
|--------|------|-----------|
| `4242 4242 4242 4242` | Visa | Pago exitoso |
| `5555 5555 5555 4444` | Mastercard | Pago exitoso |
| `3782 822463 10005` | American Express | Pago exitoso |

**Datos adicionales para cualquier tarjeta:**
- **Fecha de expiración**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **ZIP**: Cualquier código postal válido (ej: 28001)

#### ❌ Tarjetas de Error (para testing de errores)

| Número | Resultado |
|--------|-----------|
| `4000 0000 0000 0002` | Tarjeta declinada |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0000 0000 0069` | Tarjeta expirada |

---

## 🔄 Flujo de Pago Implementado

### Proceso Completo

```mermaid
Usuario → Configurador → Carrito → Checkout → Stripe Payment Intent → Confirmación
```

**Pasos técnicos:**
1. Usuario completa configuración del reloj
2. Añade al carrito
3. Va a checkout
4. Completa formulario de envío
5. **Frontend llama a Edge Function** `create-payment-intent`
6. **Edge Function crea Payment Intent** con Stripe Secret Key
7. **Edge Function guarda orden** en tabla `orders` de Supabase
8. Frontend recibe `client_secret`
9. Usuario ingresa datos de tarjeta en **Stripe Payment Element**
10. Frontend confirma pago con `stripe.confirmPayment()`
11. Stripe procesa el pago
12. Redirección a página de confirmación
13. **Webhook de Stripe** actualiza estado de orden (opcional)

---

## 📂 Archivos Involucrados en Stripe

### Frontend
- `src/lib/stripeConfig.ts` - Configuración de Stripe
- `src/components/StripePaymentForm.tsx` - Formulario de pago
- `src/pages/CheckoutPage.tsx` - Página de checkout completa

### Backend
- `supabase/functions/create-payment-intent/index.ts` - Edge Function para crear Payment Intent

### Base de Datos
- Tabla `orders` - Almacena órdenes de compra
- Tabla `order_items` - Almacena items de cada orden

---

## ✅ Checklist de Configuración

Antes de testear pagos, verifica:

- [ ] Cuenta de Stripe creada
- [ ] Claves de Test obtenidas (`pk_test_...` y `sk_test_...`)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` configurada en `.env` o `stripeConfig.ts`
- [ ] `STRIPE_SECRET_KEY` configurada en Supabase Secrets
- [ ] Edge Function `create-payment-intent` desplegada
- [ ] Tablas `orders` y `order_items` creadas en Supabase
- [ ] Build y deploy del frontend completados

---

## 🧪 Prueba de Extremo a Extremo

### Escenario de Test Completo

1. **Acceder al configurador**
   - URL: https://9r51m9rznd4t.space.minimax.io
   - Click "Empieza a Diseñar"

2. **Configurar un reloj**
   - Seleccionar material: Oro 18K
   - Seleccionar caja: Caja Clásica
   - Seleccionar esfera: Esfera Azul
   - Seleccionar manecillas: Manecillas Bold
   - Seleccionar correa: Cuero Marrón

3. **Añadir al carrito**
   - Click "Añadir al Carrito"
   - Verificar que aparece en el sidebar del carrito
   - Precio total debe mostrarse correctamente

4. **Ir a Checkout**
   - Click "Proceder al Pago"
   - Completar formulario de envío:
     - Nombre completo
     - Email válido
     - Dirección
     - Ciudad, Código Postal, País

5. **Completar pago**
   - En la sección de pago, debería aparecer **Stripe Payment Element**
   - Ingresar tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: 12/25
   - CVC: 123
   - Click "Pagar €[monto]"

6. **Verificar resultado**
   - ✅ **Éxito**: Redirección a página de confirmación
   - ❌ **Error**: Mensaje de error específico mostrado

7. **Verificar en Stripe Dashboard**
   - Ir a https://dashboard.stripe.com/test/payments
   - Buscar el pago reciente
   - Verificar metadata (user_id, order_id, items)

8. **Verificar en Supabase**
   - Ir a tabla `orders`
   - Buscar la orden con el email del usuario
   - Verificar:
     - `payment_intent_id` está presente
     - `status` es "completed" o "pending"
     - `total_amount` es correcto
   - Ir a tabla `order_items`
   - Verificar que los items de la orden están guardados

---

## 🐛 Troubleshooting

### Problema: "Stripe no está definido"
**Solución**: Verificar que `VITE_STRIPE_PUBLISHABLE_KEY` está configurada correctamente

### Problema: "Payment Intent creation failed"
**Solución**: 
- Verificar que `STRIPE_SECRET_KEY` está en Supabase Secrets
- Revisar logs de Edge Function: `supabase functions logs create-payment-intent`

### Problema: "Invalid API Key"
**Solución**: 
- Verificar que las claves son válidas (no expiradas)
- Verificar que usas claves de TEST para testing
- Regenerar claves en Stripe Dashboard si es necesario

### Problema: "CORS Error"
**Solución**: Edge Function ya tiene CORS configurado. Si persiste, verificar headers en la respuesta.

### Problema: "Order not created in database"
**Solución**:
- Verificar que el usuario está autenticado
- Revisar permisos RLS de las tablas `orders` y `order_items`
- Verificar logs de Edge Function

---

## 🚀 Pasar a Producción

### Cuando estés listo para producción:

1. **Obtener claves LIVE de Stripe**
   - Ir a https://dashboard.stripe.com/apikeys
   - Copiar `pk_live_...` y `sk_live_...`

2. **Completar verificación de cuenta Stripe**
   - Stripe requiere verificación de identidad para modo LIVE
   - Completar el proceso en Dashboard

3. **Actualizar variables de entorno**
   - Cambiar `VITE_STRIPE_PUBLISHABLE_KEY` a clave LIVE
   - Cambiar `STRIPE_SECRET_KEY` en Supabase a clave LIVE

4. **Configurar Webhooks de Stripe** (recomendado)
   - Crear endpoint webhook en Stripe Dashboard
   - Apuntar a tu Edge Function de webhooks
   - Escuchar eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

5. **Testing final con transacciones reales**
   - Usar tarjetas de débito/crédito reales
   - Verificar que los cargos aparecen en Stripe
   - Confirmar que las órdenes se guardan correctamente

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs de Supabase Edge Functions
2. Revisar consola del navegador (F12)
3. Revisar Stripe Dashboard para errores de API
4. Consultar documentación oficial de Stripe: https://stripe.com/docs

---

## 🔗 Enlaces Útiles

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Docs**: https://stripe.com/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Supabase Project**: https://supabase.com/dashboard/project/flxzobqtrdpnbiqpmjlc
- **Edge Function URL**: https://flxzobqtrdpnbiqpmjlc.supabase.co/functions/v1/create-payment-intent

---

**✅ Una vez configuradas las claves, el sistema de pagos estará 100% funcional**

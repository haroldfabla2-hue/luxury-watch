# 🔐 Solicitud de Claves API de Stripe - CRÍTICO

## Estado: BLOQUEADOR PARA COMPLETAR EL PROYECTO

**Fecha**: 2025-11-05  
**Prioridad**: 🔴 **CRÍTICA**  
**Impacto**: Sin estas claves, el sistema de pagos no funciona

---

## ⚠️ Por Qué Son Necesarias

El código de integración con Stripe está **100% implementado**:
- ✅ Edge function `create-payment-intent` (232 líneas)
- ✅ Frontend con Stripe Elements
- ✅ Flujo completo de checkout
- ✅ Creación de órdenes en base de datos
- ✅ Manejo de errores y validaciones

**PERO** el sistema de pagos **NO PUEDE FUNCIONAR** sin las claves API reales de Stripe.

---

## 🔑 Claves Requeridas

Necesitamos **2 claves** de Stripe:

### 1. STRIPE_PUBLISHABLE_KEY (Frontend)
- **Formato**: `pk_test_...` (modo test) o `pk_live_...` (modo producción)
- **Uso**: Se usa en el navegador del cliente para crear Payment Intents
- **Seguridad**: Pública, puede exponerse en el código frontend
- **Ejemplo**: `pk_test_51ABC...xyz`

### 2. STRIPE_SECRET_KEY (Backend)
- **Formato**: `sk_test_...` (modo test) o `sk_live_...` (modo producción)
- **Uso**: Se usa en el servidor (edge function) para procesar pagos
- **Seguridad**: **CRÍTICA** - NUNCA exponer en frontend, solo en servidor
- **Ejemplo**: `sk_test_51ABC...xyz`

---

## 📋 Cómo Obtener las Claves

### Opción 1: Ya Tienes Cuenta de Stripe

1. **Login**: https://dashboard.stripe.com/login
2. **Ir a API Keys**: Dashboard → Developers → API keys
3. **Copiar claves de TEST** (recomendado para inicio):
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...` (clic en "Reveal test key")

### Opción 2: Nueva Cuenta de Stripe

1. **Registrarse**: https://dashboard.stripe.com/register
2. Completar información básica (nombre, email, contraseña)
3. **Activar cuenta de TEST** (no requiere verificación bancaria)
4. Ir a: Developers → API keys
5. Copiar las claves de TEST

**⏱️ Tiempo estimado**: 5-10 minutos (cuenta nueva)

---

## 🎯 Modo Test vs Producción

### Modo TEST (Recomendado para inicio)
- ✅ **Sin riesgo**: No se procesan pagos reales
- ✅ **Sin verificación bancaria**: Activación inmediata
- ✅ **Tarjetas de prueba**: Usar 4242 4242 4242 4242
- ✅ **Testing completo**: Probar todos los flujos

**Claves test**:
```
pk_test_51ABC...xyz
sk_test_51ABC...xyz
```

### Modo PRODUCCIÓN (Cuando estés listo)
- ⚠️ **Pagos reales**: Se cobran transacciones reales
- ⚠️ **Verificación requerida**: Stripe verifica tu identidad
- ⚠️ **Cumplimiento**: Requiere términos y condiciones
- ⚠️ **Fees**: Stripe cobra comisiones (2.9% + $0.30)

**Claves live**:
```
pk_live_51ABC...xyz
sk_live_51ABC...xyz
```

**Recomendación**: Empieza con TEST, migra a PRODUCCIÓN después

---

## 🛠️ Tarjetas de Prueba

Cuando uses claves de TEST, puedes probar con estas tarjetas:

### Pago Exitoso
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/25)
CVC: Cualquier 3 dígitos (ej: 123)
ZIP: Cualquier código postal (ej: 12345)
```

### Pago Rechazado
```
Número: 4000 0000 0000 0002
```

### Requiere Autenticación 3D Secure
```
Número: 4000 0027 6000 3184
```

Más tarjetas: https://stripe.com/docs/testing#cards

---

## ⚙️ Cómo Configurar las Claves

### Paso 1: Frontend (Publishable Key)

**Editar archivo**: `src/config/stripeConfig.ts`

```typescript
// Reemplazar ESTA línea:
publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'

// Por ESTA (con tu clave real):
publishableKey: 'pk_test_TU_CLAVE_AQUI'
```

**Ejemplo**:
```typescript
export const stripeConfig = {
  publishableKey: 'pk_test_51OaXYZ1234567890abcdefghijklmnop'
}
```

### Paso 2: Backend (Secret Key)

**Configurar en Supabase Edge Functions**:

**Opción A: Supabase Dashboard** (Recomendado)
1. Ir a: https://supabase.com/dashboard/project/flxzobqtrdpnbiqpmjlc
2. Settings → Edge Functions → Environment Variables
3. Añadir nueva variable:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_TU_CLAVE_AQUI`
4. Save

**Opción B: Supabase CLI**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_TU_CLAVE_AQUI --project-ref flxzobqtrdpnbiqpmjlc
```

### Paso 3: Rebuild y Deploy

```bash
cd /workspace/luxurywatch
pnpm run build
# Deploy automáticamente
```

---

## ✅ Verificar que Funciona

Después de configurar:

1. **Ir a checkout**: https://5nsxosy3ayh7.space.minimax.io/checkout
2. **Añadir un producto al carrito**
3. **Completar información de envío**
4. **Ingresar tarjeta de prueba**: 4242 4242 4242 4242
5. **Hacer clic en "Pagar"**
6. **Verificar**: ¿Pago exitoso? ¿Orden creada?

**Si funciona**: ✅ Stripe configurado correctamente  
**Si falla**: ❌ Revisar consola (F12) para errores

---

## 🚨 Seguridad

### ✅ Buenas Prácticas
- ✅ **Publishable key en frontend**: OK, es pública
- ✅ **Secret key en Supabase secrets**: OK, segura en servidor
- ✅ **Usar HTTPS**: OK, automático en Supabase
- ✅ **Validar en servidor**: OK, implementado en edge function

### ❌ NUNCA Hacer
- ❌ **Exponer secret key en frontend**: Compromete la seguridad
- ❌ **Commitear secret key a Git**: Puede ser robada
- ❌ **Hardcodear en código**: Usar variables de entorno
- ❌ **Compartir en público**: Mantener privadas

---

## 📞 Ayuda

### Documentación Stripe
- **Inicio rápido**: https://stripe.com/docs/development/quickstart
- **Testing**: https://stripe.com/docs/testing
- **API Keys**: https://stripe.com/docs/keys

### Documentación del Proyecto
- **Guía Stripe completa**: `docs/STRIPE_SETUP_GUIDE.md` (285 líneas)
- **Configuración stripeConfig**: `src/config/stripeConfig.ts`
- **Edge function**: `supabase/functions/create-payment-intent/index.ts`

### Soporte
- **Stripe Support**: https://support.stripe.com
- **Supabase Docs**: https://supabase.com/docs/guides/functions/secrets

---

## 📊 Impacto en el Proyecto

### Sin Stripe (Estado Actual - 98%)
- ❌ Sistema de pagos NO funcional
- ❌ No se pueden procesar transacciones
- ❌ Checkout bloqueado
- ❌ E-commerce incompleto
- ⚠️ **NO APTO PARA PRODUCCIÓN**

### Con Stripe (Meta - 100%)
- ✅ Sistema de pagos COMPLETAMENTE funcional
- ✅ Transacciones procesadas correctamente
- ✅ Órdenes creadas en base de datos
- ✅ E-commerce operativo
- ✅ **LISTO PARA PRODUCCIÓN**

---

## ⏱️ Tiempo Requerido

**Total**: 20-25 minutos

1. Obtener claves de Stripe: 5-10 min
2. Configurar en código: 5 min
3. Rebuild y deploy: 5 min
4. Probar con tarjeta test: 5 min

**Después de esto**: Sistema de pagos 100% funcional ✅

---

## 🎯 Próximos Pasos

**AHORA**:
1. [ ] Obtener `pk_test_...` y `sk_test_...` de Stripe
2. [ ] Configurar en `stripeConfig.ts` y Supabase secrets
3. [ ] Rebuild y deploy
4. [ ] Probar con tarjeta 4242 4242 4242 4242

**DESPUÉS**:
1. [ ] Verificar configurador 3D (5 min)
2. [ ] Testing E2E completo (55 min)
3. [ ] Testing AR móvil (30 min)

**RESULTADO**:
✅ LuxuryWatch 100% completo y listo para producción

---

**Última actualización**: 2025-11-05 05:29:57  
**Status**: ⏳ **ESPERANDO CLAVES DE STRIPE DEL USUARIO**

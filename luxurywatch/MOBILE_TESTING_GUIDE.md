# 📱 Guía de Testing en Dispositivos Reales - LuxuryWatch

## 🎯 Objetivo

Asegurar que el configurador 3D y todas las funcionalidades de LuxuryWatch funcionan perfectamente en dispositivos móviles y tabletas reales, con especial atención a la interacción táctil con el modelo 3D.

---

## 📋 Dispositivos Recomendados para Testing

### Smartphones

#### iOS (Apple)
- **iPhone 14 Pro / 15 Pro** (iOS 17+)
  - Pantalla: 6.1" OLED
  - Resolución: 1179 x 2556
  - Safari 17+
  
- **iPhone SE (3ra gen)** (iOS 15+)
  - Pantalla: 4.7" LCD
  - Resolución: 750 x 1334
  - Testing de pantalla pequeña

#### Android
- **Samsung Galaxy S23 / S24**
  - Pantalla: 6.1" AMOLED
  - Resolución: 1080 x 2340
  - Chrome 120+
  
- **Google Pixel 8**
  - Pantalla: 6.2" OLED
  - Resolución: 1080 x 2400
  - Chrome 120+

- **OnePlus 11 / 12**
  - Pantalla: 6.7" AMOLED
  - Testing de pantalla grande

### Tablets

#### iOS
- **iPad Pro 12.9"** (2022+)
  - Pantalla: 12.9" Liquid Retina XDR
  - Resolución: 2048 x 2732
  - Safari 17+
  
- **iPad Air** (5ta gen)
  - Pantalla: 10.9" Liquid Retina
  - Resolución: 1640 x 2360

#### Android
- **Samsung Galaxy Tab S9+**
  - Pantalla: 12.4" AMOLED
  - Resolución: 1752 x 2800
  - Chrome 120+

---

## ✅ Checklist de Testing por Dispositivo

### 1. Navegación General

- [ ] **Landing Page carga correctamente**
  - Hero section visible sin scroll horizontal
  - Imágenes cargan correctamente
  - Gradientes y colores se muestran bien
  - CTAs son tocables y tienen buen tamaño (mínimo 44x44px)

- [ ] **Menú móvil funciona**
  - Hamburger menu se abre/cierra suavemente
  - Links son tocables
  - Transiciones son fluidas (sin lag)

- [ ] **Footer responsivo**
  - Columnas se apilan correctamente en móvil
  - Todos los links son accesibles

### 2. Configurador 3D (Crítico)

#### Carga y Renderizado
- [ ] **Canvas 3D se renderiza correctamente**
  - No hay pantalla en blanco
  - Modelo del reloj es visible
  - Luces y sombras se muestran correctamente
  - Sin errores de WebGL en consola

#### Controles Táctiles
- [ ] **Rotación con un dedo**
  - Tocar y arrastrar rota el modelo suavemente
  - Rotación es fluida (60fps o cercano)
  - No hay stuttering o lag
  - Damping funciona (desaceleración suave al soltar)

- [ ] **Zoom con pellizco (pinch-to-zoom)**
  - Pellizcar con dos dedos hace zoom in
  - Expandir hace zoom out
  - Límites de zoom funcionan (min 2x, max 15x)
  - Transición suave sin saltos

- [ ] **Pan está deshabilitado**
  - Arrastrar con dos dedos NO debe mover el modelo lateralmente
  - Solo rotación y zoom permitidos

#### Performance
- [ ] **FPS estable**
  - Rotación a 60fps o muy cercano
  - Sin drops significativos de frames
  - Batería no se drena excesivamente rápido
  - Dispositivo no se calienta demasiado

#### Actualización de Configuración
- [ ] **Cambios en tiempo real**
  - Cambiar material → modelo se actualiza instantáneamente
  - Cambiar caja → forma se actualiza sin delay
  - Cambiar esfera → color se actualiza de inmediato
  - Cambiar correa → material/color se actualiza sin lag
  - Sin parpadeos o flashes durante cambios

### 3. Panel de Opciones

- [ ] **Acordeones funcionan bien**
  - Tocar expande/colapsa secciones
  - Animación suave
  - Solo una sección abierta a la vez

- [ ] **Botones de selección táctiles**
  - Botones tienen buen tamaño (mínimo 44x44px)
  - Feedback visual al tocar (cambio de color/borde)
  - Selección se refleja en el modelo 3D

- [ ] **Color picker funcional**
  - Selector de color se puede usar con el dedo
  - Preview del color seleccionado funciona
  - Aplicar color actualiza el modelo

### 4. Carrito y Checkout

- [ ] **Sidebar del carrito**
  - Se desliza desde la derecha/izquierda
  - Animación fluida
  - Overlay oscuro aparece detrás
  - Cerrar funciona (X o tocar overlay)

- [ ] **Formulario de checkout**
  - Inputs tienen buen tamaño
  - Teclado virtual no cubre inputs al escribir
  - Scroll automático al enfocar input
  - Validación muestra errores claramente

- [ ] **Stripe Payment Element**
  - Formulario de tarjeta se muestra correctamente
  - Inputs de tarjeta son accesibles
  - Apple Pay / Google Pay se detectan automáticamente (si están disponibles)
  - Botón de pago es grande y tocable

### 5. Autenticación

- [ ] **Modal de login/registro**
  - Se centra correctamente en pantalla
  - Formularios son usables
  - Teclado no cubre inputs
  - Cerrar modal funciona

- [ ] **Cambio entre Login/Register**
  - Tabs son tocables
  - Transición entre formularios es clara

### 6. Responsividad General

#### Orientaciones
- [ ] **Portrait (vertical)**
  - Todo el contenido es accesible
  - No hay overflow horizontal
  - Layout se adapta bien

- [ ] **Landscape (horizontal)**
  - Configurador 3D aprovecha el espacio horizontal
  - Controles son accesibles
  - No hay elementos cortados

#### Diferentes Tamaños
- [ ] **Pantalla pequeña (iPhone SE 4.7")**
  - Configurador 3D tiene tamaño mínimo usable
  - Botones no se solapan
  - Textos son legibles

- [ ] **Pantalla grande (iPad Pro 12.9")**
  - Layout aprovecha el espacio disponible
  - No hay elementos excesivamente grandes
  - Grid de 2 columnas se mantiene

---

## 🧪 Escenarios de Prueba Específicos

### Escenario 1: Configuración Completa en Móvil
1. Abrir https://9r51m9rznd4t.space.minimax.io en móvil
2. Click "Empieza a Diseñar"
3. Esperar carga del configurador 3D (observar loading)
4. **Rotar el reloj 360° con un dedo** - verificar fluidez
5. **Hacer zoom con pellizco** - verificar límites
6. Cambiar material a "Oro 18K" - verificar actualización visual
7. Cambiar caja a "Caja Moderna" - verificar cambio de forma
8. Cambiar esfera a color personalizado - usar color picker táctil
9. Cambiar manecillas a "Manecillas Sword"
10. Cambiar correa a "Mesh Milanesa"
11. Verificar que todos los cambios se reflejan en el modelo 3D
12. Click "Añadir al Carrito"
13. Verificar que el sidebar del carrito se abre
14. Click "Proceder al Pago"
15. Completar formulario de checkout (usar teclado virtual)
16. Verificar que Stripe Payment Element carga
17. **Si tiene Apple Pay/Google Pay**: verificar que aparece el botón

### Escenario 2: Performance bajo Estrés
1. Abrir configurador 3D en móvil
2. **Rotar continuamente durante 30 segundos**
3. Observar:
   - ¿Mantiene 60fps?
   - ¿El dispositivo se calienta?
   - ¿Hay drops de frames?
4. **Cambiar configuración 10 veces rápidamente**
5. Observar:
   - ¿El modelo se actualiza cada vez?
   - ¿Hay memory leaks? (revisar con DevTools móvil)
6. **Hacer zoom in/out 20 veces**
7. Observar fluidez y estabilidad

### Escenario 3: Multitarea Móvil
1. Configurar un reloj personalizado
2. **Salir de la app** (botón home)
3. **Abrir otra app** (ej: Instagram) durante 1 minuto
4. **Volver a Safari/Chrome**
5. Verificar:
   - ¿El configurador 3D sigue funcionando?
   - ¿La configuración se mantuvo?
   - ¿El modelo se re-renderiza correctamente?

### Escenario 4: Conectividad Intermitente
1. Conectar a WiFi/4G lento
2. Cargar el configurador
3. Observar:
   - ¿Muestra loading adecuadamente?
   - ¿Carga progresivamente?
4. **Cambiar a modo avión** durante configuración
5. Intentar cambiar opciones
6. **Restaurar conexión**
7. Verificar que todo se sincroniza correctamente

---

## 🔍 Herramientas de Testing Móvil

### Testing Remoto
Si no tienes acceso a dispositivos físicos:

1. **BrowserStack** (https://www.browserstack.com)
   - Probar en 3000+ dispositivos reales
   - iOS y Android
   - Plan gratuito disponible para testing

2. **LambdaTest** (https://www.lambdatest.com)
   - Testing en dispositivos reales
   - Screenshots automáticos
   - Plan gratuito limitado

3. **Chrome DevTools Device Mode**
   - Presionar F12 → Click en icono de móvil
   - Seleccionar dispositivo de la lista
   - Activar "Throttling" para simular 3G/4G
   - **Limitación**: No simula performance real de GPU móvil

### Testing Local con Dispositivos Físicos

#### Conectar móvil a localhost
1. **Obtener IP local del ordenador**
   ```bash
   # En Mac/Linux
   ifconfig | grep inet
   
   # En Windows
   ipconfig
   ```

2. **Ejecutar servidor local**
   ```bash
   cd luxurywatch
   pnpm run dev --host
   ```

3. **Acceder desde móvil**
   - Conectar móvil a la misma WiFi
   - Abrir navegador móvil
   - Ir a `http://[IP_LOCAL]:5173`
   - Ejemplo: `http://192.168.1.100:5173`

#### Debug Remoto

**iOS (Safari)**
1. En iPhone: Ajustes → Safari → Avanzado → Activar "Web Inspector"
2. Conectar iPhone a Mac con cable
3. En Mac Safari: Desarrollar → [Nombre del iPhone] → [Página web]
4. Se abre DevTools para el iPhone

**Android (Chrome)**
1. En Android: Ajustes → Opciones de desarrollador → Activar "Depuración USB"
2. Conectar Android a PC con cable USB
3. En PC Chrome: Ir a `chrome://inspect`
4. Seleccionar dispositivo y página
5. Click "Inspect"

---

## 📊 Métricas de Performance Móvil

### Objetivos de Performance

| Métrica | Target | Crítico |
|---------|--------|---------|
| **First Contentful Paint** | < 1.5s | < 3s |
| **Largest Contentful Paint** | < 2.5s | < 4s |
| **Time to Interactive** | < 3.5s | < 5.5s |
| **3D Canvas FPS** | 60fps | > 45fps |
| **Bundle Size (inicial)** | < 300KB | < 500KB |
| **Total Bundle Size** | < 1.5MB | < 2MB |

### Cómo Medir

1. **Lighthouse Mobile en Chrome DevTools**
   ```
   F12 → Lighthouse → Mobile → Analyze page load
   ```

2. **WebPageTest** (https://www.webpagetest.org)
   - Ingresar URL: https://9r51m9rznd4t.space.minimax.io
   - Seleccionar "Mobile" device
   - Run test

3. **Chrome User Experience Report**
   - Google PageSpeed Insights
   - URL: https://pagespeed.web.dev/
   - Ingresar URL del sitio

---

## 🐛 Problemas Comunes en Móvil y Soluciones

### Problema: Configurador 3D no carga en iOS
**Causa**: WebGL no soportado o deshabilitado
**Solución**: Verificar en Ajustes → Safari → Avanzado → Experimental Features → WebGL 2.0 activado

### Problema: Rotación muy lenta en Android
**Causa**: GPU antigua o bajo rendimiento
**Solución**: 
- Reducir calidad de sombras
- Disminuir resolución del renderer
- Simplificar geometría del modelo

### Problema: Zoom no funciona con pellizco
**Causa**: OrbitControls no detecta touch events
**Solución**: Ya implementado en OrbitControls, verificar que no haya listeners de touch conflictivos

### Problema: Teclado virtual cubre formularios
**Causa**: Input no hace scroll al enfocar
**Solución**: Ya implementado, verificar `scrollIntoView()` en inputs

### Problema: Modelo 3D desaparece al cambiar tab
**Causa**: WebGL context se pierde al cambiar de pestaña
**Solución**: Implementar listener de `webglcontextlost` (ya implementado en cleanup)

---

## ✅ Reporte de Testing

### Plantilla de Reporte

```markdown
# Reporte de Testing Móvil - [Dispositivo]

**Fecha**: [fecha]
**Dispositivo**: [modelo exacto]
**OS**: [iOS/Android versión]
**Navegador**: [Safari/Chrome versión]

## Resultados

### Configurador 3D
- [ ] Renderizado: ✅ / ❌
- [ ] Rotación táctil: ✅ / ❌ [FPS estimado: XX]
- [ ] Zoom pellizco: ✅ / ❌
- [ ] Actualización en tiempo real: ✅ / ❌
- [ ] Performance: ✅ / ❌ [Observaciones: ...]

### UI/UX
- [ ] Navegación: ✅ / ❌
- [ ] Formularios: ✅ / ❌
- [ ] Carrito: ✅ / ❌
- [ ] Checkout: ✅ / ❌

### Problemas Encontrados
1. [Descripción del problema]
   - Severidad: Alta / Media / Baja
   - Pasos para reproducir: ...
   - Screenshot: [adjuntar si es posible]

2. [Otro problema]
   ...

### Lighthouse Score
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100

**Recomendación Final**: Aprobar / Requiere mejoras
```

---

## 🚀 Testing Pre-Lanzamiento

Antes de lanzar a producción, completar testing en AL MENOS:
- ✅ 1 iPhone (iOS 16+)
- ✅ 1 Android (Android 12+)
- ✅ 1 iPad o tablet Android

Criterios de aprobación:
- ✅ Configurador 3D funciona en todos los dispositivos
- ✅ Controles táctiles responden correctamente
- ✅ FPS > 45 en todos los dispositivos
- ✅ No hay errores críticos en consola
- ✅ Checkout completo funciona de extremo a extremo

---

**📱 Una vez completado el testing en dispositivos reales, documenta todos los hallazgos y realiza los ajustes necesarios antes del lanzamiento final.**

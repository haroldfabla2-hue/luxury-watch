# Guía de Testing AR en Dispositivos Móviles

**URL de Prueba:** https://ap5y2066a1jl.space.minimax.io/configurador  
**Duración Estimada:** 30 minutos  
**Requisitos:** iPhone (iOS 12+) o Android (con ARCore)

---

## Objetivo

Verificar que la funcionalidad de Realidad Aumentada (AR) funciona correctamente en dispositivos móviles reales, permitiendo a los usuarios visualizar el reloj personalizado en su entorno a través de la cámara.

---

## Dispositivos Compatibles

### iOS (Recomendado)
**Modelos compatibles:**
- iPhone 6S o posterior
- iPad (5ª generación) o posterior
- iPad Pro (todos los modelos)

**Sistema operativo:**
- iOS 12 o superior
- AR Quick Look nativo

### Android
**Requisitos:**
- Dispositivo compatible con ARCore
- Android 7.0 (Nougat) o superior
- Google Play Services para AR instalado

**Modelos populares compatibles:**
- Google Pixel (todos)
- Samsung Galaxy S8 o posterior
- OnePlus 6 o posterior
- Huawei P20 o posterior

**Verificar compatibilidad:**
https://developers.google.com/ar/devices

---

## Pre-requisitos

### Antes de Empezar:

1. **Conexión a Internet**
   - WiFi estable recomendado
   - 3G/4G/5G también funciona

2. **Navegador**
   - **iOS:** Safari (nativo)
   - **Android:** Chrome (recomendado)

3. **Permisos**
   - Permitir acceso a la cámara cuando se solicite
   - Permitir acceso a sensores de movimiento

4. **Espacio Físico**
   - Superficie plana (mesa, escritorio, suelo)
   - Buena iluminación (luz natural o artificial)
   - Espacio mínimo: 1m x 1m

---

## Test 1: Acceso y Preparación (5 minutos)

### Pasos:

1. **Abrir Configurador en Móvil**
   - Abrir navegador en el móvil
   - Ir a: https://ap5y2066a1jl.space.minimax.io/configurador
   - [ ] Página carga correctamente
   - [ ] Modelo 3D se visualiza (puede tardar unos segundos)

2. **Personalizar Reloj (Opcional)**
   - Seleccionar material deseado (ej: Oro 18k)
   - Seleccionar esfera (ej: Azul Océano)
   - Seleccionar correa (ej: Cuero Marrón)
   - [ ] Configuración se actualiza en el modelo 3D

3. **Localizar Botón AR**
   - Scroll hasta encontrar botón "Ver AR"
   - [ ] Botón es visible y accesible
   - [ ] Botón NO está deshabilitado

**Resultado Esperado:**
- ✓ Configurador carga en móvil
- ✓ Modelo 3D visible
- ✓ Botón AR accesible

---

## Test 2: Activar AR (iOS) (10 minutos)

### Solo para iPhone/iPad con iOS 12+

### Pasos:

1. **Pulsar Botón "Ver AR"**
   - Tocar botón "Ver AR" en el configurador
   - [ ] Modal AR se abre con instrucciones

2. **Pulsar "Ver en tu Espacio"**
   - Tocar botón dorado "Ver en tu Espacio (AR)"
   - [ ] Solicita permisos de cámara (primera vez)
   - Conceder permisos
   - [ ] Se abre AR Quick Look de iOS

3. **Escanear Superficie**
   - Mover el dispositivo lentamente
   - Apuntar cámara a una superficie plana (mesa, suelo)
   - [ ] Aparecen puntos blancos en la pantalla
   - [ ] Aparece círculo o indicador de superficie detectada

4. **Colocar Reloj**
   - Tocar en la superficie donde aparece el círculo
   - [ ] Modelo 3D del reloj aparece en el entorno real
   - [ ] Reloj se "ancla" a la superficie

5. **Verificar Escala**
   - Observar tamaño del reloj
   - [ ] Reloj tiene escala realista (~40mm de diámetro)
   - [ ] No es demasiado grande ni pequeño
   - [ ] Proporciones correctas

6. **Interactuar con el Modelo**
   - **Mover:** Tocar y arrastrar el reloj
     - [ ] Reloj se mueve por la superficie
   - **Rotar:** Usar dos dedos para rotar
     - [ ] Reloj gira sobre su eje
   - **Escalar:** Pellizcar con dos dedos (zoom)
     - [ ] Reloj se hace más grande/pequeño
   - **Caminar alrededor:** Moverte físicamente
     - [ ] Reloj permanece en su posición
     - [ ] Puedes verlo desde diferentes ángulos

7. **Verificar Iluminación**
   - [ ] Sombras del reloj aparecen en la superficie
   - [ ] Iluminación se adapta al entorno
   - [ ] Reflejos realistas en superficies metálicas

8. **Capturar Screenshot (Opcional)**
   - Botón de cámara en AR Quick Look
   - [ ] Captura foto del reloj en tu entorno
   - Foto se guarda en galería

9. **Salir de AR**
   - Tocar "X" o "Cerrar"
   - [ ] Vuelve al modal AR
   - [ ] Cerrar modal vuelve al configurador

**Resultado Esperado iOS:**
- ✓ AR Quick Look se activa
- ✓ Superficie se detecta correctamente
- ✓ Modelo aparece en entorno real
- ✓ Escala realista (~40mm)
- ✓ Interacciones funcionan
- ✓ Iluminación y sombras realistas

---

## Test 3: Activar AR (Android) (10 minutos)

### Solo para Android con ARCore

### Pasos:

1. **Pulsar Botón "Ver AR"**
   - Tocar botón "Ver AR" en el configurador
   - [ ] Modal AR se abre con instrucciones

2. **Pulsar "Ver en tu Espacio"**
   - Tocar botón dorado "Ver en tu Espacio (AR)"
   - [ ] Puede solicitar instalar/actualizar "Google Play Services para AR"
   - Si solicita, instalar desde Play Store
   - [ ] Se abre Scene Viewer de Google

3. **Escanear Superficie**
   - Mover el dispositivo lentamente
   - Apuntar cámara a una superficie plana
   - [ ] Mensaje: "Mueve el dispositivo para encontrar una superficie"
   - [ ] Aparecen puntos blancos/grilla en pantalla

4. **Colocar Reloj**
   - Cuando superficie es detectada, aparece sombra del reloj
   - Tocar en la superficie deseada
   - [ ] Modelo 3D del reloj aparece
   - [ ] Reloj se coloca en el entorno real

5. **Verificar Escala**
   - Observar tamaño del reloj
   - [ ] Escala realista (~40mm diámetro)
   - [ ] Proporciones correctas

6. **Interactuar con el Modelo**
   - **Mover:** Tocar y arrastrar
     - [ ] Reloj se mueve por la superficie
   - **Rotar:** Usar dos dedos
     - [ ] Reloj gira
   - **Escalar:** Pellizcar (zoom)
     - [ ] Reloj cambia de tamaño
   - **Caminar:** Moverte físicamente
     - [ ] Reloj permanece anclado
     - [ ] Puedes verlo desde todos los ángulos

7. **Verificar Iluminación**
   - [ ] Sombras visibles
   - [ ] Iluminación ambiental se adapta
   - [ ] Reflejos en superficies metálicas

8. **Capturar Screenshot (Opcional)**
   - Botón de cámara en Scene Viewer
   - [ ] Captura foto
   - Foto se guarda en galería

9. **Salir de AR**
   - Tocar "X" o "Atrás"
   - [ ] Vuelve al navegador/modal AR

**Resultado Esperado Android:**
- ✓ Scene Viewer se activa
- ✓ Superficie se detecta
- ✓ Modelo aparece en entorno
- ✓ Escala correcta
- ✓ Interacciones funcionan
- ✓ Sombras e iluminación

---

## Test 4: Diferentes Superficies (5 minutos)

### Objetivo
Verificar que AR funciona en diferentes tipos de superficies.

### Pasos:

1. **Superficie Horizontal - Mesa**
   - Colocar reloj en una mesa
   - [ ] Detecta correctamente
   - [ ] Reloj se ancla bien

2. **Superficie Horizontal - Suelo**
   - Colocar reloj en el suelo
   - [ ] Detecta correctamente
   - [ ] Reloj visible desde arriba

3. **Superficie Textured - Madera**
   - Probar en mesa de madera
   - [ ] Detecta correctamente

4. **Superficie Lisa - Vidrio/Metal (Opcional)**
   - Probar en superficie muy lisa
   - [ ] Puede tener dificultad (normal)
   - Superficies muy reflectantes pueden complicar detección

**Resultado Esperado:**
- ✓ Funciona en superficies horizontales comunes
- ✓ Mejor en superficies con textura
- ⚠️ Superficies muy lisas/reflectantes pueden fallar

---

## Test 5: Condiciones de Iluminación (5 minutos)

### Objetivo
Verificar que AR funciona en diferentes condiciones de luz.

### Pasos:

1. **Luz Natural (Día)**
   - Cerca de ventana con luz natural
   - [ ] Superficie se detecta fácilmente
   - [ ] Modelo visible claramente

2. **Luz Artificial (Interior)**
   - En habitación con luz artificial
   - [ ] Funciona correctamente
   - [ ] Modelo visible

3. **Luz Baja (Opcional)**
   - En habitación con poca luz
   - [ ] Puede tener dificultad detectando superficie
   - ⚠️ Normal que funcione peor con poca luz

**Resultado Esperado:**
- ✓ Funciona bien con luz natural
- ✓ Funciona bien con luz artificial adecuada
- ⚠️ Puede fallar con muy poca luz (normal)

---

## Checklist de Funcionalidades AR

### Activación
- [ ] Botón "Ver AR" visible en móvil
- [ ] Modal AR se abre correctamente
- [ ] Botón "Ver en tu Espacio" funciona
- [ ] Permisos de cámara se solicitan

### Detección de Superficie
- [ ] Dispositivo detecta superficies planas
- [ ] Indicador visual de superficie detectada
- [ ] Mensaje de instrucciones claro

### Colocación del Modelo
- [ ] Modelo 3D aparece al tocar superficie
- [ ] Modelo se ancla correctamente
- [ ] Escala es realista (~40mm)

### Interacciones
- [ ] Mover: Tocar y arrastrar funciona
- [ ] Rotar: Dos dedos para rotar funciona
- [ ] Escalar: Pellizcar funciona
- [ ] Caminar alrededor: Modelo permanece anclado

### Realismo Visual
- [ ] Sombras del modelo visibles
- [ ] Iluminación se adapta al entorno
- [ ] Reflejos en superficies metálicas
- [ ] Oclusión correcta (modelo "detrás" de objetos reales si corresponde)

### Performance
- [ ] Frame rate fluido (30+ FPS mínimo)
- [ ] Sin lag al mover el modelo
- [ ] Sin crashes de la aplicación

---

## Problemas Comunes y Soluciones

### Problema 1: "AR no disponible en este dispositivo"
**Causas:**
- Dispositivo no compatible con ARCore/ARKit
- Sistema operativo desactualizado

**Soluciones:**
- Verificar compatibilidad del dispositivo
- Actualizar sistema operativo
- En Android, instalar "Google Play Services para AR"

---

### Problema 2: No detecta superficie
**Causas:**
- Poca iluminación
- Superficie demasiado lisa/reflectante
- Movimiento muy rápido del dispositivo

**Soluciones:**
- Aumentar iluminación
- Probar en superficie con más textura (madera, tela)
- Mover dispositivo más lentamente

---

### Problema 3: Modelo aparece demasiado grande/pequeño
**Causas:**
- Escala incorrecta en el modelo GLB
- Configuración de model-viewer

**Soluciones:**
- Verificar que escala es 40mm = 0.04m en código
- Reportar para ajuste en configuración

---

### Problema 4: Modelo "flota" o no se ancla bien
**Causas:**
- Tracking perdido
- Superficie muy móvil

**Soluciones:**
- Mantener dispositivo más estable
- Evitar superficies que se mueven
- Recalibrar colocando de nuevo

---

### Problema 5: Sombras no aparecen
**Causas:**
- Configuración de shadow-intensity en model-viewer
- Limitaciones del navegador

**Soluciones:**
- Verificar que shadow-intensity="1" en código
- Puede ser limitación del dispositivo/navegador

---

## Comparación iOS vs Android

### iOS (AR Quick Look)
**Ventajas:**
- Integración nativa muy pulida
- Performance excelente
- Captura de fotos integrada
- Compartir fácilmente

**Limitaciones:**
- Solo funciona en Safari
- Requiere iOS 12+

### Android (Scene Viewer)
**Ventajas:**
- Amplia compatibilidad de dispositivos
- Funciona en Chrome
- Buena integración con Google

**Limitaciones:**
- Requiere Google Play Services para AR
- Performance varía según dispositivo
- Experiencia menos pulida que iOS

---

## Matriz de Testing

| Test | iOS | Android | Notas |
|------|-----|---------|-------|
| Activación AR | ☐ | ☐ | Debe funcionar en ambos |
| Detección superficie | ☐ | ☐ | Puede variar según luz |
| Colocación modelo | ☐ | ☐ | Escala debe ser consistente |
| Mover modelo | ☐ | ☐ | Tocar y arrastrar |
| Rotar modelo | ☐ | ☐ | Dos dedos |
| Escalar modelo | ☐ | ☐ | Pellizcar |
| Sombras | ☐ | ☐ | Debe ser visible |
| Iluminación ambiental | ☐ | ☐ | Se adapta al entorno |
| Performance (30+ FPS) | ☐ | ☐ | Fluido sin lag |
| Captura de foto | ☐ | ☐ | Botón de cámara |

---

## Resultado Esperado

**Si todos los tests pasan:**
- ✓ AR funciona completamente en móviles
- ✓ Experiencia de usuario excelente
- ✓ Escala realista del reloj
- ✓ Performance fluida
- ✓ Listo para producción

**Si hay fallos:**
- Documentar exactamente qué falló
- Especificar dispositivo y sistema operativo
- Capturar screenshot/video si es posible
- Reportar para corrección

---

## Notas Adicionales

### Para Mejor Experiencia AR:
1. **Iluminación:** Usar buena iluminación (natural o artificial)
2. **Superficie:** Preferir superficies con textura (madera, tela)
3. **Movimiento:** Mover dispositivo lentamente al escanear
4. **Estabilidad:** Mantener manos firmes al colocar modelo
5. **Espacio:** Tener espacio libre alrededor (1m x 1m mínimo)

### Casos de Uso Reales:
- **Cliente en tienda:** Ver reloj en su muñeca (aprox)
- **Cliente en casa:** Ver reloj en mesa/escritorio
- **Regalo:** Visualizar antes de comprar
- **Comparación:** Ver diferentes configuraciones en entorno real

---

## Tiempo Total Estimado

- Test 1 (Acceso): 5 min
- Test 2 (iOS AR): 10 min
- Test 3 (Android AR): 10 min (si tienes Android)
- Test 4 (Superficies): 5 min
- Test 5 (Iluminación): 5 min

**Total: 30-35 minutos**

---

**Creado por:** MiniMax Agent  
**Fecha:** 2025-11-05 05:00:57  
**Versión:** 1.0 - Guía AR Móvil Completa

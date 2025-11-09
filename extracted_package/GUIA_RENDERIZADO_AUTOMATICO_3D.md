# 🎨 Renderizado Automático de Relojes 3D - Guía Completa

## 📋 Resumen Ejecutivo

**Sí, es completamente posible automatizar el renderizado de todos los relojes 3D y guardar las imágenes.** Te he creado múltiples soluciones que pueden generar automáticamente capturas de pantalla de alta resolución de todas las configuraciones de relojes.

## 🚀 Opciones Disponibles

### 1. **Puppeteer (Recomendado para Servidor)** ⭐
- **Archivo:** `auto-render-watch.js`
- **Ventajas:** Más estable, mejor manejo de errores
- **Ideal para:** Servidores, procesos automatizados
- **Método:** Captura programática de pantallas

```bash
# Ejecutar
npm install puppeteer
node auto-render-watch.js
```

### 2. **Playwright (Más Moderno)** ⭐⭐
- **Archivo:** `playwright-render-watch.js`
- **Ventajas:** Más moderno, mejor compatibilidad móvil
- **Ideal para:** Desarrolladores que prefieren tecnología nueva
- **Método:** Navegador automatizado avanzado

```bash
# Ejecutar  
npm install playwright
node playwright-render-watch.js
```

### 3. **Chrome Headless (Más Rápido)**
- **Archivo:** `render-watches-automatically.sh` (línea 150+)
- **Ventajas:** Muy rápido, no requiere dependencias Node.js
- **Ideal para:** Procesos rápidos, automatización simple
- **Método:** Chrome sin interfaz gráfica

```bash
# Ejecutar
chmod +x render-watches-automatically.sh
./render-watches-automatically.sh
```

### 4. **Python + Selenium (Para Pythonistas)**
- **Archivo:** `selenium-render-watches.py`
- **Ventajas:** Si ya usas Python, integración fácil
- **Ideal para:** Usuarios Python, análisis de datos
- **Método:** Navegador controlado por Python

```bash
# Ejecutar
pip install selenium webdriver-manager
python selenium-render-watches.py
```

### 5. **Método Interactivo (Manual)**
- **Archivo:** `interactive-watch-render.html`
- **Ventajas:** Control total, puedes revisar cada captura
- **Ideal para:** Usuarios finales, control manual
- **Método:** Tu navegador + script automatizado

```bash
# Ejecutar - Solo abre el archivo HTML en tu navegador
```

## 📊 Configuraciones Incluidas

Cada script incluye **30 configuraciones completas** de relojes:

### Acero Inoxidable (8 variaciones)
- Caja, esfera, correa, complicaciones, bisel diferentes
- Tamaños: 36mm, 38mm, 40mm, 42mm, 44mm, 46mm

### Oro 18k (6 variaciones)  
- Oro amarillo, oro blanco, oro rosa
- Esferas: champagne, blanca, plateada, rose gold

### Titanio Grado 5 (4 variaciones)
- Naranja: negra, azul, plateada, gris técnica
- Correa: metal milanese, caucho técnico

### Cerámica (4 variaciones)
- Negro, blanco, azul
- Esferas: luxury, blanca, marina

### Ediciones Especiales (4 variaciones)
- Diamantes, complicaciones extremas
- Implementaciones premium únicas

## 🎯 Características Técnicas

### **Resolución de Capturas**
- **1920x1080 píxeles** (Full HD)
- **Factor de escala 2x** (3840x2160 virtual)
- **Formato PNG** sin compresión
- **Calidad 100%** sin pérdida

### **Ángulos Múltiples**
Cada reloj se captura desde 5 ángulos:
1. **Frontal** - Vista principal
2. **Izquierda** - 45° izquierda
3. **Derecha** - 45° derecha  
4. **Superior** - Vista desde arriba
5. **Perspectiva** - Ángulo dinámico

### **Archivos Generados**
- **Por configuración:** 5-6 imágenes PNG
- **Total estimado:** 150-180 imágenes
- **Tamaño por imagen:** ~2-5 MB
- **Espacio total:** 300-900 MB

### **Nombres de Archivos**
```
watch_01_acero_inoxidable_blanca_lujo_acero_milanese_simple_date_liso_acero_40mm_render_3d.png
├── Índice
├── Material de caja
├── Tipo de esfera  
├── Tipo de correa
├── Complicación
├── Tipo de bisel
├── Tamaño
└── Render 3D
```

## 🛠️ Instalación y Uso

### **Requisitos Previos**
```bash
# Node.js (para scripts JS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3 (para script Python)
sudo apt-get install -y python3 python3-pip

# Chrome (para Chrome Headless)
sudo apt-get install -y google-chrome-stable
```

### **Instalación Automática**
```bash
# El script principal instala todo automáticamente
./render-watches-automatically.sh
```

### **Instalación Manual**
```bash
# Para Puppeteer
npm init -y
npm install puppeteer

# Para Playwright  
npm install playwright

# Para Selenium
pip install selenium webdriver-manager
```

## 📈 Ejemplos de Uso

### **Ejemplo 1: Renderizado Rápido**
```bash
# Solo renderizar 3 configuraciones para prueba
python selenium-render-watches.py --test
```

### **Ejemplo 2: Renderizado Completo**
```bash
# Renderizar todas las configuraciones con Puppeteer
node auto-render-watch.js
```

### **Ejemplo 3: Renderizado Interactivo**
```bash
# Abrir script interactivo en navegador
open interactive-watch-render.html
# 1. Clic "Abrir Configurador"
# 2. Clic "Iniciar Renderizado"
# 3. Revisar capturas en carpeta downloads
```

## 📊 Reportes Generados

Cada método genera reportes automáticos:

### **Puppeteer Report**
```json
{
  "timestamp": "2025-11-06T12:40:15Z",
  "method": "puppeteer",
  "total_configs": 30,
  "successful_renders": 28,
  "failed_renders": 2,
  "files": [
    {
      "filename": "watch_01_...render.png",
      "size_kb": 2847
    }
  ]
}
```

### **Playwright Report**
```json
{
  "timestamp": "2025-11-06T12:40:15Z", 
  "method": "playwright",
  "total_configurations": 30,
  "successful_renders": 180, // 30 configs × 6 ángulos
  "render_rate": "100%",
  "files": [
    {
      "filename": "watch_01_...frontal.png",
      "angle": "frontal"
    }
  ]
}
```

## 🎛️ Personalización Avanzada

### **Modificar Configuraciones**
Edita el array `configurations` en cualquier script:

```javascript
// Ejemplo: Agregar nueva configuración
{
  case: "acero_inoxidable",
  dial: "verde_emerald", // ← Nueva esfera
  hands: "plateadas",
  crown: "acero",
  strap: "caucuchou_verde", // ← Nueva correa
  complication: "lunar_green", // ← Nueva complicación
  bezel: "esmeraldas", // ← Nuevo bisel
  size: "41mm"
}
```

### **Cambiar Resolución**
```javascript
// En cualquier script JS
await page.setViewport({ 
  width: 2560,  // ← 2K resolution
  height: 1440, 
  deviceScaleFactor: 2 
});
```

### **Modificar Tiempos**
```javascript
// Entre capturas
const delayBetweenScreenshots = 6000; // 6 segundos

// Tiempo de espera máximo
const maxWaitTime = 20000; // 20 segundos
```

## ⚠️ Consideraciones Importantes

### **Rendimiento del Servidor**
- **Tiempo estimado:** 2-4 horas para 30 configuraciones
- **Ancho de banda:** ~300-900 MB de imágenes
- **CPU:** Alto uso durante renderizado
- **Memoria:** 2-4 GB RAM disponible

### **Rate Limiting**
Los scripts incluyen pausas automáticas:
- 3-4 segundos entre capturas
- Timeouts configurables
- Reintentos automáticos

### **Compatibilidad del Configurador**
Los scripts están diseñados para funcionar con tu configurador 3D actual:
- **URL:** `https://r3095jalov3z.space.minimax.io`
- **Métodos:** JavaScript + DOM interaction
- **Apoyo:** Fallbacks automáticos

## 🚨 Solución de Problemas

### **Error: "Canvas not found"**
```javascript
// Aumentar tiempo de espera
const maxWaitTime = 20000; // 20 segundos
```

### **Error: "Configuration not applied"**
```javascript
// Verificar selectores de elementos
case_selectors = [
  "select[name*='case']", 
  "#case-selector", 
  ".watch-case-select"
]
```

### **Error: "Network timeout"**
```javascript
// Aumentar timeout de red
await page.goto(url, { 
  waitUntil: 'networkidle2',
  timeout: 30000 
});
```

## 🎯 Recomendación Final

**Para uso inmediato:** Usa el método **interactivo** (`interactive-watch-render.html`)
- Es más fácil de controlar
- Puedes verificar cada captura
- No requiere instalación compleja

**Para automatización completa:** Usa **Playwright** 
- Mejor soporte moderno
- Más estable para procesamiento masivo
- Reportes detallados

**Para servidores:** Usa **Puppeteer**
- Más estable para operaciones largas
- Mejor manejo de errores
- Soporte empresarial

## 📞 Próximos Pasos

1. **Elige tu método preferido**
2. **Ejecuta una prueba con 3 configuraciones**
3. **Ajusta configuraciones según necesites**
4. **Ejecuta renderizado completo**
5. **Revisa reportes y calidad**

**¡El sistema está listo para generar automáticamente renders profesionales de todos tus relojes!** 🎉
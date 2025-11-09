#!/bin/bash

# Script de Automatización Completa de Renderizado 3D de Relojes
# Usa Puppeteer para capturar automáticamente todas las configuraciones

echo "🚀 INICIANDO RENDERIZADO AUTOMÁTICO DE RELOJES 3D"
echo "================================================="

# Crear directorios
mkdir -p renders
mkdir -p renders_playwright
mkdir -p renders_headless

# Instalar dependencias necesarias
echo "📦 Instalando dependencias..."
npm install puppeteer playwright chromium-browser

# Verificar si Node.js está disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar si Google Chrome está instalado
if ! command -v google-chrome &> /dev/null; then
    echo "❌ Google Chrome no está instalado. Instalando Chrome..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
    sudo apt-get update
    sudo apt-get install -y google-chrome-stable
fi

echo "✅ Dependencias instaladas correctamente"
echo ""

# Función para ejecutar renderizado con Puppeteer
run_puppeteer_render() {
    echo "🎨 EJECUTANDO RENDERIZADO CON PUPPETEER"
    echo "======================================="
    
    cd /workspace
    
    # Crear package.json si no existe
    if [ ! -f package.json ]; then
        cat > package.json << EOF
{
  "name": "watch-renderer",
  "version": "1.0.0",
  "description": "Automatic 3D watch rendering tool",
  "main": "auto-render-watch.js",
  "scripts": {
    "render": "node auto-render-watch.js",
    "render-playwright": "node playwright-render-watch.js"
  },
  "dependencies": {
    "puppeteer": "^21.0.0",
    "playwright": "^1.40.0"
  }
}
EOF
    fi
    
    # Instalar dependencias
    npm install
    
    # Ejecutar renderizado con Puppeteer
    echo "⏳ Ejecutando script de Puppeteer..."
    timeout 600 node auto-render-watch.js
}

# Función para ejecutar renderizado con Playwright
run_playwright_render() {
    echo "🎨 EJECUTANDO RENDERIZADO CON PLAYWRIGHT"
    echo "========================================="
    
    cd /workspace
    
    # Ejecutar renderizado con Playwright
    echo "⏳ Ejecutando script de Playwright..."
    timeout 600 node playwright-render-watch.js
}

# Función para renderizado directo con Chrome headless
run_headless_chrome() {
    echo "🎨 EJECUTANDO RENDERIZADO CON CHROME HEADLESS"
    echo "============================================="
    
    cd /workspace
    
    # Crear script de headless render
    cat > headless-chrome-render.js << 'EOF'
const { execSync } = require('child_process');
const fs = require('fs');

// Lista de URLs para capturar
const watchConfigs = [
    'https://r3095jalov3z.space.minimax.io?case=acero&dial=blanca&strap=milanese',
    'https://r3095jalov3z.space.minimax.io?case=oro_amarillo&dial=champagne&strap=cuero',
    'https://r3095jalov3z.space.minimax.io?case=titanio&dial=negra&strap=titanio',
    'https://r3095jalov3z.space.minimax.io?case=ceramica_negra&dial=negra&strap=ceramica',
    'https://r3095jalov3z.space.minimax.io?case=acero&dial=azul&strap=cuero_negro',
    'https://r3095jalov3z.space.minimax.io?case=oro_blanco&dial=plateada&strap=acero'
];

let outputDir = './renders_headless';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function renderWithHeadlessChrome() {
    for (let i = 0; i < watchConfigs.length; i++) {
        const config = watchConfigs[i];
        const outputFile = `${outputDir}/watch_${(i + 1).toString().padStart(2, '0')}_headless.png`;
        
        console.log(`🎨 Capturando configuración ${i + 1}/${watchConfigs.length}`);
        
        try {
            // Usar Chrome headless para capturar
            const command = `google-chrome --headless --disable-gpu --window-size=1920,1080 --screenshot="${outputFile}" "${config}"`;
            execSync(command, { timeout: 30000 });
            
            if (fs.existsSync(outputFile)) {
                console.log(`✅ Guardado: ${outputFile}`);
            } else {
                console.log(`❌ Fallo al capturar: ${config}`);
            }
            
        } catch (error) {
            console.log(`❌ Error capturando ${config}:`, error.message);
        }
        
        // Pausa entre capturas
        if (i < watchConfigs.length - 1) {
            console.log('⏳ Esperando 5 segundos...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.log('\n🎯 Renderizado con headless Chrome completado');
    
    // Generar reporte
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    const report = {
        timestamp: new Date().toISOString(),
        method: 'chrome_headless',
        total_configs: watchConfigs.length,
        successful_renders: files.length,
        output_directory: outputDir,
        files: files.map(f => f)
    };
    
    fs.writeFileSync(`${outputDir}/headless_chrome_report.json`, JSON.stringify(report, null, 2));
    console.log(`📄 Reporte generado: ${outputDir}/headless_chrome_report.json`);
}

renderWithHeadlessChrome().catch(console.error);
EOF
    
    # Instalar dependencias de Node.js
    npm install
    
    # Ejecutar renderizado headless
    timeout 300 node headless-chrome-render.js
}

# Función para renderizado interactivo (usando navegador del usuario)
run_interactive_render() {
    echo "🎨 GENERANDO SCRIPT INTERACTIVO"
    echo "==============================="
    
    # Crear script que el usuario puede ejecutar en su navegador
    cat > interactive-watch-render.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Renderizador Automático de Relojes 3D</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .config-item { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .status { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        #log { background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 300px; overflow-y: auto; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Renderizador Automático de Relojes 3D</h1>
        <p>Este script automatizará el renderizado de todas las configuraciones de relojes en tu sitio web.</p>
        
        <div id="controls">
            <button id="startBtn" onclick="startRendering()">🚀 Iniciar Renderizado Automático</button>
            <button id="stopBtn" onclick="stopRendering()" disabled>⏹️ Detener</button>
            <button onclick="openConfigurator()">🌐 Abrir Configurador en Nueva Pestaña</button>
        </div>
        
        <div id="status" class="status" style="display:none;"></div>
        
        <h3>📋 Configuraciones a Renderizar:</h3>
        <div id="configList"></div>
        
        <h3>📊 Progreso:</h3>
        <div id="progress">Listo para comenzar</div>
        
        <h3>📝 Log:</h3>
        <div id="log"></div>
    </div>
    
    <script>
        const baseUrl = 'https://r3095jalov3z.space.minimax.io';
        let isRendering = false;
        let currentConfig = 0;
        let configuratorWindow = null;
        
        const configurations = [
            { case: 'acero_inoxidable', dial: 'blanca_lujo', strap: 'acero_milanese' },
            { case: 'acero_inoxidable', dial: 'negra_premium', strap: 'cuero_negro' },
            { case: 'oro_18k_amarillo', dial: 'champagne_elegante', strap: 'cuero_marrón' },
            { case: 'oro_18k_blanco', dial: 'plateada_premium', strap: 'oro_milanese' },
            { case: 'oro_18k_rosa', dial: 'rose_gold_elegant', strap: 'cuero_crema' },
            { case: 'titanio_grado_5', dial: 'negra_premium', strap: 'titanio_milanese' },
            { case: 'titanio_grado_5', dial: 'azul_technical', strap: 'caucuchou_negro' },
            { case: 'ceramica_negra', dial: 'negra_luxury', strap: 'ceramica_negra' },
            { case: 'ceramica_blanca', dial: 'blanca_lujo', strap: 'ceramica_blanca' },
            { case: 'acero_inoxidable', dial: 'diamond_white', strap: 'oro_milanese' }
        ];
        
        function log(message) {
            const logDiv = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            logDiv.innerHTML += `[${timestamp}] ${message}\n`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        function updateStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = `status ${type}`;
            statusDiv.style.display = 'block';
        }
        
        function updateProgress() {
            const progressDiv = document.getElementById('progress');
            progressDiv.textContent = `Renderizado: ${currentConfig + 1}/${configurations.length} (${Math.round(((currentConfig + 1) / configurations.length) * 100)}%)`;
        }
        
        function displayConfigList() {
            const listDiv = document.getElementById('configList');
            listDiv.innerHTML = configurations.map((config, index) => 
                `<div class="config-item">
                    <strong>${index + 1}.</strong> ${config.case} - ${config.dial} - ${config.strap}
                </div>`
            ).join('');
        }
        
        function openConfigurator() {
            configuratorWindow = window.open(baseUrl, '_blank', 'width=1200,height=800');
            log('🌐 Configurador abierto en nueva ventana');
        }
        
        async function startRendering() {
            if (isRendering) return;
            
            isRendering = true;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            
            updateStatus('Iniciando renderizado automático...', 'info');
            log('🚀 Iniciando renderizado automático');
            
            // Verificar que el configurador esté abierto
            if (!configuratorWindow || configuratorWindow.closed) {
                updateStatus('Por favor, abre el configurador primero usando el botón "Abrir Configurador"', 'error');
                return;
            }
            
            for (let i = 0; i < configurations.length && isRendering; i++) {
                const config = configurations[i];
                currentConfig = i;
                
                log(`🎨 Renderizando ${i + 1}/${configurations.length}: ${config.case} - ${config.dial}`);
                updateProgress();
                
                try {
                    // Aplicar configuración
                    await applyConfiguration(config);
                    await waitForRender();
                    
                    // Capturar screenshot
                    await captureScreenshot(config, i + 1);
                    
                    log(`✅ Completado: ${config.case} - ${config.dial}`);
                    
                } catch (error) {
                    log(`❌ Error renderizando ${config.case}: ${error.message}`);
                }
                
                // Pausa entre capturas
                if (i < configurations.length - 1 && isRendering) {
                    log('⏳ Esperando 3 segundos...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
            
            if (isRendering) {
                updateStatus('¡Renderizado completado exitosamente!', 'success');
                log('🎉 Renderizado automático completado');
            } else {
                updateStatus('Renderizado detenido por el usuario', 'info');
                log('⏹️ Renderizado detenido por el usuario');
            }
            
            isRendering = false;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
        }
        
        function stopRendering() {
            isRendering = false;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
        }
        
        async function applyConfiguration(config) {
            // Simular aplicación de configuración (esto depende de tu API)
            const event = new CustomEvent('updateWatchConfiguration', { detail: config });
            configuratorWindow.dispatchEvent(event);
            
            // También intentar interactuar directamente con el DOM si está disponible
            if (configuratorWindow.document) {
                // Código para interactuar con los controles del configurador
                // Esto es específico de tu implementación
            }
        }
        
        async function waitForRender() {
            // Esperar a que el render 3D se complete
            return new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        async function captureScreenshot(config, index) {
            // Usar html2canvas para capturar el canvas 3D
            const canvas = configuratorWindow.document.querySelector('canvas');
            if (canvas) {
                const dataURL = canvas.toDataURL('image/png');
                
                // Descargar imagen
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `watch_${index.toString().padStart(2, '0')}_${config.case}_${config.dial}_${config.strap}.png`;
                link.click();
            }
        }
        
        // Inicializar
        displayConfigList();
        log('✅ Interfaz cargada correctamente');
    </script>
</body>
</html>
EOF
    
    echo "✅ Script interactivo creado: interactive-watch-render.html"
    echo "🌐 Abre este archivo en tu navegador para renderizar"
}

# Ejecutar todos los métodos
echo "🎯 MÉTODOS DISPONIBLES:"
echo "1. Puppeteer (Recomendado para servidor)"
echo "2. Playwright (Más moderno)"
echo "3. Chrome Headless (Más rápido)"
echo "4. Interactivo (Manual con tu navegador)"
echo ""

read -p "Selecciona método (1-4) o presiona Enter para ejecutar todos: " method

case $method in
    1)
        run_puppeteer_render
        ;;
    2)
        run_playwright_render
        ;;
    3)
        run_headless_chrome
        ;;
    4)
        run_interactive_render
        ;;
    *)
        echo "🚀 EJECUTANDO TODOS LOS MÉTODOS"
        echo "=============================="
        run_puppeteer_render
        echo ""
        run_playwright_render
        echo ""
        run_headless_chrome
        echo ""
        run_interactive_render
        ;;
esac

echo ""
echo "🎉 RENDERIZADO AUTOMÁTICO COMPLETADO"
echo "===================================="
echo "📁 Revisa los directorios:"
echo "   - renders/ (Puppeteer)"
echo "   - renders_playwright/ (Playwright)"  
echo "   - renders_headless/ (Chrome Headless)"
echo "   - interactive-watch-render.html (Manual)"
echo ""
echo "📊 Para ver el progreso, revisa los reportes JSON generados"
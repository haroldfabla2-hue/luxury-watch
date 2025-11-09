const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Capturador Automático de Relojes con Playwright
 * Renderiza automáticamente todas las configuraciones de relojes
 * usando Playwright para mejor compatibilidad
 */

class WatchRendererPlaywright {
  constructor() {
    this.baseUrl = 'https://r3095jalov3z.space.minimax.io';
    this.outputDir = './renders_playwright';
    this.delayBetweenScreenshots = 4000; // 4 segundos entre capturas
    this.renderWidth = 1920;
    this.renderHeight = 1080;
    
    // Configuraciones de relojes optimizadas
    this.configurations = [
      // Acero inoxidable - 6 variaciones
      { 
        case: 'acero_inoxidable', 
        dial: 'blanca_lujo', 
        hands: 'plateadas', 
        crown: 'acero', 
        strap: 'acero_milanese', 
        complication: 'simple_date',
        bezel: 'liso_acero',
        size: '40mm'
      },
      { 
        case: 'acero_inoxidable', 
        dial: 'negra_premium', 
        hands: 'plateadas', 
        crown: 'acero', 
        strap: 'cuero_negro', 
        complication: 'chronograph',
        bezel: 'tachymeter',
        size: '42mm'
      },
      { 
        case: 'acero_inoxidable', 
        dial: 'azul_marina', 
        hands: 'plateadas', 
        crown: 'acero', 
        strap: 'acero_milanese', 
        complication: 'moon_phase',
        bezel: 'diamantes',
        size: '36mm'
      },
      { 
        case: 'acero_inoxidable', 
        dial: 'gris_technical', 
        hands: 'plateadas', 
        crown: 'acero', 
        strap: 'caucuchou_negro', 
        complication: 'gmt',
        bezel: 'ceramica_negra',
        size: '42mm'
      },
      { 
        case: 'acero_inoxidable', 
        dial: 'diamonds_white', 
        hands: 'plateadas', 
        crown: 'acero_diamond', 
        strap: 'acero_milanese', 
        complication: 'day_date',
        bezel: 'diamantes_completo',
        size: '38mm'
      },
      { 
        case: 'acero_inoxidable', 
        dial: 'carbon_tech', 
        hands: 'plateadas', 
        crown: 'acero', 
        strap: 'caucuchou_blanco', 
        complication: 'chronograph',
        bezel: 'ceramica_blanca',
        size: '44mm'
      },
      
      // Oro 18k - 6 variaciones
      { 
        case: 'oro_18k_amarillo', 
        dial: 'champagne_elegante', 
        hands: 'oro_amarillo', 
        crown: 'oro_amarillo', 
        strap: 'cuero_marrón', 
        complication: 'simple_date',
        bezel: 'liso_oro',
        size: '40mm'
      },
      { 
        case: 'oro_18k_amarillo', 
        dial: 'blanca_lujo', 
        hands: 'oro_amarillo', 
        crown: 'oro_amarillo', 
        strap: 'oro_milanese', 
        complication: 'perpetual_calendar',
        bezel: 'diamantes',
        size: '42mm'
      },
      { 
        case: 'oro_18k_blanco', 
        dial: 'plateada_premium', 
        hands: 'oro_blanco', 
        crown: 'oro_blanco', 
        strap: 'cuero_negro', 
        complication: 'chronograph',
        bezel: 'cingulado',
        size: '38mm'
      },
      { 
        case: 'oro_18k_blanco', 
        dial: 'champagne_elegante', 
        hands: 'oro_blanco', 
        crown: 'oro_blanco', 
        strap: 'oro_milanese', 
        complication: 'moon_phase',
        bezel: 'diamantes_premium',
        size: '40mm'
      },
      { 
        case: 'oro_18k_rosa', 
        dial: 'rose_gold_elegant', 
        hands: 'oro_rosa', 
        crown: 'oro_rosa', 
        strap: 'cuero_crema', 
        complication: 'day_date',
        bezel: 'bisel_diamantes',
        size: '38mm'
      },
      { 
        case: 'oro_18k_rosa', 
        dial: 'blanca_lujo', 
        hands: 'oro_rosa', 
        crown: 'oro_rosa', 
        strap: 'oro_milanese', 
        complication: 'gmt',
        bezel: 'diamantes_completo',
        size: '42mm'
      },
      
      // Titanio - 4 variaciones
      { 
        case: 'titanio_grado_5', 
        dial: 'negra_premium', 
        hands: 'plateadas', 
        crown: 'titanio', 
        strap: 'titanio_milanese', 
        complication: 'simple_date',
        bezel: 'liso_titanio',
        size: '44mm'
      },
      { 
        case: 'titanio_grado_5', 
        dial: 'azul_technical', 
        hands: 'plateadas', 
        crown: 'titanio', 
        strap: 'caucuchou_negro', 
        complication: 'chronograph',
        bezel: 'tachymeter_titanio',
        size: '42mm'
      },
      { 
        case: 'titanio_grado_5', 
        dial: 'plateada_tech', 
        hands: 'plateadas', 
        crown: 'titanio', 
        strap: 'titanio_milanese', 
        complication: 'gmt',
        bezel: 'ceramica_titanio',
        size: '40mm'
      },
      { 
        case: 'titanio_grado_5', 
        dial: 'negra_technical', 
        hands: 'oro_amarillo', 
        crown: 'titanio', 
        strap: 'caucuchou_azul', 
        complication: 'day_night',
        bezel: 'ceramica_negra',
        size: '46mm'
      },
      
      // Cerámica - 3 variaciones
      { 
        case: 'ceramica_negra', 
        dial: 'negra_luxury', 
        hands: 'oro_amarillo', 
        crown: 'ceramica_negra', 
        strap: 'ceramica_negra', 
        complication: 'simple_date',
        bezel: 'ceramica_negra',
        size: '41mm'
      },
      { 
        case: 'ceramica_blanca', 
        dial: 'blanca_lujo', 
        hands: 'oro_blanco', 
        crown: 'ceramica_blanca', 
        strap: 'ceramica_blanca', 
        complication: 'moon_phase',
        bezel: 'ceramica_blanca',
        size: '41mm'
      },
      { 
        case: 'ceramica_azul', 
        dial: 'azul_marina', 
        hands: 'oro_rosa', 
        crown: 'ceramica_azul', 
        strap: 'ceramica_azul', 
        complication: 'chronograph',
        bezel: 'ceramica_azul',
        size: '41mm'
      },
      
      // Ediciones limitadas - 3 variaciones
      { 
        case: 'acero_inoxidable', 
        dial: 'diamond_white', 
        hands: 'diamante', 
        crown: 'diamante_completo', 
        strap: 'oro_milanese', 
        complication: 'tourbillon',
        bezel: 'diamantes_completo',
        size: '42mm'
      },
      { 
        case: 'oro_18k_amarillo', 
        dial: 'grand_complication', 
        hands: 'oro_amarillo', 
        crown: 'oro_amarillo_diamond', 
        strap: 'cuero_crocodile', 
        complication: 'grand_complication',
        bezel: 'diamantes_premium',
        size: '44mm'
      },
      { 
        case: 'titanio_grado_5', 
        dial: 'technical_extreme', 
        hands: 'plateadas', 
        crown: 'titanio_diamond', 
        strap: 'titanio_milanese', 
        complication: 'extreme_complication',
        bezel: 'ceramica_diamantes',
        size: '48mm'
      }
    ];
    
    this.setupOutputDirectory();
  }
  
  setupOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  generateFilename(config, index) {
    const parts = [
      `watch_${index.toString().padStart(2, '0')}`,
      config.case.replace(/[^a-zA-Z0-9]/g, '_'),
      config.dial.replace(/[^a-zA-Z0-9]/g, '_'),
      config.strap.replace(/[^a-zA-Z0-9]/g, '_'),
      config.complication.replace(/[^a-zA-Z0-9]/g, '_'),
      config.bezel.replace(/[^a-zA-Z0-9]/g, '_'),
      config.size.replace(/[^0-9mm]/g, '')
    ];
    return parts.join('_') + '_render_3d.png';
  }
  
  async renderConfiguration(page, config, index, total) {
    try {
      console.log(`\n🎨 Renderizando ${index + 1}/${total}: ${config.case}`);
      
      // Navegar y cargar página
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Esperar canvas
      await page.waitForSelector('canvas', { timeout: 15000 });
      console.log('📺 Canvas encontrado');
      
      // Aplicar configuración
      await this.applyConfigurationAdvanced(page, config);
      await page.waitForTimeout(3000);
      
      // Mover cámara para mejores ángulos
      await this.captureMultipleAngles(page, config, index, total);
      
    } catch (error) {
      console.error(`❌ Error renderizando ${config.case}:`, error.message);
      throw error;
    }
  }
  
  async applyConfigurationAdvanced(page, config) {
    // Usar JavaScript para configurar el store
    await page.evaluate((configData) => {
      // Buscar el store de configuración
      const event = new CustomEvent('updateWatchConfiguration', { detail: configData });
      window.dispatchEvent(event);
      
      // También intentar con Zustand si está disponible
      if (window.useConfiguratorStore) {
        try {
          window.useConfiguratorStore.getState().updateConfiguration(configData);
        } catch (e) {
          console.log('Store update via Zustand no disponible');
        }
      }
    }, config);
    
    await page.waitForTimeout(2000);
  }
  
  async captureMultipleAngles(page, config, index, total) {
    const angles = [
      { name: 'frontal', rotation: 0, zoom: 1 },
      { name: 'izquierda', rotation: -45, zoom: 1.2 },
      { name: 'derecha', rotation: 45, zoom: 1.2 },
      { name: 'superior', rotation: 0, zoom: 1.5 },
      { name: 'perspectiva', rotation: 30, zoom: 1.1 }
    ];
    
    for (const angle of angles) {
      try {
        // Rotar reloj para diferentes ángulos
        await page.evaluate((angleData) => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            // Simular drag para rotar
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const events = ['mousedown', 'mousemove', 'mouseup'];
            events.forEach(eventType => {
              const event = new MouseEvent(eventType, {
                clientX: centerX + angleData.rotation * 2,
                clientY: centerY,
                bubbles: true
              });
              canvas.dispatchEvent(event);
            });
          }
        }, angle);
        
        await page.waitForTimeout(1000);
        
        // Capturar screenshot
        const filename = this.generateFilename(config, index) + `.${angle.name}.png`;
        const filepath = path.join(this.outputDir, filename);
        
        await page.screenshot({
          path: filepath,
          fullPage: false,
          type: 'png',
          quality: 100
        });
        
        console.log(`  ✅ Guardado: ${angle.name} - ${filename}`);
        
      } catch (error) {
        console.error(`  ❌ Error capturando ángulo ${angle.name}:`, error.message);
      }
    }
  }
  
  async generateHighQualityRenders() {
    console.log('🚀 Iniciando renderizado automático con Playwright...');
    console.log(`📊 Configuraciones: ${this.configurations.length}`);
    console.log(`📐 Resolución: ${this.renderWidth}x${this.renderHeight}`);
    console.log(`📁 Directorio: ${this.outputDir}`);
    
    const browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--enable-webgl'
      ]
    });
    
    const context = await browser.newContext({
      viewport: { width: this.renderWidth, height: this.renderHeight },
      deviceScaleFactor: 2
    });
    
    try {
      for (let i = 0; i < this.configurations.length; i++) {
        const page = await context.newPage();
        
        await this.renderConfiguration(page, this.configurations[i], i, this.configurations.length);
        
        await page.close();
        
        // Pausa entre configuraciones
        if (i < this.configurations.length - 1) {
          console.log(`⏳ Esperando ${this.delayBetweenScreenshots}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenScreenshots));
        }
      }
      
    } finally {
      await context.close();
      await browser.close();
    }
    
    this.generateFinalReport();
  }
  
  generateFinalReport() {
    const files = fs.readdirSync(this.outputDir).filter(f => f.endsWith('.png'));
    const totalAngles = 5; // frontal, izquierda, derecha, superior, perspectiva
    const expectedFiles = this.configurations.length * totalAngles;
    
    const report = {
      timestamp: new Date().toISOString(),
      total_configurations: this.configurations.length,
      total_angles: totalAngles,
      expected_files: expectedFiles,
      successful_renders: files.length,
      render_rate: ((files.length / expectedFiles) * 100).toFixed(1) + '%',
      output_directory: this.outputDir,
      base_url: this.baseUrl,
      resolution: `${this.renderWidth}x${this.renderHeight}`,
      files: files.map(f => ({
        filename: f,
        size_kb: Math.round(fs.statSync(path.join(this.outputDir, f)).size / 1024),
        angle: f.includes('.frontal') ? 'frontal' : 
               f.includes('.izquierda') ? 'izquierda' :
               f.includes('.derecha') ? 'derecha' :
               f.includes('.superior') ? 'superior' : 'perspectiva'
      }))
    };
    
    const reportPath = path.join(this.outputDir, 'playwright_render_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🎯 RENDERIZADO COMPLETADO CON PLAYWRIGHT');
    console.log(`✅ Archivos generados: ${report.successful_renders}/${report.expected_files}`);
    console.log(`📈 Tasa de éxito: ${report.render_rate}`);
    console.log(`📊 Promedio por configuración: ${(report.successful_renders / this.configurations.length).toFixed(1)} ángulos`);
    console.log(`📁 Directorio: ${this.outputDir}`);
    console.log(`📄 Reporte completo: ${reportPath}`);
  }
}

// Ejecutar script
if (require.main === module) {
  const renderer = new WatchRendererPlaywright();
  renderer.generateHighQualityRenders().catch(console.error);
}

module.exports = WatchRendererPlaywright;
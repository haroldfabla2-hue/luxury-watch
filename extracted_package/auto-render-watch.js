const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Capturador Automático de Relojes 3D
 * Renderiza automáticamente todas las configuraciones de relojes
 * y guarda las imágenes en alta resolución
 */

class WatchRenderer {
  constructor() {
    this.baseUrl = 'https://r3095jalov3z.space.minimax.io';
    this.outputDir = './renders';
    this.delayBetweenScreenshots = 3000; // 3 segundos entre capturas
    this.maxWaitTime = 10000; // 10 segundos máximo de espera
    
    // Todas las configuraciones posibles de relojes
    this.configurations = [
      // Acero
      { caso: 'acero_inoxidable', esfera: 'blanca_lujo', manecillas: 'plateadas', crown: 'acero', strap: 'acero_milanese', complication: 'simple_date', bezel: 'liso_acero', case_size: '40mm' },
      { caso: 'acero_inoxidable', esfera: 'negra_premium', manecillas: 'plateadas', crown: 'acero', strap: 'cuero_negro', complication: 'chronograph', bezel: 'tachymeter', case_size: '42mm' },
      { caso: 'acero_inoxidable', esfera: 'azul_marina', manecillas: 'plateadas', crown: 'acero', strap: 'acero_milanese', complication: 'moon_phase', bezel: 'diamantes', case_size: '36mm' },
      
      // Oro
      { caso: 'oro_18k_amarillo', esfera: 'blanca_lujo', manecillas: 'oro_amarillo', crown: 'oro_amarillo', strap: 'cuero_marrón', complication: 'simple_date', bezel: 'liso_oro', case_size: '40mm' },
      { caso: 'oro_18k_amarillo', esfera: 'champagne_elegante', manecillas: 'oro_amarillo', crown: 'oro_amarillo', strap: 'oro_milanese', complication: 'day_date', bezel: 'diamantes', case_size: '42mm' },
      { caso: 'oro_18k_blanco', esfera: 'plateada_premium', manecillas: 'oro_blanco', crown: 'oro_blanco', strap: 'acero_milanese', complication: 'perpetual_calendar', bezel: 'cingulado', case_size: '38mm' },
      
      // Oro Rosa
      { caso: 'oro_18k_rosa', esfera: 'champagne_elegante', manecillas: 'oro_rosa', crown: 'oro_rosa', strap: 'cuero_negro', complication: 'chronograph', bezel: 'bisel_diamantes', case_size: '40mm' },
      { caso: 'oro_18k_rosa', esfera: 'blanca_lujo', manecillas: 'oro_rosa', crown: 'oro_rosa', strap: 'oro_milanese', complication: 'gmt', bezel: 'diamantes', case_size: '42mm' },
      
      // Titanio
      { caso: 'titanio_grado_5', esfera: 'negra_premium', manecillas: 'plateadas', crown: 'titanio', strap: 'titanio_milanese', complication: 'simple_date', bezel: 'liso_titanio', case_size: '44mm' },
      { caso: 'titanio_grado_5', esfera: 'azul_marina', manecillas: 'plateadas', crown: 'titanio', strap: 'caucuchou_negro', complication: 'chronograph', bezel: 'tachymeter_titanio', case_size: '42mm' },
      { caso: 'titanio_grado_5', esfera: 'plateada_premium', manecillas: 'plateadas', crown: 'titanio', strap: 'titanio_milanese', complication: 'day_night', bezel: 'ceramica_titanio', case_size: '40mm' },
      
      // Cerámica
      { caso: 'ceramica_negra', esfera: 'negra_luxury', manecillas: 'oro_amarillo', crown: 'ceramica', strap: 'ceramica_negra', complication: 'simple_date', bezel: 'ceramica_negra', case_size: '41mm' },
      { caso: 'ceramica_blanca', esfera: 'blanca_lujo', manecillas: 'oro_blanco', crown: 'ceramica', strap: 'ceramica_blanca', complication: 'moon_phase', bezel: 'ceramica_blanca', case_size: '41mm' },
      
      // Ediciones especiales
      { caso: 'acero_inoxidable', esfera: 'diamond_white', manecillas: 'diamante', crown: 'diamante', strap: 'oro_milanese', complication: 'tourbillon', bezel: 'diamantes_completo', case_size: '42mm' },
      { caso: 'oro_18k_amarillo', esfera: 'grand_complication', manecillas: 'oro_amarillo', crown: 'oro_amarillo', strap: 'cuero_crocodile', complication: 'grand_complication', bezel: 'diamantes_premium', case_size: '44mm' }
    ];
    
    this.setupOutputDirectory();
  }
  
  setupOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  generateFilename(config) {
    const parts = [
      config.caso,
      config.esfera,
      config.manecillas,
      config.strap,
      config.complication,
      config.bezel,
      config.case_size
    ];
    return parts.join('_').replace(/[^\w-]/g, '_') + '_3d_render.png';
  }
  
  async renderSingleConfiguration(browser, config, index, total) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    
    try {
      console.log(`\n🎨 Renderizando configuración ${index + 1}/${total}: ${config.caso}`);
      
      // Navegar al configurador
      await page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(5000); // Esperar carga completa
      
      // Aplicar configuración
      await this.applyConfiguration(page, config);
      await page.waitForTimeout(2000); // Esperar aplicación de cambios
      
      // Capturar pantalla
      const filename = this.generateFilename(config);
      const filepath = path.join(this.outputDir, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: true,
        type: 'png',
        omitBackground: false
      });
      
      console.log(`✅ Guardado: ${filename} (${filepath})`);
      
    } catch (error) {
      console.error(`❌ Error renderizando ${config.caso}:`, error.message);
    } finally {
      await page.close();
    }
  }
  
  async applyConfiguration(page, config) {
    try {
      // Esperar que el configurador cargue
      await page.waitForSelector('canvas', { timeout: 10000 });
      console.log('🎯 Canvas cargado, aplicando configuración...');
      
      // Aplicar configuración paso a paso
      await page.evaluate((configData) => {
        // Disparar eventos de cambio en el store de Zustand
        const store = window.configuratorStore;
        if (store) {
          store.updateConfiguration(configData);
        }
      }, config);
      
      await page.waitForTimeout(2000);
      
      // Simular interacciones para asegurar que se apliquen los cambios
      await page.mouse.move(960, 540); // Centro de la pantalla
      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.error('❌ Error aplicando configuración:', error.message);
    }
  }
  
  async generateHighQualityRenders() {
    console.log('🚀 Iniciando renderizado automático de relojes 3D...');
    console.log(`📊 Total de configuraciones: ${this.configurations.length}`);
    console.log(`📁 Directorio de salida: ${this.outputDir}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });
    
    try {
      for (let i = 0; i < this.configurations.length; i++) {
        await this.renderSingleConfiguration(browser, this.configurations[i], i, this.configurations.length);
        
        // Pausa entre renders para evitar sobrecarga
        if (i < this.configurations.length - 1) {
          console.log(`⏳ Esperando ${this.delayBetweenScreenshots}ms antes del siguiente render...`);
          await page.waitForTimeout(this.delayBetweenScreenshots);
        }
      }
      
    } finally {
      await browser.close();
    }
    
    this.generateSummaryReport();
  }
  
  generateSummaryReport() {
    const files = fs.readdirSync(this.outputDir).filter(f => f.endsWith('.png'));
    
    const report = {
      timestamp: new Date().toISOString(),
      total_configs: this.configurations.length,
      successful_renders: files.length,
      failed_renders: this.configurations.length - files.length,
      output_directory: this.outputDir,
      files: files.map(f => ({
        filename: f,
        size: fs.statSync(path.join(this.outputDir, f)).size
      }))
    };
    
    const reportPath = path.join(this.outputDir, 'render_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 REPORTE DE RENDERIZADO COMPLETADO');
    console.log(`✅ Renders exitosos: ${report.successful_renders}/${report.total_configs}`);
    console.log(`❌ Renders fallidos: ${report.failed_renders}`);
    console.log(`📁 Directorio: ${this.outputDir}`);
    console.log(`📄 Reporte: ${reportPath}`);
  }
}

// Ejecutar renderizado
if (require.main === module) {
  const renderer = new WatchRenderer();
  renderer.generateHighQualityRenders().catch(console.error);
}

module.exports = WatchRenderer;
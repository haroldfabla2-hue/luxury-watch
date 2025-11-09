#!/usr/bin/env node

/**
 * Script para descargar archivos HDRI del sistema de fallback robusto
 * Ejecutar desde la carpeta del proyecto
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// URLs de HDRI optimizadas para el sistema de fallback
const hdriFiles = {
  'studio.hdr': [
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/studio.hdr'
  ],
  'venice_sunset.hdr': [
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr', 
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/venice_sunset_1k.hdr'
  ],
  'outdoor.hdr': [
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/clarens_midday_1k.hdr',
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kiara_1_dawn_1k.hdr'
  ],
  'indoor.hdr': [
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/workshop_1k.hdr',
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lebombo_1k.hdr'
  ]
};

const outputDir = path.join(__dirname, 'luxurywatch', 'public', 'images', 'hdri');

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Creado directorio: ${outputDir}`);
}

/**
 * Descarga un archivo con múltiples URLs de fallback
 */
async function downloadFileWithFallback(filename, urls) {
  console.log(`\n🎬 Descargando ${filename}...`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(`📡 Intentando URL ${i + 1}/${urls.length}: ${url}`);
      
      await downloadFile(url, path.join(outputDir, filename));
      console.log(`✅ Descarga exitosa: ${filename}`);
      return true;
      
    } catch (error) {
      console.warn(`⚠️ Fallo URL ${i + 1}: ${error.message}`);
      if (i === urls.length - 1) {
        console.error(`❌ No se pudo descargar ${filename} desde ninguna URL`);
        return false;
      }
    }
  }
}

/**
 * Descarga un archivo individual
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filepath);
          console.log(`💾 Descargado: ${Math.round(stats.size / 1024)} KB`);
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Eliminar archivo parcial
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', reject);
  });
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando descarga de archivos HDRI para sistema de fallback robusto...\n');
  
  const results = {};
  
  for (const [filename, urls] of Object.entries(hdriFiles)) {
    results[filename] = await downloadFileWithFallback(filename, urls);
  }
  
  // Resumen final
  console.log('\n📊 RESUMEN DE DESCARGAS:');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  for (const [filename, success] of Object.entries(results)) {
    const status = success ? '✅ ÉXITO' : '❌ FALLÓ';
    console.log(`${filename.padEnd(25)} ${status}`);
    if (success) successCount++;
  }
  
  console.log('=' .repeat(50));
  console.log(`📈 Éxito: ${successCount}/${Object.keys(results).length} archivos`);
  
  if (successCount === Object.keys(results).length) {
    console.log('🎉 ¡Sistema HDRI completamente configurado!');
  } else {
    console.log('⚠️  Algunos archivos fallaron - el sistema usará URLs externas como fallback');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { downloadFileWithFallback, hdriFiles };
#!/usr/bin/env node

const { basicExample } = require('./basic-example');
const { runAgentExamples } = require('./agent-examples');
const { runMonitoringExamples } = require('./monitoring-examples');
const { createClient, createAgentSystem, createAPIServer } = require('../index');

/**
 * Menú interactivo para ejecutar ejemplos
 */
class ExampleRunner {
  constructor() {
    this.examples = {
      '1': {
        name: 'Ejemplo Básico',
        description: 'Uso básico del cliente OpenRouter',
        run: basicExample
      },
      '2': {
        name: 'Ejemplos de Agentes',
        description: 'Sistema de coordinación de agentes',
        run: runAgentExamples
      },
      '3': {
        name: 'Ejemplos de Monitoreo',
        description: 'Sistema de monitoreo y alertas',
        run: runMonitoringExamples
      },
      '4': {
        name: 'Todos los Ejemplos',
        description: 'Ejecutar todos los ejemplos',
        run: this.runAllExamples.bind(this)
      },
      '5': {
        name: 'Servidor API',
        description: 'Iniciar servidor API REST',
        run: this.startAPIServer.bind(this)
      },
      '6': {
        name: 'Test de Conexión',
        description: 'Solo probar conexión con OpenRouter',
        run: this.testConnection.bind(this)
      },
      '0': {
        name: 'Salir',
        description: 'Salir del programa',
        run: () => process.exit(0)
      }
    };
  }

  async runAllExamples() {
    console.log('🚀 Ejecutando todos los ejemplos...');
    
    console.log('\n' + '='.repeat(50));
    console.log('1️⃣  EJEMPLO BÁSICO');
    console.log('='.repeat(50));
    await basicExample();
    
    console.log('\n' + '='.repeat(50));
    console.log('2️⃣  EJEMPLOS DE AGENTES');
    console.log('='.repeat(50));
    await runAgentExamples();
    
    console.log('\n' + '='.repeat(50));
    console.log('3️⃣  EJEMPLOS DE MONITOREO');
    console.log('='.repeat(50));
    await runMonitoringExamples();
    
    console.log('\n✅ Todos los ejemplos completados!');
  }

  async startAPIServer() {
    console.log('🌐 Iniciando servidor API...');
    console.log('⚠️  Presiona Ctrl+C para detener el servidor');
    
    try {
      await createAPIServer(3000);
    } catch (error) {
      console.error('❌ Error iniciando servidor:', error.message);
    }
  }

  async testConnection() {
    console.log('🔌 Probando conexión con OpenRouter...');
    
    try {
      const client = await createClient();
      const health = await client.healthCheck();
      
      console.log('✅ Conexión exitosa!');
      console.log('💓 Estado:', health.status);
      console.log('⏱️  Tiempo de respuesta:', health.responseTime);
      
      const modelInfo = await client.getModelInfo();
      console.log('🤖 Modelo:', modelInfo.name);
      
      if (modelInfo.description) {
        console.log('📝 Descripción:', modelInfo.description);
      }
      
    } catch (error) {
      console.error('❌ Error de conexión:', error.message);
      console.log('\n💡 Verifica que tengas configurada la variable de entorno OPENROUTER_API_KEY');
    }
  }

  showMenu() {
    console.log('\n' + '╔' + '═'.repeat(50) + '╗');
    console.log('║' + ' '.repeat(10) + 'OPENROUTER GEMINI 2 INTEGRATION' + ' '.repeat(8) + '║');
    console.log('╠' + '═'.repeat(50) + '╣');
    
    Object.entries(this.examples).forEach(([key, example]) => {
      const description = example.description || '';
      const line = `${key}) ${example.name} - ${description}`;
      console.log('║ ' + line.padEnd(51) + '║');
    });
    
    console.log('╚' + '═'.repeat(50) + '╝');
    console.log('\nSelecciona una opción (0-6): ');
  }

  async run() {
    console.log('🎯 Sistema de Integración OpenRouter - Gemini 2.0 Experimental');
    console.log('📚 Desarrollado para coordinación de agentes con IA');
    
    while (true) {
      this.showMenu();
      
      try {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          rl.question('> ', resolve);
        });
        
        rl.close();
        
        const selectedExample = this.examples[answer.trim()];
        
        if (!selectedExample) {
          console.log('❌ Opción inválida. Por favor selecciona una opción del 0 al 6.');
          continue;
        }
        
        console.log(`\n🔄 Ejecutando: ${selectedExample.name}`);
        await selectedExample.run();
        
        if (answer.trim() !== '5' && answer.trim() !== '0') {
          console.log('\n✅ Ejemplo completado. Presiona Enter para continuar...');
          await new Promise(resolve => {
            require('readline').createInterface({
              input: process.stdin,
              output: process.stdout
            }).question('', resolve);
          });
        }
        
        if (answer.trim() === '0') {
          console.log('👋 ¡Hasta luego!');
          break;
        }
        
      } catch (error) {
        console.error('❌ Error ejecutando ejemplo:', error.message);
      }
    }
  }
}

// Verificar configuración inicial
function checkConfiguration() {
  console.log('🔍 Verificando configuración...');
  
  const requiredEnvVars = ['OPENROUTER_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Variables de entorno faltantes:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    console.log('\n💡 Configuración requerida:');
    console.log('1. Copia .env.example a .env');
    console.log('2. Configura OPENROUTER_API_KEY con tu clave de OpenRouter');
    console.log('3. Ejecuta el programa nuevamente');
    console.log('\n📚 Documentación: https://openrouter.ai/keys');
    
    return false;
  }
  
  console.log('✅ Configuración verificada');
  return true;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando OpenRouter Gemini 2 Integration...\n');
  
  if (!checkConfiguration()) {
    process.exit(1);
  }
  
  const runner = new ExampleRunner();
  await runner.run();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = ExampleRunner;
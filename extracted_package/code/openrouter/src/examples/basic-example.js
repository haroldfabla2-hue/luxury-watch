const { createClient } = require('../index');
const logger = require('../utils/logger');

/**
 * Ejemplo básico de uso del cliente OpenRouter
 */
async function basicExample() {
  console.log('🔄 Iniciando ejemplo básico...');
  
  try {
    // Crear cliente
    const client = await createClient();
    console.log('✅ Cliente inicializado');

    // Generar respuesta simple
    console.log('🤖 Generando respuesta simple...');
    const response = await client.generateResponse(
      '¿Cuál es la capital de España? Responde en español.',
      {
        temperature: 0.7,
        max_tokens: 100
      }
    );
    
    console.log('📝 Respuesta:', response.content);

    // Chat conversacional
    console.log('💬 Iniciando conversación...');
    const chatMessages = [
      {
        role: 'user',
        content: 'Hola, ¿cómo estás?'
      },
      {
        role: 'assistant', 
        content: '¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte?'
      },
      {
        role: 'user',
        content: 'Necesito ayuda con JavaScript'
      }
    ];

    const chatResponse = await client.chat(chatMessages);
    console.log('💬 Respuesta del chat:', chatResponse.content);

    // Obtener información del modelo
    console.log('📊 Obteniendo información del modelo...');
    const modelInfo = await client.getModelInfo();
    console.log('🧠 Modelo:', modelInfo.name);
    console.log('📝 Descripción:', modelInfo.description);

    // Estadísticas de uso
    console.log('📈 Obteniendo estadísticas de uso...');
    const usage = await client.getUsageStats();
    console.log('💰 Créditos restantes:', usage.remainingCredits);

    // Estado del sistema
    console.log('🏥 Verificando salud del sistema...');
    const health = await client.healthCheck();
    console.log('❤️  Estado:', health.status);
    console.log('⏱️  Tiempo de respuesta:', health.responseTime);

    console.log('✅ Ejemplo básico completado exitosamente');

  } catch (error) {
    console.error('❌ Error en ejemplo básico:', error.message);
    logger.error('Basic example error', { error: error.message });
  }
}

/**
 * Ejemplo de manejo de errores
 */
async function errorHandlingExample() {
  console.log('🔄 Iniciando ejemplo de manejo de errores...');
  
  try {
    const client = await createClient();

    // Ejemplo 1: Error de validación
    console.log('🚫 Probando manejo de errores de validación...');
    try {
      await client.generateResponse('', {}); // Prompt vacío
    } catch (error) {
      console.log('✅ Error capturado correctamente:', error.message);
    }

    // Ejemplo 2: Timeout simulando con max_tokens muy alto
    console.log('⏰ Probando manejo de timeout...');
    try {
      await client.generateResponse('Describe todo el universo en detalle', {
        max_tokens: 50000 // Esto puede causar timeout
      });
    } catch (error) {
      console.log('✅ Timeout manejado correctamente:', error.name);
    }

    // Ejemplo 3: Rate limiting simulado
    console.log('🚦 Simulando rate limiting...');
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        client.generateResponse(`Pregunta número ${i + 1}`, {
          temperature: 0.7,
          max_tokens: 50
        })
      );
    }

    try {
      await Promise.all(requests);
      console.log('✅ Múltiples requests completados');
    } catch (error) {
      console.log('✅ Error de rate limit manejado:', error.message);
    }

  } catch (error) {
    console.error('❌ Error en ejemplo de manejo:', error.message);
  }
}

/**
 * Ejemplo de uso de caché
 */
async function cacheExample() {
  console.log('🔄 Iniciando ejemplo de caché...');
  
  try {
    const client = await createClient();

    const prompt = '¿Qué es la inteligencia artificial?';
    
    // Primera llamada - sin caché
    console.log('📥 Primera llamada (sin caché)...');
    const start1 = Date.now();
    const response1 = await client.generateResponse(prompt);
    const time1 = Date.now() - start1;
    console.log(`⏱️  Tiempo: ${time1}ms`);

    // Segunda llamada - con caché
    console.log('📦 Segunda llamada (con caché)...');
    const start2 = Date.now();
    const response2 = await client.generateResponse(prompt);
    const time2 = Date.now() - start2;
    console.log(`⏱️  Tiempo: ${time2}ms`);
    
    if (time2 < time1) {
      console.log('✅ Caché funcionando - segunda llamada más rápida');
    }

    // Ver estadísticas del caché
    console.log('📊 Estadísticas del caché...');
    const cacheStats = client.getCacheStats();
    console.log('🎯 Hit Rate:', cacheStats.hitRate);
    console.log('🔑 Total Keys:', cacheStats.totalKeys);

    // Limpiar caché manualmente
    console.log('🧹 Limpiando caché...');
    client.clearCache();

  } catch (error) {
    console.error('❌ Error en ejemplo de caché:', error.message);
  }
}

/**
 * Ejecutar todos los ejemplos
 */
async function runAllExamples() {
  console.log('🚀 Iniciando todos los ejemplos de OpenRouter');
  console.log('=' .repeat(50));

  await basicExample();
  console.log('\n');
  
  await errorHandlingExample();
  console.log('\n');
  
  await cacheExample();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Todos los ejemplos completados');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  basicExample,
  errorHandlingExample,
  cacheExample,
  runAllExamples
};
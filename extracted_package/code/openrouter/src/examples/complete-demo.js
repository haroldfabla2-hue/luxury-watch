const { OpenRouterSystem } = require('./src/index');
const logger = require('./src/utils/logger');

/**
 * Script de demostración completo del sistema OpenRouter
 * 
 * Este script muestra todas las capacidades del sistema:
 * - Cliente básico
 * - Sistema de agentes
 * - API REST
 * - Monitoreo
 * - Logging
 */
async function demoCompleto() {
  console.log('🚀 DEMOSTRACIÓN COMPLETA SISTEMA OPENROUTER');
  console.log('=' .repeat(60));
  
  try {
    // Inicializar sistema completo
    console.log('📦 Inicializando sistema completo...');
    const system = new OpenRouterSystem();
    
    // Configurar para demo
    process.env.ENABLE_API = 'true';
    process.env.PORT = '3000';
    process.env.MONITORING_ENABLED = 'true';
    process.env.AGENT_COORDINATION_ENABLED = 'true';
    
    await system.initialize();
    console.log('✅ Sistema inicializado');
    
    // Mostrar estado inicial
    console.log('\n📊 Estado inicial del sistema:');
    const initialStatus = await system.getSystemStatus();
    console.log(JSON.stringify(initialStatus, null, 2));
    
    // 1. DEMOSTRACIÓN DEL CLIENTE BÁSICO
    console.log('\n' + '=' .repeat(60));
    console.log('1️⃣  DEMOSTRACIÓN CLIENTE BÁSICO');
    console.log('=' .repeat(60));
    
    const client = system.getClient();
    
    // Test de salud
    console.log('💓 Verificando salud del sistema...');
    const health = await client.healthCheck();
    console.log(`✅ Estado: ${health.status} | Tiempo respuesta: ${health.responseTime}`);
    
    // Test de generación simple
    console.log('\n🤖 Generando respuesta simple...');
    const response = await client.generateResponse(
      'Explica qué es OpenRouter en una frase',
      { temperature: 0.5, max_tokens: 100 }
    );
    console.log('💬 Respuesta:', response.content);
    
    // Test de chat
    console.log('\n💬 Probando chat conversacional...');
    const chatMessages = [
      { role: 'user', content: 'Hola, soy desarrollador' },
      { role: 'assistant', content: '¡Hola! Me da mucho gusto conocerte.' },
      { role: 'user', content: 'Necesito ayuda con integración de IA' }
    ];
    
    const chatResponse = await client.chat(chatMessages);
    console.log('💬 Respuesta del chat:', chatResponse.content);
    
    // 2. DEMOSTRACIÓN DEL SISTEMA DE AGENTES
    console.log('\n' + '=' .repeat(60));
    console.log('2️⃣  DEMOSTRACIÓN SISTEMA DE AGENTES');
    console.log('=' .repeat(60));
    
    const coordinator = system.getAgentCoordinator();
    
    // Registrar agentes especializados
    console.log('🤖 Registrando agentes especializados...');
    
    const agenteTraductor = coordinator.registerAgent('traductor', {
      name: 'Agente Traductor IA',
      type: 'translation',
      capabilities: ['translate', 'language', 'spanish'],
      systemPrompt: 'Eres un traductor profesional especializado en español. Traduces de manera precisa y natural.',
      temperature: 0.3,
      maxTokens: 200
    });
    
    const agenteAnalista = coordinator.registerAgent('analista', {
      name: 'Agente Analista de Datos',
      type: 'analysis',
      capabilities: ['analyze', 'data', 'insights'],
      systemPrompt: 'Eres un analista de datos experto. Proporcionas análisis detallados y recomendaciones basadas en datos.',
      temperature: 0.4,
      maxTokens: 300
    });
    
    console.log('✅ Agentes registrados:');
    console.log(`   🔤 Traductor (${agenteTraductor.id})`);
    console.log(`   📊 Analista (${agenteAnalista.id})`);
    
    // Crear tareas para agentes
    console.log('\n📋 Creando tareas para agentes...');
    
    const tareaTraduccion = coordinator.createTask({
      type: 'translation',
      prompt: 'Traduce "Artificial Intelligence is transforming the world" al español',
      priority: 1,
      context: { sourceLanguage: 'en', targetLanguage: 'es' }
    });
    
    const tareaAnalisis = coordinator.createTask({
      type: 'analysis',
      prompt: 'Analiza las ventajas del uso de agentes de IA en sistemas empresariales',
      priority: 1,
      context: { domain: 'enterprise', focus: 'benefits' }
    });
    
    console.log('📋 Tareas creadas:');
    console.log(`   🔤 Traducción (${tareaTraduccion})`);
    console.log(`   📊 Análisis (${tareaAnalisis})`);
    
    // Monitorear procesamiento
    console.log('\n⏳ Monitoreando procesamiento de tareas...');
    await monitorearTareas(coordinator, [tareaTraduccion, tareaAnalisis]);
    
    // Mostrar estadísticas de agentes
    console.log('\n📊 Estadísticas de agentes:');
    const statsAgentes = coordinator.getAgentsStatus();
    console.log(`🤖 Total agentes: ${statsAgentes.total}`);
    console.log(`🟢 Agentes inactivos: ${statsAgentes.idle}`);
    console.log(`🟡 Agentes ocupados: ${statsAgentes.busy}`);
    console.log(`📋 Tareas en cola: ${statsAgentes.queueLength}`);
    
    const statsTareas = coordinator.getTaskStats();
    console.log(`📈 Total tareas: ${statsTareas.total}`);
    console.log(`✅ Tareas completadas: ${statsTareas.completed}`);
    console.log(`❌ Tareas fallidas: ${statsTareas.failed}`);
    
    // 3. DEMOSTRACIÓN DE MONITOREO
    console.log('\n' + '=' .repeat(60));
    console.log('3️⃣  DEMOSTRACIÓN SISTEMA DE MONITOREO');
    console.log('=' .repeat(60));
    
    const monitoring = system.getMonitoringService();
    
    // Simular actividad para generar métricas
    console.log('📊 Generando actividad para métricas...');
    for (let i = 0; i < 5; i++) {
      await client.generateResponse(`Pregunta de prueba ${i + 1} para métricas`, {
        temperature: 0.6,
        max_tokens: 50
      });
    }
    
    // Generar reporte de monitoreo
    console.log('\n📈 Generando reporte de monitoreo...');
    const reporteMonitoreo = monitoring.generateReport();
    
    console.log('📊 Reporte de monitoreo:');
    console.log(`💓 Salud: ${reporteMonitoreo.metrics.health?.latest === 1 ? 'Saludable' : 'No saludable'}`);
    console.log(`⏱️  Tiempo respuesta promedio: ${reporteMonitoreo.metrics.responseTime?.avg?.toFixed(2)}ms`);
    console.log(`🎯 Cache hit rate: ${(reporteMonitoreo.metrics.cacheHitRate?.avg * 100)?.toFixed(1)}%`);
    console.log(`🚨 Alertas activas: ${reporteMonitoreo.alerts.unacknowledged}`);
    
    // Mostrar alertas si las hay
    if (reporteMonitoreo.alerts.recent.length > 0) {
      console.log('\n🚨 Alertas recientes:');
      reporteMonitoreo.alerts.recent.forEach(alerta => {
        console.log(`   ${alerta.severity.toUpperCase()}: ${alerta.message}`);
      });
    }
    
    // 4. DEMOSTRACIÓN DE API
    console.log('\n' + '=' .repeat(60));
    console.log('4️⃣  DEMOSTRACIÓN API REST');
    console.log('=' .repeat(60));
    
    const api = system.getAPI();
    console.log('🌐 API REST disponible en:');
    console.log('   📊 Health: http://localhost:3000/api/openrouter/health');
    console.log('   🤖 Chat: POST http://localhost:3000/api/openrouter/chat');
    console.log('   🤖 Generate: POST http://localhost:3000/api/openrouter/generate');
    console.log('   📊 Agentes: GET http://localhost:3000/api/openrouter/agents');
    console.log('   📈 Monitoreo: GET http://localhost:3000/api/openrouter/monitoring/report');
    
    // Test de endpoint
    console.log('\n🧪 Probando endpoint de health...');
    const axios = require('axios');
    try {
      const healthResponse = await axios.get('http://localhost:3000/api/openrouter/health');
      console.log('✅ API respondiendo correctamente');
      console.log('   Estado:', healthResponse.data.status);
    } catch (error) {
      console.log('⚠️  API no disponible (puede estar iniciándose)');
    }
    
    // 5. DEMOSTRACIÓN DE CACHE Y RATE LIMITING
    console.log('\n' + '=' .repeat(60));
    console.log('5️⃣  DEMOSTRACIÓN CACHE Y RATE LIMITING');
    console.log('=' .repeat(60));
    
    // Test de cache
    console.log('💾 Probando sistema de cache...');
    const promptCache = '¿Qué es el machine learning?';
    
    const inicio1 = Date.now();
    await client.generateResponse(promptCache, { max_tokens: 100 });
    const tiempo1 = Date.now() - inicio1;
    
    const inicio2 = Date.now();
    await client.generateResponse(promptCache, { max_tokens: 100 });
    const tiempo2 = Date.now() - inicio2;
    
    console.log(`⏱️  Primera llamada: ${tiempo1}ms`);
    console.log(`⏱️  Segunda llamada (cache): ${tiempo2}ms`);
    console.log(`🚀 Aceleración: ${(tiempo1 / tiempo2).toFixed(1)}x más rápido`);
    
    // Mostrar estadísticas de cache
    const statsCache = client.getCacheStats();
    console.log('\n📊 Estadísticas de cache:');
    console.log(`🎯 Hit rate: ${statsCache.hitRate}`);
    console.log(`🔑 Entradas activas: ${statsCache.totalKeys}`);
    console.log(`📦 Total requests: ${statsCache.hits + statsCache.misses}`);
    
    // Mostrar rate limiting
    const statsRateLimit = client.getRateLimitStats();
    console.log('\n📊 Estado de rate limiting:');
    console.log(`⏱️  Por minuto: ${statsRateLimit.currentUsage.minute}/${statsRateLimit.limits.perMinute}`);
    console.log(`🕐 Por hora: ${statsRateLimit.currentUsage.hour}/${statsRateLimit.limits.perHour}`);
    console.log(`📅 Por día: ${statsRateLimit.currentUsage.day}/${statsRateLimit.limits.perDay}`);
    
    // 6. DEMOSTRACIÓN DE MANEJO DE ERRORES
    console.log('\n' + '=' .repeat(60));
    console.log('6️⃣  DEMOSTRACIÓN MANEJO DE ERRORES');
    console.log('=' .repeat(60));
    
    console.log('🚫 Probando manejo de errores...');
    
    // Error de validación (prompt vacío)
    try {
      await client.generateResponse('', {});
    } catch (error) {
      console.log('✅ Error de validación manejado:', error.name);
    }
    
    // Error de límite de velocidad (simulado con múltiples requests)
    console.log('\n🚦 Simulando rate limiting...');
    const requests = [];
    for (let i = 0; i < 3; i++) {
      requests.push(
        client.generateResponse(`Pregunta ${i + 1}`, { max_tokens: 20 })
      );
    }
    
    try {
      await Promise.all(requests);
      console.log('✅ Múltiples requests procesados correctamente');
    } catch (error) {
      console.log('⚠️  Rate limiting detectado:', error.name);
    }
    
    // RESUMEN FINAL
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 RESUMEN DE DEMOSTRACIÓN');
    console.log('=' .repeat(60));
    
    const statusFinal = await system.getSystemStatus();
    
    console.log('✅ Componentes funcionando:');
    console.log(`   🤖 Cliente: ${statusFinal.components.client ? '✅' : '❌'}`);
    console.log(`   🔄 Agentes: ${statusFinal.components.agentCoordinator ? '✅' : '❌'}`);
    console.log(`   📊 Monitoreo: ${statusFinal.components.monitoringService ? '✅' : '❌'}`);
    console.log(`   🌐 API: ${statusFinal.components.api ? '✅' : '❌'}`);
    
    console.log('\n📈 Estadísticas de la sesión:');
    const statsFinales = coordinator.getTaskStats();
    console.log(`📋 Total tareas procesadas: ${statsFinales.completed}`);
    console.log(`🎯 Cache hit rate: ${(await client.getCacheStats()).hitRate}`);
    console.log(`⏰ Uptime del sistema: ${(process.uptime()).toFixed(1)}s`);
    
    console.log('\n🚀 DEMOSTRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('📚 Para usar el sistema:');
    console.log('   1. Ejecuta: node src/examples/index.js (ejemplos interactivos)');
    console.log('   2. O ejecuta: npm start (servidor API)');
    console.log('   3. Lee la documentación completa en README.md');
    
  } catch (error) {
    console.error('❌ Error en demostración:', error.message);
    logger.error('Demo completo error', { error: error.stack });
  }
}

/**
 * Función auxiliar para monitorear el progreso de tareas
 */
async function monitorearTareas(coordinator, taskIds, timeout = 10000) {
  const inicio = Date.now();
  
  while (Date.now() - inicio < timeout) {
    const stats = coordinator.getTaskStats();
    const completadas = stats.completed;
    const total = taskIds.length;
    
    console.log(`📊 Progreso: ${completadas}/${total} tareas completadas`);
    
    if (completadas >= total) {
      console.log('✅ Todas las tareas completadas');
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (Date.now() - inicio >= timeout) {
    console.log('⏰ Timeout alcanzado, algunas tareas pueden estar procesándose');
  }
}

// Ejecutar demostración si se llama directamente
if (require.main === module) {
  demoCompleto().catch(error => {
    console.error('❌ Error fatal en demostración:', error.message);
    process.exit(1);
  });
}

module.exports = { demoCompleto };
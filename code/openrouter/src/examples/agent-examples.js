const { createAgentSystem } = require('../index');
const logger = require('../utils/logger');

/**
 * Ejemplo avanzado del sistema de coordinación de agentes
 */
async function agentCoordinationExample() {
  console.log('🤖 Iniciando ejemplo de coordinación de agentes...');
  
  try {
    // Crear sistema con agentes
    const system = await createAgentSystem();
    const coordinator = system.getAgentCoordinator();
    
    console.log('✅ Sistema de agentes inicializado');

    // Registrar agentes especializados
    console.log('📝 Registrando agentes especializados...');
    
    const translatorAgent = coordinator.registerAgent('translator', {
      name: 'Agente Traductor',
      type: 'translation',
      capabilities: ['translate', 'language'],
      systemPrompt: 'Eres un traductor experto. Traduce textos de manera precisa y natural.',
      temperature: 0.3,
      maxTokens: 1000
    });

    const coderAgent = coordinator.registerAgent('coder', {
      name: 'Agente Programador',
      type: 'coding',
      capabilities: ['code', 'debug', 'review'],
      systemPrompt: 'Eres un programador experto. Escribe código limpio, eficiente y bien documentado.',
      temperature: 0.1,
      maxTokens: 1500
    });

    const analystAgent = coordinator.registerAgent('analyst', {
      name: 'Agente Analista',
      type: 'analysis',
      capabilities: ['analyze', 'report', 'insights'],
      systemPrompt: 'Eres un analista experto. Proporciona análisis detallados y recomendaciones.',
      temperature: 0.5,
      maxTokens: 1200
    });

    console.log('✅ Agentes registrados:', [translatorAgent.id, coderAgent.id, analystAgent.id]);

    // Crear tareas para los agentes
    console.log('📋 Creando tareas...');
    
    const translationTask = coordinator.createTask({
      type: 'translation',
      prompt: 'Traduce el siguiente texto del inglés al español: "The quick brown fox jumps over the lazy dog"',
      priority: 1,
      context: { sourceLanguage: 'en', targetLanguage: 'es' }
    });

    const codingTask = coordinator.createTask({
      type: 'coding',
      prompt: 'Escribe una función en JavaScript que calcule el factorial de un número',
      priority: 2,
      context: { language: 'javascript', complexity: 'basic' }
    });

    const analysisTask = coordinator.createTask({
      type: 'analysis',
      prompt: 'Analiza las ventajas y desventajas de usar TypeScript en proyectos grandes',
      priority: 1,
      context: { topic: 'typescript', scope: 'enterprise' }
    });

    console.log('📋 Tareas creadas:', [translationTask, codingTask, analysisTask]);

    // Esperar un poco para que las tareas se procesen
    console.log('⏳ Esperando procesamiento de tareas...');
    await waitForTasks(coordinator, [translationTask, codingTask, analysisTask], 10000);

    // Mostrar resultados
    console.log('📊 Verificando estado de las tareas...');
    const taskStats = coordinator.getTaskStats();
    console.log('📈 Estadísticas de tareas:', taskStats);

    const agentStatus = coordinator.getAgentsStatus();
    console.log('🤖 Estado de agentes:', {
      total: agentStatus.total,
      idle: agentStatus.idle,
      busy: agentStatus.busy
    });

    console.log('✅ Ejemplo de coordinación completado');

  } catch (error) {
    console.error('❌ Error en ejemplo de agentes:', error.message);
    logger.error('Agent coordination example error', { error: error.message });
  }
}

/**
 * Ejemplo de procesamiento batch con agentes
 */
async function batchProcessingExample() {
  console.log('📦 Iniciando ejemplo de procesamiento batch...');
  
  try {
    const system = await createAgentSystem();
    const coordinator = system.getAgentCoordinator();

    // Registrar un agente para batch processing
    const batchAgent = coordinator.registerAgent('batch-processor', {
      name: 'Procesador Batch',
      type: 'general',
      capabilities: ['batch', 'parallel'],
      systemPrompt: 'Procesas múltiples tareas de manera eficiente.',
      temperature: 0.4,
      maxTokens: 800
    });

    console.log('✅ Agente batch registrado');

    // Crear múltiples tareas similares
    const tasks = [];
    const prompts = [
      'Define qué es un algoritmo',
      'Explica qué es una base de datos',
      'Describe qué es la programación orientada a objetos',
      'Qué es la inteligencia artificial',
      'Define el concepto de API'
    ];

    console.log('📋 Creando tareas batch...');
    prompts.forEach((prompt, index) => {
      const taskId = coordinator.createTask({
        type: 'general',
        prompt: prompt,
        priority: 0,
        context: { batchId: 'batch-1', taskNumber: index + 1 }
      });
      tasks.push(taskId);
    });

    console.log(`📦 ${tasks.length} tareas creadas para procesamiento batch`);

    // Monitorear el procesamiento
    console.log('🔄 Monitoreando procesamiento...');
    await monitorBatchProcessing(coordinator, tasks, 15000);

    console.log('✅ Procesamiento batch completado');

  } catch (error) {
    console.error('❌ Error en procesamiento batch:', error.message);
  }
}

/**
 * Ejemplo de manejo de errores en agentes
 */
async function agentErrorHandlingExample() {
  console.log('🚫 Iniciando ejemplo de manejo de errores en agentes...');
  
  try {
    const system = await createAgentSystem();
    const coordinator = system.getAgentCoordinator();

    // Registrar agente
    const testAgent = coordinator.registerAgent('test-agent', {
      name: 'Agente de Pruebas',
      type: 'testing',
      systemPrompt: 'Agente para probar manejo de errores.',
      temperature: 0.5,
      maxTokens: 500
    });

    // Crear tarea que fallará intencionalmente
    const failingTask = coordinator.createTask({
      type: 'testing',
      prompt: '', // Prompt vacío causará error de validación
      priority: 1
    });

    console.log('📋 Tarea que fallará creada:', failingTask);

    // Esperar y ver cómo maneja el error
    console.log('⏳ Esperando manejo de errores...');
    await waitForTasks(coordinator, [failingTask], 8000);

    // Ver estadísticas
    const taskStats = coordinator.getTaskStats();
    console.log('📊 Estadísticas después del error:', {
      total: taskStats.total,
      failed: taskStats.failed,
      completed: taskStats.completed
    });

    console.log('✅ Manejo de errores en agentes completado');

  } catch (error) {
    console.error('❌ Error en ejemplo de manejo:', error.message);
  }
}

/**
 * Ejemplo de cancelación de tareas
 */
async function taskCancellationExample() {
  console.log('🛑 Iniciando ejemplo de cancelación de tareas...');
  
  try {
    const system = await createAgentSystem();
    const coordinator = system.getAgentCoordinator();

    // Registrar agente
    const cancelAgent = coordinator.registerAgent('cancel-test', {
      name: 'Agente Cancelación',
      type: 'testing',
      systemPrompt: 'Agente para probar cancelación de tareas.',
      temperature: 0.5,
      maxTokens: 2000
    });

    // Crear tarea larga
    const longTask = coordinator.createTask({
      type: 'testing',
      prompt: 'Escribe un ensayo muy largo sobre la historia de la computación, incluyendo múltiples secciones detalladas',
      priority: 0
    });

    console.log('📋 Tarea larga creada:', longTask);

    // Esperar un poco y luego cancelar
    setTimeout(() => {
      console.log('🛑 Cancelando tarea...');
      const cancelled = coordinator.cancelTask(longTask);
      console.log('✅ Tarea cancelada:', cancelled);
    }, 2000);

    // Esperar a que se complete o cancele
    await waitForTasks(coordinator, [longTask], 8000);

    console.log('✅ Ejemplo de cancelación completado');

  } catch (error) {
    console.error('❌ Error en cancelación:', error.message);
  }
}

/**
 * Función auxiliar para esperar que se completen las tareas
 */
async function waitForTasks(coordinator, taskIds, timeout = 10000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const allDone = taskIds.every(taskId => {
      // Esta función requeriría acceso a las tareas internas
      // Por simplicidad, esperamos el timeout
      return true;
    });
    
    if (allDone) break;
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Función auxiliar para monitorear procesamiento batch
 */
async function monitorBatchProcessing(coordinator, taskIds, timeout = 15000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const stats = coordinator.getTaskStats();
    console.log(`📊 Progreso: ${stats.completed}/${taskIds.length} completadas`);
    
    if (stats.completed >= taskIds.length) break;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Ejecutar todos los ejemplos de agentes
 */
async function runAgentExamples() {
  console.log('🤖 Iniciando ejemplos de sistema de agentes');
  console.log('=' .repeat(50));

  await agentCoordinationExample();
  console.log('\n');
  
  await batchProcessingExample();
  console.log('\n');
  
  await agentErrorHandlingExample();
  console.log('\n');
  
  await taskCancellationExample();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Todos los ejemplos de agentes completados');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAgentExamples().catch(console.error);
}

module.exports = {
  agentCoordinationExample,
  batchProcessingExample,
  agentErrorHandlingExample,
  taskCancellationExample,
  runAgentExamples
};
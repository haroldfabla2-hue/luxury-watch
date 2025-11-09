const { createOpenRouterSystem } = require('../index');
const logger = require('../utils/logger');

/**
 * Ejemplo del sistema de monitoreo y alertas
 */
async function monitoringExample() {
  console.log('📊 Iniciando ejemplo de monitoreo...');
  
  try {
    // Crear sistema completo con monitoreo
    const system = await createOpenRouterSystem();
    const monitoring = system.getMonitoringService();
    
    console.log('✅ Sistema con monitoreo inicializado');

    // Simular algunas operaciones para generar métricas
    console.log('🔄 Generando operaciones para monitorear...');
    await generateTestOperations(system.getClient());

    // Obtener reporte de monitoreo
    console.log('📈 Obteniendo reporte de monitoreo...');
    const report = monitoring.generateReport();
    
    console.log('📊 Estado del sistema:');
    console.log('  ❤️  Salud:', report.metrics.health?.latest === 1 ? 'Saludable' : 'No saludable');
    console.log('  ⏱️  Tiempo de respuesta promedio:', report.metrics.responseTime?.avg?.toFixed(2) + 'ms');
    console.log('  🎯 Cache hit rate:', (report.metrics.cacheHitRate?.avg * 100)?.toFixed(1) + '%');
    
    if (report.alerts.recent.length > 0) {
      console.log('  🚨 Alertas recientes:', report.alerts.recent.length);
      report.alerts.recent.forEach(alert => {
        console.log(`    - ${alert.severity.toUpperCase()}: ${alert.message}`);
      });
    } else {
      console.log('  ✅ Sin alertas recientes');
    }

    console.log('✅ Ejemplo de monitoreo básico completado');

  } catch (error) {
    console.error('❌ Error en monitoreo básico:', error.message);
  }
}

/**
 * Ejemplo de monitoreo en tiempo real
 */
async function realtimeMonitoringExample() {
  console.log('⏰ Iniciando monitoreo en tiempo real...');
  
  try {
    const system = await createOpenRouterSystem();
    const monitoring = system.getMonitoringService();
    const client = system.getClient();

    // Configurar listener para alertas
    monitoring.on('alert', (alert) => {
      console.log(`🚨 ALERTA RECIBIDA: ${alert.severity.toUpperCase()} - ${alert.message}`);
      console.log('📊 Datos:', JSON.stringify(alert.data, null, 2));
    });

    console.log('✅ Listener de alertas configurado');

    // Simular operaciones que pueden generar alertas
    console.log('🔄 Simulando operaciones con monitoreo...');
    
    for (let i = 0; i < 10; i++) {
      console.log(`🔄 Operación ${i + 1}/10...`);
      
      // Operación normal
      await client.generateResponse(`Pregunta número ${i + 1}`, {
        temperature: 0.7,
        max_tokens: 100
      });

      // Verificar estado cada 3 operaciones
      if (i % 3 === 0) {
        const health = await client.healthCheck();
        console.log(`💓 Salud: ${health.status}, Tiempo respuesta: ${health.responseTime}`);
        
        const cacheStats = client.getCacheStats();
        console.log(`🎯 Cache hit rate: ${cacheStats.hitRate}%`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Monitoreo en tiempo real completado');

  } catch (error) {
    console.error('❌ Error en monitoreo tiempo real:', error.message);
  }
}

/**
 * Ejemplo de exportación de métricas
 */
async function metricsExportExample() {
  console.log('📤 Iniciando exportación de métricas...');
  
  try {
    const system = await createOpenRouterSystem();
    const monitoring = system.getMonitoringService();
    const client = system.getClient();

    // Generar algunas métricas
    console.log('📊 Generando métricas...');
    for (let i = 0; i < 5; i++) {
      await client.generateResponse(`Pregunta para métricas ${i + 1}`);
    }

    // Exportar métricas
    console.log('📤 Exportando métricas...');
    const exportData = monitoring.exportMetrics(Date.now() - 3600000); // Última hora
    
    // Guardar en archivo
    const fs = require('fs');
    const filename = `metrics-export-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, exportData);
    
    console.log(`✅ Métricas exportadas a: ${filename}`);

    // Mostrar resumen de métricas
    const report = monitoring.generateReport();
    console.log('📊 Resumen de métricas:');
    
    Object.keys(report.metrics).forEach(metricName => {
      const metric = report.metrics[metricName];
      if (metric) {
        console.log(`  📈 ${metricName}:`, {
          promedio: metric.avg?.toFixed(2),
          minimo: metric.min,
          maximo: metric.max,
          muestras: metric.count
        });
      }
    });

    console.log('✅ Exportación de métricas completada');

  } catch (error) {
    console.error('❌ Error en exportación:', error.message);
  }
}

/**
 * Ejemplo de gestión de alertas
 */
async function alertManagementExample() {
  console.log('🚨 Iniciando gestión de alertas...');
  
  try {
    const system = await createOpenRouterSystem();
    const monitoring = system.getMonitoringService();
    const client = system.getClient();

    // Generar algunas alertas manualmente
    console.log('🔔 Generando alertas de prueba...');
    
    monitoring.addAlert('warning', 'Test warning alert', {
      test: true,
      source: 'manual_test'
    });

    monitoring.addAlert('critical', 'Test critical alert', {
      test: true,
      severity: 'high',
      source: 'manual_test'
    });

    monitoring.addAlert('info', 'Test info alert', {
      test: true,
      source: 'manual_test'
    });

    // Obtener alertas
    console.log('📋 Obteniendo alertas...');
    
    const allAlerts = monitoring.getAlerts();
    console.log(`📊 Total de alertas: ${allAlerts.length}`);
    
    const unacknowledgedAlerts = monitoring.getAlerts({ acknowledged: false });
    console.log(`🔔 Alertas no reconocidas: ${unacknowledgedAlerts.length}`);

    // Reconocer alertas
    if (allAlerts.length > 0) {
      const alertToAcknowledge = allAlerts[0];
      const acknowledged = monitoring.acknowledgeAlert(alertToAcknowledge.id);
      console.log(`✅ Alerta reconocida: ${acknowledged}`);
    }

    // Mostrar alertas por severidad
    ['critical', 'warning', 'info'].forEach(severity => {
      const severityAlerts = monitoring.getAlerts({ severity });
      console.log(`🚨 Alertas ${severity}: ${severityAlerts.length}`);
    });

    // Generar reporte completo
    const report = monitoring.generateReport();
    console.log('📊 Reporte de alertas:', {
      total: report.alerts.total,
      no_reconocidas: report.alerts.unacknowledged,
      recientes: report.alerts.recent.length
    });

    console.log('✅ Gestión de alertas completada');

  } catch (error) {
    console.error('❌ Error en gestión de alertas:', error.message);
  }
}

/**
 * Función auxiliar para generar operaciones de prueba
 */
async function generateTestOperations(client) {
  const prompts = [
    '¿Qué es la programación?',
    'Explica el concepto de algoritmo',
    'Define base de datos',
    'Qué es el machine learning',
    'Explica la nube',
    'Define API',
    'Qué es DevOps',
    'Explica ciberseguridad',
    'Define blockchain',
    'Qué es IoT'
  ];

  console.log(`🔄 Ejecutando ${prompts.length} operaciones de prueba...`);
  
  for (let i = 0; i < prompts.length; i++) {
    try {
      await client.generateResponse(prompts[i], {
        temperature: 0.7,
        max_tokens: 50
      });
      
      if ((i + 1) % 3 === 0) {
        console.log(`✅ ${i + 1}/${prompts.length} operaciones completadas`);
      }
    } catch (error) {
      console.log(`⚠️  Error en operación ${i + 1}:`, error.message);
    }
  }
}

/**
 * Ejemplo completo de monitoreo integrado
 */
async function fullMonitoringExample() {
  console.log('🎯 Iniciando ejemplo completo de monitoreo...');
  
  try {
    const system = await createOpenRouterSystem();
    const monitoring = system.getMonitoringService();
    const client = system.getClient();

    console.log('✅ Sistema completo inicializado con monitoreo');

    // Configurar listeners para diferentes eventos
    monitoring.on('alert', (alert) => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] 🚨 ${alert.severity.toUpperCase()}: ${alert.message}`);
      
      if (alert.severity === 'critical') {
        console.log('🚨 ALERTA CRÍTICA - Acción requerida!');
      }
    });

    // Bucle principal de monitoreo
    console.log('🔄 Iniciando bucle de monitoreo...');
    
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`\n📊 Ciclo de monitoreo ${cycle}/3`);
      
      // Generar actividad
      console.log('🔄 Generando actividad...');
      await generateTestOperations(client);
      
      // Verificar estado del sistema
      console.log('💓 Verificando salud del sistema...');
      const health = await client.healthCheck();
      console.log(`💓 Estado: ${health.status}`);
      
      // Obtener estadísticas
      console.log('📈 Obteniendo estadísticas...');
      const report = monitoring.generateReport();
      
      console.log('📊 Estadísticas del ciclo:');
      console.log(`  ⏱️  Tiempo respuesta promedio: ${report.metrics.responseTime?.avg?.toFixed(2)}ms`);
      console.log(`  🎯 Cache hit rate: ${(report.metrics.cacheHitRate?.avg * 100)?.toFixed(1)}%`);
      console.log(`  🚨 Alertas activas: ${report.alerts.unacknowledged}`);
      
      if (report.alerts.recent.length > 0) {
        console.log('  📋 Alertas recientes:');
        report.alerts.recent.slice(0, 3).forEach(alert => {
          console.log(`    - ${alert.severity}: ${alert.message}`);
        });
      }
    }

    // Resumen final
    console.log('\n📊 RESUMEN FINAL');
    const finalReport = monitoring.generateReport();
    const exportData = monitoring.exportMetrics();
    
    console.log(`✅ Ejemplo completo finalizado`);
    console.log(`📊 Métricas generadas: ${Object.keys(finalReport.metrics).length}`);
    console.log(`🚨 Alertas totales: ${finalReport.alerts.total}`);
    console.log(`📈 Duración del monitoreo: ${process.uptime().toFixed(1)}s`);

  } catch (error) {
    console.error('❌ Error en ejemplo completo:', error.message);
  }
}

/**
 * Ejecutar todos los ejemplos de monitoreo
 */
async function runMonitoringExamples() {
  console.log('📊 Iniciando ejemplos de monitoreo OpenRouter');
  console.log('=' .repeat(60));

  await monitoringExample();
  console.log('\n');
  
  await realtimeMonitoringExample();
  console.log('\n');
  
  await metricsExportExample();
  console.log('\n');
  
  await alertManagementExample();
  console.log('\n');
  
  await fullMonitoringExample();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Todos los ejemplos de monitoreo completados');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMonitoringExamples().catch(console.error);
}

module.exports = {
  monitoringExample,
  realtimeMonitoringExample,
  metricsExportExample,
  alertManagementExample,
  fullMonitoringExample,
  runMonitoringExamples
};
# Sistema de Integración OpenRouter - Gemini 2.0 Experimental Free

## 🚀 Descripción

Sistema completo de integración con OpenRouter para utilizar Gemini 2.0 Experimental Free, diseñado específicamente para la coordinación de agentes inteligentes con capacidades avanzadas de rate limiting, cache, monitoreo y API REST.

## ✨ Características Principales

- 🤖 **Sistema de Coordinación de Agentes**: Gestión inteligente de múltiples agentes con balanceador de carga
- 🔄 **Rate Limiting Avanzado**: Control de límites por minuto, hora y día
- 💾 **Sistema de Cache Inteligente**: Optimización de respuestas y reducción de costos
- 📊 **Monitoreo en Tiempo Real**: Métricas, alertas y reportes de uso
- 🌐 **API REST Completa**: Endpoints para todas las funcionalidades
- 🛡️ **Manejo Robusto de Errores**: Recuperación automática y logging detallado
- 📈 **Estadísticas y Análisis**: Seguimiento de uso y rendimiento
- 🔧 **Configuración Flexible**: Variables de entorno y configuraciones adaptativas

## 📦 Instalación

### Prerrequisitos

- Node.js 16+ 
- API Key de OpenRouter

### Pasos de Instalación

1. **Clonar y navegar al directorio**
   ```bash
   cd code/openrouter
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Edita .env y configura tu OPENROUTER_API_KEY
   ```

4. **Verificar configuración**
   ```bash
   npm run test
   ```

## 🔧 Configuración

### Variables de Entorno Principales

```bash
# OpenRouter Configuration
OPENROUTER_API_KEY=tu_api_key_aqui
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free

# Rate Limiting Configuration
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
RATE_LIMIT_REQUESTS_PER_DAY=10000

# Cache Configuration
CACHE_TTL_SECONDS=3600
CACHE_MAX_SIZE=1000

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000

# API Configuration
ENABLE_API=true
PORT=3000
```

### Configuración Personalizada

El sistema permite configurar todos los aspectos mediante el archivo `src/config/index.js`:

- Límites de rate limiting
- Configuración de cache
- Parámetros de logging
- Configuración de agentes
- Umbrales de monitoreo

## 🚀 Uso Rápido

### Uso Básico del Cliente

```javascript
const { createClient } = require('./src/index');

async function ejemplo() {
  // Crear cliente
  const client = await createClient();
  
  // Generar respuesta simple
  const response = await client.generateResponse(
    '¿Cuál es la capital de España?',
    { temperature: 0.7, max_tokens: 100 }
  );
  
  console.log(response.content);
  
  // Chat conversacional
  const messages = [
    { role: 'user', content: 'Hola!' },
    { role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte?' },
    { role: 'user', content: 'Necesito ayuda con JavaScript' }
  ];
  
  const chatResponse = await client.chat(messages);
  console.log(chatResponse.content);
}
```

### Sistema de Agentes

```javascript
const { createAgentSystem } = require('./src/index');

async function ejemploAgentes() {
  // Crear sistema con agentes
  const system = await createAgentSystem();
  const coordinator = system.getAgentCoordinator();
  
  // Registrar agente
  const agent = coordinator.registerAgent('mi-agente', {
    name: 'Agente Procesador',
    type: 'general',
    capabilities: ['procesar', 'analizar'],
    systemPrompt: 'Eres un agente experto en procesamiento.',
    temperature: 0.5
  });
  
  // Crear tarea
  const taskId = coordinator.createTask({
    type: 'general',
    prompt: 'Analiza el siguiente texto: "Hola mundo"',
    priority: 1
  });
  
  // Monitorear progreso
  setInterval(() => {
    const stats = coordinator.getTaskStats();
    console.log(`Tareas completadas: ${stats.completed}`);
  }, 1000);
}
```

### Servidor API

```javascript
const { createAPIServer } = require('./src/index');

async function iniciarServidor() {
  const system = await createAPIServer(3000);
  console.log('🌐 Servidor iniciado en http://localhost:3000');
}

// O usar la CLI
// npm start
```

## 📚 Documentación de la API

### Endpoints Principales

#### Chat y Generación

```bash
# Chat conversacional
POST /api/openrouter/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hola!"},
    {"role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?"},
    {"role": "user", "content": "Ayuda con JavaScript"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}

# Respuesta:
{
  "success": true,
  "data": {
    "content": "JavaScript es un lenguaje de programación...",
    "usage": {...},
    "model": "google/gemini-2.0-flash-exp:free"
  }
}
```

```bash
# Generación simple
POST /api/openrouter/generate
Content-Type: application/json

{
  "prompt": "¿Qué es la inteligencia artificial?",
  "temperature": 0.7,
  "max_tokens": 500
}
```

#### Gestión de Agentes

```bash
# Registrar agente
POST /api/openrouter/agents/register
Content-Type: application/json

{
  "name": "Agente Traductor",
  "type": "translation",
  "capabilities": ["translate", "language"],
  "systemPrompt": "Eres un traductor experto.",
  "temperature": 0.3
}

# Crear tarea para agente
POST /api/openrouter/agents/{agentId}/task
Content-Type: application/json

{
  "prompt": "Traduce 'Hello World' al español",
  "type": "translation",
  "priority": 1
}

# Obtener estado de agentes
GET /api/openrouter/agents
```

#### Monitoreo

```bash
# Reporte de monitoreo
GET /api/openrouter/monitoring/report

# Alertas
GET /api/openrouter/monitoring/alerts

# Reconocer alerta
POST /api/openrouter/monitoring/alerts/{alertId}/acknowledge

# Métricas
GET /api/openrouter/monitoring/metrics?metric=health.responseTime
```

#### Sistema

```bash
# Health check
GET /api/openrouter/health

# Información del modelo
GET /api/openrouter/model

# Estadísticas de uso
GET /api/openrouter/usage

# Estado del sistema
GET /api/openrouter/system/status
```

### Ejemplos de Uso con cURL

```bash
# Probar conexión
curl http://localhost:3000/api/openrouter/health

# Generar respuesta
curl -X POST http://localhost:3000/api/openrouter/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "¿Qué es el machine learning?",
    "temperature": 0.7
  }'

# Registrar agente
curl -X POST http://localhost:3000/api/openrouter/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agente Analista",
    "type": "analysis",
    "systemPrompt": "Eres un analista experto."
  }'
```

## 🛠️ Ejemplos Ejecutables

El proyecto incluye ejemplos interactivos:

```bash
# Ejecutar ejemplos
npm run dev

# Ejemplos específicos
node src/examples/basic-example.js
node src/examples/agent-examples.js
node src/examples/monitoring-examples.js
```

### Ejemplo Interactivo

```bash
# Menú interactivo con todos los ejemplos
node src/examples/index.js
```

## 📊 Monitoreo y Alertas

### Métricas Disponibles

- **Health**: Estado de salud del sistema
- **Performance**: Tiempos de respuesta
- **Cache**: Hit rates y estadísticas
- **Rate Limits**: Uso de límites por período
- **Agents**: Estado y rendimiento de agentes
- **System**: Memoria y recursos del sistema

### Alertas Configuradas

- Tiempo de respuesta alto (>5s)
- Tasa de errores (>10%)
- Cache hit rate bajo (<70%)
- Uso de rate limits (>90%)
- Uso de memoria alto (>80%)

### Sistema de Logging

```javascript
const logger = require('./src/utils/logger');

// Logs estructurados
logger.info('Operación completada', { operationId: '123' });
logger.error('Error en API', { error: error.message });
logger.performance('Request completado', duration);
logger.agent('agent-1', 'tarea completada', { duration });
```

## ⚡ Rate Limiting

El sistema implementa rate limiting en tres niveles:

### Límites por Defecto

- **Por minuto**: 60 requests
- **Por hora**: 1,000 requests  
- **Por día**: 10,000 requests

### Configuración Personalizada

```javascript
// En src/config/index.js
rateLimit: {
  perMinute: 120,    // Aumentar a 120 por minuto
  perHour: 2000,     // Aumentar a 2000 por hora
  perDay: 20000      // Aumentar a 20000 por día
}
```

### Monitoreo de Límites

```javascript
const stats = client.getRateLimitStats();
console.log('Uso por minuto:', stats.currentUsage.minute);
console.log('Próximo disponible en:', stats.nextAvailable?.waitTime + ' segundos');
```

## 💾 Sistema de Cache

### Características

- **TTL configurable**: Tiempo de vida de las entradas
- **Tamaño máximo**: Control de memoria
- **Estadísticas detalladas**: Hit rates y eficiencia
- **Limpieza automática**: Expiración automática

### Configuración

```javascript
cache: {
  ttl: 3600,           // 1 hora
  maxSize: 1000,       // 1000 entradas
  enabled: true
}
```

### Uso del Cache

```javascript
// El cache funciona automáticamente
const response1 = await client.generateResponse("Pregunta 1");
const response2 = await client.generateResponse("Pregunta 1"); // Cache hit!

// Estadísticas del cache
const stats = client.getCacheStats();
console.log('Hit rate:', stats.hitRate);
console.log('Entradas activas:', stats.totalKeys);
```

## 🤖 Sistema de Agentes

### Características del Sistema

- **Registro dinámico**: Agentes se registran en tiempo real
- **Balanceador de carga**: Asigna tareas al agente más eficiente
- **Retry automático**: Reintenta en caso de error recuperable
- **Monitoreo**: Estadísticas de rendimiento por agente
- **Timeouts**: Control de tiempo de ejecución

### Tipos de Agentes

```javascript
// Agente traductor
coordinator.registerAgent('translator', {
  type: 'translation',
  capabilities: ['translate', 'language'],
  systemPrompt: 'Eres un traductor experto.'
});

// Agente programador  
coordinator.registerAgent('coder', {
  type: 'coding',
  capabilities: ['code', 'debug', 'review'],
  systemPrompt: 'Eres un programador experto.'
});

// Agente analista
coordinator.registerAgent('analyst', {
  type: 'analysis', 
  capabilities: ['analyze', 'report'],
  systemPrompt: 'Eres un analista experto.'
});
```

### Configuración de Agentes

```javascript
{
  name: 'Agente Personalizado',
  type: 'custom',
  capabilities: ['capability1', 'capability2'],
  temperature: 0.7,        // Creatividad del modelo
  maxTokens: 1500,         // Tokens máximos de respuesta
  systemPrompt: 'Contexto y personalidad del agente'
}
```

## 🔧 Desarrollo

### Estructura del Proyecto

```
code/openrouter/
├── src/
│   ├── config/          # Configuración del sistema
│   ├── clients/         # Cliente OpenRouter
│   ├── services/        # Servicios (API, Agentes, Monitoreo)
│   ├── utils/           # Utilidades (Logger, Cache, Errors)
│   └── examples/        # Ejemplos de uso
├── package.json
├── .env.example
└── README.md
```

### Añadir Nuevas Funcionalidades

1. **Nuevo endpoint**: Editar `src/services/api.js`
2. **Nueva funcionalidad del cliente**: Editar `src/clients/openrouter.js`
3. **Nuevo servicio**: Crear en `src/services/`
4. **Nueva utilidad**: Crear en `src/utils/`

### Testing

```bash
# Tests unitarios (cuando estén implementados)
npm test

# Test de integración
npm run test-integration

# Test de conexión
npm run test-connection
```

## 🐛 Solución de Problemas

### Errores Comunes

#### API Key Inválida
```
Error: 401 Unauthorized
```
**Solución**: Verifica que `OPENROUTER_API_KEY` esté configurada correctamente.

#### Rate Limit Excedido
```
Error: Rate limit exceeded
```
**Solución**: El sistema esperará automáticamente. Puedes ajustar los límites en la configuración.

#### Timeout
```
Error: Request timeout
```
**Solución**: Reduce `max_tokens` o aumenta `API_TIMEOUT` en la configuración.

#### Cache Error
```
Error: Cache operation failed
```
**Solución**: Verifica permisos de escritura en el directorio de logs.

### Debugging

```bash
# Habilitar logs detallados
LOG_LEVEL=debug npm start

# Ver logs en tiempo real
tail -f logs/openrouter.log
```

### Monitoreo de Estado

```javascript
// Health check programático
const health = await client.healthCheck();
console.log('Sistema:', health.status);

// Estado del sistema completo
const systemStatus = await system.getSystemStatus();
console.log('Componentes:', systemStatus.components);
```

## 📈 Performance y Optimización

### Métricas de Rendimiento

- **Tiempo de respuesta promedio**: <2s para prompts simples
- **Cache hit rate objetivo**: >70%
- **Tasa de errores**: <5%
- **Throughput**: 60 requests/minuto por defecto

### Optimizaciones Recomendadas

1. **Usar cache**: Las respuestas cacheadas son instantáneas
2. **Batch requests**: Usa `/api/openrouter/batch` para múltiples prompts
3. **Límites apropiados**: Ajusta rate limits según tu uso
4. **Monitoreo activo**: Configura alertas para detectar problemas

### Configuración de Producción

```javascript
// Optimizado para producción
{
  cache: {
    ttl: 7200,      // 2 horas
    maxSize: 5000   // Mayor cache
  },
  rateLimit: {
    perMinute: 100, // Límites más conservadores
    perHour: 2000,
    perDay: 20000
  },
  logging: {
    level: 'info'   // Logs menos verbosos
  }
}
```

## 🔒 Seguridad

### Consideraciones de Seguridad

- API keys se manejan mediante variables de entorno
- Rate limiting protege contra abuso
- Validación de entrada en todos los endpoints
- Logs sanitizados (no se registran API keys)
- CORS configurado para dominios específicos

### Configuración de Seguridad

```javascript
// En src/config/index.js
security: {
  cors: {
    origin: 'https://tu-dominio.com',  // Específico en producción
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 100                   // 100 requests por IP
  }
}
```

## 📝 Changelog

### v1.0.0 (Actual)
- ✨ Implementación inicial completa
- 🤖 Sistema de coordinación de agentes
- 📊 Monitoreo y alertas en tiempo real
- 💾 Sistema de cache inteligente
- 🌐 API REST completa
- 🔄 Rate limiting multinivel
- 📚 Documentación completa y ejemplos

## 🤝 Contribución

### Cómo Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- Usa ESLint para linting
- Sigue las convenciones de Node.js
- Documenta nuevas funciones
- Incluye tests para nuevas funcionalidades

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

### Obtener Ayuda

- 📚 **Documentación**: Este README y la documentación en el código
- 🐛 **Issues**: Reporta problemas en GitHub Issues
- 💬 **Discusiones**: Usa GitHub Discussions para preguntas
- 📧 **Email**: [tu-email@ejemplo.com]

### Recursos Adicionales

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Gemini 2.0 Experimental](https://ai.google.dev/gemini-api)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

## 🎯 Casos de Uso

### Para Desarrolladores
- Integración rápida con Gemini 2.0
- Prototipado de aplicaciones con IA
- Testing de prompts y modelos

### Para Equipos
- Coordinación de múltiples agentes IA
- Monitoreo centralizado de uso
- Control de costos con rate limiting

### Para Empresas
- Sistema escalable de IA
- Monitoreo y alertas empresariales
- API REST para integraciones

---

**¡Desarrollado con ❤️ para la comunidad de desarrolladores que trabajan con IA!**
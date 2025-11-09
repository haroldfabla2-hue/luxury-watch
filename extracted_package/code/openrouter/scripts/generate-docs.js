#!/usr/bin/env node

/**
 * Script para generar documentación técnica detallada
 */

const fs = require('fs');
const path = require('path');

class DocumentationGenerator {
  constructor() {
    this.docsDir = path.join(__dirname, '../../docs');
    this.srcDir = path.join(__dirname, '../');
  }

  /**
   * Genera toda la documentación
   */
  async generateAll() {
    console.log('📚 Generando documentación técnica...');
    
    // Crear directorio docs si no existe
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
    }

    await this.generateAPIEndpointsDoc();
    await this.generateConfigurationDoc();
    await this.generateExamplesDoc();
    await this.generateArchitectureDoc();
    await this.generateTroubleshootingDoc();
    
    console.log('✅ Documentación generada en:', this.docsDir);
  }

  /**
   * Genera documentación de endpoints de API
   */
  async generateAPIEndpointsDoc() {
    const content = `# API Endpoints - OpenRouter Integration

## Base URL
\`\`\`
http://localhost:3000/api/openrouter
\`\`\`

## Autenticación
No requiere autenticación adicional. Utiliza la API key configurada en variables de entorno.

## Endpoints

### Health Check
\`\`\`
GET /health
\`\`\`
Verifica el estado del sistema.

**Respuesta:**
\`\`\`json
{
  "status": "healthy",
  "responseTime": "45ms",
  "rateLimits": {...},
  "cache": {...},
  "timestamp": "2025-11-06T15:41:08.000Z"
}
\`\`\`

### Chat
\`\`\`
POST /chat
\`\`\`
Genera respuestas en una conversación.

**Request Body:**
\`\`\`json
{
  "messages": [
    {
      "role": "user",
      "content": "Hola!"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
\`\`\`

**Respuesta:**
\`\`\`json
{
  "success": true,
  "data": {
    "content": "¡Hola! ¿En qué puedo ayudarte?",
    "usage": {...},
    "model": "google/gemini-2.0-flash-exp:free"
  },
  "timestamp": "2025-11-06T15:41:08.000Z"
}
\`\`\`

### Generate
\`\`\`
POST /generate
\`\`\`
Genera una respuesta simple.

**Request Body:**
\`\`\`json
{
  "prompt": "¿Qué es la inteligencia artificial?",
  "temperature": 0.7,
  "max_tokens": 500
}
\`\`\`

### Batch Generate
\`\`\`
POST /batch
\`\`\`
Genera múltiples respuestas en paralelo.

**Request Body:**
\`\`\`json
{
  "prompts": [
    "¿Qué es AI?",
    "¿Qué es ML?",
    "¿Qué es DL?"
  ],
  "temperature": 0.7
}
\`\`\`

### Agent Management
\`\`\`
POST /agents/register
GET /agents
POST /agents/{agentId}/task
DELETE /agents/{agentId}
\`\`\`
Gestión del sistema de agentes.

### Monitoring
\`\`\`
GET /monitoring/report
GET /monitoring/alerts
POST /monitoring/alerts/{alertId}/acknowledge
GET /monitoring/metrics
\`\`\`
Endpoints para monitoreo y alertas.

### Cache Management
\`\`\`
DELETE /cache
GET /cache/stats
\`\`\`
Gestión del sistema de cache.

## Códigos de Error

- \`400 Bad Request\`: Parámetros inválidos
- \`401 Unauthorized\`: API key inválida
- \`429 Too Many Requests\`: Rate limit excedido
- \`500 Internal Server Error\`: Error del servidor

## Rate Limiting

- **Por minuto**: 60 requests por defecto
- **Por hora**: 1,000 requests por defecto  
- **Por día**: 10,000 requests por defecto

Configurable mediante variables de entorno.
`;

    fs.writeFileSync(path.join(this.docsDir, 'API_ENDPOINTS.md'), content);
  }

  /**
   * Genera documentación de configuración
   */
  async generateConfigurationDoc() {
    const content = `# Configuración del Sistema OpenRouter

## Variables de Entorno

### Requeridas
\`\`\`bash
OPENROUTER_API_KEY=tu_api_key_aqui
\`\`\`

### OpenRouter Configuration
\`\`\`bash
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
API_TIMEOUT=30000
API_RETRIES=3
API_RETRY_DELAY=1000
\`\`\`

### Rate Limiting
\`\`\`bash
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
RATE_LIMIT_REQUESTS_PER_DAY=10000
\`\`\`

### Cache Configuration
\`\`\`bash
CACHE_TTL_SECONDS=3600
CACHE_MAX_SIZE=1000
\`\`\`

### Logging Configuration
\`\`\`bash
LOG_LEVEL=info
LOG_FILE=logs/openrouter.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
\`\`\`

### Agent Configuration
\`\`\`bash
AGENT_COORDINATION_ENABLED=true
AGENT_MAX_CONCURRENT=5
AGENT_TIMEOUT=60000
\`\`\`

### Monitoring Configuration
\`\`\`bash
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000
HEALTH_CHECK_INTERVAL=30000
\`\`\`

### API Server Configuration
\`\`\`bash
ENABLE_API=true
PORT=3000
CORS_ORIGIN=*
\`\`\`

## Configuración Avanzada

### Archivo de Configuración Principal
Ubicación: \`src/config/index.js\`

\`\`\`javascript
module.exports = {
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    retries: parseInt(process.env.API_RETRIES) || 3,
    retryDelay: parseInt(process.env.API_RETRY_DELAY) || 1000,
  },

  rateLimit: {
    perMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE) || 60,
    perHour: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR) || 1000,
    perDay: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_DAY) || 10000,
    enabled: true,
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL_SECONDS) || 3600,
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
    enabled: true,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/openrouter.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    enabled: true,
  },

  agents: {
    coordinationEnabled: process.env.AGENT_COORDINATION_ENABLED === 'true',
    maxConcurrent: parseInt(process.env.AGENT_MAX_CONCURRENT) || 5,
    timeout: parseInt(process.env.AGENT_TIMEOUT) || 60000,
  },

  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    interval: parseInt(process.env.MONITORING_INTERVAL) || 60000,
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  },

  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    helmet: {
      enabled: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};
\`\`\`

## Configuración por Entorno

### Desarrollo
\`\`\`bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_API=true
PORT=3000
\`\`\`

### Producción
\`\`\`bash
NODE_ENV=production
LOG_LEVEL=info
ENABLE_API=true
PORT=8080
RATE_LIMIT_REQUESTS_PER_MINUTE=30
\`\`\`

### Testing
\`\`\`bash
NODE_ENV=test
LOG_LEVEL=error
ENABLE_API=false
MONITORING_ENABLED=false
\`\`\`
`;

    fs.writeFileSync(path.join(this.docsDir, 'CONFIGURATION.md'), content);
  }

  /**
   * Genera documentación de ejemplos
   */
  async generateExamplesDoc() {
    const content = `# Ejemplos de Uso - OpenRouter Integration

## Ejemplo Básico

### Uso del Cliente
\`\`\`javascript
const { createClient } = require('./src/index');

async function ejemploBasico() {
  const client = await createClient();
  
  // Respuesta simple
  const response = await client.generateResponse(
    '¿Cuál es la capital de Francia?',
    { temperature: 0.7, max_tokens: 100 }
  );
  
  console.log(response.content); // "La capital de Francia es París."
  
  // Chat conversacional
  const messages = [
    { role: 'user', content: 'Hola!' },
    { role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte?' },
    { role: 'user', content: 'Explícame el machine learning' }
  ];
  
  const chatResponse = await client.chat(messages);
  console.log(chatResponse.content);
}
\`\`\`

### Uso del Sistema de Agentes
\`\`\`javascript
const { createAgentSystem } = require('./src/index');

async function ejemploAgentes() {
  const system = await createAgentSystem();
  const coordinator = system.getAgentCoordinator();
  
  // Registrar agente especializado
  const traductor = coordinator.registerAgent('traductor', {
    name: 'Agente Traductor',
    type: 'translation',
    capabilities: ['translate', 'language'],
    systemPrompt: 'Eres un traductor profesional.',
    temperature: 0.3
  });
  
  // Crear tarea
  const taskId = coordinator.createTask({
    type: 'translation',
    prompt: 'Traduce "Hello World" al español',
    priority: 1
  });
  
  // Monitorear progreso
  setInterval(() => {
    const stats = coordinator.getTaskStats();
    console.log(\`Completadas: \${stats.completed}\`);
  }, 1000);
}
\`\`\`

### Uso del Servidor API
\`\`\`javascript
const { createAPIServer } = require('./src/index');

async function ejemploAPI() {
  const system = await createAPIServer(3000);
  console.log('Servidor iniciado en http://localhost:3000');
}

// O usar cURL:
\\`\\`\\`bash
curl -X POST http://localhost:3000/api/openrouter/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "¿Qué es IA?", "temperature": 0.7}'
\\`\\`\\`
\`\`\`

## Ejemplos Avanzados

### Procesamiento Batch
\`\`\`javascript
const client = require('./src/index').createClient;

async function procesamientoBatch() {
  const client = await createClient();
  
  const prompts = [
    '¿Qué es Python?',
    '¿Qué es JavaScript?',
    '¿Qué es TypeScript?'
  ];
  
  const results = await client.generateBatch(prompts, {
    temperature: 0.6,
    max_tokens: 100
  });
  
  results.forEach((result, index) => {
    console.log(\`Respuesta \${index + 1}: \${result.content}\`);
  });
}
\`\`\`

### Monitoreo Personalizado
\`\`\`javascript
const system = await createOpenRouterSystem();
const monitoring = system.getMonitoringService();

// Escuchar alertas
monitoring.on('alert', (alert) => {
  console.log(\`ALERTA: \${alert.severity} - \${alert.message}\`);
  // Enviar notificación, email, etc.
});

// Obtener métricas
const report = monitoring.generateReport();
console.log('Hit rate del cache:', report.metrics.cacheHitRate.avg);
\`\`\`

### Manejo de Errores
\`\`\`javascript
const { ApiError, RateLimitError } = require('./src/utils/errors');

try {
  await client.generateResponse(prompt);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Esperando:', error.retryAfter, 'segundos');
    // Esperar y reintentar
  } else if (error instanceof ApiError) {
    console.log('Error de API:', error.message);
    // Manejar según el código de error
  }
}
\`\`\`

## Casos de Uso Específicos

### 1. Asistente de Código
\`\`\`javascript
const codeAgent = coordinator.registerAgent('coder', {
  name: 'Asistente de Código',
  type: 'coding',
  systemPrompt: 'Eres un experto programador. Escribe código limpio y documentado.',
  temperature: 0.2,
  maxTokens: 1000
});

const task = coordinator.createTask({
  type: 'coding',
  prompt: \`Crea una función en JavaScript para validar emails
    - Debe usar expresiones regulares
    - Incluir ejemplos de uso
    - Comentarios explicativos\`,
  context: { language: 'javascript', framework: 'vanilla' }
});
\`\`\`

### 2. Sistema de Traducción
\`\`\`javascript
const languages = ['es', 'en', 'fr', 'de'];
const text = 'Hello, how are you?';

const translationTasks = languages.map(lang => 
  coordinator.createTask({
    type: 'translation',
    prompt: \`Traduce al \${lang}: "\${text}"\`,
    priority: 1,
    context: { targetLanguage: lang }
  })
);
\`\`\`

### 3. Análisis de Sentimientos
\`\`\`javascript
const texts = [
  'Me encanta este producto!',
  'El servicio fue terrible.',
  'El producto está bien, nada especial.'
];

const sentimentTasks = texts.map((text, index) =>
  coordinator.createTask({
    type: 'analysis',
    prompt: \`Analiza el sentimiento de: "\${text}"\`,
    priority: 1,
    context: { textId: index }
  })
);
\`\`\`

## Configuración de Producción

### Variables de Entorno
\`\`\`bash
# .env.production
NODE_ENV=production
OPENROUTER_API_KEY=production_key_here
RATE_LIMIT_REQUESTS_PER_MINUTE=30
CACHE_TTL_SECONDS=7200
LOG_LEVEL=info
PORT=8080
\`\`\`

### PM2 Configuration
\`\`\`javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'openrouter-api',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};
\`\`\`

### Docker Configuration
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY .env ./

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## Testing

### Test de Integración
\`\`\`javascript
const { createClient } = require('./src/index');

describe('OpenRouter Integration', () => {
  let client;
  
  beforeAll(async () => {
    client = await createClient();
  });
  
  test('should generate response', async () => {
    const response = await client.generateResponse('Hola mundo');
    expect(response.content).toBeDefined();
    expect(response.usage).toBeDefined();
  });
  
  test('should handle errors gracefully', async () => {
    await expect(
      client.generateResponse('', {})
    ).rejects.toThrow();
  });
});
\`\`\`
`;

    fs.writeFileSync(path.join(this.docsDir, 'EXAMPLES.md'), content);
  }

  /**
   * Genera documentación de arquitectura
   */
  async generateArchitectureDoc() {
    const content = `# Arquitectura del Sistema OpenRouter

## Visión General

El sistema OpenRouter Integration está diseñado como una arquitectura modular y escalable que permite la integración eficiente con la API de OpenRouter para Gemini 2.0 Experimental Free.

## Componentes Principales

### 1. OpenRouterClient
**Ubicación**: \`src/clients/openrouter.js\`

**Responsabilidades**:
- Gestión de conexiones con OpenRouter API
- Manejo de autenticación y headers
- Retry logic y timeout handling
- Interceptores para logging y métricas
- Cache de respuestas
- Rate limiting

**Características**:
- Singleton pattern para eficiencia
- Axios interceptors para middleware
- Error handling especializado
- Métricas de performance

### 2. AgentCoordinator
**Ubicación**: \`src/services/agentCoordinator.js\`

**Responsabilidades**:
- Registro y gestión de agentes
- Balanceador de carga de tareas
- Retry automático con backoff
- Monitoreo de estado de agentes
- Cola de tareas priorizada

**Características**:
- Event-driven architecture
- Load balancing automático
- Task queue con prioridades
- Health monitoring por agente

### 3. MonitoringService
**Ubicación**: \`src/services/monitoringService.js\`

**Responsabilidades**:
- Recolección de métricas del sistema
- Sistema de alertas configurables
- Generación de reportes
- Health checks automatizados

**Métricas monitoreadas**:
- Health status del cliente
- Response times
- Cache hit rates
- Rate limit usage
- Agent performance
- System resources

### 4. OpenRouterAPI
**Ubicación**: \`src/services/api.js\`

**Responsabilidades**:
- API REST para clientes externos
- Validación de requests con Joi
- Rate limiting de API
- Error handling estandarizado
- CORS y security middleware

## Flujo de Datos

### Request Flow
\`\`\`
Client Request → Rate Limiter → Cache Check → API Call → Response Processing → Cache Update → Client Response
\`\`\`

### Agent Task Flow
\`\`\`
Task Creation → Agent Assignment → Task Execution → Result Processing → Agent Status Update → Completion Notification
\`\`\`

### Monitoring Flow
\`\`\`
Metric Collection → Threshold Checking → Alert Generation → Notification → Report Generation
\`\`\`

## Patrones de Diseño

### 1. Singleton Pattern
- **OpenRouterClient**: Una sola instancia compartida
- **MonitoringService**: Una instancia global
- **Logger**: Instancia centralizada

### 2. Factory Pattern
- **createClient()**: Factory para cliente
- **createAgentSystem()**: Factory para sistema con agentes
- **createAPIServer()**: Factory para servidor completo

### 3. Observer Pattern
- **EventEmitter**: Para eventos de agentes
- **Monitoring alerts**: Sistema de suscripciones
- **API health notifications**

### 4. Strategy Pattern
- **Error handling strategies**: Diferentes estrategias según tipo de error
- **Cache strategies**: TTL y invalidación configurable
- **Agent assignment strategies**: Balanceadores configurables

## Capas de Abstracción

### 1. Capa de Presentación (Presentation Layer)
- **OpenRouterAPI**: Endpoints REST
- **Express middleware**: CORS, rate limiting, logging
- **Request validation**: Joi schemas

### 2. Capa de Lógica de Negocio (Business Logic Layer)
- **AgentCoordinator**: Orquestación de agentes
- **MonitoringService**: Lógica de monitoreo
- **RateLimiter**: Lógica de límites

### 3. Capa de Acceso a Datos (Data Access Layer)
- **OpenRouterClient**: Acceso a OpenRouter API
- **Cache**: Almacenamiento local
- **Logger**: Persistencia de logs

## Arquitectura de Configuración

### Environment-Based Configuration
\`\`\`
.env → config/index.js → Component Configuration
\`\`\`

### Hot Configuration
- Rate limits ajustables en runtime
- Cache TTL modificable
- Monitoring thresholds configurables

## Escalabilidad

### Horizontal Scaling
- **Stateless design**: No estado compartido
- **Idempotent operations**: Safe para múltiples instancias
- **Load balancer friendly**: Compatible con load balancers

### Vertical Scaling
- **Resource pooling**: Reutilización de conexiones
- **Efficient caching**: Reduce llamadas API
- **Memory management**: Control de memoria del cache

## Seguridad

### API Security
- **Rate limiting**: Protección contra abuse
- **Input validation**: Validación exhaustiva
- **CORS configuration**: Control de origen
- **Security headers**: Helmet.js

### Data Security
- **Environment variables**: API keys seguras
- **Log sanitization**: No logging de datos sensibles
- **Error masking**: No exposición de detalles internos

## Performance

### Optimization Strategies
1. **Connection pooling**: Reutilización de conexiones HTTP
2. **Intelligent caching**: Cache con TTL y invalidación
3. **Request batching**: Procesamiento en lotes
4. **Async operations**: Operaciones no bloqueantes

### Monitoring
1. **Response time tracking**: Métricas de performance
2. **Cache efficiency**: Hit/miss rates
3. **Resource utilization**: CPU y memoria
4. **Error rates**: Monitoreo de errores

## Fault Tolerance

### Error Recovery
1. **Automatic retries**: Reintentos con backoff
2. **Circuit breakers**: Prevención de cascading failures
3. **Graceful degradation**: Funcionamiento con funcionalidades limitadas
4. **Health checks**: Detección temprana de problemas

### Resilience Patterns
1. **Bulkhead**: Aislamiento de componentes
2. **Timeout**: Prevención de bloqueos
3. **Fallback**: Alternativas en caso de fallo
4. **Monitoring**: Observabilidad completa

## Deployment Architecture

### Development
\`\`\`
Local Node.js Process + Environment Variables
\`\`\`

### Production
\`\`\`
Docker Container → Load Balancer → Multiple API Instances
\`\`\`

### Microservices Pattern
\`\`\`
Each service is independent and can be scaled separately
- API Service
- Agent Coordination Service
- Monitoring Service
\`\`\`

## Integración

### External APIs
- **OpenRouter API**: Integración primaria
- **Gemini 2.0**: Modelo de IA
- **Webhook integrations**: Para alertas externas

### Internal Integrations
- **Express.js**: Framework web
- **Winston**: Logging framework
- **NodeCache**: Caching layer
- **Axios**: HTTP client

## Consideraciones Futuras

### Extensibilidad
1. **Plugin architecture**: Para nuevos tipos de agentes
2. **Custom metrics**: Métricas específicas por aplicación
3. **Multiple AI providers**: Soporte para otros proveedores

### Performance
1. **Database integration**: Para persistencia de datos
2. **Message queues**: Para procesamiento asíncrono
3. **CDN integration**: Para cache distribuida

### Monitoring
1. **Advanced analytics**: ML para predicción de problemas
2. **Custom dashboards**: Interfaces de monitoreo
3. **Integration with APM**: New Relic, DataDog, etc.
`;

    fs.writeFileSync(path.join(this.docsDir, 'ARCHITECTURE.md'), content);
  }

  /**
   * Genera documentación de troubleshooting
   */
  async generateTroubleshootingDoc() {
    const content = `# Guía de Solución de Problemas

## Problemas Comunes y Soluciones

### 1. Errores de Conexión

#### Error: "ECONNREFUSED"
**Síntomas**: No se puede conectar al servidor OpenRouter
\`\`\`
Error: connect ECONNREFUSED 104.18.37.115:443
\`\`\`

**Causas**:
- Sin conexión a internet
- Proxy/firewall bloqueando conexiones
- DNS resolution falla

**Soluciones**:
1. Verificar conexión a internet
2. Probar ping openrouter.ai
3. Configurar proxy si es necesario
4. Verificar variables de entorno de proxy

\`\`\`bash
# Test de conectividad
ping openrouter.ai
curl -I https://openrouter.ai
\`\`\`

#### Error: "ENOTFOUND"
**Síntomas**: DNS resolution error
\`\`\`
Error: getaddrinfo ENOTFOUND openrouter.ai
\`\`\`

**Soluciones**:
1. Verificar configuración DNS
2. Limpiar DNS cache
\`\`\`bash
# Windows
ipconfig /flushdns

# Linux/Mac
sudo dscacheutil -flushcache
\`\`\`

### 2. Errores de Autenticación

#### Error: "401 Unauthorized"
**Síntomas**: API key inválida
\`\`\`
Error: Unauthorized - Invalid API key
\`\`\`

**Soluciones**:
1. Verificar OPENROUTER_API_KEY en .env
2. Confirmar que la API key sea válida
3. Verificar que el archivo .env se carga correctamente
\`\`\`bash
# Verificar variable de entorno
echo $OPENROUTER_API_KEY

# Test manual
curl -H "Authorization: Bearer TU_API_KEY" https://openrouter.ai/api/v1/models
\`\`\`

#### Error: "403 Forbidden"
**Síntomas**: Acceso denegado
\`\`\`
Error: Forbidden - Access denied
\`\`\`

**Soluciones**:
1. Verificar permisos de la API key
2. Confirmar límites de uso
3. Verificar configuración de billing

### 3. Errores de Rate Limiting

#### Error: "429 Too Many Requests"
**Síntomas**: Rate limit excedido
\`\`\`
Error: Rate limit exceeded. Wait 60 seconds.
\`\`\`

**Soluciones**:
1. Esperar el tiempo especificado
2. Reducir frecuencia de requests
3. Ajustar límites en configuración
\`\`\`javascript
// En src/config/index.js
rateLimit: {
  perMinute: 30,    // Reducir límite
  perHour: 500,     // Reducir límite
  perDay: 5000      // Reducir límite
}
\`\`\`

### 4. Errores de Timeouts

#### Error: "timeout"
**Síntomas**: Request timeout
\`\`\`
Error: Request timeout after 30000ms
\`\`\`

**Soluciones**:
1. Aumentar timeout
2. Reducir max_tokens
3. Verificar conectividad
\`\`\`javascript
// Aumentar timeout
config.openrouter.timeout = 60000; // 60 segundos

// Reducir tokens
await client.generateResponse(prompt, { max_tokens: 500 });
\`\`\`

### 5. Errores del Sistema de Agentes

#### Error: "Agent coordination disabled"
**Síntomas**: Agentes no funcionan
\`\`\`
Error: Agent coordination disabled
\`\`\`

**Soluciones**:
1. Habilitar coordinación de agentes
\`\`\`bash
AGENT_COORDINATION_ENABLED=true
\`\`\`

2. Inicializar con createAgentSystem()
\`\`\`javascript
const system = await createAgentSystem(); // En lugar de createClient()
\`\`\`

#### Error: "Agent with active tasks"
**Síntomas**: No se puede des-registrar agente
\`\`\`
Error: Cannot unregister agent with active tasks
\`\`\`

**Soluciones**:
1. Esperar a que las tareas se completen
2. Cancelar tareas activas primero
\`\`\`javascript
// Cancelar todas las tareas
coordinator.getActiveTasks().forEach(task => {
  coordinator.cancelTask(task.id);
});
\`\`\`

### 6. Errores de Cache

#### Error: "Cache operation failed"
**Síntomas**: Problemas con el cache
\`\`\`
Error: Cache operation failed
\`\`\`

**Soluciones**:
1. Verificar permisos de escritura
2. Limpiar cache manualmente
\`\`\`javascript
// Limpiar cache
client.clearCache();

// Verificar configuración
console.log(client.getCacheStats());
\`\`\`

### 7. Errores del Sistema de Monitoreo

#### Error: "Monitoring disabled"
**Síntomas**: Monitoreo no funciona
\`\`\`
Error: Monitoring disabled
\`\`\`

**Soluciones**:
1. Habilitar monitoreo
\`\`\`bash
MONITORING_ENABLED=true
\`\`\`

2. Inicializar sistema completo
\`\`\`javascript
const system = await createOpenRouterSystem();
const monitoring = system.getMonitoringService();
\`\`\`

## Debugging

### Habilitar Logs Detallados
\`\`\`bash
# Variables de entorno para debugging
LOG_LEVEL=debug
NODE_ENV=development
\`\`\`

### Logs en Tiempo Real
\`\`\`bash
# Ver logs en tiempo real
tail -f logs/openrouter.log

# Logs solo de errores
tail -f logs/error.log
\`\`\`

### Debugging Programático
\`\`\`javascript
const logger = require('./src/utils/logger');

// Habilitar logs específicos
logger.debug('Debug message', { data: 'some data' });
logger.error('Error occurred', { error: error.message });
logger.performance('Operation completed', duration);
\`\`\`

## Herramientas de Diagnóstico

### Health Check Completo
\`\`\`javascript
async function diagnostic() {
  const system = await createOpenRouterSystem();
  
  console.log('=== DIAGNÓSTICO COMPLETO ===');
  
  // 1. Health check
  const health = await system.getClient().healthCheck();
  console.log('Health:', health.status);
  
  // 2. System status
  const status = await system.getSystemStatus();
  console.log('Components:', status.components);
  
  // 3. Agent status
  if (system.getAgentCoordinator()) {
    const agents = system.getAgentCoordinator().getAgentsStatus();
    console.log('Agents:', agents);
  }
  
  // 4. Cache stats
  const cache = system.getClient().getCacheStats();
  console.log('Cache:', cache);
  
  // 5. Rate limits
  const rateLimits = system.getClient().getRateLimitStats();
  console.log('Rate Limits:', rateLimits);
}
\`\`\`

### Test de Performance
\`\`\`javascript
async function performanceTest() {
  const client = await createClient();
  
  console.log('=== TEST DE PERFORMANCE ===');
  
  // Test 1: Response time
  const start = Date.now();
  await client.generateResponse('Test prompt');
  const responseTime = Date.now() - start;
  console.log('Response time:', responseTime + 'ms');
  
  // Test 2: Cache performance
  await client.generateResponse('Test cache prompt');
  const first = Date.now();
  await client.generateResponse('Test cache prompt'); // Should be cached
  const cached = Date.now() - first;
  console.log('Cached response:', cached + 'ms');
  
  // Test 3: Multiple requests
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(client.generateResponse(\`Test \${i}\`));
  }
  await Promise.all(promises);
  console.log('5 parallel requests completed');
}
\`\`\`

## Configuración de Desarrollo

### Variables de Entorno de Desarrollo
\`\`\`bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_API=true
PORT=3000
RATE_LIMIT_REQUESTS_PER_MINUTE=100
CACHE_TTL_SECONDS=300
\`\`\`

### Scripts de Desarrollo
\`\`\`json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "test": "node src/examples/test-integration.js",
    "debug": "node --inspect src/index.js"
  }
}
\`\`\`

## Monitoreo en Producción

### Alertas Críticas
Configurar alertas para:
- Response time > 5s
- Error rate > 10%
- Memory usage > 80%
- Cache hit rate < 50%

### Métricas Importantes
1. **Performance**
   - Response time p95
   - Throughput (requests/minute)
   - Error rate

2. **Resource Usage**
   - Memory usage
   - CPU usage
   - Cache efficiency

3. **Business Metrics**
   - Successful requests
   - Rate limit utilization
   - Agent utilization

## Contacto y Soporte

### Información para Reportar Bugs
1. Versión de Node.js
2. Sistema operativo
3. Configuración completa (.env sin API keys)
4. Logs completos
5. Pasos para reproducir el problema

### Comandos de Diagnóstico
\`\`\`bash
# Información del sistema
node --version
npm --version
os-info

# Test de conectividad
ping openrouter.ai
nslookup openrouter.ai

# Test de API
curl -X GET https://openrouter.ai/api/v1/models \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
\`\`\`

## Checklist de Resolución

### Paso 1: Verificación Básica
- [ ] API key configurada correctamente
- [ ] Conexión a internet funcionando
- [ ] Variables de entorno cargadas
- [ ] Dependencias instaladas

### Paso 2: Logs y Debugging
- [ ] Logs habilitadas (LOG_LEVEL=debug)
- [ ] Health check funciona
- [ ] Error logs revisados
- [ ] Network logs verificados

### Paso 3: Configuración
- [ ] Rate limits configurados apropiadamente
- [ ] Timeouts ajustados
- [ ] Cache configurado
- [ ] CORS configurado (si es necesario)

### Paso 4: Escalamiento
- [ ] Monitoreo habilitado
- [ ] Alertas configuradas
- [ ] Backup plan en lugar
- [ ] Escalamiento planificado

Si el problema persiste después de seguir esta guía, por favor documenta todos los pasos tomados y contacta al equipo de soporte.
`;

    fs.writeFileSync(path.join(this.docsDir, 'TROUBLESHOOTING.md'), content);
  }
}

// Ejecutar generación de documentación
if (require.main === module) {
  const generator = new DocumentationGenerator();
  generator.generateAll().catch(console.error);
}

module.exports = DocumentationGenerator;
# 🚀 LuxuryWatch Backend

Backend completo para plataforma de e-commerce de relojes de lujo con configurador 3D, CRM avanzado y chat IA.

## ✨ Características Principales

### 🛍️ E-commerce Avanzado
- **Configurador 3D**: Sistema completo de personalización de watches
- **Gestión de Productos**: CRUD completo con variaciones complejas
- **Sistema de Inventario**: Tracking en tiempo real con alertas
- **Múltiples Variaciones**: Materiales, cajas, esferas, manecillas, correas
- **Cálculo de Precios**: Dinámico basado en configuraciones 3D

### 👥 CRM Completo
- **Gestión de Clientes**: Perfiles detallados con historial
- **Pipeline de Ventas**: Seguimiento de oportunidades
- **Segmentación Inteligente**: Automática por valor y comportamiento
- **Campañas de Email**: Segmentadas y automatizadas
- **Dashboard Analítico**: Métricas en tiempo real

### 🤖 Chat IA Avanzado
- **Múltiples Proveedores**: OpenAI, Anthropic, Google
- **Fallback Inteligente**: Sistema de circuit breakers
- **Sesiones Persistentes**: Historial completo
- **Health Monitoring**: Verificación automática de proveedores
- **Rate Limiting**: Control de uso y costos

### 🏗️ Infraestructura Robusta
- **PostgreSQL**: Base de datos principal con Prisma ORM
- **Redis**: Cache y sesiones de alta performance
- **Rate Limiting**: Protección contra abuso
- **Autenticación**: JWT con roles y permisos
- **File Upload**: Procesamiento automático de imágenes
- **Logging**: Winston con múltiples destinos
- **Health Checks**: Monitoreo de servicios

## 🚀 Instalación Rápida

### Prerrequisitos

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 13.0
- **Redis** >= 6.0
- **Git**

### 1. Clonar Repositorio

```bash
git clone https://github.com/yourusername/luxurywatch-backend.git
cd luxurywatch-backend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar Base de Datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# (Opcional) Poblar con datos de ejemplo
npm run db:seed
```

### 5. Iniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📋 Configuración Detallada

### Base de Datos

#### PostgreSQL
El sistema usa PostgreSQL como base de datos principal. Configura en `.env`:

```env
DATABASE_URL="postgresql://username:password@atlanticserver.net:5432/luxurywatch_db"
```

#### Redis
Para cache y sesiones:

```env
REDIS_URL="redis://atlanticserver.net:6379"
```

### API Keys de IA

Configura al menos uno de estos proveedores:

```env
# OpenAI (Recomendado)
OPENAI_API_KEY="sk-..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Google
GOOGLE_AI_API_KEY="AIza..."
```

### Almacenamiento de Archivos

Para uploads de imágenes de productos:

```env
# Local (desarrollo)
UPLOAD_PATH="./uploads"

# AWS S3 (producción)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="luxurywatch-assets"
```

## 🏗️ Estructura del Proyecto

```
luxurywatch-backend/
├── src/
│   ├── config/          # Configuraciones
│   ├── middleware/      # Middlewares personalizados
│   ├── routes/          # Rutas de la API
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades
│   ├── websocket/       # WebSocket handlers
│   └── app.js           # Aplicación principal
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   └── migrations/      # Migraciones
├── uploads/             # Archivos subidos
├── logs/                # Logs de aplicación
├── scripts/             # Scripts de utilidad
└── tests/               # Tests automatizados
```

## 🔌 API Endpoints

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/products/search` - Búsqueda avanzada
- `GET /api/products/:id/related` - Productos relacionados

### Componentes 3D
- `GET /api/watch-components/materials` - Materiales disponibles
- `GET /api/watch-components/cases` - Cajas disponibles
- `GET /api/watch-components/dials` - Esferas disponibles
- `GET /api/watch-components/hands` - Manecillas disponibles
- `GET /api/watch-components/straps` - Correas disponibles
- `POST /api/products/calculate-3d-price` - Calcular precio
- `POST /api/products/validate-3d-config` - Validar configuración

### CRM
- `GET /api/crm/customers` - Listar clientes
- `GET /api/crm/customers/:id` - Obtener cliente
- `POST /api/crm/customers` - Crear cliente
- `PUT /api/crm/customers/:id` - Actualizar cliente
- `GET /api/crm/opportunities` - Listar oportunidades
- `POST /api/crm/opportunities` - Crear oportunidad
- `GET /api/crm/stats/customers` - Estadísticas de clientes
- `GET /api/crm/stats/opportunities` - Estadísticas de ventas
- `GET /api/crm/dashboard` - Dashboard principal

### Chat IA
- `POST /api/chat/sessions` - Crear sesión
- `GET /api/chat/sessions/:id` - Obtener sesión
- `POST /api/chat/sessions/:id/messages` - Enviar mensaje
- `GET /api/chat/sessions/:id/messages` - Historial
- `GET /api/chat/stats` - Estadísticas de chat
- `GET /api/chat/providers/health` - Estado de proveedores

### Variaciones
- `POST /api/products/:id/variants` - Crear variación
- `PUT /api/variants/:id/stock` - Actualizar stock

### Sistema
- `GET /health` - Health check
- `GET /api/info` - Información de la API

## 🛡️ Seguridad

### Autenticación
- JWT tokens con expiración configurable
- Roles: `admin`, `manager`, `sales`, `user`
- Permisos granulares por endpoint

### Rate Limiting
- Por IP: 1000 requests/15min
- Por usuario: variable según rol
- Autenticación: 5 intentos/15min
- Upload: 10 archivos/hora
- Chat: 20 mensajes/minuto

### Validación
- Input validation con express-validator
- Sanitización automática
- SQL injection protection
- XSS protection
- CSRF protection

## 📊 Monitoreo y Logs

### Health Checks
```bash
curl http://localhost:3001/health
```

### Métricas
- Performance de base de datos
- Usage de Redis
- Health de proveedores de IA
- Rate limiting stats
- Error rates

### Logs
- Aplicación: `logs/app.log`
- Errores: `logs/error.log`
- Access: `logs/access.log`

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🚀 Deployment

### Con PM2 (Recomendado)

```bash
# Iniciar
npm run pm2:start

# Ver logs
npm run pm2:logs

# Reiniciar
npm run pm2:restart

# Parar
npm run pm2:stop
```

### Con Docker

```bash
# Build
npm run docker:build

# Run
npm run docker:run
```

### Variables de Producción

```env
NODE_ENV=production
# Configurar todas las API keys
# Usar URLs de producción
# Configurar SSL
# Configurar backups
```

## 🗄️ Migración de Datos

### Desde Supabase

```bash
# Exportar datos de Supabase
# Transformar a formato PostgreSQL
# Importar con scripts personalizados
```

### Scripts de Migración

```bash
# Backup de base de datos
npm run backup:db

# Restaurar base de datos
npm run restore:db

# Reset completo
npm run db:reset
```

## 🔧 Configuración Avanzada

### Circuit Breakers
- 5 fallos consecutivos abren el circuit
- Recovery después de 5 minutos
- Monitoreo automático de health

### Cache Strategy
- Productos: 1 hora
- Clientes: 30 minutos
- Chat sessions: 1 hora
- API configs: 2 horas

### Rate Limiting Dinámico
- Admin: 1000 req/hora
- Manager: 500 req/hora
- Sales: 300 req/hora
- User: 100 req/15min

## 📈 Performance

### Optimizaciones
- Connection pooling para DB
- Redis para cache
- Compression de respuestas
- Static file caching
- Image optimization

### Métricas de Performance
- Response time < 200ms (p95)
- Database queries < 50ms (p95)
- Cache hit rate > 80%
- Error rate < 0.1%

## 🐛 Troubleshooting

### Problemas Comunes

#### Error de conexión a DB
```bash
# Verificar configuración
npm run db:generate

# Test de conexión
node -e "require('./src/config/database').testConnection().then(console.log)"
```

#### Error de Redis
```bash
# Verificar conexión
redis-cli ping
```

#### Error de rate limiting
```bash
# Limpiar cache de rate limit
redis-cli del "*rate_limit*"
```

### Logs de Debug
```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Logs de error
tail -f logs/error.log
```

## 📚 Documentación Adicional

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing](CONTRIBUTING.md)

## 🆘 Soporte

- **Email**: support@luxurywatch.com
- **Documentation**: https://docs.luxurywatch.com
- **Status**: https://status.luxurywatch.com

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

---

**Desarrollado por MiniMax Agent** 🤖

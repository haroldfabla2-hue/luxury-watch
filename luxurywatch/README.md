# 🕰️ LuxuryWatch - E-commerce de Relojes de Lujo

Una plataforma completa de e-commerce para relojes de lujo con configurador 3D interactivo, CRM integrado y chat con IA.

## 🚀 Características Principales

### ✨ Frontend (React/TypeScript)
- **Configurador 3D Interactivo** con Three.js
- **Personalización Avanzada** de componentes del reloj
- **Visualización AR** para dispositivos móviles
- **UI/UX Moderna** con componentes Radix UI
- **Responsive Design** optimizado para todos los dispositivos
- **Sistema de Carrito** integrado
- **Procesamiento de Pagos** con Stripe

### 🔧 Backend (Node.js/Express)
- **API RESTful** completa
- **Base de Datos** con PostgreSQL + Prisma ORM
- **Sistema de Cache** con Redis
- **Autenticación JWT** segura
- **Rate Limiting** y seguridad
- **CRM Integrado** para gestión de clientes
- **Chat IA Multi-Proveedor** (OpenAI, Gemini, Anthropic)

### 📊 Arquitectura
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + JavaScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Autenticación**: JWT
- **3D Graphics**: Three.js + WebGL
- **UI Components**: Radix UI + Tailwind CSS

## 🏗️ Estructura del Proyecto

```
luxurywatch/
├── frontend/                 # React Frontend (root level)
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   ├── hooks/          # Custom React hooks
│   │   └── ...
│   ├── public/             # Static assets
│   ├── dist/              # Production build
│   └── package.json       # Frontend dependencies
│
├── backend/                # Node.js Backend
│   ├── src/               # Backend source code
│   │   ├── app.js         # Main application
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   ├── prisma/            # Database schema
│   ├── server.js          # Server entry point
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
│
├── start-app.sh           # Unified startup script
└── README.md              # This file
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ 
- **pnpm** (recomendado) o npm
- **PostgreSQL** 12+
- **Redis** 6+ (opcional, para cache)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/haroldfabla2-hue/luxury-watch.git
cd luxury-watch
```

### 2. Configuración Rápida

#### Opción A: Script Automático (Recomendado)
```bash
# Instalar dependencias
./start-app.sh install

# Configurar variables de entorno
cd backend
cp .env.example .env
# Editar .env con tu configuración
```

#### Opción B: Manual
```bash
# Instalar dependencias del frontend
pnpm install

# Instalar dependencias del backend
cd backend
npm install
npm install -g prisma
npx prisma generate

# Configurar base de datos
cp .env.example .env
# Editar .env con tu configuración de DB
```

### 3. Configurar Base de Datos

1. **Crear Base de Datos PostgreSQL:**
```sql
CREATE DATABASE luxurywatch_db;
CREATE USER luxuryuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE luxurywatch_db TO luxuryuser;
```

2. **Configurar .env:**
```bash
# Backend/.env
DATABASE_URL="postgresql://luxuryuser:your_password@localhost:5432/luxurywatch_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secure-secret"
PORT=3001
```

3. **Ejecutar Migraciones:**
```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Iniciar la Aplicación

#### Desarrollo (Scripts separados)
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
pnpm run dev
```

#### Producción (Script unificado)
```bash
# Desarrollo
./start-app.sh start

# Producción
./start-app.sh start production

# Verificar estado
./start-app.sh status

# Detener servicios
./start-app.sh stop
```

## 📡 Endpoints de la API

### Health Check
- `GET /health` - Estado del servidor

### API Principal
- `GET /api/info` - Información de la API
- `GET /api/products` - Lista de productos
- `GET /api/products/:id` - Producto específico
- `POST /api/crm/customers` - Crear cliente
- `GET /api/crm/customers` - Listar clientes
- `POST /api/chat/message` - Enviar mensaje a IA
- `GET /api/chat/history` - Historial de chat

## 🌐 URLs de Acceso

- **Frontend (Desarrollo)**: http://localhost:3000
- **Frontend (Producción)**: http://localhost:3000 (preview)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Configuración Avanzada

### Variables de Entorno (Backend)

```bash
# Base de datos
DATABASE_URL="postgresql://user:pass@localhost:5432/luxurywatch_db"
REDIS_URL="redis://localhost:6379"

# Autenticación
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3001
HOST="0.0.0.0"
NODE_ENV="production"

# CORS
CORS_ORIGIN="http://localhost:3000"

# IA (Opcional)
OPENAI_API_KEY="your-openai-key"
GEMINI_API_KEY="your-gemini-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# Pagos (Opcional)
STRIPE_SECRET_KEY="your-stripe-key"
```

### Configuración de Redis (Opcional)

Para activar el cache Redis, instalar y configurar:

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Windows
# Descargar desde https://redis.io/download
```

### Despliegue en Producción

#### Atlantic.net (Servidor VPS)

1. **Subir al Servidor:**
```bash
scp -r luxurywatch/ user@your-server:/var/www/
```

2. **En el Servidor:**
```bash
cd /var/www/luxurywatch

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar servicios
./start-app.sh install
cp backend/.env.example backend/.env
# Editar .env con configuración de producción

# Iniciar con PM2
pm2 start start-app.sh --name "luxurywatch" --interpreter bash
pm2 startup
pm2 save
```

3. **Configurar Nginx (Opcional):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛠️ Comandos Útiles

### Gestión de Base de Datos
```bash
cd backend
npx prisma studio          # Abrir Prisma Studio
npx prisma migrate dev     # Nueva migración
npx prisma migrate reset   # Resetear DB (¡CUIDADO!)
npx prisma db pull         # Sincronizar schema
npx prisma generate        # Generar cliente
```

### Desarrollo
```bash
pnpm run dev               # Frontend desarrollo
npm run start              # Backend desarrollo
pnpm run build             # Frontend build
npm run build              # Backend build (si existe)
```

### Logs y Monitoreo
```bash
./start-app.sh logs        # Ver logs
pm2 logs luxurywatch       # PM2 logs
pm2 restart luxurywatch    # Reiniciar app
pm2 stop luxurywatch       # Parar app
```

## 🐛 Solución de Problemas

### Error: Puerto en uso
```bash
# Encontrar proceso usando puerto
lsof -i :3000
lsof -i :3001

# Matar proceso
kill -9 PID
```

### Error: Base de datos no conecta
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en .env
3. Verificar que la base de datos existe

### Error: Redis no conecta
1. Verificar que Redis esté ejecutándose
2. Verificar URL de Redis en .env
3. Redis es opcional, la app funcionará sin él

### Error: Permisos de archivos
```bash
# Dar permisos al script de inicio
chmod +x start-app.sh
```

## 📚 Documentación Adicional

- [Guía de Deployment Atlantic.net](./docs/DEPLOYMENT_GUIDE_ATLANTIC_NET.md)
- [Configuración de 3D](./docs/OPCIONES_CONFIGURACION.md)
- [Testing E2E](./docs/GUIA_TESTING_E2E.md)
- [AR Móvil](./docs/GUIA_TESTING_AR_MOVIL.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Desarrollado por

**MiniMax Agent** - Plataforma de e-commerce inteligente

---

## 🚀 ¡Empezar Ahora!

```bash
git clone https://github.com/haroldfabla2-hue/luxury-watch.git
cd luxury-watch
./start-app.sh install
./start-app.sh start
```

¡Visita http://localhost:3000 para ver tu aplicación funcionando! 🎉
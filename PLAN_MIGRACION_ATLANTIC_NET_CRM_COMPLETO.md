# 🚀 PLAN COMPLETO: MIGRACIÓN ATLANTIC.NET + CRM AVANZADO

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Migrar LuxuryWatch de Supabase a servidor propio en atlantic.net y crear un CRM completo tipo WordPress/WooCommerce pero más eficiente, que maneje todas las variaciones complejas de productos de lujo.

**Componentes Nuevos:**
- ✅ Migración completa a PostgreSQL en atlantic.net
- ✅ CRM Headless con gestión completa de productos y variaciones
- ✅ Sistema de configuración 3D integrado
- ✅ API Gateway con múltiples proveedores
- ✅ Chat IA en tiempo real con WebSocket
- ✅ Sistema de fallback inteligente
- ✅ Panel de administración avanzado

---

## 🏗️ ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    LUXURYWATCH PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND (React + TypeScript)                             │
│  ├─ Configurador 3D (Three.js + Variaciones Complejas)     │
│  ├─ CRM Dashboard (Headless + Gestión de Productos)        │
│  ├─ Chat IA (WebSocket + Socket.IO)                        │
│  └─ API Management Panel                                   │
├─────────────────────────────────────────────────────────────┤
│  ATLANTIC.NET SERVIDOR                                     │
│  ├─ PostgreSQL (Base de Datos Principal)                   │
│  ├─ Node.js/Express (API Gateway + WebSocket)              │
│  ├─ Redis (Cache + Sessions)                               │
│  ├─ Multer (Upload de archivos)                            │
│  └─ PM2 (Process Manager)                                  │
├─────────────────────────────────────────────────────────────┤
│  AI & INTEGRATION LAYER                                    │
│  ├─ Silhouette MCP Orchestrator (78+ Agentes)              │
│  ├─ Multi-Provider AI (OpenAI, Anthropic, Google, etc.)    │
│  ├─ HuggingFace & OpenRouter Integration                   │
│  └─ Sistema de Fallback Inteligente                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DISEÑO DE BASE DE DATOS PARA PRODUCTOS DE LUJO

### 1. Esquema Principal de Productos

```sql
-- 1. CATEGORÍAS DE PRODUCTOS
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. PRODUCTOS BASE
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE,
    category_id INTEGER REFERENCES categories(id),
    brand VARCHAR(100),
    product_type ENUM('simple', 'variable', 'configurable') DEFAULT 'configurable',
    status ENUM('draft', 'active', 'inactive', 'archived') DEFAULT 'draft',
    featured_image VARCHAR(500),
    gallery_images JSONB, -- Array de URLs
    weight DECIMAL(10,3),
    dimensions JSONB, -- {length, width, height}
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags JSONB, -- Array de tags
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. VARIACIONES DE PRODUCTOS
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    manage_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    stock_status ENUM('in_stock', 'out_of_stock', 'on_backorder') DEFAULT 'in_stock',
    requires_shipping BOOLEAN DEFAULT true,
    taxable BOOLEAN DEFAULT true,
    weight DECIMAL(10,3),
    dimensions JSONB,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. ATRIBUTOS DE PRODUCTOS (Material, Color, Tamaño, etc.)
CREATE TABLE attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('text', 'select', 'multiselect', 'boolean', 'number', 'date') NOT NULL,
    is_required BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. VALORES DE ATRIBUTOS
CREATE TABLE attribute_values (
    id SERIAL PRIMARY KEY,
    attribute_id INTEGER REFERENCES attributes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    value TEXT, -- Para atributos de tipo texto
    color_hex VARCHAR(7), -- Para colores
    image_url VARCHAR(500),
    position INTEGER DEFAULT 0,
    UNIQUE(attribute_id, slug)
);

-- 6. VARIACIONES DE CONFIGURACIÓN 3D (Especifico para Watches)
CREATE TABLE watch_variations (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Configuración 3D específica
    material_id INTEGER, -- Referencia a watch_materials
    case_id INTEGER,      -- Referencia a watch_cases
    dial_id INTEGER,      -- Referencia a watch_dials
    hands_id INTEGER,     -- Referencia a watch_hands
    strap_id INTEGER,     -- Referencia to watch_straps
    
    -- Propiedades 3D
    model_3d_url VARCHAR(500),
    preview_images JSONB, -- Array de URLs de previews
    price_modifier DECIMAL(10,2) DEFAULT 0,
    is_available_3d BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. MATERIALES PARA WATCHES
CREATE TABLE watch_materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('metal', 'ceramic', 'titanium', 'carbon', 'rubber', 'leather') NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    metalness DECIMAL(3,2) DEFAULT 0,
    roughness DECIMAL(3,2) DEFAULT 0.5,
    price DECIMAL(10,2) DEFAULT 0,
    texture_url VARCHAR(500),
    normal_map_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

-- 8. CAJAS DE WATCHES
CREATE TABLE watch_cases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    material_id INTEGER REFERENCES watch_materials(id),
    shape ENUM('round', 'square', 'cushion', 'tonneau') NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    size_mm INTEGER NOT NULL,
    thickness_mm DECIMAL(4,2),
    water_resistance VARCHAR(50),
    price DECIMAL(10,2) DEFAULT 0,
    model_3d_url VARCHAR(500),
    preview_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

-- 9. ESFERAS DE WATCHES
CREATE TABLE watch_dials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    style_category ENUM('classic', 'sport', 'modern', 'luxury') NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    pattern_type ENUM('sunburst', 'guilloche', 'plain', 'carbon', 'textured') NOT NULL,
    markers TEXT, -- Información de marcadores
    subdials JSONB, -- Configuración de subdiales
    price DECIMAL(10,2) DEFAULT 0,
    texture_url VARCHAR(500),
    preview_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

-- 10. MANECILLAS DE WATCHES
CREATE TABLE watch_hands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    style ENUM('dauphine', 'sword', 'baton', 'alpha', 'skeleton', 'lume') NOT NULL,
    color VARCHAR(50) NOT NULL,
    material_type VARCHAR(50),
    size_mm DECIMAL(4,2) NOT NULL,
    luminous BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    model_3d_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

-- 11. CORREAS DE WATCHES
CREATE TABLE watch_straps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    material_type ENUM('leather', 'metal', 'rubber', 'nato', 'canvas') NOT NULL,
    color VARCHAR(50) NOT NULL,
    style ENUM('classic', 'sport', 'luxury', 'military') NOT NULL,
    buckle_type ENUM('pin', 'deployment', 'folding', 'velcro') NOT NULL,
    width_mm INTEGER NOT NULL,
    length_mm INTEGER,
    price DECIMAL(10,2) DEFAULT 0,
    texture_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

-- 12. RELACIÓN PRODUCTO-ATRIBUTO-VALOR
CREATE TABLE product_variant_attributes (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id INTEGER REFERENCES attributes(id),
    value_id INTEGER REFERENCES attribute_values(id),
    value_text TEXT, -- Para atributos de tipo texto
    position INTEGER DEFAULT 0,
    UNIQUE(variant_id, attribute_id)
);

-- 13. IMÁGENES DE PRODUCTOS
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Esquema de CRM y Ventas

```sql
-- CLIENTES Y CONTACTOS
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(50),
    tax_id VARCHAR(100),
    customer_type ENUM('individual', 'business', 'wholesale') DEFAULT 'individual',
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    total_spent DECIMAL(12,2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    last_order_date TIMESTAMP,
    birthday DATE,
    gender ENUM('male', 'female', 'other'),
    marketing_opt_in BOOLEAN DEFAULT false,
    notes TEXT,
    tags JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- DIRECCIONES DE CLIENTES
CREATE TABLE customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    type ENUM('billing', 'shipping', 'both') DEFAULT 'both',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    phone VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- OPORTUNIDADES DE VENTA (CRM)
CREATE TABLE sales_opportunities (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    stage ENUM('prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost') DEFAULT 'prospect',
    probability INTEGER DEFAULT 0, -- 0-100
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_to INTEGER, -- Referencia a users (admin users)
    source ENUM('website', 'phone', 'email', 'social', 'referral', 'event') DEFAULT 'website',
    products_interest JSONB, -- Array de product_ids
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PEDIDOS
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'partially_paid', 'refunded', 'failed') DEFAULT 'pending',
    fulfillment_status ENUM('unfulfilled', 'partial', 'fulfilled') DEFAULT 'unfulfilled',
    
    -- Montos
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Información de envío
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Notas
    customer_notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ITEMS DE PEDIDO
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    
    -- Configuración 3D del watch (si aplica)
    watch_config JSONB, -- Almacena la configuración completa 3D
    
    -- Detalles del item
    name VARCHAR(255) NOT NULL, -- Snapshot del nombre en el momento de la compra
    sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Precio unitario
    total DECIMAL(10,2) NOT NULL, -- Precio total
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Esquema de Configuración de APIs y Chat

```sql
-- CONFIGURACIÓN DE PROVEEDORES API
CREATE TABLE api_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    authentication_type ENUM('bearer', 'api_key', 'oauth2', 'none') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    capabilities JSONB, -- {'vision': true, 'streaming': true, 'max_context': 128000}
    rate_limits JSONB, -- {'requests_per_minute': 1000, 'tokens_per_hour': 1000000}
    cost_per_token DECIMAL(10,8),
    documentation_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CONFIGURACIONES DE API POR PROYECTO
CREATE TABLE project_api_configs (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL, -- 'luxurywatch'
    provider_id INTEGER REFERENCES api_providers(id),
    priority INTEGER NOT NULL DEFAULT 1,
    is_enabled BOOLEAN DEFAULT true,
    configuration JSONB, -- API keys, endpoints, modelos específicos
    rate_limits_override JSONB,
    cost_budget_limit DECIMAL(10,2),
    health_status ENUM('healthy', 'degraded', 'unhealthy', 'unknown') DEFAULT 'unknown',
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- MODELOS DE IA DISPONIBLES
CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES api_providers(id),
    name VARCHAR(100) NOT NULL, -- 'gpt-4', 'claude-3-sonnet'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    max_context_tokens INTEGER,
    cost_per_input_token DECIMAL(10,8),
    cost_per_output_token DECIMAL(10,8),
    capabilities JSONB, -- {'vision': true, 'function_calling': true}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- HISTORIAL DE CHAT
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    user_type ENUM('customer', 'admin') NOT NULL,
    status ENUM('active', 'ended', 'abandoned') DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    metadata JSONB -- Información adicional de la sesión
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    provider VARCHAR(100), -- Proveedor de IA usado
    model VARCHAR(100),    -- Modelo de IA usado
    tokens_used INTEGER,
    cost DECIMAL(10,6),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CONFIGURACIONES DE AGENTES
CREATE TABLE agent_configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    agent_type VARCHAR(100) NOT NULL, -- 'product_recommender', 'customer_support', etc.
    system_prompt TEXT,
    configuration JSONB, -- Parámetros específicos del agente
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛠️ INFRAESTRUCTURA DEL SERVIDOR

### 1. Stack Tecnológico

```json
{
  "backend": {
    "runtime": "Node.js 20.x",
    "framework": "Express.js 4.x",
    "database": "PostgreSQL 15.x",
    "cache": "Redis 7.x",
    "websocket": "Socket.IO 4.x",
    "orm": "Prisma 5.x",
    "authentication": "JWT + bcrypt",
    "file_upload": "Multer + Sharp",
    "process_manager": "PM2",
    "web_server": "Nginx (Reverse Proxy)"
  },
  "database": {
    "host": "atlantic.net.server.ip",
    "port": 5432,
    "database": "luxurywatch_db",
    "ssl": true,
    "connection_pool": {
      "min": 10,
      "max": 100
    }
  },
  "redis": {
    "host": "atlantic.net.server.ip",
    "port": 6379,
    "ttl": {
      "session": 86400,
      "cache": 3600,
      "rate_limit": 300
    }
  }
}
```

### 2. Variables de Entorno (.env)

```bash
# BASE DE DATOS
DATABASE_URL="postgresql://username:password@atlantic.net.server.ip:5432/luxurywatch_db?sslmode=require"
REDIS_URL="redis://atlantic.net.server.ip:6379"

# JWT Y SEGURIDAD
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12

# SERVIDOR
PORT=3001
NODE_ENV="production"
HOST="atlantic.net.server.ip"

# API KEYS (Se agregarán vía panel de administración)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""
HUGGINGFACE_API_KEY=""
OPENROUTER_API_KEY=""

# S3/ALMACENAMIENTO DE ARCHIVOS
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET="luxurywatch-assets"

# EMAIL
SMTP_HOST="smtp.atlantic.net"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""

# WEBHOOKS Y INTEGRACIONES
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
WEBHOOK_BASE_URL="https://luxurywatch.atlantic.net"

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# LOGGING
LOG_LEVEL="info"
LOG_FILE_PATH="/var/log/luxurywatch/app.log"
```

---

## 📁 ESTRUCTURA DE ARCHIVOS DEL PROYECTO

```
luxurywatch-atlantic/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Configuración PostgreSQL
│   │   │   ├── redis.js             # Configuración Redis
│   │   │   └── api-providers.js     # Configuración de APIs
│   │   ├── middleware/
│   │   │   ├── auth.js              # Autenticación JWT
│   │   │   ├── rateLimit.js         # Rate limiting
│   │   │   ├── upload.js            # Manejo de archivos
│   │   │   └── validation.js        # Validación de datos
│   │   ├── routes/
│   │   │   ├── products.js          # API de productos
│   │   │   ├── customers.js         # API de clientes
│   │   │   ├── orders.js            # API de pedidos
│   │   │   ├── api-config.js        # API de configuración
│   │   │   ├── chat.js              # API de chat
│   │   │   └── admin.js             # API de administración
│   │   ├── services/
│   │   │   ├── productService.js    # Lógica de productos
│   │   │   ├── orderService.js      # Lógica de pedidos
│   │   │   ├── chatService.js       # Lógica de chat
│   │   │   ├── aiService.js         # Lógica de IA
│   │   │   └── fallbackService.js   # Sistema de fallback
│   │   ├── utils/
│   │   │   ├── logger.js            # Sistema de logs
│   │   │   ├── cache.js             # Cache utilities
│   │   │   └── helpers.js           # Funciones auxiliares
│   │   ├── websocket/
│   │   │   ├── chatHandler.js       # Manejo de chat WebSocket
│   │   │   └── notificationHandler.js
│   │   └── app.js                   # Aplicación principal
│   ├── prisma/
│   │   ├── schema.prisma           # Esquema de base de datos
│   │   └── migrations/             # Migraciones
│   ├── uploads/                    # Archivos subidos
│   ├── logs/                       # Logs de aplicación
│   └── package.json
├── frontend/ (React app existente)
├── nginx/
│   └── nginx.conf                 # Configuración de Nginx
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── scripts/
│   ├── setup-database.sh          # Setup inicial de DB
│   ├── backup-database.sh         # Backup de DB
│   └── deploy.sh                  # Script de deployment
└── README.md
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### FASE 1: CONFIGURACIÓN DE INFRAESTRUCTURA (Semana 1)
1. **Setup del servidor en Atlantic.net**
   - Configurar PostgreSQL 15.x
   - Instalar Node.js 20.x y dependencias
   - Configurar Redis para cache
   - Setup de Nginx como reverse proxy

2. **Migración de datos**
   - Exportar estructura actual de Supabase
   - Crear esquema de base de datos completo
   - Migrar datos existentes

3. **Backend básico**
   - Configurar Express.js con Prisma
   - Implementar autenticación JWT
   - Crear APIs básicas de productos y clientes

### FASE 2: CRM Y GESTIÓN DE PRODUCTOS (Semana 2)
1. **CRM Completo**
   - Panel de administración avanzado
   - Gestión de productos con variaciones
   - Configurador 3D integrado
   - Sistema de clientes y oportunidades

2. **Gestión de productos**
   - CRUD completo de productos
   - Sistema de variaciones complejo
   - Gestión de inventario
   - Importación/exportación de productos

### FASE 3: SISTEMA DE IA Y CHAT (Semana 3)
1. **API Gateway con Fallback**
   - Integración con múltiples proveedores
   - Sistema de health checking
   - Circuit breaker y fallback inteligente

2. **Chat en Tiempo Real**
   - WebSocket con Socket.IO
   - Integración con Silhouette MCP
   - Historial de conversaciones

### FASE 4: OPTIMIZACIÓN Y DEPLOYMENT (Semana 4)
1. **Optimización**
   - Cache con Redis
   - Rate limiting
   - Logs y monitoring
   - Backup automático

2. **Deployment**
   - Configuración de PM2
   - SSL con Let's Encrypt
   - Monitoring de performance
   - Documentación completa

---

## 📊 CARACTERÍSTICAS DEL CRM AVANZADO

### 1. Gestión de Productos
- **Configurador 3D Completo**: Integración total con el sistema actual
- **Variaciones Complejas**: Materiales, cajas, esferas, manecillas, correas
- **Gestión de Inventario**: Stock por variación con alertas
- **Imágenes y Media**: Galería completa con optimización automática
- **SEO**: URLs amigables, meta tags, schema markup

### 2. CRM de Ventas
- **Gestión de Clientes**: Perfiles completos con historial
- **Oportunidades**: Pipeline de ventas con etapas
- **Comunicación**: Chat integrado con IA
- **Reportes**: Analytics de ventas y comportamiento
- **Automatización**: Workflows de seguimiento

### 3. Panel de Administración
- **Dashboard**: Métricas en tiempo real
- **Gestión de Usuarios**: Roles y permisos
- **Configuración de APIs**: Panel para administradores
- **Logs y Monitoring**: Seguimiento de actividad
- **Backup**: Sistema de respaldos automático

### 4. Integraciones
- **Pagos**: Stripe, PayPal, procesadores locales
- **Envíos**: APIs de mensajería y tracking
- **Email**: SMTP con plantillas
- **Analytics**: Google Analytics, Facebook Pixel

---

## 🔧 MIGRACIÓN DESDE SUPABASE

### Pasos de Migración:
1. **Exportar datos de Supabase**
   - Productos y variaciones existentes
   - Configuraciones de usuario
   - Historial de pedidos

2. **Adaptar estructura**
   - Mapear campos de Supabase al nuevo esquema
   - Preservar configuraciones 3D
   - Mantener compatibilidad con frontend

3. **Validación**
   - Testing de integridad de datos
   - Verificación de funcionalidades
   - Performance testing

---

## 📈 VENTAJAS DEL SISTEMA PROPUESTO

1. **Control Total**: Sin dependencia de terceros
2. **Escalabilidad**: Arquitectura preparada para crecimiento
3. **Performance**: Optimizado para e-commerce de lujo
4. **Flexibilidad**: Adaptable a necesidades específicas
5. **Seguridad**: Control completo de datos y accesos
6. **Costos**: Sin costos mensuales de plataformas SaaS
7. **Personalización**: CRM 100% adaptado al negocio
8. **Integraciones**: Fácil conexión con cualquier sistema

---

## 📋 PRÓXIMOS PASOS

1. **Aprobación del plan**
2. **Setup del servidor en Atlantic.net**
3. **Inicio de implementación de infraestructura**
4. **Desarrollo del backend**
5. **Integración con el frontend existente**
6. **Testing y optimización**
7. **Deployment y go-live**

---

**¿Deseas que proceda con la implementación de este plan? ¿Hay algún aspecto que quieras modificar o agregar?**

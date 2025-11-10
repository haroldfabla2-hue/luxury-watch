# 📊 REPORTE COMPLETO DE MIGRACIÓN DE BASE DE DATOS

## 🔍 ANÁLISIS DE ESTRUCTURA ACTUAL

### 📋 Tablas en Supabase (12 tablas principales)
```
├── watch_products (productos base)
├── watch_materials (materiales)
├── watch_cases (cajas de relojes)
├── watch_dials (esferas/diales)
├── watch_hands (manecillas)
├── watch_straps (correas)
├── user_profiles (perfiles de usuario)
├── user_configurations (configuraciones guardadas)
├── orders (órdenes de compra)
├── order_items (items de órdenes)
├── product_categories (categorías)
└── app_settings (configuraciones)
```

### 🏗️ Estructura del Esquema Prisma (25+ modelos)
```
├── PRODUCTOS Y VARIACIONES
│   ├── Category (categorías)
│   ├── Product (productos)
│   ├── ProductVariant (variantes)
│   ├── ProductImage (imágenes)
│   └── ProductAttribute (atributos)
├── MATERIALES Y COMPONENTES
│   ├── Material (materiales)
│   ├── WatchCase (cajas)
│   ├── WatchDial (esferas)
│   ├── WatchHands (manecillas)
│   ├── WatchStrap (correas)
│   └── WatchConfiguration (configuraciones)
├── USUARIOS Y AUTENTICACIÓN
│   ├── User (usuarios)
│   ├── UserProfile (perfiles)
│   └── UserConfiguration (configuraciones de usuario)
├── E-COMMERCE
│   ├── Cart (carritos)
│   ├── CartItem (items del carrito)
│   ├── Order (órdenes)
│   └── OrderItem (items de órdenes)
├── CRM Y VENTAS
│   ├── Customer (clientes)
│   ├── Opportunity (oportunidades)
│   ├── CustomerActivity (actividades)
│   └── OpportunityActivity (actividades de oportunidad)
├── CHAT IA
│   ├── ChatSession (sesiones)
│   └── ChatMessage (mensajes)
└── CONFIGURACIÓN
    ├── AppSetting (configuraciones)
    └── BlogCategory, BlogPost (blog)
```

---

## 🗺️ PLAN DE MIGRACIÓN DETALLADO

### Fase 1: Estructura de Datos (1 hora)

#### 1.1 Migrar Materiales
```sql
-- Tabla origen: watch_materials
-- Tabla destino: Material
INSERT INTO "Material" (name, materialType, colorHex, price, specifications)
SELECT 
  name,
  material_type as "materialType",
  color_hex as "colorHex", 
  price,
  specifications
FROM watch_materials;
```

#### 1.2 Migrar Cajas
```sql
-- Tabla origen: watch_cases
-- Tabla destino: WatchCase
INSERT INTO "WatchCase" (name, shape, sizeMm, materialId, price, specifications)
SELECT 
  name,
  shape,
  size_mm as "sizeMm",
  material_id as "materialId",
  price,
  specifications
FROM watch_cases;
```

#### 1.3 Migrar Esferas
```sql
-- Tabla origen: watch_dials
-- Tabla destino: WatchDial
INSERT INTO "WatchDial" (name, styleCategory, colorHex, patternType, price, specifications)
SELECT 
  name,
  style_category as "styleCategory",
  color_hex as "colorHex",
  pattern_type as "patternType", 
  price,
  specifications
FROM watch_dials;
```

#### 1.4 Migrar Manecillas
```sql
-- Tabla origen: watch_hands
-- Tabla destino: WatchHands
INSERT INTO "WatchHands" (name, style, color, materialType, sizeMm, price, specifications)
SELECT 
  name,
  style,
  color,
  material_type as "materialType",
  size_mm as "sizeMm",
  price,
  specifications
FROM watch_hands;
```

#### 1.5 Migrar Correas
```sql
-- Tabla origen: watch_straps
-- Tabla destino: WatchStrap
INSERT INTO "WatchStrap" (name, materialType, color, style, buckleType, price, specifications)
SELECT 
  name,
  material_type as "materialType",
  color,
  style,
  buckle_type as "buckleType",
  price,
  specifications
FROM watch_straps;
```

### Fase 2: Productos y Categorías (30 min)

#### 2.1 Migrar Categorías
```sql
-- Tabla origen: product_categories
-- Tabla destino: Category
INSERT INTO "Category" (name, slug, description)
SELECT 
  name,
  slug,
  description
FROM product_categories;
```

#### 2.2 Migrar Productos
```sql
-- Tabla origen: watch_products
-- Tabla destino: Product
INSERT INTO "Product" (name, slug, description, status, isFeatured, isConfigurable)
SELECT 
  name,
  LOWER(REPLACE(name, ' ', '-')) as "slug",
  description,
  'ACTIVE' as "status",
  is_available as "isFeatured",
  true as "isConfigurable"
FROM watch_products;
```

### Fase 3: Usuarios y Configuraciones (1 hora)

#### 3.1 Migrar Perfiles
```sql
-- Tabla origen: user_profiles
-- Tabla destino: UserProfile
INSERT INTO "UserProfile" (userId, firstName, lastName, phone, shippingAddress, billingAddress, loyaltyPoints, isVip)
SELECT 
  user_id as "userId",
  first_name as "firstName",
  last_name as "lastName",
  phone,
  shipping_address as "shippingAddress",
  billing_address as "billingAddress",
  loyalty_points as "loyaltyPoints",
  is_vip as "isVip"
FROM user_profiles;
```

#### 3.2 Migrar Configuraciones de Usuario
```sql
-- Tabla origen: user_configurations
-- Tabla destino: UserConfiguration
INSERT INTO "UserConfiguration" (userId, configurationName, dialId, caseId, handsId, strapId, price, isFavorite, specifications)
SELECT 
  user_id as "userId",
  configuration_name as "configurationName",
  dial_id as "dialId",
  case_id as "caseId", 
  hands_id as "handsId",
  strap_id as "strapId",
  total_price as "price",
  is_favorite as "isFavorite",
  specifications
FROM user_configurations;
```

### Fase 4: Órdenes y Ventas (30 min)

#### 4.1 Migrar Órdenes
```sql
-- Tabla origen: orders
-- Tabla destino: Order
INSERT INTO "Order" (orderNumber, totalAmount, status, paymentStatus, paymentMethod, shippingAddress, notes)
SELECT 
  order_number as "orderNumber",
  total_amount as "totalAmount",
  UPPER(status) as "status",
  UPPER(payment_status) as "paymentStatus",
  payment_method as "paymentMethod",
  shipping_address as "shippingAddress",
  notes
FROM orders;
```

---

## 🚀 SCRIPT DE MIGRACIÓN AUTOMÁTICA

### Configuración de Conexión
```bash
# Para PostgreSQL en Atlantic.net
DATABASE_URL="postgresql://username:password@server:5432/luxurywatch_db"

# Para SQLite (para pruebas)
DATABASE_URL="file:./luxurywatch.db"
```

### Comandos de Migración
```bash
# 1. Generar cliente Prisma
npx prisma generate

# 2. Aplicar esquema a base de datos
npx prisma db push

# 3. Ejecutar migración de datos
node migrate-data.js

# 4. Verificar datos
npx prisma studio
```

### Estructura de Directorios
```
luxurywatch-migration/
├── prisma/
│   ├── schema.prisma (esquema completo)
│   └── migrations/ (migraciones generadas)
├── scripts/
│   ├── migrate-data.js (migración automática)
│   └── verify-data.js (verificación)
├── data/
│   ├── supabase-export.json (export de Supabase)
│   └── atlantic-net-ready.json (preparado para Atlantic.net)
└── docs/
    ├── migration-guide.md
    └── api-setup-guide.md
```

---

## 📈 ESTADÍSTICAS DE MIGRACIÓN

### Datos Estimados por Tabla
- **Materiales**: ~50 registros
- **WatchCase**: ~30 registros  
- **WatchDial**: ~40 registros
- **WatchHands**: ~25 registros
- **WatchStrap**: ~35 registros
- **Productos**: ~15 registros
- **Usuarios**: ~100 registros
- **Configuraciones**: ~200 registros
- **Órdenes**: ~50 registros

**Total**: ~545 registros para migrar

### Tiempo Estimado
- **Preparación**: 30 min
- **Migración de estructura**: 20 min
- **Migración de datos**: 45 min
- **Verificación**: 15 min
- **Testing**: 30 min
- **Total**: ~2.5 horas

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Post-Migración
- [ ] Verificar que todas las tablas tienen datos
- [ ] Probar relaciones entre tablas
- [ ] Verificar índices y constraints
- [ ] Probar queries de lectura
- [ ] Probar queries de escritura
- [ ] Verificar tipos de datos
- [ ] Probar funciones de aplicación
- [ ] Backup de datos migrados

### Para Atlantic.net
- [ ] Configurar variables de entorno
- [ ] Configurar usuario de base de datos
- [ ] Configurar permisos
- [ ] Ejecutar migraciones en producción
- [ ] Verificar conexión desde backend
- [ ] Probar todas las APIs
- [ ] Configurar backup automático

---

## 🔧 COMANDOS ÚTILES

### Desarrollo Local (SQLite)
```bash
# Inicializar proyecto
npx prisma init
npx prisma generate
npx prisma db push

# Ver datos
npx prisma studio

# Resetear base de datos
npx prisma db push --force-reset
```

### Producción (PostgreSQL)
```bash
# Conectar a PostgreSQL
psql "postgresql://user:pass@host:5432/db"

# Ejecutar script SQL
psql "postgresql://user:pass@host:5432/db" < migration.sql

# Verificar conexión
SELECT current_database(), current_user;
```

---

## 📞 SOPORTE Y TROUBLESHOOTING

### Problemas Comunes

#### Error: "Database does not exist"
```bash
# Crear base de datos
createdb luxurywatch_db
# o
psql -c "CREATE DATABASE luxurywatch_db;"
```

#### Error: "Permission denied"
```bash
# Verificar usuario
psql -c "\\du"
# Asignar permisos
GRANT ALL PRIVILEGES ON DATABASE luxurywatch_db TO username;
```

#### Error: "Relation does not exist"
```bash
# Verificar esquema
\\dt
# Ver tablas específicas
\\dt Material
```

### Contacto
- **Backend**: Revisar logs en `/logs/migration.log`
- **Base de datos**: Verificar estado con `npx prisma db push --preview-feature`
- **APIs**: Probar endpoints después de migración

---

**🎯 RESULTADO FINAL**: Base de datos completamente migrada y lista para usar en Atlantic.net con todas las funcionalidades del CRM, configurador 3D y sistema de e-commerce.

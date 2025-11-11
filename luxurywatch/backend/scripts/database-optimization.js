/**
 * Optimizaciones de Base de Datos
 * Scripts para mejorar performance de la base de datos
 */

// Archivo: prisma/optimizations.sql
const optimizationsSQL = `
-- =====================================================
-- OPTIMIZACIONES DE BASE DE DATOS LUXURYWATCH
-- =====================================================

-- 1. ÍNDICES PARA MEJORAR PERFORMANCE

-- Índices para tabla de productos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_price ON products(category, price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_in_stock ON products("inStock");

-- Índices para tabla de clientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_created_at ON customers("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_preferences ON customers USING GIN(preferences);

-- Índices para tabla de órdenes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_id ON orders("customerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_product_id ON orders("productId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total ON orders(total);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_created ON orders("customerId", "createdAt");

-- Índices para tabla de mensajes de chat
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_user_id ON "chatMessages"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_session_id ON "chatMessages"("sessionId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_created_at ON "chatMessages"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_timestamp ON "chatMessages"(timestamp);

-- 2. ÍNDICES COMPUESTOS PARA CONSULTAS FRECUENTES

-- Productos por categoría y disponibilidad
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_stock ON products(category, "inStock") 
    WHERE "inStock" = true;

-- Órdenes por estado y fecha
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date ON orders(status, "createdAt");

-- Clientes con órdenes recientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_active_orders ON customers(id) 
    WHERE EXISTS (SELECT 1 FROM orders WHERE orders."customerId" = customers.id AND orders.status != 'cancelled');

-- 3. OPTIMIZACIONES DE VIEWS

-- View para productos populares
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.category,
    p."inStock",
    COUNT(o.id) as order_count,
    SUM(o.quantity) as total_sold
FROM products p
LEFT JOIN orders o ON p.id = o."productId" 
WHERE o.status = 'delivered'
GROUP BY p.id, p.name, p.price, p.category, p."inStock"
HAVING COUNT(o.id) > 0
ORDER BY order_count DESC, total_sold DESC;

-- View para estadísticas de clientes
CREATE OR REPLACE VIEW customer_stats AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total), 0) as total_spent,
    MAX(o."createdAt") as last_order_date,
    AVG(o.total) as avg_order_value
FROM customers c
LEFT JOIN orders o ON c.id = o."customerId"
WHERE c."deletedAt" IS NULL
GROUP BY c.id, c.name, c.email, c.phone;

-- View para métricas de chat
CREATE OR REPLACE VIEW chat_metrics AS
SELECT 
    DATE(timestamp) as chat_date,
    COUNT(*) as total_messages,
    COUNT(DISTINCT "userId") as unique_users,
    COUNT(DISTINCT "sessionId") as unique_sessions
FROM "chatMessages"
GROUP BY DATE(timestamp)
ORDER BY chat_date DESC;

-- 4. FUNCIONES OPTIMIZADAS

-- Función para buscar productos con filtros
CREATE OR REPLACE FUNCTION search_products(
    search_term text DEFAULT NULL,
    category_filter text DEFAULT NULL,
    min_price numeric DEFAULT NULL,
    max_price numeric DEFAULT NULL,
    limit_count integer DEFAULT 20,
    offset_count integer DEFAULT 0
)
RETURNS TABLE (
    id integer,
    name text,
    description text,
    price numeric,
    category text,
    "inStock" boolean,
    "createdAt" timestamp
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p."inStock",
        p."createdAt"
    FROM products p
    WHERE 
        (search_term IS NULL OR p.name ILIKE '%' || search_term || '%' OR p.description ILIKE '%' || search_term || '%')
        AND (category_filter IS NULL OR p.category = category_filter)
        AND (min_price IS NULL OR p.price >= min_price)
        AND (max_price IS NULL OR p.price <= max_price)
    ORDER BY p."createdAt" DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de ventas
CREATE OR REPLACE FUNCTION get_sales_stats(
    start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    period text,
    total_orders bigint,
    total_revenue numeric,
    avg_order_value numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_sales AS (
        SELECT 
            DATE_TRUNC('day', o."createdAt") as day,
            COUNT(*) as orders_count,
            SUM(o.total) as daily_revenue
        FROM orders o
        WHERE o."createdAt"::date BETWEEN start_date AND end_date
            AND o.status = 'delivered'
        GROUP BY DATE_TRUNC('day', o."createdAt")
    )
    SELECT 
        'daily' as period,
        COALESCE(SUM(orders_count), 0) as total_orders,
        COALESCE(SUM(daily_revenue), 0) as total_revenue,
        COALESCE(AVG(daily_revenue), 0) as avg_order_value
    FROM daily_sales;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA

-- Trigger para actualizar timestamp de modificación
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas principales
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. ESTADÍSTICAS Y MONITOREO

-- Habilitar extensiones para análisis
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Crear vista para estadísticas de performance
CREATE OR REPLACE VIEW db_performance_stats AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins + n_tup_upd + n_tup_del as total_writes
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- 7. MANTENIMIENTO

-- Función para análisis y optimización automática
CREATE OR REPLACE FUNCTION optimize_database()
RETURNS text AS $$
DECLARE
    result text := '';
    start_time timestamp;
    end_time timestamp;
BEGIN
    start_time := clock_timestamp();
    
    -- Analizar tablas
    ANALYZE;
    result := result || 'ANALYZE completado. ';
    
    -- Limpiar índices
    REINDEX DATABASE CURRENT_DATABASE();
    result := result || 'REINDEX completado. ';
    
    -- Vaciar tabla de logs si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_logs') THEN
        DELETE FROM api_logs WHERE "createdAt" < CURRENT_DATE - INTERVAL '30 days';
        result := result || 'Logs antiguos limpiados. ';
    END IF;
    
    -- Obtener estadísticas
    SELECT pg_size_pretty(pg_database_size(CURRENT_DATABASE())) INTO result;
    result := result || ' Tamaño de DB: ' || result || '. ';
    
    end_time := clock_timestamp();
    result := result || 'Optimización completada en ' || 
              EXTRACT(EPOCHS FROM (end_time - start_time)) || ' segundos.';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. BACKUP Y RECOVERY

-- Función para backup programático
CREATE OR REPLACE FUNCTION create_backup()
RETURNS text AS $$
DECLARE
    backup_name text;
    backup_path text;
BEGIN
    backup_name := 'luxurywatch_backup_' || to_char(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS');
    backup_path := '/backups/' || backup_name || '.sql';
    
    -- Este comando debe ejecutarse externamente con pg_dump
    result := 'Ejecuta: pg_dump luxurywatch_db > ' || backup_path;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
`;

module.exports = { optimizationsSQL };

// Script de Node.js para ejecutar optimizaciones
const { Client } = require('pg');
require('dotenv').config();

/**
 * Ejecutar optimizaciones de base de datos
 */
async function runOptimizations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔧 Conectando a la base de datos...');

    // Ejecutar optimizaciones
    console.log('🚀 Ejecutando optimizaciones de base de datos...');
    await client.query(optimizationsSQL);
    
    console.log('✅ Optimizaciones completadas exitosamente');
    
    // Mostrar estadísticas después de las optimizaciones
    const stats = await client.query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins,
        n_tup_upd,
        n_tup_del,
        n_live_tup,
        n_dead_tup
      FROM pg_stat_user_tables
      ORDER BY schemaname, tablename
    `);
    
    console.log('📊 Estadísticas de tablas:');
    stats.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.n_live_tup} registros activos, ${row.n_dead_tup} registros muertos`);
    });

  } catch (error) {
    console.error('❌ Error ejecutando optimizaciones:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Función para verificar performance
async function checkPerformance() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    // Verificar índices
    const indexes = await client.query(`
      SELECT 
        t.relname as table_name,
        i.relname as index_name,
        array_agg(a.attname) as columns
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid
      WHERE t.relkind = 'r'
        AND a.attnum = ANY(ix.indkey)
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      GROUP BY t.relname, i.relname
      ORDER BY t.relname
    `);
    
    console.log('📈 Índices existentes:');
    indexes.rows.forEach(index => {
      console.log(`  ${index.table_name}.${index.index_name} (${index.columns.join(', ')})`);
    });
    
    // Verificar performance de consultas frecuentes
    const slowQueries = await client.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements
      ORDER BY mean_time DESC
      LIMIT 10
    `);
    
    if (slowQueries.rows.length > 0) {
      console.log('🐌 Consultas más lentas:');
      slowQueries.rows.forEach(query => {
        console.log(`  Tiempo promedio: ${query.mean_time.toFixed(2)}ms - ${query.query.substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando performance:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'optimize':
      runOptimizations();
      break;
    case 'check':
      checkPerformance();
      break;
    default:
      console.log('Uso: node database-optimization.js [optimize|check]');
  }
}

module.exports = { runOptimizations, checkPerformance };
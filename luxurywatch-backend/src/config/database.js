const { Pool } = require('pg');
const logger = require('../utils/logger');

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'luxurywatch_db',
  user: process.env.DB_USER || 'luxurywatch_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Pool de conexiones
  min: parseInt(process.env.DB_POOL_MIN) || 10,
  max: parseInt(process.env.DB_POOL_MAX) || 100,
  
  // Configuración de timeout
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  
  // Configuración de statement
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 60000,
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 60000,
});

// Event listeners para logging
pool.on('connect', (client) => {
  logger.info('Nueva conexión a la base de datos establecida');
});

pool.on('error', (err, client) => {
  logger.error('Error inesperado en el cliente de base de datos', err);
});

// Función para ejecutar queries con retry
const query = async (text, params, options = {}) => {
  const { retries = 3, retryDelay = 1000 } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      logger.error(`Error en query (intento ${attempt + 1}/${retries + 1})`, {
        query: text,
        params,
        error: error.message
      });
      
      if (attempt === retries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
};

// Función para transacciones
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Función para obtener un cliente del pool
const getClient = async () => {
  return await pool.connect();
};

// Verificar conexión
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    logger.info('Conexión a base de datos exitosa', {
      currentTime: result.rows[0].current_time,
      version: result.rows[0].db_version
    });
    return true;
  } catch (error) {
    logger.error('Error conectando a la base de datos', error);
    return false;
  }
};

// Limpiar pool de conexiones
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Pool de conexiones cerrado correctamente');
  } catch (error) {
    logger.error('Error cerrando pool de conexiones', error);
  }
};

module.exports = {
  pool,
  query,
  transaction,
  getClient,
  testConnection,
  closePool
};

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const { cacheService } = require('../config/redis');

const prisma = new PrismaClient();

/**
 * Middleware de autenticación JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido'
      });
    }

    // Verificar formato del token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido'
      });
    }

    const token = parts[1];

    // Verificar token en cache primero
    const tokenKey = `auth_token:${token}`;
    let user = await cacheService.get(tokenKey);

    if (!user) {
      // Verificar y decodificar token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario en base de datos
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true
          }
        });

        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Usuario no encontrado'
          });
        }

        if (!user.isActive) {
          return res.status(401).json({
            success: false,
            error: 'Usuario inactivo'
          });
        }

        // Guardar en cache por 1 hora
        await cacheService.set(tokenKey, user, 3600);
        
      } catch (jwtError) {
        logger.error('Error verificando token JWT', jwtError);
        return res.status(401).json({
          success: false,
          error: 'Token inválido o expirado'
        });
      }
    }

    // Adjuntar información del usuario a la request
    req.user = user;
    
    // Continuar con el siguiente middleware
    next();

  } catch (error) {
    logger.error('Error en middleware de autenticación', error);
    res.status(500).json({
      success: false,
      error: 'Error de autenticación'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: `Permiso requerido: ${permission}`
      });
    }

    next();
  };
};

/**
 * Generar token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'luxurywatch',
      audience: 'luxurywatch-users'
    }
  );
};

/**
 * Verificar token sin middleware (para uso en servicios)
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    return user;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

/**
 * Refrescar token
 */
const refreshToken = async (oldToken) => {
  try {
    const user = await verifyToken(oldToken);
    return generateToken(user);
  } catch (error) {
    throw new Error('No se pudo refrescar el token');
  }
};

/**
 * Revocar token
 */
const revokeToken = async (token) => {
  try {
    // Agregar token a lista de revocados
    const revokedKey = `revoked_token:${token}`;
    await cacheService.set(revokedKey, { revoked: true }, 86400); // 24 horas
    
    logger.info('Token revocado', { token: token.substring(0, 10) + '...' });
    
    return true;
  } catch (error) {
    logger.error('Error revocando token', error);
    return false;
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next(); // Continuar sin autenticación
  }

  try {
    await authMiddleware(req, res, next);
  } catch (error) {
    // Si falla la autenticación, continuar sin usuario
    next();
  }
};

/**
 * Middleware para verificar API key (para APIs externas)
 */
const requireApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key requerida'
      });
    }

    // Verificar API key en base de datos
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!apiKeyRecord) {
      return res.status(401).json({
        success: false,
        error: 'API key inválida'
      });
    }

    if (!apiKeyRecord.isActive) {
      return res.status(401).json({
        success: false,
        error: 'API key inactiva'
      });
    }

    if (apiKeyRecord.expiresAt && new Date() > apiKeyRecord.expiresAt) {
      return res.status(401).json({
        success: false,
        error: 'API key expirada'
      });
    }

    // Adjuntar información del usuario de la API key
    req.apiUser = {
      id: apiKeyRecord.user.id,
      email: apiKeyRecord.user.email,
      firstName: apiKeyRecord.user.firstName,
      lastName: apiKeyRecord.user.lastName,
      role: apiKeyRecord.user.role,
      apiKeyId: apiKeyRecord.id
    };

    next();
  } catch (error) {
    logger.error('Error en middleware de API key', error);
    res.status(500).json({
      success: false,
      error: 'Error de autenticación API'
    });
  }
};

/**
 * Middleware para CORS personalizado
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://luxurywatch.com',
      'https://admin.luxurywatch.com'
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission,
  optionalAuth,
  requireApiKey,
  generateToken,
  verifyToken,
  refreshToken,
  revokeToken,
  corsOptions
};

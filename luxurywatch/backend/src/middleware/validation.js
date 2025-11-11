const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// =====================================
// VALIDACIÓN DE REQUESTS
// =====================================

/**
 * Manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Errores de validación', {
      errors: errors.array(),
      path: req.path,
      method: req.method
    });

    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Validar request completo
 */
const validateRequest = (rules = {}) => {
  const validations = [];
  
  // Validaciones de parámetros de ruta
  if (rules.id) {
    validations.push(
      param('id').custom((value) => {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
          throw new Error('ID debe ser un UUID válido');
        }
        return true;
      })
    );
  }

  if (rules.identifier) {
    validations.push(
      param('identifier').isLength({ min: 1, max: 255 }).withMessage('Identificador requerido')
    );
  }

  // Validaciones de query parameters
  if (rules.page) {
    validations.push(
      query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0')
    );
  }

  if (rules.limit) {
    validations.push(
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100')
    );
  }

  // Validaciones de body
  if (rules.email) {
    validations.push(
      body('email').isEmail().withMessage('Email debe ser válido').normalizeEmail()
    );
  }

  if (rules.password) {
    validations.push(
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password debe contener al menos una mayúscula, una minúscula y un número')
    );
  }

  if (rules.name) {
    validations.push(
      body('name').isLength({ min: 1, max: 255 }).withMessage('Nombre requerido y máximo 255 caracteres')
    );
  }

  if (rules.string) {
    validations.push(
      body(rules.string).isString().withMessage(`${rules.string} debe ser un string`)
    );
  }

  if (rules.required) {
    const fields = Array.isArray(rules.required) ? rules.required : [rules.required];
    fields.forEach(field => {
      validations.push(
        body(field).notEmpty().withMessage(`${field} es requerido`)
      );
    });
  }

  if (rules.integer) {
    const fields = Array.isArray(rules.integer) ? rules.integer : [rules.integer];
    fields.forEach(field => {
      validations.push(
        body(field).optional().isInt().withMessage(`${field} debe ser un entero`)
      );
    });
  }

  if (rules.decimal) {
    const fields = Array.isArray(rules.decimal) ? rules.decimal : [rules.decimal];
    fields.forEach(field => {
      validations.push(
        body(field).optional().isDecimal().withMessage(`${field} debe ser un número decimal`)
      );
    });
  }

  if (rules.boolean) {
    const fields = Array.isArray(rules.boolean) ? rules.boolean : [rules.boolean];
    fields.forEach(field => {
      validations.push(
        body(field).optional().isBoolean().withMessage(`${field} debe ser true o false`)
      );
    });
  }

  if (rules.date) {
    const fields = Array.isArray(rules.date) ? rules.date : [rules.date];
    fields.forEach(field => {
      validations.push(
        body(field).optional().isISO8601().withMessage(`${field} debe ser una fecha válida`)
      );
    });
  }

  if (rules.object) {
    const fields = Array.isArray(rules.object) ? rules.object : [rules.object];
    fields.forEach(field => {
      validations.push(
        body(field).optional().isObject().withMessage(`${field} debe ser un objeto`)
      );
    });
  }

  if (rules.array) {
    const fields = Array.isArray(rules.array) ? rules.array : [rules.array];
    fields.forEach(field => {
      validations.push(
        body(field).optional().isArray().withMessage(`${field} debe ser un array`)
      );
    });
  }

  if (rules.enum) {
    Object.entries(rules.enum).forEach(([field, values]) => {
      validations.push(
        body(field).optional().isIn(values).withMessage(`${field} debe ser uno de: ${values.join(', ')}`)
      );
    });
  }

  if (rules.length) {
    Object.entries(rules.length).forEach(([field, length]) => {
      validations.push(
        body(field).optional().isLength(length).withMessage(`${field} debe tener ${length.min}-${length.max} caracteres`)
      );
    });
  }

  if (rules.min) {
    Object.entries(rules.min).forEach(([field, min]) => {
      validations.push(
        body(field).optional().isFloat({ min }).withMessage(`${field} debe ser mayor o igual a ${min}`)
      );
    });
  }

  if (rules.max) {
    Object.entries(rules.max).forEach(([field, max]) => {
      validations.push(
        body(field).optional().isFloat({ max }).withMessage(`${field} debe ser menor o igual a ${max}`)
      );
    });
  }

  if (rules.regex) {
    Object.entries(rules.regex).forEach(([field, pattern]) => {
      validations.push(
        body(field).optional().matches(pattern).withMessage(`${field} no cumple con el formato requerido`)
      );
    });
  }

  if (rules.unique) {
    const fields = Array.isArray(rules.unique) ? rules.unique : [rules.unique];
    fields.forEach(field => {
      validations.push(
        body(field).custom((value, { req }) => {
          // Aquí iría la lógica para verificar unicidad en base de datos
          // Por ahora solo validamos el formato
          return true;
        }).withMessage(`${field} ya existe`)
      );
    });
  }

  return [...validations, handleValidationErrors];
};

/**
 * Validar parámetros de ruta
 */
const validateParams = (rules) => {
  const validations = [];
  
  Object.entries(rules).forEach(([paramName, rule]) => {
    let validation = param(paramName);
    
    if (rule.required !== false) {
      validation = validation.notEmpty().withMessage(`${paramName} es requerido`);
    }
    
    if (rule.type === 'int') {
      validation = validation.isInt().withMessage(`${paramName} debe ser un entero`);
    } else if (rule.type === 'uuid') {
      validation = validation.custom((value) => {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
          throw new Error(`${paramName} debe ser un UUID válido`);
        }
        return true;
      });
    } else if (rule.type === 'string') {
      validation = validation.isString().withMessage(`${paramName} debe ser un string`);
      if (rule.minLength) {
        validation = validation.isLength({ min: rule.minLength }).withMessage(`${paramName} debe tener al menos ${rule.minLength} caracteres`);
      }
      if (rule.maxLength) {
        validation = validation.isLength({ max: rule.maxLength }).withMessage(`${paramName} no puede tener más de ${rule.maxLength} caracteres`);
      }
    }
    
    validations.push(validation);
  });
  
  return [...validations, handleValidationErrors];
};

// =====================================
// UPLOAD DE ARCHIVOS
// =====================================

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadType = req.params.type || 'general';
      const uploadPath = path.join(process.cwd(), 'uploads', uploadType);
      
      // Crear directorio si no existe
      await fs.mkdir(uploadPath, { recursive: true });
      
      cb(null, uploadPath);
    } catch (error) {
      logger.error('Error creando directorio de upload', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Configurar tipos permitidos por tipo de upload
  const allowedTypes = {
    images: /jpeg|jpg|png|gif|webp|svg/,
    documents: /pdf|doc|docx|txt/,
    videos: /mp4|mov|avi|wmv/,
    audio: /mp3|wav|ogg/,
    general: /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx/
  };

  const uploadType = req.params.type || 'general';
  const mimeType = file.mimetype;
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes[uploadType] && allowedTypes[uploadType].test(mimeType) || 
      allowedTypes[uploadType] && allowedTypes[uploadType].test(extname)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido para ${uploadType}`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por defecto
    files: 5, // máximo 5 archivos
    fields: 20
  }
});

/**
 * Middleware de upload con procesamiento de imagen
 */
const uploadWithProcessing = (options = {}) => {
  const {
    type = 'images',
    processImage = true,
    sizes = [
      { name: 'thumbnail', width: 300, height: 300 },
      { name: 'medium', width: 800, height: 600 },
      { name: 'large', width: 1200, height: 900 }
    ],
    quality = 80
  } = options;

  return async (req, res, next) => {
    try {
      // Usar multer para procesar el upload
      upload.single('file')(req, res, async (err) => {
        if (err) {
          logger.error('Error en upload', err);
          return res.status(400).json({
            success: false,
            error: err.message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No se proporcionó ningún archivo'
          });
        }

        let processedFiles = [req.file];

        // Procesar imagen si es necesario
        if (processImage && type === 'images') {
          try {
            processedFiles = await processImageFile(req.file, sizes, quality);
            
            // Eliminar archivo original si se procesó
            if (processedFiles.length > 1) {
              await fs.unlink(req.file.path);
            }
          } catch (processingError) {
            logger.error('Error procesando imagen', processingError);
            // Continuar con el archivo original si hay error en procesamiento
          }
        }

        req.processedFiles = processedFiles;
        next();
      });
    } catch (error) {
      logger.error('Error en uploadWithProcessing', error);
      res.status(500).json({
        success: false,
        error: 'Error procesando upload'
      });
    }
  };
};

/**
 * Procesar archivo de imagen
 */
const processImageFile = async (originalFile, sizes, quality) => {
  const processedFiles = [];
  
  for (const size of sizes) {
    const inputPath = originalFile.path;
    const outputPath = inputPath.replace(/\.[^/.]+$/, `_${size.name}${path.extname(inputPath)}`);
    
    try {
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toFile(outputPath);
      
      processedFiles.push({
        ...originalFile,
        path: outputPath,
        filename: path.basename(outputPath),
        size: await getFileSize(outputPath),
        type: 'processed',
        sizeName: size.name
      });
      
    } catch (error) {
      logger.error(`Error procesando imagen ${size.name}`, error);
    }
  }

  // Siempre incluir el original como 'original'
  if (processedFiles.length > 0) {
    processedFiles.unshift({
      ...originalFile,
      type: 'original'
    });
  } else {
    processedFiles.push(originalFile);
  }

  return processedFiles;
};

/**
 * Obtener tamaño de archivo
 */
const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

/**
 * Upload múltiple
 */
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Upload de campos múltiples
 */
const uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Limpiar archivos temporales
 */
const cleanupFiles = async (files) => {
  if (!files) return;
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  for (const file of fileArray) {
    try {
      if (file.path) {
        await fs.unlink(file.path);
      }
    } catch (error) {
      logger.warn('Error eliminando archivo temporal', { file: file.path, error });
    }
  }
};

/**
 * Middleware para limpiar archivos en caso de error
 */
const cleanupOnError = () => {
  return (req, res, next) => {
    // Limpiar archivos en caso de respuesta con error
    const originalJson = res.json;
    res.json = function(data) {
      if (!data.success && req.processedFiles) {
        cleanupFiles(req.processedFiles);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Validar upload de imagen específico
 */
const validateImageUpload = (options = {}) => {
  const {
    required = true,
    minWidth = 0,
    minHeight = 0,
    maxWidth = 4000,
    maxHeight = 4000,
    allowedFormats = ['jpeg', 'jpg', 'png', 'webp']
  } = options;

  return async (req, res, next) => {
    if (!req.file && required) {
      return res.status(400).json({
        success: false,
        error: 'Imagen requerida'
      });
    }

    if (req.file) {
      try {
        const metadata = await sharp(req.file.path).metadata();
        
        if (metadata.width < minWidth || metadata.height < minHeight) {
          throw new Error(`Imagen muy pequeña. Mínimo ${minWidth}x${minHeight}px`);
        }
        
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          throw new Error(`Imagen muy grande. Máximo ${maxWidth}x${maxHeight}px`);
        }
        
        if (!allowedFormats.includes(metadata.format)) {
          throw new Error(`Formato no permitido. Permitidos: ${allowedFormats.join(', ')}`);
        }
        
        req.imageMetadata = metadata;
        next();
      } catch (error) {
        logger.error('Error validando imagen', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
    } else {
      next();
    }
  };
};

module.exports = {
  validateRequest,
  validateParams,
  handleValidationErrors,
  upload,
  uploadWithProcessing,
  uploadMultiple,
  uploadFields,
  cleanupFiles,
  cleanupOnError,
  validateImageUpload
};

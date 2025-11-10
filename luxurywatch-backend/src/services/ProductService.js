const { PrismaClient } = require('@prisma/client');
const { cacheService } = require('../config/redis');
const logger = require('../utils/logger');

class ProductService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // =====================================
  // GESTIÓN DE PRODUCTOS
  // =====================================

  /**
   * Obtener todos los productos con filtros y paginación
   */
  async getProducts(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        categoryId,
        search,
        status = 'ACTIVE',
        isFeatured,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      // Verificar cache primero
      const cacheKey = `products:${JSON.stringify(filters)}:${page}:${limit}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const skip = (page - 1) * limit;
      
      const where = {
        status: status || undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        categoryId: categoryId || undefined,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } }
          ]
        })
      };

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            category: true,
            variants: {
              where: { isActive: true },
              orderBy: { position: 'asc' },
              take: 1
            },
            images: {
              where: { isFeatured: true },
              take: 1
            },
            watchConfig: true
          }
        }),
        this.prisma.product.count({ where })
      ]);

      const result = {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      // Guardar en cache por 10 minutos
      await cacheService.set(cacheKey, result, 600);

      return result;
    } catch (error) {
      logger.error('Error obteniendo productos', error);
      throw new Error('Error al obtener productos');
    }
  }

  /**
   * Obtener un producto por ID o slug
   */
  async getProduct(identifier) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      const where = isUUID ? { id: identifier } : { slug: identifier };

      // Verificar cache
      const cacheKey = `product:${identifier}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const product = await this.prisma.product.findUnique({
        where,
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { position: 'asc' },
            include: {
              watchVariation: {
                include: {
                  material: true,
                  case: { include: { material: true } },
                  dial: true,
                  hands: true,
                  strap: true
                }
              },
              attributes: {
                include: {
                  attribute: true,
                  value: true
                }
              },
              images: {
                orderBy: { sortOrder: 'asc' }
              },
              inventory: true
            }
          },
          attributes: {
            include: {
              attribute: true
            }
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          watchConfig: {
            include: {
              material: true,
              case: { include: { material: true } },
              dial: true,
              hands: true,
              strap: true
            }
          }
        }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Guardar en cache por 30 minutos
      await cacheService.set(cacheKey, product, 1800);

      return product;
    } catch (error) {
      logger.error('Error obteniendo producto', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo producto
   */
  async createProduct(productData) {
    try {
      const {
        name,
        slug,
        description,
        shortDescription,
        sku,
        categoryId,
        brand,
        productType = 'CONFIGURABLE',
        featuredImage,
        galleryImages,
        weight,
        dimensions,
        metaTitle,
        metaDescription,
        tags,
        isFeatured = false,
        isConfigurable = true
      } = productData;

      // Verificar que el slug sea único
      const existingProduct = await this.prisma.product.findUnique({
        where: { slug }
      });

      if (existingProduct) {
        throw new Error('Ya existe un producto con este slug');
      }

      // Crear el producto
      const product = await this.prisma.product.create({
        data: {
          name,
          slug,
          description,
          shortDescription,
          sku,
          categoryId,
          brand,
          productType,
          featuredImage,
          galleryImages,
          weight,
          dimensions,
          metaTitle,
          metaDescription,
          tags,
          isFeatured,
          isConfigurable
        },
        include: {
          category: true,
          variants: true,
          images: true
        }
      });

      // Limpiar cache de productos
      await cacheService.clearPattern('products:*');

      logger.info('Producto creado exitosamente', { productId: product.id, name: product.name });

      return product;
    } catch (error) {
      logger.error('Error creando producto', error);
      throw error;
    }
  }

  /**
   * Actualizar un producto
   */
  async updateProduct(productId, updateData) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Verificar slug único si se está actualizando
      if (updateData.slug && updateData.slug !== product.slug) {
        const existingProduct = await this.prisma.product.findUnique({
          where: { slug: updateData.slug }
        });

        if (existingProduct) {
          throw new Error('Ya existe un producto con este slug');
        }
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id: productId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { position: 'asc' }
          },
          images: true
        }
      });

      // Limpiar cache
      await cacheService.del(`product:${productId}`);
      await cacheService.del(`product:${product.slug}`);
      await cacheService.clearPattern('products:*');

      logger.info('Producto actualizado exitosamente', { productId });

      return updatedProduct;
    } catch (error) {
      logger.error('Error actualizando producto', error);
      throw error;
    }
  }

  /**
   * Eliminar un producto
   */
  async deleteProduct(productId) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      await this.prisma.product.delete({
        where: { id: productId }
      });

      // Limpiar cache
      await cacheService.del(`product:${productId}`);
      await cacheService.del(`product:${product.slug}`);
      await cacheService.clearPattern('products:*');

      logger.info('Producto eliminado exitosamente', { productId });

      return { success: true };
    } catch (error) {
      logger.error('Error eliminando producto', error);
      throw error;
    }
  }

  // =====================================
  // VARIACIONES DE PRODUCTO
  // =====================================

  /**
   * Crear una variación de producto
   */
  async createProductVariant(variantData) {
    try {
      const {
        productId,
        name,
        sku,
        price,
        compareAtPrice,
        costPrice,
        manageStock = true,
        stockQuantity = 0,
        weight,
        dimensions,
        imageUrl,
        isActive = true,
        position = 0,
        
        // Configuración 3D para watches
        materialId,
        caseId,
        dialId,
        handsId,
        strapId,
        model3DUrl,
        previewImages,
        priceModifier = 0,
        isAvailable3D = true
      } = variantData;

      // Verificar que el producto existe
      const product = await this.prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Verificar SKU único
      if (sku) {
        const existingVariant = await this.prisma.productVariant.findUnique({
          where: { sku }
        });

        if (existingVariant) {
          throw new Error('Ya existe una variación con este SKU');
        }
      }

      // Crear la variación en transacción
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear variación
        const variant = await tx.productVariant.create({
          data: {
            productId,
            name,
            sku,
            price,
            compareAtPrice,
            costPrice,
            manageStock,
            stockQuantity,
            weight,
            dimensions,
            imageUrl,
            isActive,
            position
          }
        });

        // Crear configuración 3D si es un watch
        if (product.isConfigurable) {
          await tx.watchVariation.create({
            data: {
              variantId: variant.id,
              materialId,
              caseId,
              dialId,
              handsId,
              strapId,
              model3DUrl,
              previewImages,
              priceModifier,
              isAvailable3D
            }
          });
        }

        // Crear inventario inicial
        if (manageStock) {
          await tx.inventory.create({
            data: {
              variantId: variant.id,
              quantity: stockQuantity,
              trackQuantity: true
            }
          });
        }

        return variant;
      });

      // Limpiar cache
      await cacheService.del(`product:${productId}`);
      await cacheService.clearPattern('products:*');

      logger.info('Variación de producto creada', { variantId: result.id, productId });

      return result;
    } catch (error) {
      logger.error('Error creando variación', error);
      throw error;
    }
  }

  /**
   * Actualizar stock de una variación
   */
  async updateVariantStock(variantId, quantity, operation = 'set') {
    try {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { inventory: true }
      });

      if (!variant) {
        throw new Error('Variación no encontrada');
      }

      let newQuantity;
      switch (operation) {
        case 'add':
          newQuantity = variant.inventory?.quantity + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, variant.inventory?.quantity - quantity);
          break;
        case 'set':
        default:
          newQuantity = quantity;
          break;
      }

      // Actualizar en transacción
      const result = await this.prisma.$transaction(async (tx) => {
        // Actualizar inventario
        if (variant.inventory) {
          return await tx.inventory.update({
            where: { variantId },
            data: {
              quantity: newQuantity,
              updatedAt: new Date()
            }
          });
        } else {
          return await tx.inventory.create({
            data: {
              variantId,
              quantity: newQuantity,
              trackQuantity: true
            }
          });
        }
      });

      // Actualizar stock status automáticamente
      const stockStatus = newQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
      await this.prisma.productVariant.update({
        where: { id: variantId },
        data: { stockStatus }
      });

      // Limpiar cache
      await cacheService.del(`product:${variant.productId}`);

      logger.info('Stock actualizado', { variantId, newQuantity, operation });

      return result;
    } catch (error) {
      logger.error('Error actualizando stock', error);
      throw error;
    }
  }

  // =====================================
  // CONFIGURACIÓN 3D PARA WATCHES
  // =====================================

  /**
   * Obtener configuración 3D por ID
   */
  async get3DConfiguration(configId) {
    try {
      // Verificar cache
      const cacheKey = `3d-config:${configId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const config = await this.prisma.watchVariation.findUnique({
        where: { id: configId },
        include: {
          material: true,
          case: {
            include: { material: true }
          },
          dial: true,
          hands: true,
          strap: true,
          variant: {
            include: {
              product: true,
              images: true
            }
          }
        }
      });

      if (!config) {
        throw new Error('Configuración 3D no encontrada');
      }

      // Guardar en cache por 1 hora
      await cacheService.set(cacheKey, config, 3600);

      return config;
    } catch (error) {
      logger.error('Error obteniendo configuración 3D', error);
      throw error;
    }
  }

  /**
   * Calcular precio total de una configuración 3D
   */
  async calculate3DConfigPrice(configData) {
    try {
      const {
        materialId,
        caseId,
        dialId,
        handsId,
        strapId
      } = configData;

      let totalPrice = 0;
      const components = [];

      // Obtener precios de componentes
      const [material, case_, dial, hands, strap] = await Promise.all([
        materialId ? this.prisma.watchMaterial.findUnique({ where: { id: materialId } }) : null,
        caseId ? this.prisma.watchCase.findUnique({ where: { id: caseId } }) : null,
        dialId ? this.prisma.watchDial.findUnique({ where: { id: dialId } }) : null,
        handsId ? this.prisma.watchHands.findUnique({ where: { id: handsId } }) : null,
        strapId ? this.prisma.watchStrap.findUnique({ where: { id: strapId } }) : null
      ]);

      // Calcular total
      if (material) {
        totalPrice += material.price;
        components.push({ name: material.name, price: material.price, type: 'material' });
      }

      if (case_) {
        totalPrice += case_.price;
        components.push({ name: case_.name, price: case_.price, type: 'case' });
      }

      if (dial) {
        totalPrice += dial.price;
        components.push({ name: dial.name, price: dial.price, type: 'dial' });
      }

      if (hands) {
        totalPrice += hands.price;
        components.push({ name: hands.name, price: hands.price, type: 'hands' });
      }

      if (strap) {
        totalPrice += strap.price;
        components.push({ name: strap.name, price: strap.price, type: 'strap' });
      }

      return {
        totalPrice,
        components,
        basePrice: 0, // Precio base del producto
        finalPrice: totalPrice
      };
    } catch (error) {
      logger.error('Error calculando precio de configuración 3D', error);
      throw error;
    }
  }

  /**
   * Verificar compatibilidad de componentes 3D
   */
  async validate3DConfiguration(configData) {
    try {
      const { materialId, caseId } = configData;

      if (!materialId || !caseId) {
        return { valid: true, message: 'Configuración válida' };
      }

      // Verificar compatibilidad material-case
      const caseData = await this.prisma.watchCase.findUnique({
        where: { id: caseId },
        include: { material: true }
      });

      if (!caseData) {
        return { valid: false, message: 'Caja no encontrada' };
      }

      // Verificar si el material de la caja es compatible
      if (caseData.materialId && caseData.materialId !== materialId) {
        // Lógica de compatibilidad específica para watches
        const incompatible = false; // Por ahora, permitir todas las combinaciones
        
        if (incompatible) {
          return {
            valid: false,
            message: `El material ${caseData.material.name} no es compatible con la caja seleccionada`
          };
        }
      }

      return { valid: true, message: 'Configuración válida' };
    } catch (error) {
      logger.error('Error validando configuración 3D', error);
      throw error;
    }
  }

  // =====================================
  // COMPONENTES DE WATCHES
  // =====================================

  /**
   * Obtener todos los materiales disponibles
   */
  async getWatchMaterials() {
    try {
      const cacheKey = 'watch-materials';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const materials = await this.prisma.watchMaterial.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      await cacheService.set(cacheKey, materials, 3600);
      return materials;
    } catch (error) {
      logger.error('Error obteniendo materiales', error);
      throw error;
    }
  }

  /**
   * Obtener todas las cajas disponibles
   */
  async getWatchCases() {
    try {
      const cacheKey = 'watch-cases';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const cases = await this.prisma.watchCase.findMany({
        where: { isActive: true },
        include: { material: true },
        orderBy: [{ shape: 'asc' }, { sizeMm: 'asc' }]
      });

      await cacheService.set(cacheKey, cases, 3600);
      return cases;
    } catch (error) {
      logger.error('Error obteniendo cajas', error);
      throw error;
    }
  }

  /**
   * Obtener todas las esferas disponibles
   */
  async getWatchDials() {
    try {
      const cacheKey = 'watch-dials';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const dials = await this.prisma.watchDial.findMany({
        where: { isActive: true },
        orderBy: [{ styleCategory: 'asc' }, { name: 'asc' }]
      });

      await cacheService.set(cacheKey, dials, 3600);
      return dials;
    } catch (error) {
      logger.error('Error obteniendo esferas', error);
      throw error;
    }
  }

  /**
   * Obtener todas las manecillas disponibles
   */
  async getWatchHands() {
    try {
      const cacheKey = 'watch-hands';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const hands = await this.prisma.watchHands.findMany({
        where: { isActive: true },
        orderBy: [{ style: 'asc' }, { name: 'asc' }]
      });

      await cacheService.set(cacheKey, hands, 3600);
      return hands;
    } catch (error) {
      logger.error('Error obteniendo manecillas', error);
      throw error;
    }
  }

  /**
   * Obtener todas las correas disponibles
   */
  async getWatchStraps() {
    try {
      const cacheKey = 'watch-straps';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const straps = await this.prisma.watchStrap.findMany({
        where: { isActive: true },
        orderBy: [{ materialType: 'asc' }, { style: 'asc' }]
      });

      await cacheService.set(cacheKey, straps, 3600);
      return straps;
    } catch (error) {
      logger.error('Error obteniendo correas', error);
      throw error;
    }
  }

  // =====================================
  // BÚSQUEDA Y FILTROS
  // =====================================

  /**
   * Buscar productos con filtros avanzados
   */
  async searchProducts(searchParams) {
    try {
      const {
        query,
        categoryIds,
        priceMin,
        priceMax,
        materials,
        styles,
        sizes,
        availability = 'in_stock',
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = searchParams;

      const skip = (page - 1) * limit;

      const where = {
        status: 'ACTIVE',
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } }
          ]
        }),
        ...(categoryIds && categoryIds.length > 0 && {
          categoryId: { in: categoryIds }
        }),
        variants: {
          some: {
            isActive: true,
            ...(priceMin && { price: { gte: priceMin } }),
            ...(priceMax && { price: { lte: priceMax } }),
            ...(availability === 'in_stock' && { stockQuantity: { gt: 0 } })
          }
        }
      };

      // Ordenamiento
      let orderBy = {};
      switch (sortBy) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'name_asc':
          orderBy = { name: 'asc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'popular':
          orderBy = { ordersCount: 'desc' };
          break;
        default:
          orderBy = { relevance: 'desc' };
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: true,
            variants: {
              where: { isActive: true },
              orderBy: { price: 'asc' },
              take: 1
            },
            images: {
              where: { isFeatured: true },
              take: 1
            }
          }
        }),
        this.prisma.product.count({ where })
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error en búsqueda de productos', error);
      throw error;
    }
  }

  /**
   * Obtener productos relacionados
   */
  async getRelatedProducts(productId, limit = 4) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const relatedProducts = await this.prisma.product.findMany({
        where: {
          id: { not: productId },
          status: 'ACTIVE',
          categoryId: product.categoryId
        },
        take: limit,
        orderBy: { isFeatured: 'desc' },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 1
          },
          images: {
            where: { isFeatured: true },
            take: 1
          }
        }
      });

      return relatedProducts;
    } catch (error) {
      logger.error('Error obteniendo productos relacionados', error);
      throw error;
    }
  }
}

module.exports = ProductService;

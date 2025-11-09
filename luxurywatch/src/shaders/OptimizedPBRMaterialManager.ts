/**
 * Configurador de Materiales PBR Optimizados
 * Integra el sistema de optimización de shaders y resolve warnings WebGL
 * 
 * CARACTERÍSTICAS:
 * - Materiales PBR con shaders optimizados
 * - Guards contra división por cero (X4008)
 * - Precision qualifiers apropiados (X4122)
 * - Adaptación automática según GPU
 * - Fallbacks para compatibilidad
 */

import * as THREE from 'three'
import { shaderOptimizer, GPUCapabilities } from './WebGLShaderOptimizer'

export interface OptimizedPBRConfig {
  baseColor: string | number
  metalness: number
  roughness: number
  ior: number
  transmission?: number
  thickness?: number
  envMapIntensity?: number
  clearcoat?: number
  clearcoatRoughness?: number
  sheen?: number
  sheenRoughness?: number
  emissive?: string | number
  emissiveIntensity?: number
  useOptimizedShader?: boolean
  fallbackToStandard?: boolean
}

export class OptimizedPBRMaterialManager {
  private capabilities: GPUCapabilities
  private adaptiveConfig: ReturnType<typeof shaderOptimizer.getAdaptiveQualityConfig>

  constructor() {
    this.capabilities = shaderOptimizer.getCapabilities()
    this.adaptiveConfig = shaderOptimizer.getAdaptiveQualityConfig()
  }

  /**
   * Crea material PBR optimizado según las capacidades GPU detectadas
   */
  public createOptimizedMaterial(materialType: string, customConfig?: Partial<OptimizedPBRConfig>): THREE.Material {
    const config = this.getOptimizedMaterialConfig(materialType, customConfig)
    
    // Si el hardware soporta shaders personalizados y la calidad es alta
    if (config.useOptimizedShader && this.capabilities.performanceLevel === 'highEnd') {
      return this.createCustomShaderMaterial(config)
    } else {
      return this.createOptimizedPhysicalMaterial(config)
    }
  }

  /**
   * Configuración optimizada para cada tipo de material
   */
  private getOptimizedMaterialConfig(materialType: string, customConfig?: Partial<OptimizedPBRConfig>): OptimizedPBRConfig {
    const type = materialType.toLowerCase()
    let baseConfig: OptimizedPBRConfig

    // Configuraciones base optimizadas con guards
    if (type.includes('oro') || type.includes('gold')) {
      baseConfig = {
        baseColor: '#D4AF37',
        metalness: 1.0, // Metal puro
        roughness: 0.15, // Acabado martillado, mínimo válido para PBR
        ior: 2.5, // IOR del oro con guard mínimo
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        sheen: 1.0,
        envMapIntensity: 3.2,
        emissive: '#FFD700',
        emissiveIntensity: 0.05,
        useOptimizedShader: true
      }
    } else if (type.includes('titanio') || type.includes('titanium')) {
      baseConfig = {
        baseColor: '#6C757D',
        metalness: 1.0,
        roughness: 0.35, // Acabado cepillado característico
        ior: 2.4, // IOR del titanio
        clearcoat: 0.95,
        clearcoatRoughness: 0.06,
        sheen: 0.8,
        envMapIntensity: 2.2,
        emissive: '#6C757D',
        emissiveIntensity: 0.02,
        useOptimizedShader: true
      }
    } else if (type.includes('acero') || type.includes('steel')) {
      baseConfig = {
        baseColor: '#B0B0B0',
        metalness: 1.0,
        roughness: 0.25, // Acabado cepillado
        ior: 2.7, // IOR del acero
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        sheen: 0.9,
        envMapIntensity: 2.5,
        emissive: '#B0B0B0',
        emissiveIntensity: 0.01,
        useOptimizedShader: true
      }
    } else if (type.includes('cristal') || type.includes('zafiro') || type.includes('sapphire')) {
      baseConfig = {
        baseColor: '#FFFFFF',
        metalness: 0.0, // Dieléctrico
        roughness: 0.1, // Muy pulido con guard mínimo
        ior: 1.77, // IOR específico del zafiro
        transmission: this.adaptiveConfig.enableTransmission ? 0.98 : 0.0,
        thickness: 0.8,
        envMapIntensity: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        sheen: 0.1,
        useOptimizedShader: this.capabilities.performanceLevel !== 'lowEnd'
      }
    } else if (type.includes('cuero') || type.includes('leather')) {
      baseConfig = {
        baseColor: '#8B4513',
        metalness: 0.0,
        roughness: 0.8, // Acabado mate típico del cuero
        ior: 1.5, // IOR típico de orgánicos
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
        sheen: 0.9,
        sheenRoughness: 0.9,
        envMapIntensity: 0.3,
        useOptimizedShader: false
      }
    } else if (type.includes('caucho') || type.includes('rubber')) {
      baseConfig = {
        baseColor: '#1A1A1A',
        metalness: 0.0,
        roughness: 0.4,
        ior: 1.5,
        clearcoat: 0.0,
        sheen: 0.1,
        sheenRoughness: 0.8,
        envMapIntensity: 1.0,
        useOptimizedShader: false
      }
    } else if (type.includes('dial') || type.includes('esfera')) {
      baseConfig = {
        baseColor: '#1A1A1A',
        metalness: 0.2, // Ligeramente metálico
        roughness: 0.4, // Acabado satinado
        ior: 1.5,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
        sheen: 0.4,
        sheenRoughness: 0.3,
        envMapIntensity: 1.0,
        useOptimizedShader: false
      }
    } else {
      // Configuración por defecto (acero)
      baseConfig = {
        baseColor: '#B0B0B0',
        metalness: 1.0,
        roughness: 0.25,
        ior: 2.7,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        sheen: 0.9,
        envMapIntensity: 2.5,
        useOptimizedShader: true
      }
    }

    // Aplicar configuración personalizada si se proporciona
    if (customConfig) {
      baseConfig = { ...baseConfig, ...customConfig }
    }

    return baseConfig
  }

  /**
   * Crea material con shader personalizado optimizado
   */
  private createCustomShaderMaterial(config: OptimizedPBRConfig): THREE.Material {
    const material = shaderOptimizer.createOptimizedMaterial({
      baseColor: new THREE.Color(config.baseColor),
      metalness: Math.max(config.metalness, 0.0),
      roughness: Math.max(config.roughness, 0.04),
      ior: Math.max(config.ior, 1.0001),
      transmission: Math.max(config.transmission || 0.0, 0.0),
      thickness: Math.max(config.thickness || 0.1, 0.01),
      envMapIntensity: Math.max(config.envMapIntensity || 1.0, 0.1)
    })

    // Añadir propiedades adicionales específicas del material
    if (config.clearcoat !== undefined) {
      (material as any).uniforms = {
        ...(material as any).uniforms,
        uClearcoat: { value: Math.max(config.clearcoat, 0.0) },
        uClearcoatRoughness: { value: Math.max(config.clearcoatRoughness || 0.0, 0.0) }
      }
    }

    if (config.sheen !== undefined) {
      (material as any).uniforms = {
        ...(material as any).uniforms,
        uSheen: { value: Math.max(config.sheen, 0.0) },
        uSheenRoughness: { value: Math.max(config.sheenRoughness || 0.0, 0.0) }
      }
    }

    return material
  }

  /**
   * Crea material MeshPhysicalMaterial optimizado
   */
  private createOptimizedPhysicalMaterial(config: OptimizedPBRConfig): THREE.MeshPhysicalMaterial {
    const materialConfig: any = {
      color: config.baseColor,
      metalness: Math.max(config.metalness, 0.0),
      roughness: Math.max(config.roughness, 0.04),
      ior: Math.max(config.ior, 1.0001),
      envMapIntensity: Math.max(config.envMapIntensity || 1.0, 0.1)
    }

    // Añadir propiedades opcionales con guards
    if (config.transmission !== undefined && config.transmission > 0) {
      materialConfig.transmission = Math.max(config.transmission, 0.0)
      materialConfig.thickness = Math.max(config.thickness || 0.1, 0.01)
      materialConfig.transparent = true
      materialConfig.opacity = Math.min(0.95, 1.0 - config.transmission)
    }

    if (config.clearcoat !== undefined) {
      materialConfig.clearcoat = Math.max(config.clearcoat, 0.0)
      if (config.clearcoatRoughness !== undefined) {
        materialConfig.clearcoatRoughness = Math.max(config.clearcoatRoughness, 0.0)
      }
    }

    if (config.sheen !== undefined) {
      materialConfig.sheen = Math.max(config.sheen, 0.0)
      if (config.sheenRoughness !== undefined) {
        materialConfig.sheenRoughness = Math.max(config.sheenRoughness, 0.0)
      }
    }

    if (config.emissive) {
      materialConfig.emissive = config.emissive
      materialConfig.emissiveIntensity = Math.max(config.emissiveIntensity || 0.0, 0.0)
    }

    const material = new THREE.MeshPhysicalMaterial(materialConfig)
    return shaderOptimizer.optimizePhysicalMaterial(material)
  }

  /**
   * Aplica optimizaciones a material existente
   */
  public optimizeExistingMaterial(material: THREE.Material): THREE.Material {
    if (material instanceof THREE.MeshPhysicalMaterial) {
      return shaderOptimizer.optimizePhysicalMaterial(material)
    }
    
    if (material instanceof THREE.ShaderMaterial) {
      // Ya es un shader optimizado
      return material
    }

    // Convertir a MeshPhysicalMaterial optimizado
    const physicalMaterial = new THREE.MeshPhysicalMaterial({
      color: (material as any).color || '#FFFFFF',
      metalness: (material as any).metalness || 0.0,
      roughness: (material as any).roughness || 0.5
    })

    return shaderOptimizer.optimizePhysicalMaterial(physicalMaterial)
  }

  /**
   * Obtiene configuración de calidad adaptativa
   */
  public getAdaptiveQualitySettings(): {
    shadowMapSize: number
    maxPixelRatio: number
    enablePostProcessing: boolean
    enableTransmission: boolean
    enableOptimizedShaders: boolean
    envMapResolution: number
  } {
    return {
      shadowMapSize: this.adaptiveConfig.shadowMapSize,
      maxPixelRatio: this.adaptiveConfig.maxPixelRatio,
      enablePostProcessing: this.adaptiveConfig.enablePostProcessing,
      enableTransmission: this.adaptiveConfig.enableTransmission,
      enableOptimizedShaders: this.capabilities.performanceLevel === 'highEnd',
      envMapResolution: this.adaptiveConfig.envMapResolution
    }
  }

  /**
   * Obtiene reporte de capacidades GPU
   */
  public getCapabilitiesReport(): string {
    const report = [
      '=== REPORTE DE CAPACIDADES GPU ===',
      `GPU: ${this.capabilities.renderer}`,
      `Vendor: ${this.capabilities.vendor}`,
      `Performance Level: ${this.capabilities.performanceLevel}`,
      `Precision: ${this.capabilities.precision}`,
      `Max Texture Size: ${this.capabilities.maxTextureSize}`,
      `Max Vertex Uniforms: ${this.capabilities.maxVertexUniforms}`,
      `Extensiones soportadas: ${this.capabilities.extensions.length}`,
      '',
      '=== CONFIGURACIÓN OPTIMIZADA ===',
      `Shadow Map Size: ${this.adaptiveConfig.shadowMapSize}`,
      `Max Pixel Ratio: ${this.adaptiveConfig.maxPixelRatio}`,
      `Post Processing: ${this.adaptiveConfig.enablePostProcessing ? 'Enabled' : 'Disabled'}`,
      `Transmission: ${this.adaptiveConfig.enableTransmission ? 'Enabled' : 'Disabled'}`,
      `Optimized Shaders: ${this.capabilities.performanceLevel === 'highEnd' ? 'Enabled' : 'Disabled'}`
    ]

    return report.join('\n')
  }

  /**
   * Valida configuración de material
   */
  public validateMaterialConfig(config: OptimizedPBRConfig): { valid: boolean; warnings: string[] } {
    const warnings: string[] = []

    // Validar rangos críticos
    if (config.metalness < 0 || config.metalness > 1) {
      warnings.push('Metalness debe estar entre 0 y 1')
    }

    if (config.roughness < 0.04) {
      warnings.push('Roughness muy bajo (< 0.04) puede causar artifacts')
    }

    if (config.ior < 1.0001) {
      warnings.push('IOR demasiado bajo, usando guard mínimo')
    }

    if (config.transmission && config.transmission > 1) {
      warnings.push('Transmission debe estar entre 0 y 1')
    }

    // Validar compatibilidad
    if (config.useOptimizedShader && this.capabilities.performanceLevel === 'lowEnd') {
      warnings.push('Shaders optimizados no recomendados para hardware de bajo nivel')
    }

    return {
      valid: warnings.length === 0,
      warnings
    }
  }
}

// Singleton instance
export const optimizedPBRManager = new OptimizedPBRMaterialManager()
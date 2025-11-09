/**
 * WebGL Shader Optimizer - Solución de Warnings y Optimización
 * 
 * RESUELVE:
 * - Warnings X4122 (precisión flotante)
 * - Warnings X4008 (división por cero)
 * - Optimización de cálculos PBR
 * - Compatibilidad multi-GPU
 * - Performance adaptativo
 */

import * as THREE from 'three'

export interface GPUCapabilities {
  renderer: string
  vendor: string
  maxTextureSize: number
  maxVertexUniforms: number
  precision: 'highp' | 'mediump' | 'lowp'
  extensions: string[]
  performanceLevel: 'highEnd' | 'mobile' | 'lowEnd'
}

export interface ShaderPrecisionConfig {
  float: 'highp' | 'mediump' | 'lowp'
  sampler2D: 'highp' | 'mediump' | 'lowp'
  int: 'highp' | 'mediump' | 'lowp'
}

export class WebGLShaderOptimizer {
  private capabilities: GPUCapabilities
  private precisionConfig: ShaderPrecisionConfig

  constructor() {
    this.capabilities = this.detectGPUCapabilities()
    this.precisionConfig = this.getOptimizedPrecisionConfig()
  }

  /**
   * Detecta capacidades GPU automáticamente
   */
  private detectGPUCapabilities(): GPUCapabilities {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    
    if (!gl) {
      throw new Error('WebGL no está soportado')
    }

    const debugInfo = (gl as WebGL2RenderingContext).getExtension('WEBGL_debug_renderer_info')
    const renderer = debugInfo ? 
      (gl as WebGL2RenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 
      'Unknown'
    
    const vendor = debugInfo ? 
      (gl as WebGL2RenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 
      'Unknown'

    const maxTextureSize = (gl as WebGL2RenderingContext).getParameter((gl as WebGL2RenderingContext).MAX_TEXTURE_SIZE)
    const maxVertexUniforms = (gl as WebGL2RenderingContext).getParameter((gl as WebGL2RenderingContext).MAX_VERTEX_UNIFORM_VECTORS)

    // Detectar extensiones disponibles
    const extensions = gl.getSupportedExtensions() || []

    // Clasificar GPU
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    let performanceLevel: 'highEnd' | 'mobile' | 'lowEnd' = 'highEnd'

    if (isMobile || maxTextureSize < 4096) {
      performanceLevel = 'mobile'
    } else if (maxTextureSize < 8192 || /Intel/i.test(renderer)) {
      performanceLevel = 'lowEnd'
    }

    // Detectar precisión soportada
    let precision: 'highp' | 'mediump' | 'lowp' = 'highp'
    if (performanceLevel === 'lowEnd') {
      precision = 'mediump'
    } else if (performanceLevel === 'mobile') {
      precision = 'mediump'
    }

    return {
      renderer,
      vendor,
      maxTextureSize,
      maxVertexUniforms,
      precision,
      extensions,
      performanceLevel
    }
  }

  /**
   * Configura precision qualifiers optimizados
   */
  private getOptimizedPrecisionConfig(): ShaderPrecisionConfig {
    switch (this.capabilities.performanceLevel) {
      case 'highEnd':
        return {
          float: 'highp',
          sampler2D: 'highp',
          int: 'highp'
        }
      case 'mobile':
        return {
          float: 'mediump',
          sampler2D: 'mediump',
          int: 'mediump'
        }
      case 'lowEnd':
        return {
          float: 'mediump',
          sampler2D: 'lowp',
          int: 'lowp'
        }
      default:
        return {
          float: 'mediump',
          sampler2D: 'mediump',
          int: 'mediump'
        }
    }
  }

  /**
   * Genera vertex shader optimizado con precision qualifiers
   */
  public getOptimizedVertexShader(): string {
    const precision = this.precisionConfig

    return `
      precision ${precision.float} float;
      precision ${precision.int} int;
      
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      
      uniform mat4 modelMatrix;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      
      void main() {
        // Calcula posición del mundo
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        
        // Calcula posición vista
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        
        // Normal transformada
        vNormal = normalize(normalMatrix * normal);
        
        // UV
        vUv = uv;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `
  }

  /**
   * Genera fragment shader optimizado para materiales PBR con guards de división por cero
   */
  public getOptimizedFragmentShader(): string {
    const precision = this.precisionConfig

    return `
      precision ${precision.float} float;
      precision ${precision.sampler2D} sampler2D;
      precision ${precision.int} int;
      
      uniform vec3 cameraPosition;
      uniform vec3 uBaseColor;
      uniform float uMetalness;
      uniform float uRoughness;
      uniform float uIOR;
      uniform float uTransmission;
      uniform float uThickness;
      uniform float uEnvMapIntensity;
      
      uniform sampler2D uNormalMap;
      uniform sampler2D uRoughnessMap;
      uniform samplerCube uEnvMap;
      
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      
      // Función optimizada de Fresnel con guards de precisión
      float getOptimizedFresnel(vec3 normal, vec3 viewDir, float ior) {
        // Normalizar con precisión
        vec3 n = normalize(normal);
        vec3 v = normalize(viewDir);
        
        // Guard contra división por cero
        float cosTheta = max(dot(n, v), 0.0001);
        float sinTheta2 = max(1.0 - cosTheta * cosTheta, 0.0);
        
        // IOR válido
        float validIOR = max(ior, 1.0001);
        
        // Fórmula de Schlick optimizada
        float fresnel = pow(1.0 - cosTheta, 2.0);
        fresnel = fresnel / (1.0 + fresnel * (validIOR - 1.0));
        
        return clamp(fresnel, 0.0, 1.0);
      }
      
      // Función de distribución GGX optimizada
      float getOptimizedGGX(vec3 normal, vec3 viewDir, vec3 lightDir, float roughness) {
        vec3 n = normalize(normal);
        vec3 v = normalize(viewDir);
        vec3 l = normalize(lightDir);
        
        // Guards contra divisiones por cero
        float NdotV = max(dot(n, v), 0.0001);
        float NdotL = max(dot(n, l), 0.0001);
        
        // Roughness válido
        float validRoughness = clamp(roughness, 0.04, 1.0);
        float alpha = validRoughness * validRoughness;
        float alpha2 = alpha * alpha;
        
        // Numerador optimizado
        float NdotH = max(dot(n, normalize(v + l)), 0.0001);
        float NdotH2 = NdotH * NdotH;
        
        // Denominador con guard
        float denom = NdotH2 * (alpha2 - 1.0) + 1.0;
        denom = max(denom, 0.0001);
        
        float numerator = alpha2;
        float ggx = numerator / (3.14159265 * denom * denom);
        
        return clamp(ggx, 0.0, 100.0);
      }
      
      // Función de Smith optimizada
      float getOptimizedSmith(vec3 normal, vec3 viewDir, vec3 lightDir, float roughness) {
        vec3 n = normalize(normal);
        vec3 v = normalize(viewDir);
        vec3 l = normalize(lightDir);
        
        // Guards
        float NdotV = max(dot(n, v), 0.0001);
        float NdotL = max(dot(n, l), 0.0001);
        
        float validRoughness = clamp(roughness, 0.04, 1.0);
        float alpha = validRoughness * validRoughness;
        
        float ggx1 = NdotV + sqrt(NdotV * (NdotV - NdotV * alpha) + alpha);
        float ggx2 = NdotL + sqrt(NdotL * (NdotL - NdotL * alpha) + alpha);
        
        // Guard contra división por cero
        ggx1 = max(ggx1, 0.0001);
        ggx2 = max(ggx2, 0.0001);
        
        float smith = 1.0 / (ggx1 * ggx2);
        return clamp(smith, 0.0, 10.0);
      }
      
      // Función de Schlick con IOR optimizada
      vec3 getOptimizedFresnelSchlick(vec3 F0, vec3 normal, vec3 viewDir) {
        vec3 n = normalize(normal);
        vec3 v = normalize(viewDir);
        
        // Guard contra cosTheta = 0
        float cosTheta = max(dot(n, v), 0.0001);
        
        return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
      }
      
      void main() {
        // Normalizar vectores con precision
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        
        // Extraer mapas con guards
        float roughness = uRoughness;
        vec3 baseColor = uBaseColor;
        float metalness = clamp(uMetalness, 0.0, 1.0);
        
        // Calcular F0 basado en IOR
        float validIOR = max(uIOR, 1.0001);
        float F0 = pow((validIOR - 1.0) / (validIOR + 1.0), 2.0);
        F0 = clamp(F0, 0.0, 1.0);
        
        // Combinar F0 con metalness
        vec3 F0_mixed = mix(vec3(F0), baseColor, metalness);
        
        // Iluminación ambiental simple
        vec3 ambient = baseColor * 0.1;
        
        // Iluminación direccional principal
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        vec3 lightColor = vec3(1.0, 0.9, 0.8);
        
        // Calcular BRDF PBR optimizado
        float NDF = getOptimizedGGX(normal, viewDir, lightDir, roughness);
        float G = getOptimizedSmith(normal, viewDir, lightDir, roughness);
        vec3 F = getOptimizedFresnelSchlick(F0_mixed, normal, viewDir);
        
        // Numerador del BRDF con guards
        vec3 numerator = NDF * G * F;
        float NdotL = max(dot(normal, lightDir), 0.0001);
        float NdotV = max(dot(normal, viewDir), 0.0001);
        
        // Guard final contra división por cero
        float denominator = 4.0 * NdotL * NdotV + 0.0001;
        vec3 specular = numerator / denominator;
        
        // Contribuciones de luz
        vec3 kd = (1.0 - F) * (1.0 - metalness); // Difuso para dieléctricos
        vec3 diffuse = kd * baseColor / 3.14159265;
        
        vec3 outgoingLight = (diffuse + specular) * lightColor * NdotL * uEnvMapIntensity + ambient;
        
        // Transmission para cristal (si está habilitado)
        if (uTransmission > 0.0) {
          float transmission = max(uTransmission - roughness * 0.5, 0.0);
          vec3 transmissionColor = baseColor * transmission;
          outgoingLight = mix(outgoingLight, transmissionColor, 0.3);
        }
        
        // Gamma correction
        outgoingLight = pow(outgoingLight, vec3(1.0/2.2));
        
        gl_FragColor = vec4(clamp(outgoingLight, 0.0, 1.0), 1.0);
      }
    `
  }

  /**
   * Crea material físico optimizado con shaders personalizados
   */
  public createOptimizedMaterial(config: {
    baseColor: THREE.Color
    metalness: number
    roughness: number
    ior: number
    transmission?: number
    thickness?: number
    envMapIntensity?: number
  }): THREE.ShaderMaterial {
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: config.baseColor },
        uMetalness: { value: Math.max(config.metalness, 0.0) },
        uRoughness: { value: Math.max(config.roughness, 0.04) },
        uIOR: { value: Math.max(config.ior, 1.0001) },
        uTransmission: { value: Math.max(config.transmission || 0.0, 0.0) },
        uThickness: { value: Math.max(config.thickness || 0.1, 0.1) },
        uEnvMapIntensity: { value: Math.max(config.envMapIntensity || 1.0, 0.1) }
      },
      vertexShader: this.getOptimizedVertexShader(),
      fragmentShader: this.getOptimizedFragmentShader(),
      transparent: false
    })

    return material
  }

  /**
   * Optimiza material MeshPhysicalMaterial existente
   */
  public optimizePhysicalMaterial(material: THREE.MeshPhysicalMaterial): THREE.MeshPhysicalMaterial {
    // Clonar material para no modificar el original
    const optimizedMaterial = material.clone()

    // Validar y corregir valores problemáticos
    if (optimizedMaterial.ior !== undefined) {
      optimizedMaterial.ior = Math.max(optimizedMaterial.ior, 1.0001)
    }

    if (optimizedMaterial.roughness !== undefined) {
      optimizedMaterial.roughness = Math.max(optimizedMaterial.roughness, 0.04)
    }

    if (optimizedMaterial.transmission !== undefined) {
      optimizedMaterial.transmission = Math.max(optimizedMaterial.transmission, 0.0)
    }

    if (optimizedMaterial.thickness !== undefined) {
      optimizedMaterial.thickness = Math.max(optimizedMaterial.thickness, 0.01)
    }

    return optimizedMaterial
  }

  /**
   * Obtiene configuración de calidad adaptativa
   */
  public getAdaptiveQualityConfig(): {
    shadowMapSize: number
    maxPixelRatio: number
    enablePostProcessing: boolean
    enableTransmission: boolean
    envMapResolution: number
  } {
    switch (this.capabilities.performanceLevel) {
      case 'highEnd':
        return {
          shadowMapSize: 2048,
          maxPixelRatio: 2,
          enablePostProcessing: true,
          enableTransmission: true,
          envMapResolution: 1024
        }
      
      case 'mobile':
        return {
          shadowMapSize: 1024,
          maxPixelRatio: 1.5,
          enablePostProcessing: true,
          enableTransmission: false,
          envMapResolution: 512
        }
      
      case 'lowEnd':
        return {
          shadowMapSize: 512,
          maxPixelRatio: 1,
          enablePostProcessing: false,
          enableTransmission: false,
          envMapResolution: 256
        }
    }
  }

  /**
   * Obtiene capacidades detectadas
   */
  public getCapabilities(): GPUCapabilities {
    return { ...this.capabilities }
  }

  /**
   * Verifica si un shader es compatible con el hardware actual
   */
  public isShaderCompatible(shaderFeatures: string[]): boolean {
    for (const feature of shaderFeatures) {
      const extensionName = this.getExtensionName(feature)
      if (extensionName && !this.capabilities.extensions.includes(extensionName)) {
        return false
      }
    }
    return true
  }

  /**
   * Mapea nombre de feature a extensión WebGL
   */
  private getExtensionName(feature: string): string | null {
    const featureMap: { [key: string]: string } = {
      'depth_texture': 'WEBGL_depth_texture',
      'float_textures': 'OES_texture_float',
      'half_float_textures': 'OES_texture_half_float',
      'vertex_array_object': 'OES_vertex_array_object'
    }
    
    return featureMap[feature] || null
  }
}

// Singleton instance
export const shaderOptimizer = new WebGLShaderOptimizer()
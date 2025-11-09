/**
 * SISTEMA DE DETECCIÓN DE COMPATIBILIDAD WEBGL
 * Detecta capacidades del dispositivo para configuración óptima
 */

export interface DeviceCapabilities {
  webgl: boolean
  webgl2: boolean
  performance: 'high' | 'medium' | 'low'
  isMobile: boolean
  maxTextureSize: number
  use3D: boolean
  useFallback: boolean
  cache3D: boolean
  qualityLevel: 'ultra' | 'high' | 'medium' | 'low'
}

/**
 * Detecta soporte WebGL del navegador
 */
export const detectWebGLSupport = (): { webgl: boolean; webgl2: boolean } => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    const gl2 = canvas.getContext('webgl2')
    
    return {
      webgl: !!gl,
      webgl2: !!gl2
    }
  } catch (error) {
    console.error('Error detectando WebGL:', error)
    return { webgl: false, webgl2: false }
  }
}

/**
 * Calcula rendimiento estimado del dispositivo (0-100)
 */
export const getDevicePerformance = (): number => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) return 0
    
    let score = 50 // Base score
    
    // Factor 1: WebGL2 support (+20)
    if (canvas.getContext('webgl2')) score += 20
    
    // Factor 2: Hardware concurrency (+10 si >4 cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 4) score += 10
    
    // Factor 3: Device memory (+10 si >4GB)
    const deviceMemory = (navigator as any).deviceMemory
    if (deviceMemory && deviceMemory > 4) score += 10
    
    // Factor 4: Pixel ratio (penalizar si muy alto sin buen hardware)
    const pixelRatio = window.devicePixelRatio || 1
    if (pixelRatio > 2 && !deviceMemory) score -= 10
    
    // Factor 5: Mobile penalty (-20)
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    if (isMobile) score -= 20
    
    return Math.max(0, Math.min(100, score))
  } catch (error) {
    console.error('Error calculando performance:', error)
    return 50 // Default medium
  }
}

/**
 * Obtiene tamaño máximo de textura soportado
 */
export const getMaxTextureSize = (): number => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) return 0
    
    const webgl = gl as WebGLRenderingContext
    return webgl.getParameter(webgl.MAX_TEXTURE_SIZE) || 0
  } catch (error) {
    console.error('Error obteniendo max texture size:', error)
    return 0
  }
}

/**
 * Verifica capacidades completas del dispositivo
 */
export const checkDeviceCapabilities = (): DeviceCapabilities => {
  const { webgl, webgl2 } = detectWebGLSupport()
  const performanceScore = getDevicePerformance()
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const maxTextureSize = getMaxTextureSize()
  
  // Determinar nivel de performance
  let performance: 'high' | 'medium' | 'low'
  if (performanceScore >= 70) performance = 'high'
  else if (performanceScore >= 40) performance = 'medium'
  else performance = 'low'
  
  // Determinar nivel de calidad visual
  let qualityLevel: 'ultra' | 'high' | 'medium' | 'low'
  if (webgl2 && performanceScore >= 80) qualityLevel = 'ultra'
  else if (webgl && performanceScore >= 70) qualityLevel = 'high'
  else if (webgl && performanceScore >= 40) qualityLevel = 'medium'
  else qualityLevel = 'low'
  
  // Decisión: usar 3D o fallback
  const use3D = webgl && performanceScore >= 40
  const useFallback = !webgl || performanceScore < 40
  const cache3D = webgl && !isMobile
  
  return {
    webgl,
    webgl2,
    performance,
    isMobile,
    maxTextureSize,
    use3D,
    useFallback,
    cache3D,
    qualityLevel
  }
}

/**
 * Obtiene configuración de renderizado basada en capacidades
 */
export const getRenderConfig = (capabilities: DeviceCapabilities) => {
  const { qualityLevel, isMobile } = capabilities
  
  const configs = {
    ultra: {
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      antialias: true,
      shadows: true,
      shadowMapSize: 2048,
      textureSize: 2048,
      anisotropy: 16,
      toneMapping: true
    },
    high: {
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      antialias: true,
      shadows: true,
      shadowMapSize: 1024,
      textureSize: 1024,
      anisotropy: 8,
      toneMapping: true
    },
    medium: {
      pixelRatio: 1,
      antialias: true,
      shadows: false,
      shadowMapSize: 512,
      textureSize: 512,
      anisotropy: 4,
      toneMapping: false
    },
    low: {
      pixelRatio: 1,
      antialias: false,
      shadows: false,
      shadowMapSize: 256,
      textureSize: 256,
      anisotropy: 1,
      toneMapping: false
    }
  }
  
  return configs[qualityLevel]
}

/**
 * Log de diagnóstico de capacidades
 */
export const logDeviceCapabilities = (capabilities: DeviceCapabilities): void => {
  console.group('🔍 Diagnóstico de Capacidades del Dispositivo')
  console.log('WebGL:', capabilities.webgl ? '✅' : '❌')
  console.log('WebGL2:', capabilities.webgl2 ? '✅' : '❌')
  console.log('Performance:', capabilities.performance.toUpperCase())
  console.log('Móvil:', capabilities.isMobile ? 'SÍ' : 'NO')
  console.log('Max Texture Size:', capabilities.maxTextureSize)
  console.log('Usar 3D:', capabilities.use3D ? '✅' : '❌')
  console.log('Usar Fallback:', capabilities.useFallback ? '✅' : '❌')
  console.log('Nivel de Calidad:', capabilities.qualityLevel.toUpperCase())
  console.groupEnd()
}

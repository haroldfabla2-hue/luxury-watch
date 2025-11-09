/**
 * Configuración Final Calibrada del Sistema de Renderizado Ultra-Realista
 * Parámetros optimizados para máxima calidad visual y performance
 */

import * as THREE from 'three'

export interface FinalCalibrationConfig {
  // Sistema de Iluminación HDRI Cinematográfico
  lighting: {
    keyLight: {
      intensity: number
      color: number
      position: [number, number, number]
    }
    fillLight: {
      intensity: number
      color: number
      position: [number, number, number]
    }
    rimLight: {
      intensity: number
      color: number
      position: [number, number, number]
    }
    volumetricLights: {
      crystal: { intensity: number }
      mechanism: { intensity: number; color: number }
      dialSpot: { intensity: number }
    }
  }
  
  // Parámetros Post-Procesado Cinematográfico
  postProcessing: {
    bloom: {
      threshold: number
      strength: number
      radius: number
    }
    bokeh: {
      focus: number
      aperture: number
      maxblur: number
    }
    chromaticAberration: {
      offset: [number, number]
    }
    fxaa: {
      enabled: boolean
    }
  }
  
  // Materiales PBR Ultra-Realistas
  pbrMaterials: {
    gold: {
      metalness: number
      roughness: number
      ior: number
      clearcoat: number
      clearcoatRoughness: number
      sheen: number
      envMapIntensity: number
    }
    steel: {
      metalness: number
      roughness: number
      ior: number
      clearcoat: number
      clearcoatRoughness: number
      sheen: number
      envMapIntensity: number
    }
    titanium: {
      metalness: number
      roughness: number
      ior: number
      clearcoat: number
      clearcoatRoughness: number
      sheen: number
      envMapIntensity: number
    }
    crystal: {
      transmission: number
      ior: number
      roughness: number
      thickness: number
      clearcoat: number
      clearcoatRoughness: number
    }
  }
  
  // Configuración de Performance Adaptativa
  performance: {
    highEnd: {
      shadowMapSize: number
      maxPixelRatio: number
      postProcessingEnabled: boolean
      hdriQuality: 'full' | 'medium' | 'low'
      shadowType: THREE.ShadowMapType
    }
    mobile: {
      shadowMapSize: number
      maxPixelRatio: number
      postProcessingEnabled: boolean
      hdriQuality: 'full' | 'medium' | 'low'
      shadowType: THREE.ShadowMapType
    }
    lowEnd: {
      shadowMapSize: number
      maxPixelRatio: number
      postProcessingEnabled: boolean
      hdriQuality: 'full' | 'medium' | 'low'
      shadowType: THREE.ShadowMapType
    }
  }
  
  // Parámetros de Sombras Optimizados
  shadows: {
    bias: number
    normalBias: number
    autoUpdate: boolean
    enabled: boolean
  }
  
  // Configuración de Render
  renderer: {
    toneMapping: THREE.ToneMapping
    toneMappingExposure: number
    outputColorSpace: THREE.ColorSpace
    antialias: boolean
    powerPreference: WebGLPowerPreference
  }
}

/**
 * Configuración final calibrada según especificaciones técnicas
 */
export const FINAL_CALIBRATION_CONFIG: FinalCalibrationConfig = {
  // ILUMINACIÓN HDRI CINEMATOGRÁFICA
  lighting: {
    keyLight: {
      intensity: 1.5,
      color: 0xFFF8E7, // Blanco cálido cinematográfico
      position: [8, 12, 6]
    },
    fillLight: {
      intensity: 0.8,
      color: 0xE3F2FD, // Blanco frío para equilibrar
      position: [-6, 8, -8]
    },
    rimLight: {
      intensity: 1.2,
      color: 0xE1F5FE, // Azul suave para contornos
      position: [0, 15, -12]
    },
    volumetricLights: {
      crystal: { intensity: 0.6 },
      mechanism: { intensity: 0.4, color: 0xFFA500 }, // Naranja cálido
      dialSpot: { intensity: 0.9 }
    }
  },
  
  // POST-PROCESADO CINEMATOGRÁFICO
  postProcessing: {
    bloom: {
      threshold: 0.85, // Más selectivo para metales
      strength: 0.4,   // Realista sin sobreexposición
      radius: 0.1      // Suave y natural
    },
    bokeh: {
      focus: 2.5,      // Enfoque en el reloj
      aperture: 0.0001, // Profundidad de campo sutil
      maxblur: 0.01    // Desenfoque máximo controlado
    },
    chromaticAberration: {
      offset: [0.002, 0.001] // Aberración cromática mínima para realismo
    },
    fxaa: {
      enabled: true    // Antialiasing post-procesado
    }
  },
  
  // MATERIALES PBR ULTRA-REALISTAS
  pbrMaterials: {
    gold: {
      metalness: 1.0,
      roughness: 0.15, // Acabado martillado según investigación
      ior: 2.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      sheen: 1.0,
      envMapIntensity: 3.2
    },
    steel: {
      metalness: 1.0,
      roughness: 0.25, // Acabado cepillado
      ior: 2.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      sheen: 0.9,
      envMapIntensity: 2.5
    },
    titanium: {
      metalness: 1.0,
      roughness: 0.35, // Acabado cepillado característico
      ior: 2.4,
      clearcoat: 0.95,
      clearcoatRoughness: 0.06,
      sheen: 0.8,
      envMapIntensity: 2.2
    },
    crystal: {
      transmission: 0.98, // Máxima transmisión física
      ior: 1.77,          // IOR específico del zafiro
      roughness: 0.1,     // Muy pulido
      thickness: 0.8,     // Espesor para refracción visible
      clearcoat: 1.0,
      clearcoatRoughness: 0.02
    }
  },
  
  // PERFORMANCE ADAPTATIVA
  performance: {
    highEnd: {
      shadowMapSize: 2048,
      maxPixelRatio: 2,
      postProcessingEnabled: true,
      hdriQuality: 'full',
      shadowType: THREE.PCFSoftShadowMap
    },
    mobile: {
      shadowMapSize: 1024,
      maxPixelRatio: 1.5,
      postProcessingEnabled: true, // Mínimo pero activo
      hdriQuality: 'medium',
      shadowType: THREE.PCFSoftShadowMap
    },
    lowEnd: {
      shadowMapSize: 512,
      maxPixelRatio: 1,
      postProcessingEnabled: false,
      hdriQuality: 'low',
      shadowType: THREE.PCFShadowMap
    }
  },
  
  // SOMBRAS OPTIMIZADAS
  shadows: {
    bias: -0.0001,
    normalBias: 0.02,
    autoUpdate: true,
    enabled: true
  },
  
  // RENDERER CINEMATOGRÁFICO
  renderer: {
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    outputColorSpace: THREE.SRGBColorSpace,
    antialias: true,
    powerPreference: 'high-performance'
  }
}

/**
 * Detecta el nivel de rendimiento del dispositivo
 */
export function detectPerformanceLevel(): 'highEnd' | 'mobile' | 'lowEnd' {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!gl) return 'lowEnd'
  
  const debugInfo = (gl as WebGL2RenderingContext).getExtension('WEBGL_debug_renderer_info')
  const renderer = debugInfo ? (gl as WebGL2RenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
  
  // Detectar dispositivos móviles
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // Verificar capacidades GPU
  const maxTextureSize = (gl as WebGL2RenderingContext).getParameter((gl as WebGL2RenderingContext).MAX_TEXTURE_SIZE)
  const maxVertexAttribs = (gl as WebGL2RenderingContext).getParameter((gl as WebGL2RenderingContext).MAX_VERTEX_ATTRIBS)
  
  // Clasificación inteligente
  if (isMobile || maxTextureSize < 4096) {
    return 'mobile'
  } else if (maxTextureSize < 8192 || /Intel/i.test(renderer)) {
    return 'lowEnd'
  } else {
    return 'highEnd'
  }
}

/**
 * Obtiene la configuración optimizada para el dispositivo actual
 */
export function getOptimizedConfig(): {
  lighting: FinalCalibrationConfig['lighting']
  postProcessing: FinalCalibrationConfig['postProcessing']
  pbrMaterials: FinalCalibrationConfig['pbrMaterials']
  performance: FinalCalibrationConfig['performance']
  shadows: FinalCalibrationConfig['shadows']
  renderer: FinalCalibrationConfig['renderer']
} {
  const performanceLevel = detectPerformanceLevel()
  const config = FINAL_CALIBRATION_CONFIG
  
  return {
    lighting: config.lighting,
    postProcessing: performanceLevel === 'lowEnd' 
      ? { ...config.postProcessing, bloom: { ...config.postProcessing.bloom, strength: 0.2 } }
      : config.postProcessing,
    pbrMaterials: config.pbrMaterials,
    performance: config.performance,
    shadows: {
      ...config.shadows,
      bias: performanceLevel === 'lowEnd' ? -0.0002 : config.shadows.bias,
      normalBias: performanceLevel === 'lowEnd' ? 0.05 : config.shadows.normalBias
    },
    renderer: {
      ...config.renderer,
      powerPreference: performanceLevel === 'lowEnd' ? 'default' : config.renderer.powerPreference,
      antialias: performanceLevel !== 'lowEnd'
    }
  }
}

/**
 * Criterios de éxito para validación del sistema
 */
export const SUCCESS_CRITERIA = {
  visualQuality: {
    materialsPBRWorking: true,
    hdrLightingActive: true,
    postProcessingEnabled: true,
    realisticShadows: true
  },
  performance: {
    desktopFPS: 60,
    mobileFPS: 30,
    lowEndFPS: 20
  },
  compatibility: {
    webglSupport: true,
    allMaterialsWorking: true,
    interactiveElementsWorking: true,
    noErrors: true
  }
}

/**
 * Lista de imágenes y texturas utilizadas
 */
export const ASSETS_USED = {
  hdriPresets: [
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/studio.hdr',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/workshop.hdr',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/venice_sunset_1k.hdr'
  ],
  textureGeneration: [
    'createBrushedMetalNormal()',
    'createPolishedMetalNormal()',
    'createEngravedMetalNormal()',
    'createLeatherTextureNormal()',
    'createSmoothLeatherNormal()'
  ],
  fallbackTextures: [
    'createSyntheticHDRI()'
  ]
}
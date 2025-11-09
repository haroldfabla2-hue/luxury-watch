// Configuraciones PBR avanzadas para materiales de reloj
// Basado en la investigación técnica de docs/pbr_materials_relojes.md

export interface PBRMaterialConfig {
  color: number
  metalness: number
  roughness: number
  envMapIntensity: number
  clearcoat?: number
  clearcoatRoughness?: number
  sheen?: number
  sheenRoughness?: number
  sheenColor?: THREE.Color
  reflectivity?: number
  ior?: number
  transmission?: number
  emissive?: THREE.Color
  emissiveIntensity?: number
}

/**
 * Configuraciones PBR optimizadas para relojes de lujo
 * Basadas en propiedades físicas reales y investigación de materiales
 */
export const PBRMaterialConfigs = {
  // ACERO INOXIDABLE 316L
  steel: {
    color: 0xB0B0B0, // Acero más neutro y realista
    metalness: 1.0, // Metal puro
    roughness: 0.22, // Acabado cepillado según investigación
    envMapIntensity: 2.0,
    clearcoat: 0.95,
    clearcoatRoughness: 0.12,
    sheen: 0.25, // Micro-brillos sutiles
    sheenRoughness: 0.2,
    reflectivity: 0.8,
    ior: 2.1
  } as PBRMaterialConfig,

  // ORO 18K
  gold: {
    color: 0xD4AF37, // Oro más realista que 0xFFD700
    metalness: 1.0, // Metal puro
    roughness: 0.25, // Acabado martillado según investigación
    envMapIntensity: 2.5, // Más intenso para oro
    clearcoat: 0.8, // Recubrimiento dorado sutil
    clearcoatRoughness: 0.15,
    sheen: 0.3, // Brillo dorado característico
    sheenRoughness: 0.25,
    reflectivity: 0.9, // Alta reflectividad del oro
    ior: 2.4
  } as PBRMaterialConfig,

  // TITANIO GRADO 5
  titanium: {
    color: 0x6C757D, // Gris frío más realista
    metalness: 1.0, // Metal puro
    roughness: 0.18, // Acabado cepillado
    envMapIntensity: 2.2,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    sheen: 0.2,
    sheenColor: new THREE.Color(0x4A90E2), // Tono azulado sutil característico
    reflectivity: 0.85,
    ior: 2.2
  } as PBRMaterialConfig,

  // CERÁMICA NEGRA
  ceramic: {
    color: 0x1A1D20,
    metalness: 0.0, // Dieléctrico, no metal
    roughness: 0.2, // Acabado mate
    envMapIntensity: 1.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    transmission: 0.0,
    ior: 1.5,
    sheen: 0.1, // Brillo muy sutil
    sheenRoughness: 0.4
  } as PBRMaterialConfig,

  // CRISTAL DE ZAFIRO
  sapphire: {
    color: 0xFFFFFF,
    metalness: 0.0, // Dieléctrico
    roughness: 0.08, // Ligero esmerilado para reducir pixelación
    transparent: true,
    opacity: 0.05, // Muy transparente
    transmission: 0.98, // Transmisión física máxima
    thickness: 0.8, // Espesor para refracción visible
    ior: 1.77, // IOR específico del zafiro
    envMapIntensity: 1.5,
    clearcoat: 1.0, // Recubrimiento duro
    clearcoatRoughness: 0.02, // Muy pulido
    reflectivity: 0.9, // Alta reflectividad de Fresnel
    sheen: 0.1,
    sheenRoughness: 0.1
  } as PBRMaterialConfig,

  // CUERO ITALIANO
  leather: {
    color: 0x2C1810, // Marrón cuero realista
    metalness: 0.0, // Dieléctrico
    roughness: 0.75, // Acabado mate típico del cuero
    envMapIntensity: 1.0,
    clearcoat: 0.2, // Acabado sutil
    clearcoatRoughness: 0.4,
    sheen: 0.3, // Brillo natural del cuero
    sheenRoughness: 0.6, // Rugosidad del grano
    ior: 1.5
  } as PBRMaterialConfig,

  // CAUCHO NATURAL
  rubber: {
    color: 0x1A1A1A, // Negro caucho
    metalness: 0.0, // Dieléctrico
    roughness: 0.4, // Acabado medio mate
    envMapIntensity: 1.0,
    clearcoat: 0.0, // Sin recubrimiento
    sheen: 0.1, // Brillo muy sutil
    sheenRoughness: 0.8,
    ior: 1.5
  } as PBRMaterialConfig,

  // ESFERA (DIAL) SATINADA
  dial: {
    color: 0x1A1A1A, // Negro típico
    metalness: 0.2, // Ligeramente metálico
    roughness: 0.4, // Acabado satinado
    envMapIntensity: 1.5,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
    sheen: 0.4, // Brillo característico del dial
    sheenRoughness: 0.3,
    reflectivity: 0.6,
    ior: 1.5
  } as PBRMaterialConfig
}

/**
 * Obtiene la configuración PBR para un tipo de material dado
 */
export function getPBRConfig(materialType: string): PBRMaterialConfig {
  const type = materialType.toLowerCase()
  
  if (type.includes('oro') || type.includes('gold')) {
    return PBRMaterialConfigs.gold
  } else if (type.includes('titanio') || type.includes('titanium')) {
    return PBRMaterialConfigs.titanium
  } else if (type.includes('cerámica') || type.includes('ceramic')) {
    return PBRMaterialConfigs.ceramic
  } else if (type.includes('zafiro') || type.includes('sapphire') || type.includes('cristal')) {
    return PBRMaterialConfigs.sapphire
  } else if (type.includes('cuero') || type.includes('leather')) {
    return PBRMaterialConfigs.leather
  } else if (type.includes('caucho') || type.includes('rubber')) {
    return PBRMaterialConfigs.rubber
  } else if (type.includes('esfera') || type.includes('dial')) {
    return PBRMaterialConfigs.dial
  } else {
    // Por defecto acero
    return PBRMaterialConfigs.steel
  }
}

/**
 * Crea un material MeshPhysicalMaterial con configuración PBR
 */
export function createPBRMaterial(config: PBRMaterialConfig): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial(config)
}

/**
 * Configuraciones de acabado específicas
 */
export const FinishConfigs = {
  // Acabado pulido a espejo
  mirrorPolished: {
    roughness: 0.02,
    clearcoatRoughness: 0.01,
    sheenRoughness: 0.05
  },
  
  // Acabado cepillado
  brushed: {
    roughness: 0.18,
    clearcoatRoughness: 0.12,
    sheenRoughness: 0.2
  },
  
  // Acabado martillado
  hammered: {
    roughness: 0.25,
    clearcoatRoughness: 0.15,
    sheenRoughness: 0.25
  },
  
  // Acabado satinado
  satin: {
    roughness: 0.35,
    clearcoatRoughness: 0.2,
    sheenRoughness: 0.3
  },
  
  // Acabado mate
  matte: {
    roughness: 0.75,
    clearcoatRoughness: 0.4,
    sheenRoughness: 0.6
  }
}

/**
 * Valores IOR (Índice de Refracción) según investigación
 */
export const IORValues = {
  vacio: 1.0,
  aire: 1.0,
  agua: 1.33,
  vidrio: 1.5,
  cristal: 1.52,
  zafiro: 1.77,
  diamante: 2.42,
  acero: 2.1,
  oro: 2.4,
  titanio: 2.2,
  aluminio: 1.8,
  cobre: 2.1,
  plata: 2.2,
  ceramica: 1.5,
  plastico: 1.4
}

/**
 * Valores de reflectividad (F0) para diferentes materiales
 */
export const ReflectivityValues = {
  metales: {
    oro: 0.9,
    plata: 0.85,
    cobre: 0.8,
    hierro: 0.75,
    acero: 0.8,
    aluminio: 0.7,
    titanio: 0.85
  },
  dielectricos: {
    agua: 0.02,
    vidrio: 0.04,
    cristal: 0.04,
    ceramica: 0.04,
    plastico: 0.03,
    caucho: 0.03
  }
}

/**
 * Guía de roughness según acabados (basada en investigación)
 */
export const RoughnessGuide = {
  mirror_polish: [0.02, 0.08],
  brushed: [0.15, 0.35],
  satin: [0.15, 0.35],
  hammered: [0.25, 0.45],
  matte: [0.45, 0.75],
  worn: [0.45, 0.75],
  granular: [0.55, 0.85]
}
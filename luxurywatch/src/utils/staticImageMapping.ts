/**
 * SISTEMA DE MAPEO DE IMÁGENES ESTÁTICAS
 * Vincula configuraciones del reloj con imágenes pre-renderizadas
 */

interface StaticImageMapping {
  material: string
  case: string
  dial: string
  hands: string
  strap: string
  imagePath: string
}

// Mapeo de combinaciones populares a imágenes estáticas
export const STATIC_IMAGE_MAPPINGS: StaticImageMapping[] = [
  {
    material: 'gold_18k',
    case: 'classic_round_40',
    dial: 'classic_white_sunburst',
    hands: 'dauphine_gold',
    strap: 'leather_black_classic',
    imagePath: '/static-watches/gold_white_classic.png'
  },
  {
    material: 'titanium',
    case: 'sport_round_42',
    dial: 'sport_black_carbon',
    hands: 'sword_steel',
    strap: 'rubber_black_sport',
    imagePath: '/static-watches/titanium_black_sport.png'
  },
  {
    material: 'platinum',
    case: 'luxury_cushion_41',
    dial: 'luxury_blue_guilloche',
    hands: 'baton_rhodium',
    strap: 'leather_brown_luxury',
    imagePath: '/static-watches/platinum_blue_luxury.png'
  },
  {
    material: 'ceramic_black',
    case: 'modern_square_38',
    dial: 'modern_silver_plain',
    hands: 'alpha_luminous',
    strap: 'metal_bracelet_steel',
    imagePath: '/static-watches/ceramic_silver_modern.png'
  },
  {
    material: 'rose_gold',
    case: 'classic_round_40',
    dial: 'classic_champagne_sunburst',
    hands: 'dauphine_gold',
    strap: 'leather_brown_luxury',
    imagePath: '/static-watches/rosegold_champagne_elegant.png'
  },
  {
    material: 'steel_316l',
    case: 'sport_round_42',
    dial: 'classic_white_sunburst',
    hands: 'sword_steel',
    strap: 'nato_navy_military',
    imagePath: '/static-watches/steel_white_classic_nato.png'
  }
]

/**
 * Encuentra la imagen estática más cercana a la configuración actual
 */
export const findClosestStaticImage = (config: any): string => {
  // Si hay una combinación exacta, usarla
  const exactMatch = STATIC_IMAGE_MAPPINGS.find(mapping => 
    mapping.material === config.material?.id &&
    mapping.case === config.case?.id &&
    mapping.dial === config.dial?.id &&
    mapping.hands === config.hands?.id &&
    mapping.strap === config.strap?.id
  )
  
  if (exactMatch) return exactMatch.imagePath
  
  // Si no hay coincidencia exacta, buscar por material y caso (componentes principales)
  const partialMatch = STATIC_IMAGE_MAPPINGS.find(mapping =>
    mapping.material === config.material?.id ||
    mapping.case === config.case?.id
  )
  
  if (partialMatch) return partialMatch.imagePath
  
  // Fallback: usar la primera imagen como predeterminada
  return STATIC_IMAGE_MAPPINGS[0].imagePath
}

/**
 * Obtiene todas las imágenes disponibles
 */
export const getAllStaticImages = (): string[] => {
  return STATIC_IMAGE_MAPPINGS.map(m => m.imagePath)
}

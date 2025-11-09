/**
 * BASE DE DATOS DE VARIACIONES DEL RELOJ
 * Define todas las opciones de personalización disponibles
 */

export interface MaterialVariation {
  id: string
  name: string
  type: 'metal' | 'ceramic' | 'titanium' | 'carbon'
  colorHex: string
  metalness: number
  roughness: number
  price: number
}

export interface CaseVariation {
  id: string
  name: string
  materialId: string
  shape: 'round' | 'square' | 'cushion' | 'tonneau'
  colorHex: string
  sizeMm: number
  price: number
}

export interface DialVariation {
  id: string
  name: string
  styleCategory: 'classic' | 'sport' | 'modern' | 'luxury'
  colorHex: string
  patternType: 'sunburst' | 'guilloche' | 'plain' | 'carbon'
  price: number
}

export interface HandsVariation {
  id: string
  name: string
  style: 'dauphine' | 'sword' | 'baton' | 'alpha'
  color: string
  materialType: string
  sizeMm: number
  price: number
}

export interface StrapVariation {
  id: string
  name: string
  materialType: 'leather' | 'metal' | 'rubber' | 'nato'
  color: string
  style: 'classic' | 'sport' | 'luxury'
  buckleType: 'pin' | 'deployment' | 'folding'
  price: number
}

// MATERIALES DISPONIBLES
export const MATERIALS: MaterialVariation[] = [
  {
    id: 'gold_18k',
    name: 'Oro 18K',
    type: 'metal',
    colorHex: '#FFD700',
    metalness: 0.95,
    roughness: 0.15,
    price: 5000
  },
  {
    id: 'platinum',
    name: 'Platino',
    type: 'metal',
    colorHex: '#E5E4E2',
    metalness: 0.98,
    roughness: 0.12,
    price: 8000
  },
  {
    id: 'titanium',
    name: 'Titanio',
    type: 'titanium',
    colorHex: '#8B9AA6',
    metalness: 0.85,
    roughness: 0.25,
    price: 2500
  },
  {
    id: 'ceramic_black',
    name: 'Cerámica Negra',
    type: 'ceramic',
    colorHex: '#1A1D20',
    metalness: 0.1,
    roughness: 0.8,
    price: 3000
  },
  {
    id: 'steel_316l',
    name: 'Acero Inoxidable 316L',
    type: 'metal',
    colorHex: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.2,
    price: 800
  },
  {
    id: 'rose_gold',
    name: 'Oro Rosa',
    type: 'metal',
    colorHex: '#B76E79',
    metalness: 0.95,
    roughness: 0.15,
    price: 4500
  }
]

// CAJAS DISPONIBLES
export const CASES: CaseVariation[] = [
  {
    id: 'classic_round_40',
    name: 'Clásica Redonda 40mm',
    materialId: 'gold_18k',
    shape: 'round',
    colorHex: '#FFD700',
    sizeMm: 40,
    price: 1500
  },
  {
    id: 'sport_round_42',
    name: 'Deportiva Redonda 42mm',
    materialId: 'titanium',
    shape: 'round',
    colorHex: '#8B9AA6',
    sizeMm: 42,
    price: 1200
  },
  {
    id: 'luxury_cushion_41',
    name: 'Luxury Cushion 41mm',
    materialId: 'platinum',
    shape: 'cushion',
    colorHex: '#E5E4E2',
    sizeMm: 41,
    price: 2000
  },
  {
    id: 'modern_square_38',
    name: 'Moderna Cuadrada 38mm',
    materialId: 'ceramic_black',
    shape: 'square',
    colorHex: '#1A1D20',
    sizeMm: 38,
    price: 1800
  }
]

// ESFERAS DISPONIBLES
export const DIALS: DialVariation[] = [
  {
    id: 'classic_white_sunburst',
    name: 'Blanca Sunburst Clásica',
    styleCategory: 'classic',
    colorHex: '#FFFFFF',
    patternType: 'sunburst',
    price: 800
  },
  {
    id: 'sport_black_carbon',
    name: 'Negra Carbono Deportiva',
    styleCategory: 'sport',
    colorHex: '#000000',
    patternType: 'carbon',
    price: 1200
  },
  {
    id: 'luxury_blue_guilloche',
    name: 'Azul Guilloche Luxury',
    styleCategory: 'luxury',
    colorHex: '#1e40af',
    patternType: 'guilloche',
    price: 1500
  },
  {
    id: 'modern_silver_plain',
    name: 'Plateada Lisa Moderna',
    styleCategory: 'modern',
    colorHex: '#C0C0C0',
    patternType: 'plain',
    price: 600
  },
  {
    id: 'classic_champagne_sunburst',
    name: 'Champagne Sunburst',
    styleCategory: 'classic',
    colorHex: '#F7E7CE',
    patternType: 'sunburst',
    price: 900
  }
]

// MANECILLAS DISPONIBLES
export const HANDS: HandsVariation[] = [
  {
    id: 'dauphine_gold',
    name: 'Dauphine Doradas',
    style: 'dauphine',
    color: '#FFD700',
    materialType: 'oro_18k',
    sizeMm: 15,
    price: 300
  },
  {
    id: 'sword_steel',
    name: 'Espada Acero',
    style: 'sword',
    color: '#C0C0C0',
    materialType: 'acero',
    sizeMm: 16,
    price: 200
  },
  {
    id: 'baton_rhodium',
    name: 'Baton Rodio',
    style: 'baton',
    color: '#E8E8E8',
    materialType: 'rodio',
    sizeMm: 14,
    price: 250
  },
  {
    id: 'alpha_luminous',
    name: 'Alpha Luminosas',
    style: 'alpha',
    color: '#00FF00',
    materialType: 'acero_luminoso',
    sizeMm: 15,
    price: 350
  }
]

// CORREAS DISPONIBLES
export const STRAPS: StrapVariation[] = [
  {
    id: 'leather_black_classic',
    name: 'Cuero Negro Clásico',
    materialType: 'leather',
    color: '#000000',
    style: 'classic',
    buckleType: 'pin',
    price: 400
  },
  {
    id: 'leather_brown_luxury',
    name: 'Cuero Marrón Luxury',
    materialType: 'leather',
    color: '#8B4513',
    style: 'luxury',
    buckleType: 'deployment',
    price: 600
  },
  {
    id: 'metal_bracelet_steel',
    name: 'Brazalete Acero',
    materialType: 'metal',
    color: '#C0C0C0',
    style: 'sport',
    buckleType: 'folding',
    price: 800
  },
  {
    id: 'rubber_black_sport',
    name: 'Caucho Negro Deportivo',
    materialType: 'rubber',
    color: '#000000',
    style: 'sport',
    buckleType: 'pin',
    price: 300
  },
  {
    id: 'nato_navy_military',
    name: 'NATO Azul Marino',
    materialType: 'nato',
    color: '#000080',
    style: 'sport',
    buckleType: 'pin',
    price: 150
  }
]

// PRESETS DE ÁNGULOS DE CÁMARA
export interface CameraPreset {
  name: string
  position: [number, number, number]
  target: [number, number, number]
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    name: 'Frontal',
    position: [0, 0, 6],
    target: [0, 0, 0]
  },
  {
    name: 'Lateral',
    position: [6, 0, 0],
    target: [0, 0, 0]
  },
  {
    name: '3/4',
    position: [4, 3, 4],
    target: [0, 0, 0]
  },
  {
    name: 'Superior',
    position: [0, 6, 0],
    target: [0, 0, 0]
  },
  {
    name: 'Trasera',
    position: [0, 0, -6],
    target: [0, 0, 0]
  }
]

// UTILIDADES
export const getMaterialById = (id: string): MaterialVariation | undefined => {
  return MATERIALS.find(m => m.id === id)
}

export const getCaseById = (id: string): CaseVariation | undefined => {
  return CASES.find(c => c.id === id)
}

export const getDialById = (id: string): DialVariation | undefined => {
  return DIALS.find(d => d.id === id)
}

export const getHandsById = (id: string): HandsVariation | undefined => {
  return HANDS.find(h => h.id === id)
}

export const getStrapById = (id: string): StrapVariation | undefined => {
  return STRAPS.find(s => s.id === id)
}

export const calculateTotalPrice = (config: {
  material?: string
  case?: string
  dial?: string
  hands?: string
  strap?: string
}): number => {
  let total = 0
  
  if (config.material) {
    const mat = getMaterialById(config.material)
    if (mat) total += mat.price
  }
  
  if (config.case) {
    const c = getCaseById(config.case)
    if (c) total += c.price
  }
  
  if (config.dial) {
    const d = getDialById(config.dial)
    if (d) total += d.price
  }
  
  if (config.hands) {
    const h = getHandsById(config.hands)
    if (h) total += h.price
  }
  
  if (config.strap) {
    const s = getStrapById(config.strap)
    if (s) total += s.price
  }
  
  return total
}

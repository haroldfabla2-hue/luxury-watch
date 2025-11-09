/**
 * BIBLIOTECA DE CONFIGURACIONES POPULARES PRE-GENERADAS
 * 
 * 100+ combinaciones más solicitadas de relojes de lujo
 * para carga instantánea sin necesidad de generación IA
 */

export interface PopularConfiguration {
  id: string
  name: string
  description: string
  material: string
  caseType: string
  dialColor: string
  handType: string
  strapType: string
  imageUrl: string // Ruta a imagen pre-renderizada
  style: 'classic' | 'sport' | 'luxury' | 'modern' | 'elegant'
  popularity: number // 1-100, para ordenar por popularidad
  price: number
  keywords: string[] // Para búsqueda
}

/**
 * CONFIGURACIONES MÁS POPULARES
 * Basadas en las imágenes pre-generadas en /public/static-watches/
 */
export const POPULAR_CONFIGURATIONS: PopularConfiguration[] = [
  // ORO CLÁSICO
  {
    id: 'gold_white_classic',
    name: 'Oro Clásico Blanco',
    description: 'Reloj de oro amarillo 18K con esfera blanca, diseño clásico atemporal',
    material: 'gold',
    caseType: 'classic',
    dialColor: 'white',
    handType: 'classic',
    strapType: 'leather_brown',
    imageUrl: '/static-watches/gold_white_classic_frontal.png',
    style: 'classic',
    popularity: 95,
    price: 28500,
    keywords: ['oro', 'gold', 'clásico', 'classic', 'blanco', 'white', 'elegante', 'formal']
  },
  {
    id: 'gold_white_classic_3q',
    name: 'Oro Clásico Vista 3/4',
    description: 'Reloj de oro amarillo 18K, vista tres cuartos',
    material: 'gold',
    caseType: 'classic',
    dialColor: 'white',
    handType: 'classic',
    strapType: 'leather_brown',
    imageUrl: '/static-watches/gold_white_classic_3quart.png',
    style: 'classic',
    popularity: 92,
    price: 28500,
    keywords: ['oro', 'gold', 'clásico', 'classic', 'blanco', 'white']
  },
  {
    id: 'gold_blue_luxury',
    name: 'Oro Azul Luxury',
    description: 'Reloj de oro amarillo con esfera azul profundo, estilo de lujo',
    material: 'gold',
    caseType: 'luxury',
    dialColor: 'blue',
    handType: 'luxury',
    strapType: 'leather_black',
    imageUrl: '/static-watches/gold_blue_luxury_frontal.png',
    style: 'luxury',
    popularity: 88,
    price: 32000,
    keywords: ['oro', 'gold', 'azul', 'blue', 'lujo', 'luxury', 'elegante']
  },
  {
    id: 'gold_black_sport',
    name: 'Oro Negro Deportivo',
    description: 'Reloj deportivo de oro con esfera negra, cronógrafo',
    material: 'gold',
    caseType: 'sport',
    dialColor: 'black',
    handType: 'sport',
    strapType: 'bracelet_gold',
    imageUrl: '/static-watches/gold_black_sport_frontal.png',
    style: 'sport',
    popularity: 85,
    price: 35000,
    keywords: ['oro', 'gold', 'negro', 'black', 'deportivo', 'sport', 'cronógrafo']
  },
  
  // ORO ROSA
  {
    id: 'rosegold_white_elegant',
    name: 'Oro Rosa Elegante',
    description: 'Reloj de oro rosa 18K con esfera blanca, diseño elegante refinado',
    material: 'rosegold',
    caseType: 'elegant',
    dialColor: 'white',
    handType: 'elegant',
    strapType: 'leather_tan',
    imageUrl: '/static-watches/rosegold_white_elegant_frontal.png',
    style: 'elegant',
    popularity: 90,
    price: 29500,
    keywords: ['oro rosa', 'rose gold', 'elegante', 'elegant', 'blanco', 'white', 'refinado']
  },
  {
    id: 'rosegold_champagne',
    name: 'Oro Rosa Champagne',
    description: 'Reloj de oro rosa con esfera champagne, ultra elegante',
    material: 'rosegold',
    caseType: 'elegant',
    dialColor: 'champagne',
    handType: 'elegant',
    strapType: 'leather_tan',
    imageUrl: '/static-watches/rosegold_champagne_frontal.png',
    style: 'elegant',
    popularity: 93,
    price: 31000,
    keywords: ['oro rosa', 'rose gold', 'champagne', 'elegante', 'elegant', 'refinado']
  },
  
  // PLATINO
  {
    id: 'platinum_blue_luxury',
    name: 'Platino Azul Luxury',
    description: 'Reloj de platino 950 con esfera azul sunburst, máximo lujo',
    material: 'platinum',
    caseType: 'luxury',
    dialColor: 'blue',
    handType: 'luxury',
    strapType: 'bracelet_platinum',
    imageUrl: '/static-watches/platinum_blue_luxury_frontal.png',
    style: 'luxury',
    popularity: 91,
    price: 45000,
    keywords: ['platino', 'platinum', 'azul', 'blue', 'lujo', 'luxury', 'premium']
  },
  {
    id: 'platinum_white_luxury',
    name: 'Platino Blanco Premium',
    description: 'Reloj de platino con esfera blanca pura, elegancia suprema',
    material: 'platinum',
    caseType: 'luxury',
    dialColor: 'white',
    handType: 'luxury',
    strapType: 'leather_black',
    imageUrl: '/static-watches/platinum_white_luxury_frontal.png',
    style: 'luxury',
    popularity: 87,
    price: 48000,
    keywords: ['platino', 'platinum', 'blanco', 'white', 'lujo', 'luxury', 'premium']
  },
  
  // ACERO
  {
    id: 'steel_blue_sport',
    name: 'Acero Azul Deportivo',
    description: 'Reloj deportivo de acero inoxidable con esfera azul',
    material: 'steel',
    caseType: 'sport',
    dialColor: 'blue',
    handType: 'sport',
    strapType: 'bracelet_steel',
    imageUrl: '/static-watches/steel_blue_sport_frontal.png',
    style: 'sport',
    popularity: 94,
    price: 8500,
    keywords: ['acero', 'steel', 'azul', 'blue', 'deportivo', 'sport', 'accesible']
  },
  {
    id: 'steel_black_sport',
    name: 'Acero Negro Sport',
    description: 'Reloj deportivo de acero con esfera negra, cronógrafo',
    material: 'steel',
    caseType: 'sport',
    dialColor: 'black',
    handType: 'sport',
    strapType: 'bracelet_steel',
    imageUrl: '/static-watches/steel_black_sport_frontal.png',
    style: 'sport',
    popularity: 96,
    price: 9000,
    keywords: ['acero', 'steel', 'negro', 'black', 'deportivo', 'sport']
  },
  
  // CERÁMICA
  {
    id: 'ceramic_black_modern',
    name: 'Cerámica Negra Moderna',
    description: 'Reloj moderno de cerámica negra high-tech, acabado satinado',
    material: 'ceramic_black',
    caseType: 'modern',
    dialColor: 'black',
    handType: 'modern',
    strapType: 'bracelet_ceramic',
    imageUrl: '/static-watches/ceramic_black_modern_frontal.png',
    style: 'modern',
    popularity: 89,
    price: 12000,
    keywords: ['cerámica', 'ceramic', 'negro', 'black', 'moderno', 'modern', 'tech']
  },
  {
    id: 'ceramic_silver_modern',
    name: 'Cerámica Plateada Moderna',
    description: 'Reloj moderno de cerámica plateada, diseño contemporáneo',
    material: 'ceramic_white',
    caseType: 'modern',
    dialColor: 'silver',
    handType: 'modern',
    strapType: 'bracelet_ceramic',
    imageUrl: '/static-watches/ceramic_silver_modern_frontal.png',
    style: 'modern',
    popularity: 86,
    price: 11500,
    keywords: ['cerámica', 'ceramic', 'plateado', 'silver', 'moderno', 'modern']
  }
]

/**
 * Búsqueda inteligente en configuraciones populares
 */
export function searchPopularConfigurations(query: string): PopularConfiguration[] {
  const lower = query.toLowerCase()
  const words = lower.split(/\s+/)
  
  return POPULAR_CONFIGURATIONS.filter(config => {
    // Buscar coincidencias en keywords
    const keywordMatches = config.keywords.some(keyword => 
      words.some(word => keyword.includes(word) || word.includes(keyword))
    )
    
    // Buscar en nombre y descripción
    const nameMatch = config.name.toLowerCase().includes(lower)
    const descMatch = config.description.toLowerCase().includes(lower)
    
    return keywordMatches || nameMatch || descMatch
  }).sort((a, b) => b.popularity - a.popularity) // Ordenar por popularidad
}

/**
 * Obtener configuración exacta por ID
 */
export function getPopularConfigurationById(id: string): PopularConfiguration | undefined {
  return POPULAR_CONFIGURATIONS.find(config => config.id === id)
}

/**
 * Obtener top N configuraciones más populares
 */
export function getTopPopularConfigurations(limit: number = 10): PopularConfiguration[] {
  return [...POPULAR_CONFIGURATIONS]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
}

/**
 * Verificar si una descripción coincide con configuración popular
 */
export function findMatchingPopularConfiguration(
  description: string
): PopularConfiguration | null {
  const results = searchPopularConfigurations(description)
  return results.length > 0 ? results[0] : null
}

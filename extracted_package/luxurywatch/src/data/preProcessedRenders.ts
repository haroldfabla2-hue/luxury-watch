/**
 * SISTEMA DE RENDERS PRE-PROCESADOS ULTRAREALISTAS
 * 
 * Base de datos de renders de alta calidad generados fuera del navegador
 * con múltiples ángulos de vista para cada configuración.
 * 
 * Ventajas:
 * - Carga instantánea (sin renderizado en tiempo real)
 * - Calidad fotorrealista garantizada
 * - Sin dependencia de WebGL/GPU
 * - Performance óptima en todos los dispositivos
 */

export interface PreProcessedRender {
  id: string
  name: string
  description: string
  
  // Características del reloj
  material: string
  caseType: string
  dialColor: string
  strapType: string
  style: string
  
  // Renders de múltiples ángulos (paths relativos a /public)
  angles: {
    frontal: string      // Vista frontal
    threequarter?: string // Vista 3/4 (45°)
    lateral?: string     // Vista lateral
    back?: string        // Vista trasera
  }
  
  // Metadata
  price: number
  popularity: number
  tags: string[]
}

/**
 * BASE DE DATOS DE RENDERS PRE-PROCESADOS
 * Todos los renders están en /public/static-watches/
 */
export const preProcessedRenders: PreProcessedRender[] = [
  {
    id: 'gold-classic-white',
    name: 'Oro Clásico Elegante',
    description: 'Reloj de oro amarillo 18k con esfera blanca y detalles dorados',
    material: 'gold',
    caseType: 'round',
    dialColor: 'white',
    strapType: 'leather',
    style: 'classic',
    angles: {
      frontal: '/static-watches/gold_white_classic_frontal.png',
      threequarter: '/static-watches/gold_white_classic_3quart.png',
      lateral: '/static-watches/gold_white_classic_lateral.png',
      back: '/static-watches/gold_white_classic_back.png',
    },
    price: 12500,
    popularity: 95,
    tags: ['lujo', 'clásico', 'oro', 'elegante'],
  },
  {
    id: 'steel-blue-sport',
    name: 'Acero Deportivo Azul',
    description: 'Reloj deportivo de acero 316L con esfera azul y bisel giratorio',
    material: 'steel',
    caseType: 'round',
    dialColor: 'blue',
    strapType: 'bracelet',
    style: 'sport',
    angles: {
      frontal: '/static-watches/steel_blue_sport_frontal.png',
      threequarter: '/static-watches/steel_blue_sport_3quart.png',
    },
    price: 3200,
    popularity: 96,
    tags: ['deportivo', 'acero', 'azul', 'moderno'],
  },
  {
    id: 'platinum-blue-luxury',
    name: 'Platino Luxury Azul',
    description: 'Reloj de platino 950 con esfera azul sunburst y complicaciones',
    material: 'platinum',
    caseType: 'round',
    dialColor: 'blue',
    strapType: 'leather',
    style: 'luxury',
    angles: {
      frontal: '/static-watches/platinum_blue_luxury_frontal.png',
      threequarter: '/static-watches/platinum_blue_luxury_3quart.png',
      lateral: '/static-watches/platinum_blue_luxury_lateral.png',
    },
    price: 35000,
    popularity: 91,
    tags: ['platino', 'lujo', 'premium', 'azul'],
  },
  {
    id: 'titanium-black-sport',
    name: 'Titanio Táctico Negro',
    description: 'Reloj táctico de titanio grado 5 con revestimiento DLC negro',
    material: 'titanium',
    caseType: 'round',
    dialColor: 'black',
    strapType: 'rubber',
    style: 'sport',
    angles: {
      frontal: '/static-watches/titanium_black_sport_frontal.png',
      threequarter: '/static-watches/titanium_black_sport_3quart.png',
      lateral: '/static-watches/titanium_black_sport_lateral.png',
      back: '/static-watches/titanium_black_sport_back.png',
    },
    price: 4800,
    popularity: 93,
    tags: ['titanio', 'táctico', 'negro', 'deportivo'],
  },
  {
    id: 'rosegold-champagne-elegant',
    name: 'Oro Rosa Champagne',
    description: 'Reloj elegante de oro rosa 18k con esfera champagne',
    material: 'rosegold',
    caseType: 'round',
    dialColor: 'champagne',
    strapType: 'leather',
    style: 'elegant',
    angles: {
      frontal: '/static-watches/rosegold_champagne_frontal.png',
      threequarter: '/static-watches/rosegold_champagne_3quart.png',
      lateral: '/static-watches/rosegold_champagne_lateral.png',
    },
    price: 13200,
    popularity: 89,
    tags: ['oro rosa', 'elegante', 'champagne', 'premium'],
  },
  {
    id: 'ceramic-silver-modern',
    name: 'Cerámica Moderna Plata',
    description: 'Reloj moderno con caja de cerámica plateada y esfera minimalista',
    material: 'ceramic',
    caseType: 'round',
    dialColor: 'silver',
    strapType: 'bracelet',
    style: 'modern',
    angles: {
      frontal: '/static-watches/ceramic_silver_modern_frontal.png',
      threequarter: '/static-watches/ceramic_silver_modern_3quart.png',
      lateral: '/static-watches/ceramic_silver_modern_lateral.png',
    },
    price: 5600,
    popularity: 88,
    tags: ['cerámica', 'moderno', 'plata', 'minimalista'],
  },
  {
    id: 'steel-white-classic',
    name: 'Acero Clásico Blanco',
    description: 'Reloj clásico de acero inoxidable con esfera blanca',
    material: 'steel',
    caseType: 'round',
    dialColor: 'white',
    strapType: 'bracelet',
    style: 'classic',
    angles: {
      frontal: '/static-watches/steel_white_classic_frontal.png',
      threequarter: '/static-watches/steel_white_classic_3quart.png',
      lateral: '/static-watches/steel_white_classic_lateral.png',
    },
    price: 2800,
    popularity: 94,
    tags: ['acero', 'clásico', 'blanco', 'versátil'],
  },
  {
    id: 'gold-black-sport',
    name: 'Oro Deportivo Negro',
    description: 'Reloj deportivo de oro amarillo con esfera negra y bisel cerámico',
    material: 'gold',
    caseType: 'round',
    dialColor: 'black',
    strapType: 'rubber',
    style: 'sport',
    angles: {
      frontal: '/static-watches/gold_black_sport_frontal.png',
      lateral: '/static-watches/gold_black_sport_lateral.png',
    },
    price: 14800,
    popularity: 87,
    tags: ['oro', 'deportivo', 'negro', 'moderno'],
  },
  {
    id: 'platinum-white-luxury',
    name: 'Platino Luxury Blanco',
    description: 'Reloj de platino 950 con esfera blanca y acabado espejado',
    material: 'platinum',
    caseType: 'round',
    dialColor: 'white',
    strapType: 'leather',
    style: 'luxury',
    angles: {
      frontal: '/static-watches/platinum_white_luxury_frontal.png',
      lateral: '/static-watches/platinum_white_luxury_lateral.png',
    },
    price: 38000,
    popularity: 86,
    tags: ['platino', 'lujo', 'blanco', 'premium'],
  },
  {
    id: 'titanium-white-classic',
    name: 'Titanio Clásico Blanco',
    description: 'Reloj clásico de titanio con esfera blanca y acabado cepillado',
    material: 'titanium',
    caseType: 'round',
    dialColor: 'white',
    strapType: 'bracelet',
    style: 'classic',
    angles: {
      frontal: '/static-watches/titanium_white_classic_frontal.png',
      threequarter: '/static-watches/titanium_white_classic_3quart.png',
    },
    price: 4200,
    popularity: 90,
    tags: ['titanio', 'clásico', 'blanco', 'ligero'],
  },
  {
    id: 'rosegold-white-elegant',
    name: 'Oro Rosa Elegante Blanco',
    description: 'Reloj elegante de oro rosa con esfera blanca perlada',
    material: 'rosegold',
    caseType: 'round',
    dialColor: 'white',
    strapType: 'leather',
    style: 'elegant',
    angles: {
      frontal: '/static-watches/rosegold_white_elegant_frontal.png',
      threequarter: '/static-watches/rosegold_white_elegant_3quart.png',
    },
    price: 12800,
    popularity: 88,
    tags: ['oro rosa', 'elegante', 'blanco', 'femenino'],
  },
  {
    id: 'steel-black-sport',
    name: 'Acero Deportivo Negro',
    description: 'Reloj deportivo de acero con revestimiento PVD negro',
    material: 'steel',
    caseType: 'round',
    dialColor: 'black',
    strapType: 'rubber',
    style: 'sport',
    angles: {
      frontal: '/static-watches/steel_black_sport_frontal.png',
    },
    price: 3400,
    popularity: 92,
    tags: ['acero', 'deportivo', 'negro', 'táctico'],
  },
  {
    id: 'ceramic-black-modern',
    name: 'Cerámica Negra Moderna',
    description: 'Reloj moderno con caja de cerámica negra de alta tecnología',
    material: 'ceramic',
    caseType: 'round',
    dialColor: 'black',
    strapType: 'rubber',
    style: 'modern',
    angles: {
      frontal: '/static-watches/ceramic_black_modern_frontal.png',
      threequarter: '/static-watches/ceramic_black_modern_3quart.png',
    },
    price: 6200,
    popularity: 89,
    tags: ['cerámica', 'moderno', 'negro', 'tecnológico'],
  },
  {
    id: 'gold-blue-luxury',
    name: 'Oro Luxury Azul',
    description: 'Reloj de lujo en oro amarillo con esfera azul profundo',
    material: 'gold',
    caseType: 'round',
    dialColor: 'blue',
    strapType: 'leather',
    style: 'luxury',
    angles: {
      frontal: '/static-watches/gold_blue_luxury_frontal.png',
    },
    price: 16500,
    popularity: 85,
    tags: ['oro', 'lujo', 'azul', 'premium'],
  },
]

/**
 * BÚSQUEDA Y FILTRADO
 */

export function searchPreProcessedRenders(query: string): PreProcessedRender[] {
  const lowerQuery = query.toLowerCase()
  return preProcessedRenders.filter(render => 
    render.name.toLowerCase().includes(lowerQuery) ||
    render.description.toLowerCase().includes(lowerQuery) ||
    render.material.toLowerCase().includes(lowerQuery) ||
    render.dialColor.toLowerCase().includes(lowerQuery) ||
    render.style.toLowerCase().includes(lowerQuery) ||
    render.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  ).sort((a, b) => b.popularity - a.popularity)
}

export function getRenderById(id: string): PreProcessedRender | undefined {
  return preProcessedRenders.find(r => r.id === id)
}

export function getRendersByMaterial(material: string): PreProcessedRender[] {
  return preProcessedRenders
    .filter(r => r.material.toLowerCase() === material.toLowerCase())
    .sort((a, b) => b.popularity - a.popularity)
}

export function getRendersByStyle(style: string): PreProcessedRender[] {
  return preProcessedRenders
    .filter(r => r.style.toLowerCase() === style.toLowerCase())
    .sort((a, b) => b.popularity - a.popularity)
}

export function getTopRenders(limit: number = 10): PreProcessedRender[] {
  return [...preProcessedRenders]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
}

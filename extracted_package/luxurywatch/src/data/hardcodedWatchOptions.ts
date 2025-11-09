/**
 * DATOS HARDCODEADOS DE OPCIONES DE PERSONALIZACIÓN
 * 
 * Fallback para cuando las tablas de Supabase no están disponibles.
 * Datos realistas de relojes de lujo premium.
 */

import { Material, WatchCase, WatchDial, WatchHands, WatchStrap } from '../store/configuratorStore'

// MATERIALES PREMIUM
export const HARDCODED_MATERIALS: Material[] = [
  {
    id: 1,
    name: 'Oro 18K Amarillo',
    description: 'Oro amarillo de 18 quilates con acabado pulido brillante',
    material_type: 'Oro 18K',
    color_hex: '#FFD700',
    price: '8500.00',
    image_url: '/images/materials/gold-yellow.jpg',
    specifications: { purity: '75%', weight_grams: 45, finish: 'polished' }
  },
  {
    id: 2,
    name: 'Oro Rosa 18K',
    description: 'Oro rosa de 18 quilates con toque romántico y elegante',
    material_type: 'Oro Rosa',
    color_hex: '#B76E79',
    price: '9200.00',
    image_url: '/images/materials/gold-rose.jpg',
    specifications: { purity: '75%', weight_grams: 45, finish: 'brushed' }
  },
  {
    id: 3,
    name: 'Platino 950',
    description: 'Platino puro al 95%, el metal más exclusivo y duradero',
    material_type: 'Platino',
    color_hex: '#E5E4E2',
    price: '12500.00',
    image_url: '/images/materials/platinum.jpg',
    specifications: { purity: '95%', weight_grams: 50, finish: 'satin' }
  },
  {
    id: 4,
    name: 'Acero 316L',
    description: 'Acero inoxidable quirúrgico resistente a la corrosión',
    material_type: 'Acero',
    color_hex: '#C0C0C0',
    price: '1200.00',
    image_url: '/images/materials/steel.jpg',
    specifications: { grade: '316L', weight_grams: 40, finish: 'polished' }
  },
  {
    id: 5,
    name: 'Titanio Grado 5',
    description: 'Titanio aeroespacial ultraligero y resistente',
    material_type: 'Titanio',
    color_hex: '#8B9AA6',
    price: '3500.00',
    image_url: '/images/materials/titanium.jpg',
    specifications: { grade: '5', weight_grams: 25, finish: 'brushed' }
  },
  {
    id: 6,
    name: 'Cerámica Negra',
    description: 'Cerámica de alta tecnología resistente a arañazos',
    material_type: 'Cerámica',
    color_hex: '#1A1D20',
    price: '4200.00',
    image_url: '/images/materials/ceramic-black.jpg',
    specifications: { hardness: '9 Mohs', weight_grams: 35, finish: 'matte' }
  }
]

// CAJAS / CASE SHAPES
export const HARDCODED_CASES: WatchCase[] = [
  {
    id: 1,
    name: 'Round Classic',
    description: 'Caja redonda clásica de 40mm, elegancia atemporal',
    material_id: 4, // Acero por defecto
    shape: 'Round',
    color_hex: '#C0C0C0',
    size_mm: '40mm',
    price: '450.00',
    image_url: '/images/cases/round-classic.jpg',
    specifications: { diameter: 40, thickness: 10, lug_width: 20 }
  },
  {
    id: 2,
    name: 'Round Sport',
    description: 'Caja redonda deportiva de 42mm con bisel rotativo',
    material_id: 4, // Acero por defecto
    shape: 'Round',
    color_hex: '#C0C0C0',
    size_mm: '42mm',
    price: '550.00',
    image_url: '/images/cases/round-sport.jpg',
    specifications: { diameter: 42, thickness: 12, lug_width: 22 }
  },
  {
    id: 3,
    name: 'Cushion Vintage',
    description: 'Caja cushion de 41mm inspirada en diseños vintage',
    material_id: 1, // Oro
    shape: 'Cushion',
    color_hex: '#FFD700',
    size_mm: '41mm',
    price: '620.00',
    image_url: '/images/cases/cushion-vintage.jpg',
    specifications: { diameter: 41, thickness: 11, lug_width: 21 }
  },
  {
    id: 4,
    name: 'Square Modern',
    description: 'Caja cuadrada moderna de 38mm, vanguardista',
    material_id: 5, // Titanio
    shape: 'Square',
    color_hex: '#8B9AA6',
    size_mm: '38mm',
    price: '680.00',
    image_url: '/images/cases/square-modern.jpg',
    specifications: { diameter: 38, thickness: 9, lug_width: 20 }
  },
  {
    id: 5,
    name: 'Hexagon Limited',
    description: 'Caja hexagonal exclusiva de 40mm, edición limitada',
    material_id: 3, // Platino
    shape: 'Hexagon',
    color_hex: '#E5E4E2',
    size_mm: '40mm',
    price: '890.00',
    image_url: '/images/cases/hexagon-limited.jpg',
    specifications: { diameter: 40, thickness: 11, lug_width: 21 }
  }
]

// ESFERAS / DIALS
export const HARDCODED_DIALS: WatchDial[] = [
  {
    id: 1,
    name: 'Azul Profundo',
    description: 'Esfera azul profundo con patrón sunburst',
    style_category: 'Clásico',
    color_hex: '#003366',
    pattern_type: 'Sunburst',
    price: '320.00',
    image_url: '/images/dials/blue-sunburst.jpg',
    material_id: 1,
    specifications: { pattern: 'sunburst', markers: 'applied', luminosity: 'yes' }
  },
  {
    id: 2,
    name: 'Negra Mate',
    description: 'Esfera negra mate con índices luminosos',
    style_category: 'Sport',
    color_hex: '#000000',
    pattern_type: 'Mate',
    price: '280.00',
    image_url: '/images/dials/black-matte.jpg',
    material_id: 4,
    specifications: { pattern: 'matte', markers: 'painted', luminosity: 'superluminova' }
  },
  {
    id: 3,
    name: 'Blanca Clásica',
    description: 'Esfera blanca clásica con números romanos',
    style_category: 'Clásico',
    color_hex: '#FFFFFF',
    pattern_type: 'Lisa',
    price: '290.00',
    image_url: '/images/dials/white-classic.jpg',
    material_id: 4,
    specifications: { pattern: 'smooth', markers: 'roman_numerals', luminosity: 'no' }
  },
  {
    id: 4,
    name: 'Verde Esmeralda',
    description: 'Esfera verde esmeralda con patrón guilloche',
    style_category: 'Moderno',
    color_hex: '#50C878',
    pattern_type: 'Guilloche',
    price: '420.00',
    image_url: '/images/dials/green-guilloche.jpg',
    material_id: 1,
    specifications: { pattern: 'guilloche', markers: 'applied', luminosity: 'yes' }
  },
  {
    id: 5,
    name: 'Gris Meteorito',
    description: 'Esfera de meteorito genuino, cada una única',
    style_category: 'Lujo',
    color_hex: '#696969',
    pattern_type: 'Meteorito',
    price: '2500.00',
    image_url: '/images/dials/grey-meteorite.jpg',
    material_id: 3,
    specifications: { pattern: 'meteorite', markers: 'diamond', luminosity: 'no' }
  },
  {
    id: 6,
    name: 'Champagne Dorada',
    description: 'Esfera champagne con detalles dorados',
    style_category: 'Elegante',
    color_hex: '#F7E7CE',
    pattern_type: 'Sunburst',
    price: '380.00',
    image_url: '/images/dials/champagne-gold.jpg',
    material_id: 1,
    specifications: { pattern: 'sunburst', markers: 'gold_applied', luminosity: 'no' }
  }
]

// MANECILLAS / HANDS
export const HARDCODED_HANDS: WatchHands[] = [
  {
    id: 1,
    name: 'Classic Dauphine',
    description: 'Manecillas dauphine clásicas pulidas',
    style: 'Classic',
    color: 'Plateado',
    material_type: 'Acero Pulido',
    size_mm: '12mm',
    price: '180.00',
    image_url: '/images/hands/classic-dauphine.jpg',
    specifications: { finish: 'polished', luminosity: 'yes', length_mm: { hour: 8, minute: 12 } }
  },
  {
    id: 2,
    name: 'Sport Sword',
    description: 'Manecillas tipo espada deportivas con lume',
    style: 'Sport',
    color: 'Plateado',
    material_type: 'Acero',
    size_mm: '13mm',
    price: '220.00',
    image_url: '/images/hands/sport-sword.jpg',
    specifications: { finish: 'brushed', luminosity: 'superluminova', length_mm: { hour: 9, minute: 13 } }
  },
  {
    id: 3,
    name: 'Modern Baton',
    description: 'Manecillas modernas tipo baton minimalistas',
    style: 'Modern',
    color: 'Negro',
    material_type: 'Acero Negro',
    size_mm: '12mm',
    price: '250.00',
    image_url: '/images/hands/modern-baton.jpg',
    specifications: { finish: 'black_pvd', luminosity: 'yes', length_mm: { hour: 8, minute: 12 } }
  },
  {
    id: 4,
    name: 'Elegant Breguet',
    description: 'Manecillas Breguet con punta de flecha azulada',
    style: 'Elegant',
    color: 'Azul',
    material_type: 'Acero Azulado',
    size_mm: '11mm',
    price: '380.00',
    image_url: '/images/hands/elegant-breguet.jpg',
    specifications: { finish: 'blued_steel', luminosity: 'no', length_mm: { hour: 7, minute: 11 } }
  },
  {
    id: 5,
    name: 'Skeleton Open',
    description: 'Manecillas esqueletizadas de oro',
    style: 'Skeleton',
    color: 'Dorado',
    material_type: 'Oro',
    size_mm: '12mm',
    price: '890.00',
    image_url: '/images/hands/skeleton-open.jpg',
    specifications: { finish: 'polished_gold', luminosity: 'no', length_mm: { hour: 8, minute: 12 } }
  }
]

// CORREAS / STRAPS
export const HARDCODED_STRAPS: WatchStrap[] = [
  {
    id: 1,
    name: 'Cuero Negro Premium',
    description: 'Correa de cuero de becerro negro con costuras contrastantes',
    material_type: 'Cuero',
    color: 'Negro',
    style: 'Clásico',
    buckle_type: 'Tang',
    price: '250.00',
    image_url: '/images/straps/leather-black.jpg',
    specifications: { leather_type: 'calfskin', width_mm: 20, buckle: 'tang' }
  },
  {
    id: 2,
    name: 'Cuero Marrón Vintage',
    description: 'Correa de cuero marrón envejecido estilo vintage',
    material_type: 'Cuero',
    color: 'Marrón',
    style: 'Vintage',
    buckle_type: 'Tang',
    price: '280.00',
    image_url: '/images/straps/leather-brown.jpg',
    specifications: { leather_type: 'buffalo', width_mm: 22, buckle: 'tang' }
  },
  {
    id: 3,
    name: 'Alligator Azul',
    description: 'Correa de cocodrilo genuino azul marino',
    material_type: 'Alligator',
    color: 'Azul',
    style: 'Lujo',
    buckle_type: 'Deployant',
    price: '1200.00',
    image_url: '/images/straps/alligator-blue.jpg',
    specifications: { leather_type: 'alligator', width_mm: 20, buckle: 'deployant' }
  },
  {
    id: 4,
    name: 'Brazalete Acero',
    description: 'Brazalete de acero con cierre desplegable',
    material_type: 'Metal',
    color: 'Plateado',
    style: 'Sport',
    buckle_type: 'Deployant',
    price: '450.00',
    image_url: '/images/straps/bracelet-steel.jpg',
    specifications: { metal_type: 'steel_316l', width_mm: 20, buckle: 'deployant' }
  },
  {
    id: 5,
    name: 'Malla Milanesa',
    description: 'Brazalete de malla milanesa ajustable',
    material_type: 'Metal',
    color: 'Plateado',
    style: 'Elegante',
    buckle_type: 'Magnetic',
    price: '380.00',
    image_url: '/images/straps/mesh-milanese.jpg',
    specifications: { metal_type: 'steel_mesh', width_mm: 20, buckle: 'magnetic' }
  },
  {
    id: 6,
    name: 'Caucho Deportivo',
    description: 'Correa de caucho vulcanizado para uso deportivo',
    material_type: 'Caucho',
    color: 'Negro',
    style: 'Sport',
    buckle_type: 'Tang',
    price: '120.00',
    image_url: '/images/straps/rubber-sport.jpg',
    specifications: { rubber_type: 'vulcanized', width_mm: 22, buckle: 'tang' }
  },
  {
    id: 7,
    name: 'NATO Verde Militar',
    description: 'Correa NATO de nylon verde militar',
    material_type: 'Nylon',
    color: 'Verde',
    style: 'Militar',
    buckle_type: 'NATO Rings',
    price: '45.00',
    image_url: '/images/straps/nato-green.jpg',
    specifications: { nylon_type: 'nato', width_mm: 20, buckle: 'nato_rings' }
  }
]

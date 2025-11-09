import { WatchConfiguration } from '../store/configuratorStore'

// Tipos para el sistema de renders
export type ViewAngle = 'frontal' | 'lateral' | '3quart' | 'top' | 'back'

export interface RenderPath {
  path: string
  exists: boolean
  fallback?: string
}

// Mapeo de material_type a identificador de archivo
const materialTypeMap: Record<string, string> = {
  'Oro 18K': 'gold',
  'Platino 950': 'platinum',
  'Titanio Grado 5': 'titanium',
  'Cerámica Negra': 'ceramic',
  'Acero Inoxidable 316L': 'steel',
  'Oro Rosa 18K': 'rosegold',
}

// Mapeo de color de esfera a identificador
const dialColorMap: Record<string, string> = {
  '#FFFFFF': 'white',
  '#F8F8F8': 'white',
  '#000000': 'black',
  '#1A1D20': 'black',
  '#1E3A8A': 'blue',
  '#3B82F6': 'blue',
  '#F5E6D3': 'champagne',
  '#D4AF37': 'champagne',
  '#E5E7EB': 'silver',
  '#9CA3AF': 'silver',
}

// Mapeo de tipo de correa
const strapTypeMap: Record<string, string> = {
  'Cuero Negro': 'leather_black',
  'Cuero Marrón Luxury': 'leather_brown',
  'Caucho Deportivo': 'rubber',
  'Brazalete de Acero': 'metal_bracelet',
  'NATO Azul Marino': 'nato',
}

// Inventario de renders disponibles (actualizado - 40 renders totales)
const availableRenders: Record<string, ViewAngle[]> = {
  // Oro 18K
  'gold_white_classic': ['frontal', 'lateral', '3quart', 'back'],
  'gold_black_sport': ['frontal', 'lateral'],
  'gold_blue_luxury': ['frontal'],
  
  // Titanio
  'titanium_black_sport': ['frontal', '3quart', 'back', 'lateral'],
  'titanium_white_classic': ['frontal', '3quart'],
  
  // Platino
  'platinum_blue_luxury': ['frontal', '3quart', 'lateral'],
  'platinum_white_luxury': ['frontal', 'lateral'],
  
  // Oro Rosa
  'rosegold_champagne_elegant': ['frontal', 'lateral', '3quart'],
  'rosegold_white_elegant': ['frontal', '3quart'],
  
  // Cerámica
  'ceramic_silver_modern': ['frontal', '3quart', 'lateral'],
  'ceramic_black_modern': ['frontal', '3quart'],
  
  // Acero
  'steel_white_classic': ['frontal', 'lateral', '3quart'],
  'steel_blue_sport': ['frontal', '3quart'],
  'steel_black_sport': ['frontal'],
}

/**
 * Normaliza el nombre del material
 */
function normalizeMaterial(materialType: string): string {
  return materialTypeMap[materialType] || 'gold'
}

/**
 * Normaliza el color de la esfera
 */
function normalizeDialColor(colorHex: string): string {
  return dialColorMap[colorHex] || 'white'
}

/**
 * Normaliza el tipo de correa
 */
function normalizeStrap(strapName: string): string {
  return strapTypeMap[strapName] || 'leather_black'
}

/**
 * Genera el identificador base del render (material_dial_descripción)
 */
function generateRenderKey(config: WatchConfiguration): string {
  if (!config.material || !config.dial) return 'gold_white_classic'
  
  const material = normalizeMaterial(config.material.material_type)
  const dial = normalizeDialColor(config.dial.color_hex)
  
  // Determinar estilo basado en otros factores
  let style = 'classic'
  if (config.strap?.material_type === 'Caucho Deportivo') style = 'sport'
  if (config.material.material_type === 'Platino 950') style = 'luxury'
  if (config.material.material_type === 'Oro Rosa 18K') style = 'elegant'
  if (config.material.material_type === 'Cerámica Negra') style = 'modern'
  
  return `${material}_${dial}_${style}`
}

/**
 * Encuentra el render más cercano disponible
 */
function findClosestRender(targetKey: string): string {
  // Si existe exactamente, retornarlo
  if (availableRenders[targetKey]) return targetKey
  
  // Extraer componentes del target
  const [targetMaterial, targetDial] = targetKey.split('_')
  
  // Buscar por material primero
  for (const key of Object.keys(availableRenders)) {
    if (key.startsWith(targetMaterial + '_')) return key
  }
  
  // Buscar por dial
  for (const key of Object.keys(availableRenders)) {
    if (key.includes('_' + targetDial + '_')) return key
  }
  
  // Fallback por defecto
  return 'gold_white_classic'
}

/**
 * Obtiene la ruta del render para una configuración y ángulo específicos
 */
export function getRenderPath(
  config: WatchConfiguration,
  angle: ViewAngle = 'frontal'
): RenderPath {
  // Generar clave del render
  const renderKey = generateRenderKey(config)
  
  // Buscar render más cercano disponible
  const closestKey = findClosestRender(renderKey)
  
  // Verificar si el ángulo está disponible
  const availableAngles = availableRenders[closestKey] || ['frontal']
  const hasAngle = availableAngles.includes(angle)
  
  // Construir path
  const fileName = hasAngle 
    ? `${closestKey}_${angle}.png`
    : `${closestKey}_frontal.png`
  
  const path = `/static-watches/${fileName}`
  
  // Fallback si no existe
  const fallback = closestKey !== renderKey 
    ? `/static-watches/${closestKey}_frontal.png`
    : undefined
  
  return {
    path,
    exists: true, // Asumimos que existe basado en el inventario
    fallback
  }
}

/**
 * Obtiene todos los ángulos disponibles para una configuración
 */
export function getAvailableAngles(config: WatchConfiguration): ViewAngle[] {
  const renderKey = generateRenderKey(config)
  const closestKey = findClosestRender(renderKey)
  return availableRenders[closestKey] || ['frontal']
}

/**
 * Pre-carga los renders para una configuración
 * Retorna las rutas de todas las vistas disponibles
 */
export function getPreloadPaths(config: WatchConfiguration): string[] {
  const renderKey = generateRenderKey(config)
  const closestKey = findClosestRender(renderKey)
  const angles = availableRenders[closestKey] || ['frontal']
  
  return angles.map(angle => `/static-watches/${closestKey}_${angle}.png`)
}

/**
 * Verifica si un ángulo específico está disponible
 */
export function isAngleAvailable(config: WatchConfiguration, angle: ViewAngle): boolean {
  const availableAngles = getAvailableAngles(config)
  return availableAngles.includes(angle)
}

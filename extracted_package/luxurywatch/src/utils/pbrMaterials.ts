/**
 * MATERIALES PBR PREMIUM PARA RELOJES DE LUJO
 * 
 * Configuración de materiales basada en valores físicos reales
 * Para renderizado fotorrealista con Three.js
 * 
 * Basado en:
 * - docs/pbr_materials_relojes.md
 * - Especificaciones físicas de materiales reales
 * - Imágenes de referencia en /imgs (84 imágenes premium)
 */

import * as THREE from 'three'

export interface PBRMaterialConfig {
  name: string
  displayName: string
  baseColor: string
  metalness: number
  roughness: number
  envMapIntensity: number
  clearcoat?: number
  clearcoatRoughness?: number
  ior?: number
  transmission?: number
  thickness?: number
  anisotropy?: number
  anisotropyRotation?: number
  description: string
  category: 'metal' | 'ceramic' | 'composite'
  priceMultiplier: number
}

/**
 * MATERIALES METÁLICOS PREMIUM
 */

export const GOLD_18K: PBRMaterialConfig = {
  name: 'gold_18k',
  displayName: 'Oro 18K',
  baseColor: '#D4AF37', // Oro clásico
  metalness: 0.92, // Altamente metálico
  roughness: 0.08, // Muy pulido
  envMapIntensity: 2.2, // Reflejos intensos
  description: 'Oro amarillo 18 kilates con acabado pulido espejo',
  category: 'metal',
  priceMultiplier: 15.0
}

export const ROSE_GOLD_18K: PBRMaterialConfig = {
  name: 'rose_gold_18k',
  displayName: 'Oro Rosa 18K',
  baseColor: '#B76E79', // Oro rosa premium
  metalness: 0.92,
  roughness: 0.10,
  envMapIntensity: 2.0,
  description: 'Oro rosa 18 kilates con tono cálido y romántico',
  category: 'metal',
  priceMultiplier: 15.5
}

export const WHITE_GOLD_18K: PBRMaterialConfig = {
  name: 'white_gold_18k',
  displayName: 'Oro Blanco 18K',
  baseColor: '#E8E8E8', // Blanco brillante
  metalness: 0.94,
  roughness: 0.06,
  envMapIntensity: 2.4,
  description: 'Oro blanco 18 kilates con baño de rodio',
  category: 'metal',
  priceMultiplier: 16.0
}

export const PLATINUM_950: PBRMaterialConfig = {
  name: 'platinum_950',
  displayName: 'Platino 950',
  baseColor: '#E5E4E2', // Platino natural
  metalness: 1.0, // 100% metálico
  roughness: 0.05, // Extremadamente pulido
  envMapIntensity: 2.6, // Máximos reflejos
  description: 'Platino 950 puro, el metal más noble y pesado',
  category: 'metal',
  priceMultiplier: 20.0
}

export const TITANIUM_GRADE_5: PBRMaterialConfig = {
  name: 'titanium_grade_5',
  displayName: 'Titanio Grado 5',
  baseColor: '#8B9AA6', // Gris azulado
  metalness: 0.85,
  roughness: 0.18, // Acabado cepillado
  envMapIntensity: 1.4,
  anisotropy: 0.6, // Reflejos direccionales por cepillado
  description: 'Titanio aeroespacial con acabado cepillado',
  category: 'metal',
  priceMultiplier: 8.0
}

export const TITANIUM_PVD_BLACK: PBRMaterialConfig = {
  name: 'titanium_pvd_black',
  displayName: 'Titanio PVD Negro',
  baseColor: '#1A1D20', // Negro profundo
  metalness: 0.90,
  roughness: 0.15,
  envMapIntensity: 1.6,
  description: 'Titanio con recubrimiento PVD negro ultra-resistente',
  category: 'metal',
  priceMultiplier: 9.5
}

export const STAINLESS_STEEL_316L: PBRMaterialConfig = {
  name: 'stainless_steel_316l',
  displayName: 'Acero Inoxidable 316L',
  baseColor: '#C0C0C0', // Plata brillante
  metalness: 1.0,
  roughness: 0.12,
  envMapIntensity: 1.8,
  description: 'Acero inoxidable quirúrgico pulido',
  category: 'metal',
  priceMultiplier: 1.0 // Base
}

export const STAINLESS_STEEL_BRUSHED: PBRMaterialConfig = {
  name: 'stainless_steel_brushed',
  displayName: 'Acero Cepillado',
  baseColor: '#B0B0B0', // Plata mate
  metalness: 0.95,
  roughness: 0.25, // Acabado cepillado
  envMapIntensity: 1.2,
  anisotropy: 0.7,
  anisotropyRotation: Math.PI / 2,
  description: 'Acero inoxidable con acabado cepillado satinado',
  category: 'metal',
  priceMultiplier: 1.2
}

/**
 * MATERIALES CERÁMICOS PREMIUM
 */

export const CERAMIC_BLACK: PBRMaterialConfig = {
  name: 'ceramic_black',
  displayName: 'Cerámica Negra',
  baseColor: '#0F0F0F', // Negro profundo
  metalness: 0.0, // No metálico
  roughness: 0.15, // Pulido pero no espejo
  envMapIntensity: 1.0,
  clearcoat: 0.8, // Capa de laca brillante
  clearcoatRoughness: 0.05,
  description: 'Cerámica de alta tecnología ultra-resistente',
  category: 'ceramic',
  priceMultiplier: 6.0
}

export const CERAMIC_WHITE: PBRMaterialConfig = {
  name: 'ceramic_white',
  displayName: 'Cerámica Blanca',
  baseColor: '#F5F5F5', // Blanco puro
  metalness: 0.0,
  roughness: 0.12,
  envMapIntensity: 1.2,
  clearcoat: 0.9,
  clearcoatRoughness: 0.03,
  description: 'Cerámica blanca de óxido de zirconio',
  category: 'ceramic',
  priceMultiplier: 6.5
}

export const CERAMIC_BLUE: PBRMaterialConfig = {
  name: 'ceramic_blue',
  displayName: 'Cerámica Azul',
  baseColor: '#0A3D62', // Azul marino
  metalness: 0.0,
  roughness: 0.18,
  envMapIntensity: 1.1,
  clearcoat: 0.85,
  clearcoatRoughness: 0.04,
  description: 'Cerámica azul con pigmentación profunda',
  category: 'ceramic',
  priceMultiplier: 7.0
}

export const CERAMIC_GREEN: PBRMaterialConfig = {
  name: 'ceramic_green',
  displayName: 'Cerámica Verde',
  baseColor: '#264E36', // Verde oscuro
  metalness: 0.0,
  roughness: 0.16,
  envMapIntensity: 1.15,
  clearcoat: 0.88,
  clearcoatRoughness: 0.04,
  description: 'Cerámica verde exclusiva de edición limitada',
  category: 'ceramic',
  priceMultiplier: 7.5
}

/**
 * MATERIALES COMPUESTOS Y ESPECIALES
 */

export const CARBON_FIBER_FORGED: PBRMaterialConfig = {
  name: 'carbon_fiber_forged',
  displayName: 'Fibra de Carbono Forjada',
  baseColor: '#1C1C1C', // Negro carbono
  metalness: 0.10,
  roughness: 0.40,
  envMapIntensity: 0.8,
  anisotropy: 0.9, // Patrón de tejido visible
  description: 'Fibra de carbono forjada de alto módulo',
  category: 'composite',
  priceMultiplier: 10.0
}

export const BRONZE_CuSn8: PBRMaterialConfig = {
  name: 'bronze_cusn8',
  displayName: 'Bronce CuSn8',
  baseColor: '#CD7F32', // Bronce clásico
  metalness: 0.88,
  roughness: 0.22,
  envMapIntensity: 1.5,
  description: 'Bronce náutico que desarrolla pátina única',
  category: 'metal',
  priceMultiplier: 4.5
}

/**
 * ÍNDICE DE TODOS LOS MATERIALES
 */
export const ALL_PBR_MATERIALS: PBRMaterialConfig[] = [
  GOLD_18K,
  ROSE_GOLD_18K,
  WHITE_GOLD_18K,
  PLATINUM_950,
  TITANIUM_GRADE_5,
  TITANIUM_PVD_BLACK,
  STAINLESS_STEEL_316L,
  STAINLESS_STEEL_BRUSHED,
  CERAMIC_BLACK,
  CERAMIC_WHITE,
  CERAMIC_BLUE,
  CERAMIC_GREEN,
  CARBON_FIBER_FORGED,
  BRONZE_CuSn8
]

/**
 * HELPER: Crear material Three.js desde config PBR
 */
export function createPBRMaterial(
  config: PBRMaterialConfig,
  envMap?: THREE.Texture
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: config.baseColor,
    metalness: config.metalness,
    roughness: config.roughness,
    envMapIntensity: config.envMapIntensity,
  })

  if (envMap) {
    material.envMap = envMap
  }

  // Clearcoat para cerámicas y acabados especiales (solo MeshPhysicalMaterial)
  if (config.clearcoat) {
    ;(material as any).clearcoat = config.clearcoat
    ;(material as any).clearcoatRoughness = config.clearcoatRoughness || 0
  }

  // Anisotropía para acabados cepillados (solo MeshPhysicalMaterial)
  if (config.anisotropy) {
    ;(material as any).anisotropy = config.anisotropy
    if (config.anisotropyRotation) {
      ;(material as any).anisotropyRotation = config.anisotropyRotation
    }
  }

  return material
}

/**
 * HELPER: Buscar material por nombre
 */
export function getPBRMaterialByName(name: string): PBRMaterialConfig | undefined {
  return ALL_PBR_MATERIALS.find(m => m.name === name)
}

/**
 * HELPER: Obtener materiales por categoría
 */
export function getPBRMaterialsByCategory(category: 'metal' | 'ceramic' | 'composite'): PBRMaterialConfig[] {
  return ALL_PBR_MATERIALS.filter(m => m.category === category)
}

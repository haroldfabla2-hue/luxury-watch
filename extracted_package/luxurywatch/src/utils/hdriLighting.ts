/**
 * SISTEMA DE ILUMINACIÓN HDRI CINEMATOGRÁFICA
 * Implementa environment mapping para reflejos fotorrealistas
 */

import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Carga y aplica textura HDRI para iluminación ambiental realista
 */
export const loadHDRIEnvironment = async (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  hdriPath?: string
): Promise<THREE.Texture | null> => {
  try {
    // Si no se proporciona HDRI, crear uno sintético
    if (!hdriPath) {
      return createSyntheticEnvironment(scene, renderer)
    }
    
    const rgbeLoader = new RGBELoader()
    const texture = await rgbeLoader.loadAsync(hdriPath)
    
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    scene.background = new THREE.Color(0xf5f5f4) // Mantener fondo neutral
    
    console.log('✅ HDRI environment loaded')
    return texture
    
  } catch (error) {
    console.warn('⚠️ Error loading HDRI, using synthetic environment:', error)
    return createSyntheticEnvironment(scene, renderer)
  }
}

/**
 * Crea environment map sintético usando CubeCamera
 * Alternativa cuando no hay HDRI disponible
 */
const createSyntheticEnvironment = (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): THREE.CubeTexture => {
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  })
  
  const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)
  
  // Crear escena temporal para el environment
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color(0xf5f5f4)
  
  // Luces para el environment
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  envScene.add(ambientLight)
  
  const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
  light1.position.set(5, 5, 5)
  envScene.add(light1)
  
  const light2 = new THREE.DirectionalLight(0xffffff, 0.4)
  light2.position.set(-5, 3, -5)
  envScene.add(light2)
  
  // Renderizar environment
  cubeCamera.position.set(0, 0, 0)
  cubeCamera.update(renderer, envScene)
  
  const envMap = cubeRenderTarget.texture
  scene.environment = envMap
  
  console.log('✅ Synthetic environment created')
  return envMap
}

/**
 * Configuración avanzada de iluminación cinematográfica
 */
export const setupCinematicLighting = (
  scene: THREE.Scene,
  config: {
    shadows: boolean
    shadowMapSize: number
  }
): void => {
  // 1. LUZ AMBIENTAL (iluminación base suave)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
  
  // 2. LUZ PRINCIPAL (key light) - iluminación dramática
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
  keyLight.position.set(5, 8, 5)
  keyLight.castShadow = config.shadows
  
  if (config.shadows) {
    keyLight.shadow.mapSize.width = config.shadowMapSize
    keyLight.shadow.mapSize.height = config.shadowMapSize
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 50
    keyLight.shadow.camera.left = -10
    keyLight.shadow.camera.right = 10
    keyLight.shadow.camera.top = 10
    keyLight.shadow.camera.bottom = -10
    keyLight.shadow.bias = -0.0001
  }
  
  scene.add(keyLight)
  
  // 3. LUZ DE RELLENO (fill light) - elimina sombras duras
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-5, 3, -3)
  scene.add(fillLight)
  
  // 4. LUZ DE BORDE (rim light) - contorno del objeto
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
  rimLight.position.set(-3, 2, -8)
  scene.add(rimLight)
  
  // 5. LUZ DE ACENTO (accent light) - destacar detalles
  const accentLight = new THREE.PointLight(0xffffff, 0.5, 20)
  accentLight.position.set(3, 5, 8)
  scene.add(accentLight)
  
  // 6. LUZ INFERIOR SUAVE (bounce light simulado)
  const bounceLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3)
  scene.add(bounceLight)
  
  console.log('✅ Cinematic lighting setup complete (6 lights)')
}

/**
 * Aplica post-processing effects para mayor realismo
 */
export const setupPostProcessing = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) => {
  // Configuraciones avanzadas del renderer
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace
  
  // HDR
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  
  // Anti-aliasing mejorado
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  console.log('✅ Post-processing configured')
}

/**
 * Actualiza materiales para usar environment map
 */
export const applyEnvironmentToMaterials = (
  object: THREE.Object3D,
  envMap: THREE.Texture
): void => {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
      
      if (material && material.isMeshStandardMaterial) {
        material.envMap = envMap
        material.envMapIntensity = material.metalness > 0.5 ? 1.5 : 0.8
        material.needsUpdate = true
      }
    }
  })
  
  console.log('✅ Environment map applied to materials')
}

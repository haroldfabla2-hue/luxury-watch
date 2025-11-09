import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useSharedWebGLContext } from '../hooks/useSharedWebGLContext'
import { useConfiguratorStore } from '../store/configuratorStore'
import { useSharedConfigIntegration } from '../hooks/useSharedConfigIntegration'

interface CompositorLayer {
  id: string
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderOrder: number
  visible: boolean
  renderTarget?: THREE.WebGLRenderTarget
  // Propiedades específicas del configurador
  watchGroup?: THREE.Group
  bodyMaterial?: THREE.MeshStandardMaterial
  crystalMaterial?: THREE.MeshPhysicalMaterial
}

interface CompositorWebGLProps {
  componentId: string
  containerRef: React.RefObject<HTMLDivElement>
  width?: number
  height?: number
  enableAR?: boolean
  onReady?: () => void
}

/**
 * 🎨 COMPOSITOR WEBGL INTELIGENTE
 * 
 * Solución avanzada para múltiples contextos WebGL:
 * - Renderizado por capas usando un solo contexto
 * - Compatible con ModelViewer AR
 * - Composición optimizada de múltiples vistas
 * - Sin conflictos de contextos
 */
export const CompositorWebGL = ({ 
  componentId, 
  containerRef, 
  width = 800, 
  height = 600,
  enableAR = true,
  onReady 
}: CompositorWebGLProps) => {
  const [isReady, setIsReady] = useState(false)
  const [layers, setLayers] = useState<Map<string, CompositorLayer>>(new Map())
  const renderLoopRef = useRef<number>()
  
  // Hook de contexto compartido
  const { contextState, getOrCreateContext, getContextInfo } = useSharedWebGLContext(componentId)
  
  // Hook de integración de configuración
  const { sharedConfig, get3DConfig } = useSharedConfigIntegration()
  
  // Configurador store
  const configuratorStore = useConfiguratorStore()
  
  // Crear capa para el configurador 3D
  const createConfiguratorLayer = useCallback(() => {
    if (!contextState) return
    
    const configuratorScene = new THREE.Scene()
    configuratorScene.background = new THREE.Color(0xf5f5f4) // Fondo del configurador
    configuratorScene.fog = new THREE.Fog(0xf5f5f4, 10, 30)
    
    // Cámara optimizada para el configurador
    const configuratorCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    configuratorCamera.position.set(0, 3, 6)
    
    const layer: CompositorLayer = {
      id: 'configurator-layer',
      scene: configuratorScene,
      camera: configuratorCamera,
      renderOrder: 1, // Renderizado después de base
      visible: true
    }
    
    setLayers(prev => new Map(prev.set('configurator-layer', layer)))
    console.log('🎭 Capa de configurador 3D creada')
  }, [contextState, width, height])
  
  // Bucle de renderizado por capas
  const renderLoop = useCallback(() => {
    if (!contextState) return
    
    // Configurar viewport para renderizado completo
    contextState.renderer.setViewport(0, 0, contextState.canvasWidth, contextState.canvasHeight)
    
    // Renderizar cada capa
    layers.forEach((layer) => {
      if (!layer.visible) return
      
      // Configurar cámara y escena específica de la capa
      if (layer.id === 'configurator-layer') {
        // Configurar luces específicas del configurador
        setupConfiguratorLighting(layer.scene)
      }
      
      // Renderizar capa
      contextState.renderer.render(layer.scene, layer.camera)
    })
    
    // Continuar bucle
    renderLoopRef.current = requestAnimationFrame(renderLoop)
  }, [contextState, layers])
  
  // Configurar luces del configurador
  const setupConfiguratorLighting = (scene: THREE.Scene) => {
    // Limpiar luces existentes
    const existingLights = scene.children.filter(child => child instanceof THREE.Light)
    existingLights.forEach(light => scene.remove(light))
    
    // Key Light (principal)
    const keyLight = new THREE.DirectionalLight(0xFFF8E7, 1.5)
    keyLight.position.set(5, 5, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 50
    scene.add(keyLight)
    
    // Fill Light (relleno)
    const fillLight = new THREE.DirectionalLight(0xE3F2FD, 0.8)
    fillLight.position.set(-5, 2, 2)
    scene.add(fillLight)
    
    // Rim Light (borde)
    const rimLight = new THREE.DirectionalLight(0xE1F5FE, 1.2)
    rimLight.position.set(0, 5, -5)
    scene.add(rimLight)
    
    // Ambient light suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
  }
  
  // Configurar Modelo 3D del reloj
  const setupWatchModel = useCallback(async () => {
    const configuratorLayer = layers.get('configurator-layer')
    if (!configuratorLayer) return
    
    // Obtener configuración 3D del hook
    const config3D = get3DConfig()
    
    // Crear modelo básico del reloj con configuración real
    const watchGroup = new THREE.Group()
    
    // Cuerpo principal del reloj con material dinámico
    const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: config3D.materials.case.color,
      metalness: config3D.materials.case.metalness,
      roughness: config3D.materials.case.roughness
    })
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    bodyMesh.castShadow = true
    bodyMesh.receiveShadow = true
    watchGroup.add(bodyMesh)
    
    // Cristal
    const crystalGeometry = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 32)
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      thickness: 0.1,
      roughness: 0.1,
      ior: 1.77,
      transparent: true
    })
    const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial)
    crystalMesh.position.y = 0.175
    watchGroup.add(crystalMesh)
    
    configuratorLayer.scene.add(watchGroup)
    
    // Guardar referencias para actualizaciones dinámicas
    configuratorLayer.watchGroup = watchGroup
    configuratorLayer.bodyMaterial = bodyMaterial
    configuratorLayer.crystalMaterial = crystalMaterial
    
    // Configurar interactividad básica y actualizaciones
    console.log('🎯 Modelo de reloj configurado con materiales dinámicos:', {
      caseMaterial: config3D.materials.case.metalness,
      caseColor: config3D.materials.case.color,
      caseRoughness: config3D.materials.case.roughness
    })
    if (configuratorStore) {
      // Aquí se pueden agregar controles y interactividad
      console.log('🎯 Modelo de reloj configurado para interactividad')
    }
  }, [layers, configuratorStore])
  
  // Inicializar sistema
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log(`🚀 Inicializando CompositorWebGL: ${componentId}`)
        
        // Obtener contexto compartido
        const context = getOrCreateContext(width, height)
        
        // Crear capas
        createConfiguratorLayer()
        
        // Configurar modelo
        await setupWatchModel()
        
        // Iniciar renderizado
        renderLoop()
        
        setIsReady(true)
        onReady?.()
        
        console.log('✅ CompositorWebGL inicializado correctamente')
        
      } catch (error) {
        console.error('❌ Error inicializando CompositorWebGL:', error)
      }
    }
    
    initializeSystem()
    
    return () => {
      if (renderLoopRef.current) {
        cancelAnimationFrame(renderLoopRef.current)
      }
    }
  }, [getOrCreateContext, createConfiguratorLayer, setupWatchModel, renderLoop, onReady, componentId, width, height])
  
  // Actualizar tamaño cuando cambie el contenedor
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !contextState) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = Math.floor(rect.width)
      const newHeight = Math.floor(rect.height)
      
      if (newWidth !== contextState.canvasWidth || newHeight !== contextState.canvasHeight) {
        contextState.renderer.setSize(newWidth, newHeight)
        contextState.canvasWidth = newWidth
        contextState.canvasHeight = newHeight
        
        // Actualizar cámaras
        layers.forEach((layer) => {
          layer.camera.aspect = newWidth / newHeight
          layer.camera.updateProjectionMatrix()
        })
        
        console.log(`📏 Tamaño actualizado: ${newWidth}x${newHeight}`)
      }
    }
    
    if (isReady) {
      updateSize()
      window.addEventListener('resize', updateSize)
    }
    
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [containerRef, contextState, layers, isReady])
  
  // Debug info
  useEffect(() => {
    const interval = setInterval(() => {
      if (isReady) {
        const info = getContextInfo()
        console.log(`🔍 Estado CompositorWebGL [${componentId}]:`, info)
      }
    }, 10000) // Cada 10 segundos
    
    return () => clearInterval(interval)
  }, [isReady, getContextInfo, componentId])
  
  return null // No renderiza nada, solo configura el sistema
}

export default CompositorWebGL
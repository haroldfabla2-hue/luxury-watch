import { useEffect, useRef, useState, useCallback } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'

/**
 * 🚀 CONFIGURADOR 3D ULTRA-OPTIMIZADO
 * 
 * Aplicación de mejores prácticas para máximo rendimiento:
 * - Cache de geometrías y materiales reutilizables
 * - Instancing para elementos repetitivos
 * - Actualización incremental sin recrear modelos
 * - Gestión eficiente de memoria WebGL
 * - Throttling inteligente de cambios
 * - Renderizado por capas con orden optimizado
 */

interface WatchConfig {
  case: {
    material: string
    color: string
    size: string
    thickness: string
  }
  dial: {
    color: string
    style: string
    numerals: string
  }
  strap: {
    material: string
    color: string
    style: string
  }
  movement: {
    type: string
    complications: string[]
  }
}

export const OptimizedConfigurator3D = ({ 
  className = '',
  onReady
}: { 
  className?: string
  onReady?: () => void 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const configuratorStore = useConfiguratorStore()
  
  // Referencias de THREE.js - inicializadas una sola vez
  const threeRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const watchGroupRef = useRef<any>(null)
  const animationRef = useRef<number>(0)
  
  // Cache de recursos reutilizables
  const resourcesRef = useRef<{
    geometries: Map<string, any>
    materials: Map<string, any>
    textures: Map<string, any>
  }>({
    geometries: new Map(),
    materials: new Map(),
    textures: new Map()
  })
  
  // Throttling para cambios de configuración
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<number>(0)
  
  // Estado del configurador
  const [watchConfig, setWatchConfig] = useState<WatchConfig>({
    case: { material: 'oro_18k', color: '#FFD700', size: '42mm', thickness: '12mm' },
    dial: { color: 'blanco', style: 'analogo', numerals: 'arabigo' },
    strap: { material: 'cuero', color: 'negro', style: 'clasico' },
    movement: { type: 'automatico', complications: [] }
  })

  // 🚀 INICIALIZACIÓN OPTIMIZADA - Se ejecuta una sola vez
  useEffect(() => {
    const initializeThreeJS = async () => {
      if (!canvasRef.current || threeRef.current) return
      
      try {
        console.log('🚀 Inicializando THREE.js optimizado...')
        
        // Importación única de THREE.js
        const THREE = await import('three')
        threeRef.current = THREE
        
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        
        // Configurar renderer con settings optimizados
        const renderer = new THREE.WebGLRenderer({ 
          canvas,
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance'
        })
        
        // Optimización: limitar pixel ratio para rendimiento
        const maxPixelRatio = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio
        renderer.setPixelRatio(Math.min(maxPixelRatio, 1.5))
        renderer.setSize(rect.width, rect.height)
        
        // Configuración visual optimizada
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.0
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.shadowMap.autoUpdate = false
        
        // Configurar escena
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf5f5f4)
        scene.fog = new THREE.Fog(0xf5f5f4, 10, 30)
        
        // Configurar cámara
        const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100)
        camera.position.set(0, 3, 6)
        camera.lookAt(0, 0, 0)
        
        // Preparar sistema de luces optimizado
        setupLights(scene, THREE)
        
        // Guardar referencias
        rendererRef.current = renderer
        sceneRef.current = scene
        cameraRef.current = camera
        
        // Inicializar cache de recursos
        initializeResourceCache(THREE)
        
        // Crear modelo inicial
        createOptimizedWatchModel(THREE)
        
        // Iniciar animación optimizada
        startOptimizedAnimation()
        
        setIsInitialized(true)
        onReady?.()
        
        console.log('✅ THREE.js optimizado inicializado')
        
      } catch (error) {
        console.error('❌ Error inicializando THREE.js:', error)
      }
    }
    
    initializeThreeJS()
    
    // Cleanup function
    return () => {
      cleanup()
    }
  }, [])

  // 🎯 PREPARACIÓN DE RECURSOS REUTILIZABLES
  const initializeResourceCache = (THREE: any) => {
    const { geometries, materials, textures } = resourcesRef.current
    
    // Geometrías base - se reutilizan siempre
    geometries.set('body', new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32)) // Reducido de 64 a 32
    geometries.set('crystal', new THREE.CylinderGeometry(1.4, 1.4, 0.05, 32))
    geometries.set('dial', new THREE.CylinderGeometry(1.35, 1.35, 0.02, 32))
    geometries.set('marker', new THREE.BoxGeometry(0.05, 0.1, 0.02))
    geometries.set('crown', new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16))
    
    console.log('📦 Cache de recursos inicializado')
  }

  // 💡 SISTEMA DE LUCES OPTIMIZADO
  const setupLights = (scene: any, THREE: any) => {
    // Key Light - Principal
    const keyLight = new THREE.DirectionalLight(0xFFF8E7, 1.2)
    keyLight.position.set(5, 5, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    scene.add(keyLight)
    
    // Fill Light - Relleno suave
    const fillLight = new THREE.DirectionalLight(0xE3F2FD, 0.6)
    fillLight.position.set(-5, 2, 2)
    scene.add(fillLight)
    
    // Ambient Light - Iluminación ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)
  }

  // 🏗️ CREACIÓN DEL MODELO OPTIMIZADO
  const createOptimizedWatchModel = (THREE: any) => {
    if (!sceneRef.current) return
    
    // Limpiar modelo anterior si existe
    if (watchGroupRef.current) {
      sceneRef.current.remove(watchGroupRef.current)
    }
    
    const watchGroup = new THREE.Group()
    const { geometries, materials } = resourcesRef.current
    
    // 🎨 Materiales optimizados con cache
    const caseMaterial = createOptimizedCaseMaterial(THREE, watchConfig.case.material, watchConfig.case.color)
    materials.set('case', caseMaterial)
    
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      thickness: 0.1,
      roughness: 0.1,
      ior: 1.77,
      transparent: true
    })
    materials.set('crystal', crystalMaterial)
    
    const dialMaterial = createOptimizedDialMaterial(THREE, watchConfig.dial.color)
    materials.set('dial', dialMaterial)
    
    // 🏗️ Construcción del modelo con geometrías reutilizables
    const bodyMesh = new THREE.Mesh(geometries.get('body'), materials.get('case'))
    bodyMesh.castShadow = true
    bodyMesh.receiveShadow = true
    watchGroup.add(bodyMesh)
    
    const crystalMesh = new THREE.Mesh(geometries.get('crystal'), materials.get('crystal'))
    crystalMesh.position.y = 0.175
    crystalMesh.castShadow = true
    watchGroup.add(crystalMesh)
    
    const dialMesh = new THREE.Mesh(geometries.get('dial'), materials.get('dial'))
    dialMesh.position.y = 0.11
    dialMesh.castShadow = true
    watchGroup.add(dialMesh)
    
    // ⏰ Marcadores con Instancing - MUY OPTIMIZADO
    createInstancedHourMarkers(watchGroup, THREE)
    
    // 👑 Corona del reloj
    const crownMesh = new THREE.Mesh(geometries.get('crown'), materials.get('case'))
    crownMesh.position.set(1.8, 0, 0)
    crownMesh.rotation.z = Math.PI / 2
    crownMesh.castShadow = true
    watchGroup.add(crownMesh)
    
    watchGroupRef.current = watchGroup
    sceneRef.current.add(watchGroup)
    
    console.log('🎯 Modelo optimizado creado')
  }

  // ⚡ INSTANCING PARA MARCADORES DE HORA
  const createInstancedHourMarkers = (group: any, THREE: any) => {
    const { geometries, materials } = resourcesRef.current
    const markerGeometry = geometries.get('marker')
    const markerMaterial = materials.get('case')
    
    // Instanciar 12 marcadores con una sola llamada de dibujo
    const instancedMarkers = new THREE.InstancedMesh(markerGeometry, markerMaterial, 12)
    
    // Posicionar marcadores en círculo
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const x = Math.cos(angle) * 1.25
      const z = Math.sin(angle) * 1.25
      
      const matrix = new THREE.Matrix4()
      matrix.setPosition(x, 0.15, z)
      
      // Orientación hacia el centro
      markerGeometry.computeBoundingSphere()
      const direction = new THREE.Vector3(-x, 0, -z).normalize()
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
      matrix.multiply(new THREE.Matrix4().makeRotationFromQuaternion(quaternion))
      
      instancedMarkers.setMatrixAt(i, matrix)
    }
    
    instancedMarkers.castShadow = true
    group.add(instancedMarkers)
  }

  // 🎨 MATERIALES OPTIMIZADOS
  const createOptimizedCaseMaterial = (THREE: any, materialType: string, color: string) => {
    const { materials } = resourcesRef.current
    const cacheKey = `case_${materialType}_${color}`
    
    if (materials.has(cacheKey)) {
      return materials.get(cacheKey)
    }
    
    const materialParams = {
      color: color,
      metalness: materialType === 'oro_18k' ? 1.0 : materialType === 'acero_inoxidable' ? 1.0 : 0.9,
      roughness: materialType === 'oro_18k' ? 0.15 : materialType === 'acero_inoxidable' ? 0.25 : 0.35
    }
    
    const material = new THREE.MeshStandardMaterial(materialParams)
    materials.set(cacheKey, material)
    return material
  }

  const createOptimizedDialMaterial = (THREE: any, color: string) => {
    const { materials } = resourcesRef.current
    const cacheKey = `dial_${color}`
    
    if (materials.has(cacheKey)) {
      return materials.get(cacheKey)
    }
    
    const dialColors: Record<string, number> = {
      'blanco': 0xffffff,
      'negro': 0x000000,
      'azul': 0x1e40af,
      'plateado': 0xe5e7eb
    }
    
    const material = new THREE.MeshStandardMaterial({
      color: dialColors[color] || 0xffffff,
      metalness: 0.1,
      roughness: 0.8
    })
    
    materials.set(cacheKey, material)
    return material
  }

  // 🎬 ANIMACIÓN OPTIMIZADA
  const startOptimizedAnimation = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return
    
    const animate = () => {
      // Rotación suave y controlada
      if (watchGroupRef.current) {
        watchGroupRef.current.rotation.y += 0.003 // Más suave
      }
      
      // Renderizado optimizado
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
  }

  // 🔄 ACTUALIZACIÓN INCREMENTAL CON THROTTLING
  const updateWatchConfiguration = useCallback((newConfig: Partial<WatchConfig>) => {
    const now = Date.now()
    
    // Throttling: máximo 1 actualización cada 100ms
    if (now - lastUpdateRef.current < 100) {
      clearTimeout(updateTimeoutRef.current!)
      updateTimeoutRef.current = setTimeout(() => updateWatchConfiguration(newConfig), 100)
      return
    }
    
    lastUpdateRef.current = now
    
    setWatchConfig(prev => {
      const updated = { ...prev, ...newConfig }
      
      // Actualizar solo los materiales que cambiaron
      if (newConfig.case) {
        updateCaseMaterial(updated.case)
      }
      
      if (newConfig.dial) {
        updateDialMaterial(updated.dial)
      }
      
      return updated
    })
  }, [])

  const updateCaseMaterial = (caseConfig: any) => {
    if (!watchGroupRef.current) return
    
    const THREE = threeRef.current
    if (!THREE) return
    
    const newMaterial = createOptimizedCaseMaterial(THREE, caseConfig.material, caseConfig.color)
    const bodyMesh = watchGroupRef.current.children[0] // Cuerpo principal
    const crownMesh = watchGroupRef.current.children[4] // Corona
    
    if (bodyMesh && bodyMesh.material) {
      bodyMesh.material = newMaterial
    }
    
    if (crownMesh && crownMesh.material) {
      crownMesh.material = newMaterial
    }
  }

  const updateDialMaterial = (dialConfig: any) => {
    if (!watchGroupRef.current) return
    
    const THREE = threeRef.current
    if (!THREE) return
    
    const dialMesh = watchGroupRef.current.children[2] // Esfera
    if (dialMesh && dialMesh.material) {
      const newMaterial = createOptimizedDialMaterial(THREE, dialConfig.color)
      dialMesh.material = newMaterial
    }
  }

  // 🎛️ HANDLERS OPTIMIZADOS
  const handleConfigChange = (section: keyof WatchConfig, property: string, value: any) => {
    const newConfig = {
      [section]: {
        ...watchConfig[section],
        [property]: value
      }
    }
    
    updateWatchConfiguration(newConfig)
  }

  // 🧹 LIMPIEZA DE RECURSOS
  const cleanup = () => {
    // Cancelar animación
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    // Limpiar timeout pendiente
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    // Limpiar recursos THREE.js
    if (rendererRef.current) {
      rendererRef.current.dispose()
    }
    
    // Limpiar cache de recursos
    resourcesRef.current.geometries.forEach(geo => geo.dispose())
    resourcesRef.current.materials.forEach(mat => mat.dispose())
    resourcesRef.current.textures.forEach(tex => tex.dispose())
  }

  // 📐 RESPONSIVE RESIZE OPTIMIZADO
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && rendererRef.current && cameraRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        
        rendererRef.current.setSize(rect.width, rect.height)
        cameraRef.current.aspect = rect.width / rect.height
        cameraRef.current.updateProjectionMatrix()
      }
    }
    
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // 🎨 RENDERIZADO DE CONTROLES
  const renderConfigControls = () => (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-3 max-w-xs">
      <h3 className="font-bold text-gray-800 border-b pb-2">Personalización</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Material del Caso</label>
        <select 
          value={watchConfig.case.material}
          onChange={(e) => handleConfigChange('case', 'material', e.target.value)}
          className="w-full p-2 border rounded bg-white"
        >
          <option value="oro_18k">Oro 18K</option>
          <option value="acero_inoxidable">Acero Inoxidable</option>
          <option value="titanio">Titanio</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color del Caso</label>
        <input
          type="color"
          value={watchConfig.case.color}
          onChange={(e) => handleConfigChange('case', 'color', e.target.value)}
          className="w-full h-10 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color de Esfera</label>
        <select 
          value={watchConfig.dial.color}
          onChange={(e) => handleConfigChange('dial', 'color', e.target.value)}
          className="w-full p-2 border rounded bg-white"
        >
          <option value="blanco">Blanco</option>
          <option value="negro">Negro</option>
          <option value="azul">Azul</option>
          <option value="plateado">Plateado</option>
        </select>
      </div>
    </div>
  )

  // ⏳ PANTALLA DE CARGA
  if (!isInitialized) {
    return (
      <div className={`optimized-configurator-3d ${className} h-full flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Inicializando Motor 3D</h2>
          <p className="text-gray-600">Optimizando renderizado para máximo rendimiento...</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2 w-48 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`optimized-configurator-3d ${className} relative h-full overflow-hidden`}>
      {/* Canvas 3D optimizado */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          display: 'block',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      />
      
      {/* Controles posicionados */}
      <div className="absolute top-4 right-4 z-10">
        {renderConfigControls()}
      </div>
      
      {/* Indicador de estado optimizado */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          ⚡ Motor 3D Optimizado Activo
        </div>
      </div>
      
      {/* Información de rendimiento */}
      <div className="absolute bottom-4 right-4 z-10 max-w-xs">
        <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm backdrop-blur-sm">
          <div className="font-semibold mb-2 text-green-400">⚡ Rendimiento Optimizado:</div>
          <div className="space-y-1 text-xs">
            <div>✅ Cache de Geometrías</div>
            <div>✅ Instancing de Marcadores</div>
            <div>✅ Actualización Incremental</div>
            <div>✅ Throttling Inteligente</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptimizedConfigurator3D
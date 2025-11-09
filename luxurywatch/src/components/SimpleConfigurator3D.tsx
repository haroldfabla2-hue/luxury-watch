import { useEffect, useRef, useState } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'

interface Configurator3DState {
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

/**
 * 🎯 CONFIGURADOR 3D SIMPLIFICADO CON VISIBILIDAD ASEGURADA
 * 
 * Solución robusta para renderizado 3D visible:
 * - Canvas directo en el contenedor
 * - Modelo del reloj con geometría completa
 * - Materiales dinámicos realistas
 * - Iluminación cinematográfica
 * - Sin dependencias complejas de contexto compartido
 */
export const SimpleConfigurator3D = ({ 
  className = '',
  onReady
}: { 
  className?: string
  onReady?: () => void 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const configuratorStore = useConfiguratorStore()
  
  // Estado del configurador
  const [watchConfig, setWatchConfig] = useState<Configurator3DState>({
    case: {
      material: 'oro_18k',
      color: '#D4AF37',
      size: '42mm',
      thickness: '12mm'
    },
    dial: {
      color: 'blanco',
      style: 'analogo',
      numerals: 'arabigos'
    },
    strap: {
      material: 'cuero',
      color: 'negro',
      style: 'clasico'
    },
    movement: {
      type: 'automatico',
      complications: ['fecha', 'cronografo']
    }
  })
  
  // THREE.js refs
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const watchGroupRef = useRef<any>(null)
  const animationRef = useRef<number>()
  
  // Inicializar THREE.js
  useEffect(() => {
    const initializeThreeJS = async () => {
      if (!canvasRef.current) return
      
      try {
        // Importaciones dinámicas para reducir bundle inicial
        const THREE = await import('three')
        
        console.log('🚀 Inicializando THREE.js simplificado...')
        
        // Configurar escena
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf5f5f4)
        scene.fog = new THREE.Fog(0xf5f5f4, 10, 30)
        sceneRef.current = scene
        
        // Configurar cámara
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const aspect = rect.width / rect.height
        
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
        camera.position.set(0, 3, 6)
        camera.lookAt(0, 0, 0)
        cameraRef.current = camera
        
        // Configurar renderer
        const renderer = new THREE.WebGLRenderer({ 
          canvas,
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false
        })
        
        renderer.setSize(rect.width, rect.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        
        // Configuración cinematográfica
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.0
        renderer.outputColorSpace = THREE.SRGBColorSpace
        
        // Sombras
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.shadowMap.autoUpdate = false
        
        rendererRef.current = renderer
        
        // Configurar luces
        setupLighting(scene, THREE)
        
        // Crear modelo del reloj
        createWatchModel(scene, watchConfig, THREE)
        
        // Iniciar animación
        startAnimation()
        
        setIsInitialized(true)
        onReady?.()
        
        console.log('✅ THREE.js inicializado correctamente')
        
      } catch (error) {
        console.error('❌ Error inicializando THREE.js:', error)
      }
    }
    
    initializeThreeJS()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Cleanup
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      if (sceneRef.current) {
        sceneRef.current.clear()
      }
    }
  }, [])
  
  // Configurar iluminación cinematográfica
  const setupLighting = (scene: any, THREE: any) => {
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
  
  // Crear modelo completo del reloj
  const createWatchModel = async (scene: any, config: Configurator3DState, THREE: any) => {
    // Limpiar modelo anterior
    if (watchGroupRef.current) {
      scene.remove(watchGroupRef.current)
    }
    
    const watchGroup = new THREE.Group()
    
    // Materiales dinámicos basados en configuración
    const caseMaterial = new THREE.MeshStandardMaterial({
      color: config.case.color,
      metalness: config.case.material === 'oro_18k' ? 1.0 : 
                 config.case.material === 'acero_inoxidable' ? 1.0 : 0.9,
      roughness: config.case.material === 'oro_18k' ? 0.15 : 
                 config.case.material === 'acero_inoxidable' ? 0.25 : 0.35
    })
    
    // Cuerpo principal del reloj
    const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 64)
    const bodyMesh = new THREE.Mesh(bodyGeometry, caseMaterial)
    bodyMesh.castShadow = true
    bodyMesh.receiveShadow = true
    watchGroup.add(bodyMesh)
    
    // Cristal del reloj
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      thickness: 0.1,
      roughness: 0.1,
      ior: 1.77,
      transparent: true
    })
    
    const crystalGeometry = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 64)
    const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial)
    crystalMesh.position.y = 0.175
    crystalMesh.castShadow = true
    watchGroup.add(crystalMesh)
    
    // Esfera del reloj
    const dialGeometry = new THREE.CylinderGeometry(1.35, 1.35, 0.02, 64)
    const dialColors: Record<string, number> = {
      'blanco': 0xffffff,
      'negro': 0x000000,
      'azul': 0x1e40af,
      'plateado': 0xe5e7eb
    }
    
    const dialMaterial = new THREE.MeshStandardMaterial({
      color: dialColors[config.dial.color] || 0xffffff,
      metalness: 0.1,
      roughness: 0.8
    })
    
    const dialMesh = new THREE.Mesh(dialGeometry, dialMaterial)
    dialMesh.position.y = 0.11
    dialMesh.castShadow = true
    watchGroup.add(dialMesh)
    
    // Marcadores de hora (12 marcadores)
    const markerGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.02)
    const markerMaterial = new THREE.MeshStandardMaterial({ 
      color: config.case.material === 'oro_18k' ? 0x8B4513 : 0x333333 
    })
    
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6
      const x = Math.cos(angle) * 1.2
      const z = Math.sin(angle) * 1.2
      
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.set(x, 0.13, z)
      marker.rotation.y = angle
      watchGroup.add(marker)
    }
    
    // Corona giratoria
    const crownGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 32)
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: caseMaterial.color,
      metalness: 1.0,
      roughness: 0.1
    })
    
    const crownMesh = new THREE.Mesh(crownGeometry, crownMaterial)
    crownMesh.position.set(1.8, 0, 0)
    crownMesh.rotation.z = Math.PI / 2
    crownMesh.castShadow = true
    watchGroup.add(crownMesh)
    
    // Posicionar el grupo del reloj
    watchGroup.position.y = 0
    watchGroup.rotation.y = Math.PI / 6
    
    // Añadir al grupo y referencia
    scene.add(watchGroup)
    watchGroupRef.current = watchGroup
    
    console.log('🎯 Modelo de reloj creado con configuración:', {
      case: config.case,
      dial: config.dial
    })
  }
  
  // Bucle de animación
  const startAnimation = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return
    
    const animate = () => {
      // Rotación suave del reloj
      if (watchGroupRef.current) {
        watchGroupRef.current.rotation.y += 0.005
      }
      
      // Renderizar
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
  }
  
  // Manejar cambios de configuración
  const handleConfigChange = (section: string, property: string, value: any) => {
    setWatchConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof Configurator3DState],
        [property]: value
      }
    }))
    
    // Recrear modelo con nueva configuración
    if (sceneRef.current && rendererRef.current) {
      import('three').then(THREE => {
        createWatchModel(sceneRef.current, {
          ...watchConfig,
          [section]: {
            ...watchConfig[section as keyof Configurator3DState],
            [property]: value
          }
        }, THREE)
      })
    }
  }
  
  // Ajustar tamaño cuando cambie el contenedor
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
  
  // Renderizar controles
  const renderConfigControls = () => (
    <div className="config-controls p-4 space-y-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Personaliza tu Reloj</h3>
      
      {/* Caso */}
      <div className="control-section">
        <h4 className="font-medium mb-2 text-gray-700">Caso</h4>
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={watchConfig.case.material}
            onChange={(e) => handleConfigChange('case', 'material', e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="oro_18k">Oro 18K</option>
            <option value="acero_inoxidable">Acero Inoxidable</option>
            <option value="titanio">Titanio</option>
          </select>
          <select 
            value={watchConfig.case.size}
            onChange={(e) => handleConfigChange('case', 'size', e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="38mm">38mm</option>
            <option value="42mm">42mm</option>
            <option value="44mm">44mm</option>
          </select>
        </div>
      </div>
      
      {/* Esfera */}
      <div className="control-section">
        <h4 className="font-medium mb-2 text-gray-700">Esfera</h4>
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={watchConfig.dial.color}
            onChange={(e) => handleConfigChange('dial', 'color', e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="blanco">Blanco</option>
            <option value="negro">Negro</option>
            <option value="azul">Azul</option>
            <option value="plateado">Plateado</option>
          </select>
          <select 
            value={watchConfig.dial.style}
            onChange={(e) => handleConfigChange('dial', 'style', e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="analogo">Analógico</option>
            <option value="digital">Digital</option>
            <option value="híbrido">Híbrido</option>
          </select>
        </div>
      </div>
    </div>
  )
  
  if (!isInitialized) {
    return (
      <div className={`simple-configurator-3d ${className} h-full flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando Renderizado 3D...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`simple-configurator-3d ${className} relative h-full overflow-hidden`}>
      {/* Canvas 3D directo */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          display: 'block',
          background: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)'
        }}
      />
      
      {/* Controles posicionados */}
      <div className="absolute top-4 right-4 z-10">
        {renderConfigControls()}
      </div>
      
      {/* Indicador de estado */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          ✅ Renderizado 3D Activo
        </div>
      </div>
      
      {/* Información de configuración */}
      <div className="absolute bottom-4 right-4 z-10 max-w-xs">
        <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
          <div className="font-semibold mb-2">Configuración Actual:</div>
          <div className="space-y-1">
            <div>Caso: {watchConfig.case.material}</div>
            <div>Esfera: {watchConfig.dial.color}</div>
            <div>Tamaño: {watchConfig.case.size}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleConfigurator3D
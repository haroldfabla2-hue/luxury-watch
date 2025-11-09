/**
 * GENERADOR DE IMÁGENES ESTÁTICAS PARA SSR
 * 
 * Genera imágenes pregeneradas del reloj en 8 ángulos
 * Para usar en el nivel 3 (SSR Fallback) sin necesidad de edge function
 */

import * as THREE from 'three'
import { WatchConfiguration } from '../store/configuratorStore'

interface SSRImageOptions {
  width: number
  height: number
  angle: number
  configuration: WatchConfiguration
}

export class SSRImageGenerator {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private watch: THREE.Group

  constructor() {
    // Inicializar Three.js para renderizado offscreen
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true 
    })
    
    this.camera.position.set(0, 0, 8)
    this.watch = new THREE.Group()
    this.scene.add(this.watch)
    
    this.setupLighting()
  }

  private setupLighting() {
    // Iluminación profesional para fotografía de relojes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    // Key light (principal)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(5, 5, 5)
    this.scene.add(keyLight)

    // Fill light (relleno)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-5, 0, 5)
    this.scene.add(fillLight)

    // Rim light (contorno)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8)
    rimLight.position.set(0, 5, -5)
    this.scene.add(rimLight)
  }

  private createWatchModel(config: WatchConfiguration) {
    // Limpiar modelo anterior
    while (this.watch.children.length > 0) {
      this.watch.remove(this.watch.children[0])
    }

    // Caja del reloj
    const caseGeometry = new THREE.CylinderGeometry(2, 2, 0.8, 64)
    const caseMaterial = new THREE.MeshStandardMaterial({
      color: config.material?.color_hex || '#C0C0C0',
      metalness: 0.9,
      roughness: 0.1,
    })
    const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial)
    caseMesh.rotation.x = Math.PI / 2
    this.watch.add(caseMesh)

    // Bisel
    const bezelGeometry = new THREE.TorusGeometry(2.1, 0.15, 16, 64)
    const bezelMesh = new THREE.Mesh(bezelGeometry, caseMaterial)
    this.watch.add(bezelMesh)

    // Esfera
    const dialGeometry = new THREE.CircleGeometry(1.8, 64)
    const dialMaterial = new THREE.MeshStandardMaterial({
      color: config.dial?.color_hex || '#000080',
      metalness: 0.3,
      roughness: 0.5,
    })
    const dialMesh = new THREE.Mesh(dialGeometry, dialMaterial)
    dialMesh.position.z = 0.41
    this.watch.add(dialMesh)

    // Cristal de zafiro
    const crystalGeometry = new THREE.CircleGeometry(2.05, 64)
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.1,
      metalness: 0,
      roughness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      ior: 1.77, // Índice de refracción del zafiro
    })
    const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial)
    crystalMesh.position.z = 0.45
    this.watch.add(crystalMesh)

    // Marcadores horarios (12 marcadores)
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6
      const radius = 1.5
      const markerGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.05)
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: config.hands?.color || '#FFFFFF',
        metalness: 0.9,
        roughness: 0.1,
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.x = Math.sin(angle) * radius
      marker.position.y = Math.cos(angle) * radius
      marker.position.z = 0.42
      this.watch.add(marker)
    }

    // Manecillas
    this.createHands(config)

    // Corona
    const crownGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16)
    const crownMesh = new THREE.Mesh(crownGeometry, caseMaterial)
    crownMesh.position.set(2.2, 0, 0)
    crownMesh.rotation.z = Math.PI / 2
    this.watch.add(crownMesh)
  }

  private createHands(config: WatchConfiguration) {
    const handsMaterial = new THREE.MeshStandardMaterial({
      color: config.hands?.color || '#FFFFFF',
      metalness: 0.9,
      roughness: 0.1,
    })

    // Manecilla de hora
    const hourGeometry = new THREE.BoxGeometry(0.08, 1.0, 0.05)
    const hourHand = new THREE.Mesh(hourGeometry, handsMaterial)
    hourHand.position.set(0, 0.5, 0.43)
    hourHand.rotation.z = Math.PI / 6 // 10:10 posición
    this.watch.add(hourHand)

    // Manecilla de minuto
    const minuteGeometry = new THREE.BoxGeometry(0.06, 1.4, 0.05)
    const minuteHand = new THREE.Mesh(minuteGeometry, handsMaterial)
    minuteHand.position.set(0, 0.7, 0.44)
    minuteHand.rotation.z = Math.PI / 12
    this.watch.add(minuteHand)

    // Manecilla de segundo
    const secondGeometry = new THREE.BoxGeometry(0.03, 1.6, 0.05)
    const secondMaterial = new THREE.MeshStandardMaterial({
      color: '#FF0000',
      metalness: 0.8,
      roughness: 0.2,
    })
    const secondHand = new THREE.Mesh(secondGeometry, secondMaterial)
    secondHand.position.set(0, 0.8, 0.45)
    this.watch.add(secondHand)
  }

  public generateImage(options: SSRImageOptions): string {
    const { width, height, angle, configuration } = options

    // Configurar tamaño del renderer
    this.renderer.setSize(width, height)
    
    // Crear modelo del reloj
    this.createWatchModel(configuration)
    
    // Aplicar rotación según el ángulo
    this.watch.rotation.y = (angle * Math.PI) / 180
    
    // Renderizar escena
    this.renderer.render(this.scene, this.camera)
    
    // Obtener imagen como Data URL
    const dataURL = this.renderer.domElement.toDataURL('image/png')
    
    return dataURL
  }

  public generateAllAngles(configuration: WatchConfiguration): Map<number, string> {
    const images = new Map<number, string>()
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]
    
    angles.forEach(angle => {
      const imageDataURL = this.generateImage({
        width: 800,
        height: 800,
        angle,
        configuration
      })
      images.set(angle, imageDataURL)
    })
    
    return images
  }

  public dispose() {
    this.renderer.dispose()
  }
}

// Función helper para generar y guardar imágenes
export function generateSSRImagesForConfig(config: WatchConfiguration): Map<number, string> {
  const generator = new SSRImageGenerator()
  const images = generator.generateAllAngles(config)
  generator.dispose()
  return images
}

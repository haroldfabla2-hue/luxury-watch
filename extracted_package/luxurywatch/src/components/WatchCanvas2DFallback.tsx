/**
 * CONFIGURADOR 2D FALLBACK SIN GPU
 * 
 * Renderizador 3D por software para dispositivos sin WebGL
 * Implementa wireframe, flat shading y rotación básica
 * 
 * Capacidades:
 * - Proyección 3D en Canvas 2D
 * - Wireframe rendering con backface culling
 * - Rotación manual 360°
 * - Zoom básico
 * - Modelos simplificados (baja poligonización)
 * - UI consistente con versión WebGL
 * 
 * Basado en investigación: docs/alternativas_3d_sin_gpu.md
 */

import { useEffect, useRef, useState } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'

interface Point3D {
  x: number
  y: number
  z: number
}

interface Point2D {
  x: number
  y: number
}

interface Face {
  vertices: number[]
  color: string
}

interface WatchModel {
  vertices: Point3D[]
  faces: Face[]
}

const WatchCanvas2DFallback = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const { currentConfiguration } = useConfiguratorStore()
  const animationFrameRef = useRef<number>()

  // Colores del material seleccionado
  const getMaterialColor = (type: string): string => {
    if (type.includes('Oro')) return '#FFD700'
    if (type.includes('Titanio')) return '#8E8E8E'
    if (type.includes('Acero')) return '#C0C0C0'
    return '#E8E8E8'
  }

  const getDialColor = (type: string): string => {
    if (type.includes('Azul')) return '#1E40AF'
    if (type.includes('Negra')) return '#0A0A0A'
    if (type.includes('Blanca')) return '#E5E5E5'
    if (type.includes('Verde')) return '#14532D'
    if (type.includes('Roja')) return '#991B1B'
    return '#E5E5E5'
  }

  const getStrapColor = (type: string): string => {
    if (type.includes('Negro')) return '#0A0A0A'
    if (type.includes('Marrón')) return '#8B4513'
    if (type.includes('Azul')) return '#1E40AF'
    if (type.includes('Verde')) return '#14532D'
    if (type.includes('Metal')) return '#C0C0C0'
    return '#0A0A0A'
  }

  // Crear modelo 3D simplificado del reloj
  const createSimplifiedWatch = (): WatchModel => {
    const materialColor = getMaterialColor(currentConfiguration.material?.name || '')
    const dialColor = getDialColor(currentConfiguration.dial?.name || '')
    const strapColor = getStrapColor(currentConfiguration.strap?.name || '')

    const vertices: Point3D[] = []
    const faces: Face[] = []

    // Caja del reloj (cilindro simplificado con 16 segmentos)
    const caseRadius = 1.2
    const caseHeight = 0.6
    const segments = 16

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      // Parte superior del cilindro
      vertices.push({
        x: Math.cos(angle) * caseRadius,
        y: caseHeight / 2,
        z: Math.sin(angle) * caseRadius
      })
      // Parte inferior del cilindro
      vertices.push({
        x: Math.cos(angle) * caseRadius,
        y: -caseHeight / 2,
        z: Math.sin(angle) * caseRadius
      })
    }

    // Caras del cilindro (caja del reloj)
    for (let i = 0; i < segments; i++) {
      const topCurrent = i * 2
      const bottomCurrent = i * 2 + 1
      const topNext = ((i + 1) % segments) * 2
      const bottomNext = ((i + 1) % segments) * 2 + 1

      // Cara lateral (quad dividida en 2 triángulos)
      faces.push({
        vertices: [topCurrent, bottomCurrent, topNext],
        color: materialColor
      })
      faces.push({
        vertices: [bottomCurrent, bottomNext, topNext],
        color: materialColor
      })
    }

    // Esfera del reloj (disco frontal)
    const dialRadius = 1.15
    const dialVertexStart = vertices.length
    vertices.push({ x: 0, y: caseHeight / 2 + 0.01, z: 0 }) // Centro

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      vertices.push({
        x: Math.cos(angle) * dialRadius,
        y: caseHeight / 2 + 0.01,
        z: Math.sin(angle) * dialRadius
      })
    }

    for (let i = 0; i < segments; i++) {
      faces.push({
        vertices: [dialVertexStart, dialVertexStart + i + 1, dialVertexStart + i + 2],
        color: dialColor
      })
    }

    // Corona del reloj (cubo pequeño)
    const crownSize = 0.12
    const crownVertexStart = vertices.length
    const crownPosition = { x: 1.35, y: 0, z: 0 }

    // 8 vértices del cubo
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          vertices.push({
            x: crownPosition.x + (x - 0.5) * crownSize,
            y: crownPosition.y + (y - 0.5) * crownSize * 2,
            z: crownPosition.z + (z - 0.5) * crownSize
          })
        }
      }
    }

    // 6 caras del cubo (corona)
    const cubeColor = materialColor
    faces.push(
      { vertices: [crownVertexStart + 0, crownVertexStart + 1, crownVertexStart + 3], color: cubeColor },
      { vertices: [crownVertexStart + 0, crownVertexStart + 3, crownVertexStart + 2], color: cubeColor },
      { vertices: [crownVertexStart + 4, crownVertexStart + 6, crownVertexStart + 7], color: cubeColor },
      { vertices: [crownVertexStart + 4, crownVertexStart + 7, crownVertexStart + 5], color: cubeColor },
      { vertices: [crownVertexStart + 0, crownVertexStart + 4, crownVertexStart + 5], color: cubeColor },
      { vertices: [crownVertexStart + 0, crownVertexStart + 5, crownVertexStart + 1], color: cubeColor }
    )

    // Correas (barras simples)
    const strapWidth = 0.65
    const strapHeight = 0.09
    const strapLength = 0.8

    // Correa superior
    const strapTopStart = vertices.length
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          vertices.push({
            x: (x - 0.5) * strapWidth,
            y: -caseHeight / 2 - (y) * strapLength,
            z: (z - 0.5) * strapHeight
          })
        }
      }
    }

    for (let i = 0; i < 6; i++) {
      faces.push({
        vertices: [strapTopStart + i * 4, strapTopStart + i * 4 + 1, strapTopStart + i * 4 + 2],
        color: strapColor
      })
    }

    // Correa inferior
    const strapBottomStart = vertices.length
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          vertices.push({
            x: (x - 0.5) * strapWidth,
            y: caseHeight / 2 + (y) * strapLength,
            z: (z - 0.5) * strapHeight
          })
        }
      }
    }

    for (let i = 0; i < 6; i++) {
      faces.push({
        vertices: [strapBottomStart + i * 4, strapBottomStart + i * 4 + 1, strapBottomStart + i * 4 + 2],
        color: strapColor
      })
    }

    return { vertices, faces }
  }

  // Proyección 3D → 2D (perspectiva simple)
  const project = (point: Point3D, rotation: { x: number; y: number }, zoom: number, canvas: HTMLCanvasElement): Point2D => {
    // Aplicar rotación
    let { x, y, z } = point

    // Rotación Y (horizontal)
    const cosY = Math.cos(rotation.y)
    const sinY = Math.sin(rotation.y)
    const x1 = x * cosY - z * sinY
    const z1 = x * sinY + z * cosY

    // Rotación X (vertical)
    const cosX = Math.cos(rotation.x)
    const sinX = Math.sin(rotation.x)
    const y1 = y * cosX - z1 * sinX
    const z2 = y * sinX + z1 * cosX

    // Proyección perspectiva
    const distance = 8
    const scale = (distance / (distance + z2)) * 150 * zoom

    return {
      x: canvas.width / 2 + x1 * scale,
      y: canvas.height / 2 - y1 * scale
    }
  }

  // Backface culling (detectar si la cara está visible)
  const isFaceVisible = (face: Face, vertices: Point3D[], rotation: { x: number; y: number }): boolean => {
    const v0 = vertices[face.vertices[0]]
    const v1 = vertices[face.vertices[1]]
    const v2 = vertices[face.vertices[2]]

    // Aplicar rotación a los vértices
    const rotate = (p: Point3D) => {
      let { x, y, z } = p

      // Rotación Y
      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)
      const x1 = x * cosY - z * sinY
      const z1 = x * sinY + z * cosY

      // Rotación X
      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX

      return { x: x1, y: y1, z: z2 }
    }

    const rv0 = rotate(v0)
    const rv1 = rotate(v1)
    const rv2 = rotate(v2)

    // Calcular normal de la cara
    const u = { x: rv1.x - rv0.x, y: rv1.y - rv0.y, z: rv1.z - rv0.z }
    const v = { x: rv2.x - rv0.x, y: rv2.y - rv0.y, z: rv2.z - rv0.z }

    const normal = {
      x: u.y * v.z - u.z * v.y,
      y: u.z * v.x - u.x * v.z,
      z: u.x * v.y - u.y * v.x
    }

    // Producto punto con vector de cámara (0, 0, -1)
    return normal.z < 0
  }

  // Renderizar modelo
  const render = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.fillStyle = '#F5F5F5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const model = createSimplifiedWatch()

    // Renderizar caras (flat shading)
    model.faces.forEach(face => {
      if (!isFaceVisible(face, model.vertices, rotation)) return

      const points = face.vertices.map(vi => project(model.vertices[vi], rotation, zoom, canvas))

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.closePath()

      // Calcular profundidad promedio para sombreado
      const avgZ = face.vertices.reduce((sum, vi) => sum + model.vertices[vi].z, 0) / face.vertices.length
      const brightness = Math.max(0.3, Math.min(1, (avgZ + 2) / 4))

      // Aplicar color con sombreado
      const colorHex = face.color
      const r = parseInt(colorHex.slice(1, 3), 16)
      const g = parseInt(colorHex.slice(3, 5), 16)
      const b = parseInt(colorHex.slice(5, 7), 16)

      ctx.fillStyle = `rgb(${r * brightness}, ${g * brightness}, ${b * brightness})`
      ctx.fill()

      // Wireframe
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    })

    animationFrameRef.current = requestAnimationFrame(render)
  }

  // Manejo de eventos de mouse/touch
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setLastMousePos({ x: clientX, y: clientY })
  }

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const deltaX = clientX - lastMousePos.x
    const deltaY = clientY - lastMousePos.y

    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }))

    setLastMousePos({ x: clientX, y: clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)))
  }

  // Actualizar canvas cuando cambia configuración
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Ajustar tamaño del canvas
    const updateSize = () => {
      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    // Iniciar renderizado
    render()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [rotation, zoom, currentConfiguration])

  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Controles informativos */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-md shadow-lg text-sm text-neutral-700 max-w-xs">
        <p className="font-semibold mb-2 text-blue-700">Modo 2D Fallback:</p>
        <ul className="space-y-1 text-xs">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Click y arrastra para rotar</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Scroll para zoom</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span>Renderizado por software (sin GPU)</span>
          </li>
        </ul>
      </div>

      {/* Badge de tecnología */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wide">
        Canvas 2D
      </div>
    </div>
  )
}

export default WatchCanvas2DFallback

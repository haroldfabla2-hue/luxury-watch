import React, { useState, useEffect, useRef } from 'react'
import { WatchConfiguration } from '../store/configuratorStore'
import { 
  getRenderPath, 
  getAvailableAngles, 
  getPreloadPaths,
  isAngleAvailable,
  ViewAngle 
} from '../utils/renderMapping'
import { usePreloadedImages } from '../hooks/usePreloadedImages'

interface PreRenderedWatchViewerProps {
  configuration: WatchConfiguration
  className?: string
}

const PreRenderedWatchViewer: React.FC<PreRenderedWatchViewerProps> = ({
  configuration,
  className = ''
}) => {
  const [currentAngle, setCurrentAngle] = useState<ViewAngle>('frontal')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Precargar todas las imágenes disponibles para la configuración actual
  const preloadPaths = getPreloadPaths(configuration)
  const { images, isLoading, preloadImages } = usePreloadedImages(preloadPaths)

  // Obtener path de la imagen actual
  const currentRender = getRenderPath(configuration, currentAngle)
  const availableAngles = getAvailableAngles(configuration)

  // Precargar imágenes cuando cambia la configuración
  useEffect(() => {
    const paths = getPreloadPaths(configuration)
    preloadImages(paths)
  }, [configuration, preloadImages])

  // Reset zoom y pan cuando cambia la configuración
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [configuration])

  // Cambiar ángulo con transición
  const changeAngle = (angle: ViewAngle) => {
    if (!isAngleAvailable(configuration, angle)) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentAngle(angle)
      setIsTransitioning(false)
    }, 150)
  }

  // Manejo de zoom con rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(1, Math.min(5, prev + delta)))
  }

  // Inicio de arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  // Arrastre
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  // Fin de arrastre
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Reset de vista
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setCurrentAngle('frontal')
  }

  // Botones de ángulo
  const angleButtons: { angle: ViewAngle; label: string; icon: string }[] = [
    { angle: 'frontal', label: 'Frontal', icon: '●' },
    { angle: 'lateral', label: 'Lateral', icon: '◐' },
    { angle: '3quart', label: '3/4', icon: '◑' },
    { angle: 'top', label: 'Superior', icon: '◎' },
    { angle: 'back', label: 'Trasera', icon: '○' },
  ]

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Visor de imagen */}
      <div
        ref={containerRef}
        className="relative w-full h-[600px] bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl overflow-hidden cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Imagen del reloj */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <img
            src={currentRender.path}
            alt="Vista del reloj personalizado"
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
            onError={(e) => {
              // Fallback si la imagen no carga
              if (currentRender.fallback) {
                (e.target as HTMLImageElement).src = currentRender.fallback
              }
            }}
          />
        </div>

        {/* Indicador de carga */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/10 backdrop-blur-sm">
            <div className="bg-white rounded-xl px-6 py-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-neutral-700 font-medium">Cargando vista...</span>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de zoom */}
        {zoom > 1 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
            <span className="text-sm font-medium text-neutral-700">
              Zoom: {zoom.toFixed(1)}x
            </span>
          </div>
        )}
      </div>

      {/* Controles de ángulo */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {angleButtons.map(({ angle, label, icon }) => {
          const available = isAngleAvailable(configuration, angle)
          const active = currentAngle === angle
          
          return (
            <button
              key={angle}
              onClick={() => changeAngle(angle)}
              disabled={!available}
              className={`
                px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                flex items-center space-x-2
                ${active 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                  : available
                    ? 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-50'
                }
              `}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Controles de zoom */}
      <div className="mt-4 flex items-center justify-center space-x-3">
        <button
          onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
          disabled={zoom <= 1}
          className="p-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Alejar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>

        <div className="flex-1 max-w-xs">
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>

        <button
          onClick={() => setZoom(prev => Math.min(5, prev + 0.5))}
          disabled={zoom >= 5}
          className="p-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Acercar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>

        <button
          onClick={resetView}
          className="p-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
          title="Resetear vista"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Instrucciones */}
      <div className="mt-4 text-center text-sm text-neutral-500">
        <p>Usa la rueda del mouse para hacer zoom • Arrastra para mover la imagen</p>
      </div>
    </div>
  )
}

export default PreRenderedWatchViewer

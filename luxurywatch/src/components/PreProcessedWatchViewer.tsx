/**
 * VISOR DE RENDERS PRE-PROCESADOS ULTRAREALISTAS
 * 
 * Componente que muestra renders fotorrealistas de alta calidad
 * con controles para cambiar ángulos de vista y aplicar variaciones.
 * 
 * Características:
 * - Carga instantánea de imágenes pre-renderizadas
 * - Múltiples ángulos de vista (frontal, 3/4, lateral, trasera)
 * - Variaciones de color mediante filtros CSS (no re-renderizado)
 * - Zoom y controles de visualización
 * - Sin dependencia de WebGL/Three.js
 */

import { useState } from 'react'
import { RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PreProcessedRender } from '../data/preProcessedRenders'

interface PreProcessedWatchViewerProps {
  render: PreProcessedRender
  className?: string
  onVariationChange?: (variation: ColorVariation) => void
}

export type ViewAngle = 'frontal' | 'threequarter' | 'lateral' | 'back'

export interface ColorVariation {
  name: string
  filter: string // CSS filter
}

// Variaciones de color mediante filtros CSS (sin re-renderizado)
const COLOR_VARIATIONS: ColorVariation[] = [
  { name: 'Original', filter: 'none' },
  { name: 'Más cálido', filter: 'sepia(0.15) saturate(1.2)' },
  { name: 'Más frío', filter: 'hue-rotate(10deg) saturate(0.9)' },
  { name: 'Alto contraste', filter: 'contrast(1.15) brightness(1.05)' },
  { name: 'Suave', filter: 'contrast(0.9) brightness(1.1)' },
  { name: 'Vintage', filter: 'sepia(0.3) contrast(0.95)' },
]

export default function PreProcessedWatchViewer({ 
  render, 
  className = '',
  onVariationChange 
}: PreProcessedWatchViewerProps) {
  // Estado de visualización
  const [currentAngle, setCurrentAngle] = useState<ViewAngle>('frontal')
  const [currentVariation, setCurrentVariation] = useState<ColorVariation>(COLOR_VARIATIONS[0])
  const [zoom, setZoom] = useState(1)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  
  // Obtener ángulos disponibles
  const availableAngles: ViewAngle[] = Object.keys(render.angles).filter(
    key => render.angles[key as ViewAngle] !== undefined
  ) as ViewAngle[]
  
  const currentImageUrl = render.angles[currentAngle]
  
  // Nombres de ángulos en español
  const angleNames: Record<ViewAngle, string> = {
    frontal: 'Frontal',
    threequarter: '3/4',
    lateral: 'Lateral',
    back: 'Trasera',
  }
  
  // Cambiar ángulo
  const handleAngleChange = (angle: ViewAngle) => {
    if (render.angles[angle]) {
      setCurrentAngle(angle)
      setIsImageLoaded(false)
    }
  }
  
  // Navegar entre ángulos
  const handlePreviousAngle = () => {
    const currentIndex = availableAngles.indexOf(currentAngle)
    const previousIndex = (currentIndex - 1 + availableAngles.length) % availableAngles.length
    handleAngleChange(availableAngles[previousIndex])
  }
  
  const handleNextAngle = () => {
    const currentIndex = availableAngles.indexOf(currentAngle)
    const nextIndex = (currentIndex + 1) % availableAngles.length
    handleAngleChange(availableAngles[nextIndex])
  }
  
  // Cambiar variación de color
  const handleVariationChange = (variation: ColorVariation) => {
    setCurrentVariation(variation)
    if (onVariationChange) {
      onVariationChange(variation)
    }
  }
  
  // Controles de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleResetZoom = () => setZoom(1)
  
  return (
    <div className={`relative ${className}`}>
      {/* Visor principal */}
      <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl overflow-hidden shadow-xl aspect-square">
        {/* Imagen del reloj */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={currentImageUrl}
            alt={`${render.name} - ${angleNames[currentAngle]}`}
            className="w-full h-full object-contain transition-all duration-300 ease-out"
            style={{
              transform: `scale(${zoom})`,
              filter: currentVariation.filter,
            }}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
        
        {/* Controles de navegación de ángulos (overlay) */}
        {availableAngles.length > 1 && (
          <>
            <button
              onClick={handlePreviousAngle}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
              aria-label="Ángulo anterior"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-800" />
            </button>
            <button
              onClick={handleNextAngle}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
              aria-label="Ángulo siguiente"
            >
              <ChevronRight className="w-6 h-6 text-neutral-800" />
            </button>
          </>
        )}
        
        {/* Indicador de ángulo actual */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
          <p className="text-sm font-medium text-neutral-800">
            {angleNames[currentAngle]}
          </p>
        </div>
        
        {/* Controles de zoom */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Acercar"
          >
            <ZoomIn className="w-5 h-5 text-neutral-800" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all"
            aria-label="Restablecer zoom"
          >
            <RotateCcw className="w-5 h-5 text-neutral-800" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Alejar"
          >
            <ZoomOut className="w-5 h-5 text-neutral-800" />
          </button>
        </div>
      </div>
      
      {/* Selector de ángulos */}
      {availableAngles.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {availableAngles.map(angle => (
            <button
              key={angle}
              onClick={() => handleAngleChange(angle)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentAngle === angle
                  ? 'bg-[#D4AF37] text-white shadow-lg'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              {angleNames[angle]}
            </button>
          ))}
        </div>
      )}
      
      {/* Variaciones de color */}
      <div className="mt-4">
        <p className="text-sm font-medium text-neutral-600 mb-2">Variación de tono</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_VARIATIONS.map(variation => (
            <button
              key={variation.name}
              onClick={() => handleVariationChange(variation)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                currentVariation.name === variation.name
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              {variation.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Información técnica */}
      <div className="mt-4 p-4 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-neutral-500 font-medium">Material</p>
            <p className="text-neutral-900 capitalize">{render.material}</p>
          </div>
          <div>
            <p className="text-neutral-500 font-medium">Estilo</p>
            <p className="text-neutral-900 capitalize">{render.style}</p>
          </div>
          <div>
            <p className="text-neutral-500 font-medium">Esfera</p>
            <p className="text-neutral-900 capitalize">{render.dialColor}</p>
          </div>
          <div>
            <p className="text-neutral-500 font-medium">Correa</p>
            <p className="text-neutral-900 capitalize">{render.strapType}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

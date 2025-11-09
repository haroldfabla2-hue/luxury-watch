/**
 * CONFIGURADOR SSR FALLBACK
 * 
 * Genera imágenes fotorrealistas localmente usando Three.js
 * Para máxima compatibilidad sin WebGL en canvas principal
 * 
 * Características:
 * - Generación de imágenes en segundo plano
 * - Sin necesidad de servidor/edge function
 * - Rotación mediante imágenes pregeneradas
 * - UI consistente con otras versiones
 * - Caché de imágenes en memoria
 * 
 * Basado en investigación: docs/alternativas_3d_sin_gpu.md
 */

import { useEffect, useState, useRef } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'
import { generateSSRImagesForConfig } from '../utils/generateSSRImages'

interface SSRImageConfig {
  angle: number
  dataURL: string
  loaded: boolean
}

const WatchSSRFallback = () => {
  const { currentConfiguration } = useConfiguratorStore()
  const [currentAngle, setCurrentAngle] = useState(0)
  const [images, setImages] = useState<SSRImageConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const generatorRef = useRef<boolean>(false)

  // Ángulos disponibles (8 vistas: 45° cada una)
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]

  // Generar imágenes SSR en segundo plano
  useEffect(() => {
    // Prevenir generación múltiple simultánea
    if (generatorRef.current) return
    generatorRef.current = true

    setIsLoading(true)
    setError(null)

    // Usar setTimeout para no bloquear el render principal
    setTimeout(() => {
      try {
        const generatedImages = generateSSRImagesForConfig(currentConfiguration)
        
        const imageConfigs: SSRImageConfig[] = angles.map(angle => ({
          angle,
          dataURL: generatedImages.get(angle) || '',
          loaded: true
        }))

        setImages(imageConfigs)
        setIsLoading(false)
      } catch (err) {
        console.error('Error generando imágenes SSR:', err)
        setError('No se pudieron generar las imágenes. Mostrando vista estática.')
        setIsLoading(false)
      } finally {
        generatorRef.current = false
      }
    }, 100)
  }, [currentConfiguration])

  // Rotar vista
  const rotateLeft = () => {
    const currentIndex = angles.indexOf(currentAngle)
    const newIndex = (currentIndex - 1 + angles.length) % angles.length
    setCurrentAngle(angles[newIndex])
  }

  const rotateRight = () => {
    const currentIndex = angles.indexOf(currentAngle)
    const newIndex = (currentIndex + 1) % angles.length
    setCurrentAngle(angles[newIndex])
  }

  const currentImage = images.find(img => img.angle === currentAngle)
  const currentImageDataURL = currentImage?.dataURL || ''

  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal">
      {/* Imagen SSR */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-700 font-medium">Generando vista fotorrealista...</p>
              <p className="text-sm text-neutral-500 mt-2">Renderizado local de alta calidad</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500/90 text-white px-4 py-2 rounded-md shadow-lg text-sm z-20">
            {error}
          </div>
        )}

        {currentImageDataURL && (
          <img
            src={currentImageDataURL}
            alt={`Reloj - Vista ${currentAngle}°`}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
            style={{ opacity: isLoading ? 0 : 1 }}
          />
        )}
      </div>

      {/* Controles de rotación */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
        <button
          onClick={rotateLeft}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors flex items-center justify-center"
          aria-label="Rotar izquierda"
        >
          <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">{currentAngle}°</span>
        </div>

        <button
          onClick={rotateRight}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors flex items-center justify-center"
          aria-label="Rotar derecha"
        >
          <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicador de ángulos disponibles */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {angles.map(angle => (
          <button
            key={angle}
            onClick={() => setCurrentAngle(angle)}
            className={`w-2 h-2 rounded-full transition-all ${
              angle === currentAngle
                ? 'bg-green-500 scale-150'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Vista ${angle}°`}
          />
        ))}
      </div>

      {/* Controles informativos */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-md shadow-lg text-sm text-neutral-700 max-w-xs">
        <p className="font-semibold mb-2 text-green-700">Modo Renderizado Local:</p>
        <ul className="space-y-1 text-xs">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Imágenes generadas localmente</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Calidad fotográfica máxima</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>8 vistas disponibles (45° cada una)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Compatible con cualquier dispositivo</span>
          </li>
        </ul>
      </div>

      {/* Badge de tecnología */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wide">
        Renderizado Local
      </div>

      {/* Indicador de caché */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-lg text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            {images.filter(img => img.loaded).length}/{angles.length} vistas en caché
          </span>
        </div>
      </div>
    </div>
  )
}

export default WatchSSRFallback

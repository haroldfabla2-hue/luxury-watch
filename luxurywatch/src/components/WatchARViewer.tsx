import { useEffect, useRef, useState } from 'react'

interface WatchARViewerProps {
  modelSrc: string
  alt?: string
  poster?: string
  className?: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

/**
 * Componente de Realidad Aumentada para visualizar relojes en el entorno del usuario
 * Utiliza <model-viewer> de Google para soportar AR en iOS (Quick Look) y Android (Scene Viewer)
 */
const WatchARViewer = ({ 
  modelSrc, 
  alt = 'Modelo 3D de reloj personalizado',
  poster,
  className = ''
}: WatchARViewerProps) => {
  const modelViewerRef = useRef<any>(null)
  const [isARSupported, setIsARSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkARSupport = async () => {
      if (modelViewerRef.current) {
        try {
          const supported = await modelViewerRef.current.canActivateAR
          setIsARSupported(supported)
        } catch (err) {
          console.error('Error checking AR support:', err)
          setIsARSupported(false)
        }
      }
    }

    checkARSupport()
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
    console.log('Modelo 3D cargado exitosamente para AR')
  }

  const handleError = (event: any) => {
    setError('Error al cargar el modelo 3D para AR')
    setIsLoading(false)
    console.error('Error loading model:', event)
  }

  const handleARStatus = (event: any) => {
    console.log('AR Status:', event.detail.status)
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <model-viewer
        ref={modelViewerRef}
        src={modelSrc}
        alt={alt}
        poster={poster}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="30deg"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        shadow-softness="0.5"
        camera-orbit="0deg 75deg 2.5m"
        field-of-view="45deg"
        min-camera-orbit="auto auto 1m"
        max-camera-orbit="auto auto 5m"
        interpolation-decay="200"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
        onLoad={handleLoad}
        onError={handleError}
        onARStatus={handleARStatus}
      >
        {/* Botón AR personalizado */}
        <button
          slot="ar-button"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                     bg-gradient-to-r from-gold-500 to-gold-600 
                     text-neutral-900 font-medium px-6 py-3 rounded-sm
                     shadow-lg hover:shadow-xl transition-all duration-300
                     flex items-center space-x-2"
          style={{
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Lato, sans-serif'
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Ver en tu Espacio (AR)</span>
        </button>

        {/* Indicador de carga */}
        {isLoading && (
          <div 
            slot="poster" 
            className="absolute inset-0 flex items-center justify-center bg-neutral-100"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
              <p className="text-neutral-600 text-sm">Cargando modelo 3D...</p>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <div className="text-center p-4">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-neutral-500 text-sm mt-2">
                Por favor, intenta de nuevo más tarde
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de soporte AR */}
        {!isARSupported && !isLoading && !error && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 
                         bg-neutral-800 text-white text-xs px-3 py-2 rounded
                         opacity-90">
            AR no disponible en este dispositivo
          </div>
        )}

        {/* Hotspots interactivos */}
        <button 
          className="hotspot" 
          slot="hotspot-1" 
          data-position="0 0.15 0.03" 
          data-normal="0 0 1"
          data-visibility-attribute="visible"
        >
          <div className="annotation bg-gold-500 text-neutral-900 px-2 py-1 rounded text-xs font-medium">
            Esfera
          </div>
        </button>

        <button 
          className="hotspot" 
          slot="hotspot-2" 
          data-position="0.12 0 0" 
          data-normal="1 0 0"
          data-visibility-attribute="visible"
        >
          <div className="annotation bg-gold-500 text-neutral-900 px-2 py-1 rounded text-xs font-medium">
            Corona
          </div>
        </button>
      </model-viewer>

      {/* Instrucciones para AR */}
      <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm 
                      rounded-sm p-3 shadow-md">
        <h4 className="font-playfair text-sm font-semibold text-neutral-900 mb-1">
          Vista de Realidad Aumentada
        </h4>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Toca "Ver en tu Espacio" para activar AR</li>
          <li>• Mueve tu dispositivo para encontrar una superficie</li>
          <li>• Coloca el reloj y explora desde todos los ángulos</li>
        </ul>
      </div>
    </div>
  )
}

export default WatchARViewer

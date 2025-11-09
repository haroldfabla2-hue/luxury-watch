import { useState, Suspense } from 'react'
import { ShoppingCart, RotateCcw, Save, User, Check, X, Maximize2 } from 'lucide-react'
import CartSidebar from '../components/CartSidebar'
import AuthModal from '../components/AuthModal'
import UnifiedConfigurationOptions from '../components/UnifiedConfigurationOptions'
import WatchARViewer from '../components/WatchARViewer'
import UniversalWatchConfigurator from '../components/UniversalWatchConfigurator'
import { useConfiguratorStore } from '../store/configuratorStore'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import type { DeviceCapabilities } from '../utils/webglDetection'

const ConfiguratorPage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isARModalOpen, setIsARModalOpen] = useState(false)
  const [arModelURL, setArModelURL] = useState<string | null>(null)
  const [isExportingAR, setIsExportingAR] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [detectedLevel, setDetectedLevel] = useState<string | null>(null)
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null)

  const {
    currentConfiguration,
    addToCart,
    resetConfiguration,
    getTotalPrice,
    getCartItemCount,
  } = useConfiguratorStore()

  const { user } = useAuth()
  const totalPrice = getTotalPrice()
  const cartItemCount = getCartItemCount()

  const handleAddToCart = () => {
    addToCart()
    setIsCartOpen(true)
  }

  const handleSaveConfiguration = async () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      const { error } = await supabase.from('user_configurations').insert([
        {
          user_id: user.id,
          configuration: currentConfiguration,
          total_price: totalPrice,
        },
      ])

      if (error) throw error

      setSaveMessage('Configuración guardada exitosamente')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving configuration:', error)
      setSaveMessage('Error al guardar la configuración')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleOpenAR = async () => {
    setIsExportingAR(true)
    try {
      // Nota: En una implementación real, exportaríamos el modelo 3D actual a GLB
      // Por ahora, usaremos una URL de placeholder o modelo pre-generado
      // TODO: Implementar exportación dinámica del modelo Three.js actual
      
      // Placeholder: URL de modelo estático
      // En producción, esto debería ser el modelo exportado dinámicamente
      const placeholderModelURL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
      
      setArModelURL(placeholderModelURL)
      setIsARModalOpen(true)
      
      setSaveMessage('Preparando vista AR...')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (error) {
      console.error('Error al preparar AR:', error)
      setSaveMessage('Error al cargar vista AR')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsExportingAR(false)
    }
  }

  const handleCloseAR = () => {
    setIsARModalOpen(false)
    // Limpiar la URL del modelo si fue creada dinámicamente
    if (arModelURL && arModelURL.startsWith('blob:')) {
      URL.revokeObjectURL(arModelURL)
    }
    setArModelURL(null)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-headline font-bold text-gold-500">
              LuxuryWatch
            </a>

            <div className="flex items-center gap-4">
              {/* User Button */}
              {user ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-md">
                  <User size={20} />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  <User size={20} />
                  <span>Iniciar Sesión</span>
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors"
              >
                <ShoppingCart size={20} />
                <span className="font-medium">Carrito</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-ceramic-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-neutral-900 mb-4">
            Configurador de Reloj Personalizado
          </h1>
          <p className="text-lg text-neutral-700">
            Diseña tu reloj de lujo personalizado. Selecciona materiales, colores y estilos.
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 p-4 bg-gold-100 border border-gold-500 rounded-md text-gold-900 text-center">
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Visual Preview 3D */}
          <div className="lg:sticky lg:top-24 h-fit">
            {/* Visualización 3D Universal con Lazy Loading */}
            <Suspense fallback={
              <div className="relative w-full h-full min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden shadow-modal flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-neutral-800 font-semibold mb-2">Cargando Configurador Universal...</p>
                  <p className="text-sm text-neutral-600">Detectando capacidades de tu dispositivo</p>
                  <p className="text-xs text-gold-600 mt-2">Optimizando experiencia 3D</p>
                </div>
              </div>
            }>
              {/* CONFIGURADOR UNIVERSAL: 3 niveles (WebGL Premium / Canvas 2D / SSR) */}
              <UniversalWatchConfigurator 
                onLevelDetected={(level, caps) => {
                  setDetectedLevel(level)
                  setDeviceCapabilities(caps)
                }}
              />
            </Suspense>

            {/* Indicador de nivel detectado */}
            {detectedLevel && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">
                    Modo: {detectedLevel === 'webgl' ? 'WebGL Premium' : detectedLevel === 'canvas2d' ? 'Canvas 2D' : 'SSR Fotorrealista'}
                  </span>
                </div>
                {deviceCapabilities && (
                  <div className="mt-1 text-xs text-blue-600">
                    Performance: {deviceCapabilities.performance.toUpperCase()} | 
                    WebGL: {deviceCapabilities.webgl ? 'Sí' : 'No'} | 
                    Calidad: {deviceCapabilities.qualityLevel.toUpperCase()}
                  </div>
                )}
              </div>
            )}

            {/* Configuration Summary Card */}
            <div className="mt-6 bg-white rounded-lg p-6 shadow-lg border border-neutral-200">
              <h3 className="font-headline font-bold text-xl mb-4 text-neutral-900">Tu Configuración</h3>
              <div className="space-y-3 text-sm">
                {currentConfiguration.material && (
                  <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded">
                    <Check size={18} className="text-gold-500 flex-shrink-0" />
                    <span><strong className="text-neutral-900">Material:</strong> <span className="text-neutral-700">{currentConfiguration.material.name}</span></span>
                  </div>
                )}
                {currentConfiguration.case && (
                  <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded">
                    <Check size={18} className="text-gold-500 flex-shrink-0" />
                    <span><strong className="text-neutral-900">Caja:</strong> <span className="text-neutral-700">{currentConfiguration.case.name}</span></span>
                  </div>
                )}
                {currentConfiguration.dial && (
                  <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded">
                    <Check size={18} className="text-gold-500 flex-shrink-0" />
                    <span><strong className="text-neutral-900">Esfera:</strong> <span className="text-neutral-700">{currentConfiguration.dial.name}</span></span>
                  </div>
                )}
                {currentConfiguration.hands && (
                  <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded">
                    <Check size={18} className="text-gold-500 flex-shrink-0" />
                    <span><strong className="text-neutral-900">Manecillas:</strong> <span className="text-neutral-700">{currentConfiguration.hands.name}</span></span>
                  </div>
                )}
                {currentConfiguration.strap && (
                  <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded">
                    <Check size={18} className="text-gold-500 flex-shrink-0" />
                    <span><strong className="text-neutral-900">Correa:</strong> <span className="text-neutral-700">{currentConfiguration.strap.name}</span></span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <button
                onClick={handleSaveConfiguration}
                className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-gold-500 text-gold-700 rounded-sm font-medium hover:bg-gold-50 transition-colors"
              >
                <Save size={20} />
                <span className="hidden md:inline">Guardar</span>
              </button>
              <button
                onClick={handleOpenAR}
                disabled={isExportingAR || !currentConfiguration.case}
                className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-blue-500 text-blue-700 rounded-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Maximize2 size={20} />
                <span className="hidden md:inline">Ver AR</span>
              </button>
              <button
                onClick={resetConfiguration}
                className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-neutral-300 text-neutral-700 rounded-sm font-medium hover:bg-neutral-100 transition-colors"
              >
                <RotateCcw size={20} />
                <span className="hidden md:inline">Reiniciar</span>
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!currentConfiguration.case || !currentConfiguration.dial}
              className="w-full mt-4 btn-metallic-gold px-6 py-5 rounded-sm text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Añadir al Carrito - €{totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </button>
          </div>

          {/* Right: Configuration Options */}
          <div>
            <UnifiedConfigurationOptions />
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* AR Modal */}
      {isARModalOpen && arModelURL && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
              <h2 className="text-2xl font-headline font-bold text-white">
                Vista de Realidad Aumentada
              </h2>
              <button
                onClick={handleCloseAR}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* AR Viewer */}
            <WatchARViewer
              modelSrc={arModelURL}
              alt={`Reloj personalizado - ${currentConfiguration.case?.name || 'Configuración actual'}`}
              className="w-full h-full"
            />

            {/* Footer Info */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-white text-lg font-medium mb-2">
                  📱 Disponible en dispositivos móviles con AR
                </p>
                <p className="text-white/80 text-sm">
                  En móviles iOS y Android, pulsa "Ver en tu Espacio" para colocar el reloj en tu entorno real
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfiguratorPage

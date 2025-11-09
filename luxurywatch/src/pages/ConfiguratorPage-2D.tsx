import { useState } from 'react'
import { ShoppingCart, RotateCcw, Save, User, Check } from 'lucide-react'
import CartSidebar from '../components/CartSidebar'
import AuthModal from '../components/AuthModal'
import UnifiedConfigurationOptions from '../components/UnifiedConfigurationOptions'
import { useConfiguratorStore } from '../store/configuratorStore'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const ConfiguratorPage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

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
          {/* Left: Visual Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg p-12 shadow-modal min-h-[600px] flex flex-col items-center justify-center">
              {/* Watch Icon */}
              <div className="w-64 h-64 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-luxury-lg mb-8 relative">
                <div className="absolute inset-0 rounded-full border-8" style={{
                  borderColor: currentConfiguration.case?.color_hex || '#8B9AA6'
                }}></div>
                <div className="w-48 h-48 rounded-full flex items-center justify-center" style={{
                  background: currentConfiguration.dial?.color_hex || '#000000'
                }}>
                  <div className="text-white text-6xl">⌚</div>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 w-full max-w-md">
                <h3 className="font-headline font-bold text-xl mb-4 text-center">Tu Configuración</h3>
                <div className="space-y-2 text-sm">
                  {currentConfiguration.material && (
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-gold-500" />
                      <span><strong>Material:</strong> {currentConfiguration.material.name}</span>
                    </div>
                  )}
                  {currentConfiguration.case && (
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-gold-500" />
                      <span><strong>Caja:</strong> {currentConfiguration.case.name}</span>
                    </div>
                  )}
                  {currentConfiguration.dial && (
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-gold-500" />
                      <span><strong>Esfera:</strong> {currentConfiguration.dial.name}</span>
                    </div>
                  )}
                  {currentConfiguration.hands && (
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-gold-500" />
                      <span><strong>Manecillas:</strong> {currentConfiguration.hands.name}</span>
                    </div>
                  )}
                  {currentConfiguration.strap && (
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-gold-500" />
                      <span><strong>Correa:</strong> {currentConfiguration.strap.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleSaveConfiguration}
                className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gold-500 text-gold-700 rounded-sm font-medium hover:bg-gold-50 transition-colors"
              >
                <Save size={20} />
                Guardar Diseño
              </button>
              <button
                onClick={resetConfiguration}
                className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-neutral-300 text-neutral-700 rounded-sm font-medium hover:bg-neutral-100 transition-colors"
              >
                <RotateCcw size={20} />
                Reiniciar
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
    </div>
  )
}

export default ConfiguratorPage

/**
 * CONFIGURADOR AVANZADO CON OPCIONES COMPLETAS
 * 
 * Página unificada que proporciona personalización completa con:
 * - Todas las opciones de materiales, cajas, esferas, manecillas y correas
 * - Visualización 3D en tiempo real
 * - Integración con carrito y sistema de guardado
 * 
 * Esta página es accesible desde los 3 configuradores:
 * - IA Configurador → Botón "Personalizar más"
 * - Ultra Rápido → Botón "Personalizar más"
 * - CONFIGURADOR 3D → Acceso directo
 */

import { useState, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Save, ArrowLeft, Loader2 } from 'lucide-react'
import Navigation from '../components/Navigation'
import UnifiedConfigurationOptions from '../components/UnifiedConfigurationOptions'
import CartSidebar from '../components/CartSidebar'
import AuthModal from '../components/AuthModal'
import { useConfiguratorStore } from '../store/configuratorStore'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Lazy load del configurador 3D para mejor performance
const WatchConfigurator3DVanilla = lazy(() => import('../components/WatchConfigurator3DVanilla'))

export default function AdvancedConfiguratorPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentConfiguration,
    getTotalPrice,
    getCartItemCount,
    addToCart
  } = useConfiguratorStore()

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const cartItemCount = getCartItemCount()
  const totalPrice = getTotalPrice()

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!currentConfiguration.case || !currentConfiguration.dial) {
      setSaveMessage('Por favor selecciona al menos una caja y una esfera')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    addToCart()
    setSaveMessage('Agregado al carrito exitosamente')
    setTimeout(() => setSaveMessage(''), 3000)
    setIsCartOpen(true)
  }

  // Guardar configuración
  const handleSaveConfiguration = async () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    if (!currentConfiguration.case || !currentConfiguration.dial) {
      setSaveMessage('Por favor selecciona al menos una caja y una esfera')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      setIsSaving(true)
      const { error } = await supabase.from('user_configurations').insert([
        {
          user_id: user.id,
          configuration: {
            material_id: currentConfiguration.material?.id,
            case_id: currentConfiguration.case?.id,
            dial_id: currentConfiguration.dial?.id,
            hands_id: currentConfiguration.hands?.id,
            strap_id: currentConfiguration.strap?.id,
          },
          total_price: totalPrice,
        },
      ])

      if (error) throw error

      setSaveMessage('Configuración guardada exitosamente')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      setSaveMessage('Error al guardar la configuración')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                  Configurador Avanzado
                </h1>
                <p className="text-lg text-neutral-600">
                  Personalización completa con visualización 3D en tiempo real
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveConfiguration}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>Guardar</span>
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Carrito</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {saveMessage && (
            <div className={`mb-4 p-4 rounded-xl text-center ${
              saveMessage.includes('Error') || saveMessage.includes('Por favor')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Contenido principal */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Visor 3D */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  Vista 3D en Tiempo Real
                </h2>
                <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
                          <p className="text-neutral-600">Cargando visualización 3D...</p>
                        </div>
                      </div>
                    }
                  >
                    <WatchConfigurator3DVanilla />
                  </Suspense>
                </div>

                {/* Botón Agregar al Carrito */}
                <button
                  onClick={handleAddToCart}
                  className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                >
                  Agregar al Carrito ({totalPrice.toLocaleString('es-ES')} €)
                </button>
              </div>
            </div>

            {/* Opciones de personalización */}
            <div className="space-y-6">
              <UnifiedConfigurationOptions
                onConfigurationChange={(config) => {
                  console.log('Configuración actualizada:', config)
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}

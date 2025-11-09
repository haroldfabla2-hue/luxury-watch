import { useState } from 'react'
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { useConfiguratorStore } from '../store/configuratorStore'
import { useNavigate } from 'react-router-dom'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const navigate = useNavigate()
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
    getCartItemCount,
  } = useConfiguratorStore()

  const total = getCartTotal()
  const itemCount = getCartItemCount()

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-neutral-50 shadow-2xl z-50 transform transition-transform duration-standard ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <ShoppingCart size={24} className="text-gold-700" />
            <h2 className="text-2xl font-headline font-semibold text-neutral-900">
              Carrito ({itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={64} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600">Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-3 bg-gold-500 text-neutral-900 rounded-sm font-medium hover:bg-gold-600 transition-colors"
              >
                Comenzar a Diseñar
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 border border-neutral-200"
              >
                {/* Configuration Summary */}
                <div className="mb-3">
                  <p className="font-medium text-neutral-900 mb-2">Configuración Personalizada</p>
                  <div className="text-sm text-neutral-600 space-y-1">
                    {item.configuration.material && (
                      <p>Material: {item.configuration.material.name}</p>
                    )}
                    {item.configuration.case && (
                      <p>Caja: {item.configuration.case.name}</p>
                    )}
                    {item.configuration.dial && (
                      <p>Esfera: {item.configuration.dial.name}</p>
                    )}
                    {item.configuration.strap && (
                      <p>Correa: {item.configuration.strap.name}</p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="p-1 hover:bg-neutral-200 rounded transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-neutral-200 rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-gold-700">
                      €{(item.totalPrice * item.quantity).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-error/10 text-error rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-neutral-900">Total:</span>
              <span className="text-3xl font-headline font-bold text-gold-700">
                €{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full btn-metallic-gold px-6 py-4 rounded-sm text-lg"
            >
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar

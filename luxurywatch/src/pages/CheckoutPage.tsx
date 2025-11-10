import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, Check, AlertCircle, Loader2 } from 'lucide-react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useConfiguratorStore } from '../store/configuratorStore'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_PAYMENT_INTENT_URL,
  STRIPE_ELEMENT_OPTIONS,
  isStripeConfigured,
  STRIPE_SETUP_MESSAGE,
  DEFAULT_CURRENCY
} from '../lib/stripeConfig'
import StripePaymentForm from '../components/StripePaymentForm'

// Inicializar Stripe fuera del componente para evitar re-creaciones
let stripePromise: Promise<Stripe | null> | null = null

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, getCartTotal, clearCart } = useConfiguratorStore()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card'>('card')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
  })

  // Validar que haya usuario y carrito
  useEffect(() => {
    if (!user) {
      navigate('/configurador')
    }
    if (cart.length === 0) {
      navigate('/configurador')
    }
  }, [user, cart, navigate])

  // Calcular totales
  const total = getCartTotal()
  const shipping = 0 // Free shipping
  const tax = total * 0.21 // 21% IVA
  const finalTotal = total + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Validar formulario antes de crear payment intent
  const validateForm = (): boolean => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country']
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Por favor completa el campo: ${field}`)
        return false
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido')
      return false
    }

    return true
  }

  // Crear Payment Intent
  const createPaymentIntent = async () => {
    if (!validateForm()) {
      return
    }

    setIsCreatingIntent(true)
    setError(null)

    try {
      // Preparar datos del pedido
      const orderData = {
        customerId: user?.id,
        items: cart.map((item) => ({
          watchConfigurationId: item.id,
          quantity: item.quantity,
          price: item.totalPrice,
          configuration: item.configuration
        })),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
        billingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
        customerEmail: formData.email,
        subtotal: total,
        tax: tax,
        shipping: shipping,
        total: finalTotal,
        currency: 'EUR'
      }

      // Usar nuestro API client para crear el pedido
      const response = await api.createOrder(orderData)

      if (response.data?.clientSecret) {
        setClientSecret(response.data.clientSecret)
      } else {
        throw new Error('No se recibió client secret del servidor')
      }
    } catch (err) {
      console.error('Error creating payment intent:', err)
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsCreatingIntent(false)
    }
  }

  // Manejar éxito del pago
  const handlePaymentSuccess = () => {
    clearCart()
    // Redirigir a página de éxito
    navigate('/', { state: { paymentSuccess: true } })
  }

  // Manejar error del pago
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-6 py-4">
          <a href="/" className="text-2xl font-headline font-bold text-gold-500">
            LuxuryWatch
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-neutral-900 mb-8">
            Finalizar Pedido
          </h1>

          {/* Error Global */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg p-6 shadow-card">
                <h2 className="text-2xl font-headline font-semibold text-neutral-900 mb-6">
                  Información de Envío
                </h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                      required
                      disabled={!!clientSecret}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                        disabled={!!clientSecret}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                        disabled={!!clientSecret}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                      required
                      disabled={!!clientSecret}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                        disabled={!!clientSecret}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                        disabled={!!clientSecret}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        País *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                        disabled={!!clientSecret}
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg p-6 shadow-card">
                <h2 className="text-2xl font-headline font-semibold text-neutral-900 mb-6">
                  Método de Pago
                </h2>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-md transition-all ${
                      paymentMethod === 'card'
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-neutral-300'
                    }`}
                    disabled={!!clientSecret}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={24} className="text-gold-700" />
                      <span className="font-medium">Tarjeta de Crédito/Débito</span>
                    </div>
                    {paymentMethod === 'card' && <Check size={20} className="text-gold-700" />}
                  </button>

                  {!clientSecret ? (
                    <div className="p-4 bg-neutral-100 rounded-md text-sm text-neutral-600">
                      <div className="flex items-start gap-2">
                        <Lock size={16} className="mt-1 flex-shrink-0" />
                        <p>
                          Los pagos se procesan de forma segura mediante Stripe.
                          Completa la información de envío y haz clic en "Continuar al Pago".
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Stripe Payment Form
                    <div className="mt-4">
                      <Elements
                        stripe={getStripe()}
                        options={{
                          clientSecret,
                          ...STRIPE_ELEMENT_OPTIONS,
                        }}
                      >
                        <StripePaymentForm
                          amount={finalTotal}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          disabled={loading}
                        />
                      </Elements>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-lg p-6 shadow-card">
                <h2 className="text-2xl font-headline font-semibold text-neutral-900 mb-6">
                  Resumen del Pedido
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="pb-4 border-b border-neutral-200">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Reloj Personalizado</span>
                        <span className="text-neutral-600">x{item.quantity}</span>
                      </div>
                      <div className="text-sm text-neutral-600 space-y-1">
                        {item.configuration.material && (
                          <p>{item.configuration.material.name}</p>
                        )}
                        {item.configuration.case && <p>{item.configuration.case.name}</p>}
                        {item.configuration.dial && <p>{item.configuration.dial.name}</p>}
                      </div>
                      <p className="text-lg font-bold text-gold-700 mt-2">
                        €
                        {(item.totalPrice * item.quantity).toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-neutral-700">
                    <span>Subtotal:</span>
                    <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Envío:</span>
                    <span className="text-success font-medium">GRATIS</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>IVA (21%):</span>
                    <span>€{tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-3 border-t-2 border-neutral-300 flex justify-between items-baseline">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-3xl font-headline font-bold text-gold-700">
                      €{finalTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Botón para crear payment intent (si aún no está creado) */}
                {!clientSecret && (
                  <button
                    onClick={createPaymentIntent}
                    disabled={isCreatingIntent || loading}
                    className="w-full btn-metallic-gold px-6 py-5 rounded-sm text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isCreatingIntent ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        <span>Preparando...</span>
                      </>
                    ) : (
                      <span>Continuar al Pago</span>
                    )}
                  </button>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-600">
                  <Lock size={16} />
                  <span>Pago seguro y encriptado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

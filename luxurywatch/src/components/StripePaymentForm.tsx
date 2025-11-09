import { useState, useEffect } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Loader2, AlertCircle } from 'lucide-react'

interface StripePaymentFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
}

/**
 * Formulario de pago con Stripe Elements
 * Integra Payment Element para recolectar información de pago de forma segura
 */
const StripePaymentForm = ({
  amount,
  onSuccess,
  onError,
  disabled = false,
}: StripePaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Limpiar error cuando cambia el amount
  useEffect(() => {
    setErrorMessage(null)
  }, [amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js aún no se ha cargado
      setErrorMessage('El sistema de pagos aún no está listo. Por favor espere.')
      return
    }

    if (disabled) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirmar el pago
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required', // Solo redirigir si es necesario
      })

      if (error) {
        // Mostrar error al cliente
        const message = error.message || 'Ocurrió un error al procesar el pago'
        setErrorMessage(message)
        onError(message)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Pago exitoso
        onSuccess()
      } else {
        // Estado inesperado
        const message = 'Estado de pago inesperado. Por favor contacte soporte.'
        setErrorMessage(message)
        onError(message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element de Stripe */}
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Error al procesar el pago</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || disabled}
        className="w-full btn-metallic-gold px-6 py-5 rounded-sm text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <Loader2 size={24} className="animate-spin" />
            <span>Procesando Pago...</span>
          </>
        ) : (
          <>
            <span>Pagar €{amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </>
        )}
      </button>

      {/* Nota de seguridad */}
      <div className="text-xs text-neutral-600 text-center">
        <p>Al hacer clic en "Pagar", aceptas nuestros términos de servicio.</p>
        <p className="mt-1">Tu pago se procesa de forma segura mediante Stripe.</p>
      </div>
    </form>
  )
}

export default StripePaymentForm

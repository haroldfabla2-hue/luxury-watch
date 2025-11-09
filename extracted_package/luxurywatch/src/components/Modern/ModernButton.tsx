/**
 * BOTÓN MODERNO CON MICRO-INTERACCIONES 2025
 * 
 * Componente de botón avanzado con:
 * - Micro-interacciones de hover y click
 * - Efectos de brillo y transición
 * - Estados de loading y success
 * - Animaciones suaves y feedback visual
 */

import React, { useState, useRef } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { ModernButtonProps } from '../../styles/modernUI'

interface ModernButtonState {
  ripple: { x: number; y: number; show: boolean } | null
}

export default function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  animate = true,
  className = '',
  disabled,
  onClick,
  ...props
}: ModernButtonProps) {
  const [state, setState] = useState<ModernButtonState>({ ripple: null })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return

    // Crear efecto ripple
    if (animate) {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setState({ ripple: { x, y, show: true } })
        
        setTimeout(() => {
          setState({ ripple: { x: 0, y: 0, show: false } })
        }, 600)
      }
    }

    onClick?.(e)
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const variantClasses = {
    primary: 'modern-btn-luxury',
    secondary: 'modern-btn-secondary',
    luxury: 'modern-btn-luxury glow-effect',
    outline: 'bg-transparent border-2 border-gold-500 text-gold-700 hover:bg-gold-500 hover:text-white',
    success: 'modern-btn-luxury'
  }

  return (
    <button
      ref={buttonRef}
      className={`
        modern-btn
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Efecto de brillo al hacer hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-700" />
      
      {/* Contenido del botón */}
      <div className="relative flex items-center gap-2">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </div>

      {/* Efecto ripple */}
      {state.ripple?.show && animate && (
        <span
          className="absolute rounded-full bg-white/50 pointer-events-none"
          style={{
            left: state.ripple.x - 150,
            top: state.ripple.y - 150,
            width: 300,
            height: 300,
            animation: 'ripple 0.6s ease-out'
          }}
        />
      )}
    </button>
  )
}

// Componente especializado para botones de acción
export function ActionButton({
  action = 'apply',
  loading = false,
  success = false,
  error = false,
  children,
  ...props
}: {
  action?: 'apply' | 'cancel' | 'reset' | 'confirm'
  loading?: boolean
  success?: boolean
  error?: boolean
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const getVariant = () => {
    if (error) return 'secondary'
    if (success) return 'success'
    switch (action) {
      case 'apply':
      case 'confirm':
        return 'luxury'
      case 'cancel':
        return 'outline'
      case 'reset':
        return 'secondary'
      default:
        return 'primary'
    }
  }

  const getIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin" />
    if (success) return <Check className="w-4 h-4" />
    if (error) return <X className="w-4 h-4" />
    return null
  }

  const getText = () => {
    if (loading) return 'Procesando...'
    if (success) return '¡Listo!'
    if (error) return 'Error'
    return children
  }

  return (
    <ModernButton
      variant={getVariant()}
      loading={loading}
      icon={getIcon()}
      className={`action-button-${action}`}
      {...props}
    >
      {getText()}
    </ModernButton>
  )
}

// Botón específico para seleccionar elementos
export function SelectionButton({
  selected,
  price,
  name,
  description,
  icon: Icon,
  color = '#D4AF37',
  onClick,
  ...props
}: {
  selected?: boolean
  price?: string | number
  name: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  onClick?: () => void
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={`
        modern-card modern-card-interactive
        p-4 text-left w-full group
        ${selected ? 'ring-2 ring-offset-2 ring-gold-500' : ''}
        transition-all duration-300 hover:scale-105
      `}
      style={{
        borderColor: selected ? color : undefined,
        boxShadow: selected ? `0 0 20px ${color}20` : undefined
      }}
      {...props}
    >
      <div className="flex items-center gap-3">
        {/* Icono del elemento */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
          style={{ backgroundColor: color }}
        >
          {Icon ? <Icon className="w-6 h-6" /> : '•'}
        </div>
        
        {/* Información del elemento */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-neutral-900 group-hover:text-gold-700 transition-colors">
            {name}
          </h4>
          {description && (
            <p className="text-sm text-neutral-600 line-clamp-1 group-hover:text-neutral-700">
              {description}
            </p>
          )}
        </div>
        
        {/* Precio y estado */}
        <div className="text-right">
          {selected && (
            <div className="mb-1">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          )}
          {price && (
            <p className="font-bold text-gold-600">
              {typeof price === 'number' ? `${price.toLocaleString('es-ES')} €` : price}
            </p>
          )}
        </div>
      </div>
      
      {/* Efecto de hover adicional */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-100/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
    </button>
  )
}


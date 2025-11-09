/**
 * SISTEMA DE ANIMACIONES Y MICRO-INTERACCIONES 2025
 * 
 * Componentes para animaciones suaves y micro-interacciones:
 * - Animaciones de entrada y salida
 * - Transiciones entre estados
 * - Efectos de carga y feedback
 * - Micro-interacciones para elementos interactivos
 */

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Check, AlertCircle, Info } from 'lucide-react'

// Hook para animaciones de entrada
export function useAnimation(
  type: 'fadeIn' | 'slideUp' | 'slideDown' | 'scale' | 'flip',
  delay: number = 0
) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const animationClass = {
    fadeIn: isVisible ? 'animate-fade-in' : 'opacity-0',
    slideUp: isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-4',
    slideDown: isVisible ? 'animate-slide-down' : 'opacity-0 -translate-y-4',
    scale: isVisible ? 'animate-scale-in' : 'opacity-0 scale-95',
    flip: isVisible ? 'animate-flip-in' : 'opacity-0 rotate-y-180'
  }[type]

  return { isVisible, animationClass }
}

// Componente para animaciones de entrada
export function AnimatedContainer({
  children,
  animation = 'fadeIn',
  delay = 0,
  className = '',
  ...props
}: {
  children: React.ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scale' | 'flip'
  delay?: number
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const { animationClass } = useAnimation(animation, delay)

  return (
    <div className={`transition-all duration-500 ${animationClass} ${className}`} {...props}>
      {children}
    </div>
  )
}

// Componente para acordeones modernos
export function ModernAccordion({
  title,
  children,
  defaultOpen = false,
  icon,
  color = '#D4AF37'
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
  color?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="modern-card border border-neutral-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between p-4 text-left
          hover:bg-neutral-50 transition-colors duration-200
          ${isOpen ? 'bg-gold-50 border-b border-gold-200' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
          )}
          <h3 className="font-semibold text-neutral-900">{title}</h3>
        </div>
        
        <div className={`
          transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}
        `}>
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        </div>
      </button>
      
      <div className={`
        transition-all duration-500 ease-out
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        overflow-hidden
      `}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  )
}

// Componente para indicadores de estado modernos
export function ModernStatus({
  status = 'info',
  title,
  description,
  action,
  dismissible = false,
  onDismiss
}: {
  status?: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  action?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const statusConfig = {
    success: {
      icon: Check,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const handleDismiss = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} border rounded-xl p-4
      transition-all duration-300 ${isAnimating ? 'animate-slide-out' : 'animate-slide-in'}
    `}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h4 className={`font-semibold ${config.color}`}>{title}</h4>
          {description && (
            <p className="text-sm text-neutral-600 mt-1">{description}</p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Componente para transiciones de página
export function PageTransition({
  children,
  type = 'fade',
  duration = 500
}: {
  children: React.ReactNode
  type?: 'fade' | 'slide' | 'scale'
  duration?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const transitionClass = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-up',
    scale: 'animate-scale-in'
  }[type]

  return (
    <div 
      className={`transition-opacity duration-${duration} ${isVisible ? 'opacity-100' : 'opacity-0'} ${transitionClass}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Componente para efectos de hover avanzados
export function HoverEffects({
  children,
  effect = 'lift',
  className = ''
}: {
  children: React.ReactNode
  effect?: 'lift' | 'scale' | 'glow' | 'tilt' | 'shine'
  className?: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  const effectClasses = {
    lift: 'hover:-translate-y-2 hover:shadow-xl transition-all duration-300',
    scale: 'hover:scale-105 transition-all duration-300',
    glow: 'hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-300',
    tilt: 'hover:rotate-1 hover:shadow-lg transition-all duration-300',
    shine: 'hover:shadow-gold-500/30 transition-all duration-300'
  }

  return (
    <div
      className={`${effectClasses[effect]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {effect === 'shine' && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
      )}
    </div>
  )
}

// Componente para skeleton loading moderno
export function ModernSkeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  animated = true,
  className = ''
}: {
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  animated?: boolean
  className?: string
}) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  return (
    <div
      className={`
        bg-neutral-200 ${roundedClasses[rounded]}
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{ width, height }}
    />
  )
}

// Componente para progress bars animados
export function ModernProgress({
  value,
  max = 100,
  color = '#D4AF37',
  showText = true,
  animated = true,
  size = 'md'
}: {
  value: number
  max?: number
  color?: string
  showText?: boolean
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between text-sm text-neutral-600 mb-1">
          <span>Progreso</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={`
        w-full bg-neutral-200 rounded-full overflow-hidden
        ${sizeClasses[size]}
      `}>
        <div
          className={`
            h-full transition-all duration-700 ease-out
            ${animated ? 'animate-progress' : ''}
          `}
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  )
}
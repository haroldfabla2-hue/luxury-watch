/**
 * TARJETAS MODERNAS CON EFECTOS AVANZADOS 2025
 * 
 * Componente de tarjeta avanzado con:
 * - Efectos holográficos y glassmorfismo
 * - Animaciones de hover suaves
 * - Efectos 3D y escalado
 * - Estados interactivos
 */

import React, { useState } from 'react'
import { CheckCircle, Clock, Zap, Eye, ArrowRight, X } from 'lucide-react'
import { ModernCardProps } from '../../styles/modernUI'

interface ModernCardState {
  isHovered: boolean
  mousePosition: { x: number; y: number }
}

export default function ModernCard({
  children,
  hover = 'lift',
  interactive = true,
  shadow = 'md',
  border = true,
  className = '',
  ...props
}: ModernCardProps & {
  children: React.ReactNode
}) {
  const [state, setState] = useState<ModernCardState>({
    isHovered: false,
    mousePosition: { x: 0, y: 0 }
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover === 'flip') {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      setState({
        isHovered: true,
        mousePosition: { x, y }
      })

      e.currentTarget.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        scale3d(1.02, 1.02, 1.02)
      `
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setState({ isHovered: false, mousePosition: { x: 0, y: 0 } })
    e.currentTarget.style.transform = ''
  }

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  }

  const hoverClasses = {
    scale: 'hover:scale-105',
    lift: 'hover:-translate-y-2 hover:shadow-xl',
    glow: 'hover:shadow-2xl hover:shadow-gold-500/20',
    holographic: 'modern-card-holographic',
    flip: 'hover:rotateY-180'
  }

  return (
    <div
      className={`
        modern-card
        ${interactive ? 'modern-card-interactive' : ''}
        ${shadowClasses[shadow]}
        ${border ? 'border border-neutral-200' : ''}
        ${hoverClasses[hover]}
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d'
      }}
      {...props}
    >
      {children}
      
      {/* Efecto de brillo para elementos interactivos */}
      {interactive && state.isHovered && (
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${state.mousePosition.x}px ${state.mousePosition.y}px, rgba(212, 175, 55, 0.3) 0%, transparent 50%)`,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  )
}

// Tarjeta específica para elementos de configuración
export function ConfigElementCard({
  title,
  subtitle,
  icon,
  color = '#D4AF37',
  selected = false,
  price,
  description,
  onClick,
  loading = false,
  children,
  ...props
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  color?: string
  selected?: boolean
  price?: string | number
  description?: string
  loading?: boolean
  onClick?: () => void
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ModernCard
      hover="lift"
      interactive={!loading}
      className={`
        transition-all duration-300 cursor-pointer
        ${selected ? 'ring-2 ring-offset-2' : ''}
      `}
      style={{
        borderColor: selected ? color : undefined
      }}
      onClick={onClick}
      {...props}
    >
      <div className="p-6">
        {/* Header de la tarjeta */}
        <div className="flex items-center gap-4 mb-4">
          {/* Icono */}
          <div 
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg
              transition-all duration-300
              ${loading ? 'animate-pulse' : ''}
            `}
            style={{ 
              backgroundColor: selected ? color : `${color}80`,
              boxShadow: selected ? `0 0 20px ${color}40` : undefined
            }}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              icon || '•'
            )}
          </div>
          
          {/* Información principal */}
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${selected ? 'text-gold-700' : 'text-neutral-900'}`}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-neutral-600">{subtitle}</p>
            )}
            {selected && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-700">Seleccionado</span>
              </div>
            )}
          </div>
          
          {/* Precio */}
          {price && (
            <div className="text-right">
              <p className={`font-bold text-lg ${selected ? 'text-gold-700' : 'text-gold-600'}`}>
                {typeof price === 'number' ? `${price.toLocaleString('es-ES')} €` : price}
              </p>
            </div>
          )}
        </div>
        
        {/* Descripción */}
        {description && (
          <p className="text-neutral-600 mb-4 line-clamp-2">{description}</p>
        )}
        
        {/* Contenido adicional */}
        {children}
        
        {/* Indicador de interacción */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Eye className="w-4 h-4" />
            <span>Click para seleccionar</span>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400" />
        </div>
      </div>
      
      {/* Efecto de gradiente en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gold-100/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
    </ModernCard>
  )
}

// Tarjeta de vista previa mejorada
export function PreviewCard({
  image,
  title,
  subtitle,
  loading = false,
  fallbackMode = false,
  description,
  children,
  ...props
}: {
  image?: string
  title: string
  subtitle?: string
  loading?: boolean
  fallbackMode?: boolean
  description?: string
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ModernCard
      hover="scale"
      className="overflow-hidden"
      {...props}
    >
      <div className="relative">
        {/* Área de imagen/preview */}
        <div className={`
          aspect-square flex items-center justify-center text-6xl
          ${loading ? 'bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse' : ''}
          ${fallbackMode ? 'bg-gradient-to-br from-orange-50 to-yellow-50' : 'bg-neutral-50'}
        `}>
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-neutral-400 animate-spin" />
              <p className="text-sm text-neutral-500">Generando vista previa...</p>
            </div>
          ) : image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-contain"
            />
          ) : fallbackMode ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-orange-800 font-medium">
                  {description || 'Vista previa visual temporal'}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p className="text-xs text-yellow-700">
                  IA no disponible
                </p>
              </div>
            </div>
          ) : (
            <div className="text-neutral-400">📷</div>
          )}
        </div>
        
        {/* Badge de modo */}
        {fallbackMode && (
          <div className="absolute top-3 right-3">
            <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              Modo Visual
            </div>
          </div>
        )}
        
        {loading && (
          <div className="absolute top-3 right-3">
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              Cargando...
            </div>
          </div>
        )}
      </div>
      
      {/* Información de la vista previa */}
      <div className="p-4">
        <h4 className="font-semibold text-neutral-900 mb-1">{title}</h4>
        {subtitle && (
          <p className="text-sm text-neutral-600 mb-2">{subtitle}</p>
        )}
        
        {/* Estado específico */}
        {fallbackMode ? (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Zap className="w-4 h-4" />
            <span>Vista previa visual</span>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Generando con IA...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Vista previa lista</span>
          </div>
        )}
      </div>
    </ModernCard>
  )
}

// Tarjeta de estado/configuración
export function StatusCard({
  status = 'pending',
  title,
  description,
  value,
  trend,
  ...props
}: {
  status?: 'success' | 'loading' | 'error' | 'pending'
  title: string
  description?: string
  value?: string | number
  trend?: 'up' | 'down' | 'stable'
} & React.HTMLAttributes<HTMLDivElement>) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    loading: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    error: {
      icon: X,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    pending: {
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <ModernCard className={`${config.bgColor} ${config.borderColor} border`} {...props}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`${config.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-neutral-900">{title}</h4>
            {description && (
              <p className="text-sm text-neutral-600">{description}</p>
            )}
          </div>
          {value && (
            <div className="text-right">
              <p className="text-lg font-bold text-neutral-900">{value}</p>
              {trend && (
                <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-neutral-500'}`}>
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  )
}


/**
 * DEMO DEL SISTEMA GRANULAR MEJORADO
 * 
 * Demuestra las nuevas funcionalidades de cambios granulares con IA
 */

import { useState } from 'react'
import { Sparkles, ArrowRight, CheckCircle, Zap, Target, Palette } from 'lucide-react'
import GranularConfiguratorPanel from '../components/GranularConfiguratorPanel'
import { useConfiguratorStore } from '../store/configuratorStore'
import { AnimatedContainer } from './Modern/AnimationSystem'
import ModernCard from './Modern/ModernCard'

export default function GranularSystemDemo() {
  const { currentConfiguration, getTotalPrice } = useConfiguratorStore()
  const [demoStep, setDemoStep] = useState(0)

  const demoSteps = [
    {
      title: "Cambios Granulares",
      description: "Cambia elementos individuales sin afectar el resto",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Vista Previa IA",
      description: "Ve cómo se ve el cambio antes de aplicarlo",
      icon: Sparkles,
      color: "text-purple-600"
    },
    {
      title: "Configuración Inteligente",
      description: "Mantiene el resto del reloj exactamente igual",
      icon: CheckCircle,
      color: "text-green-600"
    }
  ]

  const features = [
    {
      icon: "🔗",
      title: "Cambio de Correa",
      description: "Solo cambia la correa, caja y esfera permanecen idénticas"
    },
    {
      icon: "📦", 
      title: "Cambio de Caja",
      description: "Solo cambia la forma de la caja, resto sin modificaciones"
    },
    {
      icon: "🎨",
      title: "Cambio de Material",
      description: "Solo modifica el material, manteniendo diseño intacto"
    },
    {
      icon: "⌚",
      title: "Cambio de Esfera",
      description: "Solo cambia el color de la esfera, todo lo demás igual"
    },
    {
      icon: "✋",
      title: "Cambio de Manecillas",
      description: "Solo modifica las manecillas, sin afectar otros elementos"
    }
  ]

  return (
    <AnimatedContainer animation="fadeIn" className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
              Sistema Granular Mejorado
            </h1>
          </div>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Cambia elementos individuales del reloj con vista previa IA. 
            Ahora puedes modificar solo la correa, solo la caja, solo cualquier elemento sin afectar el resto.
          </p>
        </div>

        {/* Demo Steps mejorado */}
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {demoSteps.map((step, index) => {
              const IconComponent = step.icon
              const isActive = demoStep === index
              
              return (
                <AnimatedContainer key={index} animation="scale" delay={index * 100}>
                  <ModernCard
                    hover="lift"
                    interactive
                    className={`p-6 cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? 'ring-2 ring-gold-500 shadow-gold-500/20' 
                        : 'hover:shadow-xl'
                    }`}
                    onClick={() => setDemoStep(index)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-gold-100' : 'bg-neutral-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${step.color}`} />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900">{step.title}</h3>
                    </div>
                    <p className="text-neutral-600 mb-3">{step.description}</p>
                    {isActive && (
                      <div className="flex items-center gap-2 text-sm text-gold-600">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">Activo</span>
                      </div>
                    )}
                  </ModernCard>
                </AnimatedContainer>
              )
            })}
          </div>
        </AnimatedContainer>

        {/* Features Grid mejorado */}
        <AnimatedContainer animation="slideUp" delay={400}>
          <ModernCard className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
              ¿Qué puedes cambiar individualmente?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <AnimatedContainer key={index} animation="scale" delay={index * 50}>
                  <ModernCard hover="lift" interactive className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3 className="font-bold text-neutral-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-neutral-600">{feature.description}</p>
                    </div>
                  </ModernCard>
                </AnimatedContainer>
              ))}
            </div>
          </ModernCard>
        </AnimatedContainer>

        {/* Live Demo mejorado */}
        <AnimatedContainer animation="slideUp" delay={600}>
          <ModernCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">Demo Interactivo</h2>
                <p className="text-neutral-600">Prueba el nuevo sistema de cambios granulares</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Precio actual</p>
                <p className="text-2xl font-bold text-gold-600">
                  {getTotalPrice().toLocaleString('es-ES')} €
                </p>
              </div>
            </div>

            <GranularConfiguratorPanel />

            {/* Instructions */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                Cómo usar el sistema granular
              </h3>
              <div className="space-y-3">
                <AnimatedContainer animation="slideUp" delay={700}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Click en cualquier elemento (correa, caja, esfera, etc.)</span>
                  </div>
                </AnimatedContainer>
                <AnimatedContainer animation="slideUp" delay={800}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Se genera vista previa con IA mostrando el cambio específico</span>
                  </div>
                </AnimatedContainer>
                <AnimatedContainer animation="slideUp" delay={900}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Confirma el cambio si te gusta, o cancela para mantener el original</span>
                  </div>
                </AnimatedContainer>
              </div>
            </div>
          </ModernCard>
        </AnimatedContainer>

        {/* Configuration Status mejorado */}
        {currentConfiguration && (
          <AnimatedContainer animation="slideUp" delay={800}>
            <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">Estado Actual de tu Reloj</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {Object.entries(currentConfiguration).map(([key, value]) => {
                  if (!value) return null
                  
                  const elementNames = {
                    'strap': 'Correa',
                    'case': 'Caja',
                    'material': 'Material',
                    'dial': 'Esfera',
                    'hands': 'Manecillas'
                  }
                  
                  return (
                    <AnimatedContainer key={key} animation="scale">
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                          {elementNames[key as keyof typeof elementNames] || key}
                        </p>
                        <p className="font-semibold text-neutral-900 mb-2">{value.name}</p>
                        <p className="text-sm font-bold text-gold-600">
                          {parseFloat(value.price || '0').toLocaleString('es-ES')} €
                        </p>
                      </div>
                    </AnimatedContainer>
                  )
                })}
              </div>
            </div>
          </AnimatedContainer>
        )}
      </div>
    </AnimatedContainer>
  )
}
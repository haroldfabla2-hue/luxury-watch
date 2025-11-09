/**
 * PÁGINA DEL CONFIGURADOR IA - SISTEMA HÍBRIDO
 * 
 * Página dedicada para el configurador revolucionario que combina:
 * - Google Gemini 2.0 Flash (IA generativa)
 * - Biblioteca pre-generada (100+ configuraciones)
 * - Configurador 3D (fallback interactivo)
 */

import { useState } from 'react'
import AIWatchConfigurator from '../components/AIWatchConfigurator'
import { ArrowLeft, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AIConfiguratorPage() {
  const navigate = useNavigate()
  const [showInfo, setShowInfo] = useState(false)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header con navegación */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al inicio</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Cómo funciona</span>
              </button>
              
              <button
                onClick={() => navigate('/configurador')}
                className="px-4 py-2 text-sm font-medium border-2 border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors"
              >
                Modo 3D Clásico
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Panel informativo (desplegable) */}
      {showInfo && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Sistema Híbrido Revolucionario
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Biblioteca Pre-generada</h4>
                  <p className="text-sm text-neutral-600">
                    100+ configuraciones populares listas para carga instantánea. 
                    Si tu descripción coincide, obtienes el resultado inmediatamente.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">IA Gemini 2.0 Flash</h4>
                  <p className="text-sm text-neutral-600">
                    Para estilos únicos y personalizados, nuestra IA genera renders 
                    fotorrealistas en segundos basados en tu descripción.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Fallback 3D Interactivo</h4>
                  <p className="text-sm text-neutral-600">
                    Si ambos métodos no están disponibles, te redirigimos al 
                    configurador 3D completo para personalización manual.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-900">
                  <strong>Consejos para mejores resultados:</strong> Describe materiales (oro, platino, acero), 
                  estilos (clásico, deportivo, elegante) y colores (negro, azul, blanco). 
                  Ejemplo: "Reloj elegante de oro rosa con esfera champagne"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido principal - Configurador IA */}
      <main className="py-12">
        <AIWatchConfigurator 
          onConfigurationSelect={(config) => {
            console.log('Configuración seleccionada:', config)
            // Aquí se puede integrar con el sistema de carrito/checkout
          }}
        />
      </main>
      
      {/* Footer informativo */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-neutral-600">
              Powered by <strong className="text-[#D4AF37]">Google Gemini 2.0 Flash</strong> • 
              Generación fotorrealista en tiempo real
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
              <span>✓ Biblioteca de 100+ configuraciones</span>
              <span>✓ IA generativa avanzada</span>
              <span>✓ Renders de calidad cinematográfica</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

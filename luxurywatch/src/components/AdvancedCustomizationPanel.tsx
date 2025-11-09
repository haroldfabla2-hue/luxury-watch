import { useState } from 'react'
import { Type, Palette, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Panel de Personalización Avanzada
 * Grabado láser, selector de colores infinito, estilos de números
 */

interface AdvancedCustomizationProps {
  onUpdate: (customization: AdvancedCustomization) => void
  currentCustomization?: AdvancedCustomization
}

export interface AdvancedCustomization {
  engraving?: {
    text: string
    position: 'case_back' | 'dial_edge' | 'none'
    font: 'script' | 'serif' | 'sans'
  }
  customDialColor?: string // Hex color
  numbersStyle?: 'roman' | 'arabic' | 'mixed' | 'indices' | 'none'
  complications?: string[] // ['chronograph', 'date', 'gmt', 'moon_phase']
  finishType?: 'polished' | 'brushed' | 'sandblasted' | 'pvd'
}

const AdvancedCustomizationPanel = ({
  onUpdate,
  currentCustomization = {},
}: AdvancedCustomizationProps) => {
  const [customization, setCustomization] = useState<AdvancedCustomization>(
    currentCustomization
  )
  const [showColorPicker, setShowColorPicker] = useState(false)

  const updateCustomization = (updates: Partial<AdvancedCustomization>) => {
    const updated = { ...customization, ...updates }
    setCustomization(updated)
    onUpdate(updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Grabado Láser */}
      <div className="bg-white rounded-lg p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Type size={24} className="text-gold-600" />
          <h3 className="text-xl font-headline font-semibold">Grabado Láser</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Texto a Grabar (máx. 20 caracteres)
            </label>
            <input
              type="text"
              maxLength={20}
              value={customization.engraving?.text || ''}
              onChange={(e) =>
                updateCustomization({
                  engraving: {
                    ...customization.engraving,
                    text: e.target.value,
                    position: customization.engraving?.position || 'case_back',
                    font: customization.engraving?.font || 'script',
                  },
                })
              }
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Tu mensaje personalizado"
            />
            <p className="text-xs text-neutral-500 mt-1">
              {customization.engraving?.text?.length || 0}/20 caracteres
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Posición
              </label>
              <select
                value={customization.engraving?.position || 'case_back'}
                onChange={(e) =>
                  updateCustomization({
                    engraving: {
                      ...customization.engraving!,
                      position: e.target.value as any,
                    },
                  })
                }
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="case_back">Parte Trasera</option>
                <option value="dial_edge">Borde de Esfera</option>
                <option value="none">Sin Grabado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Fuente
              </label>
              <select
                value={customization.engraving?.font || 'script'}
                onChange={(e) =>
                  updateCustomization({
                    engraving: {
                      ...customization.engraving!,
                      font: e.target.value as any,
                    },
                  })
                }
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="script">Script (Elegante)</option>
                <option value="serif">Serif (Clásico)</option>
                <option value="sans">Sans (Moderno)</option>
              </select>
            </div>
          </div>

          {customization.engraving?.text && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 p-4 bg-gold-50 border border-gold-200 rounded-lg"
            >
              <p className="text-sm text-gold-900 font-medium mb-1">Vista Previa:</p>
              <p
                className={`text-2xl text-center ${
                  customization.engraving.font === 'script'
                    ? 'font-serif italic'
                    : customization.engraving.font === 'serif'
                    ? 'font-serif'
                    : 'font-sans'
                }`}
              >
                {customization.engraving.text}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Selector de Color Personalizado */}
      <div className="bg-white rounded-lg p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={24} className="text-gold-600" />
          <h3 className="text-xl font-headline font-semibold">Color Personalizado de Esfera</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Elige cualquier color de 16.7M opciones para tu esfera
          </p>

          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-lg border-2 border-neutral-300 cursor-pointer shadow-inner"
              style={{ backgroundColor: customization.customDialColor || '#000000' }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />

            <div className="flex-1">
              <input
                type="color"
                value={customization.customDialColor || '#000000'}
                onChange={(e) => updateCustomization({ customDialColor: e.target.value })}
                className="w-full h-12 cursor-pointer"
              />
              <p className="text-xs text-neutral-500 mt-2">
                Color actual: {customization.customDialColor || '#000000'}
              </p>
            </div>
          </div>

          {/* Colores predefinidos premium */}
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">Colores Premium:</p>
            <div className="grid grid-cols-6 gap-2">
              {[
                '#000000',
                '#FFFFFF',
                '#1E3A8A',
                '#065F46',
                '#7C2D12',
                '#1F2937',
                '#B8860B',
                '#C0C0C0',
                '#4A5568',
                '#DC2626',
                '#2563EB',
                '#059669',
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => updateCustomization({ customDialColor: color })}
                  className="w-full h-10 rounded border-2 hover:border-gold-500 transition-colors"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estilo de Números */}
      <div className="bg-white rounded-lg p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={24} className="text-gold-600" />
          <h3 className="text-xl font-headline font-semibold">Estilo de Números</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { value: 'roman', label: 'Romanos', preview: 'XII III VI IX' },
            { value: 'arabic', label: 'Arábigos', preview: '12 3 6 9' },
            { value: 'mixed', label: 'Mixto', preview: '12 III 6 IX' },
            { value: 'indices', label: 'Índices', preview: '| | | |' },
            { value: 'none', label: 'Sin Números', preview: '· · · ·' },
          ].map((style) => (
            <motion.button
              key={style.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateCustomization({ numbersStyle: style.value as any })}
              className={`p-4 border-2 rounded-lg transition-all ${
                customization.numbersStyle === style.value
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-neutral-300 hover:border-gold-300'
              }`}
            >
              <p className="font-semibold text-neutral-900 mb-1">{style.label}</p>
              <p className="text-sm text-neutral-600 font-mono">{style.preview}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Complicaciones */}
      <div className="bg-white rounded-lg p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={24} className="text-gold-600" />
          <h3 className="text-xl font-headline font-semibold">Complicaciones Premium</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 'chronograph', label: 'Cronógrafo', price: 500 },
            { value: 'date', label: 'Fecha', price: 150 },
            { value: 'gmt', label: 'GMT', price: 400 },
            { value: 'moon_phase', label: 'Fase Lunar', price: 800 },
          ].map((complication) => {
            const isSelected = customization.complications?.includes(complication.value)
            return (
              <motion.button
                key={complication.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const current = customization.complications || []
                  const updated = isSelected
                    ? current.filter((c) => c !== complication.value)
                    : [...current, complication.value]
                  updateCustomization({ complications: updated })
                }}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-gold-500 bg-gold-50'
                    : 'border-neutral-300 hover:border-gold-300'
                }`}
              >
                <p className="font-semibold text-neutral-900 mb-1">{complication.label}</p>
                <p className="text-sm text-gold-700 font-semibold">
                  +€{complication.price}
                </p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Tipo de Acabado */}
      <div className="bg-white rounded-lg p-6 shadow-card">
        <h3 className="text-xl font-headline font-semibold mb-4">Tipo de Acabado</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 'polished', label: 'Pulido', desc: 'Brillo espejo' },
            { value: 'brushed', label: 'Cepillado', desc: 'Acabado mate' },
            { value: 'sandblasted', label: 'Arenado', desc: 'Textura suave' },
            { value: 'pvd', label: 'PVD', desc: 'Recubrimiento negro' },
          ].map((finish) => (
            <motion.button
              key={finish.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateCustomization({ finishType: finish.value as any })}
              className={`p-4 border-2 rounded-lg transition-all ${
                customization.finishType === finish.value
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-neutral-300 hover:border-gold-300'
              }`}
            >
              <p className="font-semibold text-neutral-900 mb-1">{finish.label}</p>
              <p className="text-xs text-neutral-600">{finish.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Resumen de Personalizaciones */}
      {Object.keys(customization).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-lg p-6 border-2 border-gold-300"
        >
          <h4 className="font-headline font-bold text-xl text-neutral-900 mb-3">
            Resumen de Personalizaciones Avanzadas
          </h4>
          <div className="space-y-2 text-sm">
            {customization.engraving?.text && (
              <p>
                <strong>Grabado:</strong> "{customization.engraving.text}" en{' '}
                {customization.engraving.position === 'case_back'
                  ? 'parte trasera'
                  : 'borde de esfera'}
              </p>
            )}
            {customization.customDialColor && (
              <p>
                <strong>Color personalizado:</strong>{' '}
                <span
                  className="inline-block w-4 h-4 rounded border border-neutral-400"
                  style={{ backgroundColor: customization.customDialColor }}
                />{' '}
                {customization.customDialColor}
              </p>
            )}
            {customization.numbersStyle && (
              <p>
                <strong>Estilo de números:</strong> {customization.numbersStyle}
              </p>
            )}
            {customization.complications && customization.complications.length > 0 && (
              <p>
                <strong>Complicaciones:</strong> {customization.complications.join(', ')}
              </p>
            )}
            {customization.finishType && (
              <p>
                <strong>Acabado:</strong> {customization.finishType}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AdvancedCustomizationPanel

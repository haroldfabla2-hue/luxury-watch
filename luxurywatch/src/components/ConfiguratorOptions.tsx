import { useEffect } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'
import { supabase } from '../lib/supabaseClient'
import { Check } from 'lucide-react'

const ConfiguratorOptions = () => {
  const {
    materials,
    cases,
    dials,
    straps,
    currentConfiguration,
    setMaterial,
    setCase,
    setDial,
    setStrap,
    setMaterials,
    setCases,
    setDials,
    setStraps,
    getTotalPrice,
  } = useConfiguratorStore()

  // Load options from database
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('watch_materials')
          .select('*')
          .order('id')

        if (materialsError) throw materialsError
        if (materialsData) setMaterials(materialsData)

        // Load cases
        const { data: casesData, error: casesError } = await supabase
          .from('watch_cases')
          .select('*')
          .order('id')

        if (casesError) throw casesError
        if (casesData) setCases(casesData)

        // Load dials
        const { data: dialsData, error: dialsError } = await supabase
          .from('watch_dials')
          .select('*')
          .order('id')

        if (dialsError) throw dialsError
        if (dialsData) setDials(dialsData)

        // Load straps
        const { data: strapsData, error: strapsError } = await supabase
          .from('watch_straps')
          .select('*')
          .order('id')

        if (strapsError) throw strapsError
        if (strapsData) setStraps(strapsData)
      } catch (error) {
        console.error('Error loading configurator options:', error)
      }
    }

    loadOptions()
  }, [setMaterials, setCases, setDials, setStraps])

  const totalPrice = getTotalPrice()

  return (
    <div className="space-y-8">
      {/* Price Display */}
      <div className="bg-gold-100 border-2 border-gold-500 rounded-lg p-6 text-center sticky top-24 z-10">
        <p className="text-sm text-neutral-700 mb-2">Precio Total</p>
        <p className="text-4xl font-headline font-bold text-gold-700">
          €{totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Materials Section */}
      <div>
        <h3 className="text-2xl font-headline font-semibold text-neutral-900 mb-4">
          1. Selecciona Material
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => setMaterial(material)}
              className={`text-left p-4 rounded-lg border-2 transition-all duration-standard hover:shadow-card ${
                currentConfiguration.material?.id === material.id
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full border border-neutral-300"
                      style={{ backgroundColor: material.color_hex }}
                    />
                    <h4 className="font-medium text-neutral-900">{material.name}</h4>
                    {currentConfiguration.material?.id === material.id && (
                      <Check size={18} className="text-gold-700" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{material.description}</p>
                  <p className="text-lg font-bold text-gold-700">+€{parseFloat(material.price).toFixed(2)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cases Section */}
      <div>
        <h3 className="text-2xl font-headline font-semibold text-neutral-900 mb-4">
          2. Elige Caja
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cases.map((watchCase) => (
            <button
              key={watchCase.id}
              onClick={() => setCase(watchCase)}
              className={`text-left p-4 rounded-lg border-2 transition-all duration-standard hover:shadow-card ${
                currentConfiguration.case?.id === watchCase.id
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-neutral-900">{watchCase.name}</h4>
                    {currentConfiguration.case?.id === watchCase.id && (
                      <Check size={18} className="text-gold-700" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{watchCase.description}</p>
                  <p className="text-xs text-neutral-500 mb-2">Tamaño: {watchCase.size_mm}mm</p>
                  <p className="text-lg font-bold text-gold-700">+€{parseFloat(watchCase.price).toFixed(2)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dials Section */}
      <div>
        <h3 className="text-2xl font-headline font-semibold text-neutral-900 mb-4">
          3. Escoge Esfera
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dials.map((dial) => (
            <button
              key={dial.id}
              onClick={() => setDial(dial)}
              className={`text-left p-4 rounded-lg border-2 transition-all duration-standard hover:shadow-card ${
                currentConfiguration.dial?.id === dial.id
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full border border-neutral-300"
                      style={{ backgroundColor: dial.color_hex }}
                    />
                    <h4 className="font-medium text-neutral-900">{dial.name}</h4>
                    {currentConfiguration.dial?.id === dial.id && (
                      <Check size={18} className="text-gold-700" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{dial.description}</p>
                  <p className="text-xs text-neutral-500 mb-2">Estilo: {dial.style_category}</p>
                  <p className="text-lg font-bold text-gold-700">+€{parseFloat(dial.price).toFixed(2)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Straps Section */}
      <div>
        <h3 className="text-2xl font-headline font-semibold text-neutral-900 mb-4">
          4. Personaliza Correa
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {straps.map((strap) => (
            <button
              key={strap.id}
              onClick={() => setStrap(strap)}
              className={`text-left p-4 rounded-lg border-2 transition-all duration-standard hover:shadow-card ${
                currentConfiguration.strap?.id === strap.id
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-neutral-900">{strap.name}</h4>
                    {currentConfiguration.strap?.id === strap.id && (
                      <Check size={18} className="text-gold-700" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{strap.description}</p>
                  <p className="text-xs text-neutral-500 mb-2">Material: {strap.material_type}</p>
                  <p className="text-lg font-bold text-gold-700">+€{parseFloat(strap.price).toFixed(2)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConfiguratorOptions

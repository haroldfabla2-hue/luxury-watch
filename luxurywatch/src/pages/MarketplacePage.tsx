import { useState, useEffect } from 'react'
import { Upload, DollarSign, TrendingUp, Package, Star } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

/**
 * Marketplace para Diseñadores Independientes
 * Sistema multi-vendor básico
 */

interface DesignerProduct {
  id: number
  designer_id: string
  title: string
  description: string
  configuration: any
  base_price: number
  commission_rate: number
  sales_count: number
  rating: number
  image_url?: string
  created_at: string
}

const MarketplacePage = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState<DesignerProduct[]>([])
  const [isDesigner, setIsDesigner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)

  useEffect(() => {
    loadProducts()
    checkDesignerStatus()
  }, [user])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('designer_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = table doesn't exist
        console.error('Error loading products:', error)
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDesignerStatus = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('designer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setIsDesigner(!!data)
    } catch (error) {
      // No es diseñador
      setIsDesigner(false)
    }
  }

  const becomeDesigner = async () => {
    if (!user) return alert('Debes iniciar sesión')

    try {
      const { error } = await supabase.from('designer_profiles').insert([
        {
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'Designer',
          bio: 'Diseñador de relojes personalizados',
          commission_rate: 20, // 20% por defecto
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      setIsDesigner(true)
      alert('¡Ahora eres diseñador! Puedes subir tus diseños.')
    } catch (error) {
      console.error('Error becoming designer:', error)
      alert('Error al registrarse como diseñador')
    }
  }

  const uploadDesign = async (formData: any) => {
    if (!user) return

    try {
      const { error } = await supabase.from('designer_products').insert([
        {
          designer_id: user.id,
          title: formData.title,
          description: formData.description,
          configuration: formData.configuration,
          base_price: parseFloat(formData.price),
          commission_rate: 20,
          sales_count: 0,
          rating: 0,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      setShowUploadForm(false)
      await loadProducts()
      alert('Diseño subido exitosamente')
    } catch (error) {
      console.error('Error uploading design:', error)
      alert('Error al subir diseño')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-headline font-bold text-gold-500">
              Marketplace de Diseñadores
            </h1>
            {!isDesigner ? (
              <button
                onClick={becomeDesigner}
                className="px-4 py-2 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors font-semibold"
              >
                Conviértete en Diseñador
              </button>
            ) : (
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors font-semibold"
              >
                <Upload size={20} />
                Subir Diseño
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg p-8 mb-8 text-neutral-900">
          <h2 className="text-3xl font-headline font-bold mb-2">
            Diseños Exclusivos de Relojeros Independientes
          </h2>
          <p className="text-lg opacity-90">
            Descubre configuraciones únicas creadas por diseñadores profesionales
          </p>
        </div>

        {/* Stats (solo para diseñadores) */}
        {isDesigner && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Package size={24} />}
              title="Mis Diseños"
              value={products.filter(p => p.designer_id === user?.id).length}
            />
            <StatCard
              icon={<DollarSign size={24} />}
              title="Ventas Totales"
              value={`€${products.filter(p => p.designer_id === user?.id).reduce((sum, p) => sum + (p.sales_count * p.base_price * 0.2), 0).toFixed(2)}`}
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              title="Comisión"
              value="20%"
            />
            <StatCard
              icon={<Star size={24} />}
              title="Rating Promedio"
              value={4.5}
            />
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-headline font-bold mb-6">Subir Nuevo Diseño</h3>
              <UploadForm
                onSubmit={uploadDesign}
                onCancel={() => setShowUploadForm(false)}
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-luxury-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">⌚</div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-headline font-bold text-neutral-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold">{product.rating || 'Nuevo'}</span>
                  </div>
                  <span className="text-sm text-neutral-600">
                    {product.sales_count} ventas
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-headline font-bold text-gold-700">
                    €{product.base_price.toLocaleString('es-ES')}
                  </span>
                  <button className="px-4 py-2 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors font-semibold text-sm">
                    Ver Diseño
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg mb-4">
              Aún no hay diseños en el marketplace
            </p>
            {isDesigner && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-6 py-3 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors font-semibold"
              >
                Sé el Primero en Subir un Diseño
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de formulario de subida
const UploadForm = ({ onSubmit, onCancel }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    configuration: {},
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.price) {
      alert('Por favor completa todos los campos')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Título del Diseño *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
          placeholder="Ej: Classic Gold Heritage"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
          placeholder="Describe tu diseño único..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Precio Base (EUR) *
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
          placeholder="1500"
          min="0"
          step="0.01"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Recibirás 20% de comisión por cada venta
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gold-500 text-neutral-900 rounded-md hover:bg-gold-600 transition-colors font-semibold"
        >
          Subir Diseño
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors font-semibold"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// Componente de estadística
const StatCard = ({ icon, title, value }: any) => (
  <div className="bg-white rounded-lg shadow-card p-6">
    <div className="flex items-center gap-4">
      <div className="bg-gold-500 text-neutral-900 p-3 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-neutral-600">{title}</p>
        <p className="text-2xl font-headline font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  </div>
)

export default MarketplacePage

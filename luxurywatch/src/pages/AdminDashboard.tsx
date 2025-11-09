import { useState, useEffect } from 'react'
import { Package, Users, TrendingUp, DollarSign, ShoppingCart, Clock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Panel de Administración
 * Dashboard completo para gestión del negocio
 */

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si es admin (simplificado - en producción usar roles/claims)
    if (!user) {
      navigate('/')
      return
    }

    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Obtener estadísticas de órdenes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')

      if (ordersError) throw ordersError

      // Calcular estadísticas
      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Obtener total de usuarios
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalOrders,
        totalRevenue,
        totalUsers: usersCount || 0,
        pendingOrders,
        completedOrders,
        averageOrderValue,
      })

      // Obtener órdenes recientes
      const { data: recent } = await supabase
        .from('orders')
        .select('*, user_profiles(email)')
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentOrders(recent || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      // Recargar datos
      await loadDashboardData()
      alert('Estado de orden actualizado')
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error al actualizar orden')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-700">Cargando dashboard...</p>
        </div>
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
              Panel de Administración - LuxuryWatch
            </h1>
            <a href="/" className="text-neutral-600 hover:text-neutral-900">
              Volver al Sitio
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<ShoppingCart size={24} />}
            title="Total Órdenes"
            value={stats.totalOrders}
            color="blue"
          />
          <StatCard
            icon={<DollarSign size={24} />}
            title="Ingresos Totales"
            value={`€${stats.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
            color="green"
          />
          <StatCard
            icon={<Users size={24} />}
            title="Total Usuarios"
            value={stats.totalUsers}
            color="purple"
          />
          <StatCard
            icon={<Clock size={24} />}
            title="Órdenes Pendientes"
            value={stats.pendingOrders}
            color="orange"
          />
          <StatCard
            icon={<Package size={24} />}
            title="Órdenes Completadas"
            value={stats.completedOrders}
            color="teal"
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            title="Valor Promedio"
            value={`€${stats.averageOrderValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
            color="gold"
          />
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-2xl font-headline font-semibold text-neutral-900 mb-6">
            Órdenes Recientes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    ID Orden
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-4 px-4 font-mono text-sm">#{order.id}</td>
                    <td className="py-4 px-4">{order.customer_email || 'N/A'}</td>
                    <td className="py-4 px-4 font-semibold text-gold-700">
                      €{order.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-600">
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border border-neutral-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">Procesando</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recentOrders.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                No hay órdenes aún
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de tarjeta de estadística
interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  color: string
}

const StatCard = ({ icon, title, value, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    gold: 'bg-gold-500',
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="flex items-center gap-4">
        <div className={`${colorClasses[color as keyof typeof colorClasses]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <p className="text-2xl font-headline font-bold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

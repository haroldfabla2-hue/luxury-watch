import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, ScrollArea } from '@/components/ui'
import { 
  Users, 
  Target, 
  Activity, 
  FileText, 
  BarChart3,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

// Tipos actualizados para el nuevo backend
interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  segment: 'VIP' | 'HIGH' | 'MEDIUM' | 'LOW'
  lifetimeValue: number
  totalOrders: number
  averageOrderValue: number
  lastPurchase?: string
  preferredContact: 'EMAIL' | 'SMS' | 'PHONE' | 'WHATSAPP'
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  createdAt: string
  updatedAt: string
}

interface SalesOpportunity {
  id: string
  title: string
  description?: string
  value: number
  stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
  probability: number
  expectedClose?: string
  actualClose?: string
  source?: string
  notes?: string
  customerId: string
  customer?: Customer
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'EMAIL' | 'SMS' | 'SOCIAL' | 'SEARCH' | 'DISPLAY' | 'INFLUENCER' | 'REFERRAL'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate?: string
  targetSegment?: 'VIP' | 'HIGH' | 'MEDIUM' | 'LOW'
  targetCriteria?: any
  budget?: number
  spent: number
  subject?: string
  content?: string
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  totalCustomers: number
  totalOpportunities: number
  totalRevenue: number
  conversionRate: number
  customersBySegment: {
    VIP: number
    HIGH: number
    MEDIUM: number
    LOW: number
  }
  opportunitiesByStage: {
    PROSPECT: number
    QUALIFIED: number
    PROPOSAL: number
    NEGOTIATION: number
    CLOSED_WON: number
    CLOSED_LOST: number
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

const CRMDashboard: React.FC = () => {
  const { user, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados de datos
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const [selectedStage, setSelectedStage] = useState<string>('all')

  // Estados de modales
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showOpportunityModal, setShowOpportunityModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)

  // Formularios
  const [customerForm, setCustomerForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  })

  const [opportunityForm, setOpportunityForm] = useState({
    title: '',
    description: '',
    value: 0,
    customerId: '',
    stage: 'PROSPECT' as SalesOpportunity['stage'],
    expectedClose: '',
    source: '',
    notes: ''
  })

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'EMAIL' as Campaign['type'],
    startDate: '',
    endDate: '',
    targetSegment: 'MEDIUM' as 'VIP' | 'HIGH' | 'MEDIUM' | 'LOW',
    budget: 0,
    subject: '',
    content: ''
  })

  // Verificar permisos
  const canManageCRM = hasRole('admin') || hasRole('manager') || hasRole('sales')

  // Cargar datos iniciales
  useEffect(() => {
    if (canManageCRM) {
      loadDashboardData()
    }
  }, [canManageCRM])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsResponse, customersResponse, opportunitiesResponse, campaignsResponse] = await Promise.all([
        api.getDashboardStats(),
        api.getCustomers(),
        api.getOpportunities(),
        api.getCampaigns()
      ])

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      if (customersResponse.success) {
        setCustomers(customersResponse.data || [])
      }

      if (opportunitiesResponse.success) {
        setOpportunities(opportunitiesResponse.data || [])
      }

      if (campaignsResponse.success) {
        setCampaigns(campaignsResponse.data || [])
      }

    } catch (error) {
      console.error('Error cargando datos del CRM:', error)
      setError('Error cargando datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Funciones de utilidad
  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-800'
      case 'HIGH': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'PROSPECT': return 'bg-gray-100 text-gray-800'
      case 'QUALIFIED': return 'bg-blue-100 text-blue-800'
      case 'PROPOSAL': return 'bg-yellow-100 text-yellow-800'
      case 'NEGOTIATION': return 'bg-orange-100 text-orange-800'
      case 'CLOSED_WON': return 'bg-green-100 text-green-800'
      case 'CLOSED_LOST': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  // Crear cliente
  const handleCreateCustomer = async () => {
    try {
      setLoading(true)
      const response = await api.createCustomer(customerForm)
      
      if (response.success) {
        setCustomers([response.data, ...customers])
        setShowCustomerModal(false)
        setCustomerForm({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          address: '',
          city: '',
          country: '',
          postalCode: ''
        })
        loadDashboardData() // Recargar estadísticas
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error creando cliente:', error)
      setError('Error creando cliente')
    } finally {
      setLoading(false)
    }
  }

  // Crear oportunidad
  const handleCreateOpportunity = async () => {
    try {
      setLoading(true)
      const response = await api.createOpportunity(opportunityForm)
      
      if (response.success) {
        setOpportunities([response.data, ...opportunities])
        setShowOpportunityModal(false)
        setOpportunityForm({
          title: '',
          description: '',
          value: 0,
          customerId: '',
          stage: 'PROSPECT',
          expectedClose: '',
          source: '',
          notes: ''
        })
        loadDashboardData() // Recargar estadísticas
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error creando oportunidad:', error)
      setError('Error creando oportunidad')
    } finally {
      setLoading(false)
    }
  }

  // Crear campaña
  const handleCreateCampaign = async () => {
    try {
      setLoading(true)
      const response = await api.createCampaign(campaignForm)
      
      if (response.success) {
        setCampaigns([response.data, ...campaigns])
        setShowCampaignModal(false)
        setCampaignForm({
          name: '',
          description: '',
          type: 'EMAIL',
          startDate: '',
          endDate: '',
          targetSegment: 'MEDIUM',
          budget: 0,
          subject: '',
          content: ''
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error creando campaña:', error)
      setError('Error creando campaña')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar datos
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment
    return matchesSearch && matchesSegment
  })

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opp.description && opp.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStage = selectedStage === 'all' || opp.stage === selectedStage
    return matchesSearch && matchesStage
  })

  // Si no tiene permisos, mostrar mensaje
  if (!canManageCRM) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-600">
            No tienes permisos para acceder al CRM. Contacta a un administrador.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600">
            Gestión de clientes y oportunidades de venta
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadDashboardData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => setError(null)}
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Estadísticas del Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oportunidades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Tab: Clientes */}
        <TabsContent value="customers" className="space-y-6">
          {/* Filtros y acciones */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los segmentos</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="HIGH">Alto</SelectItem>
                  <SelectItem value="MEDIUM">Medio</SelectItem>
                  <SelectItem value="LOW">Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={customerForm.firstName}
                      onChange={(e) => setCustomerForm({...customerForm, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={customerForm.lastName}
                      onChange={(e) => setCustomerForm({...customerForm, lastName: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={customerForm.country}
                      onChange={(e) => setCustomerForm({...customerForm, country: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCustomerModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCustomer} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Cliente'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de clientes */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segmento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Vida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Órdenes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getSegmentColor(customer.segment)}>
                          {customer.segment}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.lifetimeValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-1">
                          {customer.email && <Mail className="h-4 w-4" />}
                          {customer.phone && <Phone className="h-4 w-4" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Oportunidades */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar oportunidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las etapas</SelectItem>
                  <SelectItem value="PROSPECT">Prospecto</SelectItem>
                  <SelectItem value="QUALIFIED">Calificado</SelectItem>
                  <SelectItem value="PROPOSAL">Propuesta</SelectItem>
                  <SelectItem value="NEGOTIATION">Negociación</SelectItem>
                  <SelectItem value="CLOSED_WON">Cerrado Ganado</SelectItem>
                  <SelectItem value="CLOSED_LOST">Cerrado Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showOpportunityModal} onOpenChange={setShowOpportunityModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Oportunidad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Oportunidad</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={opportunityForm.title}
                      onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={opportunityForm.description}
                      onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      value={opportunityForm.value}
                      onChange={(e) => setOpportunityForm({...opportunityForm, value: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stage">Etapa</Label>
                    <Select value={opportunityForm.stage} onValueChange={(value: any) => setOpportunityForm({...opportunityForm, stage: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROSPECT">Prospecto</SelectItem>
                        <SelectItem value="QUALIFIED">Calificado</SelectItem>
                        <SelectItem value="PROPOSAL">Propuesta</SelectItem>
                        <SelectItem value="NEGOTIATION">Negociación</SelectItem>
                        <SelectItem value="CLOSED_WON">Cerrado Ganado</SelectItem>
                        <SelectItem value="CLOSED_LOST">Cerrado Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="customerId">Cliente</Label>
                    <Select value={opportunityForm.customerId} onValueChange={(value) => setOpportunityForm({...opportunityForm, customerId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expectedClose">Fecha Estimada de Cierre</Label>
                    <Input
                      id="expectedClose"
                      type="date"
                      value={opportunityForm.expectedClose}
                      onChange={(e) => setOpportunityForm({...opportunityForm, expectedClose: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowOpportunityModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateOpportunity} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Oportunidad'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de oportunidades */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oportunidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probabilidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Cierre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOpportunities.map((opportunity) => (
                    <tr key={opportunity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {opportunity.title}
                          </div>
                          {opportunity.description && (
                            <div className="text-sm text-gray-500">
                              {opportunity.description.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.customer ? 
                          `${opportunity.customer.firstName} ${opportunity.customer.lastName}` : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStageColor(opportunity.stage)}>
                          {opportunity.stage.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(opportunity.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.probability}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {opportunity.expectedClose ? formatDate(opportunity.expectedClose) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Otros tabs pueden seguir el mismo patrón... */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Clientes por Segmento</h3>
              {stats && (
                <div className="space-y-2">
                  {Object.entries(stats.customersBySegment).map(([segment, count]) => (
                    <div key={segment} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{segment}</span>
                      <Badge className={getSegmentColor(segment)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Oportunidades por Etapa</h3>
              {stats && (
                <div className="space-y-2">
                  {Object.entries(stats.opportunitiesByStage).map(([stage, count]) => (
                    <div key={stage} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stage.replace('_', ' ')}</span>
                      <Badge className={getStageColor(stage)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Campañas de Marketing</h3>
              <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Campaña
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Campaña</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="campaignName">Nombre</Label>
                      <Input
                        id="campaignName"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="campaignDescription">Descripción</Label>
                      <Textarea
                        id="campaignDescription"
                        value={campaignForm.description}
                        onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaignType">Tipo</Label>
                      <Select value={campaignForm.type} onValueChange={(value: any) => setCampaignForm({...campaignForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="SOCIAL">Redes Sociales</SelectItem>
                          <SelectItem value="SEARCH">Búsqueda</SelectItem>
                          <SelectItem value="DISPLAY">Display</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="targetSegment">Segmento Objetivo</Label>
                      <Select value={campaignForm.targetSegment} onValueChange={(value: any) => setCampaignForm({...campaignForm, targetSegment: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIP">VIP</SelectItem>
                          <SelectItem value="HIGH">Alto</SelectItem>
                          <SelectItem value="MEDIUM">Medio</SelectItem>
                          <SelectItem value="LOW">Bajo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Fecha de Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={campaignForm.startDate}
                        onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Fecha de Fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={campaignForm.endDate}
                        onChange={(e) => setCampaignForm({...campaignForm, endDate: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="budget">Presupuesto</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={campaignForm.budget}
                        onChange={(e) => setCampaignForm({...campaignForm, budget: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateCampaign} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Campaña'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Tipo: {campaign.type}</div>
                    <div>Inicio: {formatDate(campaign.startDate)}</div>
                    {campaign.budget && <div>Presupuesto: {formatCurrency(campaign.budget)}</div>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Analíticas y Reportes</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-medium mb-4">Rendimiento de Ventas</h4>
                <div className="space-y-4">
                  {stats && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Ingresos</span>
                        <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tasa de Conversión</span>
                        <span className="font-medium">{stats.conversionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card className="p-6">
                <h4 className="font-medium mb-4">Actividad Reciente</h4>
                <div className="space-y-2">
                  {stats?.recentActivity.map((activity, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{activity.type}</div>
                      <div className="text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-500">{formatDate(activity.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CRMDashboard
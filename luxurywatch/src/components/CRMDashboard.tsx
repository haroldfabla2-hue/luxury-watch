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
  MoreHorizontal
} from 'lucide-react'

interface Contact {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  tags: string[]
  value: number
  status: 'lead' | 'customer' | 'prospect'
  lastActivity: string
  source: string
}

interface Opportunity {
  id: string
  title: string
  contact: string
  value: number
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  probability: number
  expectedCloseDate: string
  createdAt: string
}

interface Content {
  id: string
  title: string
  slug: string
  type: 'page' | 'blog_post' | 'product' | 'landing_page'
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  author: string
}

export function CRMDashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeOpportunities: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    leadsThisMonth: 0,
    avgDealSize: 0
  })

  const [contacts, setContacts] = useState<Contact[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [content, setContent] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    loadCRMData()
  }, [])

  const loadCRMData = async () => {
    setIsLoading(true)
    try {
      // Simular datos
      const mockContacts: Contact[] = [
        {
          id: '1',
          email: 'john.doe@email.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1 234 567 8900',
          company: 'Tech Corp',
          tags: ['premium', 'vip'],
          value: 5000,
          status: 'customer',
          lastActivity: '2025-11-10',
          source: 'website'
        },
        {
          id: '2',
          email: 'jane.smith@email.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1 234 567 8901',
          company: 'Design Studio',
          tags: ['designer'],
          value: 2500,
          status: 'prospect',
          lastActivity: '2025-11-09',
          source: 'social'
        }
      ]

      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          title: 'Luxury Watch Collection',
          contact: 'John Doe',
          value: 5000,
          stage: 'proposal',
          probability: 75,
          expectedCloseDate: '2025-12-15',
          createdAt: '2025-11-01'
        },
        {
          id: '2',
          title: 'Corporate Watches',
          contact: 'Jane Smith',
          value: 2500,
          stage: 'negotiation',
          probability: 60,
          expectedCloseDate: '2025-11-30',
          createdAt: '2025-11-05'
        }
      ]

      const mockContent: Content[] = [
        {
          id: '1',
          title: 'About LuxuryWatch',
          slug: 'about',
          type: 'page',
          status: 'published',
          createdAt: '2025-11-01',
          updatedAt: '2025-11-10',
          author: 'Admin'
        },
        {
          id: '2',
          title: '10 Best Luxury Watches in 2025',
          slug: 'best-luxury-watches-2025',
          type: 'blog_post',
          status: 'published',
          createdAt: '2025-11-08',
          updatedAt: '2025-11-09',
          author: 'Content Team'
        }
      ]

      setContacts(mockContacts)
      setOpportunities(mockOpportunities)
      setContent(mockContent)
      setStats({
        totalContacts: mockContacts.length,
        activeOpportunities: mockOpportunities.length,
        monthlyRevenue: 12500,
        conversionRate: 12.5,
        leadsThisMonth: 25,
        avgDealSize: 3500
      })
    } catch (error) {
      console.error('Failed to load CRM data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer': return 'bg-green-100 text-green-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      case 'lead': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-gray-100 text-gray-800'
      case 'qualified': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-yellow-100 text-yellow-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed-won': return 'bg-green-100 text-green-800'
      case 'closed-lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CRM Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your contacts, opportunities, and content
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+12%</span>
                </div>
              </div>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOpportunities}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8%</span>
                </div>
              </div>
              <Target className="w-6 h-6 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+15%</span>
                </div>
              </div>
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+2.1%</span>
                </div>
              </div>
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Leads This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.leadsThisMonth}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+23%</span>
                </div>
              </div>
              <Activity className="w-6 h-6 text-cyan-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">${stats.avgDealSize.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">-3%</span>
                </div>
              </div>
              <Target className="w-6 h-6 text-indigo-500" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Contacts</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="prospect">Prospects</SelectItem>
                    <SelectItem value="lead">Leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contacts Table */}
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                          {contact.company && (
                            <p className="text-sm text-gray-500">{contact.company}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${contact.value.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Value</p>
                        </div>
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {contact.phone && (
                            <Button variant="ghost" size="sm">
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Sales Pipeline</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Opportunity
                </Button>
              </div>

              {/* Pipeline Stages */}
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                {['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].map((stage) => (
                  <div key={stage} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {stage.replace('-', ' ')}
                      </h3>
                      <Badge variant="outline">
                        {opportunities.filter(opp => opp.stage === stage).length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {opportunities
                        .filter(opp => opp.stage === stage)
                        .map((opportunity) => (
                          <Card key={opportunity.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-sm text-gray-900 mb-1">
                              {opportunity.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">{opportunity.contact}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">
                                ${opportunity.value.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {opportunity.probability}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                              <div 
                                className="bg-blue-500 h-1 rounded-full" 
                                style={{ width: `${opportunity.probability}%` }}
                              />
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Content Management</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Content
                </Button>
              </div>

              {/* Content Table */}
              <div className="space-y-2">
                {content.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">/{item.slug}</p>
                          <p className="text-xs text-gray-500">
                            By {item.author} • {new Date(item.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {item.type.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Duplicate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[65, 45, 80, 90, 75, 85, 95].map((height, index) => (
                    <div 
                      key={index}
                      className="bg-blue-500 rounded-t"
                      style={{ height: `${height}%`, width: '12%' }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
                <div className="space-y-3">
                  {[
                    { stage: 'Visitors', count: 10000, percentage: 100 },
                    { stage: 'Leads', count: 2500, percentage: 25 },
                    { stage: 'Qualified', count: 1000, percentage: 10 },
                    { stage: 'Customers', count: 250, percentage: 2.5 }
                  ].map((item, index) => (
                    <div key={item.stage} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ 
                            backgroundColor: `hsl(${220 - index * 40}, 70%, 50%)` 
                          }}
                        />
                        <span className="text-sm font-medium">{item.stage}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performing Channels</h3>
                <div className="space-y-3">
                  {[
                    { channel: 'Organic Search', value: 45, color: 'bg-green-500' },
                    { channel: 'Direct', value: 25, color: 'bg-blue-500' },
                    { channel: 'Social Media', value: 15, color: 'bg-purple-500' },
                    { channel: 'Email', value: 10, color: 'bg-orange-500' },
                    { channel: 'Paid Ads', value: 5, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded ${item.color}`} />
                        <span className="text-sm font-medium">{item.channel}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {[
                    { action: 'New lead from website', time: '2 min ago', type: 'lead' },
                    { action: 'Deal closed: Luxury Collection', time: '15 min ago', type: 'deal' },
                    { action: 'Email sent to John Doe', time: '1 hour ago', type: 'email' },
                    { action: 'Phone call with Jane Smith', time: '2 hours ago', type: 'call' },
                    { action: 'Content published: Blog post', time: '3 hours ago', type: 'content' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'lead' ? 'bg-blue-500' :
                        activity.type === 'deal' ? 'bg-green-500' :
                        activity.type === 'email' ? 'bg-purple-500' :
                        activity.type === 'call' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

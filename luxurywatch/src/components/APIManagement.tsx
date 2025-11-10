import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Progress, Switch, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, Textarea, Input, ScrollArea } from '@/components/ui'
import { 
  Plus, 
  Settings, 
  TestTube, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Zap,
  DollarSign,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react'
import { api } from '@/lib/api'

interface APIProvider {
  id: string
  name: string
  displayName: string
  baseUrl: string
  isActive: boolean
  authenticationType: 'bearer' | 'api_key' | 'oauth2'
  apiKey?: string
  capabilities: {
    vision?: boolean
    streaming?: boolean
    maxContext?: number
    text?: boolean
  }
  rateLimits: {
    requestsPerMinute?: number
    tokensPerHour?: number
  }
  costPerToken: number
  healthMetrics: {
    successRate: number
    avgLatency: number
    totalRequests: number
    isHealthy: boolean
    lastCheck: string
  }
  priority: number
}

interface APIModel {
  id: string
  providerId: string
  name: string
  displayName: string
  maxContextTokens: number
  costPerInputToken: number
  costPerOutputToken: number
  capabilities: any
  isActive: boolean
}

export function APIManagement() {
  const [providers, setProviders] = useState<APIProvider[]>([])
  const [models, setModels] = useState<APIModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingProvider, setEditingProvider] = useState<APIProvider | null>(null)
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({})
  const [testResults, setTestResults] = useState<{[key: string]: any}>({})

  // Default providers
  const defaultProviders: Partial<APIProvider>[] = [
    {
      name: 'openai',
      displayName: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      authenticationType: 'bearer',
      capabilities: { vision: true, streaming: true, maxContext: 128000, text: true },
      costPerToken: 0.000002,
      rateLimits: { requestsPerMinute: 3000, tokensPerHour: 40000 }
    },
    {
      name: 'anthropic',
      displayName: 'Anthropic',
      baseUrl: 'https://api.anthropic.com',
      authenticationType: 'bearer',
      capabilities: { vision: true, streaming: true, maxContext: 200000, text: true },
      costPerToken: 0.000008,
      rateLimits: { requestsPerMinute: 1000, tokensPerHour: 20000 }
    },
    {
      name: 'huggingface',
      displayName: 'HuggingFace',
      baseUrl: 'https://api-inference.huggingface.co',
      authenticationType: 'bearer',
      capabilities: { vision: false, streaming: false, maxContext: 32000, text: true },
      costPerToken: 0.0000005,
      rateLimits: { requestsPerMinute: 100, tokensPerHour: 10000 }
    },
    {
      name: 'openrouter',
      displayName: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      authenticationType: 'bearer',
      capabilities: { vision: true, streaming: true, maxContext: 128000, text: true },
      costPerToken: 0.000001,
      rateLimits: { requestsPerMinute: 500, tokensPerHour: 10000 }
    }
  ]

  useEffect(() => {
    loadAPIConfiguration()
  }, [])

  const loadAPIConfiguration = async () => {
    setIsLoading(true)
    try {
      // Cargar proveedores desde la API
      const providersResponse = await api.getAIProviders()
      const providersData = providersResponse.data || []
      
      if (providersData.length === 0) {
        // Si no hay proveedores en la DB, usar los por defecto
        const defaultProvidersData: APIProvider[] = defaultProviders.map((provider, index) => ({
          id: `provider-${index + 1}`,
          ...provider,
          isActive: index < 2, // Primeros 2 activos por defecto
          apiKey: '',
          healthMetrics: {
            successRate: 95 + Math.random() * 5,
            avgLatency: 200 + Math.random() * 300,
            totalRequests: 1000 + Math.floor(Math.random() * 5000),
            isHealthy: Math.random() > 0.1,
            lastCheck: new Date().toISOString()
          },
          priority: index + 1
        })) as APIProvider[]
        
        setProviders(defaultProvidersData)
      } else {
        setProviders(providersData)
      }
      
      // Cargar modelos desde la API
      // Por ahora usar datos por defecto hasta que la API tenga soporte completo
      const mockModels: APIModel[] = [
        {
          id: 'model-1',
          providerId: 'provider-1',
          name: 'gpt-4',
          displayName: 'GPT-4',
          maxContextTokens: 8192,
          costPerInputToken: 0.00003,
          costPerOutputToken: 0.00006,
          capabilities: { vision: true, streaming: true },
          isActive: true
        },
        {
          id: 'model-2',
          providerId: 'provider-1',
          name: 'gpt-3.5-turbo',
          displayName: 'GPT-3.5 Turbo',
          maxContextTokens: 4096,
          costPerInputToken: 0.0000015,
          costPerOutputToken: 0.000002,
          capabilities: { vision: false, streaming: true },
          isActive: true
        },
        {
          id: 'model-3',
          providerId: 'provider-2',
          name: 'claude-3-sonnet',
          displayName: 'Claude 3 Sonnet',
          maxContextTokens: 200000,
          costPerInputToken: 0.000003,
          costPerOutputToken: 0.000015,
          capabilities: { vision: true, streaming: true },
          isActive: true
        }
      ]
      
      setModels(mockModels)
    } catch (error) {
      console.error('Failed to load API configuration:', error)
      // Fallback a datos por defecto en caso de error
      const fallbackProviders: APIProvider[] = defaultProviders.map((provider, index) => ({
        id: `provider-${index + 1}`,
        ...provider,
        isActive: index < 2,
        apiKey: '',
        healthMetrics: {
          successRate: 95 + Math.random() * 5,
          avgLatency: 200 + Math.random() * 300,
          totalRequests: 1000 + Math.floor(Math.random() * 5000),
          isHealthy: Math.random() > 0.1,
          lastCheck: new Date().toISOString()
        },
        priority: index + 1
      })) as APIProvider[]
      
      setProviders(fallbackProviders)
    } finally {
      setIsLoading(false)
    }
  }

  const testProvider = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    if (!provider || !provider.apiKey) {
      setTestResults(prev => ({
        ...prev,
        [providerId]: { success: false, error: 'API key not configured' }
      }))
      return
    }

    setTestResults(prev => ({ ...prev, [providerId]: { loading: true } }))

    try {
      // Probar proveedor real usando la API
      const response = await fetch('/api/chat/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          providerId: providerId,
          apiKey: provider.apiKey
        })
      })

      const result = await response.json()
      
      setTestResults(prev => ({ ...prev, [providerId]: result }))

      // Actualizar métricas de salud con datos reales
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { 
              ...p, 
              healthMetrics: {
                ...p.healthMetrics,
                successRate: result.success ? 100 : 0,
                avgLatency: result.latency || p.healthMetrics.avgLatency,
                isHealthy: result.success,
                lastCheck: new Date().toISOString()
              }
            }
          : p
      ))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [providerId]: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }))
    }
  }

  const saveProvider = async (provider: APIProvider) => {
    try {
      if (provider.id) {
        // Actualizar proveedor existente
        const response = await api.updateProviderSettings(provider.id, {
          name: provider.name,
          displayName: provider.displayName,
          baseUrl: provider.baseUrl,
          apiKey: provider.apiKey,
          authenticationType: provider.authenticationType,
          costPerToken: provider.costPerToken,
          isActive: provider.isActive
        })
        
        if (response.data) {
          setProviders(prev => prev.map(p => p.id === provider.id ? response.data : p))
        }
      } else {
        // Crear nuevo proveedor
        const response = await fetch('/api/chat/providers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: provider.name,
            displayName: provider.displayName,
            baseUrl: provider.baseUrl,
            apiKey: provider.apiKey,
            authenticationType: provider.authenticationType,
            costPerToken: provider.costPerToken
          })
        })
        
        const newProvider = await response.json()
        if (newProvider) {
          setProviders(prev => [...prev, newProvider])
        }
      }
      setEditingProvider(null)
    } catch (error) {
      console.error('Failed to save provider:', error)
      // Fallback a comportamiento local en caso de error
      if (provider.id) {
        setProviders(prev => prev.map(p => p.id === provider.id ? provider : p))
      } else {
        const newProvider = { ...provider, id: `provider-${Date.now()}` }
        setProviders(prev => [...prev, newProvider])
      }
      setEditingProvider(null)
    }
  }

  const deleteProvider = (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId))
  }

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKey(prev => ({ ...prev, [providerId]: !prev[providerId] }))
  }

  const getHealthColor = (isHealthy: boolean, successRate: number) => {
    if (!isHealthy) return 'text-red-500'
    if (successRate < 95) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getHealthIcon = (isHealthy: boolean, successRate: number) => {
    if (!isHealthy) return <AlertCircle className="w-4 h-4" />
    if (successRate < 95) return <AlertCircle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Management</h2>
          <p className="text-gray-600">Configure and monitor your AI providers and models</p>
        </div>
        <Button onClick={() => setEditingProvider({} as APIProvider)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="fallback">Fallback Chain</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
                      <p className="text-sm text-gray-600">{provider.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getHealthIcon(provider.healthMetrics.isHealthy, provider.healthMetrics.successRate)}
                      <Switch 
                        checked={provider.isActive}
                        onCheckedChange={(checked) => 
                          setProviders(prev => prev.map(p => 
                            p.id === provider.id ? { ...p, isActive: checked } : p
                          ))
                        }
                      />
                    </div>
                  </div>

                  {/* Health Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className={getHealthColor(provider.healthMetrics.isHealthy, provider.healthMetrics.successRate)}>
                        {provider.healthMetrics.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={provider.healthMetrics.successRate} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Avg Latency</p>
                      <p className="font-medium">{Math.round(provider.healthMetrics.avgLatency)}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Requests</p>
                      <p className="font-medium">{provider.healthMetrics.totalRequests.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Cost Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Cost: ${provider.costPerToken.toFixed(6)}/token</span>
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(provider.capabilities).map(([key, value]) => 
                      value && (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      )
                    )}
                  </div>

                  {/* API Key Status */}
                  <div className="text-sm">
                    <p className="text-gray-600">API Key</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`font-mono text-xs ${provider.apiKey ? 'text-green-600' : 'text-red-600'}`}>
                        {provider.apiKey 
                          ? `${showApiKey[provider.id] ? provider.apiKey : '••••••••'}${provider.apiKey.slice(-4)}`
                          : 'Not configured'
                        }
                      </span>
                      {provider.apiKey && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(provider.id)}
                        >
                          {showApiKey[provider.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Test Results */}
                  {testResults[provider.id] && (
                    <div className={`p-2 rounded text-xs ${
                      testResults[provider.id].success 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {testResults[provider.id].loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          Testing provider...
                        </div>
                      ) : testResults[provider.id].success ? (
                        `✅ Test successful (${testResults[provider.id].latency}ms)`
                      ) : (
                        `❌ ${testResults[provider.id].error || testResults[provider.id].message}`
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => testProvider(provider.id)}
                      disabled={!provider.apiKey || testResults[provider.id]?.loading}
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingProvider(provider)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Config
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteProvider(provider.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Available Models</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Button>
            </div>
            
            <div className="space-y-3">
              {models.map((model) => {
                const provider = providers.find(p => p.id === model.providerId)
                return (
                  <Card key={model.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{model.displayName}</h4>
                          <p className="text-sm text-gray-600">{model.name}</p>
                        </div>
                        <Badge variant="outline">{provider?.displayName}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Context</p>
                          <p className="font-medium">{model.maxContextTokens.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Input Cost</p>
                          <p className="font-medium">${model.costPerInputToken.toFixed(6)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Output Cost</p>
                          <p className="font-medium">${model.costPerOutputToken.toFixed(6)}</p>
                        </div>
                        <Switch 
                          checked={model.isActive}
                          onCheckedChange={(checked) => 
                            setModels(prev => prev.map(m => 
                              m.id === model.id ? { ...m, isActive: checked } : m
                            ))
                          }
                        />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fallback">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fallback Chain Configuration</h3>
            <p className="text-gray-600 mb-4">
              Configure the order of providers when the primary one fails
            </p>
            <div className="space-y-3">
              {[1, 2, 3].map((priority) => (
                <div key={priority} className="flex items-center gap-3 p-3 border rounded">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {priority}
                  </div>
                  <div className="flex-1">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider..." />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.filter(p => p.isActive && p.apiKey).map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Real-time Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.8%</div>
                  <p className="text-gray-600">Overall Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">245ms</div>
                  <p className="text-gray-600">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">$12.50</div>
                  <p className="text-gray-600">Daily Cost</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Failures</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">OpenAI - Rate limit exceeded</span>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Anthropic - High latency</span>
                  </div>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Provider Edit Dialog */}
      {editingProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingProvider.id ? 'Edit Provider' : 'Add Provider'}
                </h3>
                <Button variant="ghost" onClick={() => setEditingProvider(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editingProvider.name || ''}
                      onChange={(e) => setEditingProvider(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="openai"
                    />
                  </div>
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={editingProvider.displayName || ''}
                      onChange={(e) => setEditingProvider(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                      placeholder="OpenAI"
                    />
                  </div>
                </div>

                <div>
                  <Label>Base URL</Label>
                  <Input
                    value={editingProvider.baseUrl || ''}
                    onChange={(e) => setEditingProvider(prev => prev ? { ...prev, baseUrl: e.target.value } : null)}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey[editingProvider.id || 'new'] ? 'text' : 'password'}
                      value={editingProvider.apiKey || ''}
                      onChange={(e) => setEditingProvider(prev => prev ? { ...prev, apiKey: e.target.value } : null)}
                      placeholder="sk-..."
                    />
                    <Button
                      variant="outline"
                      onClick={() => toggleApiKeyVisibility(editingProvider.id || 'new')}
                    >
                      {showApiKey[editingProvider.id || 'new'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Authentication Type</Label>
                  <Select
                    value={editingProvider.authenticationType || 'bearer'}
                    onValueChange={(value: 'bearer' | 'api_key' | 'oauth2') => 
                      setEditingProvider(prev => prev ? { ...prev, authenticationType: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="oauth2">OAuth2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cost per Token ($)</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={editingProvider.costPerToken || 0}
                    onChange={(e) => setEditingProvider(prev => prev ? { ...prev, costPerToken: parseFloat(e.target.value) } : null)}
                    placeholder="0.000002"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingProvider(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveProvider(editingProvider)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

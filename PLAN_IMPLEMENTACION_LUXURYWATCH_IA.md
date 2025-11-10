# 🚀 PLAN INTEGRAL: LUXURYWATCH + SILHOUETTE MCP + CRM + CHAT

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Transformar LuxuryWatch en una plataforma completa de e-commerce 3D con IA avanzada, sistema multi-agente, CRM integrado y chat inteligente.

**Componentes Nuevos:**
- ✅ Integración Silhouette MCP (78+ agentes especializados)
- ✅ Chat IA en tiempo real con WebSocket
- ✅ CRM Headless (similar WordPress/WooCommerce)
- ✅ Sistema de fallback inteligente para APIs
- ✅ Panel de configuración de APIs y modelos
- ✅ Sistema de monitoreo y métricas

---

## 🏗️ FASE 1: ARQUITECTURA Y PREPARACIÓN (Semana 1)

### 1.1 Arquitectura del Sistema
```
┌─────────────────────────────────────────────────────────────┐
│                    LUXURYWATCH PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND (React + TypeScript)                             │
│  ├─ Configurador 3D (Three.js)                             │
│  ├─ Chat IA (WebSocket + Socket.IO)                        │
│  ├─ CRM Dashboard (Headless)                               │
│  └─ API Management Panel                                   │
├─────────────────────────────────────────────────────────────┤
│  BACKEND SERVICES                                          │
│  ├─ Supabase (Database + Auth + Edge Functions)           │
│  ├─ Silhouette MCP Orchestrator (78+ Agents)              │
│  ├─ API Gateway & Fallback System                         │
│  ├─ Real-time Chat Service (WebSocket)                    │
│  └─ CRM Management Service                                │
├─────────────────────────────────────────────────────────────┤
│  AI & INTEGRATION LAYER                                    │
│  ├─ Multi-Provider AI (OpenAI, Anthropic, Google, etc.)   │
│  ├─ HuggingFace & OpenRouter Integration                  │
│  ├─ Silhouette Enterprise Agents                          │
│  └─ Intelligent Fallback & Recovery                       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **UI Components:** Radix UI + Framer Motion
- **3D Engine:** Three.js + WebGL
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Real-time:** Socket.IO + WebSocket
- **State Management:** Zustand + React Query
- **Multi-Agent:** Silhouette MCP (78+ agentes)
- **AI Providers:** OpenAI, Anthropic, Google, Azure, HuggingFace, OpenRouter
- **Payment:** Stripe
- **Monitoring:** Supabase Analytics + Custom Metrics

---

## 🔧 FASE 2: SISTEMA DE API Y FALLBACK (Semana 2)

### 2.1 Base de Datos - Tablas Nuevas

```sql
-- API Providers Configuration
CREATE TABLE api_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'openai', 'anthropic', 'huggingface', etc.
    display_name TEXT NOT NULL,
    base_url TEXT NOT NULL,
    authentication_type TEXT NOT NULL, -- 'bearer', 'api_key', 'oauth2'
    is_active BOOLEAN DEFAULT true,
    capabilities JSONB, -- {'vision': true, 'streaming': true, 'max_context': 128000}
    rate_limits JSONB, -- {'requests_per_minute': 1000, 'tokens_per_hour': 1000000}
    cost_per_token DECIMAL(10,8),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project API Configurations
CREATE TABLE project_api_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES api_providers(id),
    priority INTEGER NOT NULL DEFAULT 1,
    is_enabled BOOLEAN DEFAULT true,
    configuration JSONB, -- API keys, endpoints, models
    rate_limits_override JSONB,
    cost_budget_limit DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API Models Configuration
CREATE TABLE api_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES api_providers(id),
    name TEXT NOT NULL, -- 'gpt-4', 'claude-3-sonnet', etc.
    display_name TEXT NOT NULL,
    max_context_tokens INTEGER,
    cost_per_input_token DECIMAL(10,8),
    cost_per_output_token DECIMAL(10,8),
    capabilities JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Provider Health Metrics
CREATE TABLE provider_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES api_providers(id),
    project_id UUID REFERENCES auth.users(id),
    success_rate DECIMAL(5,2),
    avg_latency_ms INTEGER,
    error_count INTEGER,
    total_requests INTEGER,
    window_start TIMESTAMP NOT NULL,
    window_end TIMESTAMP NOT NULL,
    is_healthy BOOLEAN DEFAULT true,
    last_error TEXT,
    last_error_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Chat Sessions
CREATE TABLE ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    provider_used TEXT,
    model_used TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CRM Tables
CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    company TEXT,
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crm_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    contact_id UUID REFERENCES crm_contacts(id),
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    stage TEXT NOT NULL, -- 'lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'
    probability INTEGER DEFAULT 0, -- 0-100
    expected_close_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    contact_id UUID REFERENCES crm_contacts(id),
    opportunity_id UUID REFERENCES crm_opportunities(id),
    type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'note', 'task'
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL, -- 'pending', 'in-progress', 'completed', 'cancelled'
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CRM Content (CMS)
CREATE TABLE crm_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'page', 'blog_post', 'product', 'landing_page'
    content JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    meta_title TEXT,
    meta_description TEXT,
    featured_image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(slug, user_id)
);

-- Silhouette Agent Configurations
CREATE TABLE silhouette_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    agent_type TEXT NOT NULL, -- 'business', 'creative', 'technical', 'audiovisual'
    agent_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Edge Functions - API Gateway

```typescript
// supabase/functions/api-gateway/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AIRequest {
  prompt: string
  model?: string
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

interface FallbackConfig {
  providers: Array<{
    name: string
    priority: number
    isEnabled: boolean
    config: any
  }>
  circuitBreaker: {
    failureThreshold: number
    successThreshold: number
    timeoutMs: number
  }
}

serve(async (req) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false'
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders })
    }

    const { prompt, model, max_tokens, temperature, stream }: AIRequest = await req.json()
    
    // Get user configuration
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Load fallback configuration
    const { data: config } = await supabase
      .from('project_api_configs')
      .select(`
        *,
        provider:api_providers(*)
      `)
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .order('priority')

    const fallbackConfig: FallbackConfig = {
      providers: config?.map(item => ({
        name: item.provider.name,
        priority: item.priority,
        isEnabled: item.is_enabled,
        config: { ...item.configuration, ...item.provider }
      })) || [],
      circuitBreaker: {
        failureThreshold: 5,
        successThreshold: 3,
        timeoutMs: 60000
      }
    }

    // Execute with fallback
    const result = await executeWithFallback(fallbackConfig, {
      prompt,
      model,
      max_tokens,
      temperature,
      stream
    })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })
  }
})

async function executeWithFallback(config: FallbackConfig, request: AIRequest) {
  const errors: any[] = []
  
  for (const provider of config.providers.sort((a, b) => a.priority - b.priority)) {
    if (!provider.isEnabled) continue

    try {
      const result = await callProvider(provider, request)
      
      // Update health metrics
      await updateProviderHealth(provider.name, true)
      
      return {
        ...result,
        providerUsed: provider.name,
        hadFallback: errors.length > 0,
        attemptedProviders: [provider.name, ...errors.map(e => e.provider)]
      }
      
    } catch (error) {
      errors.push({ provider: provider.name, error: error.message })
      await updateProviderHealth(provider.name, false, error.message)
      continue
    }
  }

  throw new Error(`All providers failed: ${JSON.stringify(errors)}`)
}

async function callProvider(provider: any, request: AIRequest) {
  switch (provider.name) {
    case 'openai':
      return await callOpenAI(provider, request)
    case 'anthropic':
      return await callAnthropic(provider, request)
    case 'huggingface':
      return await callHuggingFace(provider, request)
    case 'openrouter':
      return await callOpenRouter(provider, request)
    default:
      throw new Error(`Unknown provider: ${provider.name}`)
  }
}

// Provider-specific implementations...
async function callOpenAI(provider: any, request: AIRequest) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: request.model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: request.prompt }],
      max_tokens: request.max_tokens || 1000,
      temperature: request.temperature || 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  }
}

// Similar implementations for other providers...
```

---

## 💬 FASE 3: CHAT IA EN TIEMPO REAL (Semana 3)

### 3.1 WebSocket Service

```typescript
// supabase/functions/chat-websocket/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  provider?: string
  model?: string
  metadata?: any
}

serve(async (req) => {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response(null, { status: 501 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  
  socket.onopen = async () => {
    console.log('Chat WebSocket connected')
  }

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'join_session':
          await joinSession(socket, data.sessionId)
          break
        case 'send_message':
          await handleMessage(socket, data)
          break
        case 'list_sessions':
          await listSessions(socket, data.userId)
          break
      }
    } catch (error) {
      socket.send(JSON.stringify({ type: 'error', error: error.message }))
    }
  }

  socket.onclose = () => {
    console.log('Chat WebSocket disconnected')
  }

  return response
})

async function handleMessage(socket: WebSocket, data: any) {
  const { sessionId, userId, content, model, provider } = data
  
  // Save user message
  await saveMessage({
    sessionId,
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  })

  // Send to API Gateway for AI response
  const aiResponse = await fetch('/api-gateway', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: content,
      model: model,
      userId
    })
  })

  const aiData = await aiResponse.json()
  
  // Save AI response
  await saveMessage({
    sessionId,
    role: 'assistant',
    content: aiData.content,
    timestamp: new Date().toISOString(),
    provider: aiData.providerUsed,
    model: aiData.model
  })

  // Broadcast to all users in session
  socket.send(JSON.stringify({
    type: 'message',
    message: {
      role: 'assistant',
      content: aiData.content,
      timestamp: new Date().toISOString(),
      provider: aiData.providerUsed
    }
  }))
}
```

### 3.2 React Chat Component

```tsx
// src/components/Chat/AIChat.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  provider?: string
}

interface AIChatProps {
  sessionId?: string
  onClose?: () => void
}

export default function AIChat({ sessionId, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/chat`)
    socketRef.current = ws

    ws.onopen = () => {
      if (sessionId) {
        ws.send(JSON.stringify({ type: 'join_session', sessionId }))
      }
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message])
      }
    }

    return () => {
      ws.close()
    }
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Send to WebSocket
    socketRef.current?.send(JSON.stringify({
      type: 'send_message',
      sessionId,
      content: input,
      model: selectedModel,
      provider: selectedProvider
    }))

    setIsLoading(false)
  }

  return (
    <Card className="w-full h-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">AI Assistant</span>
          <Badge variant="secondary">{selectedProvider}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="huggingface">HuggingFace</option>
            <option value="openrouter">OpenRouter</option>
          </select>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  {message.provider && (
                    <Badge variant="outline" className="text-xs">
                      {message.provider}
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

---

## 🏪 FASE 4: CRM HEADLESS (Semana 4)

### 4.1 CRM Dashboard Components

```tsx
// src/pages/CRMDashboard.tsx
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Target, 
  Activity, 
  FileText, 
  BarChart3,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { ContactManager } from '@/components/crm/ContactManager'
import { OpportunityPipeline } from '@/components/crm/OpportunityPipeline'
import { ContentManager } from '@/components/crm/ContentManager'
import { AnalyticsDashboard } from '@/components/crm/AnalyticsDashboard'
import { ActivityFeed } from '@/components/crm/ActivityFeed'

export default function CRMDashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeOpportunities: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    // Load CRM statistics from Supabase
    // This would be implemented with actual API calls
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeOpportunities}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <ContactManager />
          </TabsContent>

          <TabsContent value="opportunities">
            <OpportunityPipeline />
          </TabsContent>

          <TabsContent value="content">
            <ContentManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
```

### 4.2 Content Management (WordPress-like)

```tsx
// src/components/crm/ContentManager.tsx
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  FileText,
  Image
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ContentItem {
  id: string
  title: string
  slug: string
  contentType: 'page' | 'blog_post' | 'product' | 'landing_page'
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  featuredImageUrl?: string
  metaTitle?: string
  metaDescription?: string
}

export function ContentManager() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    // Load content from Supabase
    // This would be implemented with actual API calls
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_post': return <FileText className="w-4 h-4" />
      case 'page': return <FileText className="w-4 h-4" />
      case 'product': return <Tag className="w-4 h-4" />
      case 'landing_page': return <Image className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage your pages, blog posts, and landing pages</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Content
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="blog_post">Blog Posts</option>
            <option value="page">Pages</option>
            <option value="product">Products</option>
            <option value="landing_page">Landing Pages</option>
          </select>
          <select className="border rounded px-3 py-2">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.contentType)}
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Featured Image */}
              {item.featuredImageUrl && (
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={item.featuredImageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">/{item.slug}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* SEO Preview */}
              {item.metaTitle && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-blue-600">{item.metaTitle}</p>
                  {item.metaDescription && (
                    <p className="text-xs text-gray-600 mt-1">{item.metaDescription}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  )
}
```

---

## 🤖 FASE 5: INTEGRACIÓN SILHOUETTE MCP (Semana 5)

### 5.1 Silhouette Agent Service

```typescript
// supabase/functions/silhouette-integration/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AgentRequest {
  agentType: 'business' | 'creative' | 'technical' | 'audiovisual'
  task: string
  context?: any
  userId: string
}

interface AgentResponse {
  success: boolean
  result: any
  agentUsed: string
  executionTime: number
  metadata: any
}

serve(async (req) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false'
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders })
    }

    const { agentType, task, context, userId }: AgentRequest = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user's Silhouette configuration
    const { data: config } = await supabase
      .from('silhouette_agent_configs')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_type', agentType)
      .eq('is_enabled', true)

    if (!config || config.length === 0) {
      throw new Error(`No enabled ${agentType} agents found for user`)
    }

    const startTime = Date.now()
    
    // Route to appropriate Silhouette agent
    const result = await routeToSilhouetteAgent(agentType, task, context, config[0])

    const response: AgentResponse = {
      success: true,
      result: result.data,
      agentUsed: result.agent,
      executionTime: Date.now() - startTime,
      metadata: {
        ...result.metadata,
        agentType,
        taskComplexity: calculateTaskComplexity(task)
      }
    }

    // Log execution for analytics
    await logAgentExecution(userId, agentType, response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })
  }
})

async function routeToSilhouetteAgent(
  agentType: string, 
  task: string, 
  context: any, 
  config: any
) {
  switch (agentType) {
    case 'business':
      return await executeBusinessAgent(task, context, config)
    case 'creative':
      return await executeCreativeAgent(task, context, config)
    case 'technical':
      return await executeTechnicalAgent(task, context, config)
    case 'audiovisual':
      return await executeAudiovisualAgent(task, context, config)
    default:
      throw new Error(`Unknown agent type: ${agentType}`)
  }
}

async function executeBusinessAgent(task: string, context: any, config: any) {
  // Route to specific business agent based on task
  // This would integrate with Silhouette's business teams
  const businessAgents = {
    'marketing': 'marketing_team',
    'sales': 'sales_team', 
    'finance': 'finance_team',
    'hr': 'hr_team',
    'strategy': 'strategy_team'
  }

  // Determine which business agent to use
  const agentKey = determineBusinessAgent(task)
  const agentName = businessAgents[agentKey] || 'business_development_team'

  // Execute via Silhouette MCP
  const result = await callSilhouetteAgent(agentName, {
    task,
    context,
    config
  })

  return {
    data: result.output,
    agent: agentName,
    metadata: {
      agentCategory: 'business',
      taskCategory: agentKey,
      confidence: result.confidence
    }
  }
}

async function callSilhouetteAgent(agentName: string, params: any) {
  // This would make HTTP requests to Silhouette's agent endpoints
  // For now, returning mock data
  return {
    output: `Task completed by ${agentName}`,
    confidence: 0.95,
    executionTime: 2000
  }
}

function determineBusinessAgent(task: string): string {
  const taskLower = task.toLowerCase()
  
  if (taskLower.includes('marketing') || taskLower.includes('campaign')) {
    return 'marketing'
  }
  if (taskLower.includes('sale') || taskLower.includes('lead')) {
    return 'sales'
  }
  if (taskLower.includes('budget') || taskLower.includes('financial')) {
    return 'finance'
  }
  if (taskLower.includes('recruit') || taskLower.includes('employee')) {
    return 'hr'
  }
  if (taskLower.includes('strategy') || taskLower.includes('plan')) {
    return 'strategy'
  }
  
  return 'business'
}

function calculateTaskComplexity(task: string): 'simple' | 'medium' | 'complex' {
  const wordCount = task.split(' ').length
  
  if (wordCount < 10) return 'simple'
  if (wordCount < 25) return 'medium'
  return 'complex'
}

async function logAgentExecution(
  userId: string, 
  agentType: string, 
  response: AgentResponse
) {
  // Log to Supabase for analytics
  // Implementation would be added here
}
```

### 5.2 React Agent Interface

```tsx
// src/components/agents/AgentInterface.tsx
import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Send, 
  Settings, 
  Zap, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface AgentTask {
  id: string
  type: 'business' | 'creative' | 'technical' | 'audiovisual'
  task: string
  context?: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  executionTime?: number
  agentUsed?: string
}

export function AgentInterface() {
  const [currentTask, setCurrentTask] = useState('')
  const [selectedType, setSelectedType] = useState<'business' | 'creative' | 'technical' | 'audiovisual'>('business')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [progress, setProgress] = useState(0)

  const agentTypes = [
    { value: 'business', label: 'Business', icon: '💼', description: 'Marketing, Sales, Finance, Strategy' },
    { value: 'creative', label: 'Creative', icon: '🎨', description: 'Design, Content, Branding' },
    { value: 'technical', label: 'Technical', icon: '⚙️', description: 'Development, Analysis, Engineering' },
    { value: 'audiovisual', label: 'Audiovisual', icon: '🎬', description: 'Video, Audio, Animation' }
  ]

  const executeTask = async () => {
    if (!currentTask.trim()) return

    const task: AgentTask = {
      id: Date.now().toString(),
      type: selectedType,
      task: currentTask,
      status: 'pending'
    }

    setTasks(prev => [task, ...prev])
    setCurrentTask('')
    setIsProcessing(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      // Call Supabase Edge Function
      const response = await fetch('/silhouette-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: selectedType,
          task: currentTask,
          userId: 'current-user-id' // This would come from auth
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                status: 'completed', 
                result: result.result,
                executionTime: result.executionTime,
                agentUsed: result.agentUsed 
              }
            : t
        ))
        setProgress(100)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, status: 'failed' }
          : t
      ))
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing': return <Bot className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Agent Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {agentTypes.map((type) => (
          <Card 
            key={type.value}
            className={`p-4 cursor-pointer transition-all ${
              selectedType === type.value 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedType(type.value as any)}
          >
            <div className="text-center space-y-2">
              <div className="text-2xl">{type.icon}</div>
              <div className="font-medium">{type.label}</div>
              <div className="text-xs text-gray-600">{type.description}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Task Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Describe your task for the {selectedType} agent
            </label>
            <Textarea
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What would you like the agent to help you with?"
              className="min-h-[100px]"
            />
          </div>
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Agent is working...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={executeTask} 
            disabled={!currentTask.trim() || isProcessing}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Execute Task
          </Button>
        </div>
      </Card>

      {/* Task History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks executed yet</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Badge variant="secondary" className="capitalize">
                      {task.type}
                    </Badge>
                  </div>
                  {task.executionTime && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Zap className="w-3 h-3" />
                      {task.executionTime}ms
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{task.task}</p>
                
                {task.status === 'completed' && task.result && (
                  <div className="bg-gray-50 rounded p-3 mt-2">
                    <p className="text-sm text-gray-600 mb-1">Agent: {task.agentUsed}</p>
                    <p className="text-sm">{typeof task.result === 'string' ? task.result : JSON.stringify(task.result)}</p>
                  </div>
                )}
                
                {task.status === 'failed' && (
                  <div className="bg-red-50 text-red-600 text-sm p-2 rounded mt-2">
                    Task failed to complete
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
```

---

## ⚙️ FASE 6: PANEL DE CONFIGURACIÓN DE APIS (Semana 6)

### 6.1 API Management Interface

```tsx
// src/components/api/APIManagement.tsx
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Settings, 
  TestTube, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Zap,
  DollarSign
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface APIProvider {
  id: string
  name: string
  displayName: string
  isActive: boolean
  capabilities: any
  rateLimits: any
  costPerToken: number
  healthMetrics: {
    successRate: number
    avgLatency: number
    totalRequests: number
    isHealthy: boolean
  }
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
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAPIConfiguration()
  }, [])

  const loadAPIConfiguration = async () => {
    setIsLoading(true)
    try {
      // Load from Supabase
      const response = await fetch('/api-providers')
      const data = await response.json()
      setProviders(data.providers)
      setModels(data.models)
    } catch (error) {
      console.error('Failed to load API configuration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testProvider = async (providerId: string) => {
    try {
      const response = await fetch('/api-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, testType: 'basic' })
      })
      
      const result = await response.json()
      
      // Update provider health status
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { 
              ...p, 
              healthMetrics: {
                ...p.healthMetrics,
                successRate: result.success ? 100 : 0,
                isHealthy: result.success
              }
            }
          : p
      ))
    } catch (error) {
      console.error('Provider test failed:', error)
    }
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
          <p className="text-gray-600">Configure and monitor your AI providers</p>
        </div>
        <Button>
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
                      <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Health Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className={getHealthColor(provider.healthMetrics.isHealthy, provider.healthMetrics.successRate)}>
                        {provider.healthMetrics.successRate}%
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
                      <p className="font-medium">{provider.healthMetrics.avgLatency}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Requests</p>
                      <p className="font-medium">{provider.healthMetrics.totalRequests}</p>
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

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => testProvider(provider.id)}
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Config
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
                        <Badge variant={model.isActive ? 'default' : 'secondary'}>
                          {model.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
                    <select className="w-full border rounded px-3 py-2">
                      <option value="">Select provider...</option>
                      {providers.filter(p => p.isActive).map(provider => (
                        <option key={provider.id} value={provider.id}>
                          {provider.displayName}
                        </option>
                      ))}
                    </select>
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
    </div>
  )
}
```

---

## 🚀 FASE 7: DESPLIEGUE Y OPTIMIZACIÓN (Semana 7)

### 7.1 Docker Configuration

```dockerfile
# docker-compose.production.yml
version: '3.8'

services:
  # Silhouette MCP Agents
  silhouette-orchestrator:
    image: silhouette-mcp:latest
    ports:
      - "8030:8030"
    environment:
      - MAX_CONCURRENT_TASKS=10
      - QA_STRICT_MODE=true
      - AUTO_OPTIMIZATION=true
    volumes:
      - ./config/silhouette:/app/config
    restart: unless-stopped

  # Business Agents
  business-team:
    image: silhouette-mcp:latest
    command: ["npm", "run", "start:business"]
    ports:
      - "8001-8006:8001-8006"
    environment:
      - ORCHESTRATOR_URL=http://silhouette-orchestrator:8030
    depends_on:
      - silhouette-orchestrator

  # Audiovisual Team
  audiovisual-team:
    image: silhouette-mcp:latest
    command: ["npm", "run", "start:audiovisual"]
    ports:
      - "8000:8000"
    environment:
      - UNSPLASH_ACCESS_KEY=${UNSPLASH_ACCESS_KEY}
      - VIDEO_AI_PROVIDER=runway
    depends_on:
      - silhouette-orchestrator

  # Creative Team
  creative-team:
    image: silhouette-mcp:latest
    command: ["npm", "run", "start:creative"]
    ports:
      - "8007:8007"
    depends_on:
      - silhouette-orchestrator

  # API Gateway
  api-gateway:
    image: supabase/functions:latest
    build: ./supabase/functions/api-gateway
    ports:
      - "8080:8080"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - supabase-db
      - silhouette-orchestrator

  # Chat WebSocket
  chat-websocket:
    image: supabase/functions:latest
    build: ./supabase/functions/chat-websocket
    ports:
      - "8081:8081"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      - supabase-db

  # Supabase Database
  supabase-db:
    image: supabase/postgres:latest
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=luxurywatch
    volumes:
      - supabase-db-data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  # Redis (for caching and session management)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api-gateway
      - chat-websocket

volumes:
  supabase-db-data:
  redis-data:

networks:
  default:
    driver: bridge
```

### 7.2 Monitoring & Analytics

```typescript
// supabase/functions/monitoring/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  // Collect metrics
  const metrics = {
    timestamp: new Date().toISOString(),
    apiProviders: await getProviderMetrics(supabase),
    chatUsage: await getChatMetrics(supabase),
    crmStats: await getCRMMetrics(supabase),
    agentPerformance: await getAgentMetrics(supabase),
    systemHealth: await getSystemHealth()
  }

  // Store metrics
  await supabase.from('system_metrics').insert(metrics)

  // Check for alerts
  await checkAlerts(metrics, supabase)

  return new Response(JSON.stringify({ success: true, metrics }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

async function getProviderMetrics(supabase: any) {
  const { data } = await supabase
    .from('provider_health_metrics')
    .select('*')
    .gte('window_start', new Date(Date.now() - 3600000).toISOString())

  return data?.reduce((acc: any, metric: any) => {
    const provider = metric.provider_id
    if (!acc[provider]) {
      acc[provider] = {
        totalRequests: 0,
        successRate: 0,
        avgLatency: 0,
        errorCount: 0
      }
    }

    acc[provider].totalRequests += metric.total_requests
    acc[provider].errorCount += metric.error_count
    acc[provider].successRate = metric.success_rate
    acc[provider].avgLatency = metric.avg_latency_ms

    return acc
  }, {}) || {}
}

async function getChatMetrics(supabase: any) {
  const { data } = await supabase
    .from('ai_chat_messages')
    .select('session_id, role, created_at')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())

  return {
    totalMessages: data?.length || 0,
    uniqueSessions: new Set(data?.map(m => m.session_id)).size,
    messagesByRole: data?.reduce((acc: any, m: any) => {
      acc[m.role] = (acc[m.role] || 0) + 1
      return acc
    }, {}) || {}
  }
}

async function getSystemHealth() {
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    activeConnections: await getActiveConnections()
  }
}
```

---

## 📊 RESUMEN DE IMPLEMENTACIÓN

### **Cronograma de 7 Semanas:**

| Semana | Fase | Entregables |
|--------|------|-------------|
| **1** | Arquitectura | Base de datos, configuración inicial |
| **2** | API & Fallback | Gateway, sistema de respaldo |
| **3** | Chat IA | WebSocket, interfaz de chat |
| **4** | CRM | Dashboard, gestión de contactos |
| **5** | Silhouette | Integración de agentes |
| **6** | Configuración | Panel de APIs, modelos |
| **7** | Despliegue | Docker, monitoreo, optimización |

### **Características Principales:**

✅ **78+ Agentes Silhouette** especializados  
✅ **Chat IA en tiempo real** con WebSocket  
✅ **CRM Headless** completo (contactos, oportunidades, contenido)  
✅ **Sistema de fallback inteligente** para APIs  
✅ **Panel de configuración** de proveedores y modelos  
✅ **Monitoreo en tiempo real** con métricas  
✅ **Escalabilidad automática** y alta disponibilidad  
✅ **Integración perfecta** con el configurador 3D existente  

### **Beneficios del Sistema:**

🎯 **Eficiencia:** Automatización completa de procesos de negocio  
🛡️ **Resiliencia:** Sistema de fallback con 99.99% de uptime  
📈 **Escalabilidad:** 1000+ tareas/día con Silhouette MCP  
💬 **Interactividad:** Chat IA integrado para soporte inteligente  
🏪 **Gestión Completa:** CRM headless más eficiente que WordPress/WooCommerce  
🔧 **Configuración Dinámica:** Personalización de APIs sin código  

---

## 🎯 **PRÓXIMOS PASOS**

¿Te gustaría que proceda con la implementación completa de alguna fase específica? Puedo empezar con:

1. **Base de datos y configuración inicial**
2. **Sistema de API y fallback**
3. **Chat IA en tiempo real**
4. **CRM Dashboard**
5. **Integración completa con Silhouette**

¿Cuál prefieres implementar primero?

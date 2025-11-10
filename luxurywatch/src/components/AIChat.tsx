import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Settings, Minimize2, Maximize2 } from 'lucide-react'
import { Button, Input, Card, ScrollArea, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  provider?: string
  model?: string
  metadata?: any
}

interface AIChatProps {
  isOpen?: boolean
  onToggle?: () => void
  sessionId?: string
  position?: 'bottom-right' | 'bottom-left' | 'center'
}

export default function AIChat({ isOpen = true, onToggle, sessionId, position = 'bottom-right' }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Available models and providers
  const models = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    huggingface: ['meta-llama/Llama-2-70b-chat', 'microsoft/DialoGPT-large'],
    openrouter: ['openai/gpt-4', 'anthropic/claude-3-sonnet', 'meta-llama/llama-2-70b']
  }

  const providers = [
    { value: 'openai', label: 'OpenAI', description: 'GPT models, excellent for general tasks' },
    { value: 'anthropic', label: 'Anthropic', description: 'Claude models, great for analysis' },
    { value: 'huggingface', label: 'HuggingFace', description: 'Open source models' },
    { value: 'openrouter', label: 'OpenRouter', description: 'Access to multiple providers' }
  ]

  useEffect(() => {
    if (isOpen && !isMinimized) {
      initializeWebSocket()
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [isOpen, isMinimized, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8081'
    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onopen = () => {
      console.log('Chat WebSocket connected')
      if (sessionId) {
        ws.send(JSON.stringify({ type: 'join_session', sessionId }))
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'message' && data.message) {
          setMessages(prev => [...prev, data.message])
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.error)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = input
    setInput('')
    setIsLoading(true)

    // Send to WebSocket
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'send_message',
        sessionId: sessionId || 'default-session',
        content: messageContent,
        model: selectedModel,
        provider: selectedProvider
      }))
    } else {
      // Fallback to direct API call
      try {
        const response = await fetch('/api-gateway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: messageContent,
            model: selectedModel,
            max_tokens: 1000,
            temperature: 0.7
          })
        })

        const data = await response.json()
        
        if (data.content) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toISOString(),
            provider: data.providerUsed,
            model: selectedModel
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } catch (error) {
        console.error('API call failed:', error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'bottom-4 right-4'
    }
  }

  const getSizeClasses = () => {
    if (isMinimized) {
      return 'w-80 h-16'
    }
    return 'w-96 h-[500px]'
  }

  if (!isOpen) return null

  return (
    <Card className={`fixed z-50 shadow-2xl border-2 border-blue-200 ${getSizeClasses()} ${getPositionClasses()} transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">AI Assistant</span>
            <Badge variant="secondary" className="text-xs">
              {selectedProvider}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Chat Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Provider</label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(provider => (
                          <SelectItem key={provider.value} value={provider.value}>
                            <div>
                              <div className="font-medium">{provider.label}</div>
                              <div className="text-xs text-gray-500">{provider.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models[selectedProvider as keyof typeof models]?.map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            {onToggle && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onToggle}>
                ×
              </Button>
            )}
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 max-h-80">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?</p>
                  <p className="text-xs mt-1">Puedo ayudarte con el configurador, responder preguntas sobre relojes, o asistirte con cualquier tarea.</p>
                </div>
              )}
              
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
                        : message.role === 'system'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : message.role === 'system' ? (
                        <Settings className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      {message.provider && (
                        <Badge variant="outline" className="text-xs">
                          {message.provider}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Presiona Enter para enviar, Shift+Enter para nueva línea
            </p>
          </div>
        </>
      )}
    </Card>
  )
}

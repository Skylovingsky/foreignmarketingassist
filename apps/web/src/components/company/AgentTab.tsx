'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Search, FileText, MessageSquare, Lightbulb, ExternalLink, Copy, Loader2 } from 'lucide-react'

interface CompanyDetail {
  id: string
  companyName: string
  country: string
  industry?: string
  website?: string
  status: 'NEW' | 'CRAWLED' | 'ANALYZED'
  leadScore?: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  citations?: Array<{
    text: string
    source: string
    url?: string
  }>
}

interface AgentTabProps {
  company: CompanyDetail
}

export default function AgentTab({ company }: AgentTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions = [
    {
      icon: Search,
      label: 'Search in evidence',
      prompt: 'Search through all crawled data and find key information about this company'
    },
    {
      icon: FileText,
      label: 'Summarize findings',
      prompt: 'Provide a comprehensive summary of all findings about this company'
    },
    {
      icon: MessageSquare,
      label: 'Generate outreach message',
      prompt: 'Generate a personalized outreach email for this company based on the available data'
    },
    {
      icon: Lightbulb,
      label: 'Propose next step',
      prompt: 'Based on the analysis, what should be the next step for approaching this company?'
    }
  ]

  const handleSendMessage = async (messageContent: string = input) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageContent,
          companyId: company.id,
          context: {
            companyName: company.companyName,
            country: company.country,
            industry: company.industry,
            status: company.status,
            leadScore: company.leadScore
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          citations: data.citations || []
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.message || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
    handleSendMessage(prompt)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 rounded-t-lg">
        <h3 className="font-semibold text-gray-900 mb-2">AI Sales Agent</h3>
        <p className="text-sm text-gray-600">
          Ask questions about {company.companyName} or get assistance with your sales approach.
        </p>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                <action.icon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              message.type === 'user'
                ? 'bg-indigo-600 text-white rounded-lg rounded-br-sm'
                : 'bg-white border border-gray-200 rounded-lg rounded-bl-sm'
            } p-3`}>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              
              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
                  <div className="space-y-1">
                    {message.citations.map((citation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                        <div className="text-xs text-gray-600">
                          <span>{citation.text}</span>
                          {citation.url && (
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 ml-1"
                            >
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Copy button for assistant messages */}
              {message.type === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </button>
              )}
              
              <div className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-indigo-200' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about this company..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="btn-primary flex items-center px-4"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {messages.length > 0 && quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.prompt)}
              disabled={isLoading}
              className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border disabled:opacity-50"
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
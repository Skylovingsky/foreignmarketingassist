'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Copy, Edit, MessageSquare, Mail, Linkedin } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'

interface OutreachMessage {
  type: 'email' | 'linkedin'
  subject: string
  content: string
}

interface CompanyData {
  id: string
  companyName: string
  contactName: string
  email: string
  country: string
  industry?: string
  analysis?: string
}

function OutreachContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companyId = searchParams.get('companyId')
  
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [messages, setMessages] = useState<OutreachMessage[]>([])
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin'>('email')

  useEffect(() => {
    if (companyId) {
      fetchCompanyData(companyId)
    }
  }, [companyId])

  const fetchCompanyData = async (id: string) => {
    try {
      setLoading(true)
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/customers/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setCompany(data.data)
        // 如果已经有分析结果，自动生成开发信
        if (data.data.analysis) {
          generateOutreachMessages(data.data)
        }
      } else {
        console.error('Failed to fetch company data')
      }
    } catch (error) {
      console.error('Error fetching company data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOutreachMessages = async (companyData: CompanyData) => {
    try {
      setGenerating(true)
      
      // 模拟生成个性化开发信 - 实际应该调用AI服务
      const emailMessage: OutreachMessage = {
        type: 'email',
        subject: `合作机会 - ${companyData.companyName} 的外贸业务拓展`,
        content: `尊敬的 ${companyData.contactName}，

我是专业的外贸代理服务提供商，专注于帮助像 ${companyData.companyName} 这样的优质企业拓展国际市场。

根据我们的分析，贵公司在 ${companyData.country} 市场具有很大的发展潜力。我们的服务包括：

• 专业的外贸代理和采购服务
• 国际市场开发和客户挖掘
• 贸易流程优化和风险管控
• 多语言沟通和文化桥梁

我们已经成功帮助众多企业：
- 降低了30%的采购成本
- 提升了50%的国际订单量
- 建立了稳定的全球供应链

希望能有机会与您详细讨论合作的可能性。我们相信通过专业的服务，能够帮助 ${companyData.companyName} 在国际贸易中取得更大的成功。

期待您的回复。

此致
敬礼

[您的姓名]
外贸代理专家
电话: [您的电话]
邮箱: [您的邮箱]`
      }

      const linkedinMessage: OutreachMessage = {
        type: 'linkedin',
        subject: `${companyData.companyName} 的国际贸易拓展机会`,
        content: `您好！

我注意到 ${companyData.companyName} 在 ${companyData.industry || '贵行业'} 领域的优秀表现。作为专业的外贸代理服务商，我们在帮助企业拓展国际市场方面有着丰富的经验。

我们能够为像贵公司这样有实力的企业提供：
✅ 专业的海外市场开发
✅ 高质量的国际客户资源
✅ 完整的贸易流程管理

如果您有兴趣了解更多关于如何优化国际贸易业务的信息，我很乐意与您进一步交流。

期待建立联系！`
      }

      setMessages([emailMessage, linkedinMessage])
    } catch (error) {
      console.error('Error generating messages:', error)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('内容已复制到剪贴板')
  }

  const currentMessage = messages.find(m => m.type === activeTab)

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="card p-6">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">公司信息未找到</h2>
            <p className="text-gray-600 mb-6">无法找到指定的公司信息</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              返回仪表板
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回仪表板
        </button>

        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                开发信生成 - {company.companyName}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{company.country}</span>
                <span>•</span>
                <span>{company.contactName}</span>
                <span>•</span>
                <span>{company.email}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!messages.length && (
                <button
                  onClick={() => generateOutreachMessages(company)}
                  disabled={generating}
                  className="btn-primary flex items-center"
                >
                  {generating ? (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      生成开发信
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message Tabs */}
        {messages.length > 0 && (
          <div className="card">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'email'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  邮件开发信
                </button>
                
                <button
                  onClick={() => setActiveTab('linkedin')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'linkedin'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn消息
                </button>
              </nav>
            </div>

            <div className="p-6">
              {currentMessage && (
                <div className="space-y-6">
                  {/* Subject Line */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主题行
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={currentMessage.subject}
                        onChange={(e) => {
                          const updatedMessages = messages.map(msg => 
                            msg.type === activeTab 
                              ? { ...msg, subject: e.target.value }
                              : msg
                          )
                          setMessages(updatedMessages)
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => copyToClipboard(currentMessage.subject)}
                        className="btn-secondary p-2"
                        title="复制主题"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        消息内容
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(currentMessage.content)}
                          className="btn-secondary flex items-center text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          复制全文
                        </button>
                        <button className="btn-secondary flex items-center text-xs">
                          <Edit className="w-3 h-3 mr-1" />
                          编辑模板
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={currentMessage.content}
                      onChange={(e) => {
                        const updatedMessages = messages.map(msg => 
                          msg.type === activeTab 
                            ? { ...msg, content: e.target.value }
                            : msg
                        )
                        setMessages(updatedMessages)
                      }}
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      提示：您可以直接编辑上面的内容，然后复制到您的邮件客户端或LinkedIn
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => generateOutreachMessages(company)}
                        disabled={generating}
                        className="btn-secondary flex items-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        重新生成
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(`${currentMessage.subject}\n\n${currentMessage.content}`)}
                        className="btn-primary flex items-center"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        复制完整消息
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!messages.length && !generating && (
          <div className="card p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              准备生成个性化开发信
            </h3>
            <p className="text-gray-600 mb-6">
              基于公司分析结果，为 {company.companyName} 生成专业的开发信
            </p>
            <button
              onClick={() => generateOutreachMessages(company)}
              disabled={generating}
              className="btn-primary flex items-center mx-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              开始生成开发信
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OutreachPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <OutreachContent />
    </Suspense>
  )
}
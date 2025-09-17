'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, TrendingUp, Users, Globe, Star, ExternalLink } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import StatusPill from '@/components/common/StatusPill'
import LeadScore from '@/components/common/LeadScore'

interface CompanyAnalysisData {
  id: string
  companyName: string
  website?: string
  country: string
  industry?: string
  status: 'NEW' | 'CRAWLED' | 'ANALYZED'
  leadScore?: number
  analysis?: string
  scoreBreakdown?: {
    personalEmail: number
    directPhone: number
    procurementConfidence: number
    productSimilarity: number
    siteFreshness: number
    belongingConfidence: number
  }
  crawledUrls?: Array<{
    url: string
    title: string
    content: string
    emails: string[]
    phones: string[]
    keywords: string[]
  }>
  contacts?: Array<{
    name: string
    title: string
    email: string
    phone: string
    confidence: number
    source: string
    type: 'personal' | 'generic'
  }>
  lastAnalyzed?: string
  detailedAnalysisReport?: string
}

function AnalysisContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companyId = searchParams.get('companyId')
  
  const [company, setCompany] = useState<CompanyAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (companyId) {
      fetchAnalysisData(companyId)
    }
  }, [companyId])

  const fetchAnalysisData = async (id: string) => {
    try {
      setLoading(true)
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/customers/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setCompany(data.data)
      } else {
        console.error('Failed to fetch analysis data')
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-5 h-5" />
    if (score >= 60) return <BarChart3 className="w-5 h-5" />
    return <Star className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">分析数据未找到</h2>
            <p className="text-gray-600 mb-6">无法找到指定的公司分析数据</p>
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-900 mr-4">
                  {company.companyName}
                </h1>
                <StatusPill status={company.status} size="md" />
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {company.country}
                </span>
                {company.industry && (
                  <>
                    <span>•</span>
                    <span>{company.industry}</span>
                  </>
                )}
                {company.website && (
                  <>
                    <span>•</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-700"
                    >
                      网站
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </>
                )}
              </div>
              
              {company.leadScore !== undefined && (
                <LeadScore score={company.leadScore} size="lg" showLabel />
              )}
            </div>

            {company.lastAnalyzed && (
              <div className="text-right text-sm text-gray-500">
                <div>最后分析时间</div>
                <div className="font-medium">
                  {new Date(company.lastAnalyzed).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analysis Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis Results */}
            {company.analysis && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  AI 分析结果
                </h3>
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {company.analysis}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Analysis Report */}
            {company.detailedAnalysisReport && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  详细商务分析报告
                </h3>
                <div className="prose max-w-none">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                      {company.detailedAnalysisReport}
                    </div>
                  </div>
                  
                  {/* Report Actions */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <div>
                      报告生成时间: {company.lastAnalyzed && new Date(company.lastAnalyzed).toLocaleString('zh-CN')}
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => navigator.clipboard.writeText(company.detailedAnalysisReport || '')}
                        className="text-indigo-600 hover:text-indigo-700 flex items-center"
                      >
                        <span className="mr-1">📋</span> 复制报告
                      </button>
                      <button className="text-green-600 hover:text-green-700 flex items-center">
                        <span className="mr-1">📄</span> 导出PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Score Breakdown */}
            {company.scoreBreakdown && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  详细评分分析
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${getScoreColor(company.scoreBreakdown.personalEmail)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">个人邮箱质量</span>
                      {getScoreIcon(company.scoreBreakdown.personalEmail)}
                    </div>
                    <div className="text-2xl font-bold">
                      {company.scoreBreakdown.personalEmail}%
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getScoreColor(company.scoreBreakdown.directPhone)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">直接联系方式</span>
                      {getScoreIcon(company.scoreBreakdown.directPhone)}
                    </div>
                    <div className="text-2xl font-bold">
                      {company.scoreBreakdown.directPhone}%
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getScoreColor(company.scoreBreakdown.procurementConfidence)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">采购需求匹配</span>
                      {getScoreIcon(company.scoreBreakdown.procurementConfidence)}
                    </div>
                    <div className="text-2xl font-bold">
                      {company.scoreBreakdown.procurementConfidence}%
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getScoreColor(company.scoreBreakdown.productSimilarity)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">产品相关性</span>
                      {getScoreIcon(company.scoreBreakdown.productSimilarity)}
                    </div>
                    <div className="text-2xl font-bold">
                      {company.scoreBreakdown.productSimilarity}%
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getScoreColor(company.scoreBreakdown.siteFreshness)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">网站活跃度</span>
                      {getScoreIcon(company.scoreBreakdown.siteFreshness)}
                    </div>
                    <div className="text-2xl font-bold">
                      {company.scoreBreakdown.siteFreshness}%
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getScoreColor(company.scoreBreakdown.belongingConfidence)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">整体置信度</span>
                      {getScoreIcon(company.scoreBreakdown.belongingConfidence)}
                    </div>
                    <div className="text-2xl font-bold">
                      {company.scoreBreakdown.belongingConfidence}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Crawled URLs Details */}
            {company.crawledUrls && company.crawledUrls.length > 0 && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  网站爬取数据
                </h3>
                <div className="space-y-4">
                  {company.crawledUrls.map((urlData, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {urlData.title || '网站页面'}
                          </h4>
                          <a
                            href={urlData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                          >
                            {urlData.url}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                        
                        <div className="flex space-x-2">
                          {urlData.emails.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {urlData.emails.length} 邮箱
                            </span>
                          )}
                          {urlData.phones.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {urlData.phones.length} 电话
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {urlData.content && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {urlData.content.substring(0, 200)}...
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {company.contacts && company.contacts.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  联系信息
                </h3>
                <div className="space-y-3">
                  {company.contacts.map((contact, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {contact.name}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          contact.type === 'personal' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.type === 'personal' ? '个人' : '通用'}
                        </span>
                      </div>
                      {contact.title && (
                        <div className="text-sm text-gray-600 mb-1">
                          {contact.title}
                        </div>
                      )}
                      <div className="text-sm">
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-gray-600">
                          {contact.phone}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        置信度: {(contact.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            {company.status === 'ANALYZED' && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  分析摘要
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">分析状态:</span>
                    <StatusPill status={company.status} size="sm" />
                  </div>
                  {company.leadScore !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">潜客评分:</span>
                      <span className="font-medium">{company.leadScore}%</span>
                    </div>
                  )}
                  {company.contacts && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">发现联系人:</span>
                      <span className="font-medium">{company.contacts.length} 个</span>
                    </div>
                  )}
                  {company.crawledUrls && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">爬取页面:</span>
                      <span className="font-medium">{company.crawledUrls.length} 个</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/outreach?companyId=${company.id}`)}
                    className="w-full btn-primary"
                  >
                    生成开发信
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  )
}
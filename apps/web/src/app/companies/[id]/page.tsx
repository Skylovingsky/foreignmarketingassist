'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, RefreshCw, MessageSquare, Download, Edit, Globe } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import StatusPill from '@/components/common/StatusPill'
import LeadScore from '@/components/common/LeadScore'
import EvidenceTab from '@/components/company/EvidenceTab'
import PeopleTab from '@/components/company/PeopleTab'
import ScoreTab from '@/components/company/ScoreTab'
import AgentTab from '@/components/company/AgentTab'
import ReportTab from '@/components/company/ReportTab'

interface CompanyDetail {
  id: string
  companyName: string
  country: string
  industry?: string
  website?: string
  status: 'NEW' | 'CRAWLED' | 'ANALYZED'
  leadScore?: number
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
  scoreBreakdown?: {
    personalEmail: number
    directPhone: number
    procurementConfidence: number
    productSimilarity: number
    siteFreshness: number
    belongingConfidence: number
  }
  analysis?: string
  detailedAnalysisReport?: string
  lastAnalyzed?: string
  createdAt: string
}

const tabs = [
  { id: 'evidence', label: 'Evidence' },
  { id: 'people', label: 'People' },
  { id: 'score', label: 'Score' },
  { id: 'agent', label: 'Agent' },
  { id: 'report', label: 'Report' },
]

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('evidence')
  const [refreshing, setRefreshing] = useState(false)
  const [showWebsiteInput, setShowWebsiteInput] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetails(params.id as string)
    }
  }, [params.id])

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      setLoading(true)
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/customers/${companyId}`)
      const data = await response.json()
      
      if (data.success) {
        setCompany(data.data)
      } else {
        console.error('Failed to fetch company details')
      }
    } catch (error) {
      console.error('Error fetching company details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartAnalysis = async () => {
    if (!company) return
    
    try {
      setRefreshing(true)
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/customers/${company.id}/analyze`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        // Refresh company details to show updated data
        await fetchCompanyDetails(company.id)
        console.log('Analysis completed successfully:', result.message)
      } else {
        console.error('Analysis failed:', result.error)
        alert(`分析失败: ${result.message || result.error}`)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      alert('分析过程中发生错误，请稍后重试')
    } finally {
      setRefreshing(false)
    }
  }

  const handleStartOutreach = () => {
    if (!company) return
    router.push(`/outreach?companyId=${company.id}`)
  }

  const handleUpdateWebsite = async () => {
    if (!company || !websiteUrl.trim()) return

    try {
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/customers/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website: websiteUrl.trim()
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // 刷新公司数据
        await fetchCompanyDetails(company.id)
        setShowWebsiteInput(false)
        setWebsiteUrl('')
        alert('网站地址已更新成功')
      } else {
        console.error('Failed to update website:', result.error)
        alert('更新网站地址失败')
      }
    } catch (error) {
      console.error('Error updating website:', error)
      alert('更新网站地址时发生错误')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="card p-6 mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h2>
            <p className="text-gray-600 mb-6">The company you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Company Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-900 mr-4">
                  {company.companyName}
                </h1>
                <StatusPill status={company.status} size="md" />
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
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
                <div className="flex items-center">
                  <span>•</span>
                  {company.website ? (
                    <div className="flex items-center space-x-2 ml-2">
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-700"
                      >
                        网站
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                      <button
                        onClick={() => {
                          setWebsiteUrl(company.website || '')
                          setShowWebsiteInput(true)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="编辑网站"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowWebsiteInput(true)}
                      className="ml-2 text-gray-400 hover:text-indigo-600 flex items-center"
                      title="添加网站"
                    >
                      <span className="text-xs">无网站</span>
                      <Edit className="w-3 h-3 ml-1" />
                    </button>
                  )}
                </div>
              </div>
              
              {company.leadScore !== undefined && (
                <div className="mt-4">
                  <LeadScore score={company.leadScore} size="lg" showLabel />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {company.status === 'NEW' && (
                <button
                  onClick={handleStartAnalysis}
                  disabled={refreshing}
                  className="btn-primary flex items-center"
                >
                  {refreshing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  开始爬取与AI分析
                </button>
              )}

              {(company.status === 'CRAWLED' || company.status === 'ANALYZED') && (
                <button
                  onClick={handleStartAnalysis}
                  disabled={refreshing}
                  className="btn-secondary flex items-center"
                >
                  {refreshing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  重新分析
                </button>
              )}
              
              {company.status === 'ANALYZED' && (
                <button
                  onClick={handleStartOutreach}
                  className="btn-primary flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  开始外联
                </button>
              )}
              
              <button className="btn-secondary flex items-center">
                <Download className="w-4 h-4 mr-2" />
                导出
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'evidence' && (
              <EvidenceTab 
                crawledUrls={company.crawledUrls || []} 
                companyId={company.id}
                onStartAnalysis={handleStartAnalysis}
                isAnalyzing={refreshing}
              />
            )}
            
            {activeTab === 'people' && (
              <PeopleTab 
                contacts={company.contacts || []} 
                companyId={company.id}
              />
            )}
            
            {activeTab === 'score' && (
              <ScoreTab 
                leadScore={company.leadScore || 0}
                scoreBreakdown={company.scoreBreakdown}
                companyId={company.id}
              />
            )}
            
            {activeTab === 'agent' && (
              <AgentTab 
                company={company}
              />
            )}
            
            {activeTab === 'report' && (
              <ReportTab 
                company={company}
              />
            )}
          </div>
        </div>
      </div>

      {/* Website Input Modal */}
      {showWebsiteInput && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {company?.website ? '编辑网站地址' : '添加网站地址'}
                </h3>
                <button
                  onClick={() => {
                    setShowWebsiteInput(false)
                    setWebsiteUrl('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  网站URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  请输入完整的网站地址，包含 http:// 或 https://
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowWebsiteInput(false)
                    setWebsiteUrl('')
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateWebsite}
                  disabled={!websiteUrl.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
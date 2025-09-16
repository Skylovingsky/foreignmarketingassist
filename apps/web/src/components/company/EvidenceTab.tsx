'use client'

import { useState } from 'react'
import { ExternalLink, Mail, Phone, Search, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface CrawledUrl {
  url: string
  title: string
  content: string
  emails: string[]
  phones: string[]
  keywords: string[]
}

interface EvidenceTabProps {
  crawledUrls: CrawledUrl[]
  companyId: string
  onStartAnalysis?: () => void
  isAnalyzing?: boolean
}

export default function EvidenceTab({ crawledUrls, companyId, onStartAnalysis, isAnalyzing = false }: EvidenceTabProps) {
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const toggleExpanded = (url: string) => {
    const newExpanded = new Set(expandedUrls)
    if (newExpanded.has(url)) {
      newExpanded.delete(url)
    } else {
      newExpanded.add(url)
    }
    setExpandedUrls(newExpanded)
  }

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords.length) return text
    
    const keywordRegex = new RegExp(`(${keywords.join('|')})`, 'gi')
    return text.replace(keywordRegex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
  }

  const filteredUrls = crawledUrls.filter(urlData =>
    searchTerm === '' || 
    urlData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    urlData.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    urlData.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!crawledUrls.length) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无爬取数据</h3>
        <p className="text-gray-600 mb-4">
          该公司尚未进行网站爬取和分析
        </p>
        {onStartAnalysis && (
          <button 
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            className="btn-primary flex items-center mx-auto"
          >
            {isAnalyzing ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                正在分析...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                开始爬取与AI分析
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search in evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <ExternalLink className="w-5 h-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">URLs Crawled</p>
              <p className="text-2xl font-bold text-blue-900">{crawledUrls.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Emails Found</p>
              <p className="text-2xl font-bold text-green-900">
                {crawledUrls.reduce((sum, url) => sum + url.emails.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Phones Found</p>
              <p className="text-2xl font-bold text-yellow-900">
                {crawledUrls.reduce((sum, url) => sum + url.phones.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-purple-800">Keywords</p>
              <p className="text-2xl font-bold text-purple-900">
                {crawledUrls.reduce((sum, url) => sum + url.keywords.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crawled URLs */}
      <div className="space-y-4">
        {filteredUrls.map((urlData, index) => {
          const isExpanded = expandedUrls.has(urlData.url)
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {urlData.title || 'Untitled Page'}
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
                  
                  <div className="flex items-center space-x-2">
                    {urlData.emails.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Mail className="w-3 h-3 mr-1" />
                        {urlData.emails.length}
                      </span>
                    )}
                    
                    {urlData.phones.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Phone className="w-3 h-3 mr-1" />
                        {urlData.phones.length}
                      </span>
                    )}
                    
                    <button
                      onClick={() => toggleExpanded(urlData.url)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Extracted Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {urlData.emails.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-green-500" />
                          Emails Found
                        </h5>
                        <div className="space-y-1">
                          {urlData.emails.map((email, idx) => (
                            <div key={idx} className="text-sm">
                              <a href={`mailto:${email}`} className="text-indigo-600 hover:text-indigo-700">
                                {email}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {urlData.phones.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-blue-500" />
                          Phones Found
                        </h5>
                        <div className="space-y-1">
                          {urlData.phones.map((phone, idx) => (
                            <div key={idx} className="text-sm">
                              <a href={`tel:${phone}`} className="text-indigo-600 hover:text-indigo-700">
                                {phone}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {urlData.keywords.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Search className="w-4 h-4 mr-2 text-purple-500" />
                        Keywords Found
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {urlData.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Content Preview */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Content Preview</h5>
                    <div 
                      className="text-sm text-gray-600 bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto"
                      dangerouslySetInnerHTML={{
                        __html: highlightKeywords(
                          urlData.content.substring(0, 500) + (urlData.content.length > 500 ? '...' : ''),
                          urlData.keywords
                        )
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {filteredUrls.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No evidence found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
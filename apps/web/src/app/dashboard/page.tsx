'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, MoreHorizontal, Eye, BarChart3, MessageSquare, RefreshCw } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import StatusPill from '@/components/common/StatusPill'
import LeadScore from '@/components/common/LeadScore'

interface Company {
  id: string
  companyName: string
  country: string
  industry?: string
  website?: string
  status: 'NEW' | 'CRAWLED' | 'ANALYZED'
  leadScore?: number
  contactCount?: number
  lastAnalyzed?: string
  createdAt: string
}

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [countryFilter, setCountryFilter] = useState<string>('ALL')
  const router = useRouter()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/customers?limit=1000`)
      const data = await response.json()
      
      if (data.success) {
        // Transform backend data to frontend format
        const transformedCompanies = data.data.map((company: any) => ({
          id: company.id,
          companyName: company.companyName,
          country: company.country || 'Unknown',
          industry: company.industry,
          website: company.website,
          status: company.analysisStatus || 'NEW',
          leadScore: company.leadScore,
          contactCount: company.contactCount || 0,
          lastAnalyzed: company.lastAnalyzed,
          createdAt: company.createdAt
        }))
        
        setCompanies(transformedCompanies)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || company.status === statusFilter
    const matchesCountry = countryFilter === 'ALL' || company.country === countryFilter
    
    return matchesSearch && matchesStatus && matchesCountry
  })

  const handleCompanyClick = (companyId: string) => {
    router.push(`/companies/${companyId}`)
  }

  const handleStartAnalysis = async (companyId: string) => {
    try {
      const API_BASE = 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev'
      const response = await fetch(`${API_BASE}/api/companies/${companyId}/analyze`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Refresh the company list
        fetchCompanies()
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
    }
  }

  const getUniqueCountries = () => {
    const countrySet = new Set(companies.map(c => c.country))
    const countries = Array.from(countrySet).filter(Boolean).sort()
    return countries
  }

  const getStatusCounts = () => {
    const counts = companies.reduce((acc, company) => {
      acc[company.status] = (acc[company.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total: companies.length,
      new: counts.NEW || 0,
      crawled: counts.CRAWLED || 0,
      analyzed: counts.ANALYZED || 0
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage and analyze your potential leads
            </p>
          </div>
          
          <button
            onClick={fetchCompanies}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-3xl font-bold text-gray-900">{statusCounts.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-3xl font-bold text-gray-500">{statusCounts.new}</p>
              </div>
              <StatusPill status="NEW" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crawled</p>
                <p className="text-3xl font-bold text-blue-600">{statusCounts.crawled}</p>
              </div>
              <StatusPill status="CRAWLED" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Analyzed</p>
                <p className="text-3xl font-bold text-green-600">{statusCounts.analyzed}</p>
              </div>
              <StatusPill status="ANALYZED" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="CRAWLED">Crawled</option>
              <option value="ANALYZED">Analyzed</option>
            </select>
            
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="ALL">All Countries</option>
              {getUniqueCountries().map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Companies Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCompanyClick(company.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.companyName}
                        </div>
                        {company.industry && (
                          <div className="text-sm text-gray-500">
                            {company.industry}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.country}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusPill status={company.status} />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.leadScore !== undefined ? (
                        <LeadScore score={company.leadScore} />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {company.contactCount || 0} contacts
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCompanyClick(company.id)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {company.status === 'NEW' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartAnalysis(company.id)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {company.status === 'ANALYZED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/outreach?companyId=${company.id}`)
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-600">
                  {companies.length === 0 
                    ? "Upload an Excel file to get started"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
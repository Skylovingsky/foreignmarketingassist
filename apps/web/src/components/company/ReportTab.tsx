'use client'

import { Download, Share, Mail, Phone, Globe, MapPin, Building, Users, TrendingUp, Calendar } from 'lucide-react'

interface CompanyDetail {
  id: string
  companyName: string
  country: string
  industry?: string
  website?: string
  status: 'NEW' | 'CRAWLED' | 'ANALYZED'
  leadScore?: number
  lastAnalyzed?: string
  createdAt: string
}

interface ReportTabProps {
  company: CompanyDetail
}

export default function ReportTab({ company }: ReportTabProps) {
  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log('Downloading PDF report for', company.companyName)
  }

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing report for', company.companyName)
  }

  const getRecommendedOutreachChannel = () => {
    // Logic to determine best outreach channel based on available data
    if (company.leadScore && company.leadScore >= 80) {
      return {
        channel: 'Email + LinkedIn',
        reason: 'High-quality personal contacts found',
        priority: 'High'
      }
    } else if (company.leadScore && company.leadScore >= 60) {
      return {
        channel: 'LinkedIn',
        reason: 'Professional network approach recommended',
        priority: 'Medium'
      }
    } else {
      return {
        channel: 'Company Website',
        reason: 'Limited contact information available',
        priority: 'Low'
      }
    }
  }

  const getSuggestedTiming = () => {
    const now = new Date()
    const recommendations = [
      'Tuesday-Thursday, 10 AM - 4 PM local time for optimal response rates',
      'Avoid Monday mornings and Friday afternoons',
      'Consider local holidays and business customs'
    ]
    
    return {
      bestTime: 'Tuesday 10:00 AM - 2:00 PM (Local Time)',
      recommendations
    }
  }

  const outreachChannel = getRecommendedOutreachChannel()
  const timing = getSuggestedTiming()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Sales Report</h3>
          <p className="text-gray-600">Comprehensive analysis for {company.companyName}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn-primary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Company Profile Section */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2 text-indigo-600" />
          Company Profile
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Company Name</label>
              <p className="text-lg font-semibold text-gray-900">{company.companyName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Location</label>
              <p className="text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                {company.country}
              </p>
            </div>
            
            {company.industry && (
              <div>
                <label className="text-sm font-medium text-gray-600">Industry</label>
                <p className="text-gray-900">{company.industry}</p>
              </div>
            )}
            
            {company.website && (
              <div>
                <label className="text-sm font-medium text-gray-600">Website</label>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  {company.website}
                </a>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Lead Score</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{company.leadScore || 0}</span>
                <span className="text-gray-600">/100</span>
                {company.leadScore && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    company.leadScore >= 80 ? 'bg-green-100 text-green-800' :
                    company.leadScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {company.leadScore >= 80 ? 'High Priority' :
                     company.leadScore >= 60 ? 'Medium Priority' : 'Low Priority'}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Analysis Status</label>
              <p className="text-gray-900 capitalize">{company.status.toLowerCase()}</p>
            </div>
            
            {company.lastAnalyzed && (
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {new Date(company.lastAnalyzed).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Line & Business Information */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
          Business Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Product Lines</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Manufacturing and industrial equipment</li>
              <li>• Export/import operations</li>
              <li>• Regional distribution services</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Business Indicators</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Active procurement processes</li>
              <li>• Established supplier relationships</li>
              <li>• Growth trajectory in target market</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Procurement Signals */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-600" />
          Procurement Signals
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">Active Supplier Directory</p>
              <p className="text-sm text-gray-600">Company maintains an active supplier registration portal</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">Procurement Keywords</p>
              <p className="text-sm text-gray-600">Website contains procurement-related terminology and processes</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">Business Growth</p>
              <p className="text-sm text-gray-600">Recent expansion activities indicate increased procurement needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Outreach Strategy */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-indigo-600" />
          Recommended Outreach Strategy
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Primary Channel</h5>
            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
              <p className="font-medium text-indigo-900">{outreachChannel.channel}</p>
              <p className="text-sm text-indigo-700 mt-1">{outreachChannel.reason}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                outreachChannel.priority === 'High' ? 'bg-red-100 text-red-800' :
                outreachChannel.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {outreachChannel.priority} Priority
              </span>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Optimal Timing</h5>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <p className="font-medium text-green-900">{timing.bestTime}</p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                {timing.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Key Recommendations */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Recommendations</h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-indigo-600">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Personalized Approach Required</p>
              <p className="text-sm text-gray-600">
                Research specific decision makers and tailor messaging to their business needs and challenges.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-indigo-600">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Value Proposition Focus</p>
              <p className="text-sm text-gray-600">
                Emphasize cost savings, quality improvements, and supply chain reliability in initial outreach.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-indigo-600">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Follow-up Strategy</p>
              <p className="text-sm text-gray-600">
                Plan for 3-5 touchpoints over 2-3 weeks with varying content types and channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
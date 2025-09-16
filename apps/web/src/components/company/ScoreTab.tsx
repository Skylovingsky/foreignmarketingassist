'use client'

import { useState } from 'react'
import { Info, TrendingUp, Mail, Phone, Search, Globe, Shield, Clock } from 'lucide-react'

interface ScoreBreakdown {
  personalEmail: number
  directPhone: number
  procurementConfidence: number
  productSimilarity: number
  siteFreshness: number
  belongingConfidence: number
}

interface ScoreTabProps {
  leadScore: number
  scoreBreakdown?: ScoreBreakdown
  companyId: string
}

const ScoreGauge = ({ score, size = 120 }: { score: number, size?: number }) => {
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981' // green
    if (score >= 60) return '#F59E0B' // yellow
    if (score >= 40) return '#F97316' // orange
    return '#EF4444' // red
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="gauge-fill"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-sm text-gray-600">Lead Score</span>
      </div>
    </div>
  )
}

const ScoreFactor = ({ 
  icon: Icon, 
  label, 
  score, 
  description, 
  evidence 
}: { 
  icon: any, 
  label: string, 
  score: number, 
  description: string,
  evidence: string[]
}) => {
  const [showEvidence, setShowEvidence] = useState(false)
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 rounded-lg mr-3">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{label}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
            {score}/100
          </span>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Score Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
      
      {/* Evidence */}
      {showEvidence && evidence.length > 0 && (
        <div className="bg-gray-50 p-3 rounded border-t">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Evidence:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            {evidence.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ScoreTab({ leadScore, scoreBreakdown, companyId }: ScoreTabProps) {
  const factors = [
    {
      key: 'personalEmail' as keyof ScoreBreakdown,
      icon: Mail,
      label: 'Personal Email',
      description: 'Availability of personal email addresses',
      evidence: [
        'Found 3 personal email addresses',
        'CEO email directly accessible',
        'Email format follows firstname.lastname pattern'
      ]
    },
    {
      key: 'directPhone' as keyof ScoreBreakdown,
      icon: Phone,
      label: 'Direct Phone',
      description: 'Direct phone numbers found',
      evidence: [
        'Main office phone number available',
        'Sales department direct line found',
        'Phone numbers verified and active'
      ]
    },
    {
      key: 'procurementConfidence' as keyof ScoreBreakdown,
      icon: Search,
      label: 'Procurement Signals',
      description: 'Indicators of active procurement',
      evidence: [
        'Recent tender announcements found',
        'Procurement page on website',
        'Supplier registration portal available'
      ]
    },
    {
      key: 'productSimilarity' as keyof ScoreBreakdown,
      icon: TrendingUp,
      label: 'Product Match',
      description: 'Similarity to your product offering',
      evidence: [
        'Company imports similar products',
        'Product categories align with offerings',
        'Previous purchases in same category'
      ]
    },
    {
      key: 'siteFreshness' as keyof ScoreBreakdown,
      icon: Clock,
      label: 'Site Activity',
      description: 'Recent website and business activity',
      evidence: [
        'Website updated within last month',
        'Recent news and announcements',
        'Active social media presence'
      ]
    },
    {
      key: 'belongingConfidence' as keyof ScoreBreakdown,
      icon: Shield,
      label: 'Data Confidence',
      description: 'Confidence in extracted information',
      evidence: [
        'Multiple sources confirm company data',
        'Official website information',
        'Cross-verified through business directories'
      ]
    }
  ]

  const getScoreSummary = (score: number) => {
    if (score >= 80) return { label: 'Excellent Lead', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 60) return { label: 'Good Lead', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (score >= 40) return { label: 'Average Lead', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { label: 'Poor Lead', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const summary = getScoreSummary(leadScore)

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <ScoreGauge score={leadScore} size={160} />
        <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full ${summary.bg} ${summary.color} font-medium`}>
          {summary.label}
        </div>
        <p className="mt-2 text-gray-600 max-w-lg mx-auto">
          This lead score is calculated based on 6 key factors that indicate the likelihood of successful outreach and conversion.
        </p>
      </div>

      {/* Score Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((factor) => (
            <ScoreFactor
              key={factor.key}
              icon={factor.icon}
              label={factor.label}
              score={scoreBreakdown?.[factor.key] || 0}
              description={factor.description}
              evidence={factor.evidence}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Recommendations to Improve Score
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          {leadScore < 80 && (
            <>
              {(scoreBreakdown?.personalEmail || 0) < 70 && (
                <p>• Search for more personal email addresses through LinkedIn or company directory</p>
              )}
              {(scoreBreakdown?.directPhone || 0) < 70 && (
                <p>• Look for direct phone numbers in contact pages or staff directories</p>
              )}
              {(scoreBreakdown?.procurementConfidence || 0) < 70 && (
                <p>• Research recent procurement activities and tender announcements</p>
              )}
              {(scoreBreakdown?.productSimilarity || 0) < 70 && (
                <p>• Analyze company's product lines and import/export data for better matching</p>
              )}
            </>
          )}
          {leadScore >= 80 && (
            <p>• This is an excellent lead! Consider prioritizing outreach to this company.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button className="btn-primary">
          Start Outreach
        </button>
        <button className="btn-secondary">
          Refresh Score
        </button>
        <button className="btn-secondary">
          Export Report
        </button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { User, Mail, Phone, ExternalLink, Filter, Star, AlertCircle } from 'lucide-react'

interface Contact {
  name: string
  title: string
  email: string
  phone: string
  confidence: number
  source: string
  type: 'personal' | 'generic'
}

interface PeopleTabProps {
  contacts: Contact[]
  companyId: string
}

export default function PeopleTab({ contacts, companyId }: PeopleTabProps) {
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'generic'>('all')
  const [sortBy, setSortBy] = useState<'confidence' | 'name'>('confidence')

  const filteredContacts = contacts.filter(contact => {
    if (filterType === 'all') return true
    return contact.type === filterType
  }).sort((a, b) => {
    if (sortBy === 'confidence') {
      return b.confidence - a.confidence
    }
    return a.name.localeCompare(b.name)
  })

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getTypeColor = (type: string) => {
    return type === 'personal' ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100'
  }

  const formatPhone = (phone: string) => {
    // Simple E.164 formatting
    if (phone.startsWith('+')) return phone
    return phone
  }

  if (!contacts.length) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Contacts Found</h3>
        <p className="text-gray-600 mb-4">
          No contact information has been extracted yet.
        </p>
        <button className="btn-primary">
          Analyze Company
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Contacts</option>
              <option value="personal">Personal Only</option>
              <option value="generic">Generic Only</option>
            </select>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="confidence">Sort by Confidence</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredContacts.length} of {contacts.length} contacts
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Total Contacts</p>
              <p className="text-2xl font-bold text-blue-900">{contacts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Personal Emails</p>
              <p className="text-2xl font-bold text-green-900">
                {contacts.filter(c => c.type === 'personal').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Direct Phones</p>
              <p className="text-2xl font-bold text-yellow-900">
                {contacts.filter(c => c.phone && c.phone !== '').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-purple-800">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-900">
                {Math.round(contacts.reduce((sum, c) => sum + c.confidence, 0) / contacts.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                <p className="text-sm text-gray-600">{contact.title}</p>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(contact.confidence)}`}>
                  {contact.confidence}% confidence
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                  {contact.type}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {contact.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 truncate"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {formatPhone(contact.phone)}
                  </a>
                </div>
              )}
              
              {contact.source && (
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 text-gray-400 mr-2" />
                  <a
                    href={contact.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-800 truncate"
                  >
                    Source
                  </a>
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {contact.email && (
                    <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                      Email
                    </button>
                  )}
                  {contact.phone && (
                    <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                      Call
                    </button>
                  )}
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                    LinkedIn
                  </button>
                </div>
                
                <button className="text-xs text-indigo-600 hover:text-indigo-700">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredContacts.length === 0 && filterType !== 'all' && (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No {filterType} contacts found</p>
        </div>
      )}
    </div>
  )
}
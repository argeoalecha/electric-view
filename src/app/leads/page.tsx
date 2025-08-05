'use client'

import { useState } from 'react'
import HorizontalDashboard from '@/components/Layout/HorizontalDashboard'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  score: number
  region: string
  value: number
  notes: string
  createdAt: string
  lastContact: string
  relationshipLevel: 'baguhan' | 'kilala' | 'malapit' | 'kasama'
}

// Mock Philippine leads data
const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Maria Carmen Santos',
    email: 'maria.santos@ayalaland.com.ph',
    phone: '+639171234567',
    company: 'Ayala Land Inc.',
    position: 'VP Business Development',
    source: 'referral',
    status: 'qualified',
    score: 92,
    region: 'Metro Manila',
    value: 2500000,
    notes: 'High-value enterprise client. Prefers face-to-face meetings. Has decision-making authority.',
    createdAt: '2024-01-10',
    lastContact: '2024-01-15',
    relationshipLevel: 'malapit'
  },
  {
    id: 'lead-002',
    name: 'Jose Miguel Reyes',
    email: 'jose.reyes@techstartmla.ph',
    phone: '+639287654321',
    company: 'TechStart Manila',
    position: 'Chief Technology Officer',
    source: 'website',
    status: 'proposal',
    score: 78,
    region: 'Metro Manila',
    value: 750000,
    notes: 'Tech-savvy startup CTO. Prefers email communication. Interested in API capabilities.',
    createdAt: '2024-01-08',
    lastContact: '2024-01-14',
    relationshipLevel: 'kilala'
  },
  {
    id: 'lead-003',
    name: 'Carmen Dela Cruz',
    email: 'carmen.delacruz@sm.com.ph',
    phone: '+639456789012',
    company: 'SM Retail Group',
    position: 'Senior Manager Operations',
    source: 'cold_outreach',
    status: 'contacted',
    score: 65,
    region: 'Metro Manila',
    value: 5000000,
    notes: 'Large retail chain. Long sales cycle but huge potential. Needs team buy-in.',
    createdAt: '2024-01-12',
    lastContact: '2024-01-16',
    relationshipLevel: 'kilala'
  },
  {
    id: 'lead-004',
    name: 'Roberto Santos',
    email: 'roberto.santos@cebumanuf.ph',
    phone: '+639321234567',
    company: 'Cebu Manufacturing Corp',
    position: 'Plant Manager',
    source: 'trade_show',
    status: 'negotiation',
    score: 85,
    region: 'Cebu',
    value: 1200000,
    notes: 'Regional manufacturing leader. Very punctual. Needs Manila office approval.',
    createdAt: '2024-01-05',
    lastContact: '2024-01-18',
    relationshipLevel: 'malapit'
  },
  {
    id: 'lead-005',
    name: 'Ana Marie Gonzales',
    email: 'ana.gonzales@davaoagri.ph',
    phone: '+639876543210',
    company: 'Davao Agri Solutions',
    position: 'Business Owner',
    source: 'referral',
    status: 'qualified',
    score: 72,
    region: 'Davao del Sur',
    value: 300000,
    notes: 'Family business owner. Prefers personal relationships. Husband involved in decisions.',
    createdAt: '2024-01-09',
    lastContact: '2024-01-17',
    relationshipLevel: 'kilala'
  },
  {
    id: 'lead-006',
    name: 'Juan Carlos Mendoza',
    email: 'juan.mendoza@iloilotech.ph',
    phone: '+639331234567',
    company: 'Iloilo Tech Hub',
    position: 'Managing Director',
    source: 'linkedin',
    status: 'new',
    score: 58,
    region: 'Western Visayas',
    value: 450000,
    notes: 'Growing tech hub in Iloilo. Interested in expanding digital capabilities.',
    createdAt: '2024-01-20',
    lastContact: '2024-01-20',
    relationshipLevel: 'baguhan'
  },
  {
    id: 'lead-007',
    name: 'Luisa Patricia Villanueva',
    email: 'luisa.villanueva@baguiohotels.ph',
    phone: '+639461234567',
    company: 'Baguio Mountain Resorts',
    position: 'Operations Manager',
    source: 'website',
    status: 'contacted',
    score: 69,
    region: 'CAR',
    value: 380000,
    notes: 'Tourism industry. Seasonal business patterns. Interested in customer management.',
    createdAt: '2024-01-11',
    lastContact: '2024-01-19',
    relationshipLevel: 'kilala'
  }
]

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(mockLeads)
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(mockLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('score')

  // Filter and sort leads
  const handleFilterChange = () => {
    let filtered = leads

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(lead => lead.region === regionFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'value') return b.value - a.value
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'company') return a.company.localeCompare(b.company)
      return 0
    })

    setFilteredLeads(filtered)
  }

  // Apply filters when dependencies change
  useState(() => {
    handleFilterChange()
  })

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      new: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-emerald-100 text-emerald-800',
      closed_lost: 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold'
    if (score >= 60) return 'text-yellow-600 font-semibold'
    return 'text-red-600'
  }

  const getRelationshipIcon = (level: Lead['relationshipLevel']) => {
    const icons = {
      baguhan: '👋', // New contact
      kilala: '🤝', // Known contact
      malapit: '❤️', // Close relationship
      kasama: '🏆' // Inner circle
    }
    return icons[level]
  }

  return (
    <HorizontalDashboard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Leads Management</h2>
            <p className="text-teal-100">Manage your Philippine business leads with cultural intelligence</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full hidden sm:inline">
              {filteredLeads.length} leads
            </span>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm">
              + Add New Lead
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Regions</option>
                <option value="Metro Manila">Metro Manila</option>
                <option value="Cebu">Cebu</option>
                <option value="Davao del Sur">Davao del Sur</option>
                <option value="Western Visayas">Western Visayas</option>
                <option value="CAR">CAR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="score">Lead Score</option>
                <option value="value">Deal Value</option>
                <option value="name">Name</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value & Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.company}</div>
                        <div className="text-sm text-gray-500">{lead.position}</div>
                        <div className="text-xs text-gray-400">Source: {lead.source}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                        <div className={`text-sm ${getScoreColor(lead.score)}`}>
                          Score: {lead.score}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">₱{lead.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{lead.region}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getRelationshipIcon(lead.relationshipLevel)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">{lead.relationshipLevel}</div>
                          <div className="text-xs text-gray-500">Last: {lead.lastContact}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-teal-600 hover:text-teal-900">View</button>
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-green-600 hover:text-green-900">Contact</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Total Lead Value</div>
            <div className="text-2xl font-bold text-gray-900">
              ₱{filteredLeads.reduce((sum, lead) => sum + lead.value, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Average Score</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(filteredLeads.reduce((sum, lead) => sum + lead.score, 0) / filteredLeads.length)}
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Metro Manila Leads</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredLeads.filter(lead => lead.region === 'Metro Manila').length}
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">High Score (80+)</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredLeads.filter(lead => lead.score >= 80).length}
            </div>
          </div>
        </div>
      </div>
    </HorizontalDashboard>
  )
}
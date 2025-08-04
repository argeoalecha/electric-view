'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'

interface Deal {
  id: string
  title: string
  company: string
  contactPerson: string
  value: number
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedCloseDate: string
  createdDate: string
  lastActivity: string
  source: string
  region: string
  relationshipStrength: 'developing' | 'good' | 'strong' | 'excellent'
  notes: string
  nextAction: string
  urgency: 'low' | 'medium' | 'high'
  culturalContext: string
}

// Mock Philippine deals data
const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    title: 'Ayala Land CRM Implementation',
    company: 'Ayala Land Inc.',
    contactPerson: 'Maria Carmen Santos',
    value: 2500000,
    stage: 'proposal',
    probability: 75,
    expectedCloseDate: '2024-03-15',
    createdDate: '2024-01-10',
    lastActivity: '2024-01-15',
    source: 'referral',
    region: 'Metro Manila',
    relationshipStrength: 'strong',
    notes: 'Large enterprise deal. Board approval required. Maria has decision-making authority.',
    nextAction: 'Follow up on proposal feedback',
    urgency: 'high',
    culturalContext: 'Prefers formal presentations and detailed ROI analysis'
  },
  {
    id: 'deal-002',
    title: 'TechStart Manila SaaS Integration',
    company: 'TechStart Manila',
    contactPerson: 'Jose Miguel Reyes',
    value: 750000,
    stage: 'negotiation',
    probability: 85,
    expectedCloseDate: '2024-02-28',
    createdDate: '2024-01-08',
    lastActivity: '2024-01-18',
    source: 'website',
    region: 'Metro Manila',
    relationshipStrength: 'excellent',
    notes: 'Tech-savvy CTO, very interested in API capabilities. Budget confirmed.',
    nextAction: 'Final contract review',
    urgency: 'high',
    culturalContext: 'Direct communication style, appreciates technical demos'
  },
  {
    id: 'deal-003',
    title: 'SM Retail Multi-location CRM',
    company: 'SM Retail Group',
    contactPerson: 'Carmen Dela Cruz',
    value: 5000000,
    stage: 'qualified',
    probability: 35,
    expectedCloseDate: '2024-06-30',
    createdDate: '2024-01-12',
    lastActivity: '2024-01-17',
    source: 'cold_outreach',
    region: 'Metro Manila',
    relationshipStrength: 'developing',
    notes: 'Massive potential but long sales cycle. Need to build relationship with operations team.',
    nextAction: 'Schedule stakeholder meeting',
    urgency: 'medium',
    culturalContext: 'Committee-based decisions, requires consensus building'
  },
  {
    id: 'deal-004',
    title: 'Cebu Manufacturing Process Optimization',
    company: 'Cebu Manufacturing Corp',
    contactPerson: 'Roberto Santos',
    value: 1200000,
    stage: 'proposal',
    probability: 65,
    expectedCloseDate: '2024-02-15',
    createdDate: '2024-01-05',
    lastActivity: '2024-01-19',
    source: 'trade_show',
    region: 'Cebu',
    relationshipStrength: 'good',
    notes: 'Roberto is convinced but needs Manila head office approval. Good relationship established.',
    nextAction: 'Present to Manila management',
    urgency: 'high',
    culturalContext: 'Prefers personal relationships, respects hierarchy'
  },
  {
    id: 'deal-005',
    title: 'Davao Agri Digital Transformation',
    company: 'Davao Agri Solutions',
    contactPerson: 'Ana Marie Gonzales',
    value: 300000,
    stage: 'qualified',
    probability: 45,
    expectedCloseDate: '2024-04-15',
    createdDate: '2024-01-09',
    lastActivity: '2024-01-17',
    source: 'referral',
    region: 'Davao del Sur',
    relationshipStrength: 'good',
    notes: 'Family business, husband involved in major decisions. Interested in modernization.',
    nextAction: 'Farm visit with husband present',
    urgency: 'medium',
    culturalContext: 'Family-oriented decisions, values personal relationships'
  },
  {
    id: 'deal-006',
    title: 'Iloilo Tech Hub Expansion Project',
    company: 'Iloilo Tech Hub',
    contactPerson: 'Juan Carlos Mendoza',
    value: 450000,
    stage: 'lead',
    probability: 25,
    expectedCloseDate: '2024-05-30',
    createdDate: '2024-01-20',
    lastActivity: '2024-01-20',
    source: 'linkedin',
    region: 'Western Visayas',
    relationshipStrength: 'developing',
    notes: 'Growing tech hub, interested in expanding digital capabilities.',
    nextAction: 'Initial discovery call',
    urgency: 'low',
    culturalContext: 'Progressive mindset, open to innovation'
  },
  {
    id: 'deal-007',
    title: 'Manila Bay Trading ERP Integration',
    company: 'Manila Bay Trading Co.',
    contactPerson: 'Ricardo De Los Santos',
    value: 950000,
    stage: 'closed_won',
    probability: 100,
    expectedCloseDate: '2024-01-31',
    createdDate: '2023-12-15',
    lastActivity: '2024-01-20',
    source: 'existing_client',
    region: 'Metro Manila',
    relationshipStrength: 'excellent',
    notes: 'Successful implementation completed. Very satisfied client.',
    nextAction: 'Project delivery and training',
    urgency: 'low',
    culturalContext: 'Long-term partnership approach, values reliability'
  },
  {
    id: 'deal-008',
    title: 'Baguio Resorts Customer Management',
    company: 'Baguio Mountain Resorts',
    contactPerson: 'Luisa Patricia Villanueva',
    value: 380000,
    stage: 'proposal',
    probability: 55,
    expectedCloseDate: '2024-03-31',
    createdDate: '2024-01-11',
    lastActivity: '2024-01-19',
    source: 'website',
    region: 'CAR',
    relationshipStrength: 'developing',
    notes: 'Tourism industry with seasonal patterns. Interested in customer lifecycle management.',
    nextAction: 'Tourism industry case study presentation',
    urgency: 'medium',
    culturalContext: 'Seasonal business considerations, cost-conscious'
  }
]

const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export default function DealsPage() {
  const router = useRouter()
  const [deals] = useState<Deal[]>(mockDeals)
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>(mockDeals)
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline')
  const [stageFilter, setStageFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Get unique regions
  const regions = [...new Set(deals.map(d => d.region))]

  // Filter deals
  const handleFilterChange = () => {
    let filtered = deals

    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(deal => deal.stage === stageFilter)
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(deal => deal.region === regionFilter)
    }

    setFilteredDeals(filtered)
  }

  // Apply filters when dependencies change
  useState(() => {
    handleFilterChange()
  })

  const getStageColor = (stage: Deal['stage']) => {
    const colors = {
      lead: 'bg-gray-200 text-gray-800',
      qualified: 'bg-blue-200 text-blue-800',
      proposal: 'bg-yellow-200 text-yellow-800',
      negotiation: 'bg-orange-200 text-orange-800',
      closed_won: 'bg-green-200 text-green-800',
      closed_lost: 'bg-red-200 text-red-800'
    }
    return colors[stage]
  }

  const getUrgencyColor = (urgency: Deal['urgency']) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    }
    return colors[urgency]
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600'
    if (probability >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Group deals by stage for pipeline view
  const dealsByStage = stageOrder.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter(deal => deal.stage === stage)
    return acc
  }, {} as Record<string, Deal[]>)

  // Calculate pipeline stats
  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
  const weightedValue = filteredDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
  const averageDealSize = totalValue / filteredDeals.length || 0

  const breadcrumbs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Deals Pipeline' }
  ]

  const headerActions = (
    <div className="flex items-center space-x-2">
      <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full hidden sm:inline">
        {filteredDeals.length} deals
      </span>
      <button 
        onClick={() => setViewMode('pipeline')}
        className={`px-3 py-2 rounded-lg transition-colors text-sm ${
          viewMode === 'pipeline' 
            ? 'bg-teal-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Pipeline
      </button>
      <button 
        onClick={() => setViewMode('table')}
        className={`px-3 py-2 rounded-lg transition-colors text-sm ${
          viewMode === 'table' 
            ? 'bg-teal-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Table
      </button>
      <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm">
        + Add Deal
      </button>
    </div>
  )

  return (
    <DashboardLayout
      title="Deals Pipeline"
      subtitle="Manage your Philippine business deals and sales opportunities"
      breadcrumbs={breadcrumbs}
      actions={headerActions}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Stages</option>
                <option value="lead">Lead</option>
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
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Pipeline Value</div>
                  <div className="text-lg font-bold text-gray-900">₱{(totalValue / 1000000).toFixed(1)}M</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Weighted Value</div>
                  <div className="text-lg font-bold text-green-600">₱{(weightedValue / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline View */}
        {viewMode === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {stageOrder.map((stage) => (
              <div key={stage} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {stage.replace('_', ' ')}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {dealsByStage[stage]?.length || 0}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {dealsByStage[stage]?.map((deal) => (
                    <div key={deal.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="font-medium text-sm text-gray-900 mb-1">{deal.title}</div>
                      <div className="text-xs text-gray-600 mb-2">{deal.company}</div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900">₱{(deal.value / 1000).toLocaleString()}K</span>
                        <span className={`text-xs font-medium ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{deal.region}</span>
                        <span className={`text-xs font-medium ${getUrgencyColor(deal.urgency)}`}>
                          {deal.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600">Stage Value</div>
                  <div className="text-sm font-bold text-gray-900">
                    ₱{((dealsByStage[stage]?.reduce((sum, deal) => sum + deal.value, 0) || 0) / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                          <div className="text-sm text-gray-500">{deal.contactPerson}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{deal.company}</div>
                          <div className="text-sm text-gray-500">{deal.region}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₱{deal.value.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.expectedCloseDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-teal-600 hover:text-teal-900">View</button>
                          <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Total Pipeline</div>
            <div className="text-2xl font-bold text-gray-900">₱{(totalValue / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Weighted Pipeline</div>
            <div className="text-2xl font-bold text-green-600">₱{(weightedValue / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Average Deal Size</div>
            <div className="text-2xl font-bold text-blue-600">₱{(averageDealSize / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Win Rate</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((dealsByStage.closed_won?.length || 0) / Math.max(filteredDeals.length, 1) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
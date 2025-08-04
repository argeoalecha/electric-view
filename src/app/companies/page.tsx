'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalDashboard from '@/components/Layout/HorizontalDashboard'

interface Company {
  id: string
  name: string
  industry: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  businessType: 'sole_proprietorship' | 'partnership' | 'corporation' | 'cooperative'
  address: string
  city: string
  region: string
  website?: string
  phone: string
  email: string
  tin?: string
  employeeCount: number
  annualRevenue: number
  contactPerson: string
  contactPosition: string
  description: string
  establishedYear: number
  status: 'prospect' | 'client' | 'partner' | 'inactive'
  lastInteraction: string
  relationshipStrength: 'developing' | 'good' | 'strong' | 'excellent'
}

// Mock Philippine companies data
const mockCompanies: Company[] = [
  {
    id: 'comp-001',
    name: 'Ayala Land Inc.',
    industry: 'Real Estate',
    size: 'enterprise',
    businessType: 'corporation',
    address: '6750 Ayala Avenue, Makati CBD',
    city: 'Makati',
    region: 'Metro Manila',
    website: 'www.ayalaland.com.ph',
    phone: '(02) 8845-1234',
    email: 'info@ayalaland.com.ph',
    tin: '000-123-456-000',
    employeeCount: 8000,
    annualRevenue: 50000000000,
    contactPerson: 'Maria Carmen Santos',
    contactPosition: 'VP Business Development',
    description: 'Premier real estate developer in the Philippines, known for sustainable developments and master-planned communities.',
    establishedYear: 1988,
    status: 'prospect',
    lastInteraction: '2024-01-15',
    relationshipStrength: 'strong'
  },
  {
    id: 'comp-002',
    name: 'SM Retail Group',
    industry: 'Retail',
    size: 'enterprise',
    businessType: 'corporation',
    address: 'Mall of Asia Complex, Pasay City',
    city: 'Pasay',
    region: 'Metro Manila',
    website: 'www.sminvestments.com',
    phone: '(02) 8123-4567',
    email: 'corporate@sm.com.ph',
    tin: '000-789-123-000',
    employeeCount: 15000,
    annualRevenue: 25000000000,
    contactPerson: 'Carmen Dela Cruz',
    contactPosition: 'Senior Manager Operations',
    description: 'Leading retail and mall operator in the Philippines with extensive nationwide presence.',
    establishedYear: 1958,
    status: 'prospect',
    lastInteraction: '2024-01-16',
    relationshipStrength: 'developing'
  },
  {
    id: 'comp-003',
    name: 'TechStart Manila',
    industry: 'Technology',
    size: 'startup',
    businessType: 'corporation',
    address: '123 BGC Central, Bonifacio Global City',
    city: 'Taguig',
    region: 'Metro Manila',
    website: 'www.techstartmla.ph',
    phone: '(02) 8555-0123',
    email: 'hello@techstartmla.ph',
    employeeCount: 25,
    annualRevenue: 5000000,
    contactPerson: 'Jose Miguel Reyes',
    contactPosition: 'Chief Technology Officer',
    description: 'Fast-growing fintech startup providing digital payment solutions for Filipino businesses.',
    establishedYear: 2020,
    status: 'client',
    lastInteraction: '2024-01-14',
    relationshipStrength: 'excellent'
  },
  {
    id: 'comp-004',
    name: 'Cebu Manufacturing Corp',
    industry: 'Manufacturing',
    size: 'medium',
    businessType: 'corporation',
    address: 'Lapu-Lapu Industrial Park',
    city: 'Lapu-Lapu',
    region: 'Cebu',
    website: 'www.cebumanuf.ph',
    phone: '(032) 123-4567',
    email: 'info@cebumanuf.ph',
    tin: '000-456-789-000',
    employeeCount: 200,
    annualRevenue: 500000000,
    contactPerson: 'Roberto Santos',
    contactPosition: 'Plant Manager',
    description: 'Electronics manufacturing company serving both local and export markets in Central Visayas.',
    establishedYear: 2005,
    status: 'prospect',
    lastInteraction: '2024-01-18',
    relationshipStrength: 'good'
  },
  {
    id: 'comp-005',
    name: 'Davao Agri Solutions',
    industry: 'Agriculture',
    size: 'small',
    businessType: 'partnership',
    address: 'Davao City Proper',
    city: 'Davao City',
    region: 'Davao del Sur',
    phone: '+639876543210',
    email: 'info@davaoagri.ph',
    employeeCount: 50,
    annualRevenue: 50000000,
    contactPerson: 'Ana Marie Gonzales',
    contactPosition: 'Business Owner',
    description: 'Family-owned agricultural business specializing in organic farming and sustainable practices.',
    establishedYear: 1995,
    status: 'prospect',
    lastInteraction: '2024-01-17',
    relationshipStrength: 'developing'
  },
  {
    id: 'comp-006',
    name: 'Iloilo Tech Hub',
    industry: 'Technology',
    size: 'medium',
    businessType: 'corporation',
    address: 'Iloilo Business Park',
    city: 'Iloilo City',
    region: 'Western Visayas',
    website: 'www.iloilotech.ph',
    phone: '(033) 123-4567',
    email: 'contact@iloilotech.ph',
    employeeCount: 120,
    annualRevenue: 80000000,
    contactPerson: 'Juan Carlos Mendoza',
    contactPosition: 'Managing Director',
    description: 'Regional technology hub providing IT services and digital transformation solutions.',
    establishedYear: 2015,
    status: 'partner',
    lastInteraction: '2024-01-20',
    relationshipStrength: 'good'
  },
  {
    id: 'comp-007',
    name: 'Baguio Mountain Resorts',
    industry: 'Tourism',
    size: 'small',
    businessType: 'corporation',
    address: 'Session Road, Baguio City',
    city: 'Baguio',
    region: 'CAR',
    website: 'www.baguioresorts.ph',
    phone: '(074) 123-4567',
    email: 'reservations@baguioresorts.ph',
    employeeCount: 85,
    annualRevenue: 120000000,
    contactPerson: 'Luisa Patricia Villanueva',
    contactPosition: 'Operations Manager',
    description: 'Premium mountain resort chain catering to both local and international tourists.',
    establishedYear: 2010,
    status: 'prospect',
    lastInteraction: '2024-01-19',
    relationshipStrength: 'developing'
  },
  {
    id: 'comp-008',
    name: 'Manila Bay Trading Co.',
    industry: 'Import/Export',
    size: 'medium',
    businessType: 'corporation',
    address: 'Port Area, Manila',
    city: 'Manila',
    region: 'Metro Manila',
    phone: '(02) 8527-1234',
    email: 'trading@manilabay.ph',
    tin: '000-321-654-000',
    employeeCount: 150,
    annualRevenue: 300000000,
    contactPerson: 'Ricardo De Los Santos',
    contactPosition: 'General Manager',
    description: 'Established trading company specializing in import/export operations across Southeast Asia.',
    establishedYear: 1985,
    status: 'client',
    lastInteraction: '2024-01-13',
    relationshipStrength: 'excellent'
  }
]

export default function CompaniesPage() {
  const router = useRouter()
  const [companies] = useState<Company[]>(mockCompanies)
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(mockCompanies)
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Get unique values for filters
  const industries = [...new Set(companies.map(c => c.industry))]
  const regions = [...new Set(companies.map(c => c.region))]

  // Filter and sort companies
  const handleFilterChange = () => {
    let filtered = companies

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(company => company.industry === industryFilter)
    }

    // Size filter
    if (sizeFilter !== 'all') {
      filtered = filtered.filter(company => company.size === sizeFilter)
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(company => company.region === regionFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'revenue') return b.annualRevenue - a.annualRevenue
      if (sortBy === 'employees') return b.employeeCount - a.employeeCount
      if (sortBy === 'established') return b.establishedYear - a.establishedYear
      return 0
    })

    setFilteredCompanies(filtered)
  }

  // Apply filters when dependencies change
  useState(() => {
    handleFilterChange()
  })

  const getSizeColor = (size: Company['size']) => {
    const colors = {
      startup: 'bg-purple-100 text-purple-800',
      small: 'bg-blue-100 text-blue-800',
      medium: 'bg-green-100 text-green-800',
      large: 'bg-yellow-100 text-yellow-800',
      enterprise: 'bg-red-100 text-red-800'
    }
    return colors[size]
  }

  const getStatusColor = (status: Company['status']) => {
    const colors = {
      prospect: 'bg-gray-100 text-gray-800',
      client: 'bg-green-100 text-green-800',
      partner: 'bg-blue-100 text-blue-800',
      inactive: 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  const getRelationshipColor = (strength: Company['relationshipStrength']) => {
    const colors = {
      developing: 'text-yellow-600',
      good: 'text-blue-600',
      strong: 'text-green-600',
      excellent: 'text-emerald-600'
    }
    return colors[strength]
  }

  const breadcrumbs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Companies Directory' }
  ]

  const headerActions = (
    <div className="flex items-center space-x-3">
      <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full hidden sm:inline">
        {filteredCompanies.length} companies
      </span>
      <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm">
        + Add New Company
      </button>
    </div>
  )

  return (
    <HorizontalDashboard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Companies Directory</h2>
            <p className="text-teal-100">Browse and manage Philippine business companies</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full hidden sm:inline">
              {filteredCompanies.length} companies
            </span>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm">
              + Add New Company
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                value={industryFilter}
                onChange={(e) => {
                  setIndustryFilter(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select
                value={sizeFilter}
                onChange={(e) => {
                  setSizeFilter(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Sizes</option>
                <option value="startup">Startup</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">Enterprise</option>
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
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
                <option value="partner">Partner</option>
                <option value="inactive">Inactive</option>
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
                <option value="name">Company Name</option>
                <option value="revenue">Annual Revenue</option>
                <option value="employees">Employee Count</option>
                <option value="established">Year Established</option>
              </select>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.industry}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSizeColor(company.size)}`}>
                    {company.size}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                    {company.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Location:</span>
                  <span>{company.city}, {company.region}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Revenue:</span>
                  <span>₱{(company.annualRevenue / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Employees:</span>
                  <span>{company.employeeCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Est.:</span>
                  <span>{company.establishedYear}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Contact Person:</span>
                  <span className={`text-sm font-semibold ${getRelationshipColor(company.relationshipStrength)}`}>
                    {company.relationshipStrength}
                  </span>
                </div>
                <div className="text-sm text-gray-900 font-medium">{company.contactPerson}</div>
                <div className="text-sm text-gray-600">{company.contactPosition}</div>
                <div className="text-xs text-gray-500 mt-1">Last contact: {company.lastInteraction}</div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <button className="flex-1 bg-teal-600 text-white py-2 px-3 rounded text-sm hover:bg-teal-700 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-300 transition-colors">
                    Contact
                  </button>
                </div>
              </div>

              {company.website && (
                <div className="mt-2">
                  <a
                    href={`https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:text-teal-800 break-all"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Total Companies</div>
            <div className="text-2xl font-bold text-gray-900">{filteredCompanies.length}</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Active Clients</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredCompanies.filter(c => c.status === 'client').length}
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Metro Manila</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredCompanies.filter(c => c.region === 'Metro Manila').length}
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-purple-600">
              ₱{(filteredCompanies.reduce((sum, c) => sum + c.annualRevenue, 0) / 1000000000).toFixed(1)}B
            </div>
          </div>
        </div>
      </div>
    </HorizontalDashboard>
  )
}
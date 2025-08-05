'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalDashboard from '@/components/Layout/HorizontalDashboard'
import { useCompanies, Company } from '@/hooks/useSupabaseData'

export default function CompaniesPage() {
  const router = useRouter()
  const { companies, loading, error } = useCompanies()
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Get unique values for filters
  const industries = [...new Set(companies.map(c => c.industry).filter((industry): industry is string => Boolean(industry)))]
  const regions = [...new Set(companies.map(c => c.region).filter((region): region is string => Boolean(region)))]

  // Filter and sort companies
  const handleFilterChange = () => {
    let filtered = companies

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.city && company.city.toLowerCase().includes(searchTerm.toLowerCase()))
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
      if (sortBy === 'revenue') return (b.annual_revenue || 0) - (a.annual_revenue || 0)
      if (sortBy === 'employees') return (b.employee_count || 0) - (a.employee_count || 0)
      if (sortBy === 'established') return (b.established_year || 0) - (a.established_year || 0)
      return 0
    })

    setFilteredCompanies(filtered)
  }

  // Apply filters when dependencies change
  useEffect(() => {
    if (companies.length > 0) {
      handleFilterChange()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, searchTerm, industryFilter, sizeFilter, regionFilter, statusFilter, sortBy])

  const getSizeColor = (size: Company['size']) => {
    const colors = {
      startup: 'bg-purple-100 text-purple-800',
      small: 'bg-blue-100 text-blue-800',
      medium: 'bg-green-100 text-green-800',
      large: 'bg-yellow-100 text-yellow-800',
      enterprise: 'bg-red-100 text-red-800'
    }
    return size ? colors[size] : 'bg-gray-100 text-gray-800'
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

  const getRelationshipColor = (strength: string) => {
    const colors: Record<string, string> = {
      developing: 'text-yellow-600',
      good: 'text-blue-600',
      strong: 'text-green-600',
      excellent: 'text-emerald-600'
    }
    return colors[strength] || 'text-gray-600'
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

  if (loading) {
    return (
      <HorizontalDashboard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading companies...</p>
            </div>
          </div>
        </div>
      </HorizontalDashboard>
    )
  }

  if (error) {
    return (
      <HorizontalDashboard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-600 mb-2">⚠️ Database Connection Issue</div>
              <p className="text-gray-600 mb-4">Running in demo mode with sample data</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </HorizontalDashboard>
    )
  }

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
                  <span>₱{((company.annual_revenue || 0) / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Employees:</span>
                  <span>{(company.employee_count || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-16 font-medium">Est.:</span>
                  <span>{company.established_year || 'N/A'}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                    {company.status}
                  </span>
                </div>
                <div className="text-sm text-gray-900 font-medium">Primary Contact</div>
                <div className="text-sm text-gray-600">See Contacts section</div>
                <div className="text-xs text-gray-500 mt-1">Created: {new Date(company.created_at).toLocaleDateString()}</div>
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
              ₱{(filteredCompanies.reduce((sum, c) => sum + (c.annual_revenue || 0), 0) / 1000000000).toFixed(1)}B
            </div>
          </div>
        </div>
      </div>
    </HorizontalDashboard>
  )
}
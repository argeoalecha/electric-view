'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/supabase-provider'
import DashboardLayout from '@/components/Layout/DashboardLayout'

interface OrganizationData {
  name: string
  businessType: string
  industry: string
  city: string
  province: string
  tin?: string
  website?: string
  description?: string
  employeeCount: string
  annualRevenue: string
}

const philippineProvinces = [
  'Metro Manila', 'Cebu', 'Davao del Sur', 'Laguna', 'Cavite', 'Bulacan', 
  'Rizal', 'Pangasinan', 'Batangas', 'Pampanga', 'Western Visayas', 'CAR',
  'Central Luzon', 'Calabarzon', 'Bicol Region', 'Eastern Visayas', 
  'Northern Mindanao', 'Davao Region', 'Soccsksargen', 'Caraga', 'BARMM'
]

const businessTypes = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'cooperative', label: 'Cooperative' }
]

const industries = [
  'Technology', 'Real Estate', 'Retail', 'Manufacturing', 'Healthcare',
  'Education', 'Financial Services', 'Tourism', 'Agriculture', 'Mining',
  'Transportation', 'Construction', 'Food & Beverage', 'Telecommunications',
  'Energy', 'Media', 'Professional Services', 'Government', 'Non-Profit'
]

const employeeRanges = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
]

const revenueRanges = [
  { value: 'under-1m', label: 'Under ₱1M' },
  { value: '1m-10m', label: '₱1M - ₱10M' },
  { value: '10m-50m', label: '₱10M - ₱50M' },
  { value: '50m-100m', label: '₱50M - ₱100M' },
  { value: '100m-500m', label: '₱100M - ₱500M' },
  { value: '500m+', label: '₱500M+' }
]

export default function OrganizationSetup() {
  const router = useRouter()
  const { supabase, user, isDemo } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [orgData, setOrgData] = useState<OrganizationData>({
    name: '',
    businessType: 'corporation',
    industry: '',
    city: '',
    province: 'Metro Manila',
    tin: '',
    website: '',
    description: '',
    employeeCount: '1-10',
    annualRevenue: 'under-1m'
  })

  const handleInputChange = (field: keyof OrganizationData, value: string) => {
    setOrgData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (!orgData.name || !orgData.industry) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setStep(2)
  }

  const handleCreateOrganization = async () => {
    setLoading(true)
    setError('')

    try {
      if (isDemo) {
        // Demo mode - simulate organization creation
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
        return
      }

      // Create organization in Supabase
      const { data: orgResult, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          business_type: orgData.businessType,
          industry: orgData.industry,
          city: orgData.city,
          province: orgData.province,
          tin: orgData.tin,
          website: orgData.website,
          description: orgData.description,
          employee_count: orgData.employeeCount,
          annual_revenue: orgData.annualRevenue,
          owner_id: user?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (orgError) {
        setError(orgError.message)
        return
      }

      // Create user profile linked to organization
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user?.id,
          organization_id: orgResult.id,
          role: 'owner',
          full_name: user?.user_metadata?.full_name || '',
          created_at: new Date().toISOString()
        })

      if (profileError) {
        setError(profileError.message)
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')

    } catch (err: any) {
      setError('Failed to create organization. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { name: 'Setup', href: '/setup' },
    { name: 'Organization Setup' }
  ]

  return (
    <DashboardLayout
      title="Organization Setup"
      subtitle="Set up your Philippine business organization"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 transition-colors ${
              step >= 2 ? 'bg-teal-600' : 'bg-gray-300'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 max-w-40 mx-auto">
            <span>Basic Info</span>
            <span>Details</span>
          </div>
        </div>

        {step === 1 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={orgData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Your Company Inc."
                  required
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={orgData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                >
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={orgData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select an industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={orgData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="Makati"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province/Region
                  </label>
                  <select
                    value={orgData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  >
                    {philippineProvinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Demo Mode Warning */}
              {isDemo && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-800">Demo mode - organization will not be saved</span>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleNextStep}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Continue →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Details</h2>
            
            <div className="space-y-6">
              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={orgData.employeeCount}
                  onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                >
                  {employeeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Annual Revenue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue (Approximate)
                </label>
                <select
                  value={orgData.annualRevenue}
                  onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                >
                  {revenueRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* TIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TIN (Tax Identification Number)
                </label>
                <input
                  type="text"
                  value={orgData.tin}
                  onChange={(e) => handleInputChange('tin', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="000-000-000-000"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={orgData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="https://www.yourcompany.ph"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={orgData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  rows={3}
                  placeholder="Brief description of your business..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Demo Mode Warning */}
              {isDemo && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-800">Demo mode - organization will not be saved</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateOrganization}
                  disabled={loading}
                  className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Creating Organization...' : 'Create Organization'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
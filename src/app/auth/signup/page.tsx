'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/providers/supabase-provider'

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

export default function SignUp() {
  const router = useRouter()
  const { supabase, hasValidConfig } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [checkingConfig, setCheckingConfig] = useState(true)

  // User fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Organization fields
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('corporation')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('Metro Manila')
  const [tin, setTin] = useState('')
  const [industry, setIndustry] = useState('')

  useEffect(() => {
    setCheckingConfig(false)
  }, [])

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate step 1
    if (!email || !password || !fullName) {
      setError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setError('')
    setStep(2)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!hasValidConfig) {
        // For demo mode, simulate successful signup
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
        return
      }

      // Create user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            business_type: businessType,
            city,
            province,
            tin,
            industry,
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    router.push('/demo')
  }

  const handleSetupSupabase = () => {
    router.push('/setup')
  }

  // Show loading while checking config
  if (checkingConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300 mx-auto" />
          <p className="mt-4 text-teal-100">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🇵🇭</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Philippine CRM
          </h1>
          <p className="text-teal-100">
            {step === 1 ? 'Create your account' : 'Company information'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 1 ? 'bg-white text-teal-600' : 'bg-teal-700 text-teal-200'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 transition-colors ${
              step >= 2 ? 'bg-white' : 'bg-teal-700'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 2 ? 'bg-white text-teal-600' : 'bg-teal-700 text-teal-200'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-teal-200">
            <span>Personal Info</span>
            <span>Company Info</span>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-8">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                  placeholder="juan.delacruz@company.ph"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Next Button */}
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium mobile-touch-target"
              >
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                  placeholder="Your Company Inc."
                  required
                />
              </div>

              {/* Business Type */}
              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  id="businessType"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
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
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  id="industry"
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                  placeholder="e.g., Technology, Retail, Manufacturing"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                    placeholder="Makati"
                  />
                </div>

                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                    Province/Region
                  </label>
                  <select
                    id="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  >
                    {philippineProvinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TIN (Optional) */}
              <div>
                <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-2">
                  TIN (Optional)
                </label>
                <input
                  id="tin"
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors mobile-text-size"
                  placeholder="000-000-000-000"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* No Config Warning */}
              {!hasValidConfig && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-800">Demo mode - account will not be saved</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mobile-touch-target"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link
              href="/auth/signin"
              className="text-teal-600 hover:text-teal-500 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Demo Mode Option */}
          <div className="mt-4 text-center">
            <button
              onClick={handleDemoMode}
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              🚀 Try demo mode instead
            </button>
          </div>

          {/* Setup Link */}
          {!hasValidConfig && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSetupSupabase}
                className="text-teal-600 hover:text-teal-800 text-sm transition-colors underline"
              >
                Set up Supabase connection
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-teal-100">
          <p>Built for Philippine businesses with cultural intelligence</p>
        </div>
      </div>
    </div>
  )
}
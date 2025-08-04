'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/providers/supabase-provider'

export default function SignIn() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasValidConfig, setHasValidConfig] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if we have valid Supabase configuration
    const checkConfig = () => {
      try {
        const storedConfig = localStorage.getItem('supabase_config')
        if (storedConfig) {
          const config = JSON.parse(storedConfig)
          setHasValidConfig(!!(config.url && config.anonKey))
        } else {
          // Check if environment variables have real values
          const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          setHasValidConfig(!!(envUrl && envKey && envUrl.includes('supabase.co') && envKey.startsWith('eyJ')))
        }
      } catch {
        setHasValidConfig(false)
      }
    }
    
    checkConfig()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!hasValidConfig) {
        setError('Supabase configuration not found. Please set up your connection first.')
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please check your connection.')
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
  if (hasValidConfig === null) {
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
            Sign in to your account
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="juan.delacruz@company.ph"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !hasValidConfig}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mobile-touch-target"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* No Config Warning */}
            {!hasValidConfig && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-yellow-800">Supabase not configured</span>
                </div>
                <button
                  onClick={handleSetupSupabase}
                  className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 underline"
                >
                  Set up Supabase connection →
                </button>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/signup"
              className="text-teal-600 hover:text-teal-500 font-medium transition-colors"
            >
              Create your Philippine CRM account
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
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-teal-100">
          <p>Built for Philippine businesses with cultural intelligence</p>
        </div>
      </div>
    </div>
  )
}
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
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

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
    } catch {
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

  const handleGoogleSignIn = async () => {
    if (!hasValidConfig) {
      setError('Supabase configuration not found. Please set up your connection first.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signInError) {
        setError(signInError.message)
      }
    } catch {
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    if (!hasValidConfig) {
      setError('Supabase configuration not found. Please set up your connection first.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signInError) {
        setError(signInError.message)
      }
    } catch {
      setError('Failed to sign in with Facebook. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setError(error.message)
      } else {
        setResetEmailSent(true)
      }
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Hero Image/Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-12">
        <div className="text-center text-white max-w-lg">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Electric</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            The modern CRM platform built for growing businesses with intelligent automation and seamless integrations.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Cultural intelligence for Philippine market</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Local payment integration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Advanced analytics & reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Electric</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {forgotPasswordMode ? 'Reset Password' : 'Sign In'}
            </h2>
            <p className="text-gray-600">
              {forgotPasswordMode 
                ? 'Enter your email to receive a reset link' 
                : 'Enter your credentials to access your account'
              }
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {resetEmailSent ? (
            /* Password Reset Sent */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Check your email</h3>
              <p className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => {
                  setResetEmailSent(false)
                  setForgotPasswordMode(false)
                  setError('')
                }}
                className="text-teal-600 hover:text-teal-500 font-medium transition-colors"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={forgotPasswordMode ? handleForgotPassword : handleSignIn} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field - Only show in sign in mode */}
            {!forgotPasswordMode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordMode(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  required={!forgotPasswordMode}
                />
              </div>
            )}

            {/* Forgot Password Instructions */}
            {forgotPasswordMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !hasValidConfig}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
              >
                {loading ? (forgotPasswordMode ? 'Sending Reset Link...' : 'Signing In...') : (forgotPasswordMode ? 'Send Reset Link' : 'Sign In')}
              </button>

              {/* Back to Sign In Button in Forgot Password Mode */}
              {forgotPasswordMode && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordMode(false)
                    setError('')
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors font-medium"
                >
                  ← Back to sign in
                </button>
              )}
            </div>

            {/* Social Authentication - Only show in sign in mode */}
            {hasValidConfig && !forgotPasswordMode && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                  </button>

                  {/* Facebook Sign In */}
                  <button
                    type="button"
                    onClick={handleFacebookSignIn}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Continue with Facebook</span>
                  </button>
                </div>
              </>
            )}

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
          )}

          {/* Sign Up Link and Demo - Only show in sign in mode */}
          {!forgotPasswordMode && !resetEmailSent && (
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to Electric?</span>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <Link
                  href="/auth/signup"
                  className="inline-block w-full py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Create an account
                </Link>
                
                <button
                  onClick={handleDemoMode}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
                >
                  Try demo mode
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Electric. All rights reserved.
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
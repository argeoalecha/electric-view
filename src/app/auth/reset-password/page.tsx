'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/providers/supabase-provider'

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if we have valid reset token parameters
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      setValidToken(true)
    } else {
      setValidToken(false)
    }
  }, [searchParams])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Auto-redirect after success
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      }
    } catch {
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking token
  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300 mx-auto" />
          <p className="mt-4 text-teal-100">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Show error for invalid token
  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚡</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Electric</h1>
            <p className="text-teal-100">Invalid reset link</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid or Expired Link</h3>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Back to Sign In
            </Link>
          </div>
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
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Electric</h1>
          <p className="text-teal-100">
            {success ? 'Password updated successfully' : 'Set your new password'}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-8">
          {success ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Password Updated!</h3>
              <p className="text-gray-600">
                Your password has been successfully updated. Redirecting you to sign in...
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/signin"
                  className="text-teal-600 hover:text-teal-500 font-medium transition-colors"
                >
                  Continue to Sign In →
                </Link>
              </div>
            </div>
          ) : (
            /* Password Reset Form */
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>

              {/* Cancel Link */}
              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Cancel and return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-teal-100">
          <p>CRM platform with cultural intelligence and local payment integration</p>
        </div>
      </div>
    </div>
  )
}
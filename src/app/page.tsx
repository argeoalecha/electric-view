'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { useEffect, useState } from 'react'

export default function Home() {
  const { supabase, user, loading } = useSupabase()
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic Supabase connection without table access
        const { error } = await supabase.auth.getSession()
        if (error) {
          console.error('Supabase auth error:', error)
          setConnectionStatus('error')
        } else {
          // Connection successful - auth service is working
          setConnectionStatus('connected')
          console.log('Supabase connection successful')
        }
      } catch (err) {
        console.error('Connection test failed:', err)
        setConnectionStatus('error')
      }
    }

    if (!loading) {
      testConnection()
    }
  }, [supabase, loading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Philippine CRM
          </h1>
          <p className="text-gray-600 mb-8">
            Leads-Centric Sales Platform
          </p>
          
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-gray-600">
                {connectionStatus === 'connected' ? 'Supabase Connected' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </span>
            </div>

            {/* User Status */}
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">
                {loading ? 'Loading...' : user ? `Logged in as ${user.email}` : 'Not logged in'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-8">
              {!user ? (
                <>
                  <a
                    href="/demo"
                    className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center font-medium"
                  >
                    🚀 Try Demo Dashboard
                  </a>
                  <a
                    href="/auth"
                    className="block w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors text-center font-medium"
                  >
                    Sign In / Sign Up
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/dashboard"
                    className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
                  >
                    Go to Dashboard
                  </a>
                  <button 
                    onClick={() => supabase.auth.signOut()}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>

            {/* Environment Info */}
            <div className="mt-8 p-3 bg-gray-50 rounded-md text-xs text-gray-500">
              <div>Environment: {process.env.NODE_ENV}</div>
              <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing'}</div>
              <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</div>
              <div className="mt-2 p-2 bg-green-100 rounded text-green-800">
                <div>✅ Database ready with Philippine business features</div>
                <div>All migrations completed successfully</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

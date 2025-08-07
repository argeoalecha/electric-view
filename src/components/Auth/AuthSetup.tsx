'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'

interface SupabaseConfig {
  url: string
  anonKey: string
}

export default function AuthSetup() {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus('idle')

    try {
      // Test the connection
      const response = await fetch(`${config.url}/rest/v1/`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      })

      if (response.ok) {
        // Store credentials in localStorage for demo purposes
        localStorage.setItem('supabase_config', JSON.stringify(config))
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      setConnectionStatus('error')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDemoMode = () => {
    // Redirect to demo dashboard
    window.location.href = '/demo'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🇵🇭</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Philippine CRM</h1>
          <p className="text-gray-600">Connect your Supabase project or try demo mode</p>
        </div>

        <div className="space-y-6">
          {/* Supabase Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Connect to Supabase</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={config.url}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anon Public Key
              </label>
              <textarea
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.anonKey}
                onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-20 resize-none"
              />
            </div>

            <button
              onClick={handleConnect}
              disabled={!config.url || !config.anonKey || isConnecting}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect to Supabase</span>
              )}
            </button>

            {connectionStatus === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-800">Successfully connected to Supabase!</span>
                </div>
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="mt-2 text-sm text-green-700 hover:text-green-900 underline"
                >
                  Continue to Sign In →
                </button>
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-red-800">Connection failed. Please check your credentials.</span>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Demo Mode */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Try Demo Mode</h3>
            <p className="text-sm text-gray-600 mb-4">
              Explore the Philippine CRM with sample data - no setup required!
            </p>
            <button
              onClick={handleDemoMode}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              🚀 Launch Demo Mode
            </button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🛠️ Quick Setup Guide</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Create a new project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
            <li>2. Go to Settings → API in your project</li>
            <li>3. Copy your Project URL and anon public key</li>
            <li>4. Paste them above and click Connect</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/providers/supabase-provider'

interface UserProfileData {
  full_name: string
  email: string
  phone?: string
  position?: string
  department?: string
  bio?: string
  location?: string
  timezone: string
  language: string
  email_notifications: boolean
  browser_notifications: boolean
  weekly_summary: boolean
}

const philippineTimezones = [
  { value: 'Asia/Manila', label: 'Philippines (GMT+8)' }
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fil', label: 'Filipino' },
  { value: 'ceb', label: 'Cebuano' },
  { value: 'ilo', label: 'Ilocano' }
]

export default function UserProfile() {
  const { supabase, user, isDemo } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [profileData, setProfileData] = useState<UserProfileData>({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    bio: '',
    location: '',
    timezone: 'Asia/Manila',
    language: 'en',
    email_notifications: true,
    browser_notifications: true,
    weekly_summary: true
  })

  useEffect(() => {
    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    try {
      if (isDemo) {
        // Demo data
        setProfileData({
          full_name: 'Demo User',
          email: 'demo@democrm.ph',
          phone: '+639171234567',
          position: 'Sales Manager',
          department: 'Sales',
          bio: 'Experienced sales professional focused on Philippine market dynamics.',
          location: 'Metro Manila, Philippines',
          timezone: 'Asia/Manila',
          language: 'en',
          email_notifications: true,
          browser_notifications: true,
          weekly_summary: true
        })
        setLoading(false)
        return
      }

      // Load user profile from Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error is okay
        setError('Failed to load profile')
        return
      }

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: user?.email || '',
          phone: data.phone || '',
          position: data.position || '',
          department: data.department || '',
          bio: data.bio || '',
          location: data.location || '',
          timezone: data.timezone || 'Asia/Manila',
          language: data.language || 'en',
          email_notifications: data.email_notifications ?? true,
          browser_notifications: data.browser_notifications ?? true,
          weekly_summary: data.weekly_summary ?? true
        })
      } else {
        // New user - set defaults
        setProfileData(prev => ({
          ...prev,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || ''
        }))
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfileData, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setSuccess('')
    setError('')
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (isDemo) {
        // Demo mode - simulate save
        setTimeout(() => {
          setSuccess('Profile updated successfully!')
          setSaving(false)
        }, 1000)
        return
      }

      // Update user profile in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          full_name: profileData.full_name,
          phone: profileData.phone,
          position: profileData.position,
          department: profileData.department,
          bio: profileData.bio,
          location: profileData.location,
          timezone: profileData.timezone,
          language: profileData.language,
          email_notifications: profileData.email_notifications,
          browser_notifications: profileData.browser_notifications,
          weekly_summary: profileData.weekly_summary,
          updated_at: new Date().toISOString()
        })

      if (error) {
        setError('Failed to update profile')
        return
      }

      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      if (isDemo) {
        alert('Password change is not available in demo mode')
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: prompt('Enter new password:') || ''
      })

      if (error) {
        setError('Failed to change password')
        return
      }

      setSuccess('Password changed successfully!')
    } catch (err) {
      setError('Failed to change password')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="+639171234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <input
              type="text"
              value={profileData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Sales Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={profileData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Sales"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Metro Manila, Philippines"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            rows={3}
            placeholder="Tell us about yourself and your role..."
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={profileData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {philippineTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={profileData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.email_notifications}
                onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Browser Notifications</h3>
              <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.browser_notifications}
                onChange={(e) => handleInputChange('browser_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Weekly Summary</h3>
              <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.weekly_summary}
                onChange={(e) => handleInputChange('weekly_summary', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Last changed: Recently</p>
            </div>
            <button
              onClick={handleChangePassword}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={loadUserProfile}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Demo Mode Warning */}
        {isDemo && (
          <div className="text-sm text-yellow-600">
            Demo mode - changes will not be saved
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
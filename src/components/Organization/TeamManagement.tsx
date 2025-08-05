'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/providers/supabase-provider'

interface TeamMember {
  id: string
  email: string
  full_name: string
  role: 'owner' | 'admin' | 'user'
  status: 'active' | 'pending' | 'inactive'
  joined_at: string
  last_active?: string
}

interface TeamInvite {
  email: string
  role: 'admin' | 'user'
  message?: string
}

const roleDescriptions = {
  owner: 'Full access to all features and settings',
  admin: 'Can manage users, leads, companies, and deals',
  user: 'Can view and edit leads, companies, and deals'
}

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800'
}

export default function TeamManagement() {
  const { supabase, user, isDemo } = useSupabase()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  
  const [inviteData, setInviteData] = useState<TeamInvite>({
    email: '',
    role: 'user',
    message: ''
  })

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      if (isDemo) {
        // Demo data
        setTeamMembers([
          {
            id: '1',
            email: 'demo@democrm.ph',
            full_name: 'Demo User',
            role: 'owner',
            status: 'active',
            joined_at: '2024-01-01',
            last_active: '2024-01-20'
          },
          {
            id: '2',
            email: 'maria.santos@ayalaland.com.ph',
            full_name: 'Maria Santos',
            role: 'admin',
            status: 'active',
            joined_at: '2024-01-15',
            last_active: '2024-01-19'
          },
          {
            id: '3',
            email: 'juan.delacruz@techstart.ph',
            full_name: 'Juan Dela Cruz',
            role: 'user',
            status: 'pending',
            joined_at: '2024-01-18'
          }
        ])
        setLoading(false)
        return
      }

      // Real Supabase query
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          full_name,
          role,
          created_at,
          users!inner(email)
        `)
        .eq('organization_id', user?.user_metadata?.organization_id)

      if (error) {
        setError('Failed to load team members')
        return
      }

      const members = data.map((member: any) => ({
        id: member.id,
        email: member.users.email,
        full_name: member.full_name,
        role: member.role,
        status: 'active' as const,
        joined_at: member.created_at.split('T')[0]
      }))

      setTeamMembers(members)
    } catch (err) {
      setError('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteData.email) {
      setError('Please enter an email address')
      return
    }

    setInviteLoading(true)
    setError('')

    try {
      if (isDemo) {
        // Demo mode - simulate invitation
        const newMember: TeamMember = {
          id: Date.now().toString(),
          email: inviteData.email,
          full_name: inviteData.email.split('@')[0],
          role: inviteData.role,
          status: 'pending',
          joined_at: new Date().toISOString().split('T')[0]
        }
        
        setTeamMembers(prev => [...prev, newMember])
        setShowInviteForm(false)
        setInviteData({ email: '', role: 'user', message: '' })
        setInviteLoading(false)
        return
      }

      // Real implementation would involve:
      // 1. Create invitation record
      // 2. Send invitation email
      // 3. Handle invitation acceptance flow

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          organization_id: user?.user_metadata?.organization_id,
          email: inviteData.email,
          role: inviteData.role,
          message: inviteData.message,
          invited_by: user?.id,
          created_at: new Date().toISOString()
        })

      if (error) {
        setError('Failed to send invitation')
        return
      }

      // Reset form and reload
      setShowInviteForm(false)
      setInviteData({ email: '', role: 'user', message: '' })
      loadTeamMembers()

    } catch (err) {
      setError('Failed to send invitation')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'user') => {
    try {
      if (isDemo) {
        // Demo mode - update local state
        setTeamMembers(prev => 
          prev.map(member => 
            member.id === memberId 
              ? { ...member, role: newRole }
              : member
          )
        )
        return
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) {
        setError('Failed to update role')
        return
      }

      loadTeamMembers()
    } catch (err) {
      setError('Failed to update role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    try {
      if (isDemo) {
        // Demo mode - remove from local state
        setTeamMembers(prev => prev.filter(member => member.id !== memberId))
        return
      }

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', memberId)

      if (error) {
        setError('Failed to remove team member')
        return
      }

      loadTeamMembers()
    } catch (err) {
      setError('Failed to remove team member')
    }
  }

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
            <p className="text-gray-600">Manage your organization&apos;s team members and their roles</p>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            + Invite Member
          </button>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="juan.delacruz@company.ph"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                rows={2}
                placeholder="Welcome to our team!"
              />
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleInviteUser}
                disabled={inviteLoading}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Demo Mode Warning */}
        {isDemo && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-yellow-800">Demo mode - invitations will not be sent</span>
            </div>
          </div>
        )}
      </div>

      {/* Team Members List */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members ({teamMembers.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-semibold text-sm">
                    {member.full_name?.charAt(0)?.toUpperCase() || member.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.full_name || 'No name provided'}</h4>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[member.role]}`}>
                      {member.role}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' :
                      member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {member.role !== 'owner' && (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value as 'admin' | 'user')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </>
                )}
                {member.role === 'owner' && (
                  <span className="text-sm text-gray-500">Owner</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="space-y-3">
          {Object.entries(roleDescriptions).map(([role, description]) => (
            <div key={role} className="flex items-center space-x-3">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[role as keyof typeof roleColors]}`}>
                {role}
              </span>
              <span className="text-sm text-gray-600">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
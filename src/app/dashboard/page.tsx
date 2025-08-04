'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import HorizontalDashboard from '@/components/Layout/HorizontalDashboard'

interface DashboardStats {
  totalLeads: number
  totalDeals: number
  totalRevenue: number
  conversionRate: number
  topRegion: string
  recentActivity: Array<{
    id: string
    title: string
    timestamp: string
  }>
}

// Enhanced Philippine business data for charts
const regionalData = [
  { region: 'Metro Manila', leads: 8, deals: 5, revenue: 9200000, companies: 4 },
  { region: 'Cebu', leads: 3, deals: 1, revenue: 1200000, companies: 1 },
  { region: 'Davao del Sur', leads: 2, deals: 1, revenue: 300000, companies: 1 },
  { region: 'Western Visayas', leads: 1, deals: 1, revenue: 450000, companies: 1 },
  { region: 'CAR', leads: 1, deals: 1, revenue: 380000, companies: 1 }
]

const industryData = [
  { name: 'Real Estate', value: 35, deals: 1, revenue: 2500000 },
  { name: 'Technology', value: 25, deals: 3, revenue: 2150000 },
  { name: 'Retail', value: 15, deals: 1, revenue: 5000000 },
  { name: 'Manufacturing', value: 15, deals: 1, revenue: 1200000 },
  { name: 'Agriculture', value: 5, deals: 1, revenue: 300000 },
  { name: 'Tourism', value: 5, deals: 1, revenue: 380000 }
]

const monthlyTrends = [
  { month: 'Oct', leads: 12, deals: 5, revenue: 3200000 },
  { month: 'Nov', leads: 18, deals: 7, revenue: 4800000 },
  { month: 'Dec', leads: 22, deals: 8, revenue: 6200000 },
  { month: 'Jan', leads: 15, deals: 8, revenue: 12750000 }
]

const pipelineStages = [
  { stage: 'Lead', count: 2, value: 750000 },
  { stage: 'Qualified', count: 3, value: 6050000 },
  { stage: 'Proposal', count: 3, value: 4130000 },
  { stage: 'Negotiation', count: 1, value: 750000 },
  { stage: 'Closed Won', count: 1, value: 950000 }
]

const culturalInsights = [
  { metric: 'Relationship Building', score: 85, trend: '+5%' },
  { metric: 'Trust Development', score: 78, trend: '+12%' },
  { metric: 'Cultural Alignment', score: 92, trend: '+3%' },
  { metric: 'Communication Style', score: 88, trend: '+8%' }
]

const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a7f3d0', '#fde68a']

export default function Dashboard() {
  const { user, loading, supabase } = useSupabase()
  const router = useRouter()
  
  // Demo mode - bypass authentication for testing
  const isDemoMode = true
  const demoUser = { email: 'demo@democrm.ph', id: 'demo-user' }
  
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 15,
    totalDeals: 8,
    totalRevenue: 12750000,
    conversionRate: 35,
    topRegion: 'Metro Manila',
    recentActivity: [
      { id: '1', title: 'New lead from Ayala Land', timestamp: '2 hours ago' },
      { id: '2', title: 'Deal closed - SM Retail ₱5M', timestamp: '1 day ago' },
      { id: '3', title: 'Meeting scheduled with TechStart Manila', timestamp: '2 days ago' },
      { id: '4', title: 'Proposal sent to Cebu Manufacturing', timestamp: '3 days ago' }
    ]
  })

  useEffect(() => {
    if (!isDemoMode && !loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router, isDemoMode])

  const handleSignOut = async () => {
    if (isDemoMode) {
      router.push('/')
    } else {
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  const currentUser = isDemoMode ? demoUser : user

  if (!isDemoMode && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300 mx-auto" />
          <p className="mt-4 text-teal-100">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isDemoMode && !user) {
    return null
  }

  return (
    <HorizontalDashboard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Philippine CRM Dashboard 🇵🇭
          </h2>
          <p className="text-teal-100">
            Overview of your sales performance and cultural intelligence insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<UsersIcon />}
            title="Total Leads"
            value={stats.totalLeads.toString()}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<ChartBarIcon />}
            title="Active Deals"
            value={stats.totalDeals.toString()}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<CurrencyIcon />}
            title="Revenue Pipeline"
            value={`₱${stats.totalRevenue.toLocaleString()}`}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatCard
            icon={<TrendingUpIcon />}
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickActionsCard />
          <PhilippineInsightsCard topRegion={stats.topRegion} />
          <RecentActivityCard activities={stats.recentActivity} />
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Regional Performance Chart */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="region" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₱${(value as number / 1000000).toFixed(1)}M` : value,
                    name === 'revenue' ? 'Revenue' : name === 'leads' ? 'Leads' : 'Deals'
                  ]}
                />
                <Bar dataKey="leads" fill="#0891b2" name="Leads" />
                <Bar dataKey="deals" fill="#22d3ee" name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Industry Distribution */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends and Pipeline Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₱${(value as number / 1000000).toFixed(1)}M` : value,
                    name === 'revenue' ? 'Revenue' : name === 'leads' ? 'Leads' : 'Deals'
                  ]}
                />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#0891b2" fill="#0891b2" />
                <Area type="monotone" dataKey="deals" stackId="2" stroke="#22d3ee" fill="#22d3ee" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline Stages */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stages</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineStages} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? `₱${(value as number / 1000).toLocaleString()}K` : value,
                    name === 'value' ? 'Value' : 'Count'
                  ]}
                />
                <Bar dataKey="count" fill="#0891b2" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Philippine Cultural Intelligence Dashboard */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">🇵🇭 Philippine Cultural Intelligence Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {culturalInsights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg border border-teal-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{insight.metric}</h4>
                  <span className="text-xs text-green-600 font-semibold">{insight.trend}</span>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-teal-700">{insight.score}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${insight.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Cultural Context Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">🤝 Relationship Focus</h4>
              <p className="text-sm text-yellow-700">Filipino business culture emphasizes personal relationships. 85% of deals require multiple relationship-building meetings.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🏢 Hierarchy Respect</h4>
              <p className="text-sm text-blue-700">Decision-making often involves senior management approval. Metro Manila deals show 40% faster approval rates.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">💬 Communication Style</h4>
              <p className="text-sm text-green-700">Indirect communication is preferred. Face-to-face meetings have 60% higher success rates than email-only interactions.</p>
            </div>
          </div>
        </div>

        {/* Enhanced Activity Timeline */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 Recent Business Activity Timeline</h3>
          <ActivityTimeline />
        </div>

        {/* System Status */}
        <SystemStatusCard />
      </div>
    </HorizontalDashboard>
  )
}

function StatCard({ icon, title, value, bgColor, iconColor }: {
  icon: React.ReactNode
  title: string
  value: string
  bgColor: string
  iconColor: string
}) {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
      <div className="flex items-center">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function QuickActionsCard() {
  const router = useRouter()
  
  const actions = [
    { 
      title: 'Manage Leads', 
      subtitle: 'View and manage all leads', 
      bgColor: 'bg-blue-50', 
      hoverColor: 'hover:bg-blue-100', 
      textColor: 'text-blue-900', 
      subtitleColor: 'text-blue-600',
      action: () => router.push('/leads')
    },
    { 
      title: 'Companies Directory', 
      subtitle: 'Browse Philippine companies', 
      bgColor: 'bg-green-50', 
      hoverColor: 'hover:bg-green-100', 
      textColor: 'text-green-900', 
      subtitleColor: 'text-green-600',
      action: () => router.push('/companies')
    },
    { 
      title: 'Deals Pipeline', 
      subtitle: 'View sales opportunities', 
      bgColor: 'bg-purple-50', 
      hoverColor: 'hover:bg-purple-100', 
      textColor: 'text-purple-900', 
      subtitleColor: 'text-purple-600',
      action: () => router.push('/deals')
    }
  ]

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button 
            key={index} 
            onClick={action.action}
            className={`w-full text-left p-3 ${action.bgColor} ${action.hoverColor} rounded-lg transition-colors`}
          >
            <div className={`font-medium ${action.textColor}`}>{action.title}</div>
            <div className={`text-sm ${action.subtitleColor}`}>{action.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PhilippineInsightsCard({ topRegion }: { topRegion: string }) {
  const insights = [
    { title: 'Top Region', value: topRegion || 'Metro Manila', bgColor: 'bg-orange-50', textColor: 'text-orange-900', valueColor: 'text-orange-600' },
    { title: 'Cultural Score', value: '85% relationship strength', bgColor: 'bg-indigo-50', textColor: 'text-indigo-900', valueColor: 'text-indigo-600' },
    { title: 'Business Climate', value: 'High growth potential', bgColor: 'bg-pink-50', textColor: 'text-pink-900', valueColor: 'text-pink-600' }
  ]

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Philippine Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className={`p-3 ${insight.bgColor} rounded-lg`}>
            <div className={`font-medium ${insight.textColor}`}>{insight.title}</div>
            <div className={`text-sm ${insight.valueColor}`}>{insight.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentActivityCard({ activities }: { activities: DashboardStats['recentActivity'] }) {
  const defaultActivities = [
    { id: '1', title: 'New lead from Ayala Land', timestamp: '2 hours ago' },
    { id: '2', title: 'Deal closed - SM Retail', timestamp: '1 day ago' },
    { id: '3', title: 'Meeting scheduled', timestamp: '2 days ago' }
  ]

  const displayActivities = activities.length > 0 ? activities : defaultActivities

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="text-sm">
            <div className="font-medium text-gray-900">{activity.title}</div>
            <div className="text-gray-500">{activity.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SystemStatusCard() {
  const statusItems = [
    'Database Connected',
    'Philippine Data Loaded',
    'Lead Scoring Active'
  ]

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Modern SVG Icons as React Components
function UsersIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function ChartBarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  )
}

function TrendingUpIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function ActivityTimeline() {
  const activities = [
    {
      id: 1,
      type: 'deal_won',
      title: 'Deal Closed - Manila Bay Trading',
      description: 'Successfully closed ₱950K ERP integration deal. Project kickoff scheduled for next week.',
      time: '2 hours ago',
      icon: '🎉',
      color: 'green',
      details: 'Ricardo De Los Santos confirmed contract signing. Implementation team assigned.'
    },
    {
      id: 2,
      type: 'meeting',
      title: 'Client Meeting - Ayala Land',
      description: 'Productive meeting with Maria Santos. Discussed CRM requirements and timeline.',
      time: '5 hours ago',
      icon: '🤝',
      color: 'blue',
      details: 'Board presentation scheduled for next week. Budget approval looking positive.'
    },
    {
      id: 3,
      type: 'proposal',
      title: 'Proposal Sent - TechStart Manila',
      description: 'Technical proposal sent to Jose Reyes. Includes API integration and custom features.',
      time: '1 day ago',
      icon: '📄',
      color: 'yellow',
      details: 'Comprehensive 45-page proposal covering all technical requirements.'
    },
    {
      id: 4,
      type: 'lead',
      title: 'New Lead - Baguio Mountain Resorts',
      description: 'Tourism industry lead from Luisa Villanueva. Interested in customer management.',
      time: '2 days ago',
      icon: '🆕',
      color: 'purple',
      details: 'Seasonal business with unique requirements. Good cultural fit assessment.'
    },
    {
      id: 5,
      type: 'follow_up',
      title: 'Follow-up Call - Cebu Manufacturing',
      description: 'Roberto confirmed management interest. Manila office approval in progress.',
      time: '3 days ago',
      icon: '📞',
      color: 'teal',
      details: 'Strong relationship established. Expect decision within 2 weeks.'
    },
    {
      id: 6,
      type: 'cultural_insight',
      title: 'Cultural Intelligence Update',
      description: 'Relationship scores improved across all Metro Manila accounts.',
      time: '1 week ago',
      icon: '🇵🇭',
      color: 'pink',
      details: 'Face-to-face meeting preference showing 60% better engagement rates.'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 border-green-200 text-green-800',
      blue: 'bg-blue-100 border-blue-200 text-blue-800',
      yellow: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      purple: 'bg-purple-100 border-purple-200 text-purple-800',
      teal: 'bg-teal-100 border-teal-200 text-teal-800',
      pink: 'bg-pink-100 border-pink-200 text-pink-800'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getIconBg = (color: string) => {
    const colors = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      teal: 'bg-teal-500',
      pink: 'bg-pink-500'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex items-start space-x-4">
          {/* Timeline Icon */}
          <div className={`flex-shrink-0 w-10 h-10 ${getIconBg(activity.color)} rounded-full flex items-center justify-center text-white relative`}>
            <span className="text-lg">{activity.icon}</span>
            {index < activities.length - 1 && (
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300" />
            )}
          </div>
          
          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className={`rounded-lg border p-4 ${getColorClasses(activity.color)}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">{activity.title}</h4>
                <span className="text-xs opacity-75">{activity.time}</span>
              </div>
              <p className="text-sm mb-2">{activity.description}</p>
              <p className="text-xs opacity-75">{activity.details}</p>
              
              {/* Activity Type Badge */}
              <div className="mt-3">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-white/50">
                  {activity.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* View All Activities */}
      <div className="text-center pt-4">
        <button className="text-teal-600 hover:text-teal-800 text-sm font-medium">
          View All Activities →
        </button>
      </div>
    </div>
  )
}
'use client'

import { useState, ReactNode } from 'react'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'
import HorizontalNav from './HorizontalNav'
import { 
  DashboardIcon, 
  UsersIcon, 
  BuildingIcon, 
  CurrencyIcon, 
  TeamIcon, 
  ProfileIcon 
} from './NavigationIcons'
import { getConfigStatus } from '@/lib/supabase-flexible'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ name: string; href?: string }>
  actions?: ReactNode
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  breadcrumbs,
  actions 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const configStatus = getConfigStatus()
  
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: DashboardIcon,
      description: 'Overview & Analytics'
    },
    {
      name: 'Leads',
      href: '/leads',
      icon: UsersIcon,
      description: 'Lead Management'
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: BuildingIcon,
      description: 'Company Directory'
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: CurrencyIcon,
      description: 'Sales Pipeline'
    },
    {
      name: 'Team',
      href: '/team',
      icon: TeamIcon,
      description: 'Team Management'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: ProfileIcon,
      description: 'User Settings'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900">
      {/* Sidebar - Hidden on large screens when using horizontal nav */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="lg:pl-0">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-teal-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
                
                {/* Logo for desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🇵🇭</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Philippine CRM</h1>
                    <p className="text-xs text-gray-500">
                      {configStatus.isDemo ? 'Demo Mode' : 'Production Mode'}
                    </p>
                  </div>
                </div>
                
                {/* Page title for mobile */}
                <div className="lg:hidden flex flex-col">
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-600 hidden sm:block">{subtitle}</p>
                  )}
                </div>
              </div>
              
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
            
            {/* Breadcrumbs */}
            {breadcrumbs && (
              <div className="pb-4">
                <Breadcrumbs items={breadcrumbs} />
              </div>
            )}
          </div>
        </header>

        {/* Horizontal Navigation - Desktop only */}
        <div className="hidden lg:block">
          <HorizontalNav navigation={navigation} />
        </div>

        {/* Page Title Section - Desktop only */}
        <div className="hidden lg:block bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
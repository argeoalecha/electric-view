'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { 
  DashboardIcon, 
  UsersIcon, 
  BuildingIcon, 
  CurrencyIcon, 
  TeamIcon, 
  ProfileIcon 
} from './NavigationIcons'

interface HorizontalDashboardProps {
  children: ReactNode
}

export default function HorizontalDashboard({ children }: HorizontalDashboardProps) {
  const router = useRouter()
  const pathname = usePathname()

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

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-teal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🇵🇭</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Philippine CRM</h1>
                <p className="text-xs text-gray-500">Demo Mode</p>
              </div>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, demo@democrm.ph</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Demo Mode
              </span>
              <button 
                onClick={() => router.push('/')}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Exit Demo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Horizontal Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    flex items-center space-x-2 px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap min-w-0
                    ${isActive 
                      ? 'border-teal-500 text-teal-600 bg-teal-50' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />
                  <span className="hidden sm:block">{item.name}</span>
                  <span className="sm:hidden">{item.name.charAt(0)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
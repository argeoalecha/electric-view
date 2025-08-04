'use client'

import { useRouter, usePathname } from 'next/navigation'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

interface HorizontalNavProps {
  navigation: NavigationItem[]
}

export default function HorizontalNav({ navigation }: HorizontalNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
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
                  flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'border-teal-500 text-teal-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
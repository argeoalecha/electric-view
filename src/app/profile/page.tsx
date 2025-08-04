import DashboardLayout from '@/components/Layout/DashboardLayout'
import UserProfile from '@/components/User/UserProfile'

export default function ProfilePage() {
  const breadcrumbs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'User Profile' }
  ]

  return (
    <DashboardLayout
      title="User Profile"
      subtitle="Manage your personal information and preferences"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile />
      </div>
    </DashboardLayout>
  )
}
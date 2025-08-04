import DashboardLayout from '@/components/Layout/DashboardLayout'
import TeamManagement from '@/components/Organization/TeamManagement'

export default function TeamPage() {
  const breadcrumbs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Team Management' }
  ]

  return (
    <DashboardLayout
      title="Team Management"
      subtitle="Manage your organization's team members and permissions"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamManagement />
      </div>
    </DashboardLayout>
  )
}
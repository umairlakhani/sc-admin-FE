import { LayoutDashboard, Users, Bell, Building2, LifeBuoy, BadgePercent, CreditCard, UserCheck, Shield, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getFilteredNavigationItems } from '../lib/permissions'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.read' },
  { to: '/plans', label: 'Plans', icon: BadgePercent, permission: 'subscriptions.read' },
  { to: '/users', label: 'Users', icon: Users, permission: 'users.read' },
  { to: '/staff', label: 'Staff', icon: UserCheck, permission: 'staff.read' },
  { to: '/roles-permissions', label: 'Roles & Permissions', icon: Shield, permission: 'roles_permissions.read' },
  { to: '/properties', label: 'Manage Properties', icon: Building2, permission: 'properties.read' },
  { to: '/matching-rules', label: 'Matching Rules', icon: Settings, permission: 'properties.read' },
  { to: '/billing', label: 'Subscriptions & Payments', icon: CreditCard, permission: 'subscriptions.read' },
  { to: '/support', label: 'Support Requests', icon: LifeBuoy, permission: 'support.read' },
  { to: '/notifications', label: 'Manage Notifications', icon: Bell, permission: 'notifications.read' },
]

function Sidebar() {
  // Filter navigation items based on user permissions
  const filteredItems = getFilteredNavigationItems(items)
  
  return (
    <aside className="w-64 h-[calc(100vh-100px)] sticky top-4 self-start">
      <div className="h-full rounded-2xl bg-white shadow-sm border border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-5 text-xl font-extrabold text-gray-900 tracking-tight">
          <span className="text-green-600">Search</span>&nbsp;casa
        </div>
        <nav className="px-3 py-2 space-y-1 flex-1">
          {filteredItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition ${
                  isActive
                    ? 'bg-green-50 text-green-700 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.25)]'
                    : 'text-gray-800 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={18} className={""} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <button
            onClick={() => {
              // Clear all authentication related localStorage items
              localStorage.removeItem('auth_token')
              localStorage.removeItem('user_type')
              localStorage.removeItem('auth')
              localStorage.removeItem('user_data')
              localStorage.removeItem('user_role')
              localStorage.removeItem('user_permissions')
              localStorage.removeItem('user_name')
              localStorage.removeItem('user_email')
              window.location.href = '/signin'
            }}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar



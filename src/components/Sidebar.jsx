import { LayoutDashboard, Users, Bell, Building2, LifeBuoy, BadgePercent } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plans', label: 'Plans', icon: BadgePercent },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/properties', label: 'Manage Properties', icon: Building2 },
  { to: '/support', label: 'Support Requests', icon: LifeBuoy },
  { to: '/notifications', label: 'Manage Notifications', icon: Bell },
]

function Sidebar() {
  return (
    <aside className="w-64 h-[calc(100vh-100px)] sticky top-4 self-start">
      <div className="h-full rounded-2xl bg-white shadow-sm border border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-5 text-xl font-extrabold text-gray-900 tracking-tight">
          <span className="text-green-600">Search</span>&nbsp;casa
        </div>
        <nav className="px-3 py-2 space-y-1 flex-1">
          {items.map(({ to, label, icon: Icon }) => (
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
              localStorage.removeItem('auth')
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



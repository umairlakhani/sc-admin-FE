import { Bell, User2, Shield } from 'lucide-react'
import { getUserData, getUserRole } from '../lib/permissions'

function TopNav() {
  const userData = getUserData()
  const userRole = getUserRole()
  
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="font-semibold text-gray-800">Admin Panel</div>
      <div className="flex items-center gap-3">
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
          <Bell size={18} className="text-gray-700" />
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
          <User2 size={18} className="text-gray-700" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-800">{userData?.name || 'User'}</span>
            <div className="flex items-center gap-1">
              <Shield size={12} className="text-green-600" />
              <span className="text-xs text-gray-500">{userRole?.name || 'Role'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNav



import { Bell, User2 } from 'lucide-react'

function TopNav() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="font-semibold text-gray-800">Admin Panel</div>
      <div className="flex items-center gap-3">
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
          <Bell size={18} className="text-gray-700" />
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50">
          <User2 size={18} className="text-gray-700" />
          <span className="text-sm text-gray-800">Profile</span>
        </button>
      </div>
    </header>
  )
}

export default TopNav



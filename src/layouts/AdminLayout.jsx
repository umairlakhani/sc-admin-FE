import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-muted">
      <TopNav />
      <div className="grid grid-cols-[16rem_1fr] gap-0 min-h-0">
        <Sidebar />
        <main className="p-4 flex flex-col h-full">
          <Outlet />
        </main>
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default AdminLayout



import { useEffect, useState } from 'react'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'
import { Trash2 } from 'lucide-react'
import Pagination from '../components/Pagination'
import { MoreVertical, Eye, Pencil, Mail, ShieldBan, KeyRound, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Users() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [menuOpen, setMenuOpen] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Customer' })
  const [page, setPage] = useState(1)
  const pageSize = 6
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [userType, setUserType] = useState('')
  const [isActive, setIsActive] = useState('')
  const [isVerified, setIsVerified] = useState('')
  const [isSubscribed, setIsSubscribed] = useState('')
  const pageRows = rows

  async function loadUsers() {
    setLoading(true)
    try {
      // Clear current rows to avoid showing stale data while loading next page
      setRows([])
      const params = { page, limit: pageSize }
      if (search) params.search = search
      if (role) params.role = role
      if (userType) params.userType = userType
      if (isActive !== '') params.isActive = isActive === 'true'
      if (isVerified !== '') params.isVerified = isVerified === 'true'
      if (isSubscribed !== '') params.isSubscribed = isSubscribed === 'true'
      const res = await adminService.listUsers(params)
      setRows(res?.users || [])
      setTotalPages(res?.pagination?.totalPages || 1)
    } catch (_) {
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [page, role, userType, isActive, isVerified, isSubscribed])

  async function addUser() {
    if (!newUser.name || !newUser.email) return
    try {
      await adminService.createUser({
        name: newUser.name,
        surname: newUser.surname || '',
        email: newUser.email,
        companyName: newUser.companyName || '',
        role: (newUser.role || 'admin').toLowerCase(),
        userType: newUser.userType || 'offer',
        isActive: true,
        isVerified: true,
        isSubscribed: false,
      })
      showToast('User created')
      setAddOpen(false)
      setNewUser({ name: '', email: '', role: 'Customer' })
      loadUsers()
    } catch (_) { showToast('Failed to create user', 'error') }
  }

  async function updateUser() {
    try {
      await adminService.updateUser(current.id, current)
      showToast('User updated')
      setEditOpen(false)
      loadUsers()
    } catch (_) { showToast('Update failed', 'error') }
  }

  async function suspendUser() {
    try { await adminService.toggleUserStatus(current.id); showToast('Status updated'); loadUsers() } catch(_) { showToast('Failed to update status','error') }
    setSuspendOpen(false)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
          <Plus size={16} /> Add user
        </button>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        <div className="p-3 flex flex-wrap items-center gap-2 border-b border-gray-100">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && (setPage(1), loadUsers())} placeholder="Search name, email, company..." className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <select value={role} onChange={(e)=>{ setPage(1); setRole(e.target.value) }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">All roles</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
          <select value={userType} onChange={(e)=>{ setPage(1); setUserType(e.target.value) }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">All types</option>
            <option value="offer">offer</option>
            <option value="demand">demand</option>
          </select>
          <select value={isActive} onChange={(e)=>{ setPage(1); setIsActive(e.target.value) }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Active: any</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select value={isVerified} onChange={(e)=>{ setPage(1); setIsVerified(e.target.value) }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Verified: any</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select value={isSubscribed} onChange={(e)=>{ setPage(1); setIsSubscribed(e.target.value) }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Subscribed: any</option>
            <option value="true">Subscribed</option>
            <option value="false">Not subscribed</option>
          </select>
          <button onClick={()=>{ setPage(1); loadUsers() }} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Apply</button>
        </div>
        <div className="overflow-x-auto overflow-y-visible flex-1">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Surname</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-800">{u.surname}</td>
                  <td className="px-4 py-3 text-gray-800">{u.email}</td>
                  <td className="px-4 py-3 text-gray-800">{u.role}</td>
                  <td className="px-4 py-3 text-gray-800">{u.userType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100"
                        onClick={() => setMenuOpen(menuOpen === u.id ? '' : u.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === u.id && (
                        <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-md">
                          <button onClick={() => { setMenuOpen(''); navigate(`/users/${u.id}`, { state: { user: u } }) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <Eye size={14} /> View
                          </button>
                          <button onClick={() => { setMenuOpen(''); setCurrent(u); setEditOpen(true) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <Pencil size={14} /> Edit
                          </button>
                          <button onClick={() => { setMenuOpen(''); setCurrent(u); setEmailOpen(true) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <Mail size={14} /> Send email
                          </button>
                          <button onClick={() => { setMenuOpen(''); setCurrent(u); setResetOpen(true) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <KeyRound size={14} /> Reset password
                          </button>
                          <button onClick={() => { setMenuOpen(''); setCurrent(u); setSuspendOpen(true) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                            <ShieldBan size={14} /> {u.isActive ? 'Suspend' : 'Unsuspend'}
                          </button>
                          <button onClick={() => { setMenuOpen(''); setCurrent(u); setDeleteOpen(true) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onChange={(n) => setPage(n)} />
      </div>

      {/* Add user */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add user">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Surname</label>
            <input value={newUser.surname || ''} onChange={(e) => setNewUser((p) => ({ ...p, surname: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Email</label>
            <input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Company</label>
            <input value={newUser.companyName || ''} onChange={(e) => setNewUser((p) => ({ ...p, companyName: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Role</label>
            <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="admin">admin</option>
              <option value="user">user</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">User type</label>
            <select value={newUser.userType || 'offer'} onChange={(e) => setNewUser((p) => ({ ...p, userType: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="offer">offer</option>
              <option value="demand">demand</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setAddOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={addUser} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Create</button>
          </div>
        </div>
      </Modal>

      {/* Edit user */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit user">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input value={current?.name || ''} onChange={(e) => setCurrent((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Role</label>
            <select value={current?.role || 'Customer'} onChange={(e) => setCurrent((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Customer</option>
              <option>Admin</option>
              <option>Moderator</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEditOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={updateUser} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Save</button>
          </div>
        </div>
      </Modal>

      {/* Reset password */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset password">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Send a password reset link to <span className="font-medium">{current?.email}</span>?</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setResetOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => setResetOpen(false)} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Send link</button>
          </div>
        </div>
      </Modal>

      {/* Send email */}
      <Modal open={emailOpen} onClose={() => setEmailOpen(false)} title="Send email notification">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Subject</label>
            <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Subject" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Message</label>
            <textarea rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Write your message..." />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEmailOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => setEmailOpen(false)} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Send</button>
          </div>
        </div>
      </Modal>

      {/* Suspend user */}
      <Modal open={suspendOpen} onClose={() => setSuspendOpen(false)} title="Change user status">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to {current?.status === 'Suspended' ? 'unsuspend' : 'suspend'} <span className="font-medium">{current?.name}</span>?</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setSuspendOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={suspendUser} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* Delete user */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete user">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete <span className="font-medium">{current?.name} {current?.surname}</span>?</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setDeleteOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={async () => { try { await adminService.deleteUser(current.id); showToast('User deleted'); loadUsers() } catch(_) { showToast('Failed to delete user','error') } finally { setDeleteOpen(false) } }} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Users



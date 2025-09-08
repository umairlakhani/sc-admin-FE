import { useState } from 'react'
import { usersData } from '../data'
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
  const [rows, setRows] = useState(usersData)
  const [menuOpen, setMenuOpen] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Customer' })
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const start = (page - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)

  function addUser() {
    if (!newUser.name || !newUser.email) return
    const id = `u-${Math.floor(Math.random() * 9000) + 1000}`
    setRows((prev) => [{ id, status: 'Active', joinedAt: new Date().toISOString().slice(0, 10), ...newUser }, ...prev])
    setAddOpen(false)
  }

  function updateUser() {
    setRows((prev) => prev.map((r) => (r.id === current.id ? { ...r, ...current } : r)))
    setEditOpen(false)
  }

  function suspendUser() {
    setRows((prev) => prev.map((r) => (r.id === current.id ? { ...r, status: r.status === 'Suspended' ? 'Active' : 'Suspended' } : r)))
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
        <div className="overflow-x-auto overflow-y-visible flex-1">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">First name</th>
                <th className="px-4 py-3">Last name</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.firstName}</td>
                  <td className="px-4 py-3 text-gray-800">{u.lastName}</td>
                  <td className="px-4 py-3 text-gray-800">{u.age}</td>
                  <td className="px-4 py-3 text-gray-800">{u.email}</td>
                  <td className="px-4 py-3 text-gray-800">{u.role}</td>
                  <td className="px-4 py-3 text-gray-800">{u.address}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{u.joinedAt}</td>
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
                          <button onClick={() => { setMenuOpen(''); navigate(`/users/${u.id}`) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
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
                            <ShieldBan size={14} /> {u.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
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
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">Page {page} of {totalPages}</div>
          <div className="inline-flex items-center gap-1">
            <button
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md px-2 py-1 text-sm border ${n === page ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-200'}`}
                >
                  {n}
                </button>
              )
            })}
            <button
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add user */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add user">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Email</label>
            <input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Role</label>
            <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Customer</option>
              <option>Admin</option>
              <option>Moderator</option>
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
    </div>
  )
}

export default Users



import { useEffect, useMemo, useState } from 'react'
import { MoreVertical, Pencil, Eye, Trash2, Plus, Shield, ChevronDown, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'
import Pagination from '../components/Pagination'

function Modal({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Utility function to group permissions by module
function groupPermissionsByModule(permissions) {
  const grouped = {}
  permissions.forEach(permission => {
    const [module] = permission.key.split('.')
    if (!grouped[module]) {
      grouped[module] = []
    }
    grouped[module].push(permission)
  })
  return grouped
}

// Component to display role permissions
function RolePermissionsDisplay({ role, onEditPermissions }) {
  if (!role || !role.Permissions || role.Permissions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No permissions assigned to this role</p>
      </div>
    )
  }

  const groupedPermissions = groupPermissionsByModule(role.Permissions)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Role: {role.name}</h4>
        <button
          onClick={() => onEditPermissions(role)}
          className="text-xs text-green-600 hover:text-green-700 font-medium"
        >
          Edit Permissions
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
          <div key={module} className="border-b border-gray-100 last:border-b-0">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 capitalize">{module}</span>
                <span className="text-sm text-gray-500">({modulePermissions.length} permissions)</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {modulePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{permission.key}</span>
                    <p className="text-xs text-gray-500">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const initialStaff = []

function Staff() {
  const navigate = useNavigate()
  const [staff, setStaff] = useState(initialStaff)
  const [roles, setRoles] = useState([])
  const [menuOpenId, setMenuOpenId] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [rolePermissionsOpen, setRolePermissionsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [currentRole, setCurrentRole] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const pageRows = staff

  function openCreate() {
    setEditing({ 
      id: '', 
      name: '', 
      email: '', 
      password: '', 
      roleId: '', 
      role: '' 
    })
    setEditOpen(true)
  }

  function openEdit(staffMember) {
    setEditing({ ...staffMember })
    setEditOpen(true)
  }

  function openPermissions(staffMember) {
    setEditing(staffMember)
    setPermissionsOpen(true)
  }

  function openRolePermissions(role) {
    setCurrentRole(role)
    setRolePermissionsOpen(true)
  }

  async function saveStaff() {
    if (!editing.name || !editing.email) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    if (!editing.id && !editing.password) {
      showToast('Password is required for new staff', 'error')
      return
    }
    if (!editing.roleId) {
      showToast('Please select a role', 'error')
      return
    }
    
    setSaving(true)
    try {
      if (editing.id) {
        await adminService.updateStaff(editing.id, {
          name: editing.name,
          email: editing.email,
          roleId: editing.roleId,
          role: editing.role,
        })
        showToast('Staff updated successfully')
      } else {
        await adminService.createStaff({
          name: editing.name,
          email: editing.email,
          password: editing.password,
          roleId: editing.roleId,
          role: editing.role,
        })
        showToast('Staff created successfully')
      }
      setEditOpen(false)
      loadStaff()
    } catch (err) {
      showToast(err.message || 'Failed to save staff', 'error')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete(staffMember) {
    setEditing(staffMember)
    setDeleteOpen(true)
  }

  async function doDelete() {
    setDeleting(true)
    try { 
      await adminService.deleteStaff(editing.id)
      showToast('Staff deleted successfully')
      setDeleteOpen(false)
      loadStaff()
    } catch (err) { 
      showToast(err.message || 'Failed to delete staff', 'error') 
    } finally {
      setDeleting(false)
    }
  }


  async function loadStaff() {
    setLoading(true)
    try {
      const params = { page, limit: pageSize }
      if (search) params.search = search
      const res = await adminService.listStaff(params)
      setStaff(res?.data || [])
      setTotalPages(res?.pagination?.totalPages || 1)
    } catch (_) {
      showToast('Failed to load staff', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadRoles() {
    try {
      const res = await adminService.listRoles({ scope: 'staff' })
      setRoles(res?.data || [])
    } catch (_) {
      showToast('Failed to load roles', 'error')
    }
  }

  useEffect(() => { 
    loadStaff()
    loadRoles()
  }, [page])

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Staff Management</h2>
        <div className="flex items-center gap-2">
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onKeyDown={(e) => e.key==='Enter' && (setPage(1), loadStaff())} 
            placeholder="Search staff..." 
            className="rounded-md border border-gray-300 px-3 py-2 text-sm" 
          />
          <button 
            onClick={openCreate} 
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            <Plus size={16} /> New Staff
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((staffMember) => (
                <tr key={staffMember.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{staffMember.name}</td>
                  <td className="px-4 py-3 text-gray-800">{staffMember.email}</td>
                  <td className="px-4 py-3 text-gray-800">{staffMember.role}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100"
                        onClick={() => setMenuOpenId(menuOpenId === staffMember.id ? '' : staffMember.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpenId === staffMember.id && (
                        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-md">
                          <button 
                            onClick={() => { setMenuOpenId(''); navigate(`/staff/${staffMember.id}`) }} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <button 
                            onClick={() => { setMenuOpenId(''); openEdit(staffMember) }} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => { setMenuOpenId(''); openPermissions(staffMember) }} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            <Shield size={14} /> Permissions
                          </button>
                          <button 
                            onClick={() => { setMenuOpenId(''); confirmDelete(staffMember) }} 
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
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

        <Pagination page={page} totalPages={totalPages} onChange={(n) => setPage(n)} />
      </div>

      {/* Create/Edit Staff Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editing?.id ? 'Edit Staff' : 'Create Staff'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input 
              value={editing?.name || ''} 
              onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Email</label>
            <input 
              type="email"
              value={editing?.email || ''} 
              onChange={(e) => setEditing((p) => ({ ...p, email: e.target.value }))} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          {!editing?.id && (
            <div>
              <label className="mb-1 block text-sm text-gray-700">Password</label>
              <input 
                type="password"
                value={editing?.password || ''} 
                onChange={(e) => setEditing((p) => ({ ...p, password: e.target.value }))} 
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-gray-700">Role</label>
            <select 
              value={editing?.roleId || ''} 
              onChange={(e) => {
                const selectedRole = roles.find(r => r.id === e.target.value)
                setEditing((p) => ({ 
                  ...p, 
                  roleId: e.target.value,
                  role: selectedRole?.name || ''
                }))
              }} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setEditOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={saveStaff} 
              disabled={saving}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Staff Role Permissions Modal */}
      <Modal open={permissionsOpen} onClose={() => setPermissionsOpen(false)} title="Staff Role Permissions">
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900">Staff: {editing?.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Email: {editing?.email}</p>
            <p className="text-sm text-gray-500">Role: {editing?.role}</p>
          </div>
          
          {editing?.roleId && (
            <RolePermissionsDisplay 
              role={roles.find(r => r.id === editing.roleId)} 
              onEditPermissions={openRolePermissions}
            />
          )}
          
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setPermissionsOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Staff">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <span className="font-medium">{editing?.name}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setDeleteOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={doDelete} 
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Role Permissions Management Modal */}
      <Modal open={rolePermissionsOpen} onClose={() => setRolePermissionsOpen(false)} title="Edit Role Permissions">
        {currentRole && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Role: {currentRole.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{currentRole.description}</p>
            </div>
            
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                To edit role permissions, please go to the Roles & Permissions page.
              </p>
              <button
                onClick={() => {
                  setRolePermissionsOpen(false)
                  navigate('/roles-permissions')
                }}
                className="inline-flex items-center gap-2 rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                <Shield size={16} />
                Go to Roles & Permissions
              </button>
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => setRolePermissionsOpen(false)} 
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Staff

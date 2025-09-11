import { useEffect, useMemo, useState } from 'react'
import { MoreVertical, Pencil, Eye, Trash2, Plus, Shield } from 'lucide-react'
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

const initialStaff = []

function Staff() {
  const navigate = useNavigate()
  const [staff, setStaff] = useState(initialStaff)
  const [roles, setRoles] = useState([])
  const [modules, setModules] = useState([])
  const [menuOpenId, setMenuOpenId] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [staffPermissions, setStaffPermissions] = useState([])
  const [permissionStates, setPermissionStates] = useState({})

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

  async function openPermissions(staffMember) {
    setEditing(staffMember)
    setPermissionsOpen(true)
    try {
      const res = await adminService.getStaffPermissions(staffMember.id)
      const permissions = res?.data || []
      setStaffPermissions(permissions)
      
      // Initialize permission states
      const states = {}
      permissions.forEach(perm => {
        states[perm.modulePermissionId] = perm.isGranted
      })
      setPermissionStates(states)
    } catch (_) {
      showToast('Failed to load permissions', 'error')
    }
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

  async function savePermissions() {
    setSavingPermissions(true)
    try {
      const modulePermissions = Object.entries(permissionStates).map(([modulePermissionId, isGranted]) => ({
        modulePermissionId,
        isGranted
      }))
      
      await adminService.updateStaffPermissions(editing.id, { modulePermissions })
      showToast('Permissions updated successfully')
      setPermissionsOpen(false)
    } catch (err) {
      showToast(err.message || 'Failed to update permissions', 'error')
    } finally {
      setSavingPermissions(false)
    }
  }

  function togglePermission(modulePermissionId) {
    setPermissionStates(prev => ({
      ...prev,
      [modulePermissionId]: !prev[modulePermissionId]
    }))
  }

  function toggleAllModulePermissions(moduleId) {
    const module = modules.find(m => m.id === moduleId)
    if (!module?.permissions) return

    const allChecked = module.permissions.every(permission => permissionStates[permission.id])
    
    const newStates = { ...permissionStates }
    module.permissions.forEach(permission => {
      newStates[permission.id] = !allChecked
    })
    
    setPermissionStates(newStates)
  }

  function isModuleAllSelected(moduleId) {
    const module = modules.find(m => m.id === moduleId)
    if (!module?.permissions?.length) return false
    
    return module.permissions.every(permission => permissionStates[permission.id])
  }

  function isModulePartiallySelected(moduleId) {
    const module = modules.find(m => m.id === moduleId)
    if (!module?.permissions?.length) return false
    
    const selectedCount = module.permissions.filter(permission => permissionStates[permission.id]).length
    return selectedCount > 0 && selectedCount < module.permissions.length
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

  async function loadModules() {
    try {
      const res = await adminService.listModules()
      setModules(res?.data || [])
    } catch (_) {
      showToast('Failed to load modules', 'error')
    }
  }

  useEffect(() => { 
    loadStaff()
    loadRoles()
    loadModules()
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

      {/* Permissions Modal */}
      <Modal open={permissionsOpen} onClose={() => setPermissionsOpen(false)} title="Staff Permissions">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Manage permissions for <span className="font-medium">{editing?.name}</span>
          </p>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{module.displayName}</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={isModuleAllSelected(module.id)}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isModulePartiallySelected(module.id)
                        }
                      }}
                      onChange={() => toggleAllModulePermissions(module.id)}
                    />
                    <span className="text-sm text-gray-600 font-medium">Select All</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {module.permissions?.map((permission) => (
                    <label key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={permissionStates[permission.id] || false}
                        onChange={() => togglePermission(permission.id)}
                      />
                      <span className="text-sm text-gray-700">{permission.displayName}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setPermissionsOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={savePermissions} 
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Save Permissions
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
    </div>
  )
}

export default Staff

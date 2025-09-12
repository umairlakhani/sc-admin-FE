import { useState, useEffect } from 'react'
import { MoreVertical, Eye, Edit, Trash2, Plus, Shield, Settings, ChevronDown, ChevronRight } from 'lucide-react'
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

// Accordion component for permissions
function PermissionsAccordion({ permissions, selectedPermissions, onTogglePermission, loading }) {
  const [expandedModules, setExpandedModules] = useState({})
  const groupedPermissions = groupPermissionsByModule(permissions)

  const toggleModule = (module) => {
    setExpandedModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }))
  }

  const toggleAllInModule = (modulePermissions, module) => {
    const allSelected = modulePermissions.every(p => selectedPermissions.includes(p.id))
    if (allSelected) {
      // Unselect all in this module
      modulePermissions.forEach(p => {
        if (selectedPermissions.includes(p.id)) {
          onTogglePermission(p.id)
        }
      })
    } else {
      // Select all in this module
      modulePermissions.forEach(p => {
        if (!selectedPermissions.includes(p.id)) {
          onTogglePermission(p.id)
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading permissions...</p>
      </div>
    )
  }

  if (permissions.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No permissions available</p>
  }

  return (
    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
        const isExpanded = expandedModules[module]
        const allSelected = modulePermissions.every(p => selectedPermissions.includes(p.id))
        const someSelected = modulePermissions.some(p => selectedPermissions.includes(p.id))
        
        return (
          <div key={module} className="border-b border-gray-100 last:border-b-0">
            <button
              onClick={() => toggleModule(module)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-medium text-gray-900 capitalize">{module}</span>
                <span className="text-sm text-gray-500">({modulePermissions.length} permissions)</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected && !allSelected
                  }}
                  onChange={() => toggleAllInModule(modulePermissions, module)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </button>
            
            {isExpanded && (
              <div className="px-3 pb-3 space-y-2 bg-gray-50">
                {modulePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => onTogglePermission(permission.id)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{permission.key}</div>
                      <div className="text-xs text-gray-500">{permission.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function RolesPermissions() {
  const [activeTab, setActiveTab] = useState('roles')
  const [roles, setRoles] = useState([])
  const [modules, setModules] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState('')
  
  // Module pagination state
  const [modulePage, setModulePage] = useState(1)
  const [moduleTotalPages, setModuleTotalPages] = useState(1)
  const [moduleLimit] = useState(6)
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  
  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    scope: 'staff',
    selectedPermissions: []
  })
  
  const [moduleForm, setModuleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    order: 1,
    createDefaultPermissions: true
  })
  
  // Loading states
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingPermissions, setLoadingPermissions] = useState(false)

  // Load roles
  async function loadRoles() {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 6,
        ...(searchTerm && { search: searchTerm })
      }
      const res = await adminService.listRoles(params)
      setRoles(res?.data || [])
      setTotalPages(res?.pagination?.totalPages || 1)
    } catch (err) {
      showToast(err.message || 'Failed to load roles', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load modules
  async function loadModules() {
    setLoading(true)
    try {
      const res = await adminService.listModules({
        page: modulePage,
        limit: moduleLimit
      })
      setModules(res?.data || [])
      setModuleTotalPages(res?.totalPages || 1)
    } catch (err) {
      showToast(err.message || 'Failed to load modules', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load permissions
  async function loadPermissions() {
    setLoadingPermissions(true)
    try {
      const res = await adminService.listPermissions()
      setPermissions(res?.data || [])
    } catch (err) {
      showToast(err.message || 'Failed to load permissions', 'error')
    } finally {
      setLoadingPermissions(false)
    }
  }

  function openCreate() {
    if (activeTab === 'roles') {
      setRoleForm({ name: '', description: '', scope: 'staff', selectedPermissions: [] })
      loadPermissions() // Load permissions when creating a role
    } else {
      setModuleForm({ name: '', displayName: '', description: '', order: 1, createDefaultPermissions: true })
    }
    setCreateModalOpen(true)
  }

  function openEdit(item) {
    setCurrent(item)
    if (activeTab === 'roles') {
      setRoleForm({
        name: item.name,
        description: item.description,
        scope: item.scope,
        selectedPermissions: item.Permissions ? item.Permissions.map(p => p.id) : []
      })
    } else {
      setModuleForm({
        name: item.name,
        displayName: item.displayName,
        description: item.description,
        order: item.order,
        createDefaultPermissions: false
      })
    }
    setEditModalOpen(true)
  }

  function openView(item) {
    setCurrent(item)
    setViewModalOpen(true)
  }

  function openDelete(item) {
    setCurrent(item)
    setDeleteModalOpen(true)
  }

  function openPermissionsModal(role) {
    setCurrent(role)
    setRoleForm(prev => ({
      ...prev,
      selectedPermissions: role.Permissions?.map(p => p.id) || []
    }))
    setPermissionsModalOpen(true)
    loadPermissions()
  }

  function togglePermission(permissionId) {
    setRoleForm(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId]
    }))
  }

  async function updateRolePermissions() {
    if (!current) return
    
    setSaving(true)
    try {
      await adminService.assignRolePermissions(current.id, {
        permissionIds: roleForm.selectedPermissions
      })
      showToast('Role permissions updated successfully')
      setPermissionsModalOpen(false)
      setCurrent(null)
      setRoleForm(prev => ({ ...prev, selectedPermissions: [] }))
      loadRoles()
    } catch (err) {
      showToast(err.message || 'Failed to update role permissions', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function createItem() {
    if (activeTab === 'roles') {
      if (!roleForm.name.trim()) {
        showToast('Please enter a role name', 'error')
        return
      }
      
      setSaving(true)
      try {
        // First create the role
        const roleData = {
          name: roleForm.name,
          description: roleForm.description,
          scope: roleForm.scope
        }
        const newRole = await adminService.createRole(roleData)
        
        // Then assign permissions if any are selected
        if (roleForm.selectedPermissions.length > 0) {
          await adminService.assignRolePermissions(newRole.data.id, {
            permissionIds: roleForm.selectedPermissions
          })
        }
        
        showToast('Role created successfully')
        setCreateModalOpen(false)
        setRoleForm({ name: '', description: '', scope: 'staff', selectedPermissions: [] })
        loadRoles()
      } catch (err) {
        showToast(err.message || 'Failed to create role', 'error')
      } finally {
        setSaving(false)
      }
    } else {
      if (!moduleForm.name.trim() || !moduleForm.displayName.trim()) {
        showToast('Please enter module name and display name', 'error')
        return
      }
      
      setSaving(true)
      try {
        await adminService.createModule(moduleForm)
        showToast('Module created successfully')
        setCreateModalOpen(false)
        setModuleForm({ name: '', displayName: '', description: '', order: 1, createDefaultPermissions: true })
        loadModules()
      } catch (err) {
        showToast(err.message || 'Failed to create module', 'error')
      } finally {
        setSaving(false)
      }
    }
  }

  async function updateItem() {
    if (activeTab === 'roles') {
      if (!roleForm.name.trim()) {
        showToast('Please enter a role name', 'error')
        return
      }
      
      setSaving(true)
      try {
        // Update role basic info
        await adminService.updateRole(current.id, {
          name: roleForm.name,
          description: roleForm.description,
          scope: roleForm.scope
        })
        
        // Update role permissions if they have changed
        if (roleForm.selectedPermissions) {
          await adminService.assignRolePermissions(current.id, {
            permissionIds: roleForm.selectedPermissions
          })
        }
        
        showToast('Role updated successfully')
        setEditModalOpen(false)
        setCurrent(null)
        loadRoles()
      } catch (err) {
        showToast(err.message || 'Failed to update role', 'error')
      } finally {
        setSaving(false)
      }
    } else {
      if (!moduleForm.name.trim() || !moduleForm.displayName.trim()) {
        showToast('Please enter module name and display name', 'error')
        return
      }
      
      setSaving(true)
      try {
        await adminService.updateModule(current.id, moduleForm)
        showToast('Module updated successfully')
        setEditModalOpen(false)
        setCurrent(null)
        loadModules()
      } catch (err) {
        showToast(err.message || 'Failed to update module', 'error')
      } finally {
        setSaving(false)
      }
    }
  }

  async function deleteItem() {
    setDeleting(true)
    try {
      if (activeTab === 'roles') {
        await adminService.deleteRole(current.id)
        showToast('Role deleted successfully')
        loadRoles()
      } else {
        await adminService.deleteModule(current.id)
        showToast('Module deleted successfully')
        loadModules()
      }
      setDeleteModalOpen(false)
      setCurrent(null)
    } catch (err) {
      showToast(err.message || `Failed to delete ${activeTab.slice(0, -1)}`, 'error')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'roles') {
      loadRoles()
    } else {
      loadModules()
    }
  }, [activeTab, page, searchTerm, modulePage])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuOpen && !event.target.closest('.relative')) {
        setMenuOpen('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500">Manage user roles and system permissions</p>
        </div>
        <button 
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          <Plus size={16} />
          {activeTab === 'roles' ? 'Create Role' : 'Create Module'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => {
            setActiveTab('roles')
            setPage(1)
            setModulePage(1)
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'roles'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Shield size={16} />
            Roles
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('modules')
            setPage(1)
            setModulePage(1)
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'modules'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Settings size={16} />
            Modules
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={activeTab === 'roles' ? 'Search roles...' : 'Search modules...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading roles...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Scope</th>
                    <th className="px-4 py-3">Permissions</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{role.name}</td>
                      <td className="px-4 py-3 text-gray-800">{role.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          role.scope === 'staff' ? 'bg-blue-50 text-blue-700' :
                          role.scope === 'admin' ? 'bg-purple-50 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {role.scope}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                          {role.Permissions?.length || 0} permissions
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button 
                            className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100" 
                            onClick={() => setMenuOpen(menuOpen === role.id ? '' : role.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuOpen === role.id && (
                            <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                              <button 
                                onClick={() => { setMenuOpen(''); openView(role) }} 
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button 
                                onClick={() => { setMenuOpen(''); openPermissionsModal(role) }} 
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <Shield size={14} /> Manage Permissions
                              </button>
                              <button 
                                onClick={() => { setMenuOpen(''); openEdit(role) }} 
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button 
                                onClick={() => { setMenuOpen(''); openDelete(role) }} 
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
          )}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading modules...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Permissions</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{module.displayName}</td>
                      <td className="px-4 py-3 text-gray-800">{module.description}</td>
                      <td className="px-4 py-3 text-gray-800">{module.order}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {module.permissions?.length || 0} permissions
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          module.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {module.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button 
                            className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100" 
                            onClick={() => setMenuOpen(menuOpen === module.id ? '' : module.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuOpen === module.id && (
                            <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                              <button 
                                onClick={() => { setMenuOpen(''); openView(module) }} 
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button 
                                onClick={() => { setMenuOpen(''); openEdit(module) }} 
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button 
                                onClick={() => { setMenuOpen(''); openDelete(module) }} 
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
          )}
        </div>
      )}

      {/* Pagination for Roles */}
      {activeTab === 'roles' && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      {/* Pagination for Modules */}
      {activeTab === 'modules' && (
        <Pagination page={modulePage} totalPages={moduleTotalPages} onChange={setModulePage} />
      )}

      {/* Create Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title={activeTab === 'roles' ? 'Create Role' : 'Create Module'}>
        <div className="space-y-4">
          {activeTab === 'roles' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter role description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                <select
                  value={roleForm.scope}
                  onChange={(e) => setRoleForm({ ...roleForm, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Permissions</label>
                  {roleForm.selectedPermissions.length > 0 && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {roleForm.selectedPermissions.length} selected
                    </span>
                  )}
                </div>
                <PermissionsAccordion
                  permissions={permissions}
                  selectedPermissions={roleForm.selectedPermissions}
                  onTogglePermission={togglePermission}
                  loading={loadingPermissions}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                <input
                  type="text"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., reports_management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={moduleForm.displayName}
                  onChange={(e) => setModuleForm({ ...moduleForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Reports Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter module description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="createDefaultPermissions"
                  checked={moduleForm.createDefaultPermissions}
                  onChange={(e) => setModuleForm({ ...moduleForm, createDefaultPermissions: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="createDefaultPermissions" className="ml-2 block text-sm text-gray-900">
                  Create default permissions (Read, Add, Update, Delete)
                </label>
              </div>
            </>
          )}
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setCreateModalOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={createItem} 
              disabled={saving}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : `Create ${activeTab === 'roles' ? 'Role' : 'Module'}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={activeTab === 'roles' ? 'Edit Role' : 'Edit Module'}>
        <div className="space-y-4">
          {activeTab === 'roles' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter role description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                <select
                  value={roleForm.scope}
                  onChange={(e) => setRoleForm({ ...roleForm, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {/* Permissions Section for Edit Role */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Permissions</label>
                  {roleForm.selectedPermissions && roleForm.selectedPermissions.length > 0 && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {roleForm.selectedPermissions.length} selected
                    </span>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  <PermissionsAccordion
                    permissions={permissions}
                    selectedPermissions={roleForm.selectedPermissions || []}
                    onTogglePermission={togglePermission}
                    loading={loadingPermissions}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                <input
                  type="text"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., reports_management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={moduleForm.displayName}
                  onChange={(e) => setModuleForm({ ...moduleForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Reports Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter module description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setEditModalOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={updateItem} 
              disabled={saving}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating...' : `Update ${activeTab === 'roles' ? 'Role' : 'Module'}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title={activeTab === 'roles' ? 'Role Details' : 'Module Details'}>
        {current && (
          <div className="space-y-4">
            {activeTab === 'roles' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900">{current.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      current.scope === 'staff' ? 'bg-blue-100 text-blue-800' :
                      current.scope === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {current.scope}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{current.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  {current.Permissions && current.Permissions.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      {Object.entries(groupPermissionsByModule(current.Permissions)).map(([module, modulePermissions]) => (
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
                  ) : (
                    <p className="text-sm text-gray-500 italic">No permissions assigned</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-sm text-gray-900">
                      {current.createdAt ? new Date(current.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <p className="text-sm text-gray-900">
                      {current.updatedAt ? new Date(current.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <p className="text-sm text-gray-900">{current.displayName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <p className="text-sm text-gray-900">{current.order}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                  <p className="text-sm text-gray-900 font-mono">{current.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{current.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    current.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {current.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                  <div className="mt-2 space-y-2">
                    {current.permissions?.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{permission.displayName}</span>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          permission.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {permission.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-sm text-gray-900">
                      {current.createdAt ? new Date(current.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <p className="text-sm text-gray-900">
                      {current.updatedAt ? new Date(current.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title={`Delete ${activeTab === 'roles' ? 'Role' : 'Module'}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this {activeTab.slice(0, -1)}? This action cannot be undone.
          </p>
          {current && (
            <div className="bg-gray-50 p-3 rounded-lg">
              {activeTab === 'roles' ? (
                <>
                  <p className="text-sm font-medium text-gray-900">Role: {current.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Description: {current.description}</p>
                  <p className="text-sm text-gray-500">Scope: {current.scope}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">Module: {current.displayName}</p>
                  <p className="text-sm text-gray-500 mt-1">Description: {current.description}</p>
                  <p className="text-sm text-gray-500">Order: {current.order}</p>
                </>
              )}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setDeleteModalOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={deleteItem} 
              disabled={deleting}
              className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : `Delete ${activeTab === 'roles' ? 'Role' : 'Module'}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Permissions Management Modal */}
      <Modal open={permissionsModalOpen} onClose={() => setPermissionsModalOpen(false)} title="Manage Role Permissions">
        {current && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Role: {current.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{current.description}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Select Permissions</label>
                {roleForm.selectedPermissions.length > 0 && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {roleForm.selectedPermissions.length} selected
                  </span>
                )}
              </div>
              <PermissionsAccordion
                permissions={permissions}
                selectedPermissions={roleForm.selectedPermissions}
                onTogglePermission={togglePermission}
                loading={loadingPermissions}
              />
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => setPermissionsModalOpen(false)} 
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={updateRolePermissions} 
                disabled={saving}
                className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Update Permissions'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RolesPermissions

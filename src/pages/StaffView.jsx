import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Shield, User, Mail, Building, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'

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

function StaffView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [staff, setStaff] = useState(null)
  const [modules, setModules] = useState([])
  const [permissions, setPermissions] = useState([])
  const [permissionStates, setPermissionStates] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)

  async function loadStaff() {
    setLoading(true)
    try {
      const res = await adminService.getStaff(id)
      setStaff(res?.data || res)
    } catch (err) {
      showToast(err.message || 'Failed to load staff details', 'error')
      navigate('/staff')
    } finally {
      setLoading(false)
    }
  }

  async function loadModules() {
    try {
      const res = await adminService.listModules()
      console.log('Modules API Response:', res)
      const modulesData = Array.isArray(res?.data) ? res.data : []
      console.log('Processed modules:', modulesData)
      setModules(modulesData)
    } catch (err) {
      console.error('Error loading modules:', err)
      showToast('Failed to load modules', 'error')
      setModules([]) // Ensure modules is always an array
    }
  }

  async function loadPermissions() {
    try {
      const res = await adminService.getStaffPermissions(id)
      console.log('Permissions API Response:', res)
      const staffPermissions = Array.isArray(res?.data?.modulePermissions) ? res.data.modulePermissions : []
      console.log('Processed permissions:', staffPermissions)
      setPermissions(staffPermissions)
      
      // Initialize permission states
      const states = {}
      staffPermissions.forEach(perm => {
        states[perm.modulePermissionId] = perm.isGranted
      })
      console.log('Permission states:', states)
      setPermissionStates(states)
    } catch (err) {
      console.error('Error loading permissions:', err)
      showToast('Failed to load permissions', 'error')
      setPermissions([]) // Ensure permissions is always an array
    }
  }

  async function savePermissions() {
    setSavingPermissions(true)
    try {
      const modulePermissions = Object.entries(permissionStates).map(([modulePermissionId, isGranted]) => ({
        modulePermissionId,
        isGranted
      }))
      
      await adminService.updateStaffPermissions(id, { modulePermissions })
      showToast('Permissions updated successfully')
      setPermissionsOpen(false)
      loadPermissions() // Reload permissions to reflect changes
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

  useEffect(() => {
    if (id) {
      loadStaff()
      loadModules()
      loadPermissions()
    }
  }, [id])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff details...</p>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Staff member not found</p>
          <button 
            onClick={() => navigate('/staff')}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            Back to Staff List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{staff.name}</h1>
          <p className="text-sm text-gray-500">Staff Details & Permissions</p>
        </div>
        <button 
          onClick={() => navigate('/staff')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Back to Staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-sm text-gray-900">{staff.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail size={14} />
                  Email Address
                </label>
                <p className="text-sm text-gray-900">{staff.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-sm text-gray-900">{staff.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  staff.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building size={20} />
              Account Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                <p className="text-sm text-gray-900 font-mono">{staff.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role ID</label>
                <p className="text-sm text-gray-900 font-mono">{staff.roleId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={14} />
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {staff.updatedAt ? new Date(staff.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Permissions Summary
            </h2>
            <div className="space-y-3">
              {modules.map((module) => {
                const modulePermissions = (Array.isArray(permissions) ? permissions : []).filter(p => 
                  module.permissions?.some(mp => mp.id === p.modulePermissionId)
                )
                const grantedCount = modulePermissions.filter(p => p.isGranted).length
                const totalCount = module.permissions?.length || 0
                
                return (
                  <div key={module.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{module.displayName}</h4>
                      <span className="text-xs text-gray-500">{grantedCount}/{totalCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: totalCount > 0 ? `${(grantedCount / totalCount) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button 
              onClick={() => setPermissionsOpen(true)}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              <Pencil size={16} />
              Edit Permissions
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Modal */}
      <Modal open={permissionsOpen} onClose={() => setPermissionsOpen(false)} title="Staff Permissions">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Manage permissions for <span className="font-medium">{staff.name}</span>
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
              disabled={savingPermissions}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPermissions ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StaffView

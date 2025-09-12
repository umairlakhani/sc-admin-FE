import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Shield, Users, Settings } from 'lucide-react'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'

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

function RoleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRole()
  }, [id])

  async function loadRole() {
    try {
      setLoading(true)
      const data = await adminService.getRole(id)
      setRole(data)
    } catch (err) {
      setError(err.message || 'Failed to load role')
      showToast(err.message || 'Failed to load role', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/roles-permissions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Roles
          </button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/roles-permissions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Roles
          </button>
        </div>
        <div className="text-center py-12">
          <Shield size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Role not found</h3>
          <p className="text-gray-500">The role you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  const groupedPermissions = groupPermissionsByModule(role.Permissions || [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/roles-permissions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Roles
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{role.name}</h1>
            <p className="text-gray-500">Role Details & Permissions</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/roles-permissions?edit=${role.id}`)}
          className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          <Edit size={16} />
          Edit Role
        </button>
      </div>

      {/* Role Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Role Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <p className="text-gray-900 font-medium">{role.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-600">{role.description || 'No description provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  role.scope === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {role.scope === 'admin' ? 'Admin' : 'Staff'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-600">
                  {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
              <span className="text-sm text-gray-500">
                ({role.Permissions ? role.Permissions.length : 0} permissions)
              </span>
            </div>
            
            {role.Permissions && role.Permissions.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 capitalize">{module}</span>
                        <span className="text-sm text-gray-500">({modulePermissions.length} permissions)</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between bg-white p-3 rounded border">
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
              <div className="text-center py-8">
                <Settings size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No permissions assigned to this role</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Permissions</span>
                <span className="font-medium">{role.Permissions ? role.Permissions.length : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Modules</span>
                <span className="font-medium">{Object.keys(groupedPermissions).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Scope</span>
                <span className="font-medium capitalize">{role.scope}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/roles-permissions?edit=${role.id}`)}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                <Edit size={16} />
                Edit Role
              </button>
              <button
                onClick={() => navigate('/roles-permissions')}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
                Back to Roles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleView


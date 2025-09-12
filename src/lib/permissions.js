// Permission utility functions for role-based access control

/**
 * Get user permissions from localStorage
 * @returns {Array} Array of permission strings
 */
export const getUserPermissions = () => {
  try {
    const permissions = localStorage.getItem('user_permissions')
    return permissions ? JSON.parse(permissions) : []
  } catch (error) {
    console.error('Error parsing user permissions:', error)
    return []
  }
}

/**
 * Get user role from localStorage
 * @returns {Object} User role object
 */
export const getUserRole = () => {
  try {
    const role = localStorage.getItem('user_role')
    return role ? JSON.parse(role) : null
  } catch (error) {
    console.error('Error parsing user role:', error)
    return null
  }
}

/**
 * Get user data from localStorage
 * @returns {Object} User data object
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check (e.g., 'dashboard.read')
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (permission) => {
  const permissions = getUserPermissions()
  
  // If user has all permissions (super admin)
  if (permissions.includes('*') || permissions.includes('all')) {
    return true
  }
  
  // Check for exact permission
  if (permissions.includes(permission)) {
    return true
  }
  
  // Check for wildcard permissions (e.g., 'dashboard.*' for 'dashboard.read')
  const module = permission.split('.')[0]
  if (permissions.includes(`${module}.*`)) {
    return true
  }
  
  return false
}

/**
 * Check if user has read permission for a module
 * @param {string} module - Module name (e.g., 'dashboard', 'users', 'staff')
 * @returns {boolean} True if user can read the module
 */
export const canRead = (module) => {
  return hasPermission(`${module}.read`)
}

/**
 * Check if user has write permission for a module
 * @param {string} module - Module name
 * @returns {boolean} True if user can write to the module
 */
export const canWrite = (module) => {
  return hasPermission(`${module}.add`) || hasPermission(`${module}.update`)
}

/**
 * Check if user has delete permission for a module
 * @param {string} module - Module name
 * @returns {boolean} True if user can delete from the module
 */
export const canDelete = (module) => {
  return hasPermission(`${module}.delete`)
}

/**
 * Check if user has any permission for a module
 * @param {string} module - Module name
 * @returns {boolean} True if user has any permission for the module
 */
export const hasAnyPermission = (module) => {
  const permissions = getUserPermissions()
  
  // If user has all permissions
  if (permissions.includes('*') || permissions.includes('all')) {
    return true
  }
  
  // Check for any module permission
  return permissions.some(permission => 
    permission.startsWith(`${module}.`) || permission === `${module}.*`
  )
}

/**
 * Get filtered navigation items based on user permissions
 * @param {Array} navigationItems - Array of navigation items
 * @returns {Array} Filtered navigation items
 */
export const getFilteredNavigationItems = (navigationItems) => {
  return navigationItems.filter(item => {
    // If no permission required, show item
    if (!item.permission) {
      return true
    }
    
    // Check if user has the required permission
    return hasPermission(item.permission)
  })
}

/**
 * Module permission mapping for navigation
 */
export const MODULE_PERMISSIONS = {
  dashboard: 'dashboard.read',
  users: 'users.read',
  staff: 'staff.read',
  'roles-permissions': 'roles_permissions.read',
  properties: 'properties.read',
  plans: 'subscriptions.read',
  billing: 'subscriptions.read',
  support: 'support.read',
  notifications: 'notifications.read'
}

/**
 * Check if user can access a route
 * @param {string} route - Route path
 * @returns {boolean} True if user can access the route
 */
export const canAccessRoute = (route) => {
  // Remove leading slash and get the first part
  const module = route.replace('/', '').split('/')[0]
  
  // Map route to permission
  const permission = MODULE_PERMISSIONS[module]
  
  if (!permission) {
    return true // Allow access if no permission defined
  }
  
  return hasPermission(permission)
}


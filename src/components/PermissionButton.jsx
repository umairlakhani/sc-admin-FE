import { hasPermission } from '../lib/permissions'

/**
 * PermissionButton component that only renders if user has the required permission
 * @param {Object} props - Component props
 * @param {string} props.permission - Required permission to show the button
 * @param {React.ReactNode} props.children - Button content
 * @param {boolean} props.fallback - Whether to show a fallback element if no permission
 * @param {React.ReactNode} props.fallbackElement - Element to show if no permission (default: null)
 * @returns {React.ReactNode} Button or fallback element
 */
function PermissionButton({ 
  permission, 
  children, 
  fallback = false, 
  fallbackElement = null,
  ...props 
}) {
  const hasAccess = hasPermission(permission)
  
  if (!hasAccess) {
    return fallback ? fallbackElement : null
  }
  
  return children
}

export default PermissionButton


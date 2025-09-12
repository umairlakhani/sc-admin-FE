import { Navigate } from 'react-router-dom'
import { canAccessRoute } from '../lib/permissions'

/**
 * ProtectedRoute component that checks user permissions before allowing access
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.requiredPermission - Required permission to access the route
 * @param {string} props.fallbackRoute - Route to redirect to if access denied (default: '/dashboard')
 * @returns {React.ReactNode} Protected content or redirect
 */
function ProtectedRoute({ 
  children, 
  requiredPermission, 
  fallbackRoute = '/dashboard' 
}) {
  // Check if user has the required permission
  const hasAccess = requiredPermission ? canAccessRoute(requiredPermission) : true
  
  if (!hasAccess) {
    // Redirect to fallback route if user doesn't have permission
    return <Navigate to={fallbackRoute} replace />
  }
  
  return children
}

export default ProtectedRoute


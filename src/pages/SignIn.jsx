import { useState } from 'react'
import { authService } from '../lib/api'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Function to detect user type based on email
  const detectUserType = (email) => {
    const emailLower = email.toLowerCase()
    console.log('Detecting user type for email:', emailLower)
    
    // Check for super admin patterns first (more specific)
    if (emailLower.includes('superadmin') || 
        emailLower.includes('super-admin') ||
        emailLower.includes('administrator') ||
        emailLower.endsWith('@superadmin.com') ||
        emailLower.endsWith('@admin.com')) {
      console.log('Detected as Super Admin')
      return 'superAdmin'
    }
    
    // Check for general admin patterns
    if (emailLower.includes('admin')) {
      console.log('Detected as Super Admin (admin pattern)')
      return 'superAdmin'
    }
    
    // Check for staff patterns
    if (emailLower.includes('staff') || 
        emailLower.includes('employee') ||
        emailLower.includes('support') ||
        emailLower.endsWith('@staff.com') ||
        emailLower.endsWith('@company.com')) {
      console.log('Detected as Staff')
      return 'staff'
    }
    
    // Default to staff for other emails
    console.log('Defaulting to Staff')
    return 'staff'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!email || !password) {
      setError('Please enter email and password')
      setLoading(false)
      return
    }

    try {
      const userType = detectUserType(email)
      console.log('Detected user type:', userType)
      let res
      let finalUserType = userType
      
      // Try the appropriate login method based on detected user type
      try {
        if (userType === 'superAdmin') {
          console.log('Attempting Super Admin login...')
          res = await authService.staffLogin({ email, password })
          console.log('Super Admin login successful:', res)
        } else {
          console.log('Attempting Staff login...')
          res = await authService.staffLogin({ email, password })
          console.log('Staff login successful:', res)
        }
      } catch (firstError) {
        // If first attempt fails, try the other method as fallback
        console.log('First login attempt failed, trying fallback...', firstError.message)
        try {
          if (userType === 'superAdmin') {
            console.log('Fallback: Trying Staff login...')
            res = await authService.staffLogin({ email, password })
            finalUserType = 'staff'
          } else {
            console.log('Fallback: Trying Super Admin login...')
            res = await authService.staffLogin({ email, password })
            finalUserType = 'superAdmin'
          }
        } catch (secondError) {
          console.log('Both login attempts failed:', secondError.message)
          throw new Error('Invalid credentials. Please check your email and password.')
        }
      }
      
      // Expecting token in response; adjust key as per API
      const token = res?.token || res?.accessToken || res?.data?.token
      if (!token) throw new Error('Invalid login response')
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth', 'true')
      localStorage.setItem('user_type', finalUserType)
      
      // Store user data, role and permissions if available
      if (res?.data) {
        localStorage.setItem('user_data', JSON.stringify(res.data))
        localStorage.setItem('user_role', JSON.stringify(res.data.role))
        localStorage.setItem('user_permissions', JSON.stringify(res.data.permissions || []))
        localStorage.setItem('user_name', res.data.name || '')
        localStorage.setItem('user_email', res.data.email || '')
      }
      
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-b from-green-50 to-muted flex items-center justify-center px-4 overflow-auto">
      <div className="grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div>
            <div className="text-sm/none inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-white" />
              <span className="opacity-90">Admin</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">Welcome to Search-casa Admin</h2>
            <p className="mt-2 text-white/90 text-sm">Manage dashboards, users, properties, plans and notifications.</p>
          </div>
          <div className="text-xs text-white/80">© {new Date().getFullYear()} Search Casa</div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-green-500" />
              <div className="font-semibold text-gray-800">Search casa</div>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Sign in</h1>
            <p className="text-sm text-gray-500">Enter your email and password. User type will be detected automatically.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  // Test detection in real-time
                  if (e.target.value) {
                    const detectedType = detectUserType(e.target.value)
                    console.log(`Email: ${e.target.value} -> Detected as: ${detectedType}`)
                  }
                }}
                placeholder="admin@company.com or staff@company.com"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                System will automatically detect if you're Admin or Staff based on your email
              </p>
              {email && (
                <p className="text-xs text-blue-600 mt-1">
                  Detected as: <strong>{detectUserType(email)}</strong>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-md bg-green-500 text-white px-3 py-2 text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignIn



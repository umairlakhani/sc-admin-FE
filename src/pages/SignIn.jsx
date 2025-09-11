import { useState } from 'react'
import { authService } from '../lib/api'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('admin') // 'admin' or 'staff'
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    try {
      const res = userType === 'staff' 
        ? await authService.staffLogin({ email, password })
        : await authService.login({ email, password })
      // Expecting token in response; adjust key as per API
      const token = res?.token || res?.accessToken || res?.data?.token
      if (!token) throw new Error('Invalid login response')
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth', 'true')
      localStorage.setItem('user_type', userType)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
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
            <p className="text-sm text-gray-500">Use your email and password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Login as</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="admin"
                    checked={userType === 'admin'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Admin</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="staff"
                    checked={userType === 'staff'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Staff</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button type="submit" className="w-full rounded-md bg-green-500 text-white px-3 py-2 text-sm font-medium hover:bg-green-600">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignIn



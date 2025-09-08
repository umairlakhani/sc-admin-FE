import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import PlanView from './pages/PlanView'
import Users from './pages/Users'
import UserView from './pages/UserView'
import Properties from './pages/Properties'
import Notifications from './pages/Notifications'
import Support from './pages/Support'
import SignIn from './pages/SignIn'

function PrivateRoute({ children }) {
  const isAuthed = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true'
  return isAuthed ? children : <Navigate to="/signin" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/:id" element={<PlanView />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserView />} />
          <Route path="properties" element={<Properties />} />
          <Route path="support" element={<Support />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

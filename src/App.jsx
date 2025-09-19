import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import PlanView from './pages/PlanView'
import Users from './pages/Users'
import UserView from './pages/UserView'
import Properties from './pages/Properties'
import PropertyView from './pages/PropertyView'
import Notifications from './pages/Notifications'
import Support from './pages/Support'
import SupportView from './pages/SupportView'
import SignIn from './pages/SignIn'
import Billing from './pages/Billing'
import Staff from './pages/Staff'
import StaffView from './pages/StaffView'
import RolesPermissions from './pages/RolesPermissions'
import RoleView from './pages/RoleView'
import MatchingRules from './pages/MatchingRules'
import MatchingRuleView from './pages/MatchingRuleView'
import Criteria from './pages/Criteria'
import ProtectedRoute from './components/ProtectedRoute'

function PrivateRoute({ children }) {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
  return hasToken ? children : <Navigate to="/signin" replace />
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
          <Route path="dashboard" element={
            <ProtectedRoute requiredPermission="dashboard.read">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="plans" element={
            <ProtectedRoute requiredPermission="subscriptions.read">
              <Plans />
            </ProtectedRoute>
          } />
          <Route path="plans/:id" element={
            <ProtectedRoute requiredPermission="subscriptions.read">
              <PlanView />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute requiredPermission="users.read">
              <Users />
            </ProtectedRoute>
          } />
          <Route path="users/:id" element={
            <ProtectedRoute requiredPermission="users.read">
              <UserView />
            </ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute requiredPermission="staff.read">
              <Staff />
            </ProtectedRoute>
          } />
          <Route path="staff/:id" element={
            <ProtectedRoute requiredPermission="staff.read">
              <StaffView />
            </ProtectedRoute>
          } />
          <Route path="properties" element={
            <ProtectedRoute requiredPermission="properties.read">
              <Properties />
            </ProtectedRoute>
          } />
          <Route path="properties/:id" element={
            <ProtectedRoute requiredPermission="properties.read">
              <PropertyView />
            </ProtectedRoute>
          } />
          <Route path="support" element={
            <ProtectedRoute requiredPermission="support.read">
              <Support />
            </ProtectedRoute>
          } />
          <Route path="support/:id" element={
            <ProtectedRoute requiredPermission="support.read">
              <SupportView />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute requiredPermission="notifications.read">
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="billing" element={
            <ProtectedRoute requiredPermission="subscriptions.read">
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="roles-permissions" element={
            <ProtectedRoute requiredPermission="roles_permissions.read">
              <RolesPermissions />
            </ProtectedRoute>
          } />
          <Route path="matching-rules" element={
            <ProtectedRoute requiredPermission="properties.read">
              <MatchingRules />
            </ProtectedRoute>
          } />
          <Route path="matching-rules/:id" element={
            <ProtectedRoute requiredPermission="properties.read">
              <MatchingRuleView />
            </ProtectedRoute>
          } />
          <Route path="criteria" element={
            <ProtectedRoute requiredPermission="properties.read">
              <Criteria />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

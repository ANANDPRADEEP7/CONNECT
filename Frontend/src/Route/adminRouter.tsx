import { Route, Navigate } from 'react-router-dom'
import { AdminProtectedRoute } from '../components1/common/ProtectedRoute'
import { lazy } from 'react'

const AdminLayout = lazy(() => import('../components1/admin/Dashboard/AdminLayout'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard/AdminDashboard'))
const UserManagement = lazy(() => import('../pages/admin/Dashboard/UserManagement'))
const RiderManagement = lazy(() => import('../pages/admin/Dashboard/RiderManagement'))

const AdminRoutes = () => (
  <>
    <Route element={<AdminProtectedRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="riders" element={<RiderManagement />} />
      </Route>
    </Route>
  </>
)

export default AdminRoutes



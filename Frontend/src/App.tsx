import SignupPage from './pages/user/Auth/SignupPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import OtpVerification from './pages/user/Auth/VerifyOtp'
import Login from './pages/user/Auth/LoginPage'
import ForgotPassword from './pages/user/Auth/ForgotPasswordPage'
import ResetPassword from './pages/user/Auth/ResetPasswordPage'
import Home from './pages/user/Home/Home'
import Profile from './pages/user/Profile/Profile'
import AdminLogin from './pages/admin/Auth/AdminLoginPage'
import AdminLayout from './components1/admin/Dashboard/AdminLayout'
import Dashboard from './pages/admin/Dashboard/AdminDashboard'
import UserManagement from './pages/admin/Dashboard/UserManagement'
import RiderManagement from './pages/admin/Dashboard/RiderManagement'
import { UserProtectedRoute, AdminProtectedRoute, PublicRoute } from './components1/common/ProtectedRoute'

const App = () => {
  return (
    <Routes>
      {/* Public Routes - Only accessible when not logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<SignupPage />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/Admin/login" element={<AdminLogin />} />
        <Route path="/user/verifyOtp" element={<OtpVerification />} />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* User Protected Routes */}
      <Route element={<UserProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="riders" element={<RiderManagement />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App


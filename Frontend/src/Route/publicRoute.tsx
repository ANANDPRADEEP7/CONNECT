import { Route } from 'react-router-dom'
import { PublicRoute } from '../components1/common/ProtectedRoute'
import { lazy } from 'react'

const SignupPage = lazy(() => import('../pages/user/Auth/SignupPage'))
const Login = lazy(() => import('../pages/user/Auth/LoginPage'))
const AdminLogin = lazy(() => import('../pages/admin/Auth/AdminLoginPage'))
const OtpVerification = lazy(() => import('../pages/user/Auth/VerifyOtp'))
const ForgotPassword = lazy(() => import('../pages/user/Auth/ForgotPasswordPage'))
const ResetPassword = lazy(() => import('../pages/user/Auth/ResetPasswordPage'))

const PublicRoutes = () => (
  <>
    <Route element={<PublicRoute />}>
      <Route path="/" element={<SignupPage />} />
      <Route path="/user/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/user/verifyOtp" element={<OtpVerification />} />
      <Route path="/user/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Route>
  </>
)

export default PublicRoutes
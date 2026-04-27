import { Route } from 'react-router-dom'
import { UserProtectedRoute } from '../components1/common/ProtectedRoute'
import { lazy } from 'react'

const Home = lazy(() => import('../pages/user/Home/Home'))
const Profile = lazy(() => import('../pages/user/Profile/Profile'))
const PostRidePage = lazy(() => import('../pages/user/Ride/PostRidePage'))

const UserRoutes = () => (
  <>
    <Route element={<UserProtectedRoute />}>
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/post-ride" element={<PostRidePage />} />
    </Route>
  </>
)

export default UserRoutes
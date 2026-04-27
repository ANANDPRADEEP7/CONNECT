import { Route } from 'react-router-dom'
import { UserProtectedRoute } from '../components1/common/ProtectedRoute'
import { lazy } from 'react'

const PickupDrop = lazy(() => import('../components1/user/Rider/pickup-dropForm'))

const RiderRoutes = [
  <Route key="rider" element={<UserProtectedRoute />}>
    <Route path="/pickup-drop" element={<PickupDrop />} />
  </Route>
];

export default RiderRoutes
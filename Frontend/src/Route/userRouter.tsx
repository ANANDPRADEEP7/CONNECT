import { Route } from 'react-router-dom'
import { UserProtectedRoute } from '../components1/common/ProtectedRoute'
import { lazy } from 'react'

const Home = lazy(() => import('../pages/user/Home/Home'))
const Profile = lazy(() => import('../pages/user/Profile/Profile'))
const PostRidePage = lazy(() => import('../pages/user/Ride/PostRidePage'))
const AddStopoverPage = lazy(() => import('../pages/user/Ride/AddStopoverPage'))
const DateSelectionPage = lazy(() => import('../pages/user/Ride/DateSelectionPage'))
const PickupTimePage = lazy(() => import('../pages/user/Ride/PickupTimePage'))
const PassengerCapacityPage = lazy(() => import('../pages/user/Ride/PassengerCapacityPage'))
const PriceSelectionPage = lazy(() => import('../pages/user/Ride/PriceSelectionPage'))
const InstantBookingPage = lazy(() => import('../pages/user/Ride/InstantBookingPage'))
const MyPostedRides = lazy(() => import('../pages/user/Ride/MyPostedRides'))
const SearchPage = lazy(() => import('../pages/user/Search/SearchPage'))
const RideDetailPage = lazy(() => import('../pages/user/Ride/RideDetailPage'))
const EditRidePage = lazy(() => import('../pages/user/Ride/EditRidePage'))
const MyBookings = lazy(() => import('../pages/user/Ride/MyBookings'))

const UserRoutes = [
  <Route key="user" element={<UserProtectedRoute />}>
    <Route path="/home" element={<Home />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/post-ride" element={<PostRidePage />} />
    <Route path="/add-stopover" element={<AddStopoverPage />} />
    <Route path="/ride-date" element={<DateSelectionPage />} />
    <Route path="/ride-time" element={<PickupTimePage />} />
    <Route path="/ride-capacity" element={<PassengerCapacityPage />} />
    <Route path="/ride-price" element={<PriceSelectionPage />} />
    <Route path="/ride-booking" element={<InstantBookingPage />} />
    <Route path="/my-rides" element={<MyPostedRides />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/ride/:id" element={<RideDetailPage />} />
    <Route path="/ride/:id/edit" element={<EditRidePage />} />
    <Route path="/my-bookings" element={<MyBookings />} />
  </Route>
];

export default UserRoutes
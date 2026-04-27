import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import PublicRoutes from './publicRoute'
import UserRoutes from './userRouter'
import RiderRoutes from './riderRouter'
import AdminRoutes from './adminRouter'



const MainRouter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <PublicRoutes />
        <UserRoutes />
        <RiderRoutes />
        <AdminRoutes />

        {/* fallback */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Suspense>
  )
}

export default MainRouter
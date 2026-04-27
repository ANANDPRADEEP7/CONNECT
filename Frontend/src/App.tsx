import { useEffect } from "react"
import MainRouter from "./Route/mainRoute"
import { useAppDispatch } from "./store/hooks"
import { checkAuthSession } from "./store/slices/authSlice"

const App = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuthSession())
  }, [dispatch])

  return <MainRouter />
}

export default App
import {BrowserRouter,  Route, Routes} from "react-router-dom"
import { AppLayout } from "./components"
import {useUser} from "./providers/useUser"
import { CompanionBookings, CompanionProfile, Explore, Home, Login, MyBookings, NotFound, Register } from "./pages"



function App (){
const {user,logout,loading} = useUser

return (
  <BrowserRouter>
  <AppLayout
  user={user}
  onLogout={logout}
  logoutLoading={loading}
  >
    <Routes>
      <Route
      path="/"
      element={<Home/>}
      />
       <Route
      path="/explore"
      element={<Explore/>}
      />
       <Route
      path="/login"
      element={<Login/>}
      />
       <Route
      path="/register"
      element={<Register/>}
      />
       <Route
      path="/companion/:id"
      element={<CompanionProfile/>}
      />
       <Route
      path="/booking/:id"
      element={<CompanionBookings/>}
      />
       <Route
      path="/my-bookings"
      element={<MyBookings/>}
      />
       <Route
      path="*"
      element={<NotFound/>}
      />
    </Routes>
  </AppLayout>
  </BrowserRouter>
)

}
export default App
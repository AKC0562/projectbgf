import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  AppLayout,
  ProtectedRoute,
  RoleRoute,
  GuestRoute,
} from "./components";

import { useUser } from "./hooks/useUser";

// Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompanionProfile from "./pages/CompanionProfile";
import Booking from "./pages/Booking";
import CompanionBooking from "./pages/CompanionBooking";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import { CompleteProfile } from "./pages";

function App() {
  const {
    user,
    logout,
    loading,
  } = useUser();

  return (
    <BrowserRouter>
      <AppLayout
        user={user}
        onLogout={logout}
        logoutLoading={loading}
      >
        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/explore"
            element={<Explore />}
          />

     <Route element={<GuestRoute />}>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

    </Route>

          <Route
            path="/companion/:id"
            element={<CompanionProfile />}
          />


          {/* =========================
              AUTHENTICATED ROUTES
          ========================== */}

          <Route element={<ProtectedRoute />}>

            <Route 
            path="/complete-profile"
            element={<CompleteProfile/>}
            />
            {/* User routes */}
            <Route element={<RoleRoute allowedRoles={["user"]} />}>

              <Route
                path="/booking/:id"
                element={<Booking />}
              />

              <Route
                path="/my-bookings"
                element={<MyBookings />}
              />

            </Route>


            {/* Companion routes */}
            <Route
              element={
                <RoleRoute
                  allowedRoles={["companion"]}
                />
              }
            >

              <Route
                path="/companion-bookings"
                element={<CompanionBooking />}
              />

            </Route>

          </Route>


          {/* =========================
              404
          ========================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
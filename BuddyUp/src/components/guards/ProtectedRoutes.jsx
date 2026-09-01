import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useUser();

  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        <p className="text-lg font-medium text-gray-400">
          Checking authentication...
        </p>
      </main>
    );
  }

  // Login nahi hai
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated
  return <Outlet />;
}

export default ProtectedRoute;
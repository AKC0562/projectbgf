import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../providers/useUser";

function RoleRoute({ allowedRoles }) {
  const {
    isAuthenticated,
    role,
    loading,
  } = useUser();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-lg font-medium text-gray-400">
          Checking access...
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
      />
    );
  }

  // Role allowed nahi hai
  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleRoute;
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../providers/useUser";

function GuestRoute() {
  const {
    isAuthenticated,
    loading,
  } = useUser();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-lg font-medium text-gray-400">
          Checking authentication...
        </p>
      </main>
    );
  }

  // Already logged in
  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default GuestRoute;
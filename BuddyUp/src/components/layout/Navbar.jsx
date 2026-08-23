import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Compass,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

function Navbar({
  user,
  onLogout,
  logoutLoading = false,
}) {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = Boolean(user?.auth);

  const profile = user?.profile;
  const role = profile?.role;

  const handleLogout = async () => {
    try {
      await onLogout();

      setMobileOpen(false);

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-purple-700/30 bg-black">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#570080]">
            <Compass size={20} />
          </div>

          <span className="text-xl font-bold text-white">
            BuddyUp
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm transition ${
                isActive
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-white"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `text-sm transition ${
                isActive
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-white"
              }`
            }
          >
            Explore
          </NavLink>

          {isAuthenticated && role === "user" && (
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                `text-sm transition ${
                  isActive
                    ? "text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`
              }
            >
              My Bookings
            </NavLink>
          )}

          {isAuthenticated && role === "companion" && (
            <NavLink
              to="/companion-bookings"
              className={({ isActive }) =>
                `text-sm transition ${
                  isActive
                    ? "text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`
              }
            >
              Bookings
            </NavLink>
          )}

        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl border border-purple-700/40 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-purple-500 hover:text-white"
              >
                <LogIn size={16} />
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-[#570080] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d009f]"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-700/40 bg-zinc-950">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile?.name || "Profile"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={17} />
                  )}
                </div>

                <div className="hidden lg:block">
                  <p className="max-w-28 truncate text-sm font-medium text-white">
                    {profile?.name ||
                      user?.auth?.name ||
                      "User"}
                  </p>

                  <p className="text-xs capitalize text-gray-500">
                    {role || "Account"}
                  </p>
                </div>

              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:border-red-500/60 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut size={16} />

                {logoutLoading
                  ? "Logging out..."
                  : "Logout"}
              </button>
            </>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() =>
            setMobileOpen((prev) => !prev)
          }
          className="rounded-lg border border-purple-700/30 p-2 text-gray-300 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-purple-700/30 bg-black px-5 py-5 md:hidden">

          <nav className="flex flex-col gap-2">

            <NavLink
              to="/"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-gray-300 hover:bg-zinc-900 hover:text-white"
            >
              Home
            </NavLink>

            <NavLink
              to="/explore"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-gray-300 hover:bg-zinc-900 hover:text-white"
            >
              Explore
            </NavLink>

            {isAuthenticated &&
              role === "user" && (
                <NavLink
                  to="/my-bookings"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-gray-300 hover:bg-zinc-900 hover:text-white"
                >
                  My Bookings
                </NavLink>
              )}

            {isAuthenticated &&
              role === "companion" && (
                <NavLink
                  to="/companion-bookings"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-gray-300 hover:bg-zinc-900 hover:text-white"
                >
                  Bookings
                </NavLink>
              )}

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="mt-2 rounded-xl border border-purple-700/40 px-4 py-3 text-center text-gray-300"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-[#570080] px-4 py-3 text-center font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 text-red-300"
              >
                <LogOut size={17} />

                {logoutLoading
                  ? "Logging out..."
                  : "Logout"}
              </button>
            )}

          </nav>

        </div>
      )}
    </header>
  );
}

export default Navbar;
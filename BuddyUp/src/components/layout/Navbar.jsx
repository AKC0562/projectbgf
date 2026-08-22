import {
  Compass,
  LogIn,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

import LogoutButton from "../auth/LogoutButton";

function Navbar({
  user = null,
  onLogout,
  logoutLoading = false,
}) {
  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur">
      
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-white"
        >
          Buddy
          <span className="text-purple-500">
            Up
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">

          <Link
            to="/explore"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <Compass size={17} />
            Explore
          </Link>

          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              <UserRound size={17} />
              Profile
            </Link>
          )}

        </nav>

        {/* Auth */}
        <div>
          {user ? (
            <LogoutButton
              onLogout={onLogout}
              loading={logoutLoading}
            />
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-[#570080] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6d009f]"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>

      </div>

    </header>
  );
}

export default Navbar;
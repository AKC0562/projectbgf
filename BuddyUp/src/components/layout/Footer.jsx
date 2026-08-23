import {
  Compass,
  Heart,
  ShieldCheck,
} from "lucide-react";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-white/10 text-white">

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand */}
          <div>
            <Link
              to="/"
              className="text-2xl font-bold"
            >
              Buddy
              <span className="text-purple-500">
                Up
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              Connect with verified companions
              for coffee, movies, study sessions,
              events, and meaningful conversations.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold">
              Explore
            </h3>

            <div className="mt-4 space-y-3">

              <Link
                to="/explore"
                className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
              >
                <Compass size={16} />
                Find Companions
              </Link>

              <Link
                to="/my-bookings"
                className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
              >
                <Heart size={16} />
                My Bookings
              </Link>

            </div>
          </div>

          {/* Trust */}
          <div>
            <h3 className="font-semibold">
              Safety & Trust
            </h3>

            <div className="mt-4 flex items-start gap-3">

              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-purple-400"
              />

              <p className="text-sm leading-6 text-gray-400">
                We focus on verified profiles,
                transparent bookings, and safe
                social experiences.
              </p>

            </div>
          </div>

        </div>

        <div className="my-8 border-t border-white/10" />

        <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} BuddyUp.
            All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              to="/privacy"
              className="transition hover:text-gray-300"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition hover:text-gray-300"
            >
              Terms
            </Link>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
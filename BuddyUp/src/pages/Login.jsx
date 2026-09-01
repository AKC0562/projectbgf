import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

import { useUser } from "../hooks/useUser";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, loading } = useUser();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await login(formData);

      // Jis page se login ke liye aaye the
      const redirectTo =
        location.state?.from?.pathname || "/";

      navigate(redirectTo, {
        replace: true,
      });

    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error?.message ||
        "Invalid email or password."
      );
    }
  };

  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">

        <div className="w-full rounded-3xl border border-purple-900/40 bg-[#130924] p-6 shadow-xl sm:p-8">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-800/40 bg-[#2a0e4f] text-purple-300">
              <LogIn size={26} />
            </div>

            <h1 className="text-3xl font-bold">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Login to continue to BuddyUp
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-[#350d14] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 "
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-purple-900/50 bg-[#1a0c30] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#a855f7]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-purple-900/50 bg-[#1a0c30] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#a855f7]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#570080] px-5 py-3 font-semibold transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              Create account
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

export default Login;
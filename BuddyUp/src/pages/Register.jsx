import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  BriefcaseBusiness,
  UserPlus,
} from "lucide-react";

import { useUser } from "../hooks/useUser";

function Register() {
  const navigate = useNavigate();

  const { register, loading } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });

      navigate("/complete-profile", {
        replace: true,
      });
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">

        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl sm:p-8">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#570080]/30 text-purple-300">
              <UserPlus size={26} />
            </div>

            <h1 className="text-3xl font-bold">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Join BuddyUp today
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Create account as
              </label>

              <div className="grid grid-cols-2 gap-3">

                {/* User */}
                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange("user")
                  }
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                    formData.role === "user"
                      ? "border-[#570080] bg-[#570080]/20 text-purple-300"
                      : "border-white/10 bg-black text-gray-400 hover:border-white/20"
                  }`}
                >
                  <User size={22} />

                  <span className="text-sm font-medium">
                    User
                  </span>

                  <span className="text-xs text-gray-500">
                    Book companions
                  </span>
                </button>

                {/* Companion */}
                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange("companion")
                  }
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                    formData.role === "companion"
                      ? "border-[#570080] bg-[#570080]/20 text-purple-300"
                      : "border-white/10 bg-black text-gray-400 hover:border-white/20"
                  }`}
                >
                  <BriefcaseBusiness size={22} />

                  <span className="text-sm font-medium">
                    Companion
                  </span>

                  <span className="text-xs text-gray-500">
                    Offer companionship
                  </span>
                </button>

              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#570080]"
              />
            </div>

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
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#570080]"
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
                placeholder="Minimum 8 characters"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#570080]"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#570080]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#570080] px-5 py-3 font-semibold transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

export default Register;
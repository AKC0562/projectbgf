import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Languages,
  IndianRupee,
  Save,
  BriefcaseBusiness,
} from "lucide-react";

import { useUser } from "../providers/useUser";

function CompleteProfile() {
  const navigate = useNavigate();

  const {
    role,
    profile,
    updateProfile,
    loading,
  } = useUser();

  const isCompanion = role === "companion";

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    age: profile?.age || "",
    location: profile?.location || "",
    languages: Array.isArray(profile?.languages)
      ? profile.languages.join(", ")
      : profile?.languages || "",

    // Companion fields
    activities: Array.isArray(profile?.activities)
      ? profile.activities.join(", ")
      : profile?.activities || "",

    hourlyRate: profile?.hourlyRate || "",
    isAvailable: profile?.isAvailable ?? true,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const baseData = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        age: Number(formData.age),
        location: formData.location.trim(),

        languages: formData.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      let profileData = baseData;

      if (isCompanion) {
        profileData = {
          ...baseData,

          activities: formData.activities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

          hourlyRate: Number(formData.hourlyRate),

          isAvailable: formData.isAvailable,
        };
      }

      await updateProfile(profileData);

      if (isCompanion) {
        navigate("/companion-bookings", {
          replace: true,
        });
      } else {
        navigate("/explore", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "Profile update failed:",
        error
      );

      setError(
        error?.message ||
          "Unable to update profile."
      );
    }
  };

  if (!role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Profile information unavailable
          </h1>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-xl bg-[#570080] px-5 py-3 font-semibold hover:bg-[#6d009f]"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-purple-400">
            {isCompanion
              ? "Companion Profile"
              : "User Profile"}
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Complete Your Profile
          </h1>

          <p className="mt-2 text-gray-400">
            Add your details to complete your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-purple-700/30 bg-zinc-950 p-6 shadow-lg sm:p-8"
        >

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* =========================
              BASIC INFORMATION
          ========================== */}

          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400">
                <User size={20} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Basic Information
                </h2>

                <p className="text-sm text-gray-500">
                  Tell us about yourself
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-purple-700/30 bg-black px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="mb-2 block text-sm font-medium"
                >
                  Age
                </label>

                <input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-purple-700/30 bg-black px-4 py-3 outline-none focus:border-purple-500"
                />
              </div>

            </div>
          </section>

          {/* =========================
              LOCATION
          ========================== */}

          <section className="mt-8 border-t border-purple-700/20 pt-8">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400">
                <MapPin size={20} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Location
                </h2>

                <p className="text-sm text-gray-500">
                  Where are you based?
                </p>
              </div>
            </div>

            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bhopal"
              required
              className="w-full rounded-xl border border-purple-700/30 bg-black px-4 py-3 outline-none placeholder:text-gray-600 focus:border-purple-500"
            />

          </section>

          {/* =========================
              BIO
          ========================== */}

          <section className="mt-8 border-t border-purple-700/20 pt-8">

            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-medium"
            >
              About You
            </label>

            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              maxLength={500}
              required={isCompanion}
              placeholder="Tell people a little about yourself..."
              className="w-full resize-none rounded-xl border border-purple-700/30 bg-black px-4 py-3 outline-none placeholder:text-gray-600 focus:border-purple-500"
            />

            <p className="mt-2 text-right text-xs text-gray-600">
              {formData.bio.length}/500
            </p>

          </section>

          {/* =========================
              LANGUAGES
          ========================== */}

          <section className="mt-8 border-t border-purple-700/20 pt-8">

            <div className="mb-3 flex items-center gap-2">
              <Languages
                size={18}
                className="text-purple-400"
              />

              <label
                htmlFor="languages"
                className="text-sm font-medium"
              >
                Languages
              </label>
            </div>

            <input
              id="languages"
              name="languages"
              type="text"
              value={formData.languages}
              onChange={handleChange}
              placeholder="Hindi, English"
              className="w-full rounded-xl border border-purple-700/30 bg-black px-4 py-3 outline-none placeholder:text-gray-600 focus:border-purple-500"
            />

            <p className="mt-2 text-xs text-gray-600">
              Separate multiple languages with commas.
            </p>

          </section>

          {/* =========================
              COMPANION ONLY
          ========================== */}

          {isCompanion && (
            <section className="mt-8 border-t border-purple-700/20 pt-8">

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Companion Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    Set up your companion profile.
                  </p>
                </div>
              </div>

              {/* Activities */}
              <div>
                <label
                  htmlFor="activities"
                  className="mb-2 block text-sm font-medium"
                >
                  Activities
                </label>

                <input
                  id="activities"
                  name="activities"
                  type="text"
                  value={formData.activities}
                  onChange={handleChange}
                  placeholder="Coffee, Movies, Study"
                  required
                  className="w-full rounded-xl border border-purple-700/30 bg-black px-4 py-3 outline-none placeholder:text-gray-600 focus:border-purple-500"
                />

                <p className="mt-2 text-xs text-gray-600">
                  Separate activities with commas.
                </p>
              </div>

              {/* Hourly Rate */}
              <div className="mt-5">
                <label
                  htmlFor="hourlyRate"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <IndianRupee size={15} />
                  Hourly Rate
                </label>

                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="500"
                  required
                  className="w-full rounded-xl border border-purple-700/30 bg-black px-4 py-3 outline-none placeholder:text-gray-600 focus:border-purple-500"
                />
              </div>

              {/* Availability */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-purple-700/20 bg-black p-4">

                <div>
                  <p className="text-sm font-medium">
                    Available for bookings
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    You can change this later.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isAvailable:
                        !prev.isAvailable,
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    formData.isAvailable
                      ? "bg-[#570080]"
                      : "bg-zinc-700"
                  }`}
                  aria-label="Toggle availability"
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      formData.isAvailable
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>

            </section>
          )}

          {/* =========================
              SAVE
          ========================== */}

          <div className="mt-8 border-t border-purple-700/20 pt-6">

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#570080] px-5 py-3 font-semibold transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />

              {loading
                ? "Saving Profile..."
                : "Save Profile"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

export default CompleteProfile;
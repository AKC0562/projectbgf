import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  Languages,
  MapPin,
  Star,
} from "lucide-react";

import companionService from "../services/companionService";

function CompanionProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompanion = async () => {
      if (!id) {
        setError("Invalid companion ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await companionService.getById(id);

        if (!data) {
          throw new Error(
            "Companion not found."
          );
        }

        setCompanion(data);
      } catch (error) {
        console.error(
          "Failed to load companion:",
          error
        );

        setError(
          error?.message ||
            "Unable to load companion profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCompanion();
  }, [id]);

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <p className="text-lg font-medium text-gray-400">
          Loading companion profile...
        </p>
      </main>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------

  if (error || !companion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="max-w-md text-center">

          <h1 className="text-2xl font-bold">
            Companion Not Found
          </h1>

          <p className="mt-2 text-gray-400">
            {error ||
              "This companion profile is unavailable."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="mt-6 rounded-xl bg-[#570080] px-6 py-3 font-semibold transition hover:bg-[#6d009f]"
          >
            Back to Explore
          </button>

        </div>
      </main>
    );
  }

  const activities = Array.isArray(
    companion.activities
  )
    ? companion.activities
    : [];

  const languages = Array.isArray(
    companion.languages
  )
    ? companion.languages
    : [];

  const rating = Number(
    companion.rating || 0
  ).toFixed(1);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </button>

        {/* Profile */}
        <section className="grid overflow-hidden rounded-3xl border border-purple-700/30 bg-zinc-950 lg:grid-cols-[420px_1fr]">

          {/* =========================
              IMAGE
          ========================== */}

          <div className="relative min-h-130 bg-zinc-900">

            <img
              src={
                companion.avatar ||
                "/placeholder-avatar.png"
              }
              alt={`${companion.name} profile`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Availability */}
            <span
              className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                companion.isAvailable
                  ? "bg-green-600 text-white"
                  : "bg-zinc-900 text-gray-400"
              }`}
            >
              {companion.isAvailable
                ? "Available"
                : "Currently Unavailable"}
            </span>

            {/* Mobile Name */}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/60 to-transparent p-6 pt-28 lg:hidden">

              <h1 className="text-3xl font-bold">
                {companion.name}
              </h1>

              {companion.isVerified && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-purple-300">
                  <BadgeCheck size={17} />
                  Verified Companion
                </span>
              )}

            </div>

          </div>

          {/* =========================
              DETAILS
          ========================== */}

          <div className="p-6 sm:p-8 lg:p-10">

            {/* Name */}
            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold sm:text-4xl">
                {companion.name}
              </h1>

              {companion.isVerified && (
                <span className="flex items-center gap-1.5 rounded-full border border-purple-700/30 bg-purple-950 px-3 py-1 text-sm text-purple-300">
                  <BadgeCheck size={17} />
                  Verified
                </span>
              )}

            </div>

            {/* Location + Age */}
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-400">

              {companion.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {companion.location}
                </span>
              )}

              {companion.age && (
                <span>
                  {companion.age} years old
                </span>
              )}

            </div>

            {/* Rating */}
            <div className="mt-6 flex flex-wrap items-center gap-4">

              <div className="flex items-center gap-1.5">

                <Star
                  size={18}
                  fill="currentColor"
                  className="text-yellow-400"
                />

                <span className="font-semibold">
                  {rating}
                </span>

              </div>

              <span className="text-sm text-gray-500">
                {companion.reviews || 0} reviews
              </span>

            </div>

            {/* Bio */}
            {companion.bio && (
              <section className="mt-8">

                <h2 className="text-lg font-semibold">
                  About
                </h2>

                <p className="mt-3 max-w-3xl leading-7 text-gray-400">
                  {companion.bio}
                </p>

              </section>
            )}

            {/* Activities */}
            {activities.length > 0 && (
              <section className="mt-8">

                <h2 className="text-lg font-semibold">
                  Activities
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">

                  {activities.map(
                    (activity) => (
                      <span
                        key={activity}
                        className="rounded-full border border-purple-700/30 bg-purple-950 px-4 py-2 text-sm text-purple-200"
                      >
                        {activity}
                      </span>
                    )
                  )}

                </div>

              </section>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <section className="mt-8">

                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Languages size={19} />
                  Languages
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">

                  {languages.map(
                    (language) => (
                      <span
                        key={language}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-gray-300"
                      >
                        {language}
                      </span>
                    )
                  )}

                </div>

              </section>
            )}

            {/* Bottom */}
            <div className="mt-10 flex flex-col gap-5 border-t border-purple-700/20 pt-6 sm:flex-row sm:items-center sm:justify-between">

              {/* Price */}
              <div>

                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Clock3 size={15} />
                  Starting from
                </p>

                <p className="mt-1 text-2xl font-bold">
                  ₹{companion.hourlyRate || 0}

                  <span className="ml-1 text-sm font-normal text-gray-500">
                    / hour
                  </span>
                </p>

              </div>

              {/* Book */}
              <button
                type="button"
                disabled={!companion.isAvailable}
                onClick={() =>
                  navigate(
                    `/booking/${companion.$id}`
                  )
                }
                className="rounded-xl bg-[#570080] px-8 py-3 font-semibold transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-gray-500"
              >
                {companion.isAvailable
                  ? "Book Now"
                  : "Currently Unavailable"}
              </button>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default CompanionProfile;
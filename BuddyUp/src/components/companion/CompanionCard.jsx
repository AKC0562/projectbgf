import {
  BadgeCheck,
  Clock3,
  Languages,
  MapPin,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function CompanionCard({ companion }) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/companion/${companion.$id}`);
  };

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

  return (
    <article className="overflow-hidden rounded-2xl border border-purple-700/30 bg-zinc-950 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-purple-900/30">

      {/* =========================
          IMAGE
      ========================== */}

      <div className="relative">

        <img
          src={
            companion.avatar ||
            "/placeholder-avatar.png"
          }
          alt={`${companion.name} profile`}
          className="h-72 w-full object-cover"
          loading="lazy"
        />

        {/* Verified */}
        {companion.isVerified && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-purple-300">
            <BadgeCheck size={15} />
            Verified
          </span>
        )}

        {/* Availability */}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-medium ${
            companion.isAvailable
              ? "bg-green-600 text-white"
              : "bg-zinc-900 text-gray-400"
          }`}
        >
          {companion.isAvailable
            ? "Available"
            : "Unavailable"}
        </span>

      </div>

      {/* =========================
          CONTENT
      ========================== */}

      <div className="p-5 text-white">

        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="truncate text-xl font-semibold">
              {companion.name}
            </h3>

            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin size={15} />
              <span className="truncate">
                {companion.location ||
                  "Location unavailable"}
              </span>
            </p>

          </div>

          <div className="flex shrink-0 items-center gap-1 text-sm">

            <Star
              size={15}
              fill="currentColor"
              className="text-yellow-400"
            />

            <span>
              {Number(companion.rating || 0).toFixed(
                1
              )}
            </span>

          </div>

        </div>

        {/* =========================
            BIO
        ========================== */}

        {companion.bio && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-400">
            {companion.bio}
          </p>
        )}

        {/* =========================
            ACTIVITIES
        ========================== */}

        {activities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">

            {activities
              .slice(0, 3)
              .map((activity) => (
                <span
                  key={activity}
                  className="rounded-full border border-purple-700/30 bg-purple-950 px-3 py-1 text-xs text-purple-200"
                >
                  {activity}
                </span>
              ))}

            {activities.length > 3 && (
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-gray-400">
                +{activities.length - 3}
              </span>
            )}

          </div>
        )}

        {/* =========================
            LANGUAGES
        ========================== */}

        {languages.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">

            <Languages
              size={15}
              className="shrink-0 text-purple-400"
            />

            <span className="truncate">
              {languages.slice(0, 2).join(", ")}
              {languages.length > 2 &&
                ` +${languages.length - 2}`}
            </span>

          </div>
        )}

        {/* =========================
            RATE + ACTION
        ========================== */}

        <div className="mt-5 flex items-center justify-between border-t border-purple-700/20 pt-5">

          <div>

            <p className="flex items-center gap-1 text-xs text-gray-500">
              <Clock3 size={13} />
              Starting from
            </p>

            <p className="mt-1 text-lg font-bold">
              ₹{companion.hourlyRate || 0}
              <span className="ml-1 text-sm font-normal text-gray-500">
                /hr
              </span>
            </p>

          </div>

          <button
            type="button"
            onClick={handleViewProfile}
            className="rounded-xl bg-[#570080] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d009f]"
          >
            View Profile
          </button>

        </div>

      </div>
    </article>
  );
}

export default CompanionCard;
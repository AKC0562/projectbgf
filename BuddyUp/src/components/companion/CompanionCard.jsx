import {
  MapPin,
  Star,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AvailabilityBadge from "./AvailabilityBadge";

function CompanionCard({ companion }) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(
      `/companion/${companion.$id}`
    );
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-purple-900/40 bg-[#130924] shadow-md transition hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-900/40">

      {/* Image */}
      <div className="relative">
        <img
          src={companion.avatar}
          alt={companion.name}
          className="h-72 w-full object-cover"
        />

        {companion.isVerified && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#130924] border border-purple-900/60 px-3 py-1 text-xs text-white">
            <BadgeCheck
              size={15}
              className="text-purple-400"
            />

            Verified
          </span>
        )}

        <div className="absolute right-3 top-3">
          <AvailabilityBadge
            available={companion.isAvailable}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 text-white">

        <div className="flex items-start justify-between gap-3">

          <div>
            <h3 className="text-xl font-semibold">
              {companion.name}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-sm text-gray-400">
              <MapPin size={15} />

              {companion.location}
            </p>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Star
              size={15}
              fill="currentColor"
              className="text-yellow-400"
            />

            {companion.rating}
          </div>

        </div>

        {/* Bio */}
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-400">
          {companion.bio}
        </p>

        {/* Reviews */}
        <p className="mt-2 text-xs text-gray-500">
          {companion.reviewCount || 0} reviews
        </p>

        {/* Activities */}
        <div className="mt-4 flex flex-wrap gap-2">
          {companion.activities
            ?.slice(0, 3)
            .map((activity) => (
              <span
                key={activity}
                className="rounded-full bg-[#570080]/30 px-3 py-1 text-xs text-purple-200"
              >
                {activity}
              </span>
            ))}
        </div>

        {/* Bottom */}
        <div className="mt-5 flex items-center justify-between">

          <div>
            <p className="text-xs text-gray-500">
              Starting from
            </p>

            <span className="text-lg font-bold">
              ₹{companion.hourlyRate}
            </span>

            <span className="text-sm text-gray-400">
              {" "}/hr
            </span>
          </div>

          <button
            type="button"
            onClick={handleViewProfile}
            className="rounded-xl bg-[#570080] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            View Profile
          </button>

        </div>

      </div>
    </article>
  );
}

export default CompanionCard;
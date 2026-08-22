import {
  BadgeCheck,
  Languages,
  MapPin,
  Star,
} from "lucide-react";

import CompanionActivities from "./CompanionActivities";
import CompanionLanguages from "./CompanionLanguages";

function CompanionInfo({
  companion,
  onBook,
}) {
  return (
    <div className="p-6 sm:p-8 lg:p-10">

      {/* Name */}
      <div className="flex flex-wrap items-center gap-3">

        <h1 className="text-3xl font-bold sm:text-4xl">
          {companion.name}
        </h1>

        {companion.isVerified && (
          <span className="flex items-center gap-1 rounded-full bg-[#570080]/30 px-3 py-1 text-sm text-purple-300">
            <BadgeCheck size={17} />
            Verified
          </span>
        )}

      </div>

      {/* Location + Age */}
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">

        <span className="flex items-center gap-1.5">
          <MapPin size={16} />
          {companion.location}
        </span>

        {companion.age && (
          <span>
            {companion.age} years old
          </span>
        )}

      </div>

      {/* Rating */}
      <div className="mt-6 flex items-center gap-3">

        <div className="flex items-center gap-1">
          <Star
            size={18}
            fill="currentColor"
            className="text-yellow-400"
          />

          <span className="font-semibold">
            {companion.rating}
          </span>
        </div>

        <span className="text-sm text-gray-400">
          {companion.reviewCount || 0} reviews
        </span>

      </div>

      {/* Bio */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          About
        </h2>

        <p className="mt-3 leading-7 text-gray-400">
          {companion.bio}
        </p>
      </div>

      {/* Activities */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          Activities
        </h2>

        <div className="mt-3">
          <CompanionActivities
            activities={companion.activities}
          />
        </div>
      </div>

      {/* Languages */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Languages size={19} />
          Languages
        </h2>

        <div className="mt-3">
          <CompanionLanguages
            languages={companion.languages}
          />
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm text-gray-400">
            Starting from
          </p>

          <p className="text-2xl font-bold">
            ₹{companion.hourlyRate}

            <span className="text-sm font-normal text-gray-400">
              {" "}/ hour
            </span>
          </p>
        </div>

        <button
          type="button"
          disabled={!companion.isAvailable}
          onClick={onBook}
          className="rounded-xl bg-[#570080] px-8 py-3 font-semibold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        >
          {companion.isAvailable
            ? "Book Now"
            : "Currently Unavailable"}
        </button>

      </div>

    </div>
  );
}

export default CompanionInfo;
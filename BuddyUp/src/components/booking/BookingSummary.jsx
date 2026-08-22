import { MapPin } from "lucide-react";

function BookingSummary({
  companion,
  duration,
  onContinue,
  disabled = false,
  loading = false,
}) {
  const total =
    Number(companion.hourlyRate) *
    Number(duration);

  return (
    <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6">

      {/* Companion */}
      <div className="flex items-center gap-4">

        <img
          src={companion.avatar}
          alt={companion.name}
          className="h-16 w-16 rounded-xl object-cover"
        />

        <div>
          <h2 className="font-semibold">
            {companion.name}
          </h2>

          <p className="mt-1 flex items-center gap-1 text-sm text-gray-400">
            <MapPin size={14} />
            {companion.location}
          </p>
        </div>

      </div>

      <div className="my-6 border-t border-white/10" />

      {/* Rate */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">
          Hourly rate
        </span>

        <span>
          ₹{companion.hourlyRate}
        </span>
      </div>

      {/* Duration */}
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-gray-400">
          Duration
        </span>

        <span>
          {duration} hour
          {duration > 1 ? "s" : ""}
        </span>
      </div>

      <div className="my-5 border-t border-white/10" />

      {/* Total */}
      <div className="flex justify-between">
        <span className="font-semibold">
          Total
        </span>

        <span className="text-2xl font-bold text-purple-400">
          ₹{total}
        </span>
      </div>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={onContinue}
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#570080] px-5 py-3 font-semibold transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:bg-gray-700 disabled:opacity-70"
      >
        {loading
          ? "Processing..."
          : companion.isAvailable
          ? "Continue"
          : "Currently Unavailable"}
      </button>

    </aside>
  );
}

export default BookingSummary;
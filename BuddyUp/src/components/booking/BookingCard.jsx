import {
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
} from "lucide-react";

import BookingStatusBadge from "./BookingStatusBadge";
import BookingActions from "./BookingActions";

function BookingCard({
  booking,
  showActions = false,
  onAccept,
  onReject,
  loading = false,
}) {
  return (
    <article className="rounded-3xl border border-purple-900/40 bg-[#130924] p-5 transition hover:border-purple-600/60 sm:p-6">

      {/* Top */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        {/* Information */}
        <div>
          <div className="flex flex-wrap items-center gap-3">

            <h3 className="text-xl font-semibold text-white">
              {booking.activity}
            </h3>

            <BookingStatusBadge
              status={booking.status}
            />

          </div>

          <div className="mt-4 grid gap-3 text-sm text-gray-400 sm:grid-cols-2">

            <div className="flex items-center gap-2">
              <CalendarDays
                size={16}
                className="text-purple-400"
              />

              {booking.date}
            </div>

            <div className="flex items-center gap-2">
              <Clock3
                size={16}
                className="text-purple-400"
              />

              {booking.startTime}
            </div>

            <div className="flex items-center gap-2">
              <Clock3
                size={16}
                className="text-purple-400"
              />

              {booking.duration} hour
              {booking.duration > 1
                ? "s"
                : ""}
            </div>

            <div className="flex items-center gap-2">
              <MapPin
                size={16}
                className="text-purple-400"
              />

              Location after confirmation
            </div>

          </div>
        </div>

        {/* Amount */}
        <div className="lg:text-right">

          <p className="text-xs text-gray-500">
            Booking Amount
          </p>

          <div className="mt-1 flex items-center lg:justify-end">

            <IndianRupee
              size={18}
              className="text-purple-400"
            />

            <span className="text-2xl font-bold text-purple-400">
              {booking.totalAmount}
            </span>

          </div>

          <p className="mt-1 text-xs text-gray-500">
            ₹{booking.hourlyRate}/hr
          </p>

        </div>

      </div>

      <div className="my-5 border-t border-white/10" />

      {/* Bottom */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="text-xs text-gray-500">
          Booking ID:{" "}
          <span className="text-gray-400">
            {booking.$id}
          </span>
        </div>

        {showActions && (
          <BookingActions
            booking={booking}
            onAccept={onAccept}
            onReject={onReject}
            loading={loading}
          />
        )}

      </div>

    </article>
  );
}

export default BookingCard;
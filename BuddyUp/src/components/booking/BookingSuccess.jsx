import {
  CheckCircle2,
  CalendarDays,
  Clock3,
  IndianRupee,
} from "lucide-react";

import Button from "../common/Button";

function BookingSuccess({
  companion,
  booking,
  onExplore,
}) {
  return (
    <main className="min-h-[70vh] px-5 py-10 text-white">
      <div className="mx-auto flex max-w-2xl items-center justify-center">

        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2
              size={34}
              className="text-green-400"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Booking Request Sent
          </h1>

          <p className="mt-3 text-gray-400">
            Your booking request has been
            successfully submitted.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 text-left">

            <div className="flex justify-between">
              <span className="text-gray-400">
                Companion
              </span>

              <span className="font-medium">
                {companion.name}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <CalendarDays size={15} />
                Date
              </span>

              <span>
                {booking.date}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <Clock3 size={15} />
                Time
              </span>

              <span>
                {booking.startTime}
              </span>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-gray-400">
                Activity
              </span>

              <span>
                {booking.activity}
              </span>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-gray-400">
                Duration
              </span>

              <span>
                {booking.duration} hour
                {booking.duration > 1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div className="my-5 border-t border-white/10" />

            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="flex items-center text-xl font-bold text-purple-400">
                <IndianRupee size={17} />
                {booking.totalAmount}
              </span>
            </div>

          </div>

          <Button
            onClick={onExplore}
            className="mt-8 w-full"
          >
            Explore More Companions
          </Button>

        </div>

      </div>
    </main>
  );
}

export default BookingSuccess;
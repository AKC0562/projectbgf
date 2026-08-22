import { useEffect, useState } from "react";
import authService from "../services/authService"
import bookingService from "../services/bookingService"

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const user =
          await authService.getCurrentUser();

        if (!user) {
          setError("Please login to view your bookings.");
          return;
        }

        const data =
          await bookingService.getByClientId(
            user.$id
          );

        setBookings(data);
      } catch (error) {
        console.error(
          "Failed to load bookings:",
          error
        );

        setError(
          "Unable to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-400">
            Loading your bookings...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-2xl font-bold">
            Something Went Wrong
          </h1>

          <p className="mt-2 text-red-400">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (bookings.length === 0) {
    return (
      <main className="min-h-screen px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-2xl font-bold">
            No Bookings Yet
          </h1>

          <p className="mt-2 text-gray-400">
            Your bookings will appear here.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-10">
          <p className="text-sm font-medium text-purple-400">
            Your Activity
          </p>

          <h1 className="mt-1 text-4xl font-bold">
            My Bookings
          </h1>

          <p className="mt-3 text-gray-400">
            Manage your companion bookings.
          </p>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.$id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-semibold">
                    {booking.activity}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    {booking.date} ·{" "}
                    {booking.startTime}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {booking.duration} hour
                    {booking.duration > 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xl font-bold text-purple-400">
                    ₹{booking.totalAmount}
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs capitalize text-yellow-400">
                    {booking.status}
                  </span>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </main>
  );
}

export default MyBookings;
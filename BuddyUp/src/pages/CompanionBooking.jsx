import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  RefreshCw,
  Users,
  X,
  IndianRupee,
  CircleCheck,
  CircleX,
  Hourglass,
} from "lucide-react";

import authService from "../services/authService";
import bookingService from "../services/bookingService";
import companionService from "../services/companionService";

import { Booking_status } from "../constants/bookings";

function CompanionBookings() {
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [updatingBookingId, setUpdatingBookingId] =
    useState(null);

  const loadBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Get logged-in user
      const user = await authService.getCurrentUser();

      if (!user) {
        setError("Please login to continue.");
        return;
      }

      // Auth user $id -> Companion profile
      const companion =
        await companionService.getByUserId(user.$id);

      if (!companion) {
        setError("Companion profile not found.");
        return;
      }

      // Companion profile $id -> bookings
      const data =
        await bookingService.getByCompanionId(
          companion.$id
        );

      setBookings(data || []);
    } catch (error) {
      console.error(
        "Failed to load companion bookings:",
        error
      );

      setError(
        "Unable to load bookings. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusUpdate = async (
    bookingId,
    status
  ) => {
    try {
      setUpdatingBookingId(bookingId);
      setError(null);

      const updatedBooking =
        await bookingService.updateStatus(
          bookingId,
          status
        );

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.$id === updatedBooking.$id
            ? updatedBooking
            : booking
        )
      );
    } catch (error) {
      console.error(
        "Failed to update booking status:",
        error
      );

      setError(
        "Unable to update booking status."
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: bookings.length,

      pending: bookings.filter(
        (booking) =>
          booking.status === Booking_status.PENDING
      ).length,

      confirmed: bookings.filter(
        (booking) =>
          booking.status === Booking_status.CONFIRMED
      ).length,

      completed: bookings.filter(
        (booking) =>
          booking.status === Booking_status.COMPLETED
      ).length,
    };
  }, [bookings]);

  const getStatusStyles = (status) => {
    switch (status) {
      case Booking_status.CONFIRMED:
        return {
          container:
            "bg-[#063321] border-emerald-500/50",
          text: "text-emerald-300",
          icon: Check,
        };

      case Booking_status.COMPLETED:
        return {
          container:
            "bg-[#08223d] border-blue-500/50",
          text: "text-blue-300",
          icon: CircleCheck,
        };

      case Booking_status.REJECTED:
        return {
          container:
            "bg-[#350d14] border-red-500/50",
          text: "text-red-300",
          icon: CircleX,
        };

      case Booking_status.CANCELLED:
        return {
          container:
            "bg-[#1e1e24] border-gray-600/50",
          text: "text-gray-300",
          icon: X,
        };

      default:
        return {
          container:
            "bg-[#2d2208] border-yellow-600/50",
          text: "text-yellow-300",
          icon: Hourglass,
        };
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .charAt(0)
      .toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent px-5 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse">
            <div className="h-4 w-40 rounded bg-[#1e0e38]" />

            <div className="mt-4 h-10 w-72 rounded bg-[#1e0e38]" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-[#1e0e38]" />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl border border-purple-900/40 bg-[#130924]"
                />
              ))}
            </div>

            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 rounded-3xl border border-purple-900/40 bg-[#130924]"
                />
              ))}
            </div>
          </div>

        </div>
      </main>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <main className="min-h-screen bg-transparent px-5 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">

          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <CircleX
                size={28}
                className="text-red-400"
              />
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Something Went Wrong
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadBookings()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#570080] px-5 py-3 font-semibold transition hover:bg-[#6d009f]"
            >
              <RefreshCw size={17} />
              Try Again
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-5 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium text-purple-400">
              Companion Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Booking Requests
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Manage your booking requests, upcoming
              sessions, and completed bookings.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadBookings(true)}
            className="flex w-fit items-center gap-2 rounded-xl border border-purple-800/40 bg-[#1e0e38] px-4 py-2.5 text-sm font-medium transition hover:bg-[#2a144e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/40 bg-[#350d14] px-4 py-3">

            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError(null)}
              className="text-gray-400 transition hover:text-white"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl border border-purple-900/40 bg-[#130924] p-5 shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-400">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-800/40 bg-[#220c3d]">
                <Users
                  size={21}
                  className="text-purple-400"
                />
              </div>

            </div>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-purple-900/40 bg-[#130924] p-5 shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-400">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {stats.pending}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-800/40 bg-[#332208]">
                <Hourglass
                  size={21}
                  className="text-yellow-400"
                />
              </div>

            </div>
          </div>

          {/* Confirmed */}
          <div className="rounded-2xl border border-purple-900/40 bg-[#130924] p-5 shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-400">
                  Confirmed
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {stats.confirmed}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-800/40 bg-[#063321]">
                <CircleCheck
                  size={21}
                  className="text-green-400"
                />
              </div>

            </div>
          </div>

          {/* Completed */}
          <div className="rounded-2xl border border-purple-900/40 bg-[#130924] p-5 shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-400">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {stats.completed}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-800/40 bg-[#08223d]">
                <Check
                  size={21}
                  className="text-blue-400"
                />
              </div>

            </div>
          </div>

        </section>

        {/* Empty */}
        {bookings.length === 0 ? (
          <section className="mt-8 flex min-h-100 items-center justify-center rounded-3xl border border-purple-900/40 bg-[#130924]">

            <div className="max-w-md px-6 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-purple-800/40 bg-[#220c3d]">
                <CalendarDays
                  size={30}
                  className="text-purple-400"
                />
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                No Booking Requests
              </h2>

              <p className="mt-2 text-gray-400">
                When users book you, their requests
                will appear here.
              </p>

            </div>

          </section>
        ) : (
          /* Booking List */
          <section className="mt-8">

            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Your Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review and manage your booking requests.
              </p>
            </div>

            <div className="space-y-4">

              {bookings.map((booking) => {
                const statusStyles =
                  getStatusStyles(
                    booking.status
                  );

                const StatusIcon =
                  statusStyles.icon;

                const isPending =
                  booking.status ===
                  Booking_status.PENDING;

                const isUpdating =
                  updatingBookingId ===
                  booking.$id;

                return (
                  <article
                    key={booking.$id}
                    className="rounded-3xl border border-purple-900/40 bg-[#130924] p-5 shadow-md transition hover:border-purple-600/60 sm:p-6"
                  >

                    {/* Top */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      {/* Booking information */}
                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-xl font-semibold">
                            {booking.activity}
                          </h3>

                          <span
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyles.container} ${statusStyles.text}`}
                          >
                            <StatusIcon size={14} />

                            {formatStatus(
                              booking.status
                            )}
                          </span>

                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-gray-400 sm:grid-cols-2">

                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={16}
                              className="text-purple-400"
                            />

                            <span>
                              {booking.date}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock3
                              size={16}
                              className="text-purple-400"
                            />

                            <span>
                              {booking.startTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock3
                              size={16}
                              className="text-purple-400"
                            />

                            <span>
                              {booking.duration} hour
                              {booking.duration > 1
                                ? "s"
                                : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin
                              size={16}
                              className="text-purple-400"
                            />

                            <span>
                              Location will be shared
                              after confirmation
                            </span>
                          </div>

                        </div>

                      </div>

                      {/* Amount */}
                      <div className="shrink-0 lg:text-right">

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
                          {booking.hourlyRate}/hr
                        </p>

                      </div>

                    </div>

                    {/* Divider */}
                    <div className="my-5 border-t border-white/10" />

                    {/* Bottom */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MessageCircle
                          size={16}
                          className="text-purple-400"
                        />

                        <span>
                          Client ID:{" "}
                          <span className="text-gray-300">
                            {booking.clientId}
                          </span>
                        </span>
                      </div>

                      {/* Actions */}
                      {isPending && (
                        <div className="flex gap-3">

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusUpdate(
                                booking.$id,
                                Booking_status.REJECTED
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={17} />

                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusUpdate(
                                booking.$id,
                                Booking_status.CONFIRMED
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#570080] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={17} />

                            {isUpdating
                              ? "Updating..."
                              : "Accept"}
                          </button>

                        </div>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default CompanionBookings;
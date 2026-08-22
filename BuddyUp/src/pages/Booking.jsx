import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Booking_duration_options } from "../constants/bookings";
import { validateBooking } from "../validation/bookingValidation";

import companionService from "../services/companionService";
import authService from "../services/authService"
import bookingService from "../services/bookingService"

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate()

  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const[createdBooking, setCreatedBooking] = useState(null)
  const [bookingSuccess, setBooingSuccess] = useState(false)

  useEffect(() => {
    const loadCompanion = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await companionService.getById(id);

        if (!data) {
          setError("Companion not found");
          return;
        }

        setCompanion(data);
      } catch (error) {
        console.error(
          "Failed to load companion:",
          error
        );

        setError("Unable to load companion");
      } finally {
        setLoading(false);
      }
    };

    loadCompanion();
  }, [id]);

    const total =
    companion.hourlyRate * duration;

  const handleContinue = async () => {
    const errors = validateBooking({
      activity,
      date,
      time,
      duration,
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    if (!companion.isAvailable) {
      setError("Tis companion is currently not avaliable")
      return;
    }
   try {
    setValidationErrors({})
    setError(null)

    const currentUser = await authService.getCurrentUser()
    if (!currentUser) {
      setError("Please login before booking")
      return;
    }
    const bookingData = {
      clientId: currentUser.$id,
      companionId: companion.$id,
      activity,
      date,
      startTime:time,
      duration,
      hourlyRate: companion.hourlyRate,
      totalAmount: companion.hourlyRate*duration,
      status: "pending",
      paymentStatus: "pending"
    }
    const booking = await bookingService.create(bookingData);

    setCreatedBooking(booking)
    setBooingSuccess(true)
    
   } catch (error) {
    console.error("Failed to create booking",error)
   }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-2xl font-semibold">
          Loading booking...
        </h1>
      </main>
    );
  }

  if (error || !companion) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-400">
          {error || "Companion not found"}
        </h1>
      </main>
    );
  }

  if (bookingSuccess && createdBooking) {
  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">

        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Booking Request Sent
          </h1>

          <p className="mt-3 text-gray-400">
            Your booking request has been successfully
            submitted.
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

            <div className="mt-3 flex justify-between">
              <span className="text-gray-400">
                Activity
              </span>

              <span>
                {createdBooking.activity}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-400">
                Date
              </span>

              <span>
                {createdBooking.date}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-400">
                Time
              </span>

              <span>
                {createdBooking.startTime}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-400">
                Duration
              </span>

              <span>
                {createdBooking.duration} hour
                {createdBooking.duration > 1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div className="my-5 border-t border-white/10" />

            <div className="flex justify-between">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-xl font-bold text-purple-400">
                ₹{createdBooking.totalAmount}
              </span>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-gray-400">
                Status
              </span>

              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400">
                {createdBooking.status}
              </span>
            </div>

          </div>

          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="mt-8 rounded-xl bg-[#570080] px-6 py-3 font-semibold transition hover:bg-[#6d009f]"
          >
            Explore More Companions
          </button>

        </div>

      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-4xl font-bold">
          Book Your Companion
        </h1>

        <p className="mt-2 text-gray-400">
          Choose your activity and preferred schedule.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_350px]">

          {/* Booking Form */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

            {/* Activity */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Activity
              </label>

              <select
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value);

                  if (validationErrors.activity) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      activity: "",
                    }));
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#570080]"
              >
                <option value="">
                  Select activity
                </option>

                {companion.activities?.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {validationErrors.activity && (
                <p className="mt-2 text-sm text-red-400">
                  {validationErrors.activity}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);

                  if (validationErrors.date) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      date: "",
                    }));
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#570080]"
              />

              {validationErrors.date && (
                <p className="mt-2 text-sm text-red-400">
                  {validationErrors.date}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Time
              </label>

              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);

                  if (validationErrors.time) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      time: "",
                    }));
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#570080]"
              />

              {validationErrors.time && (
                <p className="mt-2 text-sm text-red-400">
                  {validationErrors.time}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Duration
              </label>

              <select
                value={duration}
                onChange={(e) => {
                  setDuration(
                    Number(e.target.value)
                  );

                  if (validationErrors.duration) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      duration: "",
                    }));
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#570080]"
              >
                {Booking_duration_options.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.lable}
                    </option>
                  )
                )}
              </select>

              {validationErrors.duration && (
                <p className="mt-2 text-sm text-red-400">
                  {validationErrors.duration}
                </p>
              )}
            </div>

          </div>

          {/* Summary */}
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6">

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

                <p className="text-sm text-gray-400">
                  {companion.location}
                </p>
              </div>

            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Hourly rate
              </span>

              <span>
                ₹{companion.hourlyRate}
              </span>
            </div>

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
              disabled={!companion.isAvailable}
              onClick={handleContinue}
              className="mt-6 w-full rounded bg-[#570080] px-5 py-3 font-semibold transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              {companion.isAvailable
                ? "Continue"
                : "Currently Unavailable"}
            </button>

          </aside>

        </div>
      </div>
    </main>
  );
}

export default Booking;
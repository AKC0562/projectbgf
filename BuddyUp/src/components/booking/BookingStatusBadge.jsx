import {
  Check,
  CircleCheck,
  CircleX,
  Hourglass,
  X,
} from "lucide-react";

import { Booking_status } from "../../constants/bookings";

function BookingStatusBadge({
  status,
}) {
  const config = {
    [Booking_status.PENDING]: {
      icon: Hourglass,
      className:
        "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    },

    [Booking_status.CONFIRMED]: {
      icon: Check,
      className:
        "bg-green-500/10 border-green-500/20 text-green-400",
    },

    [Booking_status.COMPLETED]: {
      icon: CircleCheck,
      className:
        "bg-blue-500/10 border-blue-500/20 text-blue-400",
    },

    [Booking_status.REJECTED]: {
      icon: CircleX,
      className:
        "bg-red-500/10 border-red-500/20 text-red-400",
    },

    [Booking_status.CANCELLED]: {
      icon: X,
      className:
        "bg-gray-500/10 border-gray-500/20 text-gray-400",
    },
  };

  const current =
    config[status] || config[Booking_status.PENDING];

  const Icon = current.icon;

  const label = status
    ? status.charAt(0).toUpperCase() +
      status.slice(1)
    : "Unknown";

  return (
    <span
      className={`flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${current.className}`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
}

export default BookingStatusBadge;
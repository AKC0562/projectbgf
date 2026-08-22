import { Check, X } from "lucide-react";

import Button from "../common/Button";

import { BOOKING_STATUS } from "../../constants/bookings";

function BookingActions({
  booking,
  onAccept,
  onReject,
  loading = false,
}) {
  if (
    booking.status !==
    BOOKING_STATUS.PENDING
  ) {
    return null;
  }

  return (
    <div className="flex gap-3">

      <Button
        variant="danger"
        loading={loading}
        onClick={() =>
          onReject(booking.$id)
        }
      >
        <X size={17} />
        Reject
      </Button>

      <Button
        variant="success"
        loading={loading}
        onClick={() =>
          onAccept(booking.$id)
        }
      >
        <Check size={17} />
        Accept
      </Button>

    </div>
  );
}

export default BookingActions;
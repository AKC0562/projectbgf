import BookingCard from "./BookingCard";

function BookingList({
  bookings = [],
  showActions = false,
  onAccept,
  onReject,
  updatingBookingId = null,
}) {
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.$id}
          booking={booking}
          showActions={showActions}
          onAccept={onAccept}
          onReject={onReject}
          loading={
            updatingBookingId ===
            booking.$id
          }
        />
      ))}
    </div>
  );
}

export default BookingList;
function AvailabilityBadge({
  available,
}) {
  return (
    <span
      className={`
        flex
        items-center
        gap-1.5
        rounded-full
        px-3
        py-1
        text-xs
        backdrop-blur-sm
        ${
          available
            ? "bg-green-500/90 text-white"
            : "bg-black/70 text-gray-300"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            available
              ? "bg-white"
              : "bg-gray-400"
          }
        `}
      />

      {available
        ? "Available"
        : "Unavailable"}
    </span>
  );
}

export default AvailabilityBadge;
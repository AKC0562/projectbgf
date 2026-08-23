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
        border
        ${
          available
            ? "border-emerald-500/50 bg-[#063321] text-emerald-300"
            : "border-gray-700 bg-[#180d2c] text-gray-300"
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
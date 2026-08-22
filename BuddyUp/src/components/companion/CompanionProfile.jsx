import CompanionInfo from "./CompanionInfo";

function CompanionProfileCard({
  companion,
  onBook,
}) {
  return (
    <section className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/5 lg:grid-cols-[420px_1fr]">

      {/* Image */}
      <div className="relative min-h-150">

        <img
          src={companion.avatar}
          alt={companion.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Mobile Name */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/50 to-transparent p-6 pt-24 lg:hidden">
          <h1 className="text-3xl font-bold">
            {companion.name}
          </h1>
        </div>

      </div>

      {/* Details */}
      <CompanionInfo
        companion={companion}
        onBook={onBook}
      />

    </section>
  );
}

export default CompanionProfileCard;
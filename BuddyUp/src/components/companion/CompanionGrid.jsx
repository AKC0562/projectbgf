import CompanionCard from "./CompanionCard";

function CompanionGrid({
  companions = [],
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {companions.map((companion) => (
        <CompanionCard
          key={companion.$id}
          companion={companion}
        />
      ))}
    </div>
  );
}

export default CompanionGrid;
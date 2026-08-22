function CompanionActivities({
  activities = [],
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {activities.map((activity) => (
        <span
          key={activity}
          className="rounded-full border border-[#570080]/50 bg-[#570080]/20 px-4 py-2 text-sm text-purple-200"
        >
          {activity}
        </span>
      ))}
    </div>
  );
}

export default CompanionActivities;
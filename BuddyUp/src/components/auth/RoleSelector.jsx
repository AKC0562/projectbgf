import {
  BriefcaseBusiness,
  UserRound,
} from "lucide-react";

function RoleSelector({
  value,
  onChange,
  error,
}) {
  const roles = [
    {
      value: "client",
      label: "Client",
      description:
        "Book companions for activities.",
      icon: UserRound,
    },
    {
      value: "companion",
      label: "Companion",
      description:
        "Offer your time and companionship.",
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-white">
        I want to
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;

          const selected =
            value === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() =>
                onChange(role.value)
              }
              className={`
                rounded-2xl
                border
                p-4
                text-left
                transition
                ${
                  selected
                    ? "border-purple-500 bg-[#2b1050]"
                    : "border-purple-900/40 bg-[#130924] hover:border-purple-600/60"
                }
              `}
            >
              <Icon
                size={22}
                className={
                  selected
                    ? "text-purple-400"
                    : "text-gray-400"
                }
              />

              <p className="mt-3 font-semibold text-white">
                {role.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default RoleSelector;
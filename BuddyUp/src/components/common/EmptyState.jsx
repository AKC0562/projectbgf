import { Inbox } from "lucide-react";

function EmptyState({
  title = "Nothing Found",
  message = "There is nothing to show here.",
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex min-h-87.5 items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6">

      <div className="max-w-md text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
          <Icon
            size={30}
            className="text-purple-400"
          />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-white">
          {title}
        </h2>

        <p className="mt-2 text-gray-400">
          {message}
        </p>

      </div>
    </div>
  );
}

export default EmptyState;
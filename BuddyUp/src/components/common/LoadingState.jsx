import { Loader2 } from "lucide-react";

function LoadingState({
  message = "Loading...",
}) {
  return (
    <main className="flex min-h-[50vh] items-center justify-center px-5 py-10 text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          size={32}
          className="animate-spin text-purple-400"
        />

        <p className="text-gray-400">
          {message}
        </p>
      </div>
    </main>
  );
}

export default LoadingState;
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <main className="flex min-h-[50vh] items-center justify-center px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle
            size={28}
            className="text-red-400"
          />
        </div>

        <h2 className="mt-5 text-2xl font-bold">
          Something Went Wrong
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          {message}
        </p>

        {onRetry && (
          <Button
            onClick={onRetry}
            className="mt-6 w-full"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        )}

      </div>
    </main>
  );
}

export default ErrorState;
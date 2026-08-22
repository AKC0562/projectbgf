import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";

function Alert({
  type = "error",
  message,
  onClose,
}) {
  const config = {
    error: {
      icon: XCircle,
      className:
        "border-red-500/20 bg-red-500/5 text-red-400",
    },

    success: {
      icon: CheckCircle2,
      className:
        "border-green-500/20 bg-green-500/5 text-green-400",
    },

    warning: {
      icon: AlertCircle,
      className:
        "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
    },

    info: {
      icon: Info,
      className:
        "border-blue-500/20 bg-blue-500/5 text-blue-400",
    },
  };

  const {
    icon: Icon,
    className,
  } = config[type] || config.error;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} />

        <p className="text-sm">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="opacity-70 transition hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
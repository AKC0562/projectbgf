import { Loader2 } from "lucide-react";

function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  className = "",
}) {
  const variants = {
    primary:
      "bg-[#570080] text-white hover:bg-[#6d009f]",

    secondary:
      "border border-purple-800/40 bg-[#1e0e38] text-white hover:bg-[#2a144e]",

    success:
      "bg-green-600 text-white hover:bg-green-700",

    danger:
      "bg-red-700 text-white hover:bg-red-800",

    ghost:
      "bg-transparent text-gray-400 hover:bg-[#1e0e38] hover:text-white",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        py-2.5
        text-sm
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
    >
      {loading && (
        <Loader2
          size={16}
          className="animate-spin"
        />
      )}

      {children}
    </button>
  );
}

export default Button;
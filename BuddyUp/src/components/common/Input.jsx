function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-white"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-400">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          rounded-xl
          border
          bg-black
          px-4
          py-3
          text-white
          outline-none
          transition
          placeholder:text-gray-600
          ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-white/10 focus:border-[#570080]"
          }
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${className}
        `}
      />

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  disabled = false,
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

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
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
          ${
            error
              ? "border-red-500"
              : "border-white/10 focus:border-[#570080]"
          }
          disabled:cursor-not-allowed
          disabled:opacity-50
        `}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => {
          const optionValue =
            typeof option === "object"
              ? option.value
              : option;

          const optionLabel =
            typeof option === "object"
              ? option.label
              : option;

          return (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          );
        })}
      </select>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;
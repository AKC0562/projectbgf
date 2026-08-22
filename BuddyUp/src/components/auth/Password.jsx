import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function PasswordInput({
  label = "Password",
  name = "password",
  value,
  onChange,
  error,
  placeholder = "Enter your password",
  required = false,
}) {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <div className="w-full">

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

      <div className="relative">
        <input
          id={name}
          name={name}
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full
            rounded-xl
            border
            bg-black
            px-4
            py-3
            pr-12
            text-white
            outline-none
            placeholder:text-gray-600
            ${
              error
                ? "border-red-500"
                : "border-white/10 focus:border-[#570080]"
            }
          `}
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword((prev) => !prev)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
        >
          {showPassword ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}

export default PasswordInput;
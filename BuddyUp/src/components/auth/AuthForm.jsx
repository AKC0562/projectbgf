function AuthForm({
  title,
  subtitle,
  children,
  onSubmit,
  footer,
  loading = false,
}) {
  return (
    <div className="w-full max-w-md">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
      >
        <div className="space-y-5">
          {children}
        </div>
      </form>

      {footer && (
        <div className="mt-5 text-center text-sm text-gray-400">
          {footer}
        </div>
      )}

    </div>
  );
}

export default AuthForm;
function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

      <div>
        {eyebrow && (
          <p className="text-sm font-medium text-purple-400">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-2xl text-gray-400">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
}

export default PageHeader;
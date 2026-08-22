function PageContainer({
  children,
  className = "",
}) {
  return (
    <main
      className={`
        min-h-screen
        bg-black
        px-5
        py-10
        text-white
        sm:px-6
        lg:px-8
        ${className}
      `}
    >
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  );
}

export default PageContainer;
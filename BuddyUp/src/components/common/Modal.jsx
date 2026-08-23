import { X } from "lucide-react";

function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}) {
  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-5 py-10">

      <div
        className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-900/60 bg-[#130924] p-6 shadow-2xl`}
      >

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[#220f3e] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Modal;
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";

import storageService from "../../services/storageService";

function ImageUpload({
  value = null,
  onChange,
  disabled = false,
  label = "Profile Photo",
}) {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    // Existing Appwrite file
    if (typeof value === "string") {
      const previewUrl =
        storageService.getFilePreview(value);

      setPreview(previewUrl?.toString() || null);
    }
  }, [value]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );

      event.target.value = "";
      return;
    }

    const localPreview =
      URL.createObjectURL(file);

    setPreview(localPreview);

    try {
      setUploading(true);

      const uploadedFile =
        await storageService.uploadProfileImage(
          file
        );

      onChange(uploadedFile.$id);

    } catch (error) {
      console.error(
        "Image upload failed:",
        error
      );

      setPreview(null);

      setError(
        error?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (disabled || uploading) return;

    setError("");

    const fileId = value;

    try {
      setPreview(null);
      onChange(null);

      /*
       * Delete from Appwrite Storage.
       */
      if (fileId) {
        await storageService.deleteFile(
          fileId
        );
      }
    } catch (error) {
      console.error(
        "Image deletion failed:",
        error
      );

      setError(
        error?.message ||
          "Unable to delete image."
      );
    }
  };

  return (
    <div>
      <label className="mb-3 block text-sm font-medium">
        {label}
      </label>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

        {/* Preview */}
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-purple-700/30 bg-zinc-900">

          {preview ? (
            <img
              src={preview}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-gray-600">
              <ImageIcon size={28} />
              <span className="mt-1 text-xs">
                No image
              </span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
            </div>
          )}

        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            disabled={
              disabled || uploading
            }
            onClick={() =>
              inputRef.current?.click()
            }
            className="flex items-center gap-2 rounded-xl bg-[#570080] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preview ? (
              <Camera size={17} />
            ) : (
              <Upload size={17} />
            )}

            {uploading
              ? "Uploading..."
              : preview
                ? "Change Photo"
                : "Upload Photo"}
          </button>

          {preview && (
            <button
              type="button"
              disabled={
                disabled || uploading
              }
              onClick={handleRemove}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />
              Remove
            </button>
          )}

        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={
            disabled || uploading
          }
        />

      </div>

      <p className="mt-2 text-xs text-gray-600">
        JPG, PNG or WebP. Maximum 5 MB.
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default ImageUpload;
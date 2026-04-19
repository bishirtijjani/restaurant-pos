/**
 * ImageUploader — reusable Cloudinary-backed image upload component.
 *
 * Props:
 *  - value        {string}   Current image URL (existing or newly uploaded)
 *  - onChange     {fn}       Called with the new Cloudinary URL string
 *  - label        {string}   Optional label text
 *  - disabled     {boolean}  Locks the input
 *  - previewClass {string}   Optional class for the preview <img>
 */
import React, { useRef, useState } from "react";
import axios from "../../utils/offline/offlineAxios";
import { Upload, X, Loader2 } from "lucide-react";

const ImageUploader = ({
  value,
  onChange,
  label,
  disabled = false,
  previewClass = "h-40 object-contain rounded-xl",
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image (JPEG, PNG or WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        onChange(res.data.data.url);
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <span className="label-text font-semibold">{label}</span>
      )}

      {value ? (
        /* ── Preview state ── */
        <div className="flex flex-col items-center border border-base-300 rounded-xl p-4 bg-base-200/40 gap-3">
          <img src={value} alt="Uploaded" className={previewClass} />
          {!disabled && (
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Replace
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline btn-error"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Empty / upload state ── */
        <button
          type="button"
          className={`border-2 border-dashed border-base-300 rounded-xl p-6 flex flex-col items-center gap-3 w-full transition hover:border-primary ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-base-content/40" />
              <span className="text-sm">Click to upload image</span>
              <span className="text-xs text-base-content/50">
                JPEG, PNG or WEBP · max 5 MB
              </span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-error text-xs mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUploader;

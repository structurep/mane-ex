"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/supabase/storage";

interface ImageUploadProps {
  bucket: string;
  pathPrefix: string;
  onUpload: (result: { url: string; storagePath: string }) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ImageUpload({
  bucket,
  pathPrefix,
  onUpload,
  onError,
  accept = "image/jpeg,image/png,image/webp",
  className = "",
  children,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${pathPrefix}/${Date.now()}.${ext}`;

      const result = await uploadImage(bucket, path, file);
      setUploading(false);

      if (!result.ok) {
        onError?.(result.error);
        return;
      }

      onUpload({ url: result.url, storagePath: result.storagePath });
    },
    [bucket, pathPrefix, onUpload, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-crease-light hover:border-primary/50"
      } ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        disabled={uploading}
      />
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-ink-light" />
      ) : (
        children ?? (
          <div className="flex flex-col items-center gap-1 p-4 text-center">
            <Upload className="h-6 w-6 text-ink-light" />
            <span className="text-sm text-ink-mid">
              Drop an image or click to upload
            </span>
            <span className="text-xs text-ink-light">
              JPEG, PNG, or WebP
            </span>
          </div>
        )
      )}
    </label>
  );
}

interface ImagePreviewProps {
  url: string;
  onRemove?: () => void;
  className?: string;
  alt?: string;
}

export function ImagePreview({
  url,
  onRemove,
  className = "",
  alt = "Uploaded image",
}: ImagePreviewProps) {
  return (
    <div className={`group relative overflow-hidden rounded-lg ${className}`}>
      <Image src={url} alt={alt} fill className="object-cover" unoptimized />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 rounded-full bg-ink-black/60 p-1 text-paper-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

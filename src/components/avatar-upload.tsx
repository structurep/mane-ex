"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, User } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  currentCoverUrl: string | null;
  userId: string;
  onAvatarChange: (url: string, storagePath: string) => void;
  onCoverChange: (url: string, storagePath: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  currentCoverUrl,
  userId,
  onAvatarChange,
  onCoverChange,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [coverUrl, setCoverUrl] = useState(currentCoverUrl);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative mb-8">
      {/* Cover Photo */}
      <ImageUpload
        bucket="avatars"
        pathPrefix={`${userId}/covers`}
        onUpload={({ url, storagePath }) => {
          setCoverUrl(url);
          onCoverChange(url, storagePath);
          setError(null);
        }}
        onError={setError}
        className="h-40 w-full overflow-hidden rounded-xl border-0 sm:h-48"
      >
        {coverUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={coverUrl}
              alt="Cover photo"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink-black/0 transition-colors hover:bg-ink-black/30">
              <Camera className="h-6 w-6 text-paper-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-paper-warm">
            <Camera className="mb-1 h-5 w-5 text-ink-light" />
            <span className="text-xs text-ink-light">Add cover photo</span>
          </div>
        )}
      </ImageUpload>

      {/* Avatar (overlapping cover) */}
      <div className="absolute -bottom-10 left-6">
        <ImageUpload
          bucket="avatars"
          pathPrefix={`${userId}/avatar`}
          onUpload={({ url, storagePath }) => {
            setAvatarUrl(url);
            onAvatarChange(url, storagePath);
            setError(null);
          }}
          onError={setError}
          className="!h-24 !w-24 !rounded-full !border-4 !border-paper-white shadow-folded"
        >
          {avatarUrl ? (
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink-black/0 transition-colors hover:bg-ink-black/30">
                <Camera className="h-4 w-4 text-paper-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-paper-warm">
              <User className="h-8 w-8 text-ink-light" />
            </div>
          )}
        </ImageUpload>
      </div>

      {/* Error display */}
      {error && (
        <p className="mt-12 text-xs text-red">{error}</p>
      )}

      {/* Spacer for avatar overhang */}
      {!error && <div className="h-12" />}
    </div>
  );
}

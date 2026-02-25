"use client";

import { useState } from "react";
import { AvatarUpload } from "@/components/avatar-upload";
import { updateAvatarUrl, updateCoverUrl } from "@/actions/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { OnboardingData } from "../onboarding-flow";

export function ProfileSetupStep({
  userId,
  data,
  saving,
  onNext,
  onBack,
}: {
  userId: string;
  data: OnboardingData;
  saving: boolean;
  onNext: (updates: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [displayName, setDisplayName] = useState(data.display_name);
  const [bio, setBio] = useState(data.bio);
  const [avatarUrl, setAvatarUrl] = useState(data.avatar_url);
  const [coverUrl, setCoverUrl] = useState(data.cover_url);

  function handleSubmit() {
    if (!displayName.trim()) return;
    onNext({
      display_name: displayName.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
      cover_url: coverUrl,
    });
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink-black">
        Set up your profile
      </h1>
      <p className="mt-1 text-sm text-ink-mid">
        Add a photo and introduce yourself to the community.
      </p>

      <div className="mt-6 space-y-6">
        {/* Avatar + Cover */}
        <AvatarUpload
          currentAvatarUrl={avatarUrl || null}
          currentCoverUrl={coverUrl || null}
          userId={userId}
          onAvatarChange={async (url) => {
            setAvatarUrl(url);
            await updateAvatarUrl(url);
          }}
          onCoverChange={async (url) => {
            setCoverUrl(url);
            await updateCoverUrl(url);
          }}
        />

        {/* Display Name */}
        <div>
          <Label htmlFor="onboard-name">Display Name *</Label>
          <Input
            id="onboard-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you want to appear to others"
            maxLength={100}
            className="mt-1.5"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="onboard-bio">Bio</Label>
            <span className="text-xs text-ink-light">{bio.length}/500</span>
          </div>
          <Textarea
            id="onboard-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community a little about yourself..."
            maxLength={500}
            rows={3}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!displayName.trim() || saving}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Film } from "lucide-react";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

export function StepMedia({ setField }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-md bg-gold/5 p-4 text-sm text-ink-dark">
        <strong>Listings with 5+ photos get 3x more views.</strong> Lead
        with a clean conformation shot. Include under-saddle, turnout, and
        close-up photos.
      </div>

      {/* Photo upload zone */}
      <div>
        <Label>Photos</Label>
        <div className="mt-1.5 rounded-lg border-2 border-dashed border-crease-mid p-8 text-center transition-colors hover:border-ink-black">
          <ImageIcon className="mx-auto h-10 w-10 text-ink-faint" />
          <p className="mt-3 text-sm font-medium text-ink-dark">
            Drag photos here or click to browse
          </p>
          <p className="mt-1 text-xs text-ink-light">
            JPG, PNG, WebP up to 10MB each. Minimum 3 photos recommended.
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              // Media uploads will go through Supabase Storage
              // For now, track file count in wizard state
              const files = e.target.files;
              if (files) {
                setField("_photoCount", files.length);
              }
            }}
          />
          <div className="relative mt-4">
            <label className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Upload className="mr-2 inline h-4 w-4" />
              Choose Photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
              />
            </label>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-light">
          Tip: First photo becomes the primary listing image. Drag to reorder.
        </p>
      </div>

      {/* Video upload zone */}
      <div>
        <Label>Videos</Label>
        <div className="mt-1.5 rounded-lg border-2 border-dashed border-crease-mid p-8 text-center transition-colors hover:border-ink-black">
          <Film className="mx-auto h-10 w-10 text-ink-faint" />
          <p className="mt-3 text-sm font-medium text-ink-dark">
            Upload riding or flatwork videos
          </p>
          <p className="mt-1 text-xs text-ink-light">
            MP4, MOV up to 100MB each. Under-saddle videos dramatically
            increase buyer engagement.
          </p>
          <div className="relative mt-4">
            <label className="cursor-pointer rounded-md border border-crease-light px-4 py-2 text-sm font-medium text-ink-dark transition-colors hover:bg-paper-warm">
              <Upload className="mr-2 inline h-4 w-4" />
              Choose Videos
              <input
                type="file"
                accept="video/*"
                multiple
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Photo guidelines */}
      <div className="rounded-md bg-paper-warm p-4">
        <p className="overline mb-2 text-ink-mid">PHOTO GUIDELINES</p>
        <ul className="space-y-1 text-xs text-ink-mid">
          <li>1. Clean conformation shot (both sides) — clear background</li>
          <li>2. Under-saddle photos showing movement and form</li>
          <li>3. Turnout / personality shots</li>
          <li>4. Close-ups of face, legs, and any distinguishing marks</li>
          <li>5. Barn/environment photos (builds buyer confidence)</li>
        </ul>
      </div>
    </div>
  );
}

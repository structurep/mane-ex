"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Image as ImageIcon,
  Film,
  Check,
  Camera,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

/* ─── Conformation angle checklist ─── */

const conformationAngles = [
  {
    id: "left_profile",
    label: "Left Profile",
    required: true,
    description:
      "Full body, left side. Stand at mid-barrel height, 15-20 ft away. Horse square on flat ground.",
  },
  {
    id: "right_profile",
    label: "Right Profile",
    required: true,
    description:
      "Full body, right side. Same distance and height as left profile for symmetry.",
  },
  {
    id: "front_view",
    label: "Front View",
    required: true,
    description:
      "Head-on, showing chest width, leg straightness, and facial features. Horse standing square.",
  },
  {
    id: "rear_view",
    label: "Rear View",
    required: true,
    description:
      "From behind, showing hindquarter development and hind leg alignment.",
  },
  {
    id: "head_closeup",
    label: "Head & Face Close-up",
    required: false,
    description:
      "Face, eyes, ears, nostrils. Shows expression and breed characteristics.",
  },
  {
    id: "legs_detail",
    label: "Legs & Feet",
    required: false,
    description:
      "Close-up of all four legs and hooves. Shows condition, joint quality, and hoof health.",
  },
  {
    id: "markings",
    label: "Markings & Brands",
    required: false,
    description:
      "Any distinguishing marks, brands, or scars. Aids identification and transparency.",
  },
];

const movementVideos = [
  {
    id: "walk_trot",
    label: "Walk & Trot (Both Directions)",
    required: true,
    description:
      "In-hand or free lunging. Both directions so buyers can assess soundness and movement quality.",
  },
  {
    id: "canter",
    label: "Canter (Both Directions)",
    required: false,
    description:
      "Under saddle or free. Shows impulsion, balance, lead changes.",
  },
  {
    id: "under_saddle",
    label: "Under Saddle — Discipline Work",
    required: false,
    description:
      "Flatwork, jumping, pattern work, or trail footage showing training level.",
  },
  {
    id: "turnout",
    label: "Turnout / Personality",
    required: false,
    description:
      "Pasture footage showing temperament, herd behavior, and natural movement.",
  },
];

export function StepMedia({ data, setField }: StepProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const checkedAngles = (data._checkedAngles as string[]) || [];
  const checkedVideos = (data._checkedVideos as string[]) || [];

  function toggleAngle(id: string) {
    const next = checkedAngles.includes(id)
      ? checkedAngles.filter((a) => a !== id)
      : [...checkedAngles, id];
    setField("_checkedAngles", next);
  }

  function toggleVideo(id: string) {
    const next = checkedVideos.includes(id)
      ? checkedVideos.filter((v) => v !== id)
      : [...checkedVideos, id];
    setField("_checkedVideos", next);
  }

  const requiredPhotoCount = conformationAngles.filter((a) => a.required).length;
  const checkedRequiredPhotos = conformationAngles
    .filter((a) => a.required)
    .filter((a) => checkedAngles.includes(a.id)).length;

  return (
    <div className="space-y-6">
      {/* Impact banner */}
      <div className="rounded-lg bg-gold/5 p-4 text-sm text-ink-dark">
        <strong>Listings with 5+ photos and video perform significantly better.</strong>{" "}
        Complete conformation photos build buyer confidence
        before they ever message you.
      </div>

      {/* ─── Photography Guide (collapsible) ─── */}
      <div className="rounded-lg border border-crease-light bg-paper-cream">
        <button
          type="button"
          onClick={() => setGuideOpen(!guideOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-ink-black">
              Photography Standards Guide
            </span>
          </div>
          {guideOpen ? (
            <ChevronUp className="h-4 w-4 text-ink-light" />
          ) : (
            <ChevronDown className="h-4 w-4 text-ink-light" />
          )}
        </button>
        {guideOpen && (
          <div className="border-t border-crease-light px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="overline mb-2 text-ink-mid">CAMERA POSITION</p>
                <ul className="space-y-1 text-xs text-ink-mid">
                  <li>Stand at mid-barrel height (not shooting down)</li>
                  <li>15-20 feet away for full body shots</li>
                  <li>Use telephoto/zoom to reduce distortion</li>
                  <li>Keep camera level — no tilting</li>
                </ul>
              </div>
              <div>
                <p className="overline mb-2 text-ink-mid">LIGHTING & SETUP</p>
                <ul className="space-y-1 text-xs text-ink-mid">
                  <li>Natural light — morning or afternoon (avoid noon)</li>
                  <li>Clean, uncluttered background</li>
                  <li>Horse groomed, halter on, standing square</li>
                  <li>Avoid shadows across the body</li>
                </ul>
              </div>
              <div>
                <p className="overline mb-2 text-ink-mid">WHAT TO SHOW</p>
                <ul className="space-y-1 text-xs text-ink-mid">
                  <li>Show the horse honestly — don&apos;t hide flaws</li>
                  <li>Include any scars, blemishes, or unique features</li>
                  <li>Photograph in a familiar, calm environment</li>
                  <li>Capture natural expression and personality</li>
                </ul>
              </div>
              <div>
                <p className="overline mb-2 text-ink-mid">VIDEO TIPS</p>
                <ul className="space-y-1 text-xs text-ink-mid">
                  <li>Landscape orientation, not portrait</li>
                  <li>Steady camera — tripod or brace against fence</li>
                  <li>Show both directions for soundness assessment</li>
                  <li>Under-saddle video is the #1 buyer request</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Conformation Photo Checklist ─── */}
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <Label>
            Conformation Photos{" "}
            <span className="text-xs font-normal text-ink-light">
              ({checkedRequiredPhotos}/{requiredPhotoCount} required)
            </span>
          </Label>
          {checkedRequiredPhotos === requiredPhotoCount && (
            <span className="flex items-center gap-1 text-xs font-medium text-forest">
              <Check className="h-3 w-3" />
              All required shots covered
            </span>
          )}
        </div>
        <div className="space-y-2">
          {conformationAngles.map((angle) => {
            const checked = checkedAngles.includes(angle.id);
            return (
              <label
                key={angle.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked
                    ? "border-saddle/30 bg-saddle/5"
                    : "border-crease-light bg-paper-white hover:bg-paper-warm"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAngle(angle.id)}
                  className="mt-0.5 h-4 w-4 rounded border-crease-mid text-saddle accent-saddle"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-black">
                      {angle.label}
                    </span>
                    {angle.required && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-mid">
                    {angle.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Photo upload zone */}
      <div>
        <Label>Upload Photos</Label>
        <div className="relative mt-1.5 rounded-lg border-2 border-dashed border-crease-mid p-8 text-center transition-colors hover:border-ink-black">
          <ImageIcon className="mx-auto h-10 w-10 text-ink-faint" />
          <p className="mt-3 text-sm font-medium text-ink-dark">
            Drag photos here or click to browse
          </p>
          <p className="mt-1 text-xs text-ink-light">
            JPG, PNG, WebP up to 10MB each. Lead with your best conformation
            shot.
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
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
          First photo becomes the primary listing image. Drag to reorder.
        </p>
      </div>

      {/* ─── Video Checklist ─── */}
      <div>
        <div className="mb-3">
          <Label>
            Movement Videos{" "}
            <span className="text-xs font-normal text-ink-light">
              ({checkedVideos.length}/{movementVideos.length} covered)
            </span>
          </Label>
        </div>
        <div className="space-y-2">
          {movementVideos.map((vid) => {
            const checked = checkedVideos.includes(vid.id);
            return (
              <label
                key={vid.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked
                    ? "border-saddle/30 bg-saddle/5"
                    : "border-crease-light bg-paper-white hover:bg-paper-warm"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleVideo(vid.id)}
                  className="mt-0.5 h-4 w-4 rounded border-crease-mid text-saddle accent-saddle"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-black">
                      {vid.label}
                    </span>
                    {vid.required && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-mid">
                    {vid.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Video upload zone */}
      <div>
        <Label>Upload Videos</Label>
        <div className="relative mt-1.5 rounded-lg border-2 border-dashed border-crease-mid p-8 text-center transition-colors hover:border-ink-black">
          <Film className="mx-auto h-10 w-10 text-ink-faint" />
          <p className="mt-3 text-sm font-medium text-ink-dark">
            Upload riding or flatwork videos
          </p>
          <p className="mt-1 text-xs text-ink-light">
            MP4, MOV up to 100MB each. Under-saddle videos dramatically increase
            buyer engagement.
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
    </div>
  );
}

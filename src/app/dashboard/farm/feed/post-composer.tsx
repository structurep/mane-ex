"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, savePostMedia } from "@/actions/barn-posts";
import { ImageUpload, ImagePreview } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, Loader2 } from "lucide-react";

type UploadedMedia = { url: string; storagePath: string };

export function PostComposer({
  farmId,
}: {
  farmId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!body.trim() && media.length === 0) return;

    setPending(true);
    setError(null);

    const postType = media.length > 0 ? "photo" : "text";
    const result = await createPost({
      farm_id: farmId,
      type: postType,
      body: body.trim(),
    });

    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    // Save media if any
    if (media.length > 0 && result.id) {
      await savePostMedia(
        result.id,
        media.map((m, i) => ({
          url: m.url,
          storagePath: m.storagePath,
          sortOrder: i,
        }))
      );
    }

    setBody("");
    setMedia([]);
    setShowUpload(false);
    setPending(false);
    router.refresh();
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share something with your barn..."
        rows={3}
        maxLength={5000}
        className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
      />

      {/* Media previews */}
      {media.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {media.map((m, i) => (
            <ImagePreview
              key={m.storagePath}
              url={m.url}
              onRemove={() => removeMedia(i)}
              className="h-20 w-20 flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Upload zone */}
      {showUpload && media.length < 4 && (
        <div className="mt-3">
          <ImageUpload
            bucket="barn-media"
            pathPrefix={`${farmId}/posts`}
            onUpload={(result) => {
              setMedia((prev) => [...prev, result]);
              if (media.length >= 3) setShowUpload(false);
            }}
            onError={setError}
            className="h-24"
          />
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red">{error}</p>
      )}

      {/* Actions bar */}
      <div className="mt-3 flex items-center justify-between border-t border-crease-light pt-3">
        <button
          type="button"
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink-black"
          disabled={media.length >= 4}
        >
          <ImagePlus className="h-4 w-4" />
          Photo
        </button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={pending || (!body.trim() && media.length === 0)}
        >
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Post
        </Button>
      </div>
    </div>
  );
}

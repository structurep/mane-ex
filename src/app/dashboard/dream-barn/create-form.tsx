"use client";

import { useState } from "react";
import { createCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertBanner } from "@/components/tailwind-plus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateCollectionForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCollection(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Create Collection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder='e.g., "Horses for Emma" or "2026 Prospects"'
              required
              maxLength={100}
              className="input-swiss"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-ink-light">(optional)</span>
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="What is this collection for?"
              maxLength={500}
              className="input-swiss"
            />
          </div>
          <input type="hidden" name="visibility" value="private" />

          {error && <AlertBanner variant="error">{error}</AlertBanner>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Collection"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

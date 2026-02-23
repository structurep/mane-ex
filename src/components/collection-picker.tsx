"use client";

import { useState, useEffect } from "react";
import {
  addToCollection,
  createCollection,
  getMyCollections,
} from "@/actions/collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Plus, Check, FolderHeart } from "lucide-react";

interface CollectionPickerProps {
  listingId: string;
  trigger?: React.ReactNode;
}

interface SimpleCollection {
  id: string;
  name: string;
  item_count: number;
  slug: string;
}

export function CollectionPicker({ listingId, trigger }: CollectionPickerProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<SimpleCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getMyCollections().then((result) => {
        setCollections((result.data ?? []) as SimpleCollection[]);
        setLoading(false);
      });
    }
  }, [open]);

  async function handleAdd(collectionId: string) {
    setAdding(collectionId);
    const result = await addToCollection(collectionId, listingId);
    if (!result.error) {
      setAdded((prev) => new Set(prev).add(collectionId));
    }
    setAdding(null);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const formData = new FormData();
    formData.set("name", newName.trim());
    formData.set("visibility", "private");
    const result = await createCollection(formData);
    if (!result.error && result.data) {
      const created = result.data as { id: string; slug: string };
      // Add listing to new collection
      await addToCollection(created.id, listingId);
      setAdded((prev) => new Set(prev).add(created.id));
      // Refresh collections list
      const refreshed = await getMyCollections();
      setCollections((refreshed.data ?? []) as SimpleCollection[]);
      setNewName("");
      setShowCreate(false);
    }
    setCreating(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <FolderHeart className="h-4 w-4" />
            Save to Collection
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Save to Collection</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-ink-mid">Loading...</div>
        ) : (
          <div className="space-y-1">
            {collections.map((coll) => {
              const isAdded = added.has(coll.id);
              return (
                <button
                  key={coll.id}
                  onClick={() => !isAdded && handleAdd(coll.id)}
                  disabled={isAdded || adding === coll.id}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    isAdded
                      ? "bg-forest/5 text-forest"
                      : "hover:bg-paper-warm"
                  }`}
                >
                  <div>
                    <span className="font-medium">{coll.name}</span>
                    <span className="ml-2 text-xs text-ink-light">
                      {coll.item_count} {coll.item_count === 1 ? "horse" : "horses"}
                    </span>
                  </div>
                  {isAdded ? (
                    <Check className="h-4 w-4 text-forest" />
                  ) : adding === coll.id ? (
                    <span className="text-xs text-ink-light">Adding...</span>
                  ) : (
                    <Plus className="h-4 w-4 text-ink-light" />
                  )}
                </button>
              );
            })}

            {collections.length === 0 && (
              <p className="py-4 text-center text-sm text-ink-mid">
                No collections yet. Create one below.
              </p>
            )}

            {/* Create new collection */}
            {showCreate ? (
              <div className="flex gap-2 pt-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Collection name"
                  className="input-swiss"
                  maxLength={100}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                >
                  {creating ? "..." : "Add"}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-ink-mid transition-colors hover:bg-paper-warm hover:text-ink-black"
              >
                <Plus className="h-4 w-4" />
                Create New Collection
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

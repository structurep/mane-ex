import { getMyCollections } from "@/actions/collections";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Plus, Lock, Globe, Link2 } from "lucide-react";
import { CreateCollectionForm } from "./create-form";

const VISIBILITY_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  private: { label: "Private", icon: Lock },
  shared: { label: "Shared", icon: Link2 },
  public: { label: "Public", icon: Globe },
};

export default async function DreamBarnPage() {
  const { data: collections, error } = await getMyCollections();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
            Dream Barn
          </h1>
          <p className="mt-1 text-ink-mid">
            Save horses into collections. Share with friends and trainers.
          </p>
        </div>
        <CreateCollectionForm />
      </div>

      {/* Collections grid */}
      {!collections || collections.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed p-12 text-center">
          <Heart className="h-10 w-10 text-ink-faint" />
          <div>
            <p className="font-medium text-ink-black">No collections yet</p>
            <p className="mt-1 text-sm text-ink-mid">
              Create your first Dream Barn board to start saving horses.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const vis = VISIBILITY_CONFIG[collection.visibility] ?? VISIBILITY_CONFIG.private;
            const VisIcon = vis.icon;

            return (
              <Link
                key={collection.id}
                href={`/dashboard/dream-barn/${collection.slug}`}
              >
                <Card className="group h-full cursor-pointer transition-shadow hover:shadow-folded">
                  {/* Cover area */}
                  <div className="flex h-32 items-center justify-center bg-paper-cream">
                    <Heart className="h-8 w-8 text-crease-mid" />
                  </div>

                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-medium text-ink-black group-hover:text-accent-blue">
                        {collection.name}
                      </h3>
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <VisIcon className="h-3 w-3" />
                        {vis.label}
                      </Badge>
                    </div>

                    {typeof collection.description === "string" ? (
                      <p className="line-clamp-2 text-sm text-ink-mid">
                        {collection.description}
                      </p>
                    ) : null}

                    <p className="overline text-ink-light">
                      {collection.item_count}{" "}
                      {collection.item_count === 1 ? "HORSE" : "HORSES"}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

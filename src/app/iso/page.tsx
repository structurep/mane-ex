import { getIsos } from "@/actions/isos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, MapPin, Plus, Users, Send } from "lucide-react";
import { IsoMatchModal } from "@/components/iso-match-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "In Search Of — ManeExchange",
  description:
    "Browse buyer requests for horses. Match your horse to a buyer looking for exactly what you have.",
};

function formatPriceCents(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export default async function IsoBrowsePage() {
  const { data: isos } = await getIsos();
  const allIsos = (isos ?? []) as Array<{
    id: string;
    title: string;
    description: string;
    min_price: number | null;
    max_price: number | null;
    min_height_hands: number | null;
    max_height_hands: number | null;
    min_age: number | null;
    max_age: number | null;
    gender: string[];
    breeds: string[];
    preferred_states: string[];
    level: string | null;
    match_count: number;
    created_at: string;
    author: {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
      city: string | null;
      state: string | null;
    } | null;
  }>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-red" />
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
              In Search Of
            </h1>
          </div>
          <p className="mt-1 text-ink-mid">
            Buyers are looking for specific horses. Match yours and connect directly.
          </p>
        </div>
        <Button asChild>
          <Link href="/iso/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Post ISO
          </Link>
        </Button>
      </div>

      {/* ISO Cards */}
      {allIsos.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Search className="h-10 w-10 text-ink-faint" />
          <div>
            <p className="font-medium text-ink-black">No active requests</p>
            <p className="mt-1 text-sm text-ink-mid">
              Be the first to post what you&apos;re looking for.
            </p>
          </div>
          <Button asChild>
            <Link href="/iso/new">Post an ISO</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {allIsos.map((iso) => {
            const author = iso.author;
            const criteria: string[] = [];

            if (iso.min_price || iso.max_price) {
              const min = iso.min_price ? formatPriceCents(iso.min_price) : "Any";
              const max = iso.max_price ? formatPriceCents(iso.max_price) : "Any";
              criteria.push(`${min} – ${max}`);
            }
            if (iso.min_height_hands || iso.max_height_hands) {
              criteria.push(
                `${iso.min_height_hands ?? "?"}–${iso.max_height_hands ?? "?"}hh`
              );
            }
            if (iso.gender.length > 0) {
              criteria.push(iso.gender.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(", "));
            }
            if (iso.breeds.length > 0) {
              criteria.push(iso.breeds.join(", "));
            }
            if (iso.preferred_states.length > 0) {
              criteria.push(iso.preferred_states.join(", "));
            }
            if (iso.level) {
              criteria.push(iso.level);
            }

            return (
              <Card
                key={iso.id}
                className="overflow-hidden transition-shadow hover:shadow-folded"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-heading text-lg font-medium text-ink-black">
                        {iso.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-ink-mid">
                        {iso.description}
                      </p>

                      {/* Criteria chips */}
                      {criteria.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {criteria.map((c, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Author */}
                      {author && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-ink-light">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper-cream text-[10px] font-medium text-ink-mid">
                            {author.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <span>{author.display_name ?? "Anonymous"}</span>
                          {typeof author.state === "string" ? (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {String(author.state)}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Match count + action */}
                    <div className="ml-4 flex flex-col items-end gap-2">
                      {iso.match_count > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {iso.match_count} match{iso.match_count !== 1 ? "es" : ""}
                        </Badge>
                      )}
                      <IsoMatchModal isoId={iso.id} isoTitle={iso.title}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Send className="h-3.5 w-3.5" />
                          Match a Horse
                        </Button>
                      </IsoMatchModal>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

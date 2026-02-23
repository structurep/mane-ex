"use client";

import { useState } from "react";
import { createIso } from "@/actions/isos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";

const GENDERS = [
  { value: "mare", label: "Mare" },
  { value: "gelding", label: "Gelding" },
  { value: "stallion", label: "Stallion" },
];

export default function NewIsoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const router = useRouter();

  function toggleGender(g: string) {
    setSelectedGenders((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Add gender array
    selectedGenders.forEach((g) => formData.append("gender", g));

    const result = await createIso(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/iso");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      {/* Breadcrumb */}
      <Link
        href="/iso"
        className="mb-6 flex items-center gap-1 text-sm text-ink-mid hover:text-ink-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to ISOs
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-red" />
          <h1 className="font-heading text-2xl font-semibold text-ink-black">
            Post an ISO
          </h1>
        </div>
        <p className="mt-1 text-ink-mid">
          Describe the horse you&apos;re looking for. Trainers and sellers will
          match their horses to your criteria.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder={"e.g., Looking for a 3'6\" junior hunter in Florida"}
              required
              minLength={5}
              maxLength={200}
              className="input-swiss"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what you're looking for in detail. Include riding experience, intended use, temperament preferences, timeline..."
              rows={5}
              required
              minLength={20}
              maxLength={5000}
              className="input-swiss"
            />
          </div>

          <div className="border-t border-crease-light pt-6">
            <p className="overline mb-4 text-ink-light">SEARCH CRITERIA</p>

            {/* Price range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min_price">Min Price ($)</Label>
                <Input
                  id="min_price"
                  name="min_price"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="input-swiss"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_price">Max Price ($)</Label>
                <Input
                  id="max_price"
                  name="max_price"
                  type="number"
                  min={0}
                  placeholder="No max"
                  className="input-swiss"
                />
              </div>
            </div>
          </div>

          {/* Height range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_height_hands">Min Height (hh)</Label>
              <Input
                id="min_height_hands"
                name="min_height_hands"
                type="number"
                step="0.1"
                min={10}
                max={20}
                placeholder="e.g., 15.0"
                className="input-swiss"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_height_hands">Max Height (hh)</Label>
              <Input
                id="max_height_hands"
                name="max_height_hands"
                type="number"
                step="0.1"
                min={10}
                max={20}
                placeholder="e.g., 17.0"
                className="input-swiss"
              />
            </div>
          </div>

          {/* Age range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_age">Min Age (years)</Label>
              <Input
                id="min_age"
                name="min_age"
                type="number"
                min={0}
                max={40}
                placeholder="0"
                className="input-swiss"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_age">Max Age (years)</Label>
              <Input
                id="max_age"
                name="max_age"
                type="number"
                min={0}
                max={40}
                placeholder="No max"
                className="input-swiss"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => toggleGender(g.value)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedGenders.includes(g.value)
                      ? "border-ink-black bg-ink-black text-paper-white"
                      : "border-crease-light text-ink-mid hover:border-ink-black"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breeds */}
          <div className="space-y-2">
            <Label htmlFor="breeds">
              Breeds <span className="text-ink-light">(comma-separated)</span>
            </Label>
            <Input
              id="breeds"
              name="breeds"
              placeholder="e.g., Warmblood, Thoroughbred, Dutch Warmblood"
              className="input-swiss"
            />
          </div>

          {/* Preferred states */}
          <div className="space-y-2">
            <Label htmlFor="preferred_states">
              Preferred States{" "}
              <span className="text-ink-light">(comma-separated, 2-letter codes)</span>
            </Label>
            <Input
              id="preferred_states"
              name="preferred_states"
              placeholder="e.g., FL, CA, NY"
              className="input-swiss"
            />
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              name="level"
              placeholder={"e.g., 3'6\" rated or Training level"}
              maxLength={100}
              className="input-swiss"
            />
          </div>

          {error && <p className="text-sm text-red">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Posting..." : "Post ISO"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

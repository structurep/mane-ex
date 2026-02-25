"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

const genderOptions = [
  { value: "mare", label: "Mare" },
  { value: "gelding", label: "Gelding" },
  { value: "stallion", label: "Stallion" },
];

const registries = ["AQHA", "USEF", "USDF", "USEA", "APHA", "Jockey Club", "Warmblood Registry", "Other"];

export function StepBasicInfo({ data, setField }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name">
          Horse Name <span className="text-red">*</span>
        </Label>
        <Input
          id="name"
          value={(data.name as string) || ""}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Barn name or show name"
          className="mt-1.5"
        />
      </div>

      {/* Breed & Color */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            value={(data.breed as string) || ""}
            onChange={(e) => setField("breed", e.target.value)}
            placeholder="e.g. Warmblood, Thoroughbred"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={(data.color as string) || ""}
            onChange={(e) => setField("color", e.target.value)}
            placeholder="e.g. Bay, Chestnut, Grey"
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <Label>Gender</Label>
        <div className="mt-1.5 flex gap-2">
          {genderOptions.map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="gender-radio"
                value={opt.value}
                checked={data.gender === opt.value}
                onChange={() => setField("gender", opt.value)}
                className="peer sr-only"
              />
              <span className="block rounded-md border border-crease-light px-4 py-2 text-sm font-medium text-ink-mid transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* DOB & Height */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={(data.date_of_birth as string) || ""}
            onChange={(e) => setField("date_of_birth", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="height">Height (hands)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            min="8"
            max="20"
            value={(data.height_hands as string) || ""}
            onChange={(e) => setField("height_hands", e.target.value)}
            placeholder="e.g. 16.2"
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Registration */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="registered_name">Registered Name</Label>
          <Input
            id="registered_name"
            value={(data.registered_name as string) || ""}
            onChange={(e) => setField("registered_name", e.target.value)}
            placeholder="Official registry name"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="registration_number">Registration #</Label>
          <Input
            id="registration_number"
            value={(data.registration_number as string) || ""}
            onChange={(e) => setField("registration_number", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Registry */}
      <div>
        <Label htmlFor="registry">Registry</Label>
        <select
          id="registry"
          value={(data.registry as string) || ""}
          onChange={(e) => setField("registry", e.target.value)}
          className="mt-1.5 w-full rounded-md border-0 bg-paper-white px-3 py-2 text-sm text-ink-black shadow-flat"
        >
          <option value="">Select registry...</option>
          {registries.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Sire & Dam */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sire">Sire</Label>
          <Input
            id="sire"
            value={(data.sire as string) || ""}
            onChange={(e) => setField("sire", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="dam">Dam</Label>
          <Input
            id="dam"
            value={(data.dam as string) || ""}
            onChange={(e) => setField("dam", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}

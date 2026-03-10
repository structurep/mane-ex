"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu } from "@/components/tailwind-plus";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

const genderOptions = [
  { value: "mare", label: "Mare" },
  { value: "gelding", label: "Gelding" },
  { value: "stallion", label: "Stallion" },
];

const breeds = [
  "Warmblood",
  "Dutch Warmblood",
  "Hanoverian",
  "Holsteiner",
  "Oldenburg",
  "Thoroughbred",
  "Belgian Warmblood",
  "Westphalian",
  "Irish Sport Horse",
  "Selle Francais",
  "Quarter Horse",
  "Other",
];

const colors = [
  "Bay",
  "Chestnut",
  "Black",
  "Gray",
  "Dun",
  "Palomino",
  "Buckskin",
  "Roan",
  "Pinto",
  "Appaloosa",
  "Cremello",
  "Other",
];

const registries = ["AQHA", "USEF", "USDF", "USEA", "APHA", "Jockey Club", "Warmblood Registry", "Other"];

export function StepBasicInfo({ data, setField }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name">
          Horse Name <span className="text-red" aria-label="required">*</span>
        </Label>
        <Input
          id="name"
          required
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
          <SelectMenu
            label="Select breed"
            value={(data.breed as string) || ""}
            onChange={(val) => setField("breed", val)}
            variant="field"
            className="mt-1.5"
          >
            {breeds.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </SelectMenu>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <SelectMenu
            label="Select color"
            value={(data.color as string) || ""}
            onChange={(val) => setField("color", val)}
            variant="field"
            className="mt-1.5"
          >
            {colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </SelectMenu>
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
              <span className="block rounded-md border border-crease-light px-4 py-2 text-sm font-medium text-ink-mid transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1">
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
        <SelectMenu
          label="Select registry..."
          value={(data.registry as string) || ""}
          onChange={(val) => setField("registry", val)}
          variant="field"
          className="mt-1.5"
        >
          {registries.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </SelectMenu>
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

      {/* Microchipped */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={data.is_microchipped === true}
          onChange={(e) => setField("is_microchipped", e.target.checked)}
          className="h-4 w-4 rounded border-crease-light text-primary accent-primary"
        />
        <span className="text-sm font-medium text-ink-dark">Horse is microchipped</span>
      </label>
    </div>
  );
}

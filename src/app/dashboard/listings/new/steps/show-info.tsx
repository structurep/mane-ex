"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectMenu } from "@/components/tailwind-plus";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

const disciplines = [
  "Hunter", "Jumper", "Equitation", "Hunter/Jumper", "Dressage",
  "Eventing", "Show Jumping", "Polo", "Combined Driving",
  "Western Pleasure", "Reining", "Cutting", "Barrel Racing",
  "Western Dressage", "Trail", "Endurance", "Pleasure", "Breeding",
];

const levels = [
  "Beginner", "Novice", "Training", "Preliminary",
  "Intermediate", "Advanced", "Grand Prix", "International",
  "Pre-Children's", "Children's", "Adult Amateur", "Junior",
  "Low", "Medium", "High",
];

export function StepShowInfo({ data, setField }: StepProps) {
  const selectedDisciplines = (data.discipline_ids as string[]) || [];

  const toggleDiscipline = (d: string) => {
    const updated = selectedDisciplines.includes(d)
      ? selectedDisciplines.filter((x) => x !== d)
      : [...selectedDisciplines, d];
    setField("discipline_ids", updated);
  };

  return (
    <div className="space-y-6">
      {/* Disciplines */}
      <div>
        <Label>Disciplines</Label>
        <p className="mb-2 text-xs text-ink-light">Select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <label key={d} className="cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDisciplines.includes(d)}
                onChange={() => toggleDiscipline(d)}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-crease-light px-3 py-1.5 text-xs font-medium text-ink-mid transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                {d}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <Label htmlFor="level">Level</Label>
        <SelectMenu
          label="Select level..."
          value={(data.level as string) || ""}
          onChange={(val) => setField("level", val)}
          variant="field"
          className="mt-1.5"
        >
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </SelectMenu>
      </div>

      {/* Show Experience */}
      <div>
        <Label htmlFor="show_experience">Show Experience</Label>
        <Textarea
          id="show_experience"
          value={(data.show_experience as string) || ""}
          onChange={(e) => setField("show_experience", e.target.value)}
          placeholder="Describe this horse's show experience, circuits shown, and any notable results..."
          rows={4}
          className="mt-1.5"
        />
      </div>

      {/* Show Record */}
      <div>
        <Label htmlFor="show_record">Show Record / Results</Label>
        <Textarea
          id="show_record"
          value={(data.show_record as string) || ""}
          onChange={(e) => setField("show_record", e.target.value)}
          placeholder="List specific results: WEF 2025 - 1st in $5,000 USHJA National Hunter Derby..."
          rows={4}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="competition_divisions">Competition Divisions</Label>
        <Input
          id="competition_divisions"
          value={(data.competition_divisions as string) || ""}
          onChange={(e) => setField("competition_divisions", e.target.value)}
          placeholder={"e.g. 3'6\" Performance Hunters, Children's Jumpers"}
          className="mt-1.5"
        />
      </div>

      {/* Registration Numbers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="usef_number">USEF #</Label>
          <Input
            id="usef_number"
            value={(data.usef_number as string) || ""}
            onChange={(e) => setField("usef_number", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="usdf_number">USDF #</Label>
          <Input
            id="usdf_number"
            value={(data.usdf_number as string) || ""}
            onChange={(e) => setField("usdf_number", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="fei_id">FEI ID</Label>
          <Input
            id="fei_id"
            value={(data.fei_id as string) || ""}
            onChange={(e) => setField("fei_id", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}

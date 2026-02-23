"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

export function StepFarmLife({ data, setField }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Location */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="location_city">City</Label>
          <Input
            id="location_city"
            value={(data.location_city as string) || ""}
            onChange={(e) => setField("location_city", e.target.value)}
            placeholder="e.g. Wellington"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="location_state">State</Label>
          <select
            id="location_state"
            value={(data.location_state as string) || ""}
            onChange={(e) => setField("location_state", e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-paper-white px-3 py-2 text-sm text-ink-black"
          >
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="location_zip">ZIP</Label>
          <Input
            id="location_zip"
            value={(data.location_zip as string) || ""}
            onChange={(e) => setField("location_zip", e.target.value)}
            placeholder="33414"
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Barn & People */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="barn_name">Barn Name</Label>
          <Input
            id="barn_name"
            value={(data.barn_name as string) || ""}
            onChange={(e) => setField("barn_name", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="current_trainer">Current Trainer</Label>
          <Input
            id="current_trainer"
            value={(data.current_trainer as string) || ""}
            onChange={(e) => setField("current_trainer", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="current_rider">Current Rider</Label>
        <Input
          id="current_rider"
          value={(data.current_rider as string) || ""}
          onChange={(e) => setField("current_rider", e.target.value)}
          className="mt-1.5"
        />
      </div>

      {/* Care Details */}
      <div>
        <Label htmlFor="turnout_schedule">Turnout Schedule</Label>
        <Textarea
          id="turnout_schedule"
          value={(data.turnout_schedule as string) || ""}
          onChange={(e) => setField("turnout_schedule", e.target.value)}
          placeholder="e.g. Daily turnout 6am-12pm, individual paddock"
          rows={2}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="feeding_program">Feeding Program</Label>
        <Textarea
          id="feeding_program"
          value={(data.feeding_program as string) || ""}
          onChange={(e) => setField("feeding_program", e.target.value)}
          placeholder="e.g. 2x daily, 10 lbs Triple Crown Senior, hay ad lib"
          rows={2}
          className="mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="shoeing_schedule">Shoeing Schedule</Label>
          <Input
            id="shoeing_schedule"
            value={(data.shoeing_schedule as string) || ""}
            onChange={(e) => setField("shoeing_schedule", e.target.value)}
            placeholder="e.g. Every 6 weeks, front shoes only"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="supplements">Supplements</Label>
          <Input
            id="supplements"
            value={(data.supplements as string) || ""}
            onChange={(e) => setField("supplements", e.target.value)}
            placeholder="e.g. SmartPak Joint Support"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}

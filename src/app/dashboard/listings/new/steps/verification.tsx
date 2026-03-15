"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/tailwind-plus";

type StepProps = {
  data: Record<string, unknown>;
  setField: (field: string, value: unknown) => void;
};

const VIDEO_ITEMS = [
  { key: "walk", label: "Walk both directions" },
  { key: "trot", label: "Trot both directions" },
  { key: "canter", label: "Canter both directions" },
  { key: "jumping", label: "Jumping footage" },
  { key: "ground_manners", label: "Ground manners / loading" },
] as const;

export function StepVerification({ data, setField }: StepProps) {
  const videoChecklist = (data.video_checklist as Record<string, boolean>) || {};

  const allRequiredVideosDone =
    videoChecklist.walk === true &&
    videoChecklist.trot === true &&
    videoChecklist.canter === true &&
    videoChecklist.ground_manners === true;

  function updateVideoChecklist(key: string, checked: boolean) {
    const updated = { ...videoChecklist, [key]: checked };
    setField("video_checklist", updated);

    // Auto-derive standardized_video_complete
    const complete =
      updated.walk === true &&
      updated.trot === true &&
      updated.canter === true &&
      updated.ground_manners === true;
    setField("standardized_video_complete", complete);
  }

  return (
    <div className="space-y-6">
      {/* Verification Badges */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="text-base font-semibold text-ink-black">
          Verification Badges
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          Earn trust badges to increase buyer confidence and visibility
        </p>

        <div className="mt-5 space-y-4">
          {/* Current Coggins */}
          <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1">
            <input
              type="checkbox"
              checked={data.has_current_coggins === true}
              onChange={(e) =>
                setField("has_current_coggins", e.target.checked)
              }
              aria-describedby="coggins-help"
              className="mt-0.5 h-5 w-5 rounded border-crease-mid text-primary accent-primary"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-black">
                  Current Coggins
                </span>
                <StatusBadge variant="gold">Recommended</StatusBadge>
              </div>
              <p id="coggins-help" className="mt-0.5 text-xs text-ink-mid">
                Confirm that this horse has a negative Coggins test within the
                last 12 months
              </p>
            </div>
          </label>

          {/* Vet Check Available */}
          <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1">
            <input
              type="checkbox"
              checked={data.has_vet_check_available === true}
              onChange={(e) =>
                setField("has_vet_check_available", e.target.checked)
              }
              aria-describedby="vetcheck-help"
              className="mt-0.5 h-5 w-5 rounded border-crease-mid text-primary accent-primary"
            />
            <div>
              <span className="text-sm font-semibold text-ink-black">
                Vet Check Available
              </span>
              <p id="vetcheck-help" className="mt-0.5 text-xs text-ink-mid">
                You have recent veterinary records available for potential buyers
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* HorseProof Verification */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="text-base font-semibold text-ink-black">
          HorseProof Verification
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          Complete verification items to earn a HorseProof trust badge. Higher tiers
          get more visibility and buyer confidence.
        </p>

        <div className="mt-5 space-y-4">
          {/* Trainer Endorsement */}
          <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="checkbox"
              checked={data.trainer_endorsed === true}
              onChange={(e) =>
                setField("trainer_endorsed", e.target.checked)
              }
              className="mt-0.5 h-5 w-5 rounded border-crease-mid text-primary accent-primary"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-black">
                  Trainer Endorsed
                </span>
                <StatusBadge variant="gray">Silver</StatusBadge>
              </div>
              <p className="mt-0.5 text-xs text-ink-mid">
                A trainer has reviewed and endorsed this horse
              </p>
            </div>
          </label>

          {data.trainer_endorsed === true && (
            <div className="ml-9 space-y-3">
              <div>
                <Label htmlFor="hp_trainer_name">Trainer Name</Label>
                <Input
                  id="hp_trainer_name"
                  value={(data.hp_trainer_name as string) || ""}
                  onChange={(e) => setField("hp_trainer_name", e.target.value)}
                  placeholder="Jane Smith"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="hp_trainer_note">Endorsement Note</Label>
                <Textarea
                  id="hp_trainer_note"
                  value={(data.hp_trainer_endorsement_note as string) || ""}
                  onChange={(e) => setField("hp_trainer_endorsement_note", e.target.value)}
                  placeholder="Brief endorsement from the trainer..."
                  rows={2}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* PPE on File */}
          <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="checkbox"
              checked={data.ppe_on_file === true}
              onChange={(e) =>
                setField("ppe_on_file", e.target.checked)
              }
              className="mt-0.5 h-5 w-5 rounded border-crease-mid text-primary accent-primary"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-black">
                  Pre-Purchase Exam on File
                </span>
                <StatusBadge variant="gold">Gold</StatusBadge>
              </div>
              <p className="mt-0.5 text-xs text-ink-mid">
                A recent PPE report is available for buyers
              </p>
            </div>
          </label>

          {data.ppe_on_file === true && (
            <div className="ml-9">
              <Label htmlFor="ppe_document_url">PPE Document URL</Label>
              <Input
                id="ppe_document_url"
                type="url"
                value={(data.ppe_document_url as string) || ""}
                onChange={(e) => setField("ppe_document_url", e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
          )}

          {/* Show Record */}
          <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-crease-light p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="checkbox"
              checked={data.show_record_linked === true}
              onChange={(e) =>
                setField("show_record_linked", e.target.checked)
              }
              className="mt-0.5 h-5 w-5 rounded border-crease-mid text-primary accent-primary"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-black">
                  Show Record Linked
                </span>
                <StatusBadge variant="gold">Gold</StatusBadge>
              </div>
              <p className="mt-0.5 text-xs text-ink-mid">
                Link to USEF, USDF, or other official show records
              </p>
            </div>
          </label>

          {data.show_record_linked === true && (
            <div className="ml-9">
              <Label htmlFor="show_record_url">Show Record URL</Label>
              <Input
                id="show_record_url"
                type="url"
                value={(data.show_record_url as string) || ""}
                onChange={(e) => setField("show_record_url", e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Video Protocol Checklist */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="text-base font-semibold text-ink-black">
          Standardized Video Protocol
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          Complete the required video angles to earn the standardized video badge.
          This helps buyers evaluate movement quality consistently.
        </p>

        <div className="mt-4 space-y-2">
          {VIDEO_ITEMS.map((item) => {
            const isRequired = item.key !== "jumping";
            return (
              <label
                key={item.key}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-paper-cream"
              >
                <input
                  type="checkbox"
                  checked={videoChecklist[item.key] === true}
                  onChange={(e) => updateVideoChecklist(item.key, e.target.checked)}
                  className="h-4 w-4 rounded border-crease-mid text-primary accent-primary"
                />
                <span className="text-sm text-ink-dark">{item.label}</span>
                {isRequired ? (
                  <span className="text-[10px] text-ink-faint">Required</span>
                ) : (
                  <span className="text-[10px] text-ink-faint">Optional</span>
                )}
              </label>
            );
          })}
        </div>

        {allRequiredVideosDone && (
          <p className="mt-3 text-xs font-medium text-forest">
            All required video angles confirmed
          </p>
        )}
      </div>

      {/* Known Health Issues */}
      <div className="rounded-lg border border-crease-light bg-white p-5">
        <h3 className="text-base font-semibold text-ink-black">
          Known Health Issues
        </h3>
        <p className="mt-1 text-sm text-ink-mid">
          <span className="text-ink-light">(Optional but encouraged)</span>
          {" "}Disclosing known issues builds trust and prevents disputes
        </p>
        <Textarea
          id="known_health_issues"
          value={(data.known_health_issues as string) || ""}
          onChange={(e) => setField("known_health_issues", e.target.value)}
          placeholder="e.g., No known issues, or describe any maintenance needs..."
          rows={4}
          className="mt-3"
        />
      </div>
    </div>
  );
}

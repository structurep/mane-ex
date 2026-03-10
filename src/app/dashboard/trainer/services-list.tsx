"use client";

import { useState, useActionState } from "react";
import { addTrainerService, deleteTrainerService, type TrainerActionState } from "@/actions/trainers";
import type { TrainerService } from "@/types/trainers";
import { SERVICE_CATEGORY_LABELS, type ServiceCategory } from "@/types/trainers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, AlertBanner, EmptyState } from "@/components/tailwind-plus";
import { Plus, Trash2, Clock, DollarSign, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

export function TrainerServicesList({ services }: { services: TrainerService[] }) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  return (
    <div>
      {services.length > 0 ? (
        <div className="space-y-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} onDeleted={() => router.refresh()} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="size-8" />}
          title="No services listed"
          description="Add your first service to start appearing in the trainer directory."
        />
      )}

      {showForm ? (
        <div className="mt-4 rounded-lg border border-crease-light bg-paper-cream p-4">
          <AddServiceForm
            onSuccess={() => {
              setShowForm(false);
              router.refresh();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="mt-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  onDeleted,
}: {
  service: TrainerService;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this service?")) return;
    setDeleting(true);
    const result = await deleteTrainerService(service.id);
    if (result.error) {
      alert(result.error);
      setDeleting(false);
    } else {
      onDeleted();
    }
  }

  return (
    <div className="flex items-start justify-between rounded-lg border border-crease-light p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink-black">{service.name}</p>
          <StatusBadge variant="blue">
            {SERVICE_CATEGORY_LABELS[service.category]}
          </StatusBadge>
          {!service.is_active && <StatusBadge variant="gray">Inactive</StatusBadge>}
        </div>
        {service.description && (
          <p className="mt-1 text-xs text-ink-mid">{service.description}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-faint">
          {service.price_cents != null && service.price_type !== "contact" ? (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${(service.price_cents / 100).toLocaleString()}
              {service.price_type === "hourly" ? "/hr" : service.price_type === "per_session" ? "/session" : ""}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Contact for pricing
            </span>
          )}
          {service.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {service.duration_minutes >= 60
                ? `${Math.floor(service.duration_minutes / 60)}h${service.duration_minutes % 60 > 0 ? ` ${service.duration_minutes % 60}m` : ""}`
                : `${service.duration_minutes}m`}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 text-ink-faint hover:text-red"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AddServiceForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState<TrainerActionState, FormData>(
    addTrainerService,
    {}
  );

  if (state.success) {
    onSuccess();
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <AlertBanner variant="error" title="Error">
          {state.error}
        </AlertBanner>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="service-name">Service Name</Label>
          <Input
            id="service-name"
            name="name"
            required
            maxLength={200}
            placeholder="e.g., Pre-Purchase Evaluation"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red">{state.fieldErrors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="service-category">Category</Label>
          <select
            id="service-category"
            name="category"
            required
            className="mt-1.5 h-10 w-full cursor-pointer appearance-none rounded-lg border border-crease-light bg-paper-cream px-3 text-sm text-ink-dark transition-colors focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood/20"
          >
            <option value="">Select category</option>
            {(Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategory, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>{label}</option>
              )
            )}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="service-description">Description</Label>
        <Textarea
          id="service-description"
          name="description"
          maxLength={1000}
          rows={2}
          placeholder="Brief description of what this service includes..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="service-price">Price (cents)</Label>
          <Input
            id="service-price"
            name="price_cents"
            type="number"
            min={0}
            placeholder="15000"
          />
          <p className="mt-1 text-[11px] text-ink-faint">Enter in cents (e.g., 15000 = $150)</p>
        </div>
        <div>
          <Label htmlFor="service-price-type">Price Type</Label>
          <select
            id="service-price-type"
            name="price_type"
            className="mt-1.5 h-10 w-full cursor-pointer appearance-none rounded-lg border border-crease-light bg-paper-cream px-3 text-sm text-ink-dark transition-colors focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood/20"
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
            <option value="per_session">Per Session</option>
            <option value="contact">Contact for Pricing</option>
          </select>
        </div>
        <div>
          <Label htmlFor="service-duration">Duration (minutes)</Label>
          <Input
            id="service-duration"
            name="duration_minutes"
            type="number"
            min={1}
            max={480}
            placeholder="60"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Service"}
        </Button>
      </div>
    </form>
  );
}

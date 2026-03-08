import { Truck, FileText, Syringe, ClipboardCheck } from "lucide-react";

type InterstateChecklistProps = {
  sellerState: string;
  buyerState: string;
};

const CHECKLIST_ITEMS = [
  {
    icon: Syringe,
    label: "Negative Coggins test",
    description:
      "Required by all 50 states for interstate transport. Must be current (typically within 12 months).",
    required: true,
  },
  {
    icon: FileText,
    label: "Certificate of Veterinary Inspection (CVI)",
    description:
      "Issued by an accredited veterinarian. Valid for 30 days (some states 10 days). Check with destination state for specific requirements.",
    required: true,
  },
  {
    icon: ClipboardCheck,
    label: "Brand inspection",
    description:
      "Required in origin or destination states that mandate brand inspections (varies by state).",
    required: false,
  },
  {
    icon: FileText,
    label: "Health certificate",
    description:
      "Some states require an additional health certificate beyond the CVI. Check destination state regulations.",
    required: false,
  },
];

export function InterstateChecklist({
  sellerState,
  buyerState,
}: InterstateChecklistProps) {
  if (!sellerState || !buyerState || sellerState === buyerState) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-gold" />
        <h3 className="font-medium text-ink-dark">
          Interstate Transport: {sellerState} → {buyerState}
        </h3>
      </div>
      <p className="mt-1 text-sm text-ink-mid">
        This transaction involves interstate horse transport. The following
        documentation may be required:
      </p>

      <div className="mt-4 space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-md bg-paper-white p-3"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                <Icon className="h-4 w-4 text-ink-mid" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink-dark">
                    {item.label}
                  </p>
                  {item.required && (
                    <span className="rounded bg-red/10 px-1.5 py-0.5 text-[10px] font-medium text-red">
                      Required
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-light">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-ink-light">
        Buyers and sellers are responsible for compliance with all applicable
        state and federal regulations governing interstate transport of equines.
        ManeExchange does not verify transport documentation.
      </p>
    </div>
  );
}

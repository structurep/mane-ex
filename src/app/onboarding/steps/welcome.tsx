"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, GraduationCap, ArrowRight } from "lucide-react";

const ROLES = [
  {
    value: "buyer",
    label: "Buyer",
    description: "Looking for my next horse",
    icon: ShoppingBag,
  },
  {
    value: "seller",
    label: "Seller",
    description: "I have horses to list",
    icon: Store,
  },
  {
    value: "trainer",
    label: "Trainer",
    description: "I help clients buy and sell",
    icon: GraduationCap,
  },
];

export function WelcomeStep({
  role,
  onNext,
}: {
  role: string;
  onNext: (role: string) => void;
}) {
  const [selected, setSelected] = useState(role);

  return (
    <div className="text-center">
      <h1 className="font-serif text-3xl font-bold text-ink-black">
        Welcome to ManeExchange
      </h1>
      <p className="mt-2 text-ink-mid">
        How will you primarily use the platform?
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = selected === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelected(r.value)}
              className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-folded"
                  : "border-crease-light bg-paper-cream hover:border-ink-light"
              }`}
            >
              <div
                className={`rounded-full p-3 ${
                  isSelected ? "bg-primary/10" : "bg-paper-warm"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isSelected ? "text-primary" : "text-ink-light"
                  }`}
                />
              </div>
              <div>
                <p className="font-medium text-ink-black">{r.label}</p>
                <p className="mt-0.5 text-xs text-ink-light">
                  {r.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Button size="lg" onClick={() => onNext(selected)}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

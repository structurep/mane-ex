"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  heading?: string;
  items: FaqItem[];
}

export function FaqAccordion({ heading, items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-paper-cream px-4 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        {heading && (
          <h2 className="mb-8 font-serif text-3xl text-ink-black md:text-4xl">
            {heading}
          </h2>
        )}
        <div>
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.question} className="border-b border-crease-light">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-left font-medium text-ink-black"
                >
                  {item.question}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-mid transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className={`pb-4 text-sm leading-relaxed text-ink-mid transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

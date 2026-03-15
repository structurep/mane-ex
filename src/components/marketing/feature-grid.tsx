import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  title: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3;
  dark?: boolean;
}

export function FeatureGrid({
  title,
  subtitle,
  features,
  columns = 3,
  dark = false,
}: FeatureGridProps) {
  const sectionBg = dark ? "bg-paddock" : "bg-paper-cream";
  const headingColor = dark ? "text-white" : "text-ink-black";
  const subtitleColor = dark ? "text-white/60" : "text-ink-mid";
  const cardBg = dark ? "bg-[var(--paper-surface)]/5" : "bg-[var(--paper-surface)]";
  const cardText = dark ? "text-white/80" : "text-ink-mid";
  const titleColor = dark ? "text-white" : "text-ink-black";
  const iconBg = dark ? "bg-primary/20" : "bg-primary/10";
  const iconColor = dark ? "text-primary" : "text-primary";

  const gridCols =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`${sectionBg} px-4 py-20 md:px-8 md:py-24`}>
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 text-center">
          <h2
            className={`font-serif text-3xl md:text-4xl ${headingColor}`}
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`mt-4 mx-auto max-w-2xl text-lg ${subtitleColor}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`grid gap-6 ${gridCols}`}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`rounded-lg p-6 ${cardBg}`}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3
                  className={`mb-2 font-heading text-base font-semibold ${titleColor}`}
                >
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${cardText}`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

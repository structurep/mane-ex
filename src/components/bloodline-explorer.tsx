"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Award,
  Users,
  TrendingUp,
  Search,
  ExternalLink,
  Info,
  Dna,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Types ─── */

type BloodlineNode = {
  name: string;
  registrationNumber?: string;
  breed?: string;
  color?: string;
  yearOfBirth?: number;
  country?: string;
  notable?: boolean;
  notableReason?: string;
  sire?: BloodlineNode;
  dam?: BloodlineNode;
};

type SiblingResult = {
  id: string;
  slug: string;
  name: string;
  breed: string;
  age: number;
  type: "full" | "half_paternal" | "half_maternal";
  price?: number;
  location: string;
  onPlatform: boolean;
};

type ProgenyRecord = {
  name: string;
  discipline: string;
  level: string;
  highestPlacing: string;
  earnings?: number;
};

/* ─── Sample Data ─── */

const SAMPLE_TREE: BloodlineNode = {
  name: "Midnight Storm",
  registrationNumber: "KWPN-2018-445729",
  breed: "KWPN",
  color: "Dark Bay",
  yearOfBirth: 2018,
  country: "USA",
  sire: {
    name: "Contender",
    registrationNumber: "HOLST-1993-332211",
    breed: "Holsteiner",
    yearOfBirth: 1993,
    country: "GER",
    notable: true,
    notableReason: "Olympic sire — 38 licensed sons, 129 S-class offspring",
    sire: {
      name: "Caletto II",
      registrationNumber: "HOLST-1978-112233",
      breed: "Holsteiner",
      yearOfBirth: 1978,
      country: "GER",
      notable: true,
      notableReason: "Legendary sire line — foundation of modern Holsteiner breeding",
      sire: { name: "Cor de la Bryère" },
      dam: { name: "Dorett" },
    },
    dam: {
      name: "Gofine",
      breed: "Holsteiner",
      yearOfBirth: 1985,
      sire: { name: "Dorado" },
      dam: { name: "Doristhea" },
    },
  },
  dam: {
    name: "Jewel's Promise",
    registrationNumber: "KWPN-2010-398812",
    breed: "KWPN",
    yearOfBirth: 2010,
    country: "NED",
    sire: {
      name: "Jazz",
      registrationNumber: "KWPN-1991-001122",
      breed: "KWPN",
      yearOfBirth: 1991,
      country: "NED",
      notable: true,
      notableReason: "Preferent dressage stallion — 14 Grand Prix offspring",
      sire: { name: "Dorado" },
      dam: { name: "Doristhea" },
    },
    dam: {
      name: "Precious Star",
      breed: "KWPN",
      yearOfBirth: 2004,
      sire: { name: "Ferro" },
      dam: { name: "Karin" },
    },
  },
};

const SAMPLE_SIBLINGS: SiblingResult[] = [
  {
    id: "s1",
    slug: "storm-chaser",
    name: "Storm Chaser",
    breed: "KWPN",
    age: 4,
    type: "full",
    price: 58000,
    location: "Ocala, FL",
    onPlatform: true,
  },
  {
    id: "s2",
    slug: "contenders-legacy",
    name: "Contender's Legacy",
    breed: "Holsteiner",
    age: 6,
    type: "half_paternal",
    price: 72000,
    location: "Wellington, FL",
    onPlatform: true,
  },
  {
    id: "s3",
    slug: "jazz-hands",
    name: "Jazz Hands",
    breed: "KWPN",
    age: 5,
    type: "half_maternal",
    location: "Middleburg, VA",
    onPlatform: false,
  },
];

const SAMPLE_PROGENY: ProgenyRecord[] = [
  { name: "Contago", discipline: "Show Jumping", level: "Grand Prix", highestPlacing: "1st, Nations Cup", earnings: 892000 },
  { name: "Check In", discipline: "Show Jumping", level: "1.60m", highestPlacing: "2nd, CSIO5*", earnings: 456000 },
  { name: "Chianti", discipline: "Dressage", level: "Grand Prix", highestPlacing: "3rd, CDI4*", earnings: 234000 },
];

/* ─── Interactive Pedigree Tree ─── */

function PedigreeTreeNode({
  node,
  depth = 0,
  maxDepth = 4,
}: {
  node: BloodlineNode;
  depth?: number;
  maxDepth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.sire || node.dam;
  const canExpand = hasChildren && depth < maxDepth;

  return (
    <div className={depth > 0 ? "ml-4 border-l border-crease-light pl-4" : ""}>
      <div
        className={`group flex items-start gap-2 rounded-md p-2 transition-colors ${
          canExpand ? "cursor-pointer hover:bg-paper-warm" : ""
        } ${depth === 0 ? "bg-paper-warm" : ""}`}
        onClick={() => canExpand && setExpanded(!expanded)}
      >
        {/* Expand/collapse icon */}
        {canExpand ? (
          expanded ? (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-ink-light" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-light" />
          )
        ) : (
          <div className="mt-0.5 h-4 w-4 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                depth === 0 ? "text-ink-black" : "text-ink-dark"
              } ${node.notable ? "underline decoration-gold decoration-2 underline-offset-2" : ""}`}
            >
              {node.name}
            </span>
            {node.notable && (
              <Award className="h-3.5 w-3.5 shrink-0 text-gold" />
            )}
            {node.country && (
              <span className="text-[10px] text-ink-light">{node.country}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {node.breed && (
              <span className="text-xs text-ink-mid">{node.breed}</span>
            )}
            {node.yearOfBirth && (
              <span className="text-xs text-ink-light">b. {node.yearOfBirth}</span>
            )}
            {node.registrationNumber && (
              <span className="text-[10px] font-mono text-ink-faint">
                {node.registrationNumber}
              </span>
            )}
          </div>

          {node.notable && node.notableReason && (
            <p className="mt-1 text-[11px] text-gold">{node.notableReason}</p>
          )}
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="mt-1 space-y-0.5">
          {node.sire && (
            <div>
              <span className="ml-10 text-[10px] uppercase tracking-wider text-ink-faint">
                Sire
              </span>
              <PedigreeTreeNode
                node={node.sire}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            </div>
          )}
          {node.dam && (
            <div>
              <span className="ml-10 text-[10px] uppercase tracking-wider text-ink-faint">
                Dam
              </span>
              <PedigreeTreeNode
                node={node.dam}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Bloodline Insights Panel ─── */

function BloodlineInsights({ tree }: { tree: BloodlineNode }) {
  const notableAncestors: { name: string; reason: string; generation: number }[] = [];

  function findNotable(node: BloodlineNode, gen: number) {
    if (node.notable && node.notableReason) {
      notableAncestors.push({ name: node.name, reason: node.notableReason, generation: gen });
    }
    if (node.sire) findNotable(node.sire, gen + 1);
    if (node.dam) findNotable(node.dam, gen + 1);
  }
  findNotable(tree, 0);

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <Dna className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Bloodline Insights
        </h3>
      </div>

      {/* Notable ancestors */}
      {notableAncestors.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-ink-dark">Notable Ancestors</p>
          {notableAncestors.map((ancestor, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-md bg-gold/5 p-3"
            >
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-medium text-ink-dark">
                  {ancestor.name}
                  <span className="ml-2 text-xs font-normal text-ink-light">
                    Gen {ancestor.generation}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink-mid">{ancestor.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inbreeding coefficient (mock) */}
      <div className="mt-4 rounded-md bg-paper-warm p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-ink-dark">
              Inbreeding Coefficient
            </span>
            <Info className="h-3 w-3 text-ink-light" />
          </div>
          <span className="text-sm font-bold text-forest">2.1%</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-light">
          Below breed average (4.3%). Low risk of inherited conditions.
        </p>
      </div>

      {/* Breed distribution */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-ink-dark">
          Breed Composition
        </p>
        <div className="flex h-4 overflow-hidden rounded-full">
          <div className="bg-primary/70" style={{ width: "55%" }} />
          <div className="bg-blue" style={{ width: "30%" }} />
          <div className="bg-gold" style={{ width: "15%" }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-ink-light">
          <span>KWPN 55%</span>
          <span>Holsteiner 30%</span>
          <span>Hanoverian 15%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Sibling Finder ─── */

function SiblingFinder({ siblings }: { siblings: SiblingResult[] }) {
  const typeLabels: Record<string, string> = {
    full: "Full Sibling",
    half_paternal: "Half (Sire)",
    half_maternal: "Half (Dam)",
  };

  const typeBadgeClass: Record<string, string> = {
    full: "bg-forest/10 text-forest",
    half_paternal: "bg-blue/10 text-blue",
    half_maternal: "bg-gold/10 text-gold",
  };

  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Related Horses
        </h3>
        <Badge variant="secondary" className="text-xs">
          {siblings.length} found
        </Badge>
      </div>

      <div className="space-y-2">
        {siblings.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-md bg-paper-cream p-3 transition-colors hover:bg-paper-warm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-paper-warm text-xs font-medium text-ink-mid">
                {s.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-dark">
                    {s.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${typeBadgeClass[s.type]}`}
                  >
                    {typeLabels[s.type]}
                  </Badge>
                </div>
                <p className="text-xs text-ink-mid">
                  {s.breed} · {s.age}yo · {s.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {s.price && (
                <span className="text-sm font-serif font-bold text-ink-black">
                  ${s.price.toLocaleString()}
                </span>
              )}
              {s.onPlatform && (
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue">
                  View
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="mt-3 w-full gap-1.5 text-xs">
        <Search className="h-3.5 w-3.5" />
        Search All Related Horses
      </Button>
    </div>
  );
}

/* ─── Sire Progeny Performance ─── */

function ProgenyPerformance({
  sireName,
  progeny,
}: {
  sireName: string;
  progeny: ProgenyRecord[];
}) {
  return (
    <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-forest" />
        <h3 className="font-heading text-base font-semibold text-ink-black">
          Sire Progeny Record
        </h3>
      </div>

      <p className="mb-3 text-sm text-ink-mid">
        Notable offspring of <span className="font-medium text-ink-dark">{sireName}</span>
      </p>

      <div className="overflow-hidden rounded-md border border-crease-light">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-cream text-xs text-ink-light">
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Discipline</th>
              <th className="px-3 py-2 text-left font-medium">Level</th>
              <th className="px-3 py-2 text-right font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {progeny.map((p, i) => (
              <tr key={i} className="border-t border-crease-light">
                <td className="px-3 py-2 font-medium text-ink-dark">{p.name}</td>
                <td className="px-3 py-2 text-ink-mid">{p.discipline}</td>
                <td className="px-3 py-2 text-ink-mid">{p.level}</td>
                <td className="px-3 py-2 text-right font-medium text-forest">
                  {p.earnings ? `$${p.earnings.toLocaleString()}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md bg-paper-warm p-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-light" />
        <p className="text-[11px] text-ink-light">
          Progeny records sourced from competition databases. Earnings are lifetime
          competition earnings in USD and do not reflect sale prices.
        </p>
      </div>
    </div>
  );
}

/* ─── Main Export: Full Bloodline Explorer ─── */

export function BloodlineExplorer({
  horseName,
}: {
  horseName?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Interactive Pedigree Tree */}
      <div className="rounded-lg border-0 bg-paper-white p-6 shadow-flat">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-base font-semibold text-ink-black">
              Interactive Pedigree
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            4 Generations
          </Badge>
        </div>

        <p className="mb-4 text-xs text-ink-mid">
          Click any ancestor to expand their bloodline. Gold-highlighted names
          indicate notable breeding stock.
        </p>

        <PedigreeTreeNode node={SAMPLE_TREE} />
      </div>

      {/* Grid: Insights + Siblings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BloodlineInsights tree={SAMPLE_TREE} />
        <SiblingFinder siblings={SAMPLE_SIBLINGS} />
      </div>

      {/* Progeny Performance */}
      <ProgenyPerformance
        sireName={SAMPLE_TREE.sire?.name || "Unknown Sire"}
        progeny={SAMPLE_PROGENY}
      />
    </div>
  );
}

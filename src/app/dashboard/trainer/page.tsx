"use client";

import Link from "next/link";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ClipboardList,
  Search,
  DollarSign,
  ArrowRight,
  MapPin,
  Building2,
  Dumbbell,
  UserPlus,
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Sample data — no DB tables needed
// ---------------------------------------------------------------------------

const stats = [
  { label: "Active Clients", value: "7", icon: Users },
  { label: "Horses Listed", value: "12", icon: ClipboardList },
  { label: "Pending Matches", value: "3", icon: Search },
  { label: "Revenue This Month", value: "$4,250", icon: DollarSign },
];

const clientActivity = [
  {
    client: "Sarah M.",
    action: "viewed",
    target: "Sapphire Blue",
    time: "12 min ago",
  },
  {
    client: "Jake T.",
    action: "made offer on",
    target: "Thunder Road",
    time: "1h ago",
  },
  {
    client: "Mia R.",
    action: "scheduled trial for",
    target: "Silver Lining",
    time: "3h ago",
  },
  {
    client: "David K.",
    action: "viewed",
    target: "Copper Canyon",
    time: "5h ago",
  },
  {
    client: "Emma L.",
    action: "favorited",
    target: "Midnight Star",
    time: "1d ago",
  },
];

type ClientStatus = "Active" | "Prospect";

interface Client {
  name: string;
  initials: string;
  status: ClientStatus;
  disciplines: string[];
  priceRange: string;
  interestedIn: string[];
  lastActive: string;
}

const clients: Client[] = [
  {
    name: "Sarah Mitchell",
    initials: "SM",
    status: "Active",
    disciplines: ["Dressage", "Hunter/Jumper"],
    priceRange: "$15,000 - $35,000",
    interestedIn: ["Sapphire Blue", "Midnight Star"],
    lastActive: "Today",
  },
  {
    name: "Jake Thompson",
    initials: "JT",
    status: "Active",
    disciplines: ["Reining", "Ranch"],
    priceRange: "$8,000 - $20,000",
    interestedIn: ["Thunder Road"],
    lastActive: "Yesterday",
  },
  {
    name: "Mia Rodriguez",
    initials: "MR",
    status: "Active",
    disciplines: ["Eventing"],
    priceRange: "$25,000 - $50,000",
    interestedIn: ["Silver Lining", "Copper Canyon"],
    lastActive: "2 days ago",
  },
  {
    name: "David Kim",
    initials: "DK",
    status: "Prospect",
    disciplines: ["Trail", "Pleasure"],
    priceRange: "$5,000 - $12,000",
    interestedIn: [],
    lastActive: "3 days ago",
  },
  {
    name: "Emma Lawson",
    initials: "EL",
    status: "Prospect",
    disciplines: ["Dressage"],
    priceRange: "$20,000 - $40,000",
    interestedIn: ["Midnight Star"],
    lastActive: "1 week ago",
  },
];

const statusBadgeVariant: Record<ClientStatus, "default" | "secondary"> = {
  Active: "default",
  Prospect: "secondary",
};

interface IsoPost {
  buyerType: string;
  disciplines: string[];
  priceRange: string;
  location: string;
  matchClient: string;
  matchPercent: number;
  excerpt: string;
}

const isos: IsoPost[] = [
  {
    buyerType: "Amateur",
    disciplines: ["Dressage"],
    priceRange: "$20,000 - $35,000",
    location: "Wellington, FL",
    matchClient: "Sarah M.",
    matchPercent: 92,
    excerpt:
      "Looking for a quiet, schoolmaster-type warmblood. Must be sound for medium-level work.",
  },
  {
    buyerType: "Junior",
    disciplines: ["Hunter/Jumper"],
    priceRange: "$15,000 - $30,000",
    location: "Aiken, SC",
    matchClient: "Sarah M.",
    matchPercent: 78,
    excerpt:
      "Need a safe, experienced jumper for a 14-year-old moving up to 3-foot courses.",
  },
  {
    buyerType: "Professional",
    disciplines: ["Reining"],
    priceRange: "$10,000 - $25,000",
    location: "Scottsdale, AZ",
    matchClient: "Jake T.",
    matchPercent: 85,
    excerpt:
      "Seeking a started prospect with NRHA lineage. Prefer 3-5 year old stallion or gelding.",
  },
  {
    buyerType: "Amateur",
    disciplines: ["Eventing"],
    priceRange: "$30,000 - $60,000",
    location: "Ocala, FL",
    matchClient: "Mia R.",
    matchPercent: 88,
    excerpt:
      "In search of a brave, forward-thinking Thoroughbred or TB cross for Prelim level.",
  },
];

const barnProfile = {
  name: "Willow Creek Equestrian",
  location: "Wellington, FL",
  facilities: [
    "60x120 Indoor Arena",
    "Outdoor Dressage Court",
    "12-Stall Barn",
    "Round Pen",
    "Turnout Paddocks",
    "Wash Rack",
  ],
  disciplines: ["Dressage", "Hunter/Jumper", "Eventing"],
  capacity: "12 stalls (9 occupied)",
  bio: "Full-service training facility specializing in dressage and hunter/jumper programs. Offering lessons, training, sales preparation, and competition management for riders of all levels.",
};

// ---------------------------------------------------------------------------
// Match percent color helper
// ---------------------------------------------------------------------------
function matchColor(pct: number): string {
  if (pct >= 90) return "text-forest";
  if (pct >= 80) return "text-blue";
  return "text-gold";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TrainerPortalPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">Trainer Portal</h1>
        <p className="mt-1 text-sm text-ink-mid">
          Manage clients, match ISOs, and grow your training business.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="isos">ISO Repository</TabsTrigger>
          <TabsTrigger value="barn">Barn Profile</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        {/* Tab 1: Overview                                                  */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="overview">
          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
                >
                  <Icon className="h-5 w-5 text-ink-light" />
                  <p className="mt-3 font-serif text-2xl font-bold text-ink-black">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-mid">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Client activity feed */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-ink-black">
              Client Activity
            </h2>
            <div className="rounded-lg border-0 bg-paper-cream shadow-flat divide-y divide-crease-light">
              {clientActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-warm text-xs font-medium text-ink-mid">
                    {item.client.charAt(0)}
                  </div>
                  <p className="flex-1 text-ink-dark">
                    <span className="font-medium">{item.client}</span>{" "}
                    {item.action}{" "}
                    <span className="font-medium">{item.target}</span>
                  </p>
                  <span className="shrink-0 text-xs text-ink-light">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-ink-black">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/iso">
                  <Search className="mr-2 h-4 w-4" />
                  Browse ISOs
                </Link>
              </Button>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/farm">
                  <Building2 className="mr-2 h-4 w-4" />
                  Update Barn Profile
                </Link>
              </Button>
            </div>
          </section>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Tab 2: Clients                                                   */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="clients">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-mid">
              {clients.length} clients total
            </p>
            <Button size="sm" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <div
                key={client.name}
                className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
              >
                {/* Avatar + name */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-warm text-sm font-semibold text-ink-mid">
                    {client.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-black">
                      {client.name}
                    </p>
                    <p className="text-xs text-ink-light">
                      Active {client.lastActive}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant[client.status]}>
                    {client.status}
                  </Badge>
                </div>

                {/* Preferences */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-medium text-ink-light">
                      Disciplines
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {client.disciplines.map((d) => (
                        <span
                          key={d}
                          className="rounded-full bg-paper-warm px-2 py-0.5 text-xs text-ink-mid"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-ink-light">
                      Price Range
                    </p>
                    <p className="text-ink-dark">{client.priceRange}</p>
                  </div>

                  {client.interestedIn.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-ink-light">
                        Interested In
                      </p>
                      <p className="text-ink-dark">
                        {client.interestedIn.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Tab 3: ISO Repository                                            */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="isos">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-mid">
              ISOs matching your clients&apos; preferences
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/iso">
                Browse All ISOs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {isos.map((iso, i) => (
              <div
                key={i}
                className="rounded-lg border-0 bg-paper-cream p-4 shadow-flat"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Top row: buyer type + disciplines */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{iso.buyerType}</Badge>
                      {iso.disciplines.map((d) => (
                        <span
                          key={d}
                          className="rounded-full bg-paper-warm px-2 py-0.5 text-xs text-ink-mid"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Excerpt */}
                    <p className="mb-2 text-sm text-ink-dark">{iso.excerpt}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-mid">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {iso.priceRange}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {iso.location}
                      </span>
                    </div>
                  </div>

                  {/* Match badge */}
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-xl font-bold ${matchColor(iso.matchPercent)}`}
                    >
                      {iso.matchPercent}%
                    </p>
                    <p className="text-xs text-ink-light">
                      match for {iso.matchClient}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Tab 4: Barn Profile                                              */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="barn">
          <div className="rounded-lg border-0 bg-paper-cream p-6 shadow-flat">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink-black">
                  {barnProfile.name}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-ink-mid">
                  <MapPin className="h-3.5 w-3.5" />
                  {barnProfile.location}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/farm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </div>

            {/* Bio */}
            <p className="mb-6 text-sm leading-relaxed text-ink-dark">
              {barnProfile.bio}
            </p>

            {/* Details grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Facilities */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-black">
                  <Building2 className="h-4 w-4 text-ink-light" />
                  Facilities
                </h3>
                <ul className="space-y-1">
                  {barnProfile.facilities.map((f) => (
                    <li
                      key={f}
                      className="text-sm text-ink-dark before:mr-1.5 before:text-ink-faint before:content-['\2022']"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disciplines */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-black">
                  <Dumbbell className="h-4 w-4 text-ink-light" />
                  Disciplines Offered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {barnProfile.disciplines.map((d) => (
                    <Badge key={d} variant="secondary">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-black">
                  <ClipboardList className="h-4 w-4 text-ink-light" />
                  Capacity
                </h3>
                <p className="text-sm text-ink-dark">{barnProfile.capacity}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

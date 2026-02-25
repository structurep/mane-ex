"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  Eye,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Bell,
  Phone,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types & sample data
// ---------------------------------------------------------------------------

type ScheduleEvent = {
  id: string;
  title: string;
  type: "viewing" | "trial" | "ppe" | "video_call";
  horse: string;
  person: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
};

const sampleEvents: ScheduleEvent[] = [
  { id: "1", title: "Barn Visit", type: "viewing", horse: "Midnight Storm", person: "Jennifer Adams", date: "2025-02-24", time: "10:00 AM", status: "confirmed" },
  { id: "2", title: "Trial Ride", type: "trial", horse: "Golden Promise", person: "Michael Chen", date: "2025-02-24", time: "2:00 PM", status: "pending" },
  { id: "3", title: "Video Tour", type: "video_call", horse: "Sapphire Blue", person: "Sarah Mitchell", date: "2025-02-25", time: "11:00 AM", status: "confirmed" },
  { id: "4", title: "Pre-Purchase Exam", type: "ppe", horse: "Midnight Storm", person: "Dr. Williams", date: "2025-02-26", time: "9:00 AM", status: "confirmed" },
  { id: "5", title: "Second Trial", type: "trial", horse: "Golden Promise", person: "Michael Chen", date: "2025-02-27", time: "3:00 PM", status: "pending" },
  { id: "6", title: "Barn Visit", type: "viewing", horse: "Thunder Road", person: "Emily Davis", date: "2025-02-28", time: "10:30 AM", status: "confirmed" },
  { id: "7", title: "Video Call", type: "video_call", horse: "Silver Lining", person: "Robert Wilson", date: "2025-03-01", time: "4:00 PM", status: "pending" },
];

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const eventTypeConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  viewing: { label: "Viewing", color: "text-blue", bgColor: "bg-blue/10", icon: Eye },
  trial: { label: "Trial Ride", color: "text-gold", bgColor: "bg-gold/10", icon: Calendar },
  ppe: { label: "PPE", color: "text-forest", bgColor: "bg-forest/10", icon: Stethoscope },
  video_call: { label: "Video Call", color: "text-red", bgColor: "bg-red-light", icon: Video },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-forest/10 text-forest" },
  pending: { label: "Pending", className: "bg-gold/10 text-gold" },
  completed: { label: "Completed", className: "bg-ink-light/10 text-ink-mid" },
  cancelled: { label: "Cancelled", className: "bg-red-light text-red" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatSelectedDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type CalendarDay = {
  date: string | null;
  dayNumber: number | null;
  isCurrentMonth: boolean;
  events: ScheduleEvent[];
};

function buildCalendarDays(
  year: number,
  month: number,
  events: ScheduleEvent[],
): CalendarDay[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = toDateStr(prevYear, prevMonth, d);
    days.push({
      date: dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      events: events.filter((e) => e.date === dateStr),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    days.push({
      date: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      events: events.filter((e) => e.date === dateStr),
    });
  }

  // Next month leading days (fill to 42 = 6 rows)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = toDateStr(nextYear, nextMonth, d);
    days.push({
      date: dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      events: events.filter((e) => e.date === dateStr),
    });
  }

  return days;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SchedulePage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Calendar navigation
  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-US",
    { month: "long" },
  );

  const calendarDays = buildCalendarDays(
    currentYear,
    currentMonth,
    sampleEvents,
  );

  const selectedDayEvents = sampleEvents.filter(
    (e) => e.date === selectedDate,
  );

  // Upcoming: events from today onwards, sorted by date then time
  const upcomingEvents = sampleEvents
    .filter((e) => e.date >= todayStr && e.status !== "cancelled")
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-black">Schedule</h1>
          <p className="mt-1 text-sm text-ink-mid">
            Manage viewings, trials, PPEs, and video calls.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* LEFT — Calendar */}
        <div className="rounded-lg border-0 bg-paper-white p-4 shadow-flat">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="rounded-md p-1.5 hover:bg-paper-cream"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="font-medium text-ink-black">
              {monthName} {currentYear}
            </h2>
            <button
              onClick={nextMonth}
              className="rounded-md p-1.5 hover:bg-paper-cream"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="py-1 text-center text-xs font-medium text-ink-light"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const isToday = day.date === todayStr;
              const isSelected = day.date === selectedDate;
              const hasEvents = day.events.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => day.date && setSelectedDate(day.date)}
                  disabled={!day.date}
                  className={`relative flex h-10 items-center justify-center rounded-md text-sm transition-colors ${
                    !day.date
                      ? ""
                      : isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                          ? "bg-primary/20 text-primary font-semibold"
                          : day.isCurrentMonth
                            ? "text-ink-black hover:bg-paper-cream"
                            : "text-ink-light"
                  }`}
                >
                  {day.dayNumber}
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 border-t border-crease-light pt-3">
            {Object.entries(eventTypeConfig).map(([key, cfg]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 text-xs text-ink-mid"
              >
                <span className={`h-2 w-2 rounded-full ${cfg.bgColor}`} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT — Day detail sidebar */}
        <div className="space-y-4">
          {/* Selected date header */}
          <div className="rounded-lg border-0 bg-paper-white p-4 shadow-flat">
            <h3 className="font-medium text-ink-black">
              {formatSelectedDate(selectedDate)}
            </h3>
            <p className="mt-0.5 text-sm text-ink-mid">
              {selectedDayEvents.length} event
              {selectedDayEvents.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Events for selected day */}
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((event) => {
              const config = eventTypeConfig[event.type];
              const status = statusConfig[event.status];
              const Icon = config.icon;
              return (
                <div
                  key={event.id}
                  className="rounded-lg border-0 bg-paper-white p-4 shadow-flat"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-ink-black">
                          {event.title}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${status.className}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-ink-mid">
                        {event.horse}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-ink-light">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                        <span>with {event.person}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border-0 bg-paper-cream py-8 text-center shadow-flat">
              <p className="text-sm text-ink-mid">No events scheduled</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="rounded-lg border-0 bg-paper-white p-4 shadow-flat">
            <h3 className="mb-3 text-sm font-medium text-ink-black">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-mid hover:bg-paper-cream hover:text-ink-black">
                <Bell className="h-4 w-4" />
                Send Reminders
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-mid hover:bg-paper-cream hover:text-ink-black">
                <Video className="h-4 w-4" />
                Schedule Video Tour
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-mid hover:bg-paper-cream hover:text-ink-black">
                <Phone className="h-4 w-4" />
                Request Callback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming section */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-black">Upcoming</h2>
        <div className="space-y-2">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => {
              const config = eventTypeConfig[event.type];
              const status = statusConfig[event.status];
              const Icon = config.icon;
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 rounded-lg border-0 bg-paper-white px-4 py-3 shadow-flat"
                >
                  <span className="w-24 shrink-0 text-sm text-ink-mid">
                    {formatShortDate(event.date)}
                  </span>
                  <span className="w-20 shrink-0 text-sm text-ink-light">
                    {event.time}
                  </span>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.bgColor}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-xs ${config.bgColor} ${config.color}`}
                  >
                    {config.label}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-black">
                    {event.horse}
                  </span>
                  <span className="hidden text-sm text-ink-mid sm:inline">
                    {event.person}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-xs ${status.className}`}
                  >
                    {status.label}
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border-0 bg-paper-cream py-8 text-center shadow-flat">
              <p className="text-sm text-ink-mid">
                No upcoming events scheduled
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const WEEKDAY_LONG = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MONTH_LONG = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d,n){ return new Date(d.getFullYear(), d.getMonth()+n, 1); }
function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function formatMonthHeader(d){ return `${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`; }
function formatSelectedHeader(d){ return `${WEEKDAY_LONG[(d.getDay()+6)%7]} ${d.getDate()} ${MONTH_LONG[d.getMonth()]}`; }
function ymd(d){
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function hhmm(d){
  const h=String(d.getHours()).padStart(2,"0");
  const m=String(d.getMinutes()).padStart(2,"0");
  return `${h}:${m}`;
}

export default function AvailabilityBoard({
                                            studioId,
                                            defaultTimezone = "Europe/Athens",
                                            embedded = false,
                                          }) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [viewDate, setViewDate] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timezone, setTimezone] = useState(defaultTimezone);

  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  // allow other components (e.g., form) to trigger a refresh (after HOLD/booking)
  useEffect(() => {
    function onReload(){ setReloadTick(t => t + 1); }
    window.addEventListener("booking:reload", onReload);
    return () => window.removeEventListener("booking:reload", onReload);
  }, []);

  // Build calendar grid (6 weeks)
  const days = useMemo(() => {
    const first = startOfMonth(viewDate);
    const firstWeekday = (first.getDay() + 6) % 7; // Mon=0
    const start = new Date(first);
    start.setDate(first.getDate() - firstWeekday);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewDate]);

  const monthLabel = formatMonthHeader(viewDate);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!studioId) return;
      setLoading(true);
      setError("");
      setSelectedSlot(null);

      try {
        const res = await fetch("/api/studios/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studioId,
            day: ymd(selected),
            timezone,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;

        // Map to UI slots
        const uiSlots = (data.slots || []).map(s => {
          const sDate = new Date(s.start);
          const eDate = new Date(s.end);
          return {
            startISO: s.start,
            endISO: s.end,
            label: hhmm(sDate),
            endLabel: hhmm(eDate),
          };
        });
        
        // If the selected day is "today", hide any slot whose start is <= now
        let filtered = uiSlots;
        if (sameDay(selected, today)) {
          const now = new Date(); // epoch ms; safe to compare with ISO (which carries its offset)
          filtered = uiSlots.filter(s => new Date(s.startISO).getTime() > now.getTime());
        }

        setTimezone(data.timezone || timezone);
        setSlots(filtered);
      } catch (e) {
        if (!cancelled) {
          setError(String(e.message || e));
          setSlots([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [studioId, selected, timezone, reloadTick]);

  const Card = (
    <div className="rounded-xl bg-[#111315] border border-white/10 p-4 shadow-sm w-full h-full text-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,28%)_minmax(0,72%)] gap-8 h-full">
        {/* LEFT: Calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              aria-label="Previous month"
              onClick={() => setViewDate(addMonths(viewDate, -1))}
              className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-gray-300"
            >
              <ChevronLeft className="h-4 w-4"/>
            </button>
            <div className="text-base font-medium text-gray-100">{monthLabel}</div>
            <button
              aria-label="Next month"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-gray-300"
            >
              <ChevronRight className="h-4 w-4"/>
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-400 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="h-7 flex items-center justify-center">
                {w[0]}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {days.map((d, idx) => {
              const isCurrentMonth = d.getMonth() === viewDate.getMonth();
              const isToday = sameDay(d, today);
              const isSelected = sameDay(d, selected);
              const isPast = d < todayStart;

              return (
                <button
                  key={idx}
                  onClick={() => !isPast && setSelected(d)}
                  aria-disabled={isPast}
                  className={[
                    "h-8 rounded-lg flex items-center justify-center text-sm transition border",
                    isPast
                      ? "text-gray-600 bg-[#0e0f11] border-white/5 cursor-not-allowed"
                      : (isSelected
                        ? "bg-[#1C86D1] text-white font-semibold shadow-sm border-[#1C86D1]"
                        : (isToday
                          ? "ring-1 ring-[#1C86D1] text-[#93c8f0] bg-white/5 border-transparent"
                          : "text-gray-200 hover:bg:white/5 hover:bg-white/5 cursor-pointer border-transparent")),
                    isCurrentMonth ? "" : "text-gray-500 opacity-70"
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time zone */}
          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-1">Time zone</div>
            <div className="inline-flex items-center rounded-md bg-[#0f1113] border border-white/10 px-3 py-2 text-sm text-gray-200 select-none">
              {timezone}
            </div>
          </div>
        </div>

        {/* RIGHT: Slots */}
        <div className="flex flex-col">
          <div className="text-gray-300 text-sm mb-3">
            {formatSelectedHeader(selected)}
          </div>

          {/* Loading / Error / Empty / Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-sm text-red-300 bg-red-900/20 border border-red-800/40 rounded-lg p-3">
              Αποτυχία φόρτωσης διαθεσιμότητας: {error}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-sm text-gray-400 border border-white/10 rounded-lg p-3">
              Δεν υπάρχουν διαθέσιμα ραντεβού για αυτήν την ημέρα.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {slots.map((s, i) => {
                const isSel = selectedSlot?.startISO === s.startISO;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedSlot(s);
                      try {
                        const detail = {
                          day: ymd(selected),
                          time: s.label,
                          startISO: s.startISO,
                          endISO: s.endISO,
                          timezone,
                        };
                        window.dispatchEvent(new CustomEvent("booking:slot", { detail }));
                      } catch (_) {}
                    }}
                    className={[
                      "w-full rounded-lg h-12 flex items-center justify-center text-base font-medium transition cursor-pointer border",
                      isSel
                        ? "bg-[#1C86D1] border-[#1C86D1] text-white shadow-sm"
                        : "bg-[#0f1113] border-white/10 text-gray-100 hover:bg-white/5"
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) return Card;

  return (
    <div className="w-full text-gray-200">
      <div className="mx-auto px-4 py-8">{Card}</div>
    </div>
  );
}

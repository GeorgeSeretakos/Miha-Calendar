"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LocationSearch from "../../components/book/LocationForm"; // or HeroLocationSearch
import StudioCard from "../../components/book/StudioCard";
import FooterInfoStrip from "../../components/FooterInfoStrip";
import { studios as MOCK_STUDIOS } from "../../../../public/data/studios";

// Haversine distance (meters)
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ResultsPage() {
  const [locale, setLocale] = useState("el");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    if (saved) setLocale(saved);
  }, []);

  // Filters
  const [mode, setMode] = useState("manual"); // 'manual' | 'near'
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);

  // Suggestions (optional)
  const [suggestions, setSuggestions] = useState([]);

  // Detect when left list reaches bottom to reveal full-width footer
  const scrollRef = useRef(null);
  const [showFooter, setShowFooter] = useState(false);

  const handleLeftScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setShowFooter(atBottom);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleLeftScroll, { passive: true });
    handleLeftScroll();
    return () => el.removeEventListener("scroll", handleLeftScroll);
  }, [handleLeftScroll]);

  // Filtered studios
  const filteredStudios = useMemo(() => {
    let arr = [...MOCK_STUDIOS];
    if (mode === "manual" && query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
        )
        .map((s) => ({ ...s, distance: undefined }));
    } else if (mode === "near" && coords) {
      arr = arr
        .map((s) => ({
          ...s,
          distance: distanceMeters(coords.latitude, coords.longitude, s.lat, s.lng),
        }))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      arr = arr.map((s) => ({ ...s, distance: undefined }));
    }
    return arr;
  }, [mode, query, coords]);

  // Filter handlers
  const onFilterSearch = useCallback((payload) => {
    if (payload?.mode === "near" && payload?.coords) {
      setMode("near");
      setCoords(payload.coords);
      setQuery("");
    } else {
      setMode("manual");
      setCoords(null);
      setQuery(payload?.query ?? "");
    }
  }, []);

  const onQueryChange = useCallback((text) => {
    if (!text) return setSuggestions([]);
    const lower = text.toLowerCase();
    const uniq = new Map();
    for (const s of MOCK_STUDIOS) {
      if (s.address.toLowerCase().includes(lower)) uniq.set(s.address, { primary: s.address });
      if (s.name.toLowerCase().includes(lower)) uniq.set(s.name, { primary: s.name });
      if (uniq.size >= 8) break;
    }
    setSuggestions(Array.from(uniq.values()));
  }, []);

  return (
    <>
      {/* MAIN GRID: two columns, full height; absolutely no x-scroll */}
      <main className="grid grid-cols-2 w-full h-screen overflow-x-hidden">
        {/* LEFT: Filters + Results (both inside the same scrollable container; search is NOT sticky) */}
        <section className="h-screen flex flex-col border-r border-gray-200 bg-gray-50">
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto px-4 py-4 left-scroll"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {/* Search/filter at top of the scrollable list (will scroll away) */}
            <div className="mb-4">
              <LocationSearch
                locale={locale}
                onSearch={onFilterSearch}
                onQueryChange={onQueryChange}
                suggestions={suggestions}
                initialQuery={query}
              />
            </div>

            {/* Results grid: 2 per row */}
            <div className="grid grid-cols-2 gap-4">
              {filteredStudios.map((s) => (
                <StudioCard key={s.id} studio={s} locale={locale} />
              ))}
            </div>

            {/* Spacer to ensure reaching bottom feels natural */}
            <div className="h-6" />
          </div>
        </section>

        {/* RIGHT: Map column (fills height, no overflow x) */}
        <section className="relative h-screen bg-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-[url('/images/general/map-placeholder.png')] bg-cover bg-center opacity-30" />
              {filteredStudios.map((s, idx) => (
                <div
                  key={s.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: `${20 + (idx * 70) / Math.max(filteredStudios.length, 1)}%`,
                    left: `${30 + (idx * 50) / Math.max(filteredStudios.length, 1)}%`,
                  }}
                  title={s.name}
                >
                  <div className="w-4 h-4 rounded-full bg-[#1C86D1] border-2 border-white shadow" />
                </div>
              ))}
            </div>
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-md shadow px-3 py-2 text-sm">
              {locale === "en" ? "Studios Map" : "Χάρτης Studios"}
            </div>
          </div>
        </section>
      </main>

      {/* FULL-WIDTH FOOTER: appears only when left column bottom is reached */}
      {showFooter && <FooterInfoStrip locale={locale} />}

      {/* Hide WebKit scrollbar ONLY for the left results scroller + kill x-axis scroll app-wide */}
      <style jsx global>{`
        html, body {
          overflow-x: hidden; /* hard stop on horizontal scroll */
          width: 100%;
        }
        .left-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

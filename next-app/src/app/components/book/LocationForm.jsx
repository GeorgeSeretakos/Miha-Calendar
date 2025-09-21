"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Centered hero search:
 *  - Title on top (dark gray)
 *  - "Where?" combobox + Search button (stack on mobile, inline on ≥sm)
 *  - Description below (dark gray)
 *
 * Props:
 *  - locale: "el" | "en"
 *  - onSearch: (payload) => void
 *      payload: { mode:"manual", query:string } | { mode:"near", coords? , error? }
 *  - onQueryChange?: (q:string) => void    // use to fetch suggestions
 *  - suggestions?: Array<{ id?: string|number, primary:string, secondary?:string }>
 */
export default function HeroLocationSearch({
                                             locale = "el",
                                             onSearch,
                                             onQueryChange,
                                             suggestions = [],
                                           }) {
  const t = locale === "en"
    ? {
      title: "Book your first EMS session — fast and easy.",
      where: "Where?",
      addressPh: "Address",
      near: "Near Me",
      search: "Search",
      desc: "Type an area or choose “Near Me” for automatic detection.",
    }
    : {
      title: "Κλείσε τώρα την 1η σου προπόνηση EMS — εύκολα και γρήγορα.",
      where: "Που;",
      addressPh: "Διεύθυνση",
      near: "Κοντά μου",
      search: "Αναζήτηση",
      desc: "Πληκτρολόγησε περιοχή ή επίλεξε «Κοντά μου» για αυτόματο εντοπισμό.",
    };

  const primaryBlue = "#1C86D1";

  // Combobox state
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState(""); // what shows in collapsed field
  const [mode, setMode] = useState("manual"); // 'manual' | 'near'

  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside/Esc
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Focus inner address field on open
  useLayoutEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Actions
  const handleNearMePick = () => {
    setMode("near");
    setDisplayValue(t.near);
    setOpen(false);
  };

  const handleSuggestionPick = (text) => {
    setMode("manual");
    setDisplayValue(text);
    setQuery(text);
    setOpen(false);
  };

  const handleSearch = () => {
    if (mode === "near") {
      if (!navigator.geolocation) {
        onSearch?.({ mode: "near", error: "Geolocation not supported" });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          onSearch?.({
            mode: "near",
            coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          }),
        (err) => onSearch?.({ mode: "near", error: err?.message || "Geolocation failed" }),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      const q = (displayValue || query).trim();
      onSearch?.({ mode: "manual", query: q });
    }
  };

  return (
    <section className="w-full flex items-center justify-center px-4 mx-auto py-8 border-b-1">
      <div className="w-full max-w-4xl">
        {/* Title (darker grayscale) */}
        <h3 className="text-center text-gray-800 mb-4">
          {t.title}
        </h3>

        {/* Search row (stack on mobile, inline on ≥sm) */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 justify-center max-w-xl mx-auto">
          {/* Combobox (matches your screenshots) */}
          <div ref={boxRef} className="relative w-full sm:max-w-2xl">
            {/* Collapsed field */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="w-full h-12 rounded-xl border px-5 text-sm text-left bg-white focus:outline-none"
              style={{
                borderColor: "#E5E7EB",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`truncate ${displayValue ? "text-gray-900" : "text-gray-400"}`}>
                  {displayValue || t.where}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 shrink-0"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown panel */}
            {open && (
              <div
                className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow-md overflow-hidden"
                style={{ borderColor: "#E5E7EB" }}
                role="listbox"
              >
                {/* Address input — placeholder only, no label */}
                <div className="p-3 pb-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setMode("manual");
                      setQuery(e.target.value);
                      setDisplayValue(e.target.value);
                      onQueryChange?.(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setOpen(false);
                      }
                    }}
                    placeholder={t.addressPh}
                    className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                    style={{
                      borderColor: "#E0E7FF", // subtle violet border
                      boxShadow: "0 0 0 2px rgba(109, 114, 255, 0.25)", // soft focus glow
                      outline: "none",
                    }}
                  />
                </div>

                {/* Near Me row — immediately after input, no extra spacing */}
                <button
                  type="button"
                  onClick={handleNearMePick}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm bg-white hover:bg-gray-50"
                  title={t.near}
                >
                  {/* navigation icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <path
                      d="M21 3L3 10.5l7.5 3L14 21 21 3z"
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-gray-900">{t.near}</span>
                </button>

                {/* Results list — directly below Near Me */}
                {Array.isArray(suggestions) && suggestions.length > 0 && (
                  <ul className="max-h-72 overflow-auto">
                    {suggestions.map((s, i) => (
                      <li key={s.id ?? i}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionPick(s.primary)}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 text-left"
                        >
                          {/* pin icon */}
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0"
                          >
                            <path
                              d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                              stroke="#111827"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="11"
                              r="2.5"
                              stroke="#111827"
                              strokeWidth="2"
                            />
                          </svg>
                          <span className="text-gray-900">
                            {s.primary}
                            {s.secondary ? (
                              <span className="ml-2 text-gray-400">{s.secondary}</span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Search button (unchanged style) — full width on mobile, auto on ≥sm */}
          <button
            type="button"
            onClick={handleSearch}
            className="h-12 px-6 rounded-xl hover:cursor-pointer font-semibold text-white whitespace-nowrap flex items-center gap-2 border-2 w-full sm:w-auto justify-center"
            style={{ backgroundColor: primaryBlue, borderColor: "white" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t.search}
          </button>
        </div>

        {/* Description (darker grayscale) */}
        <p className="mt-3 text-center text-sm text-gray-700">
          {t.desc}
        </p>
      </div>
    </section>
  );
}

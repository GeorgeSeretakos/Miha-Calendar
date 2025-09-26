"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@lib/loadGoogleMaps";

/**
 * HeroLocationSearch with Google Places Autocomplete (custom dropdown)
 *
 * Emits:
 *  - onSearch({ mode:"near", coords?, error? })
 *  - onSearch({ mode:"manual", coords: { latitude, longitude }, address })
 *  - onSearch({ mode:"manual", query })  // when user types but doesn't pick suggestion
 */
export default function HeroLocationSearch({ onSearch }) {
  const t = {
    title: "Κλείσε τώρα την 1η σου προπόνηση EMS — εύκολα και γρήγορα.",
    where: "Πού;",
    addressPh: "Διεύθυνση",
    near: "Κοντά μου",
    search: "Αναζήτηση",
    desc: "Πληκτρολόγησε περιοχή ή επίλεξε «Κοντά μου» για αυτόματο εντοπισμό.",
    locating: "Εντοπισμός…",
    geoNotSupported: "Η συσκευή δεν υποστηρίζει εντοπισμό τοποθεσίας.",
    geoFailed: "Αποτυχία εντοπισμού τοποθεσίας.",
  };

  const primaryBlue = "#1C86D1";

  // Combobox state
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState(""); // shows in collapsed field
  const [mode, setMode] = useState("manual"); // 'manual' | 'near'
  const [nearLoading, setNearLoading] = useState(false); // NEW: show spinner/state while locating

  // Google Places state
  const [ready, setReady] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const gAutocomplete = useRef(null);
  const gPlaces = useRef(null);
  const gSession = useRef(null);
  const debounceT = useRef(null);

  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadGoogleMaps();
      if (cancelled) return;

      gAutocomplete.current = new google.maps.places.AutocompleteService();
      gPlaces.current = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      gSession.current = new google.maps.places.AutocompleteSessionToken();
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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

  // Fetch predictions (debounced)
  useEffect(() => {
    if (!ready || !gAutocomplete.current) return;
    if (!open) return;

    if (debounceT.current) clearTimeout(debounceT.current);
    debounceT.current = setTimeout(() => {
      const q = query.trim();
      if (!q) {
        setPredictions([]);
        return;
      }

      gAutocomplete.current.getPlacePredictions(
        {
          input: q,
          componentRestrictions: { country: "gr" },
          types: ["geocode"],
          sessionToken: gSession.current,
        },
        (res, status) => {
          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !res
          ) {
            setPredictions([]);
            return;
          }
          const items = res.map((p) => ({
            id: p.place_id,
            place_id: p.place_id,
            primary: p.structured_formatting?.main_text || p.description,
            secondary: p.structured_formatting?.secondary_text || "",
            description: p.description,
          }));
          setPredictions(items);
        }
      );
    }, 250);

    return () => {
      if (debounceT.current) clearTimeout(debounceT.current);
    };
  }, [ready, open, query]);

  // Helpers
  const resolvePlaceIdToCoords = (place_id) =>
    new Promise((resolve, reject) => {
      if (!gPlaces.current)
        return reject(new Error("PlacesService not ready"));
      gPlaces.current.getDetails(
        {
          placeId: place_id,
          fields: ["geometry", "formatted_address"],
          sessionToken: gSession.current,
        },
        (place, status) => {
          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !place ||
            !place.geometry
          ) {
            return reject(
              new Error("Δεν βρέθηκαν συντεταγμένες για αυτή τη διεύθυνση.")
            );
          }
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          resolve({
            coords: { latitude: lat, longitude: lng },
            address: place.formatted_address,
          });
        }
      );
    });

  // Actions

  // UPDATED: auto-trigger search on "Κοντά μου"
  const handleNearMePick = () => {
    setMode("near");
    setDisplayValue(t.near);
    setOpen(false);

    if (!navigator.geolocation) {
      onSearch?.({ mode: "near", error: t.geoNotSupported });
      return;
    }

    setNearLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearLoading(false);
        const { latitude, longitude } = pos.coords || {};
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          onSearch?.({ mode: "near", coords: { latitude, longitude } });
        } else {
          onSearch?.({ mode: "near", error: t.geoFailed });
        }
      },
      (err) => {
        setNearLoading(false);
        onSearch?.({
          mode: "near",
          error: err?.message || t.geoFailed,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSuggestionPick = async (item) => {
    try {
      setMode("manual");
      setDisplayValue(item.description || item.primary);
      setQuery(item.description || item.primary);
      setOpen(false);

      const { coords, address } = await resolvePlaceIdToCoords(item.place_id);
      gSession.current = new google.maps.places.AutocompleteSessionToken();
      onSearch?.({ mode: "manual", coords, address });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSearch = async () => {
    if (mode === "near") {
      // If user presses the main button while "near" is selected,
      // we re-attempt geolocation (useful if they denied first time).
      if (!navigator.geolocation) {
        onSearch?.({ mode: "near", error: t.geoNotSupported });
        return;
      }
      setNearLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNearLoading(false);
          onSearch?.({
            mode: "near",
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
          });
        },
        (err) => {
          setNearLoading(false);
          onSearch?.({
            mode: "near",
            error: err?.message || t.geoFailed,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return;
    }

    const q = (displayValue || query).trim();
    if (!q) return;

    const top = predictions[0];
    if (top?.place_id) {
      try {
        const { coords, address } = await resolvePlaceIdToCoords(top.place_id);
        gSession.current = new google.maps.places.AutocompleteSessionToken();
        onSearch?.({ mode: "manual", coords, address });
        return;
      } catch (e) {
        console.warn(e);
      }
    }

    onSearch?.({ mode: "manual", query: q });
  };

  return (
    <section className="w-full flex items-center justify-center px-4 mx-auto py-8">
      <div className="w-full max-w-4xl">
        <h3 className="text-center text-gray-800 mb-4">{t.title}</h3>

        {/* Search row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 justify-center max-w-xl mx-auto">
          {/* Combobox */}
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
                <span
                  className={`truncate ${
                    displayValue ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {displayValue || t.where}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
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
                {/* Address input */}
                <div className="p-3 pb-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setMode("manual");
                      setQuery(e.target.value);
                      setDisplayValue(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setOpen(false);
                        handleSearch();
                      }
                    }}
                    placeholder={t.addressPh}
                    className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                    style={{
                      borderColor: "#E0E7FF",
                      boxShadow: "0 0 0 2px rgba(109, 114, 255, 0.25)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Near Me */}
                <button
                  type="button"
                  onClick={handleNearMePick}
                  disabled={nearLoading}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm bg-white hover:bg-gray-50 disabled:opacity-60"
                  title={t.near}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
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
                  <span className="text-gray-900">
                    {nearLoading ? t.locating : t.near}
                  </span>
                </button>

                {/* Predictions */}
                {Array.isArray(predictions) && predictions.length > 0 && (
                  <ul className="max-h-72 overflow-auto">
                    {predictions.map((s, i) => (
                      <li key={s.id ?? i}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionPick(s)}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 text-left"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
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
                              <span className="ml-2 text-gray-400">
                                {s.secondary}
                              </span>
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

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={nearLoading}
            className="h-12 px-6 rounded-xl hover:cursor-pointer font-semibold text-white whitespace-nowrap flex items-center gap-2 border-2 w-full sm:w-auto justify-center disabled:opacity-60"
            style={{ backgroundColor: primaryBlue, borderColor: "white" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
            >
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {t.search}
          </button>
        </div>

        {/* Description */}
        <p className="mt-3 text-center text-sm text-gray-700">{t.desc}</p>
      </div>
    </section>
  );
}

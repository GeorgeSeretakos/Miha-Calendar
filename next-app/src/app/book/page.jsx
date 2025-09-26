"use client";

import { useEffect, useMemo, useState } from "react";
import BookLandingLayout from "./_layouts/BookLandingLayout";
import ResultsLayout from "./_layouts/ResultsLayout";
import { fetchNearby } from "@lib/fetchNearby";

export default function BookPage() {
  // Search state
  // "idle" | "near" | "manual"
  const [mode, setMode] = useState("idle");
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [address, setAddress] = useState(""); // optional, for display

  // Results state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remoteStudios, setRemoteStudios] = useState([]);
  const [radiusKm, setRadiusKm] = useState(null);

  // Has “input” => show Results layout
  const hasInput = (mode === "near" || mode === "manual") && !!coords;

  // Run nearby search when we have coords + valid mode
  useEffect(() => {
    async function run() {
      if (!hasInput) return;
      setLoading(true);
      setError(null);
      try {
        const radiusFromEnv = Number.parseFloat(process.env.NEXT_PUBLIC_SEARCH_RADIUS_KM ?? "");
        const res = await fetchNearby({
          lat: coords.latitude,
          lng: coords.longitude,
          limit: 50,
          radiusKm: Number.isFinite(radiusFromEnv) ? radiusFromEnv : undefined,
        });

        const items = Array.isArray(res) ? res : res?.items || [];
        const usedRadiusKm = Array.isArray(res) ? null : res?.radiusKm || null;
        if (usedRadiusKm != null) setRadiusKm(usedRadiusKm);

        const normalized = items
          .map((r) => ({
            ...r,
            lat: Number.isFinite(r.lat) ? r.lat : r.latitude,
            lng: Number.isFinite(r.lng) ? r.lng : r.longitude,
            distance: typeof r.distance_km === "number" ? r.distance_km * 1000 : r.distance,
            sway_distance: typeof r.sway_distance_km === "number" ? r.sway_distance_km * 1000 : r.sway_distance,
          }))
          .sort((a, b) => {
            const da = Number.isFinite(a.distance) ? a.distance : Infinity;
            const db = Number.isFinite(b.distance) ? b.distance : Infinity;
            return da - db;
          });

        setRemoteStudios(normalized);
      } catch (e) {
        setError(e?.message || "Αποτυχία αναζήτησης κοντινών studios.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [hasInput, coords, mode]);

  // Handler passed to both Location forms (Landing + Results)
  const handleSearch = (next) => {
    if (next?.mode) setMode(next.mode);

    if (next?.coords) {
      setCoords(next.coords); // triggers fetch
    } else if (next?.query) {
      // Optional: you could geocode here to set coords; for now we clear.
      setCoords(null);
    }

    if (typeof next?.address === "string") {
      setAddress(next.address);
    } else if (next?.query) {
      setAddress(next.query);
    } else {
      setAddress("");
    }

    // Reset state on each new intent
    setRemoteStudios([]);
    setRadiusKm(null);
    setError(next?.error ?? null);
  };

  const studiosToRender = useMemo(() => remoteStudios, [remoteStudios]);

  // “Reset” to go back to the landing layout
  const handleReset = () => {
    setMode("idle");
    setCoords(null);
    setAddress("");
    setRemoteStudios([]);
    setRadiusKm(null);
    setError(null);
  };

  return hasInput ? (
    <ResultsLayout
      mode={mode}
      coords={coords}
      address={address}
      loading={loading}
      error={error}
      studios={studiosToRender}
      radiusKm={radiusKm || 0}
      onSearch={handleSearch}
      onReset={handleReset}
    />
  ) : (
    <BookLandingLayout onSearch={handleSearch} />
  );
}

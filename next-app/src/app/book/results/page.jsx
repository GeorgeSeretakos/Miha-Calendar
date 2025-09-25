"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import LocationSearch from "@components/book/LocationForm";
import StudioCard from "@components/book/StudioCard";
import FooterInfoStrip from "@components/FooterInfoStrip";
import { fetchNearby } from "@lib/fetchNearby";

// Avoid SSR for the Maps component
const ResultsMap = dynamic(() => import("@components/map/ResultsMap"), { ssr: false });

export default function ResultsPage() {
  // Mode can later be set from LocationSearch (e.g., "near" | "manual")
  const [mode, setMode] = useState("near");
  const [coords, setCoords] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remoteStudios, setRemoteStudios] = useState([]);
  const [radiusKm, setRadiusKm] = useState(null);

  // Example: use browser geolocation when user selects "near me"
  useEffect(() => {
    if (mode === "near" && !coords && typeof navigator !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => setError("Δεν μπόρεσα να βρω την τοποθεσία σου."),
        { enableHighAccuracy: true }
      );
    }
  }, [mode, coords]);

  useEffect(() => {
    async function run() {
      if (mode !== "near" || !coords) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchNearby({
          lat: coords.latitude,
          lng: coords.longitude,
          limit: 50,
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
            sway_distance:
              typeof r.sway_distance_km === "number"
                ? r.sway_distance_km * 1000
                : r.sway_distance,
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
  }, [mode, coords]);

  const studiosToRender = useMemo(() => remoteStudios, [remoteStudios]);
  const mapCenter = coords ? { lat: coords.latitude, lng: coords.longitude } : null;

  return (
    <>
      <main className="min-h-screen w-full overflow-x-hidden flex flex-col">
        {/* Map */}
        <section className="relative w-full h-[60vh] bg-white overflow-hidden">
          {mapCenter ? (
            <ResultsMap
              center={mapCenter}
              studios={studiosToRender}
              radiusKm={radiusKm || 0}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-600">
              Φόρτωση χάρτη…
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-md shadow px-3 py-2 text-sm">
            Χάρτης Studios
          </div>
        </section>

        {/* Controls */}
        <section className="w-full border-b border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <LocationSearch
              onSearch={(next) => {
                // Example: update mode/coords when user searches manually
                if (next?.mode) setMode(next.mode);
                if (next?.coords) setCoords(next.coords);
              }}
            />
          </div>
        </section>

        {/* Results list */}
        <section className="w-full flex-1 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            {loading && (
              <p className="px-2 py-2 text-sm text-gray-600">
                Φόρτωση κοντινών studios…
              </p>
            )}
            {error && <p className="px-2 py-2 text-sm text-red-600">{error}</p>}

            {!loading && studiosToRender.length === 0 ? (
              <div className="px-2 py-8 text-sm text-gray-600">
                Δεν βρέθηκαν studios κοντά σε αυτή την τοποθεσία.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {studiosToRender.map((s) => {
                  const href = s?.slug ? `/book/studio/${s.slug}` : undefined;
                  return (
                    <div key={s.id ?? `${s.lat}-${s.lng}`}>
                      {href ? (
                        <Link href={href} className="block group">
                          <StudioCard studio={s} />
                        </Link>
                      ) : (
                        <StudioCard studio={s} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <FooterInfoStrip />
      <style jsx global>{`
        html,
        body {
          overflow-x: hidden;
          width: 100%;
        }
      `}</style>
    </>
  );
}

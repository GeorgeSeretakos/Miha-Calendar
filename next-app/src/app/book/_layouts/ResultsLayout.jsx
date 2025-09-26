"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import HeroLocationSearch from "../../components/book/LocationForm";
import StudioCard from "../../components/book/StudioCard";
import FooterInfoStrip from "../../components/FooterInfoStrip";

const ResultsMap = dynamic(() => import("../../components/map/ResultsMap"), { ssr: false });
const GREECE_LABEL = "Χάρτης Ελλάδας";

export default function ResultsLayout({
                                        mode,
                                        coords,
                                        address,
                                        loading,
                                        error,
                                        studios,
                                        radiusKm = 0,
                                        onSearch,
                                        onReset,
                                      }) {
  const mapActive = Boolean(coords);

  return (
    <>
      <main className="min-h-screen w-full overflow-x-hidden flex flex-col">
        {/* Map / Static Image */}
        <section className="relative w-full h-[65vh] bg-white overflow-hidden">
          {mapActive ? (
            <ResultsMap
              active={true}
              center={{ lat: coords.latitude, lng: coords.longitude }}
              studios={studios}
              radiusKm={radiusKm}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full relative">
              <img
                src="/images/general/map.png"
                alt={GREECE_LABEL}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}

          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-md shadow px-3 py-2 text-sm">
            EMS Studios
          </div>
        </section>

        {/* Controls */}
        <section className="w-full border-b border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <HeroLocationSearch onSearch={onSearch} />
          </div>
        </section>

        {/* Results list */}
        <section className="w-full flex-1 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            {loading && <p className="px-2 py-2 text-sm text-gray-600">Φόρτωση κοντινών studios…</p>}
            {error && <p className="px-2 py-2 text-sm text-red-600">{error}</p>}

            {!loading && mode !== "idle" && studios.length === 0 && coords ? (
              <p className="px-2 py-8 font-semibold text-gray-600 text-center">
                Δεν βρέθηκαν studios κοντά σε αυτή την τοποθεσία{address ? ` (${address})` : ""}.
              </p>
            ) : null}

            {!loading && studios.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {studios.map((s) => {
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

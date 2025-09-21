"use client";

import { useEffect, useMemo, useState } from "react";
import IntroSection from "../../../components/IntroSection";
import FooterInfoStrip from "../../../components/FooterInfoStrip";
import TestimonialsCarousel from "../../../components/book/TestimonialsCarousel"; // your existing carousel
import StudioInfoCards from "../../../components/book/StudioInfoCards";
import OfficePreview from "../../../components/book/OfficePreview";
import { studios as ALL_STUDIOS } from "../../../../../public/data/studios";
import testimonials from "../../../../../public/data/testimonials";

export default function StudioSlugPage({ params }) {
  const { slug } = params || {};
  const [locale, setLocale] = useState("el");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    if (saved) setLocale(saved);
  }, []);

  const studio = useMemo(() => {
    if (!slug) return null;
    return ALL_STUDIOS.find((s) => s.slug === slug) || null;
  }, [slug]);

  // If later you want studio-specific testimonials:
  // const studioTestimonials = testimonialsAll.filter(t => t.studioSlug === slug);

  if (!studio) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <h1 className="text-2xl font-semibold text-gray-800">
            {locale === "en" ? "Studio not found" : "Το studio δεν βρέθηκε"}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === "en"
              ? "Please check the URL or choose another studio."
              : "Έλεγξε το URL ή επίλεξε κάποιο άλλο studio."}
          </p>
        </div>
      </main>
    );
  }

  const mapSrc =
    studio.mapEmbed ||
    (studio.lat && studio.lng
      ? `https://www.google.com/maps?q=${studio.lat},${studio.lng}&hl=${locale === "en" ? "en" : "el"}&z=15&output=embed`
      : "");

  return (
    <main className="flex flex-col">
      {/* Intro with main photo */}
      <IntroSection
        image={studio.image}
        title={<span className="block text-3xl sm:text-5xl leading-tight">{studio.name}</span>}
        paragraph={<div className="max-w-3xl mx-auto text-gray-700">{studio.address}</div>}
      />

      {/* Contact + Hours cards */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StudioInfoCards
              locale={locale}
              address={studio.address}
              email={studio.email}
              phones={studio.phones}
              socials={studio.socials}
              hours={studio.hours}
            />
          </div>
        </div>
      </section>

      {/* Office preview (6 photos, no CTA) */}
      <OfficePreview
        locale={locale}
        images={
          Array.isArray(studio.gallery) && studio.gallery.length > 0
            ? studio.gallery.slice(0, 6)
            : []
        }
      />

      {/* Testimonials (generic; wire per-studio later if desired) */}
      <section className="py-10">
        <TestimonialsCarousel />
      </section>

      {/* Full width map */}
      {mapSrc && (
        <section className="w-full">
          <div className="w-full">
            <iframe
              src={mapSrc}
              className="rounded-none md:rounded-lg w-full"
              height="420"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={studio.name}
            />
          </div>
        </section>
      )}

      <FooterInfoStrip locale={locale} />
    </main>
  );
}

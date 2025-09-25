"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IntroSection from "../components/IntroSection";
import AboutSection from "../components/AboutSection";
import FooterInfoStrip from "../components/FooterInfoStrip";
import StepsSection from "../components/StepsSection";
import LocationSearch from "../components/book/LocationForm";
import { appointment_steps_el, appointment_steps_en } from "../../../public/data/steps";

export default function HomePage() {
  const [locale, setLocale] = useState("el");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("locale") || "el";
    setLocale(saved);
  }, []);

  const steps = locale === "en" ? appointment_steps_en : appointment_steps_el;

  const handleFindStudios = (payload) => {
    // payload:
    //  - { mode: "manual", query: string }
    //  - { mode: "near", coords: { latitude, longitude } } OR { mode: "near", error: string }

    if (payload?.mode === "near" && payload?.coords) {
      const { latitude, longitude } = payload.coords;
      router.push(`/book/results?mode=near&lat=${latitude}&lng=${longitude}`);
      return;
    }

    const q = encodeURIComponent(payload?.query ?? "");
    router.push(`/book/results?mode=manual&q=${q}`);
  };

  return (
    <>
      <IntroSection
        image="/images/general/25.jpg"
        title={"Κράτηση"}
        paragraph={<LocationSearch locale={locale} onSearch={handleFindStudios} />}
      />
      <StepsSection steps={steps} />
      <div className="bg-blue-100">
        <AboutSection
          title="Για ιδιοκτήτες studio (B2B)"
          image="/images/general/41.jpg"
          reverse={true}
          fullWidthTitle={false}
          description={[
            "Έχεις ήδη EMS studio;",
            "Η συνεργασία μας δεν τελειώνει μετά την αγορά της συσκευής και του εξοπλισμού! Πλέον έχεις επιπλέον υποστήριξη στο ξεκίνημά σου! Επικοινώνησε μαζί μας για να σε εντάξουμε στο δίκτυό μας και οι νέοι σου πελάτες να κλείσουν την 1η τους προπόνηση μέσω της υπηρεσίας που σου προσφέρουμε!"
          ]}
          ctaText="Επικοινωνία"
          ctaLink="/contact"
        />
      </div>
      <FooterInfoStrip locale={locale} />
    </>
  );
}

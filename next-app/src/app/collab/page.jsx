"use client";

import { useEffect, useState } from "react";

import IntroSection from "../components/IntroSection";
import Footer from "../components/Footer";
import VideoSection from "../components/VideoSection";
import PricingPackage from "../components/PricingPackage";
import AboutSection from "../components/AboutSection";

// Bilingual data (update your data file accordingly)
import { pricingPackage_el, pricingPackage_en } from "../../../public/data/pricingPackage";

export default function ColabPage() {
  const [locale, setLocale] = useState("el");

  useEffect(() => {
    const saved = localStorage.getItem("locale") || "el";
    setLocale(saved);
  }, []);

  const pricingPackage = locale === "en" ? pricingPackage_en : pricingPackage_el;

  return (
    <main className="w-full">
      <IntroSection
        image="/images/general/16.png"
        title={locale === "en" ? "Partner with Us" : "Συνεργασία Μαζί Μας"}
        paragraph={
          <>
            <div>
              <h2>
                {locale === "en"
                  ? "From technology… to a complete EMS solution"
                  : "Από την τεχνολογία… στην ολοκληρωμένη λύση EMS"}
              </h2>
            </div>
            <div className="mt-6 space-y-3 leading-relaxed">
              <p>
                {locale === "en" ? (
                  <>
                    When you purchase a miha bodytec system, you don’t just get the top-tier EMS
                    equipment. Your team receives <strong>free training</strong> from certified
                    instructors from the parent company, so you can start immediately with safety and confidence.
                  </>
                ) : (
                  <>
                    Με την αγορά ενός συστήματος miha bodytec, δεν αποκτάτε απλώς τον κορυφαίο εξοπλισμό EMS.
                    Η ομάδα σας λαμβάνει <strong>δωρεάν εκπαίδευση</strong> από πιστοποιημένους εκπαιδευτές από
                    τη μητρική εταιρεία, ώστε να ξεκινήσετε άμεσα με ασφάλεια και σιγουριά.
                  </>
                )}
              </p>
              <p>
                {locale === "en" ? (
                  <>
                    The process concludes with <strong>official miha bodytec certification</strong> and your{" "}
                    <strong>inclusion in our international client network</strong>, with ongoing support and access to
                    new knowledge.
                  </>
                ) : (
                  <>
                    Η διαδικασία ολοκληρώνεται με την <strong>επίσημη πιστοποίηση</strong> miha bodytec και την{" "}
                    <strong>ένταξή σας στο διεθνές δίκτυο πελατών μας</strong>, με συνεχή υποστήριξη και πρόσβαση σε νέες γνώσεις.
                  </>
                )}
              </p>
              <p className="flex items-center gap-2">
                <img
                  src="/icons/package.png"
                  alt="gift icon"
                  className="w-10 h-10 select-none"
                />
                <i>
                  {locale === "en" ? (
                    <>
                      <strong>And the best part?</strong> Along with the system, the full partnership package
                      with all the benefits below is included in the price.
                    </>
                  ) : (
                    <>
                      <strong>Και το καλύτερο;</strong> Μαζί με το σύστημα, στην τιμή περιλαμβάνεται ολόκληρο
                      το πακέτο συνεργασίας με όλα τα παρακάτω προνόμια.
                    </>
                  )}
                </i>
              </p>
            </div>
          </>
        }
      />

      {/* Package / benefits grid */}
      <PricingPackage items={pricingPackage} />

      <AboutSection
        title={locale === "en" ? "Join the Network" : "Γίνετε Μέλος του Δικτύου"}
        image="/images/general/certified.png"
        fullWidthTitle={false}
        reverse={true}
        description={
          locale === "en"
            ? [
              "By joining miha bodytec’s network of certified partners, you gain access to a dynamic community of professionals distinguished for quality and reliability.",
              "The Certified Miha Owners network is a point of reference for EMS technology in Greece and Cyprus, offering prestige and a competitive edge to its members.",
              "As a member, your studio is showcased through the official platform and recognized as a certified miha bodytec partner.",
              "At the same time, you benefit from continuous updates, training programs, and network support for the ongoing growth of your business.",
            ]
            : [
              "Με την ένταξή σας στο δίκτυο πιστοποιημένων συνεργατών της miha bodytec αποκτάτε πρόσβαση σε μια δυναμική κοινότητα επαγγελματιών που ξεχωρίζουν για την ποιότητα και την αξιοπιστία τους.",
              "Το δίκτυο Certified Miha Owners αποτελεί σημείο αναφοράς για την τεχνολογία EMS στην Ελλάδα και την Κύπρο, προσφέροντας κύρος και ανταγωνιστικό πλεονέκτημα στα μέλη του.",
              "Ως μέλος, το στούντιό σας προβάλλεται μέσα από την επίσημη πλατφόρμα και αναγνωρίζεται ως πιστοποιημένος συνεργάτης της miha bodytec.",
              "Παράλληλα, επωφελείστε από συνεχή ενημέρωση, εκπαιδευτικά προγράμματα, και την υποστήριξη του δικτύου για τη διαρκή ανάπτυξη της επιχείρησής σας.",
            ]
        }
        ctaText={locale === "en" ? "View the Network" : "Δείτε το Δίκτυο"}
        ctaLink="https://certifiedmihaowners.gr/"
      />

      <VideoSection
        title={locale === "en" ? "Open your own EMS studio" : "Ανοίξτε το δικό σας EMS studio"}
        paragraphs={
          locale === "en"
            ? [
              "You don’t need large spaces or complex installations. We create functional EMS studios starting from just 25 sq.m., either as standalone mini studios or integrated into multifunctional centers.",
              "With the miha bodytec m.ove (portable workstation) you can offer sessions anywhere: in corporate offices, at home, or at events.",
              `<h3 class="mt-6 mb-2 font-semibold text-lg"><i>It’s that simple!</i></h3>
                 <ul class="list-disc pl-5 space-y-1">
                   <li>Small space requirements: full setup from 25 sq.m.</li>
                   <li>Operational flexibility: standalone or integrated into an existing center</li>
                   <li>Portable solutions: with the m.ove you offer EMS on-the-go.</li>
                 </ul>`,
            ]
            : [
              "Δεν χρειάζεστε μεγάλους χώρους ή πολύπλοκες εγκαταστάσεις. Δημιουργούμε λειτουργικά EMS studios από μόλις 25 τ.μ., είτε ως αυτόνομα mini στούντιο είτε ενσωματωμένα σε πολυλειτουργικά κέντρα.",
              "Με το miha bodytec m.ove (φορητό workstation) μπορείτε να προσφέρετε συνεδρίες παντού: σε εταιρικούς χώρους, κατ’ οίκον ή σε events.",
              `<h3 class="mt-6 mb-2 font-semibold text-lg"><i>Είναι τόσο απλό!</i></h3>
                 <ul class="list-disc pl-5 space-y-1">
                   <li>Μικρές απαιτήσεις χώρου: πλήρες setup από 25 τ.μ.</li>
                   <li>Ευελιξία λειτουργίας: standalone ή integration σε υπάρχον κέντρο</li>
                   <li>Φορητές λύσεις: με το m.ove προσφέρετε EMS on-the-go.</li>
                 </ul>`,
            ]
        }
        videoUrl="https://www.youtube.com/embed/z1UuZjxtDpc?si=fyIwPKbSefy3UKvA"
        ctaText={locale === "en" ? "Contact" : "Επικοινωνία"}
        ctaLink="/contact"
      />

      <Footer />
    </main>
  );
}

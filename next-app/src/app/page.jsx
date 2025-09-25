'use client';

import QuoteSection from "@/app/components/home/QuoteSection";
import Footer from "@/app/components/Footer";
import ServicesSection from "@/app/components/services/ServicesSection";
import AboutSection from "@/app/components/AboutSection";
import PricingPackage from "@/app/components/PricingPackage";
import IntroSection from "@/app/components/IntroSection";
import VideoSection from "@/app/components/VideoSection";
import QandA from "@/app/components/home/QandA";

import { qa_el, qa_en } from "../../public/data/qa";
import { pricingPackage_el, pricingPackage_en } from "../../public/data/pricingPackage";
import { services_preview_el, services_preview_en } from "../../public/data/services-preview";

import { useEffect, useState } from "react";

export default function Home() {
  const [locale, setLocale] = useState("el");

  useEffect(() => {
    const saved = localStorage.getItem("locale") || "el";
    setLocale(saved);
  }, []);

  // pick data depending on locale
  const qa = locale === "en" ? qa_en : qa_el;
  const pricingPackage = locale === "en" ? pricingPackage_en : pricingPackage_el;
  const services_preview = locale === "en" ? services_preview_en : services_preview_el;

  console.log(process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY);

  return (
    <main>
      {/* Intro Section */}
      <IntroSection
        image="/images/general/7.webp"
        title="FF Medical & Wellness"
        paragraph={
          <>
            <div>
              <h2>
                {locale === "en"
                  ? "The opportunity with no competition"
                  : "Η ευκαιρία που δεν έχει ανταγωνισμό"}
              </h2>
            </div>
            <div className="mt-6 space-y-3 leading-relaxed">
              <p>
                {locale === "en" ? (
                  <>
                    Most fitness & wellness professionals compete for the{" "}
                    <strong>5% of the population</strong> already exercising.
                  </>
                ) : (
                  <>
                    Οι περισσότεροι επαγγελματίες στον χώρο του fitness &
                    wellness ανταγωνίζονται για το{" "}
                    <strong>5% του πληθυσμού</strong> που ήδη ασκείται.
                  </>
                )}
              </p>
              <p>
                {locale === "en" ? (
                  <>
                    Whole body EMS training with miha bodytec opens the doors to
                    an entirely new audience: the{" "}
                    <strong>75% of the population</strong> who until now avoided
                    traditional exercise — either due to lack of time, low
                    interest, or health limitations.
                  </>
                ) : (
                  <>
                    Η whole body EMS άσκηση με miha bodytec ανοίγει τις πόρτες
                    σε ένα εντελώς νέο κοινό: το{" "}
                    <strong>75% του πληθυσμού</strong> που μέχρι σήμερα ήταν
                    εκτός παραδοσιακής άσκησης — είτε λόγω έλλειψης χρόνου, είτε
                    λόγω χαμηλού ενδιαφέροντος, είτε λόγω περιορισμών υγείας.
                  </>
                )}
              </p>
              <p className="flex items-center gap-2">
                <img
                  src="/icons/opportunity.png"
                  alt="gift icon"
                  className="w-10 h-10 select-none"
                />
                <i>
                  {locale === "en"
                    ? "This is not 'just another gym.' It is a growth opportunity: service differentiation, new clientele, increased revenue and quick ROI."
                    : "Δεν μιλάμε για «άλλο ένα γυμναστήριο». Μιλάμε για αναπτυξιακή ευκαιρία: διαφοροποίηση υπηρεσίας, νέο πελατολόγιο, αυξημένα έσοδα και γρήγορη απόσβεση."}
                </i>
              </p>
            </div>
          </>
        }
      />

      {/* Services Section */}
      <div className="bg-gradient-to-b from-[#E6F4FB] via-white to-[#F9FCFF]">
        <ServicesSection
          title={locale === "en" ? "How we achieve it" : "Πώς το πετυχαίνουμε"}
          paragraphs={
            locale === "en"
              ? [
                "Whole-body EMS training by miha bodytec combines <strong>safety</strong>, <strong>speed</strong>, and <strong>effectiveness</strong> in a premium service that fits into 20’ per week.",
                "Proven benefits in <em>sarcopenia</em> & <em>back pain</em> mean a new, wide audience for your services — from rehabilitation to high-end training.",
              ]
              : [
                "Η Ηλεκτρομυϊκή Διέγερση όλου του σώματος (whole body-EMS) της miha bodytec συνδυάζει <strong>ασφάλεια</strong>, <strong>ταχύτητα</strong> και <strong>αποτελεσματικότητα</strong> σε μια premium υπηρεσία που χωράει σε 20’ την εβδομάδα.",
                "Αποδεδειγμένα οφέλη σε <em>σαρκοπενία</em> & <em>πόνο μέσης</em> σημαίνουν νέο, ευρύ κοινό για την παροχή σας — από αποκατάσταση έως high-end προπόνηση.",
              ]
          }
          ctaText={
            locale === "en" ? "See more about EMS" : "Δείτε περισσότερα για την EMS"
          }
          ctaHref="/ems"
          services={services_preview}
        />
      </div>

      {/* About Section */}
      <AboutSection
        title={locale === "en" ? "Who We Are" : "Ποιοί Είμαστε"}
        image="/images/general/27.jpg"
        fullWidthTitle={false}
        reverse={true}
        description={
          locale === "en"
            ? [
              "FF MEDICAL AND WELLNESS is the <strong>exclusive representative and distributor</strong> of miha bodytec in Greece, Cyprus & Albania.",
              "With steady growth since 2013, starting as Fast Fitness, our mission for 12 years has been to <strong>support businesses</strong> in the fields of exercise, wellness, and health, by providing them the right tools to grow through EMS technology.",
              "With a network of <strong>over 150 EMS studios & physiotherapy centers</strong>, we stand by our clients from day one: from equipment supply, to training, certification, and continuous business guidance.",
              "With <strong>many years of experience in the wellness sector</strong>, we know how to turn an innovative technology like whole body EMS into a sustainable and profitable service.",
              `<i class="font-bold">We are not just distributors — we are your strategic growth partner.</i>`,
            ]
            : [
              "Η <span class='font-semibold'>FF MEDICAL AND WELLNESS</span> είναι ο <strong>αποκλειστικός αντιπρόσωπος και διανομέας</strong> της miha bodytec στην Ελλάδα, την Κύπρο & την Αλβανία.",
              "Με μία σταθερή πορεία ανάπτυξης από το 2013 ξεκινώντας ως Fast Fitness, επί 12 έτη η αποστολή μας είναι να <strong>στηρίζουμε επιχειρήσεις</strong> στον χώρο της άσκησης, της ευεξίας και της υγείας, παρέχοντάς τους τα κατάλληλα εργαλεία για να αναπτυχθούν μέσω της τεχνολογίας EMS.",
              "Με ένα δίκτυο πελατών μας με <strong>πάνω απο 150 ems studio & φυσικοθεραπευτήρια</strong> στεκόμαστε δίπλα τους από την πρώτη μέρα: από την προμήθεια του εξοπλισμού, μέχρι την εκπαίδευση, την πιστοποίηση και τη συνεχή επιχειρηματική καθοδήγηση.",
              "Με <strong>πολυετή εμπειρία στον χώρο της ευεξίας</strong>, γνωρίζουμε πώς να μετατρέπουμε μια καινοτόμα τεχνολογία όπως είναι αυτή του whole body EMS σε μια βιώσιμη και κερδοφόρα υπηρεσία.",
              `<i class="font-bold">Δεν είμαστε απλώς διανομείς — είμαστε στρατηγικός συνεργάτης ανάπτυξης.</i>`,
            ]
        }
        ctaText={
          locale === "en" ? "See more about us" : "Δείτε περισσότερα για εμάς"
        }
        ctaLink="/company"
      />

      {/* Pricing Section */}
      <PricingPackage
        title={
          locale === "en"
            ? "Two solutions, endless possibilities"
            : "Δύο λύσεις, άπειρες δυνατότητες"
        }
        text={
          locale === "en"
            ? "Choose between the wired miha bodytec || medical and the wireless miha bodytec m.ove (with indoor & outdoor versions). Buying a miha bodytec system, you don’t just get equipment, you get a complete package: training, technical support, and business guidance."
            : "Επιλέξτε ανάμεσα στο ενσύρματο miha bodytec || medical και στο ασύρματο miha bodytec m.ove (με in-door & outdoor εκδόσεις). Με την απόκτηση ενός συστήματος miha bodytec, δεν αγοράζετε απλώς εξοπλισμό, αλλά ένα πλήρες πακέτο: εκπαίδευση, τεχνική υποστήριξη και επιχειρηματική καθοδήγηση."
        }
        ctaLink="/collab"
        ctaText={
          locale === "en"
            ? "See more about the product"
            : "Δείτε περισσότερα για το προϊόν"
        }
        items={pricingPackage}
      />

      <QuoteSection />

      {/* Video Section */}
      <VideoSection
        title={
          locale === "en"
            ? "Open your own EMS studio"
            : "Ανοίξτε το δικό σας EMS studio"
        }
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

      {/* Second Intro Section */}
      <IntroSection
        image="/images/general/13.webp"
        title={
          locale === "en"
            ? "Dedication & Trust that Count"
            : "Αφοσίωση & Εμπιστοσύνη που Μετράνε"
        }
        paragraph={
          <>
            <div>
              <strong className="text-2xl">
                +217%{" "}
                {locale === "en"
                  ? "traffic, dedication, and trust"
                  : "επισκεψιμότητα, αφοσίωση και εμπιστοσύνη"}
              </strong>
            </div>

            <div className="mt-6 space-y-3 leading-relaxed">
              <p>
                {locale === "en" ? (
                  <>
                    Typically, an exerciser or patient stops training either due
                    to lack of interest & time or when the pain subsides. With{" "}
                    <strong>miha bodytec</strong>,{" "}
                    <strong>whole-body strengthening in 20’/week</strong>{" "}
                    transforms occasional visits into a stable habit.
                  </>
                ) : (
                  <>
                    Συνήθως ο ασκούμενος ή ασθενής σταματά την εκγύμναση είτε
                    λόγω έλλειψης πια ενδιαφέροντος & χρόνου είτε όταν υποχωρήσει
                    ο πόνος. Με το <strong>miha bodytec</strong>, η{" "}
                    <strong>ολόσωμη ενδυνάμωση σε 20’/εβδομάδα </strong>{" "}
                    μετατρέπει την αποσπασματική επίσκεψη σε σταθερή συνήθεια.
                  </>
                )}
              </p>

              <p>
                {locale === "en" ? (
                  <>
                    The result? Clients see their health{" "}
                    <strong>holistically</strong> (prevention & performance) and
                    remain active beyond symptom treatment. Through this
                    commitment, the initial motivation evolves into{" "}
                    <strong>lasting behavior change</strong> and a more{" "}
                    <strong>active lifestyle</strong>.
                  </>
                ) : (
                  <>
                    Το αποτέλεσμα; Οι πελάτες βλέπουν την υγεία τους{" "}
                    <strong>ολιστικά</strong> (πρόληψη & απόδοση) και παραμένουν
                    ενεργοί, πέρα από την αντιμετώπιση του συμπτώματος. Μέσα από
                    αυτή τη δέσμευση, το αρχικό κίνητρο εξελίσσεται σε{" "}
                    <strong>διαρκή αλλαγή συμπεριφοράς </strong> και πιο{" "}
                    <strong>ενεργό τρόπο ζωής</strong>.
                  </>
                )}
              </p>

              {/* Bullet points */}
              {[
                {
                  en: "They prioritize health over appearance.",
                  el: "Δίνουν προτεραιότητα στην υγεία έναντι της εμφάνισης.",
                },
                {
                  en: "They value personal attention over automation.",
                  el: "Εκτιμούν την προσωπική προσοχή έναντι της αυτοματοποίησης.",
                },
                {
                  en: "They care less about apps and group dynamics.",
                  el: "Ενδιαφέρονται λιγότερο για τις εφαρμογές και τη δυναμική των ομάδων.",
                },
                {
                  en: "And they are willing to invest in long-term well-being.",
                  el: "Και είναι πρόθυμοι να επενδύσουν στη μακροπρόθεσμη ευεξία.",
                },
              ].map((item, i) => (
                <p key={i} className="flex items-center gap-2">
                  <img
                    src="/icons/opportunity.png"
                    alt="opportunity"
                    className="w-10 h-10 select-none"
                  />
                  <i>{locale === "en" ? item.en : item.el}</i>
                </p>
              ))}
            </div>
          </>
        }
      />

      <QandA items={qa} />

      <Footer />
    </main>
  );
}

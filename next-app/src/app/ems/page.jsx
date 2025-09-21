"use client";

import { useEffect, useState } from "react";

import IntroSection from "../components/IntroSection";
import Footer from "../components/Footer";
import ServicesSection from "../components/services/ServicesSection";
import StepsSection from "../components/StepsSection";
import SplitColumnsWithImage from "../components/SplitColumnsWithImage";
import VideoSection from "../components/VideoSection";
import AboutSection from "../components/AboutSection";

import { training_steps_el, training_steps_en } from "../../../public/data/steps";
import { services_el, services_en } from "../../../public/data/services";

export default function AboutPage() {
  const [locale, setLocale] = useState("el");
  useEffect(() => {
    const saved = localStorage.getItem("locale") || "el";
    setLocale(saved);
  }, []);

  const steps = locale === "en" ? training_steps_en : training_steps_el;
  const services = locale === "en" ? services_en : services_el;

  return (
    <main>
      <IntroSection
        image="/images/general/2.webp"
        title={locale === "en" ? "EMS Training" : "Άσκηση EMS"}
        paragraph={
          <>
            <div>
              <h2>
                {locale === "en"
                  ? "EMS Training – The service that will elevate your business"
                  : "Άσκηση EMS – Η υπηρεσία που θα απογειώσει την επιχείρησή σας"}
              </h2>
            </div>
            <div className="mt-6 space-y-3 leading-relaxed">
              <p>
                {locale === "en" ? (
                  <>
                    Miha bodytec’s whole-body EMS is the most modern form of electrical muscle
                    stimulation: an evidence-based method that delivers safety, speed, and impressive
                    results. In just 20 minutes per week, EMS is ideal for:
                  </>
                ) : (
                  <>
                    Το whole body EMS της miha bodytec είναι η πιο σύγχρονη μορφή ηλεκτρομυοδιέγερσης:
                    μια επιστημονικά τεκμηριωμένη μέθοδος που προσφέρει ασφάλεια, ταχύτητα και
                    εντυπωσιακά αποτελέσματα. Με μόλις 20 λεπτά την εβδομάδα, η EMS απευθύνεται σε:
                  </>
                )}
              </p>
            </div>
            <div className="mt-4">
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  {locale === "en"
                    ? "people with limited time,"
                    : "άτομα με περιορισμένο χρόνο,"}
                </li>
                <li>
                  {locale === "en"
                    ? "those who want to integrate exercise into daily life,"
                    : "όσους θέλουν να εντάξουν την άσκηση στην καθημερινότητά τους,"}
                </li>
                <li>
                  {locale === "en"
                    ? "and people who struggle to exercise with classic methods due to pain or mobility issues."
                    : "αλλά και σε ανθρώπους που δυσκολεύονται να αθληθούν με τις κλασικές μεθόδους λόγω πόνου ή κινητικών προβλημάτων."}
                </li>
              </ul>
              <p className="mt-4">
                {locale === "en"
                  ? "For your business, EMS is a standout investment: it attracts premium clients and builds a loyal audience."
                  : "Για τον επαγγελματικό σας χώρο, η EMS είναι μια επένδυση που ξεχωρίζει: προσελκύει premium πελάτες και δημιουργεί πιστό κοινό."}
              </p>
            </div>

            <p className="flex items-center gap-2 mt-6">
              <img src="/icons/like.png" alt="idea icon" className="w-8 h-8 select-none" />
              <i className="font-semibold">
                {locale === "en" ? "Why choose EMS training?" : "Γιατί να επιλέξετε την EMS άσκηση ;"}
              </i>
            </p>
          </>
        }
      />

      <ServicesSection services={services} />

      <SplitColumnsWithImage
        rightTitle={locale === "en" ? "Exercise & Training" : "Άσκηση & Γυμναστική"}
        rightBullets={
          locale === "en"
            ? [
              "Whole-body workout in 20' per week",
              "Type II fiber activation — strength & endurance",
              "Improved posture and metabolism",
              "Premium experience for time-pressed, demanding clients",
            ]
            : [
              "Προπόνηση όλου του σώματος σε 20' τη βδομάδα",
              "Ενεργοποίηση μυϊκών ινών II – δύναμη και αντοχή",
              "Βελτίωση στάσης σώματος και μεταβολισμού",
              "Premium εμπειρία για απαιτητικούς πελάτες με περιορισμένο χρόνο",
            ]
        }
        leftTitle={locale === "en" ? "Therapy & Rehabilitation" : "Θεραπεία & Αποκατάσταση"}
        leftBullets={
          locale === "en"
            ? [
              "Strengthening in cases of muscle weakness or atrophy",
              "Relief of chronic pain (e.g., lower back)",
              "Muscle re-education after injury or surgery",
              "Maintaining mobility and quality of life",
            ]
            : [
              "Ενδυνάμωση σε περιπτώσεις μυϊκής αδυναμίας ή ατροφίας",
              "Ανακούφιση χρόνιων πόνων (π.χ. στη μέση)",
              "Μυϊκή επανεκπαίδευση μετά από τραυματισμό ή χειρουργείο",
              "Διατήρηση κινητικότητας και ποιότητας ζωής",
            ]
        }
        imageSrc="/images/general/38.jpg"
        imageAlt={locale === "en" ? "Training and Rehabilitation" : "Προπόνηση και Αποκατάσταση"}
        bulletIcon="/icons/check.png"
      />

      <VideoSection
        title={
          locale === "en"
            ? "EMS takes you a step further — faster"
            : "Η EMS σε πάει ένα βήμα παραπέρα — πιο γρήγορα"
        }
        paragraphs={
          locale === "en"
            ? [
              `Whole-body EMS activates all muscle groups simultaneously, including deeper muscles that are hard to target with classic training.`,
              `The combination of voluntary contraction and electrical stimulus provides maximal activation with minimal joint load.`,
              `<p class="flex items-center gap-2 mt-6">
                  <img src="/icons/goal.png" alt="steps icon" class="w-8 h-8 select-none" />
                  <i class="font-semibold">The process is simple and completed in 3 steps.</i>
                </p>`,
            ]
            : [
              `Η whole body EMS ενεργοποιεί όλες τις μυϊκές ομάδες ταυτόχρονα, συμπεριλαμβανομένων βαθύτερων μυών που δύσκολα στοχεύονται με κλασική άσκηση.`,
              `Ο συνδυασμός εκούσιας σύσπασης και ηλεκτρικού ερεθίσματος προσφέρει μέγιστη ενεργοποίηση με ελάχιστη επιβάρυνση στις αρθρώσεις.`,
              `<p class="flex items-center gap-2 mt-6">
                  <img src="/icons/goal.png" alt="steps icon" class="w-8 h-8 select-none" />
                  <i class="font-semibold">Η διαδικασία είναι απλή και ολοκληρώνεται σε 3 βήματα.</i>
                </p>`,
            ]
        }
        videoUrl="https://www.youtube.com/embed/vJZO6uhucKE?si=YwB9oZsAQqrTKfZF"
      />

      <div className="bg-gradient-to-b from-[#E6F4FB] via-white to-[#F9FCFF]">
        <StepsSection steps={steps} />
        <section className="w-full h-[60vh] py-12 flex justify-center">
          <div className="relative w-full max-w-3xl rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/yT9KJMncPEM?si=zlfRtCoxhL4NTAS6"
              title="Video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </section>
      </div>

      <AboutSection
        title={
          locale === "en" ? (
            <>
              Relief & Prevention
              <span className="block md:hidden" />
              <span className="hidden md:inline"> </span>
              Low Back Pain
            </>
          ) : (
            <>
              Ανακούφιση και Πρόληψη
              <span className="block md:hidden" />
              <span className="hidden md:inline"> </span>
              Πόνου στη Μέση
            </>
          )
        }
        image="/images/general/36.webp"
        reverse={false}
        imageDimensions="h-150 mx-auto object-contain"
        description={
          locale === "en"
            ? [
              "Non-specific low back pain is one of the most common issues, appearing in 60–70% of the population at some point in life.",
              "It often stems from muscle imbalance, sedentary lifestyle, unilateral or heavy physical work, and even psychological stress.",
              "EMS training:",
            ]
            : [
              "Ο μη-ειδικός πόνος στη μέση είναι ένα από τα πιο συχνά προβλήματα, που εμφανίζεται στο 60–70% του πληθυσμού κάποια στιγμή στη ζωή του.",
              "Συχνά προέρχεται από μυϊκή ανισορροπία, καθιστική ζωή, μονόπλευρη ή βαριά σωματική εργασία, ακόμα και από ψυχολογικό στρες.",
              "Η προπόνηση EMS:",
            ]
        }
        ticks={
          locale === "en"
            ? [
              "Strengthens the stabilizing muscles of the spine (e.g., multifidus, transverse abdominis).",
              "Relieves pain by improving muscular support and circulation.",
              "Provides safe training without joint overload.",
              "Requires just 20 minutes once a week, under individual supervision.",
            ]
            : [
              "Ενδυναμώνει τους σταθεροποιητικούς μύες της σπονδυλικής στήλης (π.χ. πολυσχιδής, εγκάρσιος κοιλιακός).",
              "Ανακουφίζει τον πόνο βελτιώνοντας τη μυϊκή υποστήριξη και την κυκλοφορία.",
              "Προσφέρει ασφαλή άσκηση χωρίς επιβάρυνση των αρθρώσεων.",
              "Απαιτεί μόνο 20 λεπτά μία φορά την εβδομάδα, υπό ατομική επίβλεψη.",
            ]
        }
        tickIcon="/icons/check.png"
        features={
          locale === "en"
            ? [
              { icon: "/icons/leftdown-rightup.svg", text: "Simultaneous activation of agonist and antagonist muscles" },
              { icon: "/icons/joints.png", text: "Deep-muscle strengthening with joint-friendly loading" },
              { icon: "/icons/thumbs-up.svg", text: "Proven effectiveness in non-specific low back pain" },
            ]
            : [
              { icon: "/icons/leftdown-rightup.svg", text: "Ταυτόχρονη ενεργοποίηση αγωνιστών και ανταγωνιστών μυών" },
              { icon: "/icons/joints.png", text: "Ενδυνάμωση εν τω βάθει μυών με φιλικότητα στις αρθρώσεις" },
              { icon: "/icons/thumbs-up.svg", text: "Αποδεδειγμένη αποτελεσματικότητα στον μη-ειδικό πόνο μέσης" },
            ]
        }
      />

      <AboutSection
        title={locale === "en" ? "Addressing Sarcopenia" : "Αντιμετώπιση Σαρκοπενίας"}
        image="/images/general/34.jpg"
        reverse
        imageDimensions="h-150 mx-auto object-contain"
        description={
          locale === "en"
            ? [
              "Sarcopenia is the age-related loss of muscle mass and strength that can affect daily life and independence. From around age 50, muscle mass and strength gradually decline, with factors such as lack of exercise, poor nutrition and low vitamin D accelerating the process.",
              "EMS training:",
            ]
            : [
              "Η σαρκοπενία είναι η φυσιολογική απώλεια μυϊκής μάζας και δύναμης που συνοδεύει τη γήρανση και μπορεί να επηρεάσει την καθημερινότητα και την ανεξαρτησία. Από την ηλικία των 50 ετών και μετά, η μυϊκή μάζα και η δύναμη μειώνονται σταδιακά, με παράγοντες όπως η έλλειψη άσκησης, η φτωχή διατροφή και η χαμηλή βιταμίνη D να επιταχύνουν τη διαδικασία.",
              "Η προπόνηση EMS:",
            ]
        }
        ticks={
          locale === "en"
            ? [
              "Effective even in older adults over 75 years",
              "Activates deep type II muscle fibers that decline with age",
              "Maintains or increases muscle mass safely and with minimal stress",
              "Delays strength loss and supports quality of life",
            ]
            : [
              "Αποτελεσματική ακόμη και σε ηλικιωμένους άνω των 75 ετών",
              "Ενεργοποιεί βαθιά μυϊκές ίνες τύπου II που χάνονται με την ηλικία",
              "Διατηρεί ή αυξάνει τη μυϊκή μάζα με ασφάλεια και χωρίς επιβάρυνση",
              "Καθυστερεί τη μείωση της δύναμης και υποστηρίζει την ποιότητα ζωής",
            ]
        }
        tickIcon="/icons/check.png"
        features={
          locale === "en"
            ? [
              { icon: "/icons/thumbs-up.svg", text: "Effectiveness and safety into older age" },
              { icon: "/icons/pulses.svg", text: "High intensity with low strain" },
              { icon: "/icons/medical.svg", text: "Improves strength, mass & mobility" },
            ]
            : [
              { icon: "/icons/thumbs-up.svg", text: "Αποτελεσματικότητα και ασφάλεια μέχρι τη γήρανση" },
              { icon: "/icons/pulses.svg", text: "Υψηλή ένταση με χαμηλή καταπόνηση" },
              { icon: "/icons/medical.svg", text: "Ενίσχυση δύναμης, μάζας & κινητικότητας" },
            ]
        }
      />

      <Footer />
    </main>
  );
}

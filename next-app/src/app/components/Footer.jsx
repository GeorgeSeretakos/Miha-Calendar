"use client";

import { useEffect, useState } from "react";
import FooterInfoStrip from "./FooterInfoStrip";
import SocialSection from "./home/SocialSection";

export default function Contact() {
  const [locale, setLocale] = useState("el");
  useEffect(() => {
    const saved = localStorage.getItem("locale") || "el";
    setLocale(saved);
  }, []);

  return (
    <main className="flex flex-col">
      {/* Contact Section */}
      <section className="relative text-white py-12 px-4 min-h-screen flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/general/28.jpg')" }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/80 z-0"></div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">
            {locale === "en" ? "Contact Us" : "Επικοινώνησε Μαζί μας"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="bg-white/5 p-6 rounded-lg text-sm sm:text-base">
              <div className="mb-4">
                <strong>{locale === "en" ? "Address" : "Διεύθυνση"}</strong>
                <ul className="list-disc pl-5">
                  <li>{locale === "en" ? "Iroon Polytechneiou 5, Nea Erythraia" : "Ηρώων Πολυτεχνείου 5, Νέα Ερυθραία 146 71"}</li>
                </ul>
              </div>
              <div className="mb-4">
                <strong>{locale === "en" ? "Phone" : "Τηλέφωνο"}</strong>
                <ul className="list-disc pl-5">
                  <li>210 8070010</li>
                  <li>211 2143161</li>
                </ul>
              </div>
              <div className="mb-4">
                <strong>Email</strong>
                <ul className="list-disc pl-5">
                  <li>
                    <a
                      href="mailto:ffmedicwell@gmail.com"
                      className="text-blue-400 hover:underline"
                    >
                      ffmedicwell@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <strong>{locale === "en" ? "Opening Hours" : "Ώρες Λειτουργίας"}</strong>
                <ul className="list-disc pl-5">
                  <li>
                    {locale === "en"
                      ? "Monday – Friday: 09:00 – 21:00"
                      : "Δευτέρα - Παρασκευή: 09:00 – 21:00"}
                  </li>
                  <li>{locale === "en" ? "Saturday: 10:00 – 15:00" : "Σάββατο: 10:00 - 15.00"}</li>
                  <li>{locale === "en" ? "Sunday: Closed" : "Κυριακή: Κλειστά"}</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 p-6 rounded-lg text-sm sm:text-base">
              <p className="mb-4 font-bold">
                {locale === "en"
                  ? "Fill out the form and we'll get back to you as soon as possible."
                  : "Συμπλήρωσε τη φόρμα και θα επικοινωνήσουμε μαζί σου το συντομότερο."}
              </p>
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                action="/thank-you"
                className="space-y-4"
              >
                <input type="hidden" name="form-name" value="contact"/>
                <p hidden>
                  <label>
                    {locale === "en" ? "Don’t fill this out:" : "Μην το συμπληρώσεις:"}{" "}
                    <input name="bot-field"/>
                  </label>
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    name="Όνομα"
                    placeholder={locale === "en" ? "First name" : "Όνομα"}
                    required
                    className="flex-1 p-2 rounded bg-black/30 border border-gray-700 text-white"
                  />
                  <input
                    type="text"
                    name="Επώνυμο"
                    placeholder={locale === "en" ? "Last name" : "Επώνυμο"}
                    required
                    className="flex-1 p-2 rounded bg-black/30 border border-gray-700 text-white"
                  />
                </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full p-2 rounded bg-black/30 border border-gray-700 text-white"
                />

                <input
                  type="tel"
                  name="Τηλέφωνο"
                  placeholder={locale === "en" ? "Phone" : "Τηλέφωνο"}
                  required
                  className="w-full p-2 rounded bg-black/30 border border-gray-700 text-white"
                />

                <textarea
                  name="Μήνυμα"
                  rows={5}
                  placeholder={locale === "en" ? "Message" : "Μήνυμα"}
                  required
                  className="w-full p-2 rounded bg-black/30 border border-gray-700 text-white"
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <label className="flex items-center gap-2 text-xs sm:text-sm">
                    <input type="checkbox" required className="accent-blue-500 scale-110"/>
                    {locale === "en" ? "I accept the" : "Αποδέχομαι την"}{" "}
                    <a href="/privacy-policy" className="text-blue-400 hover:underline">
                      {locale === "en" ? "Privacy Policy" : "Πολιτική Απορρήτου"}
                    </a>
                  </label>
                  <button type="submit" className="btn">
                    {locale === "en" ? "Send" : "Αποστολή"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <FooterInfoStrip locale={locale} />

      <SocialSection />

      {/* Map Section */}
      <section className="w-full">
        <div className="w-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3140.1926897680096!2d23.812853375855056!3d38.08917839398699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a19efc17b18f5f%3A0x8b7caf8209b192c1!2zzpfPgS4gzqDOv867z4XPhM61z4fOvc61zq_Ov8-FIDUsIM6dzq3OsSDOlc-Bz4XOuM-BzrHOr86xIDE0NiA3MQ!5e0!3m2!1sel!2sgr!4v1755200375385!5m2!1sel!2sgr"
            className="rounded-none md:rounded-lg w-full"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </main>
  );
}

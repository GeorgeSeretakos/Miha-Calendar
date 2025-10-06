// app/thank-you/thank-you.client.jsx
"use client";

import { useSearchParams } from "next/navigation";

const REASONS = {
  missing_token: "Δεν βρέθηκε σύνδεσμος επιβεβαίωσης.",
  expired_token: "Ο σύνδεσμος έχει λήξει.",
  invalid_token: "Μη έγκυρος σύνδεσμος επιβεβαίωσης.",
  studio: "Αδυναμία φόρτωσης στούντιο.",
  google_auth: "Πρόβλημα σύνδεσης με το Google Calendar.",
  taken: "Η ώρα έχει ήδη κρατηθεί.",
  error: "Προέκυψε σφάλμα. Δοκιμάστε ξανά.",
};

export default function ThankYouContent() {
  const params = useSearchParams();
  const status = params.get("status") || "success";
  const reason = params.get("reason") || "";

  const isSuccess = status === "success";
  const message =
    isSuccess
      ? "Ευχαριστούμε! Το ραντεβού σας επιβεβαιώθηκε."
      : REASONS[reason] || "Κάτι πήγε στραβά.";

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-gray-100">
      <div className="rounded-xl border border-white/10 bg-[#111315] p-6">
        <h1 className="text-2xl font-semibold">
          {isSuccess ? "Επιτυχής Επιβεβαίωση" : "Αδυναμία Επιβεβαίωσης"}
        </h1>
        <p className="mt-2 text-gray-300">{message}</p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center rounded-lg bg-[#1C86D1] px-5 py-2.5 text-sm font-medium hover:bg-[#166da7]">
            Επιστροφή στην αρχική
          </a>
        </div>
      </div>
    </main>
  );
}

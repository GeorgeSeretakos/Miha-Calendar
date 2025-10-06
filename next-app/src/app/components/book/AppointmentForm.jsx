"use client";

import { useEffect, useState } from "react";

export default function AppointmentForm({ embedded = false, studioId, defaultTimezone = "Europe/Athens" }) {
  const [picked, setPicked] = useState(null); // { day, time, startISO, endISO, timezone }
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [whenText, setWhenText] = useState("");

  useEffect(() => {
    function onSlot(e) {
      const d = e.detail || {};
      setPicked({
        day: d.day,
        time: d.time,
        startISO: d.startISO,
        endISO: d.endISO,
        timezone: d.timezone || defaultTimezone,
      });
      setError("");
      // keep success note & hide controls even if user re-selects a slot
      // setSent(false); // (leave commented per requirement)
    }
    window.addEventListener("booking:slot", onSlot);
    return () => window.removeEventListener("booking:slot", onSlot);
  }, [defaultTimezone]);

  function isEmail(s = "") {
    return /\S+@\S+\.\S+/.test(s);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!studioId) return setError("Λείπει το studio id.");
    if (!picked?.startISO || !picked?.endISO) return setError("Επιλέξτε πρώτα ώρα ραντεβού από τα διαθέσιμα.");

    const fd = new FormData(e.currentTarget);
    const firstName = fd.get("firstName")?.toString().trim();
    const lastName  = fd.get("lastName")?.toString().trim();
    const email     = fd.get("email")?.toString().trim();
    const phone     = fd.get("phone")?.toString().trim();
    const message   = fd.get("message")?.toString().trim() || "";
    const consent   = fd.get("consent");

    if (!firstName || !lastName || !email || !phone) return setError("Συμπληρώστε όλα τα υποχρεωτικά πεδία.");
    if (!isEmail(email)) return setError("Το email δεν είναι έγκυρο.");
    if (!consent) return setError("Αποδεχθείτε την Πολιτική Απορρήτου.");

    const payload = {
      studioId,
      startISO: picked.startISO,
      endISO: picked.endISO,
      firstName,
      lastName,
      email,
      phone,
      message,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 || data?.reason === "slot_taken") {
          throw new Error("Η ώρα μόλις κλείστηκε. Επιλέξτε άλλη διαθέσιμη ώρα.");
        }
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setConfirmEmail(email);
      try {
        const dt = new Date(picked.startISO);
        setWhenText(
          dt.toLocaleString("el-GR", {
            timeZone: picked.timezone || defaultTimezone,
            dateStyle: "medium",
            timeStyle: "short",
          })
        );
      } catch {}
      setSent(true);

      // notify availability grid to refresh (clear temporary HOLDs, etc.)
      try { window.dispatchEvent(new Event("booking:reload")); } catch {}
    } catch (err) {
      setError(err?.message || "Αποτυχία αποστολής email επιβεβαίωσης.");
    } finally {
      setSubmitting(false);
    }
  }

  const Banner = (
    <div className="flex items-center justify-between">
      <div className="text-sm">
        {picked ? (
          <span className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 border border-white/10">
            <span className="text-gray-300">Επιλεγμένο:</span>
            <span className="font-medium text-white">{picked.day} • {picked.time}</span>
            <span className="text-gray-400">({picked.timezone})</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Επιλέξτε μια ώρα από τα διαθέσιμα στα δεξιά.</span>
        )}
      </div>
    </div>
  );

  const SuccessNote = sent && (
    <div className="rounded-lg border border-emerald-800/40 bg-emerald-900/20 p-3 text-sm text-emerald-200">
      <div className="font-medium">Στάλθηκε σύνδεσμος επιβεβαίωσης</div>
      <div className="mt-1">
        Ελέγξτε το email <span className="font-semibold">{confirmEmail}</span> και πατήστε
        &nbsp;«Επιβεβαίωση Ραντεβού». Ο σύνδεσμος λήγει σε ~5 λεπτά.
        {whenText ? <div className="mt-1 text-emerald-300/90">Ώρα ραντεβού: {whenText}</div> : null}
      </div>
    </div>
  );

  const ErrorNote = error ? (
    <div className="text-sm text-red-300 bg-red-900/20 border border-red-800/40 rounded-lg p-3">{error}</div>
  ) : null;

  const Card = (
    <div className="rounded-xl bg-[#111315] border border-white/10 shadow-sm p-4 sm:p-6 w-full h-full text-gray-200">
      <form className="space-y-5 h-full flex flex-col" onSubmit={onSubmit}>
        {Banner}

        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input id="firstName" name="firstName" type="text" required placeholder="Όνομα"
                 className="w-full rounded-lg border border-white/10 bg-[#0f1113] px-3.5 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#1C86D1] focus:border-[#1C86D1]" />
          <input id="lastName" name="lastName" type="text" required placeholder="Επώνυμο"
                 className="w-full rounded-lg border border-white/10 bg-[#0f1113] px-3.5 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#1C86D1] focus:border-[#1C86D1]" />
        </div>

        {/* Contact row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input id="email" name="email" type="email" required placeholder="Email"
                 className="w-full rounded-lg border border-white/10 bg-[#0f1113] px-3.5 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#1C86D1] focus:border-[#1C86D1]" />
          <input id="phone" name="phone" type="tel" required placeholder="Τηλέφωνο"
                 className="w-full rounded-lg border border-white/10 bg-[#0f1113] px-3.5 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#1C86D1] focus:border-[#1C86D1]" />
        </div>

        {/* Message */}
        <textarea id="message" name="message" rows={5} placeholder="Μήνυμα (προαιρετικό)"
                  className="w-full rounded-lg border border-white/10 bg-[#0f1113] px-3.5 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#1C86D1] focus:border-[#1C86D1]" />

        {ErrorNote}
        {SuccessNote}

        {/* Privacy + Submit (hidden after success) */}
        {!sent && (
          <div className="mt-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
              <input type="checkbox" name="consent" value="yes" required className="h-4 w-4 accent-[#1C86D1]" />
              Αποδέχομαι την{" "}
              <a href="/privacy-policy" className="text-[#7dbcf1] hover:underline">Πολιτική Απορρήτου</a>
            </label>

            <button
              type="submit"
              disabled={!picked || submitting}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-white text-sm font-medium transition
              ${!picked || submitting ? "bg-[#1C86D1]/60 cursor-not-allowed" : "bg-[#1C86D1] hover:bg-[#166da7]"}`}
            >
              {submitting ? "Γίνεται αποστολή..." : "Αποστολή"}
              {!submitting && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Hidden (debugging only) */}
        <input type="hidden" name="day" value={picked?.day || ""} />
        <input type="hidden" name="time" value={picked?.time || ""} />
        <input type="hidden" name="timezone" value={picked?.timezone || defaultTimezone} />
      </form>
    </div>
  );

  if (embedded) return Card;
  return <div className="mx-auto w-full px-4">{Card}</div>;
}

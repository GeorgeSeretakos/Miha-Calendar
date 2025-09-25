"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactAndHours({ studio }) {
  return (
    <section className="py-8">
      <div className="max-w-6xl px-4 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Επικοινωνία</h2>
          <ul className="space-y-3 text-gray-700">
            {studio.address && (
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <span>{studio.address}</span>
              </li>
            )}
            {studio.phone && (
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                <a href={`tel:${studio.phone}`} className="hover:underline">
                  {studio.phone}
                </a>
              </li>
            )}
            {studio.email && (
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <a href={`mailto:${studio.email}`} className="hover:underline">
                  {studio.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Opening hours */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Ώρες λειτουργίας</h2>
          <ul className="space-y-2 text-gray-700">
            {/* Example data — replace with studio.openingHours later */}
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Δευτέρα – Παρασκευή: 08:00 – 21:00
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Σάββατο: 09:00 – 17:00
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Κυριακή: Κλειστά
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

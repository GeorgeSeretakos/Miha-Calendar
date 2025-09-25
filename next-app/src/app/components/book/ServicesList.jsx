"use client";

import { Dumbbell } from "lucide-react";

export default function ServicesList({ services = [] }) {
  if (!services.length) return null;

  return (
    <div className="max-w-6xl px-4 mx-auto">
      <h2 className="text-lg font-semibold mb-4">Υπηρεσίες</h2>

      <ul className="space-y-3">
        {services.map((s, i) => (
          <li key={`${s}-${i}`} className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Dumbbell className="h-4 w-4 text-blue-500" />
            </span>
            <span className="text-sm font-medium text-gray-800">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

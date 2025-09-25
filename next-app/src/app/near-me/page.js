"use client";

import { useState } from "react";
import NearMeButton from "@components/NearMeButton";
import { fetchNearby } from "@lib/fetchNearby";
import { formatDistance } from "@lib/formatDistance";

export default function NearMePage() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCoords(coords) {
    try {
      setLoading(true);
      setError(null);
      const results = await fetchNearby(coords);
      setStudios(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Find Studios Near Me</h1>
      <NearMeButton onCoords={handleCoords} />

      {loading && <p>Loading nearby studios...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-3">
        {studios.map((s) => (
          <li key={s.id} className="border p-3 rounded">
            <h2 className="font-semibold">{s.name}</h2>
            <p>{s.address}</p>
            <p className="text-sm text-gray-600">
              {formatDistance(s.distance_km)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

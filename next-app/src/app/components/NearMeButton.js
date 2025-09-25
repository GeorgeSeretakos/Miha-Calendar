"use client";

import { useState } from "react";

export default function NearMeButton({ onCoords }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleClick() {
    setErr(null);
    if (!("geolocation" in navigator)) {
      setErr("Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const { latitude, longitude } = pos.coords;
        onCoords?.({ lat: latitude, lng: longitude });
      },
      (e) => {
        setLoading(false);
        setErr(e.message || "Unable to get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {loading ? "Locating..." : "Near me"}
      </button>
      {err ? <p className="text-sm text-red-600 mt-2">{err}</p> : null}
    </div>
  );
}

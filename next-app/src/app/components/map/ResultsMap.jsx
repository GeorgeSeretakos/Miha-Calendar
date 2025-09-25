"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function ResultsMap({
center,          // { lat, lng } – the search location (e.g., "near me")
studios = [],    // [{ id, name, lat, lng }, ...]
radiusKm = 0,    // optional: draw search radius
className = "w-full h-[60vh] rounded-2xl overflow-hidden",
}) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Helper: clear all studio markers
  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const clearCircle = () => {
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
  };

  const setUserMarker = () => {
    if (!map.current || !center) return;

    // Custom simple SVG for the search location (blue dot with white ring)
    const userIcon = {
      path: "M16 8a8 8 0 1 1-16 0a8 8 0 0 1 16 0Z",
      fillColor: "#1E90FF",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
      scale: 1,
      anchor: new google.maps.Point(8, 8),
    };

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(center);
      return;
    }

    userMarkerRef.current = new google.maps.Marker({
      position: center,
      map: map.current,
      title: "Search location",
      icon: userIcon,
      zIndex: 9999,
    });
  };

  const drawRadius = () => {
    if (!map.current) return;
    clearCircle();
    if (!radiusKm || radiusKm <= 0 || !center) return;

    circleRef.current = new google.maps.Circle({
      strokeColor: "#1E90FF",
      strokeOpacity: 0.6,
      strokeWeight: 1,
      fillColor: "#1E90FF",
      fillOpacity: 0.08,
      map: map.current,
      center,
      radius: radiusKm * 1000,
      clickable: false,
    });
  };

  const placeStudioMarkers = () => {
    if (!map.current) return;

    clearMarkers();
    const info = new google.maps.InfoWindow();
    const bounds = new google.maps.LatLngBounds();

    // Include the search center in bounds
    if (center) bounds.extend(center);

    studios.forEach((s) => {
      const pos = { lat: Number(s.lat), lng: Number(s.lng) };
      if (!Number.isFinite(pos.lat) || !Number.isFinite(pos.lng)) return;

      const marker = new google.maps.Marker({
        position: pos,
        map: map.current,
        title: s.name || "Studio",
        // Slightly different color from default pin
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: "#EA4335", // Google red
          fillOpacity: 1,
          strokeColor: "#B3261E",
          strokeWeight: 1,
        },
      });

      marker.addListener("click", () => {
        const html = `<div style="font-weight:600">${s.name || "Studio"}</div>`;
        info.setContent(html);
        info.open({ anchor: marker, map: map.current });
      });

      markersRef.current.push(marker);
      bounds.extend(pos);
    });

    // Fit bounds (cap max zoom)
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds);
      google.maps.event.addListenerOnce(map.current, "bounds_changed", () => {
        const z = map.current.getZoom();
        if (z && z > 16) map.current.setZoom(16);
      });
    }
  };

  // Initialize map once
  useEffect(() => {
    let mounted = true;

    console.log("NEXT_PUBLIC_MAPS_BROWSER_KEY: ", process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY);
    console.log("NEXT_PUBLIC_BASE_URL: ", process.env.NEXT_PUBLIC_BASE_URL);

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY,
      version: "weekly",
    });

    (async () => {
      await loader.load();
      if (!mounted || !mapRef.current) return;

      map.current = new google.maps.Map(mapRef.current, {
        center: center || { lat: 37.9838, lng: 23.7275 }, // Athens fallback
        zoom: 13,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
      });

      setUserMarker();
      drawRadius();
      placeStudioMarkers();
    })();

    return () => {
      mounted = false;
      clearMarkers();
      clearCircle();
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  // Update on center / studios / radius changes
  useEffect(() => {
    if (!map.current) return;

    if (center) {
      map.current.setCenter(center);
      setUserMarker();
    }

    drawRadius();
    placeStudioMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng, radiusKm, JSON.stringify(studios)]);


  return <div ref={mapRef} className={className} />;
}

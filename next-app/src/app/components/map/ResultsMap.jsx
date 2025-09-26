"use client";

import { useEffect, useRef } from "react";
import {loadGoogleMaps} from "@lib/loadGoogleMaps";

/**
 * ResultsMap
 * Props:
 *  - active: boolean                         // if false, the map never initializes (saves quota)
 *  - center?: { lat: number, lng: number }   // user/search location
 *  - studios?: Array<{ id?: string|number, name?: string, lat: number, lng: number }>
 *  - radiusKm?: number                        // optional radius (km)
 *  - className?: string
 */
export default function ResultsMap({
active = false,
center = null,
studios = [],
radiusKm = 0,
className = "w-full h-[60vh] rounded-2xl overflow-hidden",
}) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);

  // ---- helpers ----
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
      userMarkerRef.current.setMap(map.current);
    } else {
      userMarkerRef.current = new google.maps.Marker({
        position: center,
        map: map.current,
        title: "Search location",
        icon: userIcon,
        zIndex: 9999,
      });
    }
  };

  const removeUserMarker = () => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
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

  const studioIcon = () => ({
    url: "/icons/pin.png", // /public/icons/pin.png
    scaledSize: new google.maps.Size(36, 36),
    anchor: new google.maps.Point(18, 36),
  });

  const placeStudioMarkers = () => {
    if (!map.current) return;

    clearMarkers();
    const info = new google.maps.InfoWindow();
    const bounds = new google.maps.LatLngBounds();
    let hasAny = false;

    if (center) {
      bounds.extend(center);
      hasAny = true;
    }

    studios.forEach((s) => {
      const pos = { lat: Number(s.lat), lng: Number(s.lng) };
      if (!Number.isFinite(pos.lat) || !Number.isFinite(pos.lng)) return;

      const marker = new google.maps.Marker({
        position: pos,
        map: map.current,
        title: s.name || "Studio",
        icon: studioIcon(),
      });

      marker.addListener("click", () => {
        info.setContent(`<div style="font-weight:600">${s.name || "Studio"}</div>`);
        info.open({ anchor: marker, map: map.current });
      });

      markersRef.current.push(marker);
      bounds.extend(pos);
      hasAny = true;
    });

    if (hasAny && !bounds.isEmpty()) {
      map.current.fitBounds(bounds);
      google.maps.event.addListenerOnce(map.current, "bounds_changed", () => {
        const z = map.current.getZoom();
        if (z && z > 16) map.current.setZoom(16);
      });
    }
  };

// ---------- init once ----------
  useEffect(() => {
    if (!active) return; // DO NOT load Google Maps when inactive (saves quota)

    let mounted = true;

    (async () => {
      // Load the SDK once (with Places) via our singleton
      if (!window.google?.maps) {
        await loadGoogleMaps();
      }
      if (!mounted || !mapRef.current) return;

      map.current = new google.maps.Map(mapRef.current, {
        center: center || { lat: 38.5, lng: 23.7 }, // sensible default; will re-fit with markers
        zoom: center ? 13 : 6,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
      });

      if (center) setUserMarker();
      drawRadius();
      if (center || (studios && studios.length > 0)) {
        placeStudioMarkers();
      }
    })();

    return () => {
      mounted = false;
      clearMarkers();
      clearCircle();
      removeUserMarker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]); // initialize only when becoming active


  // ---------- react to prop changes ----------
  useEffect(() => {
    if (!active || !map.current) return;

    const hasStudios = Array.isArray(studios) && studios.length > 0;

    if (center) {
      map.current.setCenter(center);
      if (!hasStudios) map.current.setZoom(13);
      setUserMarker();
    } else {
      removeUserMarker();
    }

    drawRadius();
    placeStudioMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, center?.lat, center?.lng, radiusKm, JSON.stringify(studios)]);

  if (!active) return null; // render nothing (parent shows the static image)
  return <div ref={mapRef} className={className} />;
}

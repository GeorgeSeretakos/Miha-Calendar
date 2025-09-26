import { Loader } from "@googlemaps/js-api-loader";

let loaderPromise = null;

/**
 * Loads Google Maps JS SDK once (with Places).
 * Any component can call this — it will reuse the same promise.
 */
export function loadGoogleMaps() {
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY,
      version: "weekly",
      id: "__googleMapsScriptId",
      libraries: ["places"], // superset: covers maps + Places autocomplete
    });
    loaderPromise = loader.load();
  }
  return loaderPromise;
}

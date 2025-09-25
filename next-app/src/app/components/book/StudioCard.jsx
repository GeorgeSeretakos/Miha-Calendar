"use client";

export default function StudioCard({
studio = {},
onClick,
}) {
  const name = studio.name || "Studio EMS";
  const image = studio.photoUrls?.[0];
  const address = studio.address || "Άγνωστη τοποθεσία";

  // Ευθεία απόσταση
  const distance = typeof studio.distance === "number" ? studio.distance : null;
  const distanceLabel =
    distance != null
      ? distance < 1000
        ? `${Math.round(distance)} μ`
        : `${(distance / 1000).toFixed(1)} χλμ`
      : null;

  // Απόσταση κίνησης (sway distance)
  const sway = typeof studio.sway_distance === "number" ? studio.sway_distance : null;
  const swayLabel =
    sway != null
      ? sway < 1000
        ? `${Math.round(sway)} μ`
        : `${(sway / 1000).toFixed(1)} χλμ`
      : null;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-64"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {/* Εικόνα */}
      <div className="relative w-full h-[50%]">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>

      {/* Περιεχόμενο */}
      <div className="flex flex-col flex-1 p-4">
        <h4 className="text-gray-900 font-semibold leading-tight line-clamp-2">
          {name}
        </h4>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{address}</p>

        <div className="mt-auto space-y-1 text-sm font-medium text-gray-800">
          {distanceLabel && <p>{distanceLabel} μακριά</p>}
          {swayLabel && <p>{swayLabel} μακριά</p>}
        </div>
      </div>
    </div>
  );
}

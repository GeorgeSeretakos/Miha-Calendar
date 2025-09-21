"use client";

export default function StudioCard({
                                     studio = {},
                                     locale = "el",
                                     onClick, // optional
                                   }) {
  const name = studio.name || (locale === "en" ? "EMS Studio" : "Studio EMS");
  const image = studio.image || "/images/general/placeholder.jpg";
  const address = studio.address || (locale === "en" ? "Unknown location" : "Άγνωστη τοποθεσία");
  const distance = typeof studio.distance === "number" ? studio.distance : null;

  const distanceLabel =
    distance != null
      ? distance < 1000
        ? `${Math.round(distance)} m`
        : `${(distance / 1000).toFixed(1)} km`
      : null;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-64" // fixed height like BlogCard
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {/* Image: ~50% of card height */}
      <div className="relative w-full h-[50%]">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>

      {/* Content: ~50% */}
      <div className="flex flex-col flex-1 p-4">
        <h4 className="text-gray-900 font-semibold leading-tight line-clamp-2">{name}</h4>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{address}</p>

        {distanceLabel && (
          <p className="mt-auto text-sm font-medium text-gray-800">
            {locale === "en" ? "Distance:" : "Απόσταση:"} {distanceLabel}
          </p>
        )}
      </div>
    </div>
  );
}

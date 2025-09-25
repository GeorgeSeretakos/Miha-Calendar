"use client";

export default function OfficePreview({
                                        locale = "el",
                                        title = "Ο χώρος μας",
                                        description = "Φροντίζουμε ο χώρος μας να σε κάνει να νιώθεις άνετα και ευχάριστα κάθε φορά που έρχεσαι.",
                                        images = [],
                                      }) {
  const isEN = locale === "en";
  const tTitle = title || (isEN ? "Our Space" : "Ο χώρος μας");
  const tDesc =
    description ||
    (isEN
      ? "We make sure our space feels comfortable and pleasant every time you visit."
      : "Φροντίζουμε ο χώρος μας να σε κάνει να νιώθεις άνετα και ευχάριστα κάθε φορά που έρχεσαι.");

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="title-black">{tTitle}</h2>
          <div className="max-w-xl mb-8">
            {/*<p className="text-gray-700 text-lg">{tDesc}</p>*/}
            {/* No CTA here by request */}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(images || []).slice(0, 6).map((src, idx) => (
            <div
              key={idx}
              className="relative w-full aspect-[5/3] shadow-lg overflow-hidden bg-white"
            >
              <img
                src={src}
                alt={`Office ${idx + 1}`}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

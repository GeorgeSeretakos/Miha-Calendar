"use client";

export default function StudioInfoCards({
                                          locale = "el",
                                          address,
                                          email,
                                          phones = [],
                                          socials = {}, // { facebook?, instagram?, website? }
                                          hours = null, // { monday:"", ... sunday:"" }
                                        }) {
  const L = locale === "en";

  const days = [
    { key: "monday",    el: "Δευτέρα",    en: "Monday" },
    { key: "tuesday",   el: "Τρίτη",      en: "Tuesday" },
    { key: "wednesday", el: "Τετάρτη",    en: "Wednesday" },
    { key: "thursday",  el: "Πέμπτη",     en: "Thursday" },
    { key: "friday",    el: "Παρασκευή",  en: "Friday" },
    { key: "saturday",  el: "Σάββατο",    en: "Saturday" },
    { key: "sunday",    el: "Κυριακή",    en: "Sunday" },
  ];

  return (
    <>
      {/* Contact Info */}
      <div className="bg-white/5 p-6 rounded-lg text-sm sm:text-base">
        <div className="mb-4">
          <strong>{L ? "Address" : "Διεύθυνση"}</strong>
          <ul className="list-disc pl-5">
            <li>{address || "—"}</li>
          </ul>
        </div>

        <div className="mb-4">
          <strong>{L ? "Phone" : "Τηλέφωνο"}</strong>
          <ul className="list-disc pl-5">
            {(phones && phones.length > 0 ? phones : []).map((p, i) => (
              <li key={i}>
                <a href={`tel:${p}`} className="hover:underline">
                  {p}
                </a>
              </li>
            ))}
            {(!phones || phones.length === 0) && <li>—</li>}
          </ul>
        </div>

        <div className="mb-4">
          <strong>Email</strong>
          <ul className="list-disc pl-5">
            <li>
              {email ? (
                <a href={`mailto:${email}`} className="text-blue-400 hover:underline">
                  {email}
                </a>
              ) : (
                "—"
              )}
            </li>
          </ul>
        </div>

        {(socials?.facebook || socials?.instagram || socials?.website) && (
          <div className="mb-0">
            <strong>{L ? "Social" : "Κοινωνικά δίκτυα"}</strong>
            <ul className="list-disc pl-5">
              {socials.website && (
                <li>
                  <a href={socials.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {L ? "Website" : "Ιστότοπος"}
                  </a>
                </li>
              )}
              {socials.facebook && (
                <li>
                  <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Facebook
                  </a>
                </li>
              )}
              {socials.instagram && (
                <li>
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Working Hours */}
      <div className="bg-white/5 p-6 rounded-lg text-sm sm:text-base">
        <div className="mb-4">
          <strong>{L ? "Opening Hours" : "Ώρες Λειτουργίας"}</strong>
        </div>

        <ul className="space-y-2">
          {days.map((d) => {
            const val = hours?.[d.key];
            return (
              <li
                key={d.key}
                className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-gray-200 font-medium">{L ? d.en : d.el}</span>
                <span className="text-gray-300">
                  {val || (d.key === "sunday" ? (L ? "Closed" : "Κλειστά") : "09:00 – 21:00")}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

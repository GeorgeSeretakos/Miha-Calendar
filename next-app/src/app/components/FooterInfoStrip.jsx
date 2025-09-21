"use client";

export default function FooterInfoStrip({ locale = "el" }) {
  return (
    <footer className="py-6 bg-white/5 text-center mx-auto">
      <div className="max-w-6xl mx-auto flex flex-col items-center md:items-start gap-6 px-4">
        {/* Logo always on top */}
        <div className="w-full mx-auto max-w-[200px] md:max-w-[250px]">
          <img
            src="/logo/3.png"
            alt="Miha Bodytec Logo"
            className="w-full h-auto object-contain mx-auto md:mx-0"
          />
        </div>

        {/* Text + Social */}
        <div className="content flex font-bold flex-col items-center gap-3 w-full">
          <p>
            &copy; 2025 FF Medical &amp; Wellness.{" "}
            {locale === "en" ? "All rights reserved." : "Όλα τα δικαιώματα διατηρούνται."}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <a href="mailto:ffmedicwell@gmail.com" className="hover:underline">
              ffmedicwell@gmail.com
            </a>
            <span className="hidden sm:inline">·</span>
            <a href="tel:2108070010" className="hover:underline">
              210 8070010
            </a>
            <span className="hidden sm:inline">·</span>
            <a href="tel:2112143161" className="hover:underline">
              211 2143161
            </a>
            <span className="hidden sm:inline">·</span>
            <a href="/privacy-policy" className="hover:underline">
              {locale === "en" ? "Privacy Policy" : "Πολιτική Απορρήτου"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

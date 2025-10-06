import { Suspense } from "react";
import ThankYouContent from "./thank-you.client"; // client file below

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-300">Φόρτωση…</div>}>
      <ThankYouContent />
    </Suspense>
  );
}

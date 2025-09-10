import Link from "next/link";

export const metadata = { robots: { index: false, follow: false } }

export default function ThankYou() {
  return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Ευχαριστούμε για την επικοινωνία σας!
      </h1>
      <Link
        href="/"
        className="text-sky-400 underline hover:text-sky-300 transition"
      >
        Επιστροφή στην αρχική σελίδα
      </Link>
    </main>
  );
}
import { prisma } from "@lib/prisma";
import AvailabilityBoard from "@components/book/AvailabilityBoard";
import AppointmentForm from "@components/book/AppointmentForm";
import IntroSection from "@/app/components/IntroSection";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import FooterInfoStrip from "../../../../components/FooterInfoStrip";

export const revalidate = 600;

export default async function AvailabilityPage(props) {
  const { slug } = await props.params;          // ✅ await the object, not params.slug

  const studio = await prisma.studio.findUnique({ where: { slug } });
  if (!studio) return notFound();

  return (
    <main className="flex flex-col">
      <IntroSection
        image={studio.photoUrls?.[0]}
        title={null}
        paragraph={
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2>{studio.name}</h2>
                <p className="text-gray-700 mt-1 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  {studio.address}
                </p>
              </div>
              <a href={`/book/studio/${studio.slug}`} className="btn self-start sm:self-auto">
                Προβολή Στούντιο
              </a>
            </div>
          </div>
        }
      />

      {/* Booking section */}
      <div className="w-full py-12 bg-[#111315]">
        <div className="mx-auto max-w-[96rem] w-full grid grid-cols-1 lg:grid-cols-[60%_35%] gap-8 items-stretch justify-center">
          <div className="h-full min-w-0">
            <AvailabilityBoard
              studioId={studio.id}
              defaultTimezone={studio.timezone || "Europe/Athens"}
              embedded
            />
          </div>
          <div className="h-full min-w-0">
            <AppointmentForm
              embedded
              studioId={studio.id}
              defaultTimezone={studio.timezone || "Europe/Athens"}
            />
          </div>
        </div>
      </div>

      <FooterInfoStrip />
    </main>
  );
}

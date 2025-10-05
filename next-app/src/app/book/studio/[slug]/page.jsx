import { prisma } from '@lib/prisma'
import IntroSection from '../../../components/IntroSection'
import FooterInfoStrip from '../../../components/FooterInfoStrip'
import { MapPin, Globe } from "lucide-react"
import OfficePreview from '../../../components/book/OfficePreview'
import { notFound } from 'next/navigation'
import ServicesList from "../../../components/book/ServicesList";
import ContactAndHours from "../../../components/book/ContactHours";

export const revalidate = 600

export default async function StudioSlugPage({ params }) {
  const studio = await prisma.studio.findUnique({
    where: { slug: params.slug },
  })
  if (!studio) return notFound();
  const locale = 'el'

  return (
    <main className="flex flex-col">
      <IntroSection
        image={studio.photoUrls?.[0]}
        title={null}
        paragraph={
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold">{studio.name}</h2>

                <div className="mt-1 space-y-1">
                  {studio.address && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500"/>
                      {studio.address}
                    </p>
                  )}

                  {studio.website && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <a
                        href={studio.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                        aria-label="Ιστότοπος στο νέο παράθυρο"
                        title="Άνοιγμα ιστότοπου"
                      >
                        {studio.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <a
                href={`/book/studio/${studio.slug}/availability`}
                className="btn self-start sm:self-auto"
              >
                Κλείσε Προπόνηση
              </a>
            </div>
          </div>
        }
      />

      <ContactAndHours studio={studio} />

      {studio.services?.length > 0 && (
        <section className="py-6">
          <ServicesList services={studio.services} />
        </section>
      )}

      <OfficePreview
        locale={locale}
        images={studio.photoUrls?.slice(0, 6) || []}
      />

      <section className="w-full">
        <iframe
          src={studio?.iframeSrc}
          className="w-full"
          height="420"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Χάρτης — ${studio.name}`}
        />
      </section>

      <FooterInfoStrip locale={locale} />
    </main>
  )
}

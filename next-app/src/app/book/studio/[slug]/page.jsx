// app/book/studio/[slug]/page.jsx
// NO "use client"
import { prisma } from '@lib/prisma'
import IntroSection from '../../../components/IntroSection'
import FooterInfoStrip from '../../../components/FooterInfoStrip'
import { MapPin, Phone, Mail, Clock, Dumbbell } from "lucide-react"
import OfficePreview from '../../../components/book/OfficePreview'
import { notFound } from 'next/navigation'
import ServicesList from "../../../components/book/ServicesList";
import ContactAndHours from "../../../components/book/ContactHours";

// Cache HTML for 10 minutes (tune as needed)
export const revalidate = 600

function buildMapSrc(studio, locale = 'el') {
  if (studio.lat && studio.lng) {
    return `https://www.google.com/maps?q=${studio.lat},${studio.lng}&hl=${locale === 'en' ? 'en' : 'el'}&z=15&output=embed`
  }
  if (studio.address) {
    const q = encodeURIComponent(studio.address)
    return `https://www.google.com/maps?q=${q}&hl=${locale === 'en' ? 'en' : 'el'}&z=15&output=embed`
  }
  return ''
}

export default async function StudioSlugPage({ params }) {
  const studio = await prisma.studio.findUnique({
    where: { slug: params.slug },
  })
  if (!studio) return notFound()

  const locale = 'el'
  const mapSrc = buildMapSrc(studio, locale)

  return (
    <main className="flex flex-col">
      {/* Banner image with content below: name + address + CTA on right */}
      <IntroSection
        image={studio.photoUrls?.[0]}
        title={null}
        paragraph={
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left side: name + address */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold">{studio.name}</h2>
                <p className="text-gray-700 mt-1 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500"/>
                  {studio.address}
                </p>
              </div>

              {/* Right side: button */}
              <a
                href={`/book/studio/${studio.slug}#book`}
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


      {/* Office / gallery preview (first 6 images) */}
      <OfficePreview
        locale={locale}
        images={studio.photoUrls?.slice(0, 6) || []}
      />

      {/* Full-width map */}
      {mapSrc && (
        <section className="w-full">
          <iframe
            src={mapSrc}
            className="w-full"
            height="420"
            style={{border: 0}}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={studio.name}
          />
        </section>
      )}

      <FooterInfoStrip locale={locale}/>
    </main>
  )
}

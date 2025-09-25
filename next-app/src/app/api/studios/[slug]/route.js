import { prisma } from '@lib/prisma'
import { slugify } from '@lib/slugify'

const ALLOWED_FIELDS = ['name', 'address', 'lat', 'lng', 'phone', 'email', 'photoUrls', 'isActive']
const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)))

export async function GET(_req, { params }) {
  const { slug } = await params;
  const studio = await prisma.studio.findUnique({ where: { slug } })
  if (!studio) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ studio })
}

export async function PUT(req, { params }) {
  const { slug } = await params;
  const existing = await prisma.studio.findUnique({ where: { slug } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data = pick(body, ALLOWED_FIELDS)

    // Optional: if name changes, re-slug uniquely
    let nextSlug = slug
    if (typeof data.name === 'string' && data.name.trim().length >= 2) {
      const base = slugify(data.name)
      if (base && base !== slug) {
        nextSlug = base
        let i = 2
        while (await prisma.studio.findUnique({ where: { slug: nextSlug } })) {
          nextSlug = `${base}-${i++}`
        }
      }
    }

    if (data.photoUrls && !Array.isArray(data.photoUrls)) {
      return Response.json({ error: 'photoUrls must be an array of strings' }, { status: 400 })
    }

    const studio = await prisma.studio.update({
      where: { slug },
      data: { ...data, slug: nextSlug }
    })

    return Response.json({ studio })
  } catch {
    return Response.json({ error: 'Invalid JSON or server error' }, { status: 400 })
  }
}

export async function DELETE(_req, { params }) {
  const { slug } = await params;
  try {
    await prisma.studio.delete({ where: { slug } })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
}
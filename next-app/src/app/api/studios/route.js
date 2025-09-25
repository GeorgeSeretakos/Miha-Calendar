import { prisma } from '@lib/prisma'
import { slugify } from '@lib/slugify'

// allow-list to avoid mass assignment
const ALLOWED_FIELDS = ['name', 'address', 'lat', 'lng', 'phone', 'email', 'photoUrls', 'isActive']
const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)))

export async function GET() {
  const studios = await prisma.studio.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return Response.json({ studios })
}

export async function POST(req) {
  try {
    const body = await req.json()
    const data = pick(body, ALLOWED_FIELDS)

    // minimal guards (since we're skipping Zod for now)
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      return Response.json({ error: 'name is required (min 2 chars)' }, { status: 400 })
    }
    if (data.photoUrls && !Array.isArray(data.photoUrls)) {
      return Response.json({ error: 'photoUrls must be an array of strings' }, { status: 400 })
    }

    // ensure unique slug
    const base = slugify(data.name)
    let slug = base || `studio`
    let i = 2
    while (await prisma.studio.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`
    }

    const studio = await prisma.studio.create({
      data: {
        slug,
        ...data,
        photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : []
      }
    })

    return Response.json({ studio }, { status: 201 })
  } catch (e) {
    return Response.json({ error: 'Invalid JSON or server error' }, { status: 400 })
  }
}
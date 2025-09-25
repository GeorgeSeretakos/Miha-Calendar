import { prisma } from '@lib/prisma'

export async function GET() {
  const studios = await prisma.studio.findMany()
  return new Response(JSON.stringify({ studios }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

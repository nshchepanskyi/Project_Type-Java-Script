export const dynamic = 'force-dynamic'

import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const pagePath = searchParams.get('path') || '/'

  const payload = await getPayload({ config })

  const pages = await payload.find({
    collection: 'pages',
    where: { path: { equals: pagePath } },
    limit: 1,
  })

  const page = pages.docs[0]
  if (!page) {
    return Response.json({ error: 'Page not found' }, { status: 404 })
  }

  return Response.json({
    meta: {
      title: page.title,
      description: page.description || '',
    },
    blocks: page.blocks || [],
  })
}

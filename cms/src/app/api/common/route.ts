export const dynamic = 'force-dynamic'

import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET() {
  const payload = await getPayload({ config })

  let settings: { siteName?: string } = {}
  try {
    settings = await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    settings = { siteName: 'GrandStay' }
  }

  const nav = [
    { label: 'Home', path: '/' },
    { label: 'Book', path: '/places' },
    { label: 'My Bookings', path: '/bookings' },
  ]

  return Response.json({
    siteName: settings.siteName || 'GrandStay',
    nav,
    footer: {
      links: [
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Help Center', path: '/help' },
      ],
      copy: `© ${new Date().getFullYear()} GrandStay Hotel · All rights reserved`,
    },
  })
}

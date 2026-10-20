import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Rooms } from './collections/Rooms'
import { Guests } from './collections/Guests'
import { Reservations } from './collections/Reservations'
import { Services } from './collections/Services'
import { ServiceOrders } from './collections/ServiceOrders'
import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Rooms, Guests, Reservations, Services, ServiceOrders, Pages],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  cors: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  endpoints: [
    {
      path: '/api/common',
      method: 'get',
      handler: async (req) => {
        const { payload } = req

        const settings = await payload.findGlobal({ slug: 'site-settings' })

        const nav = [
          { label: 'Home', path: '/' },
          { label: 'Book', path: '/places' },
          { label: 'My Bookings', path: '/bookings' },
        ]

        return Response.json({
          siteName: settings.siteName,
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
      },
    },
    {
      path: '/api/page',
      method: 'get',
      handler: async (req) => {
        const { payload, query } = req
        const pagePath = (query as Record<string, string>).path || '/'

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
      },
    },
  ],
  upload: {
    limits: { fileSize: 5000000 },
  },
})

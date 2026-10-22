import type { CollectionConfig } from 'payload'
import path from 'path'
import { canSeeStaffAdmin, staffOnly } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    admin: canSeeStaffAdmin,
    read: () => true,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'public/media'),
    mimeTypes: ['image/*'],
  },
  admin: {
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}

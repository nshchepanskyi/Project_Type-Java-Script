import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path, e.g. / or /about',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'blocks',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            'hero',
            'rooms-grid',
            'features',
            'cta',
            'text',
          ],
        },
        {
          name: 'data',
          type: 'json',
          admin: {
            description: 'Block-specific JSON data',
          },
        },
      ],
    },
  ],
}

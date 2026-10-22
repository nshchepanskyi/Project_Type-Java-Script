import type { CollectionConfig } from 'payload'
import { canSeeStaffAdmin, staffOnly } from '../access/roles'

export const Services: CollectionConfig = {
  slug: 'services',
  access: {
    admin: canSeeStaffAdmin,
    read: () => true,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
  ],
}

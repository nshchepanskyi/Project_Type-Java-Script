import type { CollectionConfig } from 'payload'
import { canSeeStaffAdmin, isStaffUser, staffOnly } from '../access/roles'

export const Guests: CollectionConfig = {
  slug: 'guests',
  access: {
    admin: canSeeStaffAdmin,
    read: ({ req }) => {
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      return { email: { equals: req.user.email } }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      return { email: { equals: req.user.email } }
    },
    delete: ({ req }) => isStaffUser(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email'],
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.user && !isStaffUser(req.user)) {
          return { ...data, email: req.user.email }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
  ],
}

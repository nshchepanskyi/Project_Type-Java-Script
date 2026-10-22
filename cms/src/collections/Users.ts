import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    // Public account creation is required for the site's registration form.
    // The role field below remains admin-only, so new accounts use `guest`.
    create: () => true,
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { id: { equals: req.user.id } }
    },
    update: ({ req, id }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return String(req.user.id) === String(id)
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'manager', 'guest'],
      defaultValue: 'guest',
      required: true,
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}

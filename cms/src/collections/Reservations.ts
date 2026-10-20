import type { CollectionConfig } from 'payload'

export const Reservations: CollectionConfig = {
  slug: 'reservations',
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['guest', 'room', 'checkIn', 'checkOut', 'status', 'stayType'],
  },
  fields: [
    {
      name: 'guest',
      type: 'relationship',
      relationTo: 'guests',
      required: true,
    },
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      required: true,
    },
    {
      name: 'checkIn',
      type: 'date',
      required: true,
    },
    {
      name: 'checkOut',
      type: 'date',
      required: true,
    },
    {
      name: 'guests',
      label: 'Number of Guests',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 8,
    },
    {
      name: 'stayType',
      type: 'select',
      options: [
        { label: 'Night Stay', value: 'Night' },
        { label: 'Day Use (07:00–23:59)', value: 'Day' },
      ],
      defaultValue: 'Night',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['Pending', 'Checked-In', 'Checked-Out'],
      defaultValue: 'Pending',
      required: true,
    },
  ],
}

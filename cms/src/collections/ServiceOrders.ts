import type { CollectionConfig } from 'payload'

export const ServiceOrders: CollectionConfig = {
  slug: 'service-orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['reservation', 'serviceName', 'quantity', 'total', 'paid', 'status'],
  },
  fields: [
    {
      name: 'reservation',
      type: 'relationship',
      relationTo: 'reservations',
      required: true,
    },
    {
      name: 'serviceName',
      type: 'text',
      required: true,
    },
    {
      name: 'servicePrice',
      type: 'number',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      defaultValue: 1,
      min: 1,
      required: true,
    },
    {
      name: 'total',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      options: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      defaultValue: 'Pending',
    },
    {
      name: 'paid',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.servicePrice && data.quantity) {
          data.total = data.servicePrice * data.quantity
        }
        return data
      },
    ],
  },
}

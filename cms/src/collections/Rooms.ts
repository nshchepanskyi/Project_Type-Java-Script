import type { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['number', 'title', 'roomType', 'price', 'status'],
  },
  fields: [
    {
      name: 'number',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'roomType',
      type: 'select',
      options: ['Single', 'Double', 'Suite'],
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      options: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
      defaultValue: 'Available',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      defaultValue: 'Kyiv, Ukraine',
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      defaultValue: 2,
      min: 1,
    },
    {
      name: 'rating',
      type: 'number',
      defaultValue: 4.5,
      min: 1,
      max: 5,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
    },
  ],
}

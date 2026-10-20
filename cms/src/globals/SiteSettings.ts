import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'GrandStay',
      required: true,
    },
    {
      name: 'siteTagline',
      type: 'text',
      defaultValue: 'Comfortable rooms in the heart of the city',
    },
    {
      name: 'supportEmail',
      type: 'email',
      defaultValue: 'support@grandstay.hotel',
    },
    {
      name: 'serviceFeeRate',
      type: 'number',
      defaultValue: 0.12,
      admin: {
        description: 'Service fee rate (e.g. 0.12 = 12%)',
      },
    },
    {
      name: 'checkInTime',
      type: 'text',
      defaultValue: '14:00',
    },
    {
      name: 'checkOutTime',
      type: 'text',
      defaultValue: '12:00',
    },
  ],
}

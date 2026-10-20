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

import type { CollectionConfig } from 'payload'
import { canSeeStaffAdmin, isStaffUser, staffOnly } from '../access/roles'

export const Reservations: CollectionConfig = {
  slug: 'reservations',
  access: {
    admin: canSeeStaffAdmin,
    read: async ({ req }) => {
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      const guests = await req.payload.find({
        collection: 'guests',
        where: { email: { equals: req.user.email } },
        limit: 100,
        overrideAccess: true,
      })
      const ids = guests.docs.map((guest) => guest.id)
      return ids.length ? { guest: { in: ids } } : false
    },
    create: ({ req }) => Boolean(req.user),
    update: async ({ req }) => {
      if (!req.user) return false
      if (isStaffUser(req.user)) return true
      const guests = await req.payload.find({
        collection: 'guests',
        where: { email: { equals: req.user.email } },
        limit: 100,
        overrideAccess: true,
      })
      const ids = guests.docs.map((guest) => guest.id)
      return ids.length ? { guest: { in: ids } } : false
    },
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['guest', 'room', 'checkIn', 'checkOut', 'status', 'stayType'],
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        const user = req.user
        if (!user) throw new Error('Sign in before creating a reservation.')

        const merged = { ...originalDoc, ...data }
        const roomId = typeof merged.room === 'object' ? merged.room?.id : merged.room
        const guestId = typeof merged.guest === 'object' ? merged.guest?.id : merged.guest
        if (!roomId || !guestId || !merged.checkIn || !merged.checkOut) {
          throw new Error('Room, guest, check-in and check-out are required.')
        }

        const guest = await req.payload.findByID({
          collection: 'guests',
          id: guestId,
          depth: 0,
          overrideAccess: true,
        })
        const isStaff = isStaffUser(user)
        if (!isStaff && guest.email?.toLowerCase() !== user.email?.toLowerCase()) {
          throw new Error('You can only book for your own account.')
        }

        const room = await req.payload.findByID({
          collection: 'rooms',
          id: roomId,
          depth: 0,
          overrideAccess: true,
        })
        const count = Number(merged.guests || 1)
        if (count > room.capacity) throw new Error('Guest count exceeds room capacity.')
        if (room.status !== 'Available') throw new Error('This room is not available.')

        const checkIn = String(merged.checkIn).slice(0, 10)
        const checkOut = String(merged.checkOut).slice(0, 10)
        const stayType = merged.stayType || 'Night'
        if (stayType === 'Night' && checkOut <= checkIn) {
          throw new Error('Check-out must be after check-in.')
        }
        if (stayType === 'Day' && checkOut !== checkIn) {
          throw new Error('A day stay must start and end on the same date.')
        }

        const reservations = await req.payload.find({
          collection: 'reservations',
          where: { room: { equals: roomId }, status: { not_equals: 'Checked-Out' } },
          limit: 500,
          depth: 0,
          overrideAccess: true,
        })
        const currentId = String(originalDoc?.id ?? '')
        const overlaps = reservations.docs.some((reservation) => {
          if (String(reservation.id) === currentId) return false
          const existingIn = String(reservation.checkIn).slice(0, 10)
          const existingOut = String(reservation.checkOut).slice(0, 10)
          const existingDay = reservation.stayType === 'Day'
          if (stayType === 'Day' && existingDay) return checkIn === existingIn
          if (stayType === 'Day') return checkIn >= existingIn && checkIn <= existingOut
          if (existingDay) return existingIn >= checkIn && existingIn <= checkOut
          return checkIn < existingOut && existingIn < checkOut
        })
        if (overlaps) throw new Error('This room is already reserved for those dates.')

        return {
          ...data,
          guests: count,
          stayType,
          status: isStaff ? merged.status : operation === 'create' ? 'Pending' : originalDoc?.status || 'Pending',
        }
      },
    ],
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
      access: {
        update: ({ req }) => isStaffUser(req.user),
      },
    },
  ],
}

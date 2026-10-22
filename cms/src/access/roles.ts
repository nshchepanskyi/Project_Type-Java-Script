import type { Access } from 'payload'

export function isStaffUser(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false
  const role = (user as { role?: unknown }).role
  return role === 'admin' || role === 'manager'
}

export const staffOnly: Access = ({ req }) => isStaffUser(req.user)

export function canSeeStaffAdmin({ req }: { req: { user: unknown } }): boolean {
  return isStaffUser(req.user)
}

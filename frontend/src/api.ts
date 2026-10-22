import type { Room } from './types'

export const CMS_URL = (import.meta.env.VITE_CMS_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')).replace(/\/$/, '')
const SESSION_KEY = 'grandstay.session'

export interface Session {
  token: string
  user: { id: number | string; email: string; name?: string; role?: string }
}

export function isStaff(session: Session | null = getSession()): boolean {
  return session?.user.role === 'admin' || session?.user.role === 'manager'
}

export interface Reservation {
  id: number | string
  guest: { id: number | string; name: string; email?: string } | number | string
  room: Room | number | string
  checkIn: string
  checkOut: string
  guests: number
  stayType: 'Night' | 'Day'
  status: string
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    return session.token && session.user ? session : null
  } catch {
    return null
  }
}

function saveSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

async function request<T>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (authenticated) {
    const session = getSession()
    if (!session) throw new Error('Please sign in to continue.')
    headers.set('Authorization', `JWT ${session.token}`)
  }

  const response = await fetch(`${CMS_URL}${path}`, { ...options, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = body?.errors?.[0]?.message || body?.message || 'Request failed. Please try again.'
    if (response.status === 401 && authenticated) saveSession(null)
    throw new Error(message)
  }
  return body as T
}

export async function fetchCommon() {
  return request<{ siteName: string; nav: Array<{ label: string; path: string }>; footer: { links: Array<{ label: string; path: string }>; copy: string } }>('/api/common')
}

export async function fetchPage(path: string) {
  return request<{ meta: { title: string; description: string }; blocks: Array<{ type: string; data?: Record<string, unknown> }> }>(`/api/page?path=${encodeURIComponent(path)}`)
}

export async function fetchRooms(params?: Record<string, string>) {
  const query = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      const normalized = value?.trim()
      if (!normalized) continue
      if (key === 'location') {
        query.set('where[location][contains]', normalized)
      } else if (key === 'roomType') {
        query.set('where[roomType][equals]', normalized)
      } else if (key === 'guests') {
        query.set('where[capacity][greater_than_equal]', normalized)
      } else {
        query.set(key, normalized)
      }
    }
  }
  const search = query.toString()
  const qs = search ? `?${search}` : ''
  return request<{ docs: Room[]; totalDocs: number }>(`/api/rooms${qs}`)
}

export async function fetchRoom(number: string) {
  const data = await fetchRooms({ 'where[number][equals]': number, depth: '1', limit: '1' })
  if (!data.docs?.[0]) throw new Error('Room not found')
  return data.docs[0]
}

export async function signIn(email: string, password: string) {
  const result = await request<{ token: string; user: Session['user'] }>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveSession(result)
  return result
}

export async function registerAccount(name: string, email: string, password: string) {
  await request('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  return signIn(email, password)
}

export function signOut() {
  saveSession(null)
}

export async function fetchMyReservations() {
  const email = getSession()?.user.email
  if (!email) throw new Error('Please sign in to view your bookings.')
  const where = new URLSearchParams({
    'where[guest.email][equals]': email,
    depth: '1',
    limit: '100',
    sort: '-createdAt',
  })
  const result = await request<{ docs: Reservation[] }>(`/api/reservations?${where}`, {}, true)
  return result.docs
}

export async function createReservation(input: {
  room: Room
  name: string
  phone: string
  checkIn: string
  checkOut: string
  guests: number
  stayType: 'Night' | 'Day'
}) {
  const email = getSession()?.user.email
  if (!email) throw new Error('Sign in before booking a room.')

  const found = await request<{ docs: Array<{ id: number | string }> }>(
    `/api/guests?where[email][equals]=${encodeURIComponent(email)}&limit=1`,
    {},
    true,
  )
  let guestId = found.docs[0]?.id
  if (!guestId) {
    const guest = await request<{ doc: { id: number | string }; id?: number | string }>(
      '/api/guests',
      { method: 'POST', body: JSON.stringify({ name: input.name, email, phone: input.phone }) },
      true,
    )
    guestId = guest.doc?.id ?? guest.id
  }
  if (!guestId) throw new Error('Could not prepare the guest profile.')

  return request<{ doc: Reservation }>('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({
      guest: guestId,
      room: input.room.id,
      checkIn: input.checkIn,
      checkOut: input.stayType === 'Day' ? input.checkIn : input.checkOut,
      guests: input.guests,
      stayType: input.stayType,
      status: 'Pending',
    }),
  }, true)
}

export async function updateMyProfile(name: string) {
  const session = getSession()
  if (!session) throw new Error('Please sign in to update your profile.')
  const result = await request<{ doc?: Session['user']; name?: string }>(`/api/users/${session.user.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  }, true)
  session.user = { ...session.user, ...result.doc, name: result.doc?.name ?? result.name ?? name }
  saveSession(session)
  return session.user
}

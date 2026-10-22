import {
  createReservation,
  fetchMyReservations,
  fetchRoom,
  fetchRooms,
  getSession,
  registerAccount,
  signIn,
  updateMyProfile,
} from './api'
import type { Room } from './types'
import { renderPlaceCard } from './blocks/placeCard'
import { getFavoriteNumbers } from './favorites'


export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]!)
}

function authCard(title: string, body: string): string {
  return `<section class="auth-page-inline"><div class="auth-card"><h1>${title}</h1>${body}</div></section>`
}

export function renderLogin(message = ''): string {
  return authCard('Welcome back', `
    ${message ? `<div class="msg error page-message">${escapeHtml(message)}</div>` : ''}
    <form id="login-form">
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
      <button class="btn primary" type="submit">Sign in</button>
    </form>
    <p class="auth-switch">New to GrandStay? <a href="/register">Create an account</a></p>
  `)
}

export function renderRegister(message = ''): string {
  return authCard('Create your account', `
    ${message ? `<div class="msg error page-message">${escapeHtml(message)}</div>` : ''}
    <form id="register-form">
      <label>Full name<input name="name" autocomplete="name" required maxlength="120"></label>
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<input name="password" type="password" autocomplete="new-password" minlength="10" required></label>
      <button class="btn primary" type="submit">Create account</button>
    </form>
    <p class="auth-switch">Already have an account? <a href="/login">Sign in</a></p>
  `)
}

export async function renderBookingForm(): Promise<string> {
  const session = getSession()
  if (!session) return renderLogin('Sign in or create an account before booking.')

  const params = new URLSearchParams(location.search)
  const rooms = (await fetchRooms({ depth: '1', limit: '100' })).docs
  const selected = rooms.find(room => String(room.id) === params.get('room') || room.number === params.get('room'))
  const options = rooms.filter(room => room.status === 'Available').map(room =>
    `<option value="${escapeHtml(room.number)}" ${selected?.number === room.number ? 'selected' : ''}>${escapeHtml(room.number)} — ${escapeHtml(room.title)} ($${Number(room.price).toFixed(2)}/night)</option>`,
  ).join('')

  return `
    <section class="p-page-head form-page-head"><p class="crumbs"><a href="/places">← Browse rooms</a></p><h1>Book your stay</h1><p class="hero-sub">Choose your dates and guest count. Your reservation will be created as pending.</p></section>
    <section class="card booking-card">
      <form id="booking-form" class="form-grid">
        <label class="form-span">Room<select name="room" required>${options}</select></label>
        <label>Check in<input name="checkIn" type="date" value="${escapeHtml(params.get('check_in') || '')}" required></label>
        <label class="night-only">Check out<input name="checkOut" type="date" value="${escapeHtml(params.get('check_out') || '')}" required></label>
        <label>Stay type<select name="stayType"><option value="Night">Night stay</option><option value="Day">Day stay (07:00–23:59)</option></select></label>
        <label>Guests<input name="guests" type="number" min="1" max="8" value="${escapeHtml(params.get('guests') || '1')}" required></label>
        <label>Guest name<input name="name" value="${escapeHtml(session.user.name || '')}" autocomplete="name" required></label>
        <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
        <p class="hint form-span">Day stay is for one calendar day. Night stays require check-out after check-in.</p>
        <button class="btn primary form-span" type="submit">Request booking</button>
      </form>
      <div id="booking-message" aria-live="polite"></div>
    </section>
  `
}

export async function renderBookings(): Promise<string> {
  if (!getSession()) return renderLogin('Sign in to view your bookings.')
  const reservations = await fetchMyReservations()
  if (!reservations.length) return `<section class="p-page-head"><h1>My bookings</h1></section><div class="empty-state"><p>Your bookings will appear here.</p><a class="btn primary" href="/places">Browse rooms</a></div>`
  const rows = reservations.map(reservation => {
    const room = typeof reservation.room === 'object' ? reservation.room : null
    const label = room ? `${escapeHtml(room.title)} · ${escapeHtml(room.number)}` : 'Room reservation'
    const statusClass = escapeHtml(reservation.status.toLowerCase().replace(/[^a-z-]/g, '-'))
    return `<article class="booking-row card"><div><span class="pill">#${escapeHtml(reservation.id)}</span><h2>${label}</h2><p>${escapeHtml(reservation.checkIn.slice(0, 10))} → ${escapeHtml(reservation.checkOut.slice(0, 10))} · ${reservation.stayType === 'Day' ? 'Day use' : 'Night stay'} · ${reservation.guests} guest(s)</p></div><span class="badge st-${statusClass}">${escapeHtml(reservation.status)}</span></article>`
  }).join('')
  return `<section class="p-page-head"><h1>My bookings</h1><p class="hero-sub">Your upcoming and previous stays.</p><a class="btn primary" href="/places">Book another stay</a></section><section class="booking-list">${rows}</section>`
}

export async function renderFavorites(): Promise<string> {
  const keys = getFavoriteNumbers()
  const rooms: Room[] = keys.length ? (await fetchRooms({ depth: '1', limit: '100' })).docs.filter(room => keys.includes(room.number)) : []
  const cards = rooms.map(room => renderPlaceCard(room)).join('')
  return `<section class="p-page-head"><h1>Favorites</h1><p class="hero-sub">Rooms you saved on this device.</p></section><div class="place-grid">${cards || `<div class="empty-state"><p>Your favorites will appear here — tap the star on a room card.</p><a class="btn ghost" href="/places">View all rooms</a></div>`}</div>`
}

export function renderProfile(message = ''): string {
  const session = getSession()
  if (!session) return renderLogin('Sign in to view your profile.')
  return `<section class="p-page-head"><h1>Your profile</h1><p class="hero-sub">Manage your GrandStay account.</p></section><section class="card profile-card"><div class="profile-avatar"><span class="avatar-big">${escapeHtml((session.user.name || session.user.email).slice(0, 1).toUpperCase())}</span><div><strong>${escapeHtml(session.user.name || 'Guest')}</strong><p>${escapeHtml(session.user.email)}</p></div></div>${message ? `<div class="msg success page-message">${escapeHtml(message)}</div>` : ''}<form id="profile-form" class="profile-form"><label>Full name<input name="name" value="${escapeHtml(session.user.name || '')}" required maxlength="120"></label><button class="btn primary" type="submit">Save profile</button></form><p><a href="/bookings">View my bookings →</a></p></section>`
}

export async function submitLogin(form: HTMLFormElement) {
  const data = new FormData(form)
  await signIn(String(data.get('email')), String(data.get('password')))
  history.replaceState(null, '', '/profile')
  await renderRoute?.('/profile')
}

export async function submitRegistration(form: HTMLFormElement) {
  const data = new FormData(form)
  await registerAccount(String(data.get('name')), String(data.get('email')), String(data.get('password')))
  history.replaceState(null, '', '/profile')
  await renderRoute?.('/profile')
}

export async function submitBooking(form: HTMLFormElement) {
  const data = new FormData(form)
  const room = await fetchRoom(String(data.get('room')))
  await createReservation({
    room,
    name: String(data.get('name')),
    phone: String(data.get('phone') || ''),
    checkIn: String(data.get('checkIn')),
    checkOut: String(data.get('checkOut')),
    guests: Number(data.get('guests')),
    stayType: String(data.get('stayType')) as 'Night' | 'Day',
  })
}

export async function submitProfile(form: HTMLFormElement) {
  const data = new FormData(form)
  await updateMyProfile(String(data.get('name')))
  history.replaceState(null, '', '/profile?updated=1')
  await renderRoute?.('/profile?updated=1')
}

export function renderStaticPage(slug: string): string {
  const pages: Record<string, { title: string; paragraphs: string[] }> = {
    terms: { title: 'Terms of Service', paragraphs: ['Reservations are requests until confirmed by the property. Prices and availability may change until confirmation.', 'Guests are responsible for accurate booking details and following the property rules shared at confirmation.', 'For help with an existing reservation, contact the GrandStay team with your booking number.'] },
    privacy: { title: 'Privacy Policy', paragraphs: ['We use the information you provide to manage your account and reservations.', 'Account and booking information is available only to the account holder and authorized staff.', 'You may request an update to your profile information by contacting the GrandStay team.'] },
    help: { title: 'Help Center', paragraphs: ['Browse rooms and choose your dates to request a reservation. Sign in to see your booking history.', 'If a room or date is unavailable, try another room or date range.', 'For assistance, contact the property and include your booking number when available.'] },
  }
  const page = pages[slug]
  return page ? `<article class="p-doc"><h1>${page.title}</h1>${page.paragraphs.map(p => `<p>${p}</p>`).join('')}<a class="btn ghost" href="/">Back to GrandStay</a></article>` : `<div class="empty-state"><h2>Page not found</h2><a class="btn ghost" href="/">Home</a></div>`
}

let renderRoute: ((path: string) => Promise<void>) | undefined
export function setRouteRenderer(renderer: (path: string) => Promise<void>) { renderRoute = renderer }

import { fetchCommon, fetchPage, fetchRooms } from './api'
import { roomPhotoUrl } from './roomPhotos'
import { renderLayout } from './layout'
import { renderBlocks } from './blocks/renderBlocks'
import type { PageBlock, Room } from './types'
import {
  renderBookingForm,
  renderBookings,
  renderFavorites,
  renderLogin,
  renderProfile,
  renderRegister,
  renderStaticPage,
  setRouteRenderer,
  submitBooking,
  submitLogin,
  submitProfile,
  submitRegistration,
  escapeHtml,
} from './pages'
import { toggleFavorite } from './favorites'
import { CMS_URL, getSession, isStaff, signOut } from './api'
import './style.css'

const app = document.getElementById('app')!

async function navigate(path: string) {
  path = path.split('?')[0]
  try {
    const [common, roomsData] = await Promise.all([
      fetchCommon(),
      path === '/' || path === '' ? fetchRooms({ depth: '1', limit: '8' }).catch(() => ({ docs: [] })) : Promise.resolve({ docs: [] as Room[] }),
    ])

    const rooms: Room[] = roomsData.docs || []

    let content = ''

    const adminDestinations: Record<string, string> = {
      '/admin': '/admin',
      '/dashboard': '/admin',
      '/manage/rooms': '/admin/collections/rooms',
      '/manage/guests': '/admin/collections/guests',
      '/manage/reservations': '/admin/collections/reservations',
    }
    if (adminDestinations[path]) {
      if (isStaff()) {
        window.location.assign(`${CMS_URL}${adminDestinations[path]}`)
        return
      }
      content = `<section class="access-denied"><div class="card"><h1>Access restricted</h1><p>This page is available to GrandStay staff only.</p><a class="btn primary" href="/">Back to the site</a></div></section>`
    } else if (path === '/' || path === '') {
      const blocks: PageBlock[] = [
        { type: 'hero' },
        { type: 'rooms-grid' },
        { type: 'cta' },
      ]
      content = renderBlocks(blocks, { rooms })
    } else if (path === '/places') {
      const qs = location.search.slice(1)
      const params = Object.fromEntries(new URLSearchParams(qs))
      const filtered = await fetchRooms({ ...params, depth: '1', limit: '50' }).catch(() => ({ docs: [] }))
      const allRooms: Room[] = filtered.docs || []

      const { renderPlaceCard } = await import('./blocks/placeCard')
      const cards = allRooms.length
        ? allRooms.map(r => renderPlaceCard(r, qs)).join('')
        : `<div class="empty-state"><p>Nothing found for your search</p></div>`

      content = `
        <section class="p-page-head">
          <h1>Book a place</h1>
          <p class="hero-sub">Pick your dates — we show only the rooms that are free.</p>
          <form class="search-panel" id="search-form" method="get">
            <div class="sp-field">
              <span>Location</span>
              <input type="text" name="location" value="${params.location || ''}" placeholder="Where are you going?" />
            </div>
            <div class="sp-field">
              <span>Check In</span>
              <input type="date" name="check_in" value="${params.check_in || ''}" />
            </div>
            <div class="sp-field">
              <span>Check Out</span>
              <input type="date" name="check_out" value="${params.check_out || ''}" />
            </div>
            <div class="sp-field">
              <span>Guests</span>
              <input type="number" name="guests" value="${params.guests || '1'}" min="1" max="8" />
            </div>
            <div class="sp-field">
              <span>Room type</span>
              <select name="roomType">
                <option value="">Any</option>
                <option value="Single" ${params.roomType === 'Single' ? 'selected' : ''}>Single</option>
                <option value="Double" ${params.roomType === 'Double' ? 'selected' : ''}>Double</option>
                <option value="Suite"  ${params.roomType === 'Suite'  ? 'selected' : ''}>Suite</option>
              </select>
            </div>
            <button type="submit" class="btn primary sp-btn">Search</button>
          </form>
        </section>
        <section class="section">
          <div class="section-head">
            <h2>Recommended places</h2>
            <span class="found-count">Places found: ${allRooms.length}</span>
          </div>
          <div class="place-grid">${cards}</div>
        </section>
      `
    } else if (path.startsWith('/places/')) {
      const number = path.split('/')[2]
      const { fetchRoom } = await import('./api')
      const room: Room | null = await fetchRoom(number).catch(() => null)

      if (!room) {
        content = `<div class="empty-state"><h2>Room not found</h2><a class="btn ghost" href="/places">Back</a></div>`
      } else {
        const qs = location.search.slice(1)
        const params = Object.fromEntries(new URLSearchParams(qs))
        const serviceChips = (room.services || []).map(s => `<span class="chip">✓ ${s.name}</span>`).join('')
        const photoUrl = room.photo?.url || roomPhotoUrl(room.number)
        const photoHtml = photoUrl
          ? `<img src="${photoUrl}" alt="${room.title}">`
          : `<span class="ph">PHOTO</span>`
        const isAvail = room.status === 'Available'

        content = `
          <p class="crumbs"><a href="/">Home</a> → <a href="/places">Book</a> → ${room.title}</p>
          <div class="place-detail">
            <div>
              <div class="pd-photo">
              <span class="place-tag ${isAvail ? 'ok' : 'busy'}">${isAvail ? 'Available' : room.status === 'Occupied' ? 'Booked' : room.status}</span>
                ${photoHtml}
              </div>
              <div class="pd-body">
                <h1 class="pd-title">${room.title}</h1>
                <div class="pd-meta">
                  <span>📍 ${room.location}</span>
                  <span class="pd-rate">★ ${room.rating}</span>
                  <span>Guests: ${room.capacity}</span>
                  <span>${room.roomType}</span>
                  <span class="pill">#${room.number}</span>
                </div>
                <p class="pd-desc">${room.description || 'A comfortable room with everything you need for a pleasant stay.'}</p>
                ${serviceChips ? `<h3>Services in this room</h3><div class="pd-svc">${serviceChips}</div>` : ''}
              </div>
            </div>
            <div class="card pd-book">
              <h2>Check availability</h2>
              <form class="pd-form" method="get" action="/bookings/new">
                <input type="hidden" name="room" value="${room.id}" />
                <label>Check In<input type="date" name="check_in" value="${params.check_in || ''}" /></label>
                <label>Check Out<input type="date" name="check_out" value="${params.check_out || ''}" /></label>
                <label>Guests<input type="number" name="guests" value="${params.guests || '1'}" min="1" max="${room.capacity}" /></label>
                <button type="button" class="btn ghost">Update</button>
              </form>
              <div class="pd-check">
                <div class="pd-row pd-total">
                  <span>Total</span>
                  <b>$${room.price.toFixed(2)} <small>per night</small></b>
                </div>
              </div>
              ${isAvail
                ? `<a class="btn primary big" href="/bookings/new?room=${room.id}&${qs}">Book</a>
                   <p class="pd-hint">You will confirm the booking on the next step</p>`
                : `<p class="pd-hint">This room is not available for the selected dates.</p>`
              }
            </div>
          </div>
        `
      }
    } else if (path === '/login') {
      content = renderLogin()
    } else if (path === '/register') {
      content = renderRegister()
    } else if (path === '/profile') {
      content = renderProfile(new URLSearchParams(location.search).has('updated') ? 'Profile updated.' : '')
    } else if (path === '/bookings' || path === '/reservations') {
      content = await renderBookings()
    } else if (path === '/bookings/new' || path === '/reservations/new') {
      content = await renderBookingForm()
    } else if (path === '/favorites') {
      content = await renderFavorites()
    } else if (path === '/verify-email') {
      content = `<article class="p-doc"><h1>Email verification</h1><p>Email verification is not enabled for this deployment. You can sign in with the account you registered.</p><a class="btn primary" href="/login">Sign in</a></article>`
    } else if (['/terms', '/privacy', '/help'].includes(path)) {
      try {
        const page = await fetchPage(path)
        content = `<article class="p-doc"><h1>${escapeHtml(page.meta.title)}</h1>${page.meta.description ? `<p>${escapeHtml(page.meta.description)}</p>` : ''}${renderBlocks(page.blocks as PageBlock[])}</article>`
      } catch {
        content = renderStaticPage(path.slice(1))
      }
    } else {
      content = `<div class="empty-state"><h2>Page not found</h2><a class="btn ghost" href="/">Home</a></div>`
    }

    app.innerHTML = renderLayout(common, content, path)
    initInteractivity()
    initBurger()
  } catch (err) {
    app.innerHTML = `
      <div style="padding:40px;text-align:center">
        <h2>Something went wrong</h2>
        <p>Could not connect to the server. Make sure the CMS is running.</p>
        <pre style="font-size:12px;opacity:0.6">${err instanceof Error ? err.message : String(err)}</pre>
      </div>
    `
  }
}

setRouteRenderer(navigate)

function initInteractivity() {
  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle')
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement
      const current = html.getAttribute('data-theme')
      html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark')
      localStorage.setItem('theme', html.getAttribute('data-theme') || 'light')
    })
  }

  document.getElementById('sign-out')?.addEventListener('click', () => {
    signOut()
    history.pushState(null, '', '/')
    navigate('/')
  })

  document.querySelectorAll<HTMLButtonElement>('.fav-star[data-room]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault()
      event.stopPropagation()
      const number = button.dataset.room
      if (!number) return
      if (!getSession()) {
        history.pushState(null, '', '/login')
        navigate('/login')
        return
      }
      const saved = toggleFavorite(number)
      button.classList.toggle('on', saved)
      button.textContent = saved ? '★' : '☆'
      button.setAttribute('aria-label', `${saved ? 'Remove from' : 'Add to'} favorites`)
      if (!saved && location.pathname === '/favorites') navigate('/favorites')
    })
  })

  // SPA navigation — intercept internal links
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a => {
    const href = a.getAttribute('href') || ''
    if (href.startsWith('/') && !href.startsWith('//')) {
      a.addEventListener('click', e => {
        e.preventDefault()
        history.pushState(null, '', href)
        navigate(href.split('?')[0])
      })
    }
  })

  // Search forms
  const searchForm = document.getElementById('search-form') as HTMLFormElement | null
  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      e.preventDefault()
      const data = new FormData(searchForm)
      const params = new URLSearchParams()
      data.forEach((val, key) => { if (val) params.set(key, String(val)) })
      const target = searchForm.getAttribute('action') || '/places'
      const url = `${target}?${params.toString()}`
      history.pushState(null, '', url)
      navigate(target)
    })
  }

  const loginForm = document.getElementById('login-form') as HTMLFormElement | null
  loginForm?.addEventListener('submit', async event => {
    event.preventDefault()
    try { await submitLogin(loginForm) } catch (err) { showFormError(loginForm, err) }
  })

  const registerForm = document.getElementById('register-form') as HTMLFormElement | null
  registerForm?.addEventListener('submit', async event => {
    event.preventDefault()
    try { await submitRegistration(registerForm) } catch (err) { showFormError(registerForm, err) }
  })

  const profileForm = document.getElementById('profile-form') as HTMLFormElement | null
  profileForm?.addEventListener('submit', async event => {
    event.preventDefault()
    try { await submitProfile(profileForm) } catch (err) { showFormError(profileForm, err) }
  })

  const bookingForm = document.getElementById('booking-form') as HTMLFormElement | null
  bookingForm?.addEventListener('submit', async event => {
    event.preventDefault()
    const message = document.getElementById('booking-message')
    if (!message) return
    message.innerHTML = ''
    try {
      await submitBooking(bookingForm)
      message.innerHTML = `<div class="msg success">Booking request received. <a href="/bookings">View my bookings</a></div>`
      bookingForm.reset()
    } catch (err) {
      message.innerHTML = `<div class="msg error">${escapeHtml(err instanceof Error ? err.message : String(err))}</div>`
    }
  })

  const stayType = bookingForm?.elements.namedItem('stayType') as HTMLSelectElement | null
  const checkOut = bookingForm?.elements.namedItem('checkOut') as HTMLInputElement | null
  const nightOnly = checkOut?.closest('.night-only') as HTMLElement | null
  const syncStayType = () => {
    if (!stayType || !checkOut || !nightOnly) return
    const dayUse = stayType.value === 'Day'
    nightOnly.hidden = dayUse
    checkOut.required = !dayUse
    if (dayUse) checkOut.value = (bookingForm?.elements.namedItem('checkIn') as HTMLInputElement | null)?.value || ''
  }
  stayType?.addEventListener('change', syncStayType)
  const checkInInput = bookingForm?.elements.namedItem('checkIn') as HTMLInputElement | null
  checkInInput?.addEventListener('change', syncStayType)
  syncStayType()
}

function showFormError(form: HTMLFormElement, error: unknown) {
  form.querySelector('.page-message')?.remove()
  const node = document.createElement('div')
  node.className = 'msg error page-message'
  node.textContent = error instanceof Error ? error.message : String(error)
  form.prepend(node)
}

function initBurger() {
  const burger = document.querySelector<HTMLButtonElement>('.p-burger')
  const nav = document.getElementById('p-nav')
  const overlay = document.getElementById('nav-overlay')
  if (!burger || !nav || !overlay) return

  document.documentElement.classList.add('burger-ready')

  function openMenu() {
    nav!.classList.add('open')
    overlay!.classList.add('show')
    burger!.setAttribute('aria-expanded', 'true')
    document.documentElement.classList.add('nav-locked')
  }

  function closeMenu() {
    nav!.classList.remove('open')
    overlay!.classList.remove('show')
    burger!.setAttribute('aria-expanded', 'false')
    document.documentElement.classList.remove('nav-locked')
  }

  burger.addEventListener('click', () => {
    burger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu()
  })
  overlay.addEventListener('click', closeMenu)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu() })
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu))
}

// Restore theme from localStorage
const saved = localStorage.getItem('theme')
if (saved) document.documentElement.setAttribute('data-theme', saved)

// Initial render
navigate(location.pathname)

// Handle browser back/forward
window.addEventListener('popstate', () => navigate(location.pathname))

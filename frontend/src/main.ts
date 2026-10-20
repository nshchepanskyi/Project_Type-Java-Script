import { fetchCommon, fetchRooms } from './api'
import { renderLayout } from './layout'
import { renderBlocks } from './blocks/renderBlocks'
import type { PageBlock, Room } from './types'
import './style.css'

const app = document.getElementById('app')!

async function navigate(path: string) {
  try {
    const [common, roomsData] = await Promise.all([
      fetchCommon(),
      fetchRooms({ depth: '1', limit: '8' }).catch(() => ({ docs: [] })),
    ])

    const rooms: Room[] = roomsData.docs || []

    let content = ''

    if (path === '/' || path === '') {
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
      const room: Room = await fetchRoom(number).catch(() => null)

      if (!room) {
        content = `<div class="empty-state"><h2>Room not found</h2><a class="btn ghost" href="/places">Back</a></div>`
      } else {
        const qs = location.search.slice(1)
        const params = Object.fromEntries(new URLSearchParams(qs))
        const serviceChips = (room.services || []).map(s => `<span class="chip">✓ ${s.name}</span>`).join('')
        const photoHtml = room.photo?.url
          ? `<img src="${room.photo.url}" alt="${room.title}">`
          : `<span class="ph">PHOTO</span>`
        const isAvail = room.status === 'Available'

        content = `
          <p class="crumbs"><a href="/">Home</a> → <a href="/places">Book</a> → ${room.title}</p>
          <div class="place-detail">
            <div>
              <div class="pd-photo">
                <span class="place-tag ${isAvail ? 'ok' : 'busy'}">${isAvail ? 'Available now' : 'Occupied'}</span>
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

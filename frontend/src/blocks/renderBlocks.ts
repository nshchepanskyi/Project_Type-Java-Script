import type { PageBlock } from '../types'
import type { Room } from '../types'
import { renderPlaceCard } from './placeCard'

export interface BlockContext {
  rooms?: Room[]
  searchQuery?: string
}

export function renderBlock(block: PageBlock, ctx: BlockContext = {}): string {
  switch (block.type) {
    case 'hero':
      return renderHero(block.data as Record<string, string> | undefined)
    case 'rooms-grid':
      return renderRoomsGrid(ctx.rooms || [], ctx.searchQuery)
    case 'features':
      return renderFeatures(block.data as Record<string, unknown> | undefined)
    case 'cta':
      return renderCta(block.data as Record<string, string> | undefined)
    case 'text':
      return renderText(block.data as Record<string, string> | undefined)
    default:
      return ''
  }
}

export function renderBlocks(blocks: PageBlock[], ctx: BlockContext = {}): string {
  return blocks.map(b => renderBlock(b, ctx)).join('')
}

function renderHero(data?: Record<string, string>): string {
  const title = data?.title || 'Find your next stay'
  const subtitle = data?.subtitle || 'Comfortable rooms in the heart of the city — book in a couple of clicks.'
  return `
    <section class="hero">
      <h1>${title}</h1>
      <p class="hero-sub">${subtitle}</p>
      <form class="search-panel" id="search-form" method="get" action="/places">
        <div class="sp-field">
          <span>Location</span>
          <input type="text" name="location" placeholder="Where are you going?" class="js-location" />
        </div>
        <div class="sp-field">
          <span>Check In</span>
          <input type="date" name="check_in" placeholder="Choose date" class="js-checkin" />
        </div>
        <div class="sp-field">
          <span>Check Out</span>
          <input type="date" name="check_out" placeholder="Choose date" class="js-checkout" />
        </div>
        <div class="sp-field">
          <span>Guests</span>
          <input type="number" name="guests" value="1" min="1" max="8" />
        </div>
        <button type="submit" class="btn primary sp-btn">Search</button>
      </form>
    </section>
  `
}

function renderRoomsGrid(rooms: Room[], searchQuery = ''): string {
  const cards = rooms.length
    ? rooms.map(r => renderPlaceCard(r, searchQuery)).join('')
    : `<div class="empty-state"><p>Nothing found for your search</p>
       <a class="btn ghost" href="/places">View all</a></div>`

  return `
    <section class="section">
      <div class="section-head">
        <h2>Recommended places</h2>
        <a class="section-link" href="/places">View all →</a>
      </div>
      <div class="place-grid">${cards}</div>
    </section>
  `
}

function renderFeatures(data?: Record<string, unknown>): string {
  const title = (data?.title as string) || 'Why GrandStay?'
  const items = (data?.items as Array<{ icon: string; title: string; text: string }>) || [
    { icon: '🏨', title: 'Premium Rooms', text: 'Carefully selected rooms for your comfort.' },
    { icon: '⚡', title: 'Instant Booking', text: 'Book in seconds, confirm in minutes.' },
    { icon: '💼', title: 'Business Ready', text: 'Conference rooms and business services.' },
  ]

  const itemsHtml = items.map(i => `
    <div class="feature-item">
      <div class="feature-icon">${i.icon}</div>
      <h3>${i.title}</h3>
      <p>${i.text}</p>
    </div>
  `).join('')

  return `
    <section class="section features">
      <h2 class="features-title">${title}</h2>
      <div class="features-grid">${itemsHtml}</div>
    </section>
  `
}

function renderCta(data?: Record<string, string>): string {
  const title = data?.title || 'Create your own story'
  const text = data?.text || 'Join GrandStay and get access to your bookings, favorites and member prices.'
  const label = data?.btnLabel || 'Create account'
  const href = data?.btnHref || '/register'

  return `
    <section class="cta">
      <div class="cta-text">
        <h2>${title}</h2>
        <p>${text}</p>
      </div>
      <a class="btn primary" href="${href}">${label}</a>
    </section>
  `
}

function renderText(data?: Record<string, string>): string {
  return `<section class="section p-doc"><p>${data?.content || ''}</p></section>`
}

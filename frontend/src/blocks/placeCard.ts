import type { Room } from '../types'
import { roomPhotoUrl } from '../roomPhotos'
import { isFavorite } from '../favorites'

export function renderPlaceCard(room: Room, searchQuery = ''): string {
  const isAvailable = room.status === 'Available'
  const tagClass = isAvailable ? 'ok' : 'busy'
  const tagLabel = isAvailable
    ? 'Available'
    : room.status === 'Occupied'
      ? 'Booked'
      : room.status

  const photoUrl = room.photo?.url || roomPhotoUrl(room.number)
  const photoHtml = photoUrl
    ? `<img src="${photoUrl}" alt="${room.title}" loading="lazy">`
    : `<span class="ph">PHOTO</span>`

  const serviceChips = (room.services || [])
    .slice(0, 3)
    .map(s => `<span class="svc-chip">✓ ${s.name}</span>`)
    .join('')

  const extra = (room.services || []).length > 3
    ? `<span class="svc-chip extra">+${(room.services || []).length - 3}</span>`
    : ''

  const detailUrl = `/places/${room.number}${searchQuery ? '?' + searchQuery : ''}`

  return `
    <article class="place-card">
      <a class="place-link" href="${detailUrl}" tabindex="-1" aria-hidden="true">
        <div class="place-photo"><span class="place-tag ${tagClass}">${tagLabel}</span>${photoHtml}</div>
      </a>
      <button class="fav-star${isFavorite(room.number) ? ' on' : ''}" type="button" aria-label="${isFavorite(room.number) ? 'Remove from' : 'Add to'} favorites" data-room="${room.number}">${isFavorite(room.number) ? '★' : '☆'}</button>
      <div class="place-body">
        <a class="place-link place-title" href="${detailUrl}">${room.title}</a>
        <div class="place-meta">
          <span>${room.location}</span>
          <span class="place-rating">★ ${room.rating}</span>
        </div>
        <p class="place-cap">Guests: ${room.capacity} · ${room.roomType}</p>
        <div class="place-svc">${serviceChips}${extra}</div>
        <div class="place-foot">
          <div class="place-price">$${room.price.toFixed(2)} <small>per night</small></div>
          <a class="btn primary" href="${detailUrl}">Book</a>
        </div>
      </div>
    </article>
  `
}

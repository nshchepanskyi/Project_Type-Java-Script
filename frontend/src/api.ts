const CMS_URL = import.meta.env.VITE_CMS_URL || ''

export async function fetchCommon() {
  const res = await fetch(`${CMS_URL}/api/common`)
  if (!res.ok) throw new Error('Failed to fetch common data')
  return res.json()
}

export async function fetchPage(path: string) {
  const res = await fetch(`${CMS_URL}/api/page?path=${encodeURIComponent(path)}`)
  if (!res.ok) throw new Error('Page not found')
  return res.json()
}

export async function fetchRooms(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`${CMS_URL}/api/rooms${qs}`)
  if (!res.ok) throw new Error('Failed to fetch rooms')
  return res.json()
}

export async function fetchRoom(number: string) {
  const res = await fetch(`${CMS_URL}/api/rooms?where[number][equals]=${encodeURIComponent(number)}&depth=1&limit=1`)
  if (!res.ok) throw new Error('Room not found')
  const data = await res.json()
  if (!data.docs?.[0]) throw new Error('Room not found')
  return data.docs[0]
}

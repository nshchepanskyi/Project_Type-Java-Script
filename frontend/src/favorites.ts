const FAVORITES_KEY = 'grandstay.favorites'

export function getFavoriteNumbers(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    return Array.isArray(value) ? value.map(String) : []
  } catch {
    return []
  }
}

export function toggleFavorite(number: string): boolean {
  const favorites = getFavoriteNumbers()
  const saved = favorites.includes(number)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(saved ? favorites.filter(item => item !== number) : [...favorites, number]))
  return !saved
}

export function isFavorite(number: string): boolean {
  return getFavoriteNumbers().includes(number)
}

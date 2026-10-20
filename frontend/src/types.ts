export interface NavItem {
  label: string
  path: string
}

export interface CommonData {
  siteName: string
  nav: NavItem[]
  footer: {
    links: NavItem[]
    copy: string
  }
}

export interface PageBlock {
  type: string
  data?: Record<string, unknown>
}

export interface PageData {
  meta: {
    title: string
    description: string
  }
  blocks: PageBlock[]
}

export interface Room {
  id: string
  number: string
  title: string
  roomType: 'Single' | 'Double' | 'Suite'
  price: number
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance'
  location: string
  capacity: number
  rating: number
  photo?: { url: string } | null
  description?: string
  services?: Array<{ id: string; name: string; price: number }>
}

export interface RoomsResponse {
  docs: Room[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface SearchParams {
  location?: string
  check_in?: string
  check_out?: string
  guests?: string
  roomType?: string
}

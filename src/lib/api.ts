const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export type ApiPark = {
  id: string
  name: string
  state: string
  acres?: number
  latitude?: number
  longitude?: number
}

export type ApiSighting = {
  id: number
  ParkID: string
  SpeciesID: string
  UserID: string
  DateTime: string
  Notes?: string | null
  Lat?: number | null
  Long?: number | null
  ImagePath?: string | null
  Comments?: string | null
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  const body = await res.json()
  return body.data as T
}

export const api = {
  listParks: () => getJson<ApiPark[]>('/parks'),
  getPark: (id: string) => getJson<ApiPark>(`/parks/${encodeURIComponent(id)}`),
  listSightings: (opts: { parkID?: string; since?: string; before?: string } = {}) => {
    const qs = new URLSearchParams()
    if (opts.parkID) qs.set('parkID', opts.parkID)
    if (opts.since) qs.set('since', opts.since)
    if (opts.before) qs.set('before', opts.before)
    const q = qs.toString()
    return getJson<ApiSighting[]>(`/sightings${q ? `?${q}` : ''}`)
  },
}

export type Park = {
  ID: string
  Name: string
  State: string
}

export type Sighting = {
  id: number
  date_time: string
  parkID: string
  speciesID: string
}

export const parks: Park[] = [
  { ID: 'ACAD', Name: 'Acadia National Park', State: 'ME' },
]

export const sightings: Sighting[] = [
  {
    id: 2,
    date_time: '2026-04-27 22:26:05+00',
    parkID: 'ACAD',
    speciesID: 'ACAD-1002',
  },
]

import { type FormEvent, useState } from 'react'
import { sightings } from '../data/placeholders'

export function SightingsPage() {
  const [parkId, setParkId] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [dateTime, setDateTime] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    console.log({
      parkId,
      speciesId,
      dateTime,
    })
    setParkId('')
    setSpeciesId('')
    setDateTime('')
  }

  return (
    <div>
      <h1>Sightings</h1>
      <h2>New sighting (demo form)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="s-park">
            Park id{' '}
            <input
              id="s-park"
              value={parkId}
              onChange={(e) => setParkId(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-species">
            Species id{' '}
            <input
              id="s-species"
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-when">
            Date / time{' '}
            <input
              id="s-when"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
      <h2>All sightings</h2>
      <ul>
        {sightings.map((s) => (
          <li key={s.id}>
            park {s.parkID}, species {s.speciesID}
          </li>
        ))}
      </ul>
    </div>
  )
}

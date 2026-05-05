import { type FormEvent, useEffect, useState } from 'react'
import type { Park } from '../data/placeholders'

export function ParksPage() {
  const [parks, setParks] = useState<Park[]>([])
  const [parksError, setParksError] = useState<string | null>(null)
  const [parksLoading, setParksLoading] = useState(true)
  const [idInput, setIdInput] = useState('')
  const [selected, setSelected] = useState<Park | null>(null)
  const [lookedUp, setLookedUp] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  useEffect(() => {
    async function loadParks() {
      try {
        const res = await fetch('/api/parks')

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const data: Park[] = await res.json()
        setParks(data)
        setParksError(null)
      } catch (err) {
        console.error(err)
        setParks([])
        setParksError('Could not load parks. Check your API URL and dev server.')
      } finally {
        setParksLoading(false)
      }
    }

    void loadParks()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = idInput.trim()
    setLookedUp(true)
    setSelected(null)
    setLookupError(null)

    if (!trimmed) {
      setLookupError('Enter a park id first.')
      return
    }

    try {
      const res = await fetch(`/api/parks/${trimmed}`)

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const data: Park = await res.json()
      setSelected(data ?? null)
    } catch (err) {
      console.error(err)
      setSelected(null)
      setLookupError('No park found for that id.')
    } finally {
      setIdInput('')
    }
  }

  return (
    <div>
      <h1>Parks</h1>
      <h2>Look up by ID</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="park-id">
          ID{' '}
          <input
            id="park-id"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
        </label>{' '}
        <button type="submit">Submit</button>
      </form>
      {selected && (
        <p>
          Selected: {selected.Name} ({selected.State}) — id {selected.ID}
        </p>
      )}
      {lookedUp && lookupError && <p>{lookupError}</p>}
      <h2>All parks</h2>
      {parksLoading && <p>Loading parks...</p>}
      {parksError && <p>{parksError}</p>}
      {!parksLoading && !parksError && (
        <ul>
          {parks.map((p) => (
            <li key={p.ID}>
              {p.ID}, {p.Name}, {p.State}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

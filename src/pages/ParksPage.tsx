import { type SubmitEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type ApiPark } from '../lib/api'

export function ParksPage() {
  const [parks, setParks] = useState<ApiPark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [idInput, setIdInput] = useState('')
  const [selected, setSelected] = useState<ApiPark | null>(null)
  const [lookedUp, setLookedUp] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .listParks()
      .then((data) => {
        if (cancelled) return
        setParks(data)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const trimmed = idInput.trim()
    setLookedUp(true)
    const match = parks.find(
      (p) => p.id.toLowerCase() === trimmed.toLowerCase(),
    )
    setSelected(match ?? null)
    setIdInput('')
  }

  return (
    <div>
      <h1>Parks</h1>
      <h2>Look up by id</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="park-id">
          Id{' '}
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
          Selected:{' '}
          <Link to={`/park/${selected.id}`}>
            {selected.name} ({selected.state}) — id {selected.id}
          </Link>
        </p>
      )}
      {lookedUp && !selected && <p>No park found for that id.</p>}

      <h2>All parks</h2>
      {loading && <p>Loading…</p>}
      {error && <p>Error loading parks: {error}</p>}
      {!loading && !error && (
        <ul>
          {parks.map((p) => (
            <li key={p.id}>
              <Link to={`/park/${p.id}`}>
                {p.name}, {p.state}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

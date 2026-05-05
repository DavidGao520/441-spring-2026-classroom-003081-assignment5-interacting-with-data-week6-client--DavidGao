import { type SubmitEvent, useState } from 'react'
import { parks, type Park } from '../data/placeholders'

export function ParksPage() {
  const [idInput, setIdInput] = useState('')
  const [selected, setSelected] = useState<Park | null>(null)
  const [lookedUp, setLookedUp] = useState(false)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const trimmed = idInput.trim()
    console.log("Searching for ID: ", trimmed)
    setLookedUp(true)

     try {
      const res = await fetch(`/api/parks/${trimmed}`)

      if (!res.ok) {
        console.error(`Request failed: ${res.status}`)
      }

      const data: Park = await res.json()
      console.log("Data received from API: ", data)
      setSelected(data?? null)
    } catch (err) {
      console.error(err)
      setSelected(null)
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
      {lookedUp && !selected && (
        <p>No park found for that id (check console for submitted value).</p>
      )}
      <h2>All parks</h2>
      <ul>
        {parks.map((p) => (
          <li key={p.ID}>
            {p.ID}, {p.Name}, {p.State}
          </li>
        ))}
      </ul>
    </div>
  )
}

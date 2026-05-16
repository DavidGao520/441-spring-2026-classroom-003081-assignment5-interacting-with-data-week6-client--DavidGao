import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, type ApiSighting } from '../lib/api'
import { supabase } from '../lib/supabaseClient'

function toIsoOrEmpty(localValue: string) {
  if (!localValue) return ''
  return new Date(localValue).toISOString()
}

export function ParkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const parkID = (id ?? '').toUpperCase()

  const [sightings, setSightings] = useState<ApiSighting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [since, setSince] = useState('')
  const [before, setBefore] = useState('')

  useEffect(() => {
    if (!parkID) return
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .listSightings({
        parkID,
        since: toIsoOrEmpty(since) || undefined,
        before: toIsoOrEmpty(before) || undefined,
      })
      .then((data) => {
        if (cancelled) return
        const sorted = [...data].sort(
          (a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime(),
        )
        setSightings(sorted)
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
  }, [parkID, since, before])

  // Live updates: append new sightings for this park as they're inserted.
  useEffect(() => {
    const sb = supabase
    if (!parkID || !sb) return
    const sinceMs = since ? new Date(toIsoOrEmpty(since)).getTime() : null
    const beforeMs = before ? new Date(toIsoOrEmpty(before)).getTime() : null
    const channel = sb
      .channel(`park-${parkID}-sightings`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sightings',
          filter: `ParkID=eq.${parkID}`,
        },
        (payload) => {
          const row = payload.new as ApiSighting
          const ts = new Date(row.DateTime).getTime()
          if (sinceMs !== null && ts < sinceMs) return
          if (beforeMs !== null && ts > beforeMs) return
          setSightings((prev) => {
            if (prev.some((s) => s.id === row.id)) return prev
            return [row, ...prev]
          })
        },
      )
      .subscribe()
    return () => {
      void sb.removeChannel(channel)
    }
  }, [parkID, since, before])

  return (
    <div>
      <p>
        <Link to="/parks">← All parks</Link>
      </p>
      <h1>Park {parkID}</h1>

      <h2>Filter</h2>
      <div>
        <label htmlFor="since">
          After{' '}
          <input
            id="since"
            type="datetime-local"
            value={since}
            onChange={(e) => setSince(e.target.value)}
          />
        </label>{' '}
        <label htmlFor="before">
          Before{' '}
          <input
            id="before"
            type="datetime-local"
            value={before}
            onChange={(e) => setBefore(e.target.value)}
          />
        </label>{' '}
        <button
          type="button"
          onClick={() => {
            setSince('')
            setBefore('')
          }}
        >
          Clear
        </button>
      </div>

      <h2>Sightings</h2>
      {loading && <p>Loading…</p>}
      {error && <p>Error loading sightings: {error}</p>}
      {!loading && !error && sightings.length === 0 && <p>No sightings.</p>}
      {!loading && !error && sightings.length > 0 && (
        <ul>
          {sightings.map((s) => (
            <li key={s.id} style={{ marginBottom: '1rem' }}>
              <div>
                <strong>Species:</strong> {s.SpeciesID}
              </div>
              <div>
                <strong>Park:</strong> {s.ParkID}
              </div>
              <div>
                <strong>When:</strong> {s.DateTime}
              </div>
              <div>
                <strong>User:</strong> {s.UserID}
              </div>
              {(s.Lat != null || s.Long != null) && (
                <div>
                  <strong>Location:</strong> {s.Lat ?? '?'}, {s.Long ?? '?'}
                </div>
              )}
              {s.Notes && (
                <div>
                  <strong>Notes:</strong> {s.Notes}
                </div>
              )}
              {s.ImagePath && (
                <div>
                  <strong>Image path:</strong> <code>{s.ImagePath}</code>
                  <SightingImage path={s.ImagePath} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SightingImage({ path }: { path: string }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) return null
  const url = `${supabaseUrl}/storage/v1/object/public/SightingsImages/${path}`
  return (
    <div>
      <img
        src={url}
        alt="sighting"
        style={{ maxWidth: '320px', display: 'block', marginTop: '0.25rem' }}
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}

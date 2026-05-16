import { type ChangeEvent, type SubmitEvent, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { api, type ApiSighting } from '../lib/api'

const BUCKET = 'SightingsImages'

export function SightingsPage() {
  const [parkId, setParkId] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [notes, setNotes] = useState('')
  const [lat, setLat] = useState('')
  const [long, setLong] = useState('')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePath, setImagePath] = useState('')

  const [userId, setUserId] = useState('')
  const [authErrorMessage, setAuthErrorMessage] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [recent, setRecent] = useState<ApiSighting[]>([])

  useEffect(() => {
    if (!supabase) {
      setAuthErrorMessage(
        'Supabase env not set. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserId(data.session.user.id)
      } else {
        setAuthErrorMessage('Please log in (on the Auth page) to create a sighting.')
      }
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    api
      .listSightings()
      .then((data) => {
        if (cancelled) return
        const sorted = [...data].sort(
          (a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime(),
        )
        setRecent(sorted.slice(0, 20))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const sb = supabase
    if (!sb) return
    const channel = sb
      .channel('all-sightings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sightings' },
        (payload) => {
          const row = payload.new as ApiSighting
          setRecent((prev) => {
            if (prev.some((s) => s.id === row.id)) return prev
            return [row, ...prev].slice(0, 20)
          })
        },
      )
      .subscribe()
    return () => {
      void sb.removeChannel(channel)
    }
  }, [])

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setSelectedFile(f)
    setImagePath('')
  }

  async function onFileUpload() {
    if (!supabase || !selectedFile) return
    setNotice(null)
    setBusy(true)
    const safeName = `${Date.now()}-${selectedFile.name.split(' ')[0]}`
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(safeName, selectedFile)
    setBusy(false)
    if (error) {
      setNotice(`Upload error: ${error.message}`)
      return
    }
    setImagePath(data.path)
    setNotice(`Uploaded: ${data.path}`)
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (!supabase) return
    setNotice(null)
    setBusy(true)

    const row: Record<string, unknown> = {
      ParkID: parkId,
      SpeciesID: speciesId,
      UserID: userId,
      DateTime: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
      Notes: notes || null,
      Lat: lat === '' ? null : Number(lat),
      Long: long === '' ? null : Number(long),
      ImagePath: imagePath || null,
    }

    const { error } = await supabase.from('sightings').insert(row)
    setBusy(false)
    if (error) {
      setNotice(`Insert error: ${error.message}`)
      return
    }

    setParkId('')
    setSpeciesId('')
    setDateTime('')
    setNotes('')
    setLat('')
    setLong('')
    setSelectedFile(null)
    setImagePath('')
    setNotice('Sighting created. View it on the park page.')
  }

  const recentList = (
    <>
      <h2>Recent sightings (live)</h2>
      {recent.length === 0 ? (
        <p>No sightings yet.</p>
      ) : (
        <ul>
          {recent.map((s) => (
            <li key={s.id}>
              <strong>{s.SpeciesID}</strong> at <strong>{s.ParkID}</strong> —{' '}
              {new Date(s.DateTime).toLocaleString()}
              {s.Notes ? ` — ${s.Notes}` : ''}
            </li>
          ))}
        </ul>
      )}
    </>
  )

  if (authErrorMessage) {
    return (
      <div>
        <h1>Sightings</h1>
        <p>{authErrorMessage}</p>
        {recentList}
      </div>
    )
  }

  return (
    <div>
      <h1>Sightings</h1>
      <h2>New sighting</h2>
      {notice && <p role="status">{notice}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <input type="file" accept="image/*" onChange={onFileChange} disabled={busy} />{' '}
        <button type="button" onClick={() => void onFileUpload()} disabled={busy || !selectedFile}>
          Upload image
        </button>
        {imagePath && (
          <div>
            <small>Image path: <code>{imagePath}</code></small>
          </div>
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <label htmlFor="s-park">
            Park id{' '}
            <input id="s-park" value={parkId} onChange={(e) => setParkId(e.target.value)} disabled={busy} required />
          </label>
        </div>
        <div>
          <label htmlFor="s-species">
            Species id{' '}
            <input id="s-species" value={speciesId} onChange={(e) => setSpeciesId(e.target.value)} disabled={busy} required />
          </label>
        </div>
        <div>
          <label htmlFor="s-when">
            Date / time{' '}
            <input id="s-when" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} disabled={busy} />
          </label>
        </div>
        <div>
          <label htmlFor="s-notes">
            Notes{' '}
            <input id="s-notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={busy} />
          </label>
        </div>
        <div>
          <label htmlFor="s-lat">
            Lat{' '}
            <input id="s-lat" value={lat} onChange={(e) => setLat(e.target.value)} disabled={busy} inputMode="decimal" />
          </label>
        </div>
        <div>
          <label htmlFor="s-long">
            Long{' '}
            <input id="s-long" value={long} onChange={(e) => setLong(e.target.value)} disabled={busy} inputMode="decimal" />
          </label>
        </div>
        <button type="submit" disabled={busy}>Submit</button>
      </form>

      {recentList}
    </div>
  )
}

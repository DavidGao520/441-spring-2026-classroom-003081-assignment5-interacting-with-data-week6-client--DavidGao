import { type SubmitEvent, useState } from 'react'
import { sightings } from '../data/placeholders'
import { supabase } from '../lib/supabaseClient'

export function SightingsPage() {
  const [parkId, setParkId] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [selectedFile, setSelectedFile] = useState(null);

  function handleSubmit(e: SubmitEvent) {
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

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  async function onFileUpload() {
    console.log(selectedFile);

    const { data, error } = await supabase.storage.from('sightingImages').upload('file_path', selectedFile)
    if (error) {
      console.log("upload return error", error)
    } else {
      console.log("upload return data ", data)
    }
  }

  return (
    <div>
      <h1>Sightings</h1>
      <h2>New sighting (demo form)</h2>

      <div>
        <input type="file" onChange={onFileChange} />
        <button onClick={onFileUpload}>Upload!</button>

      </div>

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

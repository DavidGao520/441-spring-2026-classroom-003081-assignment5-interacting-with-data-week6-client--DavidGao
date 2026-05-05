import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthPage } from './pages/AuthPage'
import { ParksPage } from './pages/ParksPage'
import { SightingsPage } from './pages/SightingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/parks" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/parks" element={<ParksPage />} />
          <Route path="/sightings" element={<SightingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

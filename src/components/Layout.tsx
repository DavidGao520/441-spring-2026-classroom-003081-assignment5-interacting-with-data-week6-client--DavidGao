import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <Link to="/auth">Auth</Link>
        <Link to="/parks">Parks</Link>
        <Link to="/sightings">Sightings</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

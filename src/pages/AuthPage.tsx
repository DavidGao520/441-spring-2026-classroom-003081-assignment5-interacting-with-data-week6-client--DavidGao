import { type SubmitEvent, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionChecked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    if (!supabase) return
    setNotice(null)
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    setBusy(false)
    if (error) setNotice(error.message)
    else {
      setEmail('')
      setPassword('')
    }
  }

  async function handleSignIn(e: SubmitEvent) {
    e.preventDefault()
    if (!supabase) return
    setNotice(null)
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setBusy(false)
    if (error) setNotice(error.message)
    else {
      setEmail('')
      setPassword('')
    }
  }

  async function handleSignUp() {
    if (!supabase) return
    setNotice(null)
    setBusy(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) setNotice(error.message)
    else {
      setEmail('')
      setPassword('')
      setNotice(
        'Sign up OK. If email confirmation is on, check your inbox; otherwise you should be signed in.',
      )
    }
  }

  if (!supabase) {
    return (
      <div>
        <h1>Auth</h1>
        <p>
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
          to <code>.env.local</code> (Supabase dashboard → Project Settings → API).
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1>Auth</h1>
      <p>
        {!sessionChecked
          ? 'Checking session…'
          : session
            ? (
                <>
                  Currently logged in as <strong>{session.user.email}</strong>
                </>
              )
            : 'Currently not logged in'}
      </p>
      {notice && <p role="status">{notice}</p>}
      <p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={busy || !session}
        >
          Sign out
        </button>
      </p>
      <form onSubmit={(e) => void handleSignIn(e)}>
        <div>
          <label htmlFor="email">
            Email{' '}
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </label>
        </div>
        <div>
          <label htmlFor="password">
            Password{' '}
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </label>
        </div>
        <button type="submit" disabled={busy || !!session}>
          Sign in
        </button>{' '}
        <button type="button" onClick={() => void handleSignUp()} disabled={busy || !!session}>
          Sign up
        </button>
      </form>
    </div>
  )
}

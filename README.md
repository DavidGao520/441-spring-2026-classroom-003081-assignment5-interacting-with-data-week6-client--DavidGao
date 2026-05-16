# Week 6 Class Demo

This is a small **React** frontend for Week 6 class demos. It has three pages—**Auth**, **Parks**, and **Sightings**

- **Auth** — Email/password sign-in and sign-up via [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Parks** — Look up a park by id, lists all placeholder parks below.
- **Sightings** — Form that logs to the console, lists placeholder sightings below.

## Run locally

```bash
npm install
npm run dev
```

## Example placeholder data

These match `src/data/placeholders.ts` until you hook up a real API.

### Parks

A park is just a short id (the same id you type in the look-up box), a full name, and a state abbreviation.

Right now there is one park: Acadia National Park in Maine, id `ACAD`.

```ts
const parks = [{ ID: "ACAD", Name: "Acadia National Park", State: "ME" }];
```

To add another one—say Yellowstone in Wyoming with id `YELL`—add another entry to the list:

```ts
const parks = [
  { ID: "ACAD", Name: "Acadia National Park", State: "ME" },
  { ID: "YELL", Name: "Yellowstone National Park", State: "WY" },
];
```

On the Parks page, try id `ACAD` or `acad` (case does not matter) to see it match the first row.

---

### Sightings

A sighting is when and where something was seen: a date and time, which park (same kind of park id as above), and a species id your app or database uses. The number `id` is just a row id for React keys and later for a database.

There is one sample sighting: park `ACAD`, species `ACAD-1002`, on April 27, 2026 at 22:26:05 UTC (`+00` is UTC).

```ts
const sightings = [
  {
    id: 2,
    date_time: "2026-04-27 22:26:05+00",
    parkID: "ACAD",
    speciesID: "ACAD-1002",
  },
];
```

Another example would be a sighting at Yellowstone on New Year’s Day 2026, species `YELL-2001`, with a new row id `3`:

```ts
const sightings = [
  {
    id: 2,
    date_time: "2026-04-27 22:26:05+00",
    parkID: "ACAD",
    speciesID: "ACAD-1002",
  },
  {
    id: 3,
    date_time: "2026-01-01T12:00:00+00",
    parkID: "YELL",
    speciesID: "YELL-2001",
  },
];
```

Match whatever `date_time` format your backend expects; the sightings form logs values you can line up with this.

---

### Supabase (Auth)

The app reads your project URL and the public anon key from the environment so the browser can use Supabase Auth. Those are not secret like a database password; they still belong in `.env.local`, not in git.

Create `.env.local` in the project root. In the Supabase dashboard, open Project Settings → API and copy the project URL and anon/public key into the file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # or the legacy anon JWT
```

Restart `npm run dev` after you change env vars.

---

Built with [Vite](https://vite.dev/) + [React](https://react.dev/) + [React Router](https://reactrouter.com/) + [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction).

## Security

### XSS

The app is React 19 (`src/main.tsx`) and React auto-escapes anything inside `{}` in JSX. User-controlled stuff like the sighting `Notes` rendered as `{s.Notes}` in `src/pages/ParkDetailPage.tsx`, the park name on `ParksPage.tsx`, and the logged-in user's email on `AuthPage.tsx` all render as text nodes, not html. I don't use `dangerouslySetInnerHTML` anywhere and there's no `react-markdown` or anything like it. The one place a url gets built from data is the sighting image in `SightingImage` inside `ParkDetailPage.tsx`, and its base is the hard-coded `${VITE_SUPABASE_URL}/storage/v1/object/public/SightingsImages/...`, so a `javascript:` url can't sneak into `<img src>`.

### SQL injection

The client never writes sql. Writes go through `supabase-js` — `SightingsPage.tsx` calls `supabase.from('sightings').insert(row)` — which sends values as a typed body to PostgREST, not as a sql string. Reads through my own api pass path params through `encodeURIComponent` first in `src/lib/api.ts`, so an id like `1; DROP TABLE sightings` reaches the server as a literal string and gets parameterized again on that side.

### DDoS

Hosted on Vercel so the edge eats the volumetric stuff before it gets near my code. Every `useEffect` that fires api calls has a stable dependency array — `ParkDetailPage.tsx` keys off `[parkID, since, before]` with a cancellation flag, `ParksPage.tsx` and `SightingsPage.tsx` run once with `[]`. So mounting a page can't accidentally spin up an infinite loop hammering the api. The new Supabase Realtime subscription on `ParkDetailPage` and `SightingsPage` is one long-lived websocket per page instead of a polling loop, so live updates actually mean *fewer* requests, not more.

### Broken Access Control (OWASP A01)

Session state lives in supabase-js. `AuthPage.tsx` reads the session with `supabase.auth.getSession()` and listens for changes with `supabase.auth.onAuthStateChange(...)`; sign in / sign up go through `signInWithPassword` and `signUp`. `SightingsPage.tsx` only shows the submit form once it has a `userId` from the session, otherwise it shows a please-log-in message. But that's only a UX gate. The real rule lives in the database — the `sightings` table has RLS policies that say you can only insert with your own `auth.uid()` and only delete a row where `UserID` matches `auth.uid()`. So even if you bypassed the disabled button somehow, Supabase still rejects the write.

### Security Misconfiguration (OWASP A05)

Vite only bundles env vars prefixed with `VITE_` into the client js. `src/lib/supabaseClient.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The anon key is meant to be public — data safety depends on the RLS policies, not on the key being secret. The service-role key never has a `VITE_` prefix so it never ends up in the bundle. The password input on `AuthPage.tsx` uses `type="password"` with `autoComplete="current-password"`. The real gap is that I don't set a Content-Security-Policy anywhere — adding a `headers` block to `vercel.json` for CSP, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff` would be the next step.

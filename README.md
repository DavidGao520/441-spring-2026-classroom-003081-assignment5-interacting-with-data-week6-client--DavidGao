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

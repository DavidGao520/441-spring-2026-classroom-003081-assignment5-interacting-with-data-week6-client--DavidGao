/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set in `.env` — also used by `vite.config.ts` for the `/api` dev proxy target. */
  readonly VITE_API_LOC?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

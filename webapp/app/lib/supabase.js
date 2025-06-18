import { createClient } from '@supabase/auth-helpers-nextjs'

// Client component client
export const createBrowserClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

// Server component client (misal di Server Actions atau Route Handlers)
export const createServerClient = (cookieStore) =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: () => cookieStore,
    }
  )
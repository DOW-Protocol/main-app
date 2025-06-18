import {
  createServerComponentClient,
  createServerActionClient,
  createMiddlewareClient,
} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Untuk server component (misal di Server Component atau Route Handler)
export const createServerClient = () =>
  createServerComponentClient({ cookies })

// Untuk client component (gunakan supabase-js langsung)
import { createClient } from '@supabase/supabase-js'

export const createBrowserClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

// Alias agar import { createServer } tetap jalan
export const createServer = createServerClient
import { createServer } from '@/app/lib/supabase-server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function AuthButton() {
  const cookieStore = cookies()
  const supabase = createServer()
  const { data: { session } } = await supabase.auth.getSession()

  return session ? (
    <div className="flex items-center gap-4">
      <Link 
        href="/profile"
        className="hidden sm:block text-gray-300 hover:text-white"
      >
        Hey, {session.user.email || session.user.user_metadata?.wallet_address?.slice(0, 6) + '...' + session.user.user_metadata?.wallet_address?.slice(-4)}
      </Link>
      <Link 
        href="/profile"
        className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        Profile
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <Link
      href="/login"
      className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
      Login
    </Link>
  )
}

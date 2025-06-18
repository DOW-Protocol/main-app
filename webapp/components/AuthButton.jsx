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
      <span className="hidden sm:block">Hey, {session.user.email}</span>
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
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthStatus() {
  const [session, setSession] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!session) {
    return (
      <Link href="/login" className="px-4 py-2 font-bold bg-blue-600 rounded-md">
        Login
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="hidden sm:block">{session.user.email}</span>
      <button onClick={handleLogout} className="px-4 py-2 font-bold bg-gray-300 text-gray-800 rounded-md">
        Logout
      </button>
    </div>
  )
}
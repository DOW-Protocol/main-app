'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/app/lib/supabase-browser'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function AuthButton() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
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

  if (loading) {
    return (
      <div className="px-4 py-2">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

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

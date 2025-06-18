'use client'

import { createClient } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 font-bold text-gray-800 bg-gray-300 rounded-md hover:bg-gray-400"
    >
      Logout
    </button>
  )
}
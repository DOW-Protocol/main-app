
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/app/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/login')
        return
      }
      setSession(data.session)
      setUserProfile({
        email: data.session.user.email,
        id: data.session.user.id,
        created_at: data.session.user.created_at,
        wallet_address: data.session.user.user_metadata?.wallet_address || null
      })
      setLoading(false)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push('/login')
        } else {
          setSession(session)
          setUserProfile({
            email: session.user.email,
            id: session.user.id,
            created_at: session.user.created_at,
            wallet_address: session.user.user_metadata?.wallet_address || null
          })
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 space-y-6">
          <div className="border-b border-gray-700 pb-4">
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  User ID
                </label>
                <div className="text-white bg-gray-800 p-3 rounded border font-mono text-sm">
                  {userProfile.id}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="text-white bg-gray-800 p-3 rounded border">
                  {userProfile.email || 'Not provided'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Wallet Address
                </label>
                <div className="text-white bg-gray-800 p-3 rounded border font-mono text-sm">
                  {userProfile.wallet_address || 'No wallet connected'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Account Created
                </label>
                <div className="text-white bg-gray-800 p-3 rounded border">
                  {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Authentication Methods</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <span className="text-gray-300">Email Authentication</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <span className="text-gray-300">Wallet Authentication</span>
                <span className={userProfile.wallet_address ? "text-green-400" : "text-gray-500"}>
                  {userProfile.wallet_address ? "✓ Connected" : "Not Connected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

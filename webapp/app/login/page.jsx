'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false) // Toggle mode
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Arahkan ke sini setelah konfirmasi email
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      alert('Error signing up: ' + error.message)
    } else {
      alert('Check your email for the confirmation link!')
      setIsSigningUp(false) // Balik ke mode login setelah sukses daftar
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert('Error signing in: ' + error.message)
    } else {
      // Refresh halaman untuk memicu state login baru
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">
          {isSigningUp ? 'Create an Account' : 'Sign In to DOW Protocol'}
        </h1>
        <form onSubmit={isSigningUp ? handleSignUp : handleSignIn} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            {isSigningUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center">
          {isSigningUp ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setIsSigningUp(!isSigningUp)} className="font-bold text-blue-400 hover:underline">
            {isSigningUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
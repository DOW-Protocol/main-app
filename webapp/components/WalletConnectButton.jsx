
'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'
import { createBrowserClient } from '@/app/lib/supabase-browser'

export default function WalletConnectButton() {
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to use wallet authentication!')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const signInWithWallet = async () => {
    if (!account) {
      await connectWallet()
      return
    }

    setIsSigningIn(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Create SIWE message
      const domain = window.location.host
      const origin = window.location.origin
      const statement = 'Sign in to DOW Protocol with your Ethereum account.'
      
      const message = new SiweMessage({
        domain,
        address: account,
        statement,
        uri: origin,
        version: '1',
        chainId: await window.ethereum.request({ method: 'eth_chainId' }),
        nonce: Math.random().toString(36).substring(2, 15),
      })

      const messageToSign = message.prepareMessage()
      
      // Sign the message
      const signature = await signer.signMessage(messageToSign)
      
      // Verify signature and create/login user
      const response = await fetch('/api/auth/siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSign,
          signature,
          address: account
        })
      })

      if (response.ok) {
        const { session } = await response.json()
        // Refresh the page to update auth state
        window.location.reload()
      } else {
        throw new Error('Failed to authenticate with wallet')
      }
    } catch (error) {
      console.error('Error signing in with wallet:', error)
      alert('Failed to sign in with wallet')
    } finally {
      setIsSigningIn(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-300">
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
        <button
          onClick={signInWithWallet}
          disabled={isSigningIn}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSigningIn ? 'Signing...' : 'Sign In'}
        </button>
        <button
          onClick={disconnectWallet}
          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

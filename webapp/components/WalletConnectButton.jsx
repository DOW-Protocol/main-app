
'use client'

import { useState } from 'react'
import { useAccount, useConnect, useSignMessage, useChainId } from 'wagmi'
import { SiweMessage } from 'siwe'
import { injected } from 'wagmi/connectors'

export default function WalletConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { signMessageAsync } = useSignMessage()
  const chainId = useChainId()

  const handleWalletLogin = async () => {
    setIsConnecting(true)
    try {
      // Connect wallet if not already connected
      if (!isConnected) {
        await connect({ connector: injected() })
        return // Wait for connection to complete
      }

      if (!address) {
        throw new Error('No wallet address found')
      }

      // Get nonce from server
      const nonceResponse = await fetch('/api/auth/nonce')
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce')
      }
      const { nonce } = await nonceResponse.json()

      // Create SIWE message using the siwe library
      const domain = window.location.host
      const origin = window.location.origin
      const statement = 'Welcome to DOW Protocol!'
      
      const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId,
        nonce,
        issuedAt: new Date().toISOString(),
      })

      const messageToSign = message.prepareMessage()

      // Sign the message using wagmi
      const signature = await signMessageAsync({ message: messageToSign })

      // Send to our API for verification
      const response = await fetch('/api/auth/siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSign,
          signature,
          address,
          nonce,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Authentication successful:', result)
        // Redirect to profile or refresh page
        window.location.href = '/profile'
      } else {
        const error = await response.json()
        console.error('Authentication failed:', error)
        alert('Authentication failed: ' + error.error)
      }
    } catch (error) {
      console.error('SIWE Error:', error)
      alert('Failed to sign in: ' + error.message)
    } finally {
      setIsConnecting(false)
      setShowWalletOptions(false)
    }
  }

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }
    await handleWalletLogin()
  }

  const connectWalletConnect = async () => {
    // For now, show a message that WalletConnect is coming soon
    alert('WalletConnect integration coming soon! Please use MetaMask for now.')
    setShowWalletOptions(false)
  }

  if (isConnected && address) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-2">Connected:</p>
        <p className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        <button
          onClick={handleWalletLogin}
          className="mt-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
        >
          Sign In with Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletOptions(!showWalletOptions)}
        disabled={isConnecting}
        className="w-full px-4 py-2 font-bold text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>

      {showWalletOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
          <button
            onClick={connectMetaMask}
            className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 border-b border-gray-600"
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <div className="font-medium">MetaMask</div>
              <div className="text-xs text-gray-400">Connect using browser extension</div>
            </div>
          </button>
          
          <button
            onClick={connectWalletConnect}
            className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <div className="font-medium">WalletConnect</div>
              <div className="text-xs text-gray-400">Scan with mobile wallet</div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

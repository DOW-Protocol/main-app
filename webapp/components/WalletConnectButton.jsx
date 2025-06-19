
'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'

export default function WalletConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [account, setAccount] = useState(null)
  const [showWalletOptions, setShowWalletOptions] = useState(false)

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }
        })
        .catch(console.error)
    }
  }, [])

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    setIsConnecting(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      
      const address = accounts[0]
      setAccount(address)

      // Create SIWE message
      const domain = window.location.host
      const origin = window.location.origin
      const statement = 'Sign in with Ethereum to DOW Protocol'
      
      const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: 1,
        nonce: Math.random().toString(36).substring(7),
      })

      const messageToSign = message.prepareMessage()

      // Sign the message
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const signature = await signer.signMessage(messageToSign)

      // Send to our API
      const response = await fetch('/api/auth/siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSign,
          signature,
          address,
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
      console.error('Error connecting wallet:', error)
      alert('Error connecting wallet: ' + error.message)
    } finally {
      setIsConnecting(false)
      setShowWalletOptions(false)
    }
  }

  const connectWalletConnect = async () => {
    // For now, show a message that WalletConnect is coming soon
    alert('WalletConnect integration coming soon! Please use MetaMask for now.')
    setShowWalletOptions(false)
  }

  if (account) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-2">Connected:</p>
        <p className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">
          {account.slice(0, 6)}...{account.slice(-4)}
        </p>
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

import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// In-memory store for nonces (in production, use Redis or database)
const nonceStore = new Map()

// Clean up expired nonces every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [nonce, timestamp] of nonceStore.entries()) {
    if (now - timestamp > 10 * 60 * 1000) { // 10 minutes expiry
      nonceStore.delete(nonce)
    }
  }
}, 5 * 60 * 1000)

export async function GET() {
  try {
    // Generate a cryptographically secure random nonce
    const nonce = randomBytes(16).toString('hex')
    
    // Store nonce with timestamp
    nonceStore.set(nonce, Date.now())
    
    return NextResponse.json({ nonce })
  } catch (error) {
    console.error('Error generating nonce:', error)
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { nonce } = await request.json()
    
    if (!nonce || !nonceStore.has(nonce)) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 400 }
      )
    }
    
    // Check if nonce is not expired (10 minutes)
    const timestamp = nonceStore.get(nonce)
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      nonceStore.delete(nonce)
      return NextResponse.json(
        { error: 'Nonce expired' },
        { status: 400 }
      )
    }
    
    // Remove nonce after validation (single use)
    nonceStore.delete(nonce)
    
    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error validating nonce:', error)
    return NextResponse.json(
      { error: 'Failed to validate nonce' },
      { status: 500 }
    )
  }
}

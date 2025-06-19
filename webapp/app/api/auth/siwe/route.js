
import { NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { createServer } from '@/app/lib/supabase-server'

export async function POST(request) {
  try {
    const { message, signature, address, nonce } = await request.json()

    // Validate nonce first
    const nonceResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/nonce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nonce }),
    })

    if (!nonceResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 400 }
      )
    }

    // Verify the SIWE message
    const siweMessage = new SiweMessage(message)
    const fields = await siweMessage.verify({ signature })

    if (!fields.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Additional validation: ensure the nonce in the message matches the provided nonce
    if (siweMessage.nonce !== nonce) {
      return NextResponse.json(
        { error: 'Nonce mismatch' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createServer()

    // Check if user exists with this wallet address
    let { data: existingUser } = await supabase
      .from('auth.users')
      .select('*')
      .eq('raw_user_meta_data->>wallet_address', address.toLowerCase())
      .single()

    let user
    if (existingUser) {
      // User exists, sign them in
      user = existingUser
    } else {
      // Create new user with wallet address
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: `${address.toLowerCase()}@wallet.local`,
        email_confirm: true,
        user_metadata: {
          wallet_address: address.toLowerCase(),
          auth_method: 'wallet'
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      user = newUser.user
    }

    // Generate session token
    const { error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile`
      }
    })

    if (sessionError) {
      console.error('Error generating session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to generate session' },
        { status: 500 }
      )
    }
    
    // Create a session for the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: 'wallet-auth-' + address.toLowerCase()
    })

    if (signInError) {
      // If password sign-in fails, try to update the user's password and sign in
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'wallet-auth-' + address.toLowerCase()
      })

      if (!updateError) {
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: 'wallet-auth-' + address.toLowerCase()
        })

        if (retryError) {
          console.error('Retry sign-in error:', retryError)
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        wallet_address: address.toLowerCase()
      }
    })

  } catch (error) {
    console.error('SIWE authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

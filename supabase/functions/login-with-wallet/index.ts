
// supabase/functions/login-with-wallet/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SiweMessage } from 'https://esm.sh/siwe@2.1.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your specific domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client - these should be set in your Supabase project's Edge Function settings
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('CRITICAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables for Edge Function.')
}

serve(async (req: Request) => {
  // Handle OPTIONS preflight request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let supabaseClient: SupabaseClient | null = null
  if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    })
  } else {
    // This error indicates a server-side configuration problem
    return new Response(JSON.stringify({ error: 'Server configuration error: Supabase client cannot be initialized.' }), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400, // Bad Request
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { message, signature } = requestBody;

  if (!message || !signature) {
    return new Response(JSON.stringify({ error: 'Missing SIWE message or signature in request body' }), {
      status: 400, // Bad Request
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const siweMessage = new SiweMessage(message)
    const nonceFromMessage = siweMessage.nonce

    if (!nonceFromMessage) {
        throw new Error('Nonce not found in the SIWE message.')
    }

    // 1. Fetch the nonce from your database (e.g., 'nonces' table)
    const { data: nonceRecord, error: nonceError } = await supabaseClient
      .from('nonces') // Make sure you have a 'nonces' table
      .select('nonce, expires_at')
      .eq('nonce', nonceFromMessage)
      .single()

    if (nonceError || !nonceRecord) {
      console.error('Nonce fetch error or nonce not found in DB:', nonceError?.message)
      // It's important to attempt to delete the nonce from the DB if it was found but an error occurred later,
      // or if it's invalid, to prevent replay if the client somehow got an invalid nonce.
      // However, if it's not found, there's nothing to delete.
      if (nonceRecord) { // Only try to delete if we actually found a record that might be problematic
        await supabaseClient.from('nonces').delete().eq('nonce', nonceFromMessage);
      }
      throw new Error('Invalid or expired nonce. Please try signing in again.')
    }

    // 2. Check if the nonce has expired
    if (new Date(nonceRecord.expires_at) < new Date()) {
      await supabaseClient.from('nonces').delete().eq('nonce', nonceFromMessage) // Delete expired nonce
      throw new Error('Nonce expired. Please try signing in again.')
    }
    
    // 3. Verify the SIWE message
    const { data: verifiedMessageFields, error: verifyError } = await siweMessage.verify({
      signature,
      nonce: nonceRecord.nonce, // This is crucial: use the nonce fetched from DB
      // domain: Deno.env.get('APP_DOMAIN'), // Uncomment and set if you want to verify domain
      // time: new Date().toISOString(), // Uncomment if you want strict time checking for issuedAt
    })

    // 4. CRITICAL: Delete the nonce from the database *immediately* after verification attempt,
    // regardless of whether verification succeeded or failed, to prevent reuse.
    const { error: deleteNonceError } = await supabaseClient
      .from('nonces')
      .delete()
      .eq('nonce', nonceFromMessage)

    if (deleteNonceError) {
      // This is a serious issue. If the nonce can't be deleted, it might be replayed.
      // Log this error prominently and consider failing the authentication.
      console.error('CRITICAL SECURITY ALERT: Failed to delete nonce after verification attempt:', deleteNonceError.message)
      throw new Error('A security step failed during authentication. Please try again.')
    }

    if (verifyError) {
        console.error('SIWE signature verification failed:', verifyError.message)
        throw new Error(`Signature verification failed: ${verifyError.message}. Please ensure your wallet is signing the correct message.`)
    }
    
    // If we reach here, signature is verified and nonce has been used and deleted.
    const userEthAddress = verifiedMessageFields.address.toLowerCase()

    // 5. User lookup or creation & session generation
    // This part depends heavily on your user management strategy (e.g., using Supabase Auth or a custom users table)
    
    // Example: Using Supabase Auth - Upsert user and create session
    // This assumes you want to map the ETH address to a Supabase Auth user.
    // You might need a custom claim or metadata to store the ETH address.
    // For simplicity, let's assume you have a 'profiles' table linked to 'auth.users'
    // and you store the eth_address there.

    // First, try to find an existing Supabase Auth user by their ETH address (if you store it in user_metadata)
    // This is a conceptual step. Supabase Auth doesn't directly support login via arbitrary metadata lookup for JWT generation.
    // A common pattern is to:
    //   a. Create a Supabase Auth user if one doesn't exist (e.g., with a dummy email like `address@wallet.local`).
    //   b. Store the ETH address in `raw_user_meta_data` or a linked `profiles` table.
    //   c. For subsequent logins, you'd identify the user by this ETH address.

    // Simplified: Let's assume we create/get a user and then would manually handle session or return user info.
    // In a real scenario, you'd use supabase.auth.admin.generateLink or similar if integrating with Supabase Auth fully.

    const { data: user, error: upsertError } = await supabaseClient.rpc('upsert_wallet_user', {
        p_eth_address: userEthAddress,
        p_user_metadata: { last_siwe_login: new Date().toISOString(), chain_id: verifiedMessageFields.chainId }
    })

    if (upsertError || !user) {
        console.error('Error upserting user via RPC:', upsertError?.message);
        throw new Error('Failed to process user information.');
    }
    
    // If using Supabase Auth and the RPC returns a user_id from auth.users:
    // const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
    //   type: 'magiclink', // Or other types
    //   email: user.email, // Assuming your RPC returns/creates an email
    // });
    // if (sessionError) throw sessionError;
    // return new Response(JSON.stringify({ status: 'ok', user: user, session: sessionData }), ...);

    // For this example, returning the user info from the RPC (which should include user_id, eth_address etc.)
    return new Response(JSON.stringify({ 
        status: 'ok', 
        user: {
            id: user.id, // Assuming RPC returns id
            address: userEthAddress,
            chainId: verifiedMessageFields.chainId,
            // Potentially other user details from your 'user' object from RPC
        }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (e) {
    console.error('Authentication process error:', e.message)
    // Ensure a generic message for client, but log specific error server-side
    const clientErrorMessage = e.message.startsWith('Signature verification failed') || e.message.startsWith('Invalid or expired nonce') || e.message.startsWith('Nonce expired')
        ? e.message
        : 'Authentication failed due to an unexpected error.';
        
    return new Response(JSON.stringify({ error: clientErrorMessage }), {
      status: 401, // Unauthorized
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

/*
Assumed Supabase Table for Nonces:
CREATE TABLE public.nonces (
  nonce TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

Assumed Supabase RPC function 'upsert_wallet_user':
CREATE OR REPLACE FUNCTION upsert_wallet_user(p_eth_address TEXT, p_user_metadata JSONB DEFAULT '{}')
RETURNS TABLE(id UUID, email TEXT, eth_address TEXT) -- Adjust return type as needed
LANGUAGE plpgsql
SECURITY DEFINER -- Important for admin operations if creating auth.users
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
BEGIN
    -- Normalize address
    p_eth_address := lower(p_eth_address);
    v_user_email := p_eth_address || '@wallet.local'; -- Example dummy email

    -- Check if user exists in auth.users by eth_address in metadata (or a dedicated column)
    SELECT au.id INTO v_user_id
    FROM auth.users au
    WHERE au.raw_user_meta_data->>'eth_address' = p_eth_address;

    IF v_user_id IS NULL THEN
        -- User does not exist, create them
        INSERT INTO auth.users (email, raw_user_meta_data, email_confirmed_at)
        VALUES (v_user_email, jsonb_set('{"eth_address":""}'::jsonb, '{eth_address}', to_jsonb(p_eth_address)) || p_user_metadata, NOW())
        RETURNING auth.users.id INTO v_user_id;
        
        -- Optionally, insert into a public 'profiles' table if you have one
        -- INSERT INTO public.profiles (id, eth_address, ...) VALUES (v_user_id, p_eth_address, ...);
    ELSE
        -- User exists, update metadata if needed
        UPDATE auth.users au
        SET raw_user_meta_data = au.raw_user_meta_data || p_user_metadata
        WHERE au.id = v_user_id;
    END IF;

    RETURN QUERY SELECT au.id, au.email, au.raw_user_meta_data->>'eth_address' as eth_address FROM auth.users au WHERE au.id = v_user_id;
END;
$$;
-- Grant execute permission to the authenticated role (or anon if your function is called by unauthenticated users before login)
-- GRANT EXECUTE ON FUNCTION upsert_wallet_user(TEXT, JSONB) TO authenticated; 
-- GRANT EXECUTE ON FUNCTION upsert_wallet_user(TEXT, JSONB) TO service_role; -- Edge functions run as service_role typically

*/

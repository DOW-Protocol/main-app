import { createServer } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const cookieStore = cookies()

  if (code) {
    const supabase = createServer(cookieStore)
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect ke halaman utama setelah user berhasil login/konfirmasi
  return NextResponse.redirect(requestUrl.origin)
}
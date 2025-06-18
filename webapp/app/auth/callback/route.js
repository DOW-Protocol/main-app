import { createServer } from '@/app/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServer()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect ke halaman utama setelah user berhasil login/konfirmasi
  return NextResponse.redirect(requestUrl.origin)
}
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Kita buat koneksi khusus untuk backend dengan Service Key yang lebih sakti
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Gunakan Service Key dari .env utama
);

// Fungsi untuk MENAMBAH alamat ke watchlist (Metode POST)
export async function POST(req: Request) {
  try {
    const { userId, address } = await req.json();

    if (!userId || !address) {
      return NextResponse.json({ error: 'userId dan address dibutuhkan' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .insert({ user_Id: userId, address: address.toLowerCase() })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*'); // Ambil semua data dari tabel watchlist

    if (error) {
      // Jika ada error dari Supabase, lemparkan error itu
      throw error;
    }

    // Jika berhasil, kembalikan datanya dalam format JSON
    return NextResponse.json(data);
  } catch (error) {
    // Tangkap semua error dan kembalikan pesan yang sesuai
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Fungsi untuk MENGHAPUS alamat dari watchlist (Metode DELETE)
export async function DELETE(req: Request) {
  try {
    const { userId, address } = await req.json();

    if (!userId || !address) {
      return NextResponse.json({ error: 'userId dan address dibutuhkan' }, { status: 400 });
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_Id', userId)
      .eq('address', address.toLowerCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Alamat berhasil dihapus dari watchlist' });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}
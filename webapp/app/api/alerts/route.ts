import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  const dbPath = path.resolve(process.cwd(), '../db.json');

  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);
    return NextResponse.json(db.alerts);
  } catch {
    return NextResponse.json({ error: 'Gagal membaca data' }, { status: 500 });
  }
}
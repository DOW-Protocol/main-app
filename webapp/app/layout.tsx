// File: webapp/app/layout.tsx
// GANTI SEMUA ISI FILE DENGAN KODE INI UNTUK TES

import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DOW Protocol - TESTING',
  description: 'DOW Protocol Command Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ border: '5px solid red', padding: '20px', color: 'white' }}>
          <h1 style={{color: 'red', fontSize: '24px'}}>LAYOUT SEDANG DI-TES</h1>
          <hr style={{margin: '20px 0'}} />
          {children} {/* Ini adalah tempat page.tsx (yang isinya "Halo Dunia") akan muncul */}
        </div>
      </body>
    </html>
  );
}

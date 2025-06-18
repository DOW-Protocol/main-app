// file: webapp/lib/socket.ts
import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL;
// Kita buat satu koneksi di sini dan ekspor, jadi seluruh aplikasi akan pakai yang ini
export const socket = URL ? io(URL) : io();

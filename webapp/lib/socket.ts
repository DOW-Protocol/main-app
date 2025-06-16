// file: webapp/lib/socket.ts
import { io } from "socket.io-client";

const URL = "http://localhost:3001";
// Kita buat satu koneksi di sini dan ekspor, jadi seluruh aplikasi akan pakai yang ini
export const socket = io(URL);
import { Server } from "socket.io";
import http from "http";

// Buat server HTTP dasar
const httpServer = http.createServer();
// Pasang server WebSocket di atasnya
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL, // Izinkan koneksi dari frontend Next.js kita
    methods: ["GET", "POST"]
  }
});

export function startSocketServer() {
  httpServer.listen(3001, () => {
    console.log('✅ Server WebSocket berjalan di port 3001');
  });
  return io;
}

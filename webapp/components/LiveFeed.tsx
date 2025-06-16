"use client";
import { useEffect, useState } from 'react';
import { socket } from '../lib/socket'; // Impor dari pusat koneksi kita

// Definisikan tipe data untuk alert kita agar lebih rapi
interface Alert {
  text: string;
  timestamp: string;
}

export default function LiveFeed() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Fungsi ini akan dipanggil saat koneksi berhasil
    function onConnect() {
      setIsConnected(true);
    }

    // Fungsi ini akan dipanggil saat koneksi terputus
    function onDisconnect() {
      setIsConnected(false);
    }

    // Fungsi ini akan dipanggil saat ada alert baru
    function onNewAlert(newAlert: Alert) {
      setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    }

    // Pasang semua listener kita
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_alert', onNewAlert);

    // Fungsi cleanup ini hanya menghapus listener, tidak memutus koneksi utama
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_alert', onNewAlert);
    };
  }, []);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">
        Status Koneksi: {isConnected ? '🟢 Terhubung' : '🔴 Terputus'}
      </p>
      {alerts.map((alert, index) => (
        <div key={index} className="p-3 mb-2 bg-gray-900 rounded-md border border-gray-700">
          <p className="text-sm text-gray-400">{new Date(alert.timestamp).toLocaleTimeString()}</p>
          <pre className="whitespace-pre-wrap text-white">{alert.text || ''}</pre>
        </div>
      ))}
    </div>
  );
}
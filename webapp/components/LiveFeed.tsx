"use client";
import { useEffect, useState, useRef } from "react";
import { socket } from "../lib/socket"; // Pastikan hanya satu sumber socket

// Tipe data alert
interface Alert {
  text: string;
  timestamp: string;
}

export default function LiveFeed() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState("");
  const alertsRef = useRef<Alert[]>([]);

  useEffect(() => {
    socket.connect();
    
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onNewAlert(newAlert: Alert) {
      // Hindari duplikasi alert jika timestamp sama
      if (!alertsRef.current.find(a => a.timestamp === newAlert.timestamp && a.text === newAlert.text)) {
        alertsRef.current = [newAlert, ...alertsRef.current];
        setAlerts([...alertsRef.current]);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_alert", onNewAlert);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_alert", onNewAlert);
    };
  }, []);

  // Filter alert berdasarkan input user
  const filteredAlerts = alerts.filter(alert =>
    alert.text?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">
        Status Koneksi: {isConnected ? "🟢 Terhubung" : "🔴 Terputus"}
      </p>
      <input
        type="text"
        placeholder="Filter notifikasi..."
        className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded-md"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        aria-label="Filter notifikasi"
        autoComplete="off"
      />
      {filteredAlerts.map((alert, idx) => (
        <div
          key={`${alert.timestamp}-${idx}`}
          className="p-3 mb-2 bg-gray-900 rounded-md border border-gray-700"
        >
          <p className="text-sm text-gray-400">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </p>
          {/* Hindari XSS: pre hanya untuk text, tidak ada dangerouslySetInnerHTML */}
          <pre className="whitespace-pre-wrap text-white">
            {alert.text || ""}
          </pre>
        </div>
      ))}
    </div>
  );
}

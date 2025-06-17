import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from '../config.js';
import fs from 'fs/promises';
import path from 'path';

// Inisialisasi client Discord dengan intents dan partials yang tepat
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel] // Agar bot bisa menerima event dari DM
});

// Hardcode db.json path to project root, no user input allowed
const dbPath = path.resolve(process.cwd(), 'db.json');

/**
 * Login ke Discord dan tampilkan status saat bot siap.
 */
export async function loginToDiscord() {
  client.once('ready', () => {
    console.log(`✅ Bot Discord '${client.user.tag}' sudah online!`);
  });
  await client.login(config.BOT_TOKEN);
}

/**
 * Mengirim pesan langsung (DM) ke user tertentu.
 * @param {string} userId - Discord user ID.
 * @param {string} message - Pesan yang akan dikirim.
 */
export async function sendDirectMessage(userId, message) {
  try {
    const user = await client.users.fetch(userId);
    if (user) {
      await user.send(message);
      console.log(`--> Berhasil mengirim DM ke User ID: ${userId}`);
    }
  } catch (error) {
    console.error(`❌ Gagal mengirim DM ke User ID ${userId}:`, error.message);
  }
}

/**
 * Mengirim pesan ke channel Discord, mencatat ke db.json, dan broadcast ke WebSocket.
 * @param {object} alertObject - Objek alert yang berisi text dan timestamp.
 * @param {object} io - Instance socket.io (opsional).
 */
export async function sendAndRecordMessage(alertObject, io) {
  try {
    // 1. Kirim pesan ke Discord
    const channel = await client.channels.fetch(config.CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      await channel.send(alertObject.text);
    }

    // 2. Tulis seluruh object ke db.json (no user input in path)
    let db = { alerts: [] };
    try {
      const data = await fs.readFile(dbPath, 'utf-8');
      db = JSON.parse(data);
      if (!Array.isArray(db.alerts)) db.alerts = [];
    } catch {
      db = { alerts: [] };
    }
    db.alerts.unshift(alertObject);
    if (db.alerts.length > 50) db.alerts.pop();
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    // 3. Siarkan via WebSocket
    if (io) {
      io.emit('new_alert', alertObject);
    }
  } catch (error) {
    console.error(`❌ Gagal mengirim atau mencatat pesan: ${error.message}`);
  }
}
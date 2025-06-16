import { Client, GatewayIntentBits } from "discord.js";
import { config } from '../config.js';
import fs from 'fs/promises';
import path from 'path';

export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const dbPath = path.resolve('./db.json');

export async function loginToDiscord() {
  client.once('ready', () => {
    console.log(`✅ Bot Discord '${client.user.tag}' sudah online!`);
  });
  await client.login(config.BOT_TOKEN);
}

// Fungsi ini sekarang menjadi satu-satunya sumber pengiriman pesan dan pencatatan
export async function sendAndRecordMessage(alertObject, io) {
  try {
    // 1. Kirim pesan ke Discord
    const channel = await client.channels.fetch(config.CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      channel.send(alertObject.text);
    }

    // 2. Tulis seluruh object ke db.json
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);
    db.alerts.unshift(alertObject);
    if (db.alerts.length > 50) {
      db.alerts.pop();
    }
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    // 3. Siarkan via WebSocket
    if (io) {
      io.emit('new_alert', alertObject);
    }
  } catch (error) {
    console.error(`❌ Gagal mengirim atau mencatat pesan: ${error.message}`);
  }
}
import { ethers } from "ethers";
import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";

// --- Konfigurasi ---
const RPC_URL = process.env.ARBITRUM_RPC_URL;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const INTERVAL_MS = 15000;
// --------------------

let lastProcessedBlock = 0;
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ] 
});

async function sendMessage(message) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      channel.send(message);
    }
  } catch (error) {
    console.error("❌ Gagal mengirim pesan ke Discord:", error.message);
  }
}

async function processBlock(provider) {
  try {
    const block = await provider.getBlock('latest');

    if (block.number <= lastProcessedBlock) {
      console.log(`[${new Date().toLocaleTimeString()}] Blok masih sama (${block.number}), skip...`);
      return;
    }

    lastProcessedBlock = block.number;
    const message = `✅ Blok BARU terdeteksi: **${block.number}** | Terdapat **${block.transactions.length}** transaksi.`;

    console.log(message);
    await sendMessage(message);

  } catch (error) {
    console.error("❌ Gagal mengambil atau memproses blok:", error.message);
  }
}

async function main() {
  if (!BOT_TOKEN || !CHANNEL_ID || !RPC_URL) {
    console.error("Error: Pastikan DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, dan ARBITRUM_RPC_URL sudah diatur di file .env");
    return;
  }

  client.once('ready', () => {
    console.log(`✅ Bot Discord '${client.user.tag}' sudah online!`);
    console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    setInterval(() => {
      processBlock(provider);
    }, INTERVAL_MS);
  });

  console.log("Mencoba login ke Discord...");
  client.login(BOT_TOKEN);
}

main();
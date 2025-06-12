/* eslint-disable no-unused-vars */
import { ethers } from "ethers";
import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import knownAddresses from "./knownAddresses.json" with { type: "json" };
import genericABI from "./genericABI.json" with { type: "json" };

// --- Konfigurasi ---
const RPC_URL = process.env.ARBITRUM_RPC_URL;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const INTERVAL_MS = 20000;
// --------------------

let lastProcessedBlock = 0;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const provider = new ethers.JsonRpcProvider(RPC_URL);
const genericInterface = new ethers.Interface(genericABI);
// Buat daftar alamat yang akan dipantau dalam format lowercase untuk perbandingan yang konsisten
const monitoredAddresses = Object.keys(knownAddresses).map(addr => addr.toLowerCase());

async function sendMessage(message) {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            channel.send(message);
        }
    } catch (error) {
        console.error(`❌ Gagal mengirim pesan ke Discord: ${error.message}`);
    }
}

async function processBlock() {
  try {
    const block = await provider.getBlock('latest', true); // Prefetch transactions

    if (block.number <= lastProcessedBlock) { return; }
    lastProcessedBlock = block.number;
    console.log(`[${new Date().toLocaleTimeString()}] Memeriksa Blok BARU: ${block.number}`);

    for (const tx of block.prefetchedTransactions) {
      const toAddress = tx.to ? tx.to.toLowerCase() : null;

      // Cek jika alamat tujuan ada di dalam daftar pantauan kita
      if (toAddress && monitoredAddresses.includes(toAddress)) {
        const contractInfo = knownAddresses[Object.keys(knownAddresses).find(k => k.toLowerCase() === toAddress)];

        try {
          const decodedData = genericInterface.parseTransaction({ data: tx.data, value: tx.value });
          if (decodedData) {
            const alertMessage = `${contractInfo.emoji} **${contractInfo.name} Alert!**\nFungsi **${decodedData.name}** dipanggil di Blok ${block.number}.\n[Lihat Transaksi](https://arbiscan.io/tx/${tx.hash})`;
            console.log(`--> Terdeteksi fungsi di ${contractInfo.name}: ${decodedData.name}`);
            await sendMessage(alertMessage);
          }
        } catch (e) {
          const alertMessage = `${contractInfo.emoji} **${contractInfo.name} Alert!**\nInteraksi kontrak (tidak terdekode) terdeteksi di Blok ${block.number}.\n[Lihat Transaksi](https://arbiscan.io/tx/${tx.hash})`;
          console.log(`--> Interaksi kontrak umum terdeteksi di ${contractInfo.name}`);
          await sendMessage(alertMessage);
        }
      }
    }

  } catch (error) {
    console.error(`❌ Gagal memproses blok: ${error.message}`);
  }
}

client.once('ready', () => {
    console.log(`✅ Bot Discord '${client.user.tag}' sudah online!`);
    console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);
    processBlock();
    setInterval(processBlock, INTERVAL_MS);
});

client.login(BOT_TOKEN);
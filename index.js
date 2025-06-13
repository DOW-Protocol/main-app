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

/**
 * Fungsi untuk mendeteksi pola sandwich attack sederhana.
 * @param {Array} transactions - Array berisi objek transaksi dari satu blok.
 * @param {number} blockNumber - Nomor blok saat ini.
 */
async function detectSandwichAttack(transactions, blockNumber) {
  if (transactions.length < 3) return; // Butuh minimal 3 transaksi untuk pola sandwich

  console.log(`--> Menganalisis ${transactions.length} transaksi untuk pola sandwich...`);

  for (let i = 0; i <= transactions.length - 3; i++) {
    const tx1 = transactions[i];
    const tx2 = transactions[i + 1];
    const tx3 = transactions[i + 2];

    // Ciri-ciri sandwich sederhana: Pengirim tx1 dan tx3 sama, dan berbeda dari tx2
    if (tx1.from === tx3.from && tx1.from !== tx2.from) {
      const alertMessage = `🥪 **Potensi Sandwich Attack Terdeteksi di Blok ${blockNumber}!**\n**Attacker:** ${tx1.from}\n**Korban:** ${tx2.from}\n[Lihat Transaksi Korban](https://arbiscan.io/tx/${tx2.hash})`;
      
      console.log(alertMessage);
      await sendMessage(alertMessage);
      
      i += 2; // Lompat 2 indeks ke depan untuk menghindari deteksi ganda
    }
  }
}

async function processBlock() {
  try {
    const block = await provider.getBlock('latest', true);
    
    if (block.number <= lastProcessedBlock) { return; }
    lastProcessedBlock = block.number;
    console.log(`\n[${new Date().toLocaleTimeString()}] Memeriksa Blok BARU: ${block.number}`);

    // Kita fokuskan deteksi sandwich di satu DEX dulu untuk kesederhanaan
    const sushiRouterAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506".toLowerCase();
    const sushiTransactions = block.prefetchedTransactions.filter(tx => tx && tx.to && tx.to.toLowerCase() === sushiRouterAddress);

    // Jika ada transaksi ke SushiSwap di blok ini, jalankan detektornya
    if (sushiTransactions.length > 0) {
      await detectSandwichAttack(sushiTransactions, block.number);
    }
    
  } catch (error) {
    console.error(`❌ Gagal memproses blok: ${error.message}`);
  }
}

client.once('ready', () => {
    console.log(`✅ Bot Discord '${client.user.tag}' sudah online!`);
    console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);
    
    processBlock(); // Jalankan sekali saat startup
    setInterval(processBlock, INTERVAL_MS);
});

client.login(BOT_TOKEN);
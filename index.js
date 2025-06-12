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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});
const provider = new ethers.JsonRpcProvider(RPC_URL);

async function sendMessage(message) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) channel.send(message);
  } catch (error) {
    console.error(`❌ Gagal mengirim pesan ke Discord: ${error.message}`);
  }
}

async function processBlock() {
  try {
    const block = await provider.getBlock('latest');
    
    if (block.number <= lastProcessedBlock) {
      console.log(`[${new Date().toLocaleTimeString()}] Blok masih sama (${block.number}), skip...`);
      return;
    }

    lastProcessedBlock = block.number;
    
    // Mengambil detail semua transaksi dalam blok secara bersamaan
    const txPromises = block.transactions.map(txHash => provider.getTransaction(txHash));
    const transactions = await Promise.all(txPromises);

    // Filter untuk mencari transaksi yang merupakan interaksi kontrak
    const contractInteractions = transactions.filter(tx => tx && tx.data !== '0x');
    
    const blockTimestamp = new Date(block.timestamp * 1000).toLocaleTimeString();
    
    if (contractInteractions.length === 0) {
      const logMessage = `[${blockTimestamp}] Blok ${block.number}: Tidak ada interaksi kontrak.`;
      console.log(logMessage);
    } else {
      const logMessage = `[${blockTimestamp}] Blok ${block.number}: Ditemukan ${contractInteractions.length} interaksi kontrak!`;
      console.log(logMessage);
      
      // String template literal yang bersih
      const alertMessage = `🚨 **Blok Baru: ${block.number}** | Ditemukan **${contractInteractions.length}** interaksi kontrak!`;
      await sendMessage(alertMessage);
    }

  } catch (error) {
    console.error(`❌ Gagal memproses blok: ${error.message}`);
  }
}

client.once('ready', () => {
  console.log(`✅ Bot Discord '${client.user.tag}' sudah online!`);
  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);
  
  // Langsung jalankan sekali saat startup
  processBlock(); 
  // Kemudian jalankan berulang kali
  setInterval(processBlock, INTERVAL_MS);
});

client.login(BOT_TOKEN);
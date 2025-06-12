import { ethers } from "ethers";
import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import sushiswapRouterABI from "./sushiswapRouterABI.json" with { type: "json" };

const RPC_URL = process.env.ARBITRUM_RPC_URL;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const SUSHISWAP_ROUTER_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const INTERVAL_MS = 15000;

let lastProcessedBlock = 0;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const provider = new ethers.JsonRpcProvider(RPC_URL);
const sushiInterface = new ethers.Interface(sushiswapRouterABI);

async function sendMessage(message) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      channel.send(message);
    } else {
      console.error(`❌ Tidak dapat menemukan channel atau channel bukan channel teks. Channel ID: ${CHANNEL_ID}`);
    }
  } catch (error) {
    console.error(`❌ Gagal mengirim pesan ke Discord: ${error.message}`);
  }
}

async function processBlock() {
  try {
    const block = await provider.getBlock('latest');
    
    if (block.number <= lastProcessedBlock) {
      return; 
    }
    
    lastProcessedBlock = block.number;
    console.log(`[${new Date().toLocaleTimeString()}] Memeriksa Blok BARU: ${block.number}`);

    const transactions = await Promise.all(
      block.transactions.map(txHash => provider.getTransaction(txHash))
    );

    const sushiTransactions = transactions.filter(tx => tx && tx.to && tx.to.toLowerCase() === SUSHISWAP_ROUTER_ADDRESS.toLowerCase());

    if (sushiTransactions.length > 0) {
      for (const tx of sushiTransactions) {
        try {
          const decodedData = sushiInterface.parseTransaction({ data: tx.data, value: tx.value });
          
          if (decodedData) {
            const ethValue = ethers.formatEther(tx.value);
            const alertMessage = `🍣 **SushiSwap Alert!**\nFungsi **${decodedData.name}** dipanggil di Blok ${block.number}.\n[Lihat Transaksi](https://arbiscan.io/tx/${tx.hash})`;
            
            console.log(`--> Terdeteksi fungsi di SushiSwap: ${decodedData.name}`);
            await sendMessage(alertMessage);
          }
        } catch (e) {
          // Abaikan jika data tidak bisa diterjemahkan (bukan fungsi yang ada di ABI)
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
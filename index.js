import { getLatestBlock } from './services/blockchain.js';
import { startDiscordBot } from './services/discord.js';
import { detectSandwichAttack } from './analysis/sandwichDetector.js';
import { config } from './config.js';

let lastProcessedBlock = 0;

async function mainLoop() {
  console.log(`\n[${new Date().toLocaleTimeString()}] Memeriksa blok baru...`);
  const block = await getLatestBlock();
  if (!block || block.number <= lastProcessedBlock) {
    return;
  }
  lastProcessedBlock = block.number;
  console.log(`--> Memproses Blok #${block.number}`);

  // Fokuskan deteksi pada SushiSwap untuk saat ini
  const sushiTransactions = block.prefetchedTransactions.filter(
    tx => tx && tx.to && tx.to.toLowerCase() === config.SUSHISWAP_ROUTER_ADDRESS.toLowerCase()
  );

  if (sushiTransactions.length > 0) {
    await detectSandwichAttack(sushiTransactions, block.number);
  }
}

async function run() {
  await startDiscordBot();
  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${config.INTERVAL_MS / 1000} detik.`);
  setInterval(mainLoop, config.INTERVAL_MS);
}

run();
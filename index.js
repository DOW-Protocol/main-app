import { getLatestBlock, genericInterface } from './services/blockchain.js';
import { startDiscordBot, sendMessage } from './services/discord.js';
import { detectSandwichAttack } from './analysis/sandwichDetector.js';
import { config } from './config.js';
import knownAddresses from './knownAddresses.json' with { type: "json" };


let lastProcessedBlock = 0;
const monitoredAddresses = Object.keys(knownAddresses).map(addr => addr.toLowerCase());

async function mainLoop() {
  try {
    console.log(`\n[${new Date().toLocaleTimeString()}] Memeriksa blok baru...`);
    const block = await getLatestBlock();
    if (!block || block.number <= lastProcessedBlock) {
      if (block) console.log(`--> Blok masih sama (${block.number}), skip.`);
      return;
    }
    lastProcessedBlock = block.number;
    console.log(`--> Memproses Blok #${block.number} dengan ${block.transactions.length} total transaksi.`);

    // Alert untuk semua alamat di buku telepon
    for (const tx of block.prefetchedTransactions || []) {
      const toAddress = tx.to ? tx.to.toLowerCase() : null;
      if (toAddress && monitoredAddresses.includes(toAddress)) {
        const key = Object.keys(knownAddresses).find(k => k.toLowerCase() === toAddress);
        const contractInfo = knownAddresses[key];
        const alertMessage = `${contractInfo.emoji} **${contractInfo.name} Alert!**\nTerdeteksi transaksi di Blok ${block.number}.\n[Lihat Transaksi](https://arbiscan.io/tx/${tx.hash})`;
        console.log(`--> Terdeteksi aktivitas di ${contractInfo.name}!`);
        await sendMessage(alertMessage);
      }
    }

    // Deteksi sandwich attack khusus SushiSwap
    const sushiRouterAddress = config.SUSHISWAP_ROUTER_ADDRESS.toLowerCase();
    const sushiTransactions = (block.prefetchedTransactions || []).filter(
      tx => tx && tx.to && tx.to.toLowerCase() === sushiRouterAddress
    );
    if (sushiTransactions.length > 0) {
      await detectSandwichAttack(sushiTransactions, block.number, genericInterface);
    }
  } catch (err) {
    console.error('Error di mainLoop:', err);
  }
}

async function run() {
  await startDiscordBot();
  const block = await getLatestBlock();
  if (block && block.number) lastProcessedBlock = block.number;
  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${config.INTERVAL_MS / 1000} detik.`);
  setInterval(mainLoop, config.INTERVAL_MS);
}

run();

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
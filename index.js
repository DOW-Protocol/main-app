import { ethers } from "ethers";

const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";
const INTERVAL_MS = 15000;

let lastProcessedBlock = null;

function connectToProvider() {
  console.log("Mencoba menghubungkan ke Arbitrum...");
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    return provider;
  } catch (err) {
    console.error("❌ Gagal membuat provider:", err.message);
    process.exit(1);
  }
}

async function processBlock(provider) {
  try {
    const block = await provider.getBlock('latest');
    if (block.number === lastProcessedBlock) {
      console.log(`[${new Date().toLocaleTimeString()}] Blok masih sama (${block.number}), skip...`);
      return;
    }
    lastProcessedBlock = block.number;
    console.log(`\n[${new Date().toLocaleTimeString()}] ✅ Memproses Blok BARU: ${block.number}`);
    const transactionHashes = block.transactions;
    if (!transactionHashes || transactionHashes.length === 0) {
      console.log("--> Tidak ada transaksi di dalam blok ini.");
    } else {
      console.log(`--> Ditemukan ${transactionHashes.length} transaksi.`);
    }
  } catch (error) {
    console.error("❌ Gagal mengambil atau memproses blok:", error.message);
  }
}

async function main() {
  const provider = connectToProvider();
  // Inisialisasi lastProcessedBlock dengan blok terbaru saat startup
  try {
    const block = await provider.getBlock('latest');
    lastProcessedBlock = block.number;
    console.log(`Memulai dari blok ${lastProcessedBlock}`);
  } catch (err) {
    console.error("❌ Gagal mengambil blok awal:", err.message);
    process.exit(1);
  }
  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);
  setInterval(() => {
    processBlock(provider);
  }, INTERVAL_MS);
}

main();

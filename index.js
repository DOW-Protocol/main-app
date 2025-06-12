import { ethers } from "ethers";

const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";
const INTERVAL_MS = 15000;

// Variabel "memori" untuk menyimpan nomor blok terakhir
let lastProcessedBlock = 0;

function connectToProvider() {
  console.log("Mencoba menghubungkan ke Arbitrum...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return provider;
}

async function processBlock(provider) {
  try {
    const block = await provider.getBlock('latest');

    // LOGIKA BARU: Cek apakah blok ini sudah pernah diproses
    if (block.number === lastProcessedBlock) {
      console.log(`[${new Date().toLocaleTimeString()}] Blok masih sama (${block.number}), skip...`);
      return; // Hentikan fungsi jika bloknya sama
    }

    // Jika bloknya baru, update "memori" kita
    lastProcessedBlock = block.number;

    console.log(`\n[${new Date().toLocaleTimeString()}] ✅ Memproses Blok BARU: ${block.number}`);

    const transactionHashes = block.transactions;

    if (transactionHashes.length === 0) {
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
  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);

  setInterval(() => {
    processBlock(provider);
  }, INTERVAL_MS);
}

main();
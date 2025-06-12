import { ethers } from "ethers";

const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";
const INTERVAL_MS = 15000; // Interval pengecekan: 15 detik

function connectToProvider() {
  console.log("Mencoba menghubungkan ke Arbitrum...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return provider;
}

async function processBlock(provider) {
  try {
    const block = await provider.getBlock('latest');
    console.log(`\n[${new Date().toLocaleTimeString()}] Memeriksa Blok Nomor: ${block.number}`);

    const transactionHashes = block.transactions;

    if (transactionHashes.length === 0) {
      console.log("--> Tidak ada transaksi di dalam blok ini.");
    } else {
      console.log(`--> Ditemukan ${transactionHashes.length} transaksi.`);
      // Di sini kita bisa tambahkan logika lain nanti
    }
  } catch (error) {
    console.error("❌ Gagal mengambil atau memproses blok:", error.message);
  }
}

// Fungsi utama yang sekarang menjalankan loop
async function main() {
  const provider = connectToProvider();

  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);

  // Jalankan pertama kali langsung
  await processBlock(provider);

  // Kemudian jalankan berulang kali sesuai interval
  setInterval(() => {
    processBlock(provider);
  }, INTERVAL_MS);
}

main();
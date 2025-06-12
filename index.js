import { ethers } from "ethers";

const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";
 fitur/s2-cegah-duplikasi
const INTERVAL_MS = 15000;

// Variabel "memori" untuk menyimpan nomor blok terakhir
let lastProcessedBlock = 0;

const INTERVAL_MS = 15000; // Interval pengecekan: 15 detik
 main

function connectToProvider() {
  console.log("Mencoba menghubungkan ke Arbitrum...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return provider;
}

async function processBlock(provider) {
  try {
    const block = await provider.getBlock('latest');
 fitur/s2-cegah-duplikasi

    // LOGIKA BARU: Cek apakah blok ini sudah pernah diproses
    if (block.number === lastProcessedBlock) {
      console.log(`[${new Date().toLocaleTimeString()}] Blok masih sama (${block.number}), skip...`);
      return; // Hentikan fungsi jika bloknya sama
    }

    // Jika bloknya baru, update "memori" kita
    lastProcessedBlock = block.number;

    console.log(`\n[${new Date().toLocaleTimeString()}] ✅ Memproses Blok BARU: ${block.number}`);

    console.log(`\n[${new Date().toLocaleTimeString()}] Memeriksa Blok Nomor: ${block.number}`);
 main

    const transactionHashes = block.transactions;

    if (transactionHashes.length === 0) {
      console.log("--> Tidak ada transaksi di dalam blok ini.");
    } else {
      console.log(`--> Ditemukan ${transactionHashes.length} transaksi.`);
 fitur/s2-cegah-duplikasi

      // Di sini kita bisa tambahkan logika lain nanti
 main
    }

  } catch (error) {
    console.error("❌ Gagal mengambil atau memproses blok:", error.message);
  }
}

 fitur/s2-cegah-duplikasi
async function main() {
  const provider = connectToProvider();
  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);


// Fungsi utama yang sekarang menjalankan loop
async function main() {
  const provider = connectToProvider();

  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${INTERVAL_MS / 1000} detik.`);

  // Jalankan pertama kali langsung
  await processBlock(provider);

  // Kemudian jalankan berulang kali sesuai interval
 main
  setInterval(() => {
    processBlock(provider);
  }, INTERVAL_MS);
}

main();
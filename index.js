// Import library ethers
import { ethers } from "ethers";

// PENTING: Ganti dengan URL RPC dari Alchemy/Infura lo
const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";

// Fungsi utama untuk menjalankan program
async function main() {
  console.log("Menghubungkan ke Arbitrum untuk mengambil blok terbaru...");

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  try {
  const block = await provider.getBlock('latest');
  
  console.log(`✅ Berhasil mengambil data dari Blok Nomor: ${block.number}`);
  console.log("----------------------------------------------------");

  const transactionHashes = block.transactions;

  // Cek dulu ada transaksinya atau tidak
  if (transactionHashes.length === 0) {
    console.log("--> Tidak ada transaksi di dalam blok ini.");
  } else {
    console.log(`--> Ditemukan ${transactionHashes.length} transaksi. Menampilkan hingga 10 hash pertama:`);
    const first10Hashes = transactionHashes.slice(0, 10);
    first10Hashes.forEach((txHash, index) => {
      console.log(`${index + 1}. ${txHash}`);
    });
  }

    } catch (error) {
  console.error("❌ Gagal mengambil data blok:", error.message);
    }
}

// Menjalankan fungsi utama
main();
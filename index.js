// Import library ethers
import { ethers } from "ethers";

// PENTING: Ganti dengan URL RPC dari Alchemy/Infura lo
const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";

// Fungsi utama untuk menjalankan program
async function main() {
  console.log("Mencoba menghubungkan ke Arbitrum...");

  // Membuat koneksi ke blockchain via RPC
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  try {
    // Mencoba mengambil nomor blok terakhir untuk tes koneksi
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Koneksi berhasil! Blok terakhir adalah: ${blockNumber}`);
  } catch (error) {
    console.error("❌ Gagal terhubung:", error.message);
  }
}

// Menjalankan fungsi utama
main();
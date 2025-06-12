// Import library ethers
import { ethers } from "ethers";

// PENTING: Ganti dengan URL RPC dari Alchemy/Infura lo
const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";

/**
 * Fungsi ini khusus untuk membuat koneksi ke provider blockchain.
 * @returns {ethers.JsonRpcProvider} - Object provider yang sudah terhubung.
 */
function connectToProvider() {
  console.log("Mencoba menghubungkan ke Arbitrum...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return provider;
}

/**
 * Fungsi ini khusus untuk memproses satu blok.
 * @param {ethers.JsonRpcProvider} provider - Object provider yang aktif.
 * @param {number | 'latest'} blockNumber - Nomor blok yang ingin diproses.
 */
async function processBlock(provider, blockNumber) {
  try {
    const block = await provider.getBlock(blockNumber);
    console.log(`✅ Berhasil mengambil data dari Blok Nomor: ${block.number}`);

    const transactionHashes = block.transactions;

    if (transactionHashes.length === 0) {
      console.log("--> Tidak ada transaksi di dalam blok ini.");
    } else {
      console.log(`--> Ditemukan ${transactionHashes.length} transaksi. Menampilkan hingga 10 hash pertama:`);
      console.log("====================================================");

      const first10Hashes = transactionHashes.slice(0, 10);
      first10Hashes.forEach((txHash, index) => {
        console.log(`${index + 1}. ${txHash}`);
      });
    }
  } catch (error) {
    console.error(`❌ Gagal mengambil atau memproses blok ${blockNumber}:`, error.message);
  }
}

// Fungsi utama yang sekarang lebih bersih
async function main() {
  const provider = connectToProvider();
  await processBlock(provider, 'latest');
}

// Menjalankan fungsi utama
main();
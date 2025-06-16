// file: services/blockchain.js (VERSI BENAR)
import { ethers } from "ethers";
import { config } from '../config.js';

// Tugasnya hanya membuat satu provider koneksi
const provider = new ethers.JsonRpcProvider(config.RPC_URL);

// Tugasnya hanya satu: mengambil blok terbaru, lengkap dengan detail transaksinya
export async function getLatestBlock() {
  try {
    // Kita tetap ambil detail transaksi di sini untuk efisiensi
    const block = await provider.getBlock('latest', true);
    return block;
  } catch (error) {
    console.error(`❌ Gagal mengambil blok: ${error.message}`);
    return null;
  }
}
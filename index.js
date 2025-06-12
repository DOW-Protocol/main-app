// Import library ethers
import { ethers } from "ethers";

// PENTING: Ganti dengan URL RPC dari Alchemy/Infura lo
const RPC_URL = "https://shape-mainnet.g.alchemy.com/v2/dk0hyao4gWu0HegBmtZEgydbF3WRQVky";

async function main() {
  console.log("Menghubungkan ke Arbitrum untuk mengambil detail transaksi...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  try {
    const block = await provider.getBlock('latest');
    console.log(`✅ Berhasil mengambil data dari Blok Nomor: ${block.number}`);

    const transactionHashes = block.transactions;

    if (transactionHashes.length === 0) {
      console.log("--> Tidak ada transaksi di dalam blok ini.");
    } else {
      console.log(`--> Ditemukan ${transactionHashes.length} transaksi. Menampilkan detail hingga 10 transaksi pertama:`);
      console.log("====================================================");

      const first10Hashes = transactionHashes.slice(0, 10);

      // Loop untuk mengambil detail setiap transaksi
      for (let i = 0; i < first10Hashes.length; i++) {
        const txHash = first10Hashes[i];
        // Ambil detail transaksi berdasarkan hash-nya
        const txDetails = await provider.getTransaction(txHash);

        console.log(`Transaksi #${i + 1}:`);
        console.log(`  Hash: ${txDetails.hash}`);
        console.log(`  Dari: ${txDetails.from}`);
        console.log(`  Ke  : ${txDetails.to}`);
        // Konversi nilai dari Wei ke Ether untuk dibaca manusia
        console.log(`  Nilai: ${ethers.formatEther(txDetails.value)} ETH`);
        console.log("----------------------------------------------------");
      }
    }
  } catch (error) {
    console.error("❌ Gagal mengambil data:", error.message);
  }
}

main();
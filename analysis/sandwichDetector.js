/* eslint-disable no-unused-vars */
import { sendMessage } from '../services/discord.js';

/**
 * Fungsi untuk mendeteksi pola sandwich attack dan mengirim notifikasi detail.
 * @param {Array} transactions - Array berisi objek transaksi dari satu blok.
 * @param {number} blockNumber - Nomor blok saat ini.
 * @param {ethers.Interface} genericInterface - "Kamus" untuk menerjemahkan data transaksi.
 */
export async function detectSandwichAttack(transactions, blockNumber, genericInterface) {
  if (!Array.isArray(transactions) || transactions.length < 3) return;

  for (let i = 0; i <= transactions.length - 3; i++) {
    const tx1 = transactions[i];
    const tx2 = transactions[i + 1];
    const tx3 = transactions[i + 2];

    // Deteksi pola sandwich: tx1.from == tx3.from && tx1.from !== tx2.from
    if (tx1.from === tx3.from && tx1.from !== tx2.from) {
      try {
        // Dekode semua 3 transaksi untuk mendapatkan detailnya
        const decodedTx1 = genericInterface.parseTransaction({ data: tx1.data, value: tx1.value });
        const decodedTx2 = genericInterface.parseTransaction({ data: tx2.data, value: tx2.value });
        const decodedTx3 = genericInterface.parseTransaction({ data: tx3.data, value: tx3.value });

        if (decodedTx1 && decodedTx2 && decodedTx3) {
          // Siapkan pesan alert dengan format markdown Discord
          const alertMessage = 
`🥪 **Potensi Sandwich Attack Terdeteksi di Blok ${blockNumber}!**

**Attacker:** ${tx1.from}
**Korban:** ${tx2.from}

--- DETIL SERANGAN ---

[BOT] Memanggil fungsi: ${decodedTx1.name}
[Link](https://arbiscan.io/tx/${tx1.hash})

[KORBAN] Memanggil fungsi: ${decodedTx2.name}
[Link](https://arbiscan.io/tx/${tx2.hash})

[BOT] Memanggil fungsi: ${decodedTx3.name}
[Link](https://arbiscan.io/tx/${tx3.hash})
`;

          console.log("--> Pola sandwich terdeteksi! Mengirim rich alert...");
          await sendMessage(alertMessage);
          i += 2; // Lewati dua transaksi berikutnya karena sudah diproses
        }
      } catch (e) {
        // Jika ada transaksi yang gagal di-decode, lewati saja
        continue;
      }
    }
  }
}
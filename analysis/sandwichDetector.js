import { sendMessage } from '../services/discord.js';

export async function detectSandwichAttack(transactions, blockNumber) {
  if (transactions.length < 3) return;

  for (let i = 0; i <= transactions.length - 3; i++) {
    const tx1 = transactions[i];
    const tx2 = transactions[i+1];
    const tx3 = transactions[i+2];

    if (tx1.from === tx3.from && tx1.from !== tx2.from) {
      const alertMessage = `🥪 **Potensi Sandwich Attack Terdeteksi di Blok ${blockNumber}!**\n**Attacker:** ${tx1.from}\n**Korban:** ${tx2.from}\n[Lihat Transaksi Korban](https://arbiscan.io/tx/${tx2.hash})`;
      console.log(alertMessage);
      await sendMessage(alertMessage);
      i += 2;
    }
  }
}
export function detectSandwichAttack(transactions, blockNumber, genericInterface) {
  const alerts = [];
  if (!Array.isArray(transactions) || transactions.length < 3) {
    return alerts;
  }

  for (let i = 0; i <= transactions.length - 3; i++) {
    const tx1 = transactions[i];
    const tx2 = transactions[i + 1];
    const tx3 = transactions[i + 2];

    if (tx1.from === tx3.from && tx1.from !== tx2.from) {
      try {
        const decodedTx1 = genericInterface.parseTransaction({ data: tx1.data, value: tx1.value });
        const decodedTx2 = genericInterface.parseTransaction({ data: tx2.data, value: tx2.value });
        const decodedTx3 = genericInterface.parseTransaction({ data: tx3.data, value: tx3.value });

        if (decodedTx1 && decodedTx2 && decodedTx3) {
          // Siapkan pesan lengkap dengan link
          const alertMessage = `🥪 **Potensi Sandwich Attack Terdeteksi di Blok ${blockNumber}!**\n**Attacker:** ${tx1.from}\n**Korban:** ${tx2.from}\n[Lihat Transaksi Korban](https://arbiscan.io/tx/${tx2.hash})`;
          alerts.push(alertMessage); // Tambahkan ke array, jangan kirim langsung
          i += 2;
        }
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        continue;
      }
    }
  }
  return alerts;
}
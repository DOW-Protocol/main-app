/* eslint-disable no-unused-vars */
import { getLatestBlock } from './services/blockchain.js';
import { loginToDiscord, sendAndRecordMessage } from './services/discord.js';
import { detectSandwichAttack } from './analysis/sandwichDetector.js';
import { config } from './config.js';
import { startSocketServer } from './services/socket.js';
import knownAddresses from './knownAddresses.json' with { type: "json" };
import uniswapABI from './abis/uniswap.json' with { type: "json" };
import aaveABI from './abis/aave.json' with { type: "json" };
import sushiswapABI from './abis/sushiswap.json' with { type: "json" };
import bungeeABI from './abis/bungee.json' with { type: "json" };
import { ethers } from 'ethers';

const io = startSocketServer();
let lastProcessedBlock = 0;
const monitoredAddresses = Object.keys(knownAddresses).map(addr => addr.toLowerCase());

const interfaces = {
  [config.UNISWAP_ROUTER_ADDRESS.toLowerCase()]: new ethers.Interface(uniswapABI),
  [config.AAVE_POOL_ADDRESS.toLowerCase()]: new ethers.Interface(aaveABI),
  [config.SUSHISWAP_ROUTER_ADDRESS.toLowerCase()]: new ethers.Interface(sushiswapABI),
  [config.BUNGEE_BRIDGE_ADDRESS.toLowerCase()]: new ethers.Interface(bungeeABI),
};

async function mainLoop() {
  try {
    const block = await getLatestBlock();
    if (!block || block.number <= lastProcessedBlock) {
      if (block) {
        console.log(`[${new Date().toLocaleTimeString()}] Blok masih sama (${block.number}), skip.`);
      }
      return;
    }
    lastProcessedBlock = block.number;
    console.log(`\n[${new Date().toLocaleTimeString()}] Memproses Blok #${block.number} (${block.transactions.length} transaksi)`);

    const allAlertsInBlock = [];

    // Deteksi aktivitas ke alamat yang dipantau & decode jika ABI tersedia
    for (const tx of block.prefetchedTransactions || []) {
      const toAddress = tx.to ? tx.to.toLowerCase() : null;
      const iface = interfaces[toAddress];
      if (toAddress && monitoredAddresses.includes(toAddress)) {
        const key = Object.keys(knownAddresses).find(k => k.toLowerCase() === toAddress);
        const contractInfo = knownAddresses[key];
        let alertMessage = '';
        try {
          if (iface) {
            const decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            if (decodedData) {
              alertMessage = `${contractInfo.emoji} **${contractInfo.name} Alert!**\nFungsi **${decodedData.name}** dipanggil di Blok ${block.number}.\n[Lihat Transaksi](https://arbiscan.io/tx/${tx.hash})`;
            }
          }
          if (!alertMessage) {
            alertMessage = `${contractInfo.emoji} **${contractInfo.name} Alert!**\nInteraksi kontrak (tidak terdekode) terdeteksi di Blok ${block.number}.\n[Lihat Transaksi](https://arbiscan.io/tx/${tx.hash})`;
          }
        } catch (e) {
          alertMessage = `${contractInfo.emoji} **${contractInfo.name} Alert!**\nInteraksi kontrak (tidak terdekode) terdeteksi di Blok ${block.number}.\n[Lihat Transaksi](https://arbiscan.io/tx/${tx.hash})`;
        }
        allAlertsInBlock.push(alertMessage);
        console.log(`--> Terdeteksi aktivitas di ${contractInfo.name}!`);
      }
    }

    // Deteksi sandwich attack pada SushiSwap
    const sushiRouterAddress = config.SUSHISWAP_ROUTER_ADDRESS.toLowerCase();
    const sushiTransactions = (block.prefetchedTransactions || []).filter(
      tx => tx && tx.to && tx.to.toLowerCase() === sushiRouterAddress
    );
    if (sushiTransactions.length > 0) {
      const sandwichAlerts = detectSandwichAttack(sushiTransactions, block.number, interfaces[sushiRouterAddress]);
      if (sandwichAlerts.length > 0) {
        allAlertsInBlock.push(...sandwichAlerts);
      }
    }

    // Kirim semua alert yang terkumpul
    if (allAlertsInBlock.length > 0) {
      const finalMessage = allAlertsInBlock.join('\n\n---\n\n');
      const alertObject = { text: finalMessage, timestamp: new Date().toISOString() };
      console.log(`--> Terdeteksi ${allAlertsInBlock.length} alert, mengirim ke Discord & WebSocket...`);
      await sendAndRecordMessage(alertObject, io);
    }
  } catch (err) {
    console.error('Error di mainLoop:', err);
  }
}

async function run() {
  await loginToDiscord();
  const initialBlock = await getLatestBlock();
  if (initialBlock) lastProcessedBlock = initialBlock.number;
  console.log(`Watchtower DOW Protocol dimulai. Pengecekan setiap ${config.INTERVAL_MS / 1000} detik.`);
  setInterval(mainLoop, config.INTERVAL_MS);
}

run();

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
import { ethers } from "ethers";
import { config } from '../config.js';

const provider = new ethers.JsonRpcProvider(config.RPC_URL);

export async function getLatestBlock() {
  try {
    const block = await provider.getBlock('latest', true);
    return block;
  } catch (error) {
    console.error(`❌ Gagal mengambil blok: ${error.message}`);
    return null;
  }
}
import { ethers } from "ethers";
import { config } from '../config.js';
import genericABI from "../genericABI.json" with { type: "json" }; // Tambahkan ini

const provider = new ethers.JsonRpcProvider(config.RPC_URL);
export const genericInterface = new ethers.Interface(genericABI); // Tambahkan ini
export async function getLatestBlock() {
  try {
    const block = await provider.getBlock('latest', true);
    return block;
  } catch (error) {
    console.error(`❌ Gagal mengambil blok: ${error.message}`);
    return null;
  }
}
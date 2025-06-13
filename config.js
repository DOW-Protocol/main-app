import "dotenv/config";

export const config = {
  RPC_URL: process.env.ARBITRUM_RPC_URL,
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  INTERVAL_MS: 20000,
  SUSHISWAP_ROUTER_ADDRESS: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
};
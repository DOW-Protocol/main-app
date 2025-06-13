import { Client, GatewayIntentBits } from "discord.js";
import { config } from '../config.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

export async function startDiscordBot() {
  client.once('ready', () => {
    console.log(`✅ Bot Discord '${client.user.tag}' sudah online!`);
  });
  await client.login(config.BOT_TOKEN);
}

export async function sendMessage(message) {
  try {
    const channel = await client.channels.fetch(config.CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      channel.send(message);
    }
  } catch (error) {
    console.error(`❌ Gagal mengirim pesan ke Discord: ${error.message}`);
  }
}
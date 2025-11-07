import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import fs from "fs";

// === CONFIGURATION VIA VARIABLES D'ENVIRONNEMENT ===
const TOKEN = process.env.DISCORD_TOKEN; // Discord Bot Token
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const LINKEDIN_RSS_URL = process.env.LINKEDIN_RSS_URL; // URL RSS ou JSON de ton Phantom / RSS.app
const LAST_POST_FILE = "last_post.txt";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}!`);
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  channel.send("Test : le bot est en ligne ✅");
});

client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag}!`);
  fetchAndPost(); // premier run immédiat
  setInterval(fetchAndPost, 10 * 60 * 1000); // toutes les 10 minutes
});

client.login(TOKEN);

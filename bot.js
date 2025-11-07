import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import fs from "fs";

// === CONFIGURATION VIA VARIABLES D'ENVIRONNEMENT ===
const TOKEN = process.env.DISCORD_TOKEN; // Token du bot Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const LINKEDIN_RSS_URL = process.env.LINKEDIN_RSS_URL; // URL JSON ou RSS
const LAST_POST_FILE = "last_post.txt";

// === FONCTION PRINCIPALE POUR RÉCUPÉRER LES POSTS ET LES POSTER ===
client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);

  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    if (channel) await channel.send("✅ Test : le bot peut poster !");
  } catch (err) {
    console.log("❌ Impossible d'envoyer le message test :", err);
  }
});

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);

  // Test rapide pour vérifier que le bot peut poster
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) await channel.send("✅ Bot en ligne et opérationnel !");
  } catch (err) {
    console.log("❌ Impossible d'envoyer le message test :", err);
  }

  // Premier fetch de posts
  fetchAndPost();

  // Vérifie toutes les 10 minutes
  setInterval(fetchAndPost, 10 * 60 * 1000);
});

// Lancement du bot
client.login(TOKEN);

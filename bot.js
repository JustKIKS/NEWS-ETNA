import { Client, GatewayIntentBits } from "discord.js";

// === CONFIGURATION ===
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === READY EVENT ===
client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      await channel.send("✅ Test : le bot peut poster !");
      console.log("Message test envoyé !");
    } else {
      console.log("❌ Salon introuvable !");
    }
  } catch (err) {
    console.log("❌ Impossible d'envoyer le message test :", err);
  }
});

// === LANCEMENT DU BOT ===
client.login(TOKEN);

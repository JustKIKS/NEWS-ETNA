import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

// === CONFIGURATION ===
const TOKEN = process.env.DISCORD_TOKEN; // Token du bot Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const PHANTOM_FILE = "phantom_output.json"; // fichier JSON de Phantom

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === FONCTION POUR POSTER LES POSTS ===
function postPhantomData() {
  if (!fs.existsSync(PHANTOM_FILE)) {
    console.log("❌ JSON introuvable :", PHANTOM_FILE);
    return;
  }

  const posts = JSON.parse(fs.readFileSync(PHANTOM_FILE, "utf-8"));

  posts.forEach(async (post) => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return console.log("❌ Salon introuvable !");

      const embed = new EmbedBuilder()
        .setTitle(post.postContent || post.type || "Nouveau post LinkedIn")
        .setURL(post.postUrl || "")
        .setDescription(post.likeCount || "")
        .setColor(0x0072ce)
        .setTimestamp(new Date(post.postTimestamp || Date.now()))
        .addFields(
          { name: "Auteur", value: post.author || "Anonyme", inline: true },
          { name: "Type", value: post.type || "—", inline: true }
        );

      await channel.send({ embeds: [embed] });
      console.log("✅ Post envoyé :", post.postContent);
    } catch (err) {
      console.log("❌ Erreur en postant :", err);
    }
  });
}

// === READY EVENT ===
client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);
  postPhantomData(); // poste une première fois au démarrage

  // Poste toutes les 10 minutes
  setInterval(postPhantomData, 10 * 60 * 1000);
});

// === LANCEMENT DU BOT ===
client.login(TOKEN);

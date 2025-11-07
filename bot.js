import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

// === CONFIGURATION ===
const TOKEN = process.env.DISCORD_TOKEN; // Token du bot Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const JSON_FILE = "output.json"; // Ton Phantom output

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === FONCTION POUR LIRE LE JSON ET POSTER ===
async function fetchAndPost() {
  try {
    if (!fs.existsSync(JSON_FILE)) {
      console.log(`❌ JSON introuvable : ${JSON_FILE}`);
      return;
    }

    const rawData = fs.readFileSync(JSON_FILE, "utf-8");
    const posts = JSON.parse(rawData);

    if (!posts || posts.length === 0) {
      console.log("❌ Aucun post trouvé dans le JSON");
      return;
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.log("❌ Salon Discord introuvable !");
      return;
    }

    // On parcourt chaque post
    for (const post of posts) {
      const embed = new EmbedBuilder()
        .setTitle(post.postContent || "📢 Nouveau post LinkedIn")
        .setURL(post.postUrl || "")
        .setDescription(post.likeCount || "") // ici tu peux ajouter post.text ou autre champ
        .addFields(
          { name: "Type", value: post.type || "N/A", inline: true },
          { name: "Auteur", value: post.author || "Anonyme", inline: true }
        )
        .setColor(0x0072ce)
        .setTimestamp(post.timestamp ? new Date(post.timestamp) : new Date());

      await channel.send({ embeds: [embed] });
      console.log(`✅ Post envoyé : ${post.postContent?.slice(0, 50)}...`);
    }
  } catch (err) {
    console.error("❌ Erreur lors du fetch/post :", err);
  }
}

// === READY EVENT ===
client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);

  // Premier run immédiat
  await fetchAndPost();

  // Répétition toutes les 10 minutes
  setInterval(fetchAndPost, 10 * 60 * 1000);
});

// === LOGIN DU BOT ===
client.login(TOKEN);

import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import fs from "fs";

// === CONFIGURATION VIA VARIABLES D'ENVIRONNEMENT ===
const TOKEN = process.env.DISCORD_TOKEN; // Token du bot Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const LINKEDIN_RSS_URL = process.env.LINKEDIN_RSS_URL; // URL JSON ou RSS
const LAST_POST_FILE = "last_post.txt";

// === FONCTION PRINCIPALE POUR RÉCUPÉRER LES POSTS ET LES POSTER ===
async function fetchAndPost() {
  try {
    if (!LINKEDIN_RSS_URL)
      return console.log("🔹 Aucun flux LinkedIn configuré.");

    const res = await fetch(LINKEDIN_RSS_URL);
    const data = await res.json();

    if (!data.items || data.items.length === 0)
      return console.log("🔹 Aucun nouveau post trouvé.");

    const latest = data.items[0];
    const lastSent = fs.existsSync(LAST_POST_FILE)
      ? fs.readFileSync(LAST_POST_FILE, "utf-8")
      : "";

    if (latest.guid === lastSent)
      return console.log("🔹 Post déjà envoyé, pas de doublon.");

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel)
      return console.log("❌ Salon introuvable ! Vérifie l'ID du salon.");

    // Embed Discord stylé
    const embed = new EmbedBuilder()
      .setTitle(latest.title || "Nouveau post")
      .setURL(latest.link || "")
      .setDescription(latest.contentSnippet || "Pas de description disponible")
      .setColor(0x0072ce)
      .setTimestamp(new Date(latest.pubDate || Date.now()))
      .setFooter({ text: "NEWS ETNA Bot" });

    await channel.send({ embeds: [embed] });
    fs.writeFileSync(LAST_POST_FILE, latest.guid);

    console.log("✅ Post envoyé !");
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du post :", err);
  }
}

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

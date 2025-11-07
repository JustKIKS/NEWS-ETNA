import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

// === CONFIGURATION VIA VARIABLES D'ENVIRONNEMENT ===
const TOKEN = process.env.DISCORD_TOKEN; // Token du bot Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const PHANTOM_JSON_FILE = "./phantom_output.json"; // Fichier Phantom téléchargé
const LAST_POST_FILE = "last_post.txt";

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === FONCTION POUR RÉCUPÉRER LE DERNIER POST ===
async function fetchAndPost() {
  try {
    if (!fs.existsSync(PHANTOM_JSON_FILE)) {
      console.log("❌ Phantom output introuvable :", PHANTOM_JSON_FILE);
      return;
    }

    const data = JSON.parse(fs.readFileSync(PHANTOM_JSON_FILE, "utf-8"));
    if (!data || data.length === 0) return;

    const latest = data[0]; // prend le premier post
    const lastSent = fs.existsSync(LAST_POST_FILE)
      ? fs.readFileSync(LAST_POST_FILE, "utf-8")
      : "";

    if (latest.postUrl === lastSent) return; // pas de doublon

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.log("❌ Salon introuvable !");

    // Concatène plusieurs champs pour récupérer tout le texte du post
    const content = [
      latest.postContent || "",
      latest.type || "",
      latest.likeCount || "",
      latest.commentCount || "",
      latest.repostCount || "",
      latest.author || "ETNA",
    ]
      .filter(Boolean)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("📢 Nouveau post LinkedIn")
      .setURL(latest.postUrl)
      .setDescription(content)
      .setColor(0x0072ce);

    if (latest.imgUrl) embed.setImage(latest.imgUrl);

    await channel.send({ embeds: [embed] });

    // Sauvegarde le post pour ne pas le renvoyer
    fs.writeFileSync(LAST_POST_FILE, latest.postUrl);

    console.log("✅ Post envoyé !");
  } catch (err) {
    console.error("❌ Erreur fetchAndPost :", err);
  }
}

// === READY EVENT ===
client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);

  // Premier envoi immédiat
  fetchAndPost();

  // Vérifie toutes les 10 minutes
  setInterval(fetchAndPost, 10 * 60 * 1000);
});

// === LANCEMENT DU BOT ===
client.login(TOKEN);

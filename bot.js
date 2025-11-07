import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

// === CONFIGURATION ===
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PHANTOM_OUTPUT = "./phantom_output.json"; // chemin vers ton output.json
const LAST_POST_FILE = "last_post.txt";

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === FONCTION PRINCIPALE ===
async function fetchAndPost() {
  try {
    if (!fs.existsSync(PHANTOM_OUTPUT)) {
      console.log("❌ JSON Phantom introuvable :", PHANTOM_OUTPUT);
      return;
    }

    const rawData = fs.readFileSync(PHANTOM_OUTPUT, "utf-8");
    const posts = JSON.parse(rawData);

    if (!posts || posts.length === 0) return;

    // On prend le dernier post
    const latest = posts[0];

    // Vérification doublon
    const lastSent = fs.existsSync(LAST_POST_FILE)
      ? fs.readFileSync(LAST_POST_FILE, "utf-8")
      : "";
    if (latest.postUrl === lastSent) return;

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.log("❌ Salon introuvable !");

    // Création de l'embed
    const embed = new EmbedBuilder()
      .setTitle(latest.postContent || "📢 Nouveau post LinkedIn")
      .setURL(latest.postUrl)
      .setDescription(latest.postContent || "")
      .setColor(0x0072ce)
      .setFooter({
        text: `${latest.type || "Document"} • ${latest.author || "Anonyme"}`,
      });

    if (latest.imgUrl) embed.setImage(latest.imgUrl);

    await channel.send({ embeds: [embed] });
    fs.writeFileSync(LAST_POST_FILE, latest.postUrl);

    console.log("✅ Post envoyé !");
  } catch (err) {
    console.error(err);
  }
}

// === READY EVENT ===
client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);
  fetchAndPost(); // premier run
  setInterval(fetchAndPost, 10 * 60 * 1000); // toutes les 10 minutes
});

// === LANCEMENT DU BOT ===
client.login(TOKEN);

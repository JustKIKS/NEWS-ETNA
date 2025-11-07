import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

// === CONFIGURATION ===
const TOKEN = process.env.DISCORD_TOKEN; // Ton token Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const CSV_FILE = path.join(process.cwd(), "phantom_output.csv"); // Le CSV téléchargé depuis Phantombuster
const LAST_POST_FILE = "last_post.txt";

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === FONCTION POUR CONVERTIR LE CSV EN JSON ===
function csvToJson(csvPath) {
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const lines = csvData
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);
  const header = lines[0].split(",").map((h) => h.trim());
  const dataLines = lines.slice(1);

  const items = dataLines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
  return items;
}

// === FONCTION POUR POSTER LES POSTS DANS DISCORD ===
async function fetchAndPost() {
  try {
    if (!fs.existsSync(CSV_FILE)) {
      console.log("❌ CSV introuvable :", CSV_FILE);
      return;
    }

    const data = csvToJson(CSV_FILE);
    if (!data || data.length === 0) return console.log("Aucun post trouvé.");

    const latest = data[0]; // On prend le dernier post
    const lastSent = fs.existsSync(LAST_POST_FILE)
      ? fs.readFileSync(LAST_POST_FILE, "utf-8")
      : "";

    if (latest.posturl === lastSent) {
      console.log("Post déjà envoyé, pas de doublon.");
      return;
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.log("❌ Salon introuvable !");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("📢 Nouveau post LinkedIn")
      .setURL(latest.posturl)
      .setDescription(latest.postContent)
      .setColor(0x0072ce)
      .setFooter({ text: `${latest.type} • ${latest.account}` });

    if (latest.imgurl) embed.setImage(latest.imgurl);

    await channel.send({ embeds: [embed] });
    fs.writeFileSync(LAST_POST_FILE, latest.posturl);

    console.log("✅ Post envoyé !");
  } catch (err) {
    console.error("Erreur fetchAndPost:", err);
  }
}

// === READY EVENT ===
client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);

  // Premier run
  await fetchAndPost();

  // Vérifie toutes les 10 minutes
  setInterval(fetchAndPost, 10 * 60 * 1000);
});

// === LANCEMENT DU BOT ===
client.login(TOKEN);

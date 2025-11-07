import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

// === CONFIGURATION VIA VARIABLES D'ENVIRONNEMENT ===
const TOKEN = process.env.DISCORD_TOKEN; // Token du bot Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon Discord
const CSV_FILE = "phantom_output.csv"; // Chemin vers le CSV exporté depuis Phantom
const LAST_POST_FILE = "last_post.txt"; // Fichier pour ne pas republier le même post

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === FONCTION POUR LIRE LE CSV ET LE TRANSFORMER EN JSON SIMPLE ===
function readCSV() {
  if (!fs.existsSync(CSV_FILE)) {
    console.log(`❌ CSV introuvable : ${CSV_FILE}`);
    return [];
  }

  const csv = fs.readFileSync(CSV_FILE, "utf-8");
  const lines = csv.split("\n").filter(Boolean);
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach(
      (h, i) => (obj[h.trim()] = values[i] ? values[i].trim() : "")
    );
    return obj;
  });
}

// === FONCTION PRINCIPALE POUR POSTER LES POSTS SUR DISCORD ===
async function fetchAndPost() {
  const posts = readCSV();
  if (!posts.length) return;

  const lastSent = fs.existsSync(LAST_POST_FILE)
    ? fs.readFileSync(LAST_POST_FILE, "utf-8")
    : "";

  for (const latest of posts) {
    if (latest.postUrl === lastSent) break; // Evite les doublons

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.log("❌ Salon introuvable !");
      return;
    }

    // Concatène tous les champs texte utiles pour avoir tout le contenu
    const content = Object.keys(latest)
      .filter(
        (k) => !["postUrl", "imgUrl", "timestamp", "postTimestamp"].includes(k)
      )
      .map((k) => latest[k])
      .filter(Boolean)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("📢 Nouveau post LinkedIn")
      .setURL(latest.postUrl)
      .setDescription(content)
      .setColor(0x0072ce)
      .setTimestamp(new Date());

    await channel.send({ embeds: [embed] });
    console.log("✅ Post envoyé :", latest.postUrl);

    // Met à jour le dernier post envoyé
    fs.writeFileSync(LAST_POST_FILE, latest.postUrl);
  }
}

// === READY EVENT ===
client.once("ready", async () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);

  // Premier run immédiat
  await fetchAndPost();

  // Vérifie toutes les 10 minutes
  setInterval(fetchAndPost, 10 * 60 * 1000);
});

// === LANCEMENT DU BOT ===
client.login(TOKEN);

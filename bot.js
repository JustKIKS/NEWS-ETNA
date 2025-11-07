import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

// === CONFIGURATION ===
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PHANTOM_FILE = "phantom_output.json";

// === INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// === FONCTION POUR ASSEMBLER ET POSTER LES POSTS ===
function postPhantomData() {
  if (!fs.existsSync(PHANTOM_FILE)) {
    console.log("❌ JSON introuvable :", PHANTOM_FILE);
    return;
  }

  const data = JSON.parse(fs.readFileSync(PHANTOM_FILE, "utf-8"));

  // On crée un tableau pour récupérer chaque ligne utile
  const textParts = [];

  data.forEach((post) => {
    if (post.postContent) textParts.push(post.postContent.trim());
    if (post.type) textParts.push(post.type.trim());
    if (post.likeCount) textParts.push(post.likeCount.trim());
    if (post.imgUrl) textParts.push(post.imgUrl.trim());
  });

  // On assemble le texte avec des sauts de ligne
  const fullText = textParts.join("\n");

  if (!fullText) {
    console.log("❌ Aucun texte à poster !");
    return;
  }

  client.channels
    .fetch(CHANNEL_ID)
    .then((channel) => {
      if (!channel) return console.log("❌ Salon introuvable !");

      const embed = new EmbedBuilder()
        .setTitle("📢 Nouveau post LinkedIn")
        .setDescription(fullText)
        .setColor(0x0072ce)
        .setTimestamp(new Date());

      // Si une image existe dans le JSON, on la met
      const firstImage = data.find((p) => p.imgUrl && p.imgUrl.trim() !== "");
      if (firstImage) embed.setImage(firstImage.imgUrl);

      channel.send({ embeds: [embed] });
      console.log("✅ Post complet envoyé !");
    })
    .catch((err) => {
      console.log("❌ Erreur en postant :", err);
    });
}

// === READY EVENT ===
client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);
  postPhantomData(); // envoie au démarrage

  // toutes les 10 minutes
  setInterval(postPhantomData, 10 * 60 * 1000);
});

// === LANCEMENT DU BOT ===
client.login(TOKEN);

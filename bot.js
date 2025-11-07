import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PHANTOM_FILE = "phantom_output.json";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

function postPhantomData() {
  if (!fs.existsSync(PHANTOM_FILE)) {
    console.log("❌ JSON introuvable :", PHANTOM_FILE);
    return;
  }

  const data = JSON.parse(fs.readFileSync(PHANTOM_FILE, "utf-8"));

  const lines = [];

  data.forEach((post) => {
    // On prend tous les champs qui contiennent du texte utile
    [
      "postContent",
      "type",
      "likeCount",
      "commentCount",
      "repostCount",
      "imgUrl",
    ].forEach((key) => {
      if (
        post[key] &&
        post[key].trim() !== "" &&
        !/^https?:\/\/.+\..+/.test(post[key].trim())
      ) {
        lines.push(post[key].trim());
      }
    });
  });

  const fullText = lines.join("\n");

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

      // Cherche la première vraie image URL
      const firstImage = data.find(
        (p) => p.imgUrl && /^https?:\/\/.+\..+/.test(p.imgUrl.trim())
      );
      if (firstImage) embed.setImage(firstImage.imgUrl.trim());

      channel
        .send({ embeds: [embed] })
        .then(() => {
          console.log("✅ Post complet envoyé !");
        })
        .catch((err) => {
          console.log("❌ Erreur en postant :", err);
        });
    })
    .catch((err) => {
      console.log("❌ Erreur en récupérant le salon :", err);
    });
}

client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);
  postPhantomData();
  setInterval(postPhantomData, 10 * 60 * 1000);
});

client.login(TOKEN);

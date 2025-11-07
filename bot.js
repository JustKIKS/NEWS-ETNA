import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PHANTOM_FILE = "phantom_output.json";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

function buildPostText(data) {
  let lines = [];

  data.forEach((post) => {
    // On prend uniquement les champs contenant du texte réel
    ["postContent", "type"].forEach((key) => {
      if (post[key] && post[key].trim() !== "") {
        lines.push(post[key].trim());
      }
    });
  });

  return lines.join("\n");
}

function getFirstImage(data) {
  for (let post of data) {
    if (post.imgUrl && /^https?:\/\/.+\..+/.test(post.imgUrl.trim())) {
      return post.imgUrl.trim();
    }
  }
  return null;
}

function postPhantomData() {
  if (!fs.existsSync(PHANTOM_FILE)) {
    console.log("❌ JSON introuvable :", PHANTOM_FILE);
    return;
  }

  const data = JSON.parse(fs.readFileSync(PHANTOM_FILE, "utf-8"));
  const fullText = buildPostText(data);

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

      const firstImage = getFirstImage(data);
      if (firstImage) embed.setImage(firstImage);

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

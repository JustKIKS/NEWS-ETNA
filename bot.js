import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PHANTOM_FILE = "phantom_output.json";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

function extractText(data) {
  let lines = [];

  data.forEach((obj) => {
    const fields = ["postContent", "type"];
    fields.forEach((field) => {
      if (obj[field] && obj[field].trim().length > 3) {
        lines.push(obj[field].trim());
      }
    });
  });

  return lines.join("\n");
}

function extractImage(data) {
  for (let obj of data) {
    if (obj.imgUrl && obj.imgUrl.startsWith("http")) return obj.imgUrl;
  }
  return null;
}

function postLinkedIn() {
  if (!fs.existsSync(PHANTOM_FILE)) {
    console.log("❌ JSON introuvable :", PHANTOM_FILE);
    return;
  }

  const data = JSON.parse(fs.readFileSync(PHANTOM_FILE, "utf8"));
  const postText = extractText(data);
  const image = extractImage(data);

  if (!postText) return console.log("❌ Aucun texte à poster.");

  client.channels
    .fetch(CHANNEL_ID)
    .then((channel) => {
      const embed = new EmbedBuilder()
        .setTitle("📢 Nouveau post LinkedIn")
        .setDescription(postText)
        .setColor(0x0072ce)
        .setTimestamp(new Date());

      if (image) embed.setImage(image);

      channel
        .send({ embeds: [embed] })
        .then(() => console.log("✅ Post LinkedIn envoyé !"))
        .catch((err) => console.log("❌ Erreur en postant :", err));
    })
    .catch((err) => console.log("❌ Impossible de récupérer le salon :", err));
}

client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  postLinkedIn();
  setInterval(postLinkedIn, 10 * 60 * 1000);
});

client.login(TOKEN);

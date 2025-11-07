//ss
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fs from "fs";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PHANTOM_OUTPUT = "./phantom_output.json";
const LAST_POST_FILE = "last_post.txt";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

async function fetchAndPost() {
  try {
    if (!fs.existsSync(PHANTOM_OUTPUT)) {
      console.log("❌ JSON Phantom introuvable :", PHANTOM_OUTPUT);
      return;
    }

    const rawData = fs.readFileSync(PHANTOM_OUTPUT, "utf-8");
    const posts = JSON.parse(rawData);

    if (!posts || posts.length === 0) return;

    const latest = posts[0];

    const lastSent = fs.existsSync(LAST_POST_FILE)
      ? fs.readFileSync(LAST_POST_FILE, "utf-8")
      : "";
    if (latest.postUrl === lastSent) return;

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.log("❌ Salon introuvable !");

    // Construire le contenu lisible
    const content = [
      latest.postContent || "",
      latest.type || "",
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
    fs.writeFileSync(LAST_POST_FILE, latest.postUrl);

    console.log("✅ Post envoyé !");
  } catch (err) {
    console.error(err);
  }
}

client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);
  fetchAndPost();
  setInterval(fetchAndPost, 10 * 60 * 1000);
});

client.login(TOKEN);

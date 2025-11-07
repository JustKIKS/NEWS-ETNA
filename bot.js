import fs from "fs";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const LAST_POST_FILE = "last_post.txt";
const JSON_FILE = "phantom_output.json"; // <- ici ton JSON

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

async function fetchAndPost() {
  try {
    if (!fs.existsSync(JSON_FILE)) {
      console.log("❌ JSON introuvable :", JSON_FILE);
      return;
    }

    const data = JSON.parse(fs.readFileSync(JSON_FILE, "utf-8"));
    if (!data || data.length === 0) return console.log("Aucun post trouvé.");

    const latest = data[0]; // dernier post
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

client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag} !`);
  fetchAndPost();
  setInterval(fetchAndPost, 10 * 60 * 1000);
});

client.login(TOKEN);

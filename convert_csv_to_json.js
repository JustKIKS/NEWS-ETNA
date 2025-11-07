import fs from "fs";
import path from "path";

const csvFile = path.join(process.cwd(), "phantom_output.csv");
const csvData = fs.readFileSync(csvFile, "utf-8");

// Sépare les lignes
const lines = csvData
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l);
const header = lines[0].split(",").map((h) => h.trim()); // récupère les colonnes
const dataLines = lines.slice(1);

const items = dataLines.map((line) => {
  const values = line.split(",").map((v) => v.trim());
  const obj = {};
  header.forEach((h, i) => {
    obj[h] = values[i] || "";
  });
  return obj;
});

// Sauvegarde en JSON
fs.writeFileSync(
  "phantom_output.json",
  JSON.stringify(items, null, 2),
  "utf-8"
);
console.log("✅ phantom_output.json créé avec", items.length, "items");

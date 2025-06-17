const fs = require("fs");
const path = require("path");

const baseUrl = "https://nasr-realestate.github.io/samsar-talabak";
const dataFolder = path.join(__dirname, "../data/properties");
const outputFile = path.join(__dirname, "../sitemap.xml");

let urls = [`<url><loc>${baseUrl}/</loc></url>`];

fs.readdirSync(dataFolder).forEach((file) => {
  if (file.endsWith(".json")) {
    const id = file.replace(".json", "");
    urls.push(`<url><loc>${baseUrl}/property/${id}.html</loc></url>`);
  }
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

fs.writeFileSync(outputFile, sitemap, "utf8");

console.log("✅ Sitemap generated successfully!");

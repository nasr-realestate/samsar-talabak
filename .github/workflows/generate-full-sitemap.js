const fs = require("fs");
const path = require("path");

const baseUrl = "https://nasr-realestate.github.io/samsar-talabak";
const rootDir = path.join(__dirname, "..");
const outputFile = path.join(rootDir, "sitemap.xml");

let urls = [];

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);

    if (stat.isDirectory()) {
      walk(filepath);
    } else if (stat.isFile() && file.endsWith(".html")) {
      let relativePath = path.relative(rootDir, filepath).replace(/\\/g, "/");
      if (relativePath === "index.html") {
        urls.push(`<url><loc>${baseUrl}/</loc></url>`);
      } else {
        urls.push(`<url><loc>${baseUrl}/${relativePath}</loc></url>`);
      }
    }
  });
}

walk(rootDir);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
urls.join("\n") +
`\n</urlset>`;

fs.writeFileSync(outputFile, sitemap, "utf8");

console.log("✅ Sitemap تم توليده وفيه " + urls.length + " صفحة.");

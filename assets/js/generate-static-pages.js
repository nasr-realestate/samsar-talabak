// node generate-static-pages.js
const fs = require("fs");
const path = require("path");

const categories = ["apartments", "apartments-rent", "shops", "offices", "admin-hq"];

const template = (title, description, price, area, filename) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="https://nasr-realestate.github.io/samsar-talabak/images/${filename}.jpg" />
  <meta property="og:url" content="https://nasr-realestate.github.io/samsar-talabak/_generated/${filename}.html" />
  <meta property="og:type" content="website" />
</head>
<body>
  <main style="font-family: Tajawal, sans-serif; max-width: 700px; margin: auto; padding: 2rem;">
    <h1>${title}</h1>
    <p><strong>السعر:</strong> ${price}</p>
    <p><strong>المساحة:</strong> ${area}</p>
    <p><strong>الوصف:</strong> ${description}</p>
    <a href="https://wa.me/201147758857?text=أريد الاستفسار عن ${encodeURIComponent(title)}">استفسر عبر واتساب</a>
  </main>
</body>
</html>
`;

categories.forEach((category) => {
  const dir = `./data/properties/${category}`;
  const outputDir = "./_generated";

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const indexPath = path.join(dir, "index.json");
  if (!fs.existsSync(indexPath)) return;

  const filenames = JSON.parse(fs.readFileSync(indexPath));

  filenames.forEach((file) => {
    const fullPath = path.join(dir, file);
    const prop = JSON.parse(fs.readFileSync(fullPath));
    const name = file.replace(".json", "");

    const html = template(prop.title, prop.description, prop.price || prop.price_monthly || "غير محدد", prop.area || "غير محددة", name);

    fs.writeFileSync(`${outputDir}/${name}.html`, html, "utf8");
    console.log(`✅ Created: ${name}.html`);
  });
});

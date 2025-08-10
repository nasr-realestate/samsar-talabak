// netlify/functions/property-page.js

import fs from "fs";
import path from "path";

// دالة لتحميل بيانات العقار من ملف JSON
function loadPropertyData(slug) {
  const dataPath = path.join(process.cwd(), "data/properties", `${slug}.json`);
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
  }
  return null;
}

export async function handler(event) {
  const slug = event.path.replace("/property/", "").replace(/\/$/, "");
  const property = loadPropertyData(slug);

  if (!property) {
    return {
      statusCode: 404,
      body: "Property not found",
    };
  }

  // رابط الصورة الديناميكية
  const ogImageUrl = `${process.env.URL}/.netlify/functions/og-image?title=${encodeURIComponent(
    property.title
  )}&price=${encodeURIComponent(property.price_clean)}&area=${encodeURIComponent(
    property.area_clean
  )}`;

  // HTML فيه الوسوم الجاهزة
  const html = `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${property.title}</title>
      <meta name="description" content="${property.summary}">
      <meta property="og:title" content="${property.title}">
      <meta property="og:description" content="${property.summary}">
      <meta property="og:image" content="${ogImageUrl}">
      <meta property="og:type" content="article">
    </head>
    <body>
      <div id="app"></div>
      <script src="/details-loader.js"></script>
    </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html,
  };
}

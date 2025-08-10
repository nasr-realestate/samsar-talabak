import fs from "fs";
import path from "path";

// 🗂 Cache داخلي لحفظ بيانات العقارات في الذاكرة
let propertyCache = {};

// 🔍 البحث عن ملف العقار في كل التصنيفات
function findPropertyFile(slug) {
  const baseDir = path.join(process.cwd(), "data/properties");

  // قراءة مجلدات التصنيفات (apartments, villas, lands...)
  const categories = fs.readdirSync(baseDir);

  for (const category of categories) {
    const filePath = path.join(baseDir, category, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

// 📂 تحميل بيانات العقار مع دعم الكاش
function loadPropertyData(slug) {
  // إذا موجود في الكاش نرجعه فورًا
  if (propertyCache[slug]) {
    return propertyCache[slug];
  }

  // البحث عن الملف
  const filePath = findPropertyFile(slug);
  if (!filePath) return null;

  // قراءة الملف وتخزينه في الكاش
  const property = JSON.parse(fs.readFileSync(filePath, "utf8"));
  propertyCache[slug] = property;
  return property;
}

export async function handler(event) {
  // استخراج الـ slug من الرابط
  const slug = event.path.replace("/property/", "").replace(/\/$/, "");

  // تحميل بيانات العقار
  const property = loadPropertyData(slug);

  // رابط الموقع
  const siteUrl = process.env.URL || "https://aqarnasr.netlify.app";

  // لو الملف موجود → عرض OG tags
  if (property) {
    const ogImageUrl = `${siteUrl}/.netlify/functions/og-image?title=${encodeURIComponent(
      property.title
    )}&price=${encodeURIComponent(property.price_clean)}&area=${encodeURIComponent(
      property.area_clean
    )}`;

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

  // لو الملف غير موجود → Fallback
  const fallbackHtml = `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>عقار غير موجود</title>
      <meta name="description" content="العقار المطلوب غير موجود. تصفح المزيد من عقاراتنا.">
    </head>
    <body>
      <div id="app">
        <h1>العقار المطلوب غير موجود</h1>
        <p>يمكنك تصفح المزيد من العقارات من <a href="/">الصفحة الرئيسية</a>.</p>
      </div>
      <script src="/details-loader.js"></script>
    </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: fallbackHtml,
  };
}

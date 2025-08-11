// netlify/functions/og-image.js
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-js");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;
const TAJAWAL_FONT = fs.readFileSync(path.resolve("./assets/fonts/Tajawal-Bold.ttf"));

async function imageToBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const buffer = await response.buffer();
  return `data:${response.headers.get('content-type')};base64,${buffer.toString('base64')}`;
}

exports.handler = async function(event) {
  try {
    const q = event.queryStringParameters || {};
    const title = (q.title || "عرض عقاري مميز").slice(0, 120);
    const price = (q.price || "السعر عند الطلب").slice(0, 40);
    const area = (q.area || "مساحة مناسبة").slice(0, 30);
    
    const logoBase64 = await imageToBase64("https://i.postimg.cc/sfh9DRb0/samsar-logo-enhanced.png");

    const design = { /* ... (كود التصميم الكامل الذي قدمته لك سابقًا) ... */ };

    const svg = await satori(design, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: "Tajawal", data: TAJAWAL_FONT, weight: 700, style: "normal" }]
    });

    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return {
      statusCode: 200,
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
      body: pngBuffer.toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    console.error("OG image error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err) })
    };
  }
};

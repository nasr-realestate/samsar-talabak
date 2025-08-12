const fs = require("fs");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;

exports.handler = async function(event) {
  try {
    // ✨✨✨ الإصلاح الحاسم هنا: استخدام Dynamic Import ✨✨✨
    const { default: satori } = await import("satori");
    const { html } = await import("satori-html");
    const { Resvg } = await import("@resvg/resvg-js");

    const TAJAWAL_FONT = fs.readFileSync(path.resolve("./assets/fonts/Tajawal-Bold.ttf"));

    const q = event.queryStringParameters || {};
    const title = (q.title || "عرض عقاري مميز").slice(0, 120);
    const price = (q.price || "السعر عند الطلب").slice(0, 40);
    const area = (q.area || "مساحة مناسبة").slice(0, 30);
    
    const markup = html`
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 48px; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #f1f1f1; font-family: 'Tajawal'; border: 1px solid #333;">
        <div style="display: flex; align-items: center; gap: 18px;">
          <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; background: #00ff88; border-radius: 50%;">
            <div style="font-size: 40px;">🏠</div>
          </div>
          <div style="font-size: 32px; font-weight: 800;">سمسار طلبك</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; text-align: center;">
          <div style="font-size: 64px; font-weight: 800; color: #00ff88; line-height: 1.25; padding: 0 60px;">${title}</div>
          <div style="display: flex; gap: 28px; margin-top: 40px;">
            <div style="background: rgba(255,255,255,0.05); padding: 18px 26px; border-radius: 14px; min-width: 250px; display: flex; flex-direction: column; align-items: center;">
              <div style="font-size: 24px; color: #ccc;">السعر</div>
              <div style="font-size: 36px; font-weight: 800; color: #fff;">${price}</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 18px 26px; border-radius: 14px; min-width: 250px; display: flex; flex-direction: column; align-items: center;">
              <div style="font-size: 24px; color: #ccc;">المساحة</div>
              <div style="font-size: 36px; font-weight: 800; color: #fff;">${area}</div>
            </div>
          </div>
        </div>
        <div style="text-align: left; font-size: 24px; font-weight: 700; color: #94a3b8; opacity: 0.8;">
          aqarnasr.netlify.app
        </div>
      </div>
    `;

    const svg = await satori(markup, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: "Tajawal", data: TAJAWAL_FONT, weight: 700, style: "normal" }]
    });

    const resvg = new Resvg(svg);
    const pngBuffer = resvg.render().asPng();

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

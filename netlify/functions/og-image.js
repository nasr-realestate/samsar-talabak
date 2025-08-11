// ✨✨✨ تم تعديل طريقة الاستيراد في السطر الأول ليصبح متوافقًا ✨✨✨
const satori = require("satori").default;
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;
const TAJAWAL_FONT = fs.readFileSync(path.resolve("./assets/fonts/Tajawal-Bold.ttf"));

exports.handler = async function(event) {
  try {
    const q = event.queryStringParameters || {};
    const title = (q.title || "عرض عقاري مميز").slice(0, 120);
    const price = (q.price || "السعر عند الطلب").slice(0, 40);
    const area = (q.area || "مساحة مناسبة").slice(0, 30);
    
    const design = {
      type: "div",
      props: {
        style: {
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "48px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          color: "#f1f1f1", fontFamily: "Tajawal", border: "1px solid #333",
        },
        children: [
          // Header
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "18px" },
              children: [
                {
                  type: "div",
                  props: {
                    style: { width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", background: "#00ff88", borderRadius: "50%" },
                    children: [
                        { type: "div", props: { style: { fontSize: "40px" }, children: "🏠" } }
                    ]
                  }
                },
                { type: "div", props: { style: { fontSize: 32, fontWeight: 800 }, children: "سمسار طلبك" } }
              ]
            }
          },
          // Main Content
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, textAlign: "center" },
              children: [
                { type: "div", props: { style: { fontSize: 64, fontWeight: 800, color: "#00ff88", lineHeight: 1.25, padding: "0 60px" }, children: title } },
                {
                  type: "div",
                  props: {
                    style: { display: "flex", gap: "28px", marginTop: 40 },
                    children: [
                      {
                        type: "div",
                        props: { style: { background: "rgba(255,255,255,0.05)", padding: "18px 26px", borderRadius: 14, minWidth: "250px" }, children: [
                          { type: "div", props: { style: { fontSize: 24, color: "#ccc" }, children: "السعر" } },
                          { type: "div", props: { style: { fontSize: 36, fontWeight: 800, color: "#fff" }, children: price } },
                        ]}
                      },
                      {
                        type: "div",
                        props: { style: { background: "rgba(255,255,255,0.05)", padding: "18px 26px", borderRadius: 14, minWidth: "250px" }, children: [
                          { type: "div", props: { style: { fontSize: 24, color: "#ccc" }, children: "المساحة" } },
                          { type: "div", props: { style: { fontSize: 36, fontWeight: 800, color: "#fff" }, children: area } },
                        ]}
                      }
                    ]
                  }
                }
              ]
            }
          },
          // Footer
          {
            type: "div",
            props: {
              style: { textAlign: "left", fontSize: 24, fontWeight: 700, color: "#94a3b8", opacity: 0.8 },
              children: `aqarnasr.netlify.app`
            }
          }
        ]
      }
    };

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

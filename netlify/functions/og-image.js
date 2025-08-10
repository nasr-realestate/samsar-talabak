// netlify/functions/og-image.js
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-js");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters.id;
    if (!id) {
      return { statusCode: 400, body: "Missing ID" };
    }

    // جلب بيانات العقار
    const propertiesDir = path.join(__dirname, "../../data/properties");
    let property = null;
    for (const category of fs.readdirSync(propertiesDir)) {
      const filePath = path.join(propertiesDir, category, `${id}.json`);
      if (fs.existsSync(filePath)) {
        property = JSON.parse(fs.readFileSync(filePath, "utf8"));
        break;
      }
    }
    if (!property) {
      return { statusCode: 404, body: "Property not found" };
    }

    const fontData = await fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo-Regular.ttf")
      .then((res) => res.arrayBuffer());

    const svg = await satori(
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f8f9fa",
            width: "1200px",
            height: "630px",
            padding: "40px",
            fontFamily: "Cairo",
            textAlign: "right",
            direction: "rtl",
          },
          children: [
            {
              type: "h1",
              props: { style: { fontSize: "48px", color: "#222" }, children: property.title }
            },
            {
              type: "p",
              props: { style: { fontSize: "36px", color: "#e63946" }, children: property.price_display }
            },
            {
              type: "p",
              props: { style: { fontSize: "28px", color: "#555" }, children: property.area_display }
            },
            {
              type: "p",
              props: { style: { fontSize: "24px", color: "#666" }, children: property.location }
            }
          ]
        }
      },
      { width: 1200, height: 630, fonts: [{ name: "Cairo", data: fontData, style: "normal" }] }
    );

    const png = new Resvg(svg).render().asPng();

    return {
      statusCode: 200,
      headers: { "Content-Type": "image/png" },
      body: png.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};

// netlify/functions/property-page.js
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing property ID" }) };
    }

    const propertiesDir = path.join(__dirname, "../../data/properties");

    let propertyData = null;
    const categories = fs.readdirSync(propertiesDir);

    for (const category of categories) {
      const filePath = path.join(propertiesDir, category, `${id}.json`);
      if (fs.existsSync(filePath)) {
        propertyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        break;
      }
    }

    if (!propertyData) {
      return { statusCode: 404, body: JSON.stringify({ error: "Property not found" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(propertyData)
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};

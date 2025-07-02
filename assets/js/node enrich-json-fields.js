const fs = require('fs');
const path = require('path');

const BASE_DIR = 'data'; // يمكنك تغييره إلى 'data/requests' لو شئت

const TARGET_FIELDS = {
  whatsapp: "201147758857",
  direction: "غير محدد",
  floor: "غير محدد",
  date_added: new Date().toISOString().split('T')[0]
};

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    let updated = false;
    for (const [key, value] of Object.entries(TARGET_FIELDS)) {
      if (!(key in data)) {
        data[key] = value;
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (err) {
    console.error(`❌ مشكلة في الملف: ${filePath}\n${err.message}`);
  }
}

function scanDirectory(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json') {
      processFile(fullPath);
    }
  }
}

scanDirectory(BASE_DIR);

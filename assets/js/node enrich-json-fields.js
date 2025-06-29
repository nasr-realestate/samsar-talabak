const fs = require('fs');
const path = require('path');

const BASE_DIR = 'data'; // أو 'data/requests' لو عايز تشتغل على الطلبات فقط
const TARGET_FIELDS = {
  whatsapp: "201147758857",
  direction: "غير محدد",
  floor: "غير محدد",
  date_added: new Date().toISOString().split('T')[0]
};

function enrichFile(filePath) {
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
      console.log(`✅ تم تحديث: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ خطأ في الملف ${filePath}:`, err.message);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json') {
      enrichFile(fullPath);
    }
  });
}

walkDir(BASE_DIR);

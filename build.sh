#!/bin/bash
set -e
echo "--- BUILD SCRIPT START (LUXURY EDITION) ---"

# 1. تثبيت الأدوات اللازمة لمعالجة البيانات
apt-get update -y > /dev/null && apt-get install -y jq > /dev/null

# 2. توليد فهارس الأقسام (Category Indexes)
# التعديل الهام: أضفنا 'sort' لضمان ترتيب الملفات أبجدياً، مما يضمن استقرار العرض
echo "Generating category indexes..."
find data/properties data/requests -mindepth 1 -type d | while read dir; do
  INDEX_FILE="$dir/index.json"
  # البحث عن الملفات -> ترتيبها -> دمجها بفاصلة
  FILES_FOUND=$(find "$dir" -maxdepth 1 -type f -name '*.json' ! -name 'index.json' -printf '"%f"\n' | sort | paste -sd, -)
  
  if [ -n "$FILES_FOUND" ]; then 
    echo "[$FILES_FOUND]" > "$INDEX_FILE"
  else 
    echo "[]" > "$INDEX_FILE"
  fi
done

# 3. توليد الفهرس الرئيسي الشامل (Master Indexes)
# هذا الجزء ممتاز ومسؤول عن تشغيل صفحات التفاصيل بدقة
echo "Generating master indexes..."

# فهرس العقارات
find data/properties -type f -name '*.json' ! -path '*/index.json' -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' | jq -s '.' > data/properties_index.json

# فهرس الطلبات
find data/requests -type f -name '*.json' ! -path '*/index.json' -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' | jq -s '.' > data/requests_index.json

# 4. بناء الموقع
echo "Running Jekyll build..."
bundle exec jekyll build

echo "--- BUILD SCRIPT END ---"

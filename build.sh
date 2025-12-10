#!/bin/bash
set -e

echo "--- 🛠️ BUILD STARTED (CUSTOM SITEMAP EDITION) ---"

# 1. توليد فهارس الأقسام (قوائم أسماء فقط)
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    # نستخدم jq لإنشاء مصفوفة JSON سليمة من أسماء الملفات
    find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | jq -R . | jq -s . > "$dir/index.json"
done

# 2. توليد الفهرس الرئيسي (لصفحات التفاصيل)
echo "--> Generating Master Indexes..."

find data/properties -name "*.json" ! -name "index.json" -print0 | \
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    id="${filename%.*}"
    parent=$(dirname "$file")
    cat=$(basename "$parent")
    jq -n --arg id "$id" --arg path "/$file" --arg cat "$cat" '{id:$id, path:$path, category:$cat}'
done | jq -s '.' > data/properties_index.json

find data/requests -name "*.json" ! -name "index.json" -print0 | \
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    id="${filename%.*}"
    parent=$(dirname "$file")
    cat=$(basename "$parent")
    jq -n --arg id "$id" --arg path "/$file" --arg cat "$cat" '{id:$id, path:$path, category:$cat}'
done | jq -s '.' > data/requests_index.json

# 3. تشغيل صانع الخريطة المخصص (الخطوة الجديدة الهامة)
echo "--> Generating Custom Sitemap XML..."
# تأكد أنك أنشأت ملف generate_sitemap.py في الجذر قبل تشغيل هذا الأمر
python3 generate_sitemap.py

# 4. بناء الموقع
echo "--> Jekyll Build..."
bundle exec jekyll build

echo "--- ✅ DONE ---"

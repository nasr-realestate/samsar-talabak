#!/bin/bash
set -e

echo "--- 🛠️ BUILD STARTED (SIMPLE & ROBUST) ---"

# 1. توليد فهارس الأقسام (قوائم أسماء فقط)
# هذا الكود يضمن وجود index.json في كل مجلد مهما حدث
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    # نستخدم jq لإنشاء مصفوفة JSON سليمة من أسماء الملفات
    # الترتيب هنا أبجدي، ولا يهمنا، لأن الجافاسكربت سيرتب بالتواريخ لاحقاً
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

# 3. بناء الموقع
echo "--> Jekyll Build..."
bundle exec jekyll build

echo "--- ✅ DONE ---"

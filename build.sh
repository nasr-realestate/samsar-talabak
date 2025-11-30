#!/bin/bash
set -e

echo "--- BUILDING INDEXES (SAFE MODE) ---"

# 1. توليد فهارس الأقسام (بدون تثبيت برامج)
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    # نستخدم jq الموجود مسبقاً في Netlify
    # هذا الأمر يجمع أسماء الملفات في مصفوفة JSON سليمة
    find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | sort | jq -R . | jq -s . > "$dir/index.json"
done

# 2. توليد الفهرس الرئيسي (لصفحات التفاصيل)
echo "Generating Master Index..."
find data/properties -name "*.json" ! -name "index.json" -print0 | \
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    id="${filename%.*}"
    parent=$(dirname "$file")
    cat=$(basename "$parent")
    # إنشاء كائن JSON
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
echo "Jekyll Build..."
bundle exec jekyll build

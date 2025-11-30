#!/bin/bash
set -e

echo "--- 🛠️ STARTING BUILD (THE FACTORY) ---"

# 1. توليد فهارس الأقسام (Category Indexes)
# يمر على كل المجلدات وينشئ ملف index.json
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    # نستخدم jq لإنشاء مصفوفة سليمة 100%
    find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | sort | jq -R . | jq -s . > "$dir/index.json"
done

# 2. توليد الفهارس الرئيسية (Master Indexes) لصفحات التفاصيل
echo "--> Generating Master Indexes..."

# للعقارات
find data/properties -name "*.json" ! -name "index.json" -print0 | \
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    id="${filename%.*}"
    parent=$(dirname "$file")
    cat=$(basename "$parent")
    # إنشاء كائن JSON
    jq -n --arg id "$id" --arg path "/$file" --arg cat "$cat" '{id:$id, path:$path, category:$cat}'
done | jq -s '.' > data/properties_index.json

# للطلبات
find data/requests -name "*.json" ! -name "index.json" -print0 | \
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    id="${filename%.*}"
    parent=$(dirname "$file")
    cat=$(basename "$parent")
    jq -n --arg id "$id" --arg path "/$file" --arg cat "$cat" '{id:$id, path:$path, category:$cat}'
done | jq -s '.' > data/requests_index.json

# 3. بناء الموقع
echo "--> Building Jekyll..."
bundle exec jekyll build

echo "--- ✅ BUILD COMPLETE ---"

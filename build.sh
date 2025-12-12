#!/bin/bash
set -e

echo "--- 🛠️ BUILD START (SITEMAP EDITION) ---"

# 1. توليد فهارس البيانات (للموقع نفسه ليعمل)
# يمر على المجلدات وينشئ index.json بداخلها
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | jq -R . | jq -s . > "$dir/index.json"
done

# 2. توليد الفهارس الرئيسية (لصفحات التفاصيل)
echo "--> Generating JSON Indexes..."
find data/properties -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' | jq -s '.' > data/properties_index.json
find data/requests -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' | jq -s '.' > data/requests_index.json

# 3. بناء موقع Jekyll (يجب أن يتم هذا أولاً ليتم إنشاء مجلد _site)
echo "--> Building Jekyll Site..."
bundle exec jekyll build

# 4. توليد الخريطة المخصصة (الآن المجلد _site موجود، فنضع الخريطة فيه بالقوة)
echo "--> Injecting Custom Sitemap..."
python3 generate_sitemap.py

echo "--- ✅ BUILD DONE ---"

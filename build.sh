#!/bin/bash
set -e
echo "--- 🛠️ BUILD START (Correct Order) ---"

# 1. توليد خريطة الموقع المخصصة أولاً
echo "--> Generating Custom Sitemap..."
python3 generate_sitemap.py

# 2. توليد فهارس البيانات
echo "--> Generating JSON Indexes..."
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | jq -R . | jq -s . > "$dir/index.json"
done
find data/properties -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' | jq -s '.' > data/properties_index.json
find data/requests -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' | jq -s '.' > data/requests_index.json

# 3. بناء موقع Jekyll (الآن سيقوم بنسخ sitemap.xml الصحيح)
echo "--> Building Jekyll Site..."
bundle exec jekyll build

echo "--- ✅ BUILD DONE ---"

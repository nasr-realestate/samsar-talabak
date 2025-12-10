#!/bin/bash
set -e

echo "--- 🛠️ BUILD STARTED (FINAL FIX) ---"

# 1. توليد فهارس البيانات (للموقع نفسه)
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | jq -R . | jq -s . > "$dir/index.json"
done

# 2. توليد الفهارس الرئيسية
echo "--> Generating Indexes..."
find data/properties -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' | jq -s '.' > data/properties_index.json
find data/requests -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' | jq -s '.' > data/requests_index.json

# 3. بناء الموقع (Jekyll Build) - الخطوة الأولى
echo "--> Jekyll Build..."
bundle exec jekyll build

# 4. توليد الخريطة (Sitemap) - الخطوة الأخيرة والحاسمة
# نضعها هنا لتكتب داخل مجلد _site بعد أن ينتهي جيكل من عمله
echo "--> Injecting Custom Sitemap..."
python3 generate_sitemap.py

echo "--- ✅ DONE ---"

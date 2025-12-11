#!/bin/bash
set -e

echo "==============================="
echo "🔨 STARTING FINAL BUILD PROCESS"
echo "==============================="

# 1. توليد فهارس JSON
echo "--> Generating JSON Indexes..."
find data/properties data/requests -mindepth 1 -type d | while read dir; do
    find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | jq -R . | jq -s . > "$dir/index.json"
done

find data/properties -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} \
    jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' \
    | jq -s '.' > data/properties_index.json

find data/requests -name "*.json" ! -name "index.json" -print0 | xargs -0 -I {} \
    jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path), category: ($path | split("/")[-2])}' \
    | jq -s '.' > data/requests_index.json

echo "--> JSON Indexes Done."

# 2. بناء موقع Jekyll
echo "--> Building Jekyll Site..."
bundle exec jekyll build

# 3. توليد ملف sitemap.xml مخصص في الجذر
echo "--> Generating Custom Sitemap..."
python3 generate_sitemap.py

# 4. نسخ ملف sitemap إلى مجلد _site
echo "--> Copying Sitemap to _site..."
cp sitemap.xml _site/sitemap.xml

echo "==============================="
echo "✅ FINAL BUILD COMPLETE"
echo "==============================="

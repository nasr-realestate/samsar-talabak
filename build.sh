#!/bin/bash
set -e

echo "--- 🛠️ STARTING ROBUST BASH BUILD (JQ EDITION) ---"

# 1. تثبيت أداة معالجة JSON (ضروري جداً)
echo "Installing dependencies..."
apt-get update -y > /dev/null
apt-get install -y jq > /dev/null

# 2. دالة لإنشاء فهرس لأي مجلد
generate_folder_index() {
    target_dir="$1"
    # التأكد من وجود المجلد
    if [ ! -d "$target_dir" ]; then return; fi
    
    echo "Processing folder: $target_dir"
    output_file="$target_dir/index.json"

    # البحث عن ملفات json (ما عدا الاندكس) -> ترتيبها -> تحويلها لمصفوفة json سليمة
    # هذا الأمر آمن 100% ضد الأخطاء اليدوية
    find "$target_dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf "%f\n" | sort | jq -R . | jq -s . > "$output_file"
}

# 3. تشغيل الدالة على كل مجلدات العقارات والطلبات
echo "--- Generating Sub-indexes ---"
for dir in data/properties/* data/requests/*; do
    if [ -d "$dir" ]; then
        generate_folder_index "$dir"
    fi
done

# 4. توليد الفهارس الرئيسية (Master Indexes) لصفحات التفاصيل
echo "--- Generating Master Indexes ---"

# للعقارات
find data/properties -name "*.json" ! -name "index.json" -print0 | \
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    id="${filename%.*}"
    parent_dir=$(dirname "$file")
    category=$(basename "$parent_dir")
    # إنشاء كائن JSON لكل ملف
    jq -n --arg id "$id" --arg path "/$file" --arg cat "$category" \
       '{id: $id, path: $path, category: $cat}'
done | jq -s '.' > data/properties_index.json

# للطلبات
find data/requests -name "*.json" ! -name "index.json" -print0 | \
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    id="${filename%.*}"
    parent_dir=$(dirname "$file")
    category=$(basename "$parent_dir")
    
    jq -n --arg id "$id" --arg path "/$file" --arg cat "$category" \
       '{id: $id, path: $path, category: $cat}'
done | jq -s '.' > data/requests_index.json

# 5. بناء الموقع
echo "--- Building Jekyll Site ---"
bundle exec jekyll build

echo "--- ✅ BUILD COMPLETE ---"

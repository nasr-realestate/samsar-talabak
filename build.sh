#!/bin/bash

# هذا السطر مهم ليضمن توقف العملية عند حدوث أي خطأ
set -e

echo "BUILD SCRIPT: Starting comprehensive data build..."

# --- الخطوة 1: تثبيت الأدوات اللازمة ---
echo "BUILD SCRIPT: Installing jq..."
apt-get update && apt-get install -y jq

# --- الخطوة 2: توليد فهارس الفئات (من الأكشن الثانية) ---
echo "BUILD SCRIPT: Generating category-level indexes..."
for base in data/properties data/requests; do
  for dir in "$base"/*/; do
    if [ -d "$dir" ]; then
      INDEX_FILE="$dir/index.json"
      echo "  -> Generating index for $dir"
      # البحث عن ملفات JSON وإنشاء قائمة بأسماء الملفات
      find "$dir" -maxdepth 1 -type f -name '*.json' ! -name 'index.json' -printf '"%f",\n' | sed '$ s/,$//' > temp_file.txt
      echo -e "[\n$(cat temp_file.txt)\n]" > "$INDEX_FILE"
      rm temp_file.txt
    fi
  done
done
echo "BUILD SCRIPT: Category indexes are ready."

# --- الخطوة 3: توليد الفهارس الرئيسية (من الأكشن الأولى) ---
echo "BUILD SCRIPT: Generating master indexes..."

# الفهرس الرئيسي للعقارات
find data/properties -type f -name '*.json' ! -path '*/index.json' -exec \
  jq -n --arg path {} '{id: (input_filename | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' {} + | jq -s '.' > data/properties_index.json
echo "BUILD SCRIPT: Master properties index is ready."

# الفهرس الرئيسي للطلبات
find data/requests -type f -name '*.json' ! -path '*/index.json' -exec \
  jq -n --arg path {} '{id: (input_filename | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' {} + | jq -s '.' > data/requests_index.json
echo "BUILD SCRIPT: Master requests index is ready."
  
# --- الخطوة 4: بناء موقع Jekyll بعد تحضير كل البيانات ---
echo "BUILD SCRIPT: Starting Jekyll build..."
bundle exec jekyll build

echo "BUILD SCRIPT: All steps completed successfully. Site is ready to be published."

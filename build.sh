#!/bin/bash

# الخروج فورًا عند حدوث أي خطأ
set -e

# ✨ الخطوة الجديدة (والأهم): مسح ذاكرة Netlify المؤقتة قبل البدء
# هذا يضمن أن كل عملية بناء تبدأ من الصفر ببيانات جديدة تمامًا.
echo "[1/6] CLEANING: Removing old build cache..."
rm -rf .jekyll-cache
rm -rf _site
echo "✅ Cache cleaned."

echo "BUILD SCRIPT v2.1: Starting..."

# --- الخطوة 2: تثبيت الأدوات ---
echo "[2/6] Installing build tools (jq)..."
apt-get update -y && apt-get install -y jq
echo "✅ jq installed."

# --- الخطوة 3: توليد فهارس الفئات ---
echo "[3/6] Generating category indexes..."
for base in data/properties data/requests; do
  for dir in "$base"/*/; do
    if [ -d "$dir" ]; then
      INDEX_FILE="$dir/index.json"
      echo "  -> Generating index for $dir"
      find "$dir" -maxdepth 1 -type f -name '*.json' ! -name 'index.json' -printf '"%f",\n' | sed '$ s/,$//' > temp_file.txt
      echo -e "[\n$(cat temp_file.txt)\n]" > "$INDEX_FILE"
      rm temp_file.txt
    fi
  done
done
echo "✅ Category indexes are ready."

# --- الخطوة 4: التحقق وتوليد الفهارس الرئيسية ---
echo "[4/6] Generating master indexes..."

PROPERTIES_JSON_FILES=$(find data/properties -type f -name '*.json' ! -path '*/index.json')
if [ -n "$PROPERTIES_JSON_FILES" ]; then
  echo "$PROPERTIES_JSON_FILES" | xargs -I {} jq -n --arg path {} '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' {} | jq -s '.' > data/properties_index.json
  echo "✅ Master properties index generated."
else
  echo "⚠️ No property files found. Creating an empty properties index."
  echo "[]" > data/properties_index.json
fi

REQUESTS_JSON_FILES=$(find data/requests -type f -name '*.json' ! -path '*/index.json')
if [ -n "$REQUESTS_JSON_FILES" ]; then
  echo "$REQUESTS_JSON_FILES" | xargs -I {} jq -n --arg path {} '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' {} | jq -s '.' > data/requests_index.json
  echo "✅ Master requests index generated."
else
  echo "⚠️ No request files found. Creating an empty requests index."
  echo "[]" > data/requests_index.json
fi

# --- الخطوة 5: عرض محتوى الفهرس الرئيسي للتأكد ---
echo "[5/6] Verifying master properties index content..."
echo "--- Master Properties Index Content: ---"
cat data/properties_index.json
echo "----------------------------------------"

# --- الخطوة 6: بناء موقع Jekyll ---
echo "[6/6] Starting Jekyll build..."
bundle exec jekyll build
echo "🚀 Build complete. Site is ready!"

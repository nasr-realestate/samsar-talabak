#!/bin/bash

# الخروج فورًا عند حدوث أي خطأ
set -e

echo "BUILD SCRIPT v2.0: Starting..."

# --- الخطوة 1: تثبيت الأدوات ---
echo "[1/5] Installing build tools (jq)..."
apt-get update -y && apt-get install -y jq
echo "✅ jq installed."

# --- الخطوة 2: توليد فهارس الفئات (هذا الجزء يعمل لديك حاليًا) ---
echo "[2/5] Generating category indexes..."
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

# --- الخطوة 3: التحقق من وجود ملفات JSON قبل إنشاء الفهرس الرئيسي ---
echo "[3/5] Verifying that property JSON files exist..."
find data/properties -type f -name '*.json' ! -path '*/index.json' -ls
echo "--- Verification complete. ---"

# --- الخطوة 4: توليد الفهارس الرئيسية (الجزء الذي سنصلحه) ---
echo "[4/5] Generating master indexes..."

# ✨ إصلاح محتمل: تبسيط الأمر وتصحيح المسارات لـ jq
PROPERTIES_JSON_FILES=$(find data/properties -type f -name '*.json' ! -path '*/index.json')
if [ -n "$PROPERTIES_JSON_FILES" ]; then
  echo "$PROPERTIES_JSON_FILES" | xargs -I {} jq -n --arg path {} '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' {} | jq -s '.' > data/properties_index.json
  echo "✅ Master properties index generated."
  echo "--- Master Properties Index Content: ---"
  cat data/properties_index.json
  echo "----------------------------------------"
else
  echo "⚠️ No property files found to index. Creating an empty index."
  echo "[]" > data/properties_index.json
fi

REQUESTS_JSON_FILES=$(find data/requests -type f -name '*.json' ! -path '*/index.json')
if [ -n "$REQUESTS_JSON_FILES" ]; then
  echo "$REQUESTS_JSON_FILES" | xargs -I {} jq -n --arg path {} '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' {} | jq -s '.' > data/requests_index.json
  echo "✅ Master requests index generated."
else
  echo "⚠️ No request files found to index. Creating an empty index."
  echo "[]" > data/requests_index.json
fi

# --- الخطوة 5: بناء موقع Jekyll ---
echo "[5/5] Starting Jekyll build..."
bundle exec jekyll build
echo "🚀 Build complete. Site is ready!"

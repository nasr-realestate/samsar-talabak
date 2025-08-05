#!/bin/bash
set -e

echo "--- BUILD SCRIPT v2.2 (Robust) START ---"

# 1. التنظيف
echo "[1] Cleaning old cache..."
rm -rf .jekyll-cache _site
echo "  -> Done."

# 2. تثبيت الأدوات
echo "[2] Installing tools (jq)..."
apt-get update -y > /dev/null && apt-get install -y jq > /dev/null
echo "  -> Done."

# 3. توليد فهارس الفئات
echo "[3] Generating category indexes..."
find data/properties data/requests -mindepth 1 -type d | while read dir; do
  INDEX_FILE="$dir/index.json"
  echo "  -> Processing $dir..."
  # إنشاء قائمة بأسماء الملفات فقط، مع التأكد من أنها ليست فارغة
  FILES_FOUND=$(find "$dir" -maxdepth 1 -type f -name '*.json' ! -name 'index.json' -printf '"%f"\n' | paste -sd, -)
  if [ -n "$FILES_FOUND" ]; then
    echo "[$FILES_FOUND]" > "$INDEX_FILE"
    echo "    -> Created $INDEX_FILE"
  else
    echo "[]" > "$INDEX_FILE"
    echo "    -> No files found, created empty index."
  fi
done
echo "  -> Done."

# 4. توليد الفهارس الرئيسية
echo "[4] Generating master indexes..."

# الفهرس الرئيسي للعقارات
MASTER_PROPERTIES_FILE="data/properties_index.json"
echo "  -> Creating $MASTER_PROPERTIES_FILE..."
find data/properties -type f -name '*.json' ! -path '*/index.json' -print0 | \
  xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' | \
  jq -s '.' > "$MASTER_PROPERTIES_FILE"
echo "  -> Done."

# الفهرس الرئيسي للطلبات
MASTER_REQUESTS_FILE="data/requests_index.json"
echo "  -> Creating $MASTER_REQUESTS_FILE..."
find data/requests -type f -name '*.json' ! -path '*/index.json' -print0 | \
  xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' | \
  jq -s '.' > "$MASTER_REQUESTS_FILE"
echo "  -> Done."

# 5. التحقق من المحتوى (أهم خطوة)
echo "[5] Verifying master index content..."
echo "--- CONTENT OF $MASTER_PROPERTIES_FILE ---"
cat "$MASTER_PROPERTIES_FILE"
echo "----------------------------------------"
echo "--- CONTENT OF $MASTER_REQUESTS_FILE ---"
cat "$MASTER_REQUESTS_FILE"
echo "----------------------------------------"

# 6. بناء Jekyll
echo "[6] Running Jekyll build..."
bundle exec jekyll build
echo "  -> Done."

echo "--- BUILD SCRIPT END ---"

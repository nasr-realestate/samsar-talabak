#!/bin/bash
set -e

echo "--- 🛠️ STARTING BUILD (NETLIFY EDITION) ---"

# 1. توليد فهارس الأقسام (Sub-indexes)
# نمر على كل المجلدات وننشئ ملف index.json يحتوي على قائمة الملفات
echo "--> Generating Category Indexes..."

find data/properties data/requests -mindepth 1 -type d | while read dir; do
    # نعد الملفات للتأكد
    count=$(find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" | wc -l)
    
    if [ "$count" -gt 0 ]; then
        echo "    Updating: $dir/index.json ($count files)"
        # 1. البحث عن الملفات
        # 2. الترتيب (sort) لضمان النظام
        # 3. استخدام jq لتحويل القائمة إلى مصفوفة JSON سليمة 100%
        find "$dir" -maxdepth 1 -name "*.json" ! -name "index.json" -printf '%f\n' | sort | jq -R . | jq -s . > "$dir/index.json"
    else
        # إذا المجلد فارغ، نضع مصفوفة فارغة
        echo "[]" > "$dir/index.json"
    fi
done

# 2. توليد الفهارس الرئيسية (Master Indexes)
# هذه الملفات هي التي تعتمد عليها صفحات التفاصيل
echo "--> Generating Master Indexes..."

# دالة مساعدة لإنشاء الفهرس الرئيسي
generate_master() {
    base_dir=$1
    output_file=$2
    
    # نجمع كل ملفات JSON ونستخرج منها المعلومات لإنشاء خريطة كاملة
    find "$base_dir" -name "*.json" ! -name "index.json" -print0 | while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        id="${filename%.*}"      # الـ ID هو اسم الملف بدون الامتداد
        parent=$(dirname "$file")
        category=$(basename "$parent") # اسم المجلد (apartments, shops...)
        
        # إنشاء كائن JSON لهذا الملف
        # المسار يبدأ بـ / ليكون صحيحاً في الموقع
        jq -n \
           --arg id "$id" \
           --arg path "/$file" \
           --arg cat "$category" \
           '{id: $id, path: $path, category: $cat}'
           
    done | jq -s '.' > "$output_file" # تجميع الكل في مصفوفة واحدة
    
    echo "    ✅ Created $output_file"
}

# تشغيل الدالة للعقارات والطلبات
generate_master "data/properties" "data/properties_index.json"
generate_master "data/requests" "data/requests_index.json"

# 3. بناء الموقع (Jekyll)
echo "--> Building Jekyll Site..."
bundle exec jekyll build

echo "--- ✅ BUILD SUCCESS ---"

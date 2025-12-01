#!/bin/bash
set -e

echo "--- 🚀 STARTING INTELLIGENT BUILD (DATE SORTED) ---"

# نستخدم بايثون لفرز الملفات حسب التاريخ الموجود داخلها
cat <<EOF > generate_indexes.py
import os
import json
import glob
from datetime import datetime

# المسارات
BASE_DIRS = ['data/properties', 'data/requests']
master_list_props = []
master_list_reqs = []

def get_file_date(filepath):
    """
    دالة تفتح الملف وتقرأ التاريخ منه للترتيب
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # نحاول قراءة التاريخ، لو مش موجود نرجع تاريخ قديم جداً
            return data.get('date', '2000-01-01')
    except:
        return '2000-01-01'

def process_folders():
    for base_dir in BASE_DIRS:
        if not os.path.exists(base_dir):
            continue
            
        for root, dirs, files in os.walk(base_dir):
            if root == base_dir:
                continue
                
            folder_name = os.path.basename(root)
            print(f"--> Processing: {folder_name}")
            
            # 1. تجميع ملفات JSON
            json_files = []
            for file in files:
                if file.endswith('.json') and file != 'index.json':
                    full_path = os.path.join(root, file)
                    # نخزن اسم الملف + تاريخه
                    file_date = get_file_date(full_path)
                    json_files.append({'name': file, 'date': file_date})
            
            # 2. الترتيب الزمني الذكي (الأقدم أولاً -> الأحدث في الذيل)
            # هذا يضمن أن home-featured.js يجد الجديد دائماً في النهاية
            json_files.sort(key=lambda x: x['date'])
            
            # استخراج أسماء الملفات فقط بعد الترتيب
            sorted_filenames = [item['name'] for item in json_files]
            
            # 3. كتابة ملف index.json المرتب زمنياً
            if sorted_filenames:
                with open(os.path.join(root, 'index.json'), 'w', encoding='utf-8') as f:
                    json.dump(sorted_filenames, f, ensure_ascii=False)
                print(f"    ✅ Indexed {len(sorted_filenames)} files (Sorted by Date)")
            
            # 4. التجهيز للفهرس الرئيسي
            for item in json_files:
                filename = item['name']
                file_path = os.path.join(root, filename)
                file_id = filename.replace('.json', '')
                
                # محاولة قراءة ID حقيقي
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if 'id' in data: file_id = str(data['id'])
                except:
                    pass
                
                item_data = {
                    "id": file_id,
                    "path": "/" + file_path.replace('\\\\', '/'),
                    "category": folder_name
                }
                
                if 'requests' in base_dir:
                    master_list_reqs.append(item_data)
                else:
                    master_list_props.append(item_data)

# تشغيل المعالجة
process_folders()

# كتابة الفهارس الرئيسية
print("--> Writing Master Indexes...")
with open('data/properties_index.json', 'w', encoding='utf-8') as f:
    json.dump(master_list_props, f, ensure_ascii=False)

with open('data/requests_index.json', 'w', encoding='utf-8') as f:
    json.dump(master_list_reqs, f, ensure_ascii=False)

print("✅ DONE: All indexes generated and sorted by date.")
EOF

# تشغيل البايثون
python3 generate_indexes.py
rm generate_indexes.py

# بناء الموقع
echo "--- 🏗️ Building Jekyll Site ---"
bundle exec jekyll build

echo "--- 🏁 BUILD FINISHED SUCCESSFULLY ---"

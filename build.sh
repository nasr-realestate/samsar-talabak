#!/bin/bash
set -e

echo "--- 🚀 STARTING ROBUST BUILD PROCESS (PYTHON POWERED) ---"

# نقوم بكتابة سكربت بايثون مؤقت للقيام بالمهمة الصعبة بدقة
cat <<EOF > generate_indexes.py
import os
import json
import glob

# تحديد المسارات الرئيسية
BASE_DIRS = ['data/properties', 'data/requests']
master_list_props = []
master_list_reqs = []

def process_folders():
    for base_dir in BASE_DIRS:
        if not os.path.exists(base_dir):
            continue
            
        # الدخول لكل مجلد فرعي (apartments, offices, etc.)
        for root, dirs, files in os.walk(base_dir):
            # نتخطى المجلد الرئيسي نفسه، نريد المجلدات الفرعية فقط
            if root == base_dir:
                continue
                
            folder_name = os.path.basename(root)
            print(f"--> Processing: {folder_name}")
            
            # 1. تجميع ملفات JSON الصالحة
            json_files = []
            for file in files:
                if file.endswith('.json') and file != 'index.json':
                    json_files.append(file)
            
            # 2. الترتيب (مهم جداً لظهور الأحدث)
            json_files.sort()
            
            # 3. كتابة ملف index.json الخاص بالمجلد
            if json_files:
                with open(os.path.join(root, 'index.json'), 'w', encoding='utf-8') as f:
                    json.dump(json_files, f, ensure_ascii=False)
                print(f"    ✅ Created index with {len(json_files)} items")
            
            # 4. التجهيز للفهرس الرئيسي (لصفحات التفاصيل)
            for file in json_files:
                file_path = os.path.join(root, file)
                # محاولة استخراج ID من الملف
                file_id = file.replace('.json', '')
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if 'id' in data: file_id = str(data['id'])
                except:
                    pass
                
                # تحديد القائمة المناسبة (عروض أم طلبات)
                item_data = {
                    "id": file_id,
                    "path": "/" + file_path.replace('\\\\', '/'), # تصحيح المسار
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

print("✅ DONE: All indexes generated.")
EOF

# تشغيل سكربت البايثون
python3 generate_indexes.py

# حذف السكربت المؤقت
rm generate_indexes.py

# بناء موقع Jekyll
echo "--- 🏗️ Building Jekyll Site ---"
bundle exec jekyll build

echo "--- 🏁 BUILD FINISHED SUCCESSFULLY ---"

#!/bin/bash
set -e

echo "--- 🚀 STARTING ROBUST BUILD PROCESS (PYTHON POWERED) ---"

# 1. إنشاء سكربت بايثون مؤقت للقيام بالمهمة الصعبة بدقة 100%
cat <<EOF > generate_indexes_script.py
import os
import json
import glob

# تحديد المسارات
DATA_DIR = 'data'
PROPERTIES_DIR = os.path.join(DATA_DIR, 'properties')
REQUESTS_DIR = os.path.join(DATA_DIR, 'requests')

# قوائم للفهارس الرئيسية
master_props = []
master_reqs = []

def process_directory(base_dir, master_list):
    if not os.path.exists(base_dir):
        print(f"Skipping {base_dir}, not found.")
        return

    # الدخول لكل مجلد فرعي (شقق، مكاتب، إلخ)
    subfolders = [f.path for f in os.scandir(base_dir) if f.is_dir()]
    
    for folder in subfolders:
        folder_name = os.path.basename(folder)
        print(f"--> Processing folder: {folder_name}")
        
        # البحث عن كل ملفات JSON (ما عدا الاندكس)
        files = glob.glob(os.path.join(folder, "*.json"))
        valid_files = [os.path.basename(f) for f in files if not f.endswith('index.json')]
        
        # الترتيب (لضمان أن الأحدث يضاف في النهاية بشكل صحيح)
        valid_files.sort()
        
        # 1. كتابة ملف index.json الخاص بالمجلد (هذا ما كنت تبحث عنه)
        index_path = os.path.join(folder, 'index.json')
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(valid_files, f, ensure_ascii=False)
        
        print(f"    Generated index.json with {len(valid_files)} items.")

        # 2. إضافة الملفات للفهرس الرئيسي (لصفحات التفاصيل)
        for filename in valid_files:
            file_id = filename.replace('.json', '')
            # نحاول قراءة ID من داخل الملف إن وجد، وإلا نستخدم الاسم
            try:
                with open(os.path.join(folder, filename), 'r', encoding='utf-8') as jf:
                    content = json.load(jf)
                    if 'id' in content: file_id = str(content['id'])
            except:
                pass
            
            master_list.append({
                "id": file_id,
                "path": f"/{folder}/{filename}".replace('\\\\', '/').replace('//', '/'),
                "category": folder_name
            })

# تنفيذ المعالجة
print("1. Processing Properties...")
process_directory(PROPERTIES_DIR, master_props)

print("2. Processing Requests...")
process_directory(REQUESTS_DIR, master_reqs)

# كتابة الفهارس الرئيسية
print("3. Writing Master Indexes...")
with open(os.path.join(DATA_DIR, 'properties_index.json'), 'w', encoding='utf-8') as f:
    json.dump(master_props, f, ensure_ascii=False)

with open(os.path.join(DATA_DIR, 'requests_index.json'), 'w', encoding='utf-8') as f:
    json.dump(master_reqs, f, ensure_ascii=False)

print("✅ All indexes generated successfully.")
EOF

# 2. تشغيل السكربت الذي أنشأناه للتو
echo "--- Running Python Indexer ---"
python3 generate_indexes_script.py

# 3. تنظيف (حذف السكربت المؤقت)
rm generate_indexes_script.py

# 4. بناء موقع Jekyll
echo "--- Building Jekyll Site ---"
bundle exec jekyll build

echo "--- 🏁 BUILD SCRIPT END ---"

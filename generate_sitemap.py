import os
import glob
import re

BASE_URL = "https://aqarnasr.netlify.app"
# المسار النهائي للملف الذي سنقرأه ونكتب فوقه
SITEMAP_PATH = os.path.join('_site', 'sitemap.xml')

def run_sitemap_modifier():
    print("🚀 Starting Sitemap Modifier Script...")

    if not os.path.exists(SITEMAP_PATH):
        print(f"❌ ERROR: Base sitemap not found at '{SITEMAP_PATH}'. Jekyll build might have failed.")
        return

    # --- 1. قراءة الروابط الموجودة حاليًا من الملف ---
    with open(SITEMAP_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # استخدام set لتخزين الروابط الموجودة لضمان عدم التكرار
    existing_urls = set(re.findall(r'<loc>(.*?)</loc>', content))
    print(f"🔍 Found {len(existing_urls)} existing URLs in the base sitemap.")

    # --- 2. البحث عن الروابط الديناميكية المفقودة ---
    new_urls_to_add = set()
    
    # البحث في مجلد 'data' الأصلي عن ملفات JSON
    # العقارات
    search_path_props = os.path.join('data', 'properties', '**', '*.json')
    for filepath in glob.glob(search_path_props, recursive=True):
        if "index.json" in os.path.basename(filepath): continue
        clean_id = os.path.basename(filepath).replace('.json', '')
        category = os.path.basename(os.path.dirname(filepath))
        if category and category != 'properties':
            url = f"{BASE_URL}/details.html?id={clean_id}&amp;category={category}"
            if url not in existing_urls:
                new_urls_to_add.add(url)

    # الطلبات
    search_path_reqs = os.path.join('data', 'requests', '**', '*.json')
    for filepath in glob.glob(search_path_reqs, recursive=True):
        if "index.json" in os.path.basename(filepath): continue
        clean_id = os.path.basename(filepath).replace('.json', '')
        category = os.path.basename(os.path.dirname(filepath))
        if category and category != 'requests':
            url = f"{BASE_URL}/request-details.html?id={clean_id}&amp;category={category}"
            if url not in existing_urls:
                new_urls_to_add.add(url)

    print(f"✨ Found {len(new_urls_to_add)} new dynamic URLs to add.")

    if not new_urls_to_add:
        print("✅ No new URLs to add. Sitemap is already up-to-date.")
        # إضافة تعليق للتأكيد أن السكربت عمل
        final_content = content.replace('</urlset>', '<!-- SCRIPT RUN: NO NEW URLS -->\n</urlset>')
    else:
        # --- 3. بناء الروابط الجديدة وإضافتها إلى الملف ---
        new_xml_entries = ''
        for url in sorted(list(new_urls_to_add)):
            # سنستخدم نفس تنسيق الملف الأصلي لإضافة الروابط
            new_xml_entries += (
                '  <url>\n'
                f'    <loc>{url}</loc>\n'
                '    <changefreq>weekly</changefreq>\n'
                '    <priority>0.7</priority>\n'
                '  </url>\n'
            )
        
        # إضافة تعليق مميز والروابط الجديدة قبل وسم الإغلاق
        final_content = content.replace('</urlset>', f'{new_xml_entries}\n<!-- ✅ SCRIPT RUN: {len(new_urls_to_add)} URLS INJECTED -->\n</urlset>')

    # --- 4. كتابة الملف النهائي ---
    with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print(f"✅ Sitemap successfully modified and overwritten at '{SITEMAP_PATH}'.")
    print(f"Total URLs should now be: {len(existing_urls) + len(new_urls_to_add)}")

if __name__ == "__main__":
    run_sitemap_modifier()

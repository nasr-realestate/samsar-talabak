import os
import glob
from datetime import datetime

# إعدادات الموقع
BASE_URL = "https://aqarnasr.netlify.app"
# التغيير الجوهري: الكتابة داخل مجلد النشر مباشرة
OUTPUT_DIR = "_site"
SITEMAP_FILE = os.path.join(OUTPUT_DIR, "sitemap.xml")

# الصفحات الثابتة
static_pages = [
    "",
    "about-us",
    "contact-us",
    "add-your-property",
    "properties-filtered",
    "requests-filtered",
    "privacy-policy"
]

def generate_xml():
    # التأكد من وجود مجلد النشر (لأننا سنعمل بعد بناء جيكل)
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    # 1. الصفحات الثابتة
    for page in static_pages:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{BASE_URL}/{page}</loc>\n'
        xml_content += '    <changefreq>weekly</changefreq>\n'
        xml_content += '    <priority>0.8</priority>\n'
        xml_content += '  </url>\n'

    # 2. العقارات (العروض)
    count_props = 0
    for filepath in glob.glob("data/properties/*/*.json"):
        if "index.json" in filepath: continue
        
        filename = os.path.basename(filepath)
        clean_id = filename.replace('.json', '')
        # استخراج اسم المجلد (apartments, shops...)
        category = os.path.basename(os.path.dirname(filepath))
        
        full_url = f"{BASE_URL}/details.html?id={clean_id}&amp;category={category}"
        
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{full_url}</loc>\n'
        xml_content += '    <changefreq>monthly</changefreq>\n'
        xml_content += '    <priority>0.9</priority>\n'
        xml_content += '  </url>\n'
        count_props += 1

    # 3. الطلبات
    count_reqs = 0
    for filepath in glob.glob("data/requests/*/*.json"):
        if "index.json" in filepath: continue
        
        filename = os.path.basename(filepath)
        clean_id = filename.replace('.json', '')
        category = os.path.basename(os.path.dirname(filepath))
        
        full_url = f"{BASE_URL}/request-details.html?id={clean_id}&amp;category={category}"
        
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{full_url}</loc>\n'
        xml_content += '    <changefreq>monthly</changefreq>\n'
        xml_content += '    <priority>0.7</priority>\n'
        xml_content += '  </url>\n'
        count_reqs += 1

    xml_content += '</urlset>'
    
    # الكتابة القسرية في المجلد النهائي
    with open(SITEMAP_FILE, "w", encoding="utf-8") as f:
        f.write(xml_content)
    
    print(f"✅ FORCED SITEMAP GENERATION: {count_props} properties, {count_reqs} requests.")
    print(f"✅ File written to: {SITEMAP_FILE}")

if __name__ == "__main__":
    generate_xml()

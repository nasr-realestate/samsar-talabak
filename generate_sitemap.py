import os
import glob
from datetime import datetime

# إعدادات الموقع
BASE_URL = "https://aqarnasr.netlify.app"
SITEMAP_FILE = "sitemap.xml"

# الصفحات الثابتة الهامة
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
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    # 1. إضافة الصفحات الثابتة
    for page in static_pages:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{BASE_URL}/{page}</loc>\n'
        xml_content += '    <changefreq>weekly</changefreq>\n'
        xml_content += '    <priority>0.8</priority>\n'
        xml_content += '  </url>\n'

    # 2. إضافة العقارات (العروض)
    # المسار: data/properties/{category}/{filename}
    for filepath in glob.glob("data/properties/*/*.json"):
        if "index.json" in filepath: continue
        
        filename = os.path.basename(filepath)
        clean_id = filename.replace('.json', '')
        category = os.path.basename(os.path.dirname(filepath))
        
        # تكوين الرابط الديناميكي الصحيح
        full_url = f"{BASE_URL}/details.html?id={clean_id}&amp;category={category}"
        
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{full_url}</loc>\n'
        xml_content += '    <changefreq>monthly</changefreq>\n'
        xml_content += '    <priority>0.9</priority>\n'
        xml_content += '  </url>\n'

    # 3. إضافة الطلبات
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

    xml_content += '</urlset>'
    
    # كتابة الملف
    with open(SITEMAP_FILE, "w", encoding="utf-8") as f:
        f.write(xml_content)
    
    print(f"✅ Sitemap generated successfully with custom dynamic links.")

if __name__ == "__main__":
    generate_xml()

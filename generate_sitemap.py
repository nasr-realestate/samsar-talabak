import os
import glob
import re

BASE_URL = "https://aqarnasr.netlify.app"
SITEMAP_PATH = os.path.join('_site', 'sitemap.xml')

def run_sitemap_modifier():
    print("🚀 Starting Sitemap Modifier Script...")

    if not os.path.exists(SITEMAP_PATH):
        print(f"❌ ERROR: Base sitemap not found at '{SITEMAP_PATH}'.")
        return

    # قراءة المحتوى الحالي
    with open(SITEMAP_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    existing_urls = set(re.findall(r'<loc>(.*?)</loc>', content))
    print(f"🔍 Found {len(existing_urls)} existing URLs in the base sitemap.")

    new_urls_to_add = set()

    # روابط العقارات
    for filepath in glob.glob('data/properties/**/*.json', recursive=True):
        if "index.json" in os.path.basename(filepath): continue
        clean_id = os.path.basename(filepath).replace('.json', '')
        category = os.path.basename(os.path.dirname(filepath))
        if category and category != 'properties':
            url = f"{BASE_URL}/details.html?id={clean_id}&amp;category={category}"
            if url not in existing_urls:
                new_urls_to_add.add(url)

    # روابط الطلبات
    for filepath in glob.glob('data/requests/**/*.json', recursive=True):
        if "index.json" in os.path.basename(filepath): continue
        clean_id = os.path.basename(filepath).replace('.json', '')
        category = os.path.basename(os.path.dirname(filepath))
        if category and category != 'requests':
            url = f"{BASE_URL}/request-details.html?id={clean_id}&amp;category={category}"
            if url not in existing_urls:
                new_urls_to_add.add(url)

    print(f"✨ Found {len(new_urls_to_add)} new dynamic URLs to add.")

    if not new_urls_to_add:
        final_content = content.replace('</urlset>', '<!-- SCRIPT RUN: NO NEW URLS -->\n</urlset>')
    else:
        new_xml_entries = ''
        for url in sorted(list(new_urls_to_add)):
            new_xml_entries += (
                '  <url>\n'
                f'    <loc>{url}</loc>\n'
                '    <changefreq>weekly</changefreq>\n'
                '    <priority>0.7</priority>\n'
                '  </url>\n'
            )
        final_content = content.replace('</urlset>', f'{new_xml_entries}\n<!-- ✅ SCRIPT RUN: {len(new_urls_to_add)} URLS INJECTED -->\n</urlset>')

    with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print(f"✅ Sitemap successfully modified at '{SITEMAP_PATH}'.")
    print(f"Total URLs should now be: {len(existing_urls) + len(new_urls_to_add)}")

if __name__ == "__main__":
    run_sitemap_modifier()

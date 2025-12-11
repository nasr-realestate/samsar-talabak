import os
import json

BASE_URL = "https://aqarnasr.netlify.app"
OUTPUT_FILE = "sitemap.xml"

STATIC_PAGES = [
    "/",
    "/properties-filtered.html",
    "/requests-filtered.html",
    "/about.html",
    "/contact.html"
]

def collect_json_urls():
    urls = []

    # العقارات
    for root, dirs, files in os.walk("data/properties"):
        for file in files:
            if file.endswith(".json") and file != "index.json":
                clean_id = file.replace(".json", "")
                category = os.path.basename(root)
                if category != "properties":
                    url = f"{BASE_URL}/details.html?id={clean_id}&category={category}"
                    urls.append(url)

    # الطلبات
    for root, dirs, files in os.walk("data/requests"):
        for file in files:
            if file.endswith(".json") and file != "index.json":
                clean_id = file.replace(".json", "")
                category = os.path.basename(root)
                if category != "requests":
                    url = f"{BASE_URL}/request-details.html?id={clean_id}&category={category}"
                    urls.append(url)

    return urls


def generate_sitemap():
    print("🚀 Generating Final Sitemap.xml ...")

    all_urls = []

    # إضافة الصفحات الثابتة
    for page in STATIC_PAGES:
        all_urls.append(f"{BASE_URL}{page}")

    # إضافة الروابط الديناميكية
    all_urls.extend(collect_json_urls())

    # كتابة الملف النهائي
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')

        for url in sorted(set(all_urls)):
            f.write("  <url>\n")
            f.write(f"    <loc>{url}</loc>\n")
            f.write("    <changefreq>weekly</changefreq>\n")
            f.write("    <priority>0.8</priority>\n")
            f.write("  </url>\n")

        f.write("</urlset>")

    print(f"✅ Sitemap Created Successfully with {len(all_urls)} URLs.")


if __name__ == "__main__":
    generate_sitemap()

source "https://rubygems.org"

# 1. المحرك الأساسي (نسخة مستقرة)
gem "jekyll", "~> 4.3.4"

# 2. مكتبات ضرورية جداً لسيرفرات Netlify الحديثة (Ruby 3.4+)
# بدون هذه المكتبات سيفشل البناء
gem "csv"
gem "base64"
gem "logger"
gem "webrick"

# 3. إضافات السيو والخرائط
group :jekyll_plugins do
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
end

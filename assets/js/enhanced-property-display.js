/**
 * 🏢 سمسار طلبك - نظام عرض العقارات (النسخة الذهبية - المحدثة)
 * v7.0 - Mobile Optimized & Active Filters
 */

class EnhancedPropertyDisplay {
  constructor() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.currentCategory = null;
    this.currentDateFilter = 'latest';
    this.propertiesCache = new Map();
    this.isLoading = false;
    
    this.config = {
      cacheExpiry: 5 * 60 * 1000,
      loadingDelay: 300
    };

    this.categories = {
      "apartments": { label: "شقق للبيع", icon: "fa-home", color: "#d4af37", description: "شقق سكنية فاخرة للتمليك" },
      "apartments-rent": { label: "شقق للإيجار", icon: "fa-key", color: "#fce205", description: "شقق للإيجار في أرقى المناطق" },
      "shops": { label: "تجاري", icon: "fa-store", color: "#b38f1d", description: "محلات ومساحات تجارية" },
      "offices": { label: "مكاتب", icon: "fa-briefcase", color: "#d4af37", description: "مكاتب إدارية للشركات" },
      "admin-hq": { label: "مقرات إدارية", icon: "fa-building", color: "#998a00", description: "مقرات ومباني كاملة" }
    };

    this.init();
  }

  async init() {
    try {
      if (!this.container) return;
      this.container.classList.add('properties-grid');
      this.createFilterButtons();
      this.loadDefaultCategory();
    } catch (error) {
      console.error('Init Error:', error);
    }
  }

  // 1️⃣ تحديث: تلوين الزر النشط بوضوح
  createFilterButtons() {
    if (!this.filterContainer) return;
    this.filterContainer.innerHTML = '';
    
    Object.entries(this.categories).forEach(([key, category]) => {
      const button = document.createElement("button");
      button.innerHTML = `<i class="fas ${category.icon}"></i> ${category.label}`;
      button.className = "filter-btn";
      
      // حفظ اللون الأصلي في متغير لاستخدامه عند التنشيط
      button.dataset.activeColor = category.color;
      
      button.onclick = (e) => {
        e.preventDefault();
        this.handleCategoryChange(key, button);
      };
      this.filterContainer.appendChild(button);
    });
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    
    // إعادة تعيين جميع الأزرار للوضع الطبيعي
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--color-text-secondary)';
        btn.style.borderColor = 'var(--color-border)';
    });

    // تفعيل الزر المختار وتلوينه بلونه الخاص
    button.classList.add('active');
    const activeColor = this.categories[category].color;
    
    button.style.backgroundColor = activeColor;
    button.style.color = '#000'; // نص أسود للتباين
    button.style.borderColor = activeColor;
    button.style.boxShadow = `0 0 15px ${activeColor}40`; // لمعة خفيفة

    this.currentCategory = category;
    localStorage.setItem('lastCategory', category);
    await this.loadCategory(category);
  }

  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory');
    const defaultCategory = savedCategory && this.categories[savedCategory] ? savedCategory : Object.keys(this.categories)[0];
    
    // البحث عن الزر وتفعيله برمجياً
    // نستخدم includes لأن النص قد يحتوي على مسافات أو أيقونات
    const buttons = Array.from(this.filterContainer.children);
    const defaultButton = buttons.find(btn => btn.innerText.includes(this.categories[defaultCategory].label)) || buttons[0];
    
    if (defaultButton) {
        // نستدعي دالة التغيير مباشرة لتطبيق التلوين
        this.handleCategoryChange(defaultCategory, defaultButton);
    }
  }

  async loadCategory(category) {
    this.isLoading = true;
    this.showLoadingState();

    try {
      const indexResponse = await fetch(`/data/properties/${category}/index.json?t=${Date.now()}`);
      if (!indexResponse.ok) { this.showEmptyState(); return; }
      
      const files = await indexResponse.json();
      if (!Array.isArray(files) || files.length === 0) { this.showEmptyState(); return; }

      const promises = files.map(filename => 
        fetch(`/data/properties/${category}/${filename}`)
          .then(res => res.json())
          .then(data => ({ ...data, filename, category }))
          .catch(() => null)
      );

      const results = await Promise.all(promises);
      const validProperties = results.filter(p => p !== null);
      await this.displayProperties(validProperties);

    } catch (error) {
      console.error(error);
      this.showErrorMessage();
    } finally {
      this.isLoading = false;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--color-primary);">
        <div class="loading-spinner" style="border: 3px solid #333; border-top-color: var(--color-primary); width: 50px; height: 50px; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
        <p>جاري تحميل العروض...</p>
      </div>
    `;
  }

  async displayProperties(properties) {
    if (properties.length === 0) {
      this.showEmptyState();
      return;
    }

    const sorted = properties.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    this.container.innerHTML = '';
    
    for (const property of sorted) {
      const card = this.createPropertyCard(property);
      this.container.appendChild(card);
      await new Promise(r => setTimeout(r, 20));
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }
  }

  // 2️⃣ تحديث: تصميم البطاقة (متجاوب للموبايل)
  createPropertyCard(property) {
    const card = document.createElement("div");
    card.className = "property-card text-mode"; 
    
    // تلوين الحد العلوي حسب الفئة (ذهبي للبيع / أصفر للإيجار)
    let accentColor = "#d4af37";
    if (this.currentCategory === 'apartments-rent') accentColor = "#fce205";
    
    card.style.borderTop = `4px solid ${accentColor}`;
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.3s ease";

    const propertyId = property.filename.replace('.json', '');
    const targetUrl = `/details.html?id=${propertyId}`;
    card.onclick = () => window.location.href = targetUrl;
    
    const title = property.title || "عرض مميز";
    const price = property.price_display || property.price || "تواصل للسعر";
    const location = property.location || "مدينة نصر";
    const timeAgo = this.getTimeAgo(property.date);

    card.innerHTML = `
      <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="background: rgba(255, 255, 255, 0.05); color: ${accentColor}; padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; border: 1px solid ${accentColor};">
                <i class="fas fa-clock"></i> ${timeAgo}
            </div>
            <div style="color: #ccc; font-size: 0.85rem;">
               <i class="fas fa-map-marker-alt"></i> ${location}
            </div>
        </div>
        <!-- تم السماح للعنوان بالنزول لسطر ثاني -->
        <h3 class="property-title" style="font-size: 1.2rem; margin: 5px 0; color: #fff; line-height: 1.4;">${title}</h3>
      </div>

      <!-- استخدام Flex Wrap بدلاً من Grid للموبايل -->
      <div class="property-details" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
        
        <!-- السعر يأخذ السطر كامل -->
        <div class="property-detail" style="flex: 1 1 100%; background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent); border-right: 3px solid ${accentColor}; padding: 5px;">
          <span class="detail-icon"><i class="fas fa-tag"></i></span>
          <span class="detail-label">السعر:</span>
          <span class="detail-value" style="color: ${accentColor}; font-size: 1.1rem; font-weight: bold;">${price}</span>
        </div>
        
        ${property.area ? `
        <div class="property-detail" style="flex: 1 1 45%; min-width: 120px; font-size: 0.9rem; color: #ccc;">
            <span class="detail-icon"><i class="fas fa-ruler-combined"></i></span> ${property.area}
        </div>` : ''}
        
        ${property.rooms ? `
        <div class="property-detail" style="flex: 1 1 45%; min-width: 120px; font-size: 0.9rem; color: #ccc;">
            <span class="detail-icon"><i class="fas fa-bed"></i></span> ${property.rooms}
        </div>` : ''}
      </div>

      <div style="margin-top: auto;">
          <a href="${targetUrl}" class="view-details-btn" style="display:block; text-align:center; width: 100%; margin: 0; background: transparent; border: 1px solid #444; color: #ccc; text-decoration:none; padding: 8px;">
              التفاصيل <i class="fas fa-arrow-left" style="margin-right: 5px; color: ${accentColor};"></i>
          </a>
      </div>
    `;

    return card;
  }

  showEmptyState() {
    this.container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;"><p>لا توجد عقارات في هذا القسم حالياً.</p></div>`;
  }

  showErrorMessage() {
    this.container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-error);"><p>خطأ في الاتصال.</p></div>`;
  }

  getTimeAgo(dateString) {
    if (!dateString) return 'جديد';
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 30) return `منذ ${days} يوم`;
    return `منذ شهر`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
    new EnhancedPropertyDisplay();
});

/**
 * 🏢 سمسار طلبك - نظام عرض العقارات (النسخة الذهبية - الروابط المصححة)
 * v6.0 - Fixed Routing
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

  createFilterButtons() {
    if (!this.filterContainer) return;
    this.filterContainer.innerHTML = '';
    Object.entries(this.categories).forEach(([key, category]) => {
      const button = document.createElement("button");
      button.innerHTML = `<i class="fas ${category.icon}"></i> ${category.label}`;
      button.className = "filter-btn";
      button.onclick = (e) => {
        e.preventDefault();
        this.handleCategoryChange(key, button);
      };
      this.filterContainer.appendChild(button);
    });
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    this.currentCategory = category;
    localStorage.setItem('lastCategory', category);
    await this.loadCategory(category);
  }

  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory');
    const defaultCategory = savedCategory && this.categories[savedCategory] ? savedCategory : Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`) 
                       || this.filterContainer.firstElementChild;
    if (defaultButton) {
        // محاكاة النقر لتفعيل الفئة
        this.handleCategoryChange(defaultCategory, defaultButton);
    }
  }

  async loadCategory(category) {
    this.isLoading = true;
    this.showLoadingState();

    try {
      // 1. جلب البيانات
      const indexResponse = await fetch(`/data/properties/${category}/index.json?t=${Date.now()}`);
      if (!indexResponse.ok) {
          this.showEmptyState(); 
          return;
      }
      
      const files = await indexResponse.json();
      if (!Array.isArray(files) || files.length === 0) {
          this.showEmptyState();
          return;
      }

      // 2. جلب تفاصيل كل ملف
      const promises = files.map(filename => 
        fetch(`/data/properties/${category}/${filename}`)
          .then(res => res.json())
          .then(data => ({ ...data, filename, category })) // نمرر اسم الملف والقسم
          .catch(() => null)
      );

      const results = await Promise.all(promises);
      const validProperties = results.filter(p => p !== null);
      
      // 3. العرض
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

    // ترتيب بالأحدث
    const sorted = properties.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    this.container.innerHTML = '';
    
    for (const property of sorted) {
      const card = this.createPropertyCard(property);
      this.container.appendChild(card);
      // تأثير بسيط
      await new Promise(r => setTimeout(r, 20));
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }
  }

  // 💎💎 دالة إنشاء البطاقة (الروابط الصحيحة) 💎💎
  createPropertyCard(property) {
    const card = document.createElement("div");
    card.className = "property-card text-mode"; 
    card.style.borderTop = "4px solid var(--color-primary)";
    
    // أنيميشن الدخول
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.3s ease";

    // 🔴 التصحيح هنا: استخراج الـ ID بشكل نظيف وبناء الرابط الصحيح
    // ID هو اسم الملف بدون .json
    const propertyId = property.filename.replace('.json', '');
    // الرابط الصحيح: details.html?id=...
    const targetUrl = `/details.html?id=${propertyId}`;

    card.onclick = () => window.location.href = targetUrl;
    
    // البيانات
    const title = property.title || "عرض مميز";
    const price = property.price_display || property.price || "تواصل للسعر";
    const location = property.location || "مدينة نصر";
    const timeAgo = this.getTimeAgo(property.date);

    card.innerHTML = `
      <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="background: rgba(212, 175, 55, 0.1); color: var(--color-primary); padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; border: 1px solid var(--color-primary);">
                <i class="fas fa-clock"></i> ${timeAgo}
            </div>
            <div style="color: #888; font-size: 0.85rem;">
               <i class="fas fa-map-marker-alt"></i> ${location}
            </div>
        </div>
        <h3 class="property-title" style="font-size: 1.2rem; margin: 5px 0; color: #fff;">${title}</h3>
      </div>

      <div class="property-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
        <div class="property-detail" style="grid-column: 1 / -1; background: linear-gradient(90deg, rgba(212,175,55,0.1), transparent); border-right: 3px solid var(--color-primary);">
          <span class="detail-icon"><i class="fas fa-tag"></i></span>
          <span class="detail-label">السعر:</span>
          <span class="detail-value" style="color: var(--color-primary); font-size: 1.1rem;">${price}</span>
        </div>
        ${property.area ? `<div class="property-detail"><span class="detail-icon"><i class="fas fa-ruler-combined"></i></span><span class="detail-label">المساحة:</span><span class="detail-value">${property.area}</span></div>` : ''}
        ${property.rooms ? `<div class="property-detail"><span class="detail-icon"><i class="fas fa-bed"></i></span><span class="detail-label">الغرف:</span><span class="detail-value">${property.rooms}</span></div>` : ''}
      </div>

      <div style="margin-top: auto;">
          <a href="${targetUrl}" class="view-details-btn" style="display:block; text-align:center; width: 100%; margin: 0; background: transparent; border: 1px solid #444; color: #ccc; text-decoration:none; padding: 8px;">
              التفاصيل <i class="fas fa-arrow-left" style="margin-right: 5px; color: var(--color-primary);"></i>
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
    if (days === 0) return 'اليوم';
    if (days < 30) return `منذ ${days} يوم`;
    return `منذ شهر`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
    new EnhancedPropertyDisplay();
});

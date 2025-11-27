/**
 * 🏢 سمسار طلبك - نظام عرض العقارات (النسخة الذهبية - نصية فقط)
 * v5.0 - Text-Only Luxury Cards
 */

class EnhancedPropertyDisplay {
  constructor() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");
    this.currentCategory = null;
    this.currentDateFilter = 'latest';
    this.propertiesCache = new Map();
    this.isLoading = false;
    
    // إعدادات النظام
    this.config = {
      animationDuration: 300,
      cacheExpiry: 5 * 60 * 1000,
      loadingDelay: 400
    };

    // الفئات بألوانها الذهبية
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
      await this.waitForDOM();
      this.setupElements();
      this.createFilterButtons();
      this.createDateFilter(); // فلتر التاريخ البسيط
      this.checkSectionHighlight(); // التحقق من الرابط
      this.loadDefaultCategory();
    } catch (error) {
      console.error('Initialization Error:', error);
    }
  }

  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve);
      else resolve();
    });
  }

  setupElements() {
    if (!this.container || !this.filterContainer) return;
    // إضافة كلاس الشبكة من ملف CSS الجديد
    this.container.classList.add('properties-grid');
  }

  // --- أدوات الفلترة والعرض ---

  createFilterButtons() {
    this.filterContainer.innerHTML = '';
    Object.entries(this.categories).forEach(([key, category], index) => {
      const button = document.createElement("button");
      button.innerHTML = `<i class="fas ${category.icon}"></i> ${category.label}`;
      button.dataset.category = key;
      button.className = "filter-btn"; // الكلاس من CSS
      button.title = category.description;
      
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCategoryChange(key, button);
      });
      this.filterContainer.appendChild(button);
    });
  }

  createDateFilter() {
    // إضافة قائمة منسدلة بسيطة للترتيب (اختياري)
    const wrapper = document.createElement('div');
    wrapper.className = 'date-filter-wrapper';
    wrapper.style.marginTop = '15px';
    wrapper.innerHTML = `
        <select id="sort-select" style="background: var(--color-surface-2); color: #fff; border: 1px solid #333; padding: 5px 15px; border-radius: 20px;">
            <option value="latest">الأحدث أولاً</option>
            <option value="oldest">الأقدم أولاً</option>
        </select>
    `;
    this.filterContainer.appendChild(wrapper);
    
    document.getElementById('sort-select').addEventListener('change', (e) => {
        this.currentDateFilter = e.target.value;
        this.refreshCurrentCategory();
    });
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    
    // تحديث شكل الأزرار
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    try {
      this.currentCategory = category;
      localStorage.setItem('lastCategory', category);
      await this.loadCategory(category);
    } catch (error) {
      console.error('Category Load Error:', error);
    }
  }

  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory');
    const defaultCategory = savedCategory && this.categories[savedCategory] ? savedCategory : Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
    if (defaultButton) defaultButton.click();
  }

  checkSectionHighlight() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('highlight')) {
       // يمكن إضافة منطق لفتح فئة معينة بناء على الرابط
       const cat = urlParams.get('highlight');
       const btn = this.filterContainer.querySelector(`[data-category="${cat}"]`);
       if(btn) btn.click();
    }
  }

  // --- جلب البيانات ---

  async loadCategory(category) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.showLoadingState();

    try {
      // محاولة الجلب من الكاش أولاً
      const cachedData = this.getCachedData(category);
      if (cachedData) {
        await this.displayProperties(cachedData, category);
      } else {
        const data = await this.fetchCategoryData(category);
        this.setCachedData(category, data);
        await this.displayProperties(data, category);
      }
    } catch (error) {
      this.showErrorMessage();
    } finally {
      this.isLoading = false;
    }
  }

  async fetchCategoryData(category) {
    const indexResponse = await fetch(`/data/properties/${category}/index.json`);
    if (!indexResponse.ok) return [];
    const files = await indexResponse.json();
    if (!Array.isArray(files)) return [];

    const promises = files.map(filename => 
      fetch(`/data/properties/${category}/${filename}`)
        .then(res => res.json())
        .then(data => ({ ...data, filename, category }))
        .catch(() => null)
    );

    const results = await Promise.all(promises);
    return results.filter(p => p !== null);
  }

  // --- العرض والرسم (Rendering) ---

  showLoadingState() {
    this.container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--color-primary);">
        <div class="loading-spinner" style="border: 3px solid #333; border-top-color: var(--color-primary); width: 50px; height: 50px; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
        <p>جاري تحميل العقارات الفاخرة...</p>
      </div>
    `;
  }

  async displayProperties(properties, category) {
    if (!properties || properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // الترتيب
    let sortedProps = [...properties];
    if (this.currentDateFilter === 'latest') {
        sortedProps.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    } else {
        sortedProps.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    }

    this.container.innerHTML = '';
    
    // رسم البطاقات
    for (const property of sortedProps) {
      const card = this.createPropertyCard(property, category);
      this.container.appendChild(card);
      // تأثير ظهور متتابع
      await this.delay(30); 
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }
  }

  // 💎💎 دالة إنشاء البطاقة النصية (الجوهرة) 💎💎
  createPropertyCard(property, category) {
    const card = document.createElement("div");
    // استخدام كلاسات CSS الجديدة + كلاس لتمييز الوضع النصي
    card.className = "property-card text-mode"; 
    
    // إضافة حد علوي ذهبي لتعويض غياب الصورة
    card.style.borderTop = "4px solid var(--color-primary)";
    
    // أنيميشن مبدئي
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.4s ease";

    card.onclick = () => window.location.href = `/property/${property.filename.replace('.json', '')}`;
    
    // البيانات
    const title = property.title || "عقار مميز";
    const price = property.price_display || property.price || "اتصل للسعر";
    const location = property.location || "مدينة نصر";
    const timeAgo = this.getTimeAgo(property.date);
    const desc = property.description ? property.description.substring(0, 100) + '...' : 'تواصل معنا لمعرفة التفاصيل الكاملة لهذا العقار المميز...';

    card.innerHTML = `
      <!-- رأس البطاقة -->
      <div class="property-header" style="display: block; padding-bottom: 10px; margin-bottom: 15px; border-bottom: 1px dashed #333;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="background: rgba(212, 175, 55, 0.1); color: var(--color-primary); padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; border: 1px solid var(--color-primary);">
                <i class="fas fa-clock"></i> ${timeAgo}
            </div>
            <div style="color: #888; font-size: 0.85rem;">
               <i class="fas fa-map-marker-alt"></i> ${location}
            </div>
        </div>
        
        <h3 class="property-title" style="font-size: 1.25rem; margin: 5px 0; color: #fff;">${title}</h3>
      </div>

      <!-- شبكة المواصفات (Grid Layout) -->
      <div class="property-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
        
        <!-- السعر (مميز) -->
        <div class="property-detail" style="grid-column: 1 / -1; background: linear-gradient(90deg, rgba(212,175,55,0.15), transparent); border: none; border-right: 3px solid var(--color-primary);">
          <span class="detail-icon"><i class="fas fa-tag"></i></span>
          <span class="detail-label">السعر:</span>
          <span class="detail-value" style="color: var(--color-primary); font-size: 1.1rem;">${price}</span>
        </div>
        
        ${property.area ? `
        <div class="property-detail">
          <span class="detail-icon"><i class="fas fa-ruler-combined"></i></span>
          <span class="detail-label">المساحة:</span>
          <span class="detail-value">${property.area}</span>
        </div>` : ''}
        
        ${property.rooms ? `
        <div class="property-detail">
          <span class="detail-icon"><i class="fas fa-bed"></i></span>
          <span class="detail-label">غرف:</span>
          <span class="detail-value">${property.rooms}</span>
        </div>` : ''}

        ${property.floor ? `
        <div class="property-detail">
          <span class="detail-icon"><i class="fas fa-building"></i></span>
          <span class="detail-label">الدور:</span>
          <span class="detail-value">${property.floor}</span>
        </div>` : ''}

        ${property.finish_type ? `
        <div class="property-detail">
          <span class="detail-icon"><i class="fas fa-paint-roller"></i></span>
          <span class="detail-label">تشطيب:</span>
          <span class="detail-value">${property.finish_type}</span>
        </div>` : ''}
      </div>

      <!-- نبذة نصية (مهمة لملء البطاقة) -->
      <div class="property-description" style="font-size: 0.9rem; color: #aaa; margin-bottom: 15px; border: none; background: transparent; padding: 0;">
        ${desc}
      </div>

      <!-- زر الإجراء -->
      <div style="margin-top: auto;">
          <button class="view-details-btn" style="width: 100%; margin: 0; background: transparent; border: 1px solid #444; color: #ccc;">
              عرض كامل التفاصيل <i class="fas fa-arrow-left" style="margin-right: 5px; color: var(--color-primary);"></i>
          </button>
      </div>
    `;

    return card;
  }

  showEmptyState() {
    this.container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #666;">
        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>عفواً، لا توجد عقارات متاحة في هذا القسم حالياً</h3>
        <p>جرب تصفح قسم آخر أو تواصل معنا</p>
      </div>
    `;
  }

  showErrorMessage() {
    this.container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--color-error);">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>حدث خطأ في الاتصال. يرجى تحديث الصفحة.</p>
      </div>
    `;
  }

  // --- أدوات مساعدة ---
  async refreshCurrentCategory() {
    if (this.currentCategory) {
        this.clearCachedData(this.currentCategory);
        await this.loadCategory(this.currentCategory);
    }
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  getTimeAgo(dateString) {
    if (!dateString) return 'جديد';
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 30) return `منذ ${days} أيام`;
    return `منذ شهر`;
  }

  // كاش بسيط
  getCachedData(cat) {
    const c = this.propertiesCache.get(cat);
    return (c && Date.now() - c.ts < this.config.cacheExpiry) ? c.data : null;
  }
  setCachedData(cat, data) {
    this.propertiesCache.set(cat, { data, ts: Date.now() });
  }
  clearCachedData(cat) { this.propertiesCache.delete(cat); }
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
    window.propertyDisplay = new EnhancedPropertyDisplay();
});

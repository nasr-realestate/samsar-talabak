/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (النسخة الذهبية الفاخرة v4.0)
 * متوافق مع تصميم Gold & Black الجديد
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
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.isHighlightedSection = false;
    
    this.config = {
      animationDuration: 300,
      cacheExpiry: 5 * 60 * 1000,
      loadingDelay: 500, // تقليل وقت التحميل الوهمي لتجربة أسرع
      welcomeDisplayTime: 7000,
      maxRetries: 3,
      retryDelay: 1000
    };

    // تحديث الألوان للذهبي والفئات
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
      this.setupEventListeners();
      this.setupTouchEvents();
      this.createFilterButtons();
      this.createDateFilter();
      this.checkSectionHighlight();
      this.loadDefaultCategory();
    } catch (error) {
      console.error('Initialization Error:', error);
    }
  }

  checkSectionHighlight() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'properties') {
      this.isHighlightedSection = true;
      const pageTitle = document.querySelector('h1.page-title');
      if (pageTitle) pageTitle.classList.add('highlighted-section');
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
    this.container.classList.add('properties-grid'); // استخدام كلاس الشبكة الجديد
  }

  setupEventListeners() {
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
    // إزالة السكرول إيفنت للفلتر لأنه أصبح ثابتاً بالتصميم الجديد
  }

  setupTouchEvents() {
    if(!this.container) return;
    this.container.addEventListener('touchstart', (e) => { this.touchStartY = e.touches[0].clientY; }, { passive: true });
    this.container.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
      if (this.touchStartY - this.touchEndY > 100) window.scrollBy({ top: 100, behavior: 'smooth' });
    }, { passive: true });
  }

  createFilterButtons() {
    this.filterContainer.innerHTML = ''; // تنظيف
    Object.entries(this.categories).forEach(([key, category], index) => {
      const button = document.createElement("button");
      button.innerHTML = `<i class="fas ${category.icon}"></i> ${category.label}`;
      button.dataset.category = key;
      button.className = "filter-btn"; // الكلاس الجديد من CSS
      button.title = category.description;
      
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCategoryChange(key, button);
      });
      this.filterContainer.appendChild(button);
    });
  }

  createDateFilter() {
    // تم إلغاء فلتر التاريخ المعقد واستبداله بفرز تلقائي للأحدث للحفاظ على بساطة التصميم
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    
    // تحديث الأزرار النشطة
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

  async loadCategory(category) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.showLoadingState();

    try {
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
    // جلب ملف الفهرس
    const indexResponse = await fetch(`/data/properties/${category}/index.json`);
    if (!indexResponse.ok) return [];
    const files = await indexResponse.json();
    if (!Array.isArray(files)) return [];

    // جلب تفاصيل كل عقار
    const promises = files.map(filename => 
      fetch(`/data/properties/${category}/${filename}`)
        .then(res => res.json())
        .then(data => ({ ...data, filename, category }))
        .catch(() => null)
    );

    const results = await Promise.all(promises);
    return results.filter(p => p !== null);
  }

  // --- دوال العرض (Rendering) المحدثة ---

  showLoadingState() {
    this.container.innerHTML = `
      <div class="loading-container" style="text-align: center; padding: 3rem; color: var(--color-primary); grid-column: 1/-1;">
        <div class="loading-spinner" style="border: 4px solid #333; border-top-color: var(--color-primary); width: 50px; height: 50px; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 1rem;">جاري جلب أفخم العقارات...</p>
      </div>
    `;
  }

  async displayProperties(properties, category) {
    if (!properties || properties.length === 0) {
      this.showEmptyState();
      return;
    }

    // فرز بالأحدث
    const sortedProps = properties.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    this.container.innerHTML = '';
    
    for (const property of sortedProps) {
      const card = this.createPropertyCard(property, category);
      this.container.appendChild(card);
      // تأثير ظهور بسيط
      await this.delay(50);
      card.style.opacity = '1';
    }
  }

  // 💎💎 دالة إنشاء البطاقة الذهبية الجديدة 💎💎
  createPropertyCard(property, category) {
    const card = document.createElement("div");
    card.className = "property-card"; // الكلاس الجديد من CSS
    card.onclick = () => window.location.href = `/property/${property.filename.replace('.json', '')}`;
    
    // القيم الافتراضية
    const title = property.title || "عقار مميز";
    const price = property.price_display || property.price || "السعر عند الاتصال";
    const location = property.location || "مدينة نصر";
    const image = property.image || "https://i.postimg.cc/rmJ8kVmK/صور_شقه_برج_الزهراء_الثانيه.webp"; // صورة افتراضية فاخرة

    // حساب الوقت
    const timeAgo = this.getTimeAgo(property.date);

    card.innerHTML = `
      <!-- صورة العقار -->
      <div style="position: relative;">
        <img src="${image}" alt="${title}" loading="lazy">
        <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: var(--color-primary); padding: 5px 10px; border-radius: 50px; font-size: 0.8rem; border: 1px solid var(--color-primary);">
            <i class="fas fa-clock"></i> ${timeAgo}
        </div>
      </div>

      <!-- محتوى البطاقة -->
      <div class="property-header">
        <div>
          <h3 class="property-title">${title}</h3>
          <p style="color: #888; font-size: 0.9rem; margin-top: 5px;">
             <i class="fas fa-map-marker-alt" style="color: var(--color-primary);"></i> ${location}
          </p>
        </div>
      </div>

      <!-- التفاصيل السريعة -->
      <div class="property-details">
        <div class="property-detail">
          <span class="detail-icon"><i class="fas fa-tag"></i></span>
          <span class="detail-label">السعر:</span>
          <span class="detail-value" style="color: var(--color-primary);">${price}</span>
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
      </div>

      <!-- زر التفاصيل -->
      <button class="view-details-btn">
          عرض التفاصيل الكاملة <i class="fas fa-arrow-left"></i>
      </button>
    `;

    return card;
  }

  showEmptyState() {
    this.container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #666;">
        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>لا توجد عقارات في هذا القسم حالياً</h3>
        <p>نعمل على إضافة عروض جديدة قريباً.</p>
      </div>
    `;
  }

  showErrorMessage() {
    this.container.innerHTML = `
      <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--color-error);">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3>حدث خطأ في تحميل العقارات</h3>
        <button onclick="location.reload()" style="background: transparent; border: 1px solid var(--color-error); color: var(--color-error); padding: 10px 20px; border-radius: 50px; margin-top: 1rem; cursor: pointer;">
          إعادة المحاولة
        </button>
      </div>
    `;
  }

  // --- أدوات مساعدة ---
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  getTimeAgo(dateString) {
    if (!dateString) return 'جديد';
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days/7)} أسابيع`;
    return `منذ ${Math.floor(days/30)} شهر`;
  }

  // إدارة الكاش
  getCachedData(cat) {
    const c = this.propertiesCache.get(cat);
    return (c && Date.now() - c.ts < this.config.cacheExpiry) ? c.data : null;
  }
  setCachedData(cat, data) {
    this.propertiesCache.set(cat, { data, ts: Date.now() });
  }
}

// تشغيل النظام
const propertyDisplay = new EnhancedPropertyDisplay();
window.EnhancedPropertyDisplay = EnhancedPropertyDisplay;

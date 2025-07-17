/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (الإصدار النهائي المستقر)
 * Enhanced Property Display System (Final Stable Version)
 *
 * تحسينات هذا الإصدار:
 * - حل مشكلة التعليق عند "جاري التحميل".
 * - تدفق بيانات أكثر استقرارًا وموثوقية.
 * - معالجة محسّنة للأخطاء وحالات فشل الشبكة.
 */

class EnhancedPropertyDisplay {
  constructor() {
    // ... (نفس الخصائص من الكود السابق)
    this.container = null;
    this.filterContainer = null;
    this.welcomeBox = null;
    this.currentCategory = null;
    this.propertiesCache = new Map();
    this.isLoading = false;
    this.touchStartY = 0;
    this.touchEndY = 0;
    
    this.config = {
      animationDuration: 300,
      cacheExpiry: 5 * 60 * 1000, // 5 دقائق
      loadingDelay: 800,
      welcomeDisplayTime: 7000,
      maxRetries: 3,
      retryDelay: 1000
    };

    this.categories = {
      "apartments": { label: "🏠 شقق للبيع", icon: "🏠", color: "#00ff88", description: "شقق سكنية فاخرة" },
      "apartments-rent": { label: "🏡 شقق للإيجار", icon: "🏡", color: "#00ccff", description: "شقق للإيجار الشهري" },
      "shops": { label: "🏪 محلات تجارية", icon: "🏪", color: "#ff6b35", description: "محلات ومساحات تجارية" },
      "offices": { label: "🏢 مكاتب إدارية", icon: "🏢", color: "#8b5cf6", description: "مكاتب ومساحات عمل" },
      "admin-hq": { label: "🏛️ مقرات إدارية", icon: "🏛️", color: "#f59e0b", description: "مقرات ومباني إدارية" }
    };

    // التأكد من تشغيل التهيئة بعد تحميل DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      this.setupElements();
      this.setupEventListeners();
      this.createFilterButtons();
      this.loadDefaultCategory();
      // ... باقي وظائف التهيئة
    } catch (error) {
      console.error('خطأ فادح في تهيئة التطبيق:', error);
      if (this.container) {
        this.showErrorMessage('حدث خطأ جسيم أثناء تشغيل التطبيق.');
      }
    }
  }

  setupElements() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    if (!this.container || !this.filterContainer) {
      throw new Error('العناصر الأساسية (properties-container, filter-buttons) غير موجودة في الصفحة.');
    }
    // ... (باقي إعدادات العناصر)
  }
  
  setupEventListeners() {
    // ... (نفس مستمعي الأحداث)
  }

  createFilterButtons() {
    this.filterContainer.innerHTML = '';
    Object.entries(this.categories).forEach(([key, category], index) => {
      const button = document.createElement("button");
      button.textContent = category.label;
      button.dataset.category = key;
      button.className = "filter-btn enhanced-filter-btn";
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCategoryChange(key, button);
      });
      this.filterContainer.appendChild(button);
    });
  }

  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory');
    const defaultCategory = savedCategory && this.categories[savedCategory] 
      ? savedCategory 
      : Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
    if (defaultButton) {
      defaultButton.click();
    } else {
        // في حالة عدم وجود الزر، يتم الضغط على أول زر متاح
        const firstButton = this.filterContainer.querySelector('.filter-btn');
        if(firstButton) firstButton.click();
    }
  }

  /**
   * ✅ معالجة تغيير التصنيف (تم الإصلاح)
   */
  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;

    this.isLoading = true;
    this.currentCategory = category;
    this.updateActiveButton(button);
    localStorage.setItem('lastCategory', category);

    try {
      // 1. تحقق من الذاكرة المؤقتة أولاً
      const cachedData = this.getCachedData(category);
      if (cachedData) {
        await this.displayProperties(cachedData, category);
        this.showNotification(`تم عرض ${this.categories[category].label} من الذاكرة`, 'info');
      } else {
        // 2. إذا لم تكن موجودة، اظهر التحميل واجلبها من الشبكة
        this.showLoadingState();
        const data = await this.fetchCategoryData(category);
        this.setCachedData(category, data);
        await this.displayProperties(data, category);
        this.showNotification(`تم تحميل ${this.categories[category].label} بنجاح`, 'success');
      }
    } catch (error) {
      console.error(`فشل تحميل التصنيف ${category}:`, error);
      this.showErrorMessage(`فشل في تحميل بيانات "${this.categories[category].label}"`);
    } finally {
      // 3. تأكد من إيقاف حالة التحميل دائمًا
      this.isLoading = false;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner-enhanced"></div>
        <h3>جاري تحميل العروض المميزة...</h3>
        <p>لحظات من فضلك...</p>
      </div>`;
  }

  async displayProperties(properties, category) {
    // التأكد من أننا ما زلنا في نفس التصنيف المطلوب
    if (category !== this.currentCategory) return;

    if (!Array.isArray(properties)) {
      this.showErrorMessage('تم استلام بيانات غير صالحة.');
      return;
    }

    if (properties.length === 0) {
      this.showEmptyState(category);
      return;
    }

    this.container.innerHTML = '';
    properties.forEach((property, index) => {
      const card = this.createPropertyCard(property, category, index);
      this.container.appendChild(card);
      // استخدام requestAnimationFrame لضمان ظهور التأثيرات
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  }
  
  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = "property-card enhanced-property-card";
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.4s ease ${index * 50}ms`;

    // تبسيط HTML لتجنب الأخطاء
    card.innerHTML = `
        <div class="property-header" style="background-color: ${categoryInfo.color}; color: #000;">
            <strong>${this.escapeHtml(categoryInfo.label)}</strong>
        </div>
        <div class="property-content">
            <h2 class="property-title">${this.escapeHtml(property.title)}</h2>
            <p><strong>السعر:</strong> ${this.escapeHtml(property.price)}</p>
            <p><strong>المساحة:</strong> ${this.escapeHtml(property.area)}</p>
            <p>${this.escapeHtml(property.description)}</p>
        </div>
    `;
    return card;
  }

  showEmptyState(category) {
    const categoryInfo = this.categories[category];
    this.container.innerHTML = `
      <div class="empty-state">
        <h3>لا توجد عروض حالياً</h3>
        <p>لم يتم العثور على عقارات في فئة "${categoryInfo.label}"</p>
      </div>`;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `
      <div class="error-state">
        <h3>⚠️ حدث خطأ</h3>
        <p>${this.escapeHtml(message)}</p>
        <button class="retry-btn" onclick="window.propertyDisplay.refreshCurrentCategory()">إعادة المحاولة</button>
      </div>`;
  }
  
  async refreshCurrentCategory() {
      if (!this.currentCategory) return;
      // مسح الذاكرة المؤقتة للتصنيف الحالي وإعادة تحميله
      this.clearCachedData(this.currentCategory);
      const currentButton = this.filterContainer.querySelector(`[data-category="${this.currentCategory}"]`);
      // إعادة تعيين التصنيف الحالي لإجباره على التحديث
      const categoryToReload = this.currentCategory;
      this.currentCategory = null; 
      this.handleCategoryChange(categoryToReload, currentButton);
  }

  // ... (باقي الدوال المساعدة مثل fetch, cache, escapeHtml, etc.)
  // --- الدوال التالية هي نسخ مبسطة، يمكنك استخدام الدوال الكاملة من الكود السابق ---

  async fetchCategoryData(category) {
    // تأكد من أن المسار صحيح. هذا مثال فقط.
    const indexPath = `/samsar-talabak/data/properties/${category}/index.json`;
    console.log(`جلب الفهرس من: ${indexPath}`);
    const indexResponse = await fetch(indexPath);
    if (!indexResponse.ok) {
      throw new Error(`فشل في جلب الفهرس: ${indexResponse.statusText}`);
    }
    const files = await indexResponse.json();
    if (!Array.isArray(files)) return [];

    const propertyPromises = files.map(async (filename) => {
      const propPath = `/samsar-talabak/data/properties/${category}/${filename}`;
      try {
        const propResponse = await fetch(propPath);
        if (!propResponse.ok) return null;
        const data = await propResponse.json();
        return { ...data, filename, category };
      } catch {
        return null;
      }
    });
    
    const results = await Promise.all(propertyPromises);
    return results.filter(p => p !== null);
  }

  getCachedData(category) {
    const cached = this.propertiesCache.get(category);
    if (!cached || (Date.now() - cached.timestamp > this.config.cacheExpiry)) {
      return null;
    }
    return cached.data;
  }

  setCachedData(category, data) {
    this.propertiesCache.set(category, { data, timestamp: Date.now() });
  }
  
  clearCachedData(category) {
      if(category) {
          this.propertiesCache.delete(category);
      } else {
          this.propertiesCache.clear();
      }
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showNotification(message, type = 'info') {
      // يمكنك إضافة كود الإشعارات الكامل هنا
      console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// === تشغيل التطبيق ===
// جعل النسخة متاحة عالميًا ليسهل الوصول إليها من زر إعادة المحاولة
window.propertyDisplay = new EnhancedPropertyDisplay();

// --- الأنماط الأساسية لضمان عمل العرض ---
const essentialStyles = `
  <style>
    .loading-container, .empty-state, .error-state {
      text-align: center; padding: 40px; color: #888;
    }
    .loading-spinner-enhanced {
      width: 50px; height: 50px; border: 5px solid #f3f3f3;
      border-top: 5px solid #00ff88; border-radius: 50%;
      animation: spin 1s linear infinite; margin: 20px auto;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .filter-btn { cursor: pointer; padding: 10px 15px; margin: 5px; border: 1px solid #ccc; border-radius: 20px; background: #f9f9f9; }
    .filter-btn.active { background: #00ff88; color: #000; border-color: #00ff88; font-weight: bold; }
    .property-card { background: #fff; border: 1px solid #eee; border-radius: 8px; margin: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .property-header { padding: 10px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px; }
    .property-content { padding: 15px; }
    .property-title { margin-top: 0; }
    .retry-btn { background: #ffc107; color: #000; padding: 10px 20px; border-radius: 20px; border: none; cursor: pointer; }
  </style>
`;
document.head.insertAdjacentHTML('beforeend', essentialStyles);

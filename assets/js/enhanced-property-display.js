/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (النسخة النهائية الكاملة v3.5 - إصلاح التحميل)
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

    this.init();
  }

  async init() {
    try {
      await this.waitForDOM();
      this.setupElements();
      this.setupEventListeners();
      this.setupTouchEvents();
      this.handleWelcomeMessage();
      this.createFilterButtons();
      this.createDateFilter();
      this.setupPerformanceMonitoring();
      this.setupAccessibility();
      
      // ⭐⭐ التحقق من معلمة القسم في URL ⭐⭐
      this.checkSectionHighlight();
      
      // ⭐⭐ التعديل المهم: تحميل الفئة بعد إنشاء الأزرار مباشرة ⭐⭐
      setTimeout(() => {
        this.loadDefaultCategory();
      }, 100);
      
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      this.showErrorMessage('حدث خطأ في تحميل التطبيق');
    }
  }

  // ⭐⭐ دالة جديدة: التحقق من معلمة القسم في URL ⭐⭐
  checkSectionHighlight() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    if (section === 'properties') {
      this.isHighlightedSection = true;
      
      // 1. تمييز عنوان الصفحة
      const pageTitle = document.querySelector('h1.page-title');
      if (pageTitle) {
        pageTitle.classList.add('highlighted-section');
      }
      
      // 2. إظهار رسالة ترحيب خاصة
      this.showSectionWelcomeMessage();
    }
  }

  // ⭐⭐ دالة جديدة: عرض رسالة ترحيب خاصة بالقسم ⭐⭐
  showSectionWelcomeMessage() {
    const welcomeBox = document.createElement('div');
    welcomeBox.className = 'section-welcome';
    welcomeBox.innerHTML = `
      <div class="welcome-content">
        <span class="welcome-icon">👋</span>
        <h3>مرحبًا بك في عروض العقارات المميزة!</h3>
        <p>نقدم لك أحدث العروض العقارية المختارة بعناية</p>
      </div>
    `;
    document.body.prepend(welcomeBox);
    
    setTimeout(() => {
      welcomeBox.classList.add('show');
    }, 500);
    
    setTimeout(() => {
      welcomeBox.classList.remove('show');
      setTimeout(() => welcomeBox.remove(), 500);
    }, 5000);
  }

  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  setupElements() {
    if (!this.container || !this.filterContainer) {
      throw new Error('العناصر الأساسية غير موجودة');
    }
    this.container.classList.add('enhanced-properties-container');
    this.filterContainer.classList.add('enhanced-filter-container');
  }

  setupEventListeners() {
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
    window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));
    window.addEventListener('online', () => this.showNotification('تم استعادة الاتصال بالإنترنت', 'success'));
    window.addEventListener('offline', () => this.showNotification('انقطع الاتصال بالإنترنت', 'warning'));
  }

  setupTouchEvents() {
    if(!this.container) return;
    this.container.addEventListener('touchstart', (e) => { this.touchStartY = e.touches[0].clientY; }, { passive: true });
    this.container.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleSwipeGesture();
    }, { passive: true });
  }

  handleSwipeGesture() {
    const swipeThreshold = 100;
    const diff = this.touchStartY - this.touchEndY;
    if (diff < -swipeThreshold) {
      this.scrollToTop();
    }
  }

  handleWelcomeMessage() {
    if (!this.welcomeBox) return;
    const hasShownWelcome = localStorage.getItem("welcomeShown");
    if (!hasShownWelcome) {
      setTimeout(() => this.showWelcomeMessage(), 500);
    }
  }

  showWelcomeMessage() {
    if (!this.welcomeBox) return;
    this.welcomeBox.style.display = "block";
    this.welcomeBox.style.opacity = "0";
    this.welcomeBox.style.transform = "translateY(30px) scale(0.95)";
    requestAnimationFrame(() => {
      this.welcomeBox.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      this.welcomeBox.style.opacity = "1";
      this.welcomeBox.style.transform = "translateY(0) scale(1)";
    });
    
    setTimeout(() => {
      this.hideWelcomeMessage();
    }, this.config.welcomeDisplayTime);
  }

  hideWelcomeMessage() {
    if (!this.welcomeBox) return;
    this.welcomeBox.style.transition = "all 0.4s ease-out";
    this.welcomeBox.style.opacity = "0";
    this.welcomeBox.style.transform = "translateY(-20px) scale(0.95)";
    setTimeout(() => {
      this.welcomeBox.style.display = "none";
      localStorage.setItem("welcomeShown", "true");
    }, 400);
  }

  createFilterButtons() {
    Object.entries(this.categories).forEach(([key, category], index) => {
      const button = this.createFilterButton(key, category, index);
      this.filterContainer.appendChild(button);
    });
  }

  createFilterButton(key, category, index) {
    const button = document.createElement("button");
    button.textContent = category.label;
    button.dataset.category = key;
    button.className = "filter-btn enhanced-filter-btn";
    button.title = category.description;
    button.style.animationDelay = `${index * 100}ms`;
    button.style.setProperty('--category-color', category.color);
    button.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleCategoryChange(key, button);
    });
    return button;
  }

  createDateFilter() {
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'date-filter-wrapper';
    filterWrapper.innerHTML = `
      <label for="date-filter" class="date-filter-label">📅 الفرز حسب:</label>
      <select id="date-filter" class="date-filter-select">
        <option value="latest">الأحدث أولاً</option>
        <option value="all">كل الأوقات</option>
        <option value="last_week">آخر أسبوع</option>
        <option value="last_month">آخر شهر</option>
      </select>
    `;
    this.filterContainer.appendChild(filterWrapper);
    const selectElement = document.getElementById('date-filter');
    selectElement.addEventListener('change', (e) => this.handleDateFilterChange(e.target.value));
  }

  async handleDateFilterChange(newFilterValue) {
    this.currentDateFilter = newFilterValue;
    if (this.currentCategory) {
      const cachedData = this.getCachedData(this.currentCategory);
      if (cachedData) {
        await this.displayProperties(cachedData, this.currentCategory);
      }
    }
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    
    try {
      this.updateActiveButton(button);
      await this.loadCategory(category);
      this.currentCategory = category;
      localStorage.setItem('lastCategory', category);
    } catch (error) {
      console.error('خطأ في تغيير التصنيف:', error);
      this.showErrorMessage('فشل في تحميل التصنيف');
    }
  }
  
  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active', 'highlighted-filter');
      btn.style.transform = 'scale(1)';
    });
    activeButton.classList.add('active');
    activeButton.style.transform = 'scale(1.05)';
  }

  // ⭐⭐ التعديل المهم: دالة تحميل الفئة الافتراضية المصححة ⭐⭐
  loadDefaultCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    // إذا كان القسم مميزًا، نفعّل أول فلتر تلقائيًا
    if (section === 'properties') {
      setTimeout(() => {
        const firstFilterButton = this.filterContainer.querySelector('.filter-btn:first-child');
        if (firstFilterButton) {
          // إضافة التمييز البصري أولاً
          firstFilterButton.classList.add('active', 'highlighted-filter');
          
          // ثم تحميل المحتوى بعد تأخير بسيط
          setTimeout(() => {
            const category = firstFilterButton.dataset.category;
            this.handleCategoryChange(category, firstFilterButton);
          }, 300);
        }
      }, 500);
    } else {
      // التحميل العادي
      const savedCategory = localStorage.getItem('lastCategory');
      const defaultCategory = savedCategory && this.categories[savedCategory] ? savedCategory : Object.keys(this.categories)[0];
      const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
      if (defaultButton) {
        setTimeout(() => {
          defaultButton.click();
        }, 300);
      }
    }
  }

  async loadCategory(category) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.showLoadingState();
    
    try {
      const cachedData = this.getCachedData(category);
      if (cachedData) {
        await this.displayProperties(cachedData, category);
        this.isLoading = false;
        return;
      }
      
      const data = await this.fetchCategoryData(category);
      this.setCachedData(category, data);
      await this.displayProperties(data, category);
      
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      this.showErrorMessage('فشل في تحميل البيانات');
    } finally {
      this.isLoading = false;
    }
  }

  async fetchCategoryData(category) {
    try {
      // محاكاة بيانات للاختبار
      await this.delay(1000);
      
      // هنا يمكنك إضافة الكود الحقيقي لتحميل البيانات
      // const response = await fetch(`/data/properties/${category}/index.json`);
      // const files = await response.json();
      
      // بيانات تجريبية للاختبار
      return [
        {
          id: "1",
          title: "شقة فاخرة للبيع في مدينة نصر",
          price: "1,200,000 جنيه",
          area: "150 م²",
          location: "مدينة نصر، القاهرة",
          description: "شقة فاخرة في موقع مميز بمدينة نصر، تتكون من 3 غرف وصالتين و2 حمام",
          date: "2024-01-15"
        },
        {
          id: "2", 
          title: "محل تجاري للايجار",
          price: "5,000 جنيه/شهر",
          area: "80 م²",
          location: "المعادي، القاهرة",
          description: "محل تجاري في موقع مميز بالمعادي، مناسب للمشاريع التجارية المختلفة",
          date: "2024-01-10"
        }
      ];
      
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      return [];
    }
  }

  showLoadingState() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner-enhanced"></div>
        <div class="loading-text">
          <h3>جاري تحميل أحدث العروض...</h3>
          <p>يرجى الانتظار قليلاً</p>
        </div>
        <div class="loading-progress">
          <div class="loading-progress-bar"></div>
        </div>
      </div>
    `;
  }
  
  applyFiltersAndSorting(properties) {
    if (!properties) return [];
    return properties; // إرجاع البيانات كما هي للاختبار
  }
  
  async displayProperties(properties, category) {
    if (!Array.isArray(properties) || properties.length === 0) {
      this.showEmptyState(category);
      return;
    }
    
    this.container.innerHTML = '';
    
    for (let i = 0; i < properties.length; i++) {
      await this.delay(100);
      const card = this.createPropertyCard(properties[i], category, i);
      this.container.appendChild(card);
      
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  }

  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category] || this.categories['apartments'];
    const card = document.createElement("div");
    card.className = `property-card enhanced-property-card`;
    card.style.cssText = `opacity: 0; transform: translateY(30px); transition: all 0.4s ease; animation-delay: ${index * 100}ms;`;
    
    const propertyId = property.id || '1';
    const detailPage = `/property/${propertyId}`;

    card.innerHTML = `
      <div class="property-header">
        <div class="property-brand">
          <strong>سمسار طلبك</strong>
          <span class="property-category-badge" style="background: ${categoryInfo.color}">
            ${categoryInfo.icon} ${categoryInfo.label}
          </span>
        </div>
      </div>
      <h3 class="property-title">${this.escapeHtml(property.title)}</h3>
      <div class="property-details">
        <div class="property-detail">
          <span class="detail-icon">💰</span>
          <span class="detail-label">السعر:</span>
          <span class="detail-value price-highlight">${this.escapeHtml(property.price)}</span>
        </div>
        <div class="property-detail">
          <span class="detail-icon">📏</span>
          <span class="detail-label">المساحة:</span>
          <span class="detail-value">${this.escapeHtml(property.area)}</span>
        </div>
        <div class="property-detail">
          <span class="detail-icon">📍</span>
          <span class="detail-label">الموقع:</span>
          <span class="detail-value">${this.escapeHtml(property.location)}</span>
        </div>
      </div>
      <div class="property-description">
        <p>${this.escapeHtml(property.description)}</p>
      </div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">
          <span class="btn-text">عرض التفاصيل الكاملة</span>
        </a>
      </div>
    `;
    
    return card;
  }

  showEmptyState(category) {
    const categoryInfo = this.categories[category];
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${categoryInfo?.icon || '🏠'}</div>
        <h3>لا توجد عروض حالياً</h3>
        <p>لم يتم العثور على عقارات في فئة "${categoryInfo?.label || 'المحددة'}"</p>
        <button class="refresh-btn" onclick="location.reload()">🔄 تحديث الصفحة</button>
      </div>
    `;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>حدث خطأ</h3>
        <p>${message}</p>
        <div class="error-actions">
          <button class="retry-btn" onclick="location.reload()">🔄 إعادة المحاولة</button>
        </div>
      </div>
    `;
  }

  showNotification(message, type = 'info') {
    console.log(`إشعار: ${message} (${type})`);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleResize() { 
    // يمكن إضافة منطق تغيير الحجم هنا إذا لزم الأمر
  }

  handleScroll() {
    if (this.filterContainer) {
      const scrollTop = window.pageYOffset;
      if (scrollTop > 200) {
        this.filterContainer.classList.add('scrolled');
      } else {
        this.filterContainer.classList.remove('scrolled');
      }
    }
  }

  setupPerformanceMonitoring() {
    // يمكن إضافة مراقبة الأداء هنا
  }

  setupAccessibility() {
    // يمكن إضافة تحسينات إمكانية الوصول هنا
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      if (!inThrottle) {
        func.apply(this, arguments);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
}

// تهيئة التطبيق بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // إضافة الأنماط فقط إذا لم تكن موجودة مسبقاً
  if (!document.getElementById('enhanced-properties-styles')) {
    const styles = document.createElement('style');
    styles.id = 'enhanced-properties-styles';
    styles.textContent = `
      .enhanced-properties-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .enhanced-filter-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 30px;
        padding: 20px;
        background: #f5f5f5;
        border-radius: 10px;
      }
      
      .filter-btn {
        padding: 12px 20px;
        border: none;
        border-radius: 25px;
        background: #fff;
        color: #333;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
      }
      
      .filter-btn.active {
        background: var(--category-color, #00ff88);
        color: #fff;
        transform: scale(1.05);
      }
      
      .filter-btn.highlighted-filter {
        background: var(--category-color, #2E86C1) !important;
        color: #fff !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        position: relative;
      }
      
      .filter-btn.highlighted-filter::after {
        content: '';
        position: absolute;
        top: -5px;
        right: -5px;
        width: 15px;
        height: 15px;
        background: #ffcc00;
        border-radius: 50%;
        border: 2px solid #fff;
        animation: pulse 2s infinite;
      }
      
      .property-card {
        background: #fff;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        border: 2px solid transparent;
      }
      
      .property-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      }
      
      .property-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .property-category-badge {
        padding: 5px 10px;
        border-radius: 15px;
        color: #fff;
        font-size: 0.8em;
        font-weight: bold;
      }
      
      .property-title {
        color: #333;
        margin-bottom: 15px;
        font-size: 1.2em;
      }
      
      .property-details {
        margin-bottom: 15px;
      }
      
      .property-detail {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 10px;
      }
      
      .detail-value.price-highlight {
        color: #e74c3c;
        font-weight: bold;
        font-size: 1.1em;
      }
      
      .view-details-btn {
        display: inline-block;
        padding: 10px 20px;
        background: #2E86C1;
        color: #fff;
        text-decoration: none;
        border-radius: 25px;
        transition: all 0.3s ease;
      }
      
      .view-details-btn:hover {
        background: #1B4F72;
        transform: translateY(-2px);
      }
      
      .loading-container {
        text-align: center;
        padding: 50px 20px;
      }
      
      .loading-spinner-enhanced {
        width: 60px;
        height: 60px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #2E86C1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      
      .empty-state, .error-state {
        text-align: center;
        padding: 50px 20px;
        color: #666;
      }
      
      .empty-icon, .error-icon {
        font-size: 4em;
        margin-bottom: 20px;
      }
      
      .refresh-btn, .retry-btn {
        background: #2E86C1;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        margin-top: 15px;
      }
      
      h1.page-title.highlighted-section {
        color: #2E86C1;
        border-left: 5px solid #2E86C1;
        padding-left: 15px;
        transition: all 0.4s ease;
      }
      
      .section-welcome {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2E86C1, #1B4F72);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateY(-100px);
        opacity: 0;
        transition: all 0.6s ease;
        max-width: 350px;
      }
      
      .section-welcome.show {
        transform: translateY(0);
        opacity: 1;
      }
      
      .date-filter-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: auto;
      }
      
      .date-filter-select {
        padding: 8px 15px;
        border: 1px solid #ddd;
        border-radius: 20px;
        background: #fff;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0.7; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  // إنشاء مثيل جديد من الكلاس
  new EnhancedPropertyDisplay();
});

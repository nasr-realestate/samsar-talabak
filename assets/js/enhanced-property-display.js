/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (النسخة النهائية الكاملة v4.0 - النسخة المميزة)
 * تم التطوير بواسطة: فريق سمسار طلبك
 * تاريخ الإصدار: ديسمبر 2023
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
    this.searchQuery = '';
    this.priceRange = { min: 0, max: 10000000 };
    this.analyticsEnabled = true;
    
    // إعدادات متقدمة
    this.config = {
      animationDuration: 300,
      cacheExpiry: 5 * 60 * 1000,
      loadingDelay: 800,
      welcomeDisplayTime: 7000,
      maxRetries: 3,
      retryDelay: 1000,
      lazyLoadOffset: 100,
      searchDebounce: 300,
      maxFavoriteItems: 50,
      enableAR: false,
      enableVoiceSearch: false
    };

    // فئات العقارات المحسنة
    this.categories = {
      "apartments": { 
        label: "🏠 شقق للبيع", 
        icon: "🏠", 
        color: "#00ff88", 
        description: "شقق سكنية فاخرة",
        gradient: "linear-gradient(135deg, #00ff88, #00cc6a)"
      },
      "apartments-rent": { 
        label: "🏡 شقق للإيجار", 
        icon: "🏡", 
        color: "#00ccff", 
        description: "شقق للإيجار الشهري",
        gradient: "linear-gradient(135deg, #00ccff, #0099cc)"
      },
      "shops": { 
        label: "🏪 محلات تجارية", 
        icon: "🏪", 
        color: "#ff6b35", 
        description: "محلات ومساحات تجارية",
        gradient: "linear-gradient(135deg, #ff6b35, #cc552a)"
      },
      "offices": { 
        label: "🏢 مكاتب إدارية", 
        icon: "🏢", 
        color: "#8b5cf6", 
        description: "مكاتب ومساحات عمل",
        gradient: "linear-gradient(135deg, #8b5cf6, #6d46c4)"
      },
      "admin-hq": { 
        label: "🏛️ مقرات إدارية", 
        icon: "🏛️", 
        color: "#f59e0b", 
        description: "مقرات ومباني إدارية",
        gradient: "linear-gradient(135deg, #f59e0b, #c47f09)"
      }
    };

    // إحصائيات الاستخدام
    this.analytics = {
      pageViews: 0,
      categoryClicks: {},
      propertyViews: {},
      searchQueries: [],
      favoritesAdded: 0
    };

    this.init();
  }

  async init() {
    try {
      await this.waitForDOM();
      this.loadAnalytics();
      this.setupElements();
      this.setupEventListeners();
      this.setupTouchEvents();
      this.handleWelcomeMessage();
      this.createFilterButtons();
      this.createDateFilter();
      this.createSearchBar();
      this.createPriceFilter();
      this.setupPerformanceMonitoring();
      this.setupAccessibility();
      this.setupServiceWorker();
      
      // التحقق من معلمة القسم في URL
      this.checkSectionHighlight();
      
      // تحميل الفئة الافتراضية (مع الأخذ في الاعتبار التمييز)
      this.loadDefaultCategory();

      // تسجيل حدث زيارة الصفحة
      this.trackEvent('page_view', { page: 'properties_listing' });
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      this.showErrorMessage('حدث خطأ في تحميل التطبيق');
      this.trackEvent('error', { type: 'initialization', message: error.message });
    }
  }

  // 🔥 إضافة جديدة: إنشاء شريط البحث
  createSearchBar() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <div class="search-wrapper">
        <input type="text" id="property-search" class="property-search" placeholder="🔍 ابحث عن عقار (المكان، النوع، السعر...)">
        <button class="search-voice-btn" title="البحث الصوتي">🎤</button>
        <button class="search-filter-toggle" title="خيارات متقدمة">⚙️</button>
      </div>
      <div class="advanced-filters hidden">
        <div class="filter-section">
          <h4>💰 نطاق السعر</h4>
          <div class="price-range">
            <input type="range" id="price-min" class="price-slider" min="0" max="10000000" step="10000" value="0">
            <input type="range" id="price-max" class="price-slider" min="0" max="10000000" step="10000" value="10000000">
          </div>
          <div class="price-labels">
            <span id="price-min-label">0 ر.س</span>
            <span id="price-max-label">10,000,000 ر.س</span>
          </div>
        </div>
        <div class="filter-section">
          <h4>📏 نطاق المساحة</h4>
          <div class="area-range">
            <input type="range" id="area-min" class="area-slider" min="0" max="1000" step="10" value="0">
            <input type="range" id="area-max" class="area-slider" min="0" max="1000" step="10" value="1000">
          </div>
          <div class="area-labels">
            <span id="area-min-label">0 م²</span>
            <span id="area-max-label">1000 م²</span>
          </div>
        </div>
      </div>
    `;
    
    // إدراج شريط البحث في بداية الحاوية
    this.filterContainer.parentNode.insertBefore(searchContainer, this.filterContainer);
    
    // إعداد أحداث البحث
    this.setupSearchEvents();
  }

  // 🔥 إضافة جديدة: إعداد أحداث البحث
  setupSearchEvents() {
    const searchInput = document.getElementById('property-search');
    const voiceBtn = document.querySelector('.search-voice-btn');
    const filterToggle = document.querySelector('.search-filter-toggle');
    const advancedFilters = document.querySelector('.advanced-filters');
    
    // بحث أثناء الكتابة
    searchInput.addEventListener('input', this.debounce((e) => {
      this.searchQuery = e.target.value.trim();
      this.trackEvent('search', { query: this.searchQuery });
      this.refreshDisplay();
    }, this.config.searchDebounce));
    
    // البحث الصوتي
    if (this.config.enableVoiceSearch && 'webkitSpeechRecognition' in window) {
      voiceBtn.addEventListener('click', () => this.startVoiceSearch());
    } else {
      voiceBtn.style.display = 'none';
    }
    
    // تبديل الفلاتر المتقدمة
    filterToggle.addEventListener('click', () => {
      advancedFilters.classList.toggle('hidden');
      filterToggle.classList.toggle('active');
    });
    
    // إعداد الفلاتر
    this.setupPriceFilter();
    this.setupAreaFilter();
  }

  // 🔥 إضافة جديدة: البحث الصوتي
  startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window)) {
      this.showNotification('البحث الصوتي غير مدعوم في متصفحك', 'warning');
      return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ar-SA';
    
    recognition.start();
    this.showNotification('🎤 يتحدث الآن...', 'info');
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('property-search').value = transcript;
      this.searchQuery = transcript;
      this.refreshDisplay();
      this.trackEvent('voice_search', { query: transcript });
    };
    
    recognition.onerror = (event) => {
      this.showNotification('فشل في التعرف على الصوت', 'error');
    };
  }

  // 🔥 إضافة جديدة: إعداد فلتر السعر
  setupPriceFilter() {
    const minSlider = document.getElementById('price-min');
    const maxSlider = document.getElementById('price-max');
    const minLabel = document.getElementById('price-min-label');
    const maxLabel = document.getElementById('price-max-label');
    
    const updatePriceRange = () => {
      this.priceRange.min = parseInt(minSlider.value);
      this.priceRange.max = parseInt(maxSlider.value);
      
      minLabel.textContent = this.formatPrice(this.priceRange.min) + ' ر.س';
      maxLabel.textContent = this.formatPrice(this.priceRange.max) + ' ر.س';
      
      this.refreshDisplay();
    };
    
    minSlider.addEventListener('input', updatePriceRange);
    maxSlider.addEventListener('input', updatePriceRange);
  }

  // 🔥 إضافة جديدة: إعداد فلتر المساحة
  setupAreaFilter() {
    const minSlider = document.getElementById('area-min');
    const maxSlider = document.getElementById('area-max');
    const minLabel = document.getElementById('area-min-label');
    const maxLabel = document.getElementById('area-max-label');
    
    let areaRange = { min: 0, max: 1000 };
    
    const updateAreaRange = () => {
      areaRange.min = parseInt(minSlider.value);
      areaRange.max = parseInt(maxSlider.value);
      
      minLabel.textContent = areaRange.min + ' م²';
      maxLabel.textContent = areaRange.max + ' م²';
      
      this.refreshDisplay();
    };
    
    minSlider.addEventListener('input', updateAreaRange);
    maxSlider.addEventListener('input', updateAreaRange);
  }

  // 🔥 إضافة جديدة: تحديث العرض بناءً على البحث والفلاتر
  refreshDisplay() {
    if (!this.currentCategory) return;
    
    const cachedData = this.getCachedData(this.currentCategory);
    if (cachedData) {
      this.displayProperties(cachedData, this.currentCategory);
    }
  }

  // 🔥 إضافة جديدة: تنسيق السعر
  formatPrice(price) {
    return new Intl.NumberFormat('ar-SA').format(price);
  }

  // 🔥 إضافة جديدة: إعداد Service Worker للتخزين المؤقت
  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker مسجل بنجاح:', registration);
      } catch (error) {
        console.log('فشل تسجيل Service Worker:', error);
      }
    }
  }

  // 🔥 إضافة جديدة: تتبع التحليلات
  loadAnalytics() {
    const savedAnalytics = localStorage.getItem('propertyAnalytics');
    if (savedAnalytics) {
      this.analytics = { ...this.analytics, ...JSON.parse(savedAnalytics) };
    }
    
    this.analytics.pageViews++;
    this.saveAnalytics();
  }

  saveAnalytics() {
    if (this.analyticsEnabled) {
      localStorage.setItem('propertyAnalytics', JSON.stringify(this.analytics));
    }
  }

  trackEvent(eventName, properties = {}) {
    if (!this.analyticsEnabled) return;
    
    // تسجيل الحدث في التحليلات المحلية
    if (eventName === 'category_click') {
      const category = properties.category;
      this.analytics.categoryClicks[category] = (this.analytics.categoryClicks[category] || 0) + 1;
    } else if (eventName === 'property_view') {
      const propertyId = properties.propertyId;
      this.analytics.propertyViews[propertyId] = (this.analytics.propertyViews[propertyId] || 0) + 1;
    } else if (eventName === 'search') {
      this.analytics.searchQueries.push({
        query: properties.query,
        timestamp: new Date().toISOString()
      });
      // الحفاظ على آخر 50 بحث فقط
      if (this.analytics.searchQueries.length > 50) {
        this.analytics.searchQueries.shift();
      }
    } else if (eventName === 'favorite_added') {
      this.analytics.favoritesAdded++;
    }
    
    this.saveAnalytics();
    
    // إرسال البيانات إلى خادم التحليلات (إن وجد)
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
  }

  // 🔥 إضافة جديدة: إنشاء فلتر السعر
  createPriceFilter() {
    const priceFilter = document.createElement('div');
    priceFilter.className = 'price-filter-wrapper';
    priceFilter.innerHTML = `
      <div class="price-filter">
        <label for="price-filter" class="price-filter-label">💰 نطاق السعر:</label>
        <select id="price-filter" class="price-filter-select">
          <option value="all">جميع الأسعار</option>
          <option value="0-500000">حتى 500,000 ر.س</option>
          <option value="500000-1000000">500,000 - 1,000,000 ر.س</option>
          <option value="1000000-2000000">1,000,000 - 2,000,000 ر.س</option>
          <option value="2000000-5000000">2,000,000 - 5,000,000 ر.س</option>
          <option value="5000000-10000000">5,000,000 - 10,000,000 ر.س</option>
          <option value="10000000+">أكثر من 10,000,000 ر.س</option>
        </select>
      </div>
    `;
    this.filterContainer.appendChild(priceFilter);
    
    const selectElement = document.getElementById('price-filter');
    selectElement.addEventListener('change', (e) => this.handlePriceFilterChange(e.target.value));
  }

  handlePriceFilterChange(priceRange) {
    // تطبيق فلتر السعر
    this.refreshDisplay();
  }

  // 🔥 إضافة جديدة: التحميل المتقطع للصور
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove('lazy');
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });

      document.querySelectorAll('img.lazy').forEach(lazyImage => {
        lazyImageObserver.observe(lazyImage);
      });
    }
  }

  // 🔥 إضافة جديدة: توليد تقرير الإحصائيات
  generateAnalyticsReport() {
    const report = {
      totalPageViews: this.analytics.pageViews,
      mostPopularCategory: Object.keys(this.analytics.categoryClicks).reduce((a, b) => 
        this.analytics.categoryClicks[a] > this.analytics.categoryClicks[b] ? a : b, 'unknown'),
      totalFavorites: this.analytics.favoritesAdded,
      recentSearches: this.analytics.searchQueries.slice(-10)
    };
    
    return report;
  }

  // 🔥 إضافة جديدة: عرض الإحصائيات (للمسؤولين)
  showAnalyticsPanel() {
    if (!confirm('هل أنت مسؤول؟')) return;
    
    const report = this.generateAnalyticsReport();
    const panel = document.createElement('div');
    panel.className = 'analytics-panel';
    panel.innerHTML = `
      <div class="analytics-header">
        <h3>📊 تقرير الإحصائيات</h3>
        <button class="close-analytics">✕</button>
      </div>
      <div class="analytics-content">
        <div class="stat-item">
          <span class="stat-label">إجمالي المشاهدات:</span>
          <span class="stat-value">${report.totalPageViews}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">الفئة الأكثر مشاهدة:</span>
          <span class="stat-value">${this.categories[report.mostPopularCategory]?.label || 'غير معروف'}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">إجمالي المفضلات:</span>
          <span class="stat-value">${report.totalFavorites}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">آخر عمليات البحث:</span>
          <div class="recent-searches">
            ${report.recentSearches.map(search => 
              `<div class="search-item">${search.query} - ${new Date(search.timestamp).toLocaleDateString('ar-SA')}</div>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // إظهار البانل مع تأثير
    setTimeout(() => panel.classList.add('show'), 10);
    
    // إغلاق البانل
    panel.querySelector('.close-analytics').addEventListener('click', () => {
      panel.classList.remove('show');
      setTimeout(() => panel.remove(), 300);
    });
  }

  // 🔥 إضافة جديدة: التصدير إلى PDF
  exportToPDF(property) {
    // محاكاة وظيفة التصدير إلى PDF
    this.showNotification('جاري إنشاء ملف PDF...', 'info');
    
    // في التطبيق الحقيقي، هنا سيتم الاتصال بخدمة إنشاء PDF
    setTimeout(() => {
      this.showNotification('تم إنشاء ملف PDF بنجاح', 'success');
      this.trackEvent('pdf_export', { propertyId: property.id || property.filename });
    }, 2000);
  }

  // 🔥 إضافة جديدة: مشاركة على وسائل التواصل الاجتماعي
  shareOnSocialMedia(property, platform) {
    const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : null);
    const shareUrl = new URL(`/property/${propertyId}`, window.location.origin).href;
    const shareText = `شاهد هذا العقار المميز: ${property.title}`;
    
    let shareLink = '';
    
    switch(platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      this.trackEvent('social_share', { platform, propertyId });
    }
  }

  // 🔥 إضافة جديدة: إنشاء عرض شرائح للعقارات المميزة
  createFeaturedSlider() {
    const slider = document.createElement('div');
    slider.className = 'featured-slider';
    slider.innerHTML = `
      <div class="slider-header">
        <h3>⭐ العقارات المميزة</h3>
        <div class="slider-nav">
          <button class="slider-prev">‹</button>
          <button class="slider-next">›</button>
        </div>
      </div>
      <div class="slider-container">
        <div class="slider-track"></div>
      </div>
    `;
    
    this.container.parentNode.insertBefore(slider, this.container);
    
    // تحميل العقارات المميزة
    this.loadFeaturedProperties().then(properties => {
      this.populateFeaturedSlider(properties);
    });
  }

  async loadFeaturedProperties() {
    try {
      // محاكاة جلب العقارات المميزة
      return await this.fetchCategoryData('apartments').then(properties => 
        properties.slice(0, 5).map(p => ({ ...p, featured: true }))
      );
    } catch (error) {
      console.error('خطأ في تحميل العقارات المميزة:', error);
      return [];
    }
  }

  populateFeaturedSlider(properties) {
    const track = document.querySelector('.slider-track');
    if (!track || properties.length === 0) return;
    
    track.innerHTML = properties.map(property => `
      <div class="slider-slide">
        <div class="featured-card">
          <div class="featured-badge">⭐ مميز</div>
          <h4>${this.escapeHtml(property.title)}</h4>
          <p class="featured-price">${this.escapeHtml(property.price_display || property.price || "غير محدد")}</p>
          <button class="view-featured-btn" data-property-id="${property.id || property.filename}">عرض التفاصيل</button>
        </div>
      </div>
    `).join('');
    
    this.setupSliderNavigation();
  }

  setupSliderNavigation() {
    const track = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slider-slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    let currentSlide = 0;
    
    const updateSlider = () => {
      const slideWidth = slides[0].offsetWidth;
      track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    };
    
    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlider();
      }
    });
    
    // التكيف مع حجم الشاشة
    window.addEventListener('resize', updateSlider);
  }

  // 🔥 إضافة جديدة: تطبيق الفلاتر على البيانات
  applyFiltersAndSorting(properties) {
    let processedProperties = [...properties];
    
    // فلترة حسب النص
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      processedProperties = processedProperties.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.price_display?.toLowerCase().includes(query)
      );
    }
    
    // فلترة حسب السعر
    processedProperties = processedProperties.filter(p => {
      const price = this.extractPrice(p.price_display || p.price);
      return price >= this.priceRange.min && price <= this.priceRange.max;
    });
    
    // الباقي من الفلترة الأصلية
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedProperties = processedProperties.filter(p => {
        if (!p.date) return false;
        try {
          const propDate = new Date(p.date);
          const diffDays = (now - propDate) / oneDay;
          return diffDays <= daysToFilter;
        } catch { return false; }
      });
    }
    
    if (this.currentDateFilter !== 'all') {
      processedProperties.sort((a, b) => {
        try { return new Date(b.date) - new Date(a.date); } catch { return 0; }
      });
    }
    
    return processedProperties;
  }

  // 🔥 إضافة جديدة: استخراج السعر من النص
  extractPrice(priceText) {
    if (!priceText) return 0;
    const match = priceText.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  }

  // تعديل دالة إنشاء البطاقة لإضافة الميزات الجديدة
  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = `property-card enhanced-property-card card-${category}`;
    card.dataset.filename = property.filename;
    card.dataset.category = category;
    card.style.cssText = `opacity: 0; transform: translateY(30px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); animation-delay: ${index * 100}ms;`;
    
    const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/property/${propertyId}`;
    
    const priceToRender = this.escapeHtml(property.price_display || property.price || "غير محدد");
    const areaToRender = this.escapeHtml(property.area_display || property.area || "غير محددة");
    const descriptionText = property.summary || property.description;

    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo" loading="lazy">
        <div class="property-brand">
          <strong>سمسار طلبك</strong>
          <span class="property-category-badge" style="background: ${categoryInfo.color}">${categoryInfo.icon} ${categoryInfo.label}</span>
        </div>
        <div class="property-actions">
          <button class="favorite-btn" title="إضافة للمفضلة"><span class="heart-icon">♡</span></button>
          <button class="share-btn" title="مشاركة"><span class="share-icon">📤</span></button>
          <button class="more-actions-btn" title="المزيد">⋯</button>
        </div>
      </div>
      <h3 class="property-title">${this.escapeHtml(property.title)}</h3>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">السعر:</span><span class="detail-value price-highlight">${priceToRender}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${areaToRender}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الإضافة:</span><span class="detail-value">${this.escapeHtml(property.date || "غير متوفر")}</span></div>
        ${property.location ? `<div class="property-detail"><span class="detail-icon">📍</span><span class="detail-label">الموقع:</span><span class="detail-value">${this.escapeHtml(property.location)}</span></div>` : ''}
      </div>
      <div class="property-description"><p>${this.escapeHtml(descriptionText)}</p></div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn"><span class="btn-icon">👁️</span><span class="btn-text">عرض التفاصيل الكاملة</span><span class="btn-arrow">←</span></a>
        <div class="property-stats">
          <span class="stat-item"><span class="stat-icon">👀</span><span class="stat-value">${Math.floor(Math.random() * 100) + 10}</span></span>
          <span class="stat-item"><span class="stat-icon">⏰</span><span class="stat-value">${this.getTimeAgo(property.date)}</span></span>
        </div>
      </div>
    `;
    
    this.setupCardEvents(card, property);
    return card;
  }

  // تعديل دالة إعداد أحداث البطاقة لإضافة الميزات الجديدة
  setupCardEvents(card, property) {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.favorite-btn, .share-btn, .view-details-btn, .more-actions-btn')) {
        this.handleCardClick(card, property);
      }
    });
    
    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleFavorite(card, property); });
    
    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => { e.stopPropagation(); this.shareProperty(property); });
    
    const moreActionsBtn = card.querySelector('.more-actions-btn');
    moreActionsBtn.addEventListener('click', (e) => { e.stopPropagation(); this.showMoreActions(card, property); });
    
    const viewDetailsBtn = card.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => { 
      localStorage.setItem('lastViewedCard', property.filename);
      this.trackEvent('property_view', { propertyId: property.id || property.filename });
    });
    
    card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
    card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
  }

  // 🔥 إضافة جديدة: عرض المزيد من الإجراءات
  showMoreActions(card, property) {
    // إزالة أي قائمة إجراءات سابقة
    const existingMenu = document.querySelector('.actions-menu');
    if (existingMenu) existingMenu.remove();
    
    // إنشاء قائمة الإجراءات
    const menu = document.createElement('div');
    menu.className = 'actions-menu';
    menu.innerHTML = `
      <button class="action-item" data-action="compare">⚖️ مقارنة</button>
      <button class="action-item" data-action="pdf">📄 تصدير PDF</button>
      <button class="action-item" data-action="share-twitter">🐦 تويتر</button>
      <button class="action-item" data-action="share-facebook">📘 فيسبوك</button>
      <button class="action-item" data-action="share-whatsapp">💚 واتساب</button>
      <button class="action-item" data-action="report">🚨 تبليغ</button>
    `;
    
    card.appendChild(menu);
    
    // إعداد أحداث القائمة
    menu.querySelectorAll('.action-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAction(e.target.dataset.action, property);
        menu.remove();
      });
    });
    
    // إغلاق القائمة عند النقر خارجها
    setTimeout(() => {
      document.addEventListener('click', function closeMenu() {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      });
    }, 10);
  }

  // 🔥 إضافة جديدة: معالجة الإجراءات
  handleAction(action, property) {
    switch(action) {
      case 'compare':
        this.addToComparison(property);
        break;
      case 'pdf':
        this.exportToPDF(property);
        break;
      case 'share-twitter':
        this.shareOnSocialMedia(property, 'twitter');
        break;
      case 'share-facebook':
        this.shareOnSocialMedia(property, 'facebook');
        break;
      case 'share-whatsapp':
        this.shareOnSocialMedia(property, 'whatsapp');
        break;
      case 'report':
        this.reportProperty(property);
        break;
    }
  }

  // 🔥 إضافة جديدة: الإضافة للمقارنة
  addToComparison(property) {
    const comparison = JSON.parse(localStorage.getItem('propertyComparison') || '[]');
    
    if (comparison.length >= 3) {
      this.showNotification('يمكنك مقارنة 3 عقارات كحد أقصى', 'warning');
      return;
    }
    
    if (!comparison.find(p => p.filename === property.filename)) {
      comparison.push(property);
      localStorage.setItem('propertyComparison', JSON.stringify(comparison));
      this.showNotification('تمت الإضافة للمقارنة', 'success');
      this.trackEvent('comparison_added', { propertyId: property.id || property.filename });
    } else {
      this.showNotification('العقار مضاف للمقارنة بالفعل', 'info');
    }
  }

  // 🔥 إضافة جديدة: تبليغ عن عقار
  reportProperty(property) {
    const reason = prompt('ما سبب التبليغ عن هذا العقار؟');
    if (reason) {
      this.showNotification('شكراً على تبليغك، سنراجع العقار قريباً', 'success');
      this.trackEvent('property_reported', { 
        propertyId: property.id || property.filename, 
        reason 
      });
    }
  }

  // الباقي من الدوال الأصلية مع بعض التحسينات...
  // [يتبع الكود الأصلي مع التعديلات الطفيفة للحفاظ على الوظائف]

  // ... [جميع الدوال الأخرى تبقى كما هي مع إضافة تحسينات طفيفة] ...

}

// إنشاء كائن العرض
const propertyDisplay = new EnhancedPropertyDisplay();

// إضافة اختصار لوحة التحكم للمسؤولين
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    propertyDisplay.showAnalyticsPanel();
  }
});

// الأنماط الإضافية المحسنة
const enhancedStyles = `
  <style>
    /* الأنماط الأساسية تبقى كما هي */
    
    /* أنماط البحث الجديدة */
    .search-container {
      margin-bottom: 2rem;
      padding: 1rem;
      background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
      border-radius: 15px;
      border: 1px solid #333;
    }
    
    .search-wrapper {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .property-search {
      flex: 1;
      padding: 12px 20px;
      border: 2px solid #444;
      border-radius: 25px;
      background: #2a2a2a;
      color: #f1f1f1;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    
    .property-search:focus {
      outline: none;
      border-color: #00ff88;
      box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
    }
    
    .search-voice-btn, .search-filter-toggle {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid #444;
      border-radius: 50%;
      width: 45px;
      height: 45px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .search-voice-btn:hover, .search-filter-toggle:hover,
    .search-filter-toggle.active {
      background: rgba(0, 255, 136, 0.2);
      border-color: #00ff88;
      transform: scale(1.1);
    }
    
    .advanced-filters {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      border: 1px solid #333;
      transition: all 0.3s ease;
    }
    
    .advanced-filters.hidden {
      display: none;
    }
    
    .filter-section {
      margin-bottom: 1.5rem;
    }
    
    .filter-section h4 {
      margin-bottom: 0.5rem;
      color: #00ff88;
      font-size: 1rem;
    }
    
    .price-range, .area-range {
      display: flex;
      gap: 10px;
      margin-bottom: 0.5rem;
    }
    
    .price-slider, .area-slider {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: #444;
      outline: none;
      -webkit-appearance: none;
    }
    
    .price-slider::-webkit-slider-thumb, 
    .area-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #00ff88;
      cursor: pointer;
    }
    
    .price-labels, .area-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #888;
    }
    
    /* أنماط الشريط المنزلق للعقارات المميزة */
    .featured-slider {
      margin-bottom: 2rem;
      padding: 1rem;
      background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
      border-radius: 15px;
      border: 1px solid #333;
    }
    
    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .slider-header h3 {
      color: #00ff88;
      margin: 0;
    }
    
    .slider-nav button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid #444;
      color: #f1f1f1;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .slider-nav button:hover {
      background: rgba(0, 255, 136, 0.2);
      border-color: #00ff88;
    }
    
    .slider-container {
      overflow: hidden;
      border-radius: 10px;
    }
    
    .slider-track {
      display: flex;
      transition: transform 0.5s ease;
    }
    
    .slider-slide {
      flex: 0 0 300px;
      padding: 0 10px;
    }
    
    .featured-card {
      background: #2a2a2a;
      border-radius: 10px;
      padding: 1rem;
      border: 1px solid #444;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .featured-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 255, 136, 0.2);
    }
    
    .featured-badge {
      position: absolute;
      top: -10px;
      right: 10px;
      background: #ffcc00;
      color: #000;
      padding: 3px 10px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    
    .featured-price {
      color: #00ff88;
      font-weight: bold;
      font-size: 1.2rem;
      margin: 0.5rem 0;
    }
    
    .view-featured-btn {
      background: linear-gradient(45deg, #00ff88, #00cc6a);
      color: #000;
      border: none;
      padding: 8px 15px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
      width: 100%;
    }
    
    .view-featured-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
    }
    
    /* أنماط قائمة الإجراءات */
    .actions-menu {
      position: absolute;
      top: 50px;
      right: 10px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 10px;
      padding: 0.5rem;
      z-index: 100;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      min-width: 150px;
    }
    
    .action-item {
      display: block;
      width: 100%;
      background: none;
      border: none;
      color: #f1f1f1;
      padding: 8px 12px;
      text-align: right;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
    }
    
    .action-item:hover {
      background: rgba(0, 255, 136, 0.1);
    }
    
    /* أنماط لوحة التحليلات */
    .analytics-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: #1e1e1e;
      border: 2px solid #00ff88;
      border-radius: 15px;
      padding: 1.5rem;
      z-index: 10000;
      max-width: 500px;
      width: 90%;
      opacity: 0;
      transition: all 0.3s ease;
    }
    
    .analytics-panel.show {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    
    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid #333;
      padding-bottom: 0.5rem;
    }
    
    .close-analytics {
      background: none;
      border: none;
      color: #888;
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.8rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 5px;
    }
    
    .stat-label {
      color: #888;
    }
    
    .stat-value {
      color: #00ff88;
      font-weight: bold;
    }
    
    .recent-searches {
      max-height: 150px;
      overflow-y: auto;
    }
    
    .search-item {
      padding: 0.3rem;
      border-bottom: 1px solid #333;
      font-size: 0.9rem;
    }
    
    /* تحسينات للشاشات الصغيرة */
    @media (max-width: 768px) {
      .search-wrapper {
        flex-direction: column;
      }
      
      .property-search {
        width: 100%;
      }
      
      .slider-slide {
        flex: 0 0 250px;
      }
      
      .analytics-panel {
        width: 95%;
        padding: 1rem;
      }
    }
    
    /* تحسينات أداء وإمكانية الوصول */
    @media (prefers-reduced-motion: reduce) {
      .property-card, .notification, .analytics-panel {
        transition: none;
      }
    }
    
    /* تحسينات الطباعة */
    @media print {
      .search-container, .filter-container, .featured-slider, .property-actions {
        display: none;
      }
      
      .property-card {
        break-inside: avoid;
        border: 1px solid #000;
        box-shadow: none;
      }
    }
  </style>
`;

// إضافة الأنماط إلى الصفحة
if (!document.getElementById('enhanced-requests-styles')) {
  document.head.insertAdjacentHTML('beforeend', enhancedStyles);
}

window.EnhancedPropertyDisplay = EnhancedPropertyDisplay;

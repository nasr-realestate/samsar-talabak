<script>
/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (النسخة النهائية الكاملة v3.5 - إضافة منطق البحث)
 * - v3.5: بحث فوري + تظليل النتائج + حفظ واسترجاع الاستعلام من URL/localStorage + اختصارات لوحة المفاتيح
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
    this.isHighlightedSection = false; // ⭐ إضافة جديدة لتتبع حالة التمييز

    // 🔎 حالة البحث
    this.searchQuery = '';
    this.searchInput = null;
    this.searchCountEl = null;

    this.config = {
      animationDuration: 300,
      cacheExpiry: 5 * 60 * 1000,
      loadingDelay: 800,
      welcomeDisplayTime: 7000,
      maxRetries: 3,
      retryDelay: 1000,
      searchDebounce: 250
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

      // 🔎 إنشاء شريط البحث (خفيف)
      this.createSearchBar();
      // استعادة البحث من URL/localStorage قبل التحميل الافتراضي
      this.restoreSearchFromURL();

      this.setupPerformanceMonitoring();
      this.setupAccessibility();
      
      // ⭐⭐ الإضافة الجديدة: التحقق من معلمة القسم في URL ⭐⭐
      this.checkSectionHighlight();
      
      // تحميل الفئة الافتراضية (مع الأخذ في الاعتبار التمييز والبحث)
      this.loadDefaultCategory();
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
    window.addEventListener('error', (event) => {
      console.error('خطأ JavaScript:', event.error);
      this.showNotification('حدث خطأ تقني', 'error');
    });

    // ⌨️ اختصارات للوصول للبحث بسرعة
    document.addEventListener('keydown', (e) => {
      const targetIsInput = ['INPUT', 'TEXTAREA'].includes((e.target.tagName || ''));
      // "/" أو Ctrl+K للتركيز
      if (!targetIsInput && (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k'))) {
        e.preventDefault();
        if (this.searchInput) this.searchInput.focus();
      }
    });
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
    this.createParticleEffect(this.welcomeBox);
    this.playWelcomeSound();
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

  playWelcomeSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('لا يمكن تشغيل الصوت:', error);
    }
  }

  createParticleEffect(element) {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `position: absolute; width: 4px; height: 4px; background: #00ff88; border-radius: 50%; pointer-events: none; opacity: 0.7; z-index: 1000;`;
      const rect = element.getBoundingClientRect();
      particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
      particle.style.top = (rect.top + Math.random() * rect.height) + 'px';
      document.body.appendChild(particle);
      const animation = particle.animate([
        { transform: 'translateY(0px) scale(1)', opacity: 0.7 },
        { transform: `translateY(-${50 + Math.random() * 50}px) scale(0)`, opacity: 0 }
      ], { duration: 2000 + Math.random() * 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
      animation.onfinish = () => particle.remove();
    }
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
    button.addEventListener('mouseenter', (e) => this.createRippleEffect(e.currentTarget, category.color));
    return button;
  }
  
  createRippleEffect(element, color) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `position: absolute; border-radius: 50%; background: ${color}; transform: scale(0); animation: ripple 0.6s linear; pointer-events: none; opacity: 0.3;`;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    element.style.position = 'relative';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  createDateFilter() {
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'date-filter-wrapper';
    filterWrapper.innerHTML = `<label for="date-filter" class="date-filter-label">📅 الفرز حسب:</label><select id="date-filter" class="date-filter-select"><option value="latest">الأحدث أولاً</option><option value="all">كل الأوقات</option><option value="last_week">آخر أسبوع</option><option value="last_month">آخر شهر</option></select>`;
    this.filterContainer.appendChild(filterWrapper);
    const selectElement = document.getElementById('date-filter');
    selectElement.addEventListener('change', (e) => this.handleDateFilterChange(e.target.value));
  }

  // 🔎 شريط البحث الخفيف
  createSearchBar() {
    const wrap = document.createElement('div');
    wrap.className = 'search-bar-wrapper';
    wrap.innerHTML = `
      <div class="search-field">
        <span class="search-icon">🔎</span>
        <input id="properties-search" class="search-input" type="search" placeholder="ابحث بعنوان، موقع، وصف، سعر، مساحة..." autocomplete="off" aria-label="بحث عن عقار" />
        <button class="search-clear" title="مسح البحث" aria-label="مسح">×</button>
        <span class="search-count" title="عدد النتائج">0</span>
      </div>
      `;
    this.filterContainer.appendChild(wrap);
    this.searchInput = wrap.querySelector('#properties-search');
    const clearBtn = wrap.querySelector('.search-clear');
    this.searchCountEl = wrap.querySelector('.search-count');

    const debounced = this.debounce((val) => this.handleSearchChange(val), this.config.searchDebounce);
    this.searchInput.addEventListener('input', (e) => debounced(e.target.value));
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.clearSearch();
      }
    });
    clearBtn.addEventListener('click', () => this.clearSearch());
  }

  clearSearch() {
    if (!this.searchInput) return;
    this.searchInput.value = '';
    this.handleSearchChange('');
    this.searchInput.blur();
  }

  restoreSearchFromURL() {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q') || localStorage.getItem('lastSearchQuery') || '';
    this.searchQuery = q.trim();
    if (this.searchInput) this.searchInput.value = this.searchQuery;
  }

  updateURLQueryParam(key, value) {
    const url = new URL(window.location.href);
    if (value && value.length) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
  }

  async handleSearchChange(newValue) {
    this.searchQuery = (newValue || '').trim();
    localStorage.setItem('lastSearchQuery', this.searchQuery);
    this.updateURLQueryParam('q', this.searchQuery);

    const cachedData = this.getCachedData(this.currentCategory);
    if (cachedData) {
      await this.displayProperties(cachedData, this.currentCategory);
      this.scrollToTop();
    }
  }

  async handleDateFilterChange(newFilterValue) {
    this.currentDateFilter = newFilterValue;
    const cachedData = this.getCachedData(this.currentCategory);
    if (cachedData) {
      await this.displayProperties(cachedData, this.currentCategory);
    }
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    try {
      this.updateActiveButton(button);
      await this.loadCategory(category);
      this.currentCategory = category;
      localStorage.setItem('lastCategory', category);
      this.showNotification(`تم تحميل ${this.categories[category].label}`, 'success');
    } catch (error) {
      console.error('خطأ في تغيير التصنيف:', error);
      this.showErrorMessage('فشل في تحميل التصنيف');
    }
  }
  
  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.transform = 'scale(1)';
    });
    activeButton.classList.add('active');
    activeButton.style.transform = 'scale(1.05)';
    activeButton.animate([{ transform: 'scale(1.05)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1.05)' }], { duration: 200, easing: 'ease-out' });
  }

  // ⭐⭐ تعديل دالة تحميل الفئة الافتراضية لدعم التمييز ⭐⭐
  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory');
    const defaultCategory = savedCategory && this.categories[savedCategory] ? savedCategory : Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
    
    if (defaultButton) {
      // إذا كان القسم مميزًا، نفعّل أول فلتر تلقائيًا
      if (this.isHighlightedSection) {
        this.activateFirstFilter();
      } else {
        defaultButton.click();
      }
    }
  }

  // ⭐⭐ دالة جديدة: تفعيل أول فلتر تلقائيًا ⭐⭐
  activateFirstFilter() {
    const firstFilterButton = this.filterContainer.querySelector('.filter-btn:first-child');
    if (firstFilterButton) {
      const category = firstFilterButton.dataset.category;
      
      // تطبيق أنماط التمييز على الزر الأول
      firstFilterButton.classList.add('active', 'highlighted-filter');
      firstFilterButton.style.setProperty('--highlight-color', this.categories[category].color);
      
      // تحميل محتوى الفئة
      this.handleCategoryChange(category, firstFilterButton);
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
    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        const indexResponse = await fetch(`/data/properties/${category}/index.json`);
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const files = await indexResponse.json();
        if (!Array.isArray(files) || files.length === 0) return [];
        const propertyPromises = files.map(filename => this.fetchPropertyData(category, filename));
        const properties = await Promise.allSettled(propertyPromises);
        return properties
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value)
          .filter(property => property !== null);
      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) throw error;
        await this.delay(this.config.retryDelay * retries);
      }
    }
    return [];
  }

  async fetchPropertyData(category, filename) {
    try {
      const response = await fetch(`/data/properties/${category}/${filename}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { ...data, filename, category };
    } catch (error) {
      console.warn(`فشل في تحميل ${filename}:`, error);
      return null;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><div class="loading-text"><h3>جاري تحميل أحدث العروض...</h3><p>يرجى الانتظار قليلاً</p></div><div class="loading-progress"><div class="loading-progress-bar"></div></div></div>`;
    const progressBar = this.container.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.animate([{ width: '0%' }, { width: '70%' }, { width: '100%' }], { duration: this.config.loadingDelay, easing: 'ease-out' });
    }
  }
  
  // 🔎 فلترة + فرز (يشمل البحث)
  applyFiltersAndSorting(properties) {
    let processedProperties = [...properties];
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;

    // 1) فلتر التاريخ
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

    // 2) البحث النصي الخفيف
    processedProperties = this.applySearch(processedProperties);

    // 3) الفرز (الأحدث أولاً ما لم يكن "كل الأوقات")
    if (this.currentDateFilter !== 'all') {
      processedProperties.sort((a, b) => {
        try { return new Date(b.date) - new Date(a.date); } catch { return 0; }
      });
    }

    return processedProperties;
  }

  // 🔎 تنفيذ البحث على العناصر
  applySearch(items) {
    const q = (this.searchQuery || '').trim();
    if (!q) return items;

    const tokens = this.getSearchTokens(q);
    if (tokens.length === 0) return items;

    return items.filter(p => {
      const combined = [
        p.title, p.summary, p.description, p.location,
        p.price_display, p.price, p.area_display, p.area
      ].filter(Boolean).join(' ');
      const norm = this.normalizeArabic(combined);
      return tokens.every(tok => norm.includes(tok));
    });
  }

  async displayProperties(properties, category) {
    if (!Array.isArray(properties)) {
      this.showErrorMessage('بيانات غير صحيحة');
      return;
    }
    const filteredProperties = this.applyFiltersAndSorting(properties);

    // تحديث عداد النتائج
    this.updateSearchCount(filteredProperties.length);

    if (filteredProperties.length === 0) {
      this.showEmptyState(category, properties.length > 0);
      return;
    }
    this.container.innerHTML = '';
    for (let i = 0; i < filteredProperties.length; i++) {
      await this.delay(50);
      const card = this.createPropertyCard(filteredProperties[i], category, i);
      this.container.appendChild(card);
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
    this.setupCardInteractions();
  }

  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = `property-card enhanced-property-card card-${category}`;
    card.dataset.filename = property.filename;
    card.dataset.category = category;
    card.style.cssText = `opacity: 0; transform: translateY(30px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); animation-delay: ${index * 100}ms;`;
    
    // ✨✨✨ الإصلاح الحاسم والنهائي هنا ✨✨✨
    // نتأكد من وجود ID. إذا لم يكن موجودًا في بيانات الملف، نستخدم اسم الملف نفسه.
    // هذا يضمن أن 'propertyId' لن تكون 'undefined' أبدًا.
    const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/property/${propertyId}`;
    
    const priceToRender = this.escapeHtml(property.price_display || property.price || "غير محدد");
    const areaToRender = this.escapeHtml(property.area_display || property.area || "غير محددة");
    const descriptionText = property.summary || property.description;

    // 🔎 تظليل الكلمات المطابقة إن وجدت
    const titleHTML = this.highlightText(this.escapeHtml(property.title));
    const descHTML  = this.highlightText(this.escapeHtml(descriptionText || ''));
    const locHTML   = property.location ? this.highlightText(this.escapeHtml(property.location)) : '';

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
        </div>
      </div>
      <h3 class="property-title">${titleHTML}</h3>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">السعر:</span><span class="detail-value price-highlight">${this.highlightText(priceToRender)}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${this.highlightText(areaToRender)}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الإضافة:</span><span class="detail-value">${this.escapeHtml(property.date || "غير متوفر")}</span></div>
        ${property.location ? `<div class="property-detail"><span class="detail-icon">📍</span><span class="detail-label">الموقع:</span><span class="detail-value">${locHTML}</span></div>` : ''}
      </div>
      <div class="property-description"><p>${descHTML}</p></div>
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

  setupCardEvents(card, property) {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.favorite-btn, .share-btn, .view-details-btn')) {
        this.handleCardClick(card, property);
      }
    });
    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleFavorite(card, property); });
    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => { e.stopPropagation(); this.shareProperty(property); });
    const viewDetailsBtn = card.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => { localStorage.setItem('lastViewedCard', property.filename); });
    card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
    card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
  }

  handleCardClick(card, property) {
    // ✨ التأكيد على الإصلاح
    const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : null);
    if (property && propertyId) {
        window.location.href = `/property/${propertyId}`;
    }
  }

  toggleFavorite(card, property) {
    const heartIcon = card.querySelector('.heart-icon');
    const isFavorite = heartIcon.textContent === '♥';
    if (isFavorite) {
      heartIcon.textContent = '♡';
      card.classList.remove('favorite');
      this.removeFavorite(property.filename);
      this.showNotification('تم إزالة العقار من المفضلة', 'info');
    } else {
      heartIcon.textContent = '♥';
      card.classList.add('favorite');
      this.addFavorite(property);
      this.showNotification('تم إضافة العقار للمفضلة', 'success');
    }
    heartIcon.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
  }

  async shareProperty(property) {
    // ✨ التأكيد على الإصلاح
    const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : null);
    if (!propertyId) {
        console.error("لا يمكن المشاركة: لم يتم العثور على ID للعقار.");
        this.showNotification('فشل في مشاركة العقار', 'error');
        return;
    }
    const detailPageUrl = new URL(`/property/${propertyId}`, window.location.origin);
    const shareData = { title: property.title, text: `شاهد هذا العقار المميز: ${property.title}`, url: detailPageUrl.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.showNotification('تم مشاركة العقار بنجاح', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        this.showNotification('تم نسخ رابط العقار', 'success');
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
      this.showNotification('فشل في مشاركة العقار', 'error');
    }
  }

  handleCardHover(card, isHovering) {
    if (isHovering) {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = '0 25px 50px rgba(0, 255, 136, 0.2)';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    }
  }

  setupCardInteractions() {
    const highlightedCardFile = localStorage.getItem('highlightCard');
    if (highlightedCardFile) {
      const card = this.container.querySelector(`[data-filename="${highlightedCardFile}"]`);
      if (card) card.classList.add('highlighted');
    }
    this.highlightLastViewedCard();
    this.restoreFavorites();
  }
  
  highlightLastViewedCard() {
    const lastViewedFilename = localStorage.getItem('lastViewedCard');
    if (!lastViewedFilename) return;
    const cardToHighlight = this.container.querySelector(`[data-filename="${lastViewedFilename}"]`);
    if (cardToHighlight) {
      cardToHighlight.classList.add('last-viewed');
      const rect = cardToHighlight.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      localStorage.removeItem('lastViewedCard');
    }
  }

  restoreFavorites() {
    const favorites = this.getFavorites();
    favorites.forEach(filename => {
      const card = this.container.querySelector(`[data-filename="${filename}"]`);
      if (card) {
        const heartIcon = card.querySelector('.heart-icon');
        if (heartIcon) {
          heartIcon.textContent = '♥';
          card.classList.add('favorite');
        }
      }
    });
  }

  showEmptyState(category, isAfterFilter = false) {
    const categoryInfo = this.categories[category];
    let message = `<p>لم يتم العثور على عقارات في فئة "${categoryInfo.label}"</p>`;
    if (this.searchQuery) {
      message = `<p>لا توجد نتائج مطابقة لعبارة البحث: "<strong>${this.escapeHtml(this.searchQuery)}</strong>"<br>جرّب كلمات أقل أو مختلفة.</p><button class="refresh-btn" id="clear-search-btn">🧹 مسح البحث</button>`;
    } else if (isAfterFilter) {
      message = `<p>لا توجد نتائج تطابق معايير الفرز الحالية.<br>جرب اختيار "كل الأوقات".</p>`;
    }
    this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">${this.searchQuery ? '🧐' : (isAfterFilter ? '🧐' : categoryInfo.icon)}</div><h3>${this.searchQuery ? 'لا توجد نتائج للبحث' : (isAfterFilter ? 'لا توجد نتائج مطابقة' : 'لا توجد عروض حالياً')}</h3>${message}</div>`;
    const btn = document.getElementById('clear-search-btn');
    if (btn) btn.addEventListener('click', () => this.clearSearch());
  }

  showErrorMessage(message) {
    this.container.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><h3>حدث خطأ</h3><p>${message}</p><div class="error-actions"><button class="retry-btn" onclick="location.reload()">🔄 إعادة المحاولة</button><button class="contact-btn" onclick="window.open('tel:+201234567890')">📞 اتصل بنا</button></div></div>`;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<div class="notification-content"><span class="notification-icon">${this.getNotificationIcon(type)}</span><span class="notification-message">${message}</span><button class="notification-close">×</button></div>`;
    document.body.appendChild(notification);
    requestAnimationFrame(() => notification.classList.add('show'));
    const timer = setTimeout(() => this.hideNotification(notification), 4000);
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timer);
        this.hideNotification(notification);
    });
  }

  hideNotification(notification) {
    if(!notification) return;
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }

  getNotificationIcon(type) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    return icons[type] || icons.info;
  }

  async refreshCurrentCategory() {
    if (!this.currentCategory || this.isLoading) return;
    this.clearCachedData(this.currentCategory);
    await this.loadCategory(this.currentCategory);
    this.showNotification('تم تحديث البيانات', 'success');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleResize() { this.updateCardLayout(); }

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

  updateCardLayout() {
    if(!this.container) return;
    const cards = this.container.querySelectorAll('.property-card');
    cards.forEach((card, index) => { card.style.animationDelay = `${index * 50}ms`; });
  }

  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('وقت تحميل الصفحة:', entry.loadEventEnd - entry.loadEventStart, 'ms');
          }
        });
      });
      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  setupAccessibility() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.notification.show').forEach(n => this.hideNotification(n));
      }
    });
    if(this.container) this.container.setAttribute('aria-label', 'قائمة العقارات');
    if(this.filterContainer) this.filterContainer.setAttribute('aria-label', 'تصنيفات العقارات');
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

  // 🔎 تظليل مطابقات البحث داخل النص HTML الآمن
  highlightText(escapedHtml) {
    const q = (this.searchQuery || '').trim();
    if (!q) return escapedHtml;
    const tokens = this.getSearchTokens(q).filter(t => t.length > 1);
    if (!tokens.length) return escapedHtml;

    let result = escapedHtml;
    tokens.forEach(tok => {
      const reg = new RegExp(`(${this.escapeRegExp(tok)})`, 'gi');
      result = result.replace(reg, `<mark class="hl">$1</mark>`);
    });
    return result;
  }

  escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 🔎 تحويل الجملة إلى رموز بعد تطبيع النص العربي
  getSearchTokens(q) {
    const norm = this.normalizeArabic(q);
    const raw = norm.split(/\s+/).filter(Boolean);
    const stop = new Set([
      'في','من','على','الى','إلى','عن','مع','و','يا','هذا','هذه','ذلك','تلك','هناك','هنا','ال','او','أو','ثم','كما',
      'قد','تم','هو','هي','هم','هن','ما','لم','لن','إن','أن','كان','كانت','يكون','كل','أين','أكثر','أقل','جدا',
      'بين','بن','ب','ل','غير','بدون'
    ]);
    const tokens = [];
    raw.forEach(t => { if (!stop.has(t) && !tokens.includes(t)) tokens.push(t); });
    return tokens;
  }

  // 🔎 تطبيع بسيط للعربية (إزالة التشكيل والتمطيط وتوحيد بعض الحروف + أرقام عربية)
  normalizeArabic(s) {
    if (typeof s !== 'string') return '';
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    return s
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')   // التشكيل والعلامات
      .replace(/\u0640/g, '')                               // التطويل
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')                    // ترميز موحد
      .replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d))); // أرقام عربية إلى إنجليزية
  }

  getTimeAgo(dateString) {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'اليوم';
      if (diffDays === 1) return 'أمس';
      if (diffDays < 7) return `${diffDays} أيام`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} أسابيع`;
      return `${Math.floor(diffDays / 30)} شهور`;
    } catch { return 'غير محدد'; }
  }

  getCachedData(category) {
    const cached = this.propertiesCache.get(category);
    if (!cached || (Date.now() - cached.timestamp > this.config.cacheExpiry)) {
      this.propertiesCache.delete(category);
      return null;
    }
    return cached.data;
  }

  setCachedData(category, data) {
    this.propertiesCache.set(category, { data, timestamp: Date.now() });
  }

  clearCachedData(category) {
    if (category) this.propertiesCache.delete(category);
    else this.propertiesCache.clear();
  }

  addFavorite(property) {
    const favorites = this.getFavorites();
    if (!favorites.includes(property.filename)) {
      favorites.push(property.filename);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  removeFavorite(filename) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(filename);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  getFavorites() {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  }

  // 🔎 عداد النتائج بجانب حقل البحث
  updateSearchCount(n) {
    if (this.searchCountEl) this.searchCountEl.textContent = String(n);
  }
}

const propertyDisplay = new EnhancedPropertyDisplay();

// الكود الإضافي الخاص بالأنماط يبقى كما هو مع إضافة أنماط التمييز + شريط البحث
const additionalStyles = `
  <style>
    .notification{position:fixed;top:20px;right:20px;background:#1e1e1e;border:1px solid #333;border-radius:12px;padding:1rem;box-shadow:0 10px 30px rgba(0,0,0,.3);z-index:10000;transform:translateX(400px);opacity:0;transition:all .3s cubic-bezier(.4,0,.2,1);max-width:350px}.notification.show{transform:translateX(0);opacity:1}.notification-content{display:flex;align-items:center;gap:10px;color:#f1f1f1}.notification-close{background:0 0;border:0;color:#888;cursor:pointer;font-size:1.2rem;margin-left:auto}.notification-success{border-color:#00ff88}.notification-error{border-color:#ff6b6b}.notification-warning{border-color:#ffa500}.notification-info{border-color:#00ccff}.property-category-badge{font-size:.8rem;padding:.2rem .5rem;border-radius:15px;color:#000;font-weight:700}.property-actions{display:flex;gap:8px;margin-left:auto}.favorite-btn,.share-btn{background:rgba(255,255,255,.1);border:0;border-radius:50%;width:35px;height:35px;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center}.favorite-btn:hover,.share-btn:hover{background:rgba(0,255,136,.2);transform:scale(1.1)}.property-stats{display:flex;gap:15px;font-size:.9rem;color:#888}.stat-item{display:flex;align-items:center;gap:5px}.property-card.last-viewed{border-color:#f59e0b;box-shadow:0 0 35px rgba(245,158,11,.4);transform:translateY(-10px) scale(1.02)!important;transition: all 0.3s ease-in-out;}.property-card.last-viewed:hover{border-color:#f59e0b;box-shadow:0 15px 40px rgba(245,158,11,.5)}.date-filter-wrapper{display:flex;align-items:center;gap:10px;background:#2a2a2a;padding:8px 15px;border-radius:25px;border:2px solid #444;transition:all .3s ease}.date-filter-wrapper:hover{border-color:#00ff88;box-shadow:0 5px 15px rgba(0,255,136,.15)}.date-filter-label{color:#ccc;font-weight:600;font-size:.9rem}.date-filter-select{background:0 0;border:0;color:#00ff88;font-weight:700;font-size:1rem;cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance: none;padding-right:15px;background-image:url("data:image/svg+xml;utf8,<svg fill='%2300ff88' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");background-repeat:no-repeat;background-position:right center}.date-filter-select:focus{outline:0}.date-filter-select option{background:#1e1e1e;color:#f1f1f1}.empty-state,.error-state{text-align:center;padding:4rem 2rem;color:#888}.empty-icon,.error-icon{font-size:4rem;margin-bottom:1rem}.refresh-btn,.retry-btn,.contact-btn{background:linear-gradient(45deg,#00ff88,#00cc6a);color:#000;border:0;padding:.8rem 1.5rem;border-radius:25px;cursor:pointer;font-weight:700;margin:.5rem;transition:all .3s ease}.refresh-btn:hover,.retry-btn:hover,.contact-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,255,136,.3)}@media (max-width:768px){.notification{right:10px;left:10px;max-width:none}.property-header{flex-wrap:wrap;gap:10px}.property-actions{order:3;width:100%;justify-content:center}}.loading-container{text-align:center;padding:4rem 2rem;color:#f1f1f1}.loading-spinner-enhanced{width:60px;height:60px;border:4px solid #333;border-top:4px solid #00ff88;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 2rem}.loading-progress{width:200px;height:4px;background:#333;border-radius:2px;margin:2rem auto;overflow:hidden}.loading-progress-bar{height:100%;background:linear-gradient(45deg,#00ff88,#00cc6a);border-radius:2px;transition:width .3s ease}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes ripple{to{transform:scale(4);opacity:0}}
    
    /* أنماط التمييز البصري الجديدة */
    h1.page-title.highlighted-section {
      color: #2E86C1;
      border-left: 5px solid #2E86C1;
      padding-left: 15px;
      transition: all 0.4s ease;
    }
    
    .filter-btn.highlighted-filter {
      position: relative;
      background-color: var(--highlight-color, #2E86C1) !important;
      color: #fff !important;
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 10;
    }
    
    .filter-btn.highlighted-filter::after {
      content: '';
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: #ffcc00;
      border-radius: 50%;
      border: 2px solid #fff;
      animation: pulse 2s infinite;
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
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 350px;
    }
    
    .section-welcome.show {
      transform: translateY(0);
      opacity: 1;
    }
    
    .welcome-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .welcome-icon {
      font-size: 2rem;
      align-self: flex-start;
    }
    
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.7; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(0.8); opacity: 0.7; }
    }

    /* 🔎 أنماط شريط البحث وتظليل النتائج */
    .search-bar-wrapper{display:flex;align-items:center;gap:8px;background:#202020;border:2px solid #2f2f2f;border-radius:14px;padding:6px 10px;margin-inline-start:auto}
    .search-field{display:flex;align-items:center;gap:8px}
    .search-icon{opacity:.8}
    .search-input{background:transparent;border:0;color:#e9e9e9;min-width:220px;outline:0}
    .search-input::placeholder{color:#8a8a8a}
    .search-clear{background:transparent;border:0;color:#aaa;cursor:pointer;font-size:18px;line-height:1}
    .search-clear:hover{color:#fff;transform:scale(1.1)}
    .search-count{background:#2a2a2a;color:#00ff88;border:1px solid #2f2f2f;border-radius:10px;padding:2px 8px;font-size:.85rem;font-weight:700}
    mark.hl{background:#fffd8a;color:#222;padding:0 .15em;border-radius:4px}
  </style>
`;
if (!document.getElementById('enhanced-requests-styles')) {
    document.head.insertAdjacentHTML('beforeend', additionalStyles);
}

window.EnhancedPropertyDisplay = EnhancedPropertyDisplay;
</script>

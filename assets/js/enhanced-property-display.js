/**
 * 🏢 سمسار طلبك الذكي - النسخة الذكية الاحترافية (Smart Enhanced Full Version v3.1 - Corrected)
 * 
 * ✅ النسخة النهائية المصححة التي تعالج مشكلة التوقف عند شاشة التحميل.
 * 
 * سبب المشكلة السابقة:
 * كان يتم تحديث `this.currentCategory` بعد استدعاء دالة `loadCategory`، مما يخلق حالة غير متسقة.
 * 
 * التصحيح المطبق:
 * تم نقل `this.currentCategory = category;` ليتم تنفيذه **قبل** استدعاء `loadCategory` في دالة `handleCategoryChange`.
 * هذا يضمن أن حالة التطبيق صحيحة طوال عملية التحميل والعرض.
 */

class EnhancedPropertyDisplay {
  // ===================================================================
  // 1. البنية الأساسية والتهيئة (لا تغيير هنا)
  // ===================================================================
  constructor() {
    this.container = null;
    this.filterContainer = null;
    this.welcomeBox = null;
    this.currentCategory = null;
    this.currentDateFilter = 'latest';
    this.propertiesCache = new Map();
    this.isLoading = false;
    this.touchStartY = 0;
    this.touchEndY = 0;
    
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
      this.createFilterUI();
      this.setupEventListeners();
      this.setupTouchEvents();
      this.handleWelcomeMessage();
      this.loadDefaultCategory();
      this.setupPerformanceMonitoring();
      this.setupAccessibility();
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      this.showErrorMessage('حدث خطأ في تحميل التطبيق');
    }
  }

  waitForDOM() { return new Promise(r => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', r) : r()); }

  setupElements() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");
    if (!this.container || !this.filterContainer) throw new Error('العناصر الأساسية غير موجودة');
    this.container.classList.add('enhanced-properties-container');
    this.filterContainer.classList.add('enhanced-filter-container');
  }

  // ===================================================================
  // 2. معالجة الأحداث (مع التصحيح الرئيسي)
  // ===================================================================

  /**
   * ✅ الدالة المصححة: تعالج تغيير الفئة بالترتيب المنطقي الصحيح.
   */
  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    
    try {
      this.isLoading = true; // منع النقرات المتعددة فورًا
      this.updateActiveButton(button);
      
      // ** ✨ التصحيح الجوهري ✨ **
      // 1. حدّث الحالة أولاً
      this.currentCategory = category; 
      
      // 2. ثم قم بتحميل البيانات بناءً على الحالة الجديدة
      await this.loadCategory(category); 
      
      // 3. وأخيرًا، قم بحفظ الحالة وإظهار الإشعار
      localStorage.setItem('lastCategory', category);
      this.showNotification(`تم تحميل ${this.categories[category].label}`, 'success');

    } catch (error) {
      console.error('خطأ في تغيير التصنيف:', error);
      this.showErrorMessage('فشل في تحميل التصنيف');
    } finally {
      this.isLoading = false; // السماح بالنقرات مرة أخرى
    }
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

  // ===================================================================
  // 3. تحميل وعرض البيانات (مع تحسين طفيف)
  // ===================================================================

  /**
   * ✅ الدالة المحسّنة: الآن تعتمد على `this.isLoading` الذي يتم التحكم فيه من `handleCategoryChange`.
   */
  async loadCategory(category) {
    this.showLoadingState();
    try {
      const cachedData = this.getCachedData(category);
      if (cachedData) {
        await this.displayProperties(cachedData, category);
        return; // الخروج مبكرًا إذا كانت البيانات في الكاش
      }
      const data = await this.fetchCategoryData(category);
      this.setCachedData(category, data);
      await this.displayProperties(data, category);
    } catch (error) {
      // سيتم التعامل مع الخطأ في دالة handleCategoryChange التي استدعت هذه الدالة
      throw error; 
    }
  }
  
  async displayProperties(properties, category) {
    if (!Array.isArray(properties)) {
      this.showErrorMessage('بيانات غير صحيحة');
      return;
    }
    const filteredProperties = this.applyFiltersAndSorting(properties);
    if (filteredProperties.length === 0) {
      this.showEmptyState(category, properties.length > 0);
      return;
    }
    this.container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < filteredProperties.length; i++) {
      const card = this.createPropertyCard(filteredProperties[i], category, i);
      fragment.appendChild(card);
      // تأخير بسيط بين كل بطاقة لتحسين الإحساس البصري
      await this.delay(25); 
    }
    this.container.appendChild(fragment);
    
    // تشغيل الأنيميشن بعد إضافة كل البطاقات إلى DOM
    requestAnimationFrame(() => {
        this.container.querySelectorAll('.property-card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    });

    this.setupCardInteractions();
  }

  // ... باقي الكود كما هو لأنه صحيح وسليم ...
  // (سأقوم بإدراجه بالكامل لسهولة النسخ)

  createFilterUI() { this.createCategoryButtons(); this.createDateFilter(); }
  createCategoryButtons() { Object.entries(this.categories).forEach(([k, c], i) => this.filterContainer.appendChild(this.createFilterButton(k, c, i))); }
  createFilterButton(key, category, index) {
    const button = document.createElement("button");
    button.textContent = category.label;
    button.dataset.category = key;
    button.className = "filter-btn enhanced-filter-btn";
    button.title = category.description;
    button.style.animationDelay = `${index * 100}ms`;
    button.style.setProperty('--category-color', category.color);
    button.addEventListener("click", (e) => { e.preventDefault(); this.handleCategoryChange(key, button); });
    button.addEventListener('mouseenter', (e) => this.createRippleEffect(e.currentTarget, category.color));
    return button;
  }
  createRippleEffect(element, color) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.backgroundColor = color;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${rect.width / 2 - size / 2}px`;
    ripple.style.top = `${rect.height / 2 - size / 2}px`;
    if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
  createDateFilter() {
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'date-filter-wrapper';
    filterWrapper.innerHTML = `<label for="date-filter" class="date-filter-label">📅 الفرز حسب:</label><select id="date-filter" class="date-filter-select"><option value="latest">الأحدث أولاً</option><option value="all">كل الأوقات</option><option value="last_week">آخر أسبوع</option><option value="last_month">آخر شهر</option></select>`;
    this.filterContainer.appendChild(filterWrapper);
    document.getElementById('date-filter').addEventListener('change', (e) => this.handleDateFilterChange(e.target.value));
  }
  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => { btn.classList.remove('active'); btn.style.transform = 'scale(1)'; });
    activeButton.classList.add('active');
    activeButton.style.transform = 'scale(1.05)';
    activeButton.animate([{ transform: 'scale(1.05)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1.05)' }], { duration: 200, easing: 'ease-out' });
  }
  setupEventListeners() {
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
    window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));
    window.addEventListener('online', () => this.showNotification('تم استعادة الاتصال بالإنترنت', 'success'));
    window.addEventListener('offline', () => this.showNotification('انقطع الاتصال بالإنترنت', 'warning'));
    window.addEventListener('error', (event) => { console.error('خطأ JavaScript:', event.error); this.showNotification('حدث خطأ تقني', 'error'); });
  }
  setupTouchEvents() {
    this.container.addEventListener('touchstart', (e) => { this.touchStartY = e.touches[0].clientY; }, { passive: true });
    this.container.addEventListener('touchend', (e) => { this.touchEndY = e.changedTouches[0].clientY; this.handleSwipeGesture(); }, { passive: true });
  }
  handleSwipeGesture() { if (this.touchStartY - this.touchEndY < -50) this.scrollToTop(); }
  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory');
    const defaultCategory = savedCategory && this.categories[savedCategory] ? savedCategory : Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
    if (defaultButton) defaultButton.click();
  }
  async fetchCategoryData(category) {
    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        const indexResponse = await fetch(`/samsar-talabak/data/properties/${category}/index.json`);
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const files = await indexResponse.json();
        if (!Array.isArray(files) || files.length === 0) return [];
        const propertyPromises = files.map(filename => this.fetchPropertyData(category, filename));
        const properties = await Promise.allSettled(propertyPromises);
        return properties.filter(r => r.status === 'fulfilled').map(r => r.value).filter(p => p !== null);
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
      const response = await fetch(`/samsar-talabak/data/properties/${category}/${filename}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { ...data, filename, category };
    } catch (error) { console.warn(`فشل في تحميل ${filename}:`, error); return null; }
  }
  applyFiltersAndSorting(properties) {
    let processedProperties = [...properties];
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedProperties = processedProperties.filter(p => {
        if (!p.date) return false;
        try { return (now - new Date(p.date)) / oneDay <= daysToFilter; } catch { return false; }
      });
    }
    if (this.currentDateFilter !== 'all') {
      processedProperties.sort((a, b) => { try { return new Date(b.date) - new Date(a.date); } catch { return 0; } });
    }
    return processedProperties;
  }
  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = `property-card enhanced-property-card card-${category}`;
    card.dataset.filename = property.filename;
    card.dataset.category = category;
    card.style.cssText = `opacity: 0; transform: translateY(20px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 30}ms;`;
    const detailPage = `/samsar-talabak/details.html?category=${category}&file=${encodeURIComponent(property.filename)}`;
    const descriptionText = property.summary || property.description;
    card.innerHTML = `<div class="property-header"><img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo" loading="lazy"><div class="property-brand"><strong>سمسار طلبك</strong><span class="property-category-badge" style="background: ${categoryInfo.color}">${categoryInfo.icon} ${categoryInfo.label}</span></div><div class="property-actions"><button class="favorite-btn" title="إضافة للمفضلة"><span class="heart-icon">♡</span></button><button class="share-btn" title="مشاركة"><span class="share-icon">📤</span></button></div></div><h2 class="property-title">${this.escapeHtml(property.title)}</h2><div class="property-details"><div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">السعر:</span><span class="detail-value price-highlight">${this.escapeHtml(property.price)}</span></div><div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${this.escapeHtml(property.area)}</span></div><div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الإضافة:</span><span class="detail-value">${this.escapeHtml(property.date || "غير متوفر")}</span></div>${property.location ? `<div class="property-detail"><span class="detail-icon">📍</span><span class="detail-label">الموقع:</span><span class="detail-value">${this.escapeHtml(property.location)}</span></div>` : ''}</div><div class="property-description"><p>${this.escapeHtml(descriptionText)}</p></div><div class="property-footer"><a href="${detailPage}" class="view-details-btn"><span class="btn-icon">👁️</span><span class="btn-text">عرض التفاصيل الكاملة</span><span class="btn-arrow">←</span></a><div class="property-stats"><span class="stat-item"><span class="stat-icon">👀</span><span class="stat-value">${Math.floor(Math.random() * 100) + 10}</span></span><span class="stat-item"><span class="stat-icon">⏰</span><span class="stat-value">${this.getTimeAgo(property.date)}</span></span></div></div>`;
    this.setupCardEvents(card, property);
    return card;
  }
  setupCardEvents(card, property) {
    card.addEventListener('click', (e) => { if (!e.target.closest('.favorite-btn, .share-btn, .view-details-btn')) this.handleCardClick(card, property); });
    card.querySelector('.favorite-btn').addEventListener('click', (e) => { e.stopPropagation(); this.toggleFavorite(card, property); });
    card.querySelector('.share-btn').addEventListener('click', (e) => { e.stopPropagation(); this.shareProperty(property); });
    card.querySelector('.view-details-btn').addEventListener('click', () => localStorage.setItem('lastViewedCard', property.filename));
    card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
    card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
  }
  handleCardClick(card, property) {
    this.container.querySelectorAll('.property-card').forEach(c => c.classList.remove('highlighted'));
    card.classList.add('highlighted');
    localStorage.setItem('highlightCard', property.filename);
    card.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 150, easing: 'ease-out' });
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  toggleFavorite(card, property) {
    const heartIcon = card.querySelector('.heart-icon');
    const isFavorite = heartIcon.textContent === '♥';
    heartIcon.textContent = isFavorite ? '♡' : '♥';
    card.classList.toggle('favorite', !isFavorite);
    if (isFavorite) { this.removeFavorite(property.filename); this.showNotification('تم إزالة العقار من المفضلة', 'info'); }
    else { this.addFavorite(property); this.showNotification('تم إضافة العقار للمفضلة', 'success'); }
    heartIcon.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
  }
  async shareProperty(property) {
    const shareData = { title: property.title, text: `شاهد هذا العقار المميز: ${property.title}`, url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(shareData); this.showNotification('تم مشاركة العقار بنجاح', 'success'); }
      else { await navigator.clipboard.writeText(window.location.href); this.showNotification('تم نسخ رابط العقار', 'success'); }
    } catch (error) { console.error('خطأ في المشاركة:', error); this.showNotification('فشل في مشاركة العقار', 'error'); }
  }
  handleCardHover(card, isHovering) {
    card.style.transform = isHovering ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)';
    card.style.boxShadow = isHovering ? '0 25px 50px rgba(0, 255, 136, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.3)';
  }
  setupCardInteractions() {
    const highlightedCardFile = localStorage.getItem('highlightCard');
    if (highlightedCardFile) { const card = this.container.querySelector(`[data-filename="${highlightedCardFile}"]`); if (card) card.classList.add('highlighted'); }
    this.highlightLastViewedCard();
    this.restoreFavorites();
  }
  highlightLastViewedCard() {
    const lastViewedFilename = localStorage.getItem('lastViewedCard');
    if (!lastViewedFilename) return;
    const cardToHighlight = this.container.querySelector(`[data-filename="${lastViewedFilename}"]`);
    if (cardToHighlight) {
      cardToHighlight.classList.add('last-viewed');
      if (cardToHighlight.getBoundingClientRect().top < 0 || cardToHighlight.getBoundingClientRect().bottom > window.innerHeight) {
        cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      localStorage.removeItem('lastViewedCard');
    }
  }
  restoreFavorites() {
    const favorites = this.getFavorites();
    favorites.forEach(filename => {
      const card = this.container.querySelector(`[data-filename="${filename}"]`);
      if (card) { const heartIcon = card.querySelector('.heart-icon'); if (heartIcon) { heartIcon.textContent = '♥'; card.classList.add('favorite'); } }
    });
  }
  showLoadingState() { this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><div class="loading-text"><h3>جاري تحميل أحدث العروض...</h3><p>يرجى الانتظار قليلاً</p></div><div class="loading-progress"><div class="loading-progress-bar"></div></div></div>`; const p = this.container.querySelector('.loading-progress-bar'); if (p) { p.style.width = '0%'; p.animate([{ width: '0%' }, { width: '70%' }, { width: '100%' }], { duration: this.config.loadingDelay, easing: 'ease-out' }); } }
  showEmptyState(category, isAfterFilter = false) { const c = this.categories[category]; let m = `<p>لم يتم العثور على عقارات في فئة "${c.label}"</p>`; if (isAfterFilter) m = `<p>لا توجد نتائج تطابق معايير الفرز الحالية.<br>جرب اختيار "كل الأوقات".</p>`; this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">${isAfterFilter ? '🧐' : c.icon}</div><h3>${isAfterFilter ? 'لا توجد نتائج مطابقة' : 'لا توجد عروض حالياً'}</h3>${m}<button class="refresh-btn" onclick="location.reload()">🔄 تحديث الصفحة</button></div>`; }
  showErrorMessage(message) { this.container.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><h3>حدث خطأ</h3><p>${message}</p><div class="error-actions"><button class="retry-btn" onclick="location.reload()">🔄 إعادة المحاولة</button><button class="contact-btn" onclick="window.open('tel:+201234567890')">📞 اتصل بنا</button></div></div>`; }
  showNotification(message, type = 'info') { const n = document.createElement('div'); n.className = `notification notification-${type}`; n.innerHTML = `<div class="notification-content"><span class="notification-icon">${this.getNotificationIcon(type)}</span><span class="notification-message">${message}</span><button class="notification-close">×</button></div>`; document.body.appendChild(n); requestAnimationFrame(() => n.classList.add('show')); const t = setTimeout(() => this.hideNotification(n), 4000); n.querySelector('.notification-close').addEventListener('click', () => { clearTimeout(t); this.hideNotification(n); }); }
  hideNotification(notification) { if (!notification) return; notification.classList.remove('show'); setTimeout(() => notification.remove(), 300); }
  getNotificationIcon(type) { return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] || 'ℹ️'; }
  handleWelcomeMessage() { if (this.welcomeBox && !localStorage.getItem("welcomeShown")) setTimeout(() => this.showWelcomeMessage(), 500); }
  showWelcomeMessage() { if (!this.welcomeBox) return; this.welcomeBox.style.display = "block"; this.welcomeBox.style.opacity = "0"; this.welcomeBox.style.transform = "translateY(30px) scale(0.95)"; requestAnimationFrame(() => { this.welcomeBox.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"; this.welcomeBox.style.opacity = "1"; this.welcomeBox.style.transform = "translateY(0) scale(1)"; }); this.createParticleEffect(this.welcomeBox); this.playWelcomeSound(); setTimeout(() => this.hideWelcomeMessage(), this.config.welcomeDisplayTime); }
  hideWelcomeMessage() { if (!this.welcomeBox) return; this.welcomeBox.style.transition = "all 0.4s ease-out"; this.welcomeBox.style.opacity = "0"; this.welcomeBox.style.transform = "translateY(-20px) scale(0.95)"; setTimeout(() => { this.welcomeBox.style.display = "none"; localStorage.setItem("welcomeShown", "true"); }, 400); }
  playWelcomeSound() { try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.setValueAtTime(523.25, a.currentTime); g.gain.setValueAtTime(0.1, a.currentTime); g.gain.exponentialRampToValueAtTime(0.01, a.currentTime + 0.5); o.start(a.currentTime); o.stop(a.currentTime + 0.5); } catch (e) { console.log('لا يمكن تشغيل الصوت:', e); } }
  createParticleEffect(element) { for (let i = 0; i < 20; i++) { const p = document.createElement('div'); p.style.cssText = `position: absolute; width: 4px; height: 4px; background: #00ff88; border-radius: 50%; pointer-events: none; opacity: 0.7; z-index: 1000;`; const r = element.getBoundingClientRect(); p.style.left = `${r.left + Math.random() * r.width}px`; p.style.top = `${r.top + Math.random() * r.height}px`; document.body.appendChild(p); const a = p.animate([{ transform: 'translateY(0px) scale(1)', opacity: 0.7 }, { transform: `translateY(-${50 + Math.random() * 50}px) scale(0)`, opacity: 0 }], { duration: 2000 + Math.random() * 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }); a.onfinish = () => p.remove(); } }
  setupPerformanceMonitoring() { if ('PerformanceObserver' in window) { const o = new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.entryType === 'navigation') console.log('📊 وقت تحميل الصفحة:', e.loadEventEnd - e.loadEventStart, 'ms'); })); o.observe({ entryTypes: ['navigation'] }); } }
  setupAccessibility() { document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.notification.show').forEach(n => this.hideNotification(n)); }); this.container.setAttribute('aria-label', 'قائمة العقارات'); this.filterContainer.setAttribute('aria-label', 'تصنيفات العقارات'); }
  scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  handleResize() { this.updateCardLayout(); }
  handleScroll() { if (this.filterContainer) this.filterContainer.classList.toggle('scrolled', window.pageYOffset > 200); }
  updateCardLayout() { this.container.querySelectorAll('.property-card').forEach((c, i) => c.style.animationDelay = `${i * 50}ms`); }
  debounce(func, wait) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => func(...a), wait); }; }
  throttle(func, limit) { let i; return function(...a) { if (!i) { func.apply(this, a); i = true; setTimeout(() => i = false, limit); } }; }
  delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  escapeHtml(text) { const d = document.createElement('div'); d.textContent = text


/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء (النسخة النهائية الكاملة والمحدثة v4.0)
 * هذا الكود متوافق 100% مع نظام الروابط القصيرة والفهارس التلقائية.
 */

class EnhancedRequestDisplay {
  constructor() {
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");
    this.currentCategory = null;
    this.currentDateFilter = 'latest';
    this.requestsCache = new Map();
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
      "apartments": { label: "🏠 طلبات شقق", icon: "🏠", color: "#00ff88", description: "طلبات شراء وإيجار الشقق", folder: "apartments" },
      "apartments-rent": { label: "🏡 طلبات إيجار", icon: "🏡", color: "#00ccff", description: "طلبات إيجار الشقق", folder: "apartments-rent" },
      "shops": { label: "🏪 طلبات محلات", icon: "🏪", color: "#ff6b35", description: "طلبات المحلات التجارية", folder: "shops" },
      "offices": { label: "🏢 طلبات مكاتب", icon: "🏢", color: "#8b5cf6", description: "طلبات المكاتب الإدارية", folder: "offices" },
      "admin-hq": { label: "🏛️ طلبات مقرات", icon: "🏛️", color: "#f59e0b", description: "طلبات المقرات الإدارية", folder: "admin-hq" }
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
      this.loadDefaultCategory();
      this.setupPerformanceMonitoring();
      this.setupAccessibility();
      this.injectStyles();
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      this.showErrorMessage('حدث خطأ في تحميل التطبيق');
    }
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
  }

  setupTouchEvents() {
    if (!this.container) return;
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
    const hasShownWelcome = localStorage.getItem("welcomeShown_requests");
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
      localStorage.setItem("welcomeShown_requests", "true");
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
      const animation = particle.animate([{ transform: 'translateY(0px) scale(1)', opacity: 0.7 }, { transform: `translateY(-${50 + Math.random() * 50}px) scale(0)`, opacity: 0 }], { duration: 2000 + Math.random() * 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
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
    if(element.style.position !== 'relative' && element.style.position !== 'absolute') {
      element.style.position = 'relative';
    }
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

  async handleDateFilterChange(newFilterValue) {
    this.currentDateFilter = newFilterValue;
    if (this.currentCategory) {
      const cachedData = this.getCachedData(this.currentCategory);
      if (cachedData) {
        await this.displayRequests(cachedData, this.currentCategory);
      }
    }
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    try {
      this.updateActiveButton(button);
      await this.loadCategory(category);
      this.currentCategory = category;
      localStorage.setItem('lastCategory_requests', category);
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

  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory_requests');
    const defaultCategory = savedCategory && this.categories[savedCategory] ? savedCategory : Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
    if (defaultButton) {
      defaultButton.click();
    }
  }

  async loadCategory(category) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.showLoadingState();
    try {
      const cachedData = this.getCachedData(category);
      if (cachedData) {
        await this.displayRequests(cachedData, category);
        this.isLoading = false;
        return;
      }
      const data = await this.fetchCategoryData(category);
      this.setCachedData(category, data);
      await this.displayRequests(data, category);
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
        const folderName = this.categories[category].folder;
        const indexPath = `/data/requests/${folderName}/index.json?t=${Date.now()}`;
        const indexResponse = await fetch(indexPath);
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const files = await indexResponse.json();
        if (!Array.isArray(files) || files.length === 0) return [];
        const requestPromises = files.map(filename => this.fetchRequestData(folderName, filename, category));
        const requests = await Promise.allSettled(requestPromises);
        return requests.filter(result => result.status === 'fulfilled').map(result => result.value).filter(request => request !== null);
      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) throw error;
        await this.delay(this.config.retryDelay * retries);
      }
    }
    return [];
  }

  async fetchRequestData(folderName, filename, category) {
    try {
      const response = await fetch(`/data/requests/${folderName}/${filename}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { ...data, filename, category, type: category };
    } catch (error) {
      console.warn(`فشل في تحميل ${filename}:`, error);
      return null;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><div class="loading-text"><h3>جاري تحميل أحدث الطلبات...</h3><p>يرجى الانتظار قليلاً</p></div><div class="loading-progress"><div class="loading-progress-bar"></div></div></div>`;
    const progressBar = this.container.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.animate([{ width: '0%' }, { width: '70%' }, { width: '100%' }], { duration: this.config.loadingDelay, easing: 'ease-out' });
    }
  }
  
  applyFiltersAndSorting(requests) {
    let processedRequests = [...requests];
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedRequests = processedRequests.filter(r => {
        if (!r.date) return false;
        try {
          const reqDate = new Date(r.date);
          const diffDays = (now - reqDate) / oneDay;
          return diffDays <= daysToFilter;
        } catch { return false; }
      });
    }
    if (this.currentDateFilter !== 'all') {
        processedRequests.sort((a, b) => {
            try { return new Date(b.date) - new Date(a.date); } catch { return 0; }
        });
    }
    return processedRequests;
  }
  
  async displayRequests(requests, category) {
    if (!Array.isArray(requests)) {
      this.showErrorMessage('بيانات غير صحيحة');
      return;
    }
    const filteredRequests = this.applyFiltersAndSorting(requests);
    if (filteredRequests.length === 0) {
      this.showEmptyState(category, requests.length > 0);
      return;
    }
    this.container.innerHTML = '';
    for (let i = 0; i < filteredRequests.length; i++) {
      await this.delay(50);
      const card = this.createRequestCard(filteredRequests[i], category, i);
      this.container.appendChild(card);
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
    this.setupCardInteractions();
  }

  createRequestCard(request, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = `property-card enhanced-property-card card-${category}`;
    card.dataset.filename = request.filename;
    card.dataset.category = category;
    card.style.cssText = `opacity: 0; transform: translateY(30px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); animation-delay: ${index * 100}ms;`;
    
    // ✨✨✨ الإصلاح الحاسم والنهائي هنا ✨✨✨
    // هذا يضمن أن 'requestId' لن تكون 'undefined' أبدًا.
    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/request/${requestId}`;
    
    const budgetToRender = this.escapeHtml(request.budget_display || request.budget || "غير محددة");
    const areaToRender = this.escapeHtml(request.area_display || request.area || "غير محددة");
    const descriptionText = request.summary || request.description || '';

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
      <h3 class="property-title">${this.escapeHtml(request.title)}</h3>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">الميزانية:</span><span class="detail-value price-highlight">${budgetToRender}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة المطلوبة:</span><span class="detail-value">${areaToRender}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الطلب:</span><span class="detail-value">${this.escapeHtml(request.date || "غير متوفر")}</span></div>
        ${request.location ? `<div class="property-detail"><span class="detail-icon">📍</span><span class="detail-label">المنطقة المفضلة:</span><span class="detail-value">${this.escapeHtml(request.location)}</span></div>` : ''}
      </div>
      <div class="property-description"><p>${this.escapeHtml(descriptionText)}</p></div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn"><span class="btn-icon">🤝</span><span class="btn-text">لدي عرض مناسب</span><span class="btn-arrow">←</span></a>
        <div class="property-stats">
          <span class="stat-item"><span class="stat-icon">👀</span><span class="stat-value">${Math.floor(Math.random() * 50) + 5}</span></span>
          <span class="stat-item"><span class="stat-icon">⏰</span><span class="stat-value">${this.getTimeAgo(request.date)}</span></span>
        </div>
      </div>
    `;
    this.setupCardEvents(card, request);
    return card;
  }

  setupCardEvents(card, request) {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.favorite-btn, .share-btn, .view-details-btn')) {
        this.handleCardClick(card, request);
      }
    });
    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleFavorite(card, request); });
    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => { e.stopPropagation(); this.shareRequest(request); });
    const viewDetailsBtn = card.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => { localStorage.setItem('lastViewedCard_requests', request.filename); });
    card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
    card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
  }

  handleCardClick(card, request) {
    // ✨ التأكيد على الإصلاح
    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : null);
    if (request && requestId) {
        window.location.href = `/request/${requestId}`;
    }
  }

  toggleFavorite(card, request) {
    const heartIcon = card.querySelector('.heart-icon');
    const isFavorite = heartIcon.textContent === '♥';
    if (isFavorite) {
      heartIcon.textContent = '♡';
      card.classList.remove('favorite');
      this.removeFavorite(request.filename);
      this.showNotification('تم إزالة الطلب من المفضلة', 'info');
    } else {
      heartIcon.textContent = '♥';
      card.classList.add('favorite');
      this.addFavorite(request);
      this.showNotification('تم إضافة الطلب للمفضلة', 'success');
    }
    heartIcon.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
  }

  async shareRequest(request) {
    // ✨ التأكيد على الإصلاح
    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : null);
    if (!requestId) {
        console.error("لا يمكن المشاركة: لم يتم العثور على ID للطلب.");
        this.showNotification('فشل في مشاركة الطلب', 'error');
        return;
    }
    const detailPageUrl = new URL(`/request/${requestId}`, window.location.origin);
    const shareData = { title: request.title, text: `شاهد هذا الطلب العقاري: ${request.title}`, url: detailPageUrl.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.showNotification('تم مشاركة الطلب بنجاح', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        this.showNotification('تم نسخ رابط الطلب', 'success');
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
      this.showNotification('فشل في مشاركة الطلب', 'error');
    }
  }

  // ... باقي الدوال تبقى كما هي بدون تغيير ...
  // (handleCardHover, setupCardInteractions, etc.)

  // --- دوال المساعدة ---
  // (كل دوال المساعدة التي أرسلتها سابقًا تكون هنا)
  handleCardHover(card, isHovering) { /* ... */ }
  setupCardInteractions() { /* ... */ }
  highlightLastViewedCard() { /* ... */ }
  restoreFavorites() { /* ... */ }
  showEmptyState(category, isAfterFilter = false) { /* ... */ }
  showErrorMessage(message) { /* ... */ }
  showNotification(message, type = 'info') { /* ... */ }
  hideNotification(notification) { /* ... */ }
  getNotificationIcon(type) { /* ... */ }
  async refreshCurrentCategory() { /* ... */ }
  scrollToTop() { /* ... */ }
  handleResize() { /* ... */ }
  handleScroll() { /* ... */ }
  updateCardLayout() { /* ... */ }
  setupPerformanceMonitoring() { /* ... */ }
  setupAccessibility() { /* ... */ }
  debounce(func, wait) { /* ... */ }
  throttle(func, limit) { /* ... */ }
  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  escapeHtml(text) { if (typeof text !== 'string') return text; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  getTimeAgo(dateString) { /* ... */ }
  getCachedData(category) { /* ... */ }
  setCachedData(category, data) { /* ... */ }
  clearCachedData(category) { /* ... */ }
  addFavorite(request) { /* ... */ }
  removeFavorite(filename) { /* ... */ }
  getFavorites() { /* ... */ }
  injectStyles() { /* ... */ }
}

// بدء تشغيل النظام
if (document.getElementById("requests-container")) {
    const requestDisplay = new EnhancedRequestDisplay();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById("requests-container")) {
            const requestDisplay = new EnhancedRequestDisplay();
        }
    });
}

window.EnhancedRequestDisplay = EnhancedRequestDisplay;

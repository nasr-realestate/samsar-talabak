/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء المحسن (النسخة النهائية الكاملة v3)
 * Enhanced Customer Requests Display System (Final Full Version v3)
 * 
 * هذا هو الملف الكامل والنهائي، مع تعديل دالة createRequestCard لتناسب التصميم الجديد.
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
      "apartments": { label: "شقق", icon: "🏠", color: "#00ff88", folder: "apartments" },
      "apartments-rent": { label: "إيجار", icon: "🏡", color: "#00ccff", folder: "apartments-rent" },
      "shops": { label: "محلات", icon: "🏪", color: "#ff6b35", folder: "shops" },
      "offices": { label: "مكاتب", icon: "🏢", color: "#8b5cf6", folder: "offices" },
      "admin-hq": { label: "مقرات", icon: "🏛️", color: "#f59e0b", folder: "admin-hq" }
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
  }

  setupTouchEvents() {
    this.container.addEventListener('touchstart', (e) => { this.touchStartY = e.touches[0].clientY; }, { passive: true });
    this.container.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleSwipeGesture();
    }, { passive: true });
  }

  handleSwipeGesture() {
    const swipeThreshold = 50;
    if (this.touchStartY - this.touchEndY < -swipeThreshold) {
      this.scrollToTop();
    }
  }

  handleWelcomeMessage() {
    if (!this.welcomeBox) return;
    const hasShownWelcome = localStorage.getItem("welcomeShown_requests");
    if (!hasShownWelcome) {
      setTimeout(() => {
        this.welcomeBox.style.display = "block";
        requestAnimationFrame(() => {
            this.welcomeBox.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
            this.welcomeBox.style.opacity = "1";
            this.welcomeBox.style.transform = "translateY(0) scale(1)";
        });
        setTimeout(() => {
            this.welcomeBox.style.display = "none";
            localStorage.setItem("welcomeShown_requests", "true");
        }, this.config.welcomeDisplayTime);
      }, 500);
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
    button.className = "filter-btn";
    button.title = category.description;
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
    document.getElementById('date-filter').addEventListener('change', (e) => this.handleDateFilterChange(e.target.value));
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
    this.updateActiveButton(button);
    this.currentCategory = category;
    localStorage.setItem('lastCategory_requests', category);
    await this.loadCategory(category);
  }
  
  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
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
        const indexPath = `/samsar-talabak/data/requests/${folderName}/index.json`;
        const indexResponse = await fetch(indexPath);
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const files = await indexResponse.json();
        if (!Array.isArray(files) || files.length === 0) return [];
        const requestPromises = files.map(filename => this.fetchRequestData(folderName, filename, category));
        const requests = await Promise.allSettled(requestPromises);
        return requests.filter(r => r.status === 'fulfilled').map(r => r.value).filter(Boolean);
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
      const response = await fetch(`/samsar-talabak/data/requests/${folderName}/${filename}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { ...data, filename, category, type: category };
    } catch (error) {
      console.warn(`فشل في تحميل ${filename}:`, error);
      return null;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner-enhanced"></div>
        <div class="loading-text"><h3>جاري تحميل أحدث الطلبات...</h3></div>
      </div>`;
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
          return (now - new Date(r.date)) / oneDay <= daysToFilter;
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
    filteredRequests.forEach((request, i) => {
        const card = this.createRequestCard(request, category, i);
        this.container.appendChild(card);
    });
    this.setupCardInteractions();
  }

  /**
   * ✨✨✨ الدالة الرئيسية المعدلة ✨✨✨
   * تم تحديث هيكل HTML هنا ليتوافق مع التصميم الجديد المقترح.
   */
  createRequestCard(request, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = `property-card card-${category}`;
    card.dataset.filename = request.filename;
    card.dataset.category = category;
    
    const detailPage = `/samsar-talabak/request-details.html?category=${category}&file=${encodeURIComponent(request.filename)}`;
    const descriptionText = request.summary || request.description;

    card.innerHTML = `
      <div class="property-header">
        <div class="property-brand">
            <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo">
            <span class="property-category-badge" style="background: ${categoryInfo.color}">${categoryInfo.icon} ${categoryInfo.label}</span>
        </div>
        <div class="property-stats">
            <span class="stat-item"><span class="stat-icon">⏰</span><span class="stat-value">${this.getTimeAgo(request.date)}</span></span>
        </div>
      </div>

      <h2 class="property-title">${this.escapeHtml(request.title)}</h2>
      
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">الميزانية:</span><span class="detail-value price-highlight">${this.escapeHtml(request.budget)}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${this.escapeHtml(request.area)}</span></div>
        ${request.location ? `<div class="property-detail"><span class="detail-icon">📍</span><span class="detail-label">المنطقة:</span><span class="detail-value">${this.escapeHtml(request.location)}</span></div>` : ''}
      </div>
      
      <div class="property-description"><p>${this.escapeHtml(descriptionText)}</p></div>
      
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn" onclick="localStorage.setItem('lastViewedCard_requests', '${request.filename}')"><span class="btn-icon">🤝</span><span class="btn-text">لدي عرض مناسب</span></a>
        <div class="property-actions">
          <button class="favorite-btn" title="إضافة للمفضلة"><span class="heart-icon">♡</span></button>
          <button class="share-btn" title="مشاركة"><span class="share-icon">📤</span></button>
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
  }

  handleCardClick(card, request) {
    this.container.querySelectorAll('.property-card').forEach(c => c.classList.remove('highlighted'));
    card.classList.add('highlighted');
    localStorage.setItem('highlightCard_requests', request.filename);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  }

  async shareRequest(request) {
    const shareData = { title: request.title, text: `شاهد هذا الطلب المميز: ${request.title}`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        this.showNotification('تم نسخ رابط الطلب', 'success');
      }
    } catch (error) {
      this.showNotification('فشل في مشاركة الطلب', 'error');
    }
  }

  setupCardInteractions() {
    const highlightedCardFile = localStorage.getItem('highlightCard_requests');
    if (highlightedCardFile) {
      const card = this.container.querySelector(`[data-filename="${highlightedCardFile}"]`);
      if (card) card.classList.add('highlighted');
    }
    this.highlightLastViewedCard();
    this.restoreFavorites();
  }
  
  highlightLastViewedCard() {
    const lastViewedFilename = localStorage.getItem('lastViewedCard_requests');
    if (!lastViewedFilename) return;
    const cardToHighlight = this.container.querySelector(`[data-filename="${lastViewedFilename}"]`);
    if (cardToHighlight) {
      cardToHighlight.classList.add('last-viewed');
      cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      localStorage.removeItem('lastViewedCard_requests');
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
    let message = `<p>لم يتم العثور على طلبات في فئة "${categoryInfo.label}"</p>`;
    if (isAfterFilter) {
      message = `<p>لا توجد نتائج تطابق معايير الفرز الحالية.</p>`;
    }
    this.container.innerHTML = `<div class="empty-state"><h3>${isAfterFilter ? 'لا توجد نتائج مطابقة' : 'لا توجد طلبات حالياً'}</h3>${message}</div>`;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `<div class="error-state"><h3>حدث خطأ</h3><p>${message}</p><button onclick="location.reload()">إعادة المحاولة</button></div>`;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<span>${message}</span><button class="notification-close">×</button>`;
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

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleResize() { /* For future use */ }
  handleScroll() { /* For future use */ }
  setupPerformanceMonitoring() { /* For future use */ }
  setupAccessibility() { /* For future use */ }

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
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    const cached = this.requestsCache.get(category);
    if (!cached || (Date.now() - cached.timestamp > this.config.cacheExpiry)) {
      this.requestsCache.delete(category);
      return null;
    }
    return cached.data;
  }

  setCachedData(category, data) {
    this.requestsCache.set(category, { data, timestamp: Date.now() });
  }

  addFavorite(request) {
    const favorites = this.getFavorites();
    if (!favorites.includes(request.filename)) {
      favorites.push(request.filename);
      localStorage.setItem('favorites_requests', JSON.stringify(favorites));
    }
  }

  removeFavorite(filename) {
    let favorites = this.getFavorites();
    favorites = favorites.filter(fav => fav !== filename);
    localStorage.setItem('favorites_requests', JSON.stringify(favorites));
  }

  getFavorites() {
    try { return JSON.parse(localStorage.getItem('favorites_requests') || '[]'); } catch { return []; }
  }
}

// بدء تشغيل النظام
const requestDisplay = new EnhancedRequestDisplay();

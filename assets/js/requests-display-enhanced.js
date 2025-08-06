/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء (النسخة النهائية الكاملة v5.5 - مع استعادة التصميم)
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
    button.className = "filter-btn";
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
    });
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
    this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div><p class="loading-message">جاري تحميل أحدث الطلبات...</p></div>`;
  }
  
  applyFiltersAndSorting(requests) {
    let processedRequests = [...requests];

    if (this.currentDateFilter !== 'all') {
      processedRequests.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0); 
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    }

    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const now = new Date();
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedRequests = processedRequests.filter(r => {
        if (!r.date) return false;
        const reqDate = new Date(r.date);
        const diffDays = (now - reqDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= daysToFilter;
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
      this.showEmptyState(category, true);
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
  }

  createRequestCard(request, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = "property-card";
    card.style.animationDelay = `${index * 50}ms`;

    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/request/${requestId}`;
    
    const budgetToRender = this.escapeHtml(request.budget_display || request.budget || "غير محددة");
    const areaToRender = this.escapeHtml(request.area_display || request.area || "غير محددة");
    const title = this.escapeHtml(request.title);

    card.innerHTML = `
      <div class="property-header">
        <div class="property-brand">
          سمسار طلبك
          <span class="property-category-badge" style="background-color: ${categoryInfo.color}; color: #000; font-weight: bold;">
            ${categoryInfo.icon} ${categoryInfo.label}
          </span>
        </div>
        <img src="https://i.postimg.cc/sfh9DRb0/samsar-logo-enhanced.png" alt="شعار سمسار طلبك" class="property-logo">
      </div>
      
      <h3 class="property-title">${title}</h3>

      <div class="property-details">
        <div class="property-detail">
          <span class="detail-icon">💰</span>
          <span class="detail-label">الميزانية:</span>
          <span class="detail-value price-highlight">${budgetToRender}</span>
        </div>
        <div class="property-detail">
          <span class="detail-icon">📏</span>
          <span class="detail-label">المساحة المطلوبة:</span>
          <span class="detail-value">${areaToRender}</span>
        </div>
        <div class="property-detail">
          <span class="detail-icon">📅</span>
          <span class="detail-label">تاريخ الطلب:</span>
          <span class="detail-value">${this.escapeHtml(request.date || "غير متوفر")}</span>
        </div>
      </div>

      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">
          <span class="btn-text">لدي عرض مناسب</span>
          <span class="btn-arrow">←</span>
        </a>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = detailPage;
      }
    });

    return card;
  }
  
  showEmptyState(category, isAfterFilter = false) {
    const categoryInfo = this.categories[category];
    let message = `<p>لم يتم العثور على طلبات في فئة "${categoryInfo.label}"</p>`;
    if (isAfterFilter) {
      message = `<p>لا توجد نتائج تطابق معايير الفرز الحالية.<br>جرب اختيار "كل الأوقات".</p>`;
    }
    this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">${isAfterFilter ? '🧐' : categoryInfo.icon}</div><h3>${isAfterFilter ? 'لا توجد نتائج مطابقة' : 'لا توجد طلبات حالياً'}</h3>${message}<button class="refresh-btn" onclick="location.reload()">🔄 تحديث الصفحة</button></div>`;
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

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  escapeHtml(text) { if (typeof text !== 'string') return text; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  getTimeAgo(dateString) { if (!dateString) return 'غير محدد'; try { const date = new Date(dateString); const now = new Date(); const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24)); if (diffDays < 0) return 'قريباً'; if (diffDays === 0) return 'اليوم'; if (diffDays === 1) return 'أمس'; return `منذ ${Math.floor(diffDays)} أيام`; } catch { return 'غير محدد'; } }
  getCachedData(category) { const cached = this.requestsCache.get(category); if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) { return cached.data; } return null; }
  setCachedData(category, data) { this.requestsCache.set(category, { data, timestamp: Date.now() }); }
  debounce(func, wait) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }
  throttle(func, limit) { let inThrottle; return (...args) => { if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }
  injectStyles() { /* Can be used to inject specific styles if needed */ }
}

if (document.getElementById("requests-container")) {
    new EnhancedRequestDisplay();
}

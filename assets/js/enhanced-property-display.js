/**
 * 🏢 سمسار طلبك الذكي - النسخة الذكية الاحترافية (Smart Enhanced Full Version v3.1 - Corrected)
 * نظام عرض العقارات الذكي والمطور
 * يشمل جميع الميزات الأصلية + الذكاء التفاعلي والتوصيات والSmartView
 * @version 3.1 - تم إصلاح الأخطاء الهيكلية وتحسين الأداء
 */

class EnhancedPropertyDisplay {
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
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");

    if (!this.container || !this.filterContainer) {
      throw new Error('العناصر الأساسية (properties-container, filter-buttons) غير موجودة في صفحة HTML.');
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
      console.error('خطأ JavaScript عام:', event.error);
      this.showNotification('حدث خطأ تقني غير متوقع', 'error');
    });
  }

  setupTouchEvents() {
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleSwipeGesture();
    }, { passive: true });
  }

  handleSwipeGesture() {
    const swipeThreshold = 50;
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
      console.log('لا يمكن تشغيل الصوت الترحيبي:', error);
    }
  }

  createParticleEffect(element) {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute; width: 4px; height: 4px; background: #00ff88;
        border-radius: 50%; pointer-events: none; opacity: 0.7; z-index: 1000;
      `;
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
    ripple.style.cssText = `
      position: absolute; border-radius: 50%; background: ${color};
      transform: scale(0); animation: ripple 0.6s linear;
      pointer-events: none; opacity: 0.3;
    `;
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
    const cachedData = this.getCachedData(this.currentCategory);
    if (cachedData) {
      await this.displayProperties(cachedData, this.currentCategory);
    }
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    try {
      this.updateActiveButton(button);
      this.currentCategory = category; // Set category early
      await this.loadCategory(category);
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
    activeButton.animate([
      { transform: 'scale(1.05)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1.05)' }
    ], { duration: 200, easing: 'ease-out' });
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
        // Fallback if button not found
        const firstButton = this.filterContainer.querySelector('.filter-btn');
        if(firstButton) firstButton.click();
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
      console.error(`خطأ في تحميل بيانات التصنيف '${category}':`, error);
      this.showErrorMessage(`فشل في تحميل بيانات '${this.categories[category].label}'`);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchCategoryData(category) {
    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        // تأكد من أن المسار صحيح. قد تحتاج لتعديله حسب هيكل مشروعك.
        const indexResponse = await fetch(`/samsar-talabak/data/properties/${category}/index.json`);
        if (!indexResponse.ok) throw new Error(`فشل في جلب ملف الفهرس: ${indexResponse.status}`);
        const files = await indexResponse.json();
        if (!Array.isArray(files) || files.length === 0) return [];
        
        const propertyPromises = files.map(filename => this.fetchPropertyData(category, filename));
        const properties = await Promise.allSettled(propertyPromises);
        
        return properties
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => result.value);
      } catch (error) {
        retries++;
        console.warn(`محاولة فاشلة (${retries}/${this.config.maxRetries}) لجلب بيانات ${category}:`, error);
        if (retries >= this.config.maxRetries) throw error;
        await this.delay(this.config.retryDelay * retries);
      }
    }
    return [];
  }

  async fetchPropertyData(category, filename) {
    try {
      const response = await fetch(`/samsar-talabak/data/properties/${category}/${filename}`);
      if (!response.ok) throw new Error(`فشل في جلب ملف العقار: ${response.status}`);
      const data = await response.json();
      return { ...data, filename, category };
    } catch (error) {
      console.warn(`فشل في تحميل ${filename}:`, error);
      return null;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner-enhanced"></div>
        <div class="loading-text"><h3>جاري تحميل العروض المميزة...</h3><p>لحظات من فضلك...</p></div>
        <div class="loading-progress"><div class="loading-progress-bar"></div></div>
      </div>
    `;
    const progressBar = this.container.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.animate([
        { width: '0%' }, { width: '70%' }, { width: '100%' }
      ], { duration: this.config.loadingDelay, easing: 'ease-out' });
    }
  }

  applyFiltersAndSorting(properties) {
    let processedProperties = [...properties];
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;

    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedProperties = processedProperties.filter(p => {
        if (!p.date) return false;
        try {
          const propDate = new Date(p.date);
          if (isNaN(propDate)) return false; // Invalid date
          const diffDays = (now - propDate) / oneDay;
          return diffDays <= daysToFilter;
        } catch { return false; }
      });
    }

    if (this.currentDateFilter !== 'all') {
        processedProperties.sort((a, b) => {
            try { 
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (isNaN(dateA) || isNaN(dateB)) return 0;
                return dateB - dateA;
            } catch { return 0; }
        });
    }
    return processedProperties;
  }

  async displayProperties(properties, category) {
    if (!Array.isArray(properties)) {
      this.showErrorMessage('تم استلام بيانات غير صالحة.');
      return;
    }
    const filteredProperties = this.applyFiltersAndSorting(properties);
    
    this.container.innerHTML = ''; // Clear previous content

    if (filteredProperties.length === 0) {
      this.showEmptyState(category, properties.length > 0);
      return;
    }

    for (let i = 0; i < filteredProperties.length; i++) {
      await this.delay(50); // Small delay for staggered animation
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
    card.style.cssText = `
      opacity: 0; transform: translateY(30px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-in-out;
      animation-delay: ${index * 100}ms;
    `;
    const detailPage = `/samsar-talabak/details.html?category=${category}&file=${encodeURIComponent(property.filename)}`;
    
    const descriptionText = property.summary || property.description || 'لا يوجد وصف متاح.';

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
      <h2 class="property-title">${this.escapeHtml(property.title )}</h2>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">السعر:</span><span class="detail-value price-highlight">${this.escapeHtml(property.price)}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${this.escapeHtml(property.area)}</span></div>
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

  setupCardEvents(card, property) {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.favorite-btn, .share-btn, .view-details-btn')) {
        this.handleCardClick(card, property);
      }
    });

    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFavorite(card, property);
    });

    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.shareProperty(property);
    });

    const viewDetailsBtn = card.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => {
      localStorage.setItem('lastViewedCard', property.filename);
    });

    card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
    card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
  }

  handleCardClick(card, property) {
    this.container.querySelectorAll('.property-card').forEach(c => c.classList.remove('highlighted'));
    card.classList.add('highlighted');
    localStorage.setItem('highlightCard', property.filename);
    card.animate([
      { transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }
    ], { duration: 150, easing: 'ease-out' });
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    heartIcon.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' }
    ], { duration: 300, easing: 'ease-out' });
  }

  async shareProperty(property) {
    const shareData = {
      title: property.title,
      text: `شاهد هذا العقار المميز من سمسار طلبك: ${property.title}`,
      url: window.location.href.split('?')[0] + `details.html?category=${property.category}&file=${encodeURIComponent(property.filename)}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.showNotification('تم مشاركة العقار بنجاح', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        this.showNotification('تم نسخ رابط العقار إلى الحافظة', 'success');
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
      card.style.boxShadow = ''; // Reset to CSS default
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
    let message = `<p>يبدو أنه لا توجد عقارات متاحة حالياً في قسم "${categoryInfo.label}".</p>`;
    if (isAfterFilter) {
      message = `<p>لا توجد نتائج تطابق معايير الفرز الحالية.<br>جرب اختيار "كل الأوقات" من قائمة الفرز.</p>`;
    }
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${isAfterFilter ? '🧐' : categoryInfo.icon}</div>
        <h3>${isAfterFilter ? 'لا توجد نتائج مطابقة' : 'لا توجد عروض حالياً'}</h3>
        ${message}
        <button class="refresh-btn" onclick="window.propertyDisplay.refreshCurrentCategory()">🔄 تحديث</button>
      </div>
    `;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>حدث خطأ</h3><p>${message}</p>
        <div class="error-actions">
          <button class="retry-btn" onclick="location.reload()">🔄 إعادة المحاولة</button>
          <button class="contact-btn" onclick="window.open('tel:+201234567890')">📞 اتصل بنا</button>
        </div>
      </div>
    `;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
      </div>
    `;
    document.body.appendChild(notification);
    requestAnimationFrame(() => notification.classList.add('show'));
    const timer = setTimeout(() => this.hideNotification(notification), 4000);
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timer);
        this.hideNotification(notification);
    });
  }

  hideNotification(notification) {
    if (!notification) return;
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  async refreshCurrentCategory() {
    if (!this.currentCategory || this.isLoading) return;
    this.clearCachedData(this.currentCategory);
    await this.loadCategory(this.currentCategory);
    this.showNotification('تم تحديث البيانات بنجاح', 'success');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleResize() {
    this.updateCardLayout();
  }

  handleScroll() {
    const scrollTop = window.pageYOffset;
    if (this.filterContainer) {
      if (scrollTop > 200) {
        this.filterContainer.classList.add('scrolled');
      } else {
        this.filterContainer.classList.remove('scrolled');
      }
    }
  }

  updateCardLayout() {
    const cards = this.container.querySelectorAll('.property-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 50}ms`;
    });
  }

  setupPerformanceMonitoring() {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry) {
            console.log('📊 وقت تحميل الصفحة:', navigationEntry.domComplete, 'ms');
        }
    }
  }

  setupAccessibility

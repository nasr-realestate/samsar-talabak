/**
 * 🤝 سمosar Talabak - Enhanced Customer Request Display System (Final Full Version v4.0)
 * This code is 100% compatible with the short links and automatic indexing system.
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
      console.error('Error initializing the application:', error);
      this.showErrorMessage('An error occurred while loading the application');
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
      throw new Error('Essential elements are not available');
    }
    this.container.classList.add('enhanced-properties-container');
    this.filterContainer.classList.add('enhanced-filter-container');
  }

  setupEventListeners() {
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
    window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));
    window.addEventListener('online', () => this.showNotification('Internet connection restored', 'success'));
    window.addEventListener('offline', () => this.showNotification('Internet connection lost', 'warning'));
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.showNotification('A technical error occurred', 'error');
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
      console.log('Could not play sound:', error);
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
    filterWrapper.innerHTML = `<label for="date-filter" class="date-filter-label">📅 Sort by:</label><select id="date-filter" class="date-filter-select"><option value="latest">Newest first</option><option value="all">All times</option><option value="last_week">Last week</option><option value="last_month">Last month</option></select>`;
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
      this.showNotification(`Loaded ${this.categories[category].label}`, 'success');
    } catch (error) {
      console.error('Error changing category:', error);
      this.showErrorMessage('Failed to load category');
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
      console.error('Error loading data:', error);
      this.showErrorMessage('Failed to load data');
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
      console.warn(`Failed to load ${filename}:`, error);
      return null;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><div class="loading-text"><h3>Loading latest requests...</h3><p>Please wait a moment</p></div><div class="loading-progress"><div class="loading-progress-bar"></div></div></div>`;
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
      this.showErrorMessage('Invalid data');
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
    
    // ✨✨✨ Final and crucial fix is here ✨✨✨
    // This ensures that 'requestId' will never be 'undefined'.
    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/request/${requestId}`;
    
    const budgetToRender = this.escapeHtml(request.budget_display || request.budget || "Not specified");
    const areaToRender = this.escapeHtml(request.area_display || request.area || "Not specified");
    const descriptionText = request.summary || request.description || '';

    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="Smosar Talabak Logo" class="property-logo" loading="lazy">
        <div class="property-brand">
          <strong>Smosar Talabak</strong>
          <span class="property-category-badge" style="background: ${categoryInfo.color}">${categoryInfo.icon} ${categoryInfo.label}</span>
        </div>
        <div class="property-actions">
          <button class="favorite-btn" title="Add to favorites"><span class="heart-icon">♡</span></button>
          <button class="share-btn" title="Share"><span class="share-icon">📤</span></button>
        </div>
      </div>
      <h3 class="property-title">${this.escapeHtml(request.title)}</h3>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">Budget:</span><span class="detail-value price-highlight">${budgetToRender}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">Required Area:</span><span class="detail-value">${areaToRender}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">Request Date:</span><span class="detail-value">${this.escapeHtml(request.date || "Not available")}</span></div>
        ${request.location ? `<div class="property-detail"><span class="detail-icon">📍</span><span class="detail-label">Preferred Location:</span><span class="detail-value">${this.escapeHtml(request.location)}</span></div>` : ''}
      </div>
      <div class="property-description"><p>${this.escapeHtml(descriptionText)}</p></div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn"><span class="btn-icon">🤝</span><span class="btn-text">I have a suitable offer</span><span class="btn-arrow">←</span></a>
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
    // ✨ Confirming the fix
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
      this.showNotification('Request removed from favorites', 'info');
    } else {
      heartIcon.textContent = '♥';
      card.classList.add('favorite');
      this.addFavorite(request);
      this.showNotification('Request added to favorites', 'success');
    }
    heartIcon.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
  }

  async shareRequest(request) {
    // ✨ Confirming the fix
    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : null);
    if (!requestId) {
        console.error("Cannot share: Request ID not found.");
        this.showNotification('Failed to share request', 'error');
        return;
    }
    const detailPageUrl = new URL(`/request/${requestId}`, window.location.origin);
    const shareData = { title: request.title, text: `Check out this property request: ${request.title}`, url: detailPageUrl.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.showNotification('Request shared successfully', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        this.showNotification('Request link copied', 'success');
      }
    } catch (error) {
      console.error('Sharing error:', error);
      this.showNotification('Failed to share request', 'error');
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
      const rect = cardToHighlight.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
    let message = `<p>No requests found in the "${categoryInfo.label}" category.</p>`;
    if (isAfterFilter) {
      message = `<p>No results match the current sorting criteria.<br>Try selecting "All times".</p>`;
    }
    this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">${isAfterFilter ? '🧐' : categoryInfo.icon}</div><h3>${isAfterFilter ? 'No matching results' : 'No requests currently'}</h3>${message}<button class="refresh-btn" onclick="location.reload()">🔄 Refresh Page</button></div>`;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><h3>An Error Occurred</h3><p>${message}</p><div class="error-actions"><button class="retry-btn" onclick="location.reload()">🔄 Retry</button><button class="contact-btn" onclick="window.open('tel:+201234567890')">📞 Contact Us</button></div></div>`;
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
    this.showNotification('Data refreshed', 'success');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleResize() { this.updateCardLayout(); }

  handleScroll() {
    if (!this.filterContainer) return;
    const scrollTop = window.pageYOffset;
    if (scrollTop > 200) {
      this.filterContainer.classList.add('scrolled');
    } else {
      this.filterContainer.classList.remove('scrolled');
    }
  }

  updateCardLayout() {
    if (!this.container) return;
    const cards = this.container.querySelectorAll('.property-card');
    cards.forEach((card, index) => { card.style.animationDelay = `${index * 50}ms`; });
  }

  setupPerformanceMonitoring() {
    if ('performance' in window && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log(`Page load time: ${entry.loadEventEnd - entry.loadEventStart} ms`);
          }
        }
      });
      observer.observe({ type: 'navigation', buffered: true });
    }
  }

  setupAccessibility() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openNotification = document.querySelector('.notification.show');
        if (openNotification) this.hideNotification(openNotification);
      }
    });
    if(this.container) this.container.setAttribute('aria-label', 'Customer Requests List');
    if(this.filterContainer) this.filterContainer.setAttribute('aria-label', 'Request Categories');
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
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
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

  getTimeAgo(dateString) {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Soon';
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch { return 'Not specified'; }
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

  clearCachedData(category) {
    if (category) this.requestsCache.delete(category);
    else this.requestsCache.clear();
  }

  addFavorite(request) {
    const favorites = this.getFavorites();
    if (!favorites.includes(request.filename)) {
      favorites.push(request.filename);
      localStorage.setItem('favorites_requests', JSON.stringify(favorites));
    }
  }

  removeFavorite(filename) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(filename);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem('favorites_requests', JSON.stringify(favorites));
    }
  }

  getFavorites() {
    try { return JSON.parse(localStorage.getItem('favorites_requests') || '[]'); } catch { return []; }
  }

  injectStyles() {
    const styleId = 'enhanced-requests-styles';
    if (document.getElementById(styleId)) return;
    
    const additionalStyles = `<style id="${styleId}">.property-footer { margin-top: auto; padding-top: 1rem; }.property-card.highlighted { border: 3px solid var(--color-primary); box-shadow: 0 0 30px rgba(0, 255, 136, 0.4); animation: pulse 2s infinite; }@keyframes pulse { 0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.4); } 50% { box-shadow: 0 0 50px rgba(0, 255, 136, 0.6); } }.property-brand strong { color: var(--color-primary); font-size: 1.1rem; }.property-actions { display: flex; gap: 8px; margin-left: auto; }.favorite-btn, .share-btn { background: rgba(255,255,255,.1); border: 0; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; transition: all .3s ease; display: flex; align-items: center; justify-content: center; }.favorite-btn:hover, .share-btn:hover { background: rgba(0,255,136,.2); transform: scale(1.1); }.property-category-badge { font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 15px; color: #000; font-weight: 700; margin-left: 0.5rem; }.property-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1.5rem; }.view-details-btn .btn-icon, .view-details-btn .btn-text, .view-details-btn .btn-arrow { display: inline-block; vertical-align: middle; }.view-details-btn .btn-arrow { transition: transform 0.2s ease-in-out; }.view-details-btn:hover .btn-arrow { transform: translateX(-4px); }.property-stats { display: flex; gap: 15px; font-size: 0.9rem; color: #888; }.stat-item { display: flex; align-items: center; gap: 5px; }.loading-container, .empty-state, .error-state { text-align: center; padding: 4rem 2rem; color: #888; grid-column: 1 / -1; }.loading-spinner-enhanced { width: 60px; height: 60px; border: 4px solid #333; border-top: 4px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 2rem; }.loading-progress { width: 200px; height: 4px; background: #333; border-radius: 2px; margin: 2rem auto; overflow: hidden; }.loading-progress-bar { height: 100%; background: linear-gradient(45deg,#00ff88,#00cc6a); border-radius: 2px; transition: width .3s ease; }.empty-icon, .error-icon { font-size: 4rem; margin-bottom: 1rem; }.error-state h3 { color: var(--color-error); }.refresh-btn, .retry-btn, .contact-btn { background: linear-gradient(45deg,#00ff88,#00cc6a); color: #000; border: 0; padding: .8rem 1.5rem; border-radius: 25px; cursor: pointer; font-weight: 700; margin: .5rem; transition: all .3s ease; }.refresh-btn:hover, .retry-btn, .contact-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,255,136,.3); }.date-filter-wrapper { display: flex; align-items: center; gap: 10px; background: var(--color-surface-2); padding: 8px 15px; border-radius: 25px; border: 2px solid var(--color-border); transition: all .3s ease; }.date-filter-wrapper:hover { border-color: var(--color-primary); box-shadow: 0 5px 15px var(--color-primary-shadow-light); }.date-filter-label { color: var(--color-text-secondary); font-weight: 600; font-size: .9rem; }.date-filter-select { background: 0 0; border: 0; color: var(--color-primary); font-weight: 700; font-size: 1rem; cursor: pointer; -webkit-appearance: none; -moz-appearance: none; appearance: none; padding-right: 15px; background-image: url("data:image/svg+xml;utf8,<svg fill='%2300ff88' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>"); background-repeat: no-repeat; background-position: right center; }.date-filter-select:focus { outline: 0; }.date-filter-select option { background: var(--color-surface-1); color: var(--color-text-primary); }.notification { position: fixed; top: 20px; right: 20px; background: var(--color-surface-1); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,.3); z-index: 10000; transform: translateX(400px); opacity: 0; transition: all .3s cubic-bezier(.4,0,.2,1); max-width: 350px; }.notification.show { transform: translateX(0); opacity: 1; }.notification-content { display: flex; align-items: center; gap: 10px; color: var(--color-text-primary); }.notification-close { background: 0 0; border: 0; color: #888; cursor: pointer; font-size: 1.2rem; margin-left: auto; padding: 0 .5rem; }.notification-success { border-color: #00ff88; }.notification-error { border-color: #ff6b6b; }.notification-warning { border-color: #f59e0b; }.notification-info { border-color: #00ccff; }.floating-elements { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; overflow: hidden; }.floating-element { position: absolute; width: 6px; height: 6px; background: var(--color-primary); border-radius: 50%; opacity: 0.3; animation: float 6s ease-in-out infinite; }.property-card.last-viewed { border-color: #f59e0b; box-shadow: 0 0 35px rgba(245,158,11,.4); }@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }@keyframes ripple { to { transform: scale(4); opacity: 0; } }@media (max-width: 768px) { .notification { right: 10px; left: 10px; max-width: none; } .property-header { flex-wrap: wrap; gap: 10px; } .property-actions { order: 3; width: 100%; justify-content: center; } .property-footer { flex-direction: column; gap: 1rem; } }</style>`;
    document.head.insertAdjacentHTML('beforeend', additionalStyles);
  }
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

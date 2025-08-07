/**
 * 🏢 سمسار طلبك - نظام عرض طلبات العملاء (النسخة المعدلة مع التمييز البصري)
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
    this.isHighlightedSection = false; // ⭐ إضافة جديدة لتتبع حالة التمييز
    
    this.config = {
      animationDuration: 300,
      cacheExpiry: 5 * 60 * 1000,
      loadingDelay: 800,
      welcomeDisplayTime: 7000,
      maxRetries: 3,
      retryDelay: 1000
    };

    this.categories = {
      "buy": { label: "🏠 شراء", icon: "🏠", color: "#00ff88", description: "طلبات شراء العقارات" },
      "rent": { label: "🏡 إيجار", icon: "🏡", color: "#00ccff", description: "طلبات إيجار العقارات" },
      "commercial": { label: "🏪 تجاري", icon: "🏪", color: "#ff6b35", description: "طلبات عقارات تجارية" },
      "land": { label: "🌳 أرض", icon: "🌳", color: "#8b5cf6", description: "طلبات أراضي" }
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
      
      // تحميل الفئة الافتراضية (مع الأخذ في الاعتبار التمييز)
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
    
    if (section === 'requests') {
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
        <h3>مرحبًا بك في طلبات العملاء!</h3>
        <p>تصفح أحدث طلبات العملاء للعقارات المطلوبة</p>
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
    this.container.classList.add('enhanced-requests-container');
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

  async handleDateFilterChange(newFilterValue) {
    this.currentDateFilter = newFilterValue;
    const cachedData = this.getCachedData(this.currentCategory);
    if (cachedData) {
      await this.displayRequests(cachedData, this.currentCategory);
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
    activeButton.animate([{ transform: 'scale(1.05)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1.05)' }], { duration: 200, easing: 'e

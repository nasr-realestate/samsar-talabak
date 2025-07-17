/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن
 * Enhanced Property Display System
 * 
 * ميزات متقدمة:
 * - تحميل ذكي للبيانات مع تخزين مؤقت
 * - تأثيرات بصرية متقدمة وتفاعلية
 * - نظام إشعارات ذكي
 * - تحسينات الأداء والاستجابة
 * - دعم كامل للأجهزة المحمولة
 */

class EnhancedPropertyDisplay {
  constructor() {
    this.container = null;
    this.filterContainer = null;
    this.welcomeBox = null;
    this.currentCategory = null;
    this.propertiesCache = new Map();
    this.isLoading = false;
    this.animationQueue = [];
    this.touchStartY = 0;
    this.touchEndY = 0;
    
    // إعدادات التطبيق
    this.config = {
      animationDuration: 300,
      cacheExpiry: 5 * 60 * 1000, // 5 دقائق
      loadingDelay: 800,
      welcomeDisplayTime: 7000,
      maxRetries: 3,
      retryDelay: 1000
    };

    // التصنيفات المحسنة
    this.categories = {
      "apartments": {
        label: "🏠 شقق للبيع",
        icon: "🏠",
        color: "#00ff88",
        description: "شقق سكنية فاخرة"
      },
      "apartments-rent": {
        label: "🏡 شقق للإيجار", 
        icon: "🏡",
        color: "#00ccff",
        description: "شقق للإيجار الشهري"
      },
      "shops": {
        label: "🏪 محلات تجارية",
        icon: "🏪", 
        color: "#ff6b35",
        description: "محلات ومساحات تجارية"
      },
      "offices": {
        label: "🏢 مكاتب إدارية",
        icon: "🏢",
        color: "#8b5cf6",
        description: "مكاتب ومساحات عمل"
      },
      "admin-hq": {
        label: "🏛️ مقرات إدارية",
        icon: "🏛️",
        color: "#f59e0b",
        description: "مقرات ومباني إدارية"
      }
    };

    this.init();
  }

  /**
   * تهيئة التطبيق
   */
  async init() {
    try {
      await this.waitForDOM();
      this.setupElements();
      this.setupEventListeners();
      this.setupTouchEvents();
      this.handleWelcomeMessage();
      this.createFilterButtons();
      this.loadDefaultCategory();
      this.setupPerformanceMonitoring();
      this.setupAccessibility();
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      this.showErrorMessage('حدث خطأ في تحميل التطبيق');
    }
  }

  /**
   * انتظار تحميل DOM
   */
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * إعداد العناصر الأساسية
   */
  setupElements() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");

    if (!this.container || !this.filterContainer) {
      throw new Error('العناصر الأساسية غير موجودة');
    }

    // إضافة فئات CSS للتحكم
    this.container.classList.add('enhanced-properties-container');
    this.filterContainer.classList.add('enhanced-filter-container');
  }

  /**
   * إعداد مستمعي الأحداث
   */
  setupEventListeners() {
    // مراقبة تغيير حجم النافذة
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // مراقبة التمرير
    window.addEventListener('scroll', this.throttle(() => {
      this.handleScroll();
    }, 100));

    // مراقبة حالة الاتصال
    window.addEventListener('online', () => {
      this.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('انقطع الاتصال بالإنترنت', 'warning');
    });

    // مراقبة أخطاء JavaScript
    window.addEventListener('error', (event) => {
      console.error('خطأ JavaScript:', event.error);
      this.showNotification('حدث خطأ تقني', 'error');
    });
  }

  /**
   * إعداد أحداث اللمس للأجهزة المحمولة
   */
  setupTouchEvents() {
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleSwipeGesture();
    }, { passive: true });
  }

  /**
   * معالجة إيماءات السحب
   */
  handleSwipeGesture() {
    const swipeThreshold = 50;
    const diff = this.touchStartY - this.touchEndY;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // سحب لأعلى - تحديث البيانات
        this.refreshCurrentCategory();
      } else {
        // سحب لأسفل - العودة للأعلى
        this.scrollToTop();
      }
    }
  }

  /**
   * معالجة رسالة الترحيب المحسنة
   */
  handleWelcomeMessage() {
    if (!this.welcomeBox) return;

    const hasShownWelcome = localStorage.getItem("welcomeShown");
    
    if (!hasShownWelcome) {
      // تأخير قصير لضمان تحميل الصفحة
      setTimeout(() => {
        this.showWelcomeMessage();
      }, 500);
    }
  }

  /**
   * عرض رسالة الترحيب مع تأثيرات متقدمة
   */
  showWelcomeMessage() {
    if (!this.welcomeBox) return;

    this.welcomeBox.style.display = "block";
    this.welcomeBox.style.opacity = "0";
    this.welcomeBox.style.transform = "translateY(30px) scale(0.95)";

    // تأثير الظهور التدريجي
    requestAnimationFrame(() => {
      this.welcomeBox.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      this.welcomeBox.style.opacity = "1";
      this.welcomeBox.style.transform = "translateY(0) scale(1)";
    });

    // إضافة تأثير الجسيمات
    this.createParticleEffect(this.welcomeBox);

    // تشغيل صوت ترحيب اختياري
    this.playWelcomeSound();

    // إخفاء الرسالة تلقائياً
    setTimeout(() => {
      this.hideWelcomeMessage();
    }, this.config.welcomeDisplayTime);
  }

  /**
   * إخفاء رسالة الترحيب
   */
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

  /**
   * تشغيل صوت ترحيب
   */
  playWelcomeSound() {
    try {
      // إنشاء نغمة ترحيب بسيطة
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // تجاهل أخطاء الصوت
      console.log('لا يمكن تشغيل الصوت:', error);
    }
  }

  /**
   * إنشاء تأثير الجسيمات
   */
  createParticleEffect(element) {
    const particles = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.7;
        z-index: 1000;
      `;

      const rect = element.getBoundingClientRect();
      particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
      particle.style.top = (rect.top + Math.random() * rect.height) + 'px';

      document.body.appendChild(particle);
      particles.push(particle);

      // تحريك الجسيم
      const animation = particle.animate([
        { transform: 'translateY(0px) scale(1)', opacity: 0.7 },
        { transform: `translateY(-${50 + Math.random() * 50}px) scale(0)`, opacity: 0 }
      ], {
        duration: 2000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      animation.onfinish = () => {
        particle.remove();
      };
    }
  }

  /**
   * إنشاء أزرار التصنيفات المحسنة
   */
  createFilterButtons() {
    this.filterContainer.innerHTML = '';

    Object.entries(this.categories).forEach(([key, category], index) => {
      const button = this.createFilterButton(key, category, index);
      this.filterContainer.appendChild(button);
    });
  }

  /**
   * إنشاء زر تصنيف واحد
   */
  createFilterButton(key, category, index) {
    const button = document.createElement("button");
    button.textContent = category.label;
    button.dataset.category = key;
    button.className = "filter-btn enhanced-filter-btn";
    button.title = category.description;

    // إضافة تأثير التأخير للظهور
    button.style.animationDelay = `${index * 100}ms`;
    button.style.setProperty('--category-color', category.color);

    // إضافة مستمع الحدث
    button.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleCategoryChange(key, button);
    });

    // تأثيرات الماوس المحسنة
    button.addEventListener('mouseenter', () => {
      this.createRippleEffect(button, category.color);
    });

    return button;
  }

  /**
   * إنشاء تأثير الموجة
   */
  createRippleEffect(element, color) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${color};
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      opacity: 0.3;
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

  /**
   * معالجة تغيير التصنيف
   */
  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;

    try {
      // تحديث حالة الأزرار
      this.updateActiveButton(button);
      
      // تحميل التصنيف الجديد
      await this.loadCategory(category);
      
      // حفظ التصنيف الحالي
      this.currentCategory = category;
      localStorage.setItem('lastCategory', category);

      // إشعار نجح
      this.showNotification(`تم تحميل ${this.categories[category].label}`, 'success');

    } catch (error) {
      console.error('خطأ في تغيير التصنيف:', error);
      this.showErrorMessage('فشل في تحميل التصنيف');
    }
  }

  /**
   * تحديث الزر النشط
   */
  updateActiveButton(activeButton) {
    // إزالة الحالة النشطة من جميع الأزرار
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.transform = 'scale(1)';
    });

    // تفعيل الزر المحدد
    activeButton.classList.add('active');
    activeButton.style.transform = 'scale(1.05)';

    // تأثير نبضة
    activeButton.animate([
      { transform: 'scale(1.05)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(1.05)' }
    ], {
      duration: 200,
      easing: 'ease-out'
    });
  }

  /**
   * تحميل التصنيف الافتراضي
   */
  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory');
    const defaultCategory = savedCategory && this.categories[savedCategory] 
      ? savedCategory 
      : Object.keys(this.categories)[0];

    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
    if (defaultButton) {
      defaultButton.click();
    }
  }

  /**
   * تحميل بيانات التصنيف
   */
  async loadCategory(category) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoadingState();

    try {
      // التحقق من التخزين المؤقت
      const cachedData = this.getCachedData(category);
      if (cachedData) {
        await this.displayProperties(cachedData, category);
        this.isLoading = false;
        return;
      }

      // تحميل البيانات من الخادم
      const data = await this.fetchCategoryData(category);
      
      // حفظ في التخزين المؤقت
      this.setCachedData(category, data);
      
      // عرض البيانات
      await this.displayProperties(data, category);

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      this.showErrorMessage('فشل في تحميل البيانات');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * جلب بيانات التصنيف من الخادم
   */
  async fetchCategoryData(category) {
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        // جلب قائمة الملفات
        const indexResponse = await fetch(`/samsar-talabak/data/properties/${category}/index.json`);
        if (!indexResponse.ok) {
          throw new Error(`HTTP ${indexResponse.status}`);
        }
        
        const files = await indexResponse.json();
        
        if (!Array.isArray(files) || files.length === 0) {
          return [];
        }

        // جلب بيانات كل ملف
        const propertyPromises = files.map(filename => 
          this.fetchPropertyData(category, filename)
        );

        const properties = await Promise.allSettled(propertyPromises);
        
        // تصفية النتائج الناجحة فقط
        return properties
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value)
          .filter(property => property !== null);

      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) {
          throw error;
        }
        
        // انتظار قبل المحاولة مرة أخرى
        await this.delay(this.config.retryDelay * retries);
      }
    }
  }

  /**
   * جلب بيانات عقار واحد
   */
  async fetchPropertyData(category, filename) {
    try {
      const response = await fetch(`/samsar-talabak/data/properties/${category}/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { ...data, filename, category };
      
    } catch (error) {
      console.warn(`فشل في تحميل ${filename}:`, error);
      return null;
    }
  }

  /**
   * عرض حالة التحميل
   */
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

    // تأثير شريط التقدم
    const progressBar = this.container.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.animate([
        { width: '0%' },
        { width: '70%' },
        { width: '100%' }
      ], {
        duration: this.config.loadingDelay,
        easing: 'ease-out'
      });
    }
  }

  /**
   * عرض العقارات
   */
  async displayProperties(properties, category) {
    if (!Array.isArray(properties)) {
      this.showErrorMessage('بيانات غير صحيحة');
      return;
    }

    if (properties.length === 0) {
      this.showEmptyState(category);
      return;
    }

    // مسح المحتوى الحالي
    this.container.innerHTML = '';

    // إضافة العقارات تدريجياً
    for (let i = 0; i < properties.length; i++) {
      await this.delay(50); // تأخير قصير بين العقارات
      const card = this.createPropertyCard(properties[i], category, i);
      this.container.appendChild(card);
      
      // تأثير الظهور
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }

    // إضافة تأثيرات التفاعل
    this.setupCardInteractions();
  }

  /**
   * إنشاء بطاقة عقار محسنة
   */
  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    
    card.className = `property-card enhanced-property-card card-${category}`;
    card.dataset.filename = property.filename;
    card.dataset.category = category;
    card.style.cssText = `
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation-delay: ${index * 100}ms;
    `;

    const detailPage = `/samsar-talabak/details.html?category=${category}&file=${encodeURIComponent(property.filename)}`;

    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" 
             alt="شعار سمسار طلبك" 
             class="property-logo"
             loading="lazy">
        <div class="property-brand">
          <strong>سمسار طلبك</strong>
          <span class="property-category-badge" style="background: ${categoryInfo.color}">
            ${categoryInfo.icon} ${categoryInfo.label}
          </span>
        </div>
        <div class="property-actions">
          <button class="favorite-btn" title="إضافة للمفضلة">
            <span class="heart-icon">♡</span>
          </button>
          <button class="share-btn" title="مشاركة">
            <span class="share-icon">📤</span>
          </button>
        </div>
      </div>

      <h2 class="property-title">${this.escapeHtml(property.title)}</h2>

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
          <span class="detail-icon">📅</span>
          <span class="detail-label">تاريخ الإضافة:</span>
          <span class="detail-value">${this.escapeHtml(property.date || "غير متوفر")}</span>
        </div>
        ${property.location ? `
        <div class="property-detail">
          <span class="detail-icon">📍</span>
          <span class="detail-label">الموقع:</span>
          <span class="detail-value">${this.escapeHtml(property.location)}</span>
        </div>
        ` : ''}
      </div>

      <div class="property-description">
        <p>${this.escapeHtml(property.description)}</p>
      </div>

      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">
          <span class="btn-icon">👁️</span>
          <span class="btn-text">عرض التفاصيل الكاملة</span>
          <span class="btn-arrow">←</span>
        </a>
        <div class="property-stats">
          <span class="stat-item">
            <span class="stat-icon">👀</span>
            <span class="stat-value">${Math.floor(Math.random() * 100) + 10}</span>
          </span>
          <span class="stat-item">
            <span class="stat-icon">⏰</span>
            <span class="stat-value">${this.getTimeAgo(property.date)}</span>
          </span>
        </div>
      </div>
    `;

    // إضافة مستمعي الأحداث
    this.setupCardEvents(card, property);

    return card;
  }

  /**
   * إعداد أحداث البطاقة
   */
  setupCardEvents(card, property) {
    // النقر على البطاقة
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.favorite-btn, .share-btn, .view-details-btn')) {
        this.handleCardClick(card, property);
      }
    });

    // زر المفضلة
    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFavorite(card, property);
    });

    // زر المشاركة
    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.shareProperty(property);
    });

    // تأثيرات الماوس
    card.addEventListener('mouseenter', () => {
      this.handleCardHover(card, true);
    });

    card.addEventListener('mouseleave', () => {
      this.handleCardHover(card, false);
    });
  }

  /**
   * معالجة النقر على البطاقة
   */
  handleCardClick(card, property) {
    // إزالة التمييز من البطاقات الأخرى
    this.container.querySelectorAll('.property-card').forEach(c => {
      c.classList.remove('highlighted');
    });

    // تمييز البطاقة المحددة
    card.classList.add('highlighted');
    
    // حفظ البطاقة المميزة
    localStorage.setItem('highlightCard', property.filename);

    // تأثير النقر
    card.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.98)' },
      { transform: 'scale(1)' }
    ], {
      duration: 150,
      easing: 'ease-out'
    });

    // التمرير للبطاقة
    card.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }

  /**
   * تبديل حالة المفضلة
   */
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

    // تأثير النبضة
    heartIcon.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
  }

  /**
   * مشاركة العقار
   */
  async shareProperty(property) {
    const shareData = {
      title: property.title,
      text: `شاهد هذا العقار المميز: ${property.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.showNotification('تم مشاركة العقار بنجاح', 'success');
      } else {
        // نسخ الرابط للحافظة
        await navigator.clipboard.writeText(window.location.href);
        this.showNotification('تم نسخ رابط العقار', 'success');
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
      this.showNotification('فشل في مشاركة العقار', 'error');
    }
  }

  /**
   * معالجة تمرير الماوس على البطاقة
   */
  handleCardHover(card, isHovering) {
    if (isHovering) {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = '0 25px 50px rgba(0, 255, 136, 0.2)';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    }
  }

  /**
   * إعداد تفاعلات البطاقات
   */
  setupCardInteractions() {
    // استعادة البطاقة المميزة
    const highlightedCard = localStorage.getItem('highlightCard');
    if (highlightedCard) {
      const card = this.container.querySelector(`[data-filename="${highlightedCard}"]`);
      if (card) {
        card.classList.add('highlighted');
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }

    // استعادة المفضلات
    this.restoreFavorites();
  }

  /**
   * استعادة المفضلات
   */
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

  /**
   * عرض حالة فارغة
   */
  showEmptyState(category) {
    const categoryInfo = this.categories[category];
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${categoryInfo.icon}</div>
        <h3>لا توجد عروض حالياً</h3>
        <p>لم يتم العثور على عقارات في فئة "${categoryInfo.label}"</p>
        <button class="refresh-btn" onclick="location.reload()">
          🔄 تحديث الصفحة
        </button>
      </div>
    `;
  }

  /**
   * عرض رسالة خطأ
   */
  showErrorMessage(message) {
    this.container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>حدث خطأ</h3>
        <p>${message}</p>
        <div class="error-actions">
          <button class="retry-btn" onclick="location.reload()">
            🔄 إعادة المحاولة
          </button>
          <button class="contact-btn" onclick="window.open('tel:+201234567890')">
            📞 اتصل بنا
          </button>
        </div>
      </div>
    `;
  }

  /**
   * عرض إشعار
   */
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

    // إضافة للصفحة
    document.body.appendChild(notification);

    // تأثير الظهور
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // إزالة تلقائية
    setTimeout(() => {
      this.hideNotification(notification);
    }, 4000);

    // زر الإغلاق
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.hideNotification(notification);
    });
  }

  /**
   * إخفاء الإشعار
   */
  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  /**
   * الحصول على أيقونة الإشعار
   */
  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * تحديث التصنيف الحالي
   */
  async refreshCurrentCategory() {
    if (!this.currentCategory || this.isLoading) return;

    // مسح التخزين المؤقت
    this.clearCachedData(this.currentCategory);
    
    // إعادة تحميل
    await this.loadCategory(this.currentCategory);
    
    this.showNotification('تم تحديث البيانات', 'success');
  }

  /**
   * التمرير للأعلى
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * معالجة تغيير حجم النافذة
   */
  handleResize() {
    // إعادة حساب تخطيط البطاقات
    this.updateCardLayout();
  }

  /**
   * معالجة التمرير
   */
  handleScroll() {
    const scrollTop = window.pageYOffset;
    
    // إخفاء/إظهار أزرار التصنيف عند التمرير
    if (scrollTop > 200) {
      this.filterContainer.classList.add('scrolled');
    } else {
      this.filterContainer.classList.remove('scrolled');
    }
  }

  /**
   * تحديث تخطيط البطاقات
   */
  updateCardLayout() {
    const cards = this.container.querySelectorAll('.property-card');
    cards.forEach((card, index) => {
      // إعادة حساب التأخير للتأثيرات
      card.style.animationDelay = `${index * 50}ms`;
    });
  }

  /**
   * إعداد مراقبة الأداء
   */
  setupPerformanceMonitoring() {
    // مراقبة أداء التحميل
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

  /**
   * إعداد إمكانية الوصول
   */
  setupAccessibility() {
    // إضافة دعم لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // إغلاق الإشعارات
        document.querySelectorAll('.notification').forEach(notification => {
          this.hideNotification(notification);
        });
      }
    });

    // إضافة تسميات ARIA
    this.container.setAttribute('aria-label', 'قائمة العقارات');
    this.filterContainer.setAttribute('aria-label', 'تصنيفات العقارات');
  }

  // === وظائف مساعدة ===

  /**
   * تأخير تنفيذ الوظيفة
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * تحديد معدل تنفيذ الوظيفة
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * تأخير زمني
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * تنظيف النص من HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * حساب الوقت المنقضي
   */
  getTimeAgo(dateString) {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'اليوم';
      if (diffDays === 1) return 'أمس';
      if (diffDays < 7) return `${diffDays} أيام`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} أسابيع`;
      return `${Math.floor(diffDays / 30)} شهور`;
    } catch {
      return 'غير محدد';
    }
  }

  // === إدارة التخزين المؤقت ===

  /**
   * الحصول على البيانات المخزنة مؤقتاً
   */
  getCachedData(category) {
    const cached = this.propertiesCache.get(category);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheExpiry) {
      this.propertiesCache.delete(category);
      return null;
    }

    return cached.data;
  }

  /**
   * حفظ البيانات في التخزين المؤقت
   */
  setCachedData(category, data) {
    this.propertiesCache.set(category, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * مسح البيانات المخزنة مؤقتاً
   */
  clearCachedData(category) {
    if (category) {
      this.propertiesCache.delete(category);
    } else {
      this.propertiesCache.clear();
    }
  }

  // === إدارة المفضلات ===

  /**
   * إضافة للمفضلة
   */
  addFavorite(property) {
    const favorites = this.getFavorites();
    if (!favorites.includes(property.filename)) {
      favorites.push(property.filename);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  /**
   * إزالة من المفضلة
   */
  removeFavorite(filename) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(filename);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  /**
   * الحصول على المفضلات
   */
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  }
}

// === تشغيل التطبيق ===

// تهيئة التطبيق عند تحميل الصفحة
const propertyDisplay = new EnhancedPropertyDisplay();

// إضافة أنماط CSS إضافية
const additionalStyles = `
  <style>
    /* تأثيرات الإشعارات */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 350px;
    }

    .notification.show {
      transform: translateX(0);
      opacity: 1;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #f1f1f1;
    }

    .notification-close {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 1.2rem;
      margin-left: auto;
    }

    .notification-success { border-color: #00ff88; }
    .notification-error { border-color: #ff6b6b; }
    .notification-warning { border-color: #ffa500; }
    .notification-info { border-color: #00ccff; }

    /* تحسينات البطاقات */
    .property-category-badge {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 15px;
      color: #000;
      font-weight: bold;
    }

    .property-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }

    .favorite-btn, .share-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .favorite-btn:hover, .share-btn:hover {
      background: rgba(0, 255, 136, 0.2);
      transform: scale(1.1);
    }

    .property-stats {
      display: flex;
      gap: 15px;
      font-size: 0.9rem;
      color: #888;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* حالات خاصة */
    .empty-state, .error-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #888;
    }

    .empty-icon, .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .refresh-btn, .retry-btn, .contact-btn {
      background: linear-gradient(45deg, #00ff88, #00cc6a);
      color: #000;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      margin: 0.5rem;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover, .retry-btn:hover, .contact-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
    }

    /* تحسينات الاستجابة */
    @media (max-width: 768px) {
      .notification {
        right: 10px;
        left: 10px;
        max-width: none;
      }
      
      .property-header {
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .property-actions {
        order: 3;
        width: 100%;
        justify-content: center;
      }
    }

    /* تأثيرات التحميل المحسنة */
    .loading-container {
      text-align: center;
      padding: 4rem 2rem;
      color: #f1f1f1;
    }

    .loading-spinner-enhanced {
      width: 60px;
      height: 60px;
      border: 4px solid #333;
      border-top: 4px solid #00ff88;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 2rem;
    }

    .loading-progress {
      width: 200px;
      height: 4px;
      background: #333;
      border-radius: 2px;
      margin: 2rem auto;
      overflow: hidden;
    }

    .loading-progress-bar {
      height: 100%;
      background: linear-gradient(45deg, #00ff88, #00cc6a);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  </style>
`;

// إضافة الأنماط للصفحة
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// تصدير للاستخدام العام
window.EnhancedPropertyDisplay = EnhancedPropertyDisplay;


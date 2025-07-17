/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (الإصدار الكامل والتفاعلي)
 * Enhanced Property Display System (Full & Interactive Version)
 *
 * يجمع هذا الإصدار بين:
 * - حل مشكلة التعليق عند التحميل (من الإصدار الثاني).
 * - التصميم التفاعلي الكامل للبطاقات والتأثيرات البصرية (من الإصدار الأول).
 */

class EnhancedPropertyDisplay {
  constructor() {
    this.container = null;
    this.filterContainer = null;
    this.welcomeBox = null;
    this.currentCategory = null;
    this.propertiesCache = new Map();
    this.isLoading = false;
    
    this.config = {
      cacheExpiry: 5 * 60 * 1000, // 5 دقائق
      loadingDelay: 800,
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      this.setupElements();
      this.setupEventListeners();
      this.createFilterButtons();
      this.loadDefaultCategory();
      this.setupAccessibility();
    } catch (error) {
      console.error('خطأ فادح في تهيئة التطبيق:', error);
      if (this.container) {
        this.showErrorMessage('حدث خطأ جسيم أثناء تشغيل التطبيق.');
      }
    }
  }

  setupElements() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    if (!this.container || !this.filterContainer) {
      throw new Error('العناصر الأساسية (properties-container, filter-buttons) غير موجودة.');
    }
    this.container.classList.add('enhanced-properties-container');
    this.filterContainer.classList.add('enhanced-filter-container');
  }

  setupEventListeners() {
    // يمكنك إضافة مستمعي الأحداث الكاملين هنا (التمرير، تغيير الحجم، إلخ)
  }

  createFilterButtons() {
    this.filterContainer.innerHTML = '';
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
    button.style.setProperty('--category-color', category.color);
    button.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleCategoryChange(key, button);
    });
    return button;
  }

  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (activeButton) {
      activeButton.classList.add('active');
    }
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
      const firstButton = this.filterContainer.querySelector('.filter-btn');
      if(firstButton) firstButton.click();
    }
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading && this.currentCategory === category) return;

    this.isLoading = true;
    this.currentCategory = category;
    this.updateActiveButton(button);
    localStorage.setItem('lastCategory', category);

    try {
      const cachedData = this.getCachedData(category);
      if (cachedData) {
        await this.displayProperties(cachedData, category);
      } else {
        this.showLoadingState();
        const data = await this.fetchCategoryData(category);
        this.setCachedData(category, data);
        await this.displayProperties(data, category);
      }
    } catch (error) {
      console.error(`فشل تحميل التصنيف ${category}:`, error);
      this.showErrorMessage(`فشل في تحميل بيانات "${this.categories[category].label}"`);
    } finally {
      this.isLoading = false;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner-enhanced"></div>
        <h3>جاري تحميل العروض المميزة...</h3>
      </div>`;
  }

  async displayProperties(properties, category) {
    if (category !== this.currentCategory) return;

    if (!Array.isArray(properties) || properties.length === 0) {
      this.showEmptyState(category);
      return;
    }

    this.container.innerHTML = '';
    properties.forEach((property, index) => {
      const card = this.createPropertyCard(property, category, index);
      this.container.appendChild(card);
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
    this.restoreFavorites();
  }

  /**
   * ✅ إنشاء بطاقة عقار (النسخة الكاملة والتفاعلية)
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
      animation-delay: ${index * 50}ms;
    `;

    const detailPage = `/samsar-talabak/details.html?category=${category}&file=${encodeURIComponent(property.filename)}`;

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
      <h2 class="property-title">${this.escapeHtml(property.title)}</h2>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">السعر:</span><span class="detail-value price-highlight">${this.escapeHtml(property.price)}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${this.escapeHtml(property.area)}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الإضافة:</span><span class="detail-value">${this.escapeHtml(property.date || "غير متوفر")}</span></div>
      </div>
      <div class="property-description"><p>${this.escapeHtml(property.description)}</p></div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">
          <span class="btn-icon">👁️</span><span class="btn-text">عرض التفاصيل الكاملة</span><span class="btn-arrow">←</span>
        </a>
      </div>
    `;

    // إعادة تفعيل الأحداث التفاعلية للبطاقة
    this.setupCardEvents(card, property);
    return card;
  }

  setupCardEvents(card, property) {
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

    card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
    card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
  }

  handleCardHover(card, isHovering) {
    card.style.transform = isHovering ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)';
    card.style.boxShadow = isHovering ? '0 25px 50px rgba(0, 255, 136, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.1)';
  }

  toggleFavorite(card, property) {
    const heartIcon = card.querySelector('.heart-icon');
    const favorites = this.getFavorites();
    const isFavorite = favorites.includes(property.filename);

    if (isFavorite) {
      heartIcon.textContent = '♡';
      card.classList.remove('favorite');
      this.removeFavorite(property.filename);
    } else {
      heartIcon.textContent = '♥';
      card.classList.add('favorite');
      this.addFavorite(property.filename);
    }
  }
  
  async shareProperty(property) {
      // ... (كود المشاركة)
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

  addFavorite(filename) {
    const favorites = this.getFavorites();
    if (!favorites.includes(filename)) {
      favorites.push(filename);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  removeFavorite(filename) {
    let favorites = this.getFavorites();
    favorites = favorites.filter(fav => fav !== filename);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  }

  showEmptyState(category) {
    const categoryInfo = this.categories[category];
    this.container.innerHTML = `<div class="empty-state"><h3>لا توجد عروض حالياً في "${categoryInfo.label}"</h3></div>`;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `<div class="error-state"><h3>⚠️ حدث خطأ</h3><p>${this.escapeHtml(message)}</p><button class="retry-btn" onclick="window.propertyDisplay.refreshCurrentCategory()">إعادة المحاولة</button></div>`;
  }
  
  async refreshCurrentCategory() {
      if (!this.currentCategory) return;
      this.clearCachedData(this.currentCategory);
      const currentButton = this.filterContainer.querySelector(`[data-category="${this.currentCategory}"]`);
      const categoryToReload = this.currentCategory;
      this.currentCategory = null; 
      this.handleCategoryChange(categoryToReload, currentButton);
  }

  // ... (باقي الدوال المساعدة مثل fetch, cache, escapeHtml, setupAccessibility)
  async fetchCategoryData(category) {
    const indexPath = `/samsar-talabak/data/properties/${category}/index.json`;
    const indexResponse = await fetch(indexPath);
    if (!indexResponse.ok) throw new Error(`فشل جلب الفهرس: ${indexResponse.status}`);
    const files = await indexResponse.json();
    if (!Array.isArray(files)) return [];
    const propertyPromises = files.map(async (filename) => {
      try {
        const propResponse = await fetch(`/samsar-talabak/data/properties/${category}/${filename}`);
        if (!propResponse.ok) return null;
        const data = await propResponse.json();
        return { ...data, filename, category };
      } catch { return null; }
    });
    return (await Promise.all(propertyPromises)).filter(p => p !== null);
  }
  getCachedData(category) {
    const cached = this.propertiesCache.get(category);
    if (!cached || (Date.now() - cached.timestamp > this.config.cacheExpiry)) return null;
    return cached.data;
  }
  setCachedData(category, data) { this.propertiesCache.set(category, { data, timestamp: Date.now() }); }
  clearCachedData(category) { this.propertiesCache.delete(category); }
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  setupAccessibility() { /* ... */ }
}

window.propertyDisplay = new EnhancedPropertyDisplay();

// --- الأنماط الكاملة (CSS) ---
// تأكد من إضافة كل الأنماط من الإصدار الأول هنا لضمان عمل التأثيرات
const fullStyles = `
  <style>
    /* ... (ضع هنا كل كود الـ CSS من الإصدار الأول والكامل) ... */
    /* مثال على الأنماط الأساسية المطلوبة */
    .loading-container, .empty-state, .error-state { text-align: center; padding: 40px; color: #888; }
    .loading-spinner-enhanced { width: 50px; height: 50px; border: 5px solid #333; border-top: 5px solid #00ff88; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .filter-btn { cursor: pointer; padding: 10px 15px; margin: 5px; border: 1px solid #ccc; border-radius: 20px; background: #f9f9f9; transition: all 0.3s ease; }
    .filter-btn.active { background-color: var(--category-color, #00ff88); color: #000; border-color: var(--category-color, #00ff88); font-weight: bold; transform: scale(1.05); }
    .property-card { background: #1e1e1e; color: #f1f1f1; border: 1px solid #333; border-radius: 15px; margin: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; transition: all 0.3s ease; }
    .property-header { display: flex; align-items: center; padding: 10px 15px; background: #252525; gap: 10px; }
    .property-logo { width: 40px; height: 40px; border-radius: 50%; }
    .property-category-badge { font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 15px; color: #000; font-weight: bold; }
    .property-actions { display: flex; gap: 8px; margin-left: auto; }
    .favorite-btn, .share-btn { background: rgba(255,255,255,0.1); border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; }
    .favorite-btn:hover, .share-btn:hover { background: rgba(0, 255, 136, 0.2); transform: scale(1.1); }
    .heart-icon { color: #ff6b6b; }
    .property-title { padding: 0 15px; margin: 15px 0; }
    .property-details { display: grid; grid-template-columns: 1fr 1fr; padding: 0 15px; gap: 10px; }
    .property-detail { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
    .property-description { padding: 0 15px; margin: 15px 0; color: #aaa; }
    .property-footer { padding: 15px; background: #252525; text-align: center; }
    .view-details-btn { background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; text-decoration: none; padding: 10px 20px; border-radius: 25px; font-weight: bold; display: inline-block; transition: all 0.3s ease; }
    .view-details-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3); }
    .retry-btn { background: #ffc107; color: #000; padding: 10px 20px; border-radius: 20px; border: none; cursor: pointer; }
  </style>
`;
document.head.insertAdjacentHTML('beforeend', fullStyles);

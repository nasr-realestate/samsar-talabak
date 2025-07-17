/**
 * 🏢 سمسار طلبك - نظام عرض العقارات (الإصدار الاحترافي)
 * Semsar Talabak - Professional Display System
 *
 * التحسينات في هذا الإصدار:
 * - تصميم جديد واحترافي للبطاقات.
 * - إصلاح مشكلة عدم ظهور "المساحة".
 * - تحسين رأس البطاقة ليصبح أكثر جاذبية.
 * - تنظيم بصري أفضل للمعلومات.
 */

class EnhancedPropertyDisplay {
  // ... (الكود الخاص بالـ Class من الإصدار السابق يبقى كما هو)
  constructor() {
    this.container = null;
    this.filterContainer = null;
    this.currentCategory = null;
    this.propertiesCache = new Map();
    this.isLoading = false;
    
    this.config = {
      cacheExpiry: 5 * 60 * 1000, // 5 دقائق
    };

    this.categories = {
      "apartments": { label: "شقق للبيع", icon: "🏠", color: "#2ecc71" },
      "apartments-rent": { label: "شقق للإيجار", icon: "🏡", color: "#3498db" },
      "shops": { label: "محلات تجارية", icon: "🏪", color: "#e67e22" },
      "offices": { label: "مكاتب إدارية", icon: "🏢", color: "#9b59b6" },
      "admin-hq": { label: "مقرات إدارية", icon: "🏛️", color: "#f1c40f" }
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
      this.createFilterButtons();
      this.loadDefaultCategory();
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
      throw new Error('العناصر الأساسية غير موجودة.');
    }
  }

  createFilterButtons() {
    this.filterContainer.innerHTML = '';
    Object.entries(this.categories).forEach(([key, category]) => {
      const button = document.createElement("button");
      button.innerHTML = `${category.icon} ${category.label}`;
      button.dataset.category = key;
      button.className = "filter-btn";
      button.style.setProperty('--category-color', category.color);
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCategoryChange(key, button);
      });
      this.filterContainer.appendChild(button);
    });
  }

  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (activeButton) activeButton.classList.add('active');
  }

  loadDefaultCategory() {
    const defaultCategory = Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategory}"]`);
    if (defaultButton) defaultButton.click();
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading && this.currentCategory === category) return;
    this.isLoading = true;
    this.currentCategory = category;
    this.updateActiveButton(button);
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
      this.showErrorMessage(`فشل تحميل بيانات "${this.categories[category].label}"`);
    } finally {
      this.isLoading = false;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div><p>جاري تحميل العروض...</p></div>`;
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
  }

  /**
   * ✅ إنشاء بطاقة عقار (تصميم احترافي جديد)
   */
  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    
    card.className = "property-card-pro";
    card.style.setProperty('--category-color', categoryInfo.color);
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 70}ms`;

    const detailPage = `/samsar-talabak/details.html?category=${category}&file=${encodeURIComponent(property.filename)}`;

    card.innerHTML = `
      <div class="pro-card-header">
        <div class="pro-card-icon">${categoryInfo.icon}</div>
        <div class="pro-card-category">${categoryInfo.label}</div>
        <div class="pro-card-logo">سمسار طلبك</div>
      </div>

      <div class="pro-card-body">
        <h3 class="pro-card-title">${this.escapeHtml(property.title)}</h3>
        
        <div class="pro-card-details">
          <div class="detail-item">
            <span class="detail-icon">💰</span>
            <span class="detail-label">السعر:</span>
            <span class="detail-value price">${this.escapeHtml(property.price)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">📏</span>
            <span class="detail-label">المساحة:</span>
            <span class="detail-value">${this.escapeHtml(property.area)}</span>
          </div>
          ${property.location ? `
          <div class="detail-item">
            <span class="detail-icon">📍</span>
            <span class="detail-label">الموقع:</span>
            <span class="detail-value">${this.escapeHtml(property.location)}</span>
          </div>` : ''}
        </div>

        <p class="pro-card-description">${this.escapeHtml(property.description)}</p>
      </div>

      <div class="pro-card-footer">
        <a href="${detailPage}" class="pro-details-btn">
          عرض التفاصيل الكاملة <span class="arrow">→</span>
        </a>
      </div>
    `;
    return card;
  }

  // ... باقي الدوال المساعدة (fetch, cache, error handling, etc.)
  showEmptyState(category) { this.container.innerHTML = `<div class="empty-state"><h3>لا توجد عروض حالياً في "${this.categories[category].label}"</h3></div>`; }
  showErrorMessage(message) { this.container.innerHTML = `<div class="error-state"><h3>⚠️ حدث خطأ</h3><p>${this.escapeHtml(message)}</p></div>`; }
  async fetchCategoryData(category) { /* ... نفس الكود ... */ 
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
  getCachedData(category) { const cached = this.propertiesCache.get(category); if (!cached || (Date.now() - cached.timestamp > this.config.cacheExpiry)) return null; return cached.data; }
  setCachedData(category, data) { this.propertiesCache.set(category, { data, timestamp: Date.now() }); }
  escapeHtml(text) { if (typeof text !== 'string') return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
}

window.propertyDisplay = new EnhancedPropertyDisplay();

// --- أنماط CSS الجديدة للتصميم الاحترافي ---
const professionalStyles = `
  <style>
    :root {
      --card-bg: #1e1e1e;
      --card-border: #333;
      --text-primary: #f1f1f1;
      --text-secondary: #aaa;
      --font-family: 'Tajawal', sans-serif; /* استخدام خط عربي مميز */
    }
    
    /* إضافة الخط من جوجل */
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');

    body {
      font-family: var(--font-family);
    }

    .filter-btn {
      font-family: var(--font-family);
      background: #252525;
      color: var(--text-secondary);
      border: 1px solid var(--card-border);
      padding: 10px 20px;
      margin: 5px;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }
    .filter-btn:hover {
      background: var(--card-border);
      color: var(--text-primary);
    }
    .filter-btn.active {
      background: var(--category-color);
      color: #000;
      font-weight: 700;
      border-color: var(--category-color);
      transform: scale(1.05);
    }

    .property-card-pro {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      margin: 20px auto;
      max-width: 600px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
    }

    .pro-card-header {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      background: linear-gradient(135deg, var(--category-color) 0%, #2c3e50 150%);
      color: #000;
      font-weight: 700;
    }
    .pro-card-icon {
      font-size: 1.8rem;
      margin-right: 12px;
    }
    .pro-card-category {
      font-size: 1.1rem;
    }
    .pro-card-logo {
      margin-left: auto;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .pro-card-body {
      padding: 20px;
      flex-grow: 1;
    }
    .pro-card-title {
      font-size: 1.6rem;
      margin: 0 0 20px 0;
      color: var(--text-primary);
    }
    
    .pro-card-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
      padding: 15px;
      background: #252525;
      border-radius: 10px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    .detail-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .detail-value.price {
      color: var(--category-color);
    }

    .pro-card-description {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .pro-card-footer {
      padding: 20px;
      background: #252525;
      border-top: 1px solid var(--card-border);
      text-align: center;
    }
    .pro-details-btn {
      background: var(--category-color);
      color: #000;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 1rem;
      display: inline-block;
      transition: all 0.3s ease;
    }
    .pro-details-btn:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
    .pro-details-btn .arrow {
      transition: transform 0.3s ease;
      display: inline-block;
    }
    .pro-details-btn:hover .arrow {
      transform: translateX(5px);
    }
    
    .loading-container, .empty-state, .error-state { text-align: center; padding: 40px; color: #888; }
    .loading-spinner { width: 50px; height: 50px; border: 5px solid #333; border-top: 5px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
`;
document.head.insertAdjacentHTML('beforeend', professionalStyles);

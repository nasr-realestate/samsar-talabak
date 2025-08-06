/**
 * 🏢 سمسار طلبك - نظام عرض العقارات (النسخة النهائية v4.0 - استعادة التصميم الأصلي 100%)
 */

class EnhancedPropertyDisplay {
  constructor() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");
    this.currentCategory = null;
    this.currentDateFilter = 'latest';
    this.propertiesCache = new Map();
    this.isLoading = false;
    
    this.config = { /* ... configuration ... */ };

    this.categories = {
      "apartments": { label: "🏠 شقق للبيع", icon: "🏠", color: "#00ff88" },
      "apartments-rent": { label: "🏡 شقق للإيجار", icon: "🏡", color: "#00ccff" },
      "shops": { label: "🏪 محلات تجارية", icon: "🏪", color: "#ff6b35" },
      "offices": { label: "🏢 مكاتب إدارية", icon: "🏢", color: "#8b5cf6" },
      "admin-hq": { label: "🏛️ مقرات إدارية", icon: "🏛️", color: "#f59e0b" }
    };

    this.init();
  }

  async init() {
    try {
      await this.waitForDOM();
      this.setupElements();
      this.createFilterButtons();
      this.createDateFilter();
      this.loadDefaultCategory();
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      this.showErrorMessage('حدث خطأ في تحميل التطبيق');
    }
  }

  waitForDOM() {
    return new Promise(resolve => {
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
  }
  
  createFilterButtons() {
    Object.entries(this.categories).forEach(([key, category]) => {
      const button = this.createFilterButton(key, category);
      this.filterContainer.appendChild(button);
    });
  }

  createFilterButton(key, category) {
    const button = document.createElement("button");
    button.innerHTML = `${category.icon} ${category.label.split(' ')[1]}`;
    button.dataset.category = key;
    button.className = "filter-btn";
    button.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleCategoryChange(key, button);
    });
    return button;
  }

  createDateFilter() {
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'date-filter-wrapper';
    filterWrapper.innerHTML = `<label for="date-filter" class="date-filter-label">الفرز حسب:</label><select id="date-filter" class="date-filter-select"><option value="latest">الأحدث أولاً</option><option value="all">كل الأوقات</option><option value="last_week">آخر أسبوع</option><option value="last_month">آخر شهر</option></select>`;
    this.filterContainer.appendChild(filterWrapper);
    document.getElementById('date-filter').addEventListener('change', (e) => this.handleDateFilterChange(e.target.value));
  }

  async handleDateFilterChange(newFilterValue) {
    this.currentDateFilter = newFilterValue;
    if(this.currentCategory) {
        await this.loadCategory(this.currentCategory, true);
    }
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    this.currentCategory = category;
    this.updateActiveButton(button);
    await this.loadCategory(category);
    localStorage.setItem('lastCategory', category);
  }
  
  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    if(activeButton) {
        activeButton.classList.add('active');
    }
  }

  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory') || Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${savedCategory}"]`);
    if (defaultButton) {
      defaultButton.click();
    }
  }

  async loadCategory(category, forceRefresh = false) {
    this.isLoading = true;
    this.showLoadingState();
    try {
      let data = this.getCachedData(category);
      if (!data || forceRefresh) {
        data = await this.fetchCategoryData(category);
        this.setCachedData(category, data);
      }
      this.displayProperties(data);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      this.showErrorMessage('فشل في تحميل البيانات');
    } finally {
      this.isLoading = false;
    }
  }

  async fetchCategoryData(category) {
    const indexResponse = await fetch(`/data/properties/${category}/index.json?t=${Date.now()}`);
    if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
    const files = await indexResponse.json();
    if (!Array.isArray(files) || files.length === 0) return [];
    const propertyPromises = files.map(filename => this.fetchPropertyData(category, filename));
    return Promise.all(propertyPromises).then(properties => properties.filter(p => p !== null));
  }

  async fetchPropertyData(category, filename) {
    try {
      const response = await fetch(`/data/properties/${category}/${filename}?t=${Date.now()}`);
      if (!response.ok) return null;
      const data = await response.json();
      return { ...data, filename, category };
    } catch (error) {
      console.warn(`فشل في تحميل ${filename}:`, error);
      return null;
    }
  }

  showLoadingState() {
    this.container.innerHTML = `<div class="loading-message">جاري تحميل العروض...</div>`;
  }
  
  applyFiltersAndSorting(properties) {
    let processedProperties = [...properties];

    if (this.currentDateFilter !== 'all') {
      processedProperties.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
    }

    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const now = new Date();
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedProperties = processedProperties.filter(p => {
        if (!p.date) return false;
        const propDate = new Date(p.date);
        const diffDays = (now - propDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= daysToFilter;
      });
    }
    
    return processedProperties;
  }
  
  displayProperties(properties) {
    const filteredProperties = this.applyFiltersAndSorting(properties);
    if (filteredProperties.length === 0) {
      this.showEmptyState();
      return;
    }
    this.container.innerHTML = '';
    filteredProperties.forEach((property, index) => {
      const card = this.createPropertyCard(property, this.currentCategory, index);
      this.container.appendChild(card);
    });
  }

  createPropertyCard(property, category) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = "property-card";

    const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/property/${propertyId}`;
    
    const priceToRender = this.escapeHtml(property.price_display || property.price || "غير محدد");
    const areaToRender = this.escapeHtml(property.area_display || property.area || "غير محددة");
    const title = this.escapeHtml(property.title);
    const descriptionText = this.escapeHtml(property.summary || property.description || '');

    card.innerHTML = `
        <div class="property-header">
            <div class="property-brand">
                سمسار طلبك
                <span class="property-category-badge" style="background-color: ${categoryInfo.color}; color: black;">
                    ${categoryInfo.icon} ${categoryInfo.label}
                </span>
            </div>
            <img src="https://i.postimg.cc/sfh9DRb0/samsar-logo-enhanced.png" alt="شعار سمسار طلبك" class="property-logo">
        </div>
        <h3 class="property-title">${title}</h3>
        <div class="property-description">
            <p>${descriptionText}</p>
        </div>
        <div class="property-details">
            <div class="property-detail">
                <span>${priceToRender}</span>
                <span class="detail-label">السعر</span>
            </div>
            <div class="property-detail">
                <span>${areaToRender}</span>
                <span class="detail-label">المساحة</span>
            </div>
        </div>
        <div class="property-footer">
            <a href="${detailPage}" class="view-details-btn">عرض التفاصيل الكاملة ←</a>
            <div class="property-stats">
                <span class="stat-item">👀 ${Math.floor(Math.random() * 100) + 10}</span>
                <span class="stat-item">⏰ ${this.getTimeAgo(property.date)}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = detailPage;
      }
    });

    return card;
  }
  
  showEmptyState() {
    this.container.innerHTML = `<p class="empty-state">لا توجد عروض تطابق هذا الفلتر حاليًا.</p>`;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `<p class="error-state">حدث خطأ: ${message}</p>`;
  }

  escapeHtml(text) { if (typeof text !== 'string') return text; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  getTimeAgo(dateString) { if (!dateString) return 'منذ فترة'; const date = new Date(dateString); const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)); if (diffDays < 1) return 'اليوم'; if (diffDays === 1) return 'أمس'; return `منذ ${diffDays} أيام`; }
  getCachedData(category) { const cached = this.propertiesCache.get(category); if (cached && Date.now() - cached.timestamp < 300000) { return cached.data; } return null; }
  setCachedData(category, data) { this.propertiesCache.set(category, { data, timestamp: Date.now() }); }
}

if(document.getElementById("properties-container")) {
    new EnhancedPropertyDisplay();
}

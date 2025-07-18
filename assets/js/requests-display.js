/**
 * 🏢 سمسار طلبك - نظام عرض الطلبات الذكي (النسخة الكاملة)
 * Enhanced Request Display System (Full Version)
 * 
 * الميزات:
 * - بناء احترافي باستخدام الكلاسات.
 * - فلاتر متقدمة (نوع الطلب + التاريخ).
 * - نظام كاش لتحميل فائق السرعة.
 * - تصميم بصري جذاب وتفاعلي.
 * - تمييز آخر طلب تم عرضه.
 * - نظام إشعارات ورسائل خطأ احترافي.
 */

class EnhancedRequestDisplay {
  constructor() {
    this.container = null;
    this.filterContainer = null;
    this.currentCategory = null;
    this.currentDateFilter = 'latest';
    this.requestsCache = new Map();
    this.isLoading = false;

    this.config = {
      cacheExpiry: 5 * 60 * 1000,
      loadingDelay: 800,
      maxRetries: 3,
      retryDelay: 1000
    };

    // نصوص عالية الجودة لأنواع الطلبات
    this.categories = {
      "apartments": { label: "🏙️ مطلوب شقق شراء", icon: "🏙️" },
      "apartments-rent": { label: "🔑 مطلوب شقق إيجار", icon: "🔑" },
      "shops": { label: "🛍️ مطلوب محلات", icon: "🛍️" },
      "offices": { label: "💼 مطلوب مكاتب", icon: "💼" },
      "admin-hq": { label: "🏦 مطلوب مقرات إدارية", icon: "🏦" }
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
      console.error('خطأ في تهيئة صفحة الطلبات:', error);
      this.showErrorMessage('حدث خطأ في تحميل الصفحة');
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
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");

    if (!this.container || !this.filterContainer) {
      throw new Error('حاويات الطلبات أو الفلاتر غير موجودة');
    }
  }

  createFilterButtons() {
    Object.entries(this.categories).forEach(([key, category], index) => {
      const button = document.createElement("button");
      button.textContent = category.label;
      button.dataset.category = key;
      button.className = "filter-btn enhanced-filter-btn";
      button.style.animationDelay = `${index * 100}ms`;
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCategoryChange(key, button);
      });
      this.filterContainer.appendChild(button);
    });
  }

  createDateFilter() {
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'date-filter-wrapper';
    filterWrapper.innerHTML = `
      <label for="date-filter" class="date-filter-label">📅 ترتيب الطلبات:</label>
      <select id="date-filter" class="date-filter-select">
        <option value="latest">الأحدث أولاً</option>
        <option value="all">كل الطلبات</option>
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
    const cachedData = this.requestsCache.get(this.currentCategory);
    if (cachedData) {
      await this.displayRequests(cachedData.data, this.currentCategory);
    }
  }

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    this.currentCategory = category;
    this.updateActiveButton(button);
    await this.loadCategory(category);
  }

  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  loadDefaultCategory() {
    const defaultCategory = Object.keys(this.categories)[0];
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
      const cached = this.requestsCache.get(category);
      if (cached && (Date.now() - cached.timestamp < this.config.cacheExpiry)) {
        await this.displayRequests(cached.data, category);
        return;
      }
      
      const data = await this.fetchCategoryData(category);
      this.requestsCache.set(category, { data, timestamp: Date.now() });
      await this.displayRequests(data, category);

    } catch (error) {
      console.error('خطأ في تحميل بيانات الطلبات:', error);
      this.showErrorMessage('فشل تحميل بيانات الطلبات');
    } finally {
      this.isLoading = false;
    }
  }

  async fetchCategoryData(category) {
    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        const indexResponse = await fetch(`/samsar-talabak/data/requests/${category}/index.json`);
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const files = await indexResponse.json();
        if (!Array.isArray(files) || files.length === 0) return [];

        const requestPromises = files.map(filename => 
            fetch(`/samsar-talabak/data/requests/${category}/${filename}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
                    return res.json();
                })
                .then(data => ({ ...data, filename, category }))
        );

        const results = await Promise.allSettled(requestPromises);
        return results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * retries));
      }
    }
    return [];
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
      this.showErrorMessage('بيانات الطلبات غير صالحة');
      return;
    }
    
    const filteredRequests = this.applyFiltersAndSorting(requests);

    if (filteredRequests.length === 0) {
      this.showEmptyState(category, requests.length > 0);
      return;
    }

    this.container.innerHTML = '';
    for (const request of filteredRequests) {
      const card = this.createRequestCard(request, category);
      this.container.appendChild(card);
    }
    this.highlightLastViewedCard();
  }

  createRequestCard(request, category) {
    const card = document.createElement("div");
    card.className = `property-card request-card card-${category}`;
    card.dataset.filename = request.filename;

    const detailURL = `/samsar-talabak/request-details.html?category=${category}&file=${encodeURIComponent(request.filename)}`;
    const categoryLabel = this.categories[category].label || "طلب";
    
    // استخدام الملخص إن وجد، أو الوصف القديم كاحتياط
    const descriptionText = request.summary || request.description || "لا يوجد وصف مختصر.";

    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" class="property-logo">
        <div class="property-brand">
          <strong>طلب عميل جاد</strong>
          <span class="property-category-badge">${categoryLabel}</span>
        </div>
      </div>
      <h2 class="property-title">${this.escapeHtml(request.title)}</h2>
      <div class="property-details">
        <div class="property-detail">
          <span class="detail-icon">💰</span>
          <span class="detail-label">الميزانية:</span>
          <span class="detail-value price-highlight">${this.escapeHtml(request.budget)}</span>
        </div>
        <div class="property-detail">
          <span class="detail-icon">📏</span>
          <span class="detail-label">المساحة:</span>
          <span class="detail-value">${this.escapeHtml(request.area)}</span>
        </div>
         <div class="property-detail">
          <span class="detail-icon">📅</span>
          <span class="detail-label">تاريخ الطلب:</span>
          <span class="detail-value">${this.escapeHtml(request.date)}</span>
        </div>
      </div>
      <div class="property-description">
        <p>${this.escapeHtml(descriptionText)}</p>
      </div>
      <div class="property-footer">
        <a href="${detailURL}" class="view-details-btn request-cta-btn">
          <span class="btn-icon">✅</span>
          <span class="btn-text">لدي عرض مناسب</span>
          <span class="btn-arrow">←</span>
        </a>
      </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
             window.location.href = detailURL;
        }
    });

    // حفظ الطلب المعروض عند النقر على الرابط
    card.querySelector('a').addEventListener('click', () => {
        localStorage.setItem('lastViewedCard', request.filename);
    });

    return card;
  }

  highlightLastViewedCard() {
    const lastViewedFilename = localStorage.getItem('lastViewedCard');
    if (!lastViewedFilename) return;
    const cardToHighlight = this.container.querySelector(`[data-filename="${lastViewedFilename}"]`);
    if (cardToHighlight) {
      cardToHighlight.classList.add('last-viewed');
      cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      localStorage.removeItem('lastViewedCard');
    }
  }

  showLoadingState() {
    this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><div class="loading-text"><h3>جاري تحميل أحدث الطلبات...</h3></div></div>`;
  }
  
  showEmptyState(category, isAfterFilter = false) {
    const categoryInfo = this.categories[category];
    const message = isAfterFilter 
      ? `لا توجد طلبات تطابق معايير الفرز الحالية.`
      : `لا توجد طلبات حالياً في قسم "${categoryInfo.label}".`;
    this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">${isAfterFilter ? '🧐' : '📪'}</div><h3>لا توجد نتائج</h3><p>${message}</p></div>`;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><h3>حدث خطأ</h3><p>${message}</p></div>`;
  }
  
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

new EnhancedRequestDisplay();

// حقن الأنماط الجديدة في الصفحة
const pageStyles = `
  <style>
    .page-title { text-align: center; margin-top: 2rem; color: var(--color-primary); }
    .page-subtitle { text-align: center; color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: 1.1rem; }
    .main-cta-container { text-align: center; margin: 1rem 0 2rem; }
    .main-cta-button { background: var(--color-whatsapp); color: #fff; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 1.1rem; transition: transform 0.2s ease; display: inline-block; }
    .main-cta-button:hover { transform: scale(1.05); }
    .properties-grid-container { max-width: 1100px; margin: auto; padding: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .request-card .property-brand strong { color: #f59e0b; }
    .request-card .property-category-badge { background-color: #f59e0b !important; color: #000; }
    .request-cta-btn { background: linear-gradient(45deg, #00ff88, #00cc6a); }
    /* نفس أنماط العروض ستنطبق هنا: loading, error, empty, notification, property-card, filter-container ... */
    /* يتم استيرادها من ملف الأنماط الرئيسي أو من كود العروض إذا كانا في نفس الصفحة */
  </style>
`;
document.head.insertAdjacentHTML('beforeend', pageStyles);

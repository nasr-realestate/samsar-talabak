/**
 * 🏢 سمسار طلبك - نظام عرض الطلبات الذكي (النسخة النهائية المطابقة للعروض)
 * Enhanced Request Display System (Final version, cloned from Properties system)
 * 
 * الميزات الكاملة:
 * - بناء احترافي باستخدام الكلاسات.
 * - فلاتر متقدمة (نوع الطلب + التاريخ).
 * - نظام كاش لتحميل فائق السرعة.
 * - تصميم بصري جذاب وتفاعلي (نسخة 1:1 من العروض).
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

    this.categories = {
      "apartments": { label: "🏙️ مطلوب شقق شراء", icon: "🏙️", color: "#00ff88" },
      "apartments-rent": { label: "🔑 مطلوب شقق إيجار", icon: "🔑", color: "#00ccff" },
      "shops": { label: "🛍️ مطلوب محلات", icon: "🛍️", color: "#ff6b35" },
      "offices": { label: "💼 مطلوب مكاتب", icon: "💼", color: "#8b5cf6" },
      "admin-hq": { label: "🏦 مطلوب مقرات إدارية", icon: "🏦", color: "#f59e0b" }
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
    if (!this.container || !this.filterContainer) throw new Error('حاويات الطلبات أو الفلاتر غير موجودة');
    this.container.classList.add('enhanced-properties-container'); // Re-use class for styling
    this.filterContainer.classList.add('enhanced-filter-container'); // Re-use class for styling
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
    if (defaultButton) defaultButton.click();
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
      console.error(error);
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
        const requestPromises = files.map(filename => this.fetchRequestData(category, filename));
        const results = await Promise.allSettled(requestPromises);
        return results.filter(r => r.status === 'fulfilled').map(r => r.value);
      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) throw error;
        await this.delay(this.config.retryDelay * retries);
      }
    }
    return [];
  }

  async fetchRequestData(category, filename) {
    const response = await fetch(`/samsar-talabak/data/requests/${category}/${filename}`);
    if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
    const data = await response.json();
    return { ...data, filename, category };
  }

  showLoadingState() {
    this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><div class="loading-text"><h3>جاري تحميل أحدث الطلبات...</h3><p>يرجى الانتظار قليلاً</p></div><div class="loading-progress"><div class="loading-progress-bar"></div></div></div>`;
    const progressBar = this.container.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.animate([{ width: '0%' }, { width: '100%' }], { duration: this.config.loadingDelay, easing: 'ease-out' });
    }
  }

  applyFiltersAndSorting(requests) {
    let processedRequests = [...requests];
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedRequests = processedRequests.filter(r => {
        try { return ((now - new Date(r.date)) / oneDay) <= daysToFilter; } catch { return false; }
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
    this.highlightLastViewedCard();
  }

  createRequestCard(request, category, index) {
    const card = document.createElement("div");
    card.className = "property-card request-card"; // Re-use property-card class for styling
    card.dataset.filename = request.filename;
    card.style.opacity = 0;
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    card.style.animationDelay = `${index * 100}ms`;

    const detailURL = `/samsar-talabak/request-details.html?category=${category}&file=${encodeURIComponent(request.filename)}`;
    const categoryInfo = this.categories[category];
    const descriptionText = request.description || "لا يوجد وصف مختصر لهذا الطلب.";

    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo">
        <div class="property-brand">
          <strong>طلب عميل جاد</strong>
          <span class="property-category-badge" style="background:${categoryInfo.color}; color:#000;">${categoryInfo.icon} ${this.escapeHtml(request.title || "طلب غير معنون")}</span>
        </div>
      </div>
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
      <div class="property-description"><p>${this.escapeHtml(descriptionText)}</p></div>
      <div class="property-footer">
        <a href="${detailURL}" class="view-details-btn request-cta-btn">
          <span class="btn-icon">✅</span>
          <span class="btn-text">عرض التفاصيل وتقديم عرض</span>
          <span class="btn-arrow">←</span>
        </a>
      </div>
    `;

    card.querySelector('a.view-details-btn').addEventListener('click', (e) => {
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

  showEmptyState(category, isAfterFilter = false) {
    const categoryInfo = this.categories[category];
    const message = isAfterFilter 
      ? `لا توجد طلبات تطابق معايير الفرز الحالية.`
      : `لا توجد طلبات حالياً في قسم "${categoryInfo.label}". كن أول من يضيف طلباً!`;
    this.container.innerHTML = `<div class="empty-state"><div class="empty-icon">${isAfterFilter ? '🧐' : '📪'}</div><h3>لا توجد نتائج</h3><p>${message}</p></div>`;
  }

  showErrorMessage(message) {
    this.container.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><h3>حدث خطأ</h3><p>${message}</p><button class="retry-btn" onclick="location.reload()">🔄 إعادة المحاولة</button></div>`;
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

new EnhancedRequestDisplay();

// حقن الأنماط الكاملة 1:1 من صفحة العروض
const fullStyles = `
<style>
  /* Base Page Styles */
  .page-title { text-align: center; margin-top: 2rem; color: var(--color-primary); }
  .page-subtitle { text-align: center; color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: 1.1rem; }
  .main-cta-container { text-align: center; margin: 1rem 0 2rem; }
  .main-cta-button { background: var(--color-whatsapp); color: #fff; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 1.1rem; transition: transform 0.2s ease, box-shadow 0.2s ease; display: inline-block; }
  .main-cta-button:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
  
  /* Grid Container */
  .properties-grid-container { max-width: 1100px; margin: auto; padding: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }

  /* ALL STYLES COPIED FROM offers-display.js (Final Version) */
  .notification{position:fixed;top:20px;right:20px;background:#1e1e1e;border:1px solid #333;border-radius:12px;padding:1rem;box-shadow:0 10px 30px rgba(0,0,0,.3);z-index:10000;transform:translateX(400px);opacity:0;transition:all .3s cubic-bezier(.4,0,.2,1);max-width:350px}.notification.show{transform:translateX(0);opacity:1}.notification-content{display:flex;align-items:center;gap:10px;color:#f1f1f1}.notification-close{background:0 0;border:0;color:#888;cursor:pointer;font-size:1.2rem;margin-left:auto}.notification-success{border-color:#00ff88}.notification-error{border-color:#ff6b6b}.notification-warning{border-color:#ffa500}.notification-info{border-color:#00ccff}.property-category-badge{font-size:.8rem;padding:.2rem .5rem;border-radius:15px;color:#000;font-weight:700}.property-actions{display:flex;gap:8px;margin-left:auto}.favorite-btn,.share-btn{background:rgba(255,255,255,.1);border:0;border-radius:50%;width:35px;height:35px;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center}.favorite-btn:hover,.share-btn:hover{background:rgba(0,255,136,.2);transform:scale(1.1)}.property-stats{display:flex;gap:15px;font-size:.9rem;color:#888}.stat-item{display:flex;align-items:center;gap:5px}.property-card.last-viewed{border-color:#f59e0b!important;box-shadow:0 0 35px rgba(245,158,11,.4)!important;transform:translateY(-10px) scale(1.02)!important;transition: all 0.3s ease-in-out!important;}.property-card.last-viewed:hover{border-color:#f59e0b;box-shadow:0 15px 40px rgba(245,158,11,.5)}.date-filter-wrapper{display:flex;align-items:center;gap:10px;background:#2a2a2a;padding:8px 15px;border-radius:25px;border:2px solid #444;transition:all .3s ease}.date-filter-wrapper:hover{border-color:#00ff88;box-shadow:0 5px 15px rgba(0,255,136,.15)}.date-filter-label{color:#ccc;font-weight:600;font-size:.9rem}.date-filter-select{background:0 0;border:0;color:#00ff88;font-weight:700;font-size:1rem;cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none;padding-right:15px;background-image:url("data:image/svg+xml;utf8,<svg fill='%2300ff88' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");background-repeat:no-repeat;background-position:right center}.date-filter-select:focus{outline:0}.date-filter-select option{background:#1e1e1e;color:#f1f1f1}.empty-state,.error-state{text-align:center;padding:4rem 2rem;color:#888; grid-column: 1 / -1;}.empty-icon,.error-icon{font-size:4rem;margin-bottom:1rem}.refresh-btn,.retry-btn,.contact-btn{background:linear-gradient(45deg,#00ff88,#00cc6a);color:#000;border:0;padding:.8rem 1.5rem;border-radius:25px;cursor:pointer;font-weight:700;margin:.5rem;transition:all .3s ease}.refresh-btn:hover,.retry-btn:hover,.contact-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,255,136,.3)}@media (max-width:768px){.notification{right:10px;left:10px;max-width:none}.property-header{flex-wrap:wrap;gap:10px}.property-actions{order:3;width:100%;justify-content:center}}.loading-container{text-align:center;padding:4rem 2rem;color:#f1f1f1; grid-column: 1 / -1;}.loading-spinner-enhanced{width:60px;height:60px;border:4px solid #333;border-top:4px solid #00ff88;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 2rem}.loading-progress{width:200px;height:4px;background:#333;border-radius:2px;margin:2rem auto;overflow:hidden}.loading-progress-bar{height:100%;background:linear-gradient(45deg,#00ff88,#00cc6a);border-radius:2px;transition:width .3s ease}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes ripple{to{transform:scale(4);opacity:0}}
  
  /* Request-specific styles */
  .request-cta-btn { background: linear-gradient(45deg, #00b0ff, #0081cb) !important; }
  .request-card .property-brand > strong { color: #00b0ff; }
  .property-card { background: var(--color-surface-2); border: 1px solid var(--color-border); padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); color: var(--color-text-primary); transition: 0.3s ease; }
  .property-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
  .view-details-btn { display:inline-block; margin-top:0.8rem; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight:bold; text-decoration:none; }
</style>
`;
document.head.insertAdjacentHTML('beforeend', fullStyles);

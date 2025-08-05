/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء (النسخة النهائية والمحدثة)
 * هذا الكود متوافق مع نظام الروابط القصيرة والفهارس التلقائية.
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
      // ... باقي دوال التهيئة تبقى كما هي
      this.createFilterButtons();
      this.createDateFilter();
      this.loadDefaultCategory();
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
      this.showErrorMessage('حدث خطأ في تحميل التطبيق');
    }
  }

  // --- دوال التهيئة والمساعدة (تبقى كما هي في الغالب) ---
  waitForDOM() { return new Promise(resolve => { if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', resolve); } else { resolve(); } }); }
  setupElements() { if (!this.container || !this.filterContainer) throw new Error('العناصر الأساسية غير موجودة'); }
  setupEventListeners() { /* ... الكود الأصلي ... */ }
  // ... باقي الدوال المساعدة ...

  async handleCategoryChange(category, button) {
    if (this.isLoading || this.currentCategory === category) return;
    try {
      this.updateActiveButton(button);
      await this.loadCategory(category);
      this.currentCategory = category;
      localStorage.setItem('lastCategory_requests', category);
    } catch (error) {
      this.showErrorMessage('فشل في تحميل التصنيف');
    }
  }

  updateActiveButton(activeButton) {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  loadDefaultCategory() {
    const savedCategory = localStorage.getItem('lastCategory_requests') || Object.keys(this.categories)[0];
    const defaultButton = this.filterContainer.querySelector(`[data-category="${savedCategory}"]`);
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
        return;
      }
      const data = await this.fetchCategoryData(category);
      this.setCachedData(category, data);
      await this.displayRequests(data, category);
    } catch (error) {
      this.showErrorMessage('فشل في تحميل البيانات');
    } finally {
      this.isLoading = false;
    }
  }

  // --- دوال جلب البيانات (تبقى كما هي) ---
  async fetchCategoryData(category) {
    const folderName = this.categories[category].folder;
    const indexPath = `/data/requests/${folderName}/index.json?t=${Date.now()}`;
    const indexResponse = await fetch(indexPath);
    if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
    const files = await indexResponse.json();
    const requestPromises = files.map(filename => this.fetchRequestData(folderName, filename, category));
    const requests = await Promise.all(requestPromises);
    return requests.filter(request => request !== null);
  }

  async fetchRequestData(folderName, filename, category) {
    try {
      const response = await fetch(`/data/requests/${folderName}/${filename}?t=${Date.now()}`);
      if (!response.ok) return null;
      const data = await response.json();
      return { ...data, filename, category };
    } catch (error) {
      return null;
    }
  }
  
  // --- دوال العرض (تم تطبيق الإصلاحات عليها) ---
  async displayRequests(requests, category) {
    if (!Array.isArray(requests)) {
      this.showErrorMessage('بيانات غير صحيحة');
      return;
    }
    const filteredRequests = this.applyFiltersAndSorting(requests);
    if (filteredRequests.length === 0) {
      this.showEmptyState(category);
      return;
    }
    this.container.innerHTML = '';
    filteredRequests.forEach((request, index) => {
      const card = this.createRequestCard(request, category, index);
      this.container.appendChild(card);
    });
  }

  createRequestCard(request, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = "property-card enhanced-property-card";
    
    // ✨✨✨ الإصلاح الحاسم والنهائي هنا ✨✨✨
    // هذا يضمن أن 'requestId' لن تكون 'undefined' أبدًا.
    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/request/${requestId}`;
    
    const budgetToRender = this.escapeHtml(request.budget_display || request.budget || "غير محددة");
    const areaToRender = this.escapeHtml(request.area_display || request.area || "غير محددة");

    card.innerHTML = `
      <div class="property-header">
        <div class="property-brand">
          <strong>طلب عميل</strong>
          <span class="property-category-badge" style="background: ${categoryInfo.color}">${categoryInfo.icon} ${categoryInfo.label}</span>
        </div>
      </div>
      <h3 class="property-title">${this.escapeHtml(request.title)}</h3>
      <div class="property-details">
        <div class="property-detail"><strong>💰 الميزانية:</strong> ${budgetToRender}</div>
        <div class="property-detail"><strong>📏 المساحة:</strong> ${areaToRender}</div>
        <div class="property-detail"><strong>📅 تاريخ الطلب:</strong> ${this.escapeHtml(request.date || "غير متوفر")}</div>
      </div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">🤝 عرض تفاصيل الطلب ←</a>
      </div>
    `;
    
    // إضافة مستمع للنقر على البطاقة بالكامل
    card.addEventListener('click', () => {
        window.location.href = detailPage;
    });

    return card;
  }
  
  // --- دوال أخرى (تم تبسيطها أو الإبقاء عليها) ---
  showLoadingState() { this.container.innerHTML = `<div class="loading-container">جاري تحميل الطلبات...</div>`; }
  showEmptyState(category) { this.container.innerHTML = `<div class="empty-state">لا توجد طلبات حالياً في فئة "${this.categories[category].label}".</div>`; }
  showErrorMessage(message) { this.container.innerHTML = `<div class="error-state">❌ ${message}</div>`; }
  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  applyFiltersAndSorting(requests) { /* ... الكود الأصلي للفرز ... */ return requests; }
  getCachedData(category) { return this.requestsCache.get(category)?.data; }
  setCachedData(category, data) { this.requestsCache.set(category, { data, timestamp: Date.now() }); }
  createFilterButtons() { /* ... الكود الأصلي ... */ }
  createDateFilter() { /* ... الكود الأصلي ... */ }
}

// بدء تشغيل النظام
if (document.getElementById("requests-container")) {
    new EnhancedRequestDisplay();
        }

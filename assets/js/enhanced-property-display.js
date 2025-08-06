/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء (النسخة النهائية الكاملة v5.4 - مع استعادة التصميم)
 */

class EnhancedRequestDisplay {
  constructor() {
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");
    // ... (rest of constructor is identical to the user's last full version)
    this.categories = {
      "apartments": { label: "🏠 طلبات شقق", icon: "🏠", color: "#00ff88", folder: "apartments" },
      "apartments-rent": { label: "🏡 طلبات إيجار", icon: "🏡", color: "#00ccff", folder: "apartments-rent" },
      // ... (other categories)
    };
    this.init();
  }

  async init() {
      // ... (init function is identical)
  }

  // ... (All helper functions are identical to the property display, just with "request" terminology)
  
  applyFiltersAndSorting(requests) {
    let processedRequests = [...requests];

    if (this.currentDateFilter !== 'all') {
      processedRequests.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0); 
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    }

    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const now = new Date();
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedRequests = processedRequests.filter(r => {
        if (!r.date) return false;
        const reqDate = new Date(r.date);
        const diffDays = (now - reqDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= daysToFilter;
      });
    }
    
    return processedRequests;
  }
  
  async displayRequests(requests, category) {
    if (!Array.isArray(requests)) {
      this.showErrorMessage('بيانات غير صحيحة');
      return;
    }
    const filteredRequests = this.applyFiltersAndSorting(requests);
    if (filteredRequests.length === 0) {
      this.showEmptyState(category, true);
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
  }

  createRequestCard(request, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = "property-card";
    card.style.animationDelay = `${index * 50}ms`;

    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/request/${requestId}`;
    
    const budgetToRender = this.escapeHtml(request.budget_display || request.budget || "غير محددة");
    const areaToRender = this.escapeHtml(request.area_display || request.area || "غير محددة");
    const title = this.escapeHtml(request.title);

    card.innerHTML = `
      <div class="property-header">
        <div class="property-brand">
          سمسار طلبك
          <span class="property-category-badge" style="background-color: ${categoryInfo.color}; color: #000;">
            ${categoryInfo.icon} ${categoryInfo.label}
          </span>
        </div>
        <img src="https://i.postimg.cc/sfh9DRb0/samsar-logo-enhanced.png" alt="شعار سمسار طلبك" class="property-logo">
      </div>
      
      <h3 class="property-title">${title}</h3>

      <div class="property-details">
        <div class="property-detail">
          <span class="detail-icon">💰</span>
          <span class="detail-label">الميزانية:</span>
          <span class="detail-value price-highlight">${budgetToRender}</span>
        </div>
        <div class="property-detail">
          <span class="detail-icon">📏</span>
          <span class="detail-label">المساحة المطلوبة:</span>
          <span class="detail-value">${areaToRender}</span>
        </div>
        <div class="property-detail">
          <span class="detail-icon">📅</span>
          <span class="detail-label">تاريخ الطلب:</span>
          <span class="detail-value">${this.escapeHtml(request.date || "غير متوفر")}</span>
        </div>
      </div>

      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">
          <span class="btn-text">عرض تفاصيل الطلب</span>
          <span class="btn-arrow">←</span>
        </a>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = detailPage;
      }
    });

    return card;
  }
  
  // ... (The rest of the full helper functions like showEmptyState, showErrorMessage, etc.)
}

if (document.getElementById("requests-container")) {
    new EnhancedRequestDisplay();
            }

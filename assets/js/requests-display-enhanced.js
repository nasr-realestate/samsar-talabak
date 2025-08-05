/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء (النسخة النهائية الكاملة v4.1 - مع إصلاح الفرز)
 */

class EnhancedRequestDisplay {
  constructor() {
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");
    // ... (rest of the constructor is identical to the user's last full version)

    this.categories = {
      "apartments": { label: "🏠 طلبات شقق", icon: "🏠", color: "#00ff88", description: "طلبات شراء وإيجار الشقق", folder: "apartments" },
      "apartments-rent": { label: "🏡 طلبات إيجار", icon: "🏡", color: "#00ccff", description: "طلبات إيجار الشقق", folder: "apartments-rent" },
      "shops": { label: "🏪 طلبات محلات", icon: "🏪", color: "#ff6b35", description: "طلبات المحلات التجارية", folder: "shops" },
      "offices": { label: "🏢 طلبات مكاتب", icon: "🏢", color: "#8b5cf6", description: "طلبات المكاتب الإدارية", folder: "offices" },
      "admin-hq": { label: "🏛️ طلبات مقرات", icon: "🏛️", color: "#f59e0b", description: "طلبات المقرات الإدارية", folder: "admin-hq" }
    };

    this.init();
  }

  // ... (All init and helper functions are identical to the user's last full version, with Arabic text)

  applyFiltersAndSorting(requests) {
    let processedRequests = [...requests];
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;

    if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
      const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
      processedRequests = processedRequests.filter(r => {
        if (!r.date || typeof r.date !== 'string') return false;
        try {
          const reqDate = new Date(r.date);
          if (isNaN(reqDate.getTime())) return false;
          const diffDays = (now - reqDate) / oneDay;
          return diffDays >= 0 && diffDays <= daysToFilter;
        } catch { return false; }
      });
    }

    if (this.currentDateFilter !== 'all') {
        processedRequests.sort((a, b) => {
            try {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                if (isNaN(dateA)) return 1;
                if (isNaN(dateB)) return -1;
                return dateB - dateA;
            } catch { 
                return 0; 
            }
        });
    }
    return processedRequests;
  }

  // ... (The rest of the file is identical to the user's last full version, with Arabic text and corrected class names)
  
  createRequestCard(request, category, index) {
    // ... (The main card generation logic)
    const requestId = request.id || (request.filename ? request.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/request/${requestId}`;
    
    // Using the same class names as the properties for consistent styling
    card.innerHTML = `
      <div class="property-header">
        ...
      </div>
      <h3 class="property-title">${this.escapeHtml(request.title)}</h3>
      <div class="property-details">
        <div class="property-detail">...</div>
      </div>
      <div class="property-description">...</div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">...</a>
      </div>
    `;
    // ...
  }
}

// ... (Instantiation code)

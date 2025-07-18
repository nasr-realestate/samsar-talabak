/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء (النسخة النهائية - مبني على هيكل المجلدات الصحيح)
 *
 * هذا الكود هو استنساخ دقيق لمنطق العروض، ومصمم للعمل مع هيكل المجلدات الفرعية
 * (e.g., /data/requests/apartments/) الذي تم تأكيده.
 */
class EnhancedRequestDisplay {
  constructor() {
    this.grid = document.getElementById('requests-grid');
    this.filterContainer = document.getElementById('filter-container');

    if (!this.grid || !this.filterContainer) {
      console.error("FATAL: Cannot find #requests-grid or #filter-container.");
      return;
    }

    this.cache = new Map();
    this.currentFilter = null; // سيبدأ بأول فلتر
    this.isLoading = false;

    // ✨ تعريف الفلاتر التي تطابق أسماء المجلدات الفرعية لديك
    this.filters = {
      "apartments": { label: "🏠 شقق", icon: "🏠" },
      "shops": { label: "🏪 محلات", icon: "🏪" },
      "offices": { label: "🏢 مكاتب", icon: "🏢" },
      // أضف أي فئات أخرى هنا بنفس الطريقة
    };
    
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = window.location.pathname.split('/')[1] || '';
    this.basePath = isGitHubPages ? `/${repoName}` : '';

    this.init();
  }

  async init() {
    this.injectStyles();
    this.createFilters();
    
    // تحميل الفئة الأولى في القائمة بشكل افتراضي
    const defaultFilter = Object.keys(this.filters)[0];
    if (defaultFilter) {
      this.loadCategory(defaultFilter);
    } else {
      this.showErrorState("لم يتم تعريف أي فلاتر.");
    }
  }

  // ✨ هذا هو المنطق الصحيح: جلب البيانات لكل فئة على حدة
  async loadCategory(categoryKey) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.currentFilter = categoryKey;
    this.updateActiveFilterButtons();
    this.showLoadingState();

    // استخدام الكاش أولاً
    if (this.cache.has(categoryKey)) {
      this.render(this.cache.get(categoryKey));
      this.isLoading = false;
      return;
    }

    try {
      // ✨ المسار الصحيح الذي يبحث داخل المجلد الفرعي للفئة
      const indexPath = `${this.basePath}/data/requests/${categoryKey}/index.json`;
      const response = await fetch(indexPath);
      if (!response.ok) throw new Error(`ملف الفهرس للفئة '${categoryKey}' غير موجود.`);

      const fileNames = await response.json();
      const dataPromises = fileNames.map(async (fileName) => {
        try {
          const res = await fetch(`${this.basePath}/data/requests/${categoryKey}/${fileName}`);
          if (!res.ok) return null;
          const data = await res.json();
          return { ...data, id: fileName.split('.')[0], category: categoryKey };
        } catch { return null; }
      });

      const data = (await Promise.all(dataPromises)).filter(Boolean);
      this.cache.set(categoryKey, data); // تخزين بيانات الفئة في الكاش
      this.render(data);

    } catch (error) {
      console.error(`Failed to load category ${categoryKey}:`, error);
      this.showErrorState(error.message);
    } finally {
      this.isLoading = false;
    }
  }

  render(data) {
    this.grid.innerHTML = '';
    if (data.length === 0) {
      this.showEmptyState("لا توجد طلبات في هذه الفئة حالياً.");
      return;
    }
    data.forEach(item => this.grid.appendChild(this.createCard(item)));
  }

  createCard(request) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.id = request.id;
    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" class="property-logo">
        <h2 class="property-title">${this.escapeHtml(request.title)}</h2>
      </div>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">🏷️</span><span class="detail-label">نوع الطلب:</span><span class="detail-value">${this.filters[request.category]?.label || request.category}</span></div>
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">الميزانية:</span><span class="detail-value price-highlight">${this.escapeHtml(request.budget)}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${this.escapeHtml(request.area)}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الطلب:</span><span class="detail-value">${this.escapeHtml(request.date)}</span></div>
      </div>
      <div class="property-description"><p>${this.escapeHtml(request.description)}</p></div>
      <div style="text-align: center; margin-top: 1.5rem;"><a href="#" class="view-details-btn">لدي عرض مناسب</a></div>
    `;
    return card;
  }

  createFilters() {
    Object.keys(this.filters).forEach(key => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.dataset.filter = key;
      button.innerHTML = `${this.filters[key].icon} ${this.filters[key].label}`;
      button.addEventListener("click", () => this.loadCategory(key));
      this.filterContainer.appendChild(button);
    });
  }
  
  updateActiveFilterButtons() {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
    });
  }

  showLoadingState() { this.grid.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><p>جاري تحميل الطلبات...</p></div>`; }
  showErrorState(message) { this.grid.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><h3>حدث خطأ</h3><p>${message}</p></div>`; }
  showEmptyState(message) { this.grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🤷</div><h3>لا توجد نتائج</h3><p>${message}</p></div>`; }
  escapeHtml(str) { const p = document.createElement("p"); p.textContent = str; return p.innerHTML; }

  injectStyles() {
    const styleId = 'unified-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    // الأنماط الكاملة والمطابقة لصفحة العروض
    style.textContent = `
      .page-header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 3rem 1rem; text-align: center; border-radius: 0 0 30px 30px; box-shadow: 0 10px 30px rgba(0, 255, 136, 0.1); margin-bottom: 2rem; }
      .page-header h1 { font-size: 3rem; background: linear-gradient(45deg, #00ff88, #00cc6a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; }
      .filter-container { display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem; margin: 2rem 0; padding: 0 1rem; align-items: center; }
      .filter-btn { padding: 0.8rem 1.5rem; background: #2a2a2a; color: #f1f1f1; border: 2px solid #444; border-radius: 25px; cursor: pointer; transition: all 0.3s ease; font-weight: 600; }
      .filter-btn:hover { color: #000; background: #00ff88; border-color: #00ff88; transform: translateY(-2px); }
      .filter-btn.active { background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; border-color: #00ff88; box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3); }
      .requests-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; padding: 1rem; min-height: 300px; }
      .property-card { background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border: 1px solid #333; border-radius: 20px; padding: 2rem; transition: all 0.4s ease; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
      .property-card:hover { transform: translateY(-10px) scale(1.02); border-color: #00ff88; box-shadow: 0 25px 50px rgba(0, 255, 136, 0.2); }
      .property-header { display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #333; }
      .property-logo { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #00ff88; }
      .property-title { color: #00ff88; font-size: 1.5rem; font-weight: bold; margin: 0; }
      .property-details { display: grid; gap: 0.8rem; margin: 1.5rem 0; }
      .property-detail { display: flex; align-items: center; gap: 10px; padding: 0.5rem; background: rgba(0, 255, 136, 0.05); border-radius: 10px; border-left: 3px solid #00ff88; }
      .detail-label { font-weight: 600; color: #00ff88; min-width: 100px; }
      .detail-value { color: #f1f1f1; }
      .price-highlight { color: #00ff88; font-weight: bold; }
      .property-description { background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 10px; margin: 1rem 0; border-left: 4px solid #00ff88; color: #ccc; }
      .view-details-btn { display: inline-block; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; padding: 1rem 2rem; border-radius: 15px; text-decoration: none; font-weight: bold; transition: all 0.3s ease; }
      .view-details-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0, 255, 136, 0.4); }
      .loading-container, .empty-state, .error-state { text-align: center; padding: 4rem 2rem; color: #888; grid-column: 1 / -1; }
      .loading-spinner-enhanced { width: 60px; height: 60px; border: 4px solid #333; border-top: 4px solid #00ff88; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
      .empty-icon, .error-icon { font-size: 4rem; margin-bottom: 1rem; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EnhancedRequestDisplay());
} else {
  new EnhancedRequestDisplay();
}


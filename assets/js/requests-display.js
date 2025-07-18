/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء (النسخة النهائية - طبق الأصل)
 *
 * هذا الكود هو استنساخ دقيق ومكيف من نظام عرض العروض الناجح،
 * مع تطبيق جميع الميزات المتقدمة المطلوبة وبنية الكلاس الاحترافية.
 * تم تصميمه ليكون الحل النهائي والموثوق.
 */
class EnhancedRequestDisplay {
  constructor() {
    // --- 1. تحديد العناصر الأساسية ---
    this.grid = document.getElementById('requests-grid');
    this.filterContainer = document.getElementById('filter-container');
    this.welcomeBox = document.getElementById('welcome-message');

    if (!this.grid || !this.filterContainer) {
      console.error("FATAL: Cannot find #requests-grid or #filter-container.");
      return;
    }

    // --- 2. إعدادات النظام ---
    this.allData = []; // لتخزين جميع الطلبات بعد جلبها مرة واحدة
    this.cache = new Map();
    this.currentFilter = 'all';
    this.currentSort = 'latest';

    // ✨ تكييف الفئات لتناسب أنواع الطلبات
    this.filters = {
      "all": { label: "🔍 كل الطلبات", icon: "🔍" },
      "apartments": { label: "🏠 شقق", icon: "🏠" },
      "shops": { label: "🏪 محلات", icon: "🏪" },
      "offices": { label: "🏢 مكاتب", icon: "🏢" },
    };
    
    // ✨ اكتشاف المسار الأساسي للموقع ديناميكياً لضمان عمل الروابط
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = window.location.pathname.split('/')[1] || '';
    this.basePath = isGitHubPages ? `/${repoName}` : '';

    this.init();
  }

  // --- 3. بدء تشغيل النظام ---
  async init() {
    this.injectStyles(); // حقن الأنماط المطابقة
    this.createFilters(); // إنشاء أزرار الفلاتر والفرز
    this.handleWelcomeMessage();
    this.showLoadingState();

    try {
      this.allData = await this.fetchData();
      this.render();
    } catch (error) {
      console.error("CRITICAL: Failed to fetch initial data.", error);
      this.showErrorState(`فشل تحميل البيانات. ${error.message}`);
    }
  }

  // --- 4. جلب البيانات (مرة واحدة مع تخزين مؤقت) ---
  async fetchData() {
    const cacheKey = 'all_requests';
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const indexPath = `${this.basePath}/data/requests/index.json`;
    const response = await fetch(indexPath);
    if (!response.ok) throw new Error(`ملف الفهرس index.json غير موجود أو لا يمكن الوصول إليه.`);

    const fileNames = await response.json();
    if (!Array.isArray(fileNames)) throw new Error("ملف الفهرس index.json لا يحتوي على مصفوفة.");

    const dataPromises = fileNames.map(async (fileName) => {
      try {
        const res = await fetch(`${this.basePath}/data/requests/${fileName}`);
        if (!res.ok) return null;
        const data = await res.json();
        return { ...data, id: fileName.split('.')[0] };
      } catch {
        return null;
      }
    });

    const data = (await Promise.all(dataPromises)).filter(Boolean);
    this.cache.set(cacheKey, data);
    return data;
  }

  // --- 5. عرض البيانات على الشاشة ---
  render() {
    let dataToDisplay = [...this.allData];

    if (this.currentFilter !== 'all') {
      dataToDisplay = dataToDisplay.filter(item => item.type === this.currentFilter);
    }

    dataToDisplay.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return this.currentSort === 'latest' ? dateB - dateA : dateA - dateB;
    });

    this.grid.innerHTML = '';

    if (dataToDisplay.length === 0) {
      this.showEmptyState("لا توجد طلبات تطابق هذا الفلتر حالياً.");
      return;
    }

    dataToDisplay.forEach(item => {
      const card = this.createCard(item);
      this.grid.appendChild(card);
    });
  }

  // --- 6. إنشاء بطاقة طلب واحدة (بتصميم احترافي ومحتوى مخصص) ---
  createCard(request) {
    const card = document.createElement('div');
    card.className = 'property-card'; // استخدام نفس كلاس التصميم لتوحيد الشكل
    card.dataset.id = request.id;

    // ✨ محتوى نصي احترافي ومخصص للطلبات
    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo">
        <h2 class="property-title">${this.escapeHtml(request.title)}</h2>
      </div>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">🏷️</span><span class="detail-label">نوع الطلب:</span><span class="detail-value">${this.filters[request.type]?.label || request.type}</span></div>
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">الميزانية التقريبية:</span><span class="detail-value price-highlight">${this.escapeHtml(request.budget)}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة المطلوبة:</span><span class="detail-value">${this.escapeHtml(request.area)}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الطلب:</span><span class="detail-value">${this.escapeHtml(request.date)}</span></div>
      </div>
      <div class="property-description">
        <p>${this.escapeHtml(request.description)}</p>
      </div>
      <div style="text-align: center; margin-top: 1.5rem;">
        <a href="#" class="view-details-btn" onclick="alert('هنا يتم توجيه المستخدم لصفحة تقديم العرض للطلب رقم: ${request.id}')">
          لدي عرض مناسب
        </a>
      </div>
    `;
    return card;
  }

  // --- 7. إنشاء أزرار الفلاتر والفرز (مطابق للمرجع) ---
  createFilters() {
    Object.keys(this.filters).forEach(key => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.dataset.filter = key;
      button.innerHTML = `${this.filters[key].icon} ${this.filters[key].label}`;
      if (key === this.currentFilter) button.classList.add("active");
      button.addEventListener("click", () => {
        this.currentFilter = key;
        this.updateActiveFilterButtons();
        this.render();
      });
      this.filterContainer.appendChild(button);
    });

    const sortWrapper = document.createElement('div');
    sortWrapper.className = 'date-filter-wrapper';
    sortWrapper.innerHTML = `
      <label for="sort-select" class="date-filter-label">📅 الفرز حسب:</label>
      <select id="sort-select" class="date-filter-select">
        <option value="latest">الأحدث أولاً</option>
        <option value="oldest">الأقدم أولاً</option>
      </select>
    `;
    sortWrapper.querySelector('#sort-select').addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.render();
    });
    this.filterContainer.appendChild(sortWrapper);
  }
  
  updateActiveFilterButtons() {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
    });
  }

  // --- 8. واجهات المستخدم المحسّنة (مطابقة للمرجع) ---
  showLoadingState() { this.grid.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><p>جاري تحميل أحدث الطلبات...</p></div>`; }
  showErrorState(message) { this.grid.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><h3>حدث خطأ فني</h3><p>${message}</p></div>`; }
  showEmptyState(message) { this.grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🤷</div><h3>لا توجد نتائج</h3><p>${message}</p></div>`; }

  // --- 9. وظائف مساعدة (مطابقة للمرجع) ---
  handleWelcomeMessage() {
    if (!this.welcomeBox || localStorage.getItem("welcomeShown_requests")) return;
    setTimeout(() => {
      this.welcomeBox.style.display = "block";
      localStorage.setItem("welcomeShown_requests", "true");
    }, 500);
  }
  escapeHtml(str) { const p = document.createElement("p"); p.textContent = str; return p.innerHTML; }

  // --- 10. حقن الأنماط (مطابق للمرجع لضمان التطابق البصري) ---
  injectStyles() {
    const styleId = 'unified-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .page-header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 3rem 1rem; text-align: center; border-radius: 0 0 30px 30px; box-shadow: 0 10px 30px rgba(0, 255, 136, 0.1); margin-bottom: 2rem; position: relative; overflow: hidden; }
      .page-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%2300ff88" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>'); pointer-events: none; }
      .page-header h1 { font-size: 3rem; background: linear-gradient(45deg, #00ff88, #00cc6a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; text-shadow: 0 0 30px rgba(0, 255, 136, 0.3); }
      .nav-btn { display: inline-block; padding: 1rem 2rem; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.1rem; box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3); transition: all 0.3s ease; }
      .nav-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 15px 35px rgba(0, 255, 136, 0.4); }
      .welcome-message { background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border: 2px solid #00ff88; border-radius: 20px; padding: 2.5rem; margin: 2rem auto; max-width: 800px; text-align: center; box-shadow: 0 20px 60px rgba(0, 255, 136, 0.1); }
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
      .detail-label { font-weight: 600; color: #00ff88; min-width: 140px; }
      .detail-value { color: #f1f1f1; }
      .price-highlight { color: #00ff88; font-weight: bold; }
      .property-description { background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 10px; margin: 1rem 0; border-left: 4px solid #00ff88; color: #ccc; }
      .view-details-btn { display: inline-block; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; padding: 1rem 2rem; border-radius: 15px; text-decoration: none; font-weight: bold; transition: all 0.3s ease; }
      .view-details-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0, 255, 136, 0.4); }
      .loading-container, .empty-state, .error-state { text-align: center; padding: 4rem 2rem; color: #888; grid-column: 1 / -1; }
      .loading-spinner-enhanced { width: 60px; height: 60px; border: 4px solid #333; border-top: 4px solid #00ff88; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
      .empty-icon, .error-icon { font-size: 4rem; margin-bottom: 1rem; }
      .error-state { color: #ff6b6b; }
      .date-filter-wrapper { display: flex; align-items: center; gap: 10px; background: #2a2a2a; padding: 8px 15px; border-radius: 25px; border: 2px solid #444; }
      .date-filter-label { color: #ccc; font-weight: 600; }
      .date-filter-select { background: transparent; border: 0; color: #00ff88; font-weight: 700; cursor: pointer; }
      .floating-elements { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; overflow: hidden; }
      .floating-element { position: absolute; width: 6px; height: 6px; background: #00ff88; border-radius: 50%; opacity: 0.3; animation: float 6s ease-in-out infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
    `;
    document.head.appendChild(style);
  }
}

// --- 11. بدء تشغيل النظام بأمان بعد تحميل الصفحة ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EnhancedRequestDisplay());
} else {
  new EnhancedRequestDisplay();
}

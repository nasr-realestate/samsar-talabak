/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء المحسن (النسخة النهائية الكاملة v1)
 * Enhanced Customer Requests Display System (Final Full Version v1)
 * 
 * هذا الكود هو استنساخ وتكييف لنظام عرض العروض الناجح، مع تطبيق جميع الميزات المتقدمة.
 * 
 * الميزات المدمجة:
 * - بنية كلاس `EnhancedRequestDisplay` الاحترافية.
 * - تحميل ذكي للبيانات مع تخزين مؤقت (Cache) فعال.
 * - نظام فلاتر متقدم يدمج أنواع الطلبات مع الفرز حسب التاريخ.
 * - واجهة مستخدم محسّنة مع شاشة تحميل ورسائل للحالات المختلفة.
 * - تمييز آخر طلب تم عرضه عند عودة المستخدم (`highlightLastViewedCard`).
 * - حقن ديناميكي للـ CSS لضمان تطابق التصميم والتأثيرات البصرية.
 * - تكييف كامل للمنطق والنصوص لتناسب "طلبات العملاء".
 */

class EnhancedRequestDisplay {
  constructor() {
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");
    
    this.currentFilter = 'all';
    this.currentSort = 'latest';
    this.requestsCache = new Map();
    this.isLoading = false;

    // ✨ تم تكييف الفئات لتناسب أنواع الطلبات
    this.filters = {
      "all": { label: "🔍 كل الطلبات", icon: "🔍" },
      "apartments": { label: "🏠 شقق", icon: "🏠" },
      "shops": { label: "🏪 محلات", icon: "🏪" },
      "offices": { label: "🏢 مكاتب", icon: "🏢" },
    };

    this.init();
  }

  init() {
    if (!this.container || !this.filterContainer) {
      console.error("خطأ: الحاويات الأساسية (requests-container, filter-buttons) غير موجودة في الصفحة.");
      return;
    }
    this.injectStyles();
    this.createFilterButtons();
    this.createSortDropdown();
    this.setupEventListeners();
    this.loadInitialRequests();
    this.handleWelcomeMessage();
  }

  setupEventListeners() {
    // تمييز البطاقة عند العودة من صفحة التفاصيل
    window.addEventListener('pageshow', () => this.highlightLastViewedCard());
  }

  handleWelcomeMessage() {
    if (!this.welcomeBox) return;
    const hasShownWelcome = localStorage.getItem("requestsWelcomeShown");
    if (!hasShownWelcome) {
        this.welcomeBox.style.display = "block";
        this.playWelcomeSound();
        setTimeout(() => {
            if (this.welcomeBox) {
                this.welcomeBox.style.transition = "opacity 0.5s ease";
                this.welcomeBox.style.opacity = "0";
                setTimeout(() => {
                    this.welcomeBox.style.display = "none";
                }, 500);
            }
            localStorage.setItem("requestsWelcomeShown", "true");
        }, 7000);
    }
  }

  playWelcomeSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('لا يمكن تشغيل الصوت الترحيبي:', error);
    }
  }

  async fetchRequests() {
    this.showLoadingState();
    this.isLoading = true;

    // ✨ تطبيق نظام التخزين المؤقت (Cache)
    if (this.requestsCache.has('all_requests')) {
      const data = this.requestsCache.get('all_requests');
      this.renderRequests(data);
      this.isLoading = false;
      return;
    }

    try {
      // ✨ تم تغيير المسار ليشير إلى مجلد الطلبات
      const response = await fetch('/samsar-talabak/data/requests/index.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const requestFiles = await response.json();
      const requestsData = await Promise.all(
        requestFiles.map(async (file) => {
          const res = await fetch(`/samsar-talabak/data/requests/${file}`);
          const data = await res.json();
          return { ...data, id: file.split('.')[0] };
        })
      );

      this.requestsCache.set('all_requests', requestsData);
      this.renderRequests(requestsData);

    } catch (error) {
      console.error("فشل في تحميل بيانات الطلبات:", error);
      this.showErrorState();
    } finally {
      this.isLoading = false;
    }
  }

  renderRequests(requests) {
    let filteredRequests = [...requests];

    if (this.currentFilter !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.type === this.currentFilter);
    }

    // ✨ تطبيق نظام الفرز حسب التاريخ
    if (this.currentSort === 'latest') {
      filteredRequests.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (this.currentSort === 'oldest') {
      filteredRequests.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    this.container.innerHTML = '';

    if (filteredRequests.length === 0) {
      this.showEmptyState();
      return;
    }

    filteredRequests.forEach((request, index) => {
      const card = this.createRequestCard(request);
      card.style.animationDelay = `${index * 100}ms`;
      this.container.appendChild(card);
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });

    this.highlightLastViewedCard();
  }

  createRequestCard(request) {
    const card = document.createElement("div");
    card.className = "property-card"; // استخدام نفس الكلاس للاستفادة من التصميم
    card.dataset.id = request.id;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    // ✨ تكييف النصوص والأزرار لتناسب الطلبات
    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo">
        <h2 class="property-title">${this.escapeHtml(request.title)}</h2>
      </div>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">🏷️</span><span class="detail-label">نوع الطلب:</span><span class="detail-value">${this.filters[request.type]?.label || request.type}</span></div>
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">الميزانية:</span><span class="detail-value price-highlight">${this.escapeHtml(request.budget)}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة المطلوبة:</span><span class="detail-value">${this.escapeHtml(request.area)}</span></div>
        <div class="property-detail"><span class="detail-icon">📅</span><span class="detail-label">تاريخ الطلب:</span><span class="detail-value">${this.escapeHtml(request.date)}</span></div>
      </div>
      <div class="property-description">
        <p>${this.escapeHtml(request.description)}</p>
      </div>
      <div style="text-align: center; margin-top: 1.5rem;">
        <a href="#" class="view-details-btn" onclick="EnhancedRequestDisplay.handleCardClick(event, '${request.id}')">
          لدي عرض مناسب
        </a>
      </div>
    `;
    return card;
  }

  static handleCardClick(event, requestId) {
    event.preventDefault();
    // ✨ وظيفة تمييز البطاقة عند العودة
    localStorage.setItem('lastViewedRequestId', requestId);
    // هنا يمكن إضافة منطق الانتقال إلى صفحة تقديم العرض أو صفحة التفاصيل
    alert(`سيتم توجيهك لتقديم عرض للطلب رقم: ${requestId}`);
  }

  highlightLastViewedCard() {
    const lastViewedId = localStorage.getItem('lastViewedRequestId');
    if (lastViewedId) {
      const allCards = this.container.querySelectorAll('.property-card');
      allCards.forEach(c => c.classList.remove('highlighted'));

      const cardToHighlight = this.container.querySelector(`[data-id="${lastViewedId}"]`);
      if (cardToHighlight) {
        cardToHighlight.classList.add('highlighted');
        cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // لا تقم بإزالة المفتاح للسماح بالتمييز حتى يختار المستخدم بطاقة أخرى
    }
  }

  createFilterButtons() {
    Object.keys(this.filters).forEach(key => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.dataset.filter = key;
      button.innerHTML = `${this.filters[key].icon} ${this.filters[key].label}`;
      if (key === this.currentFilter) {
        button.classList.add("active");
      }
      button.addEventListener("click", () => {
        this.currentFilter = key;
        this.updateActiveButtons();
        this.fetchRequests();
      });
      this.filterContainer.appendChild(button);
    });
  }

  createSortDropdown() {
    const sortWrapper = document.createElement('div');
    sortWrapper.className = 'date-filter-wrapper'; // إعادة استخدام الستايل
    sortWrapper.innerHTML = `
      <label for="sort-select" class="date-filter-label">📅 الفرز حسب:</label>
      <select id="sort-select" class="date-filter-select">
        <option value="latest">الأحدث أولاً</option>
        <option value="oldest">الأقدم أولاً</option>
      </select>
    `;
    const select = sortWrapper.querySelector('#sort-select');
    select.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.fetchRequests();
    });
    this.filterContainer.appendChild(sortWrapper);
  }

  updateActiveButtons() {
    this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
    });
  }

  loadInitialRequests() {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam && this.filters[filterParam]) {
      this.currentFilter = filterParam;
      this.updateActiveButtons();
    }
    this.fetchRequests();
  }

  // ✨ واجهات المستخدم المحسّنة (شاشة تحميل، حالة فارغة، حالة خطأ)
  showLoadingState() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner-enhanced"></div>
        <p>جاري تحميل الطلبات...</p>
      </div>`;
  }

  showEmptyState() {
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤷</div>
        <h3>لا توجد طلبات تطابق هذا الفلتر</h3>
        <p>جرّب تغيير فلتر البحث أو تحقق مرة أخرى لاحقاً.</p>
      </div>`;
  }

  showErrorState() {
    this.container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>حدث خطأ غير متوقع</h3>
        <p>لم نتمكن من تحميل بيانات الطلبات. يرجى المحاولة مرة أخرى.</p>
        <button class="retry-btn">إعادة المحاولة</button>
      </div>`;
    this.container.querySelector('.retry-btn').addEventListener('click', () => this.fetchRequests());
  }

  escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (match) => {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  // ✨ حقن ديناميكي للـ CSS لضمان تطابق التصميم بالكامل
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .page-header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 3rem 1rem; text-align: center; border-radius: 0 0 30px 30px; box-shadow: 0 10px 30px rgba(0, 255, 136, 0.1); margin-bottom: 2rem; }
      .page-header h1 { font-size: 3rem; background: linear-gradient(45deg, #00ff88, #00cc6a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; }
      .nav-btn { display: inline-block; padding: 1rem 2rem; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.1rem; box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3); transition: all 0.3s ease; }
      .nav-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 15px 35px rgba(0, 255, 136, 0.4); }
      .welcome-message { background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border: 2px solid #00ff88; border-radius: 20px; padding: 2.5rem; margin: 2rem auto; max-width: 800px; text-align: center; box-shadow: 0 20px 60px rgba(0, 255, 136, 0.1); }
      .filter-container { display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem; margin: 2rem 0; padding: 0 1rem; }
      .filter-btn { padding: 0.8rem 1.5rem; background: #2a2a2a; color: #f1f1f1; border: 2px solid #444; border-radius: 25px; cursor: pointer; transition: all 0.3s ease; font-weight: 600; }
      .filter-btn:hover { color: #000; background: #00ff88; border-color: #00ff88; transform: translateY(-2px); }
      .filter-btn.active { background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; border-color: #00ff88; box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3); }
      .requests-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; padding: 1rem; }
      .property-card { background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border: 1px solid #333; border-radius: 20px; padding: 2rem; transition: all 0.4s ease; cursor: pointer; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
      .property-card:hover { transform: translateY(-10px) scale(1.02); border-color: #00ff88; box-shadow: 0 25px 50px rgba(0, 255, 136, 0.2); }
      .property-card.highlighted { border: 3px solid #00ff88; box-shadow: 0 0 30px rgba(0, 255, 136, 0.4); animation: pulse 2s infinite; }
      @keyframes pulse { 0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.4); } 50% { box-shadow: 0 0 50px rgba(0, 255, 136, 0.6); } }
      .property-header { display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #333; }
      .property-logo { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #00ff88; }
      .property-title { color: #00ff88; font-size: 1.5rem; font-weight: bold; margin: 0; }
      .property-details { display: grid; gap: 0.8rem; margin: 1.5rem 0; }
      .property-detail { display: flex; align-items: center; gap: 10px; padding: 0.5rem; background: rgba(0, 255, 136, 0.05); border-radius: 10px; border-left: 3px solid #00ff88; }
      .detail-label { font-weight: 600; color: #00ff88; min-width: 120px; }
      .detail-value { color: #f1f1f1; }
      .price-highlight { color: #00ff88; font-weight: bold; }
      .property-description { background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 10px; margin: 1rem 0; border-left: 4px solid #00ff88; color: #ccc; }
      .view-details-btn { display: inline-block; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; padding: 1rem 2rem; border-radius: 15px; text-decoration: none; font-weight: bold; transition: all 0.3s ease; }
      .view-details-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0, 255, 136, 0.4); }
      .loading-container, .empty-state, .error-state { text-align: center; padding: 4rem 2rem; color: #888; grid-column: 1 / -1; }
      .loading-spinner-enhanced { width: 60px; height: 60px; border: 4px solid #333; border-top: 4px solid #00ff88; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
      .empty-icon, .error-icon { font-size: 4rem; margin-bottom: 1rem; }
      .error-state { color: #ff6b6b; }
      .retry-btn { background: #ff6b6b; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; cursor: pointer; }
      .date-filter-wrapper { display: flex; align-items: center; gap: 10px; background: #2a2a2a; padding: 8px 15px; border-radius: 25px; border: 2px solid #444; }
      .date-filter-label { color: #ccc; font-weight: 600; }
      .date-filter-select { background: transparent; border: 0; color: #00ff88; font-weight: 700; cursor: pointer; }
      .date-filter-select:focus { outline: none; }
      .date-filter-select option { background: #1e1e1e; color: #f1f1f1; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .floating-elements { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; overflow: hidden; }
      .floating-element { position: absolute; width: 6px; height: 6px; background: #00ff88; border-radius: 50%; opacity: 0.3; animation: float 6s ease-in-out infinite; }
      @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
    `;
    document.head.appendChild(style);
  }
}

// بدء تشغيل الكلاس عند تحميل المحتوى
document.addEventListener('DOMContentLoaded', () => {
  new EnhancedRequestDisplay();
});

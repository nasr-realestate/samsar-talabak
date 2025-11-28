/**
 * 🏢 سمسار طلبك - نظام عرض الطلبات (النسخة الزرقاء - نصية)
 * الملف: assets/js/requests-display-enhanced.js
 */

class RequestsDisplay {
  constructor() {
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.currentCategory = null;
    
    // الفئات (نفس فئات العقارات لكن للطلبات)
    this.categories = {
      "apartments": { label: "طلبات شقق", icon: "fa-building", color: "#0a84ff" },
      "shops": { label: "طلبات تجاري", icon: "fa-store", color: "#0a84ff" },
      "offices": { label: "طلبات مكاتب", icon: "fa-briefcase", color: "#0a84ff" }
    };

    this.init();
  }

  async init() {
    if (!this.container) return;
    this.createFilters();
    this.loadCategory('apartments'); // الفئة الافتراضية
  }

  createFilters() {
    if (!this.filterContainer) return;
    this.filterContainer.innerHTML = '';
    
    Object.entries(this.categories).forEach(([key, cat]) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.innerHTML = `<i class="fas ${cat.icon}"></i> ${cat.label}`;
      btn.onclick = () => this.loadCategory(key);
      
      if (key === 'apartments') btn.classList.add('active'); // تفعيل الأول
      this.filterContainer.appendChild(btn);
    });
  }

  async loadCategory(category) {
    this.currentCategory = category;
    
    // تحديث شكل الأزرار
    document.querySelectorAll('#filter-buttons .filter-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`button[onclick*="${category}"]`);
    if(activeBtn) activeBtn.classList.add('active');

    this.showLoading();

    try {
      // جلب الفهرس الخاص بالقسم
      const response = await fetch(`/data/requests/${category}/index.json?t=${Date.now()}`);
      if (!response.ok) throw new Error("No data");
      
      const files = await response.json();
      
      // جلب التفاصيل
      const promises = files.map(file => 
        fetch(`/data/requests/${category}/${file}`)
          .then(res => res.json())
          .then(data => ({...data, filename: file}))
          .catch(() => null)
      );

      const requests = (await Promise.all(promises)).filter(i => i !== null);
      this.renderRequests(requests);

    } catch (error) {
      this.showEmpty();
    }
  }

  renderRequests(requests) {
    if (requests.length === 0) {
      this.showEmpty();
      return;
    }

    this.container.innerHTML = '';
    
    // ترتيب بالأحدث
    requests.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    requests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'property-card text-mode';
      // تصميم أزرق مميز للطلبات
      card.style.borderTop = '4px solid #0a84ff';
      card.style.background = 'linear-gradient(145deg, #0f0f0f, #161616)';

      // الرابط الصحيح (id + category)
      const cleanId = req.filename.replace('.json', '');
      card.onclick = () => window.location.href = `/request-details.html?category=${this.currentCategory}&id=${cleanId}`;

      const timeAgo = this.getTimeAgo(req.date);

      card.innerHTML = `
        <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                <span style="color: #0a84ff; background: rgba(10, 132, 255, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid #0a84ff;">
                    <i class="fas fa-user"></i> طلب شراء
                </span>
                <span style="color:#666;">${timeAgo}</span>
            </div>
            <h3 style="color:#fff; font-size:1.2rem; margin:5px 0;">${req.title}</h3>
            <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#0a84ff"></i> ${req.location}</p>
        </div>

        <div class="property-details" style="margin-bottom:15px;">
             <div style="background: rgba(10, 132, 255, 0.05); padding: 10px; border-radius: 8px; border-right: 3px solid #0a84ff;">
                <span style="color:#aaa; font-size:0.9rem;">الميزانية:</span>
                <div style="color: #fff; font-weight:bold; font-size:1.1rem;">${req.budget}</div>
             </div>
             
             <div style="margin-top: 10px; display: flex; gap: 10px; font-size: 0.9rem; color: #ccc;">
                ${req.rooms ? `<span><i class="fas fa-bed"></i> ${req.rooms} غرف</span>` : ''}
                ${req.area ? `<span><i class="fas fa-ruler"></i> ${req.area}</span>` : ''}
             </div>
        </div>

        <div style="margin-top:auto; text-align:left;">
            <button style="background:transparent; border:none; color:#0a84ff; cursor:pointer;">
                لديك هذا العقار؟ <i class="fas fa-arrow-left"></i>
            </button>
        </div>
      `;
      this.container.appendChild(card);
    });
  }

  showLoading() {
    this.container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#0a84ff;">جاري التحميل...</div>`;
  }

  showEmpty() {
    this.container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#666;">لا توجد طلبات في هذا القسم حالياً.</div>`;
  }

  getTimeAgo(dateString) {
    if (!dateString) return 'جديد';
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'اليوم';
    if (days < 30) return `منذ ${days} أيام`;
    return `منذ شهر`;
  }
}

document.addEventListener('DOMContentLoaded', () => new RequestsDisplay());

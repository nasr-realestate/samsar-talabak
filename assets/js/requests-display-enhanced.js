/**
 * 🏢 سمسار طلبك - نظام عرض الطلبات (النسخة الزرقاء الكاملة - 5 فئات)
 * الملف: assets/js/requests-display-enhanced.js
 */

class RequestsDisplay {
  constructor() {
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.currentCategory = null;
    
    // 💎 التحديث: 5 فئات مطابقة للعروض ولكن بأسماء "طلبات"
    this.categories = {
      "apartments": { label: "مطلوب شراء", icon: "fa-home", color: "#0a84ff" },
      "apartments-rent": { label: "مطلوب إيجار", icon: "fa-key", color: "#0a84ff" },
      "shops": { label: "مطلوب تجاري", icon: "fa-store", color: "#0a84ff" },
      "offices": { label: "مطلوب مكاتب", icon: "fa-briefcase", color: "#0a84ff" },
      "admin-hq": { label: "مطلوب مقرات", icon: "fa-building", color: "#0a84ff" }
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
      // استخدام الكلاسات والستايل لضمان المظهر
      btn.innerHTML = `<i class="fas ${cat.icon}"></i> ${cat.label}`;
      btn.onclick = (e) => {
        e.preventDefault();
        this.loadCategory(key);
      };
      
      // إضافة تأثير هوفر أزرق
      btn.style.setProperty('--hover-color', '#0a84ff'); 
      
      this.filterContainer.appendChild(btn);
    });
  }

  async loadCategory(category) {
    this.currentCategory = category;
    
    // تحديث شكل الأزرار (Active State)
    const allBtns = this.filterContainer.querySelectorAll('.filter-btn');
    allBtns.forEach(b => {
        b.classList.remove('active');
        // إعادة تعيين الستايل للأزرار غير النشطة
        b.style.backgroundColor = 'var(--color-surface-2)';
        b.style.color = 'var(--color-text-secondary)';
        b.style.borderColor = 'var(--color-border)';
    });

    // تلوين الزر النشط بالأزرق
    const activeBtn = Array.from(allBtns).find(b => b.innerHTML.includes(this.categories[category].label));
    if(activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.backgroundColor = '#0a84ff';
        activeBtn.style.color = '#fff';
        activeBtn.style.borderColor = '#0a84ff';
        activeBtn.style.boxShadow = '0 0 15px rgba(10, 132, 255, 0.4)';
    }

    this.showLoading();

    try {
      // 1. جلب الفهرس
      // ملاحظة: تأكد أن لديك مجلدات بهذه الأسماء في data/requests/
      const response = await fetch(`/data/requests/${category}/index.json?t=${Date.now()}`);
      
      if (!response.ok) {
          this.showEmpty();
          return;
      }
      
      const files = await response.json();
      
      if (!Array.isArray(files) || files.length === 0) {
          this.showEmpty();
          return;
      }
      
      // 2. جلب التفاصيل
      const promises = files.map(file => 
        fetch(`/data/requests/${category}/${file}`)
          .then(res => res.json())
          .then(data => ({...data, filename: file}))
          .catch(() => null)
      );

      const requests = (await Promise.all(promises)).filter(i => i !== null);
      this.renderRequests(requests);

    } catch (error) {
      console.error(error);
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
      
      // 🔹 التصميم الأزرق الخاص بالطلبات
      card.style.borderTop = '4px solid #0a84ff';
      card.style.background = 'linear-gradient(145deg, #0f0f0f, #161616)';

      // الرابط الصحيح
      const cleanId = req.filename.replace('.json', '');
      card.onclick = () => window.location.href = `/request-details.html?category=${this.currentCategory}&id=${cleanId}`;

      const timeAgo = this.getTimeAgo(req.date);

      card.innerHTML = `
        <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                <span style="color: #0a84ff; background: rgba(10, 132, 255, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid #0a84ff;">
                    <i class="fas fa-bullhorn"></i> ${this.categories[this.currentCategory].label}
                </span>
                <span style="color:#666;">${timeAgo}</span>
            </div>
            <h3 style="color:#fff; font-size:1.2rem; margin:5px 0;">${req.title || 'مطلوب عقار'}</h3>
            <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#0a84ff"></i> ${req.location || 'مدينة نصر'}</p>
        </div>

        <div class="property-details" style="margin-bottom:15px;">
             <!-- الميزانية بشكل بارز -->
             <div style="background: rgba(10, 132, 255, 0.05); padding: 12px; border-radius: 8px; border-right: 3px solid #0a84ff; margin-bottom: 10px;">
                <span style="color:#aaa; font-size:0.9rem; display:block;">الميزانية المرصودة:</span>
                <div style="color: #fff; font-weight:bold; font-size:1.2rem;">${req.budget || 'حسب السوق'}</div>
             </div>
             
             <!-- المواصفات السريعة -->
             <div style="display: flex; gap: 15px; font-size: 0.9rem; color: #ccc;">
                ${req.rooms ? `<span><i class="fas fa-bed" style="color:#0a84ff"></i> ${req.rooms} غرف</span>` : ''}
                ${req.area ? `<span><i class="fas fa-ruler" style="color:#0a84ff"></i> ${req.area}</span>` : ''}
             </div>
        </div>

        <div style="margin-top:auto; text-align:left; padding-top: 10px; border-top: 1px solid #222;">
            <span style="color:#0a84ff; cursor:pointer; font-size: 0.9rem;">
                لديك هذا العقار؟ <i class="fas fa-angle-left"></i>
            </span>
        </div>
      `;
      this.container.appendChild(card);
    });
  }

  showLoading() {
    this.container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem; color:#0a84ff;">
            <div class="loading-spinner" style="border: 3px solid #333; border-top-color: #0a84ff; width: 50px; height: 50px; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            جاري تحميل الطلبات...
        </div>`;
  }

  showEmpty() {
    this.container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem; color:#666;">
            <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <p>لا توجد طلبات نشطة في قسم "${this.categories[this.currentCategory].label}" حالياً.</p>
        </div>`;
  }

  getTimeAgo(dateString) {
    if (!dateString) return 'جديد';
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 30) return `منذ ${days} أيام`;
    return `منذ شهر`;
  }
}

document.addEventListener('DOMContentLoaded', () => new RequestsDisplay());

/**
 * 🔥 enhanced-request-display.js
 * إصدار احترافي لعرض العقارات مع تحسينات الأداء والتفاعل
 */

class EnhancedPropertyDisplay {
  constructor() {
    this.container = document.getElementById("properties-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.searchInput = document.getElementById("property-search");
    this.sortSelect = document.getElementById("sort-select");

    this.currentCategory = null;
    this.fullData = [];
    this.filteredData = [];
    this.batchSize = 8;
    this.renderedCount = 0;
    this.loading = false;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000;

    this.categories = {
      "apartments": "شقق للبيع",
      "apartments-rent": "شقق للإيجار",
      "shops": "محلات",
      "offices": "مكاتب",
      "admin-hq": "مقرات إدارية"
    };

    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  init() {
    if (!this.container || !this.filterContainer) {
      console.error("❌ لم يتم العثور على الحاويات.");
      return;
    }
    this.initButtons();
    this.initSearch();
    this.initSort();
    this.loadCategory(Object.keys(this.categories)[0]);

    window.addEventListener("scroll", () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        this.renderNextBatch();
      }
    });
  }

  initButtons() {
    this.filterContainer.innerHTML = "";
    Object.entries(this.categories).forEach(([key, label]) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = "filter-btn";
      btn.dataset.category = key;
      btn.addEventListener("click", () => {
        this.loadCategory(key);
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
      this.filterContainer.appendChild(btn);
    });
  }

  initSearch() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.filteredData = this.fullData.filter(prop =>
          prop.title.toLowerCase().includes(this.searchInput.value.toLowerCase())
        );
        this.renderedCount = 0;
        this.container.innerHTML = "";
        this.renderNextBatch();
      });
    }
  }

  initSort() {
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", () => {
        const value = this.sortSelect.value;
        if (value === "asc") {
          this.filteredData.sort((a, b) => this.getPrice(a) - this.getPrice(b));
        } else if (value === "desc") {
          this.filteredData.sort((a, b) => this.getPrice(b) - this.getPrice(a));
        }
        this.renderedCount = 0;
        this.container.innerHTML = "";
        this.renderNextBatch();
      });
    }
  }

  async loadCategory(category) {
    this.currentCategory = category;
    this.container.innerHTML = `<div class="loading-spinner"></div><p style="text-align:center;">جاري تحميل العروض...</p>`;
    this.renderedCount = 0;

    const cacheKey = category;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
      this.fullData = cached.data;
    } else {
      try {
        const indexPath = `/samsar-talabak/data/properties/${category}/index.json`;
        const indexRes = await fetch(indexPath);
        const files = await indexRes.json();
        const allData = await Promise.all(
          files.map(async (filename) => {
            try {
              const res = await fetch(`/samsar-talabak/data/properties/${category}/${filename}`);
              const data = await res.json();
              return { ...data, filename };
            } catch {
              return null;
            }
          })
        );
        this.fullData = allData.filter(Boolean);
        this.cache.set(cacheKey, { data: this.fullData, timestamp: Date.now() });
      } catch (err) {
        this.container.innerHTML = `<p style="text-align:center;">❌ حدث خطأ أثناء تحميل العروض.</p>`;
        return;
      }
    }

    this.filteredData = [...this.fullData];
    this.container.innerHTML = "";
    this.renderNextBatch();
  }

  renderNextBatch() {
    if (this.loading || this.renderedCount >= this.filteredData.length) return;
    this.loading = true;

    const batch = this.filteredData.slice(this.renderedCount, this.renderedCount + this.batchSize);
    batch.forEach((property, index) => {
      const card = this.createCard(property);
      this.container.appendChild(card);
      requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    });

    this.renderedCount += this.batchSize;
    this.loading = false;
  }

  createCard(data) {
    const card = document.createElement("div");
    card.className = "property-card";
    card.style = `
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.4s ease;
      background: #1e1e1e;
      color: #f1f1f1;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-radius: 12px;
      border: 1px solid #333;
      box-shadow: 0 0 15px rgba(0,0,0,0.4);
      font-family: 'Tajawal', sans-serif;
    `;

    const detailLink = `/samsar-talabak/details.html?category=${this.currentCategory}&file=${encodeURIComponent(data.filename)}`;

    card.innerHTML = `
      <h3 style="color:#00ff88; font-size:1.5rem; margin-bottom: 0.5rem;">${data.title}</h3>
      <p><strong>💰 السعر:</strong> ${data.price}</p>
      <p><strong>📏 المساحة:</strong> ${data.area}</p>
      <p><strong>📅 تاريخ الإضافة:</strong> ${data.date || "غير متوفر"}</p>
      <p><strong>📝 التفاصيل:</strong> ${data.description}</p>
      <div style="margin-top:1rem;">
        <a href="${detailLink}" style="background:#00ff88; color:#000; padding:0.6rem 1.2rem; border-radius:8px; text-decoration:none; font-weight:bold;">👁️ عرض التفاصيل</a>
      </div>
    `;

    // تمييز البطاقة المختارة
    const highlighted = localStorage.getItem("highlightCard");
    if (highlighted === data.filename) {
      card.style.outline = "3px solid #00ff88";
    }
    card.addEventListener("click", () => {
      localStorage.setItem("highlightCard", data.filename);
    });

    return card;
  }

  getPrice(property) {
    const raw = property.price || "";
    const digits = raw.replace(/[^\d]/g, "");
    return parseInt(digits) || 0;
  }
}

new EnhancedPropertyDisplay();

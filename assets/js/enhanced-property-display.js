// EnhancedPropertyDisplay.js // نسخة متكاملة بجميع التحسينات: // - تحميل المزيد // - فرز حسب السعر // - بحث مباشر // - دعم اهتزاز الموبايل // - تصميم احترافي متجاوب

class EnhancedPropertyDisplay { constructor() { this.container = null; this.filterContainer = null; this.sortSelect = null; this.searchInput = null; this.currentCategory = null; this.properties = []; this.visibleCount = 0; this.BATCH_SIZE = 10; this.propertiesCache = new Map(); this.isLoading = false; this.config = { cacheExpiry: 5 * 60 * 1000 };

this.categories = {
  "apartments": { label: "شقق للبيع", icon: "🏠", color: "#2ecc71" },
  "apartments-rent": { label: "شقق للإيجار", icon: "🏡", color: "#3498db" },
  "shops": { label: "محلات", icon: "🏪", color: "#e67e22" },
  "offices": { label: "مكاتب", icon: "🏢", color: "#9b59b6" },
  "admin-hq": { label: "مقرات", icon: "🏛️", color: "#f1c40f" }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => this.init());
} else {
  this.init();
}

}

init() { this.setupElements(); this.createFilterButtons(); this.loadDefaultCategory(); this.setupSortSearch(); }

setupElements() { this.container = document.getElementById("properties-container"); this.filterContainer = document.getElementById("filter-buttons"); this.sortSelect = document.getElementById("sort-select"); this.searchInput = document.getElementById("search-input"); if (!this.container || !this.filterContainer) throw new Error('عناصر الصفحة ناقصة'); }

createFilterButtons() { this.filterContainer.innerHTML = ''; Object.entries(this.categories).forEach(([key, category]) => { const button = document.createElement("button"); button.innerHTML = ${category.icon} ${category.label}; button.dataset.category = key; button.className = "filter-btn"; button.style.setProperty('--category-color', category.color); button.onclick = () => this.handleCategoryChange(key, button); this.filterContainer.appendChild(button); }); }

updateActiveButton(activeBtn) { this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active')); if (activeBtn) activeBtn.classList.add('active'); }

setupSortSearch() { if (this.sortSelect) { this.sortSelect.onchange = () => this.displayVisibleBatch(); } if (this.searchInput) { this.searchInput.oninput = () => this.displayVisibleBatch(); } }

loadDefaultCategory() { const defaultCategory = Object.keys(this.categories)[0]; const btn = this.filterContainer.querySelector([data-category="${defaultCategory}"]); if (btn) btn.click(); }

async handleCategoryChange(category, button) { if (this.isLoading && this.currentCategory === category) return; this.isLoading = true; this.currentCategory = category; this.updateActiveButton(button); this.visibleCount = 0; this.properties = []; this.showLoading();

const cached = this.getCachedData(category);
if (cached) {
  this.properties = cached;
  this.displayVisibleBatch();
} else {
  try {
    const files = await this.fetchFiles(category);
    const props = await Promise.all(files.map(f => this.fetchProperty(category, f)));
    this.properties = props.filter(Boolean);
    this.setCachedData(category, this.properties);
    this.displayVisibleBatch();
  } catch (e) {
    this.showError("فشل تحميل البيانات.");
  }
}
this.isLoading = false;

}

async fetchFiles(category) { const res = await fetch(/samsar-talabak/data/properties/${category}/index.json); if (!res.ok) throw new Error(); return await res.json(); }

async fetchProperty(category, filename) { const res = await fetch(/samsar-talabak/data/properties/${category}/${filename}); if (!res.ok) return null; const data = await res.json(); return { ...data, filename }; }

getCachedData(category) { const cached = this.propertiesCache.get(category); if (!cached || (Date.now() - cached.timestamp > this.config.cacheExpiry)) return null; return cached.data; }

setCachedData(category, data) { this.propertiesCache.set(category, { data, timestamp: Date.now() }); }

showLoading() { this.container.innerHTML = <p class="loading-text">⏳ جاري التحميل...</p>; }

showError(msg) { this.container.innerHTML = <p class="error-text">❌ ${msg}</p>; }

displayVisibleBatch() { const filtered = this.getFilteredProperties(); const toDisplay = filtered.slice(0, this.visibleCount + this.BATCH_SIZE); this.container.innerHTML = '';

toDisplay.forEach((prop, i) => {
  const card = this.createCard(prop, i);
  this.container.appendChild(card);
  requestAnimationFrame(() => {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
});

this.visibleCount = toDisplay.length;
if (this.visibleCount < filtered.length) {
  const btn = document.createElement('button');
  btn.textContent = '🔽 تحميل المزيد';
  btn.className = 'load-more-btn';
  btn.onclick = () => {
    btn.remove();
    if (navigator.vibrate) navigator.vibrate(30);
    this.displayVisibleBatch();
  };
  this.container.appendChild(btn);
}

}

getFilteredProperties() { let filtered = [...this.properties]; const search = this.searchInput?.value?.trim(); const sort = this.sortSelect?.value;

if (search) {
  filtered = filtered.filter(p => p.title?.includes(search) || p.description?.includes(search));
}

if (sort === 'price-low') {
  filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
} else if (sort === 'price-high') {
  filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
}
return filtered;

}

createCard(prop, index) { const card = document.createElement("div"); card.className = "property-card-pro"; card.style.transition = all 0.4s ease ${index * 60}ms; card.style.opacity = 0; card.style.transform = 'translateY(20px)';

const detailURL = `/samsar-talabak/details.html?category=${this.currentCategory}&file=${encodeURIComponent(prop.filename)}`;

card.innerHTML = `
  <div class="pro-card-header">
    <div class="pro-card-icon">${this.categories[this.currentCategory].icon}</div>
    <div class="pro-card-category">${this.categories[this.currentCategory].label}</div>
    <div class="pro-card-logo">سمسار طلبك</div>
  </div>
  <div class="pro-card-body">
    <h3 class="pro-card-title">${prop.title}</h3>
    <div class="pro-card-details">
      <div><strong>💰 السعر:</strong> ${prop.price}</div>
      <div><strong>📏 المساحة:</strong> ${prop.area}</div>
      <div><strong>📍 العنوان:</strong> ${prop.location || 'غير محدد'}</div>
    </div>
    <p class="pro-card-description">${prop.description}</p>
  </div>
  <div class="pro-card-footer">
    <a href="${detailURL}" class="pro-details-btn">عرض التفاصيل →</a>
  </div>
`;
return card;

} }

window.propertyDisplay = new EnhancedPropertyDisplay();


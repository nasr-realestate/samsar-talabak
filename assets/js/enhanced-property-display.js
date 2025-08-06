/**
 * 🏢 سمسار طلبك - نظام عرض العقارات (النسخة النهائية الكاملة v4.0 - بالتصميم الجديد والمحرك الصحيح)
 */

class EnhancedPropertyDisplay {
    constructor() {
        this.container = document.getElementById("properties-container");
        this.filterContainer = document.getElementById("filter-buttons");
        this.welcomeBox = document.getElementById("welcome-message");
        this.sortingVisual = document.getElementById("sorting-visual"); // From new design
        this.currentCategory = null;
        this.currentDateFilter = 'latest';
        this.propertiesCache = new Map();
        this.isLoading = false;
        
        this.config = {
            cacheExpiry: 5 * 60 * 1000,
            loadingDelay: 800,
            welcomeDisplayTime: 7000,
        };

        this.categories = {
            "apartments": { label: "🏠 شقق للبيع", icon: "🏠", color: "#00ff88", description: "شقق سكنية فاخرة" },
            "apartments-rent": { label: "🏡 شقق للإيجار", icon: "🏡", color: "#00ccff", description: "شقق للإيجار الشهري" },
            "shops": { label: "🏪 محلات تجارية", icon: "🏪", color: "#ff6b35", description: "محلات ومساحات تجارية" },
            "offices": { label: "🏢 مكاتب إدارية", icon: "🏢", color: "#8b5cf6", description: "مكاتب ومساحات عمل" },
            "admin-hq": { label: "🏛️ مقرات إدارية", icon: "🏛️", color: "#f59e0b", description: "مقرات ومباني إدارية" }
        };

        this.init();
    }

    async init() {
        try {
            await this.waitForDOM();
            this.setupEventListeners();
            this.handleWelcomeMessage();
            this.createFilterButtons();
            this.createDateFilter();
            this.loadDefaultCategory();
            this.createSortingVisualization();
        } catch (error) {
            console.error('خطأ في تهيئة التطبيق:', error);
            this.showErrorMessage('حدث خطأ في تحميل التطبيق');
        }
    }

    async waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    setupEventListeners() {
        // Add any necessary event listeners here
    }

    handleWelcomeMessage() {
        if (!this.welcomeBox) return;
        const hasShownWelcome = localStorage.getItem("welcomeShown");
        if (!hasShownWelcome) {
            setTimeout(() => this.showWelcomeMessage(), 500);
        }
    }

    showWelcomeMessage() {
        if (!this.welcomeBox) return;
        this.welcomeBox.style.display = "block";
        this.welcomeBox.style.opacity = "0";
        this.welcomeBox.style.transform = "translateY(30px) scale(0.95)";
        requestAnimationFrame(() => {
            this.welcomeBox.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
            this.welcomeBox.style.opacity = "1";
            this.welcomeBox.style.transform = "translateY(0) scale(1)";
        });
        setTimeout(() => this.hideWelcomeMessage(), this.config.welcomeDisplayTime);
    }

    hideWelcomeMessage() {
        if (!this.welcomeBox) return;
        this.welcomeBox.style.transition = "all 0.4s ease-out";
        this.welcomeBox.style.opacity = "0";
        this.welcomeBox.style.transform = "translateY(-20px) scale(0.95)";
        setTimeout(() => {
            this.welcomeBox.style.display = "none";
            localStorage.setItem('welcomeShown', "true");
        }, 400);
    }

    createFilterButtons() {
        Object.entries(this.categories).forEach(([key, category]) => {
            const button = this.createFilterButton(key, category);
            this.filterContainer.appendChild(button);
        });
    }

    createFilterButton(key, category) {
        const button = document.createElement("button");
        button.textContent = category.label;
        button.dataset.category = key;
        button.className = "filter-btn enhanced-filter-btn";
        button.addEventListener("click", () => this.handleCategoryChange(key, button));
        return button;
    }

    createDateFilter() {
        const filterWrapper = document.createElement('div');
        filterWrapper.className = 'date-filter-wrapper';
        filterWrapper.innerHTML = `<label for="date-filter" class="date-filter-label">📅 الفرز حسب:</label><select id="date-filter" class="date-filter-select"><option value="latest">الأحدث أولاً</option><option value="all">كل الأوقات</option><option value="last_week">آخر أسبوع</option><option value="last_month">آخر شهر</option></select>`;
        this.filterContainer.appendChild(filterWrapper);
        document.getElementById('date-filter').addEventListener('change', (e) => this.handleDateFilterChange(e.target.value));
    }

    async handleCategoryChange(category, button) {
        if (this.isLoading || this.currentCategory === category) return;
        this.currentCategory = category;
        this.updateActiveButton(button);
        await this.loadCategory(category);
        localStorage.setItem('lastCategory', category);
    }
    
    async handleDateFilterChange(newFilterValue) {
        this.currentDateFilter = newFilterValue;
        if (this.currentCategory) {
            await this.loadCategory(this.currentCategory);
        }
    }

    updateActiveButton(activeButton) {
        this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    loadDefaultCategory() {
        const savedCategory = localStorage.getItem('lastCategory') || Object.keys(this.categories)[0];
        const defaultButton = this.filterContainer.querySelector(`[data-category="${savedCategory}"]`);
        if (defaultButton) {
            defaultButton.click();
        }
    }
    
    async loadCategory(category) {
        this.isLoading = true;
        this.showLoadingState();
        try {
            let data = this.getCachedData(category);
            if (!data) {
                data = await this.fetchCategoryData(category);
                this.setCachedData(category, data);
            }
            await this.displayProperties(data);
        } catch (error) {
            this.showErrorMessage('فشل في تحميل البيانات');
        } finally {
            this.isLoading = false;
        }
    }

    async fetchCategoryData(category) {
        const indexResponse = await fetch(`/data/properties/${category}/index.json?t=${Date.now()}`);
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const files = await indexResponse.json();
        if (!Array.isArray(files) || files.length === 0) return [];
        const propertyPromises = files.map(filename => this.fetchPropertyData(category, filename));
        return Promise.all(propertyPromises).then(properties => properties.filter(p => p !== null));
    }

    async fetchPropertyData(category, filename) {
        try {
            const response = await fetch(`/data/properties/${category}/${filename}?t=${Date.now()}`);
            if (!response.ok) return null;
            const data = await response.json();
            return { ...data, filename, category };
        } catch (error) {
            console.warn(`فشل في تحميل ${filename}:`, error);
            return null;
        }
    }
    
    applyFiltersAndSorting(properties) {
        let processedProperties = [...properties];
        processedProperties.forEach(p => { p._date = new Date(p.date); });
        
        if (this.currentDateFilter === 'last_week' || this.currentDateFilter === 'last_month') {
            const now = new Date();
            const daysToFilter = this.currentDateFilter === 'last_week' ? 7 : 30;
            processedProperties = processedProperties.filter(p => {
                if (!p._date) return false;
                const diffDays = (now - p._date) / (1000 * 60 * 60 * 24);
                return diffDays <= daysToFilter;
            });
        }
        
        if (this.currentDateFilter !== 'all') {
            processedProperties.sort((a, b) => b._date - a._date);
        }
        
        return processedProperties;
    }

    async displayProperties(properties) {
        const filteredProperties = this.applyFiltersAndSorting(properties);
        if (filteredProperties.length === 0) {
            this.showEmptyState();
            return;
        }
        this.container.innerHTML = '';
        for (const [index, property] of filteredProperties.entries()) {
            await this.delay(50);
            const card = this.createPropertyCard(property, this.currentCategory, index);
            this.container.appendChild(card);
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        }
    }

    createPropertyCard(property, category, index) {
        const categoryInfo = this.categories[category];
        const card = document.createElement("div");
        card.className = "enhanced-property-card";
        card.style.cssText = `opacity: 0; transform: translateY(30px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); animation-delay: ${index * 50}ms;`;

        const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : 'id-not-found');
        const detailPage = `/property/${propertyId}`;

        const priceToRender = this.escapeHtml(property.price_display || property.price || "غير محدد");
        const areaToRender = this.escapeHtml(property.area_display || property.area || "غير محددة");
        const descriptionText = property.description || "لا يوجد وصف مفصل";

        card.innerHTML = `
            <div class="property-header">
                <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo">
                <div class="property-brand">
                    <strong>سمسار طلبك</strong>
                    <span class="property-category-badge" style="background: ${categoryInfo.color}">${categoryInfo.icon} ${categoryInfo.label}</span>
                </div>
            </div>
            <h3 class="property-title">${this.escapeHtml(property.title)}</h3>
            <div class="property-details">
                <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">السعر:</span><span class="detail-value price-highlight">${priceToRender}</span></div>
                <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${areaToRender}</span></div>
            </div>
            <div class="property-description"><p>${this.escapeHtml(descriptionText.substring(0, 100))}...</p></div>
            <div class="property-footer">
                <a href="${detailPage}" class="view-details-btn">
                    <span class="btn-text">عرض التفاصيل الكاملة</span>
                    <span class="btn-arrow">→</span>
                </a>
                <div class="property-stats">
                    <span class="stat-item"><span class="stat-icon">📅</span><span>${this.escapeHtml(property.date || "")}</span></span>
                    <span class="stat-item"><span class="stat-icon">⏰</span><span>${this.getTimeAgo(property.date)}</span></span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                window.location.href = detailPage;
            }
        });

        return card;
    }

    showLoadingState() {
        this.container.innerHTML = `<div class="loading-container"><div class="loading-spinner-enhanced"></div><h3>جاري تحميل العروض...</h3></div>`;
    }

    showEmptyState() {
        this.container.innerHTML = `<div class="empty-state"><h3>لا توجد عروض تطابق هذا الفلتر حاليًا.</h3></div>`;
    }

    showErrorMessage(message) {
        this.container.innerHTML = `<div class="error-state"><h3>حدث خطأ</h3><p>${message}</p></div>`;
    }

    createSortingVisualization() {
        if (!this.sortingVisual) return;
        const barCount = 15;
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'sorting-bar';
            bar.style.left = `${(i * 100 / barCount) + (100 / barCount / 2)}%`;
            bar.style.height = `${20 + Math.random() * 80}%`;
            this.sortingVisual.appendChild(bar);
        }
    }
    
    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
    getTimeAgo(dateString) { if (!dateString) return 'غير محدد'; const date = new Date(dateString); const diffDays = (new Date() - date) / (1000 * 60 * 60 * 24); if (diffDays < 1) return 'اليوم'; if (diffDays < 2) return 'أمس'; return `منذ ${Math.floor(diffDays)} أيام`; }
    getCachedData(category) { const cached = this.propertiesCache.get(category); if (cached && (Date.now() - cached.timestamp < this.config.cacheExpiry)) { return cached.data; } return null; }
    setCachedData(category, data) { this.propertiesCache.set(category, { data, timestamp: Date.now() }); }
}

if (document.getElementById("properties-container")) {
    new EnhancedPropertyDisplay();
}

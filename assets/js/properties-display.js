/**
 * نظام عرض العقارات المحسن - سمسار طلبك (الإصدار المعدل)
 * Enhanced Property Display System - Fixed Version
 */
class EnhancedPropertyDisplay {
    constructor() {
        this.container = null;
        this.filterContainer = null;
        this.currentCategory = null;
        this.propertiesCache = new Map();
        this.isLoading = false;
        this.lastRequestTime = 0; // لتتبع آخر طلب
        this.minRequestInterval = 500; // 500 مللي ثانية بين الطلبات

        this.config = {
            animationDuration: 300,
            cacheExpiry: 5 * 60 * 1000,
            loadingDelay: 500,
            maxRetries: 3,
            retryDelay: 1000,
            baseDataPath: `${site_baseurl}/data/`
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
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        this.setupElements();
        this.createFilterButtons();
        this.loadDefaultCategory();
    }

    setupElements() {
        this.container = document.getElementById("properties-container");
        this.filterContainer = document.getElementById("filter-buttons");
        if (!this.container || !this.filterContainer) {
            console.error('العناصر الأساسية غير موجودة.');
        }
    }
    
    createFilterButtons() {
        this.filterContainer.innerHTML = '';
        Object.entries(this.categories).forEach(([key, category]) => {
            const button = document.createElement("button");
            button.innerHTML = `${category.icon} ${category.label}`;
            button.dataset.category = key;
            button.className = "filter-btn";
            button.title = category.description;
            
            // إضافة منع النقر المتكرر
            button.addEventListener("click", (e) => {
                if (this.isLoading || Date.now() - this.lastRequestTime < this.minRequestInterval) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                this.handleCategoryChange(key, button);
            });
            
            this.filterContainer.appendChild(button);
        });
    }

    async handleCategoryChange(categoryKey, button) {
        // منع الطلبات المتكررة
        if (this.isLoading || this.currentCategory === categoryKey) return;
        
        // تسجيل وقت الطلب الأخير
        this.lastRequestTime = Date.now();
        
        this.isLoading = true;
        this.currentCategory = categoryKey;
        this.updateActiveButton(button);
        this.showLoadingState();

        try {
            await this.delay(this.config.loadingDelay);
            const data = await this.loadCategoryData(categoryKey);
            this.displayProperties(data, categoryKey);
        } catch (error) {
            console.error(`خطأ في تحميل التصنيف ${categoryKey}:`, error);
            this.showErrorMessage(`فشل في تحميل عروض "${this.categories[categoryKey].label}"`);
        } finally {
            this.isLoading = false;
        }
    }
    
    updateActiveButton(activeButton) {
        this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.disabled = false; // تمكين جميع الأزرار
        });
        
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.disabled = true; // تعطيل الزر النشط مؤقتًا
            setTimeout(() => {
                if (activeButton) activeButton.disabled = false;
            }, 1000);
        }
    }

    loadDefaultCategory() {
        const defaultCategoryKey = Object.keys(this.categories)[0];
        const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategoryKey}"]`);
        if (defaultButton) {
            this.handleCategoryChange(defaultCategoryKey, defaultButton);
        }
    }

    async loadCategoryData(categoryKey) {
        const cached = this.propertiesCache.get(categoryKey);
        if (cached && (Date.now() - cached.timestamp < this.config.cacheExpiry)) {
            return cached.data;
        }

        const data = await this.fetchCategoryData(categoryKey);
        this.propertiesCache.set(categoryKey, { data, timestamp: Date.now() });
        return data;
    }

    async fetchCategoryData(categoryKey) {
        const indexUrl = `${this.config.baseDataPath}${categoryKey}/index.json`;
        const indexResponse = await fetch(indexUrl, { cache: 'no-store' });
        if (!indexResponse.ok) {
            throw new Error(`لا يمكن العثور على ملف الفهرس: ${indexUrl}. الحالة: ${indexResponse.status}`);
        }
        const filenames = await indexResponse.json();

        if (!Array.isArray(filenames) || filenames.length === 0) {
            return [];
        }

        // تحسين الأداء: تحميل فقط أول 15 عقارًا
        const limitedFilenames = filenames.slice(0, 15);
        
        const propertyPromises = limitedFilenames.map(filename => {
            const fileUrl = `${this.config.baseDataPath}${categoryKey}/${filename}`;
            return fetch(fileUrl).then(res => {
                if (!res.ok) {
                    console.warn(`فشل تحميل الملف: ${fileUrl}`);
                    return null;
                }
                return res.json();
            }).catch(err => {
                console.error(`خطأ في جلب ${fileUrl}:`, err);
                return null;
            });
        });

        const properties = await Promise.all(propertyPromises);
        return properties.filter(p => p !== null);
    }

    showLoadingState() {
        this.container.innerHTML = `
            <div style="text-align: center; grid-column: 1 / -1; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p style="color: #00ff88; font-size: 1.2rem; margin-top: 1rem;">جاري تحميل أحدث العروض المميزة...</p>
            </div>`;
    }

    displayProperties(properties, categoryKey) {
        if (!properties || properties.length === 0) {
            this.showEmptyState(categoryKey);
            return;
        }

        this.container.innerHTML = '';
        properties.forEach((property, index) => {
            const card = this.createPropertyCard(property);
            card.style.animation = `slideInUp 0.6s ${index * 0.1}s ease-out forwards`;
            card.style.opacity = 0;
            this.container.appendChild(card);
        });
    }

    createPropertyCard(property) {
        const card = document.createElement("article");
        card.className = "property-card";
        const detailPageUrl = `${site_baseurl}/details.html?id=${encodeURIComponent(property.slug || property.id)}`;

        const detailsHtml = `
            ${property.area ? `<div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${property.area} م²</span></div>` : ''}
            ${property.bedrooms ? `<div class="property-detail"><span class="detail-icon">🛏️</span><span class="detail-label">غرف نوم:</span><span class="detail-value">${property.bedrooms}</span></div>` : ''}
            ${property.bathrooms ? `<div class="property-detail"><span class="detail-icon">🛁</span><span class="detail-label">حمامات:</span><span class="detail-value">${property.bathrooms}</span></div>` : ''}
            ${property.level ? `<div class="property-detail"><span class="detail-icon">🏢</span><span class="detail-label">الطابق:</span><span class="detail-value">${this.escapeHtml(property.level)}</span></div>` : ''}
            ${property.finishing ? `<div class="property-detail"><span class="detail-icon">✨</span><span class="detail-label">التشطيب:</span><span class="detail-value">${this.escapeHtml(property.finishing)}</span></div>` : ''}
        `;

        card.innerHTML = `
            <div class="property-header">
                <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo" loading="lazy">
                <div class="property-title-container">
                    <h3 class="property-title">${this.escapeHtml(property.title)}</h3>
                    <span class="property-type-badge">${this.escapeHtml(property.type)} - ${this.escapeHtml(property.listingType)}</span>
                </div>
            </div>
            ${property.description ? `<p class="property-description">${this.escapeHtml(property.description.substring(0, 120))}...</p>` : ''}
            <div class="property-details">
                ${detailsHtml}
            </div>
            <a href="${detailPageUrl}" class="view-details-btn">عرض التفاصيل</a>
        `;
        return card;
    }

    showEmptyState(categoryKey) {
        const categoryInfo = this.categories[categoryKey];
        this.container.innerHTML = `<div class="no-properties">لا توجد عروض حالياً في فئة "${categoryInfo.label}"</div>`;
    }

    showErrorMessage(message) {
        this.container.innerHTML = `<div class="error-message">⚠️ ${message}</div>`;
    }

    escapeHtml(text) {
        if (text === null || typeof text === 'undefined') return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// تشغيل النظام عند تحميل الصفحة
new EnhancedPropertyDisplay();

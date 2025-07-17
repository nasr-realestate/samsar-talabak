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
        this.lastRequestTime = 0; // لحل مشكلة التحديث المستمر

        this.config = {
            animationDuration: 300,
            cacheExpiry: 30 * 60 * 1000, // 30 دقيقة بدلاً من 5
            loadingDelay: 300,
            minRequestInterval: 1000, // الحد الأدنى بين الطلبات (1 ثانية)
            maxRetries: 2,
            retryDelay: 1500,
            baseDataPath: `${site_baseurl}/data/`
        };

        this.categories = {
            "apartments": { label: "🏠 شقق للبيع", icon: "🏠", color: "#00ff88" },
            "apartments-rent": { label: "🏡 شقق للإيجار", icon: "🏡", color: "#00ccff" },
            "shops": { label: "🏪 محلات تجارية", icon: "🏪", color: "#ff6b35" },
            "offices": { label: "🏢 مكاتب إدارية", icon: "🏢", color: "#8b5cf6" },
            "admin-hq": { label: "🏛️ مقرات إدارية", icon: "🏛️", color: "#f59e0b" }
        };

        // إضافة نظام التخزين المحلي للبيانات
        this.initCacheSystem();
        this.init();
    }

    initCacheSystem() {
        // تنظيف البيانات القديمة عند التحميل
        const now = Date.now();
        for (const [key, { timestamp }] of this.propertiesCache) {
            if (now - timestamp > this.config.cacheExpiry) {
                this.propertiesCache.delete(key);
            }
        }
    }

    async init() {
        await this.waitForDOM();
        this.setupElements();
        this.createFilterButtons();
        this.loadDefaultCategory();
    }

    async waitForDOM() {
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
                window.addEventListener('load', resolve);
            });
        }
    }

    setupElements() {
        this.container = document.getElementById("properties-container");
        this.filterContainer = document.getElementById("filter-buttons");
        
        if (!this.container || !this.filterContainer) {
            console.error('العناصر الأساسية غير موجودة.');
            return;
        }

        // منع التحديث التلقائي عند التمرير
        this.container.addEventListener('scroll', (e) => {
            e.stopPropagation();
        }, { passive: true });
    }
    
    createFilterButtons() {
        this.filterContainer.innerHTML = '';
        Object.entries(this.categories).forEach(([key, category]) => {
            const button = document.createElement("button");
            button.innerHTML = `${category.icon} ${category.label}`;
            button.dataset.category = key;
            button.className = "filter-btn";
            button.title = `عرض ${category.label}`;
            
            // إضافة تأثيرات عند النقر
            button.addEventListener('mousedown', (e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('mouseup', (e) => {
                e.currentTarget.style.transform = '';
            });
            
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = '';
            });
            
            button.addEventListener("click", (e) => {
                e.preventDefault();
                this.handleCategoryChange(key, button);
            });
            
            this.filterContainer.appendChild(button);
        });
    }

    async handleCategoryChange(categoryKey, button) {
        const now = Date.now();
        
        // التحقق من عدم وجود تحميل مسبق أو طلب حديث جداً
        if (this.isLoading || 
            this.currentCategory === categoryKey || 
            (now - this.lastRequestTime < this.config.minRequestInterval)) {
            return;
        }

        this.isLoading = true;
        this.currentCategory = categoryKey;
        this.lastRequestTime = now;
        
        this.updateActiveButton(button);
        this.showLoadingState();

        try {
            await this.delay(this.config.loadingDelay);
            const data = await this.loadCategoryData(categoryKey);
            this.displayProperties(data, categoryKey);
        } catch (error) {
            console.error(`خطأ في تحميل التصنيف ${categoryKey}:`, error);
            this.showErrorMessage(`حدث خطأ أثناء تحميل "${this.categories[categoryKey].label}"`);
        } finally {
            this.isLoading = false;
        }
    }
    
    updateActiveButton(activeButton) {
        if (!activeButton) return;
        
        this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.transform = '';
        });
        
        activeButton.classList.add('active');
        activeButton.style.boxShadow = `0 0 15px ${this.categories[this.currentCategory]?.color || '#00ff88'}`;
    }

    loadDefaultCategory() {
        const defaultCategoryKey = Object.keys(this.categories)[0];
        const defaultButton = this.filterContainer.querySelector(`[data-category="${defaultCategoryKey}"]`);
        if (defaultButton) {
            setTimeout(() => {
                defaultButton.click();
            }, 100);
        }
    }

    async loadCategoryData(categoryKey) {
        // التحقق من وجود بيانات حديثة في الذاكرة المؤقتة
        const cached = this.propertiesCache.get(categoryKey);
        if (cached && (Date.now() - cached.timestamp < this.config.cacheExpiry)) {
            return cached.data;
        }

        // جلب البيانات من الخادم مع إدارة الأخطاء
        try {
            const data = await this.fetchWithRetry(categoryKey);
            this.propertiesCache.set(categoryKey, { 
                data, 
                timestamp: Date.now() 
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    async fetchWithRetry(categoryKey, retryCount = 0) {
        try {
            return await this.fetchCategoryData(categoryKey);
        } catch (error) {
            if (retryCount < this.config.maxRetries) {
                await this.delay(this.config.retryDelay);
                return this.fetchWithRetry(categoryKey, retryCount + 1);
            }
            throw error;
        }
    }

    async fetchCategoryData(categoryKey) {
        const indexUrl = `${this.config.baseDataPath}${categoryKey}/index.json`;
        const indexResponse = await fetch(indexUrl, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
        });

        if (!indexResponse.ok) {
            throw new Error(`HTTP error! status: ${indexResponse.status}`);
        }

        const filenames = await indexResponse.json();

        if (!Array.isArray(filenames) || filenames.length === 0) {
            return [];
        }

        const propertyPromises = filenames.map(filename => {
            const fileUrl = `${this.config.baseDataPath}${categoryKey}/${filename}`;
            return fetch(fileUrl, { cache: 'no-store' })
                .then(res => res.ok ? res.json() : null)
                .catch(() => null);
        });

        const properties = await Promise.all(propertyPromises);
        return properties.filter(p => p !== null);
    }

    showLoadingState() {
        this.container.innerHTML = `
            <div style="text-align: center; grid-column: 1 / -1; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p style="color: #00ff88; font-size: 1.2rem; margin-top: 1rem;">
                    جاري تحميل عروض ${this.categories[this.currentCategory]?.label || 'العقارات'}...
                </p>
            </div>`;
    }

    displayProperties(properties, categoryKey) {
        if (!properties || properties.length === 0) {
            this.showEmptyState(categoryKey);
            return;
        }

        this.container.innerHTML = '';
        
        properties.slice(0, 20).forEach((property, index) => {
            const card = this.createPropertyCard(property);
            card.style.opacity = 0;
            this.container.appendChild(card);
            
            // تحميل متدرج للبطاقات
            setTimeout(() => {
                card.style.animation = `slideInUp 0.5s ease-out forwards`;
                card.style.opacity = 1;
            }, 100 * index);
        });
    }

    createPropertyCard(property) {
        const card = document.createElement("article");
        card.className = "property-card";
        
        // منع إعادة التحميل عند النقر
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;
            e.preventDefault();
            e.stopPropagation();
        }, true);

        const detailPageUrl = `${site_baseurl}/details.html?id=${encodeURIComponent(property.slug || property.id)}`;
        const categoryColor = this.categories[this.currentCategory]?.color || '#00ff88';

        card.innerHTML = `
            <div class="property-header">
                <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" 
                     alt="شعار سمسار طلبك" 
                     class="property-logo" 
                     loading="lazy"
                     onerror="this.src='${site_baseurl}/assets/img/default-logo.png'">
                <div>
                    <h3 class="property-title">${this.escapeHtml(property.title)}</h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="background: ${categoryColor}20; 
                                    color: ${categoryColor}; 
                                    padding: 3px 10px; 
                                    border-radius: 15px; 
                                    font-size: 0.8rem;">
                            ${this.escapeHtml(property.type || 'عقار')}
                        </span>
                        <span style="color: #aaa; font-size: 0.9rem;">
                            ${this.escapeHtml(property.listingType || '')}
                        </span>
                    </div>
                </div>
            </div>
            ${property.description ? `
                <p class="property-description">
                    ${this.escapeHtml(property.description.substring(0, 120))}...
                </p>` : ''}
            <div class="property-details">
                ${property.area ? `
                    <div class="property-detail">
                        <span class="detail-icon">📏</span>
                        <span class="detail-label">المساحة:</span>
                        <span class="detail-value">${property.area} م²</span>
                    </div>` : ''}
                ${property.price ? `
                    <div class="property-detail">
                        <span class="detail-icon">💰</span>
                        <span class="detail-label">السعر:</span>
                        <span class="detail-value">${this.formatPrice(property.price)}</span>
                    </div>` : ''}
                ${property.bedrooms ? `
                    <div class="property-detail">
                        <span class="detail-icon">🛏️</span>
                        <span class="detail-label">غرف نوم:</span>
                        <span class="detail-value">${property.bedrooms}</span>
                    </div>` : ''}
                ${property.bathrooms ? `
                    <div class="property-detail">
                        <span class="detail-icon">🛁</span>
                        <span class="detail-label">حمامات:</span>
                        <span class="detail-value">${property.bathrooms}</span>
                    </div>` : ''}
            </div>
            <a href="${detailPageUrl}" 
               class="view-details-btn"
               style="background: linear-gradient(45deg, ${categoryColor}, ${this.adjustColor(categoryColor, -20)});">
                عرض التفاصيل
            </a>
        `;
        
        return card;
    }

    showEmptyState(categoryKey) {
        const categoryInfo = this.categories[categoryKey];
        this.container.innerHTML = `
            <div class="no-properties">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🏡</div>
                <h3 style="color: #00ff88; margin-bottom: 0.5rem;">لا توجد عروض حالياً</h3>
                <p style="color: #aaa;">سيتم إضافة عروض جديدة في فئة "${categoryInfo.label}" قريباً</p>
            </div>`;
    }

    showErrorMessage(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="margin-bottom: 0.5rem;">حدث خطأ</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" 
                        style="margin-top: 1rem; 
                               padding: 0.5rem 1rem;
                               background: #ff6b6b;
                               color: white;
                               border: none;
                               border-radius: 5px;
                               cursor: pointer;">
                    إعادة المحاولة
                </button>
            </div>`;
    }

    // ===== دوال مساعدة =====
    escapeHtml(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatPrice(price) {
        if (!price) return 'غير محدد';
        return new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: 'EGP'
        }).format(price).replace('EGP', 'ج.م');
    }

    adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, 
            color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// بدء التشغيل بعد تحميل الصفحة بالكامل
window.addEventListener('load', () => {
    new EnhancedPropertyDisplay();
});

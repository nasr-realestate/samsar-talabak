document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("properties-container");
    const filterContainer = document.getElementById("filter-buttons");

    // تصنيفات العقارات
    const categories = {
        "apartments": {
            label: "🏠 شقق للبيع",
            color: "#00ff88"
        },
        "apartments-rent": {
            label: "🏡 شقق للإيجار",
            color: "#00ccff"
        },
        "shops": {
            label: "🏪 محلات تجارية",
            color: "#ff6b35"
        },
        "offices": {
            label: "🏢 مكاتب إدارية",
            color: "#8b5cf6"
        },
        "admin-hq": {
            label: "🏛️ مقرات إدارية",
            color: "#f59e0b"
        }
    };

    // إنشاء أزرار التصنيفات
    Object.entries(categories).forEach(([key, category]) => {
        const btn = document.createElement("button");
        btn.textContent = category.label;
        btn.dataset.category = key;
        btn.className = "filter-btn";
        btn.style.borderColor = category.color;
        btn.addEventListener("click", () => loadCategory(key));
        filterContainer.appendChild(btn);
    });

    // تحميل التصنيف الافتراضي
    const defaultCategory = Object.keys(categories)[0];
    loadCategory(defaultCategory);

    // دالة تحميل التصنيف
    async function loadCategory(category) {
        // إظهار حالة التحميل
        container.innerHTML = `
            <div style="text-align: center; grid-column: 1 / -1;">
                <div class="loading-spinner"></div>
                <p>جاري تحميل عروض ${categories[category].label}...</p>
            </div>
        `;

        // تحديث الزر النشط
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });
        document.querySelector(`[data-category="${category}"]`).classList.add("active");

        try {
            // جلب البيانات (استبدل هذا بالاتصال الفعلي بالخادم)
            const properties = await fetchProperties(category);
            
            // عرض العقارات
            displayProperties(properties, category);
        } catch (error) {
            console.error("حدث خطأ:", error);
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; color: #ff6b6b;">
                    <p>حدث خطأ أثناء تحميل البيانات</p>
                    <button onclick="location.reload()" style="
                        background: var(--color-primary);
                        color: #000;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 5px;
                        margin-top: 1rem;
                        cursor: pointer;
                    ">
                        إعادة المحاولة
                    </button>
                </div>
            `;
        }
    }

    // دالة جلب البيانات (ستحتاج لتعديلها للاتصال بالخادم)
    async function fetchProperties(category) {
        // هذه بيانات تجريبية - استبدلها بالاتصال الفعلي بالخادم
        return [
            {
                title: "شقة فاخرة للبيع في مدينة نصر",
                price: "1,200,000 جنيه",
                area: "150 متر",
                location: "مدينة نصر، الحي السابع",
                description: "شقة رائعة في موقع مميز، تشطيب سوبر لوكس، 3 غرف وصالة كبيرة، مطبخ أمريكي، 2 حمام، تكييف مركزي."
            },
            {
                title: "محل تجاري مميز للإيجار",
                price: "15,000 جنيه/شهري",
                area: "80 متر",
                location: "مدينة نصر، ميدان الحجاز",
                description: "محل تجاري بموقع استراتيجي على الطريق الرئيسي، مناسب لجميع الأنشطة التجارية."
            },
            {
                title: "مكتب إداري راقي للإيجار",
                price: "25,000 جنيه/شهري",
                area: "120 متر",
                location: "مدينة نصر، شارع مصطفى النحاس",
                description: "مكتب فاخر في مبنى إداري جديد، تشطيب سوبر لوكس، غرفة إدارة، غرفة اجتماعات."
            }
        ];
    }

    // دالة عرض العقارات
    function displayProperties(properties, category) {
        if (!properties || properties.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1;">
                    <p>لا توجد عروض متاحة حالياً في هذا القسم</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        properties.forEach(property => {
            const card = document.createElement("div");
            card.className = "property-card";
            card.style.borderColor = categories[category].color;
            
            card.innerHTML = `
                <div class="property-header">
                    <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" 
                         alt="شعار سمسار طلبك" 
                         class="property-logo"
                         loading="lazy">
                    <div>
                        <strong>سمسار طلبك</strong>
                        <p style="margin: 0.2rem 0 0; color: ${categories[category].color}">
                            ${categories[category].label}
                        </p>
                    </div>
                </div>
                
                <h2 class="property-title">${escapeHtml(property.title)}</h2>
                
                <div class="property-details">
                    <div class="property-detail">
                        <span class="detail-icon">💰</span>
                        <span>${escapeHtml(property.price)}</span>
                    </div>
                    <div class="property-detail">
                        <span class="detail-icon">📏</span>
                        <span>${escapeHtml(property.area)}</span>
                    </div>
                    <div class="property-detail">
                        <span class="detail-icon">📍</span>
                        <span>${escapeHtml(property.location)}</span>
                    </div>
                </div>
                
                <p style="margin: 1rem 0;">${escapeHtml(property.description)}</p>
                
                <a href="/property-details.html?category=${category}&id=${generateId()}" 
                   class="view-details-btn">
                   عرض التفاصيل
                </a>
            `;
            
            container.appendChild(card);
        });
    }

    // دالة مساعدة للهروب من HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // دالة إنشاء معرف فريد (ستحتاج لتعديلها حسب نظامك)
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
});

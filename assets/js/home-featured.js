/**
 * 🏠 سمسار طلبك - الرادار الشامل (Global Scanner)
 * v6.0 - يبحث في كل الأقسام (شقق، مكاتب، محلات) ويعرض الأحدث مطلقاً.
 */

class HomeFeaturedDisplay {
    constructor() {
        this.container = document.getElementById("featured-container");
        
        // 1. تعريف كل الأقسام التي نريد البحث فيها
        this.sources = [
            // { section: 'المجلد الرئيسي', category: 'اسم المجلد الفرعي', type: 'نوع افتراضي' }
            { section: 'properties', category: 'apartments', defaultType: 'sale' },
            { section: 'properties', category: 'apartments-rent', defaultType: 'rent' },
            { section: 'properties', category: 'offices', defaultType: 'sale' }, // المكاتب قد تكون بيع أو إيجار (سنفحص العنوان)
            { section: 'properties', category: 'shops', defaultType: 'sale' },
            { section: 'properties', category: 'admin-hq', defaultType: 'sale' },
            
            // الطلبات
            { section: 'requests', category: 'apartments', defaultType: 'request' },
            { section: 'requests', category: 'offices', defaultType: 'request' },
            { section: 'requests', category: 'shops', defaultType: 'request' }
        ];

        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 2. إطلاق عملية البحث في كل المجلدات بالتوازي
            const promises = this.sources.map(source => this.fetchLatestFromSource(source));
            
            // انتظار النتائج من جميع المجلدات
            const results = await Promise.all(promises);
            
            // دمج كل النتائج في قائمة واحدة
            // (flat() تحول مصفوفة المصفوفات إلى قائمة واحدة مسطحة)
            let allItems = results.flat();

            // 3. الترتيب الزمني (الأحدث أولاً)
            // نستخدم new Date للتأكد من دقة الترتيب
            allItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 4. اختيار أحدث 3 عناصر فقط للعرض
            const topFeatured = allItems.slice(0, 3);

            this.renderItems(topFeatured);

        } catch (error) {
            console.error("Home Scanner Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:#555; grid-column:1/-1;">جاري تحديث نبض السوق...</p>`;
        }
    }

    // دالة تجلب أحدث ملف واحد فقط من كل مجلد لتقليل الحمل
    async fetchLatestFromSource(source) {
        try {
            // إضافة t= لمنع الكاش وضمان رؤية الملفات الجديدة فوراً
            const response = await fetch(`/data/${source.section}/${source.category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            if (files.length === 0) return [];

            // نأخذ آخر ملف في القائمة (لأنه الأحدث بناءً على سكربت البناء)
            const latestFilename = files[files.length - 1];

            // جلب تفاصيل هذا الملف
            const fileRes = await fetch(`/data/${source.section}/${source.category}/${latestFilename}?t=${Date.now()}`);
            const data = await fileRes.json();

            // تحديد النوع بدقة (بيع / إيجار / طلب)
            let finalType = source.defaultType;
            
            // ذكاء إضافي: إذا كان العنوان يحتوي على "إيجار"، نغير النوع لـ rent
            if (source.section === 'properties' && (data.title && data.title.includes('إيجار'))) {
                finalType = 'rent';
            }
            // إذا كان طلب، فهو طلب دائماً
            if (source.section === 'requests') {
                finalType = 'request';
            }

            return [{
                ...data,
                filename: latestFilename,
                category: source.category, // نحتفظ باسم المجلد للروابط
                section: source.section,   // نحتفظ بالقسم (properties/requests)
                type: finalType
            }];

        } catch (e) {
            return [];
        }
    }

    renderItems(items) {
        if (items.length === 0) {
            this.container.innerHTML = `<p style="text-align:center; grid-column:1/-1;">لا توجد إضافات حديثة.</p>`;
            return;
        }

        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            let card;
            
            if (item.type === 'request') {
                card = this.createRequestCard(item);
            } else if (item.type === 'rent') {
                card = this.createRentCard(item);
            } else {
                card = this.createSaleCard(item);
            }
            
            // تأثير ظهور متتابع
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.2}s`;
            this.container.appendChild(card);
        });
    }

    // --- قوالب البطاقات (نفس التصميم الفاخر السابق) ---

    // 1. بطاقة البيع (ذهبي)
    createSaleCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #d4af37"; 
        
        const cleanId = property.filename.replace('.json', '');
        const targetUrl = `/details.html?id=${cleanId}&category=${property.category}`;
        card.onclick = () => window.location.href = targetUrl;

        const timeAgo = this.getTimeAgo(property.date);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: #d4af37; background: rgba(212, 175, 55, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid #d4af37;">
                        <i class="fas fa-certificate"></i> عرض بيع
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0; line-height:1.4;">${property.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#d4af37"></i> ${property.location || 'مدينة نصر'}</p>
            </div>
            <div class="property-details" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                 <div style="grid-column:1/-1; color: #d4af37; font-weight:bold; font-size:1.1rem; background: linear-gradient(90deg, rgba(212,175,55,0.1), transparent); padding:5px; border-radius:5px;">
                    ${property.price_display || property.price}
                 </div>
                 ${property.area ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-ruler-combined" style="color:#d4af37"></i> ${property.area}</div>` : ''}
                 ${property.rooms ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-bed" style="color:#d4af37"></i> ${property.rooms} غرف</div>` : ''}
            </div>
            <div style="margin-top:auto; border-top:1px solid #222; padding-top:10px;">
                <a href="${targetUrl}" style="color:#aaa; font-size:0.9rem; text-decoration:none;">التفاصيل <i class="fas fa-angle-left" style="color:#d4af37"></i></a>
            </div>
        `;
        return card;
    }

    // 2. بطاقة الإيجار (ليموني/أصفر)
    createRentCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #fce205"; 
        
        const cleanId = property.filename.replace('.json', '');
        const targetUrl = `/details.html?id=${cleanId}&category=${property.category}`;
        card.onclick = () => window.location.href = targetUrl;

        const timeAgo = this.getTimeAgo(property.date);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: #fce205; background: rgba(252, 226, 5, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid #fce205;">
                        <i class="fas fa-key"></i> للإيجار
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0; line-height:1.4;">${property.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#fce205"></i> ${property.location || 'مدينة نصر'}</p>
            </div>
            <div class="property-details" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                 <div style="grid-column:1/-1; color: #fce205; font-weight:bold; font-size:1.1rem; background: linear-gradient(90deg, rgba(252,226,5,0.1), transparent); padding:5px; border-radius:5px;">
                    ${property.price_display || property.price}
                 </div>
                 ${property.area ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-ruler-combined" style="color:#fce205"></i> ${property.area}</div>` : ''}
                 ${property.rooms ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-bed" style="color:#fce205"></i> ${property.rooms} غرف</div>` : ''}
            </div>
            <div style="margin-top:auto; border-top:1px solid #222; padding-top:10px;">
                <a href="${targetUrl}" style="color:#aaa; font-size:0.9rem; text-decoration:none;">التفاصيل <i class="fas fa-angle-left" style="color:#fce205"></i></a>
            </div>
        `;
        return card;
    }

    // 3. بطاقة الطلب (أزرق)
    createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #0a84ff"; 
        card.style.background = "linear-gradient(145deg, #111, #161616)";
        
        const cleanId = request.filename.replace('.json', '');
        const targetUrl = `/request-details.html?id=${cleanId}&category=${request.category}`;
        
        card.onclick = () => window.location.href = targetUrl;

        const timeAgo = this.getTimeAgo(request.date);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: #0a84ff; background: rgba(10, 132, 255, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid #0a84ff;">
                        <i class="fas fa-bullhorn"></i> مطلوب
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0; line-height:1.4;">${request.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#0a84ff"></i> ${request.location || 'مدينة نصر'}</p>
            </div>
            <div class="property-details" style="margin-bottom:15px;">
                 <div style="color: #fff; font-weight:bold; font-size:1rem; margin-bottom:8px;">
                    الميزانية: <span style="color: #0a84ff;">${request.budget}</span>
                 </div>
                 <p style="font-size:0.85rem; color:#777; line-height:1.4;">
                    ${request.description ? request.description.substring(0, 50) + '...' : ''}
                 </p>
            </div>
            <div style="margin-top:auto; text-align:left;">
                <a href="${targetUrl}" style="font-size:0.8rem; color:#0a84ff; text-decoration:none;">لديك هذا العقار؟ <i class="fas fa-check-circle"></i></a>
            </div>
        `;
        return card;
    }

    getTimeAgo(dateString) {
        if (!dateString) return '';
        const diff = new Date() - new Date(dateString);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'جديد اليوم';
        if (days === 1) return 'أمس';
        if (days < 30) return `منذ ${days} أيام`;
        return `منذ شهر`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HomeFeaturedDisplay();
});

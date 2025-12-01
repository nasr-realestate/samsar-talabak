/**
 * 🏠 سمسار طلبك - الصفحة الرئيسية (الرادار الشامل الحقيقي - v7.0)
 * إصلاح: البحث في كل المجلدات (مكاتب، محلات، شقق) للعثور على الأحدث
 */

class HomeGlobalScanner {
    constructor() {
        this.container = document.getElementById("featured-container");
        
        // 1. تعريف كل المصادر بدقة (عروض وطلبات)
        // يجب ذكر كل مجلد موجود في data لضمان شمول البحث
        this.sources = [
            // --- العروض ---
            { section: 'properties', category: 'apartments', type: 'offer' },
            { section: 'properties', category: 'apartments-rent', type: 'offer' },
            { section: 'properties', category: 'offices', type: 'offer' },
            { section: 'properties', category: 'shops', type: 'offer' },
            { section: 'properties', category: 'admin-hq', type: 'offer' },
            
            // --- الطلبات (هنا كان النقص، والآن أضفنا الكل) ---
            { section: 'requests', category: 'apartments', type: 'request' },
            { section: 'requests', category: 'offices', type: 'request' }, // 👈 هذا سيجلب طلب شركة الشحن
            { section: 'requests', category: 'shops', type: 'request' },
            { section: 'requests', category: 'admin-hq', type: 'request' }
        ];

        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 2. البحث في كل المصادر بالتوازي
            const promises = this.sources.map(source => this.fetchLatestFromSource(source));
            const results = await Promise.all(promises);
            
            // تجميع كل النتائج في قائمة واحدة كبيرة
            let allItems = results.flat().filter(item => item !== null);

            // 3. فصل العروض عن الطلبات للمعالجة
            let allOffers = allItems.filter(item => item.type === 'offer');
            let allRequests = allItems.filter(item => item.type === 'request');

            // 4. ترتيب كل قائمة زمنياً (الأحدث أولاً)
            allOffers.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            allRequests.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 5. الاختيار (أحدث 2 عرض + أحدث 1 طلب)
            const topOffers = allOffers.slice(0, 2);
            const topRequest = allRequests.slice(0, 1); // سيأخذ أحدث طلب مهما كان نوعه (مكتب أو شقة)

            // دمجهم للعرض
            let finalDisplayList = [...topOffers, ...topRequest];

            // ترتيب نهائي حسب التاريخ للظهور في الصفحة
            finalDisplayList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 6. العرض
            this.renderItems(finalDisplayList);

        } catch (error) {
            console.error("Scanner Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:#555; grid-column:1/-1;">جاري تحديث البيانات...</p>`;
        }
    }

    // دالة الجلب
    async fetchLatestFromSource(source) {
        try {
            // t=timestamp لمنع الكاش
            const response = await fetch(`/data/${source.section}/${source.category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            if (!files || files.length === 0) return [];

            // نأخذ آخر ملف في القائمة (لأنه الأحدث)
            const latestFilename = files[files.length - 1];

            const fileRes = await fetch(`/data/${source.section}/${source.category}/${latestFilename}?t=${Date.now()}`);
            const data = await fileRes.json();

            // تحديد النوع الفرعي (بيع / إيجار) للعروض
            let displayType = source.type; // offer or request
            
            // إذا كان عرض، نتحقق هل هو إيجار أم بيع من العنوان
            if (source.type === 'offer' && data.title && data.title.includes('إيجار')) {
                displayType = 'rent';
            }

            return [{
                ...data,
                filename: latestFilename,
                category: source.category,
                section: source.section,
                displayType: displayType // نستخدم هذا لتحديد لون البطاقة
            }];

        } catch (e) {
            return []; // تجاهل المجلدات الفارغة أو غير الموجودة
        }
    }

    renderItems(items) {
        if (items.length === 0) {
            this.container.innerHTML = `<div style="text-align:center; color:#555; padding:2rem;">لا توجد إضافات حديثة.</div>`;
            return;
        }

        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            let card;
            
            // التوجيه لنوع البطاقة المناسب
            if (item.section === 'requests') {
                card = this.createRequestCard(item);
            } else if (item.displayType === 'rent') {
                card = this.createRentCard(item);
            } else {
                card = this.createSaleCard(item);
            }
            
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.2}s`;
            
            this.container.appendChild(card);
        });
    }

    // --- قوالب البطاقات (نفس التصميم) ---

    // 1. بطاقة البيع (ذهبي)
    createSaleCard(property) {
        return this.generateCardHTML(property, '#d4af37', 'fa-certificate', 'بيع', '/details.html');
    }

    // 2. بطاقة الإيجار (أصفر)
    createRentCard(property) {
        return this.generateCardHTML(property, '#fce205', 'fa-key', 'إيجار', '/details.html');
    }

    // 3. بطاقة الطلب (أزرق)
    createRequestCard(request) {
        const card = this.generateCardHTML(request, '#0a84ff', 'fa-bullhorn', 'مطلوب', '/request-details.html');
        // تعديل خلفية الطلب لتكون مميزة
        card.style.background = 'linear-gradient(145deg, #111, #161616)';
        return card;
    }

    // دالة مساعدة لتقليل تكرار كود HTML
    generateCardHTML(item, color, icon, label, pageUrl) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = `4px solid ${color}`;
        
        const cleanId = item.filename.replace('.json', '');
        const targetUrl = `${pageUrl}?id=${cleanId}&category=${item.category}`;
        
        card.onclick = () => window.location.href = targetUrl;
        const timeAgo = this.getTimeAgo(item.date);

        // محتوى البطاقة (موحد للكل)
        // للطلبات نعرض الميزانية، للعروض نعرض السعر
        const priceOrBudget = item.budget ? `ميزانية: ${item.budget}` : (item.price_display || item.price);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: ${color}; background: rgba(255, 255, 255, 0.05); padding: 2px 10px; border-radius: 10px; border: 1px solid ${color};">
                        <i class="fas ${icon}"></i> ${label}
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0; line-height:1.4;">${item.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:${color}"></i> ${item.location || 'مدينة نصر'}</p>
            </div>

            <div class="property-details" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                 <div style="grid-column:1/-1; color: ${color}; font-weight:bold; font-size:1.1rem; background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent); padding:5px; border-radius:5px;">
                    ${priceOrBudget}
                 </div>
                 ${item.area ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-ruler-combined" style="color:${color}"></i> ${item.area}</div>` : ''}
                 ${item.rooms ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-bed" style="color:${color}"></i> ${item.rooms} غرف</div>` : ''}
            </div>

            <div style="margin-top:auto; border-top:1px solid #222; padding-top:10px;">
                <span style="color:#aaa; font-size:0.9rem;">
                    ${label === 'مطلوب' ? 'لديك العقار؟' : 'التفاصيل'} 
                    <i class="fas ${label === 'مطلوب' ? 'fa-check-circle' : 'fa-arrow-left'}" style="color:${color}"></i>
                </span>
            </div>
        `;
        return card;
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

document.addEventListener('DOMContentLoaded', () => {
    new HomeGlobalScanner();
});

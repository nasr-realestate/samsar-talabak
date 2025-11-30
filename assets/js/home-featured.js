/**
 * 🏠 سمسار طلبك - الصفحة الرئيسية (الماسح الشامل)
 * الوظيفة: جلب أحدث 2 عرض + أحدث 1 طلب (من جميع الأقسام بلا استثناء)
 */

class HomeGlobalScanner {
    constructor() {
        this.container = document.getElementById("featured-container");
        
        // 1. تعريف كل المصادر المحتملة في موقعك
        this.offerSources = [
            'apartments', 'apartments-rent', 'shops', 'offices', 'admin-hq'
        ];
        
        this.requestSources = [
            'apartments', 'shops', 'offices', 'admin-hq'
        ];

        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 2. إطلاق عمليات البحث بالتوازي (للسرعة القصوى)
            // نجمع أحدث الملفات من كل مجلدات العروض
            const offerPromises = this.offerSources.map(cat => this.fetchLatestFromFolder('properties', cat));
            // نجمع أحدث الملفات من كل مجلدات الطلبات
            const requestPromises = this.requestSources.map(cat => this.fetchLatestFromFolder('requests', cat));

            const allOffersArrays = await Promise.all(offerPromises);
            const allRequestsArrays = await Promise.all(requestPromises);

            // 3. تجميع النتائج في قوائم مسطحة (Flat Lists)
            // (نحول مصفوفة المصفوفات إلى قائمة واحدة طويلة)
            let allOffers = allOffersArrays.flat().filter(item => item !== null);
            let allRequests = allRequestsArrays.flat().filter(item => item !== null);

            // 4. الترتيب الزمني (الأحدث أولاً)
            allOffers.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            allRequests.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 5. الاختيار النهائي (الخلطة السحرية)
            // نأخذ أحدث 2 عرض + أحدث 1 طلب
            const topOffers = allOffers.slice(0, 2).map(i => ({...i, type: 'offer'}));
            const topRequest = allRequests.slice(0, 1).map(i => ({...i, type: 'request'}));

            // دمجهم في قائمة العرض
            let finalDisplayList = [...topOffers, ...topRequest];

            // ترتيبهم مرة أخيرة لكي يظهروا حسب تاريخ إضافتهم للموقع
            finalDisplayList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 6. العرض
            this.renderItems(finalDisplayList);

        } catch (error) {
            console.error("Scanner Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:#555;">جاري تحميل نبض السوق...</p>`;
        }
    }

    // دالة تجلب آخر 2 ملف من أي مجلد (لضمان التقاط الأحدث)
    async fetchLatestFromFolder(section, category) {
        try {
            // t=timestamp لمنع الكاش
            const response = await fetch(`/data/${section}/${category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            if (!files || files.length === 0) return [];

            // نأخذ آخر ملفين في القائمة (لأن السكربت يضع الجديد في الآخر)
            const latestFiles = files.slice(-2);

            const itemPromises = latestFiles.map(filename => 
                fetch(`/data/${section}/${category}/${filename}?t=${Date.now()}`)
                    .then(res => res.json())
                    .then(data => ({ 
                        ...data, 
                        filename, 
                        category, // نحتفظ باسم القسم للروابط
                        section   // نحتفظ بنوع القسم (properties/requests)
                    }))
                    .catch(() => null)
            );

            return await Promise.all(itemPromises);
        } catch (e) {
            return []; // تجاهل المجلدات الفارغة بصمت
        }
    }

    renderItems(items) {
        if (items.length === 0) {
            this.container.innerHTML = `<div style="text-align:center; color:#555; padding:2rem;">لا توجد إضافات حديثة اليوم.</div>`;
            return;
        }

        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            const card = item.type === 'request' 
                ? this.createRequestCard(item) 
                : this.createOfferCard(item);
            
            // أنيميشن ظهور أنيق
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.2}s`;
            
            this.container.appendChild(card);
        });
    }

    // 🏷️ تصميم بطاقة "عرض عقار" (ذهبي - نصي)
    createOfferCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        
        // لون الحد العلوي (ذهبي للتمليك - أصفر للإيجار)
        let accentColor = '#d4af37';
        let typeLabel = 'بيع';
        let icon = 'fa-certificate';

        if (property.title && property.title.includes('إيجار')) {
            accentColor = '#fce205'; // أصفر ليموني للإيجار
            typeLabel = 'إيجار';
            icon = 'fa-key';
        }

        card.style.borderTop = `4px solid ${accentColor}`;
        
        const cleanId = property.filename.replace('.json', '');
        const targetUrl = `/details.html?id=${cleanId}&category=${property.category}`;
        
        card.onclick = () => window.location.href = targetUrl;

        const timeAgo = this.getTimeAgo(property.date);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: ${accentColor}; background: rgba(255, 255, 255, 0.05); padding: 2px 10px; border-radius: 10px; border: 1px solid ${accentColor};">
                        <i class="fas ${icon}"></i> ${typeLabel}
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0; line-height:1.4;">${property.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:${accentColor}"></i> ${property.location || 'مدينة نصر'}</p>
            </div>

            <div class="property-details" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                 <div style="grid-column:1/-1; color: ${accentColor}; font-weight:bold; font-size:1.1rem; background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent); padding:5px; border-radius:5px;">
                    ${property.price_display || property.price}
                 </div>
                 ${property.area ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-ruler-combined" style="color:${accentColor}"></i> ${property.area}</div>` : ''}
                 ${property.rooms ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-bed" style="color:${accentColor}"></i> ${property.rooms} غرف</div>` : ''}
            </div>

            <div style="margin-top:auto; border-top:1px solid #222; padding-top:10px;">
                <span style="color:#aaa; font-size:0.9rem;">التفاصيل <i class="fas fa-angle-left" style="color:${accentColor}"></i></span>
            </div>
        `;
        return card;
    }

    // 📣 تصميم بطاقة "طلب عميل" (أزرق - نصي)
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
                    ${request.description ? request.description.substring(0, 60) + '...' : ''}
                 </p>
            </div>
            
            <div style="margin-top:auto; text-align:left;">
                <span style="font-size:0.8rem; color:#0a84ff;">لديك هذا العقار؟ <i class="fas fa-check-circle"></i></span>
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

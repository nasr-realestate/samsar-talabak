/**
 * 🏠 سمسار طلبك - الصفحة الرئيسية (المخلط الذكي - النسخة النهائية)
 * v4.0 - يجلب من آخر القائمة (الأحدث) + روابط صحيحة
 */

class HomeFeaturedDisplay {
    constructor() {
        this.container = document.getElementById("featured-container");
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 1. جلب البيانات بالتوازي (عقارات + طلبات)
            const [properties, requests] = await Promise.all([
                this.fetchLatestItems('properties', 'apartments'), // نجلب شقق للبيع
                this.fetchLatestItems('requests', 'apartments')    // نجلب طلبات شقق
            ]);

            // 2. تجهيز البيانات والدمج
            // نأخذ أول عنصرين من العقارات (بعد أن قمنا بقلب القائمة في دالة الجلب)
            const featuredProperties = properties.slice(0, 2).map(i => ({...i, type: 'offer'}));
            // نأخذ أول عنصر من الطلبات
            const featuredRequests = requests.slice(0, 1).map(i => ({...i, type: 'request'}));
            
            let mixedItems = [...featuredProperties, ...featuredRequests];

            // ترتيب نهائي دقيق حسب حقل التاريخ داخل الملف
            mixedItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 3. العرض
            this.renderItems(mixedItems);

        } catch (error) {
            console.error("Home Data Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:#555; grid-column:1/-1;">عذراً، لم نتمكن من تحميل أحدث العروض.</p>`;
        }
    }

    // دالة الجلب (تم تعديلها لتأخذ من آخر القائمة)
    async fetchLatestItems(section, category) {
        try {
            const response = await fetch(`/data/${section}/${category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            
            // 💎 التعديل الجوهري: نأخذ آخر 3 ملفات (الأحدث) ونعكسهم
            // لأن الإضافة الجديدة تكون في ذيل ملف index.json
            const latestFiles = files.slice(-3).reverse();

            const promises = latestFiles.map(filename => 
                fetch(`/data/${section}/${category}/${filename}`)
                    .then(res => res.json())
                    // نمرر القسم (category) لاستخدامه في الرابط لاحقاً
                    .then(data => ({ ...data, filename, category })) 
                    .catch(() => null)
            );

            const items = await Promise.all(promises);
            return items.filter(i => i !== null);
        } catch (e) {
            return [];
        }
    }

    renderItems(items) {
        if (items.length === 0) {
            this.container.innerHTML = `<p style="text-align:center; grid-column:1/-1;">لا توجد بيانات حديثة لعرضها.</p>`;
            return;
        }

        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            const card = item.type === 'offer' 
                ? this.createOfferCard(item) 
                : this.createRequestCard(item);
            
            // تأثير ظهور متتابع
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.2}s`;
            this.container.appendChild(card);
        });
    }

    // 🏷️ تصميم بطاقة "عرض عقار" (ذهبي)
    createOfferCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid var(--color-primary)"; 
        
        const cleanId = property.filename.replace('.json', '');
        // بناء الرابط الصحيح (تفاصيل العروض)
        const targetUrl = `/details.html?id=${cleanId}&category=${property.category}`;

        card.onclick = () => window.location.href = targetUrl;

        const timeAgo = this.getTimeAgo(property.date);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: var(--color-primary); background: rgba(212, 175, 55, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid var(--color-primary);">
                        <i class="fas fa-home"></i> متاح للبيع
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.2rem; margin:5px 0;">${property.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:var(--color-primary)"></i> ${property.location}</p>
            </div>

            <div class="property-details" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                 <div style="grid-column:1/-1; color: var(--color-primary); font-weight:bold; font-size:1.1rem; background: linear-gradient(90deg, rgba(212,175,55,0.1), transparent); padding:5px; border-radius:5px;">
                    ${property.price_display || property.price}
                 </div>
                 ${property.area ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-ruler-combined" style="color:var(--color-primary)"></i> ${property.area}</div>` : ''}
                 ${property.rooms ? `<div style="font-size:0.9rem; color:#ccc;"><i class="fas fa-bed" style="color:var(--color-primary)"></i> ${property.rooms} غرف</div>` : ''}
            </div>

            <div style="margin-top:auto; border-top:1px solid #222; padding-top:10px;">
                <a href="${targetUrl}" style="color:#aaa; font-size:0.9rem; text-decoration:none;">التفاصيل <i class="fas fa-angle-left" style="color:var(--color-primary)"></i></a>
            </div>
        `;
        return card;
    }

    // 📣 تصميم بطاقة "طلب عميل" (أزرق)
    createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #0a84ff"; 
        card.style.background = "linear-gradient(145deg, #111, #161616)";
        
        const cleanId = request.filename.replace('.json', '');
        // بناء الرابط الصحيح (تفاصيل الطلبات)
        const targetUrl = `/request-details.html?id=${cleanId}&category=${request.category}`;
        
        card.onclick = () => window.location.href = targetUrl;

        const timeAgo = this.getTimeAgo(request.date);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: #0a84ff; background: rgba(10, 132, 255, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid #0a84ff;">
                        <i class="fas fa-bullhorn"></i> مطلوب للشراء
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.2rem; margin:5px 0;">${request.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#0a84ff"></i> ${request.location}</p>
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

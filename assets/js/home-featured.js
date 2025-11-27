/**
 * 🏠 سمسار طلبك - الصفحة الرئيسية (المخلط الذكي)
 * يجلب (عقارات + طلبات) ويعرضهم كبطاقات نصية أنيقة.
 */

class HomeFeaturedDisplay {
    constructor() {
        this.container = document.getElementById("featured-container");
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 1. جلب البيانات بالتوازي
            const [properties, requests] = await Promise.all([
                this.fetchLatestItems('properties', 'apartments'), // جلب من الشقق
                this.fetchLatestItems('requests', 'apartments')    // جلب من الطلبات
            ]);

            // 2. الدمج والترتيب
            // نأخذ أحدث 2 عقار
            const featuredProperties = properties.slice(0, 2).map(i => ({...i, type: 'offer'}));
            // نأخذ أحدث 1 طلب
            const featuredRequests = requests.slice(0, 1).map(i => ({...i, type: 'request'}));
            
            // ندمجهم
            let mixedItems = [...featuredProperties, ...featuredRequests];

            // نعيد ترتيبهم حسب التاريخ (الأحدث يظهر أولاً)
            mixedItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 3. العرض
            this.renderItems(mixedItems);

        } catch (error) {
            console.error("Error fetching home data:", error);
            this.container.innerHTML = `<p style="text-align:center; color:#555; grid-column:1/-1;">عذراً، لم نتمكن من تحميل أحدث العروض.</p>`;
        }
    }

    // دالة لجلب البيانات
    async fetchLatestItems(section, category) {
        try {
            const response = await fetch(`/data/${section}/${category}/index.json`);
            if (!response.ok) return [];
            
            const files = await response.json();
            // نأخذ أحدث 3 ملفات فقط لتسريع العملية
            const latestFiles = files.slice(0, 3);

            const promises = latestFiles.map(filename => 
                fetch(`/data/${section}/${category}/${filename}`)
                    .then(res => res.json())
                    .then(data => ({ ...data, filename }))
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
            this.container.innerHTML = `<p style="text-align:center; grid-column:1/-1;">لا توجد بيانات حديثة.</p>`;
            return;
        }

        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            const card = item.type === 'offer' 
                ? this.createOfferCard(item) 
                : this.createRequestCard(item);
            
            // تأثير ظهور
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.2}s`;
            this.container.appendChild(card);
        });
    }

    // 🏷️ تصميم بطاقة "عرض عقار" (نصية - ذهبي)
    createOfferCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode'; // نفس كلاس CSS
        
        // حد علوي ذهبي لتمييز العروض
        card.style.borderTop = "4px solid var(--color-primary)"; 
        
        card.onclick = () => window.location.href = `/property/${property.filename.replace('.json', '')}`;

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

            <!-- شبكة التفاصيل -->
            <div class="property-details" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                 <!-- السعر مميز -->
                 <div style="grid-column:1/-1; color: var(--color-primary); font-weight:bold; font-size:1.1rem; background: linear-gradient(90deg, rgba(212,175,55,0.1), transparent); padding:5px; border-radius:5px;">
                    ${property.price_display || property.price}
                 </div>
                 
                 ${property.area ? `
                 <div style="font-size:0.9rem; color:#ccc;">
                    <i class="fas fa-ruler-combined" style="color:var(--color-primary)"></i> ${property.area}
                 </div>` : ''}
                 
                 ${property.rooms ? `
                 <div style="font-size:0.9rem; color:#ccc;">
                    <i class="fas fa-bed" style="color:var(--color-primary)"></i> ${property.rooms} غرف
                 </div>` : ''}
            </div>

            <div style="margin-top:auto; border-top:1px solid #222; padding-top:10px;">
                <span style="color:#aaa; font-size:0.9rem;">التفاصيل <i class="fas fa-angle-left" style="color:var(--color-primary)"></i></span>
            </div>
        `;
        return card;
    }

    // 📣 تصميم بطاقة "طلب عميل" (نصية - أزرق)
    createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        
        // حد علوي أزرق لتمييز الطلبات
        card.style.borderTop = "4px solid #0a84ff"; 
        
        // خلفية مميزة قليلاً للطلبات
        card.style.background = "linear-gradient(145deg, #111, #161616)";
        
        card.onclick = () => window.location.href = `/request/${request.filename.replace('.json', '')}`;

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
                    ${request.description ? request.description.substring(0, 60) + '...' : 'يرغب العميل في شراء عقار بهذه المواصفات...'}
                 </p>
            </div>
            
            <div style="margin-top:auto; text-align:left;">
                <span style="font-size:0.8rem; color:#0a84ff;">لديك هذا العقار؟ <i class="fas fa-check-circle"></i></span>
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

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    new HomeFeaturedDisplay();
});

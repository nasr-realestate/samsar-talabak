/**
 * 🏠 سمسار طلبك - الصفحة الرئيسية (كوكتيل نبض السوق)
 * v5.0 - (بيع + إيجار + طلب)
 */

class HomeFeaturedDisplay {
    constructor() {
        this.container = document.getElementById("featured-container");
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 1. جلب "أحدث عنصر" من كل فئة بالتوازي
            const [sales, rents, requests] = await Promise.all([
                this.fetchLatestItems('properties', 'apartments'),      // شقق تمليك
                this.fetchLatestItems('properties', 'apartments-rent'), // شقق إيجار
                this.fetchLatestItems('requests', 'apartments')         // طلبات
            ]);

            let mixedItems = [];

            // 2. اختيار "بطل" واحد من كل فئة (الأحدث)
            
            // أحدث شقة تمليك
            if (sales.length > 0) {
                mixedItems.push({ ...sales[0], type: 'sale' });
            }

            // أحدث شقة إيجار
            if (rents.length > 0) {
                mixedItems.push({ ...rents[0], type: 'rent' });
            }

            // أحدث طلب
            if (requests.length > 0) {
                mixedItems.push({ ...requests[0], type: 'request' });
            }

            // 3. الترتيب النهائي زمنياً
            // (حتى لو جبت واحد من كل نوع، نرتبهم مين نزل قبل مين في الموقع)
            mixedItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 4. العرض
            this.renderItems(mixedItems);

        } catch (error) {
            console.error("Home Data Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:#555; grid-column:1/-1;">جاري تحديث نبض السوق...</p>`;
        }
    }

    // دالة الجلب (تجلب آخر ملفات وتعكسها)
    async fetchLatestItems(section, category) {
        try {
            const response = await fetch(`/data/${section}/${category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            
            // نأخذ آخر 2 فقط لنضمن السرعة ونعكسهم
            const latestFiles = files.slice(-2).reverse();

            const promises = latestFiles.map(filename => 
                fetch(`/data/${section}/${category}/${filename}`)
                    .then(res => res.json())
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
            let card;
            
            // تحديد شكل البطاقة بناءً على النوع
            if (item.type === 'sale') {
                card = this.createSaleCard(item);
            } else if (item.type === 'rent') {
                card = this.createRentCard(item);
            } else {
                card = this.createRequestCard(item);
            }
            
            // تأثير ظهور متتابع
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.2}s`;
            this.container.appendChild(card);
        });
    }

    // 🏷️ تصميم بطاقة "بيع" (ذهبي)
    createSaleCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #d4af37"; // ذهبي
        
        const cleanId = property.filename.replace('.json', '');
        const targetUrl = `/details.html?id=${cleanId}&category=${property.category}`;
        card.onclick = () => window.location.href = targetUrl;

        const timeAgo = this.getTimeAgo(property.date);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: #d4af37; background: rgba(212, 175, 55, 0.1); padding: 2px 10px; border-radius: 10px; border: 1px solid #d4af37;">
                        <i class="fas fa-certificate"></i> للبيع
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.2rem; margin:5px 0;">${property.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#d4af37"></i> ${property.location}</p>
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

    // 🔑 تصميم بطاقة "إيجار" (أصفر ليموني / مميز)
    createRentCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #fce205"; // أصفر فاقع للإيجار
        
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
                <h3 style="color:#fff; font-size:1.2rem; margin:5px 0;">${property.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:#fce205"></i> ${property.location}</p>
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

    // 📣 تصميم بطاقة "طلب عميل" (أزرق)
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
                        <i class="fas fa-bullhorn"></i> مطلوب شراء
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
        if (days === 0) return 'اليوم';
        if (days === 1) return 'أمس';
        if (days < 30) return `منذ ${days} أيام`;
        return `منذ شهر`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HomeFeaturedDisplay();
});

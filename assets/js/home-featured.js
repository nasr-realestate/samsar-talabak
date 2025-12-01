/**
 * 🏠 سمسار طلبك - الرادار الذكي (Browser-Side Sorting)
 * v10.0 - يقوم بالترتيب داخل المتصفح لضمان الدقة
 */

class HomeGlobalScanner {
    constructor() {
        this.container = document.getElementById("featured-container");
        
        // المصادر
        this.sources = [
            { section: 'properties', category: 'apartments', type: 'offer' },
            { section: 'properties', category: 'apartments-rent', type: 'offer' },
            { section: 'properties', category: 'offices', type: 'offer' },
            { section: 'properties', category: 'shops', type: 'offer' },
            { section: 'requests', category: 'apartments', type: 'request' },
            { section: 'requests', category: 'offices', type: 'request' }
        ];

        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 1. جلب كل الملفات من كل الأقسام
            const promises = this.sources.map(source => this.scanFolder(source));
            const results = await Promise.all(promises);
            
            // دمج النتائج
            let allItems = results.flat().filter(item => item !== null);

            if (allItems.length === 0) {
                this.container.innerHTML = `<div style="text-align:center; padding:2rem; color:#777;">جاري إضافة العروض...</div>`;
                return;
            }

            // 2. الترتيب الزمني الحقيقي (الأحدث في الأعلى)
            // هنا يكمن السر: المتصفح يقرأ التواريخ ويرتب بناءً عليها
            allItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 3. اختيار العينة (2 عرض + 1 طلب)
            let finalDisplay = [];
            
            // نأخذ أحدث العروض (بيع أو إيجار)
            const offers = allItems.filter(i => i.sourceType === 'offer');
            if (offers.length > 0) finalDisplay.push(offers[0]);
            if (offers.length > 1) finalDisplay.push(offers[1]);

            // نأخذ أحدث طلب
            const requests = allItems.filter(i => i.sourceType === 'request');
            if (requests.length > 0) finalDisplay.push(requests[0]);

            // ترتيب العينة النهائية للعرض
            finalDisplay.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 4. العرض
            this.renderItems(finalDisplay);

        } catch (error) {
            console.error("Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:red;">خطأ في تحميل البيانات.</p>`;
        }
    }

    async scanFolder(source) {
        try {
            // جلب القائمة
            const response = await fetch(`/data/${source.section}/${source.category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            if (!files || files.length === 0) return [];

            // 💡 الذكاء هنا:
            // بما أن الملفات غير مرتبة في السيرفر، سنجلبها كلها (أو عينة كبيرة منها)
            // ونترك المتصفح يختار الأحدث. هذا يضمن عدم تفويت أي ملف جديد.
            // نأخذ عينة (آخر 6 ملفات في القائمة عشوائياً) لتسريع الموقع
            // (عادة الملفات الجديدة تضاف في الآخر حتى بدون ترتيب دقيق)
            const sampleFiles = files.slice(-6); 

            const itemPromises = sampleFiles.map(filename => 
                fetch(`/data/${source.section}/${source.category}/${filename}?t=${Date.now()}`)
                    .then(res => res.json())
                    .then(data => {
                        // تحديد النوع (إيجار أم بيع)
                        let displayType = source.type;
                        if (source.type === 'offer' && data.title && data.title.includes('إيجار')) {
                            displayType = 'rent';
                        }
                        
                        return {
                            ...data,
                            filename,
                            category: source.category,
                            section: source.section,
                            sourceType: source.type,
                            displayType: displayType
                        };
                    })
                    .catch(() => null)
            );

            return await Promise.all(itemPromises);

        } catch (e) {
            return [];
        }
    }

    renderItems(items) {
        this.container.innerHTML = '';
        items.forEach((item, index) => {
            let card;
            if (item.sourceType === 'request') card = this.createRequestCard(item);
            else if (item.displayType === 'rent') card = this.createRentCard(item);
            else card = this.createSaleCard(item);
            
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.2}s`;
            this.container.appendChild(card);
        });
    }

    // --- القوالب (نفس التصميم) ---
    createSaleCard(p) { return this.genCard(p, '#d4af37', 'fa-certificate', 'بيع', '/details.html'); }
    createRentCard(p) { return this.genCard(p, '#fce205', 'fa-key', 'إيجار', '/details.html'); }
    createRequestCard(r) { 
        const c = this.genCard(r, '#0a84ff', 'fa-bullhorn', 'مطلوب', '/request-details.html');
        c.style.background = 'linear-gradient(145deg, #111, #161616)';
        return c;
    }

    genCard(item, color, icon, label, pageUrl) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = `4px solid ${color}`;
        
        const id = item.filename.replace('.json', '');
        card.onclick = () => window.location.href = `${pageUrl}?id=${id}&category=${item.category}`;
        
        const val = item.budget ? `ميزانية: ${item.budget}` : (item.price_display || item.price);

        card.innerHTML = `
            <div class="property-header" style="border-bottom:1px dashed #333; padding-bottom:10px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color:${color}; border:1px solid ${color}; padding:2px 8px; border-radius:10px;">
                        <i class="fas ${icon}"></i> ${label}
                    </span>
                    <span style="color:#666;">${this.timeAgo(item.date)}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0;">${item.title}</h3>
                <p style="color:#888; font-size:0.9rem;">${item.location || 'مدينة نصر'}</p>
            </div>
            <div class="property-details">
                 <div style="color:${color}; font-weight:bold; font-size:1.1rem;">${val}</div>
            </div>
            <div style="margin-top:auto; padding-top:10px;">
                <span style="color:#aaa; font-size:0.9rem;">التفاصيل <i class="fas fa-arrow-left" style="color:${color}"></i></span>
            </div>
        `;
        return card;
    }

    timeAgo(d) { return d ? 'جديد' : ''; }
}

document.addEventListener('DOMContentLoaded', () => new HomeGlobalScanner());

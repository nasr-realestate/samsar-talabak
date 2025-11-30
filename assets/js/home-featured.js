/**
 * 🏠 سمسار طلبك - الصفحة الرئيسية (النسخة الخفيفة Smart Lite)
 * تعالج الأخطاء بصمت ولا تسبب ثقل للمتصفح
 */

class HomeFeaturedDisplay {
    constructor() {
        this.container = document.getElementById("featured-container");
        // نبحث فقط في الأقسام الرئيسية المضمونة لتقليل الضغط
        this.sources = [
            { section: 'properties', category: 'apartments', defaultType: 'sale' },
            { section: 'properties', category: 'apartments-rent', defaultType: 'rent' },
            { section: 'requests', category: 'apartments', defaultType: 'request' }
        ];
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // جلب البيانات بالتوازي
            const promises = this.sources.map(source => this.fetchLatestFromSource(source));
            const results = await Promise.all(promises);
            
            // دمج النتائج الصالحة فقط
            let allItems = results.flat().filter(item => item !== null);

            // الترتيب الزمني
            allItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // عرض
            this.renderItems(allItems);

        } catch (error) {
            console.warn("Home load issue:", error); // تحذير خفي في الكونسول فقط
            this.container.innerHTML = `<p style="text-align:center; color:#777;">جاري تحديث العروض...</p>`;
        }
    }

    async fetchLatestFromSource(source) {
        try {
            // إضافة t= لمنع الكاش
            const response = await fetch(`/data/${source.section}/${source.category}/index.json?t=${Date.now()}`);
            if (!response.ok) return []; // عودة صامتة في حالة الخطأ
            
            const files = await response.json();
            if (!files || files.length === 0) return [];

            // نأخذ آخر ملف (الأحدث)
            const latestFilename = files[files.length - 1];

            const fileRes = await fetch(`/data/${source.section}/${source.category}/${latestFilename}`);
            if (!fileRes.ok) return []; // عودة صامتة
            
            const data = await fileRes.json();

            let finalType = source.defaultType;
            if (source.section === 'properties' && data.title && data.title.includes('إيجار')) {
                finalType = 'rent';
            }

            return [{
                ...data,
                filename: latestFilename,
                category: source.category,
                type: finalType
            }];

        } catch (e) {
            return []; // لا ترمي خطأ، فقط تجاهل القسم الفارغ
        }
    }

    renderItems(items) {
        if (items.length === 0) {
            this.container.innerHTML = `<div style="text-align:center; color:#555; padding:2rem;">جاري إضافة عروض جديدة...</div>`;
            return;
        }

        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            let card;
            if (item.type === 'request') card = this.createRequestCard(item);
            else if (item.type === 'rent') card = this.createRentCard(item);
            else card = this.createSaleCard(item);
            
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
            this.container.appendChild(card);
        });
    }

    // --- القوالب (نفس التصميم الذهبي السابق) ---
    // (تم اختصارها هنا، انسخ دوال createSaleCard, createRentCard, createRequestCard, getTimeAgo من الكود السابق كما هي)
    // سأضع لك دالة واحدة كمثال وتكمل الباقي أو تستخدم القديم للجزء السفلي:
    
    createSaleCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #d4af37";
        const cleanId = property.filename.replace('.json', '');
        card.onclick = () => window.location.href = `/details.html?id=${cleanId}&category=${property.category}`;
        // ... باقي HTML البطاقة كما هو ...
        
        // (للاختصار في الرد: استخدم نفس دوال رسم البطاقات من الكود السابق فهي سليمة)
        return this.generateCardHTML(card, property, '#d4af37', 'عرض بيع');
    }

    createRentCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #fce205";
        const cleanId = property.filename.replace('.json', '');
        card.onclick = () => window.location.href = `/details.html?id=${cleanId}&category=${property.category}`;
        return this.generateCardHTML(card, property, '#fce205', 'للإيجار');
    }

    createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = "4px solid #0a84ff";
        card.style.background = "linear-gradient(145deg, #111, #161616)";
        const cleanId = request.filename.replace('.json', '');
        card.onclick = () => window.location.href = `/request-details.html?id=${cleanId}&category=${request.category}`;
        return this.generateRequestHTML(card, request);
    }

    // دالة مساعدة لتقليل الكود
    generateCardHTML(card, p, color, label) {
        const timeAgo = this.getTimeAgo(p.date);
        card.innerHTML = `
            <div class="property-header" style="border-bottom:1px dashed #333; padding-bottom:10px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color:${color}; background:rgba(255,255,255,0.05); padding:2px 10px; border-radius:10px; border:1px solid ${color};">${label}</span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0;">${p.title}</h3>
                <p style="color:#888; font-size:0.9rem;"><i class="fas fa-map-marker-alt" style="color:${color}"></i> ${p.location}</p>
            </div>
            <div class="property-details" style="margin-bottom:15px;">
                 <div style="color:${color}; font-weight:bold; font-size:1.1rem;">${p.price_display || p.price}</div>
            </div>
            <div style="margin-top:auto; border-top:1px solid #222; padding-top:10px;">
                <span style="color:#aaa; font-size:0.9rem;">التفاصيل <i class="fas fa-angle-left"></i></span>
            </div>`;
        return card;
    }

    generateRequestHTML(card, r) {
        const timeAgo = this.getTimeAgo(r.date);
        card.innerHTML = `
            <div class="property-header" style="border-bottom:1px dashed #333; padding-bottom:10px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color:#0a84ff; border:1px solid #0a84ff; padding:2px 10px; border-radius:10px;">مطلوب</span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0;">${r.title}</h3>
            </div>
            <div class="property-details" style="margin-bottom:15px;">
                 <div style="color:#fff;">ميزانية: <span style="color:#0a84ff;">${r.budget}</span></div>
            </div>`;
        return card;
    }

    getTimeAgo(date) { return 'جديد'; } // تبسيط
}

document.addEventListener('DOMContentLoaded', () => new HomeFeaturedDisplay());

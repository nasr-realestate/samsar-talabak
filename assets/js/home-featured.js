/**
 * 🏠 سمسار طلبك - الرادار الذكي (v10.2 - البحث الشامل)
 * يقوم بجلب كل الملفات لضمان عدم تفويت أي تحديث، بغض النظر عن ترتيبه.
 */

class HomeGlobalScanner {
    constructor() {
        this.container = document.getElementById("featured-container");
        
        // *** تعديل: تحديث قائمة المصادر لتشمل كل المجلدات ***
        this.sources = [
            // --- العروض (Properties) ---
            { section: 'properties', category: 'apartments', type: 'offer' },
            { section: 'properties', category: 'apartments-rent', type: 'offer' },
            { section: 'properties', category: 'offices', type: 'offer' },
            { section: 'properties', category: 'shops', type: 'offer' },
            { section: 'properties', category: 'admin-hq', type: 'offer' }, // تمت الإضافة

            // --- الطلبات (Requests) ---
            { section: 'requests', category: 'apartments', type: 'request' },
            { section: 'requests', category: 'apartments-rent', type: 'request' }, // تمت الإضافة
            { section: 'requests', category: 'offices', type: 'request' },
            { section: 'requests', category: 'shops', type: 'request' },     // تمت الإضافة
            { section: 'requests', category: 'admin-hq', type: 'request' }      // تمت الإضافة
        ];

        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 1. جلب كل الملفات من كل الأقسام (الآن بشكل شامل)
            const promises = this.sources.map(source => this.scanFolder(source));
            const results = await Promise.all(promises);
            
            let allItems = results.flat().filter(item => item !== null && item.date); // فلترة أي عنصر بدون تاريخ

            if (allItems.length === 0) {
                this.container.innerHTML = `<div style="text-align:center; padding:2rem; color:#777;">جاري إضافة العروض...</div>`;
                return;
            }

            // 2. الترتيب الزمني الدقيق (الأحدث في الأعلى)
            allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

            // 3. اختيار العينة بذكاء (أحدث عرضين وأحدث طلب)
            let finalDisplay = [];
            let offerCount = 0;
            let requestCount = 0;
            const MAX_OFFERS = 2;
            const MAX_REQUESTS = 1;

            for (const item of allItems) {
                if (item.sourceType === 'offer' && offerCount < MAX_OFFERS) {
                    finalDisplay.push(item);
                    offerCount++;
                } else if (item.sourceType === 'request' && requestCount < MAX_REQUESTS) {
                    finalDisplay.push(item);
                    requestCount++;
                }
                if (offerCount >= MAX_OFFERS && requestCount >= MAX_REQUESTS) {
                    break;
                }
            }

            // 4. العرض
            this.renderItems(finalDisplay);

        } catch (error) {
            console.error("خطأ حرج في HomeGlobalScanner:", error);
            this.container.innerHTML = `<p style="text-align:center; color:red;">خطأ في تحميل البيانات.</p>`;
        }
    }

    async scanFolder(source) {
        try {
            const response = await fetch(`/data/${source.section}/${source.category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            if (!files || files.length === 0) return [];

            // *** التعديل الجذري: لا نأخذ عينة، بل نستخدم كل الملفات ***
            // const sampleFiles = files.slice(-6); // << تم إلغاء هذا السطر
            const allFiles = files; // نستخدم كل القائمة

            const itemPromises = allFiles.map(filename => 
                fetch(`/data/${source.section}/${source.category}/${filename}?t=${Date.now()}`)
                    .then(res => {
                        if (!res.ok) return null;
                        return res.json();
                    })
                    .then(data => {
                        if (!data) return null;

                        // تحديد نوع العرض (إيجار أم بيع) بشكل أدق
                        let displayType = source.type;
                        if (source.category === 'apartments-rent') {
                            displayType = 'rent';
                        } else if (source.type === 'offer' && data.title && data.title.includes('إيجار')) {
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
                    .catch(() => null) // تجاهل الملفات التي تفشل في التحميل
            );

            return await Promise.all(itemPromises);

        } catch (e) {
            console.error(`فشل في مسح المجلد: ${source.category}`, e);
            return []; // نرجع مصفوفة فارغة عند حدوث خطأ لمنع انهيار التطبيق
        }
    }

    // ... باقي الدوال (renderItems, genCard, etc.) تبقى كما هي ...
    renderItems(items) {
        this.container.innerHTML = '';
        if (items.length === 0) {
            this.container.innerHTML = `<div style="text-align:center; padding:2rem; color:#777;">لا توجد عناصر لعرضها حالياً.</div>`;
            return;
        }
        items.forEach((item, index) => {
            let card;
            if (item.sourceType === 'request') card = this.createRequestCard(item);
            else if (item.displayType === 'rent') card = this.createRentCard(item);
            else card = this.createSaleCard(item);
            
            if (card) {
                card.style.opacity = '0';
                card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.2}s`;
                this.container.appendChild(card);
            }
        });
    }

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
        
        const val = item.budget ? `ميزانية: ${item.budget}` : (item.price_display || item.price || 'غير محدد');

        card.innerHTML = `
            <div class="property-header" style="border-bottom:1px dashed #333; padding-bottom:10px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color:${color}; border:1px solid ${color}; padding:2px 8px; border-radius:10px;">
                        <i class="fas ${icon}"></i> ${label}
                    </span>
                    <span style="color:#666;">${this.timeAgo(item.date)}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0;">${item.title || 'عنوان غير متوفر'}</h3>
                <p style="color:#888; font-size:0.9rem;">${item.location || 'غير محدد'}</p>
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

    timeAgo(d) {
        if (!d) return '';
        const date = new Date(d);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        
        if (seconds < 60) return `الآن`;
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) return `منذ ${minutes} د`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `منذ ${hours} س`;
        const days = Math.round(hours / 24);
        return `منذ ${days} ي`;
    }
}

document.addEventListener('DOMContentLoaded', () => new HomeGlobalScanner());

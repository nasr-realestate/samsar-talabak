/**
 * 🏠 سمسار طلبك - الصفحة الرئيسية (نسخة المحقق - Debug Version)
 * v8.0 - تكشف الأخطاء وتعرض أي بيانات متاحة
 */

class HomeGlobalScanner {
    constructor() {
        this.container = document.getElementById("featured-container");
        
        // تعريف المصادر (تأكد أن هذه المجلدات موجودة فعلياً في data)
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
            console.log("🚀 بدء فحص نبض السوق...");
            
            // جلب البيانات مع تسجيل النتائج
            const promises = this.sources.map(source => this.fetchLatestFromSource(source));
            const results = await Promise.all(promises);
            
            // دمج النتائج
            let allItems = results.flat().filter(item => item !== null);
            console.log(`✅ تم العثور على إجمالي ${allItems.length} عنصر.`);

            if (allItems.length === 0) {
                this.showDebugMessage(); // عرض رسالة مساعدة في حال الفشل
                return;
            }

            // ترتيب زمني
            allItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // أخذ العينة للعرض (أحدث 3)
            // سنأخذ أول 3 عناصر بغض النظر عن نوعهم لضمان امتلاء الصفحة
            const finalDisplayList = allItems.slice(0, 3);

            this.renderItems(finalDisplayList);

        } catch (error) {
            console.error("Critical Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:red;">حدث خطأ تقني. راجع الكونسول.</p>`;
        }
    }

    async fetchLatestFromSource(source) {
        const url = `/data/${source.section}/${source.category}/index.json?t=${Date.now()}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`⚠️ فشل الوصول للفهرس: ${url} (404 Not Found)`);
                return [];
            }
            
            const files = await response.json();
            if (!files || files.length === 0) {
                console.log(`ℹ️ المجلد فارغ: ${source.category}`);
                return [];
            }

            // نأخذ آخر ملف (الأحدث)
            const latestFilename = files[files.length - 1];
            
            // جلب تفاصيل الملف
            const fileUrl = `/data/${source.section}/${source.category}/${latestFilename}`;
            const fileRes = await fetch(fileUrl);
            if (!fileRes.ok) {
                console.error(`❌ الملف موجود في الفهرس لكنه غير موجود فعلياً: ${fileUrl}`);
                return [];
            }

            const data = await fileRes.json();
            
            // تحديد النوع للعرض
            let displayType = source.type;
            if (source.type === 'offer' && data.title && data.title.includes('إيجار')) {
                displayType = 'rent';
            }

            return [{
                ...data,
                filename: latestFilename,
                category: source.category,
                section: source.section,
                displayType: displayType
            }];

        } catch (e) {
            console.error(`Error in ${source.category}:`, e);
            return [];
        }
    }

    renderItems(items) {
        this.container.innerHTML = '';
        items.forEach((item, index) => {
            let card;
            if (item.section === 'requests') card = this.createRequestCard(item);
            else if (item.displayType === 'rent') card = this.createRentCard(item);
            else card = this.createSaleCard(item);
            
            card.style.opacity = '0';
            card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.2}s`;
            this.container.appendChild(card);
        });
    }

    showDebugMessage() {
        this.container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:2rem; color:#888; direction:ltr;">
                <i class="fas fa-bug" style="font-size:2rem; margin-bottom:10px;"></i><br>
                <strong>Debug Mode:</strong> No items found.<br>
                Possible reasons:<br>
                1. index.json files are missing (Build script failed).<br>
                2. Folders are empty.<br>
                <small>Check Browser Console (F12) for details.</small>
            </div>
        `;
    }

    // --- قوالب البطاقات (نفس التصميم) ---
    createSaleCard(p) { return this.generateCard(p, '#d4af37', 'fa-certificate', 'بيع', '/details.html'); }
    createRentCard(p) { return this.generateCard(p, '#fce205', 'fa-key', 'إيجار', '/details.html'); }
    createRequestCard(r) { 
        const card = this.generateCard(r, '#0a84ff', 'fa-bullhorn', 'مطلوب', '/request-details.html');
        card.style.background = 'linear-gradient(145deg, #111, #161616)';
        return card;
    }

    generateCard(item, color, icon, label, pageUrl) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = `4px solid ${color}`;
        
        const cleanId = item.filename.replace('.json', '');
        const targetUrl = `${pageUrl}?id=${cleanId}&category=${item.category}`;
        card.onclick = () => window.location.href = targetUrl;

        const val = item.budget ? `ميزانية: ${item.budget}` : (item.price_display || item.price);

        card.innerHTML = `
            <div class="property-header" style="border-bottom:1px dashed #333; padding-bottom:10px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color:${color}; border:1px solid ${color}; padding:2px 8px; border-radius:10px;">
                        <i class="fas ${icon}"></i> ${label}
                    </span>
                    <span style="color:#666;">${this.getTimeAgo(item.date)}</span>
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

    getTimeAgo(d) { return d ? 'جديد' : ''; }
}

document.addEventListener('DOMContentLoaded', () => new HomeGlobalScanner());

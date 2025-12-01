/**
 * 🏠 سمسار طلبك - الرادار العميق (Deep Time Scanner)
 * v9.0 - يعتمد على تاريخ الملف بدقة متناهية
 */

class HomeGlobalScanner {
    constructor() {
        this.container = document.getElementById("featured-container");
        
        // جميع المصادر التي نريد مراقبتها
        this.sources = [
            // العروض
            { section: 'properties', category: 'apartments', type: 'offer' },
            { section: 'properties', category: 'apartments-rent', type: 'offer' },
            { section: 'properties', category: 'offices', type: 'offer' },
            { section: 'properties', category: 'shops', type: 'offer' },
            { section: 'properties', category: 'admin-hq', type: 'offer' },
            // الطلبات
            { section: 'requests', category: 'apartments', type: 'request' },
            { section: 'requests', category: 'offices', type: 'request' },
            { section: 'requests', category: 'shops', type: 'request' },
            { section: 'requests', category: 'admin-hq', type: 'request' }
        ];

        this.init();
    }

    async init() {
        if (!this.container) return;
        
        try {
            // 1. جمع البيانات من كل المصادر
            const promises = this.sources.map(source => this.scanFolderForLatest(source));
            const results = await Promise.all(promises);
            
            // دمج كل النتائج في قائمة واحدة ضخمة
            let allItems = results.flat().filter(item => item !== null);

            // 2. فصل العروض عن الطلبات
            let allOffers = allItems.filter(item => item.sourceType === 'offer');
            let allRequests = allItems.filter(item => item.sourceType === 'request');

            // 3. الترتيب الزمني الدقيق (الأحدث في الأعلى)
            const sortByDate = (a, b) => new Date(b.date || 0) - new Date(a.date || 0);
            
            allOffers.sort(sortByDate);
            allRequests.sort(sortByDate);

            // 4. اختيار الفائزين (أحدث 2 عرض + أحدث 1 طلب)
            let finalSelection = [];

            if (allOffers.length > 0) finalSelection.push(allOffers[0]);
            if (allOffers.length > 1) finalSelection.push(allOffers[1]);
            if (allRequests.length > 0) finalSelection.push(allRequests[0]);

            // ترتيبهم مرة أخيرة للعرض المختلط
            finalSelection.sort(sortByDate);

            // 5. العرض
            this.renderItems(finalDisplayList = finalSelection);

        } catch (error) {
            console.error("Scanner Error:", error);
            this.container.innerHTML = `<p style="text-align:center; color:#555;">جاري تحميل أحدث الفرص...</p>`;
        }
    }

    // دالة تمسح المجلد وتجلب "مجموعة" من الملفات وليس واحداً فقط
    async scanFolderForLatest(source) {
        try {
            // جلب الفهرس
            const response = await fetch(`/data/${source.section}/${source.category}/index.json?t=${Date.now()}`);
            if (!response.ok) return [];
            
            const files = await response.json();
            if (!files || files.length === 0) return [];

            // 💎 السر هنا: نأخذ آخر 4 ملفات من كل مجلد ونفحص تواريخهم
            // (لأنك قد تضيف عدة ملفات في نفس القسم، نريد الأحدث بينهم)
            const candidates = files.slice(-4); 

            const itemPromises = candidates.map(filename => 
                fetch(`/data/${source.section}/${source.category}/${filename}?t=${Date.now()}`)
                    .then(res => res.json())
                    .then(data => {
                        // تحديد النوع الدقيق
                        let displayType = source.type;
                        if (source.type === 'offer' && data.title && data.title.includes('إيجار')) {
                            displayType = 'rent';
                        }
                        
                        return {
                            ...data,
                            filename,
                            category: source.category,
                            section: source.section,
                            sourceType: source.type, // للتصنيف الداخلي (عرض/طلب)
                            displayType: displayType // للعرض (ألوان)
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
        if (items.length === 0) {
            this.container.innerHTML = `<div style="text-align:center; color:#555; padding:2rem;">لا توجد بيانات حديثة.</div>`;
            return;
        }

        this.container.innerHTML = '';
        
        items.forEach((item, index) => {
            let card;
            
            if (item.sourceType === 'request') {
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

    // --- القوالب (التصميم النصي الذهبي) ---

    createSaleCard(property) {
        return this.generateCardHTML(property, '#d4af37', 'fa-certificate', 'بيع', '/details.html');
    }

    createRentCard(property) {
        return this.generateCardHTML(property, '#fce205', 'fa-key', 'إيجار', '/details.html');
    }

    createRequestCard(request) {
        const card = this.generateCardHTML(request, '#0a84ff', 'fa-bullhorn', 'مطلوب', '/request-details.html');
        card.style.background = 'linear-gradient(145deg, #111, #161616)';
        return card;
    }

    generateCardHTML(item, color, icon, label, pageUrl) {
        const card = document.createElement('div');
        card.className = 'property-card text-mode';
        card.style.borderTop = `4px solid ${color}`;
        
        const cleanId = item.filename.replace('.json', '');
        const targetUrl = `${pageUrl}?id=${cleanId}&category=${item.category}`;
        
        card.onclick = () => window.location.href = targetUrl;
        const timeAgo = this.getTimeAgo(item.date);
        
        // عرض السعر أو الميزانية
        const valueDisplay = item.budget ? `ميزانية: ${item.budget}` : (item.price_display || item.price);

        card.innerHTML = `
            <div class="property-header" style="border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:8px;">
                    <span style="color: ${color}; background: rgba(255, 255, 255, 0.05); padding: 2px 10px; border-radius: 10px; border: 1px solid ${color};">
                        <i class="fas ${icon}"></i> ${label}
                    </span>
                    <span style="color:#666;">${timeAgo}</span>
                </div>
                <h3 style="color:#fff; font-size:1.1rem; margin:5px 0; line-height:1.4;">${item.title}</h3>
                <p style="color:#888; font-size:0.9rem;">${item.location || 'مدينة نصر'}</p>
            </div>

            <div class="property-details" style="margin-bottom:15px;">
                 <div style="color:${color}; font-weight:bold; font-size:1.1rem; background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent); padding:5px; border-radius:5px;">
                    ${valueDisplay}
                 </div>
                 <div style="display:flex; gap:15px; margin-top:8px; font-size:0.9rem; color:#ccc;">
                    ${item.area ? `<span><i class="fas fa-ruler"></i> ${item.area}</span>` : ''}
                    ${item.rooms ? `<span><i class="fas fa-bed"></i> ${item.rooms}</span>` : ''}
                 </div>
            </div>

            <div style="margin-top:auto; padding-top:10px; border-top:1px solid #222;">
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
        if (days <= 0) return 'اليوم';
        if (days === 1) return 'أمس';
        if (days < 30) return `منذ ${days} يوم`;
        return `منذ شهر`;
    }
}

document.addEventListener('DOMContentLoaded', () => new HomeGlobalScanner());

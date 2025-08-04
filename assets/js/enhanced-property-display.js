/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (نسخة الاختبار v4.1 - بطاقة حقيقية مثالية)
 * 🛑 هذا الكود لغرض الاختبار فقط.
 */

class EnhancedPropertyDisplay {
  constructor() {
    this.container = document.getElementById("properties-container");
    // ... (باقي الـ constructor يبقى كما هو)
    this.init();
  }

  // ✨✨✨ تم تعديل هذه الدالة فقط لغرض الاختبار ✨✨✨
  async init() {
    try {
      await this.waitForDOM();
      
      // --- استخدام بياناتك الحقيقية مع إضافة ID لإنشاء بطاقة اختبار مثالية ---
      const testProperty = {
        id: "shqa-ahly-fursan-1", // <-- الـ ID المثالي
        title: "شقة للبيع أمام نادي الأهلي – عمارة الفرسان (بطاقة اختبار)",
        price_display: "13,000,000 جنيه شامل الفرش",
        area_display: "320 م²",
        rooms: 4,
        bathrooms: 3,
        floor: 6,
        elevator: true,
        garage: true,
        finish: "تشطيب سوبر لوكس",
        direction: "إطلالة أمامية على الشارع",
        summary: "هذه بطاقة اختبار للتأكد من أن الروابط تعمل بشكل صحيح. إذا تم نقلك إلى صفحة التفاصيل بنجاح، فهذا يثبت أن الواجهة الأمامية سليمة.",
        date: "2025-07-22",
        filename: "shqa-ahly-fursan-1.json" // اسم ملف افتراضي
      };
      
      // إنشاء البطاقة وعرضها مباشرة
      const testCard = this.createPropertyCard(testProperty, 'apartments', 0);
      if (this.container) {
          this.container.innerHTML = ''; // مسح أي رسائل تحميل
          this.container.appendChild(testCard);
      }
      
      // إظهار البطاقة مع تأثير بسيط
      requestAnimationFrame(() => {
        if(testCard) {
            testCard.style.opacity = '1';
            testCard.style.transform = 'translateY(0)';
        }
      });

      console.warn("🛑 وضع الاختبار مُفعّل: يتم عرض بطاقة ثابتة فقط.");

    } catch (error) {
      console.error('خطأ في تهيئة وضع الاختبار:', error);
      if (this.container) this.showErrorMessage('حدث خطأ في تحميل وضع الاختبار');
    }
  }

  // باقي الدوال تبقى كما هي بدون تغيير...
  // ... (الكود الطويل الذي أرسلته سابقًا موجود هنا) ...
  // --- (سأقوم بإعادة كتابة الدوال الأساسية اللازمة للتجربة) ---

  createPropertyCard(property, category, index) {
    const categories = { "apartments": { label: "🏠 شقق للبيع", icon: "🏠", color: "#00ff88" } };
    const categoryInfo = categories[category] || categories['apartments'];
    const card = document.createElement("div");
    card.className = `property-card enhanced-property-card card-${category}`;
    card.dataset.id = property.id; // مهم للاختبار
    card.style.cssText = `opacity: 0; transform: translateY(30px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);`;
    
    const detailPage = `/property/${property.id}`;
    
    const priceToRender = this.escapeHtml(property.price_display || property.price || "غير محدد");
    const areaToRender = this.escapeHtml(property.area_display || property.area || "غير محددة");
    const descriptionText = property.summary || property.description;

    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo" loading="lazy">
        <div class="property-brand">
          <strong>سمسار طلبك</strong>
          <span class="property-category-badge" style="background: ${categoryInfo.color}">${categoryInfo.icon} ${categoryInfo.label}</span>
        </div>
      </div>
      <h3 class="property-title">${this.escapeHtml(property.title)}</h3>
      <div class="property-details">
        <div class="property-detail"><span class="detail-icon">💰</span><span class="detail-label">السعر:</span><span class="detail-value price-highlight">${priceToRender}</span></div>
        <div class="property-detail"><span class="detail-icon">📏</span><span class="detail-label">المساحة:</span><span class="detail-value">${areaToRender}</span></div>
      </div>
      <div class="property-description"><p>${this.escapeHtml(descriptionText)}</p></div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn"><span class="btn-icon">👁️</span><span class="btn-text">عرض التفاصيل الكاملة</span><span class="btn-arrow">←</span></a>
      </div>
    `;
    this.setupCardEvents(card, property);
    return card;
  }
  
  handleCardClick(card, property) {
    if (property && property.id) {
        window.location.href = `/property/${property.id}`;
    }
  }

  // -- دوال مساعدة لضمان عمل الكود --
  waitForDOM() { return new Promise(resolve => { if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', resolve); } else { resolve(); } }); }
  escapeHtml(text) { if (typeof text !== 'string') return text; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  setupCardEvents(card, property) { card.addEventListener('click', e => { if (!e.target.closest('a')) this.handleCardClick(card, property); }); }
  showErrorMessage(message) { if(this.container) this.container.innerHTML = `<h3>${message}</h3>`; }
}

// تأكد من وجود العنصر قبل إنشاء النسخة
if (document.getElementById("properties-container")) {
    const propertyDisplay = new EnhancedPropertyDisplay();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById("properties-container")) {
            const propertyDisplay = new EnhancedPropertyDisplay();
        }
    });
}```

### **الخطوات والتوقعات**

1.  **استبدل** كود الجافا سكريبت بالكود التجريبي أعلاه.
2.  **ارفع التغيير** إلى GitHub وانتظر النشر على Netlify.
3.  **زر صفحة عرض العقارات.** يجب أن ترى بطاقة واحدة فقط، ببيانات شقة نادي الأهلي.

**النتيجة المتوقعة (السيناريو الناجح):**
*   عند الضغط على البطاقة أو على زر "عرض التفاصيل"، سيتم نقلك إلى الرابط: `.../property/shqa-ahly-fursan-1`.
*   ستظهر لك صفحة التفاصيل (بالهيدر والفوتر) وعليها رسالة "جاري التحميل..." أو رسالة خطأ تقول "العقار بالرقم `shqa-ahly-fursan-1` غير موجود".
*   **هذه النتيجة تعتبر نجاحًا باهرًا للتجربة**، لأنها تثبت أن كل شيء حتى هذه النقطة (الواجهة الأمامية والروابط) يعمل بشكل سليم تمامًا، وأن المشكلة الوحيدة المتبقية هي أن "مصنع البيانات" (`build.sh`) لا يعمل بعد ليقوم بتغذية صفحة التفاصيل بالبيانات الصحيحة.

هيا ننفذ هذه التجربة الحاسمة.

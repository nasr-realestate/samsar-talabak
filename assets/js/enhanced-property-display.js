    /**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (نسخة الاختبار v4.2 - انتظار تحميل الصفحة)
 * 🛑 هذا الكود لغرض الاختبار فقط.
 */

// ✨ الإصلاح: انتظر حتى يتم تحميل محتوى الصفحة بالكامل قبل تنفيذ أي كود
document.addEventListener('DOMContentLoaded', () => {

  class EnhancedPropertyDisplay {
    constructor() {
      this.container = document.getElementById("properties-container");
      // تأكد من وجود الحاوية قبل المتابعة
      if (!this.container) {
        console.error("خطأ فادح: لم يتم العثور على الحاوية #properties-container.");
        return;
      }
      this.init();
    }

    async init() {
      try {
        // لم نعد بحاجة لـ waitForDOM هنا لأننا داخل المستمع
        
        // --- استخدام بياناتك الحقيقية مع إضافة ID لإنشاء بطاقة اختبار مثالية ---
        const testProperty = {
          id: "shqa-ahly-fursan-1",
          title: "شقة للبيع أمام نادي الأهلي – عمارة الفرسان (بطاقة اختبار)",
          price_display: "13,000,000 جنيه شامل الفرش",
          area_display: "320 م²",
          summary: "هذه بطاقة اختبار للتأكد من أن الروابط تعمل بشكل صحيح.",
          date: "2025-07-22",
          filename: "shqa-ahly-fursan-1.json",
          location: "مدينة نصر - القاهرة", // إضافة بيانات ناقصة
          rooms: 4, // إضافة بيانات ناقصة
          bathrooms: 3 // إضافة بيانات ناقصة
        };
        
        // إنشاء البطاقة وعرضها مباشرة
        const testCard = this.createPropertyCard(testProperty, 'apartments', 0);
        this.container.innerHTML = ''; // مسح رسالة "جاري التحميل..."
        this.container.appendChild(testCard);
        
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

    createPropertyCard(property, category, index) {
      const categories = { "apartments": { label: "🏠 شقق للبيع", icon: "🏠", color: "#00ff88" } };
      const categoryInfo = categories[category] || categories['apartments'];
      const card = document.createElement("div");
      card.className = `property-card enhanced-property-card card-${category}`;
      card.dataset.id = property.id;
      card.style.cssText = `opacity: 0; transform: translateY(30px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);`;
      
      const detailPage = `/property/${property.id}`;
      
      const priceToRender = this.escapeHtml(property.price_display || "غير محدد");
      const areaToRender = this.escapeHtml(property.area_display || "غير محددة");
      const descriptionText = this.escapeHtml(property.summary || "لا يوجد وصف");

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
        <div class="property-description"><p>${descriptionText}</p></div>
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

    escapeHtml(text) { if (typeof text !== 'string') return text; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
    setupCardEvents(card, property) { card.addEventListener('click', e => { if (!e.target.closest('a')) this.handleCardClick(card, property); }); }
    showErrorMessage(message) { if(this.container) this.container.innerHTML = `<h3>${message}</h3>`; }
  }

  new EnhancedPropertyDisplay();
});
```### **الخطوات**
1.  **استبدل** كود الجافا سكريبت بالكود المحدث أعلاه.
2.  **ارفع التغيير** إلى GitHub وانتظر النشر.
3.  **زر الصفحة مرة أخرى**.

**النتيجة المتوقعة الآن:**
يجب أن تختفي رسالة "جاري التحميل" وأن تظهر مكانها **بطاقة الاختبار** الخاصة بشقة نادي الأهلي. بعد ذلك يمكنك الضغط عليها لنرى ما سيحدث.

نحن نقترب جدًا. هذه مجرد مشكلة توقيت بسيطة وشائعة جدًا في تطوير الويب. هيا نجرب هذا الإصلاح.

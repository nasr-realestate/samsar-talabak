/**
 * 🏢 سمسار طلبك - نظام عرض العقارات (النسخة النهائية الكاملة v3.8 - متوافقة مع CSS)
 */

class EnhancedPropertyDisplay {
  // ... (الكود الكامل الذي يعمل لديك، لا تغييرات هنا)
  // constructor, init, fetch data...

  applyFiltersAndSorting(properties) {
    // ... (دالة الفرز المحسنة التي تعمل لديك)
  }

  // 👇👇👇 هذه هي الدالة التي تم تدقيقها لتطابق الـ CSS الخاص بك 👇👇👇
  createPropertyCard(property, category, index) {
    const categoryInfo = this.categories[category];
    const card = document.createElement("div");
    card.className = `property-card`; // ✅ مطابق للـ CSS
    card.dataset.filename = property.filename;
    card.style.animationDelay = `${index * 50}ms`;

    const propertyId = property.id || (property.filename ? property.filename.replace(/\.json$/, '') : 'id-not-found');
    const detailPage = `/property/${propertyId}`;
    
    const priceToRender = this.escapeHtml(property.price_display || property.price || "غير محدد");
    const areaToRender = this.escapeHtml(property.area_display || property.area || "غير محددة");
    const descriptionText = property.summary || property.description || 'لا يوجد وصف مختصر.';

    // استخدام نفس بنية الـ HTML والكلاسات من ملف CSS
    card.innerHTML = `
      <div class="property-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="property-logo">
        <div class="property-brand">
          <strong>سمسار طلبك</strong>
          <span class="property-category-badge" style="background: ${categoryInfo.color}; color: var(--color-text-on-primary);">${categoryInfo.icon} ${categoryInfo.label}</span>
        </div>
      </div>
      <h3 class="property-title">${this.escapeHtml(property.title)}</h3>
      <div class="property-details">
        <div class="property-detail">
            <span class="detail-icon">💰</span>
            <span class="detail-label">السعر:</span>
            <span class="detail-value price-highlight">${priceToRender}</span>
        </div>
        <div class="property-detail">
            <span class="detail-icon">📏</span>
            <span class="detail-label">المساحة:</span>
            <span class="detail-value">${areaToRender}</span>
        </div>
        <div class="property-detail">
            <span class="detail-icon">📅</span>
            <span class="detail-label">تاريخ الإضافة:</span>
            <span class="detail-value">${this.escapeHtml(property.date || "غير متوفر")}</span>
        </div>
      </div>
      <div class="property-description">
        <p>${this.escapeHtml(descriptionText)}</p>
      </div>
      <div class="property-footer">
        <a href="${detailPage}" class="view-details-btn">
          <span class="btn-text">عرض التفاصيل الكاملة</span>
          <span class="btn-arrow">←</span>
        </a>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = detailPage;
      }
    });

    return card;
  }

  // ... (باقي الدوال الكاملة كما هي)
}
// ... (باقي الكود)

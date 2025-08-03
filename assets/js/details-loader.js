/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية v4.0)
 * تم التحديث لدعم الروابط القصيرة والفهارس المركزية
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  
  // استخراج الـ ID من الرابط
  const pathParts = window.location.pathname.split('/');
  const propertyId = pathParts[pathParts.length - 1];
  
  if (!propertyId) {
    showError("❌ لم يتم تحديد العقار أو أن الرابط غير صحيح.");
    return;
  }

  try {
    // جلب الفهرس المركزي
    const indexRes = await fetch(`/data/properties_index.json?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`فشل في جلب فهرس العقارات (${indexRes.status})`);
    
    const propertiesIndex = await indexRes.json();
    
    // البحث عن العقار المطلوب
    const propertyInfo = propertiesIndex.find(p => p.id === propertyId);
    
    if (!propertyInfo) {
      throw new Error(`العقار بالرقم ${propertyId} غير موجود في الفهرس`);
    }

    // جلب بيانات العقار
    const res = await fetch(`/${propertyInfo.path}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`فشل في جلب بيانات العقار (${res.status})`);
    
    const propertyData = await res.json();
    
    // عرض التفاصيل
    renderPropertyDetails(propertyData, container);

  } catch (err) {
    console.error("فشل في جلب تفاصيل العقار:", err);
    showError(`❌ حدث خطأ أثناء تحميل بيانات العقار: ${err.message}`);
  }
});

function renderPropertyDetails(prop, container) {
  const whatsapp = prop.whatsapp || "201147758857";
  const pageURL = window.location.href;
  
  const priceToRender = prop.price_display || prop.price || "غير محدد";
  const areaToRender = prop.area_display || prop.area || 'غير محددة';

  container.innerHTML = `
    <div class="property-details-card">
      <header class="details-header">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
        <div class="property-id">رقم العرض: ${prop.id}</div>
        <h1>${prop.title || "تفاصيل العرض"}</h1>
      </header>

      <div class="details-price-container">
        <span class="price-icon">💰</span>
        <span class="price-value">${priceToRender}</span>
      </div>

      <div class="details-grid">
        ${prop.area ? `<div class="detail-item"><span class="detail-icon">📏</span> <span class="detail-label">المساحة:</span> <span class="detail-value">${areaToRender}</span></div>` : ''}
        ${prop.rooms ? `<div class="detail-item"><span class="detail-icon">🛏️</span> <span class="detail-label">الغرف:</span> <span class="detail-value">${prop.rooms}</span></div>` : ''}
        ${prop.bathrooms ? `<div class="detail-item"><span class="detail-icon">🛁</span> <span class="detail-label">الحمامات:</span> <span class="detail-value">${prop.bathrooms}</span></div>` : ''}
        ${prop.floor ? `<div class="detail-item"><span class="detail-icon">🏢</span> <span class="detail-label">الدور:</span> <span class="detail-value">${prop.floor}</span></div>` : ''}
        ${prop.elevator !== undefined ? `<div class="detail-item"><span class="detail-icon">🛗</span> <span class="detail-label">مصعد:</span> <span class="detail-value">${prop.elevator ? 'نعم' : 'لا'}</span></div>` : ''}
        ${prop.garage !== undefined ? `<div class="detail-item"><span class="detail-icon">🚗</span> <span class="detail-label">جراج:</span> <span class="detail-value">${prop.garage ? 'متوفر' : 'غير متوفر'}</span></div>` : ''}
        ${prop.finish ? `<div class="detail-item"><span class="detail-icon">🎨</span> <span class="detail-label">التشطيب:</span> <span class="detail-value">${prop.finish}</span></div>` : ''}
        ${prop.direction ? `<div class="detail-item"><span class="detail-icon">🧭</span> <span class="detail-label">الاتجاه:</span> <span class="detail-value">${prop.direction}</span></div>` : ''}
        ${prop.location ? `<div class="detail-item"><span class="detail-icon">📍</span> <span class="detail-label">الموقع:</span> <span class="detail-value">${prop.location}</span></div>` : ''}
      </div>

      <div class="details-description">
        <h2><span class="section-icon">📝</span> الوصف</h2>
        <p>${prop.description || 'لا يوجد وصف متاح'}</p>
      </div>

      ${prop.more_details ? `
        <div class="details-more">
          <h2><span class="section-icon">📌</span> تفاصيل إضافية</h2>
          <p>${prop.more_details}</p>
        </div>
      ` : ''}

      <div class="details-date">
        <span class="date-icon">📅</span> 
        <strong>تاريخ الإضافة:</strong> ${prop.date || 'غير متوفر'}
      </div>

      <div class="details-actions">
        <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title || '')}" 
           class="whatsapp-btn" target="_blank">
          <span class="btn-icon">💬</span> تواصل عبر واتساب
        </a>
        <button class="copy-btn" onclick="copyToClipboard('${pageURL}')">
          <span class="btn-icon">📤</span> مشاركة الرابط
        </button>
        <a href="/properties.html" class="back-btn">
          <span class="btn-icon">←</span> العودة للقائمة
        </a>
      </div>
    </div>
  `;
}

function showError(message) {
  const container = document.getElementById("property-details");
  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>عذرًا، حدث خطأ</h3>
      <p>${message}</p>
      <div class="error-actions">
        <button class="retry-btn" onclick="window.location.href='/properties.html'">← العودة للقائمة الرئيسية</button>
        <button class="contact-btn" onclick="window.open('tel:+201234567890')">📞 اتصل بنا</button>
      </div>
    </div>
  `;
}

// دالة نسخ الرابط للوحة المفاتيح (يجب أن تكون في النطاق العام)
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
  }).catch(err => {
    console.error('فشل في نسخ الرابط:', err);
    alert('فشل في نسخ الرابط، يرجى المحاولة يدوياً');
  });
};

/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية v5.1 - إصلاحات التصميم النهائية)
 */

// ... (كل الكود العلوي يبقى كما هو بدون تغيير) ...
document.addEventListener("DOMContentLoaded", async function () {
    // ... (كل كود جلب البيانات يبقى كما هو) ...
    try {
        // ... الكود ...
        const propertyData = await propertyRes.json();
        const propertyId = propertyInfo.id; // نحصل على الـ ID من الفهرس

        // ✨ تمرير الـ ID إلى دوال العرض
        updateSeoTags(propertyData, propertyId); 
        renderPropertyDetails(propertyData, container, propertyId);

    } catch (err) {
        // ...
    }
});

function showErrorState(container, message) { /* ... نفس الكود ... */ }

// ✨✨✨ تم تعديل هذه الدالة بشكل نهائي ✨✨✨
function renderPropertyDetails(prop, container, propertyId) { // ✨ استقبلنا الـ ID هنا
  const whatsapp = prop.whatsapp || "201147758857";
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;
  
  const priceToRender = prop.price_display || prop.price || "غير محدد";
  const areaToRender = prop.area_display || prop.area || 'غير محددة';
  const description = prop.description || 'لا يوجد وصف متاح';
  const moreDetails = prop.more_details || '';
  
  container.innerHTML = `
    <header class="details-header">
      <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
      <h1>${prop.title || "تفاصيل العرض"}</h1>
    </header>
    
    <!-- ✨ تم إصلاح عرض رقم العقار -->
    <div class="property-id-badge">رقم العقار: ${propertyId}</div>

    <p class="details-price">💰 ${priceToRender}</p>

    <section class="details-grid">
      <div class="detail-item"><strong>📏 المساحة:</strong> ${areaToRender}</div>
      <div class="detail-item"><strong>🛏️ عدد الغرف:</strong> ${prop.rooms ?? 'غير محدد'}</div>
      <div class="detail-item"><strong>🛁 عدد الحمامات:</strong> ${prop.bathrooms ?? 'غير محدد'}</div>
      <div class="detail-item"><strong>🏢 الدور:</strong> ${prop.floor ?? 'غير محدد'}</div>
      <div class="detail-item"><strong>🛗 مصعد:</strong> ${prop.elevator ? 'نعم' : 'لا'}</div>
      <div class="detail-item"><strong>🚗 جراج:</strong> ${prop.garage ? 'متوفر' : 'غير متوفر'}</div>
      <div class="detail-item"><strong>🎨 التشطيب:</strong> ${prop.finish || 'غير محدد'}</div>
      <div class="detail-item"><strong>🧭 الاتجاه:</strong> ${prop.direction || 'غير محدد'}</div>
    </section>

    <section class="details-description">
      <h2>📝 الوصف</h2>
      <p>${description}</p>
      ${moreDetails ? `<h2>📌 تفاصيل إضافية</h2><p>${moreDetails}</p>` : ''}
    </section>

    <p class="details-date">📅 <strong>تاريخ الإضافة:</strong> ${prop.date || 'غير متوفر'}</p>

    <footer class="details-actions">
      <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title || '')} - رقم العقار: ${propertyId}" 
         target="_blank" class="action-btn whatsapp-btn">
        <span class="btn-icon">💬</span> تواصل عبر واتساب
      </a>
      <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط العرض">
        <span class="btn-icon">📤</span> مشاركة الرابط
      </button>
      <a href="/properties-filtered.html" class="action-btn back-btn">
        <span class="btn-icon">←</span> العودة للقائمة
      </a>
    </footer>
    
    <!-- ✨ تم إصلاح مشكلة ظهور رسالة النسخ -->
    <div id="copy-toast" class="toast" style="visibility: hidden; opacity: 0;">تم نسخ الرابط بنجاح ✓</div>
  `;
}

// ✨✨✨ تم تعديل هذه الدالة بشكل نهائي ✨✨✨
function updateSeoTags(prop, propertyId) { // ✨ استقبلنا الـ ID هنا
  const priceForDisplay = prop.price_display || prop.price || 'غير محدد';
  const areaForDisplay = prop.area_display || prop.area || 'غير محددة';
  const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  const description = `تفاصيل عقار: ${prop.title || ''}. المساحة: ${areaForDisplay}، السعر: ${priceForDisplay}. ${(prop.description || '').substring(0, 120)}...`;
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;
  document.title = pageTitle;
  // ... باقي كود السيو الخاص بك
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    if (toast) {
      // ✨ تم تعديل طريقة الإظهار لتعمل مع الإصلاح
      toast.style.visibility = 'visible';
      toast.style.opacity = '1';
      setTimeout(() => { 
        toast.style.visibility = 'hidden';
        toast.style.opacity = '0';
      }, 3000);
    }
  }).catch(err => {
    console.error('فشل في نسخ الرابط:', err);
    alert('فشل في نسخ الرابط');
  });
}

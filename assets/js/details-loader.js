/**
 * دالة العرض النهائية (v8.1 - مع إصلاح عرض الرقم المرجعي)
 */
function renderPropertyDetails(prop, container, propertyId) {
  // --- البيانات الأساسية ---
  const whatsapp = prop.whatsapp || "201147758857";
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;
  
  // --- البيانات للعرض ---
  const priceToRender = prop.price_display || prop.price || "غير محدد";
  const areaToRender = prop.area_display || prop.area || 'غير محددة';
  const description = prop.description || 'لا يوجد وصف';
  const moreDetails = prop.more_details || '';
  
  // ✨✨✨ الإصلاح الحاسم هنا ✨✨✨
  // نعرض الرقم المرجعي (ref_id) من بيانات العقار، وإذا لم يكن موجودًا، نعرض الـ ID من الرابط كخيار احتياطي
  const displayId = prop.ref_id || propertyId;

  // --- بناء الهيكل ---
  container.innerHTML = `
    <header class="details-header">
      <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
      <h1>${prop.title || "تفاصيل العرض"}</h1>
    </header>

    <!-- ✨ تم استخدام المتغير المصحح هنا -->
    <div class="property-id-badge">رقم العقار: ${displayId}</div>

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
       <!-- ✨ تم تحديث رسالة واتساب لتستخدم الرقم المرجعي أيضًا -->
      <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title || '')} - رقم العقار المرجعي: ${displayId}" target="_blank" class="action-btn whatsapp-btn">
        تواصل عبر واتساب
      </a>
      <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط العرض">
        📤
      </button>
       <a href="/properties-filtered.html" class="action-btn back-btn">
         ← العودة للقائمة
      </a>
    </footer>
    
    <div id="copy-toast" class="toast" style="visibility: hidden; opacity: 0; transition: all 0.3s ease;">تم نسخ الرابط بنجاح ✓</div>
  `;
}

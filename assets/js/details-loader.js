/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية الكاملة v6.0)
 * تتضمن هذه النسخة التصميم الكامل والوظائف التفاعلية.
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  if (!container) {
    console.error("خطأ فادح: الحاوية #property-details غير موجودة.");
    return;
  }

  let propertyId = null;
  try {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if ((parts[0] === 'property' || parts[0] === 'request') && parts.length > 1) {
      propertyId = parts[1];
    }
  } catch (e) {
    showErrorState(container, "الرابط المستخدم غير صالح.");
    return;
  }

  if (!propertyId) {
    showErrorState(container, `لم يتم تحديد مُعرّف في الرابط.`);
    return;
  }
  
  try {
    const indexType = window.location.pathname.includes('/property/') ? 'properties' : 'requests';
    const indexUrl = `/data/${indexType}_index.json`;
    
    const indexRes = await fetch(`${indexUrl}?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`فشل تحميل فهرس البيانات (خطأ ${indexRes.status}).`);

    const masterIndex = await indexRes.json();
    const propertyInfo = masterIndex.find(p => String(p.id) === String(propertyId));

    if (!propertyInfo) {
      throw new Error(`العقار بالرقم "${propertyId}" غير موجود في الفهرس.`);
    }

    const propertyRes = await fetch(`${propertyInfo.path}?t=${Date.now()}`);
    if (!propertyRes.ok) throw new Error(`فشل تحميل بيانات العقار.`);
    
    const propertyData = await propertyRes.json();
    
    // استدعاء الدوال الكاملة والنهائية
    updateSeoTags_Full(propertyData, propertyId); 
    renderPropertyDetails_Full(propertyData, container, propertyId);

  } catch (err) {
    console.error("Error in data fetching chain:", err);
    showErrorState(container, err.message);
  }
});

// --- الدوال المساعدة ---

function showErrorState(container, message) {
  container.innerHTML = `
    <div class="error-state" style="padding: 40px; text-align: center;">
      <div class="error-icon" style="font-size: 3rem;">⚠️</div>
      <h3>حدث خطأ</h3>
      <p style="color: #ccc;">${message}</p>
      <a href="/" style="color:white; text-decoration: none; background: #333; padding: 10px 20px; border-radius: 20px; margin-top: 20px; display: inline-block;">العودة للرئيسية</a>
    </div>
  `;
}

/**
 * ✨✨✨ دالة نسخ الرابط النهائية ✨✨✨
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    if (toast) {
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

/**
 * ✨✨✨ دالة العرض النهائية والكاملة ✨✨✨
 */
function renderPropertyDetails_Full(prop, container, propertyId) {
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
    
    <div id="copy-toast" class="toast" style="visibility: hidden; opacity: 0; transition: visibility 0s 0.3s, opacity 0.3s linear;">تم نسخ الرابط بنجاح ✓</div>
  `;
}


/**
 * ✨✨✨ دالة SEO النهائية والكاملة ✨✨✨
 */
function updateSeoTags_Full(prop, propertyId) {
    const priceForDisplay = prop.price_display || prop.price || 'غير محدد';
    const areaForDisplay = prop.area_display || prop.area || 'غير محددة';

    const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
    const description = `تفاصيل عقار: ${prop.title || ''}. المساحة: ${areaForDisplay}، السعر: ${priceForDisplay}. ${(prop.description || '').substring(0, 160)}...`;
    
    const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;

    document.title = pageTitle;
    
    // تحديث الوسوم الموجودة أو إنشاؤها إذا لم تكن موجودة
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta');
        descriptionMeta.name = 'description';
        document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.content = description;

    let ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (!ogTitleMeta) {
        ogTitleMeta = document.createElement('meta');
        ogTitleMeta.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleMeta);
    }
    ogTitleMeta.content = pageTitle;
    
    // ... يمكنك إضافة باقي وسوم الميتا هنا بنفس الطريقة (og:description, og:url, etc.)
}

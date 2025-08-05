/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية والمدمجة v7.0)
 * يجمع هذا الكود بين محرك جلب البيانات الجديد والتصميم الأصلي الكامل.
 */

// --- الجزء الأول: محرك جلب البيانات الجديد والناجح ---
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  if (!container) { return; }

  // ✨ إصلاح مشكلة الحجم الكبير عن طريق تحديد عرض أقصى للحاوية
  container.style.maxWidth = '960px';
  container.style.margin = '20px auto';
  container.style.padding = '0 15px';

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
    if (!indexRes.ok) throw new Error(`فشل تحميل فهرس البيانات.`);

    const masterIndex = await indexRes.json();
    const propertyInfo = masterIndex.find(p => String(p.id) === String(propertyId));

    if (!propertyInfo) throw new Error(`العقار بالرقم "${propertyId}" غير موجود في الفهرس.`);

    const propertyRes = await fetch(`${propertyInfo.path}?t=${Date.now()}`);
    if (!propertyRes.ok) throw new Error(`فشل تحميل بيانات العقار.`);
    
    const propertyData = await propertyRes.json();
    
    // استدعاء دوال العرض والتصميم الأصلية والكاملة
    updateSeoTags(propertyData, propertyId); 
    renderPropertyDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Error in data fetching chain:", err);
    showErrorState(container, err.message);
  }
});

// --- الجزء الثاني: دوال العرض والتصميم القديمة والكاملة الخاصة بك ---

/**
 * SEO: تحديث وسوم SEO و JSON-LD ديناميكيًا (من كودك الأصلي)
 */
function updateSeoTags(prop, propertyId) {
  const priceForDisplay = prop.price_display || prop.price || 'غير محدد';
  const areaForDisplay = prop.area_display || prop.area || 'غير محددة';
  const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  const description = `تفاصيل عقار: ${prop.title || ''}. المساحة: ${areaForDisplay}، السعر: ${priceForDisplay}. ${(prop.description || '').substring(0, 160)}...`;
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;

  document.title = pageTitle;
  
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageURL);
  
  const schemaPrice = (prop.price_min !== undefined) ? prop.price_min : (prop.price || "0").replace(/[^0-9]/g, '');
  const schemaArea = (prop.area_min !== undefined) ? prop.area_min : (prop.area || "0").replace(/[^0-9]/g, '');

  const schema = {
    "@context": "https://schema.org", "@type": "RealEstateListing", "name": prop.title,
    "description": prop.description || prop.more_details, "url": pageURL,
    "offers": { "@type": "Offer", "price": schemaPrice, "priceCurrency": "EGP" },
    "floorSize": { "@type": "QuantitativeValue", "value": schemaArea, "unitText": "متر مربع" },
    "numberOfRooms": prop.rooms, "numberOfBathroomsTotal": prop.bathrooms,
    "address": prop.location || "مدينة نصر, القاهرة, مصر", "datePosted": prop.date,
  };
  
  let schemaScript = document.getElementById('schema-json');
  if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'schema-json';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify(schema, null, 2);
}

/**
 * عرض محتوى العقار بالتصميم الكامل (من كودك الأصلي)
 */
function renderPropertyDetails(prop, container, propertyId) {
  const whatsapp = prop.whatsapp || "201147758857";
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;
  const priceToRender = prop.price_display || prop.price || "غير محدد";
  const areaToRender = prop.area_display || prop.area || 'غير محددة';

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
      <p>${prop.description || 'لا يوجد وصف'}</p>
      ${prop.more_details ? `<h2>📌 تفاصيل إضافية</h2><p>${prop.more_details}</p>` : ''}
    </section>
    <p class="details-date">📅 <strong>تاريخ الإضافة:</strong> ${prop.date || 'غير متوفر'}</p>
    <footer class="details-actions">
      <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title || '')} - رقم العقار: ${propertyId}" target="_blank" class="action-btn whatsapp-btn">
        تواصل عبر واتساب
      </a>
      <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط العرض">
        📤
      </button>
       <a href="/properties-filtered.html" class="action-btn back-btn">
         ← العودة للقائمة
      </a>
    </footer>
    <div id="copy-toast" class="toast">تم نسخ الرابط بنجاح ✓</div>
  `;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => { toast.classList.remove('show'); }, 2000);
    }
  });
}

function showErrorState(container, message) {
    container.innerHTML = `<p class="error-message">❌ ${message}</p>`;
}

/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية الكاملة v2.1 - تفعيل الروابط القصيرة)
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  
  // ✨ التعديل الأهم: قراءة الـ ID من الرابط القصير
  const pathParts = window.location.pathname.split('/');
  const propertyId = parseInt(pathParts[pathParts.length - 1], 10);

  if (!propertyId || isNaN(propertyId)) {
    container.innerHTML = `<p class="error-message">❌ لم يتم تحديد العقار أو أن الرابط غير صحيح.</p>`;
    return;
  }

  try {
    // ✨ التعديل: جلب الفهرس المركزي أولاً
    const indexRes = await fetch(`/data/properties_index.json`);
    if (!indexRes.ok) throw new Error(`Failed to fetch properties index.`);
    const propertiesIndex = await indexRes.json();

    // البحث عن مسار الملف الصحيح باستخدام الـ ID
    const propertyInfo = propertiesIndex.find(p => p.id === propertyId);

    if (!propertyInfo || !propertyInfo.path) {
      throw new Error(`Property with ID ${propertyId} not found in index.`);
    }

    // جلب ملف JSON الفعلي للعقار
    const res = await fetch(propertyInfo.path);
    if (!res.ok) throw new Error(`Failed to fetch property data: ${res.status}`);
    const propertyData = await res.json();
    
    updateSeoTags(propertyData);
    renderPropertyDetails(propertyData, container);

  } catch (err) {
    console.error("فشل في جلب تفاصيل العقار:", err);
    container.innerHTML = `<p class="error-message">❌ حدث خطأ أثناء تحميل بيانات العقار. قد يكون العقار غير موجود.</p>`;
  }
});

/**
 * SEO: تحديث وسوم SEO و JSON-LD ديناميكيًا مع دعم القوام القديم والجديد
 */
function updateSeoTags(prop) {
  const priceForDisplay = prop.price_display || prop.price || 'غير محدد';
  const areaForDisplay = prop.area_display || prop.area || 'غير محددة';

  const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  const description = `تفاصيل عقار: ${prop.title || ''}. المساحة: ${areaForDisplay}، السعر: ${priceForDisplay}. ${(prop.description || '').substring(0, 120)}...`;
  
  const pageURL = new URL(`/property/${prop.id}`, window.location.origin).href;

  document.title = pageTitle;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute('content', description);

  const ogTitleMeta = document.querySelector('meta[property="og:title"]');
  if (ogTitleMeta) ogTitleMeta.setAttribute('content', pageTitle);
  const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
  if (ogDescriptionMeta) ogDescriptionMeta.setAttribute('content', description);
  const ogUrlMeta = document.querySelector('meta[property="og:url"]');
  if (ogUrlMeta) ogUrlMeta.setAttribute('content', pageURL);
  
  const schemaPrice = (prop.price_min !== undefined && prop.price_min > 0) 
    ? prop.price_min 
    : (prop.price || "0").replace(/[^0-9]/g, '');

  const schemaArea = (prop.area_min !== undefined && prop.area_min > 0) 
    ? prop.area_min 
    : (prop.area || "0").replace(/[^0-9]/g, '');

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": prop.title,
    "description": prop.description || prop.more_details,
    "url": pageURL,
    "offers": {
      "@type": "Offer",
      "price": schemaPrice,
      "priceCurrency": "EGP"
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": schemaArea,
      "unitText": "متر مربع"
    },
    "numberOfRooms": prop.rooms,
    "numberOfBathroomsTotal": prop.bathrooms,
    "address": prop.location || "مدينة نصر, القاهرة, مصر",
    "datePosted": prop.date,
  };
  const schemaScript = document.getElementById('schema-json');
  if (schemaScript) {
    schemaScript.textContent = JSON.stringify(schema, null, 2);
  }
}

/**
 * عرض محتوى العقار مع دعم القوام القديم والجديد
 */
function renderPropertyDetails(prop, container) {
  const whatsapp = prop.whatsapp || "201147758857";
  const pageURL = new URL(`/property/${prop.id}`, window.location.origin).href;
  
  const priceToRender = prop.price_display || prop.price || "غير محدد";
  const areaToRender = prop.area_display || prop.area || 'غير محددة';

  container.innerHTML = `
    <header class="details-header">
      <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
      <h1>${prop.title || "تفاصيل العرض"}</h1>
    </header>

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
      <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title || '')}" target="_blank" class="action-btn whatsapp-btn">
        تواصل عبر واتساب
      </a>
      <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط العرض">
        📤
      </button>
    </footer>
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

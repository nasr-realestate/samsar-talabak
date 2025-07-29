// SEO Improvement: الكود بأكمله مُعاد هيكلته ليدعم SEO والتوافق مع الإصدارات السابقة من JSON
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");

  if (!category || !file) {
    container.innerHTML = `<p class="error-message">❌ لم يتم تحديد العقار.</p>`;
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/properties/${category}/${file}`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const propertyData = await res.json();
    
    // استدعاء الدوال المحدثة
    updateSeoTags(propertyData);
    renderPropertyDetails(propertyData, container);

  } catch (err) {
    console.error("فشل في جلب تفاصيل العقار:", err);
    container.innerHTML = `<p class="error-message">❌ حدث خطأ أثناء تحميل بيانات العقار.</p>`;
  }
});

/**
 * SEO: تحديث وسوم SEO و JSON-LD ديناميكيًا مع دعم القوام القديم والجديد
 * @param {object} prop - بيانات العقار
 */
function updateSeoTags(prop) {
  // تحديد القيم التي ستظهر في النصوص (مثل وصف الميتا)
  const priceForDisplay = prop.price_display || prop.price || 'غير محدد';
  const areaForDisplay = prop.area_display || prop.area || 'غير محددة';

  const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  const description = `تفاصيل عقار: ${prop.title || ''}. المساحة: ${areaForDisplay}، السعر: ${priceForDisplay}. ${(prop.description || '').substring(0, 120)}...`;
  const pageURL = window.location.href;

  // 1. تحديث عنوان الصفحة والوصف
  document.title = pageTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', description);

  // 2. تحديث وسوم Open Graph (لواتساب)
  document.querySelector('meta[property="og:title"]').setAttribute('content', pageTitle);
  document.querySelector('meta[property="og:description"]').setAttribute('content', description);
  document.querySelector('meta[property="og:url"]').setAttribute('content', pageURL);
  
  // 3. ✨ منطق ذكي لتحديد القيم الرقمية لبيانات Schema.org
  // يبحث عن الحقل الرقمي الجديد، وإذا لم يجده، يستخدم الحقل النصي القديم
  const schemaPrice = (prop.price_min !== undefined && prop.price_min > 0) 
    ? prop.price_min 
    : (prop.price || "0").replace(/[^0-9]/g, '');

  const schemaArea = (prop.area_min !== undefined && prop.area_min > 0) 
    ? prop.area_min 
    : (prop.area || "0").replace(/[^0-9]/g, '');

  // 4. ملء بيانات Schema.org بالقيم الدقيقة
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": prop.title,
    "description": prop.description || prop.more_details,
    "url": pageURL,
    "offers": {
      "@type": "Offer",
      "price": schemaPrice,
      "priceCurrency": "EGP" // يمكنك تغييرها
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
 * @param {object} prop - بيانات العقار
 * @param {HTMLElement} container - الحاوية لعرض المحتوى بداخلها
 */
function renderPropertyDetails(prop, container) {
  const whatsapp = prop.whatsapp || "201147758857";
  const pageURL = window.location.href;
  
  // ✨ منطق ذكي لتحديد القيم التي ستظهر للمستخدم
  // يبحث عن حقل العرض الجديد، وإذا لم يجده، يستخدم الحقل القديم
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
      <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title)}" target="_blank" class="action-btn whatsapp-btn">
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

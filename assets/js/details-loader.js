/**
 * نظام تحميل تفاصيل العقار (الإصدار v8.2 - مع صور المشاركة الآمنة)
 */

// --- الجزء الأول: محرك جلب البيانات الناجح ---
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  if (!container) { 
    console.error("خطأ فادح: الحاوية #property-details غير موجودة في الصفحة.");
    return; 
  }
  // ... (باقي الكود العلوي يبقى كما هو)
  try {
    // ... (كود جلب البيانات يبقى كما هو)
    const propertyData = await propertyRes.json();
    
    updateSeoTags(propertyData, propertyId); 
    renderPropertyDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Error in data fetching chain:", err);
    showErrorState(container, err.message);
  }
});

// --- الجزء الثاني: الدوال النهائية مع التعديل ---

function showErrorState(container, message) { /* ... */ }
function copyToClipboard(text) { /* ... */ }

// 👇👇👇 هذه هي الدالة الوحيدة التي تم تعديلها 👇👇👇
function updateSeoTags(prop, propertyId) {
  const priceForDisplay = prop.price_display || prop.price || 'غير محدد';
  const areaForDisplay = prop.area_display || prop.area || 'غير محددة';
  const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  const description = `تفاصيل عقار: ${prop.title || ''}. المساحة: ${areaForDisplay}، السعر: ${priceForDisplay}. ${(prop.description || '').substring(0, 160)}...`;
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;

  // ✨✨✨ الإصلاح الحاسم والآمن هنا ✨✨✨
  // استخدام صورة المشاركة من البطاقة إذا كانت موجودة، وإلا استخدم الصورة الافتراضية
  const shareImage = prop.share_image || 'https://i.postimg.cc/sfh9DRb0/samsar-logo-enhanced.png';

  document.title = pageTitle;
  
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageURL);
  
  // ✨ تحديث وسم صورة المشاركة بالصورة الجديدة
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', shareImage);
  
  // (باقي كود Schema.org يبقى كما هو)
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

function renderPropertyDetails(prop, container, propertyId) {
  // (هذه الدالة تبقى كما هي في نسختها الناجحة الكاملة)
  const whatsapp = prop.whatsapp || "201147758857";
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;
  const priceToRender = prop.price_display || prop.price || "غير محدد";
  const areaToRender = prop.area_display || prop.area || 'غير محددة';
  const displayId = prop.ref_id || propertyId;

  container.innerHTML = `
    <header class="details-header">
      <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
      <h1>${prop.title || "تفاصيل العرض"}</h1>
    </header>
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
      <p>${prop.description || 'لا يوجد وصف'}</p>
      ${prop.more_details ? `<h2>📌 تفاصيل إضافية</h2><p>${prop.more_details}</p>` : ''}
    </section>
    <p class="details-date">📅 <strong>تاريخ الإضافة:</strong> ${prop.date || 'غير متوفر'}</p>
    <footer class="details-actions">
      <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title || '')} - رقم العقار: ${displayId}" target="_blank" class="action-btn whatsapp-btn">
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

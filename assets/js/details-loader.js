/**
 * نظام تحميل تفاصيل العقار (الإصدار 10.1 - مع صور Cloudinary ديناميكية احترافية)
 * التحسينات: دمج صورة العقار داخل بطاقة المشاركة، إضافة خط احتياطي، تحسينات طفيفة.
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  if (!container) { 
    console.error("خطأ فادح: الحاوية #property-details غير موجودة في الصفحة.");
    return; 
  }

  // (يمكنك إزالة هذه الأسطر إذا كان التنسيق يتم عبر CSS)
  container.style.maxWidth = '960px';
  container.style.margin = '20px auto';
  container.style.padding = '0 15px';

  let propertyId = null;
  try {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'property' && parts.length > 1) {
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
    // استخدام ?t= لمنع التخزين المؤقت (caching) لملف الفهرس
    const indexUrl = `/data/properties_index.json`;
    const indexRes = await fetch(`${indexUrl}?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`فشل تحميل فهرس البيانات (خطأ ${indexRes.status}).`);

    const masterIndex = await indexRes.json();
    const propertyInfo = masterIndex.find(p => String(p.id) === String(propertyId));
    if (!propertyInfo) throw new Error(`العقار بالرقم "${propertyId}" غير موجود في الفهرس.`);

    const propertyRes = await fetch(`${propertyInfo.path}?t=${Date.now()}`);
    if (!propertyRes.ok) throw new Error(`فشل تحميل بيانات العقار.`);
    
    const propertyData = await propertyRes.json();
    
    updateSeoTags(propertyData, propertyId); 
    renderPropertyDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Error in data fetching chain:", err);
    showErrorState(container, err.message);
  }
});

function showErrorState(container, message) {
    container.innerHTML = `<div class="error-state" style="padding: 40px; text-align: center;"><h3>❌ خطأ</h3><p>${message}</p></div>`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    if (toast) {
      toast.style.visibility = 'visible';
      toast.style.opacity = '1';
      setTimeout(() => { 
        toast.style.visibility = 'hidden';
        toast.style.opacity = '0';
      }, 2500);
    }
  });
}

// Helper function to encode string to Base64 for the Cloudinary fetch transformation
function btoaSafe(string) {
    return window.btoa(unescape(encodeURIComponent(string)));
}

// 👇👇👇 هذه هي الدالة النهائية والمحسّنة 👇👇👇
function updateSeoTags(prop, propertyId) {
  const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  const description = `تفاصيل عقار: ${prop.title || ''}. ${(prop.summary || prop.description || '').substring(0, 160)}...`;
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;

  // --- ✨✨✨ منطق Cloudinary لتوليد الصور (نسخة احترافية) ✨✨✨

  // 1. بياناتك من حساب Cloudinary
  const CLOUD_NAME = "dmm4lqbcf";
  const BASE_IMAGE_PUBLIC_ID = "og-background-template";
  const DEFAULT_PROPERTY_IMAGE_ID = "default_property_image"; // <-- ارفع صورة افتراضية بهذا الاسم

  // 2. تجهيز النصوص للكتابة على الصورة
  const titleText = (prop.title || '').substring(0, 50);
  const priceText = prop.price_clean || prop.price_display || '';
  const areaText = prop.area_clean || prop.area_display || '';

  // 3. ✨ جديد: تجهيز طبقة صورة العقار نفسه
  // نستخدم أول صورة من 'images' أو صورة افتراضية من Cloudinary
  const propertyImageURL = (prop.images && prop.images.length > 0) 
      ? new URL(prop.images[0], window.location.origin).href
      : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${DEFAULT_PROPERTY_IMAGE_ID}`;
  
  // تحويلة Cloudinary لجلب الصورة وتغيير حجمها ووضعها في المكان المناسب
  const imageOverlay = `l_fetch:${btoaSafe(propertyImageURL)}/w_1100,h_600,c_fill,g_north_west,x_50,y_50`;

  // 4. بناء رابط الصورة الديناميكي من Cloudinary
  const autoShareImage = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
    `${imageOverlay}/` + // <-- إضافة طبقة صورة العقار
    `l_text:Tajawal_64_bold_Arial_64_bold:${encodeURIComponent(titleText)},co_rgb:ffffff,w_1100,c_fit,g_south_east,x_50,y_200/` +
    `l_text:Tajawal_48_bold_Arial_48_bold:${encodeURIComponent(priceText)},co_rgb:00ff88,w_500,c_fit,g_south_west,x_50,y_120/` +
    `l_text:Tajawal_48_bold_Arial_48_bold:${encodeURIComponent(areaText)},co_rgb:ffffff,w_500,c_fit,g_south_west,x_50,y_50/` +
    `${BASE_IMAGE_PUBLIC_ID}.png`;

  const shareImage = prop.share_image || autoShareImage;
  
  document.title = pageTitle;
  
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageURL);
  
  let ogImageMeta = document.querySelector('meta[property="og:image"]');
  if (!ogImageMeta) {
      ogImageMeta = document.createElement('meta');
      ogImageMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageMeta);
  }
  ogImageMeta.setAttribute('content', shareImage);
}

// (دالة renderPropertyDetails تبقى كما هي تمامًا)
function renderPropertyDetails(prop, container, propertyId) {
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

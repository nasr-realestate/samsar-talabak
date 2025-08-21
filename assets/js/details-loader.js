/**
 * نظام تحميل تفاصيل العقار (الإصدار النهائي v10.0 - مع صور Cloudinary الديناميكية)
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  if (!container) { 
    console.error("خطأ فادح: الحاوية #property-details غير موجودة في الصفحة.");
    return; 
  }

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

// 👇👇👇 هذه هي الدالة النهائية مع كل بياناتك الصحيحة 👇👇👇
function updateSeoTags(prop, propertyId) {
  const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  const description = `تفاصيل عقار: ${prop.title || ''}. ${(prop.summary || prop.description || '').substring(0, 160)}...`;
  const pageURL = new URL(`/property/${propertyId}`, window.location.origin).href;

  // --- ✨✨✨ منطق Cloudinary لتوليد الصور (بالبيانات الصحيحة) ✨✨✨

  // 1. بياناتك من حساب Cloudinary
  const CLOUD_NAME = "dmm4lqbcf";
  const BASE_IMAGE_PUBLIC_ID = "og-background-template";

  // 2. تجهيز النصوص للكتابة على الصورة
  const titleText = (prop.title || '').substring(0, 50);
  const priceText = prop.price_clean || prop.price_display || '';
  const areaText = prop.area_clean || prop.area_display || '';

  // 3. بناء رابط الصورة الديناميكي من Cloudinary
  const autoShareImage = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
    `l_text:Tajawal_64_bold:${encodeURIComponent(titleText)},co_rgb:00ff88,w_1100,c_fit,g_north_east,x_50,y_50/` +
    `l_text:Tajawal_48_bold:${encodeURIComponent(priceText)},co_rgb:ffffff,w_500,c_fit,g_south_west,x_50,y_120/` +
    `l_text:Tajawal_48_bold:${encodeURIComponent(areaText)},co_rgb:ffffff,w_500,c_fit,g_south_west,x_50,y_50/` +
    `${BASE_IMAGE_PUBLIC_ID}.png`; // ✨ تأكد من امتداد الملف الصحيح (.png)

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
  
  // (باقي كود Schema.org يبقى كما هو)
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

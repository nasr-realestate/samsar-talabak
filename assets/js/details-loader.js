/**
 * نظام تحميل تفاصيل العقار (النسخة الناجحة والمستقرة v5.0)
 * هذه النسخة تركز على جلب البيانات بنجاح مع عرض مبسط.
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  if (!container) {
    console.error("خطأ فادح: الحاوية #property-details غير موجودة.");
    return;
  }

  // --- الخطوة 1: استخراج الـ ID من الرابط (الطريقة المضمونة) ---
  let propertyId = null;
  try {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean); // مثال: ["property", "shqa-ahly-fursan-1"]
    if ((parts[0] === 'property' || parts[0] === 'request') && parts.length > 1) {
      propertyId = parts[1];
    }
  } catch (e) {
    showErrorState(container, "الرابط المستخدم غير صالح.");
    return;
  }

  if (!propertyId) {
    showErrorState(container, `لم يتم تحديد مُعرّف في الرابط. المسار الحالي: ${window.location.pathname}`);
    return;
  }
  
  // --- الخطوة 2: جلب البيانات (العملية الناجحة) ---
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
    if (!propertyRes.ok) throw new Error(`فشل تحميل بيانات العقار من المسار ${propertyInfo.path}.`);
    
    const propertyData = await propertyRes.json();
    
    // --- الخطوة 3: عرض البيانات (باستخدام دوال مبسطة ومضمونة) ---
    updateSeoTags_Simple(propertyData); 
    renderPropertyDetails_Simple(propertyData, container, propertyId);

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
 * دالة عرض مبسطة جدًا لضمان عدم وجود أخطاء في التصميم
 */
function renderPropertyDetails_Simple(prop, container, propertyId) {
  const title = prop.title || "تفاصيل العرض";
  const description = prop.description || "لا يوجد وصف متاح.";
  const price = prop.price || "السعر غير محدد";

  container.style.cssText = "padding: 20px; color: white; max-width: 800px; margin: auto;";
  container.innerHTML = `
    <h1 style="color: #00ff88; border-bottom: 2px solid #333; padding-bottom: 10px;">${title}</h1>
    <p style="font-size: 1.2rem;"><strong>رقم العقار:</strong> ${propertyId}</p>
    <p style="font-size: 1.5rem; color: #00ccff;"><strong>السعر:</strong> ${price}</p>
    <h3 style="margin-top: 30px; color: #00ff88;">الوصف:</h3>
    <p>${description}</p>
  `;
}

/**
 * دالة SEO مبسطة
 */
function updateSeoTags_Simple(prop) {
  document.title = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
}

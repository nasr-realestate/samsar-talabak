/**
 * نظام تحميل تفاصيل الطلب (الإصدار النهائي والاحترافي v8.0)
 * هذا الكود هو النسخة الموحدة والمتوافقة مع نظام العروض الناجح.
 */

// --- الجزء الأول: محرك جلب البيانات الموحد والناجح ---
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details");
  if (!container) { 
    console.error("خطأ فادح: الحاوية #request-details غير موجودة في الصفحة.");
    return; 
  }

  // تطبيق نمط لضمان عدم كون الصفحة كبيرة جدًا (يمكنك تعديله أو حذفه إذا كان لديك CSS خاص)
  container.style.maxWidth = '960px';
  container.style.margin = '20px auto';
  container.style.padding = '0 15px';

  let requestId = null;
  try {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'request' && parts.length > 1) {
      requestId = parts[1];
    }
  } catch (e) {
    showErrorState(container, "الرابط المستخدم غير صالح.");
    return;
  }

  if (!requestId) {
    showErrorState(container, `لم يتم تحديد مُعرّف الطلب في الرابط.`);
    return;
  }
  
  try {
    const indexUrl = `/data/requests_index.json`;
    
    const indexRes = await fetch(`${indexUrl}?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`فشل تحميل فهرس الطلبات (خطأ ${indexRes.status}).`);

    const masterIndex = await indexRes.json();
    const requestInfo = masterIndex.find(r => String(r.id) === String(requestId));

    if (!requestInfo) {
      throw new Error(`الطلب بالرقم "${requestId}" غير موجود في الفهرس.`);
    }

    const requestRes = await fetch(`${requestInfo.path}?t=${Date.now()}`);
    if (!requestRes.ok) throw new Error(`فشل تحميل بيانات الطلب.`);
    
    const requestData = await requestRes.json();
    
    updateSeoTags(requestData, requestId); 
    renderRequestDetails(requestData, container, requestId);

  } catch (err) {
    console.error("Error in data fetching chain:", err);
    showErrorState(container, err.message);
  }
});


// --- الجزء الثاني: الدوال النهائية والاحترافية (مكيفة للطلبات) ---

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

function updateSeoTags(req, requestId) {
  const budgetForDisplay = req.budget_display || req.budget || 'غير محددة';
  const areaForDisplay = req.area_display || req.area || 'غير محددة';
  const pageTitle = `${req.title || 'طلب عقاري'} - سمسار طلبك`;
  const description = `تفاصيل طلب عقاري: ${req.title || ''}. الميزانية: ${budgetForDisplay}، المساحة المطلوبة: ${areaForDisplay}. ${(req.description || '').substring(0, 160)}...`;
  const pageURL = new URL(`/request/${requestId}`, window.location.origin).href;

  document.title = pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageURL);
}

function renderRequestDetails(req, container, requestId) {
  const whatsapp = req.whatsapp || "201147758857";
  const pageURL = new URL(`/request/${requestId}`, window.location.origin).href;
  const budgetToRender = req.budget_display || req.budget || "غير محددة";
  const areaToRender = req.area_display || req.area || 'غير محددة';
  const displayId = req.ref_id || requestId;

  container.innerHTML = `
    <header class="details-header">
      <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
      <h1>${req.title || "تفاصيل الطلب"}</h1>
    </header>
    <div class="property-id-badge">رقم الطلب: ${displayId}</div>
    <p class="details-price">💰 ${budgetToRender}</p>
    <section class="details-grid">
      <div class="detail-item"><strong>📏 المساحة المطلوبة:</strong> ${areaToRender}</div>
      <div class="detail-item"><strong>🛏️ عدد الغرف:</strong> ${req.rooms ?? 'غير محدد'}</div>
      <div class="detail-item"><strong>🛁 عدد الحمامات:</strong> ${req.bathrooms ?? 'غير محدد'}</div>
      <div class="detail-item"><strong>🏢 الدور:</strong> ${req.floor ?? 'غير محدد'}</div>
      <div class="detail-item"><strong>🛗 مصعد:</strong> ${req.elevator ? 'ضروري' : 'غير ضروري'}</div>
      <div class="detail-item"><strong>🚗 جراج:</strong> ${req.garage ? 'يفضّل وجوده' : 'غير مهم'}</div>
      <div class="detail-item"><strong>🎨 التشطيب:</strong> ${req.finish || 'غير محدد'}</div>
    </section>
    <section class="details-description">
      <h2>📝 التفاصيل</h2>
      <p>${req.description || 'لا يوجد وصف'}</p>
      ${req.more_details ? `<h2>📌 تفاصيل إضافية</h2><p>${req.more_details}</p>` : ''}
    </section>
    <p class="details-date">📅 <strong>تاريخ الإضافة:</strong> ${req.date || 'غير متوفر'}</p>
    <footer class="details-actions">
      <a href="https://wa.me/${whatsapp}?text=أرى طلبك بعنوان: ${encodeURIComponent(req.title || '')} - رقم الطلب: ${displayId}" target="_blank" class="action-btn whatsapp-btn">
        لدي عرض مناسب
      </a>
      <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط الطلب">
        📤
      </button>
       <a href="/requests-filtered.html" class="action-btn back-btn">
         ← العودة للقائمة
      </a>
    </footer>
    <div id="copy-toast" class="toast" style="visibility: hidden; opacity: 0; transition: all 0.3s ease;">تم نسخ الرابط بنجاح ✓</div>
  `;
}

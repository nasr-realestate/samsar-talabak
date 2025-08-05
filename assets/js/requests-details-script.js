/**
 * نظام تحميل تفاصيل الطلب (الإصدار النهائي والمحدث v8.0)
 * هذا الكود متوافق مع نظام الروابط القصيرة والفهارس التلقائية.
 */

// --- الجزء الأول: محرك جلب البيانات الجديد والناجح ---
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details");
  if (!container) { 
    console.error("خطأ فادح: الحاوية #request-details غير موجودة في الصفحة.");
    return; 
  }

  // تطبيق نمط لضمان عدم كون الصفحة كبيرة جدًا
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
    // جلب الفهرس الرئيسي للطلبات
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
    
    // استدعاء دوال العرض والتصميم النهائية والكاملة
    updateSeoTags(requestData, requestId); 
    renderRequestDetails(requestData, container, requestId);

  } catch (err) {
    console.error("Error in data fetching chain:", err);
    showErrorState(container, err.message);
  }
});


// --- الجزء الثاني: دوال العرض والتصميم الكاملة الخاصة بك مع التحسينات ---

function showErrorState(container, message) {
    container.innerHTML = `<div class="error-state" style="padding: 40px; text-align: center;"><h3>❌ خطأ</h3><p>${message}</p></div>`;
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

/**
 * SEO: تحديث وسوم SEO و JSON-LD (متوافقة مع النظام الجديد)
 */
function updateSeoTags(req, requestId) {
  const budgetForDisplay = req.budget_display || req.budget || 'غير محددة';
  const areaForDisplay = req.area_display || req.area || 'غير محددة';
  const pageTitle = `${req.title || 'طلب عقاري'} - سمسار طلبك`;
  const description = `تفاصيل طلب عقاري: ${req.title || ''}. الميزانية: ${budgetForDisplay}، المساحة المطلوبة: ${areaForDisplay}. ${(req.description || '').substring(0, 120)}...`;
  const pageURL = new URL(`/request/${requestId}`, window.location.origin).href;

  document.title = pageTitle;
  
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageURL);

  const schemaBudget = (req.budget_min !== undefined) ? req.budget_min : (req.budget || "0").replace(/[^0-9]/g, '');

  const schema = {
    "@context": "https://schema.org", "@type": "Demand", "name": req.title || "طلب عقاري",
    "description": req.description || req.more_details || "طلب عقاري", "url": pageURL,
    "itemOffered": { "@type": "Product", "name": "عقار سكني أو تجاري" },
    "priceSpecification": { "@type": "PriceSpecification", "price": schemaBudget, "priceCurrency": "EGP" },
    "validFrom": req.date || new Date().toISOString(),
  };
  
  let schemaScript = document.getElementById('request-schema');
  if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'request-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify(schema, null, 2);
}

/**
 * عرض محتوى الطلب بالتصميم الكامل (متوافقة مع النظام الجديد)
 */
function renderRequestDetails(req, container, requestId) {
  const pageURL = new URL(`/request/${requestId}`, window.location.origin).href;
  const budgetToRender = req.budget_display || req.budget || 'غير محددة';
  const areaToRender = req.area_display || req.area || 'غير محددة';
  const displayId = req.ref_id || requestId; // ✨ استخدام الرقم المرجعي إن وجد

  container.innerHTML = `
    <header class="details-header">
      <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
      <h1>${req.title || "تفاصيل الطلب"}</h1>
    </header>
    
    <div class="request-id-badge">رقم الطلب: ${displayId}</div>

    <section class="details-grid">
      <div class="detail-item"><strong>💰 الميزانية:</strong> ${budgetToRender}</div>
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
      <a href="https://wa.me/201147758857?text=أرى طلبك بعنوان: ${encodeURIComponent(req.title || '')} - رقم الطلب: ${displayId}" 
         target="_blank" class="action-btn whatsapp-btn">
        <span class="btn-icon">💬</span> تواصل عبر واتساب
      </a>
      <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط الطلب">
        <span class="btn-icon">📤</span> مشاركة الرابط
      </button>
      <a href="/requests-filtered.html" class="action-btn back-btn">
        <span class="btn-icon">←</span> العودة للقائمة
      </a>
    </footer>
    
    <div id="copy-toast" class="toast" style="visibility: hidden; opacity: 0; transition: all 0.3s ease;">تم نسخ الرابط بنجاح ✓</div>
  `;
    }

/**
 * نظام تحميل تفاصيل الطلب (النسخة النهائية الكاملة v2.2 - تفعيل الروابط القصيرة)
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details");
  
  // عرض حالة التحميل
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>⏳ جاري تحميل تفاصيل الطلب...</p>
    </div>
    <style>
      .loading-container { text-align: center; padding: 40px; }
      .loading-spinner { width: 50px; height: 50px; border: 5px solid #333; 
        border-top: 5px solid #00ff88; border-radius: 50%; 
        margin: 0 auto 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  
  // استخراج الـ ID من الرابط القصير
  const pathParts = window.location.pathname.split('/');
  const requestId = pathParts[pathParts.length - 1]; // استخراج كـ نص

  if (!requestId) {
    showError("❌ لم يتم تحديد الطلب.");
    return;
  }

  try {
    // جلب الفهرس المركزي للطلبات
    const indexRes = await fetch(`/data/requests_index.json?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`فشل في جلب فهرس الطلبات (${indexRes.status})`);
    
    const requestsIndex = await indexRes.json();
    console.log("فهرس الطلبات:", requestsIndex);
    
    // البحث عن الطلب المطلوب
    const requestInfo = requestsIndex.find(r => r.id == requestId);
    
    if (!requestInfo) {
      throw new Error(`الطلب بالرقم ${requestId} غير موجود في الفهرس`);
    }

    // جلب ملف JSON الفعلي للطلب
    const res = await fetch(requestInfo.path);
    if (!res.ok) throw new Error(`فشل في جلب بيانات الطلب (${res.status})`);
    
    const requestData = await res.json();
    console.log("بيانات الطلب:", requestData);
    
    // التأكد من وجود الـ ID في بيانات الطلب
    if (!requestData.id) {
      requestData.id = requestId;
    }
    
    // عرض التفاصيل
    updateSeoTags(requestData);
    renderRequestDetails(requestData, container);

  } catch (err) {
    console.error("فشل في جلب تفاصيل الطلب:", err);
    showError(`❌ حدث خطأ أثناء تحميل بيانات الطلب: ${err.message}`);
  }
});

function showError(message) {
  const container = document.getElementById("request-details");
  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>عذرًا، حدث خطأ</h3>
      <p>${message}</p>
      <div class="error-actions">
        <button class="retry-btn" onclick="window.location.href='/requests.html'">← العودة للقائمة الرئيسية</button>
        <button class="contact-btn" onclick="window.open('tel:+201234567890')">📞 اتصل بنا</button>
      </div>
    </div>
    <style>
      .error-state { text-align: center; padding: 40px; }
      .error-icon { font-size: 3rem; margin-bottom: 20px; color: #ff6b6b; }
      .error-actions { display: flex; gap: 15px; justify-content: center; margin-top: 30px; }
      .retry-btn, .contact-btn { padding: 10px 20px; border-radius: 25px; cursor: pointer; }
      .retry-btn { background: #00ff88; color: #000; }
      .contact-btn { background: #8b5cf6; color: #fff; }
    </style>
  `;
}

/**
 * SEO: تحديث وسوم SEO و JSON-LD ديناميكيًا
 */
function updateSeoTags(req) {
  try {
    const budgetForDisplay = req.budget_display || req.budget || 'غير محددة';
    const areaForDisplay = req.area_display || req.area || 'غير محددة';

    const pageTitle = `${req.title || 'طلب عقاري'} - سمسار طلبك`;
    const description = `تفاصيل طلب عقاري: ${req.title || ''}. الميزانية: ${budgetForDisplay}، المساحة المطلوبة: ${areaForDisplay}. ${(req.description || '').substring(0, 120)}...`;
    
    const pageURL = new URL(`/request/${req.id}`, window.location.origin).href;

    document.title = pageTitle;
    
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

    let ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    if (!ogDescriptionMeta) {
      ogDescriptionMeta = document.createElement('meta');
      ogDescriptionMeta.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescriptionMeta);
    }
    ogDescriptionMeta.content = description;

    let ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlMeta);
    }
    ogUrlMeta.content = pageURL;
    
    // إنشاء JSON-LD
    const schemaBudget = (req.budget_min !== undefined && req.budget_min > 0) ? 
      req.budget_min : (req.budget || "0").replace(/[^0-9]/g, '');

    const schema = {
      "@context": "https://schema.org",
      "@type": "Demand",
      "name": req.title || "طلب عقاري",
      "description": req.description || req.more_details || "طلب عقاري مقدم من خلال سمسار طلبك",
      "url": pageURL,
      "itemOffered": {
        "@type": "Product",
        "name": "عقار سكني أو تجاري"
      },
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": schemaBudget || "0",
        "priceCurrency": "EGP"
      },
      "validFrom": req.date || new Date().toISOString(),
    };
    
    // إزالة أي مخطط موجود مسبقاً
    let existingSchema = document.getElementById('schema-json');
    if (existingSchema) existingSchema.remove();
    
    // إنشاء عنصر المخطط الجديد
    const schemaScript = document.createElement('script');
    schemaScript.id = 'schema-json';
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(schemaScript);
    
  } catch (schemaErr) {
    console.error('خطأ في تحديث وسوم SEO:', schemaErr);
  }
}

/**
 * عرض محتوى الطلب مع دعم القوام القديم والجديد
 */
function renderRequestDetails(req, container) {
  try {
    const pageURL = new URL(`/request/${req.id}`, window.location.origin).href;
    
    const budgetToRender = req.budget_display || req.budget || 'غير محددة';
    const areaToRender = req.area_display || req.area || 'غير محددة';
    const description = req.description || 'لا يوجد وصف متاح';
    const moreDetails = req.more_details || '';
    
    // إنشاء المحتوى بعد تأخير بسيط لتحسين تجربة المستخدم
    setTimeout(() => {
      container.innerHTML = `
        <div class="request-details-card">
          <header class="details-header">
            <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
            <h1>${req.title || "تفاصيل الطلب"}</h1>
            <div class="request-id">رقم الطلب: ${req.id}</div>
          </header>

          <section class="details-grid">
            <div class="detail-item"><span class="detail-icon">💰</span> <strong>الميزانية:</strong> ${budgetToRender}</div>
            <div class="detail-item"><span class="detail-icon">📏</span> <strong>المساحة المطلوبة:</strong> ${areaToRender}</div>
            ${req.rooms ? `<div class="detail-item"><span class="detail-icon">🛏️</span> <strong>عدد الغرف:</strong> ${req.rooms}</div>` : ''}
            ${req.bathrooms ? `<div class="detail-item"><span class="detail-icon">🛁</span> <strong>عدد الحمامات:</strong> ${req.bathrooms}</div>` : ''}
            ${req.floor ? `<div class="detail-item"><span class="detail-icon">🏢</span> <strong>الدور:</strong> ${req.floor}</div>` : ''}
            ${req.elevator !== undefined ? `<div class="detail-item"><span class="detail-icon">🛗</span> <strong>مصعد:</strong> ${req.elevator ? 'ضروري' : 'غير ضروري'}</div>` : ''}
            ${req.garage !== undefined ? `<div class="detail-item"><span class="detail-icon">🚗</span> <strong>جراج:</strong> ${req.garage ? 'يفضّل وجوده' : 'غير مهم'}</div>` : ''}
            ${req.finish ? `<div class="detail-item"><span class="detail-icon">🎨</span> <strong>التشطيب:</strong> ${req.finish}</div>` : ''}
            ${req.location ? `<div class="detail-item"><span class="detail-icon">📍</span> <strong>المنطقة المطلوبة:</strong> ${req.location}</div>` : ''}
          </section>

          <section class="details-description">
            <h2><span class="section-icon">📝</span> التفاصيل</h2>
            <p>${description}</p>
            ${moreDetails ? `<h2><span class="section-icon">📌</span> تفاصيل إضافية</h2><p>${moreDetails}</p>` : ''}
          </section>
          
          <div class="details-date">
            <span class="date-icon">📅</span> 
            <strong>تاريخ الإضافة:</strong> ${req.date || 'غير متوفر'}
          </div>

          <footer class="details-actions">
            <a href="https://wa.me/201147758857?text=أرى طلبك بعنوان: ${encodeURIComponent(req.title || '')}" 
               target="_blank" class="action-btn whatsapp-btn">
              <span class="btn-icon">💬</span> لدي عرض مناسب - واتساب
            </a>
            <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط الطلب">
              <span class="btn-icon">📤</span> مشاركة الرابط
            </button>
            <a href="/requests.html" class="action-btn back-btn">
              <span class="btn-icon">←</span> العودة للطلبات
            </a>
          </footer>
        </div>
        
        <!-- Toast للإشعار -->
        <div id="copy-toast" class="toast">تم نسخ الرابط بنجاح ✓</div>
        
        <style>
          .request-details-card { background: #1e1e1e; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          .details-header { text-align: center; margin-bottom: 25px; position: relative; }
          .brand-logo { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; }
          .request-id { background: #333; color: #00ff88; padding: 5px 15px; border-radius: 20px; 
            display: inline-block; margin: 10px auto; font-size: 0.9rem; }
          
          .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 15px; margin: 30px 0; }
          .detail-item { background: #2a2a2a; padding: 15px; border-radius: 10px; border-left: 3px solid #00ccff; }
          .detail-icon { margin-left: 5px; }
          
          .details-description { background: #1a1a1a; padding: 25px; border-radius: 15px; margin: 30px 0; }
          .section-icon { margin-left: 5px; }
          
          .details-date { text-align: center; font-size: 0.9rem; color: #888; margin: 20px 0; }
          
          .details-actions { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-top: 40px; }
          .action-btn { padding: 12px 25px; border-radius: 30px; font-weight: bold; display: flex; 
            align-items: center; gap: 10px; transition: all 0.3s; text-decoration: none; }
          .whatsapp-btn { background: #25D366; color: #fff; }
          .copy-btn { background: #8b5cf6; color: #fff; }
          .back-btn { background: #333; color: #fff; border: 1px solid #555; }
          .action-btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); }
          
          .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px); 
            background: rgba(0, 0, 0, 0.8); color: #00ff88; padding: 15px 30px; border-radius: 30px; 
            z-index: 1000; transition: transform 0.3s ease; font-weight: bold; }
          .toast.show { transform: translateX(-50%) translateY(0); }
          
          @media (max-width: 768px) {
            .details-grid { grid-template-columns: 1fr; }
            .details-actions { flex-direction: column; }
            .action-btn { width: 100%; justify-content: center; }
          }
        </style>
      `;
    }, 500);
    
  } catch (renderErr) {
    console.error('خطأ في عرض تفاصيل الطلب:', renderErr);
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>حدث خطأ في عرض بيانات الطلب</h3>
        <p>${renderErr.message}</p>
      </div>
    `;
  }
}

// دالة نسخ الرابط للوحة المفاتيح (يجب أن تكون في النطاق العام)
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
  }).catch(err => {
    console.error('فشل في نسخ الرابط:', err);
    alert('فشل في نسخ الرابط، يرجى المحاولة يدوياً');
  });
};

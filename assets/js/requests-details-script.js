// SEO Improvement: الكود بأكمله مُعاد هيكلته ليدعم SEO
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details");
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");

  if (!category || !file) {
    container.innerHTML = `<p class="error-message">❌ لم يتم تحديد الطلب.</p>`;
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/requests/${category}/${file}`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const requestData = await res.json();
    
    // استدعاء الدوال الجديدة
    updateSeoTags(requestData);
    renderRequestDetails(requestData, container);

  } catch (err) {
    console.error("فشل في جلب تفاصيل الطلب:", err);
    container.innerHTML = `<p class="error-message">❌ حدث خطأ أثناء تحميل بيانات الطلب.</p>`;
  }
});

/**
 * SEO: تحديث وسوم SEO و JSON-LD ديناميكيًا
 * @param {object} req - بيانات الطلب
 */
function updateSeoTags(req) {
  const pageTitle = `${req.title || 'طلب عقاري'} - سمسار طلبك`;
  const description = `تفاصيل طلب عقاري: ${req.title || ''}. الميزانية: ${req.budget || 'غير محددة'}، المساحة المطلوبة: ${req.area || 'غير محددة'}. ${(req.description || '').substring(0, 120)}...`;
  const pageURL = window.location.href;

  // 1. تحديث عنوان الصفحة والوصف
  document.title = pageTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', description);

  // 2. تحديث وسوم Open Graph (لواتساب)
  document.querySelector('meta[property="og:title"]').setAttribute('content', pageTitle);
  document.querySelector('meta[property="og:description"]').setAttribute('content', description);
  document.querySelector('meta[property="og:url"]').setAttribute('content', pageURL);

  // 3. ملء بيانات Schema.org
  // نستخدم "Demand" وهو مناسب للطلبات
  const schema = {
    "@context": "https://schema.org",
    "@type": "Demand",
    "name": req.title,
    "description": req.description || req.more_details,
    "url": pageURL,
    "itemOffered": {
      "@type": "RealEstateListing" // وصف الشيء المطلوب
    },
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": (req.budget || "0").replace(/[^0-9]/g, ''),
      "priceCurrency": "EGP"
    },
    "validFrom": req.date,
  };
  const schemaScript = document.getElementById('schema-json');
  if (schemaScript) {
    schemaScript.textContent = JSON.stringify(schema, null, 2);
  }
}

/**
 * عرض محتوى الطلب باستخدام وسوم دلالية وكلاسات CSS
 * @param {object} req - بيانات الطلب
 * @param {HTMLElement} container - الحاوية لعرض المحتوى بداخلها
 */
function renderRequestDetails(req, container) {
  const pageURL = window.location.href;

  container.innerHTML = `
    <header class="details-header">
      <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
      <h1>${req.title || "تفاصيل الطلب"}</h1>
    </header>

    <section class="details-grid">
      <div class="detail-item"><strong>💰 الميزانية:</strong> ${req.budget || 'غير محددة'}</div>
      <div class="detail-item"><strong>📏 المساحة المطلوبة:</strong> ${req.area || 'غير محددة'}</div>
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
      <a href="https://wa.me/201147758857?text=أرى طلبك بعنوان: ${encodeURIComponent(req.title)}" target="_blank" class="action-btn whatsapp-btn">
        لدي عرض مناسب – واتساب
      </a>
      <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط الطلب">
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

/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية الكاملة v2.1 - تفعيل الروابط القصيرة)
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  
  // ✨ التعديل: قراءة الـ ID من الرابط القصير
  const pathParts = window.location.pathname.split('/');
  const propertyId = pathParts[pathParts.length - 1]; // لا نحتاج parseInt لأن الـ ID قد يكون نصياً

  if (!propertyId) {
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>عذرًا، حدث خطأ</h3>
        <p>لم يتم تحديد العقار أو أن الرابط غير صحيح.</p>
        <div class="error-actions">
          <button class="retry-btn" onclick="window.location.href='/properties.html'">← العودة للقائمة الرئيسية</button>
        </div>
      </div>
    `;
    return;
  }

  try {
    // ✨ التعديل: جلب الفهرس المركزي أولاً
    const indexRes = await fetch(`/data/properties_index.json?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`فشل في جلب فهرس العقارات (${indexRes.status})`);
    const propertiesIndex = await indexRes.json();

    // البحث عن مسار الملف الصحيح باستخدام الـ ID
    const propertyInfo = propertiesIndex.find(p => p.id == propertyId);

    if (!propertyInfo) {
      throw new Error(`العقار بالرقم ${propertyId} غير موجود في الفهرس`);
    }

    // جلب ملف JSON الفعلي للعقار مع إضافة طابع زمني لمنع التخزين المؤقت
    const res = await fetch(`${propertyInfo.path}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`فشل في جلب بيانات العقار (${res.status})`);
    const propertyData = await res.json();
    
    updateSeoTags(propertyData);
    renderPropertyDetails(propertyData, container);

  } catch (err) {
    console.error("فشل في جلب تفاصيل العقار:", err);
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">❌</div>
        <h3>حدث خطأ في تحميل بيانات العقار</h3>
        <p>${err.message}</p>
        <div class="error-actions">
          <button class="retry-btn" onclick="window.location.reload()">🔄 إعادة المحاولة</button>
          <button class="contact-btn" onclick="window.open('tel:+201234567890')">📞 اتصل بنا</button>
        </div>
      </div>
    `;
  }
});

/**
 * SEO: تحديث وسوم SEO و JSON-LD ديناميكيًا مع دعم القوام القديم والجديد
 */
function updateSeoTags(prop) {
  try {
    const priceForDisplay = prop.price_display || prop.price || 'غير محدد';
    const areaForDisplay = prop.area_display || prop.area || 'غير محددة';

    const pageTitle = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
    const description = `تفاصيل عقار: ${prop.title || ''}. المساحة: ${areaForDisplay}، السعر: ${priceForDisplay}. ${(prop.description || '').substring(0, 120)}...`;
    
    const pageURL = new URL(`/property/${prop.id}`, window.location.origin).href;

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
    const schemaPrice = (prop.price_min !== undefined && prop.price_min > 0) 
      ? prop.price_min 
      : (prop.price || "0").replace(/[^0-9]/g, '');

    const schemaArea = (prop.area_min !== undefined && prop.area_min > 0) 
      ? prop.area_min 
      : (prop.area || "0").replace(/[^0-9]/g, '');

    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": prop.title || "عقار للبيع",
      "description": prop.description || prop.more_details || "عقار مميز للبيع",
      "url": pageURL,
      "offers": {
        "@type": "Offer",
        "price": schemaPrice || "0",
        "priceCurrency": "EGP"
      },
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": schemaArea || "0",
        "unitText": "متر مربع"
      },
      "numberOfRooms": prop.rooms || "غير محدد",
      "numberOfBathroomsTotal": prop.bathrooms || "غير محدد",
      "address": prop.location || "مدينة نصر, القاهرة, مصر",
      "datePosted": prop.date || new Date().toISOString(),
    };
    
    // إزالة أي مخطط موجود مسبقاً
    let existingSchema = document.getElementById('property-schema');
    if (existingSchema) existingSchema.remove();
    
    // إنشاء عنصر المخطط الجديد
    const schemaScript = document.createElement('script');
    schemaScript.id = 'property-schema';
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(schemaScript);
    
  } catch (schemaErr) {
    console.error('خطأ في تحديث وسوم SEO:', schemaErr);
  }
}

/**
 * عرض محتوى العقار مع دعم القوام القديم والجديد
 */
function renderPropertyDetails(prop, container) {
  try {
    const whatsapp = prop.whatsapp || "201147758857";
    const pageURL = new URL(`/property/${prop.id}`, window.location.origin).href;
    
    const priceToRender = prop.price_display || prop.price || "غير محدد";
    const areaToRender = prop.area_display || prop.area || 'غير محددة';
    const description = prop.description || 'لا يوجد وصف متاح';
    const moreDetails = prop.more_details || '';
    
    // إنشاء عنصر التحميل المؤقت
    container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">جاري تحميل تفاصيل العقار...</div>
      </div>
    `;
    
    // تأخير بسيط لتحسين تجربة المستخدم
    setTimeout(() => {
      container.innerHTML = `
        <header class="details-header">
          <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" class="brand-logo">
          <h1>${prop.title || "تفاصيل العرض"}</h1>
        </header>
        
        <div class="property-id-badge">رقم العقار: ${prop.id}</div>

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
          <p>${description}</p>
          ${moreDetails ? `<h2>📌 تفاصيل إضافية</h2><p>${moreDetails}</p>` : ''}
        </section>

        <p class="details-date">📅 <strong>تاريخ الإضافة:</strong> ${prop.date || 'غير متوفر'}</p>

        <footer class="details-actions">
          <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title || '')}" 
             target="_blank" class="action-btn whatsapp-btn">
            <span class="btn-icon">💬</span> تواصل عبر واتساب
          </a>
          <button onclick="copyToClipboard('${pageURL}')" class="action-btn copy-btn" title="انسخ رابط العرض">
            <span class="btn-icon">📤</span> مشاركة الرابط
          </button>
          <a href="/properties.html" class="action-btn back-btn">
            <span class="btn-icon">←</span> العودة للقائمة
          </a>
        </footer>
        
        <!-- Toast للإشعار -->
        <div id="copy-toast" class="toast">تم نسخ الرابط بنجاح ✓</div>
      `;
      
      // إضافة أنماط التحميل إذا لم تكن موجودة
      if (!document.getElementById('details-styles')) {
        const styles = `
          <style id="details-styles">
            .loading-container { text-align: center; padding: 40px; }
            .loading-spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #00ff88; 
              border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .loading-text { font-size: 1.2rem; color: #ccc; }
            
            .details-header { text-align: center; margin-bottom: 30px; }
            .brand-logo { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; }
            .details-price { font-size: 1.8rem; text-align: center; color: #00ff88; font-weight: bold; margin: 20px 0; }
            .property-id-badge { background: #333; color: #00ff88; padding: 5px 15px; border-radius: 20px; 
              display: inline-block; margin: 0 auto 20px; font-size: 0.9rem; }
            
            .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
              gap: 15px; margin: 30px 0; }
            .detail-item { background: #1e1e1e; padding: 15px; border-radius: 10px; border-left: 3px solid #00ff88; }
            
            .details-description { background: #1a1a1a; padding: 25px; border-radius: 15px; margin: 30px 0; }
            .details-description h2 { color: #00ccff; margin-top: 0; }
            
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
              z-index: 1000; transition: transform 0.3s ease; }
            .toast.show { transform: translateX(-50%) translateY(0); }
            
            @media (max-width: 768px) {
              .details-grid { grid-template-columns: 1fr; }
              .details-actions { flex-direction: column; }
              .action-btn { width: 100%; justify-content: center; }
            }
          </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
      }
    }, 500);
    
  } catch (renderErr) {
    console.error('خطأ في عرض تفاصيل العقار:', renderErr);
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>حدث خطأ في عرض بيانات العقار</h3>
        <p>${renderErr.message}</p>
      </div>
    `;
  }
}

function copyToClipboard(text) {
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
}

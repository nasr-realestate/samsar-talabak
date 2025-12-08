/**
 * 🏢 سمسار طلبك - مدير تفاصيل العقار (يدعم الروابط الجميلة)
 * v14.0 - Smart URL Parser
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("details-container");
  if (!container) return;

  // -----------------------------------------------------------
  // 🧠 الذكاء في استخراج المعرف (ID)
  // -----------------------------------------------------------
  let propertyId = new URLSearchParams(window.location.search).get('id');
  let category = new URLSearchParams(window.location.search).get('category');

  // إذا لم نجد ID بالطريقة العادية، نبحث عنه في الرابط الجميل
  // مثال: /property/flat-101
  if (!propertyId) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      // عادة يكون الرابط: property / ID
      if (pathSegments.length >= 2 && pathSegments[0] === 'property') {
          propertyId = pathSegments[1];
      }
  }

  // إذا لم نجد القسم، نفترض أنه 'apartments' مبدئياً أو نبحث عنه لاحقاً
  if (!category) category = 'apartments'; 

  // التحقق النهائي
  if (!propertyId) {
    showErrorState(container, "رابط العقار غير صحيح (لم يتم العثور على المعرف).");
    return;
  }

  try {
    // 1. جلب الفهرس الرئيسي
    const indexUrl = `/data/properties_index.json?t=${Date.now()}`;
    const indexResponse = await fetch(indexUrl);
    if (!indexResponse.ok) throw new Error("فشل في تحميل قاعدة البيانات.");

    const masterIndex = await indexResponse.json();

    // 2. البحث عن العقار في الفهرس
    const targetPropertyInfo = masterIndex.find(item => String(item.id) === String(propertyId));

    if (!targetPropertyInfo) {
        throw new Error(`عذراً، هذا العقار (كود ${propertyId}) غير موجود أو تم حذفه.`);
    }

    // 3. جلب ملف البيانات
    const dataUrl = `${targetPropertyInfo.path}?t=${Date.now()}`;
    const dataResponse = await fetch(dataUrl);
    if (!dataResponse.ok) throw new Error("بيانات العقار غير متاحة.");

    const propertyData = await dataResponse.json();
    
    // 4. تحديث الصفحة
    document.title = `${propertyData.title} | سمسار طلبك`;
    
    // تحديث صورة المشاركة (Meta Tag) ديناميكياً لأجل واتساب وفيسبوك
    // (هذا لن يظهر فوراً في المعاينة الأولى لكنه مفيد للمستقبل)
    updateMetaImage(propertyData.image);

    renderLuxuryDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Details Error:", err);
    showErrorState(container, `<strong>عذراً:</strong> ${err.message}`);
  }
});

function updateMetaImage(imageUrl) {
    if (!imageUrl) return;
    // محاولة تحديث صورة OG (تعمل في بعض المتصفحات الحديثة)
    let metaImage = document.querySelector('meta[property="og:image"]');
    if (metaImage) metaImage.setAttribute('content', imageUrl);
}

// ============================================================
// 🎨 دالة الرسم (التصميم الذهبي - بدون تغيير)
// ============================================================
function renderLuxuryDetails(prop, container, id) {
  const price = prop.price_display || prop.price || "تواصل للسعر";
  const title = prop.title || "عرض مميز";
  const location = prop.location || "مدينة نصر";
  const whatsappNumber = "201147758857"; 
  const shareUrl = window.location.href;

  container.innerHTML = `
    <div class="details-header" style="border-bottom: 1px solid var(--color-border); padding-bottom: 25px; margin-bottom: 30px;">
      <div style="margin-bottom: 20px;">
          <div style="color: var(--color-primary); font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase; border:1px solid var(--color-primary); padding: 5px 15px; border-radius: 20px; display:inline-block;">
              <i class="fas fa-hashtag"></i> كود: ${id}
          </div>
          <h1 style="color: #fff; font-size: 1.8rem; margin: 15px 0; line-height: 1.4;">${title}</h1>
          <p style="color: var(--color-text-secondary); font-size: 1.1rem; margin: 0;">
              <i class="fas fa-map-marker-alt" style="color: var(--color-primary);"></i> ${location}
          </p>
      </div>

      <div style="background: linear-gradient(135deg, var(--color-primary), #b38f1d); color: #000; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);">
          <div style="font-size: 0.9rem; opacity: 0.85; font-weight: 800;">السعر المطلوب</div>
          <div style="font-size: 1.5rem; font-weight: 900; margin-top: 5px;">${price}</div>
      </div>
    </div>

    <div class="details-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 40px;">
        ${prop.area ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;"><i class="fas fa-ruler-combined" style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 8px; display: block;"></i><span style="color:#888; font-size:0.8rem;">المساحة</span><div style="font-size:1.1rem; font-weight:bold;">${prop.area}</div></div>` : ''}
        ${prop.rooms ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;"><i class="fas fa-bed" style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 8px; display: block;"></i><span style="color:#888; font-size:0.8rem;">الغرف</span><div style="font-size:1.1rem; font-weight:bold;">${prop.rooms}</div></div>` : ''}
        ${prop.floor ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;"><i class="fas fa-building" style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 8px; display: block;"></i><span style="color:#888; font-size:0.8rem;">الدور</span><div style="font-size:1.1rem; font-weight:bold;">${prop.floor}</div></div>` : ''}
        ${prop.finish_type ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;"><i class="fas fa-paint-roller" style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 8px; display: block;"></i><span style="color:#888; font-size:0.8rem;">التشطيب</span><div style="font-size:1.1rem; font-weight:bold;">${prop.finish_type}</div></div>` : ''}
    </div>

    <div class="details-description" style="background: #0a0a0a; padding: 2rem; border-radius: 15px; border: 1px solid #333; margin-bottom: 30px;">
        <h3 style="color: var(--color-primary); margin-bottom: 1.5rem; font-size: 1.3rem; border-bottom: 1px dashed #333; padding-bottom: 15px;">
            <i class="fas fa-align-right"></i> التفاصيل
        </h3>
        <p style="color: #ccc; line-height: 1.8; white-space: pre-line; font-size: 1rem;">
            ${prop.description || "لا يوجد وصف إضافي."}
        </p>
        ${prop.extra_details ? `<div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #333;"><strong style="color: #fff;">ملاحظات:</strong> <br><span style="color: #aaa;">${prop.extra_details}</span></div>` : ''}
    </div>

    <div class="details-actions" style="display: flex; flex-direction: column; gap: 15px;">
        <a href="https://wa.me/${whatsappNumber}?text=استفسار عن العقار: ${title} (كود: ${id})" target="_blank" class="action-btn" style="background: #25D366; color: #fff; padding: 15px; text-align: center; border-radius: 12px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 10px;">
            <i class="fab fa-whatsapp" style="font-size: 1.4rem;"></i> تواصل واتساب
        </a>
        <a href="tel:+${whatsappNumber}" class="action-btn" style="background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); padding: 15px; text-align: center; border-radius: 12px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 10px;">
            <i class="fas fa-phone"></i> اتصال هاتفي
        </a>
    </div>

    <div style="text-align: center; margin-top: 3rem;">
        <a href="/properties-filtered.html" class="back-btn" style="color: #888; text-decoration: none; border-bottom: 1px solid #444; padding-bottom: 5px;">عودة للقائمة</a>
    </div>
  `;
}

function showErrorState(container, message) {
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 4rem 1rem; color: #fff;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-error);"></i>
            <h3 style="color: var(--color-error);">عذراً</h3>
            <p style="font-size: 1rem; color: #ccc; margin-top: 10px;">${message}</p>
            <a href="/" class="nav-btn" style="margin-top: 2rem; display: inline-block; color: #fff; padding: 10px 30px; border: 1px solid #fff; border-radius: 50px; text-decoration: none;">الرئيسية</a>
        </div>
    `;
}

/**
 * 🏢 سمسار طلبك - تفاصيل العقار (النظام الذهبي - نصي)
 * الملف: assets/js/details-loader.js
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("details-container");
  
  // 1. استخراج معرف العقار (ID) من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');

  if (!propertyId) {
    showErrorState(container, "رابط العقار غير صحيح (لا يوجد معرف).");
    return;
  }

  try {
    // -----------------------------------------------------------
    // 🔍 الخطوة 1: جلب "الفهرس الرئيسي" للعقارات
    // هذا يضمن أننا نجد الملف الصحيح مهما كان مكانه
    // -----------------------------------------------------------
    const indexUrl = `/data/properties_index.json?t=${Date.now()}`;
    
    const indexResponse = await fetch(indexUrl);
    if (!indexResponse.ok) throw new Error("فشل في تحميل قاعدة بيانات العقارات.");

    const masterIndex = await indexResponse.json();

    // -----------------------------------------------------------
    // 🔍 الخطوة 2: البحث عن العقار داخل الفهرس باستخدام ID
    // -----------------------------------------------------------
    const targetPropertyInfo = masterIndex.find(item => String(item.id) === String(propertyId));

    if (!targetPropertyInfo) {
        throw new Error(`عذراً، هذا العقار (رقم ${propertyId}) غير موجود أو تم حذفه.`);
    }

    // -----------------------------------------------------------
    // 🔍 الخطوة 3: جلب ملف البيانات الفعلي
    // -----------------------------------------------------------
    const dataUrl = `${targetPropertyInfo.path}?t=${Date.now()}`;
    
    const dataResponse = await fetch(dataUrl);
    if (!dataResponse.ok) throw new Error("تعذر فتح ملف بيانات العقار.");

    const propertyData = await dataResponse.json();
    
    // 4. تحديث العنوان والرسم
    document.title = `${propertyData.title || 'تفاصيل عقار'} | سمسار طلبك`;
    renderLuxuryDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Details Error:", err);
    showErrorState(container, `
        <strong>حدث خطأ:</strong><br> ${err.message}
    `);
  }
});

// ============================================================
// 🎨 دالة الرسم (التصميم الذهبي الفاخر - نصوص فقط)
// ============================================================
function renderLuxuryDetails(prop, container, id) {
  // تجهيز النصوص والبيانات
  const price = prop.price_display || prop.price || "السعر عند الاتصال";
  const title = prop.title || "عرض مميز";
  const location = prop.location || "مدينة نصر";
  const whatsappNumber = "201147758857"; 
  const shareUrl = window.location.href;

  container.innerHTML = `
    <!-- رأس الصفحة: العنوان والموقع -->
    <div class="details-header" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; border-bottom: 1px solid var(--color-border); padding-bottom: 25px; margin-bottom: 30px;">
      
      <div style="flex: 1; min-width: 280px;">
          <div style="color: var(--color-primary); font-size: 0.9rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
              <i class="fas fa-hashtag"></i> كود العرض: ${id}
          </div>
          <h1 style="color: #fff; font-size: 2rem; margin: 0 0 15px 0; line-height: 1.4;">${title}</h1>
          <p style="color: var(--color-text-secondary); font-size: 1.1rem; margin: 0;">
              <i class="fas fa-map-marker-alt" style="color: var(--color-primary);"></i> ${location}
          </p>
      </div>

      <!-- السعر في مربع فخم -->
      <div style="background: linear-gradient(135deg, var(--color-primary), #b38f1d); color: #000; padding: 20px 30px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2); min-width: 200px;">
          <div style="font-size: 0.9rem; opacity: 0.85; font-weight: 800; text-transform: uppercase;">السعر المطلوب</div>
          <div style="font-size: 1.6rem; font-weight: 900; margin-top: 5px;">${price}</div>
      </div>

    </div>

    <!-- شبكة المواصفات (Grid System) -->
    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 40px;">
        
        ${prop.area ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-ruler-combined" style="color: var(--color-primary); font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">المساحة</span>
            <div style="font-size:1.2rem; font-weight:bold; margin-top: 4px;">${prop.area}</div>
        </div>` : ''}

        ${prop.rooms ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-bed" style="color: var(--color-primary); font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">الغرف</span>
            <div style="font-size:1.2rem; font-weight:bold; margin-top: 4px;">${prop.rooms}</div>
        </div>` : ''}

        ${prop.bathrooms ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-bath" style="color: var(--color-primary); font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">الحمامات</span>
            <div style="font-size:1.2rem; font-weight:bold; margin-top: 4px;">${prop.bathrooms}</div>
        </div>` : ''}

        ${prop.floor ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-building" style="color: var(--color-primary); font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">الدور</span>
            <div style="font-size:1.2rem; font-weight:bold; margin-top: 4px;">${prop.floor}</div>
        </div>` : ''}

        ${prop.finish_type ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 12px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-paint-roller" style="color: var(--color-primary); font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">التشطيب</span>
            <div style="font-size:1.2rem; font-weight:bold; margin-top: 4px;">${prop.finish_type}</div>
        </div>` : ''}

    </div>

    <!-- الوصف النصي الكامل -->
    <div class="details-description" style="background: #0a0a0a; padding: 2rem; border-radius: 15px; border: 1px solid #333; margin-bottom: 30px;">
        <h3 style="color: var(--color-primary); margin-bottom: 1.5rem; font-size: 1.4rem; border-bottom: 1px dashed #333; padding-bottom: 10px;">
            <i class="fas fa-align-right"></i> التفاصيل والمميزات
        </h3>
        <p style="color: #ccc; line-height: 1.8; white-space: pre-line; font-size: 1.05rem;">
            ${prop.description || "لا يوجد وصف إضافي."}
        </p>
        
        <!-- ملاحظات إضافية -->
        ${prop.elevator || prop.garage ? `
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #333; display:flex; gap: 20px; font-weight: bold; color: #fff;">
            ${prop.elevator ? '<span><i class="fas fa-check-circle" style="color:var(--color-primary)"></i> مصعد</span>' : ''}
            ${prop.garage ? '<span><i class="fas fa-check-circle" style="color:var(--color-primary)"></i> جراج</span>' : ''}
        </div>` : ''}
    </div>

    <!-- أزرار الإجراءات (كبيرة وواضحة) -->
    <div class="details-actions" style="display: flex; gap: 15px; flex-wrap: wrap;">
        
        <a href="https://wa.me/${whatsappNumber}?text=السلام عليكم، أستفسر عن العقار: ${title} (كود: ${id})" target="_blank" class="action-btn" style="flex: 2; background: #25D366; color: #fff; padding: 15px; text-align: center; border-radius: 50px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; font-size: 1.1rem; box-shadow: 0 5px 15px rgba(37, 211, 102, 0.2); border: none; transition: 0.3s;">
            <i class="fab fa-whatsapp" style="margin-left: 10px; font-size: 1.3rem;"></i> تواصل واتساب
        </a>

        <a href="tel:+${whatsappNumber}" class="action-btn" style="flex: 1; background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); padding: 15px; text-align: center; border-radius: 50px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; font-size: 1.1rem; transition: 0.3s;">
            <i class="fas fa-phone" style="margin-left: 10px;"></i> اتصال
        </a>

        <button onclick="navigator.clipboard.writeText('${shareUrl}').then(() => alert('تم نسخ رابط العقار!'))" class="action-btn" style="flex: 0 0 60px; background: #222; color: #fff; border: 1px solid #444; border-radius: 50px; cursor: pointer; font-size: 1.2rem; transition: 0.3s;">
            <i class="fas fa-share-alt"></i>
        </button>

    </div>

    <!-- زر العودة -->
    <div style="text-align: center; margin-top: 3rem;">
        <a href="/properties-filtered.html" class="back-btn" style="color: #888; text-decoration: none; border-bottom: 1px solid #444; padding-bottom: 5px; transition: 0.3s; font-size: 0.9rem;">
            <i class="fas fa-arrow-right"></i> العودة لقائمة العقارات
        </a>
    </div>
  `;
}

// دالة عرض الخطأ
function showErrorState(container, message) {
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 4rem; color: #fff; border: 1px solid var(--color-error); border-radius: 15px; background: rgba(255, 0, 0, 0.1);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-error);"></i>
            <h3 style="color: var(--color-error);">عذراً</h3>
            <p style="font-size: 1rem; color: #ccc; margin-top: 10px;">${message}</p>
            <a href="/properties-filtered.html" style="margin-top: 2rem; display: inline-block; color: #fff; padding: 10px 25px; border: 1px solid #fff; border-radius: 50px; text-decoration: none;">عودة للعقارات</a>
        </div>
    `;
              }

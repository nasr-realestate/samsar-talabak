/**
 * 🏢 سمسار طلبك - مدير تفاصيل العقار (النسخة الذهبية النصية)
 * v11.0 - Pure Text Luxury
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("details-container");
  
  // 1. استخراج البيانات من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category'); // e.g., 'apartments'
  const propertyId = urlParams.get('id');     // e.g., 'flat-01'

  // التحقق من صحة الرابط
  if (!category || !propertyId) {
    showErrorState(container, "رابط العقار غير مكتمل أو غير صحيح.");
    return;
  }

  try {
    // 2. محاولة جلب ملف العقار مباشرة
    // المسار: /data/properties/apartments/flat-01.json
    const fetchUrl = `/data/properties/${category}/${propertyId}.json`;
    
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
        throw new Error("لم يتم العثور على بيانات هذا العقار (404).");
    }
    
    const propertyData = await response.json();
    
    // 3. تحديث عنوان المتصفح للسيو
    document.title = `${propertyData.title || 'تفاصيل عقار'} | سمسار طلبك`;
    
    // 4. رسم التفاصيل
    renderLuxuryDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Details Error:", err);
    showErrorState(container, "عذراً، هذا العقار غير متاح حالياً أو تم حذفه.");
  }
});

// --- دالة الرسم (التصميم الذهبي) ---
function renderLuxuryDetails(prop, container, id) {
  // تجهيز البيانات
  const price = prop.price_display || prop.price || "السعر عند الاتصال";
  const title = prop.title || "عرض مميز";
  const location = prop.location || "مدينة نصر";
  const date = prop.date || "حديث";
  const whatsappNumber = "201147758857"; // رقمك الثابت

  container.innerHTML = `
    <!-- رأس الصفحة: العنوان والموقع -->
    <div class="details-header" style="flex-direction: column; align-items: flex-start; border-bottom: 1px solid var(--color-border); padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display:flex; justify-content:space-between; width:100%; align-items:flex-start; flex-wrap:wrap; gap:15px;">
          
          <div style="flex: 1;">
              <div style="color: var(--color-primary); font-size: 0.9rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
                  <i class="fas fa-certificate"></i> عرض موثوق
              </div>
              <h1 style="color: #fff; font-size: 2rem; margin: 0 0 10px 0; line-height: 1.3;">${title}</h1>
              <p style="color: var(--color-text-secondary); font-size: 1.1rem;">
                  <i class="fas fa-map-marker-alt" style="color: var(--color-primary);"></i> ${location}
              </p>
          </div>

          <!-- السعر في مربع فخم -->
          <div class="details-price" style="background: linear-gradient(135deg, var(--color-primary), #b38f1d); color: #000; padding: 15px 30px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);">
              <div style="font-size: 0.9rem; opacity: 0.8; font-weight: bold;">السعر المطلوب</div>
              <div style="font-size: 1.5rem; font-weight: 900;">${price}</div>
          </div>

      </div>
    </div>

    <!-- شبكة المواصفات (Grid System) -->
    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
        
        ${prop.area ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-ruler-combined" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">المساحة</span>
            <div style="font-size:1.2rem; font-weight:bold;">${prop.area}</div>
        </div>` : ''}

        ${prop.rooms ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-bed" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">الغرف</span>
            <div style="font-size:1.2rem; font-weight:bold;">${prop.rooms}</div>
        </div>` : ''}

        ${prop.floor ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-building" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">الدور</span>
            <div style="font-size:1.2rem; font-weight:bold;">${prop.floor}</div>
        </div>` : ''}

        ${prop.finish_type ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;">
            <i class="fas fa-paint-roller" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i>
            <span style="color:#888; font-size:0.9rem;">التشطيب</span>
            <div style="font-size:1.2rem; font-weight:bold;">${prop.finish_type}</div>
        </div>` : ''}

    </div>

    <!-- الوصف النصي الكامل -->
    <div class="details-description" style="background: #000; padding: 2rem; border-radius: 15px; border: 1px solid #333; margin-bottom: 30px;">
        <h3 style="color: var(--color-primary); margin-bottom: 1rem; font-size: 1.4rem;">
            <i class="fas fa-align-right"></i> تفاصيل ومميزات العقار
        </h3>
        <p style="color: #ccc; line-height: 1.8; white-space: pre-line; font-size: 1.05rem;">
            ${prop.description || "لا يوجد وصف إضافي."}
        </p>
        
        <!-- تفاصيل إضافية إن وجدت -->
        ${prop.extra_details ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #444;">
            <strong style="color: #fff;">ملاحظات:</strong> <span style="color: #aaa;">${prop.extra_details}</span>
        </div>` : ''}
        
        <div style="margin-top: 20px; font-size: 0.9rem; color: #666;">
            <i class="far fa-clock"></i> تاريخ الإضافة: ${date} | رقم مرجعي: #${id}
        </div>
    </div>

    <!-- أزرار الإجراءات (كبيرة وواضحة) -->
    <div class="details-actions" style="display: flex; gap: 20px; flex-wrap: wrap;">
        
        <a href="https://wa.me/${whatsappNumber}?text=السلام عليكم، أستفسر عن العقار: ${title} (كود: ${id})" target="_blank" class="action-btn" style="flex: 2; background: #25D366; color: #fff; border: none; text-align: center; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 5px 15px rgba(37, 211, 102, 0.2);">
            <i class="fab fa-whatsapp" style="margin-left: 10px; font-size: 1.4rem;"></i> تواصل واتساب
        </a>

        <a href="tel:+${whatsappNumber}" class="action-btn" style="flex: 1; background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); text-align: center; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fas fa-phone" style="margin-left: 10px;"></i> اتصال
        </a>

    </div>

    <!-- زر العودة -->
    <div style="text-align: center; margin-top: 3rem;">
        <a href="/properties-filtered.html" class="back-btn" style="color: #888; text-decoration: none; border-bottom: 1px solid #444; padding-bottom: 5px; transition: 0.3s;">
            <i class="fas fa-arrow-right"></i> العودة لقائمة العقارات
        </a>
    </div>
  `;
}

// --- دالة عرض الخطأ ---
function showErrorState(container, message) {
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 5rem 2rem; color: #888;">
            <i class="fas fa-search" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3 style="color: var(--color-error); margin-bottom: 10px;">عذراً</h3>
            <p style="font-size: 1.1rem;">${message}</p>
            <a href="/" class="nav-btn" style="margin-top: 2rem; display: inline-block; border: 1px solid #444; color: #fff;">العودة للرئيسية</a>
        </div>
    `;
}
